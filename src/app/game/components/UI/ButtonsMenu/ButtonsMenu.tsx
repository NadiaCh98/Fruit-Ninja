import { useCallback } from 'react';
import { Button } from '../../../../common/components/Button/Button';
import { BUTTONS, PermissibleButton } from '../../../../common/constant';
import { Modal } from '../../../../common/components/Modal/Modal';
import styles from './ButtonsMenu.module.css';

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
  const menuItemClick = useCallback(
    (button: PermissibleButton) => () => buttonClick(button),
    [buttonClick]
  );
  return (
    <Modal>
      <section className={styles.wrapper}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.menu}>
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
