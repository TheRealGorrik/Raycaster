
import { Level } from "../types/Level";

export const isCollision = (x: number, y: number, level:Level): boolean => {
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);

    if (mapX < 0
        || mapX >= level.mapWidth()
        || mapY < 0
        || mapY >= level.mapHeight()) {
        return true;
    }
    return level.map[mapY][mapX] === 1;
}