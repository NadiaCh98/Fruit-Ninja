import { render } from '@testing-library/react';
import React from 'react';
import { Score } from './Score';

describe('Score', () => {
  const score = <Score score={50} best={60} />;
  it('has a correct template', () => {
    const { container } = render(score);

    expect(container).toMatchSnapshot();
  });
});
