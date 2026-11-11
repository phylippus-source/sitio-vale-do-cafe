/* Bunker · Suíte cyberpunk do Mestre: closet, estação dev, lounge, cama-casulo, parede aquário e banheiro.
   Tudo é posicionado em relação ao retângulo do cômodo (paredes e cantos), não em coordenadas soltas:
   trocar o retângulo em ROOMS move e acomoda a suíte inteira. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, neonBatch, netBatch, FL, CY, NEON, GRN, DARK } from '../shell.js';
import { addBunkerBathroom, wardrobe, desk, chair, plant } from '../fixtures.js';
import { frameOf } from './frame.js';

/* banheiro-cabine no canto leste dos fundos */
function addBathroom({ xe, zb }) {
  addBunkerBathroom(xe - 2.8, 2.8, zb, xe - 1.05, xe - 0.15, false);
}

function addCloset({ xw, xe, zf }) {
  wardrobe(xw + 0.3, zf - 1.4, Math.PI / 2);
  wardrobe(xw + 0.3, zf - 3.0, Math.PI / 2);
  bunkerBatch.addBox(0.5, 0.8, 1.6, PAL.dark.navyBlack, xe - 0.3, FL + 0.06, zf - 1.6);
  neonBatch.addBox(0.04, 1.5, 1.2, CY, xe - 0.04, FL + 0.9, zf - 1.6);
  bunkerBatch.addBox(0.4, 0.05, 1.0, K.steelD, xe - 0.4, FL + 0.5, zf - 3.2);
  for (let i = 0; i < 5; i++)
    bunkerBatch.addBox(
      0.3,
      0.1,
      0.18,
      [K.red, K.white, PAL.glass.windowDeep, K.yellow, PAL.dark.deviceBlack][i],
      xw + 0.55,
      FL + 0.06,
      zf - 4.1,
    );
}

/* estação dev: mesa em L, 3 monitores curvos, PC com RGB, rack e cadeira gamer */
function addDevStation({ xw, zf }) {
  const dz = zf - 6.4; /* eixo da mesa */
  desk(xw + 0.5, dz, 3.8, Math.PI / 2);
  [-1.3, 0, 1.3].forEach(function (off, n) {
    const mz = dz + off;
    bunkerBatch.addBox(
      0.08,
      0.62,
      1.28,
      PAL.dark.void,
      xw + 0.2,
      FL + 1.0,
      mz + (n === 0 ? 0.08 : n === 2 ? -0.08 : 0),
    );
    neonBatch.addBox(0.04, 0.56, 1.2, [CY, NEON, GRN][n], xw + 0.28, FL + 1.03, mz);
  });
  bunkerBatch.addBox(0.3, 0.5, 0.6, PAL.dark.navyBlack, xw + 0.5, FL + 0.81, dz - 1.8);
  neonBatch.addBox(0.02, 0.4, 0.5, CY, xw + 0.66, FL + 0.86, dz - 1.8);
  bunkerBatch.addBox(0.5, 0.03, 0.2, K.black, xw + 1.0, FL + 0.8, dz);
  chair(xw + 1.7, dz, PAL.dark.deviceBlack);
  bunkerBatch.addBox(0.9, 1.9, 0.8, PAL.dark.graphite, xw + 0.5, FL + 0.06, dz - 3.2);
  for (let i = 0; i < 9; i++)
    neonBatch.addBox(
      0.05,
      0.05,
      0.5,
      [CY, GRN, NEON][i % 3],
      xw + 0.92,
      FL + 0.3 + i * 0.19,
      dz - 3.2,
    );
  neonBatch.addBox(0.04, 0.04, 3.6, CY, xw + 0.08, FL + 0.72, dz);
}

/* mesa holográfica, sofá, pufes e fliperama (ao lado da porta) */
function addLounge({ xw, xe, zf }) {
  const lx = xe - 2.35;
  const lz = zf - 5.8;
  bunkerBatch.addCylinder(0.9, 0.6, DARK, lx, FL + 0.06, lz, 16);
  neonBatch.addCylinder(0.95, 0.04, CY, lx, FL + 0.66, lz, 16);
  neonBatch.addSphere(0.55, CY, lx, FL + 1.6, lz, 1, 1, 1, 1);
  neonBatch.addCylinder(1.0, 0.03, NEON, lx, FL + 0.07, lz, 22);
  bunkerBatch.addBox(0.9, 0.5, 2.4, PAL.fabric.indigo, xe - 0.5, FL + 0.06, lz);
  bunkerBatch.addBox(0.3, 0.8, 2.4, PAL.fabric.indigo, xe - 0.2, FL + 0.06, lz);
  bunkerBatch.addCylinder(0.5, 0.4, PAL.flora.violet, xw + 2.05, FL + 0.06, zf - 4.1, 10);
  bunkerBatch.addCylinder(0.5, 0.4, PAL.neon.cyan, xw + 2.05, FL + 0.06, zf - 9.5, 10);
  bunkerBatch.addBox(0.9, 1.8, 0.8, PAL.dark.slate, xw + 2.05, FL + 0.06, zf - 1.0);
  neonBatch.addBox(0.7, 0.5, 0.04, NEON, xw + 2.05, FL + 1.2, zf - 0.6);
}

/* cama-casulo redonda com mosquiteiro, cabeceira em arco e anel de neon */
function addBed({ xw, zb }) {
  const bx = xw + 3.15,
    bz = zb + 4.5;
  bunkerBatch.addCylinder(1.95, 0.3, 0x15171f, bx, FL + 0.06, bz, 28);
  bunkerBatch.addCylinder(1.7, 0.3, 0xf0eef6, bx, FL + 0.36, bz, 28);
  neonBatch.addCylinder(2.0, 0.03, NEON, bx, FL + 0.07, bz, 32);
  bunkerBatch.addCylinder(0.55, 0.18, PAL.flora.violet, bx - 0.6, FL + 0.66, bz - 0.8, 10, 0.45);
  bunkerBatch.addCylinder(0.55, 0.18, PAL.neon.cyan, bx + 0.2, FL + 0.66, bz - 0.9, 10, 0.45);
  bunkerBatch.addCylinder(1.0, 0.06, PAL.dark.slate, bx, FL + 0.66, bz + 0.5, 20, 0.9);
  for (let th = -Math.PI / 2 - 1.1; th <= -Math.PI / 2 + 1.11; th += 0.275) {
    const sx = bx + 2.25 * Math.cos(th),
      sz = bz + 2.25 * Math.sin(th),
      rr2 = Math.atan2(-Math.cos(th), -Math.sin(th));
    bunkerBatch.addBox(0.48, 1.7, 0.12, DARK, sx, FL + 0.06, sz, [0, rr2, 0]);
    neonBatch.addBox(0.04, 1.5, 0.04, NEON, sx, FL + 0.16, sz + (sz < bz ? 0.07 : -0.07));
  }
  for (let i = 0; i < 16; i++) {
    const a2 = (i / 16) * Math.PI * 2,
      cx2 = bx + 2.15 * Math.cos(a2),
      cz2 = bz + 2.15 * Math.sin(a2);
    const giroY = Math.atan2(-Math.cos(a2), -Math.sin(a2));
    neonBatch.addBox(0.5, 0.05, 0.1, CY, cx2, FL + 3.0, cz2, [0, giroY, 0]);
  }
  /* mosquiteiro translúcido em cúpula */
  netBatch.addCylinder(2.1, 2.9, 0xeeeaff, bx, FL + 0.08, bz, 28, 0.35);
  bunkerBatch.addCylinder(0.04, 0.5, K.steelD, bx, FL + 3.0, bz, 6);
  neonBatch.addSphere(0.14, PAL.light.warmGlow, bx, FL + 3.1, bz, 1, 1, 1, 1);
}

/* parede aquário, skyline, prateleiras, vitrola, caixas de som, plantas e neons do teto */
function addDecor({ xw, xe, cx, zb, zf }) {
  bunkerBatch.addBox(3.6, 1.5, 0.3, 0x0a2a3a, xw + 1.8, FL + 0.5, zb + 0.2);
  neonBatch.addBox(3.4, 1.3, 0.05, 0x1a6fd0, xw + 1.8, FL + 0.6, zb + 0.4);
  [
    [xw + 0.75, 0.9, 0xffa14a],
    [xw + 1.85, 1.2, PAL.neon.magenta],
    [xw + 2.85, 0.8, PAL.neon.yellow],
    [xw + 1.35, 1.5, PAL.neon.mint],
  ].forEach(function (f) {
    neonBatch.addSphere(0.12, f[2], f[0], FL + f[1], zb + 0.45, 1.6, 1, 0.6);
  });
  bunkerBatch.addBox(0.1, 2.6, 5.4, PAL.dark.void, xw - 0.05, FL + 0.3, zb + 3.8);
  for (let i = 0; i < 18; i++) {
    const skh = 0.5 + (((i * 37) % 17) / 17) * 1.9;
    neonBatch.addBox(
      0.08,
      skh,
      0.26,
      [CY, NEON, PAL.neon.yellow, PAL.neon.violet][i % 4],
      xw + 0.08,
      FL + 0.4,
      zb + 1.4 + i * 0.3,
    );
  }
  for (let i = 0; i < 3; i++) {
    bunkerBatch.addBox(0.3, 0.05, 1.6, K.woodD, xe - 0.2, FL + 1.0 + i * 0.5, zb + 4.0);
    for (let j = 0; j < 4; j++)
      bunkerBatch.addSphere(
        0.1,
        [PAL.neon.magenta, PAL.neon.cyan, PAL.neon.yellow, PAL.flora.lime][(i + j) % 4],
        xe - 0.2,
        FL + 1.15 + i * 0.5,
        zb + 3.4 + j * 0.4,
        1,
        1.4,
        1,
      );
  }
  /* aparador com vitrola e caixas de som */
  bunkerBatch.addBox(0.9, 0.8, 0.5, PAL.dark.slate, xe - 0.4, FL + 0.06, zb + 6.9);
  bunkerBatch.addBox(0.5, 0.1, 0.4, K.black, xe - 0.4, FL + 0.86, zb + 6.9);
  bunkerBatch.addCylinder(0.2, 0.04, PAL.dark.deviceBlack, xe - 0.4, FL + 0.96, zb + 6.9, 16);
  bunkerBatch.addBox(0.4, 1.4, 0.3, PAL.dark.deviceBlack, xe - 0.2, FL + 0.06, zb + 7.8);
  bunkerBatch.addBox(0.4, 1.4, 0.3, PAL.dark.deviceBlack, xe - 0.2, FL + 0.06, zb + 6.0);
  plant(xw + 0.45, zb + 1.9, 1.2);
  plant(xe - 0.4, zb + 2.5, 1.0);
  const stripW = xe - xw - 0.3;
  neonBatch.addBox(stripW, 0.05, 0.05, NEON, cx, FL + 3.4, zf - 6.2);
  neonBatch.addBox(stripW, 0.05, 0.05, CY, cx, FL + 3.4, zb + 5.4);
}

/** Constrói a suíte dentro do retângulo `rect` = { x1, z1, x2, z2 } (coordenadas do mundo). */
export function buildMasterSuite(rect) {
  const f = frameOf(rect);
  addBathroom(f);
  addCloset(f);
  addDevStation(f);
  addLounge(f);
  addBed(f);
  addDecor(f);
}
