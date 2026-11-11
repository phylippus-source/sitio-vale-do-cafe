/* Casa Grande · sobrado: paredes, fachada com balcão, partições, banheiros, laje, pisos, suítes e lustres. */
import { GX } from '../../core/geometries.js';
import { UHT } from '../../config/dimensions.js';
import { K, CW, WHT, IRON, AZB, TERRA, PAL } from '../../config/palette.js';
import {
  upperWallBatch,
  wall,
  upperInteriorBatch,
  casaUpW,
  upperUnlitBatch,
  casaUp,
} from './base.js';
import { T, toilet, sink, shower2 } from './ground-floor.js';

/* ---------- sobrado: paredes, balcão de ferro, 6 suítes, sala central ---------- */
upperWallBatch.addBox(26.7, 0.2, 0.0, K.black, 0, -9, 0); /* (sem efeito) */
wall(
  upperWallBatch,
  'x',
  -10,
  -13,
  13,
  [
    [-9, -7.2, 0.9, 3.0],
    [-3.9, -2.1, 0.9, 3.0],
    [2.1, 3.9, 0.9, 3.0],
    [7.2, 9, 0.9, 3.0],
  ],
  0,
  UHT,
  0.5,
  CW,
  'a',
  -1,
);
wall(
  upperWallBatch,
  'z',
  -13,
  -10,
  10,
  [
    [-6, -4.2, 0.9, 3.0],
    [-1, 0.8, 0.9, 3.0],
    [4.2, 6, 0.9, 3.0],
  ],
  0,
  UHT,
  0.5,
  CW,
  'a',
  1,
);
wall(
  upperWallBatch,
  'z',
  13,
  -10,
  10,
  [
    [-6, -4.2, 0.9, 3.0],
    [-1, 0.8, 0.9, 3.0],
    [4.2, 6, 0.9, 3.0],
  ],
  0,
  UHT,
  0.5,
  CW,
  'a',
  1,
);
/* fachada do sobrado: 8 portas-janela até o chão, com balcão corrido */
wall(
  upperWallBatch,
  'x',
  10,
  -13,
  13,
  [
    [-11.9, -10.3, 0, 3.1],
    [-9.2, -7.6, 0, 3.1],
    [-6.5, -4.9, 0, 3.1],
    [-3.8, -2.2, 0, 3.1],
    [2.2, 3.8, 0, 3.1],
    [4.9, 6.5, 0, 3.1],
    [7.6, 9.2, 0, 3.1],
    [10.3, 11.9, 0, 3.1],
  ],
  0,
  UHT,
  0.5,
  CW,
  'a',
  1,
);
[
  [-13, -10],
  [13, -10],
  [-13, 10],
  [13, 10],
].forEach(function (c) {
  upperWallBatch.addBox(0.9, UHT + 0.02, 0.9, WHT, c[0], 0, c[1]);
});
upperWallBatch.addBox(26.7, 0.34, 0.7, WHT, 0, UHT - 0.3, 10.1);
upperWallBatch.addBox(26.7, 0.34, 0.7, WHT, 0, UHT - 0.3, -10.1);
upperWallBatch.addBox(0.7, 0.34, 20.6, WHT, 13.1, UHT - 0.3, 0);
upperWallBatch.addBox(0.7, 0.34, 20.6, WHT, -13.1, UHT - 0.3, 0);
[-11.1, -8.4, -5.7, -3.0, 3.0, 5.7, 8.4, 11.1].forEach(function (px) {
  upperWallBatch.addBox(2.0, 0.18, 0.14, WHT, px, 3.1, 10.34);
  upperWallBatch.addGeometry(GX.box, WHT, px, 3.1 + 0.18 + 0.2, 10.34, [2.0, 0.4, 0.1], [0, 0, 0]);
  upperWallBatch.addBox(0.9, 0.9, 0.08, PAL.glass.windowDeep, px, 0.0, 10.28);
});
/* partições do sobrado */
wall(
  upperWallBatch,
  'x',
  2.5,
  -13,
  -2,
  [
    [-9.2, -7.9, 0, 2.9],
    [-4.8, -3.5, 0, 2.9],
  ],
  0,
  UHT - 0.04,
  T,
  WHT,
  'a',
);
wall(
  upperWallBatch,
  'x',
  2.5,
  2,
  13,
  [
    [3.5, 4.8, 0, 2.9],
    [7.9, 9.2, 0, 2.9],
  ],
  0,
  UHT - 0.04,
  T,
  WHT,
  'a',
);
wall(upperWallBatch, 'z', -7.5, 2.5, 10, [], 0, UHT - 0.04, T, WHT, 'a');
wall(upperWallBatch, 'z', -2, 2.5, 10, [], 0, UHT - 0.04, T, WHT, 'a');
wall(upperWallBatch, 'z', 2, 2.5, 10, [], 0, UHT - 0.04, T, WHT, 'a');
wall(upperWallBatch, 'z', 7.5, 2.5, 10, [], 0, UHT - 0.04, T, WHT, 'a');
wall(upperWallBatch, 'x', -1, -13, -4, [[-9.8, -8.4, 0, 2.9]], 0, UHT - 0.04, T, WHT, 'a');
wall(upperWallBatch, 'x', -1, 4, 13, [[8.4, 9.8, 0, 2.9]], 0, UHT - 0.04, T, WHT, 'a');
wall(upperWallBatch, 'z', -4, -10, -1, [], 0, UHT - 0.04, T, WHT, 'a');
wall(upperWallBatch, 'z', 4, -10, -1, [], 0, UHT - 0.04, T, WHT, 'a');

/* banheiros privativos 2,4 x 2,4 m: cantos das suítes, paredes com porta, louças junto à parede do corredor, ducha ao fundo */
function addUpperBathroom(xo, sx, zw, sz, dz) {
  const xi = xo + sx * 2.55,
    zf = zw + sz * 2.55;
  wall(
    upperWallBatch,
    'x',
    zf,
    Math.min(xo - sx * 0.15, xi + sx * 0.15),
    Math.max(xo - sx * 0.15, xi + sx * 0.15),
    [],
    0,
    UHT - 0.04,
    T,
    WHT,
    'a',
  );
  wall(
    upperWallBatch,
    'z',
    xi,
    Math.min(zw, zf),
    Math.max(zw, zf),
    [
      [
        Math.min(zw + sz * dz[0], zw + sz * dz[1]),
        Math.max(zw + sz * dz[0], zw + sz * dz[1]),
        0,
        2.4,
      ],
    ],
    0,
    UHT - 0.04,
    T,
    WHT,
    'a',
  );
  const ry = sz > 0 ? 0 : Math.PI;
  toilet(upperInteriorBatch, xo + sx * 0.45, 0.04, zw + sz * 0.5, ry);
  sink(upperInteriorBatch, xo + sx * 1.5, 0.04, zw + sz * 0.35, ry);
  upperInteriorBatch.addBox(
    2.38,
    0.04,
    2.38,
    0xeaf3f7,
    xo + sx * 1.2,
    0.04,
    zw + sz * 1.2,
  ); /* piso de ladrilho branco */
  shower2(upperInteriorBatch, xo + sx * 0.7, 0.08, zw + sz * 1.7, sx, sz);
  upperInteriorBatch.addBox(
    0.06,
    1.4,
    2.3,
    AZB,
    xo + sx * 0.04,
    0.08,
    zw + sz * 1.2,
  ); /* azulejo na parede externa */
}
addUpperBathroom(-12.75, 1, 2.65, 1, [0.7, 1.6]);
addUpperBathroom(-7.35, 1, 2.65, 1, [0.7, 1.6]);
addUpperBathroom(7.35, -1, 2.65, 1, [0.7, 1.6]);
addUpperBathroom(12.75, -1, 2.65, 1, [0.7, 1.6]);
addUpperBathroom(-12.75, 1, -1.15, -1, [0.7, 1.6]);
addUpperBathroom(12.75, -1, -1.15, -1, [0.7, 1.6]);
upperWallBatch.build(casaUpW);
/* laje do sobrado com o vão da escada (x -1,1…1,1 · z 2,8…9,8) e balcão de ferro fundido */
upperInteriorBatch.addBox(12.2, 0.2, 20.6, K.woodD, -7.2, -0.2, 0);
upperInteriorBatch.addBox(12.2, 0.2, 20.6, K.woodD, 7.2, -0.2, 0);
upperInteriorBatch.addBox(2.2, 0.2, 13.1, K.woodD, 0, -0.2, -3.75);
upperInteriorBatch.addBox(2.2, 0.2, 0.5, K.woodD, 0, -0.2, 10.05);
upperInteriorBatch.addBox(27.2, 0.2, 2.0, K.woodD, 0, -0.2, 11.4);
upperInteriorBatch.addBox(27.2, 0.12, 0.2, IRON, 0, 0.0, 12.4);
for (let i = 0; i <= 54; i++)
  upperInteriorBatch.addBox(0.05, 1.0, 0.05, IRON, -13.5 + i * 0.5, 0, 12.4);
upperInteriorBatch.addBox(27.2, 0.07, 0.1, IRON, 0, 1.0, 12.4);
upperInteriorBatch.addBox(27.2, 0.05, 0.07, IRON, 0, 0.5, 12.4);
for (let i = 0; i <= 26; i++)
  if (i % 3 === 0)
    upperInteriorBatch.addSphere(0.14, IRON, -13 + i, 1.15, 12.4, 1, 1, 1); /* rebites grossos */
[-13.5, 13.5].forEach(function (px) {
  upperInteriorBatch.addBox(0.22, 1.0, 0.22, IRON, px, 0, 12.4);
});
[-9.5, -3.2, 3.2, 9.5].forEach(function (px) {
  upperInteriorBatch.addBox(0.24, 1.0, 0.24, IRON, px, 0, 12.4);
});
[-1.1, 1.1].forEach(function (sx) {
  upperInteriorBatch.addBox(0.06, 1.0, 7.0, IRON, sx, 0, 6.3);
});
upperInteriorBatch.addBox(2.2, 0.06, 0.06, IRON, 0, 1.0, 9.8);
/* chão do sobrado: tábua larga e ladrilho; cada peça sem sobreposição */
function addUpperFloor(x1, z1, x2, z2, c) {
  upperInteriorBatch.addBox(x2 - x1, 0.04, z2 - z1, c, (x1 + x2) / 2, 0, (z1 + z2) / 2);
}
addUpperFloor(-13, 2.5, -7.5, 10, PAL.wood.floorBoard);
addUpperFloor(-7.5, 2.5, -2, 10, PAL.wood.floorBoard);
addUpperFloor(2, 2.5, 7.5, 10, PAL.wood.floorBoard);
addUpperFloor(7.5, 2.5, 13, 10, PAL.wood.floorBoard);
addUpperFloor(-13, -1, 13, 2.5, TERRA);
addUpperFloor(-13, -10, -4, -1, PAL.wood.floorBoard);
addUpperFloor(-4, -10, 4, -1, PAL.wood.oak);
addUpperFloor(4, -10, 13, -1, PAL.wood.floorBoard);
addUpperFloor(-2, 2.5, -1, 10, PAL.wood.floorBoard);
addUpperFloor(1, 2.5, 2, 10, PAL.wood.floorBoard);
addUpperFloor(-1, 9.8, 1, 10, PAL.wood.floorBoard);
function addUpperBed(bx, bz, c) {
  upperInteriorBatch.addBox(2.0, 0.5, 2.2, K.woodD, bx, 0.04, bz);
  upperInteriorBatch.addBox(1.9, 0.28, 2.1, PAL.light.ivory, bx, 0.54, bz);
  upperInteriorBatch.addBox(1.9, 0.12, 1.3, c, bx, 0.82, bz + 0.4);
  upperInteriorBatch.addBox(1.4, 0.18, 0.5, K.white, bx, 0.82, bz - 0.8);
  upperInteriorBatch.addBox(2.1, 1.3, 0.14, K.woodD, bx, 0.04, bz - 1.15);
  upperInteriorBatch.addBox(0.5, 0.45, 0.5, K.woodL, bx + 1.5, 0.04, bz - 0.8);
}
function wardrobe(wx, wz, wrot) {
  upperInteriorBatch.setOrigin(wx, 0, wz, wrot || 0);
  upperInteriorBatch.addBox(1.6, 2.3, 0.6, K.woodD, 0, 0.04, 0);
  upperInteriorBatch.addBox(0.03, 2.0, 0.05, PAL.clay.gold, 0, 0.2, 0.32);
  upperInteriorBatch.setOrigin(0, 0, 0, 0);
}
/* suítes de frente (A, B, C, D) */
const sc = [
  PAL.flora.cornflower,
  PAL.flora.salmon,
  PAL.flora.grass,
  PAL.flora.violet,
  PAL.flora.marigold,
  PAL.flora.cornflower,
];
addUpperBed(-10.2, 6.8, sc[0]);
wardrobe(-7.95, 5.4, -Math.PI / 2);
addUpperBed(-4.7, 6.8, sc[1]);
wardrobe(-2.45, 5.4, -Math.PI / 2);
addUpperBed(4.7, 6.8, sc[2]);
wardrobe(2.45, 5.4, Math.PI / 2);
addUpperBed(10.2, 6.8, sc[3]);
wardrobe(7.95, 5.4, Math.PI / 2);
/* suítes dos fundos (E, F) e sala íntima central */
addUpperBed(-8.2, -6.5, sc[4]);
wardrobe(-11.0, -9.45, 0);
addUpperBed(8.2, -6.5, sc[5]);
wardrobe(11.0, -9.45, 0);
upperInteriorBatch.addCylinder(2.4, 0.03, PAL.fabric.rust, 0, 0.04, -5.5, 22);
upperInteriorBatch.addBox(2.8, 0.55, 0.9, PAL.fabric.royalBlue, 0, 0.04, -8.4);
upperInteriorBatch.addBox(2.8, 0.6, 0.25, PAL.fabric.royalBlue, 0, 0.5, -8.8);
upperInteriorBatch.addBox(1.2, 0.4, 0.8, K.woodD, 0, 0.04, -5.5);
[
  [-2.4, -6],
  [2.4, -6],
].forEach(function (p) {
  upperInteriorBatch.addBox(0.9, 0.5, 0.9, PAL.paint.shutterGreen, p[0], 0.04, p[1]);
});
/* lustres de ferro e lampiões */
[
  [-8, 6],
  [8, 6],
  [0, -5],
  [0, 0.7],
].forEach(function (p) {
  upperInteriorBatch.addCylinder(0.03, 1.0, IRON, p[0], UHT - 1.0, p[1], 4);
  upperInteriorBatch.addCylinder(0.4, 0.06, IRON, p[0], UHT - 1.05, p[1], 10);
  upperUnlitBatch.addSphere(0.14, PAL.light.warmGlow, p[0], UHT - 1.1, p[1], 1, 1, 1);
});
upperInteriorBatch.build(casaUp);
upperUnlitBatch.build(casaUp, { unlit: true, outline: false });
