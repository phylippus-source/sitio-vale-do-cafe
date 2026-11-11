/* Roda d'água overshot (dinâmica): calha, roda, eixo e giro. */
import * as THREE from 'three';
import { GX, cylG } from '../core/geometries.js';
import { Batch } from '../core/Batch.js';
import { K, PAL } from '../config/palette.js';
import { surface } from './scene.js';

/* ================= RODA D'ÁGUA OVERSHOT (dinâmica) ================= */
const wheelG = new THREE.Group();
wheelG.position.set(45.5, 2.0, -41.2);
surface.add(wheelG);
export const wheelSpin = new THREE.Group();
wheelG.add(wheelSpin);
(function () {
  const b = new Batch();
  const WR = 2.6;
  const WW = 3.0;
  const dark = PAL.wood.ebony;
  [-WW / 2, WW / 2].forEach(function (z) {
    b.addGeometry(GX.tor, dark, 0, 0, z, [WR, WR, 3.0]);
    b.addGeometry(GX.tor, dark, 0, 0, z, [WR - 0.5, WR - 0.5, 3.0]);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.addBeam([0, 0, z], [Math.cos(a) * WR, Math.sin(a) * WR, z], 0.11, K.woodD, 5);
    }
  });
  b.addGeometry(cylG(1, 10), K.steelD, 0, 0, 0, [0.34, WW + 1.4, 0.34], [Math.PI / 2, 0, 0]);
  b.addGeometry(cylG(1, 10), K.copper, 0, 0, 0, [0.52, 0.5, 0.52], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 16; i++) {
    const a2 = (i / 16) * Math.PI * 2;
    b.addGeometry(
      GX.box,
      [K.wood, K.woodD][i % 2],
      Math.cos(a2) * (WR - 0.1),
      Math.sin(a2) * (WR - 0.1),
      0,
      [0.7, 0.12, WW],
      [0, 0, a2],
    );
  }
  b.build(wheelSpin);
  wheelG.rotation.y = Math.PI / 2; /* eixo paralelo ao eixo X do mundo, entrando no engenho */
})();
/* cavaletes, calha de alimentação (flume) e eixo para dentro do engenho */
(function () {
  const b = new Batch();
  [43.3, 47.7].forEach(function (x) {
    b.addBox(0.5, 2.8, 0.5, K.woodD, x, -1.4, -41.2);
    b.addBox(0.9, 0.5, 0.9, K.stone, x, -1.4, -41.2);
    b.addBeam([x, -1.2, -43.2], [x, 2.2, -41.4], 0.14, K.woodD, 5);
    b.addBeam([x, -1.2, -39.2], [x, 2.2, -41.0], 0.14, K.woodD, 5);
    b.addBox(0.5, 0.4, 0.5, K.copper, x, 1.9, -41.2);
  });
  b.addBox(1.8, 0.25, 12, K.wood, 45.5, 4.9, -48.4);
  b.addBox(0.18, 0.55, 12, K.woodD, 44.7, 4.9, -48.4);
  b.addBox(0.18, 0.55, 12, K.woodD, 46.3, 4.9, -48.4);
  b.addBox(1.6, 0.06, 12, K.water, 45.5, 5.14, -48.4);
  [-53, -49, -44].forEach(function (z) {
    b.addBox(0.3, 5.0, 0.3, K.woodD, 44.5, 0, z);
    b.addBox(0.3, 5.0, 0.3, K.woodD, 46.5, 0, z);
  });
  b.addBeam([42.9, 2.0, -41.2], [44.4, 2.0, -41.2], 0.28, K.steelD, 8);
  b.build(surface);
})();
