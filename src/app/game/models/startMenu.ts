import { Game } from './../../common/constant';
import { FruitName } from './fruitData';

export interface StartMenuItem {
    readonly mode: Game;
    readonly fruit: FruitName;
}