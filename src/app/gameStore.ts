import { getRandomValue } from './common/services/rng';
import { action, makeAutoObservable } from 'mobx';
import { FruitNinja } from './game/models/fruitData';

export class GameStore {
  public nextFruits: FruitNinja[] = [];
  public count = 0;
  public lifes = 0;

  constructor(private fruitPositionGeneratorInterval: number) {
    makeAutoObservable(this, {
      generateNewFruits: action.bound,
    });
  }

  generateNewFruits(): void {
    const startPosition = getRandomValue(
      -this.fruitPositionGeneratorInterval,
      this.fruitPositionGeneratorInterval
    );
    
    const endPositionX =
      startPosition >= 0
        ? getRandomValue(
            -this.fruitPositionGeneratorInterval + 1,
            startPosition - 0.5
          )
        : getRandomValue(
            startPosition + 0.5,
            this.fruitPositionGeneratorInterval - 1
          );

    this.nextFruits = [
      {
        id: Math.random(),
        startPositionX: startPosition,
        flyDirection: {
          x: endPositionX,
          y: this.fruitPositionGeneratorInterval,
        },
        type: 'APPLE',
      },
    ];
  }
}
