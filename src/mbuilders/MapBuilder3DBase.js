import MapBuilderBase from './MapBuilderBase';
import ResourceLoader from '../loaders/ResourceLoader';
import { zoomToNTiles } from '../utils/TilingUtils';
import appConfiguration from '../utils/AppConfiguration';
import { MeshBasicMaterial, Mesh, PlaneGeometry, Box3 } from 'three';

class MapBuilder3DBase extends MapBuilderBase {
    distantTilesThreshold = 2;

    constructor(controls) {
        super(controls);
    }

    switch() {
        this.controls.maxPolarAngle = 90;
    }

    findVisible(tile, zoom, level, viewRect, visibleTiles) {
        const box = new Box3().copy(tile.box);

        if (!viewRect.intersectsBox(box)) {
            return;
        }

        if (level >= zoom || Math.abs(tile.centerX - this.controls.target.x) / tile.width > this.distantTilesThreshold || Math.abs(tile.centerY - this.controls.target.y) / tile.height > this.distantTilesThreshold) {
            visibleTiles.push(tile);
        } else {
            if (tile.children == null) {
                tile.split();
            }

            if (tile.children.length == 0) {
                visibleTiles.push(tile);
            } else {
                for (const child of tile.children) {
                    this.findVisible(child, zoom, level + 1, viewRect, visibleTiles);
                }
            }
        }
    }
}

export default MapBuilder3DBase;