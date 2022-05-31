import MapBuilder3DShaderBase from './MapBuilder3DShaderBase';
import fragShader from './shaders/heightFrag';

class MapBuilder3DShaderColor extends MapBuilder3DShaderBase {
    constructor(controls) {
        super(controls);
    }

    getFragmentShader() {
        return fragShader;
    }
}

export default MapBuilder3DShaderColor;