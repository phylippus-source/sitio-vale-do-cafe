/* Bunker · Quarto da irmã: cama de casal, guarda-roupa, escrivaninha e banheiro (suíte 3×2).
   Posicionado em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, FL } from '../shell.js';
import {
  addBunkerBathroom,
  addBunkerDoubleBed,
  wardrobe,
  desk,
  chair,
  plant,
} from '../fixtures.js';
import { frameOf } from './frame.js';

/** Constrói o quarto dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildSisterRoom(rect) {
  const { xw, xe, zb, zf } = frameOf(rect);
  addBunkerBathroom(xw, 2.4, zb, xw + 0.75, xw + 1.65, true);
  addBunkerDoubleBed(xw + 2.15, zb + 8.4, PAL.flora.salmon);
  wardrobe(xe - 0.3, zf - 4.8, -Math.PI / 2);
  desk(xw + 0.45, zf - 2.4, 1.3, 0);
  bunkerBatch.addBox(0.5, 0.4, 0.05, K.black, xw + 0.45, FL + 0.85, zf - 2.7);
  chair(xw + 0.45, zf - 1.8, PAL.flora.purple);
  plant(xe - 0.35, zf - 1.2, 1.0);
  bunkerBatch.addCylinder(0.9, 0.03, PAL.flora.purple, xw + 0.75, FL + 0.06, zf - 4.7, 18);
}
