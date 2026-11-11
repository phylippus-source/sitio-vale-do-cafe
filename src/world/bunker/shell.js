/* Bunker · parte comum: limites, lotes de geometria, casca, cobertura, paredes, pisos por ambiente, corredor e escada de emergência. */
import { toonMat } from '../../core/materials.js';
import { cylG } from '../../core/geometries.js';
import { Batch } from '../../core/Batch.js';
import { FLOOR, BFL, BWH, BUNKER_INNER } from '../../config/dimensions.js';
import { K, PAL } from '../../config/palette.js';
import { surface, addCollider } from '../scene.js';
import { wall } from '../casa/base.js';

/* ================= BUNKER · UM NÍVEL · 40 × 35 m = 1.400 m² · piso a −8,7 m · sob a Casa Grande e parte do Engenho ================= */
export let bunkCapMesh = null;
export const capMat = toonMat.clone();
export const FL = BFL;
export const WB = BWH;
export const bunkerWallBatch = new Batch(),
  bunkerBatch = new Batch(),
  ledBatchA = new Batch(),
  ledBatchB = new Batch(),
  ledBatchC = new Batch(),
  glowBatch = new Batch(),
  neonBatch = new Batch(),
  netBatch = new Batch(),
  hatchBatch = new Batch(),
  capBatch = new Batch();
export const WALLC = 0xc4cad0,
  PW = 0xe9edf0,
  DARK = PAL.dark.navyBlack,
  NEON = 0xff2bd6,
  CY = PAL.neon.cyan,
  GRN = PAL.neon.mint;
/* limites */
export const X1 = BUNKER_INNER.x1,
  X2 = BUNKER_INNER.x2,
  Z1 = BUNKER_INNER.z1,
  Z2 = BUNKER_INNER.z2,
  ZA = BUNKER_INNER.corridorZ1,
  ZB =
    BUNKER_INNER.corridorZ2; /* interior; fileira dos fundos até ZA, corredor ZA..ZB, fileira da frente ZB..Z2 */
export function addBunkerWallCollider(axis, fixed, lo, hi, gaps, th) {
  let cur = lo;
  (gaps || [])
    .slice()
    .sort(function (p, q) {
      return p[0] - q[0];
    })
    .forEach(function (q) {
      addColliderSegment(cur, q[0]);
      cur = q[1];
    });
  addColliderSegment(cur, hi);
  function addColliderSegment(a, b) {
    if (b - a < 0.05) return;
    if (axis === 'x') addCollider(a, fixed - th / 2, b, fixed + th / 2, 'u');
    else addCollider(fixed - th / 2, a, fixed + th / 2, b, 'u');
  }
}
function addPartitionX(z, x1, x2, gaps, color) {
  wall(bunkerWallBatch, 'x', z, x1, x2, gaps, FL, WB - 0.04, 0.3, color || PW, null);
  addBunkerWallCollider('x', z, x1, x2, gaps, 0.3);
}
function addPartitionZ(x, z1, z2, gaps, color) {
  wall(bunkerWallBatch, 'z', x, z1, z2, gaps, FL, WB - 0.04, 0.3, color || PW, null);
  addBunkerWallCollider('z', x, z1, z2, gaps, 0.3);
}
export function tile(x1, z1, x2, z2, c) {
  bunkerBatch.addBox(x2 - x1, 0.06, z2 - z1, c, (x1 + x2) / 2, FL, (z1 + z2) / 2);
}
function doorGap(c, w) {
  return [c - w / 2, c + w / 2, 0, 2.5];
}

/* ---------- casca ---------- */
bunkerWallBatch.addBox(40, 0.2, 35, 0xb8c0c7, 8, FLOOR, -55.5);
bunkerWallBatch.addBox(0.6, WB, 35, WALLC, -11.7, FL, -55.5);
bunkerWallBatch.addBox(0.6, WB, 35, WALLC, 27.7, FL, -55.5);
bunkerWallBatch.addBox(40, WB, 0.6, WALLC, 8, FL, -72.7);
bunkerWallBatch.addBox(40, WB, 0.6, WALLC, 8, FL, -38.3);
addCollider(-12.2, -73.2, -11.4, -37.8, 'u');
addCollider(27.4, -73.2, 28.2, -37.8, 'u');
addCollider(-12.2, -73.2, 28.2, -72.4, 'u');
addCollider(-12.2, -38.6, 28.2, -37.8, 'u');
/* cobertura (laje + terra + grama): vira vidro com a abertura do corte */
capBatch.addBox(40, 0.8, 35, 0xaab2b9, 8, -5.1, -55.5);
[
  [-5, -2.4, 0x946037],
  [-2.4, -0.4, 0x6e4527],
].forEach(function (b) {
  const y0 = Math.max(b[0], -4.3),
    y1 = Math.min(b[1], -0.4);
  if (y1 > y0 + 0.01) capBatch.addBox(40, y1 - y0, 35, b[2], 8, y0, -55.5);
});
capBatch.addBox(40, 0.4, 35, K.grass, 8, -0.4, -55.5);
capMat.transparent = false;
bunkCapMesh = capBatch.build(surface, { mat: capMat, outline: false });

/* ---------- paredes ---------- */
addPartitionX(ZA, X1, X2, [
  doorGap(-8.2, 1.6),
  doorGap(-2.3, 1.2),
  doorGap(2.0, 1.2),
  doorGap(5.5, 1.2),
  doorGap(8.6, 1.2),
  doorGap(13.1, 1.4),
  doorGap(18.05, 1.3),
  doorGap(21.5, 1.2),
  doorGap(25.2, 1.2),
]);
addPartitionX(ZB, X1, X2, [
  [-8.2, -2.2, 0, 2.8],
  doorGap(4.0, 1.2),
  doorGap(9.1, 1.4),
  doorGap(16.4, 1.6),
  doorGap(23.9, 1.4),
]);
[-4.4, 0.1, 3.9, 7.1, 10.1, 16.1, 20.0, 23.0].forEach(function (x) {
  addPartitionZ(x, Z1, ZA, []);
});
[2.2, 5.8, 12.4, 20.4].forEach(function (x) {
  addPartitionZ(x, ZB, Z2, []);
});
/* pisos por ambiente */
tile(X1, Z1, -4.4, ZA, 0x12141c);
tile(-4.4, Z1, 0.1, ZA, PAL.wood.oak);
tile(0.1, Z1, 3.9, ZA, PAL.wood.floorBoard);
tile(3.9, Z1, 7.1, ZA, 0xe8c9d0);
tile(7.1, Z1, 10.1, ZA, 0x6b7a8a);
tile(10.1, Z1, 16.1, ZA, 0xdfe6ea);
tile(16.1, Z1, 20, ZA, 0xeaf3f7);
tile(20, Z1, 23, ZA, 0xf2f4f8);
tile(23, Z1, X2, ZA, 0xe2e6ea);
tile(X1, ZA, X2, ZB, PAL.dark.slate);
tile(X1, ZB, 2.2, Z2, 0xb69a74);
tile(2.2, ZB, 5.8, Z2, 0xe8d3b0);
tile(5.8, ZB, 12.4, Z2, 0x1e1a26);
tile(12.4, ZB, 20.4, Z2, 0x2c4a3a);
tile(20.4, ZB, X2, Z2, PAL.light.tileGrey);
/* corredor: neon e dutos */
neonBatch.addBox(38.6, 0.05, 0.05, NEON, 8, FL + 3.3, ZA + 0.2);
neonBatch.addBox(38.6, 0.05, 0.05, CY, 8, FL + 3.3, ZB - 0.2);
bunkerBatch.addGeometry(
  cylG(1, 16),
  K.steel,
  8,
  FL + 3.0,
  -54.5,
  [0.18, 38, 0.18],
  [0, 0, Math.PI / 2],
);
bunkerBatch.addGeometry(
  cylG(1, 16),
  K.blue,
  8,
  FL + 2.65,
  -54.5,
  [0.14, 38, 0.14],
  [0, 0, Math.PI / 2],
);
/* escada de emergência: poço com escada de ferro até a escotilha na superfície */
bunkerBatch.addBox(1.4, 0.1, 1.4, K.steelD, 26.5, FL, -54.5);
[-0.5, 0.5].forEach(function (o) {
  bunkerBatch.addBeam([26.5 + o, FL, -54.5], [26.5 + o, -0.2, -54.5], 0.05, K.steelD, 5);
});
for (let i = 0; i < 14; i++)
  bunkerBatch.addBox(1.0, 0.04, 0.04, K.steelD, 26.5, FL + 0.4 + i * 0.55, -54.5);
hatchBatch.addBox(1.8, 0.12, 1.8, K.steelD, 26.5, 0, -54.5);
hatchBatch.addBox(1.5, 0.06, 1.5, K.red, 26.5, 0.12, -54.5);
hatchBatch.addCylinder(0.07, 0.12, K.steel, 26.5, 0.18, -54.5, 6);
