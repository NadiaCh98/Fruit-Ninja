import { shuffle } from 'lodash';
import { FruitSpeed } from '../../../common/constant';
import { getRandomValueInclusive } from '../../../common/services/rng';
import { FruitFlyData } from '../../models/fruitData';
import { GenerateFruits, FruitsGenerator } from '../fruitsGenerator';

export class ClassicFruitsGenerator extends FruitsGenerator {
  private getFruitSpeedByIteraction(iteraction: number): FruitSpeed {
    return iteraction < 10
      ? FruitSpeed.Low
      : iteraction < 25
      ? FruitSpeed.Average
      : FruitSpeed.Fast;
  }

  public generateFruitsSequence: GenerateFruits = (iteraction) => {
    let fruits: FruitFlyData[] = [];
    if (iteraction === 5) {
      const amount = getRandomValueInclusive(1, 2);
      fruits = this.generateFruits(amount, true);
    } else {
      const fruitAmount =
        iteraction <= 1
          ? 1
          : iteraction % 5 === 0
          ? 5
          : getRandomValueInclusive(2, iteraction < 8 ? iteraction : 10);
      const bombAmount = iteraction / 8 > 1 ? getRandomValueInclusive(1, 5) : 0;

      fruits = shuffle([
        ...this.generateFruits(fruitAmount),
        ...this.generateFruits(bombAmount, true),
      ]);
    }
    return {
      fruits: fruits.map((fruit) => ({
        ...fruit,
        speed: this.getFruitSpeedByIteraction(iteraction),
      })),
      delayBetweenFruits: iteraction % 5 === 0 ? 0 : 500,
    };
  };
}
