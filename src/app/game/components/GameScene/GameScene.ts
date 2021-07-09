import { FruitName, GeneratableFruit } from './../../models/fruitData';
import {
  Vector3,
  Scene,
  Camera,
  ShadowLight,
  ShadowGenerator,
  Engine,
  CannonJSPlugin,
  ArcRotateCamera,
  ISize,
  Mesh,
  StandardMaterial,
  Texture,
  MeshBuilder,
  PhysicsImpostor,
  ActionManager,
  ExecuteCodeAction,
  ActionEvent,
  DirectionalLight,
  AbstractMesh,
  SceneLoader,
  Axis,
} from 'babylonjs';
import { Id } from '../../models/baseEntity';
import { Fruit } from '../../models/fruitData';
import { Point } from '../../models/point';
import { Subject } from 'rxjs';
import { PBRMaterial } from 'babylonjs/Materials/PBR/pbrMaterial';
import { StartMenuItem } from '../../models/startMenu';

interface FruitOptions {
  readonly size: number;
  readonly startPositionX: number;
  readonly startPositionY: number;
  readonly mass: number;
  readonly impulseDirection: Vector3;
  readonly magnitutide: number;
  readonly restitution?: number;
}

const GRAVITY = 9.8;
const MAGNITUDE = 0.5;
const FRUIT_MASS = 0.2;
const POSITION_Z = 0.5;
const MESH_INTENSITY = 3;

export class GameScene {
  private scene: Scene;
  private camera: Camera;
  private light: ShadowLight;
  private shadowGenerator: ShadowGenerator;
  private sideCameraOrientation: 1 | -1;
  private fruits: Record<Fruit, Promise<AbstractMesh>>;
  private engine: Engine;
  private onPause = false;
  private startPositionY: number;
  private visibleFruits: AbstractMesh[] = [];

  public cutFruits$ = new Subject<GeneratableFruit>();
  public missedFruit$ = new Subject<GeneratableFruit>();

  constructor(
    canvas: HTMLCanvasElement,
    startMenu: StartMenuItem[],
    private cameraPosition: number
  ) {
    this.engine = new Engine(canvas);
    this.scene = this.createScene();

    if (this.cameraPosition <= 0) {
      throw new Error('Invalid camera position');
    }

    this.camera = this.createCamera(this.scene);
    this.sideCameraOrientation = cameraPosition > 0 ? 1 : -1;
    this.startPositionY = -(Math.abs(this.cameraPosition) / 2);

    this.light = new DirectionalLight(
      'light',
      new Vector3(0, -5, -20 * this.sideCameraOrientation),
      this.scene
    );

    this.fruits = {
      apple: this.importFruit('apple'),
      apple_cut1: this.importFruit('apple_cut1'),
      apple_cut2: this.importFruit('apple_cut2'),
      bomb: this.importFruit('bomb'),
    };

    this.shadowGenerator = this.createShadowGenerator();

    this.createCuttingBoard('cuttingBoard.jpg', {
      width: Math.abs(cameraPosition) * this.engine.getAspectRatio(this.camera),
      height: Math.abs(cameraPosition),
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private createScene(
    gravityVector: Vector3 = new Vector3(0, -GRAVITY, 0)
  ): Scene {
    const scene = new Scene(this.engine);

    const physicsPlugin = new CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    return scene;
  }

  private createCamera(scene: Scene): Camera {
    const camera = new ArcRotateCamera(
      'camera',
      0,
      0,
      4,
      Vector3.Zero(),
      scene
    );
    camera.inputs.clear();
    camera.position = new Vector3(0, 0, this.cameraPosition);
    camera.attachControl(scene, false);

    return camera;
  }

  private createCuttingBoard(
    pathBackgroundImage: string,
    { width, height }: ISize
  ): Mesh {
    const boardMaterial = new StandardMaterial('boardMaterial', this.scene);
    const texture = new Texture(pathBackgroundImage, this.scene);
    boardMaterial.diffuseTexture = texture;
    boardMaterial.emissiveTexture = texture;
    boardMaterial.specularTexture = texture;

    const board = MeshBuilder.CreatePlane(
      'plane',
      {
        width,
        height,
        sideOrientation: Mesh.DOUBLESIDE,
      },
      this.scene
    );

    board.receiveShadows = true;
    board.material = boardMaterial;

    return board;
  }

  private createShadowGenerator(): ShadowGenerator {
    const shadowGenerator = new ShadowGenerator(1024, this.light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 64;

    return shadowGenerator;
  }

  private removeFruit(fruit: AbstractMesh): void {
    this.scene.removeMesh(fruit);
    this.shadowGenerator.removeShadowCaster(fruit);
    this.visibleFruits.filter(({ name }) => fruit.name === name);
    fruit.dispose();
  }

  private createStartMenu(startMenu: StartMenuItem[]): void {
    
  }

  private async cutFruit(
    fruitName: string,
    type: FruitName,
    fruitSize: number,
    { x, y }: Point
  ): Promise<void> {
    const fruitSliceOptions: FruitOptions = {
      size: fruitSize,
      startPositionX: x,
      startPositionY: y,
      mass: FRUIT_MASS / 2,
      restitution: 0,
      impulseDirection: Vector3.Zero(),
      magnitutide: MAGNITUDE,
    };

    const slice1 = await this.createFruit(`${fruitName}_1`, `${type}_cut1`, {
      ...fruitSliceOptions,
      impulseDirection: new Vector3(1, 1, 0),
    });
    slice1.rotation = new Vector3(0, Math.PI, 0);

    const slice2 = await this.createFruit(`${fruitName}_2`, `${type}_cut1`, {
      ...fruitSliceOptions,
      impulseDirection: new Vector3(-1, -1, 0),
    });
    slice2.rotation = new Vector3(0, 0, 0);

    const removeFruitSlice = (slice: AbstractMesh) => {
      if (!slice.isDisposed() && slice.position.y < this.startPositionY) {
        this.removeFruit(slice);
      }
    };

    this.scene.onBeforeRenderObservable.add(() => {
      slice1.rotate(Axis.X, 0.05);
      slice2.rotate(Axis.X, 0.05);
      removeFruitSlice(slice1);
      removeFruitSlice(slice2);
    });
  }

  public pause(): void {
    this.engine.stopRenderLoop();
    this.onPause = true;
  }

  public replay(): void {
    if (this.onPause) {
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });
      this.onPause = true;
    }
  }

  public clear(): void {
    this.visibleFruits.forEach((mesh) => this.removeFruit(mesh));
  }

  public async pushFruit(
    type: GeneratableFruit,
    id: Id,
    startPosition: number,
    impulseDirection: {
      x: number;
      y: number;
    }
  ): Promise<void> {
    const fruitSize = type === 'bomb' ? 0.5 : 0.5 / 5;
    const fruitName = `fruit${id}`;

    const fruit = await this.createFruit(fruitName, type, {
      size: fruitSize,
      startPositionX: startPosition,
      startPositionY: this.startPositionY,
      mass: FRUIT_MASS,
      restitution: 0,
      impulseDirection: new Vector3(impulseDirection.x, impulseDirection.y, 0),
      magnitutide: MAGNITUDE,
    });

    this.scene.onBeforeRenderObservable.add(() => {
      fruit.rotate(Axis.Z, 0.05);
      if (!fruit.isDisposed() && fruit.position.y < this.startPositionY) {
        this.removeFruit(fruit);
        this.missedFruit$.next(type);
      }
    });

    fruit.actionManager = new ActionManager(this.scene);
    fruit.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOverTrigger,
        async (event: ActionEvent) => {
          this.removeFruit(fruit);
          this.cutFruits$.next(type);

          if (type !== 'bomb') {
            const slicePosition: Point = {
              x: event.source._position.x,
              y: event.source._position.y,
            };
            await this.cutFruit(fruitName, type, fruitSize, slicePosition);
          }
        }
      )
    );
  }

  private async importFruit(type: Fruit) {
    const { meshes } = await SceneLoader.ImportMeshAsync(
      null,
      `fruits/`,
      `${type}.babylon`,
      this.scene
    );
    if (!meshes || !meshes[0]) {
      throw new Error('Not import');
    }
    const mesh = meshes[0];
    mesh.scaling = Vector3.Zero();
    mesh.isPickable = true;
    mesh.name = type;

    const material = mesh.material as PBRMaterial;
    const meshTextures = material.getActiveTextures();
    meshTextures.forEach((texture) => (texture.level = MESH_INTENSITY));

    return mesh;
  }

  private async createFruit(
    name: string,
    type: Fruit,
    options: FruitOptions
  ): Promise<AbstractMesh> {
    const {
      size,
      startPositionX,
      startPositionY,
      mass,
      restitution,
      impulseDirection,
    } = options;

    const parent = await this.fruits[type];
    const fruit = parent.clone(name, null)!;

    fruit.position = new Vector3(
      startPositionX,
      startPositionY,
      POSITION_Z * this.sideCameraOrientation
    );

    fruit.scaling = new Vector3(size, size, size);
    fruit.name = name;
    fruit.id = name;
    fruit.physicsImpostor = new PhysicsImpostor(
      fruit,
      PhysicsImpostor.NoImpostor,
      { mass, restitution },
      this.scene
    );

    this.shadowGenerator.addShadowCaster(fruit);
    this.visibleFruits.push(fruit);

    fruit.physicsImpostor.applyImpulse(
      impulseDirection.scale(MAGNITUDE),
      fruit.getAbsolutePosition()
    );

    return fruit;
  }
}
