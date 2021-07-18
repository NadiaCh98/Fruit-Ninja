import {
  getRandomValue,
} from './../../../common/services/rng';
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
  SceneLoader
} from 'babylonjs';
import { Id } from '../../models/baseEntity';
import { Fruit } from '../../models/fruitData';
import { Point } from '../../models/point';
import { Subject } from 'rxjs';
import { PBRMaterial } from 'babylonjs/Materials/PBR/pbrMaterial';
import { CutFruit } from '../../models/game';
import { FRUITS_PATH } from '../../../common/constant';

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

  public cutFruits$ = new Subject<CutFruit>();
  public missedFruit$ = new Subject<GeneratableFruit>();

  constructor(canvas: HTMLCanvasElement, private cameraPosition: number) {
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
      lemon: this.importFruit('lemon'),
      lemon_cut1: this.importFruit('lemon_cut2'),
      lemon_cut2: this.importFruit('lemon_cut1'),
      banana: this.importFruit('banana'),
      banana_cut1: this.importFruit('banana_cut1'),
      banana_cut2: this.importFruit('banana_cut2'),
      pear: this.importFruit('pear'),
      pear_cut1: this.importFruit('pear_cut2'),
      pear_cut2: this.importFruit('pear_cut1'),
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

  private rotateMesh(mesh: AbstractMesh, axis: Vector3): void {
    mesh.rotate(axis, getRandomValue(0.05, 0.07));
  }

  private generateRotationDirection(): Vector3 {
    const position = () => getRandomValue(-10, 10);
    return new Vector3(position(), position(), position());
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
      impulseDirection: new Vector3(1, getRandomValue(0.5, 1), 0),
    });
    const slice1Direction = this.generateRotationDirection();

    const slice2 = await this.createFruit(`${fruitName}_2`, `${type}_cut1`, {
      ...fruitSliceOptions,
      impulseDirection: new Vector3(-1, getRandomValue(-0.5, -1), 0),
    });
    const slice2Direction = this.generateRotationDirection();

    const removeFruitSlice = (slice: AbstractMesh) => {
      if (!slice.isDisposed() && slice.position.y < this.startPositionY) {
        this.removeFruit(slice);
      }
    };

    this.scene.onBeforeRenderObservable.add(() => {
      this.rotateMesh(slice1, slice1Direction);
      this.rotateMesh(slice2, slice2Direction);
      removeFruitSlice(slice1);
      removeFruitSlice(slice2);
    });
  }

  public resize(): void {
    this.engine.resize();
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
      this.onPause = false;
    }
  }

  public clear(): void {
    this.visibleFruits.forEach((mesh) => this.removeFruit(mesh));
  }

  public clearAndReplay(): void {
    this.clear();
    this.replay();
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
    const fruitSize = type === 'apple' ? 0.5 / 5 : 0.8; // change apple mesh
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

    const fruitDirection = this.generateRotationDirection();

    this.scene.onBeforeRenderObservable.add(() => {
      this.rotateMesh(fruit, fruitDirection);
      if (!fruit.isDisposed() && fruit.position.y < this.startPositionY) {
        this.removeFruit(fruit);
        this.missedFruit$.next(type);
      }
    });

    fruit.actionManager = new ActionManager(this.scene);
    fruit.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOverTrigger,
        async ({ pointerX, pointerY, source }: ActionEvent) => {
          this.removeFruit(fruit);
          this.cutFruits$.next({
            fruit: type,
            point: { x: pointerX, y: pointerY },
          });

          if (type !== 'bomb') {
            const slicePosition: Point = {
              x: source._position.x,
              y: source._position.y,
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
      `${FRUITS_PATH}`,
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
