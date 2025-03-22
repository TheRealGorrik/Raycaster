import { GameManager } from "../game-manager";
import { Level } from "../types/Level";
import { Player } from "../types/Player";
import { RayCaster } from "./raycaster";

export class MinimapManager {

    minimapCanvas: HTMLCanvasElement;
    minimapCtx: CanvasRenderingContext2D;
    cellSize: number;
    minimapSize: number;
    rayCaster: RayCaster;
    level: Level;
    player: Player;

    constructor (gameManager: GameManager) {       
        this.rayCaster = gameManager.levelManager.rayCaster;
        this.level = gameManager.level;
        this.player = gameManager.player;

        this.minimapSize = 200; 
        this.minimapCanvas = document.createElement('canvas');
        this.minimapCanvas.id = 'minimap';
        this.minimapCanvas.width = this.minimapSize;
        this.minimapCanvas.height = this.minimapSize;
        document.body.appendChild(this.minimapCanvas);
        this.minimapCtx = this.minimapCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.cellSize = this.minimapSize / this.level.mapWidth();
    }

    animate = () => {
        this.minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.minimapCtx.fillRect(0, 0, this.minimapSize, this.minimapSize);

        for (let y = 0; y < this.level.mapHeight(); y++) {
            for (let x = 0; x < this.level.mapWidth(); x++) {
                this.minimapCtx.fillStyle = this.level.map[y][x] === 1 ? '#808080' : '#404040';
                this.minimapCtx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }

        const playerX = this.player.x * this.cellSize;
        const playerY = this.player.y * this.cellSize;
        const playerAngle = this.player.angle;

        this.minimapCtx.fillStyle = 'red';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(playerX, playerY, this.cellSize / 4, 0, Math.PI * 2);
        this.minimapCtx.fill();

        this.minimapCtx.strokeStyle = 'red';
        this.minimapCtx.lineWidth = 2;
        this.minimapCtx.beginPath();
        this.minimapCtx.moveTo(playerX, playerY);
        this.minimapCtx.lineTo(
            playerX + Math.sin(playerAngle) * this.cellSize / 2,
            playerY + Math.cos(playerAngle) * this.cellSize / 2
        );
        this.minimapCtx.stroke();

        // Draw rays
        this.minimapCtx.strokeStyle = 'yellow';
        this.minimapCtx.lineWidth = 1;
        this.rayCaster.rays.forEach(ray => {
            this.minimapCtx.beginPath();
            this.minimapCtx.moveTo(playerX, playerY);
            this.minimapCtx.lineTo(
                playerX + Math.sin(ray.angle) * ray.distance * this.cellSize,
                playerY + Math.cos(ray.angle) * ray.distance * this.cellSize
            );
            this.minimapCtx.stroke();
        });
    }
}