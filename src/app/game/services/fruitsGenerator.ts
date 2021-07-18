import { Fruits, FruitSpeed } from '../../common/constant';
import {
  getRandomValue,
  getRandomValueInclusive,
} from '../../common/services/rng';
import {
  FruitData,
  FruitFlyData,
  FruitSequence,
  GeneratableFruit,
} from '../models/fruitData';
import { generateId } from './generateId';

export type GenerateFruits = (iteraction: number) => FruitSequence;

export interface SpecificGeneratorMode {
  generateFruitsSequence: GenerateFruits;
}

export abstract class FruitsGenerator implements SpecificGeneratorMode {
  constructor(protected fruitPositionInterval: number) {}

  public abstract generateFruitsSequence: GenerateFruits;

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

  private generateFruitType(): GeneratableFruit {
    const fruitAmount = Object.keys(Fruits).length / 2;
    const fruitIndex = getRandomValueInclusive(0, fruitAmount - 1);
    return Fruits[fruitIndex] as GeneratableFruit;
  }

  protected generateFruit(fruitType?: GeneratableFruit): FruitFlyData {
    const startPositionX = this.generateFruitStartPosition();
    const endPositionX = this.generateFruitEndPosition(startPositionX);
    const yPosition =
      (this.fruitPositionInterval - 0.5, this.fruitPositionInterval);
    const type = fruitType || this.generateFruitType();
    return {
      id: generateId(),
      type,
      startPositionX,
      flyDirection: {
        x: endPositionX,
        y: yPosition,
      },
    };
  }

  protected generateFruits(count: number, isBomb?: boolean): FruitFlyData[] {
    const result: FruitFlyData[] = [];
    for (let i = 0; i < count; i++) {
      const fruitType: GeneratableFruit | undefined = isBomb
        ? 'bomb'
        : undefined;
      const fruit = this.generateFruit(fruitType);
      result.push(fruit);
    }
    return result;
  }

  protected getFruitsWithSpeed(
    fruits: FruitFlyData[],
    speed: FruitSpeed
  ): FruitData[] {
    return fruits.map((fruit) => ({ ...fruit, speed }));
  }
}
