/* Peixes triangulares da lagoa. */
import * as THREE from 'three';
import { rr } from '../core/random.js';
import { coneG } from '../core/geometries.js';
import { Batch } from '../core/Batch.js';
import { K, PAL } from '../config/palette.js';
import { TANKS } from '../data/sisteminha.js';
import { surface } from './scene.js';
import { pondX, pondZ } from './terrain.js';

/* ================= PEIXES TRIANGULARES NA LAGOA ================= */
export const fishList = [];
(function () {
  const b = new Batch();
  b.addGeometry(coneG(3), K.orange, 0.15, 0.1, 0, [0.28, 0.9, 0.14], [0, 0, -Math.PI / 2]);
  b.addGeometry(coneG(3), 0xffd9a0, -0.6, 0.1, 0, [0.22, 0.4, 0.1], [0, 0, Math.PI / 2]);
  const f1 = new THREE.Group();
  b.build(f1);
  const b2 = new Batch();
  b2.addGeometry(coneG(3), K.white, 0.15, 0.1, 0, [0.28, 0.9, 0.14], [0, 0, -Math.PI / 2]);
  b2.addGeometry(coneG(3), PAL.glass.iceBlue, -0.6, 0.1, 0, [0.22, 0.4, 0.1], [0, 0, Math.PI / 2]);
  const f2 = new THREE.Group();
  b2.build(f2);
  for (let i = 0; i < 8; i++) {
    const g = (i % 2 ? f2 : f1).clone(true);
    g.scale.setScalar(rr(0.9, 1.3));
    surface.add(g);
    fishList.push({
      g: g,
      cx: pondX,
      cz: pondZ,
      r: rr(1.8, 5.2),
      a: rr(0, 6.28),
      sp: rr(0.28, 0.62) * (i % 3 === 0 ? -1 : 1),
      y: 0.42,
    });
  }
  TANKS.forEach(function (tk) {
    for (let j = 0; j < 4; j++) {
      const g2 = (j % 2 ? f2 : f1).clone(true);
      g2.scale.setScalar(rr(0.7, 0.95));
      surface.add(g2);
      fishList.push({
        g: g2,
        cx: tk.x,
        cz: tk.z,
        r: rr(0.7, 1.7),
        a: rr(0, 6.28),
        sp: rr(0.5, 0.9) * (j % 2 ? -1 : 1),
        y: 0.9,
      });
    }
  });
})();
