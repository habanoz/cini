class AppConfiguration {
    maxZoom = 13;
    sceneWidth = 2_000_000;
    sceneWidthHalf = this.sceneWidth / 2;
    sceneHeight = 2_000_000;
    sceneHeightHalf = this.sceneHeight / 2;

    tileDimension = 256;
    showTileBorders = false;

    initialElevation = 4_000_000;
    cameraMaxDist = this.initialElevation;
    cameraMinDist = 200;
    bumpScale = 100.0;
    groundElevation = -30;
    zoomColorMap = { 0: '#ff0000', 1: '#ff8000', 2: '#ffff00', 3: '#80ff00', 4: '#00ff00', 5: '#00ff80', 6: '#00ffff', 7: '#0080ff', 8: '#0000ff', 9: '#8000ff', 10: '#ff00ff', 11: '#ff0080', 12: '#ffbf00', 13: '#bfff00', 14: '#40ff00', 15: '#00ff40', 16: '00ffbf', 17: '#00bfff', 18: '	#0040ff', 19: '#4000ff', 20: '#bf00ff', 21: '#ff00bf', 22: '#ff0040', 23: 'black' };
}
const appConfiguration = new AppConfiguration();
export default appConfiguration;