import { describe, it, expect, afterEach } from 'vitest';
import { validateData } from '../../src/data/validate.js';
import { ROOMS } from '../../src/data/rooms.js';
import { PLOTS } from '../../src/data/crops.js';
import { AREA_LABELS, bunkerRoomAreas } from '../../src/data/areas.js';

const roomCount = ROOMS.length;
const plotX2 = PLOTS[0].x2;
const cinemaLabel = AREA_LABELS['Cinema e jogos'];
const has = (text) => validateData().some((p) => p.includes(text));

/* Os testes estragam os dados de propósito; cada teste devolve tudo ao estado original. */
afterEach(() => {
  ROOMS.length = roomCount;
  PLOTS[0].x2 = plotX2;
  AREA_LABELS['Cinema e jogos'] = cinemaLabel;
});

describe('data/validate', () => {
  it('os dados atuais passam sem nenhum problema', () => {
    expect(validateData()).toEqual([]);
  });

  it('acusa cômodo com área vazia ou invertida', () => {
    ROOMS.push(['Teste', 5, 5, 1, 1, 's']);
    expect(has('cômodo Teste: área vazia ou invertida')).toBe(true);
  });

  it('acusa nível inválido', () => {
    ROOMS.push(['Teste', 0, 0, 1, 1, 'z']);
    expect(has('cômodo Teste: nível inválido z')).toBe(true);
  });

  it('acusa cômodo do bunker fora do bunker', () => {
    ROOMS.push(['Teste', 40, 40, 41, 41, 'u']);
    expect(has('cômodo Teste fora do bunker')).toBe(true);
  });

  it('acusa cômodos do bunker que deixam de ladrilhar o interior', () => {
    ROOMS.push(['Teste', -11, -70, -10, -69, 'u']);
    expect(has('cômodos do bunker somam')).toBe(true);
  });

  it('acusa quadra com área diferente de 500 m²', () => {
    PLOTS[0].x2 += 1;
    expect(has('quadra Q1')).toBe(true);
  });

  it('acusa memorial que não cita a área real do cômodo', () => {
    AREA_LABELS['Cinema e jogos'] = 'zzz';
    const expected = 'esperado "zzz ' + Math.round(bunkerRoomAreas()['Cinema e jogos']) + '"';
    expect(has(expected)).toBe(true);
  });
});
