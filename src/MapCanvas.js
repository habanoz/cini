import MapBuilder2D from "./mbuilders/MapBuilder2D";
import { Matrix4, Frustum, Group } from 'three';
import appConfiguration from './utils/AppConfiguration';
import ATile from './ATile';
import ResourceLoader from './loaders/ResourceLoader';

class MapCanvas {
    constructor(scene, camera, controls) {
        this.dirty = false;
        this.visibleTiles = [];
        this.mapBuilder = null;
        this.frustum = new Frustum();
        this.ground = new Group();

        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.rootTile = null;
        this.defaultTex = null;
    }

    build() {
        this.defaultTex = ResourceLoader.loadTex('water512.jpg');
        this.mapBuilder = new MapBuilder2D(this.defaultTex, null);

        this.scene.add(this.ground);

        this.rootTile = new ATile(-appConfiguration.sceneWidthHalf, -appConfiguration.sceneHeightHalf, appConfiguration.sceneWidth, appConfiguration.sceneHeight, 0);
    }

    render() {
        // if (!this.dirty) return;

        this.visibleTiles.forEach(tile => tile.hide());
        this.visibleTiles = [];

        const matrix = new Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);//.multiply(new THREE.Matrix4().makeTranslation(5000,0,100));
        this.frustum.setFromProjectionMatrix(matrix);

        this.mapBuilder.findVisible(this.rootTile, this.controls.zoomLevel, 0, this.frustum, this.visibleTiles);

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

    setRenderer(renderer) {
        this.mapBuilder = renderer
    }
}

export default MapCanvas;
