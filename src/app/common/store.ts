import { GameStore } from '../gameStore';
import { FRUITS_POSITION_INTERVAL } from './constant';
import { createContext } from './storeUtils';

export const { StoreProvider, useStore } = createContext({
  Game: new GameStore(FRUITS_POSITION_INTERVAL),
});
