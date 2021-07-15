import { action, makeAutoObservable } from 'mobx';
import { Game, GAME_CONFIG } from './common/constant';
import { FruitSequence, GeneratableFruit } from './game/models/fruitData';
import { BestScore, GameConfig, NullableNumber } from './game/models/game';
import { createGeneratorFruitsByMode } from './game/services/creatorFruitsGenerator';
import { FruitsGenerator } from './game/services/fruitsGenerator';

const INIT_FRUITS: FruitSequence = {
  fruits: [],
  delayBetweenFruits: 0,
};

export class GameStore {
  private currentIteraction = 0;
  private generatorFruits?: FruitsGenerator;

  public gameMode: GameConfig | undefined;
  public nextFruits: FruitSequence = {...INIT_FRUITS};
  public score = 0;
  public onPause = false;
  public gameTime: NullableNumber = null;
  public attemps: NullableNumber = null;
  public gameId = 0;

  get isActiveGame(): boolean {
    return this.gameMode?.game === Game.Classic
      ? this.attemps !== 0
      : this.gameTime !== 0;
  }

  get bestScore(): BestScore {
    const score = localStorage.getItem('bestScore');
    const bestScore: BestScore = score
      ? JSON.parse(score)
      : {
          Classic: 0,
          Dzen: 0,
        };
    return bestScore;
  }

  get bestScoreByGameMode(): number {
    return this.gameMode?.game ? this.bestScore[this.gameMode.game] : 0;
  }

  constructor(private fruitPositionGeneratorInterval: number) {
    makeAutoObservable(this, {
      generateNewFruits: action.bound,
      updateScore: action.bound,
      decrementAttemps: action.bound,
      pause: action.bound,
      updateGameTime: action.bound,
      updateGameMode: action.bound,
      replay: action.bound,
      exitFromCurrentMode: action.bound
    });
    this.generateNewFruits(this.currentIteraction);
  }

  private updateBestScore(): void {
    if (this.gameMode && this.score > this.bestScore[this.gameMode.game]) {
      const updatedBestScore = {...this.bestScore, [this.gameMode.game]: this.score};
      localStorage.setItem('bestScore', JSON.stringify(updatedBestScore));
    }
  }

  private initFruitsGenerator(mode: Game): void {
    this.generatorFruits = createGeneratorFruitsByMode(
      mode,
      this.fruitPositionGeneratorInterval
    );
  }

  private setGameMode(mode: Game): void {
    this.gameId++;
    this.currentIteraction = 0;
    this.score = 0;
    this.onPause = false;
    this.nextFruits ={...INIT_FRUITS};
    this.gameMode = GAME_CONFIG.find((config) => config.game === mode)!;
    this.gameTime = this.gameMode.timer;
    this.attemps = this.gameMode.attempts;
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
      const amount = fruits.length;
      this.score += amount >= 3 ? amount * 2 : amount;
    }
    this.updateBestScore();
  }

  public decrementAttemps(missedFruit: GeneratableFruit): void {
    if (this.gameMode?.game === Game.Dzen) {
      return;
    }
    if (missedFruit !== 'bomb') {
      this.attemps && this.attemps--;
    }
  }

  public pause(): void {
    this.onPause = !this.onPause;
  }

  public updateGameMode(mode: Game): void {
    this.setGameMode(mode);
    this.initFruitsGenerator(mode);
  }

  public updateGameTime(): void {
    if (this.gameMode?.game === Game.Dzen && !!this.gameTime) {
      this.gameTime -= 1000;
    }
  }

  public replay(): void {
    this.setGameMode(this.gameMode!.game);
  }

  public exitFromCurrentMode(): void {
    this.gameId = 0;
    this.onPause = false;
    this.gameMode = undefined;
    this.currentIteraction = 0;
  }
}
