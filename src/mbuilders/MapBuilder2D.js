import MapBuilderBase from './MapBuilderBase';
import ResourceLoader from '../loaders/ResourceLoader';
import { zoomToNTiles } from '../utils/TilingUtils';
import appConfiguration from '../utils/AppConfiguration';
import { MeshBasicMaterial, Mesh, PlaneGeometry, Box3 } from 'three';

class MapBuilder2D extends MapBuilderBase {
    constructor(defaultTex, mapBuilder) {
        super();
        this.defaultTex = defaultTex;
        this.mapBuilder = mapBuilder;
        this.tileGeometries = [];

        for (let zoom = 0; zoom <= appConfiguration.maxZoom; zoom++) {
            const nTiles = zoomToNTiles(zoom);

            this.tileGeometries.push(new PlaneGeometry(appConfiguration.sceneWidth / nTiles, appConfiguration.sceneHeight / nTiles, 1, 1));
        }
    }

    findVisible(tile, zoom, level, viewRect, visibleTiles) {
        const box = new Box3().copy(tile.box);

        if (!viewRect.intersectsBox(box)) {
            return;
        }

        if (level >= zoom) {
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

    buildMat(aTile) {
        const mat2d = new MeshBasicMaterial({
            map: this.defaultTex,
        });
        let self = this;
        ResourceLoader.loadSat(
            aTile,
            function (texture) {
                mat2d.map = texture;
            },
            undefined
        );

        return mat2d;
    }

    buildMesh(tile) {
        const gridPlaneGeometry = this.tileGeometries[tile.zoom];
        const planeGrid = new Mesh(gridPlaneGeometry, this.buildMat(tile));

        planeGrid.position.x = tile.centerX;
        planeGrid.position.y = tile.centerY;

        planeGrid.visible = false;

        return planeGrid;
    }
}

export default MapBuilder2D;