/* Bunker · Suíte dos pais: cama king, poltrona de leitura, penteadeira, adega, TV e banheiro.
   Posicionada em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, neonBatch, FL } from '../shell.js';
import { addBunkerBathroom, addBunkerDoubleBed, wardrobe } from '../fixtures.js';
import { frameOf } from './frame.js';

function addBedArea({ xw, xe, zb }) {
  const bx = xe - 1.85,
    bz = zb + 6.8;
  addBunkerDoubleBed(bx, bz, PAL.flora.grass);
  bunkerBatch.addBox(3.2, 1.6, 0.16, PAL.wood.darkWalnut, bx, FL + 0.06, bz - 1.4);
  neonBatch.addBox(2.8, 0.05, 0.05, PAL.neon.amber, bx, FL + 1.55, bz - 1.28);
  bunkerBatch.addBox(0.9, 1.0, 0.4, K.woodD, xw + 0.35, FL + 0.06, bz - 1.7);
  neonBatch.addCylinder(0.06, 0.05, PAL.light.warmGlow, xw + 0.35, FL + 1.1, bz - 1.7, 6);
}

function addTvAndVanity({ xw, xe, zf }) {
  const tz = zf - 5.0;
  bunkerBatch.addBox(1.6, 0.9, 0.5, K.woodD, xe - 0.3, FL + 0.06, tz);
  bunkerBatch.addBox(0.08, 1.1, 1.6, PAL.dark.void, xe - 0.08, FL + 0.9, tz);
  neonBatch.addBox(0.03, 1.0, 1.5, PAL.neon.blue, xe - 0.14, FL + 0.95, tz);
  bunkerBatch.addBox(1.0, 0.8, 0.5, K.woodL, xw + 0.35, FL + 0.06, zf - 1.5);
  bunkerBatch.addBox(0.04, 1.4, 0.9, PAL.glass.showerGlass, xw + 0.1, FL + 0.9, zf - 1.5);
  neonBatch.addBox(0.02, 1.4, 0.04, PAL.light.warmGlow, xw + 0.12, FL + 0.9, zf - 1.0);
}

function addReadingCorner({ xw, zf }) {
  bunkerBatch.addBox(0.9, 0.5, 0.9, PAL.fabric.burgundy, xw + 0.7, FL + 0.06, zf - 5.7);
  bunkerBatch.addBox(0.2, 0.6, 0.9, PAL.fabric.burgundy, xw + 0.3, FL + 0.06, zf - 5.7);
  bunkerBatch.addCylinder(0.03, 1.2, K.steelD, xw + 1.3, FL + 0.06, zf - 5.8, 5);
  neonBatch.addSphere(0.16, PAL.light.warmGlow, xw + 1.3, FL + 1.3, zf - 5.8, 1, 1, 1, 1);
}

function addWineCabinet({ xe, zb }) {
  bunkerBatch.addBox(0.7, 1.9, 0.5, PAL.wood.darkWalnut, xe - 0.4, FL + 0.06, zb + 1.6);
  for (let i = 0; i < 6; i++)
    bunkerBatch.addCylinder(
      0.07,
      0.3,
      [PAL.fabric.wine, 0x2a4a1f, PAL.fabric.wine][i % 3],
      xe - 0.45 + ((i % 2) * 0.2 - 0.1),
      FL + 0.4 + ((i / 2) | 0) * 0.45,
      zb + 1.65,
      6,
    );
}

/** Constrói a suíte dos pais dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildParentsSuite(rect) {
  const f = frameOf(rect);
  const bx = f.xe - 1.85,
    bz = f.zb + 6.8;
  addBunkerBathroom(f.xw, 2.6, f.zb, f.xw + 1.55, f.xw + 2.45, true);
  wardrobe(f.xe - 0.85, f.zb + 0.3, 0);
  addBedArea(f);
  addTvAndVanity(f);
  addReadingCorner(f);
  addWineCabinet(f);
  bunkerBatch.addCylinder(1.2, 0.03, PAL.stone.sandstone, bx, FL + 0.06, bz + 2.4, 20);
  neonBatch.addBox(3.6, 0.04, 0.04, PAL.neon.amber, f.xe - 2.05, FL + 3.3, f.zb + 8.4);
}
