/* Pátio técnico e oficina de reparos: lote de brita, trilhos, baias, galpões e sinalização. */
import * as THREE from 'three';
import { C } from '../core/color.js';
import { GX, cylG } from '../core/geometries.js';
import { Batch } from '../core/Batch.js';
import { K, PAL } from '../config/palette.js';
import { surface } from './scene.js';

/* ================= PÁTIO TÉCNICO E OFICINA DE REPAROS ================= */
export const yardBatch = new Batch(),
  beacons = [];
function localToWorldXZ(x0, z0, ry, lx, lz) {
  return [x0 + lx * Math.cos(ry) + lz * Math.sin(ry), z0 - lx * Math.sin(ry) + lz * Math.cos(ry)];
}
function track(b, x, len, h, w) {
  b.addBox(w, h, len, K.black, x, 0.0, 0);
  b.addGeometry(cylG(1, 12), K.black, x, h / 2, len / 2, [h / 2, w, h / 2], [0, 0, Math.PI / 2]);
  b.addGeometry(cylG(1, 12), K.black, x, h / 2, -len / 2, [h / 2, w, h / 2], [0, 0, Math.PI / 2]);
  for (let k = 0; k < 4; k++)
    b.addGeometry(
      cylG(1, 8),
      K.steelD,
      x,
      h * 0.42,
      -len / 2 + (len * (k + 0.5)) / 4,
      [h * 0.28, w * 1.04, h * 0.28],
      [0, 0, Math.PI / 2],
    );
}
function stripedCone(b, x, z) {
  b.addCone(0.34, 0.9, K.orange, x, 0, z, 8);
  b.addCylinder(0.27, 0.14, K.white, x, 0.3, z, 8, 0.23);
  b.addBox(0.8, 0.06, 0.8, K.black, x, 0, z);
}
function pallet(b, x, z, n, ry) {
  b.setOrigin(x, 0, z, ry || 0);
  for (let l = 0; l < n; l++) {
    b.addBox(1.2, 0.14, 1.0, K.woodL, 0, l * 0.42, 0);
    for (let f = 0; f < 3; f++)
      b.addBox(1.2, 0.1, 0.18, K.woodD, 0, l * 0.42 + 0.14, -0.38 + f * 0.38);
    for (let c = 0; c < 3; c++)
      b.addBox(0.12, 0.14, 1.0, K.woodD, -0.5 + c * 0.5, l * 0.42 + 0.24, 0);
  }
  b.setOrigin(0, 0, 0, 0);
}
function toolbox(b, x, z, ry, lv) {
  b.setOrigin(x, 0, z, ry || 0);
  for (let l = 0; l < (lv || 2); l++) {
    b.addBox(1.0, 0.5, 0.55, K.red, 0, l * 0.5, 0);
    b.addBox(0.55, 0.06, 0.07, K.steel, 0, l * 0.5 + 0.4, 0.3);
    b.addBox(1.02, 0.04, 0.57, K.redD || 0xa82a20, 0, l * 0.5 + 0.24, 0);
  }
  b.setOrigin(0, 0, 0, 0);
}
function beacon(x, y, z, col) {
  yardBatch.addCylinder(0.2, 0.12, K.black, x, y, z, 8);
  beacons.push({ x: x, y: y + 0.12, z: z, col: col });
}

/* laje de concreto cinza-claro e faixas de sinalização */
yardBatch.addBox(18, 0.2, 19, K.conc, 30, 0, -22.5);
yardBatch.addBox(18.2, 0.08, 0.3, K.concD, 30, 0.2, -13.2);
for (let ys = 0; ys < 9; ys++)
  yardBatch.addBox(1.3, 0.03, 0.22, K.yellow, 21.8 + ys * 2.0, 0.2, -31.8);
yardBatch.addBox(0.2, 0.03, 9, K.white, 24, 0.2, -20);
yardBatch.addBox(0.2, 0.03, 9, K.white, 36.5, 0.2, -20);
yardBatch.addBox(12, 0.03, 0.2, K.white, 30, 0.2, -16);
[
  [22, -14.5],
  [38, -14.5],
].forEach(function (p) {
  yardBatch.addCylinder(0.12, 6.0, K.steelD, p[0], 0.2, p[1], 6);
  yardBatch.addBox(0.8, 0.2, 0.5, K.steel, p[0], 6.0, p[1]);
  yardBatch.addBox(0.6, 0.06, 0.3, 0xfff6c9, p[0], 5.94, p[1]);
});

/* minicarregadeira (skid steer) — amarelo Caterpillar, esteiras pretas */
(function (b, X, Z, RY) {
  b.setOrigin(X, 0, Z, RY);
  track(b, -0.95, 2.5, 0.85, 0.5);
  track(b, 0.95, 2.5, 0.85, 0.5);
  b.addBox(1.5, 0.9, 2.2, K.yellow, 0, 0.55, -0.1);
  b.addBox(1.6, 0.2, 2.3, K.black, 0, 0.45, -0.1);
  b.addBox(1.2, 0.5, 0.9, K.black, 0, 1.45, -0.8);
  b.addBox(1.3, 0.08, 1.3, K.yellow, 0, 2.72, 0.1);
  [
    [-0.62, -0.58],
    [0.62, -0.58],
    [-0.62, 0.62],
    [0.62, 0.62],
  ].forEach(function (p) {
    b.addBox(0.1, 1.3, 0.1, K.yellow, p[0], 1.45, p[1]);
  });
  b.addBox(1.1, 1.0, 1.1, PAL.glass.paleBlue, 0, 1.45, 0.0);
  b.addBox(1.4, 0.1, 0.1, K.black, 0, 1.1, 0.62);
  b.addBeam([-0.82, 1.0, -0.7], [-0.82, 0.9, 1.9], 0.1, K.yellow, 6);
  b.addBeam([0.82, 1.0, -0.7], [0.82, 0.9, 1.9], 0.1, K.yellow, 6);
  b.addBox(1.9, 0.5, 0.7, K.black, 0, 0.45, 2.15);
  b.addBox(1.9, 0.7, 0.1, K.black, 0, 0.9, 2.45);
  b.addBox(1.9, 0.14, 0.5, K.steel, 0, 0.3, 2.4);
  b.addBeam([-0.6, 1.2, -0.9], [-0.5, 0.6, 1.2], 0.07, K.steelD, 5);
  b.setOrigin(0, 0, 0, 0);
  const p = localToWorldXZ(X, Z, RY, 0.6, -0.1);
  beacon(p[0], 2.8, p[1], K.orange);
})(yardBatch, 30.7, -26.6, Math.PI);

/* miniescavadeira com lâmina niveladora */
(function (b, X, Z, RY) {
  b.setOrigin(X, 0, Z, RY);
  track(b, -1.0, 3.2, 0.8, 0.65);
  track(b, 1.0, 3.2, 0.8, 0.65);
  b.addBox(2.2, 0.4, 2.4, K.black, 0, 0.7, 0);
  b.addBox(2.2, 0.18, 0.5, K.orange, 0, 0.3, 1.95);
  b.addBeam([-1.0, 0.6, 0.8], [-1.0, 0.5, 1.9], 0.08, K.steelD, 5);
  b.addBeam([1.0, 0.6, 0.8], [1.0, 0.5, 1.9], 0.08, K.steelD, 5);
  b.setOrigin(X, 0, Z, RY - 0.55);
  b.addGeometry(cylG(1, 16), K.black, 0, 1.15, 0, [1.3, 0.12, 1.3]);
  b.addBox(2.0, 1.0, 2.3, K.orange, 0, 1.2, -0.3);
  b.addBox(1.8, 0.8, 0.9, K.black, 0, 2.2, -1.1);
  b.addBox(1.0, 1.5, 1.0, PAL.glass.paleBlue, -0.5, 2.2, 0.4);
  b.addBox(1.2, 0.1, 1.2, K.orange, -0.5, 3.7, 0.4);
  b.addBox(0.1, 1.5, 0.1, K.orange, -0.95, 2.2, 0.85);
  b.addBox(1.2, 0.7, 0.5, K.black, 0, 1.4, -1.5);
  b.addBeam([0.5, 1.7, 0.5], [0.5, 3.5, 2.5], 0.18, K.orange, 6);
  b.addBeam([0.5, 3.5, 2.5], [0.5, 2.0, 4.0], 0.14, K.orange, 6);
  b.addBeam([0.5, 1.9, 0.1], [0.5, 3.2, 1.6], 0.07, K.steel, 5);
  b.addGeometry(GX.box, K.black, 0.5, 1.55, 4.3, [0.6, 0.9, 0.6], [0.6, 0, 0]);
  b.addGeometry(GX.box, K.steel, 0.5, 1.2, 4.6, [0.62, 0.16, 0.35], [0.6, 0, 0]);
  b.setOrigin(0, 0, 0, 0);
  const p = localToWorldXZ(X, Z, RY - 0.55, -0.5, 0.4);
  beacon(p[0], 3.75, p[1], K.orange);
})(yardBatch, 36.2, -23.2, -0.6);

/* carrinhos utilitários elétricos de ferramentas */
function cart(b, X, Z, RY, col) {
  b.setOrigin(X, 0, Z, RY);
  b.addBox(1.9, 0.14, 1.0, col, 0, 0.36, 0);
  b.addBox(0.14, 0.7, 1.0, K.black, -0.95, 0.4, 0);
  b.addBox(1.9, 0.5, 0.12, K.black, 0, 0.5, -0.5);
  [
    [-0.7, -0.5],
    [0.7, -0.5],
    [-0.7, 0.5],
    [0.7, 0.5],
  ].forEach(function (w) {
    b.addGeometry(cylG(1, 10), K.black, w[0], 0.24, w[1], [0.24, 0.16, 0.24], [Math.PI / 2, 0, 0]);
  });
  b.addBox(0.8, 0.5, 0.55, K.red, 0.3, 0.5, 0.05);
  b.addBox(0.8, 0.04, 0.57, K.steel, 0.3, 1.0, 0.05);
  b.addBox(0.5, 0.3, 0.4, K.blue, -0.4, 0.5, 0.1);
  b.addBox(0.04, 0.9, 0.04, K.black, -1.0, 0.5, -0.4);
  b.addBox(0.04, 0.9, 0.04, K.black, -1.0, 0.5, 0.4);
  b.addBox(0.06, 0.06, 0.9, K.black, -1.0, 1.4, 0);
  b.setOrigin(0, 0, 0, 0);
}
cart(yardBatch, 25.6, -28.6, 0.35, K.orange);
cart(yardBatch, 27.6, -21.6, -0.5, K.yellow);
cart(yardBatch, 34.2, -29.4, 0.1, K.orange);

/* van Asia Towner e moto de 175 cc */
(function (b, X, Z, RY) {
  b.setOrigin(X, 0, Z, RY);
  b.addBox(1.9, 1.5, 3.1, K.white, 0, 0.5, -0.6);
  b.addBox(1.85, 1.0, 1.3, K.white, 0, 0.5, 1.6);
  b.addBox(1.7, 0.6, 0.1, PAL.glass.paleBlue, 0, 1.35, 2.25);
  b.addBox(1.95, 0.12, 4.6, K.blue, 0, 0.7, 0.2);
  b.addBox(1.6, 0.5, 0.1, PAL.glass.paleBlue, 0, 1.4, 0.95);
  b.addBox(0.1, 0.5, 1.0, PAL.glass.paleBlue, 0.93, 1.2, 1.6);
  b.addBox(0.1, 0.5, 1.0, PAL.glass.paleBlue, -0.93, 1.2, 1.6);
  [
    [-0.95, 1.5],
    [0.95, 1.5],
    [-0.95, -1.2],
    [0.95, -1.2],
  ].forEach(function (w) {
    b.addGeometry(cylG(1, 12), K.black, w[0], 0.4, w[1], [0.4, 0.26, 0.4], [0, 0, Math.PI / 2]);
    b.addGeometry(cylG(1, 8), K.steel, w[0], 0.4, w[1], [0.2, 0.28, 0.2], [0, 0, Math.PI / 2]);
  });
  b.addBox(1.5, 0.2, 0.1, K.black, 0, 0.5, 2.3);
  b.setOrigin(0, 0, 0, 0);
})(yardBatch, 24.6, -18.6, 0.18);
(function (b, X, Z, RY) {
  b.setOrigin(X, 0, Z, RY);
  b.addGeometry(cylG(1, 12), K.black, 0, 0.45, 0.8, [0.45, 0.16, 0.45], [0, 0, Math.PI / 2]);
  b.addGeometry(cylG(1, 12), K.black, 0, 0.45, -0.8, [0.45, 0.16, 0.45], [0, 0, Math.PI / 2]);
  b.addBox(0.3, 0.5, 1.2, K.red, 0, 0.55, 0);
  b.addBox(0.34, 0.14, 0.9, K.black, 0, 1.0, -0.2);
  b.addBox(0.7, 0.08, 0.08, K.steel, 0, 1.35, 0.55);
  b.addBox(0.16, 0.3, 0.2, K.white, 0, 1.1, 0.8);
  b.setOrigin(0, 0, 0, 0);
})(yardBatch, 22.6, -16.0, 1.2);

/* paletes, caixas de ferramenta vermelhas empilhadas, cones listrados */
pallet(yardBatch, 37.3, -30.3, 3, 0.1);
pallet(yardBatch, 37.5, -28.6, 2, -0.2);
pallet(yardBatch, 22.8, -25.2, 2, 0.4);
for (let tb = 0; tb < 3; tb++)
  toolbox(yardBatch, 23.0 + tb * 1.1, -30.2, 0.05 * tb, tb === 1 ? 3 : 2);
toolbox(yardBatch, 37.2, -26.0, 0.3, 2);
[
  [27.8, -24.0],
  [33.8, -24.8],
  [29.6, -30.2],
  [34.6, -26.8],
  [27.0, -17.0],
  [33.0, -16.4],
  [24.0, -23.6],
  [38.6, -20.6],
].forEach(function (c) {
  stripedCone(yardBatch, c[0], c[1]);
});
[
  [38.2, -17.4],
  [38.2, -16.4],
  [39.1, -17.0],
].forEach(function (p) {
  yardBatch.addCylinder(
    0.45,
    1.0,
    [K.blue, K.red, K.blue][((p[1] * 2) | 0) & 1],
    p[0],
    0.2,
    p[1],
    10,
  );
  yardBatch.addCylinder(0.46, 0.1, K.black, p[0], 0.8, p[1], 10);
});
yardBatch.addBox(1.4, 2.2, 0.16, K.white, 39.2, 0.2, -23.3);
yardBatch.addBox(1.3, 0.5, 0.18, K.yellow, 39.2, 1.7, -23.3);
yardBatch.addBox(0.2, 0.2, 0.2, K.black, 39.2, 1.0, -23.3);
yardBatch.addBox(3.8, 2.6, 3.6, K.stone, 41, 0, -17);
yardBatch.addBox(4.3, 0.3, 4.1, K.roofD, 41, 2.6, -17);
yardBatch.addCylinder(0.8, 1.3, K.copper, 39.0, 0, -17, 10);
yardBatch.addCylinder(0.2, 1.5, K.steelD, 39.0, 1.3, -17, 8);
yardBatch.addBeam([43.6, 3.0, -22.5], [41.9, 1.6, -18.8], 0.3, K.steelD, 8);
yardBatch.addBox(1.0, 0.8, 1.0, K.steel, 43.2, 2.6, -23);
yardBatch.build(surface);
beacons.forEach(function (bc) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 6),
    new THREE.MeshBasicMaterial({ color: C(K.orange) }),
  );
  m.position.set(bc.x, bc.y + 0.22, bc.z);
  surface.add(m);
  bc.mesh = m;
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.06, 0.12),
    new THREE.MeshBasicMaterial({ color: C(PAL.light.butter) }),
  );
  bar.position.copy(m.position);
  surface.add(bar);
  bc.bar = bar;
});
