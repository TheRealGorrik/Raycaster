import { GameManager } from "./game-manager";

export class ControlManager {

    // Mouse controls
    mouseX: number = 0;
    isLocked: boolean = false;
    keys: { [key: string]: boolean } = {};

    constructor(gameManager: GameManager) {
        // Keyboard controls
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            this.keys[e.key] = true;
            if (e.key === 'Escape') {
                document.exitPointerLock();
            }
        });
        document.addEventListener('keyup', (e: KeyboardEvent) => (this.keys[e.key] = false));

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.isLocked) {
                this.mouseX = e.movementX;
            }
        });

        // Pointer lock controls
        gameManager.renderer.domElement.addEventListener('click', () => {
            gameManager.renderer.domElement.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === gameManager.renderer.domElement;
        });
    }

    animate = () => {
    };

    isKeyPressed = (key: string) => {
        return this.keys[key];
    };
}