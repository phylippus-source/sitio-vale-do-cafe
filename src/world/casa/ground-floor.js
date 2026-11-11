/* Casa Grande · térreo: porão de pedra, paredes, pisos, escada e os cômodos (capela, hall, salas, cozinha, despensa, banheiros, escritório). */
import { GF, UF } from '../../config/dimensions.js';
import { K, CW, WHT, IRON, MARB, AZB, AZW, TERRA, PAL } from '../../config/palette.js';
import {
  casaBaseBatch,
  casaWallBatch,
  wall,
  Y0,
  groundH,
  casaWalls,
  casaG,
  flrMat,
  casaInteriorBatch,
  casaUnlitBatch,
} from './base.js';

/* ---------- térreo: porão alto de pedra, paredes ocre, cunhais e cimalha brancos ---------- */
casaBaseBatch.addBox(26.8, GF - 0.2, 20.8, K.stone, 0, 0, 0);
for (let i = 0; i < 4; i++) casaBaseBatch.addBox(26.9, 0.05, 20.9, K.stoneD, 0, 0.2 + i * 0.18, 0);
[-9.5, -6.5, -3.5, 3.5, 6.5, 9.5].forEach(function (px) {
  casaWallBatch.addBox(0.6, 0.44, 0.16, PAL.dark.charcoal, px, 0.3, 10.46);
}); /* respiros gradeados do porão */
/* paredes externas */
wall(
  casaWallBatch,
  'x',
  -10,
  -13,
  13,
  [
    [-9, -7.2, 0.9, 2.9],
    [-3.9, -2.1, 0.9, 2.9],
    [2.1, 3.9, 0.9, 2.9],
    [7.2, 9, 0.9, 2.9],
  ],
  Y0,
  groundH,
  0.5,
  CW,
  's',
  -1,
);
wall(
  casaWallBatch,
  'z',
  -13,
  -10,
  10,
  [
    [-6, -4.2, 0.9, 2.9],
    [-1, 0.8, 0.9, 2.9],
    [4.2, 6, 0.9, 2.9],
  ],
  Y0,
  groundH,
  0.5,
  CW,
  's',
  1,
);
wall(
  casaWallBatch,
  'z',
  13,
  -10,
  10,
  [
    [-6, -4.2, 0.9, 2.9],
    [-1, 0.8, 0.9, 2.9],
    [4.2, 6, 0.9, 2.9],
  ],
  Y0,
  groundH,
  0.5,
  CW,
  's',
  1,
);
wall(
  casaWallBatch,
  'x',
  10,
  -13,
  13,
  [
    [-11.4, -9.6, 0.9, 2.9],
    [-3.8, -2.6, 0.9, 2.9],
    [-1.3, 1.3, 0, 3.4],
    [2.6, 3.8, 0.9, 2.9],
    [9.6, 11.4, 0.9, 2.9],
  ],
  Y0,
  groundH,
  0.5,
  CW,
  's',
  1,
);
/* cunhais e cimalha */
[
  [-13, -10],
  [13, -10],
  [-13, 10],
  [13, 10],
].forEach(function (c) {
  casaWallBatch.addBox(0.9, groundH + 0.2, 0.9, WHT, c[0], GF - 0.2, c[1]);
  casaWallBatch.addBox(1.0, 0.22, 1.0, K.stoneL, c[0], GF + groundH - 0.2, c[1]);
});
casaWallBatch.addBox(26.7, 0.32, 0.7, WHT, 0, GF + groundH - 0.28, 10.1);
casaWallBatch.addBox(26.7, 0.32, 0.7, WHT, 0, GF + groundH - 0.28, -10.1);
casaWallBatch.addBox(0.7, 0.32, 20.6, WHT, 13.1, GF + groundH - 0.28, 0);
casaWallBatch.addBox(0.7, 0.32, 20.6, WHT, -13.1, GF + groundH - 0.28, 0);
/* paredes internas (0,3 m) */
export const T = 0.3;
wall(casaWallBatch, 'x', 2, -13, -7, [], Y0, groundH - 0.04, T, WHT, 's');
wall(casaWallBatch, 'x', 2, -7, 13, [[-1.2, 1.2, 0, 3.2]], Y0, groundH - 0.04, T, WHT, 's');
/* desenho da planta: capela | hall | escritório; sala de visitas e jantar ao centro; cozinha, copa e serviço nas alas */
wall(
  casaWallBatch,
  'z',
  -7,
  -10,
  10,
  [
    [5, 6.4, 0, 3.0],
    [-7, -5.6, 0, 3.0],
    [-0.4, 0.8, 0, 3.0],
  ],
  Y0,
  groundH - 0.04,
  T,
  WHT,
  's',
);
wall(
  casaWallBatch,
  'z',
  7,
  -10,
  10,
  [
    [5, 6.4, 0, 3.0],
    [-7, -5.8, 0, 3.0],
    [-2.5, -1.2, 0, 3.0],
  ],
  Y0,
  groundH - 0.04,
  T,
  WHT,
  's',
);
wall(casaWallBatch, 'x', -4, -7, 7, [[-2.5, 2.5, 0, 3.2]], Y0, groundH - 0.04, T, WHT, 's');
wall(casaWallBatch, 'x', -1, -13, -7, [[-10, -8.8, 0, 3.0]], Y0, groundH - 0.04, T, WHT, 's');
wall(casaWallBatch, 'x', -3, 7, 13, [], Y0, groundH - 0.04, T, WHT, 's');
casaWallBatch.build(casaWalls);
/* ---------- pisos térreo (não se sobrepõem): ladrilho hidráulico, tábua corrida, mármore ---------- */
function addGroundFloor(x1, z1, x2, z2, c) {
  casaBaseBatch.addBox(x2 - x1, 0.2, z2 - z1, c, (x1 + x2) / 2, GF - 0.2, (z1 + z2) / 2);
}
addGroundFloor(-13, 2, -7, 10, 0xcdb08a);
addGroundFloor(-7, 2, 7, 10, MARB);
addGroundFloor(7, 2, 13, 10, PAL.wood.floorBoard);
addGroundFloor(-13, -1, -7, 2, 0xe6d6b0);
addGroundFloor(-13, -10, -7, -1, TERRA);
addGroundFloor(-7, -4, 7, 2, PAL.wood.oak);
addGroundFloor(-7, -10, 7, -4, PAL.wood.oak);
addGroundFloor(7, -3, 13, 2, 0x3b6ea5);
addGroundFloor(7, -10, 13, -3, K.concD);
export const casaBaseMesh = casaBaseBatch.build(casaG, { mat: flrMat, outline: false });
for (let i = 0; i < 7; i++)
  for (let j = 0; j < 8; j++)
    if ((i + j) % 2)
      casaInteriorBatch.addBox(
        1.96,
        0.03,
        0.96,
        0x3d3d44,
        -6 + i * 2,
        GF,
        2.5 + j * 0.9 * 1.0,
      ); /* xadrez de mármore no hall (peças pretas) */
/* escada interna: lance único que sobe do hall ao sobrado */
for (let i = 0; i < 24; i++) {
  const sh = GF + ((i + 1) * (UF - GF)) / 24;
  casaInteriorBatch.addBox(
    2.0,
    sh - GF + 0.0,
    0.275,
    [MARB, 0xe4e2d8][i % 2],
    0,
    GF,
    9.4 - (i + 0.5) * 0.275,
  );
}
[-1.05, 1.05].forEach(function (sx) {
  casaInteriorBatch.addBeam([sx, GF + 0.9, 9.6], [sx, UF + 0.9, 2.8], 0.04, IRON, 5);
  for (let i = 0; i <= 24; i += 2)
    casaInteriorBatch.addBox(0.05, 0.9, 0.05, IRON, sx, GF + (i * (UF - GF)) / 24, 9.4 - i * 0.275);
});
/* capela: altar de madeira entalhada e dourada, tapete, bancos */
casaInteriorBatch.addBox(3.0, 0.3, 1.2, K.woodD, -10, GF, 3.0);
casaInteriorBatch.addBox(2.6, 2.4, 0.4, K.woodD, -10, GF, 2.4);
casaInteriorBatch.addBox(2.2, 2.0, 0.1, PAL.clay.gold, -10, GF + 0.2, 2.65);
casaInteriorBatch.addBox(0.3, 0.9, 0.3, PAL.clay.gold, -10, GF + 2.4, 2.4);
casaInteriorBatch.addBox(1.1, 0.03, 5, PAL.fabric.brickRed, -10, GF, 6.2);
for (let i = 0; i < 3; i++) {
  casaInteriorBatch.addBox(2.8, 0.5, 0.6, K.woodL, -10, GF, 5.2 + i * 1.3);
  casaInteriorBatch.addBox(2.8, 0.5, 0.1, K.woodD, -10, GF + 0.5, 5.0 + i * 1.3);
}
/* hall: bancos de ferro, relógio de pé, quadros (molduras) */
casaInteriorBatch.addBox(0.6, 2.2, 0.4, K.woodD, 5.6, GF, 2.4);
casaInteriorBatch.addBox(0.4, 0.5, 0.1, PAL.clay.gold, 5.6, GF + 1.2, 2.62);
casaInteriorBatch.addBox(1.4, 0.5, 0.5, IRON, -4.5, GF, 9.3);
casaInteriorBatch.addBox(1.4, 0.1, 0.55, K.woodL, -4.5, GF + 0.5, 9.3);
[
  [-5, 2.2],
  [-3, 2.2],
  [3, 2.2],
].forEach(function (q, n) {
  casaInteriorBatch.addBox(1.0, 1.3, 0.06, K.woodD, q[0], GF + 1.4, q[1] + 0.2);
  casaInteriorBatch.addBox(
    0.82,
    1.1,
    0.04,
    [0x4a6b8f, 0x8f6b4a, 0x5f8f5a][n],
    q[0],
    GF + 1.5,
    q[1] + 0.24,
  );
});
/* sala de jantar: mesa para 14, cadeiras, aparador */
casaInteriorBatch.addBox(6.0, 0.12, 1.8, K.woodD, 0, GF + 0.76, -7.4);
[
  [-2.8, -8.1],
  [2.8, -8.1],
  [-2.8, -6.7],
  [2.8, -6.7],
].forEach(function (l) {
  casaInteriorBatch.addBox(0.18, 0.76, 0.18, K.woodD, l[0], GF, l[1]);
});
for (let i = 0; i < 7; i++) {
  casaInteriorBatch.addBox(0.45, 0.5, 0.45, K.woodL, -2.7 + i * 0.9, GF, -8.5);
  casaInteriorBatch.addBox(0.45, 0.5, 0.45, K.woodL, -2.7 + i * 0.9, GF, -6.3);
  casaInteriorBatch.addBox(0.45, 0.55, 0.06, K.woodD, -2.7 + i * 0.9, GF + 0.5, -8.75);
}
casaInteriorBatch.addBox(3.4, 0.9, 0.5, K.woodD, 0, GF, -9.6);
casaInteriorBatch.addBox(3.5, 0.06, 0.55, MARB, 0, GF + 0.9, -9.6);
[[-1.2], [0], [1.2]].forEach(function (c) {
  casaInteriorBatch.addBox(0.5, 0.4, 0.2, PAL.clay.gold, c[0], GF + 1.4, -9.7);
});
/* sala de visitas: sofá, poltronas, tapete, piano */
casaInteriorBatch.addCylinder(2.0, 0.03, PAL.fabric.brickRed, 0, GF, -1, 22);
casaInteriorBatch.addBox(3.0, 0.55, 0.9, PAL.fabric.burgundy, 0, GF, -2.9);
casaInteriorBatch.addBox(3.0, 0.6, 0.25, PAL.fabric.burgundy, 0, GF + 0.5, -3.3);
casaInteriorBatch.addBox(1.2, 0.4, 0.8, K.woodD, 0, GF, -0.8);
[
  [-3.6, -0.5],
  [3.6, -0.5],
].forEach(function (p) {
  casaInteriorBatch.addBox(0.9, 0.5, 0.9, PAL.paint.shutterGreen, p[0], GF, p[1]);
  casaInteriorBatch.addBox(0.9, 0.5, 0.2, PAL.paint.shutterGreen, p[0], GF + 0.4, p[1] - 0.4);
});
casaInteriorBatch.addBox(1.6, 0.9, 0.7, PAL.dark.charcoal, 5.3, GF, 0.8);
casaInteriorBatch.addBox(1.7, 0.06, 0.9, K.woodD, 5.3, GF + 0.9, 0.8);
/* cozinha de serviço: fogão a lenha de ferro com coifa, bancada, pia, mesa, azulejos portugueses nas paredes */
casaInteriorBatch.addBox(0.06, 1.6, 10.8, AZW, -12.72, GF + 0.9, -5.6);
for (let i = 0; i < 9; i++)
  casaInteriorBatch.addBox(0.07, 0.4, 0.4, AZB, -12.7, GF + 0.9 + (i % 4) * 0.4, -10.4 + i * 1.2);
casaInteriorBatch.addBox(2.2, 1.0, 1.1, IRON, -11.4, GF, -9.2);
casaInteriorBatch.addCone(1.0, 1.0, IRON, -11.4, GF + 1.0, -9.2, 4, [0, Math.PI / 4, 0]);
casaInteriorBatch.addCylinder(0.2, 1.8, IRON, -11.4, GF + 2.0, -9.2, 8);
casaUnlitBatch.addBox(0.8, 0.25, 0.04, PAL.flora.pumpkin, -11.4, GF + 0.55, -8.62);
casaInteriorBatch.addBox(0.7, 0.9, 4.5, K.woodL, -12.3, GF, -4.8);
casaInteriorBatch.addBox(0.75, 0.06, 4.6, PAL.light.cream, -12.3, GF + 0.9, -4.8);
casaInteriorBatch.addBox(0.5, 0.12, 0.9, K.steel, -12.3, GF + 0.94, -4.2);
casaInteriorBatch.addBox(2.6, 0.14, 1.4, K.wood, -9.6, GF + 0.75, -5.0);
[
  [-1.1, -0.5],
  [1.1, -0.5],
  [-1.1, 0.5],
  [1.1, 0.5],
].forEach(function (l) {
  casaInteriorBatch.addBox(0.14, 0.75, 0.14, K.woodD, -9.6 + l[0], GF, -5.0 + l[1]);
});
for (let i = 0; i < 5; i++)
  casaInteriorBatch.addCylinder(0.12, 0.2, K.copper, -12.4 + 0.0, GF + 2.1, -9.5 + i * 0.5, 6);
/* copa (balcão de passa-pratos) */
casaInteriorBatch.addBox(0.8, 0.95, 2.4, K.woodD, -12.4, GF, 0.5);
casaInteriorBatch.addBox(2.5, 0.9, 0.8, K.woodL, -8.5, GF, 0.6);
/* despensa de catástrofe (42 m²): prateleiras, barris, galões, freezer */
function jarColor(k) {
  return [
    PAL.flora.coral,
    PAL.flora.marigold,
    PAL.flora.sage,
    PAL.light.wheat,
    PAL.flora.purple,
    PAL.clay.copperBrown,
  ][k % 6];
}
function addPantryItem(B, x, y, z, k) {
  const m = k % 5;
  if (m === 0 || m === 3) B.addCylinder(0.12, 0.3, jarColor(k), x, y, z, 6);
  else if (m === 1) B.addCylinder(0.09, 0.2, K.steel, x, y, z, 6);
  else if (m === 2) B.addBox(0.34, 0.24, 0.3, PAL.clay.sandGold, x, y, z);
  else B.addBox(0.3, 0.3, 0.3, [K.woodL, PAL.clay.mustard, PAL.clay.terracotta][k % 3], x, y, z);
}
function shelfX(B, x1, x2, z, y0, t) {
  const L = x2 - x1,
    n = Math.floor(L / 0.5),
    nu = Math.max(1, Math.round(L / 1.5));
  for (let a = 0; a < 3; a++) {
    B.addBox(L, 0.06, 0.5, K.woodL, (x1 + x2) / 2, y0 + 0.55 + a * 0.7, z);
    for (let b = 0; b < n; b++)
      addPantryItem(B, x1 + 0.25 + b * 0.5, y0 + 0.61 + a * 0.7, z, b + a * 2 + (t || 0));
  }
  for (let c = 0; c <= nu; c++) B.addBox(0.08, 2.3, 0.54, K.woodD, x1 + (c * L) / nu, y0, z);
}
function shelfZ(B, z1, z2, x, y0, t) {
  const L = z2 - z1,
    n = Math.floor(L / 0.5),
    nu = Math.max(1, Math.round(L / 1.5));
  for (let a = 0; a < 3; a++) {
    B.addBox(0.5, 0.06, L, K.woodL, x, y0 + 0.55 + a * 0.7, (z1 + z2) / 2);
    for (let b = 0; b < n; b++)
      addPantryItem(B, x, y0 + 0.61 + a * 0.7, z1 + 0.25 + b * 0.5, b + a * 3 + (t || 0));
  }
  for (let c = 0; c <= nu; c++) B.addBox(0.54, 2.3, 0.08, K.woodD, x, y0, z1 + (c * L) / nu);
}
shelfX(casaInteriorBatch, 7.4, 12.7, -9.6, GF);
shelfZ(casaInteriorBatch, -9.4, -3.4, 7.4, GF);
shelfZ(casaInteriorBatch, -9.4, -3.4, 12.7, GF, 2);
[
  [9.0, -6.8],
  [10.0, -6.8],
  [9.0, -5.6],
  [10.0, -5.6],
].forEach(function (b) {
  casaInteriorBatch.addCylinder(0.45, 0.9, K.wood, b[0], GF, b[1], 10, 0.42);
  casaInteriorBatch.addCylinder(0.47, 0.06, K.steelD, b[0], GF + 0.45, b[1], 10);
});
for (let i = 0; i < 12; i++) {
  casaInteriorBatch.addCylinder(
    0.22,
    0.5,
    PAL.flora.cornflower,
    8.4 + (i % 4) * 0.5,
    GF,
    -4.6 + ((i / 4) | 0) * 0.5,
    8,
  );
}
casaInteriorBatch.addBox(2.0, 0.85, 0.8, K.white, 11.4, GF, -5.0);
casaInteriorBatch.addBox(2.05, 0.08, 0.85, K.steel, 11.4, GF + 0.85, -5.0);
/* banheiros coletivos (azulejo azul e branco, louças) */
export function toilet(B, x, y, z, ry) {
  B.setOrigin(x, 0, z, ry || 0);
  B.addBox(0.42, 0.42, 0.6, K.white, 0, y, 0);
  B.addBox(0.4, 0.55, 0.2, K.white, 0, y, -0.38);
  B.addBox(0.44, 0.05, 0.5, K.steel, 0, y + 0.42, 0.02);
  B.setOrigin(0, 0, 0, 0);
}
export function sink(B, x, y, z, ry) {
  B.setOrigin(x, 0, z, ry || 0);
  B.addCylinder(0.1, 0.7, K.white, 0, y, 0, 6);
  B.addBox(0.65, 0.14, 0.48, K.white, 0, y + 0.7, 0);
  B.addCylinder(0.035, 0.3, K.steel, 0, y + 0.84, -0.17, 5);
  B.addBox(0.7, 0.7, 0.04, 0x9bd9f1, 0, y + 1.3, -0.3);
  B.setOrigin(0, 0, 0, 0);
}
/* chuveiro orientado: haste e ducha no lado (x - sx*0.5, z + sz*0.5), vidro do lado oposto em x */
export function shower2(B, x, y, z, sx, sz) {
  B.addBox(1.1, 0.08, 1.1, 0xeaf3f7, x, y, z);
  B.addCylinder(0.03, 1.9, K.steel, x - sx * 0.5, y + 0.08, z + sz * 0.5, 5);
  B.addBox(0.3, 0.05, 0.3, K.steel, x - sx * 0.38, y + 1.85, z + sz * 0.45);
  B.addBox(0.04, 1.9, 1.1, PAL.glass.showerGlass, x + sx * 0.55, y + 0.08, z);
}
casaInteriorBatch.addBox(0.06, 1.5, 4.8, AZB, 12.72, GF, -0.5);
casaInteriorBatch.addBox(0.06, 0.48, 4.8, AZW, 12.7, GF + 1.01, -0.5);
toilet(casaInteriorBatch, 8.0, GF, 1.35, Math.PI);
toilet(casaInteriorBatch, 9.4, GF, 1.35, Math.PI);
sink(casaInteriorBatch, 10.8, GF, 1.5, Math.PI);
sink(casaInteriorBatch, 12.1, GF, 1.5, Math.PI);
shower2(casaInteriorBatch, 8.6, GF, -2.2, 1, -1);
shower2(casaInteriorBatch, 11.0, GF, -2.2, 1, -1);
/* escritório: escrivaninha, estante, mapa */
casaInteriorBatch.addBox(2.2, 0.1, 1.0, K.woodD, 10.0, GF + 0.76, 8.6);
casaInteriorBatch.addBox(2.2, 0.76, 0.12, K.woodD, 10.0, GF, 8.2);
casaInteriorBatch.addBox(0.5, 0.5, 0.5, K.woodL, 10.0, GF, 7.6);
shelfZ(casaInteriorBatch, 3.2, 6.6, 12.7, GF, 4);
casaInteriorBatch.addBox(1.6, 1.1, 0.05, 0xe8d9b0, 10.0, GF + 1.2, 9.7);
casaInteriorBatch.build(casaG);
casaUnlitBatch.build(casaG, { unlit: true, outline: false });
