/* Bunker · Despensa 90 dias: duas estantes longas de 3 prateleiras, barris e geladeira.
   Posicionada em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, FL } from '../shell.js';

function addBunkerPantryItem(x, y, z, n) {
  const m = n % 5;
  if (m === 0 || m === 3)
    bunkerBatch.addCylinder(
      0.12,
      0.3,
      [
        PAL.flora.coral,
        PAL.flora.marigold,
        PAL.flora.sage,
        PAL.light.wheat,
        PAL.flora.purple,
        PAL.clay.copperBrown,
      ][n % 6],
      x,
      y,
      z,
      6,
    );
  else if (m === 1) bunkerBatch.addCylinder(0.09, 0.2, K.steel, x, y, z, 6);
  else if (m === 2) bunkerBatch.addBox(0.34, 0.24, 0.3, PAL.clay.sandGold, x, y, z);
  else
    bunkerBatch.addBox(
      0.3,
      0.3,
      0.3,
      [K.woodL, PAL.clay.mustard, PAL.clay.terracotta][n % 3],
      x,
      y,
      z,
    );
}

/* estante ao longo de z (de z1 a z2) na posição x, com itens e montantes */
function shelfZ(z1, z2, x) {
  const L = z2 - z1;
  const n = Math.floor(L / 0.5);
  const nu = Math.round(L / 1.5);
  for (let a = 0; a < 3; a++) {
    bunkerBatch.addBox(0.5, 0.06, L, K.woodL, x, FL + 0.6 + a * 0.7, (z1 + z2) / 2);
    for (let b = 0; b < n; b++)
      addBunkerPantryItem(x, FL + 0.66 + a * 0.7, z1 + 0.25 + b * 0.5, b + a * 3);
  }
  for (let c = 0; c <= nu; c++)
    bunkerBatch.addBox(0.54, 2.3, 0.08, K.woodD, x, FL + 0.06, z1 + (c * L) / nu);
}

/** Constrói a despensa dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildPantry(rect) {
  const { x1, x2, z1, z2 } = rect;
  shelfZ(z1 + 0.8, z2 - 0.8, x1 + 0.4);
  shelfZ(z1 + 0.8, z2 - 0.8, x2 - 0.4);
  for (let i = 0; i < 4; i++)
    bunkerBatch.addCylinder(
      0.4,
      0.9,
      K.wood,
      x1 + 1.3 + (i % 2) * 1.0,
      FL + 0.06,
      z1 + 6.2 + ((i / 2) | 0) * 1.0,
      10,
      0.37,
    );
  bunkerBatch.addBox(1.4, 0.85, 0.7, K.white, x1 + 1.8, FL + 0.06, z2 - 2.0);
}
