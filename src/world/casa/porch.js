/* Casa Grande · varanda térrea, colunas, escadaria de mármore e lampiões. */
import { GF, UF } from '../../config/dimensions.js';
import { K, WHT, IRON, MARB, AZB, AZW } from '../../config/palette.js';
import { porchBatch, porchLampBatch, casaG, addCasaCollider } from './base.js';

/* ---------- varanda térrea, colunas e escadaria de mármore com espelhos de azulejo e gradil de ferro ---------- */
porchBatch.addBox(26.8, GF - 0.2, 3.4, K.stone, 0, 0, 11.9);
porchBatch.addBox(26.8, 0.2, 3.4, MARB, 0, GF - 0.2, 11.9);
for (let i = 0; i <= 8; i++) {
  const cx = -12 + i * 3.0;
  if (Math.abs(cx) < 0.1) continue;
  porchBatch.addCylinder(0.28, UF - GF - 0.12, WHT, cx, GF, 12.4, 10, 0.22);
  porchBatch.addBox(0.7, 0.22, 0.7, WHT, cx, GF, 12.4);
  porchBatch.addBox(0.6, 0.24, 0.6, K.stoneL, cx, UF - 0.28, 12.4);
}
[-1.5, 1.5].forEach(function (cx) {
  porchBatch.addCylinder(0.3, UF - GF - 0.12, WHT, cx, GF, 12.4, 10, 0.24);
  porchBatch.addBox(0.8, 0.24, 0.8, WHT, cx, GF, 12.4);
});
porchBatch.addBox(27, 0.3, 0.5, WHT, 0, UF - 0.38, 12.4);
for (let i = 0; i < 7; i++) {
  porchBatch.addBox(6.2 - i * 0.0, 0.14, 0.45, MARB, 0, i * (GF / 7), 13.6 + (6 - i) * 0.45);
  porchBatch.addBox(
    6.2,
    GF / 7,
    0.04,
    i % 2 ? AZB : AZW,
    0,
    i * (GF / 7) + 0.0,
    13.6 + (6 - i) * 0.45 + 0.23,
  );
}
[-3.2, 3.2].forEach(function (sx) {
  porchBatch.addBeam([sx, 0.9, 13.4], [sx, GF + 0.9, 16.8], 0.05, IRON, 5);
  porchBatch.addBox(0.2, 0.9, 0.2, WHT, sx, 0, 16.8);
  porchBatch.addSphere(0.22, K.stoneL, sx, 0.9 + 0.2, 16.8, 1, 1.4, 1);
  porchBatch.addSphere(0.22, K.stoneL, sx, GF + 1.1, 13.4, 1, 1.4, 1);
});
for (let i = 0; i <= 6; i++)
  [-3.2, 3.2].forEach(function (sx) {
    porchBatch.addBox(0.04, 0.8, 0.04, IRON, sx, i * (GF / 7), 16.8 - i * 0.45);
  });
for (let i = 0; i <= 26; i++)
  if (Math.abs(i - 13) > 3) porchBatch.addBox(0.05, 0.9, 0.05, IRON, -13 + i, GF, 13.55);
porchBatch.addBox(10.5, 0.07, 0.07, IRON, -8.2, GF + 0.9, 13.55);
porchBatch.addBox(10.5, 0.07, 0.07, IRON, 8.2, GF + 0.9, 13.55);
/* lampiões de ferro e refletores (noite) */
[-12, -6, 6, 12].forEach(function (cx) {
  porchBatch.addBox(0.18, 0.5, 0.18, IRON, cx, UF - 1.0, 11.2);
  porchLampBatch.addSphere(0.17, 0xffe3a0, cx, UF - 1.2, 11.2, 1, 1.3, 1);
});
porchBatch.build(casaG);
porchLampBatch.build(casaG, { unlit: true, outline: false });
addCasaCollider(-13.4, 13.2, -3.2, 13.5, 's');
addCasaCollider(3.2, 13.2, 13.4, 13.5, 's');
addCasaCollider(-13.5, 10.2, -13.2, 13.5, 's');
addCasaCollider(13.2, 10.2, 13.5, 13.5, 's');
addCasaCollider(-13.5, -10.3, 13.5, -10.3, 'a');
addCasaCollider(13.4, -10.4, 13.5, 12.6, 'a');
addCasaCollider(-13.5, -10.4, -13.4, 12.6, 'a');
addCasaCollider(-13.5, 12.4, 13.5, 12.6, 'a');
addCasaCollider(-1.2, 4.2, -1.0, 9.9, 'a');
addCasaCollider(1.0, 4.2, 1.2, 9.9, 'a');
addCasaCollider(-1.2, 9.8, 1.2, 10.0, 'a');
