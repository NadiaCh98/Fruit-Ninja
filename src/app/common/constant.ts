import { StartMenuItem } from './../game/models/startMenu';
export const SCENE_SIZE = 9;
export const ATTEMPS = 3;

export enum Fruits {
    apple
};

export enum FruitSpeed {
    Low = 2.8,
    Average = 3,
    Fast = 3.4
}

export enum Game {
    Classic = 'Classic',
    Dzen = 'Dzen'
}

export const START_MENU: StartMenuItem[] = [
    {
        mode: Game.Classic,
        fruit: 'apple',
        
    },
    {
        mode: Game.Dzen,
        fruit: 'apple'
    }
]