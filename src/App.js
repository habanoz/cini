import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { MapControls } from './controls/StagedZoomOrbitControl';
import Stats from 'stats-js';
import MapCanvas from './MapCanvas';
import appConfiguration from './utils/AppConfiguration';

let camera, scene, renderer, controls, stats, mapCanvas, gui;

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

		//this.addLight();

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		//renderer.shadowMap.enabled = true;

		document.body.appendChild(renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);

		controls = new MapControls(camera, renderer.domElement, appConfiguration.maxZoom);
		controls.target.copy(new THREE.Vector3(camera.position.x, camera.position.y, 0));
		controls.zoomSpeed = 13.5;

		controls.minDistance = appConfiguration.cameraMinDist;
		controls.maxDistance = appConfiguration.cameraMaxDist;

		controls.addEventListener('change', () => mapCanvas.triggerRender());

		mapCanvas = new MapCanvas(scene, camera, controls);
		mapCanvas.build();
		mapCanvas.triggerRender();

		gui = new GUI();
		buildGui(mapCanvas);

		const buildersFolder = gui.addFolder('Builders');
		const builderKeyControl = buildersFolder.add(mapCanvas, 'mapBuilderKey').options(mapCanvas.getMapBuilderKeys());
		builderKeyControl.onChange(() => mapCanvas.switchMapBuilder());

		animate();
	}


	addLight() {
		var light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(0, 1, 1).normalize();
		light.castShadow = true;

		light.shadow.mapSize.width = 500000; // default
		light.shadow.mapSize.height = 500000; // default
		light.shadow.camera.near = 300; // default
		light.shadow.camera.far = 500000; // default

		scene.add(light);

		scene.add(new THREE.AmbientLight(0x404040));
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
	mapCanvas.triggerRender();
}

function animate() {

	requestAnimationFrame(animate);

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	render();

	stats.update();
}

function render() {
	const shouldRender = mapCanvas.render();
	if (shouldRender)
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
