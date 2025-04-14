import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type DisplayOptions = "window" | "fullscreen";

type ViewController = {
  switchTo: (display: DisplayOptions) => void;
};

function resizeRendererToDisplaySize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  force: boolean
) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;

  const width = Math.floor(canvas.clientWidth * pixelRatio);
  const height = Math.floor(canvas.clientHeight * pixelRatio);

  if (canvas.width !== width || canvas.height !== height || force) {
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

/**
 * Should only be called once.
 */
function initModelViewers(windowCanvas: HTMLCanvasElement, fullscreenCanvas: HTMLCanvasElement) {
  const windowRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: windowCanvas });
  const fullscreenRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: fullscreenCanvas });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);
  const controls = new OrbitControls(camera);

  const box = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
  const cube = new THREE.Mesh(box, material);

  camera.position.z = 2;
  controls.autoRotate = true;
  controls.enableDamping = true;
  scene.add(cube);

  function render(time: number, renderer: THREE.WebGLRenderer) {
    time *= 0.001;

    resizeRendererToDisplaySize(renderer, camera, false);

    controls.update();
    renderer.render(scene, camera);
  }

  const controller = {
    switchTo: (display: DisplayOptions) => {
      if (display === "window") {
        fullscreenRenderer.setAnimationLoop(null);
        resizeRendererToDisplaySize(windowRenderer, camera, true);
        controls.connect(windowRenderer.domElement);
        windowRenderer.setAnimationLoop((time) => render(time, windowRenderer));
      }

      if (display === "fullscreen") {
        windowRenderer.setAnimationLoop(null);
        resizeRendererToDisplaySize(fullscreenRenderer, camera, true);
        controls.connect(fullscreenRenderer.domElement);
        fullscreenRenderer.setAnimationLoop((time) => render(time, fullscreenRenderer));
      }
    },
  };

  return controller;
}

export { initModelViewers, type DisplayOptions, type ViewController };
