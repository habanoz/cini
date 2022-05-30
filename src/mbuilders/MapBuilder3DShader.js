import MapBuilder3DBase from './MapBuilder3DBase';
import ResourceLoader from '../loaders/ResourceLoader';
import { zoomToNTiles } from '../utils/TilingUtils';
import appConfiguration from '../utils/AppConfiguration';
import { ShaderMaterial, Mesh, PlaneGeometry, Box3 } from 'three';
import heightVertShader from './shaders/heightVert';
import textureFragShader from './shaders/textureFrag';
import textureHeightShader from './shaders/heightFrag';

class MapBuilder3DShader extends MapBuilder3DBase {
    constructor(controls) {
        super(controls);

        this.noBumpTex = null;

        this.tileGeometries = [];
    }

    switch() {
        super.switch();
        if (this.tileGeometries.length == 0) {
            for (let zoom = 0; zoom <= appConfiguration.maxZoom; zoom++) {
                const nTiles = zoomToNTiles(zoom);
                const segments = appConfiguration.tileDimension - 1;

                this.tileGeometries.push(new PlaneGeometry(appConfiguration.sceneWidth / nTiles, appConfiguration.sceneHeight / nTiles, segments, segments));
            }
        }

        if (this.noBumpTex == null) {
            this.noBumpTex = ResourceLoader.loadTex('black.jpg');
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