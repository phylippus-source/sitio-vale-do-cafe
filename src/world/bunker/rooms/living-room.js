/* Bunker · Estar, jantar e cozinha (13,6 × 14,6 m): bancada, ilha, mesa para 10, sofá, TV, bar e plantas.
   Posicionado em relação ao retângulo do cômodo. */
import { K, MARB, PAL } from '../../../config/palette.js';
import { bunkerBatch, neonBatch, FL } from '../shell.js';
import { plant } from '../fixtures.js';

/* bancada, geladeira e coifa junto à parede da frente (z1) */
function addKitchen({ x1, x2, z1 }) {
  const kx = x1 + 7.0,
    kz = z1 + 0.5;
  bunkerBatch.addBox(8.0, 0.9, 0.7, PAL.light.linen, kx, FL + 0.06, kz);
  bunkerBatch.addBox(8.1, 0.06, 0.8, PAL.light.cream, kx, FL + 0.96, kz);
  bunkerBatch.addBox(0.8, 0.12, 0.5, K.steel, x1 + 5.0, FL + 1.0, kz);
  bunkerBatch.addCylinder(0.035, 0.3, K.steel, x1 + 5.0, FL + 1.12, z1 + 0.7, 5);
  bunkerBatch.addBox(0.9, 0.1, 0.6, K.black, x1 + 8.0, FL + 1.02, kz);
  bunkerBatch.addBox(0.9, 1.9, 0.8, K.white, x2 - 1.3, FL + 0.06, kz);
  bunkerBatch.addBox(2.0, 0.1, 0.8, K.steelD, x1 + 8.0, FL + 2.5, z1 + 0.3);
  /* ilha com banquetas */
  bunkerBatch.addBox(3.2, 0.95, 1.1, PAL.light.linen, x1 + 6.8, FL + 0.06, z1 + 3.8);
  bunkerBatch.addBox(3.3, 0.06, 1.2, MARB, x1 + 6.8, FL + 1.01, z1 + 3.8);
  for (let i = 0; i < 4; i++)
    bunkerBatch.addCylinder(0.22, 0.6, K.woodD, x1 + 5.6 + i * 0.8, FL + 0.06, z1 + 5.0, 8);
}

/* mesa de jantar com 10 lugares */
function addDiningTable({ x1, z1 }) {
  const tx = x1 + 6.8,
    tz = z1 + 8.6;
  bunkerBatch.addBox(3.4, 0.08, 1.3, K.woodD, tx, FL + 0.76, tz);
  [
    [-1.5, -0.5],
    [1.5, -0.5],
    [-1.5, 0.5],
    [1.5, 0.5],
  ].forEach(function (l) {
    bunkerBatch.addBox(0.12, 0.7, 0.12, K.woodD, tx + l[0], FL + 0.06, tz + l[1]);
  });
  for (let i = 0; i < 4; i++) {
    bunkerBatch.addBox(0.42, 0.5, 0.42, K.woodL, x1 + 5.5 + i * 0.8, FL + 0.06, tz - 1.4);
    bunkerBatch.addBox(0.42, 0.5, 0.42, K.woodL, x1 + 5.5 + i * 0.8, FL + 0.06, tz + 1.4);
  }
  bunkerBatch.addBox(0.42, 0.5, 0.42, K.woodL, tx - 3.1, FL + 0.06, tz);
  bunkerBatch.addBox(0.42, 0.5, 0.42, K.woodL, tx + 3.1, FL + 0.06, tz);
}

/* sofá em L, mesa de centro, tapete, TV na parede oeste e bar com bancos */
function addLounge({ x1, x2, z1, z2 }) {
  bunkerBatch.addBox(1.0, 0.5, 3.8, PAL.fabric.royalBlue, x1 + 1.8, FL + 0.06, z1 + 11.3);
  bunkerBatch.addBox(0.3, 0.8, 3.8, PAL.fabric.royalBlue, x1 + 1.0, FL + 0.06, z1 + 11.3);
  bunkerBatch.addBox(3.2, 0.5, 1.0, PAL.fabric.royalBlue, x1 + 3.6, FL + 0.06, z1 + 13.3);
  bunkerBatch.addBox(1.0, 0.4, 1.0, K.woodD, x1 + 3.2, FL + 0.06, z1 + 11.0);
  bunkerBatch.addCylinder(1.6, 0.03, PAL.fabric.rust, x1 + 3.0, FL + 0.06, z1 + 10.2, 22);
  bunkerBatch.addBox(0.1, 1.5, 3.2, PAL.dark.void, x1 + 0.25, FL + 1.0, z1 + 5.7);
  neonBatch.addBox(0.02, 1.4, 3.1, PAL.neon.blue, x1 + 0.35, FL + 1.05, z1 + 5.7);
  bunkerBatch.addBox(0.5, 0.4, 2.6, K.woodD, x1 + 0.5, FL + 0.06, z1 + 5.7);
  bunkerBatch.addBox(2.2, 1.1, 0.5, PAL.dark.slate, x2 - 1.8, FL + 0.06, z2 - 1.6);
  neonBatch.addBox(1.8, 0.04, 0.04, PAL.neon.amber, x2 - 1.8, FL + 0.9, z2 - 1.3);
  [-2.6, -1.8, -1.0].forEach(function (dx) {
    bunkerBatch.addCylinder(0.2, 0.5, K.woodD, x2 + dx, FL + 0.06, z2 - 2.4, 8);
  }); /* bar com bancos */
}

/** Constrói o estar/jantar/cozinha dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildLivingRoom(rect) {
  addKitchen(rect);
  addDiningTable(rect);
  addLounge(rect);
  plant(rect.x1 + 0.6, rect.z1 + 0.6, 1.3);
  plant(rect.x2 - 0.5, rect.z1 + 8.2, 1.3);
  neonBatch.addBox(12, 0.05, 0.05, PAL.light.warmGlow, rect.x1 + 6.8, FL + 3.3, rect.z1 + 7.2);
}
