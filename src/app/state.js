/* Estado compartilhado da interface: câmera (alvo e atual) e andarilho da 1ª pessoa. */
import * as THREE from 'three';

export const viewTarget = {
  rotY: -0.55,
  rotX: 0.17,
  zoom: 1.12,
  panX: 0,
  panY: 0,
  lift: 0,
  f: new THREE.Vector3(2, -4, 2),
};
export const viewCurrent = {
  rotY: -0.55,
  rotX: 0.17,
  zoom: 1.12,
  panX: 0,
  panY: 0,
  lift: 0,
  f: new THREE.Vector3(2, -4, 2),
};
export const walker = {
  on: false,
  x: 1,
  z: -50.6,
  yaw: 0,
  pitch: 0,
  lvl: 's',
  eye: 1.7,
  eyeY: 1.9,
  jx: 0,
  jy: 0,
  keys: {},
  prevLift: 0,
  bob: 0,
  moved: 0,
};
