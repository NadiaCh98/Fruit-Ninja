import { getRandomValueInclusive } from './../../../common/services/rng';
import { FruitsGenerator, GenerateFruits } from '../fruitsGenerator';
import { FruitSpeed } from '../../../common/constant';

export class DzenFruitsGenerator extends FruitsGenerator {
  public generateFruitsSequence: GenerateFruits = (_) => {
    const amount = getRandomValueInclusive(5, 12);
    const fruits = this.generateFruits(amount);
    return {
      fruits: this.getFruitsWithSpeed(fruits, FruitSpeed.Fast),
      delayBetweenFruits: amount < 8 ? 0 : 300,
    };
  };
}
