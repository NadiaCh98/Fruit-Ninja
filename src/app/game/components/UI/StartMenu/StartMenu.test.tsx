import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { START_MENU } from '../../../../common/constant';
import { StartMenu } from './StartMenu';

describe('Start Menu', () => {
  const selectMode = jest.fn();
  const startMenu = <StartMenu selectMode={selectMode} items={START_MENU} />;

  it('has a correct template', () => {
    const { container } = render(startMenu);

    expect(container).toMatchSnapshot();
  });

  it('asserts that selectMode() is fired with correct mode', () => {
    const { getByTestId } = render(startMenu);

    fireEvent.click(getByTestId('modes').childNodes[0]);

    expect(selectMode).toBeCalledTimes(1);
    expect(selectMode).toBeCalledWith(START_MENU[0].mode);
  });
});
