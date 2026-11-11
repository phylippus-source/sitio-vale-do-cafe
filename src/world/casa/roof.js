/* Casa Grande · telhado de quatro águas, frontão com relógio, beirais e chaminé. */
import * as THREE from 'three';
import { GX } from '../../core/geometries.js';
import { hipGeo } from '../../core/geometry.js';
import { UF, UHT } from '../../config/dimensions.js';
import { K, CW, WHT } from '../../config/palette.js';
import { casaRoofBatch, casaRoofG, roofMat } from './base.js';

/* ---------- telhado de quatro águas em capa e canal, frontão central com relógio, beirais de 2 m ---------- */
const RB = UF + UHT,
  RH = 4.6,
  RW = 30.2,
  RD = 24.2;
casaRoofBatch.addGeometry(hipGeo(RW, RD, RH), K.roof, 0, RB, 0);
casaRoofBatch.addBox(RW + 0.4, 0.3, RD + 0.4, K.woodD, 0, RB - 0.3, 0);
const th = Math.atan2(RH, RD / 2),
  sn = Math.sin(th),
  cs = Math.cos(th);
for (let tt = 0.5; tt < RD / 2 - 0.6; tt += 0.8) {
  const wdt = RW - 2 * tt - 0.6;
  [
    [1, 1],
    [-1, -1],
  ].forEach(function (sg) {
    casaRoofBatch.addGeometry(
      GX.box,
      K.roofD,
      0,
      RB + tt * sn + 0.04,
      sg[0] * (RD / 2 - tt * cs),
      [wdt, 0.05, 0.1],
      [sg[0] * th, 0, 0],
    );
  });
}
casaRoofBatch.addBox(RW - RD + 0.6, 0.3, 0.55, K.roofD, 0, RB + RH - 0.02, 0);
const tri = new THREE.Shape();
tri.moveTo(-4.4, 0);
tri.lineTo(4.4, 0);
tri.lineTo(0, 3.0);
const gg = new THREE.ExtrudeGeometry(tri, { depth: 0.6, bevelEnabled: false });
gg.translate(0, 0, -0.3);
casaRoofBatch.addGeometry(gg, WHT, 0, RB - 0.1, 10.6);
casaRoofBatch.addGeometry(gg, K.stoneL, 0, RB - 0.1, 10.2, [1.06, 1.06, 0.4]);
casaRoofBatch.addCylinder(0.85, 0.14, WHT, 0, RB + 1.0, 10.98, 24, 0.85, [Math.PI / 2, 0, 0]);
casaRoofBatch.addCylinder(0.7, 0.15, 0x1d3566, 0, RB + 1.0, 11.0, 24, 0.7, [Math.PI / 2, 0, 0]);
casaRoofBatch.addBox(0.06, 0.55, 0.05, WHT, 0, RB + 1.0, 11.1);
casaRoofBatch.addBox(0.4, 0.06, 0.05, WHT, 0.1, RB + 1.0, 11.1);
[-4.5, 4.5].forEach(function (ax) {
  casaRoofBatch.addSphere(0.3, K.stoneL, ax, RB + 0.1, 10.6, 1, 1.3, 1);
});
casaRoofBatch.addSphere(0.3, K.stoneL, 0, RB + 3.1, 10.6, 1, 1.3, 1); /* acrotérios */
for (let i = 0; i <= 12; i++)
  casaRoofBatch.addBox(
    0.12,
    0.5,
    0.06,
    K.woodD,
    -12 + i * 2,
    RB - 0.7,
    12.1,
  ); /* lambrequins sob o beiral */
casaRoofBatch.addBox(1.4, 3.4, 1.4, CW, 6, RB + 1.3, -3);
casaRoofBatch.addBox(1.8, 0.3, 1.8, K.stoneD, 6, RB + 4.5, -3);
casaRoofBatch.addBox(0.8, 0.9, 0.8, K.stone, 6, RB + 4.8, -3);
casaRoofBatch.build(casaRoofG, { mat: roofMat });
