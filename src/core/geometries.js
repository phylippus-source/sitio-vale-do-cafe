/* Geometrias unitárias compartilhadas (caixa, esferas, toros) e fábricas com cache de cilindro/cone. */
import * as THREE from 'three';

export const GX = {
  box: new THREE.BoxGeometry(1, 1, 1),
  ico0: new THREE.IcosahedronGeometry(1, 0),
  ico1: new THREE.IcosahedronGeometry(1, 1),
  tor: new THREE.TorusGeometry(1, 0.05, 4, 18),
  arc: new THREE.TorusGeometry(1, 0.035, 4, 16, Math.PI),
  half: new THREE.CylinderGeometry(1, 1, 1, 14, 1, false, 0, Math.PI),
};
const _gc = {};
export function cylG(k, seg) {
  const key = 'c' + k.toFixed(3) + '|' + seg;
  return _gc[key] || (_gc[key] = new THREE.CylinderGeometry(k, 1, 1, seg));
}
export function coneG(seg) {
  const key = 'n' + seg;
  return _gc[key] || (_gc[key] = new THREE.ConeGeometry(1, 1, seg));
}
export function ni(g) {
  if (!g.userData.ni) {
    const n = g.index ? g.toNonIndexed() : g;
    n.computeBoundingBox();
    g.userData.ni = n;
  }
  return g.userData.ni;
}
