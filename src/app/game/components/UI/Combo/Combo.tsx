import { useEffect, useState } from 'react';
import { timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Combo } from '../../../models/game';
import { GameControls } from '../../GameControls/GameControls';
import styles from './Combo.module.css';

interface ComboProps {
  readonly comboInfo: Combo;
  readonly unmount: (item: Combo) => void;
}

export const ComboBonus: React.FC<ComboProps> = ({ comboInfo, unmount }) => {
  const {
    amount,
    point: { x: pointX, y: pointY },
  } = comboInfo;
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(false);

    const timeout = timer(3000)
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
