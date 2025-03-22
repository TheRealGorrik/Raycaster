
export const ScreenProperties = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    fov: 60 * (Math.PI / 180),
}

export const GameEngineProperties = {
    rayCount: Math.floor(ScreenProperties.screenWidth / 2),
}

export const PlayerProperties = {
    defaultSpeed: 0.01,
    sprintSpeed: 0.02
}