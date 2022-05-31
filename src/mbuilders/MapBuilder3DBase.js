import MapBuilderBase from './MapBuilderBase';
import { Box3 } from 'three';

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

        if (level >= zoom || this.isTooFarOff(tile)) {
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

    isTooFarOff(tile) {
        return Math.abs(tile.centerX - this.controls.target.x) / tile.width > this.distantTilesThreshold ||
            Math.abs(tile.centerY - this.controls.target.y) / tile.height > this.distantTilesThreshold;
    }
}

export default MapBuilder3DBase;