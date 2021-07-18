import React from 'react';
import { StartMenuItem } from '../game/models/startMenu';
import { GameConfig } from '../game/models/game';

export const SCENE_SIZE = 9;
export const FRUITS_POSITION_INTERVAL = SCENE_SIZE / 2;
export const ATTEMPS = 3;
export const MIN_CUT_COMBO = 3;
export const DELAY_BETWEEN_FRUITS_GROUP = 3000;
export const CUTTING_DELAY = 200;
export const SOUND_PATH = '/sound';
export const FRUITS_PATH = 'fruits/';

export enum Fruits {
  apple,
  banana,
  lemon,
  pear,
}

export enum FruitSpeed {
  Low = 2.8,
  Average = 3,
  Fast = 3.4,
}

export enum GameMode {
  Classic = 'Classic',
  Dzen = 'Dzen',
}

export enum Sound {
  Combo = 'combo',
  Button = 'button',
  Slice = 'slice',
  GameOver = 'game-over',
  GameStart = 'game-start',
  Gank = 'gank',
}

export const START_MENU: StartMenuItem[] = [
  {
    mode: GameMode.Classic,
  },
  {
    mode: GameMode.Dzen,
  },
];

export const GAME_CONFIG: Record<GameMode, GameConfig> = {
  Classic: {
    game: GameMode.Classic,
    timer: null,
    attempts: 3,
  },
  Dzen: {
    game: GameMode.Dzen,
    timer: 90000,
    attempts: null,
  },
};

export enum PermissibleButton {
  Exit = 'Exit',
  Pause = 'Pause',
  Play = 'Play',
  Replay = 'Replay',
}

export const RIGHT_POSITION: React.CSSProperties = {
  top: 0,
  right: 0,
  width: 'max-content',
};
