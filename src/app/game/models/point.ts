export interface Point {
    readonly x: number;
    readonly y: number;
}

export interface Delta extends Point{
    readonly delta: Point;
}