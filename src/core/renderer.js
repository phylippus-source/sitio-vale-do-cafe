/* Cria o renderizador WebGL; devolve null se o aparelho não suportar. */
import * as THREE from 'three';

const SMALL_SCREEN_PX = 640;
const PIXEL_RATIO_SMALL = 1.5; /* celulares de entrada (moto g52): 1,5× poupa a GPU */
const PIXEL_RATIO_LARGE = 2;

export function createRenderer(host) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < SMALL_SCREEN_PX;
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, smallScreen ? PIXEL_RATIO_SMALL : PIXEL_RATIO_LARGE),
  );
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  host.appendChild(renderer.domElement);
  return renderer;
}
