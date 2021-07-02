import { GameStore } from '../gameStore';
import { ATTEMPS, SCENE_SIZE } from './constant';
import { createContext } from './storeUtils';

export const { StoreProvider, useStore } = createContext({
  Game: new GameStore(SCENE_SIZE / 2, ATTEMPS),
});
