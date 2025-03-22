
import { PerspectiveCamera } from "three";
import { ControlManager } from "../control-manager";
import { GameManager } from "../game-manager";
import { IAnimatible } from "../interfaces/IGameManagerItem";
import { PlayerProperties } from "../properties";
import { Level } from "../types/Level";
import { Player } from "../types/Player";
import { isCollision } from "../utils/collision-detector";

export class PlayerManager implements IAnimatible {

    player: Player;
    controlManager: ControlManager;
    level:Level;
    camera: PerspectiveCamera;

    constructor(gameManager: GameManager) {        
        this.player = gameManager.player;
        this.level = gameManager.level;
        this.camera = gameManager.camera;
        this.controlManager = gameManager.controlManager;
    }

    animate = () => { 
        if (this.controlManager.isLocked) {
            this.player.angle += this.controlManager.mouseX * 0.002;
        }
        this.controlManager.mouseX = 0;

        const forwardX = Math.sin(this.player.angle);
        const forwardZ = Math.cos(this.player.angle);
        const strafeX = Math.sin(this.player.angle + Math.PI / 2);
        const strafeZ = Math.cos(this.player.angle + Math.PI / 2);

        let newX = this.player.x;
        let newY = this.player.y;

        this.player.speed = PlayerProperties.defaultSpeed;

        if (this.controlManager.isKeyPressed('Shift')) {
            this.player.speed = PlayerProperties.sprintSpeed;
        }

        if (this.controlManager.isKeyPressed('w') || this.controlManager.isKeyPressed('ArrowUp')) {
            newX += forwardX * this.player.speed;
            newY += forwardZ * this.player.speed;
        }
        if (this.controlManager.isKeyPressed('s') || this.controlManager.isKeyPressed('ArrowDown')) {
            newX -= forwardX * this.player.speed;
            newY -= forwardZ * this.player.speed;
        }
        if (this.controlManager.isKeyPressed('a')) {
            newX -= strafeX * this.player.speed;
            newY -= strafeZ * this.player.speed;
        }
        if (this.controlManager.isKeyPressed('d')) {
            newX += strafeX * this.player.speed;
            newY += strafeZ * this.player.speed;
        }

        if (!isCollision(newX, newY, this.level)) {
            this.player.x = newX;
            this.player.y = newY;
        }

        this.camera.position.set(0, 0.5, 0);
        this.camera.rotation.y = 0;
    }
}