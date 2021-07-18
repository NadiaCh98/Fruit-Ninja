import React from 'react';
import { render } from '@testing-library/react';
import { Timer } from './Timer';
import { NegativeNumberException } from '../../../../util/negativeNumberException';

describe('Timer', () => {
  it('has a correct template #1', () => {
    const { container } = render(<Timer time={90000} />);

    expect(container).toMatchSnapshot();
  });

  it('has a correct template #2', () => {
    const { container } = render(<Timer time={7000} />);

    expect(container).toMatchSnapshot();
  });

  it('asserts that Timer throws error if time < 0', () => {
    expect(() => render(<Timer time={-80} />)).toThrowError(
      NegativeNumberException
    );
  });
});
