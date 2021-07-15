import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { GameScene } from './game/components/GameScene/GameScene';
import styles from './Game.module.css';
import {
  DELAY_BETWEEN_FRUITS_GROUP,
  MIN_CUT_COMBO,
  PermissibleButton,
  SCENE_SIZE,
  START_MENU,
} from './common/constant';
import { observer } from 'mobx-react-lite';
import { useStore } from './common/store';
import {
  BehaviorSubject,
  combineLatest,
  from,
  interval,
  of,
  Subject,
} from 'rxjs';
import {
  bufferTime,
  concatMap,
  count,
  delay,
  delayWhen,
  filter,
  map,
  startWith,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { FruitSequence } from './game/models/fruitData';
import { Blade } from './game/components/UI/Blade/Blade';
import { GameControls } from './game/components/GameControls/GameControls';
import { Button } from './common/components/Button/Button';
import { ReactComponent as Pause } from '../assets/icons/pause.svg';
import { StartMenu } from './game/components/UI/StartMenu/StartMenu';
import { Score } from './game/components/UI/Score/Score';
import { Timer } from './game/components/UI/Timer/Timer';
import { Combo, Nullable, NullableNumber } from './game/models/game';
import { Attempts } from './game/components/UI/Attempts/Attempts';
import { ButtonsMenu } from './game/components/UI/ButtonsMenu/ButtonsMenu';
import { ComboBonus } from './game/components/UI/Combo/Combo';
import { generateId } from './game/services/generateId';

export const Game = observer(() => {
  const gameCanvasRef = useRef<Nullable<HTMLCanvasElement>>(null);
  const gameScene = useRef<Nullable<GameScene>>(null);
  const isActiveGame$ = useRef(new Subject<boolean>());
  const timer = useRef(new BehaviorSubject<NullableNumber>(null));

  const [isGameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState<Combo[]>([]);

  const {
    nextFruits,
    score,
    isActiveGame,
    onPause,
    gameTime,
    gameMode,
    attemps,
    bestScoreByGameMode,
    gameId,
    replay,
    pause,
    exitFromCurrentMode,
    generateNewFruits,
    updateScore,
    decrementAttemps,
    updateGameMode,
    updateGameTime,
  } = useStore('Game');

  const fruits$ = useRef(new BehaviorSubject(nextFruits));
  const onPause$ = useRef(new BehaviorSubject(onPause));

  useLayoutEffect(() => {
    if (gameCanvasRef.current) {
      gameScene.current = new GameScene(gameCanvasRef.current, SCENE_SIZE);

      const cutFruits$ = gameScene.current.cutFruits$;
      const missedFruit$ = gameScene.current.missedFruit$;

      const scoreSubscription = cutFruits$
        .pipe(
          bufferTime(150),
          filter((value) => value.length > 0),
          tap((fruits) => {
            const amount = fruits.length;
            if (amount >= MIN_CUT_COMBO) {
              const lastItem = fruits[amount - 1];
              setCombo((combo) => [
                ...combo,
                { id: generateId(), amount, point: lastItem.point },
              ]);
            }
            updateScore(fruits.map((item) => item.fruit));
          })
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
    if (gameMode) {
      timer.current.next(gameMode.timer);
    }
  }, [gameMode]);

  useEffect(() => {
    setGameOver(false);

    const gameOver$ = isActiveGame$.current.pipe(
      tap(() => {
        setGameOver(true);
        gameScene.current?.clear();
      })
    );

    const pause$ = onPause$.current.pipe(
      startWith(false),
      tap((onPause) => {
        onPause ? gameScene.current?.pause() : gameScene.current?.replay();
      })
    );

    const fruitsUI = ({ fruits, delayBetweenFruits }: FruitSequence) => {
      return from(fruits).pipe(
        concatMap((value) =>
          of(value).pipe(
            delay(delayBetweenFruits),
            tap(({ id, type, startPositionX, flyDirection }) =>
              gameScene.current?.pushFruit(
                type,
                id,
                startPositionX,
                flyDirection
              )
            )
          )
        ),
        count()
      );
    };

    const gameTimer$ = gameMode?.timer
      ? interval(1000).pipe(
          withLatestFrom(pause$),
          filter(([_, onPause]) => !onPause),
          tap(() => {
            updateGameTime();
          })
        )
      : of();

    const fruitsGenerator$ = combineLatest([fruits$.current, pause$]).pipe(
      filter(([_, pause]) => !pause),
      map(([fruits, _]) => fruits),
      concatMap((fruits) =>
        fruitsUI(fruits).pipe(
          delayWhen((value) => interval(value > 0 ? DELAY_BETWEEN_FRUITS_GROUP : 0))
        )
      ),
      tap(() => generateNewFruits())
    );

    const game$ = !!gameTimer$
      ? combineLatest([gameTimer$, fruitsGenerator$]).pipe(
          map(([_, generator]) => generator)
        )
      : fruitsGenerator$;

    if (gameId) {
      const gameSubscription = game$.pipe(takeUntil(gameOver$)).subscribe();

      return () => gameSubscription.unsubscribe();
    }
  }, [generateNewFruits, updateGameTime, gameMode, gameId]);

  const menuClick = useCallback(
    (button: PermissibleButton) => {
      switch (button) {
        case PermissibleButton.Play: {
          pause();
          break;
        }
        case PermissibleButton.Replay: {
          replay();
          gameScene.current?.clearAndReplay();
          break;
        }
        case PermissibleButton.Exit: {
          exitFromCurrentMode();
          gameScene.current?.clearAndReplay();
          break;
        }
      }
    },
    [pause, replay, exitFromCurrentMode]
  );

  const removeComboItem = useCallback(
    (comboItem: Combo) => {
      const updatedCombo = combo.filter((item) => item.id !== comboItem.id);
      setCombo(updatedCombo);
    },
    [combo]
  );

  return (
    <div className={styles.wrapper}>
      <Blade />
      <Score score={score} best={bestScoreByGameMode} />
      {!onPause && (
        <GameControls style={{ bottom: 0, left: 0 }}>
          <Button clickHandler={pause}>
            <Pause />
          </Button>
        </GameControls>
      )}
      {!!combo &&
        combo.map((item) => (
          <ComboBonus key={item.id} comboInfo={item} unmount={removeComboItem} />
        ))}
      {isGameOver && (
        <ButtonsMenu
          buttons={[PermissibleButton.Exit, PermissibleButton.Replay]}
          title="Game Over"
          buttonClick={menuClick}
        ></ButtonsMenu>
      )}
      {!!gameTime && gameTime >= 0 && <Timer time={gameTime} />}
      {!!gameMode?.attempts && attemps !== null && (
        <Attempts
          totalAttempts={gameMode.attempts}
          remainingAttempts={attemps}
        />
      )}
      {!gameMode && (
        <StartMenu items={START_MENU} selectMode={updateGameMode} />
      )}
      {onPause && (
        <ButtonsMenu
          buttons={[
            PermissibleButton.Exit,
            PermissibleButton.Replay,
            PermissibleButton.Play,
          ]}
          title="Paused"
          buttonClick={menuClick}
        />
      )}
      <canvas className={styles.scene} ref={gameCanvasRef} />
    </div>
  );
});
