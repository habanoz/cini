import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { MapControls } from './controls/StagedZoomOrbitControl';
import Stats from 'stats-js';
import MapCanvas from './MapCanvas';
import appConfiguration from './utils/AppConfiguration';
import MapBuilder2D from './mbuilders/MapBuilder2D';
import MapBuilder3DMesh from './mbuilders/MapBuilder3DMesh';
import MapBuilder3DShaderColor from './mbuilders/MapBuilder3DShaderColor';
import MapBuilder3DShaderSat from './mbuilders/MapBuilder3DShaderSat';

let camera, scene, renderer, controls, stats, mapCanvas, gui, mapBuilders = new Map();

const options = {
	go2d: function () {
		camera.position.x = controls.target.x;
		camera.position.y = controls.target.y;
	},
};

class App {

	init() {
		camera = new THREE.PerspectiveCamera(getFov(), getAspect(), appConfiguration.cameraMinDist, appConfiguration.cameraMaxDist);
		camera.up = new THREE.Vector3(0, 0, 1);
		camera.position.set(0, 0, appConfiguration.initialElevation);

		scene = new THREE.Scene();

		stats = new Stats();
		document.body.appendChild(stats.dom);

		const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);

		controls = new MapControls(camera, renderer.domElement, appConfiguration.maxZoom);
		controls.target.copy(new THREE.Vector3(camera.position.x, camera.position.y, 0));
		controls.zoomSpeed = 13.5;

		controls.minDistance = appConfiguration.cameraMinDist;
		controls.maxDistance = appConfiguration.cameraMaxDist;

		controls.addEventListener('change', () => mapCanvas.triggerRender());

		mapBuilders['2D'] = new MapBuilder2D(controls);
		mapBuilders['3DMesh'] = new MapBuilder3DMesh(controls);
		mapBuilders['3DShaderColor'] = new MapBuilder3DShaderColor(controls);
		mapBuilders['3DShaderSat'] = new MapBuilder3DShaderSat(controls);

		mapCanvas = new MapCanvas(scene, camera, controls, mapBuilders, '2D');
		mapCanvas.build();
		mapCanvas.triggerRender();

		gui = new GUI();
		buildGui(mapCanvas);

		const buildersFolder = gui.addFolder('Builders');
		const builderKeyControl = buildersFolder.add(mapCanvas, 'mapBuilderKey').options(['2D', '3DMesh', '3DShaderColor', '3DShaderSat']);
		builderKeyControl.onChange(() => mapCanvas.switchMapBuilder());

		animate();
	}

}

function getFov() {
	return 2 * Math.atan(window.innerHeight / (2 * 500)) * (180 / Math.PI);
}

function getAspect() {
	return window.innerWidth / window.innerHeight;
}

function onWindowResize() {

	camera.aspect = getAspect();
	camera.fov = getFov();
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

	requestAnimationFrame(animate);

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	render();

	stats.update();
}

function render() {
	mapCanvas.render();
	renderer.render(scene, camera);
}

function buildGui(mapCanvas) {
	gui.add(controls, 'screenSpacePanning');
	gui.add(controls.pSphere, 'radius').onChange(render).listen();
	gui.add(controls.pSphere, 'phi').onChange(render).listen();
	gui.add(camera, 'fov').onChange(onWindowResize);
	gui.add(camera.position, 'z').onChange(render).listen();
	gui.add(controls, 'zoomLevel').listen();
	gui.add(options, 'go2d');
	gui.add(appConfiguration, 'showTileBorders').onChange(mapCanvas.triggerRender());
}

export default App;
