import { useLayoutEffect, useRef } from 'react';
import { GameScene } from './GameScene/GameScene';
import './Game.css';
import { Vector3 } from '@babylonjs/core';

export const Game = () => {
  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameScene = useRef<GameScene | null>(null);
  let id = 0;
  useLayoutEffect(() => {
    if (gameCanvasRef.current) {
      gameScene.current = new GameScene(gameCanvasRef.current);

      setInterval(() => {
        gameScene.current?.pushFruit(id++, -1.5, new Vector3(0.7, 3, 0));
        gameScene.current?.pushFruit(id++, -0.5, new Vector3(-0.5, 2.5, 0));
      }, 4000);

    }
  }, [id]);

  return <canvas ref={gameCanvasRef} />;
};
