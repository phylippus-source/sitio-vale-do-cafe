/* Bunker · Sala limpa: bancada escura, microscópio, coluna e luz de teto violeta.
   Posicionado em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, glowBatch, ledBatchC, FL } from '../shell.js';

/** Constrói a sala limpa dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildCleanRoom(rect) {
  const { x1, z1 } = rect;
  bunkerBatch.addBox(1.4, 0.9, 3.0, 0x191c22, x1 + 1.6, FL, z1 + 2.8);
  bunkerBatch.addBox(0.7, 0.5, 0.9, K.white, x1 + 1.4, FL + 0.9, z1 + 2.2);
  glowBatch.addBox(0.6, 0.04, 0.8, PAL.neon.violet, x1 + 1.4, FL + 0.9, z1 + 2.2);
  bunkerBatch.addBox(0.2, 1.2, 0.2, K.steelD, x1 + 1.4, FL + 1.4, z1 + 2.2);
  bunkerBatch.addCylinder(0.5, 3.0, PAL.light.tileGrey, x1 + 2.4, FL, z1 + 7.8, 12);
  bunkerBatch.addBox(1.1, 1.1, 1.1, K.white, x1 + 1.6, FL, z1 + 13.0);
  ledBatchC.addBox(0.2, 0.06, 6, PAL.neon.violet, x1 + 1.5, FL + 3.2, z1 + 8.4);
}
