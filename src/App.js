import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { MapControls } from './controls/StagedZoomOrbitControl';
import Stats from 'stats-js';
import MapCanvas from './MapCanvas';
import appConfiguration from './utils/AppConfiguration';

let camera, scene, renderer, controls, stats, mapCanvas;

class App {

	init() {

		camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, appConfiguration.cameraMinDist, appConfiguration.cameraMaxDist);
		camera.up = new THREE.Vector3(0, 0, 1);
		camera.position.set(0, 0, appConfiguration.initialElevation);
		
		const gui = new GUI();
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

		controls.addEventListener('change', render);

		mapCanvas = new MapCanvas(scene, camera, controls);
		mapCanvas.build();
		mapCanvas.triggerRender();

		animate();
	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
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

export default App;
