import { action, makeAutoObservable } from 'mobx';
import { Game } from './common/constant';
import { FruitSequence, GeneratableFruit } from './game/models/fruitData';
import { createGeneratorFruitsByMode } from './game/services/creatorFruitsGenerator';
import {
  FruitsGenerator,
} from './game/services/fruitsGenerator';

export class GameStore {
  private currentIteraction = 0;
  private generatorFruits?: FruitsGenerator;

  public delayBetweenFruits = 1000;
  public mode: Game = Game.Classic;
  public nextFruits: FruitSequence = {
    fruits: [],
    delayBetweenFruits: this.delayBetweenFruits,
  };
  public score = 0;
  public onPause = false;
  public gameTime = 0;

  get isActiveGame(): boolean {
    return Game.Classic ? this.attemps !== 0 : this.gameTime === 0;
  }

  constructor(private fruitPositionGeneratorInterval: number, public attemps: number) {
    makeAutoObservable(this, {
      generateNewFruits: action.bound,
      updateScore: action.bound,
      decrementAttemps: action.bound,
      pause: action.bound,
      setGameMode: action.bound
    });
    this.generateNewFruits(this.currentIteraction);
  }

  private updateBestScore(): void {
    const score = localStorage.getItem('bestScore');
    const bestScore = score ? +JSON.parse(score) : 0;
    if (this.score < bestScore) {
      localStorage.setItem('bestScore', JSON.stringify(this.score));
    }
  }

  public generateNewFruits(iteration = this.currentIteraction): void {
    if (!this.onPause && this.generatorFruits) {
      this.nextFruits = this.generatorFruits.generateFruitsSequence(iteration);
      this.currentIteraction++;
    }
  }

  public updateScore(fruits: GeneratableFruit[]): void {
    if (fruits.some((fruit) => fruit === 'bomb')) {
      this.attemps = 0;
    } else {
      this.score += fruits.length;
    }
  }

  public decrementAttemps(missedFruit: GeneratableFruit): void {
    if (missedFruit !== 'bomb') {
      this.attemps--;
    }
    if (this.attemps === 0) {
      this.updateBestScore();
    }
  }

  public pause(): void {
    this.onPause = !this.onPause;
  }

  public setGameMode(mode: Game): void {
    this.mode = mode;
    this.generatorFruits = createGeneratorFruitsByMode(mode, this.fruitPositionGeneratorInterval, this.delayBetweenFruits);
    switch (mode) {
      case Game.Dzen: {
        this.gameTime = 60000;
        break;
      }
      case Game.Classic: {
        this.gameTime = 0;
        break;
      }
    }
  }

  public updateGameTime(): void {
    if (this.mode === Game.Dzen) {
      this.gameTime -= 1000;
      if (this.gameTime === 0) {
        this.updateBestScore();
      }
    }
  }
}
