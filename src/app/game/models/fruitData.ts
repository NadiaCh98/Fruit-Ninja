import { Fruits, FruitSpeed } from '../../common/constant';
import { BaseEntity } from './baseEntity';
import { Point } from './point';

export type Bomb = 'bomb';
export type UniformFruit<T extends string> = Lowercase<T>;
export type FruitName = UniformFruit<keyof typeof Fruits>;

export type FruitSile = `${FruitName}_cut`;
export type FruitSlices =  `${FruitSile}1` | `${FruitSile}2`;
export type GeneratableFruit = FruitName | UniformFruit<Bomb>;
export type Fruit = UniformFruit<GeneratableFruit | FruitSlices | Bomb>;

export interface FruitFlyData extends BaseEntity {
    readonly type: GeneratableFruit;
    readonly startPositionX: number;
    readonly flyDirection: Point;
}

export interface FruitData extends FruitFlyData {
    readonly speed: FruitSpeed;
}

export interface FruitSequence {
    readonly delayBetweenFruits: number;
    readonly fruits: FruitData[];
}