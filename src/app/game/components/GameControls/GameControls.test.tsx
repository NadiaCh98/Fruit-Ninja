import React from 'react';
import { render } from '@testing-library/react';
import { GameControls } from './GameControls';

describe('Game Controls', () => {
  it('has a correct template #1', () => {
    const { container } = render(<GameControls />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('has a correct template #2', () => {
    const { container } = render(<GameControls>Hello</GameControls>);

    expect(container.firstChild).toMatchSnapshot();
  });
});
