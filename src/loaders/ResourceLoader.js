import { TextureLoader } from 'three';

class ResourceLoader {
    static loader = new TextureLoader();
    
    static loadSat(aTile, onLoad, onFail) {
        const x = aTile.x;
        const y = aTile.y;
        const z = aTile.zoom;

        return ResourceLoader.loader.load(`images/eastAnatoliaSat/${z}/${x}/${y}.png`, onLoad, undefined, onFail);
    }

    static loadTex(fileName){
        return ResourceLoader.loader.load('images/'+fileName);
    }
}

export default ResourceLoader;