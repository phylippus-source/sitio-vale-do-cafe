/* Áreas derivadas da geometria dos cômodos (fonte única: ROOMS). */
import { ROOMS } from './rooms.js';

const area = ([, x1, z1, x2, z2]) => (x2 - x1) * (z2 - z1);

/* Cômodos do bunker: { nome: m² }. */
export function bunkerRoomAreas() {
  const out = {};
  ROOMS.filter((r) => r[5] === 'u').forEach((r) => {
    out[r[0]] = Math.round(area(r) * 10) / 10;
  });
  return out;
}

/* Soma das áreas dos cômodos do bunker (m²). */
export function bunkerRoomsTotal() {
  return ROOMS.filter((r) => r[5] === 'u').reduce((sum, r) => sum + area(r), 0);
}
