import MapBuilder3DBase from './MapBuilder3DBase';
import ResourceLoader from '../loaders/ResourceLoader';
import { zoomToNTiles } from '../utils/TilingUtils';
import appConfiguration from '../utils/AppConfiguration';
import { MeshBasicMaterial, Mesh, PlaneGeometry, Box3 } from 'three';

class MapBuilder3DBufferedMesh extends MapBuilder3DBase {
    constructor(controls, mapCanvas) {
        super(controls, mapCanvas);
        this.planeGeometryBuffer = [];
    }

    switch() {
        super.switch();
        if (this.planeGeometryBuffer.length == 0) {
            for (let i = 0; i <= 500; i++) {
                const nTiles = zoomToNTiles(13);
                const segments = appConfiguration.tileDimension - 1;

                const geo = new PlaneGeometry(appConfiguration.sceneWidth / nTiles, appConfiguration.sceneHeight / nTiles, segments, segments);
                geo.userData['cache'] = 'cache';
                this.planeGeometryBuffer.push(geo);
            }
        }

        if (this.noBumpTex == null) {
            this.noBumpTex = ResourceLoader.loadTex('black.jpg');
        }
    }

    buildMat(aTile) {
        const mat2d = new MeshBasicMaterial({
            map: this.defaultTex,
        });

        const scope = this;
        ResourceLoader.loadSat(
            aTile,
            function (texture) {
                mat2d.map = texture;
                scope.mapCanvas.triggerRender();
            },
            undefined
        );

        return mat2d;
    }

    disposeMesh(tile) {
        if (tile.plane == null) return;
        const oldPlane = this.plane;
        if (tile.plane.geometry.userData.cache != undefined) {
            this.planeGeometryBuffer.push(tile.plane.geometry);
            tile.plane = null;
            return oldPlane;
        }

        return;
    }

    buildMesh(tile) {
        const gridPlaneGeometry = this.planeGeometryBuffer.pop();
        if (gridPlaneGeometry == null) {
            console.error("No geometry left");
            return;
        }

        const planeGrid = new Mesh(gridPlaneGeometry, this.buildMat(tile));
        const self = this;

        planeGrid.scale.x = 2 ** (13 - tile.zoom);
        planeGrid.scale.y = 2 ** (13 - tile.zoom);

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
        planeGrid.position.z = -150;

        planeGrid.visible = false;

        return planeGrid;
    }

    doMap(tile, planeGrid, gridPlaneGeometry, bTexture, lTexture, tTexture) {

        try {
            // let pos = gridPlaneGeometry.getAttribute("position");
            const pos = gridPlaneGeometry.attributes.position;

            var hVerts = gridPlaneGeometry.parameters.heightSegments + 1;
            var wVerts = gridPlaneGeometry.parameters.widthSegments + 1;

            const canvas = document.createElement('canvas');
            canvas.width = bTexture.image.width;
            canvas.height = bTexture.image.height;

            //console.log("image %s %s - plane %s %s", canvas.width, canvas.height, wVerts, hVerts)

            const context = canvas.getContext('2d');
            context.drawImage(bTexture.image, 0, 0);
            var data = context.getImageData(0, 0, canvas.width, canvas.height);
            const bumpScale = appConfiguration.bumpScale / 30;

            var index = 0;
            for (let j = 0; j < hVerts; j++) {
                for (let i = 0; i < wVerts; i++) {
                    pos.setZ(index, data.data[index * 4] * bumpScale);
                    index++;
                }
            }

            if (tTexture != null) {
                context.drawImage(tTexture.image, 0, 0);
                data = context.getImageData(0, 0, canvas.width, canvas.height);

                index = 0;
                var offset = hVerts * wVerts - 256;
                for (let j = 0; j < hVerts; j++) {
                    pos.setZ(index, data.data[offset * 4] * bumpScale);
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
                    pos.setZ(index, data.data[(index + 255) * 4] * bumpScale);
                    index += 256;
                }
            }

            pos.needsUpdate = true;
            gridPlaneGeometry.computeBoundingBox();

            //tile.box.copy(gridPlaneGeometry.boundingBox);//.applyMatrix4( planeGrid.matrixWorld );

            //planeGrid.castShadow = true; //default is false
            //planeGrid.receiveShadow = false; //default

            this.mapCanvas.triggerRender();
        } catch (error) {
            console.error(error);
        }
    }
}

export default MapBuilder3DBufferedMesh;