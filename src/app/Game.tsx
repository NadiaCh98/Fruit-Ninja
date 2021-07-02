import { useEffect, useLayoutEffect, useRef } from 'react';
import { GameScene } from './game/components/GameScene/GameScene';
import styles from './Game.module.css';
import { SCENE_SIZE } from './common/constant';
import { observer } from 'mobx-react-lite';
import { useStore } from './common/store';
import { interval } from 'rxjs';
import { bufferTime, pluck, tap } from 'rxjs/operators';

type Nullable<T> = T | null;

export const Game = observer(() => {
  const gameCanvasRef = useRef<Nullable<HTMLCanvasElement>>(null);
  const gameScene = useRef<Nullable<GameScene>>(null);
 
  const { nextFruits, score, attemps, generateNewFruits, updateScore, decrementAttemps } =
    useStore('Game');

  useLayoutEffect(() => {
    if (gameCanvasRef.current) {
      gameScene.current = new GameScene(gameCanvasRef.current, SCENE_SIZE);

      const cutFruits$ = gameScene.current.cutFruits$;
      const missedFruit$ = gameScene.current.missedFruit$;

      const scoreSubscription = cutFruits$
        .pipe(
          bufferTime(100), 
          pluck('length'),
          tap(value => updateScore(value))
        )
        .subscribe();

      const missedFruitSubscription = missedFruit$.pipe(
        tap(() => decrementAttemps())
      ).subscribe();

      scoreSubscription.add(missedFruitSubscription);

      return () => scoreSubscription.unsubscribe();
    }
  }, [updateScore, decrementAttemps]);

  useEffect(() => {
    if (gameScene.current) {
      nextFruits.map(({ id, flyDirection, startPositionX, type }) =>
        gameScene.current?.pushFruit(type, id, startPositionX, flyDirection)
      );
    }
  }, [nextFruits]);


  useEffect(() => {
    const interval$ = interval(4000).pipe(tap(() => generateNewFruits()));

    const subscription = interval$.subscribe();

    return () => subscription.unsubscribe();
  }, [generateNewFruits]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <p className={styles.score}>{score}</p>
        <p className={styles.attemps}>{attemps}</p>
      </div>
      <canvas className={styles.scene} ref={gameCanvasRef} />
    </div>
  );
});
