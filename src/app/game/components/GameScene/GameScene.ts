import { FruitName } from './../../models/fruitData';
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
import { BehaviorSubject } from 'rxjs';
import { AdvancedDynamicTexture, TextBlock } from 'babylonjs-gui';

interface FruitOptions {
  readonly size: number;
  readonly startPositionX: number;
  readonly startPositionY: number;
  readonly mass: number;
  readonly impulseDirection: Vector3;
  readonly magnitutide: number;
  readonly restitution?: number;
}

const GRAVITY = 3;
const MAGNITUDE = 2.8;
const FRUIT_MASS = 2;
const POSITION_Z = 0.5;

export class GameScene {
  private scene: Scene;
  private camera: Camera;
  private light: ShadowLight;
  private shadowGenerator: ShadowGenerator;
  private sideCameraOrientation: 1 | -1;
  private fruits: Record<Fruit, Promise<AbstractMesh>>;
  private scoreTextBlock: TextBlock;

  public score$ = new BehaviorSubject(0);

  constructor(canvas: HTMLCanvasElement, private cameraPosition: number) {
    const engine = new Engine(canvas);
    this.scene = this.createScene(engine);

    if (this.cameraPosition <= 0) {
      throw new Error('Invalid camera position');
    }

    this.camera = this.createCamera(this.scene);
    this.sideCameraOrientation = cameraPosition > 0 ? 1 : -1;

    this.light = new DirectionalLight(
      'light',
      new Vector3(0, -5, -20 * this.sideCameraOrientation),
      this.scene
    );

    this.fruits = {
      apple: this.importFruit('apple'),
      apple_cut1: this.importFruit('apple_cut1'),
      apple_cut2: this.importFruit('apple_cut2')
    };

    this.shadowGenerator = this.createShadowGenerator();
    this.createCuttingBoard('cuttingBoard.jpg', {
      width: Math.abs(cameraPosition) * engine.getAspectRatio(this.camera),
      height: Math.abs(cameraPosition),
    });

    this.scoreTextBlock = this.createScoreBlock();

    engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private incrementScore(count?: number): void {
    const value = this.score$.value + 1;
    this.scoreTextBlock.text = value.toString();
    this.score$.next(value);
  }

  private createScene(
    engine: Engine,
    gravityVector: Vector3 = new Vector3(0, -GRAVITY, 0)
  ): Scene {
    const scene = new Scene(engine);

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
    fruit.dispose();
  }

  private createScoreBlock(): TextBlock {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const scoreTextBlock = new TextBlock();
    scoreTextBlock.color = "white";
    scoreTextBlock.fontSize = 60;
    scoreTextBlock.top = "-45%";
    scoreTextBlock.left = "45%";
    scoreTextBlock.text = '0';
    advancedTexture.addControl(scoreTextBlock); 

    return scoreTextBlock;
  }

  private async cutFruit(fruitName: string, type: FruitName, fruitSize: number, { x, y }: Point): Promise<void> {
    this.incrementScore();

    const fruitSliceOptions: FruitOptions = {
      size: fruitSize,
      startPositionX: x,
      startPositionY: y,
      mass: FRUIT_MASS / 2,
      restitution: 0,
      impulseDirection: Vector3.Zero(),
      magnitutide: MAGNITUDE
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

    this.scene.onBeforeRenderObservable.add(() => {
      slice1.rotate(Axis.X, 0.05);
      slice2.rotate(Axis.X, 0.05);
    });
  }

  public async pushFruit(
    type: FruitName,
    id: Id,
    startPosition: number,
    impulseDirection: {
      x: number;
      y: number;
    }
  ): Promise<void> {
    const fruitSize = 0.5 / 4;
    const fruitName = `fruit${id}`;
    const startPositionY = -(Math.abs(this.cameraPosition) / 2);
    const fruit = await this.createFruit(fruitName, type, {
      size: fruitSize,
      startPositionX: startPosition,
      startPositionY,
      mass: FRUIT_MASS,
      restitution: 0,
      impulseDirection: new Vector3(impulseDirection.x, impulseDirection.y, 0),
      magnitutide: MAGNITUDE
    });

    this.scene.onBeforeRenderObservable.add(() => {
      fruit.rotate(Axis.Z, 0.05);
      if (fruit.position.y < startPositionY) {
        this.removeFruit(fruit);
      }
    });

    fruit.actionManager = new ActionManager(this.scene);
    fruit.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOverTrigger,
        async (event: ActionEvent) => {
          const slicePosition: Point = {
            x: event.source._position.x,
            y: event.source._position.y,
          }
          this.removeFruit(fruit);
          await this.cutFruit(fruitName, type, fruitSize, slicePosition);
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
    const box = parent.clone(name, null)!;

    box.position = new Vector3(
      startPositionX,
      startPositionY,
      POSITION_Z * this.sideCameraOrientation
    );

    box.scaling = new Vector3(size, size, size);
    box.name = name;
    box.physicsImpostor = new PhysicsImpostor(
      box,
      PhysicsImpostor.NoImpostor,
      { mass, restitution },
      this.scene
    );

    this.shadowGenerator.addShadowCaster(box);

    box.physicsImpostor.applyImpulse(
      impulseDirection.scale(MAGNITUDE),
      box.getAbsolutePosition()
    );

    return box;
  }
}
