/* Bunker · Quarto da sobrinha (11 anos): cama de solteiro, escrivaninha, cabaninha de leitura e estrelinhas no teto.
   Posicionado em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, neonBatch, FL } from '../shell.js';
import { addBunkerBathroom, addBunkerSingleBed, wardrobe, chair } from '../fixtures.js';
import { frameOf } from './frame.js';

/** Constrói o quarto dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildNieceRoom(rect) {
  const { xw, zb, zf } = frameOf(rect);
  addBunkerBathroom(xw, 2.9, zb, xw + 0.95, xw + 1.85, false);
  addBunkerSingleBed(xw + 1.95, zb + 8.4, PAL.flora.violet);
  wardrobe(xw + 0.3, zf - 4.7, Math.PI / 2);
  bunkerBatch.addBox(1.2, 0.06, 0.6, K.woodL, xw + 1.55, FL + 0.76, zf - 1.6);
  bunkerBatch.addBox(0.5, 0.4, 0.05, K.black, xw + 1.55, FL + 0.85, zf - 1.9);
  chair(xw + 1.55, zf - 1.1, 0xff7ac8);
  neonBatch.addBox(2.6, 0.05, 0.05, 0xffd98a, xw + 1.45, FL + 3.2, zb + 2.4);
  /* cabaninha de leitura */
  bunkerBatch.addCone(0.7, 1.5, 0xe8c9a0, xw + 0.75, FL + 0.06, zf - 5.8, 6);
  neonBatch.addSphere(0.1, PAL.light.warmGlow, xw + 0.75, FL + 0.6, zf - 5.8, 1, 1, 1, 1);
  /* estrelinhas no teto */
  for (let i = 0; i < 10; i++)
    neonBatch.addBox(
      0.06,
      0.06,
      0.06,
      [PAL.neon.yellow, PAL.light.white, PAL.glass.iceBlue][i % 3],
      xw + 0.15 + ((i * 7) % 11) * 0.25,
      FL + 3.45,
      zf - 1.7 - ((i * 5) % 9) * 1.2,
    );
}
