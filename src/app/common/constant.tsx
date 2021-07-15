import { StartMenuItem } from '../game/models/startMenu';
import { GameConfig } from '../game/models/game';
import { ReactComponent as ExitIcon } from '../../assets/icons/close.svg';
import { ReactComponent as PauseIcon } from '../../assets/icons/pause.svg';
import { ReactComponent as ReplayIcon } from '../../assets/icons/replay.svg';
import { ReactComponent as PlayIcon } from '../../assets/icons/play.svg';

export const SCENE_SIZE = 9;
export const ATTEMPS = 3;
export const MIN_CUT_COMBO = 3;
export const DELAY_BETWEEN_FRUITS_GROUP = 3000;

export enum Fruits {
  apple,
  banana,
  lemon,
  pear
}

export enum FruitSpeed {
  Low = 2.8,
  Average = 3,
  Fast = 3.4,
}

export enum Game {
  Classic = 'Classic',
  Dzen = 'Dzen',
}

export const START_MENU: StartMenuItem[] = [
  {
    mode: Game.Classic,
    fruit: 'apple',
  },
  {
    mode: Game.Dzen,
    fruit: 'apple',
  },
];

export const GAME_CONFIG: GameConfig[] = [
  {
    game: Game.Classic,
    timer: null,
    attempts: 3,
  },
  {
    game: Game.Dzen,
    timer: 90000,
    attempts: 0,
  },
];

export enum PermissibleButton {
  Exit = 'Exit',
  Pause = 'Pause',
  Play = 'Play',
  Replay = 'Replay',
}

export const BUTTONS: Record<PermissibleButton, JSX.Element> = {
  Exit: <ExitIcon />,
  Pause: <PauseIcon />,
  Play: <PlayIcon />,
  Replay: <ReplayIcon />,
};

export const RIGHT_POSITION: React.CSSProperties = {
  top: 0,
  right: 0,
  width: 'max-content',
};
