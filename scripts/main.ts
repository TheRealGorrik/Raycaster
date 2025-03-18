
// Declare THREE as a global (from CDN)
declare const THREE: any;

// Player interface
interface Player {
    x: number;
    y: number;
    angle: number;
    speed: number;
    turnSpeed: number;
}

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Player properties
const player: Player = {
    x: 2,
    y: 2,
    angle: 0,
    speed: 0.01,
    turnSpeed: 0.05
};

// Simple 2D map (1 = wall, 0 = empty)
const map: number[][] = [
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
];
const mapWidth: number = map[0].length;
const mapHeight: number = map.length;

// Create a simple texture for walls (checkerboard pattern)
// const textureCanvas = document.createElement('canvas');
// textureCanvas.width = 64;
// textureCanvas.height = 64;
// const textureCtx = textureCanvas.getContext('2d') as CanvasRenderingContext2D;
// for (let y = 0; y < 64; y++) {
//     for (let x = 0; x < 64; x++) {
//         textureCtx.fillStyle = (x % 2 === y % 2) ? '#808080' : '#606060';
//         textureCtx.fillRect(x, y, 1, 1);
//     }
// }
// const wallTexture = new THREE.CanvasTexture(textureCanvas);

// Floor and ceiling planes
const floorGeometry = new THREE.PlaneGeometry(2, 2);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0x0f0f0f });
const floorPlane = new THREE.Mesh(floorGeometry, floorMaterial);
const ceilingPlane = new THREE.Mesh(floorGeometry, ceilingMaterial);
floorPlane.position.set(0, -0.5, -1);
ceilingPlane.position.set(0, 1.5, -1);
scene.add(floorPlane);
scene.add(ceilingPlane);

// Raycasting setup
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const fov = 75 * (Math.PI / 180);
const rayCount = Math.floor(screenWidth / 2);
const wallMaterial = new THREE.MeshBasicMaterial({ color: "red" });//({ mesh: textureCanvas });
const wallGeometry = new THREE.PlaneGeometry(1 / rayCount, 1);
const wallStrips: any[] = [];

for (let i = 0; i < rayCount; i++) {
    const wallStrip = new THREE.Mesh(wallGeometry, wallMaterial);
    wallStrip.position.z = -1;
    wallStrips.push(wallStrip);
    scene.add(wallStrip);
}

// Keyboard controls
const keys: { [key: string]: boolean } = {};
document.addEventListener('keydown', (e: KeyboardEvent) => {
    keys[e.key] = true;
    if (e.key === 'Escape') {
        document.exitPointerLock();
    }
});
document.addEventListener('keyup', (e: KeyboardEvent) => keys[e.key] = false);

// Mouse controls
let mouseX: number = 0;
let isLocked: boolean = false;

document.addEventListener('mousemove', (e: MouseEvent) => {
    if (isLocked) {
        mouseX = e.movementX;
    }
});

// Pointer lock controls
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isLocked = document.pointerLockElement === renderer.domElement;
});

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

// Minimap setup (larger size)
const minimapSize: number = 200; // Increased from 100 to 200
const minimapCanvas = document.createElement('canvas');
minimapCanvas.id = 'minimap';
minimapCanvas.width = minimapSize;
minimapCanvas.height = minimapSize;
document.body.appendChild(minimapCanvas);
const minimapCtx = minimapCanvas.getContext('2d') as CanvasRenderingContext2D;
const cellSize: number = minimapSize / mapWidth;

interface Ray {
    x: number;
    y: number;
    angle: number;
    distance: number;
}

let rays: Ray[] = [];

function drawMinimap(): void {
    minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    minimapCtx.fillRect(0, 0, minimapSize, minimapSize);

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            minimapCtx.fillStyle = map[y][x] === 1 ? '#808080' : '#404040';
            minimapCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    const playerX = player.x * cellSize;
    const playerY = player.y * cellSize;
    const playerAngle = player.angle;

    minimapCtx.fillStyle = 'red';
    minimapCtx.beginPath();
    minimapCtx.arc(playerX, playerY, cellSize / 4, 0, Math.PI * 2);
    minimapCtx.fill();

    minimapCtx.strokeStyle = 'red';
    minimapCtx.lineWidth = 2;
    minimapCtx.beginPath();
    minimapCtx.moveTo(playerX, playerY);
    minimapCtx.lineTo(
        playerX + Math.sin(playerAngle) * cellSize / 2,
        playerY + Math.cos(playerAngle) * cellSize / 2
    );
    minimapCtx.stroke();

    // Draw rays
    minimapCtx.strokeStyle = 'yellow';
    minimapCtx.lineWidth = 1;
    rays.forEach(ray => {
        minimapCtx.beginPath();
        minimapCtx.moveTo(playerX, playerY);
        minimapCtx.lineTo(
            playerX + Math.sin(ray.angle) * ray.distance * cellSize,
            playerY + Math.cos(ray.angle) * ray.distance * cellSize
        );
        minimapCtx.stroke();
    });
}

function isCollision(x: number, y: number): boolean {
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);

    if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) {
        return true;
    }
    return map[mapY][mapX] === 1;
}

function castRays(): void {
    const rayAngleStep = fov / rayCount;
    const halfFov = fov / 2;
    rays = []; // Reset rays array for minimap

    for (let i = 0; i < rayCount; i++) {
        const rayAngle = player.angle - halfFov + rayAngleStep * i;
        const rayDirX = Math.sin(rayAngle);
        const rayDirY = Math.cos(rayAngle);

        let mapX = Math.floor(player.x);
        let mapY = Math.floor(player.y);

        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);

        let stepX: number, stepY: number;
        let sideDistX: number, sideDistY: number;

        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (player.x - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1 - player.x) * deltaDistX;
        }
        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (player.y - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1 - player.y) * deltaDistY;
        }

        let hit = false;
        let side: number = 0;
        let distance: number;

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
            if (isCollision(mapX, mapY)) {
                hit = true;
            }
        }

        if (side === 0) {
            distance = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
        } else {
            distance = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
        }

        // const correctedDistance = distance * Math.cos(rayAngle - player.angle);
        // const wallHeight = (screenHeight / correctedDistance);

        // const wallStrip = wallStrips[i];
        // wallStrip.scale.set(1, wallHeight, 1);
        // wallStrip.position.set(
        //     (i - rayCount / 2) / (rayCount / 2),
        //     0,
        //     -1
        // );
        // wallStrip.visible = true;

        // Store ray for minimap
        rays.push({
            x: mapX + (side === 0 ? (1 - stepX) / 2 : 0),
            y: mapY + (side === 1 ? (1 - stepY) / 2 : 0),
            angle: rayAngle,
            distance: distance
        });
    }
}

function updatePlayer(): void {
    if (isLocked) {
        player.angle += mouseX * 0.002;
    }
    mouseX = 0;

    const forwardX = Math.sin(player.angle);
    const forwardZ = Math.cos(player.angle);
    const strafeX = Math.sin(player.angle + Math.PI / 2);
    const strafeZ = Math.cos(player.angle + Math.PI / 2);

    let newX = player.x;
    let newY = player.y;

    if (keys['w'] || keys['ArrowUp']) {
        newX += forwardX * player.speed;
        newY += forwardZ * player.speed;
    }
    if (keys['s'] || keys['ArrowDown']) {
        newX -= forwardX * player.speed;
        newY -= forwardZ * player.speed;
    }
    if (keys['a']) {
        newX -= strafeX * player.speed;
        newY -= strafeZ * player.speed;
    }
    if (keys['d']) {
        newX += strafeX * player.speed;
        newY += strafeZ * player.speed;
    }

    if (!isCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }

    camera.position.set(0, 0.5, 0);
    camera.rotation.y = 0;
}

function renderWalls() {
    for (let i = 0; i < rayCount; i++) {
        const ray = rays[i];
        const correctedDistance = ray.distance * Math.cos(ray.angle - player.angle);
        const wallHeight = (screenHeight / correctedDistance);

        const wallStrip = wallStrips[i];
        wallStrip.scale.set(2, wallHeight * 0.001, 1);
        wallStrip.position.set(
            (i - rayCount / 2) / (rayCount / 2),
            0.5,
            -1
        );
        wallStrip.visible = true;
        wallStrip.position.z = -1;
        scene.add(wallStrip);
    }
}

function animate(): void {
    requestAnimationFrame(animate);
    updatePlayer();
    castRays();
    renderWalls();
    renderer.render(scene, camera);
    drawMinimap();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();