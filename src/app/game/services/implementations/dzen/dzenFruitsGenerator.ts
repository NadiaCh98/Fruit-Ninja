import { getRandomValueInclusive } from '../../../../common/services/rng';
import { FruitsGenerator, GenerateFruits } from '../../fruitsGenerator';
import { FruitSpeed } from '../../../../common/constant';

const MIN_COUNT = 5;
const MAX_COUNT = 12;
export const DZEN_DELAY = 300;
export const LIMIT = 8;

export class DzenFruitsGenerator extends FruitsGenerator {
  private getDelayBetweenFruits(amount: number): number {
    return amount < LIMIT ? 0 : DZEN_DELAY;
  }

  public generateFruitsSequence: GenerateFruits = (_) => {
    const amount = getRandomValueInclusive(MIN_COUNT, MAX_COUNT);
    const fruits = this.generateFruits(amount);
    return {
      fruits: this.getFruitsWithSpeed(fruits, FruitSpeed.Average),
      delayBetweenFruits: this.getDelayBetweenFruits(amount),
    };
  };
}
