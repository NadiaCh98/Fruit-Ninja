import { action, makeAutoObservable } from 'mobx';
import { FruitData } from './game/models/fruitData';
import { GeneratorFruits } from './game/services/generatorFruits';

export class GameStore {
  private generatorFruits: GeneratorFruits;

  public nextFruits: FruitData[] = [];
  public score = 0;

  constructor(
    fruitPositionGeneratorInterval: number,
    public attemps: number
  ) {
    makeAutoObservable(this, {
      generateNewFruits: action.bound,
      updateScore: action.bound,
      decrementAttemps: action.bound,
    });
    this.generatorFruits = new GeneratorFruits(fruitPositionGeneratorInterval);
  }

  generateNewFruits(): void {
    console.log(this.generatorFruits.generateFruitsByScore(this.score));
    this.nextFruits = this.generatorFruits.generateFruitsByScore(this.score);
  }

  updateScore(value: number): void {
    this.score += value;
  }

  decrementAttemps(): void {
    this.attemps--;
  }
}
