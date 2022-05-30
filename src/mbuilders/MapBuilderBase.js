import ResourceLoader from '../loaders/ResourceLoader';
import appConfiguration from '../utils/AppConfiguration';
import ATile from '../ATile';
class MapBuilderBase {
    
    constructor(controls) {
        if (new.target === MapBuilderBase) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }

        this.controls = controls;
        this.defaultTex = ResourceLoader.loadTex('water512.jpg');
        this.rootTile = new ATile(-appConfiguration.sceneWidthHalf, -appConfiguration.sceneHeightHalf, appConfiguration.sceneWidth, appConfiguration.sceneHeight, 0);
    }

    switch() {
        console.log("Abstract switch: Not expected");
    }

    render() {
        console.log("Abstract render: Not expected");
    }

    findVisible(tile, zoom, level, viewRect, visibleTiles) {
        console.log("Abstract findVisible: Not expected");
    }
}

export default MapBuilderBase;