/* Engenho 1850 (22 × 10 m): paredes de pedra, telhado com painéis solares, moenda, forja e oficina moderna. */
import * as THREE from 'three';
import { GX, cylG, coneG } from '../core/geometries.js';
import { Batch } from '../core/Batch.js';
import { BARN_ORIGIN } from '../config/dimensions.js';
import { K, PAL } from '../config/palette.js';
import { surface, addCollider } from './scene.js';

/* ================= ENGENHO 1850 · 22 × 10 m ================= */
export const barnG = new THREE.Group();
barnG.position.set(BARN_ORIGIN.x, BARN_ORIGIN.y, BARN_ORIGIN.z);
surface.add(barnG);
export const barnWalls = new THREE.Group(),
  barnRoofG = new THREE.Group();
barnG.add(barnWalls);
barnG.add(barnRoofG);
const BH = 4.8,
  BTH = Math.atan2(3.6, 6.1);
addCollider(21, -43, 43, -42.2);
addCollider(21, -43, 21.8, -33);
addCollider(42.2, -43, 43, -33);
addCollider(21, -33.8, 28.5, -33);
addCollider(33.5, -33.8, 38, -33);
addCollider(39.4, -33.8, 43, -33); /* engenho: portão 5 m e porta de 1,4 m */
const barnWallBatch = new Batch();
const barnRoofBatch = new Batch();
const barnInteriorBatch = new Batch();
const barnUnlitBatch = new Batch();
const glassC = PAL.glass.windowDeep;
/* paredes de pedra com 80 cm */
barnWallBatch.addBox(22, BH, 0.8, K.stone, 0, 0, -4.6);
barnWallBatch.addBox(0.8, BH, 10, K.stone, -10.6, 0, 0);
barnWallBatch.addBox(0.8, BH, 10, K.stone, 10.6, 0, 0);
barnWallBatch.addBox(7.5, BH, 0.8, K.stone, -7.25, 0, 4.6);
barnWallBatch.addBox(4.5, BH, 0.8, K.stone, 3.75, 0, 4.6);
barnWallBatch.addBox(3.6, BH, 0.8, K.stone, 9.2, 0, 4.6);
barnWallBatch.addBox(5.0, 0.8, 0.8, K.stone, -1, 4.0, 4.6);
barnWallBatch.addBox(1.4, 1.8, 0.8, K.stone, 6.7, 3.0, 4.6);
[1, 2, 3, 4].forEach(function (y) {
  barnWallBatch.addBox(22, 0.09, 0.05, K.stoneD, 0, y, -5.02);
  barnWallBatch.addBox(0.05, 0.09, 10, K.stoneD, -11.02, y, 0);
  barnWallBatch.addBox(0.05, 0.09, 10, K.stoneD, 11.02, y, 0);
  barnWallBatch.addBox(7.5, 0.09, 0.05, K.stoneD, -7.25, y, 5.02);
  barnWallBatch.addBox(4.5, 0.09, 0.05, K.stoneD, 3.75, y, 5.02);
  barnWallBatch.addBox(3.6, 0.09, 0.05, K.stoneD, 9.2, y, 5.02);
});
for (let i = 0; i < 5; i++)
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].forEach(function (c) {
    barnWallBatch.addBox(
      i % 2 ? 1.1 : 0.8,
      0.96,
      i % 2 ? 0.8 : 1.1,
      K.stoneL,
      c[0] * 10.7,
      i * 0.96,
      c[1] * 4.6,
    );
  });
/* janelas e portas */
[
  [-7.25, 5.02],
  [9.4, 5.02],
].forEach(function (p) {
  barnWallBatch.addBox(1.8, 1.7, 0.1, K.ocre, p[0], 1.6, p[1]);
  barnWallBatch.addBox(1.5, 1.4, 0.12, glassC, p[0], 1.75, p[1] + 0.02);
  barnWallBatch.addBox(0.08, 1.4, 0.14, K.woodD, p[0], 1.75, p[1] + 0.03);
});
[-7, 0, 7].forEach(function (x) {
  barnWallBatch.addBox(1.8, 1.7, 0.1, K.ocre, x, 1.8, -5.02);
  barnWallBatch.addBox(1.5, 1.4, 0.12, glassC, x, 1.95, -5.03);
});
[-11.02, 11.02].forEach(function (x) {
  [-2, 2].forEach(function (z) {
    barnWallBatch.addBox(0.1, 1.7, 1.8, K.ocre, x, 1.8, z);
    barnWallBatch.addBox(0.12, 1.4, 1.5, glassC, x, 1.95, z);
  });
});
barnWallBatch.addBox(0.5, 4.0, 1.1, K.woodD, -3.5, 0, 4.6);
barnWallBatch.addBox(0.5, 4.0, 1.1, K.woodD, 1.5, 0, 4.6);
barnWallBatch.addBox(1.3, 2.9, 0.2, K.wood, 6.7, 0, 4.75);
barnWallBatch.addBox(0.12, 2.9, 0.26, K.woodD, 6.7, 0, 4.78);
barnWallBatch.addBox(1.6, 0.14, 0.3, K.woodD, 6.7, 2.9, 4.76);
barnWallBatch.build(barnWalls);

/* telhado de duas águas + 48 painéis solares na vertente frontal */
const ridgeY = BH + 3.6,
  sn = Math.sin(BTH),
  cs = Math.cos(BTH),
  slopeLen = Math.hypot(6.1, 3.6) + 0.3;
[1, -1].forEach(function (sg) {
  const tm = slopeLen / 2 - 0.1;
  barnRoofBatch.addGeometry(
    GX.box,
    K.roof,
    0,
    ridgeY - tm * sn + 0.0,
    sg * tm * cs,
    [24, 0.3, slopeLen],
    [sg * BTH, 0, 0],
  );
  for (let t = 0.6; t < slopeLen - 0.3; t += 0.75) {
    barnRoofBatch.addGeometry(
      GX.box,
      K.roofD,
      0,
      ridgeY - t * sn + 0.18 * cs,
      sg * (t * cs + 0.18 * sn),
      [24, 0.05, 0.09],
      [sg * BTH, 0, 0],
    );
  }
});
for (let pr = 0; pr < 3; pr++)
  for (let pc = 0; pc < 16; pc++) {
    const t = 1.5 + pr * 1.95,
      px = -9.6 + pc * 1.28,
      d = 0.26;
    barnRoofBatch.addGeometry(
      GX.box,
      K.steel,
      px,
      ridgeY - t * sn + d * cs,
      t * cs + d * sn,
      [1.2, 0.08, 1.82],
      [BTH, 0, 0],
    );
    barnRoofBatch.addGeometry(
      GX.box,
      [0x2c5aa6, 0x27509a][(pr + pc) % 2],
      px,
      ridgeY - t * sn + (d + 0.06) * cs,
      t * cs + (d + 0.06) * sn,
      [1.1, 0.06, 1.7],
      [BTH, 0, 0],
    );
  }
barnRoofBatch.addBox(24.4, 0.3, 0.55, K.roofD, 0, ridgeY - 0.02, 0);
const tri = new THREE.Shape();
tri.moveTo(-5.4, 0);
tri.lineTo(5.4, 0);
tri.lineTo(0, 3.35);
const gg = new THREE.ExtrudeGeometry(tri, { depth: 0.8, bevelEnabled: false });
gg.translate(0, 0, -0.4);
gg.rotateY(Math.PI / 2);
barnRoofBatch.addGeometry(gg, K.stone, -10.6, BH, 0);
barnRoofBatch.addGeometry(gg, K.stone, 10.6, BH, 0);
barnRoofBatch.addBox(1.4, 5.2, 1.4, K.stone, 7, BH - 0.2, -2.5);
barnRoofBatch.addBox(1.8, 0.3, 1.8, K.stoneD, 7, BH + 5.0, -2.5);
barnRoofBatch.build(barnRoofG);

/* interior: engenho de 1850 à esquerda, oficina moderna à direita */
barnInteriorBatch.addBox(21.4, 0.16, 9.2, 0xcbc4b4, 0, 0, 0);
barnInteriorBatch.addBeam([-10.4, 2.0, -3.2], [10.9, 2.0, -3.2], 0.14, K.steel, 8);
[-9, -4.5, 0, 4.5, 9].forEach(function (x) {
  barnInteriorBatch.addBox(0.5, 0.4, 0.5, PAL.clay.ochreDark, x, 1.8, -3.2);
  barnInteriorBatch.addBox(0.36, 1.8, 0.36, K.woodD, x, 0.16, -3.7);
});
[-8, -4, 2, 6].forEach(function (x) {
  barnInteriorBatch.addGeometry(
    cylG(1, 16),
    K.woodL,
    x,
    2.0,
    -3.2,
    [0.9, 0.34, 0.9],
    [0, 0, Math.PI / 2],
  );
});
[
  [-8, -8.2, -1.6],
  [-4, -5.0, -1.8],
  [2, -1.5, -1.8],
  [6, 4.0, -3.2],
].forEach(function (m) {
  barnInteriorBatch.addBeam([m[0], 1.7, -3.2], [m[1], 0.9, m[2]], 0.05, K.black, 4);
});
/* serra de fita */
barnInteriorBatch.addBox(0.5, 3.4, 1.3, K.steelD, -8.6, 0.16, -1.6);
barnInteriorBatch.addGeometry(
  cylG(1, 16),
  K.steel,
  -8.6,
  3.0,
  -1.6,
  [0.9, 0.18, 0.9],
  [Math.PI / 2, 0, 0],
);
barnInteriorBatch.addGeometry(
  cylG(1, 16),
  K.steel,
  -8.6,
  0.8,
  -1.6,
  [0.9, 0.18, 0.9],
  [Math.PI / 2, 0, 0],
);
barnInteriorBatch.addBox(0.05, 2.2, 0.1, K.black, -8.0, 0.8, -1.6);
barnInteriorBatch.addBox(3.0, 0.16, 2.2, K.woodL, -8.6, 1.1, -0.6);
barnInteriorBatch.addGeometry(
  cylG(1, 8),
  K.woodD,
  -8.6,
  1.55,
  -0.6,
  [0.38, 2.4, 0.38],
  [0, 0, Math.PI / 2],
);
/* moenda de pedra de 80 cm */
barnInteriorBatch.addBox(2.2, 0.8, 2.2, K.woodD, -4.2, 0.16, -1.9);
barnInteriorBatch.addCylinder(0.8, 0.3, K.concD, -4.2, 0.96, -1.9, 18);
barnInteriorBatch.addCylinder(0.72, 0.3, 0xb7b3a9, -4.2, 1.26, -1.9, 18);
barnInteriorBatch.addGeometry(
  coneG(4),
  K.wood,
  -4.2,
  2.1,
  -1.9,
  [0.8, 1.0, 0.8],
  [Math.PI, Math.PI / 4, 0],
);
for (let i = 0; i < 4; i++)
  barnInteriorBatch.addBox(0.5, 0.6, 0.4, [0xdcc590, 0xd2b97f][i % 2], -2.6 + i * 0.55, 0.16, -0.6);
/* engenho de cana de 3 rolos (300 L/h) */
barnInteriorBatch.addBox(2.4, 0.35, 1.8, K.woodD, -1.4, 0.16, -2.0);
[
  [-1.4, -1.4],
  [-0.6, -2.4],
  [-2.2, -2.4],
].forEach(function (p) {
  barnInteriorBatch.addCylinder(0.3, 1.5, PAL.clay.ochreDark, p[0], 0.5, p[1], 12);
  barnInteriorBatch.addCylinder(0.42, 0.12, K.steel, p[0], 2.0, p[1], 10);
});
barnInteriorBatch.addBeam([-3.3, 0.5, -0.4], [-0.4, 1.1, -0.9], 0.1, 0x7fb544, 5);
barnInteriorBatch.addBeam([-3.3, 0.7, -0.2], [-0.4, 1.3, -0.7], 0.1, 0x6aa238, 5);
barnInteriorBatch.addBeam([-3.3, 0.9, -0.6], [-0.4, 1.0, -1.1], 0.1, 0x93c654, 5);
/* bomba de pistão duplo */
[-9.3, -8.5].forEach(function (x) {
  barnInteriorBatch.addCylinder(0.36, 1.3, K.red, x, 0.16, 2.6, 10);
  barnInteriorBatch.addCylinder(0.07, 1.1, K.steel, x, 1.4, 2.6, 6);
});
barnInteriorBatch.addBox(1.4, 0.14, 0.14, K.steel, -8.9, 2.5, 2.6);
/* forja de ferreiro com bigorna e fole */
barnInteriorBatch.addBox(2.4, 1.3, 1.8, PAL.clay.terracotta, -5.4, 0.16, 2.9);
barnInteriorBatch.addCone(1.1, 1.5, K.steelD, -5.4, 1.46, 2.9, 4);
barnInteriorBatch.addCylinder(0.22, 2.0, K.steelD, -5.4, 2.96, 2.9, 8);
barnUnlitBatch.addBox(1.6, 0.12, 1.0, PAL.flora.pumpkin, -5.4, 1.46, 2.9);
barnInteriorBatch.addCylinder(0.38, 0.8, K.woodD, -3.4, 0.16, 2.8, 8);
barnInteriorBatch.addBox(0.9, 0.28, 0.4, K.black, -3.4, 0.96, 2.8);
barnInteriorBatch.addBox(0.3, 0.2, 0.3, K.black, -2.9, 1.1, 2.8);
barnInteriorBatch.addBox(1.0, 0.7, 0.9, 0x8a5a30, -7, 0.16, 1.8);
/* elevador oculto (3 × 5 m, 4,5 t) sob a porta da garagem */
barnInteriorBatch.addBox(3.0, 0.1, 5.0, K.yellow, -1, 0.16, 2.2);
for (let i = 0; i < 6; i++)
  barnInteriorBatch.addBox(3.0, 0.12, 0.38, K.black, -1, 0.16, -0.1 + i * 0.9);
/* oficina moderna: torno Nardini, fresadora, solda, prensa de 30 t, bancada */
barnInteriorBatch.addBox(3.0, 0.9, 1.0, K.steelD, 4, 0.16, -3.2);
barnInteriorBatch.addBox(3.2, 0.5, 0.9, 0x3d6b9e, 4, 1.06, -3.2);
barnInteriorBatch.addBox(0.8, 0.9, 0.9, 0x2f5a8a, 2.8, 1.56, -3.2);
barnInteriorBatch.addCylinder(0.3, 0.5, K.steel, 2.5, 1.8, -3.2, 10, 0.3, [0, 0, Math.PI / 2]);
barnInteriorBatch.addBox(0.5, 0.6, 0.5, K.steel, 5.5, 1.56, -3.2);
barnInteriorBatch.addBox(1.2, 0.4, 1.2, PAL.fabric.emerald, 7.2, 0.16, -3.2);
barnInteriorBatch.addBox(0.5, 2.4, 0.5, PAL.fabric.emerald, 7.2, 0.56, -3.6);
barnInteriorBatch.addBox(0.9, 0.6, 1.2, PAL.fabric.emerald, 7.2, 2.8, -3.1);
barnInteriorBatch.addBox(1.5, 0.2, 1.0, K.steel, 7.2, 1.5, -2.9);
barnInteriorBatch.addBox(2.4, 0.18, 1.3, K.steelD, 8, 1.0, -0.6);
[
  [-1, -0.5],
  [1, -0.5],
  [-1, 0.5],
  [1, 0.5],
].forEach(function (l) {
  barnInteriorBatch.addBox(0.16, 0.9, 0.16, K.steelD, 8 + l[0], 0.16, -0.6 + l[1]);
});
barnInteriorBatch.addBox(0.9, 1.0, 0.9, K.red, 9.4, 0.16, 0.6);
barnInteriorBatch.addBeam([9.0, 1.0, 0.4], [8.0, 1.4, -0.6], 0.05, K.black, 4);
[
  [7.6, 1.3, -0.6, 0.16, PAL.light.white],
  [7.9, 1.45, -0.5, 0.12, 0x9fe3ff],
  [7.3, 1.35, -0.8, 0.1, 0xfff0a0],
  [8.0, 1.5, -0.7, 0.1, PAL.light.white],
  [7.7, 1.55, -0.9, 0.08, PAL.flora.sunflower],
].forEach(function (s) {
  barnUnlitBatch.addGeometry(GX.ico0, s[4], s[0], s[1], s[2], s[3]);
});
[4.4, 6.0].forEach(function (x) {
  barnInteriorBatch.addBox(0.28, 2.8, 0.28, K.red, x, 0.16, 1.4);
});
barnInteriorBatch.addBox(2.0, 0.4, 0.4, K.red, 5.2, 2.6, 1.4);
barnInteriorBatch.addCylinder(0.22, 1.0, K.steel, 5.2, 1.6, 1.4, 8);
barnInteriorBatch.addBox(1.6, 0.2, 0.7, K.red, 5.2, 0.16, 1.4);
barnInteriorBatch.addBox(2.6, 0.14, 1.3, K.woodL, 7.2, 1.1, 3.7);
[
  [-1.1, -0.5],
  [1.1, -0.5],
  [-1.1, 0.5],
  [1.1, 0.5],
].forEach(function (l) {
  barnInteriorBatch.addBox(0.12, 0.95, 0.12, K.woodD, 7.2 + l[0], 0.16, 3.7 + l[1]);
});
barnInteriorBatch.addBox(0.8, 0.5, 0.1, K.black, 6.6, 1.24, 3.3);
barnUnlitBatch.addBox(0.7, 0.4, 0.02, 0x44ffb0, 6.6, 1.3, 3.36);
barnInteriorBatch.addBox(0.4, 0.04, 0.3, PAL.fabric.jade, 7.4, 1.24, 3.8);
barnInteriorBatch.addBox(0.3, 0.04, 0.25, PAL.fabric.jade, 7.9, 1.24, 3.5);
barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 9.8, 0.16, -3.8);
barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 9.8, 0.66, -3.8);
barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 8.7, 0.16, -3.8);
barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 9.5, 0.16, 3.0);
barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 9.5, 0.66, 3.0);
barnInteriorBatch.addBox(0.5, 0.12, 0.12, K.steel, 9.5, 1.2, 3.0);
barnInteriorBatch.build(barnG);
barnUnlitBatch.build(barnG, { unlit: true, outline: false });
