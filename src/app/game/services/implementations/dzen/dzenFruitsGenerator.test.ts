import { FruitSequence } from './../../../models/fruitData';
import { DzenFruitsGenerator, DZEN_DELAY, LIMIT } from './dzenFruitsGenerator';
import { times } from 'lodash';
import { FRUITS_POSITION_INTERVAL } from '../../../../common/constant';

type DzenIteraction = [number, FruitSequence][];

describe('Dzen Mode Fruits Generator', () => {
  const generator = new DzenFruitsGenerator(FRUITS_POSITION_INTERVAL);

  const iteractions: DzenIteraction = times(7).map((iteraction) => {
    return [iteraction, generator.generateFruitsSequence(iteraction)];
  });
  test.each(iteractions)(
    'asserts %i dzen series doesn\'t have bombs',
    (_: number, sequence: FruitSequence) => {
      const bombs = sequence.fruits.filter(({ type }) => type === 'bomb');
      expect(bombs).toHaveLength(0);
    }
  );

  it(`asserts delay is ${DZEN_DELAY} if sequence lenght more than ${LIMIT}`, () => {
    expect(generator['getDelayBetweenFruits'].call(null, 9)).toBe(DZEN_DELAY);
  });

  it(`asserts delay is ${DZEN_DELAY} if sequence lenght is greater than ${LIMIT}`, () => {
    expect(generator['getDelayBetweenFruits'].call(null, 9)).toBe(DZEN_DELAY);
  });

  it(`asserts delay is 0 if sequence lenght is less than ${LIMIT}`, () => {
    expect(generator['getDelayBetweenFruits'].call(null, 5)).toBe(0);
  });
});
