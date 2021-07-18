import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { Combo } from '../../../models/game';
import { ComboBonus, COMBO_TIME } from './Combo';
describe('Combo', () => {
  const unmount = jest.fn();
  const comboInfo: Combo = {
    id: 0,
    point: {
      x: 100,
      y: 100,
    },
    amount: 4,
  };
  const combo = <ComboBonus comboInfo={comboInfo} unmount={unmount} />;

  it('has a correct template', () => {
    const { container } = render(combo);
    expect(container).toMatchSnapshot();
  });

  it(`asserts that since ${COMBO_TIME}ms container is unmounted and unmount() fire`, async () => {
    const { container } = render(combo);

    await waitFor(
      () => {
        expect(container.innerHTML).toBe('');
        expect(unmount).toBeCalledTimes(1);
        expect(unmount).toBeCalledWith(comboInfo);
      },
      { timeout: 3000 }
    );
  });
});
