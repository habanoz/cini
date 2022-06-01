import { Matrix4, Frustum, Group, Fog } from 'three';
import MapBuilder2D from './mbuilders/MapBuilder2D';
import MapBuilder3DMesh from './mbuilders/MapBuilder3DMesh';
import MapBuilder3DShaderColor from './mbuilders/MapBuilder3DShaderColor';
import MapBuilder3DShaderSat from './mbuilders/MapBuilder3DShaderSat';

class MapCanvas {
    constructor(scene, camera, controls) {
        this.dirty = false;
        this.visibleTiles = [];
        this.frustum = new Frustum();
        this.ground = new Group();

        this.scene = scene;
        this.camera = camera;
        this.controls = controls;

        this.mapBuilders = this.getMapBuilders(controls);
        this.mapBuilderKey = '2D';

        this.mapBuilder = this.mapBuilders.get(this.mapBuilderKey);
        if (this.mapBuilder === 'undefined' || this.mapBuilder == null) {
            console.error("No mapBuilder found for key", this.mapBuilderKey);
        }
        this.mapBuilder.switch();
    }

    getMapBuilders(controls) {
        const mapBuilders = new Map();
        mapBuilders.set('2D', new MapBuilder2D(controls, this));
        mapBuilders.set('3DMesh', new MapBuilder3DMesh(controls, this));
        mapBuilders.set('3DShaderColor', new MapBuilder3DShaderColor(controls, this));
        mapBuilders.set('3DShaderSat', new MapBuilder3DShaderSat(controls, this));

        return mapBuilders;
    }

    build() {
        this.scene.add(this.ground);
    }

    render() {
        if (!this.dirty) return false;

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

        if (this.controls.zoomLevel > 10) {
            const color = 'lightblue';
            const near = 750;
            const far = 15_000;
            this.scene.fog = new Fog(color, near, far);
            this.scene.background = color;
        } else {
            this.scene.fog = null;
        }

        this.dirty = false;
        return true;
    }

    triggerRender() {
        this.dirty = true;
    }

    switchMapBuilder() {
        this.mapBuilder = this.mapBuilders.get(this.mapBuilderKey);
        if (this.mapBuilder === 'undefined' || this.mapBuilder == null) {
            console.error("No mapBuilder found for key", this.mapBuilderKey);
        }
        this.mapBuilder.switch();
        this.triggerRender();
    }

    getMapBuilderKeys() {
        return Array.from(this.mapBuilders.keys());
    }
}

export default MapCanvas;
