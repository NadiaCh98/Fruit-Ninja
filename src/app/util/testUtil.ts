import { FruitSequence } from './../game/models/fruitData';
import { FruitsGenerator } from '../game/services/fruitsGenerator';

export const getFruitsSeriesByGeneratorAndIteraction = (
  generator: FruitsGenerator,
  iteraction: number
): FruitSequence => {
  return generator.generateFruitsSequence(iteraction);
};
