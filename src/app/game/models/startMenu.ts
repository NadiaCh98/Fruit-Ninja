import { GameMode } from './../../common/constant';
import { FruitName } from './fruitData';

export interface StartMenuItem {
  readonly mode: GameMode;
  readonly fruit?: FruitName;
}
