import { useEffect, useLayoutEffect, useRef } from 'react';
import { GameScene } from './game/components/GameScene/GameScene';
import './Game.css';
import { SCENE_SIZE } from './common/constant';
import { observer } from 'mobx-react-lite';
import { useStore } from './common/store';
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';

export const Game = observer(() => {
  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameScene = useRef<GameScene | null>(null);
  const { nextFruits, generateNewFruits } = useStore('Game');

  useLayoutEffect(() => {
    if (gameCanvasRef.current) {
      gameScene.current = new GameScene(gameCanvasRef.current, SCENE_SIZE);
    }
  }, []);

  useEffect(() => {
    if (gameScene.current) {
      nextFruits.map(({ id, flyDirection, startPositionX, type }) =>
        gameScene.current?.pushFruit(type, id, startPositionX, flyDirection)
      );
    }
  }, [nextFruits]);

  useEffect(() => {
    const interval$ = interval(3000).pipe(tap(() => generateNewFruits()));

    const subscription = interval$.subscribe();

    return () => subscription.unsubscribe();
  }, [generateNewFruits]);

  return <canvas ref={gameCanvasRef} />;
});
