/* Bunker · louças e móveis reutilizáveis: vaso, pia, chuveiro, banheiro de fundos, camas, guarda-roupa, mesa, cadeira e planta. */
import { K, AZB, PAL } from '../../config/palette.js';
import { wall } from '../casa/base.js';
import { bunkerBatch, FL, bunkerWallBatch, WB, PW, addBunkerWallCollider, tile } from './shell.js';

/* helpers de louça e móveis */
function toilet(x, z, ry) {
  bunkerBatch.setOrigin(x, 0, z, ry || 0);
  bunkerBatch.addBox(0.42, 0.42, 0.6, K.white, 0, FL + 0.06, 0);
  bunkerBatch.addBox(0.4, 0.55, 0.2, K.white, 0, FL + 0.06, -0.38);
  bunkerBatch.addBox(0.44, 0.05, 0.5, K.steel, 0, FL + 0.48, 0.02);
  bunkerBatch.setOrigin(0, 0, 0, 0);
}
function sink(x, z, ry) {
  bunkerBatch.setOrigin(x, 0, z, ry || 0);
  bunkerBatch.addCylinder(0.1, 0.7, K.white, 0, FL + 0.06, 0, 6);
  bunkerBatch.addBox(0.65, 0.14, 0.48, K.white, 0, FL + 0.76, 0);
  bunkerBatch.addCylinder(0.035, 0.3, K.steel, 0, FL + 0.9, -0.17, 5);
  bunkerBatch.addBox(0.7, 0.7, 0.04, 0x9bd9f1, 0, FL + 1.36, -0.3);
  bunkerBatch.setOrigin(0, 0, 0, 0);
}
function shower(x, z, sz) {
  bunkerBatch.addBox(1.1, 0.08, 1.1, 0xeaf3f7, x, FL + 0.06, z);
  bunkerBatch.addCylinder(0.03, 1.9, K.steel, x - 0.5, FL + 0.14, z + sz * 0.5, 5);
  bunkerBatch.addBox(0.3, 0.05, 0.3, K.steel, x - 0.38, FL + 1.99, z + sz * 0.45);
  bunkerBatch.addBox(0.04, 1.9, 1.1, PAL.glass.showerGlass, x + 0.55, FL + 0.14, z);
}
/* banheiro nos fundos (zw = parede dos fundos, sz = +1): paredes com porta voltada ao quarto */
export function addBunkerBathroom(xo, bw, zw, dxa, dxb, sideWall) {
  const zf = zw + 2.55;
  wall(
    bunkerWallBatch,
    'x',
    zf,
    xo - 0.15,
    xo + bw + (sideWall ? 0.15 : 0),
    [[dxa, dxb, 0, 2.4]],
    FL,
    WB - 0.04,
    0.3,
    PW,
    null,
  );
  addBunkerWallCollider('x', zf, xo - 0.15, xo + bw, [[dxa, dxb, 0, 2.4]], 0.3);
  if (sideWall) {
    wall(bunkerWallBatch, 'z', xo + bw + 0.15, zw, zf, [], FL, WB - 0.04, 0.3, PW, null);
    addBunkerWallCollider('z', xo + bw + 0.15, zw, zf, [], 0.3);
  }
  tile(xo, zw, xo + bw, zf - 0.15, 0xeaf3f7);
  toilet(xo + 0.55, zw + 0.5, 0);
  sink(xo + 1.6, zw + 0.35, 0);
  shower(xo + 0.65, zw + 1.7, 1);
  bunkerBatch.addBox(0.06, 1.4, 2.3, AZB, xo + 0.04, FL + 0.06, zw + 1.2);
}
export function addBunkerDoubleBed(bx, bz, c) {
  bunkerBatch.addBox(2.0, 0.5, 2.2, K.woodD, bx, FL + 0.06, bz);
  bunkerBatch.addBox(1.9, 0.28, 2.1, PAL.light.ivory, bx, FL + 0.56, bz);
  bunkerBatch.addBox(1.9, 0.12, 1.3, c, bx, FL + 0.84, bz + 0.4);
  bunkerBatch.addBox(1.4, 0.18, 0.5, K.white, bx, FL + 0.84, bz - 0.8);
  bunkerBatch.addBox(2.1, 1.3, 0.14, K.woodD, bx, FL + 0.06, bz - 1.15);
  bunkerBatch.addBox(0.5, 0.45, 0.5, K.woodL, bx + 1.5, FL + 0.06, bz - 0.8);
  bunkerBatch.addBox(0.5, 0.45, 0.5, K.woodL, bx - 1.5, FL + 0.06, bz - 0.8);
}
export function addBunkerSingleBed(bx, bz, c) {
  bunkerBatch.addBox(1.1, 0.4, 2.0, K.woodD, bx, FL + 0.06, bz);
  bunkerBatch.addBox(1.0, 0.22, 1.9, PAL.light.ivory, bx, FL + 0.46, bz);
  bunkerBatch.addBox(1.0, 0.1, 1.2, c, bx, FL + 0.68, bz + 0.35);
  bunkerBatch.addBox(1.2, 1.0, 0.12, K.woodD, bx, FL + 0.06, bz - 1.05);
}
export function wardrobe(wx, wz, r) {
  bunkerBatch.setOrigin(wx, 0, wz, r || 0);
  bunkerBatch.addBox(1.6, 2.3, 0.6, K.woodD, 0, FL + 0.06, 0);
  bunkerBatch.addBox(0.03, 2.0, 0.05, PAL.clay.gold, 0, FL + 0.26, 0.32);
  bunkerBatch.setOrigin(0, 0, 0, 0);
}
export function desk(x, z, len, rot) {
  bunkerBatch.setOrigin(x, 0, z, rot || 0);
  bunkerBatch.addBox(len, 0.05, 0.8, K.woodL, 0, FL + 0.76, 0);
  bunkerBatch.addBox(0.06, 0.7, 0.7, K.woodD, -len / 2 + 0.05, FL + 0.06, 0);
  bunkerBatch.addBox(0.06, 0.7, 0.7, K.woodD, len / 2 - 0.05, FL + 0.06, 0);
  bunkerBatch.setOrigin(0, 0, 0, 0);
}
export function chair(x, z, c) {
  bunkerBatch.addBox(0.5, 0.1, 0.5, c || PAL.dark.deviceBlack, x, FL + 0.5, z);
  bunkerBatch.addBox(0.5, 0.8, 0.08, c || PAL.dark.deviceBlack, x, FL + 0.55, z - 0.26);
  bunkerBatch.addCylinder(0.05, 0.44, K.steelD, x, FL + 0.06, z, 6);
  bunkerBatch.addCylinder(0.28, 0.04, K.steelD, x, FL + 0.06, z, 8);
}
export function plant(x, z, s) {
  bunkerBatch.addCylinder(0.22 * s, 0.35 * s, PAL.clay.terracotta, x, FL + 0.06, z, 8);
  bunkerBatch.addSphere(0.4 * s, 0x3fae52, x, FL + 0.6 * s + 0.2, z, 1, 1.2, 1);
}
