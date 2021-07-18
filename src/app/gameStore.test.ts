import { times } from 'lodash';
import {
  FRUITS_POSITION_INTERVAL,
  GameMode,
  GAME_CONFIG,
  MIN_CUT_COMBO,
} from './common/constant';
import { GeneratableFruit } from './game/models/fruitData';
import { BestScore } from './game/models/game';
import { GameStore, INIT_FRUITS } from './gameStore';

describe('Gane Store', () => {
  let store: GameStore;
  beforeEach(() => {
    store = new GameStore(FRUITS_POSITION_INTERVAL);
  });

  test('asserts store values has init values', () => {
    expect(store.gameId).toBe(0);
    expect(store.gameMode).toBeUndefined();
    expect(store.attemps).toBeNull();
    expect(store.onPause).toBe(false);
    expect(store.score).toBe(0);
    expect(store.gameTime).toBeNull();
    expect(store.nextFruits).toEqual(INIT_FRUITS);
    expect(store['currentIteraction']).toBe(0);
    expect(store['generatorFruits']).toBeUndefined();
  });

  describe('Game Mode', () => {
    const modes = Object.keys(GameMode) as GameMode[];
    test.each(modes)(
      'asserts store values has %s config values if invoke updateGameMode()',
      (mode) => {
        store.updateGameMode(mode);
        const config = GAME_CONFIG[mode];

        expect(store.gameMode).toEqual(config);
        expect(store.attemps).toBe(config.attempts);
        expect(store.gameTime).toBe(config.timer);
        expect(store.nextFruits).toEqual(INIT_FRUITS);
        expect(store.onPause).toBe(false);
        expect(store.score).toBe(0);
        expect(store['currentIteraction']).toBe(0);
        expect(store.gameId).not.toBe(0);
      }
    );
  });

  it('asserts store onPause value changes on opposite one if invoke pause()', () => {
    const value = false;
    store.onPause = value;
    store.pause();
    expect(store.onPause).not.toBe(value);
  });

  describe('Exit and replay', () => {
    const mode = GameMode.Classic;
    const config = GAME_CONFIG[mode];

    beforeEach(() => {
      store.updateGameMode(mode);
      times(3).forEach(() => store.generateNewFruits());

      expect(store.gameMode).toEqual(config);
      expect(store['currentIteraction']).toBe(3);
      expect(store.nextFruits.fruits).not.toHaveLength(0);
    });

    it('asserts store values is init values if invoke exitFromCurrentMode()', () => {
      store.exitFromCurrentMode();
      expect(store.gameId).toBe(0);
      expect(store.gameMode).toBeUndefined();
      expect(store.attemps).toBeNull();
      expect(store.onPause).toBe(false);
      expect(store.score).toBe(0);
      expect(store.gameTime).toBeNull();
      expect(store.nextFruits).toEqual(INIT_FRUITS);
      expect(store['currentIteraction']).toBe(0);
      expect(store['generatorFruits']).toBeUndefined();
    });

    it('asserts store values is mode config values if invoke replay()', () => {
      store.replay();
      expect(store.gameMode).toEqual(config);
      expect(store.attemps).toBe(config.attempts);
      expect(store.gameTime).toBe(config.timer);
      expect(store.nextFruits).toEqual(INIT_FRUITS);
      expect(store.onPause).toBe(false);
      expect(store.score).toBe(0);
      expect(store['currentIteraction']).toBe(0);
      expect(store.gameId).not.toBe(0);
    });
  });

  describe('Attemps', () => {
    let attemps = store?.attemps;

    it('asserts that attemps is null if game mode is dzen', () => {
      store.updateGameMode(GameMode.Dzen);

      store.decrementAttemps('apple');
      expect(store.attemps).toBeNull();
    });

    describe('Classic Mode', () => {
      beforeEach(() => {
        store.updateGameMode(GameMode.Classic);
        attemps = store.gameMode!.attempts as number;
      });

      it('asserts that attemps decreased by 1 if invoke decrementAttemps(some fruit)', () => {
        store.decrementAttemps('apple');
        expect(store.attemps).toBe(attemps! - 1);
      });

      it('asserts that attemps is the same if invoke decrementAttemps(bomb)', () => {
        store.decrementAttemps('bomb');
        expect(store.attemps).toBe(attemps);
      });

      it('asserts that attemps is 0 if invoke updateScore(fruits have bomb)', () => {
        store.updateScore(['banana', 'pear', 'bomb']);
        expect(store.attemps).toBe(0);
      });

      it('asserts that attemps is 0 if invoke decrementAttemps() and store attemps is already 0', () => {
        store.updateScore(['bomb']);
        store.decrementAttemps('apple');
        expect(store.attemps).toBe(0);
      });
    });
  });

  describe('Score', () => {
    it('asserts that score is the same if cutting fruits have bomb', () => {
      const actualScore = store.score;
      const fruits: GeneratableFruit[] = ['apple', 'banana', 'bomb'];
      store.updateScore(fruits);

      expect(actualScore).toEqual(actualScore);
    });

    it(`asserts that score is fruits amount * 2 if it is greater than or ${MIN_CUT_COMBO}`, () => {
      const fruits: GeneratableFruit[] = ['apple', 'banana', 'banana', 'pear'];
      store.updateScore(fruits);

      expect(store.score).toEqual(fruits.length * 2);
    });

    it(`asserts that score increase by cutting fruits amount if fruits don't have bomb and less than ${MIN_CUT_COMBO}`, () => {
      let fruits: GeneratableFruit[] = ['apple', 'banana'];
      const score1 = fruits.length;
      store.updateScore(fruits);

      expect(store.score).toEqual(score1);

      fruits = ['apple', 'banana', 'pear'];
      const score2 = fruits.length * 2;
      store.updateScore(fruits);

      expect(store.score).toEqual(score1 + score2);
    });
  });

  describe('Game Time', () => {
    it('asserts that game time is null if game mode is classic', () => {
      store.updateGameMode(GameMode.Classic);
      expect(store.gameTime).toBeNull();
      store.updateGameTime();
      expect(store.gameTime).toBeNull();
    });

    it('asserts that game time decrease by 1000 if game mode is dzen', () => {
      store.updateGameMode(GameMode.Dzen);
      const value = store.gameTime;
      expect(store.gameTime).not.toBeNull();
      store.updateGameTime();
      expect(store.gameTime).toBe(value! - 1000);
    });
  });

  describe('Active Game', () => {
    it('asserts that isActiveGame is false if game mode is classic and attemps is 0', () => {
      store.updateGameMode(GameMode.Classic);
      expect(store.isActiveGame).toBe(true);
      store.updateScore(['bomb', 'apple']);
      expect(store.isActiveGame).toBe(false);
    });

    it('asserts that isActiveGame is false if game mode is dzen and gameTime is 0', () => {
      store.updateGameMode(GameMode.Dzen);
      expect(store.isActiveGame).toBe(true);
      times(store.gameTime! / 1000).forEach(() => store.updateGameTime());
      expect(store.isActiveGame).toBe(false);
    });
  });

  describe('Best Score', () => {
    it('asserts that best score has 0 values initially', () => {
      const initBestScore: BestScore = {
        Classic: 0,
        Dzen: 0,
      };
      expect(store.bestScore).toEqual(initBestScore);
    });

    it('asserts that best score is actual score of current game mode if invoke updatScore() and previous value is the same as init', () => {
      store.updateGameMode(GameMode.Classic);
      expect(store.score).toBe(0);
      expect(store.bestScoreByGameMode).toBe(0);

      const fruits: GeneratableFruit[] = ['apple', 'banana'];
      store.updateScore(fruits);

      expect(store.score).toBe(fruits.length);
      expect(store.bestScoreByGameMode).toBe(store.score);
    });

    it('asserts that best score isn\'t changed of current game mode if invoke updatScore() and score is less than best score', () => {
      store.updateGameMode(GameMode.Classic);
      expect(store.score).toBe(0);
      expect(store.bestScoreByGameMode).not.toBe(0);

      let fruits: GeneratableFruit[] = ['apple', 'banana', 'pear', 'lemon'];
      const scoreGame1 = fruits.length * 2;
      store.updateScore(fruits);

      expect(store.score).toBe(scoreGame1);
      expect(store.bestScoreByGameMode).toBe(store.score);

      store.updateGameMode(GameMode.Classic);

      fruits = ['apple', 'banana', 'pear'];
      const scoreGame2 = fruits.length * 2;
      store.updateScore(fruits);

      expect(store.score).toBe(scoreGame2);
      expect(store.bestScoreByGameMode).toBe(scoreGame1);
    });
  });
});
