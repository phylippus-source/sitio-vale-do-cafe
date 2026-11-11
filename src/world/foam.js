/* Espuma, respingos e superfície da lagoa e do córrego. */
import * as THREE from 'three';
import { rr } from '../core/random.js';
import { C } from '../core/color.js';
import { waterMat, pondMat } from '../core/materials.js';
import { PAL } from '../config/palette.js';
import { surface } from './scene.js';
import { waterBatch, pondBatch, surfaceBatch } from './terrain.js';

/* ================= ESPUMA, RESPINGOS E LAGOA/CÓRREGO ================= */
waterBatch.build(surface, { mat: waterMat });
pondBatch.build(surface, { mat: pondMat });
surfaceBatch.build(surface);
export const foam = [];
(function () {
  const gm = new THREE.MeshBasicMaterial({ color: PAL.light.white });
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(rr(0.8, 2.0), 0.06, 0.12), gm);
    let zr = i < 14 ? [-74, -62] : [-39, 74];
    if (i >= 14) {
      zr = [-36, 74];
    }
    m.position.set(rr(43.7, 47.3), -0.5, rr(zr[0], zr[1]));
    surface.add(m);
    foam.push({ m: m, v: rr(1.8, 3.4), z0: zr[0], z1: zr[1] });
  }
})();
export const splash = [],
  splashGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22),
  splashMats = [
    new THREE.MeshBasicMaterial({ color: PAL.light.white }),
    new THREE.MeshBasicMaterial({ color: C(0x8fdcf5) }),
    new THREE.MeshBasicMaterial({ color: C(0x4cc6f2) }),
  ];
for (let sI = 0; sI < 34; sI++) {
  const sm = new THREE.Mesh(splashGeo, splashMats[sI % 3]);
  sm.visible = false;
  surface.add(sm);
  splash.push({ m: sm, life: 0, vx: 0, vy: 0, vz: 0 });
}
