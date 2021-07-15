import styled, { keyframes } from 'styled-components';
import { Modal } from '../../../../common/components/Modal/Modal';


const gameOverAnimation = keyframes`
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
`;

const GameOverTitle = styled.p`
  font-size: 15rem;
  background: linear-gradient(
    180deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(168, 5, 5, 1) 50%,
    rgba(128, 24, 24, 1) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${gameOverAnimation} 3s forwards;

  ::after {
    content: 'Game Over';
  }
`;

export const GameOver: React.FC = () => {
  return (
    <Modal>
      <GameOverTitle />
    </Modal>
  );
};
