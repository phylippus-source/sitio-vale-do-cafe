/* Bunker · Oficina maker: bancada com impressoras 3D, CNC, torno, bancada de serra e prateleira de ferramentas.
   Posicionada em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, glowBatch, FL, CY } from '../shell.js';

function addBench({ x2, z1 }) {
  const bx = x2 - 0.6,
    bz = z1 + 7.0;
  bunkerBatch.addBox(0.8, 0.95, 10, K.woodL, bx, FL, bz);
  bunkerBatch.addBox(0.9, 0.06, 10.1, PAL.light.cream, bx, FL + 0.95, bz);
  [2.2, 4.2, 6.2].forEach(function (dz) {
    bunkerBatch.addBox(0.5, 0.5, 0.5, K.white, bx, FL + 1.01, z1 + dz);
    glowBatch.addBox(0.3, 0.3, 0.04, CY, x2 - 0.86, FL + 1.3, z1 + dz);
  });
}

function addMachines({ x1, z1 }) {
  const mx = x1 + 1.8;
  bunkerBatch.addBox(1.6, 1.5, 1.4, K.steelD, mx, FL, z1 + 1.6);
  glowBatch.addBox(1.0, 0.5, 0.05, PAL.neon.amber, mx, FL + 0.8, z1 + 2.3);
  bunkerBatch.addBox(2.2, 0.8, 0.8, K.steel, mx, FL, z1 + 5.8);
  bunkerBatch.addCylinder(0.3, 0.5, K.black, x1 + 1.0, FL + 0.8, z1 + 5.8, 8);
  bunkerBatch.addBox(1.0, 0.9, 0.9, K.red, x1 + 1.2, FL, z1 + 9.8);
}

function addSawAndRack({ x1, x2, z1, z2 }) {
  bunkerBatch.addBox(1.2, 0.12, 2.4, K.steelD, x1 + 3.8, FL, z2 - 2.6);
  for (let i = 0; i < 4; i++)
    bunkerBatch.addBox(0.2, 0.2, 0.9, K.woodL, x1 + 3.8, FL + 0.12 + i * 0.2, z2 - 2.6);
  bunkerBatch.addBox(0.2, 0.2, 1.6, K.yellow, x1 + 2.2, FL + 0.06, z2 - 2.0);
  bunkerBatch.addBox(0.9, 0.05, 1.6, K.steelD, x1 + 2.2, FL + 0.26, z2 - 2.0);
  for (let i = 0; i < 9; i++)
    bunkerBatch.addBox(
      0.1,
      0.3,
      0.5 + (i % 3) * 0.12,
      [K.red, K.steel, K.yellow][i % 3],
      x2 - 0.1,
      FL + 1.3 + (i % 3) * 0.4,
      z1 + 2.2 + i * 1.0,
    );
}

/** Constrói a oficina dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildWorkshop(rect) {
  addBench(rect);
  addMachines(rect);
  addSawAndRack(rect);
}
