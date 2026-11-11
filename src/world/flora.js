/* Flora: árvores facetadas, bambuzal, silvicultura e capim. */
import { R, rr } from '../core/random.js';
import { K, PAL } from '../config/palette.js';
import { TG } from '../data/terrain.js';
import { surfaceBatch, free, inLand } from './terrain.js';
import { surface } from './scene.js';

/* ================= FLORA: árvores facetadas, bambuzal, silvicultura, capim ================= */
function tree(b, x, z, s) {
  const g = TG[(R() * 3) | 0],
    h = rr(3.2, 4.6) * s,
    cr = rr(2.4, 3.4) * s;
  b.addCylinder(
    0.34 * s,
    h,
    [PAL.wood.walnut, 0x6b4527, PAL.wood.oak][(R() * 3) | 0],
    x,
    0,
    z,
    6,
    0.24 * s,
  );
  b.addSphere(cr, g[0], x, h + cr * 0.55, z, 1, 0.9, 1);
  b.addSphere(
    cr * 0.78,
    g[1],
    x + rr(-0.9, 0.9) * s,
    h + cr * 1.1,
    z + rr(-0.9, 0.9) * s,
    1,
    0.9,
    1,
  );
  b.addSphere(
    cr * 0.55,
    g[2],
    x + rr(-0.8, 0.8) * s,
    h + cr * 1.55,
    z + rr(-0.8, 0.8) * s,
    1,
    0.9,
    1,
  );
}
function fruit(b, x, z) {
  const h = rr(2.0, 2.6),
    cr = rr(1.7, 2.2),
    col = [PAL.flora.pumpkin, 0xf2c230, PAL.flora.tomatoRed, 0xff9e3a][(R() * 4) | 0];
  b.addCylinder(0.26, h, 0x6b4527, x, 0, z, 6, 0.2);
  b.addSphere(cr, 0x3a9a40, x, h + cr * 0.5, z, 1, 0.85, 1);
  b.addSphere(cr * 0.62, 0x52b552, x + 0.5, h + cr * 0.95, z - 0.4, 1, 0.85, 1);
  for (let f = 0; f < 5; f++)
    b.addSphere(1, col, x + rr(-1.5, 1.5), h + cr * rr(0.2, 0.8), z + rr(-1.5, 1.5), 0.2, 0.2, 0.2);
}
function euca(b, x, z) {
  const h = rr(11, 15),
    cr = rr(1.7, 2.5),
    gc = [0x4d9a73, 0x5faa7e, 0x3f8c66][(R() * 3) | 0];
  b.addCylinder(0.34, h, [0xc9bfa3, 0xd8cfb6][(R() * 2) | 0], x, 0, z, 5, 0.2);
  b.addSphere(cr, gc, x, h, z, 1, 1.9, 1);
  b.addSphere(cr * 0.7, 0x6dbb8c, x + rr(-0.8, 0.8), h + cr * 1.3, z + rr(-0.8, 0.8), 1, 1.6, 1);
}
function pine(b, x, z) {
  const h = rr(7, 10);
  b.addCylinder(0.3, h * 0.4, 0x6b4527, x, 0, z, 5);
  for (let i = 0; i < 4; i++)
    b.addCone(
      2.3 - i * 0.5,
      3.2,
      [0x2a7a3f, 0x338c47, 0x3d9e50][i % 3],
      x,
      h * 0.28 + i * 1.9,
      z,
      6,
    );
}

const floraBatch =
  new surfaceBatch.constructor(); /* lote da flora (separado para facilitar ajustes) */
let treeCount = 0;
let i;
let x;
let z;
let tries;

/* silvicultura energética: eucaliptos em talhadia + cedrinho */
for (x = 18; x <= 42.5; x += 2.5)
  for (z = -73; z <= -47; z += 2.5) {
    const ex = x + rr(-0.8, 0.8),
      ez = z + rr(-0.8, 0.8);
    if (ex > 13 && ex < 18.2 && ez > -62 && ez < -50) continue;
    if (R() < 0.83) {
      if (R() < 0.12) pine(floraBatch, ex, ez);
      else euca(floraBatch, ex, ez);
      treeCount++;
    }
  }
/* bambuzal 800 m²: colmos altos com nós e tufos */
for (x = -43; x <= -17; x += 1.7)
  for (z = -71; z <= -47; z += 1.7) {
    if (R() < 0.12) continue;
    const bx = x + rr(-0.5, 0.5),
      bz = z + rr(-0.5, 0.5),
      bh = rr(9, 14),
      bc = [0x8bc34a, 0x7bb83e, 0x9ccf56][(R() * 3) | 0];
    floraBatch.addCylinder(0.2, bh, bc, bx, 0, bz, 5, 0.12);
    for (let nd = 2; nd < bh - 0.4; nd += 2.4)
      floraBatch.addCylinder(0.25, 0.13, 0x5d8a2b, bx, nd, bz, 5);
    floraBatch.addSphere(1.0, 0x5fae3f, bx, bh + 0.2, bz, 1.0, 1.7, 1.0);
    if (R() < 0.5)
      floraBatch.addSphere(
        0.7,
        0x7bc455,
        bx + rr(-0.5, 0.5),
        bh - 2.2,
        bz + rr(-0.5, 0.5),
        1.0,
        1.5,
        1.0,
      );
  }
/* faixa de mata na borda esquerda e atrás das quadras */
for (z = -70; z <= 72; z += 3.4)
  for (let q = 0; q < 2; q++) {
    const tx = -47.2 + q * 3.0 + rr(-0.6, 0.6),
      tz = z + rr(-1, 1);
    if (free(tx, tz, 0) || (tx < -45 && inLand(tx, tz)))
      if (
        !(tz > 54 && tx > -48 && tx < -17) &&
        !(tz > 21.5 && tz < 34) &&
        !(Math.hypot(tx + 36.5, tz - 48.5) < 9)
      ) {
        if (R() < 0.5) tree(floraBatch, tx, tz, rr(0.9, 1.3));
        else pine(floraBatch, tx, tz);
        treeCount++;
      }
  }
/* árvores soltas e pomar consorciado */
for (tries = 0; tries < 420 && treeCount < 560; tries++) {
  const rx = rr(-46, 42),
    rz = rr(-72, 72);
  if (!free(rx, rz, 2.5)) continue;
  if ((rz < -46 && rx > 14) || (rz < -46 && rx < -16)) continue;
  if (R() < 0.38) fruit(floraBatch, rx, rz);
  else tree(floraBatch, rx, rz, rr(0.85, 1.25));
  treeCount++;
}
[
  [-11, 64],
  [-7, 67],
  [-3, 64],
  [1, 67],
  [-10, 71],
  [-5, 72],
  [0, 71],
].forEach(function (p) {
  fruit(floraBatch, p[0], p[1]);
});
/* ao longo do córrego e da via */
for (z = -72; z <= 72; z += 5.5) {
  if ((z > -52 && z < -30) || (z > -24 && z < -8)) continue;
  tree(floraBatch, 49.2, z + rr(-1, 1), rr(0.5, 0.65));
}

/* tufos: pequenos espinhos triangulares */
for (i = 0; i < 640; i++) {
  const tx2 = rr(-48, 42),
    tz2 = rr(-73, 73);
  if (!free(tx2, tz2, 0.5)) continue;
  for (let sp = 0; sp < 3; sp++)
    floraBatch.addCone(
      rr(0.14, 0.2),
      rr(0.5, 0.9),
      [K.tuft, 0x58b238, PAL.flora.fernGreen][sp],
      tx2 + rr(-0.3, 0.3),
      0,
      tz2 + rr(-0.3, 0.3),
      3,
    );
}
/* flores */
for (i = 0; i < 240; i++) {
  const fx = rr(-48, 42),
    fz = rr(-73, 73);
  if (!free(fx, fz, 0.5)) continue;
  floraBatch.addCylinder(0.04, 0.5, PAL.flora.fernGreen, fx, 0, fz, 3);
  floraBatch.addSphere(
    1,
    [PAL.light.white, PAL.flora.sunflower, 0xff7aa8, PAL.flora.lilac, 0xff8a3a][i % 5],
    fx,
    0.6,
    fz,
    0.17,
    0.17,
    0.17,
  );
}
/* rochas e troncos caídos */
for (i = 0; i < 48; i++) {
  const kx = rr(-48, 42),
    kz = rr(-73, 73);
  if (!free(kx, kz, 1)) continue;
  floraBatch.addSphere(
    1,
    [K.rock, 0xb7b4a8, 0x8f8d86][i % 3],
    kx,
    0.3,
    kz,
    rr(0.5, 1.1),
    rr(0.4, 0.7),
    rr(0.5, 1.1),
  );
}

/* apiário: seis colmeias Langstroth e flores */
for (let cv = 0; cv < 6; cv++) {
  const cx = 16.2 + (cv % 3) * 1.6;
  const cz = -57.5 + ((cv / 3) | 0) * 2.6;
  floraBatch.addBox(0.7, 0.5, 0.1, K.woodD, cx, 0.0, cz);
  [0, 1, 2].forEach(function (l) {
    floraBatch.addBox(
      0.95,
      0.34,
      0.85,
      [PAL.flora.straw, PAL.light.butter, 0xe3b23a][(l + cv) % 3],
      cx,
      0.5 + l * 0.36,
      cz,
    );
  });
  floraBatch.addBox(1.05, 0.12, 0.95, 0xdfe3e6, cx, 1.58, cz);
  floraBatch.addBox(0.5, 0.05, 0.07, K.black, cx, 0.62, cz + 0.45);
  floraBatch.addBox(0.7, 0.14, 0.5, K.woodD, cx, 0.0, cz + 0.2);
}
for (i = 0; i < 14; i++) {
  floraBatch.addCylinder(0.04, 0.8, PAL.flora.fernGreen, rr(15.4, 19.6), 0, rr(-60.5, -52.5), 3);
}
floraBatch.build(surface);
