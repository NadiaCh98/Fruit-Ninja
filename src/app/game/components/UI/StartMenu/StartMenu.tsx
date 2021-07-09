import { useCallback } from 'react';
import { Button } from '../../../../common/components/Button/Button';
import { Game } from '../../../../common/constant';
import { StartMenuItem } from '../../../models/startMenu';

interface StartMenuProps {
  readonly items: StartMenuItem[];
  readonly selectMode: (mode: Game) => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ items, selectMode }) => {
  const selectGameMode = useCallback(
    (mode: Game) => () => {
        console.log(mode);
        selectMode(mode)
    },
    [selectMode]
  );

  return (
    <>
      {items.map(({ mode }, i) => (
        <Button key={i} clickHandler={selectGameMode(mode)}>
          <p>{mode}</p>
        </Button>
      ))}
    </>
  );
};
