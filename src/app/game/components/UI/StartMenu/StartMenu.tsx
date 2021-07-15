import { useCallback } from 'react';
import { Button } from '../../../../common/components/Button/Button';
import { Game } from '../../../../common/constant';
import { StartMenuItem } from '../../../models/startMenu';
import { Modal } from '../../../../common/components/Modal/Modal';
import styled from 'styled-components';

interface StartMenuProps {
  readonly items: StartMenuItem[];
  readonly selectMode: (mode: Game) => void;
}

const StyledMenu = styled.div`
  display: grid;
  grid-gap: 10px;
  width: 20rem;
`;

export const StartMenu: React.FC<StartMenuProps> = ({ items, selectMode }) => {
  const selectGameMode = useCallback(
    (mode: Game) => () => {
      selectMode(mode);
    },
    [selectMode]
  );

  return (
    <Modal>
      <StyledMenu>
        {items.map(({ mode }, i) => (
          <Button key={i} kind={'primary'} clickHandler={selectGameMode(mode)}>
            <p>{mode}</p>
          </Button>
        ))}
      </StyledMenu>
    </Modal>
  );
};
