/* Bunker · Hidroponia vertical: 3 torres de 4 níveis com 19 plantas cada, luz violeta e 2 reservatórios.
   Posicionada em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, neonBatch, FL } from '../shell.js';

/** Constrói a hidroponia dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildHydroponics(rect) {
  const { x1, x2, z1, z2 } = rect;
  const mid = z1 + 7.0;
  [1.8, 4.0, 6.2].forEach(function (dx) {
    const hx = x1 + dx;
    for (let j = 0; j < 4; j++) {
      bunkerBatch.addBox(1.0, 0.08, 12.4, K.steelD, hx, FL + 0.5 + j * 0.7, mid);
      for (let k = 0; k < 19; k++)
        bunkerBatch.addSphere(
          0.26,
          [PAL.flora.cropGreenA, PAL.flora.cropGreenC, PAL.flora.lime][(k + j) % 3],
          hx + (k % 2 ? 0.2 : -0.2),
          FL + 0.78 + j * 0.7,
          z1 + 1.2 + k * 0.62,
          1,
          0.8,
          1,
        );
      neonBatch.addBox(0.9, 0.03, 12.0, 0xd44cff, hx, FL + 0.38 + j * 0.7, mid);
    }
    bunkerBatch.addBox(0.1, 3.0, 12.4, K.steelD, hx - 0.55, FL, mid);
    bunkerBatch.addBox(0.1, 3.0, 12.4, K.steelD, hx + 0.55, FL, mid);
  });
  bunkerBatch.addCylinder(0.5, 1.4, K.blue, x1 + 0.6, FL, z2 - 1.2, 10);
  bunkerBatch.addCylinder(0.5, 1.4, K.blue, x2 - 0.8, FL, z2 - 1.2, 10);
}
