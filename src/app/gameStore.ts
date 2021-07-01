
import { action, makeAutoObservable } from 'mobx';
import { FruitNinja } from './game/models/fruitData';
import { GameLogic } from './game/services/gameLogic';

export class GameStore {
  private gameLogic: GameLogic;

  public nextFruits: FruitNinja[] = [];
  public score = 0;
  public lifes = 0;

  constructor(private fruitPositionGeneratorInterval: number) {
    makeAutoObservable(this, {
      generateNewFruits: action.bound,
      updateScore: action.bound
    });
    this.gameLogic = new GameLogic(fruitPositionGeneratorInterval);
  }

  generateNewFruits(): void {
    const startPosition = this.gameLogic.generateFruitStartPosition();
    const endPosition = this.gameLogic.generateFruitEndPosition(startPosition);
    this.nextFruits = [
      {
        id: Math.random(),
        startPositionX: startPosition,
        flyDirection: {
          x: endPosition,
          y: this.fruitPositionGeneratorInterval,
        },
        type: 'apple',
      },
    ];
  }

  updateScore(value: number): void {
    this.score = value;
  }
}
