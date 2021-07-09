import { Game } from '../../common/constant';
import { FruitsGenerator } from './fruitsGenerator';
import { ClassicFruitsGenerator } from './implementations/classicFruitsGenerator';
import { DzenFruitsGenerator } from './implementations/dzenFruitsGenerator';

export const createGeneratorFruitsByMode = (
  mode: Game,
  fruitPositionInterval: number,
  delay: number
): FruitsGenerator => {
  switch (mode) {
    case Game.Classic:
      return new ClassicFruitsGenerator(fruitPositionInterval, delay);
    case Game.Dzen:
      return new DzenFruitsGenerator(fruitPositionInterval, delay);
  }
};
