import * as THREE from "three";

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

  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);
  const scene = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
  const cube = new THREE.Mesh(box, material);

  camera.position.z = 2;
  scene.add(cube);

  function render(time: number, renderer: THREE.WebGLRenderer) {
    time *= 0.001;

    resizeRendererToDisplaySize(renderer, camera, false);

    cube.rotation.x = time;
    cube.rotation.y = time;

    renderer.render(scene, camera);
  }

  const controller = {
    switchTo: (display: DisplayOptions) => {
      if (display === "window") {
        fullscreenRenderer.setAnimationLoop(null);
        resizeRendererToDisplaySize(windowRenderer, camera, true);
        windowRenderer.setAnimationLoop((time) => render(time, windowRenderer));
      }

      if (display === "fullscreen") {
        windowRenderer.setAnimationLoop(null);
        resizeRendererToDisplaySize(fullscreenRenderer, camera, true);
        fullscreenRenderer.setAnimationLoop((time) => render(time, fullscreenRenderer));
      }
    },
  };

  return controller;
}

export { initModelViewers, type DisplayOptions, type ViewController };
