import { FRUITS_POSITION_INTERVAL } from '../../../../common/constant';
import { ClassicFruitsGenerator } from './classicFruitsGenerator';
import { times } from 'lodash';
import { getFruitsSeriesByGeneratorAndIteraction } from '../../../../util/testUtil';

describe('Classic Mode Fruis Generator', () => {
  const generator = new ClassicFruitsGenerator(FRUITS_POSITION_INTERVAL);

  describe('Bombs', () => {
    const iteractions: [number, number[]][] = times(12).map((iteraction) => [
      iteraction,
      iteraction === 5
        ? times(3).filter(Boolean)
        : iteraction / 8 > 1
          ? times(iteraction % 5 === 0 ? 3 : 6).filter(Boolean)
          : [0],
    ]);

    test.each(iteractions)(
      'assert %ith series has %i bombs',
      (iteraction: number, expected: number[]) => {
        const series = getFruitsSeriesByGeneratorAndIteraction(
          generator,
          iteraction
        );
        const bombs = series?.fruits.filter(({ type }) => type === 'bomb');
        expect(expected).toContain(bombs.length);
      }
    );
  });

  describe('Fruits', () => {
    const iteractions: [number, number[]][] = times(12).map((iteraction) => [
      iteraction,
      iteraction <= 1
        ? times(2).filter(Boolean)
        : iteraction % 5 === 0
          ? iteraction === 5
            ? [0]
            : [5]
          : times((iteraction < 8 ? iteraction : 10) + 1).filter(
            (value) => value >= 2
          ),
    ]);

    test.each(iteractions)(
      'assert %ith series has %i fruits',
      (iteraction: number, expected: number[]) => {
        const series = getFruitsSeriesByGeneratorAndIteraction(
          generator,
          iteraction
        );
        const bombs = series?.fruits.filter(({ type }) => type !== 'bomb');
        expect(expected).toContain(bombs.length);
      }
    );
  });

  describe('Delay between fruits and speed', () => {
    const iteractions = times(30).map((iteraction) => [
      iteraction,
      generator['getFruitSpeedByIteraction'].call(null, iteraction),
      iteraction % 5 === 0 ? 0 : 500,
    ]);

    test.each(iteractions)(
      'assert %ith series has %i speed and %i delay',
      (iteraction: number, expectedSpeed: number, expectedDelay: number) => {
        const series = getFruitsSeriesByGeneratorAndIteraction(
          generator,
          iteraction
        );
        expect(series.delayBetweenFruits).toBe(expectedDelay);
        expect(series.fruits[0].speed).toBe(expectedSpeed);
      }
    );
  });
});
