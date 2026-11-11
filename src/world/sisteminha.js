/* Núcleo Sisteminha Embrapa: tanque no centro, canteiros, galinheiro, chiqueiro e apoio, tudo perto e sem árvore. */
import { R, rr } from '../core/random.js';
import { GX, coneG } from '../core/geometries.js';
import { FLOOR } from '../config/dimensions.js';
import { K, PAL } from '../config/palette.js';
import { PLOTS } from '../data/crops.js';
import { TANKS } from '../data/sisteminha.js';
import { surfaceBatch, pondBatch } from './terrain.js';

/* ================= NÚCLEO SISTEMINHA EMBRAPA (regras: tanque no centro, tudo perto, sem árvore) =================
 1 tanque redondo de 4,4 m (10 m³) por módulo, em terreno plano, perto de energia e água, sem árvores ao redor.
 Sedimentador e biofiltro no nível do tanque. Água do tanque irriga a horta. Sedimento vai à composteira e ao minhocário.
 Galinheiro, composteira, minhocário e horta ficam colados ao tanque para os fluxos serem curtos. */
function sisTank(t) {
  let a;
  const x = t.x;
  const z = t.z;
  surfaceBatch.addCylinder(4.4, 0.06, K.conc, x, 0, z, 32); /* laje plana de apoio */
  for (a = 0; a < 18; a++) {
    const th = (a / 18) * Math.PI * 2;
    surfaceBatch.addGeometry(
      GX.box,
      K.conc,
      x + Math.cos(th) * 2.32,
      0.45,
      z + Math.sin(th) * 2.32,
      [0.88, 0.9, 0.22],
      [0, -th - Math.PI / 2, 0],
    );
  }
  surfaceBatch.addCylinder(2.46, 0.1, K.concD, x, 0.9, z, 24, 2.46);
  pondBatch.addCylinder(2.2, 0.8, K.white, x, 0, z, 24); /* 10 m³ · lâmina de 70 a 80 cm */
  surfaceBatch.addCylinder(0.09, 0.9, K.black, x + 0.4, 0.8, z, 6);
  surfaceBatch.addBox(0.5, 0.05, 0.5, K.steelD, x + 0.4, 1.7, z); /* aerador venturi */
  surfaceBatch.addCylinder(0.34, 0.75, K.blue, x + 3.1, 0.06, z + 0.7, 10, 0.3);
  surfaceBatch.addSphere(
    1,
    K.white,
    x + 3.1,
    0.88,
    z + 0.7,
    0.26,
    0.14,
    0.26,
  ); /* biofiltro com cabeleira de nylon */
  surfaceBatch.addCylinder(0.42, 0.9, 0xe9e2cb, x + 3.1, 0.06, z - 0.8, 10, 0.38);
  surfaceBatch.addCylinder(0.45, 0.08, K.steel, x + 3.1, 0.96, z - 0.8, 10); /* sedimentador */
  surfaceBatch.addBeam([x + 2.3, 0.85, z - 0.3], [x + 3.1, 0.8, z - 0.8], 0.06, K.black, 5);
  surfaceBatch.addBeam([x + 3.1, 0.4, z - 0.8], [x + 3.1, 0.4, z + 0.7], 0.06, K.black, 5);
  surfaceBatch.addBox(0.5, 0.35, 0.4, K.black, x + 2.5, 0.06, z + 1.9); /* bomba SB-2000 */
  surfaceBatch.addBeam(
    [x + 3.1, 0.12, z - 1.2],
    [x + 3.1, 0.12, z - 3.6],
    0.05,
    K.brown || PAL.wood.walnut,
    5,
  ); /* sifão do sedimentador para a composteira */
}
TANKS.forEach(sisTank);
/* quadro de energia e bomba d'água: perto da rede (windmill e poços) */
surfaceBatch.addBox(1.0, 1.9, 0.5, K.concD, -14.2, 0, 31.8);
surfaceBatch.addBox(0.7, 0.5, 0.1, K.yellow, -14.2, 1.1, 32.1);
surfaceBatch.addCylinder(0.1, 3.4, K.woodD, -15.6, 0, 31.8, 6);
surfaceBatch.addBeam([10, 0.14, 32], [-5.5, 0.14, 34.5], 0.07, K.blue, 5);
surfaceBatch.addBeam([-5.5, 0.14, 34.5], [-7.3, 0.7, 37.4], 0.07, K.blue, 5); /* água dos poços */
surfaceBatch.addBeam([-9.5, 0.14, 41.0], [-9.5, 0.14, 44.4], 0.09, K.blue, 5);
surfaceBatch.addBeam(
  [-19, 0.14, 41.0],
  [-19, 0.14, 44.4],
  0.09,
  K.blue,
  5,
); /* água do tanque para a horta */

/* horta: 5 canteiros irrigados por gotejo com a água dos tanques */
surfaceBatch.addBox(24, 0.1, 0.14, K.blue, -16, 0.1, 44.4);
for (let hb = 0; hb < 5; hb++) {
  const hbz = 46.1 + hb * 1.9,
    hcr = [0x58c05b, PAL.flora.leafGreen, PAL.flora.tomatoRed, PAL.flora.violet, PAL.flora.straw][
      hb
    ];
  surfaceBatch.addBox(24, 0.38, 1.3, K.soilD, -16, 0, hbz);
  for (let hj = 0; hj < 17; hj++) {
    const hjx = -27.2 + hj * 1.4;
    if (hb === 0)
      surfaceBatch.addSphere(
        1,
        [0x7ad063, 0x55b84f][hj % 2],
        hjx,
        0.6,
        hbz,
        0.34,
        0.26,
        0.34,
      ); /* alface */
    else if (hb === 1)
      surfaceBatch.addSphere(
        1,
        [0x3d9a4a, 0x6cc06a][hj % 2],
        hjx,
        0.7,
        hbz,
        0.42,
        0.34,
        0.42,
      ); /* couve */
    else if (hb === 2) {
      surfaceBatch.addCylinder(0.03, 1.0, K.woodD, hjx, 0.38, hbz, 4);
      surfaceBatch.addSphere(1, hcr, hjx, 1.1, hbz, 0.2, 0.2, 0.2);
      surfaceBatch.addSphere(1, PAL.flora.leafGreen, hjx, 0.9, hbz, 0.3, 0.25, 0.3);
    } /* tomate */
    else if (hb === 3)
      surfaceBatch.addBox(
        0.34,
        0.5,
        0.34,
        [PAL.flora.purple, 0x6a3f94][hj % 2],
        hjx,
        0.38,
        hbz,
      ); /* beterraba/roxas */
    else {
      surfaceBatch.addCone(0.16, 0.7 + (hj % 3) * 0.1, 0x6cae3a, hjx, 0.38, hbz, 4);
      surfaceBatch.addSphere(1, hcr, hjx, 1.0, hbz, 0.12, 0.12, 0.12);
    } /* temperos e chás */
  }
}
surfaceBatch.addBox(0.2, 1.4, 0.2, K.woodD, -28.6, 0, 55.4);
surfaceBatch.addBox(1.9, 0.8, 0.1, PAL.light.parchment, -28.6, 1.4, 55.4);

/* composteira (3 baias de paletes) e minhocário (8 canteiros) */
for (let cb3 = 0; cb3 < 3; cb3++) {
  const cbz = 33.2 + cb3 * 2.5;
  surfaceBatch.addBox(0.14, 1.3, 2.2, K.woodL, -1.1, 0, cbz);
  surfaceBatch.addBox(0.14, 1.3, 2.2, K.woodL, 1.1, 0, cbz);
  surfaceBatch.addBox(2.2, 1.3, 0.14, K.woodL, 0, 0, cbz - 1.1 + 0.1);
  for (let cp = 0; cp < 4; cp++)
    surfaceBatch.addBox(2.2, 0.08, 0.14, K.woodD, 0, 0.2 + cp * 0.3, cbz + 1.05);
  surfaceBatch.addSphere(
    1,
    [PAL.wood.ebony, 0x4a2f1c, 0x3a2417][cb3],
    0,
    0.55 + cb3 * 0.15,
    cbz,
    0.85,
    0.5 + cb3 * 0.14,
    0.85,
    1,
  );
}
for (let mc = 0; mc < 8; mc++) {
  const mcx = -0.5 + (mc % 4) * 1.7,
    mcz = 44.2 + ((mc / 4) | 0) * 3.2;
  surfaceBatch.addBox(1.5, 0.7, 2.5, 0xc2704c, mcx, 0, mcz);
  surfaceBatch.addBox(1.3, 0.08, 2.3, 0x2d1f15, mcx, 0.7, mcz);
  for (let mw = 0; mw < 3; mw++)
    surfaceBatch.addBox(
      0.5,
      0.06,
      0.06,
      0xe8a0a0,
      mcx - 0.3 + mw * 0.3,
      0.78,
      mcz - 0.5 + mw * 0.5,
    );
}

/* galinheiro de poedeiras (35 aves, 114 m²) com cerca e abrigo */
const hen = { x1: -43, x2: -31, z1: 31, z2: 40.5 };
[hen.z1, hen.z2].forEach(function (zz) {
  [0.5, 1.1].forEach(function (h) {
    surfaceBatch.addBox(hen.x2 - hen.x1 + 0.2, 0.1, 0.1, K.wood, (hen.x1 + hen.x2) / 2, h, zz);
  });
});
[hen.x1, hen.x2].forEach(function (xx) {
  [0.5, 1.1].forEach(function (h) {
    surfaceBatch.addBox(0.1, 0.1, hen.z2 - hen.z1, K.wood, xx, h, (hen.z1 + hen.z2) / 2);
  });
});
for (let fenceX = 0; fenceX <= 6; fenceX++) {
  [hen.z1, hen.z2].forEach(function (zz) {
    surfaceBatch.addBox(0.16, 1.4, 0.16, K.woodD, hen.x1 + fenceX * 2, 0, zz);
  });
}
for (let fenceZ = 1; fenceZ < 5; fenceZ++) {
  [hen.x1, hen.x2].forEach(function (xx) {
    surfaceBatch.addBox(0.16, 1.4, 0.16, K.woodD, xx, 0, hen.z1 + (fenceZ * (hen.z2 - hen.z1)) / 5);
  });
}
surfaceBatch.addBox(4.2, 2.0, 3.0, K.woodL, -40, 0, 33.4);
surfaceBatch.addGeometry(GX.box, K.roofD, -40, 2.35, 33.4, [4.8, 0.2, 3.6]);
surfaceBatch.addBox(0.9, 1.3, 0.1, K.woodD, -40, 0, 35.0);
surfaceBatch.addBeam([-37.6, 0.1, 35.4], [-38.6, 1.3, 35.0], 0.08, K.wood, 4);
for (let nb = 0; nb < 4; nb++)
  surfaceBatch.addBox(0.7, 0.5, 0.6, PAL.clay.honey, -42.4 + nb * 0.9, 0.9, 32.6);
surfaceBatch.addBox(1.6, 0.4, 0.5, PAL.water.trough, -35, 0, 38.8);
surfaceBatch.addCylinder(0.3, 0.6, K.steel, -33, 0, 38.8, 8);
/* frangos de corte em trator móvel e mosca-soldado */
[
  [-27.2, 33.2],
  [-27.2, 36.4],
].forEach(function (c) {
  surfaceBatch.addBox(5, 0.08, 2.2, K.woodL, c[0], 0.1, c[1]);
  surfaceBatch.addGeometry(GX.arc, K.white, c[0] - 2, 0.1, c[1], [1.1, 1.0, 1.1], [0, 0, 0]);
  surfaceBatch.addGeometry(GX.arc, K.white, c[0] + 2, 0.1, c[1], [1.1, 1.0, 1.1], [0, 0, 0]);
  surfaceBatch.addBox(5, 0.06, 0.06, K.white, c[0], 1.1, c[1]);
});
surfaceBatch.addBox(3.2, 2.0, 2.6, K.cal, -26, 0, 40.2);
surfaceBatch.addBox(3.5, 0.25, 2.9, K.roofD, -26, 2.0, 40.2);
for (let tr = 0; tr < 3; tr++)
  surfaceBatch.addBox(
    2.4,
    0.08,
    0.7,
    [0x9bd04a, 0x7cb83a, 0xb7d96a][tr],
    -26,
    0.6 + tr * 0.5,
    40.2,
  );

/* estufa arqueada 12 × 10 m (a película translúcida entra depois) */
const gh = { x: 27.5, z: 35.6, len: 12, w: 10 };
for (let gr = 0; gr <= 8; gr++)
  surfaceBatch.addGeometry(
    GX.arc,
    K.white,
    gh.x - 6 + gr * 1.5,
    0,
    gh.z,
    [5, 3.2, 5],
    [0, Math.PI / 2, 0],
  );
surfaceBatch.addBox(12, 0.14, 0.14, K.white, gh.x, 3.2, gh.z);
surfaceBatch.addBox(0.18, 0.18, 10, K.white, gh.x - 6, 0, gh.z);
surfaceBatch.addBox(0.18, 0.18, 10, K.white, gh.x + 6, 0, gh.z);
for (let gbd = 0; gbd < 4; gbd++) {
  surfaceBatch.addBox(8, 0.5, 1.2, K.soilD, gh.x - 1.4, 0, gh.z - 3.4 + gbd * 2.3);
  for (let gk = 0; gk < 8; gk++)
    surfaceBatch.addSphere(
      1,
      [PAL.flora.leafGreen, 0x2f9644, 0x66c25a][(gk + gbd) % 3],
      gh.x - 4.9 + gk * 1.0,
      0.7,
      gh.z - 3.4 + gbd * 2.3 + rr(-0.2, 0.2),
      rr(0.35, 0.5),
      rr(0.4, 0.6),
      rr(0.35, 0.5),
    );
}
/* sala estéril de cogumelos (16 m²) */
surfaceBatch.addBox(4, 2.6, 4, K.cal, gh.x + 4, 0, gh.z + 1.4);
surfaceBatch.addBox(4.3, 0.3, 4.3, K.roofD, gh.x + 4, 2.6, gh.z + 1.4);
surfaceBatch.addBox(1, 1.9, 0.12, K.woodD, gh.x + 4, 0, gh.z + 3.45);
surfaceBatch.addBox(0.9, 0.5, 0.1, PAL.water.trough, gh.x + 4, 1.4, gh.z + 3.46);

/* ---------- quadras de rotação quadrienal ---------- */
PLOTS.forEach(function (pl) {
  surfaceBatch.addBox(
    pl.x2 - pl.x1,
    0.3,
    pl.z2 - pl.z1,
    K.soilD,
    (pl.x1 + pl.x2) / 2,
    0,
    (pl.z1 + pl.z2) / 2,
  );
  const rows = 13;
  const sp = (pl.z2 - pl.z1 - 2) / (rows - 1);
  let i;
  let j;
  let z;
  let x;
  for (i = 0; i < rows; i++) {
    z = pl.z1 + 1 + i * sp;
    surfaceBatch.addBox(pl.x2 - pl.x1 - 1.6, 0.34, 0.9, 0x5a3a20, (pl.x1 + pl.x2) / 2, 0.3, z);
    for (j = 0; j < 18; j++) {
      x = pl.x1 + 1.6 + (j * (pl.x2 - pl.x1 - 3.2)) / 17;
      const y0 = 0.64,
        a = (i + j) % 3;
      if (pl.k === 0) {
        surfaceBatch.addBox(
          0.7,
          0.7,
          0.7,
          [PAL.flora.cropGreenA, PAL.flora.cropGreenB, PAL.flora.cropGreenC][a],
          x,
          y0,
          z,
        );
        if (a === 0) surfaceBatch.addSphere(1, PAL.flora.lilac, x, y0 + 1.0, z, 0.22, 0.22, 0.22);
      } else if (pl.k === 1) {
        surfaceBatch.addSphere(
          1,
          [PAL.flora.cropGreenB, 0x47ad4f, 0x5cc060][a],
          x,
          y0 + 0.35,
          z,
          0.55,
          0.38,
          0.55,
        );
        if (j % 3 === 0)
          surfaceBatch.addSphere(1, 0xa070c4, x, y0 + 0.06, z + 0.45, 0.28, 0.2, 0.28);
      } else if (pl.k === 2) {
        if (i % 2 === 0) surfaceBatch.addCone(0.34, 2.4 + a * 0.25, 0x78bf3a, x, y0, z, 4);
        else {
          surfaceBatch.addSphere(1, K.orange, x, y0 + 0.38, z, 0.52, 0.42, 0.52, 1);
          surfaceBatch.addSphere(1, 0x4a9a3a, x + 0.6, y0 + 0.2, z, 0.35, 0.12, 0.35);
        }
      } else {
        surfaceBatch.addBox(
          0.55,
          0.45 + a * 0.2,
          0.55,
          [0x4f9a3a, 0x3f8a2c, 0x6aae45][a],
          x,
          y0,
          z,
        );
        surfaceBatch.addSphere(1, 0xf6d73a, x, y0 + 0.7 + a * 0.2, z, 0.26, 0.26, 0.26);
      }
    }
  }
  surfaceBatch.addBox(0.25, 1.3, 0.25, K.woodD, pl.x1 + 0.7, 0, pl.z2 + 0.5);
  surfaceBatch.addBox(1.5, 0.8, 0.12, PAL.light.parchment, pl.x1 + 0.7, 1.3, pl.z2 + 0.5);
});

/* ---------- curral de 300 m²: piso ripado, abrigos, cochos ---------- */
const pen = { x1: 23, x2: 39, z1: -10, z2: 9 };
surfaceBatch.addBox(16, 0.12, 19, PAL.stone.sandstone, 31, 0, -0.5);
[pen.z1, pen.z2].forEach(function (z) {
  [0.55, 1.15].forEach(function (h) {
    surfaceBatch.addBox(pen.x2 - pen.x1 + 0.2, 0.14, 0.14, K.wood, 31, h, z);
  });
});
[pen.x1, pen.x2].forEach(function (x) {
  [0.55, 1.15].forEach(function (h) {
    surfaceBatch.addBox(0.14, 0.14, pen.z2 - pen.z1, K.wood, x, h, -0.5);
  });
});
for (let ppx = 0; ppx <= 8; ppx++) {
  [pen.z1, pen.z2].forEach(function (z) {
    surfaceBatch.addBox(0.2, 1.5, 0.2, K.woodD, pen.x1 + ppx * 2, 0, z);
  });
}
for (let ppz = 1; ppz <= 9; ppz++) {
  [pen.x1, pen.x2].forEach(function (x) {
    surfaceBatch.addBox(0.2, 1.5, 0.2, K.woodD, x, 0, pen.z1 + (ppz * (pen.z2 - pen.z1)) / 10);
  });
}
surfaceBatch.addBox(0.14, 1.3, 19, K.wood, 31, 0, -0.5); /* divisória baixa entre baias */
surfaceBatch.addBox(6.6, 2.6, 4.4, K.woodL, 26.5, 0, -6.2);
surfaceBatch.addGeometry(coneG(4), K.roof, 26.5, 3.6, -6.2, [4.9, 2.2, 4.9], [0, Math.PI / 4, 0]);
surfaceBatch.addBox(1.2, 1.7, 0.1, K.woodD, 26.5, 0, -3.95);
surfaceBatch.addBox(5.4, 2.2, 3.8, K.woodL, 35.2, 0, 5.4);
surfaceBatch.addGeometry(GX.box, K.roofD, 35.2, 2.5, 5.4, [6.2, 0.3, 4.6]);
[
  [34, -6.4],
  [35.8, -6.4],
  [27, 6.5],
].forEach(function (t) {
  surfaceBatch.addBox(2.2, 0.45, 0.7, PAL.clay.honey, t[0], 0, t[1]);
  surfaceBatch.addBox(2.0, 0.2, 0.5, 0x6b8f4e, t[0], 0.45, t[1]);
});
for (let hb = 0; hb < 5; hb++)
  surfaceBatch.addBox(
    1.3,
    0.8,
    0.8,
    0xe6c75a,
    36.5 + (hb % 2) * 0.1,
    hb > 2 ? 0.8 : 0,
    -3 + (hb % 3) * 1.1,
  );
surfaceBatch.addBox(3, 0.55, 1.1, PAL.water.trough, 28, 0, 1.4);

/* ---------- poços artesianos (5), cisterna e reservatório falso ---------- */
[
  [16, 32.5],
  [19, 33.5],
  [13, 34.5],
  [19.6, 36.6],
  [10, 32.5],
].forEach(function (p) {
  surfaceBatch.addCylinder(1.1, 1.4, K.blue, p[0], 0, p[1], 14);
  surfaceBatch.addCylinder(0.8, 0.14, 0x1b3350, p[0], 1.4, p[1], 14);
  surfaceBatch.addCylinder(1.2, 0.2, K.steel, p[0], 1.14, p[1], 14);
  surfaceBatch.addCylinder(0.16, 2.2, K.steelD, p[0] + 0.9, 0, p[1], 8);
});

/* ---------- biodigestor tubular canadense (15 m³) junto ao curral: baias lavam por gravidade ---------- */
surfaceBatch.addBox(15, 0.4, 3.6, K.concD, 30, 0, 13.5);
surfaceBatch.addGeometry(GX.half, 0x4fae62, 30, 0.4, 13.5, [1.6, 13.6, 1.6], [0, 0, Math.PI / 2]);
surfaceBatch.addSphere(1, K.white, 39, 1.4, 13.5, 1.4, 1.1, 1.3, 1);
surfaceBatch.addBox(
  1.4,
  0.12,
  3.0,
  K.concD,
  30,
  0,
  10.2,
); /* calha de lavagem: curral → biodigestor */
surfaceBatch.addCylinder(0.5, 2.6, K.steel, 25, 0, 16.8, 10);
surfaceBatch.addCylinder(0.62, 0.3, K.red, 25, 2.6, 16.8, 10);
surfaceBatch.addCylinder(0.5, 2.2, K.steel, 27.4, 0, 16.8, 10);
surfaceBatch.addCylinder(0.62, 0.3, K.blue, 27.4, 2.2, 16.8, 10);
surfaceBatch.addBeam([26.4, 0.9, 13.5], [25.2, 2.8, 16.8], 0.14, K.steelD, 6);
surfaceBatch.addBeam([37.4, 1.2, 13.5], [38.8, 1.2, 13.5], 0.12, K.steelD, 6);

/* ---------- bateria gravitacional: trilho de 35 m, bloco de 12 t, guincho ---------- */
const gx = 36.5,
  gz1 = 38,
  gz2 = 70,
  gy1 = 15,
  gy2 = 0.6;
[gx - 0.9, gx + 0.9].forEach(function (rx) {
  surfaceBatch.addBeam([rx, gy1, gz1], [rx, gy2, gz2], 0.16, K.steelD, 6);
});
for (let sl = 0; sl <= 16; sl++) {
  const su = sl / 16;
  surfaceBatch.addBox(
    2.6,
    0.2,
    0.4,
    K.woodD,
    gx,
    gy1 + (gy2 - gy1) * su - 0.3,
    gz1 + (gz2 - gz1) * su,
  );
}
[
  [gx - 1.6, gz1 - 0.6],
  [gx + 1.6, gz1 - 0.6],
].forEach(function (p) {
  surfaceBatch.addBeam([p[0], 0, p[1] - 0.5], [p[0], gy1, gz1], 0.22, K.steel, 6);
});
[
  [gx - 1.6, gz1 + 3.4],
  [gx + 1.6, gz1 + 3.4],
].forEach(function (p) {
  surfaceBatch.addBeam([p[0], 0, p[1] + 2.6], [p[0], gy1 - 1.2, gz1 + 2.2], 0.16, K.steel, 6);
});
surfaceBatch.addBox(4.0, 0.34, 0.4, K.steel, gx, gy1 + 0.1, gz1);
surfaceBatch.addBox(1.6, 1.6, 1.2, K.steelD, gx, gy1 + 0.4, gz1 - 1.4);
surfaceBatch.addCylinder(0.5, 1.8, K.red, gx, gy1 + 0.5, gz1 - 1.4, 8, 0.5, [0, 0, Math.PI / 2]);
const gu = 0.55,
  gby = gy1 + (gy2 - gy1) * gu + 1.0,
  gbz = gz1 + (gz2 - gz1) * gu;
surfaceBatch.addGeometry(
  GX.box,
  K.concD,
  gx,
  gby,
  gbz,
  [2.0, 1.8, 2.4],
  [Math.atan2(gy1 - gy2, gz2 - gz1), 0, 0],
);
surfaceBatch.addBeam([gx, gy1 + 0.3, gz1 + 0.1], [gx, gby + 0.5, gbz - 0.7], 0.07, K.black, 4);
surfaceBatch.addBox(2.6, 0.5, 1.8, K.concD, gx, 0, gz2 + 1.2);

/* ---------- jazida de argila (600 m²) e tijolos ---------- */
surfaceBatch.addBox(30, 0.1, 19, 0xd9704c, -33, 0, 65.5);
for (let ccx = 0; ccx < 15; ccx++)
  for (let ccz = 0; ccz < 9.5; ccz++) {
    const cch = (R() * 3) | 0;
    surfaceBatch.addBox(
      2,
      0.04 + cch * 0.015,
      Math.min(2, 19 - ccz * 2),
      [0xc9603e, 0xe0805a, 0xb85633][cch],
      -47 + ccx * 2,
      0.1,
      56.2 + ccz * 2,
    );
  } /* células sem sobreposição: sem flicker */
for (let cbk = 0; cbk < 24; cbk++)
  surfaceBatch.addBox(1.2, 0.5, 0.6, 0xe6cfa6, -20 + (cbk % 6) * 1.3, ((cbk / 6) | 0) * 0.52, 58);
surfaceBatch.addBox(3.4, 2.4, 3.0, K.concD, -42, 0, 59);
surfaceBatch.addCone(2.4, 2.0, K.roofD, -42, 2.4, 59, 4, [0, Math.PI / 4, 0]);
surfaceBatch.addCylinder(0.4, 3.2, K.steelD, -42, 4.4, 59, 8);

/* ---------- dutos de energia (Pelton + moinho → subsolo) ---------- */
function duct(pts, y, col) {
  for (let i = 0; i < pts.length - 1; i++)
    surfaceBatch.addBeam(
      [pts[i][0], y, pts[i][1]],
      [pts[i + 1][0], y, pts[i + 1][1]],
      0.32,
      col,
      6,
    );
  for (let i = 0; i < pts.length; i++)
    surfaceBatch.addSphere(1, col, pts[i][0], y, pts[i][1], 0.46, 0.46, 0.46);
}
duct(
  [
    [41, -17],
    [41, -12],
    [20, -12],
    [20, -38.2],
  ],
  0.36,
  K.black,
);
duct(
  [
    [6, 36],
    [16, 36],
    [16, -38.2],
  ],
  0.36,
  K.steelD,
);
duct(
  [
    [6, 36],
    [6, 31.4],
    [-13.6, 31.4],
  ],
  0.36,
  K.steelD,
); /* rede do núcleo Sisteminha */
/* mergulham pela parede sul do bunker até o corredor técnico */
surfaceBatch.addBeam([20, 0.36, -38.2], [20, FLOOR + 3.2, -38.2], 0.34, K.black, 6);
surfaceBatch.addSphere(1, K.black, 20, FLOOR + 3.2, -38.2, 0.5, 0.5, 0.5);
surfaceBatch.addBeam([16, 0.36, -38.2], [16, FLOOR + 2.8, -38.2], 0.16, K.steelD, 6);
surfaceBatch.addBox(1.6, 0.6, 1.2, K.steel, 18, 0, -40.4);
surfaceBatch.addBox(1.1, 0.35, 0.9, K.red, 18.2, 0.6, -40.4);

/* ---------- cinturão vivo: ora-pro-nóbis e sebe facetada ---------- */
const hcols = [0x2a8a3b, 0x35a047, 0x23762f, 0x41ad4e];
let hix = 0;
for (let hx = -48; hx <= 47; hx += 3.0, hix++)
  surfaceBatch.addSphere(
    1,
    hcols[hix & 3],
    hx + rr(-0.3, 0.3),
    rr(1.2, 1.9),
    -73.4 + rr(-0.3, 0.3),
    rr(1.6, 2.2),
    rr(1.3, 1.9),
    rr(1.6, 2.2),
    1,
  );
for (let hz = -72; hz <= 73; hz += 3.0, hix++)
  if (!(hz > 22 && hz < 33.5))
    surfaceBatch.addSphere(
      1,
      hcols[hix & 3],
      -48.4 + rr(-0.3, 0.3),
      rr(1.2, 1.9),
      hz + rr(-0.3, 0.3),
      rr(1.6, 2.2),
      rr(1.3, 1.9),
      rr(1.6, 2.2),
      1,
    );
for (let hf = 0; hf < 80; hf++) {
  const hfx = R() < 0.55 ? rr(-48, 47) : -48.4 + rr(-1.2, 1.2),
    hfz = hfx > -46.5 && R() < 0.9 ? -73.4 + rr(-1.4, 1.4) : rr(-72, 72);
  surfaceBatch.addSphere(
    1,
    [0xe03a86, 0xf064a6, 0xd0307a][hf % 3],
    hfx,
    rr(2.2, 3.2),
    hfz,
    0.22,
    0.22,
    0.22,
  );
}
