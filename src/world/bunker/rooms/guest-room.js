/* Bunker · Quarto do convidado: cama de solteiro, guarda-roupa, escrivaninha e banheiro.
   Posicionado em relação ao retângulo do cômodo. */
import { PAL } from '../../../config/palette.js';
import { addBunkerBathroom, addBunkerSingleBed, wardrobe, desk, chair } from '../fixtures.js';
import { frameOf } from './frame.js';

/** Constrói o quarto dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildGuestRoom(rect) {
  const { xw, zb, zf } = frameOf(rect);
  addBunkerBathroom(xw, 2.7, zb, xw + 0.95, xw + 1.85, false);
  addBunkerSingleBed(xw + 1.85, zb + 8.4, PAL.flora.cornflower);
  wardrobe(xw + 0.3, zf - 4.7, Math.PI / 2);
  desk(xw + 1.35, zf - 1.8, 1.2, 0);
  chair(xw + 1.35, zf - 1.2, PAL.glass.windowDeep);
}
