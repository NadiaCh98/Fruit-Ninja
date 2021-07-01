import { getRandomValue } from "../../common/services/rng";

export class GameLogic {

    constructor(private fruitPositionInterval: number) {
    }

    public generateFruitStartPosition(): number {
        return getRandomValue(-this.fruitPositionInterval, this.fruitPositionInterval);
    }

    public generateFruitEndPosition(startPosition: number): number {
        const limit = startPosition <= 0 ? 1 : -1; 
        const endPosition = getRandomValue(0, limit);
        return endPosition;
    }
}