import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { PermissibleButton } from '../../../../common/constant';
import { ButtonsMenu } from './ButtonsMenu';

describe('Buttons Menu', () => {
  const buttonClick = jest.fn();

  const buttons = [PermissibleButton.Exit];
  const buttonsMenu = (
    <ButtonsMenu
      buttonClick={buttonClick}
      buttons={buttons}
      title="Test Template"
    ></ButtonsMenu>
  );

  it('has a correct template', () => {
    const { container } = render(buttonsMenu);

    expect(container).toMatchSnapshot();
  });

  it('asserts buttons menu buttons correctly', () => {
    const { getByTestId } = render(buttonsMenu);
    expect(getByTestId('buttons').childElementCount).toBe(buttons.length);
  });

  it('assert buttonClick is fired correctly', () => {
    const { getByTestId } = render(buttonsMenu);
    fireEvent.click(getByTestId('buttons').childNodes[0]);
    expect(buttonClick).toBeCalledTimes(1);
    expect(buttonClick).toBeCalledWith(buttons[0]);
  });
});
