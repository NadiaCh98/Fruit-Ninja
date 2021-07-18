import React from 'react';
import { Button } from '../../../../common/components/Button/Button';
import { GameMode } from '../../../../common/constant';
import { StartMenuItem } from '../../../models/startMenu';
import { Modal } from '../../../../common/components/Modal/Modal';
import styled from 'styled-components';

interface StartMenuProps {
  readonly items: StartMenuItem[];
  readonly selectMode: (mode: GameMode) => void;
}

const StyledMenu = styled.div`
  display: grid;
  grid-gap: 10px;
  width: 20rem;
`;

const startGameSound = new Audio('/sound/game-start.wav');

export const StartMenu: React.FC<StartMenuProps> = ({ items, selectMode }) => {
  const selectGameMode = React.useCallback(
    (mode: GameMode) => () => {
      startGameSound.play();
      selectMode(mode);
    },
    [selectMode]
  );

  return (
    <Modal>
      <StyledMenu data-testid="modes">
        {items.map(({ mode }, i) => (
          <Button key={i} kind={'primary'} clickHandler={selectGameMode(mode)}>
            <p>{mode}</p>
          </Button>
        ))}
      </StyledMenu>
    </Modal>
  );
};
