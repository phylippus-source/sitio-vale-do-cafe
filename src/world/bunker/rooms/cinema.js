/* Bunker · Cinema e jogos: tela, 2 fileiras de poltronas, mesa de sinuca e fliperamas.
   Posicionado em relação ao retângulo do cômodo. */
import { K, PAL } from '../../../config/palette.js';
import { bunkerBatch, neonBatch, FL, CY, NEON } from '../shell.js';

function addSeats({ x1, z1 }) {
  [3.2, 5.4].forEach(function (dz, n) {
    const z = z1 + dz;
    for (let i = 0; i < 3; i++) {
      const sx = x1 + 1.4 + i * 1.5;
      bunkerBatch.addBox(0.9, 0.5, 0.9, PAL.fabric.burgundy, sx, FL + 0.06 + n * 0.3, z);
      bunkerBatch.addBox(0.9, 0.7, 0.2, PAL.fabric.burgundy, sx, FL + 0.4 + n * 0.3, z + 0.45);
    }
  });
}

function addGames({ x1, x2, z1, z2 }) {
  const px = x1 + 2.8,
    pz = z1 + 10.8;
  bunkerBatch.addBox(2.4, 0.8, 1.3, 0x1a5a3a, px, FL + 0.06, pz);
  bunkerBatch.addBox(2.5, 0.1, 1.4, K.woodD, px, FL + 0.8, pz);
  bunkerBatch.addCylinder(0.1, 0.1, PAL.light.white, x1 + 2.4, FL + 0.92, pz, 8);
  bunkerBatch.addCylinder(0.1, 0.1, PAL.flora.tomatoRed, x1 + 3.1, FL + 0.92, pz, 8);
  bunkerBatch.addBox(0.08, 0.08, 1.5, K.woodD, x2 - 0.8, FL + 1.4, pz);
  neonBatch.addBox(2.2, 0.04, 0.04, NEON, px, FL + 2.4, pz);
  for (let i = 0; i < 2; i++) {
    bunkerBatch.addBox(0.9, 1.8, 0.8, PAL.dark.slate, x1 + 4.4 + i * 1.1, FL + 0.06, z2 - 1.0);
    neonBatch.addBox(0.7, 0.5, 0.04, [NEON, CY][i], x1 + 4.4 + i * 1.1, FL + 1.2, z2 - 1.38);
  }
}

/** Constrói o cinema dentro do retângulo `rect` = { x1, z1, x2, z2 }. */
export function buildCinema(rect) {
  const { x1, z1 } = rect;
  bunkerBatch.addBox(5.2, 2.6, 0.2, PAL.dark.void, x1 + 3.3, FL + 0.6, z1 + 0.3);
  neonBatch.addBox(4.9, 2.3, 0.04, PAL.neon.blue, x1 + 3.3, FL + 0.75, z1 + 0.42);
  addSeats(rect);
  addGames(rect);
  neonBatch.addBox(6.2, 0.05, 0.05, CY, x1 + 3.3, FL + 3.3, z1 + 7.2);
}
