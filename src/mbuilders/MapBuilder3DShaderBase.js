import MapBuilder3DBase from './MapBuilder3DBase';
import ResourceLoader from '../loaders/ResourceLoader';
import { zoomToNTiles } from '../utils/TilingUtils';
import appConfiguration from '../utils/AppConfiguration';
import { ShaderMaterial, Mesh, PlaneGeometry } from 'three';
import heightVertShader from './shaders/heightVert';

class MapBuilder3DShaderBase extends MapBuilder3DBase {
    constructor(controls, mapCanvas) {
        super(controls, mapCanvas);
        
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
        const scope = this;
        const uniforms = {
            bumpScale: { type: "f", value: appConfiguration.bumpScale * 7 },
            bumpTexture: { type: "t", value: this.noBumpTex }
        };
        
        const mat2d = new ShaderMaterial(
            {
                uniforms: uniforms,
                vertexShader: heightVertShader,
                fragmentShader: this.getFragmentShader()
            }
        );

        ResourceLoader.loadDem(
            aTile.x, aTile.y, aTile.zoom,
            function (texture) {
                uniforms['bumpTexture'] = { type: "t", value: texture };
                scope.mapCanvas.triggerRender();
            }
        );

        return mat2d;
    }

    getFragmentShader() {
        console.error("Not implemented: getFragmentShader");
    }

    buildMesh(tile) {
        const gridPlaneGeometry = this.tileGeometries[tile.zoom];
        const planeGrid = new Mesh(gridPlaneGeometry, this.buildMat(tile));

        planeGrid.position.x = tile.centerX;
        planeGrid.position.y = tile.centerY;
        planeGrid.position.z = -150;

        planeGrid.visible = false;

        return planeGrid;
    }
}

export default MapBuilder3DShaderBase;