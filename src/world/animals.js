/* Animais em baixo-poli (porcos, galinhas e cabras) e seus passeios. */
import * as THREE from 'three';
import { R, rr } from '../core/random.js';
import { GX, coneG } from '../core/geometries.js';
import { Batch } from '../core/Batch.js';
import { K, PAL } from '../config/palette.js';
import { surface } from './scene.js';

/* ================= ANIMAIS EM BAIXO-POLI (porcos, galinhas, cabras) ================= */
function animalMesh(kind) {
  const b = new Batch();
  if (kind === 'pig') {
    b.addBox(1.5, 0.9, 0.85, K.pink, 0, 0.5, 0);
    b.addBox(0.6, 0.65, 0.7, 0xf6b7c6, 0.9, 0.62, 0);
    b.addBox(0.28, 0.28, 0.4, PAL.animal.pigPink, 1.25, 0.7, 0);
    b.addGeometry(GX.ico0, PAL.animal.pigPink, -0.78, 0.85, 0, [0.12, 0.12, 0.12]);
    [
      [-0.5, -0.3],
      [-0.5, 0.3],
      [0.5, -0.3],
      [0.5, 0.3],
    ].forEach(function (l) {
      b.addCylinder(0.11, 0.5, PAL.animal.pigPink, l[0], 0, l[1], 6);
    });
    b.addBox(0.1, 0.22, 0.15, PAL.animal.pigPink, 0.95, 1.18, -0.25);
    b.addBox(0.1, 0.22, 0.15, PAL.animal.pigPink, 0.95, 1.18, 0.25);
    b.addBox(0.07, 0.07, 0.07, K.black, 1.2, 0.88, -0.2);
    b.addBox(0.07, 0.07, 0.07, K.black, 1.2, 0.88, 0.2);
  } else if (kind === 'hen') {
    b.addBox(0.45, 0.4, 0.36, K.white, 0, 0.32, 0);
    b.addBox(0.22, 0.3, 0.24, K.white, 0.26, 0.55, 0);
    b.addGeometry(coneG(3), K.yellow, 0.43, 0.62, 0, [0.07, 0.16, 0.07], [0, 0, -Math.PI / 2]);
    b.addGeometry(GX.ico0, K.red, 0.3, 0.84, 0, [0.07, 0.08, 0.05]);
    b.addGeometry(
      coneG(3),
      K.white,
      -0.28,
      0.55,
      0,
      [0.18, 0.34, 0.2],
      [0, 0, (Math.PI / 2) * 1.15],
    );
    b.addCylinder(0.025, 0.25, K.yellow, 0, 0.0, -0.1, 4);
    b.addCylinder(0.025, 0.25, K.yellow, 0, 0.0, 0.1, 4);
  } else {
    b.addBox(1.2, 0.7, 0.5, 0xcfcac0, 0, 0.7, 0);
    b.addBox(0.4, 0.6, 0.38, 0xb9b3a6, 0.7, 1.1, 0);
    b.addBox(0.25, 0.22, 0.3, PAL.animal.grey, 0.95, 1.15, 0);
    b.addGeometry(coneG(3), PAL.animal.horn, 0.8, 1.62, -0.1, [0.07, 0.28, 0.07]);
    b.addGeometry(coneG(3), PAL.animal.horn, 0.8, 1.62, 0.1, [0.07, 0.28, 0.07]);
    b.addGeometry(GX.ico0, PAL.animal.horn, 0.82, 0.85, 0, [0.08, 0.22, 0.08]);
    [
      [-0.45, -0.16],
      [-0.45, 0.16],
      [0.45, -0.16],
      [0.45, 0.16],
    ].forEach(function (l) {
      b.addCylinder(0.07, 0.7, 0x7b756b, l[0], 0, l[1], 5);
    });
    b.addGeometry(
      coneG(3),
      PAL.animal.grey,
      -0.7,
      1.0,
      0,
      [0.1, 0.3, 0.1],
      [0, 0, (Math.PI / 2) * 1.2],
    );
  }
  const g = new THREE.Group();
  b.build(g);
  return g;
}
export const animals = [];
(function () {
  const tpl = { pig: animalMesh('pig'), hen: animalMesh('hen'), goat: animalMesh('goat') },
    spec = [
      ['pig', 4, 1.0],
      ['hen', 10, 1.0],
      ['goat', 5, 1.0],
    ];
  spec.forEach(function (sp) {
    for (let i = 0; i < sp[1]; i++) {
      const g = tpl[sp[0]].clone(true);
      const a = {
        g: g,
        kind: sp[0],
        cx: rr(25, 37),
        cz: rr(-8, 7),
        rx: rr(1.2, 3.8),
        rz: rr(1.0, 3.0),
        ph: rr(0, 6.28),
        sp: rr(0.18, 0.34) * (sp[0] === 'hen' ? 1.6 : 1) * (R() < 0.5 ? -1 : 1),
      };
      if (sp[0] === 'pig') {
        a.cx = rr(24.5, 29);
        a.cz = rr(-6, 6);
        a.rx = rr(0.8, 1.8);
        a.rz = rr(1.0, 2.4);
      }
      if (sp[0] === 'goat') {
        a.cx = rr(33.5, 37.5);
        a.cz = rr(-4, 3);
        a.rx = rr(0.8, 1.6);
        a.rz = rr(1.0, 2.6);
      }
      if (sp[0] === 'hen') {
        a.cx = rr(-41, -33);
        a.cz = rr(36.5, 38);
        a.rx = rr(0.8, 1.8);
        a.rz = rr(0.6, 1.5);
      }
      surface.add(g);
      animals.push(a);
    }
  });
})();
