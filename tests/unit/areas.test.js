import { describe, it, expect } from 'vitest';
import { ROOMS } from '../../src/data/rooms.js';
import { bunkerRoomAreas, bunkerRoomsTotal, AREA_LABELS } from '../../src/data/areas.js';
import { BUNKER_INNER } from '../../src/config/dimensions.js';

const under = ROOMS.filter((r) => r[5] === 'u');
const rectArea = ([, x1, z1, x2, z2]) => (x2 - x1) * (z2 - z1);

describe('data/areas', () => {
  it('só os cômodos de nível u entram nas áreas do bunker', () => {
    const names = Object.keys(bunkerRoomAreas());
    expect(names).toHaveLength(under.length);
    expect(new Set(names).size).toBe(names.length);
    names.forEach((n) => expect(under.some((r) => r[0] === n)).toBe(true));
  });

  it('a área de um cômodo é largura × profundidade, com uma casa decimal', () => {
    expect(bunkerRoomAreas()['Suíte cyberpunk do Mestre']).toBe(116.2);
    expect(bunkerRoomAreas()['Despensa 90 dias']).toBe(52.6);
  });

  it('o total é a soma das áreas dos cômodos', () => {
    const sum = under.reduce((s, r) => s + rectArea(r), 0);
    expect(bunkerRoomsTotal()).toBeCloseTo(sum, 9);
  });

  it('os rótulos do memorial apontam para cômodos que existem', () => {
    const areas = bunkerRoomAreas();
    Object.keys(AREA_LABELS).forEach((room) => expect(areas[room], room).toBeGreaterThan(0));
  });

  it('os cômodos do bunker ladrilham o interior útil, sem folga', () => {
    const inner = (BUNKER_INNER.x2 - BUNKER_INNER.x1) * (BUNKER_INNER.z2 - BUNKER_INNER.z1);
    expect(Math.abs(bunkerRoomsTotal() - inner)).toBeLessThan(0.5);
  });

  it('nenhum cômodo do bunker tem área vazia', () => {
    under.forEach((r) => expect(rectArea(r), r[0]).toBeGreaterThan(0));
  });

  it('os cômodos do bunker não se sobrepõem', () => {
    for (let i = 0; i < under.length; i++) {
      for (let j = i + 1; j < under.length; j++) {
        const [a, b] = [under[i], under[j]];
        const dx = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
        const dz = Math.min(a[4], b[4]) - Math.max(a[2], b[2]);
        expect(dx > 1e-9 && dz > 1e-9, a[0] + ' × ' + b[0]).toBe(false);
      }
    }
  });
});
