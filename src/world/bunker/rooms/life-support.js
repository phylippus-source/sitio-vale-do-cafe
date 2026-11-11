/* Bunker · Suporte de vida e baterias térmicas: 4 reservatórios horizontais, 3 cilindros de gás e extintores.
   Posicionado em relação ao retângulo do cômodo. */
import { cylG } from '../../../core/geometries.js';
import { K } from '../../../config/palette.js';
import { bunkerBatch, ledBatchC, FL } from '../shell.js';

/** Constrói o suporte de vida dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildLifeSupport(rect) {
  const { x1, z1 } = rect;
  [1.8, 4.2, 6.6, 9.0].forEach(function (dz) {
    const bz = z1 + dz;
    bunkerBatch.addGeometry(
      cylG(1, 16),
      K.steel,
      x1 + 2.2,
      FL + 1.0,
      bz,
      [0.7, 3.0, 0.7],
      [0, 0, Math.PI / 2],
    );
    bunkerBatch.addGeometry(
      cylG(1, 16),
      K.orange,
      x1 + 0.7,
      FL + 1.0,
      bz,
      [0.55, 0.14, 0.55],
      [0, 0, Math.PI / 2],
    );
    bunkerBatch.addBox(0.2, 1.0, 0.2, K.steelD, x1 + 1.4, FL, bz);
    bunkerBatch.addBox(0.2, 1.0, 0.2, K.steelD, x1 + 3.0, FL, bz);
    ledBatchC.addBox(0.12, 0.9, 0.9, 0xff7a2a, x1 + 0.6, FL + 0.55, bz);
  });
  [1.2, 2.4, 3.6].forEach(function (dx) {
    bunkerBatch.addCylinder(0.5, 2.4, K.blue, x1 + dx, FL, z1 + 11.8, 12);
    bunkerBatch.addCylinder(0.52, 0.2, K.steel, x1 + dx, FL + 2.4, z1 + 11.8, 12);
  });
  for (let i = 0; i < 4; i++) {
    bunkerBatch.addCylinder(0.24, 0.9, K.red, x1 + 1.0 + i * 0.7, FL, z1 + 14.2, 8);
    bunkerBatch.addCylinder(0.18, 0.2, K.white, x1 + 1.0 + i * 0.7, FL + 0.9, z1 + 14.2, 8);
  }
}
