

export class Level {
    constructor(map: number[][]) {
        this.map = map;
    }
    map: number[][];
    mapWidth = () => this.map[0].length;
    mapHeight = (): number => this.map.length;
}