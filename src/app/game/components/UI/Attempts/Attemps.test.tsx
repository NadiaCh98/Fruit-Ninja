import React from 'react';
import { render } from '@testing-library/react';
import { Attempts } from './Attempts';
import { NegativeNumberException } from '../../../../util/negativeNumberException';

describe('Attempts', () => {
  const attempts = 3;
  it('has a correct template #1', () => {
    const { container } = render(
      <Attempts totalAttempts={attempts} remainingAttempts={0} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('has a correct template #2', () => {
    const { container } = render(
      <Attempts totalAttempts={attempts} remainingAttempts={1} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('has a correct template #3', () => {
    const { container } = render(
      <Attempts totalAttempts={attempts} remainingAttempts={2} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('has a correct template #3', () => {
    const { container } = render(
      <Attempts totalAttempts={attempts} remainingAttempts={3} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('asserts that should throw error if total attemps < remaining attemps', () => {
    expect(() =>
      render(<Attempts totalAttempts={attempts} remainingAttempts={5} />)
    ).toThrowError('Total attemps can not be less than remaining');
  });

  it('asserts that should throw error if remaining attemps < 0', () => {
    expect(() =>
      render(<Attempts totalAttempts={attempts} remainingAttempts={-1} />)
    ).toThrowError(NegativeNumberException);
  });

  it('asserts that should throw error if total attemps < 0', () => {
    expect(() =>
      render(<Attempts totalAttempts={-3} remainingAttempts={-7} />)
    ).toThrowError(NegativeNumberException);
  });
});
