import MapBuilderBase from './MapBuilderBase';
import ResourceLoader from '../loaders/ResourceLoader';
import { zoomToNTiles } from '../utils/TilingUtils';
import appConfiguration from '../utils/AppConfiguration';
import { ShaderMaterial, Mesh, PlaneGeometry, Box3, FileLoader } from 'three';
import heightVertShader from './shaders/heightVert';
import textureFragShader from './shaders/textureFrag';
import textureHeightShader from './shaders/heightFrag';

class MapBuilder3DShader extends MapBuilderBase {
    constructor(defaultTex, mapBuilder, controls) {
        super();
        this.defaultTex = defaultTex;
        this.mapBuilder = mapBuilder;
        this.controls = controls;
        this.fileLoader = new FileLoader();
        this.noBumpTex = ResourceLoader.loadTex('black.jpg');

        this.tileGeometries = [];
        for (let zoom = 0; zoom <= appConfiguration.maxZoom; zoom++) {
            const nTiles = zoomToNTiles(zoom);
            const segments = appConfiguration.tileDimension - 1;

            this.tileGeometries.push(new PlaneGeometry(appConfiguration.sceneWidth / nTiles, appConfiguration.sceneHeight / nTiles, segments, segments));
        }
    }

    switch() {
        this.controls.maxPolarAngle = 90;
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

        const uniforms = {
            bumpScale: { type: "f", value: appConfiguration.bumpScale },
            bumpTexture: { type: "t", value: this.noBumpTex },
            satTexture: { type: "t", value: this.defaultTex }
        };

        const mat2d = new ShaderMaterial(
            {
                uniforms: uniforms,
                vertexShader: heightVertShader,
                fragmentShader: textureHeightShader
            }
        );

        ResourceLoader.loadSat(
            aTile,
            function (texture) {
                uniforms['satTexture'] = { type: "t", value: texture };
            }
        );

        ResourceLoader.loadDem(
            aTile.x, aTile.y, aTile.zoom,
            function (texture) {
                uniforms['bumpTexture'] = { type: "t", value: texture };
            }
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

export default MapBuilder3DShader;