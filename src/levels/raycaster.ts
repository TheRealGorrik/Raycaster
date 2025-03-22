
import { GameManager } from "../game-manager";
import { IAnimatible } from "../interfaces/IGameManagerItem";
import { GameEngineProperties, ScreenProperties } from "../properties";
import { Level } from "../types/Level";
import { Player } from "../types/Player";
import { Ray } from "../types/Ray";
import { isCollision } from "../utils/collision-detector";

export class RayCaster implements IAnimatible {

    rayAngleStep: number;
    halfFov: number;
    rays: Ray[];
    player: Player;
    level: Level;

    constructor(gameManager: GameManager) {
        this.level = gameManager.level;
        this.player = gameManager.player;
    }

    animate = () => {
        this.rayAngleStep = ScreenProperties.fov / GameEngineProperties.rayCount;
        this.halfFov = ScreenProperties.fov / 2;
        this.rays = [];

        for (let i = 0; i < GameEngineProperties.rayCount; i++) {
            const rayAngle = this.player.angle - this.halfFov + this.rayAngleStep * i;
            const rayDirX = Math.sin(rayAngle);
            const rayDirY = Math.cos(rayAngle);

            let mapX = Math.floor(this.player.x);
            let mapY = Math.floor(this.player.y);

            const deltaDistX = Math.abs(1 / rayDirX);
            const deltaDistY = Math.abs(1 / rayDirY);

            let stepX: number, stepY: number;
            let sideDistX: number, sideDistY: number;

            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (this.player.x - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1 - this.player.x) * deltaDistX;
            }
            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (this.player.y - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1 - this.player.y) * deltaDistY;
            }

            let hit = false;
            let side: number = 0;
            let distance: number;
            let u: number = 0;

            while (!hit) {
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }
                if (isCollision(mapX, mapY, this.level)) {
                    hit = true;
                }
            }

            if (side === 0) {
                distance = (mapX - this.player.x + (1 - stepX) / 2) / rayDirX;
                // For a vertical wall (X-direction), the u-coordinate is the fractional part of the Y position
                const hitY = this.player.y + distance * rayDirY;
                u = hitY - Math.floor(hitY); // Fractional part of Y (0 to 1 across the wall block)
                // Adjust u based on the direction of the ray to ensure correct texture orientation
                if (rayDirX > 0) {
                    // Hitting the left side of the wall (east-facing), u should go from 0 to 1
                    u = u;
                } else {
                    // Hitting the right side of the wall (west-facing), u should go from 1 to 0
                    u = 1 - u;
                }
            } else {
                distance = (mapY - this.player.y + (1 - stepY) / 2) / rayDirY;
                // For a horizontal wall (Y-direction), the u-coordinate is the fractional part of the X position
                const hitX = this.player.x + distance * rayDirX;
                u = hitX - Math.floor(hitX); // Fractional part of X (0 to 1 across the wall block)
                // Adjust u based on the direction of the ray to ensure correct texture orientation
                if (rayDirY > 0) {
                    // Hitting the top side of the wall (south-facing), u should go from 0 to 1
                    u = u;
                } else {
                    // Hitting the bottom side of the wall (north-facing), u should go from 1 to 0
                    u = 1 - u;
                }
            }

            if (side === 0) {
                distance = (mapX - this.player.x + (1 - stepX) / 2) / rayDirX;
            } else {
                distance = (mapY - this.player.y + (1 - stepY) / 2) / rayDirY;
            }

            // Store ray for minimap
            this.rays.push({
                x: mapX + (side === 0 ? (1 - stepX) / 2 : 0),
                y: mapY + (side === 1 ? (1 - stepY) / 2 : 0),
                angle: rayAngle,
                distance: distance,
                u: u,
                side: side
            });
        }
    }
}