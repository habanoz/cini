import MapBuilder3DShaderBase from './MapBuilder3DShaderBase';
import ResourceLoader from '../loaders/ResourceLoader';
import fragShader from './shaders/textureFrag';

class MapBuilder3DShader extends MapBuilder3DShaderBase {
    constructor(controls) {
        super(controls);

        this.noBumpTex = null;

        this.tileGeometries = [];
    }


    buildMat(aTile) {
        const mat2d = super.buildMat(aTile);
        mat2d.uniforms['satTexture'] = { type: "t", value: this.noBumpTex };

        ResourceLoader.loadSat(
            aTile,
            function (texture) {
                mat2d.uniforms['satTexture'] = { type: "t", value: texture };
            }
        );

        return mat2d;
    }

    getFragmentShader() {
        return fragShader;
    }
}

export default MapBuilder3DShader;