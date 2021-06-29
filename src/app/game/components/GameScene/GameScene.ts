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
  IAnimationKey,
  AbstractMesh,
  Animation,
  SceneLoader,
} from 'babylonjs';
import { Id } from '../../models/baseEntity';
import { Fruit } from '../../models/fruitData';

interface FruitOptions {
  readonly size: number;
  readonly startPositionX: number;
  readonly startPositionY: number;
  readonly mass: number;
  readonly impulseDirection: Vector3;
  readonly impulseMagnitude: number;
  readonly contactLocalPoint: Vector3;
  readonly impostor: number;
  readonly restitution?: number;
}

export class GameScene {
  private scene: Scene;
  private camera: Camera;
  private light: ShadowLight;
  private shadowGenerator: ShadowGenerator;
  private sideCameraOrientation: 1 | -1;
  private fruits: Record<Fruit, Promise<AbstractMesh>>;

  private createScene(
    engine: Engine,
    gravityVector: Vector3 = new Vector3(0, -3, 0)
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
    camera.attachControl(scene);

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

  public async pushFruit(
    type: Fruit,
    id: Id,
    startPosition: number,
    impulseDirection: {
      x: number;
      y: number;
    }
  ): Promise<void> {
    const fruitSize = 0.5 / 2;
    const fruitName = `fruit${id}`;
    const fruitMass = 2;
    const fruit = await this.createFruit(fruitName, type, {
      size: fruitSize,
      startPositionX: startPosition,
      startPositionY: -(Math.abs(this.cameraPosition) / 2),
      mass: fruitMass,
      impulseMagnitude: 2.8,
      impostor: PhysicsImpostor.NoImpostor,
      contactLocalPoint: new Vector3(0, 0, 0.01),
      impulseDirection: new Vector3(impulseDirection.x, impulseDirection.y, 0),
    });

    fruit.actionManager = new ActionManager(this.scene);
    fruit.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOverTrigger,
        async (evt: ActionEvent) => {
          fruit.setEnabled(false);

          const fruitSliceOptions: FruitOptions = {
            size: fruitSize / 2,
            startPositionX: evt.source._position.x,
            startPositionY: evt.source._position.y,
            mass: fruitMass / 2,
            restitution: 1,
            impulseMagnitude: 2.8,
            impostor: PhysicsImpostor.NoImpostor,
            impulseDirection: Vector3.Zero(),
            contactLocalPoint: new Vector3(0, 0, 0),
          };

          const r = await this.createFruit(`${fruitName}_1`, type, {
            ...fruitSliceOptions,
            impulseDirection: new Vector3(1, 0, 0),
          });

          const t = await this.createFruit(`${fruitName}_2`, type, {
            ...fruitSliceOptions,
            impulseDirection: new Vector3(-1, 0, 0),
          });
        }
      )
    );
  }

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
      APPLE: this.importFruit('APPLE'),
      BOMB: this.importFruit('APPLE'),
      PINEAPPLE: this.importFruit('APPLE'),
    };

    this.shadowGenerator = this.createShadowGenerator();
    this.createCuttingBoard('cuttingBoard.jpg', {
      width: Math.abs(cameraPosition) * engine.getAspectRatio(this.camera),
      height: Math.abs(cameraPosition),
    });

    engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private createAnimation(
    name: string,
    targetPosition: string,
    frameTime: number,
    keyFrames: IAnimationKey[]
  ): Animation {
    const animation = new Animation(
      name,
      targetPosition,
      frameTime,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    animation.setKeys(keyFrames);
    return animation;
  }

  // private createBox(name: string, size: number, x: number, y: number) {
  //   const box = MeshBuilder.CreateBox(name, {
  //     width: size,
  //     height: size,
  //     depth: size,
  //   });
  //   box.position.z = -0.5;
  //   box.position.x = x;
  //   box.position.y = y;

  //   this.shadowGenerator.addShadowCaster(box);
  //   return box;
  // }

  private async importFruit(type: Fruit) {
    const { meshes } = await SceneLoader.ImportMeshAsync(
      null,
      `fruits/`,
      `${type.toLowerCase()}.gltf`,
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
      impulseMagnitude,
      contactLocalPoint,
      impostor,
    } = options;
    const parent = await this.fruits[type];
    const box = parent.clone(name, null)!;

    box.position = new Vector3(
      startPositionX,
      startPositionY,
      0.5 * this.sideCameraOrientation
    );

    box.scaling = new Vector3(size, size, size);
    box.name = name;
    box.physicsImpostor = new PhysicsImpostor(
      box,
      impostor,
      { mass, restitution },
      this.scene
    );

    this.shadowGenerator.addShadowCaster(box);

    box.physicsImpostor.applyImpulse(
      impulseDirection.scale(impulseMagnitude),
      box.getAbsolutePosition().add(contactLocalPoint)
    );
    return box;
  }
}
