import React, { memo } from 'react';
import { GameControls } from '../../GameControls/GameControls';
import styles from './Score.module.css';

interface ScoreProps {
  readonly score: number;
  readonly best: number;
}

export const Score: React.FC<ScoreProps> = memo(({ score, best }) => {
  return (
    <GameControls>
      <p className={styles.score}>{score}</p>
      <p className={styles.best}>Best: {best}</p>
    </GameControls>
  );
});

Score.displayName = 'Score';
