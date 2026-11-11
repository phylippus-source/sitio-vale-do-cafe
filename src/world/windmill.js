/* Moinho de vento: torre, rotor e giro. */
import * as THREE from 'three';
import { GX, cylG, coneG } from '../core/geometries.js';
import { Batch } from '../core/Batch.js';
import { K } from '../config/palette.js';
import { surface } from './scene.js';

/* ================= MOINHO DE VENTO ================= */
const windG = new THREE.Group();
windG.position.set(6, 0, 36);
surface.add(windG);
export const rotor = new THREE.Group();
rotor.position.set(0, 14.4, 2.3);
windG.add(rotor);
(function () {
  const b = new Batch();
  b.addBox(5.4, 0.5, 5.4, K.concD, 0, 0, 0);
  b.addCylinder(2.1, 12.8, 0xc9684a, 0, 0.5, 0, 10, 1.2);
  for (let i = 0; i < 6; i++)
    b.addCylinder(2.1 - i * 0.15, 0.22, K.stoneL, 0, 1.2 + i * 2.1, 0, 10, 2.0 - i * 0.15);
  b.addBox(1.2, 2.0, 0.2, K.woodD, 0, 0.5, 2.0);
  b.addBox(0.7, 1.4, 0.1, K.wood, 0, 0.5, 2.1);
  b.addCylinder(1.7, 1.4, K.wood, 0, 13.3, 0, 10, 1.4);
  b.addCone(1.9, 1.8, K.roofD, 0, 14.6, 0, 10);
  b.addBox(1.7, 1.6, 2.6, K.steelD, 0, 13.5, 1.2);
  b.addBox(0.25, 0.7, 0.25, K.black, 0, 15.0, -0.2);
  b.addBox(1.4, 0.5, 0.1, K.black, 0, 13.9, 2.5);
  b.build(windG);
  const r = new Batch();
  r.addGeometry(cylG(0.55, 10), K.steelD, 0, 0, 0, [0.55, 1.1, 0.55], [Math.PI / 2, 0, 0]);
  r.addGeometry(coneG(8), K.white, 0, 0, 0.95, [0.5, 0.9, 0.5], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    r.addGeometry(
      GX.box,
      [0xf4f7f8, 0xdfe4e8][i % 2],
      Math.cos(a) * 1.55,
      Math.sin(a) * 1.55,
      0.1,
      [0.34, 2.1, 0.07],
      [0, 0, a - Math.PI / 2],
    );
    r.addGeometry(
      GX.box,
      K.steel,
      Math.cos(a) * 0.62,
      Math.sin(a) * 0.62,
      0.1,
      [0.14, 0.9, 0.12],
      [0, 0, a - Math.PI / 2],
    );
  }
  r.build(rotor);
})();
