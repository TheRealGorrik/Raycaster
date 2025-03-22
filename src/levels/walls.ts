import {
    Mesh,
    PlaneGeometry,
    RepeatWrapping,
    ShaderMaterial,
    Texture,
    TextureLoader
} from "three";
import { GameEngineProperties, ScreenProperties } from "../properties";
import { normalizeBetweenTwoRanges } from "../utils/normalizeBetweenTwoRanges";
import { GameManager } from "../game-manager";
import { IAnimatible } from "../interfaces/IGameManagerItem";
import { RayCaster } from "./raycaster";
import { Player } from "../types/Player";

// Vertex shader
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment shader (updated to use texture)
const fragmentShader = `
    uniform sampler2D wallTexture;
    uniform float shadingFactor;
    uniform float uCoord; 
    varying vec2 vUv;
    void main() {
        vec2 texCoord = vec2(uCoord, vUv.y);
        vec4 texColor = texture2D(wallTexture, texCoord);
        // Apply shading based on distance
        vec3 shadedColor = texColor.rgb * (shadingFactor / 255.0);
        gl_FragColor = vec4(shadedColor, 1.0);
    }
`;

export class WallManager implements IAnimatible {

    wallStrips: Mesh[] = [];
    rayCaster: RayCaster;
    player: Player;

    constructor(gameManager: GameManager, rayCaster: RayCaster) {

        this.rayCaster = rayCaster;
        this.player = gameManager.player;
        const rayCount = GameEngineProperties.rayCount;

        // Load the brick texture
        const textureLoader = new TextureLoader();
        let wallTexture: Texture;
        try {
            wallTexture = textureLoader.load('/assets/bricks.jpg');
            wallTexture.wrapS = RepeatWrapping;
            wallTexture.wrapT = RepeatWrapping;
            wallTexture.repeat.set(0, 1); // Adjust as needed for texture scaling
        } catch (error) {
            console.error('Failed to load texture:', error);
            wallTexture = new Texture();
        }

        // Create the shader material for wall strips
        const wallGeometry = new PlaneGeometry(1 / rayCount, 1);

        for (let i = 0; i < rayCount; i++) {
            const wallMaterial = new ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: {
                    wallTexture: { value: wallTexture },
                    shadingFactor: { value: 1.0 },
                    uCoord: { value: 0.0 } // Will be updated per strip
                }
            });
            const wallStrip = new Mesh(wallGeometry, wallMaterial);
            this.wallStrips.push(wallStrip);
            gameManager.scene.add(wallStrip);
        }
    }

    animate = () => {
        const rayCount = GameEngineProperties.rayCount;
        const screenHeight = window.innerHeight;

        for (let i = 0; i < rayCount; i++) {
            const ray = this.rayCaster.rays[i];
            
            const correctedDistance = ray.distance * Math.cos(ray.angle - this.player.angle);

            // Calculate wall height using the corrected distance
            const wallHeight = (screenHeight / correctedDistance) * 1.0; // Added a scaling factor for better visibility

            const wallStrip = this.wallStrips[i];
            // Set the scale of the wall strip (width should be consistent)
            wallStrip.scale.set(2, wallHeight / screenHeight, 1); // Normalized height relative to screen height
            // Position the wall strip linearly across the screen
            const xPosition = (i / (rayCount)) * 2 - 1; // Map i from [0, rayCount-1] to [-1, 1]
            wallStrip.position.set(xPosition, 0.5, -1); // Position at z = -1
            wallStrip.visible = true;

            // const wallHeight = screenHeight / correctedDistance;

            // const wallStrip = this.wallStrips[i];
            // wallStrip.scale.set(2, wallHeight * 0.001, 0);
            // wallStrip.position.set(
            //     (i - rayCount / 2) / (rayCount / 2),
            //     0.5,
            //     -1
            // );
            wallStrip.visible = true;

            const shadingFactor = normalizeBetweenTwoRanges(wallHeight, 0, ScreenProperties.screenHeight, 0, 255);
            (wallStrip.material as ShaderMaterial).uniforms.shadingFactor.value = shadingFactor;
            (wallStrip.material as ShaderMaterial).uniforms.uCoord.value = ray.u; // Set the u-coordinate for this strip
            (wallStrip.material as ShaderMaterial).needsUpdate = true;
        }
    }

}
