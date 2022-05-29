import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from './controls/StagedZoomOrbitControl';
import Stats from 'stats-js';

let camera, scene, renderer, stats;

class App {

	init() {

		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
		camera.position.z = 4;

		const gui = new GUI();
		scene = new THREE.Scene();

		stats = new Stats();
		//stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
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

		const controls = new OrbitControls(camera, renderer.domElement);
		//controls.addEventListener('change', render);

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
	renderer.render(scene, camera);
	stats.update();

}

export default App;
