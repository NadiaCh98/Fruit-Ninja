import React from 'react';
import { Button } from '../../../../common/components/Button/Button';
import { Modal } from '../../../../common/components/Modal/Modal';
import { PermissibleButton } from '../../../../common/constant';
import { ExitIcon, PauseIcon, PlayIcon, ReplayIcon } from '../Icons/Icons';
import styles from './ButtonsMenu.module.css';

const BUTTONS: Record<PermissibleButton, JSX.Element> = {
  Exit: <ExitIcon />,
  Pause: <PauseIcon />,
  Play: <PlayIcon />,
  Replay: <ReplayIcon />,
};

interface ButtonsMenuProps {
  readonly buttons: PermissibleButton[];
  readonly title: string;
  readonly buttonClick: (button: PermissibleButton) => void;
}

export const ButtonsMenu: React.FC<ButtonsMenuProps> = ({
  buttons,
  title,
  buttonClick,
}) => {
  const menuItemClick = React.useCallback(
    (button: PermissibleButton) => () => buttonClick(button),
    [buttonClick]
  );
  return (
    <Modal>
      <section className={styles.wrapper}>
        <h1 className={styles.title}>{title}</h1>
        <div data-testid="buttons" className={styles.menu}>
          {buttons.map((button, i) => (
            <Button key={i} clickHandler={menuItemClick(button)}>
              {BUTTONS[button]}
            </Button>
          ))}
        </div>
      </section>
    </Modal>
  );
};
