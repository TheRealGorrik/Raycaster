import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import { Player } from "./types/Player";
import { PlayerProperties } from "./properties";
import { Level } from "./types/Level";
import { ControlManager } from "./control-manager";
import { LevelManager } from "./levels/level-manager";
import { PlayerManager } from "./player/player-manager";
import { MinimapManager } from "./levels/minimap";

export class GameManager {

    private static instance: GameManager;
    minimapManager: MinimapManager;

    private constructor() { }

    static getInstance() {
        if (!this.instance) {
            this.instance = new GameManager();
        }
        return this.instance;
    }

    start = () => {
        this.initializeGame();
        this.animate();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    player: Player;
    level: Level;
    controlManager: ControlManager;
    levelManager: LevelManager;
    playerManager: PlayerManager;

    private initializeGame = () => {

        // Add instructions
        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.top = '10px';
        instructions.style.left = '10px';
        instructions.style.color = 'white';
        instructions.style.background = 'rgba(0, 0, 0, 0.7)';
        instructions.style.padding = '5px';
        instructions.innerHTML = 'Click to start<br>ESC to release mouse';
        document.body.appendChild(instructions);

        // Scene setup
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Player properties
        this.player = {
            x: 2,
            y: 2,
            angle: 0,
            speed: PlayerProperties.defaultSpeed,
            turnSpeed: 0.05
        };

        this.level = new Level([
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]);

        this.controlManager = new ControlManager(this);
        this.levelManager = new LevelManager(this);
        this.minimapManager = new MinimapManager(this);
        this.playerManager = new PlayerManager(this);
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        // for (let i = 0; i < Object.keys(this.animationEvents).length; i++) {
        //     this.animationEvents[i]();
        // }
        this.playerManager.animate();
        this.levelManager.animate();
        this.renderer.render(this.scene, this.camera);
        this.minimapManager.animate();
    }
}

// export type AnimationEvent = () => void;