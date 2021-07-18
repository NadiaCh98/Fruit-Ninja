import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { GameScene } from './game/components/GameScene/GameScene';
import styles from './Game.module.css';
import {
  CUTTING_DELAY,
  DELAY_BETWEEN_FRUITS_GROUP,
  GameMode,
  MIN_CUT_COMBO,
  PermissibleButton,
  SCENE_SIZE,
  Sound,
  START_MENU,
} from './common/constant';
import { observer } from 'mobx-react-lite';
import { useStore } from './common/store';
import {
  BehaviorSubject,
  combineLatest,
  from,
  fromEvent,
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
import { StartMenu } from './game/components/UI/StartMenu/StartMenu';
import { Score } from './game/components/UI/Score/Score';
import { Timer } from './game/components/UI/Timer/Timer';
import { Combo, Nullable, NullableNumber } from './game/models/game';
import { Attempts } from './game/components/UI/Attempts/Attempts';
import { ButtonsMenu } from './game/components/UI/ButtonsMenu/ButtonsMenu';
import { ComboBonus } from './game/components/UI/Combo/Combo';
import { generateId } from './game/services/generateId';
import { createAudioEffect } from './game/services/creatorAudioEffect';
import { Pause } from './game/components/UI/Icons/Icons';

const sliceSound = createAudioEffect(Sound.Slice);
const comboSound = createAudioEffect(Sound.Combo);
const gameOverSound = createAudioEffect(Sound.GameOver);

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

      const scoreSubscription = cutFruits$
        .pipe(
          bufferTime(CUTTING_DELAY),
          filter((value) => value.length > 0),
          tap((fruits) => {
            const amount = fruits.length;
            let audio = sliceSound;
            if (amount >= MIN_CUT_COMBO) {
              const lastItem = fruits[amount - 1];
              audio = comboSound;
              setCombo((combo) => [
                ...combo,
                { id: generateId(), amount, point: lastItem.point },
              ]);
            }
            if (
              audio.currentTime === 0 ||
              audio.currentTime >= audio.duration / 2
            ) {
              audio.currentTime = 0;
              audio.play();
            }
            updateScore(fruits.map((item) => item.fruit));
          })
        )
        .subscribe();

      const resize = fromEvent(window, 'resize')
        .pipe(
          tap(() => {
            gameScene.current?.resize();
          })
        )
        .subscribe();

      scoreSubscription.add(resize);

      return () => scoreSubscription.unsubscribe();
    }
  }, [updateScore]);

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
        gameOverSound.play();
        gameScene.current?.clear();
      })
    );

    const pause$ = onPause$.current.pipe(
      startWith(false),
      tap((onPause) => {
        onPause ? gameScene.current?.pause() : gameScene.current?.replay();
      })
    );

    const missedFruitSubscription = gameScene.current?.missedFruit$
      .pipe(
        tap((fruit) => {
          decrementAttemps(fruit);
          if (
            !!gameMode &&
            gameMode.game === GameMode.Classic &&
            fruit !== 'bomb'
          ) {
            const gankSound = createAudioEffect(Sound.Gank);
            gankSound.play();
          }
        })
      )
      .subscribe();

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
          delayWhen((value) =>
            interval(value > 0 ? DELAY_BETWEEN_FRUITS_GROUP : 0)
          )
        )
      ),
      tap(() => generateNewFruits())
    );

    const game$ = gameTimer$
      ? combineLatest([gameTimer$, fruitsGenerator$]).pipe(
        map(([_, generator]) => generator)
      )
      : fruitsGenerator$;

    if (gameId) {
      const gameSubscription = game$.pipe(takeUntil(gameOver$)).subscribe();
      missedFruitSubscription?.add(gameSubscription);
    }
    return () => missedFruitSubscription?.unsubscribe();
  }, [generateNewFruits, updateGameTime, decrementAttemps, gameMode, gameId]);

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
    <div data-testid="game" className={styles.wrapper}>
      <div data-testid="controls">
        <Blade data-testid="blade" />
        <Score data-testid="score" score={score} best={bestScoreByGameMode} />
        {!onPause && (
          <GameControls style={{ bottom: 0, left: 0 }}>
            <Button clickHandler={pause} data-testid="pause">
              <Pause />
            </Button>
          </GameControls>
        )}
        {!!combo &&
          combo.map((item, i) => (
            <ComboBonus
              data-testid={`combo${i}`}
              key={item.id}
              comboInfo={item}
              unmount={removeComboItem}
            />
          ))}
        {isGameOver && (
          <ButtonsMenu
            data-testid="gameOverButtonsMenu"
            buttons={[PermissibleButton.Exit, PermissibleButton.Replay]}
            title="Game Over"
            buttonClick={menuClick}
          ></ButtonsMenu>
        )}
        {!!gameTime && gameTime >= 0 && (
          <Timer data-testid="timer" time={gameTime} />
        )}
        {!!gameMode?.attempts && attemps !== null && (
          <Attempts
            data-testid="attempts"
            totalAttempts={gameMode.attempts}
            remainingAttempts={attemps}
          />
        )}
        {!gameMode && (
          <StartMenu
            data-testid="startMenu"
            items={START_MENU}
            selectMode={updateGameMode}
          />
        )}
        {onPause && (
          <ButtonsMenu
            data-testid="pausedButtonsMenu"
            buttons={[
              PermissibleButton.Exit,
              PermissibleButton.Replay,
              PermissibleButton.Play,
            ]}
            title="Paused"
            buttonClick={menuClick}
          />
        )}
      </div>

      <canvas
        data-testid="scene"
        className={styles.scene}
        ref={gameCanvasRef}
      />
    </div>
  );
});
