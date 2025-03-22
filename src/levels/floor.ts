import { Mesh, MeshBasicMaterial, PlaneGeometry, Scene } from "three";

const createFloor = (scene: Scene) => {
    // Floor and ceiling planes
    const floorGeometry = new PlaneGeometry(2, 2);
    const floorMaterial = new MeshBasicMaterial({ color: 0x404040 });
    const floorPlane = new Mesh(floorGeometry, floorMaterial);
    floorPlane.position.set(0, -0.5, -1);
    scene.add(floorPlane);
}

export { createFloor };