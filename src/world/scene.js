/* Cena base: renderizador, câmera, luzes, grupos do diorama e lista de colisões da 1ª pessoa. */
import * as THREE from 'three';
import { createRenderer } from '../core/renderer.js';
import { PAL } from '../config/palette.js';
import { glHost } from '../app/page.js';

/* ================= THREE ================= */

export const renderer = createRenderer(glHost);
if (!renderer) {
  glHost.innerHTML = '<div class="fallback">Este aparelho não conseguiu iniciar o WebGL.</div>';
  throw new Error('WebGL indisponível'); /* interrompe o carregamento dos módulos seguintes */
}

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(26, 1, 30, 2400);
export const diorama = new THREE.Group(),
  surface = new THREE.Group(),
  under = new THREE.Group();
diorama.add(under);
diorama.add(surface);
scene.add(diorama);
scene.add(new THREE.AmbientLight(PAL.light.white, 0.6));
export const sun = new THREE.DirectionalLight(PAL.light.white, 0.34);
export const SUNDIR = new THREE.Vector3(-0.55, 0.78, 0.55).normalize();
scene.add(sun);
scene.add(sun.target);

/* ---------- utilidades ---------- */

/* paleta chapada */
export const colliders = []; /* colisão da 1ª pessoa: [x1,z1,x2,z2,nível] */
export function addCollider(x1, z1, x2, z2, lv) {
  colliders.push([
    Math.min(x1, x2),
    Math.min(z1, z2),
    Math.max(x1, x2),
    Math.max(z1, z2),
    lv || 's',
  ]);
}
