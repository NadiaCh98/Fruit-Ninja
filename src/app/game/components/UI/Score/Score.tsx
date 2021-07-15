import { GameControls } from '../../GameControls/GameControls';
import styles from './Score.module.css';

interface ScoreProps {
  readonly score: number;
  readonly best: number;
}

export const Score: React.FC<ScoreProps> = ({ score, best }) => {
  return (
    <GameControls>
      <p className={styles.score}>{score}</p>
      <p className={styles.best}>Best: {best}</p>
    </GameControls>
  );
};
