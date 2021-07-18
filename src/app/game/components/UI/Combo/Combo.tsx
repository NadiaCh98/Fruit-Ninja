import React, { useState, useEffect } from 'react';
import { timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Combo } from '../../../models/game';
import { GameControls } from '../../GameControls/GameControls';
import styles from './Combo.module.css';

interface ComboProps {
  readonly comboInfo: Combo;
  readonly unmount: (item: Combo) => void;
}

export const COMBO_TIME = 3000;

export const ComboBonus: React.FC<ComboProps> = ({ comboInfo, unmount }) => {
  const {
    amount,
    point: { x: pointX, y: pointY },
  } = comboInfo;
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(false);

    const timeout = timer(COMBO_TIME)
      .pipe(
        tap(() => {
          setHide(true);
          unmount(comboInfo);
        })
      )
      .subscribe();

    return () => timeout.unsubscribe();
  }, [comboInfo, unmount]);

  return !hide ? (
    <GameControls style={{ left: pointX, top: pointY }}>
      <div className={styles.wrapper}>
        <p>{amount} Fruits Combo</p>
        <h2>x 2</h2>
      </div>
    </GameControls>
  ) : null;
};
