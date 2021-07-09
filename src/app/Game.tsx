import { useEffect, useLayoutEffect, useRef } from 'react';
import { GameScene } from './game/components/GameScene/GameScene';
import styles from './Game.module.css';
import { SCENE_SIZE, START_MENU } from './common/constant';
import { observer } from 'mobx-react-lite';
import { useStore } from './common/store';
import {
  BehaviorSubject,
  combineLatest,
  from,
  of,
  Subject,
} from 'rxjs';
import {
  bufferTime,
  concatMap,
  count,
  delay,
  filter,
  map,
  startWith,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FruitSequence } from './game/models/fruitData';
import { Blade } from './game/components/UI/Blade/Blade';
import { GameControls } from './game/components/GameControls/GameControls';
import { Button } from './common/components/Button/Button';
import { ReactComponent as Pause } from '../assets/icons/pause-button.svg';
import { StartMenu } from './game/components/UI/StartMenu/StartMenu';
import { Score } from './game/components/UI/Score/Score';

type Nullable<T> = T | null;

export const Game = observer(() => {
  const gameCanvasRef = useRef<Nullable<HTMLCanvasElement>>(null);
  const gameScene = useRef<Nullable<GameScene>>(null);
  const isActiveGame$ = useRef(new Subject<boolean>());
  const isDisabled = useRef(true);

  const {
    nextFruits,
    score,
    isActiveGame,
    onPause,
    pause,
    generateNewFruits,
    updateScore,
    decrementAttemps,
    setGameMode
  } = useStore('Game');

  const fruits$ = useRef(new BehaviorSubject(nextFruits));
  const onPause$ = useRef(new BehaviorSubject(onPause));

  useLayoutEffect(() => {
    if (gameCanvasRef.current) {
      gameScene.current = new GameScene(gameCanvasRef.current, START_MENU, SCENE_SIZE);

      const cutFruits$ = gameScene.current.cutFruits$;
      const missedFruit$ = gameScene.current.missedFruit$;

      const scoreSubscription = cutFruits$
        .pipe(
          bufferTime(100),
          tap((fruits) => updateScore(fruits))
        )
        .subscribe();

      const missedFruitSubscription = missedFruit$
        .pipe(tap((fruit) => decrementAttemps(fruit)))
        .subscribe();

      scoreSubscription.add(missedFruitSubscription);

      return () => scoreSubscription.unsubscribe();
    }
  }, [updateScore, decrementAttemps]);

  useEffect(() => {
    fruits$.current.next(nextFruits);
  }, [nextFruits]);

  useEffect(() => {
    isActiveGame$.current.next(isActiveGame);
  }, [isActiveGame]);

  useEffect(() => {
    onPause$.current.next(onPause);
  }, [onPause]);

  useEffect(() => {
    const gameOver$ = isActiveGame$.current.pipe(
      tap(() => {
        isDisabled.current = false;
        gameScene.current?.clear();
      })
    );

    const pause$ = onPause$.current.pipe(
      startWith(false),
      tap((onPause) => {
        onPause ? gameScene.current?.pause() : gameScene.current?.replay();
      })
    );

    const fruitsUI = ({fruits, delayBetweenFruits}: FruitSequence) => {
      return from(fruits).pipe(
        concatMap((value) => of(value).pipe(
          delay(delayBetweenFruits),
          tap(({ id, type, startPositionX, flyDirection }) =>
            gameScene.current?.pushFruit(type, id, startPositionX, flyDirection)
          )
        )),
        count(),
      );
    };

    const fruitsGenerator$ = combineLatest([fruits$.current, pause$]).pipe(
      filter(([_, onPause]) => !onPause),
      map(([fruits, _]) => fruits),
      concatMap(fruits => fruitsUI(fruits).pipe(delay(3000))),
      tap(() => generateNewFruits())
    );

    const game$ = fruitsGenerator$.pipe(
      takeUntil(gameOver$)
    );

    const gameSubscription = game$.subscribe();

    return () => gameSubscription.unsubscribe();
  }, [generateNewFruits]);

  return (
    <div className={styles.wrapper}>
      <Blade />
      <GameControls>
        <Score score={score} best={0} />
        <Button clickHandler={pause}>
          <Pause />
        </Button>
        <StartMenu items={START_MENU} selectMode={setGameMode} />
      </GameControls>
      {/* <div className={styles.controls}>
        <p className={styles.score}>{score}</p>
        <p className={styles.attemps}>{attemps}</p>
        <button onClick={pause}>{onPause ? 'Replay' : 'Pause'}</button>
        {!isDisabled && <h1>Game Over</h1>}
      </div> */}
      <canvas className={styles.scene} ref={gameCanvasRef} />
    </div>
  );
});
