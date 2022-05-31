import { Matrix4, Frustum, Group } from 'three';

class MapCanvas {
    constructor(scene, camera, controls, mapBuilders, mapBuilderKey) {
        this.dirty = false;
        this.visibleTiles = [];
        this.frustum = new Frustum();
        this.ground = new Group();

        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.mapBuilders = mapBuilders;
        this.mapBuilderKey = mapBuilderKey;

        this.mapBuilder = mapBuilders[mapBuilderKey];
        if (this.mapBuilder === 'undefined' || this.mapBuilder == null) {
            console.error("No mapBuilder found for key", mapBuilderKey);
        }
        this.mapBuilder.switch();
    }

    build() {
        this.scene.add(this.ground);
    }

    render() {
        if (!this.dirty) return;

        this.visibleTiles.forEach(tile => tile.hide());
        this.visibleTiles = [];

        const matrix = new Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);//.multiply(new THREE.Matrix4().makeTranslation(5000,0,100));
        this.frustum.setFromProjectionMatrix(matrix);

        this.mapBuilder.findVisible(this.mapBuilder.rootTile, this.controls.zoomLevel, 0, this.frustum, this.visibleTiles);

        this.visibleTiles.forEach(tile => {
            if (tile.plane == null) {
                tile.plane = this.mapBuilder.buildMesh(tile);
                this.ground.add(tile.plane);
            }
        })
        this.visibleTiles.forEach(tile => tile.show());

        this.dirty = false;
    }

    triggerRender() {
        this.dirty = true;
    }

    switchMapBuilder() {
        this.mapBuilder = this.mapBuilders[this.mapBuilderKey];
        if (this.mapBuilder === 'undefined' || this.mapBuilder == null) {
            console.error("No mapBuilder found for key", this.mapBuilderKey);
        }
        this.mapBuilder.switch();
        this.triggerRender();
    }
}

export default MapCanvas;
