/* Bunker · Laboratórios: duas bancadas longas, instrumentos e armário.
   Posicionado em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, glowBatch, FL, CY } from '../shell.js';

/** Constrói os laboratórios dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildLaboratories(rect) {
  const { x1, x2, z1, z2 } = rect;
  const west = x1 + 0.5,
    east = x2 - 0.5,
    mid = z1 + 8.2;
  [west, east].forEach(function (bx) {
    bunkerBatch.addBox(0.9, 0.95, 12, K.white, bx, FL, mid);
    bunkerBatch.addBox(1.0, 0.07, 12.1, PAL.metal.blueSteel, bx, FL + 0.95, mid);
  });
  [1.9, 4.9, 7.9, 10.9].forEach(function (dz, n) {
    const z = z1 + dz;
    bunkerBatch.addCylinder(0.2, 1.0, K.white, west, FL + 1.02, z, 10);
    bunkerBatch.addSphere(0.35, PAL.glass.showerGlass, west, FL + 1.7, z, 1, 1, 1, 1);
    bunkerBatch.addBox(0.6, 0.5, 0.6, [K.steelD, K.white][n % 2], east, FL + 1.02, z);
    glowBatch.addBox(0.3, 0.3, 0.04, CY, east - 0.3, FL + 1.3, z);
  });
  bunkerBatch.addBox(1.2, 1.9, 1.0, K.steel, x1 + 1.9, FL, z2 - 1.4);
}
