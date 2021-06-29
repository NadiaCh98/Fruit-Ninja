import { BaseEntity } from './baseEntity';

export type Fruit = 'APPLE' | 'PINEAPPLE' | 'BOMB';

export interface FruitNinja extends BaseEntity {
    readonly type: Fruit;
    readonly startPositionX: number;
    readonly flyDirection: {
        readonly x: number;
        readonly y: number;
    }
}
