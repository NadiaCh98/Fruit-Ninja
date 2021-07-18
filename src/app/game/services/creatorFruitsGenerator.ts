import { GameMode } from '../../common/constant';
import { FruitsGenerator } from './fruitsGenerator';
import { ClassicFruitsGenerator } from './implementations/classic/classicFruitsGenerator';
import { DzenFruitsGenerator } from './implementations/dzen/dzenFruitsGenerator';

export const createGeneratorFruitsByMode = (
  mode: GameMode,
  fruitPositionInterval: number
): FruitsGenerator => {
  switch (mode) {
  case GameMode.Classic:
    return new ClassicFruitsGenerator(fruitPositionInterval);
  case GameMode.Dzen:
    return new DzenFruitsGenerator(fruitPositionInterval);
  }
};
