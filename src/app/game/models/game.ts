import { GeneratableFruit } from './fruitData';
import { GameMode } from '../../common/constant';
import { Point } from './point';

export type Nullable<T> = T | null;
export type NullableNumber = Nullable<number>;

export interface GameConfig {
  readonly game: GameMode;
  readonly timer: Nullable<number>;
  readonly attempts: Nullable<number>;
}

export interface CutFruit {
  readonly fruit: GeneratableFruit;
  readonly point: Point;
}

export interface Combo {
  readonly id: number;
  readonly amount: number;
  readonly point: Point;
}

export type BestScore = Record<GameMode, number>;
