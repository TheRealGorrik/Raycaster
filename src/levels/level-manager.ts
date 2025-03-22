import { GameManager } from "../game-manager";
import { IAnimatible } from "../interfaces/IGameManagerItem";
import { createCeiling } from "./ceiling";
import { createFloor } from "./floor";
import { RayCaster } from "./raycaster";
import { WallManager } from "./walls";

export class LevelManager implements IAnimatible {
    
    wallManager: WallManager;
    rayCaster: RayCaster;
    gameManager: GameManager;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
        const scene = gameManager.scene;
        createCeiling(scene);
        createFloor(scene);
        this.rayCaster = new RayCaster(gameManager);
        this.wallManager = new WallManager(gameManager, this.rayCaster);
    }

    animate = () => {
        this.rayCaster.animate();
        this.wallManager.animate();
    }
}