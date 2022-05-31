import MapBuilder3DBase from './MapBuilder3DBase';
import ResourceLoader from '../loaders/ResourceLoader';
import { zoomToNTiles } from '../utils/TilingUtils';
import appConfiguration from '../utils/AppConfiguration';
import { MeshBasicMaterial, Mesh, PlaneGeometry, Box3 } from 'three';

class MapBuilder3DMesh extends MapBuilder3DBase {
    constructor(controls) {
        super(controls);
    }

    buildMat(aTile) {
        const mat2d = new MeshBasicMaterial({
            map: this.defaultTex,
        });

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
        const nTiles = zoomToNTiles(tile.zoom);
        const segments = appConfiguration.tileDimension - 1;

        const gridPlaneGeometry = new PlaneGeometry(appConfiguration.sceneWidth / nTiles, appConfiguration.sceneHeight / nTiles, segments, segments);
        const planeGrid = new Mesh(gridPlaneGeometry, this.buildMat(tile));
        const self = this;

        ResourceLoader.loadDem(tile.x, tile.y, tile.zoom,
            function (bTexture) {
                ResourceLoader.loadDem(tile.x - 1, tile.y, tile.zoom,
                    function (lTexture) {
                        ResourceLoader.loadDem(tile.x, tile.y + 1, tile.zoom,
                            function (tTexture) {
                                self.doMap(tile, planeGrid, gridPlaneGeometry, bTexture, lTexture, tTexture);
                            },
                            function (terr) {
                                self.doMap(tile, planeGrid, gridPlaneGeometry, bTexture, lTexture, null);
                            }
                        );
                    },
                    function (lerr) {
                        self.doMap(tile, planeGrid, gridPlaneGeometry, bTexture, null, null);
                    }
                );

            }
        );

        planeGrid.position.x = tile.centerX;
        planeGrid.position.y = tile.centerY;

        planeGrid.visible = false;

        return planeGrid;
    }

    doMap(tile, planeGrid, gridPlaneGeometry, bTexture, lTexture, tTexture) {

        // let pos = gridPlaneGeometry.getAttribute("position");
        const pos = gridPlaneGeometry.attributes.position;

        var hVerts = gridPlaneGeometry.parameters.heightSegments + 1;
        var wVerts = gridPlaneGeometry.parameters.widthSegments + 1;
        var index = 0;


        const canvas = document.createElement('canvas');
        canvas.width = bTexture.image.width;
        canvas.height = bTexture.image.height;

        //console.log("image %s %s - plane %s %s", canvas.width, canvas.height, wVerts, hVerts)

        const context = canvas.getContext('2d');
        context.drawImage(bTexture.image, 0, 0);
        var data = context.getImageData(0, 0, canvas.width, canvas.height);


        for (let j = 0; j < hVerts; j++) {
            for (let i = 0; i < wVerts; i++) {
                pos.setZ(index, data.data[index * 4]);
                index++;
            }
        }

        if (tTexture != null) {
            context.drawImage(tTexture.image, 0, 0);
            data = context.getImageData(0, 0, canvas.width, canvas.height);

            index = 0;
            var offset = hVerts * wVerts - 256;
            for (let j = 0; j < hVerts; j++) {
                pos.setZ(index, data.data[offset * 4]);
                index++;
                offset++;
            }
        }

        if (lTexture != null) {
            context.drawImage(lTexture.image, 0, 0);
            data = context.getImageData(0, 0, canvas.width, canvas.height);

            index = 0;
            offset = 0;
            for (let j = 0; j < wVerts; j++) {
                pos.setZ(index, data.data[(index + 255) * 4]);
                index += 256;
            }
        }

        pos.needsUpdate = true;
        gridPlaneGeometry.computeBoundingBox();

        //tile.box.copy(gridPlaneGeometry.boundingBox);//.applyMatrix4( planeGrid.matrixWorld );
    }
}

export default MapBuilder3DMesh;