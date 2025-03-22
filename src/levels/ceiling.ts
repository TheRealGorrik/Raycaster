import { Scene, PlaneGeometry, MeshBasicMaterial, Mesh } from 'three';

const createCeiling = (scene: Scene) => {
    const ceilingGeometry = new PlaneGeometry(2, 2);
    const ceilingMaterial = new MeshBasicMaterial({ color: 0x0f0f0f });
    const ceilingPlane = new Mesh(ceilingGeometry, ceilingMaterial);
    ceilingPlane.position.set(0, 1.5, -1);
    scene.add(ceilingPlane);
}

export { createCeiling };