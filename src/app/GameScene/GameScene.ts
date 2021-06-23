import {
  ArcRotateCamera,
  Camera,
  DirectionalLight,
  Engine,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  Vector3,
  Animation,
  IAnimationKey,
  ActionManager,
  ExecuteCodeAction,
  ActionEvent,
  CannonJSPlugin,
  PhysicsImpostor,
  ShadowLight,
  Mesh,
  ISize,
} from '@babylonjs/core';

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
    camera.position = new Vector3(0, 0, -5);
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

  public pushFruit(
    id: number,
    startPosition: number,
    impulseDirection: Vector3
  ): void {
    const fruitSize = 0.5;
    const fruitName = `fruit${id}`;
    const fruitMass = 2;
    const fruit = this.createFruit(fruitName, {
      size: fruitSize,
      startPositionX: startPosition,
      startPositionY: -2.5,
      mass: fruitMass,
      impulseMagnitude: 2.8,
      impostor: PhysicsImpostor.NoImpostor,
      contactLocalPoint: new Vector3(0, 0, 0.01),
      impulseDirection,
    });

    fruit.actionManager = new ActionManager(this.scene);
    fruit.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOverTrigger,
        (evt: ActionEvent) => {
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

          const fruitSlice1 = this.createFruit(`${fruitName}_1`, {
            ...fruitSliceOptions,
            impulseDirection: new Vector3(1, 0, 0),
          });

          const fruitSlice2 = this.createFruit(`${fruitName}_2`, {
            ...fruitSliceOptions,
            impulseDirection: new Vector3(-1, 0, 0),
          });

          this.shadowGenerator.addShadowCaster(fruitSlice1);
          this.shadowGenerator.addShadowCaster(fruitSlice2);

          // box1.physicsImpostor = new PhysicsImpostor(
          //   box1,
          //   PhysicsImpostor.NoImpostor,
          //   { mass: 1, restitution: 0.9 },
          //   this.scene
          // );

          // box2.physicsImpostor = new PhysicsImpostor(
          //   box2,
          //   PhysicsImpostor.NoImpostor,
          //   { mass: 1, restitution: 0.9 },
          //   this.scene
          // );

          // const impulseDirection1 = new Vector3(1, 0, 0);
          // const impulseDirection2 = new Vector3(-1, 0, 0);
          // const impulseMagnitude = 2.8;
          // const contactLocalPoint = new Vector3(0, 0, 0);

          // box1.physicsImpostor.applyImpulse(
          //   impulseDirection1.scale(impulseMagnitude),
          //   box1.getAbsolutePosition().add(contactLocalPoint)
          // );
          // box2.physicsImpostor.applyImpulse(
          //   impulseDirection2.scale(impulseMagnitude),
          //   box2.getAbsolutePosition().add(contactLocalPoint)
          // );
        }
      )
    );
  }

  constructor(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas);
    this.scene = this.createScene(engine);
    this.camera = this.createCamera(this.scene);

    this.light = new DirectionalLight(
      'light',
      new Vector3(0, -5, 20),
      this.scene
    );

    this.shadowGenerator = this.createShadowGenerator();
    this.createCuttingBoard('cuttingBoard.jpg', {
      width: 5 * engine.getAspectRatio(this.camera),
      height: 3 * engine.getAspectRatio(this.camera),
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

  private createFruit(name: string, options: FruitOptions) {
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
    const box = MeshBuilder.CreateBox(name, {
      width: size,
      height: size,
      depth: size,
    });
    box.position.z = -0.5;
    box.position.x = startPositionX;
    box.position.y = startPositionY;

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
