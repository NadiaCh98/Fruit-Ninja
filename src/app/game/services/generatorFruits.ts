import { Fruits } from '../../common/constant';
import {
  getRandomValue,
  getRandomValueInclusive,
} from '../../common/services/rng';
import { FruitData, GeneratableFruit } from '../models/fruitData';

export class GeneratorFruits {
  constructor(private fruitPositionInterval: number) {}

  private generateFruitStartPosition(): number {
    return getRandomValue(
      -this.fruitPositionInterval,
      this.fruitPositionInterval
    );
  }

  private generateFruitEndPosition(startPosition: number): number {
    const limit = startPosition <= 0 ? 1 : -1;
    const endPosition = getRandomValue(0, limit);
    return endPosition;
  }

  private generateFruitType(withBomb: boolean): GeneratableFruit {
    const fruitAmount = Object.keys(Fruits).length / 2;
    const randomFruitIndex = getRandomValueInclusive(0, fruitAmount);
    if (withBomb && randomFruitIndex === fruitAmount) {
      return 'bomb';
    }
    const fruitIndex =
      !withBomb && randomFruitIndex === fruitAmount
        ? randomFruitIndex - 1
        : randomFruitIndex;
    return Fruits[fruitIndex] as GeneratableFruit;
  }

  private generateId(): number {
    return Math.random();
  }

  private generateFruit(
    withBomb: boolean,
    fruitType?: GeneratableFruit
  ): FruitData {
    const startPositionX = this.generateFruitStartPosition();
    const endPositionX = this.generateFruitEndPosition(startPositionX);
    const yPosition =
      (this.fruitPositionInterval - 0.5, this.fruitPositionInterval);
    const type = fruitType || this.generateFruitType(withBomb);
    return {
      id: this.generateId(),
      type,
      startPositionX,
      flyDirection: {
        x: endPositionX,
        y: yPosition,
      },
    };
  }

  private generateFruits(count: number, withBomb: boolean): FruitData[] {
    const result: FruitData[] = [];
    for (let i = 0; i < count; i++) {
      const fruit = this.generateFruit(withBomb);
      result.push(fruit);
    }
    return result;
  }

  public generateFruitsByScore(score: number): FruitData[] {
    const bomb = this.generateFruit(false, 'bomb');
    if (score <= 1) {
      return this.generateFruits(1, false);
    } else if (score >= 2 && score <= 6) {
      return this.generateFruits(2, false);
    } else if (score === 5) {
      return [bomb];
    } else if (score === 7 || score === 8) {
      return [this.generateFruit(false), bomb];
    }

    const amount = getRandomValueInclusive(3, 10);
    return this.generateFruits(amount, true);
  }
}
