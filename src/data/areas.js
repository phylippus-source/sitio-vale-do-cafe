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

/* Rótulo curto de cada cômodo do bunker, como aparece no memorial (BOM). */
export const AREA_LABELS = {
  'Suíte cyberpunk do Mestre': 'Mestre',
  'Suíte dos pais': 'pais',
  'Quarto da irmã': 'irmã',
  'Quarto da sobrinha': 'sobrinha',
  'Quarto do convidado': 'convidado',
  'Estar, jantar e cozinha': 'estar',
  'Despensa 90 dias': 'despensa',
  'Cinema e jogos': 'cinema',
  Hidroponia: 'hidroponia',
  'Oficina maker': 'oficina',
  Datacenter: 'datacenter',
  Laboratórios: 'laboratórios',
  'Sala limpa': 'sala limpa',
  'Suporte de vida e baterias': 'suporte',
};
