import { Vector3, Box3 } from 'three';
import appConfiguration from './utils/AppConfiguration';
import { zoomToNTiles } from './utils/TilingUtils';

class ATile {
    constructor(left, bottom, width, height, zoom) {
        this.left = left;
        this.bottom = bottom;

        this.centerX = left + width / 2;
        this.centerY = bottom + height / 2;

        this.width = width;
        this.height = height;

        this.box = new Box3();
        this.box.setFromCenterAndSize(new Vector3(this.centerX, this.centerY, 0), new Vector3(width, height, 0));

        this.zoom = zoom;

        this.plane = null;
        this.showBorder = false;

        this.children = null;
        this.renderMode = 0;

        const nTiles = zoomToNTiles(this.zoom);
        const tileWidth = appConfiguration.sceneWidth / nTiles;
        const tileHeight = appConfiguration.sceneHeight / nTiles;


        this.x = Math.floor((this.left + appConfiguration.sceneWidthHalf) / tileWidth);
        this.y = Math.floor((this.bottom + appConfiguration.sceneHeightHalf) / tileHeight);

    }

    show() {
        // this.plane.frustumCulled = false;
        this.plane.visible = true;
    }

    hide() {
        // this.plane.frustumCulled = true;
        if ( this.plane != null){
            this.plane.visible = false;
        }
        
    }

    split() {
        if (this.zoom == appConfiguration.maxZoom) {
            this.children = [];
            return;
        }

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        const tile00 = new ATile(this.left/*		*/, this.bottom/*		  */, halfWidth, halfHeight, this.zoom + 1);
        const tile01 = new ATile(this.left + halfWidth, this.bottom/*		  */, halfWidth, halfHeight, this.zoom + 1);
        const tile10 = new ATile(this.left/*		*/, this.bottom + halfHeight, halfWidth, halfHeight, this.zoom + 1);
        const tile11 = new ATile(this.left + halfWidth, this.bottom + halfHeight, halfWidth, halfHeight, this.zoom + 1);

        this.children = [tile00, tile01, tile10, tile11];
    }
}

export default ATile;