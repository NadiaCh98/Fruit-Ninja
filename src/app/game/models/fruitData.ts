import { BaseEntity } from './baseEntity';

export type FruitName = 'apple';

export type FruitSile = `${FruitName}_cut`;
export type FruitSlices =  `${FruitSile}1` | `${FruitSile}2`;
export type Fruit = FruitName | FruitSlices;

export interface FruitNinja extends BaseEntity {
    readonly type: FruitName;
    readonly startPositionX: number;
    readonly flyDirection: {
        readonly x: number;
        readonly y: number;
    }
}
