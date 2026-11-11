/* Terreno 100 × 150 m (1 unidade = 1 m): estratos, córrego, caminhos, cercas, lavouras e lagoa. */
import * as THREE from 'three';
import { R, rr } from '../core/random.js';
import { Batch } from '../core/Batch.js';
import { slab } from '../core/geometry.js';
import { FLOOR, LOT, STREAM, BUNKER } from '../config/dimensions.js';
import { K } from '../config/palette.js';
import { STRATA } from '../data/terrain.js';
import { BLOCK, BCIRC } from '../data/collision.js';
import { surface } from './scene.js';

/* ================= TERRENO 100 × 150 m (1 unidade = 1 m) ================= */
export const surfaceBatch = new Batch(),
  waterBatch = new Batch(),
  pondBatch = new Batch();
/* laje do bunker: piso a −8,7 m */
function strata(x1, z1, x2, z2, top) {
  STRATA.forEach(function (b) {
    const t = Math.min(b[1], top);
    if (t > b[0] + 0.01) slab(surfaceBatch, x1, z1, x2, z2, b[0], t - b[0], b[2]);
  });
}
function land(x1, z1, x2, z2) {
  strata(x1, z1, x2, z2, -0.4);
  slab(surfaceBatch, x1, z1, x2, z2, -0.4, 0.4, K.grass);
}
land(LOT.x1, LOT.z1, BUNKER.x1, LOT.z2);
land(BUNKER.x2, LOT.z1, STREAM.x1, LOT.z2);
land(BUNKER.x1, BUNKER.z2, BUNKER.x2, LOT.z2);
land(BUNKER.x1, LOT.z1, BUNKER.x2, BUNKER.z1);
land(STREAM.x2, LOT.z1, LOT.x2, LOT.z2);
strata(BUNKER.x1, BUNKER.z1, BUNKER.x2, BUNKER.z2, FLOOR); /* rocha sob o fosso */
strata(STREAM.x1, LOT.z1, STREAM.x2, LOT.z2, -1.4); /* leito do córrego */
slab(
  waterBatch,
  STREAM.x1,
  LOT.z1,
  STREAM.x2,
  LOT.z2,
  -1.4,
  0.85,
  K.white,
); /* água (material próprio) */

/* linhas de estrato desenhadas e pedras nas faces do corte */
(function () {
  const ln = 0x3a2a1b;
  const ys = [-8, -5, -2.4, -0.4];
  let k;
  function stripX(x1, x2, z, y) {
    surfaceBatch.addBox(x2 - x1, 0.16, 0.07, ln, (x1 + x2) / 2, y - 0.08, z);
  }
  function stripZ(z1, z2, x, y) {
    surfaceBatch.addBox(0.07, 0.16, z2 - z1, ln, x, y - 0.08, (z1 + z2) / 2);
  }
  ys.forEach(function (y) {
    stripX(-50, 50, 75.04, y);
    stripZ(-75, 75, -50.04, y);
    stripZ(-75, 75, 50.04, y);
  });
  for (k = 0; k < 46; k++) {
    const u = R(),
      col = [0xc9c2b4, 0xa59d8f, 0xd6b48a, 0x7f8a94][k % 4],
      y = rr(-9.6, -0.9);
    if (u < 0.34) {
      const x = rr(-49, 49);
      surfaceBatch.addSphere(1, col, x, y, 75.0, rr(0.45, 1.1), rr(0.3, 0.7), 0.18);
    } else if (u < 0.6)
      surfaceBatch.addSphere(1, col, -50.0, y, rr(-74, 74), 0.18, rr(0.3, 0.7), rr(0.45, 1.1));
    else if (u < 0.8)
      surfaceBatch.addSphere(1, col, 50.0, y, rr(-74, 74), 0.18, rr(0.3, 0.7), rr(0.45, 1.1));
    else surfaceBatch.addSphere(1, col, rr(-49, 49), y, 75.0, rr(0.45, 1.1), rr(0.3, 0.7), 0.18);
  }
})();

export function inLand(x, z) {
  return (x >= -50 && x <= 43 && z >= -75 && z <= 75) || (x >= 48 && x <= 50);
}
const gpl = [];
for (let gp = 0; gp < 150; gp++) {
  const gpx = rr(-48, 42);
  const gpz = rr(-73, 73);
  const gpr = rr(1.6, 4.4);
  if (gpx < -16 && gpz > 54) continue;
  if (
    gpl.some(function (q) {
      return Math.hypot(q[0] - gpx, q[1] - gpz) < q[2] + gpr + 0.1;
    })
  )
    continue;
  gpl.push([gpx, gpz, gpr]);
  if (
    !inLand(gpx, gpz) ||
    !inLand(gpx + gpr, gpz + gpr) ||
    !inLand(gpx - gpr, gpz - gpr) ||
    !inLand(gpx + gpr, gpz - gpr) ||
    !inLand(gpx - gpr, gpz + gpr)
  )
    continue;
  surfaceBatch.addCylinder(gpr, 0.03, [K.grass2, K.grass3][gp % 2], gpx, 0, gpz, 7);
}

/* retângulos de uso do solo: nada de árvore ou capim por cima */
export function free(x, z, pad) {
  pad = pad || 0;
  if (!inLand(x, z) || x > 43) return false;
  let i;
  let b;
  let c;
  for (i = 0; i < BLOCK.length; i++) {
    b = BLOCK[i];
    if (x > b[0] - pad && x < b[2] + pad && z > b[1] - pad && z < b[3] + pad) return false;
  }
  for (i = 0; i < BCIRC.length; i++) {
    c = BCIRC[i];
    if (Math.hypot(x - c[0], z - c[1]) < c[2] + pad) return false;
  }
  return true;
}

/* caminhos de terra */
function path(x1, z1, x2, z2) {
  surfaceBatch.addBox(x2 - x1, 0.06, z2 - z1, K.dirt, (x1 + x2) / 2, 0, (z1 + z2) / 2);
}
path(-16, -44, -12, 26); /* entre quadras */
path(-12, -19, 8, -14); /* corte entre quadras */
path(-36, -19, -16, -14);
path(-12.5, -46, 3.5, -43); /* trilha da casa */
path(-1.2, -47.5, 1.2, -43); /* escada da varanda */
path(8, -12, 21, -8); /* ligação à via */
path(15, -44, 17, -42);
path(21, -14, 39, -10); /* pátio → curral */

/* ---------- estrada de cascalho: porteira (leste) → via transversal → via principal → pátio e garagem ---------- */
const GRV = 0xe6dcc0,
  RUT = 0xcbb98f;
surfaceBatch.addBox(71.5, 0.1, 5, GRV, -14.25, 0, 28); /* x -50 … 21,5 · z 25,5 … 30,5 */
surfaceBatch.addBox(71.5, 0.11, 0.55, RUT, -14.25, 0, 27.0);
surfaceBatch.addBox(71.5, 0.11, 0.55, RUT, -14.25, 0, 29.0);
surfaceBatch.addBox(76.5, 0.1, 5, GRV, 19, 0, -7.75); /* via principal x 16,5 … 21,5 */
surfaceBatch.addBox(0.55, 0.11, 76.5, RUT, 18.1, 0, -7.75);
surfaceBatch.addBox(0.55, 0.11, 76.5, RUT, 19.9, 0, -7.75);
path(21.5, 25.5, 43, 30.5); /* continua em terra até o córrego */
for (let rd = 0; rd < 46; rd++) {
  const rdx = -48 + rd * 1.6,
    rdz = rd % 2 ? 25.25 : 30.75;
  surfaceBatch.addSphere(
    1,
    K.rock,
    rdx + rr(-0.3, 0.3),
    0.1,
    rdz + rr(-0.15, 0.15),
    rr(0.25, 0.45),
    rr(0.18, 0.3),
    rr(0.25, 0.45),
  );
}
for (let rd2 = 0; rd2 < 18; rd2++) {
  const rdz2 = -44 + rd2 * 4.2;
  surfaceBatch.addSphere(
    1,
    K.rock,
    rd2 % 2 ? 16.35 : 21.65,
    0.1,
    rdz2 + rr(-0.3, 0.3),
    rr(0.25, 0.45),
    rr(0.18, 0.3),
    rr(0.25, 0.45),
  );
}
/* setas de guia no pátio, rumo à porta da garagem (x 28,5…33,5 · z −33) */
for (let ra = 0; ra < 6; ra++)
  surfaceBatch.addBox(0.9, 0.03, 0.2, K.white, 22.8 + ra * 1.55, 0.2, -24);
for (let rb = 0; rb < 5; rb++)
  surfaceBatch.addBox(0.2, 0.03, 0.9, K.white, 31, 0.2, -25.6 - rb * 1.4);
/* porteira de pedra e madeira */
const GX0 = -49.1,
  GZ1 = 24.6,
  GZ2 = 31.4;
[GZ1, GZ2].forEach(function (gz, gi) {
  surfaceBatch.addBox(1.0, 3.6, 1.0, K.stone, GX0, 0, gz);
  surfaceBatch.addBox(1.3, 0.28, 1.3, K.stoneD, GX0, 3.6, gz);
  surfaceBatch.addBox(0.8, 0.2, 0.8, K.stoneL, GX0, 3.88, gz);
  for (let gst = 0; gst < 4; gst++)
    surfaceBatch.addBox(1.02, 0.04, 1.02, K.stoneD, GX0, 0.7 + gst * 0.8, gz);
});
surfaceBatch.addBox(0.34, 0.34, GZ2 - GZ1 + 1.0, K.woodD, GX0, 3.9, (GZ1 + GZ2) / 2); /* travessa */
surfaceBatch.addBeam([GX0, 3.9, GZ1 + 0.4], [GX0, 3.4, GZ1 + 0.4], 0.03, K.steelD, 4);
surfaceBatch.addBeam([GX0, 3.9, GZ2 - 0.4], [GX0, 3.4, GZ2 - 0.4], 0.03, K.steelD, 4);
surfaceBatch.addBox(0.18, 0.9, 5.2, K.woodL, GX0, 2.5, (GZ1 + GZ2) / 2); /* tábua da placa */
[
  [GZ1 + 1.0, GX0 + 3.4, GZ1 + 0.2],
  [GZ2 - 1.0, GX0 + 3.4, GZ2 - 0.2],
].forEach(function (l, li) {
  const zz = l[2];
  surfaceBatch.addBox(3.4, 0.14, 0.1, K.wood, GX0 + 1.95, 0.55, zz);
  surfaceBatch.addBox(3.4, 0.14, 0.1, K.wood, GX0 + 1.95, 1.45, zz);
  for (let pk = 0; pk < 6; pk++)
    surfaceBatch.addBox(0.12, 1.6, 0.08, K.woodL, GX0 + 0.7 + pk * 0.6, 0.1, zz);
  surfaceBatch.addBeam([GX0 + 0.55, 0.5, zz], [GX0 + 3.5, 1.5, zz], 0.05, K.woodD, 4);
});
surfaceBatch.addBox(0.2, 3.0, 0.2, K.woodD, -48.1, 0, 22.6);
surfaceBatch.addBox(0.6, 0.4, 0.9, K.red, -48.1, 3.0, 22.6);
surfaceBatch.addBox(0.5, 0.08, 0.7, K.white, -48.1, 3.4, 22.6); /* caixa de correio */
surfaceBatch.addCylinder(0.09, 4.2, K.steelD, -47.9, 0, 33.2, 6);
surfaceBatch.addSphere(1, 0xfff1b8, -47.9, 4.4, 33.2, 0.35, 0.35, 0.35);
surfaceBatch.addBox(0.7, 0.1, 0.7, K.black, -47.9, 4.2, 33.2); /* poste de luz */
surfaceBatch.addBox(0.7, 1.1, 3.4, K.stone, GX0, 0, 22.7);
surfaceBatch.addBox(0.7, 1.1, 3.4, K.stone, GX0, 0, 33.4); /* muretas */
(function () {
  const cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 180;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#f3e3b8';
  cx.fillRect(0, 0, 1024, 180);
  cx.strokeStyle = '#6b4527';
  cx.lineWidth = 10;
  cx.strokeRect(8, 8, 1008, 164);
  cx.fillStyle = '#3d2a17';
  cx.font = 'bold 84px Georgia, serif';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText('SÍTIO VALE DO CAFÉ', 512, 96);
  const tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  tex.anisotropy = 4;
  const sm = new THREE.MeshBasicMaterial({ map: tex });
  [
    [1, GX0 + 0.1],
    [-1, GX0 - 0.1],
  ].forEach(function (f) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.9), sm);
    m.position.set(f[1], 2.5 + 0.45, (GZ1 + GZ2) / 2);
    m.rotation.y = f[0] > 0 ? Math.PI / 2 : -Math.PI / 2;
    surface.add(m);
  });
})();

/* ---------- córrego: pedras, degraus, espuma estática ---------- */
for (let rk = 0; rk < 90; rk++) {
  const rkz = rr(-74, 74),
    side = R() < 0.5;
  surfaceBatch.addSphere(
    1,
    K.rock,
    side ? rr(42.2, 43.4) : rr(47.6, 48.6),
    -0.3,
    rkz,
    rr(0.4, 0.9),
    rr(0.25, 0.5),
    rr(0.4, 0.9),
  );
}
[
  [-60, 0.55],
  [-57, 0.38],
  [-54, 0.2],
].forEach(function (st) {
  waterBatch.addBox(5.0, st[1], 2.4, K.white, 45.5, -0.55, st[0]);
  surfaceBatch.addBox(5.0, 0.07, 2.4, K.white, 45.5, -0.55 + st[1], st[0]);
});

/* ---------- lago de reúso (120 m²): reservatório do sistema, longe dos tanques ---------- */
export const pondX = -36.5,
  pondZ = 48.5,
  pondR = 6.2;
surfaceBatch.addCylinder(7.2, 0.14, K.sand, pondX, 0, pondZ, 36);
pondBatch.addCylinder(pondR, 0.3, K.white, pondX, 0, pondZ, 36);
for (let pq = 0; pq < 30; pq++) {
  const pa = (pq / 30) * Math.PI * 2 + rr(-0.08, 0.08),
    pr = rr(6.6, 7.2);
  surfaceBatch.addSphere(
    1,
    K.rock,
    pondX + Math.cos(pa) * pr,
    0.1,
    pondZ + Math.sin(pa) * pr,
    rr(0.5, 0.9),
    rr(0.35, 0.6),
    rr(0.5, 0.9),
  );
}
[
  [-3.2, -1.4, 0.9],
  [2.4, 2.8, 0.8],
  [-2.0, 3.1, 0.7],
  [3.4, -2.2, 0.6],
].forEach(function (l) {
  surfaceBatch.addCylinder(l[2], 0.04, 0x45b84a, pondX + l[0], 0.3, pondZ + l[1], 10);
});
surfaceBatch.addSphere(1, K.pink, pondX - 3.2, 0.42, pondZ - 1.4, 0.3, 0.25, 0.3);
