/* Bunker · Datacenter imerso: 8 tanques de resfriamento e 5 racks com LEDs.
   Posicionado em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, glowBatch, ledBatchA, ledBatchB, ledBatchC, FL, CY, GRN } from '../shell.js';

/** Constrói o datacenter dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildDatacenter(rect) {
  const { x1, z1 } = rect;
  /* tanques imersos: 2 colunas × 4 fileiras */
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 2; c++) {
      const n = r * 2 + c,
        tx = x1 + (c === 0 ? 1.4 : 4.4),
        tz = z1 + 4.0 + r * 3.0;
      bunkerBatch.addBox(2.2, 1.0, 1.4, K.steel, tx, FL, tz);
      bunkerBatch.addBox(2.0, 0.1, 1.2, 0x2c6f78, tx, FL + 1.0, tz);
      glowBatch.addBox(1.8, 0.05, 1.0, 0x35e0b0, tx, FL + 1.1, tz);
      ledBatchA.addBox(1.4, 0.06, 0.04, [CY, GRN][n % 2], tx, FL + 0.6, tz + 0.72);
    }
  /* racks junto à parede dos fundos */
  for (let i = 0; i < 5; i++) {
    const rx = x1 + 0.85 + i * 1.1;
    bunkerBatch.addBox(0.95, 2.3, 0.9, PAL.dark.graphite, rx, FL, z1 + 0.5);
    for (let j = 0; j < 10; j++)
      for (let k = 0; k < 3; k++)
        [ledBatchA, ledBatchB, ledBatchC][(i + j + k) % 3].addBox(
          0.12,
          0.07,
          0.04,
          [CY, GRN, PAL.flora.violet, PAL.neon.amber][(i * 3 + j + k) % 4],
          rx - 0.28 + k * 0.28,
          FL + 0.25 + j * 0.2,
          z1 + 0.98,
        );
  }
}
