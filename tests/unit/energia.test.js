import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { kwhDia, somar, resumir, conferirCargas } from '../../tools/energia-lib.mjs';

const c = (o) => ({
  id: 'x',
  tipo: 'eletrica',
  local: 'bunker',
  uso_kW: 2,
  horas_dia: 3,
  pico_kW: 4,
  simult: 0.5,
  fracao_ano: 1,
  ...o,
});

describe('cargas de energia', () => {
  it('kWh do dia = potência × horas', () => {
    expect(kwhDia(c({}))).toBe(6);
  });

  it('soma: dia de uso, média anual com fração do ano e pico com simultaneidade', () => {
    const s = somar([
      c({}),
      c({ id: 'y', uso_kW: 10, horas_dia: 1, pico_kW: 12, simult: 1, fracao_ano: 0.5 }),
    ]);
    expect(s.kwhDia).toBe(16);
    expect(s.kwhMedio).toBe(11); // 6 + 10 × 0,5
    expect(s.picoKW).toBe(14); // 4 × 0,5 + 12 × 1
    expect(s.cargas).toBe(2);
  });

  it('resumo separa elétrico de térmico e bunker de lote', () => {
    const r = resumir({
      cargas: [
        c({ id: 'a' }),
        c({ id: 'b', local: 'lote', uso_kW: 1, horas_dia: 1, pico_kW: 1 }),
        c({ id: 't', tipo: 'termica', uso_kW: 5, horas_dia: 2 }),
      ],
    });
    expect(r.eletrico.kwhDia).toBe(7);
    expect(r.termico.kwhDia).toBe(10);
    expect(r.bunker.kwhDia).toBe(6);
    expect(r.lote.kwhDia).toBe(1);
    expect(r.maiores[0]).toEqual({ id: 'a', kwhDia: 6 });
  });

  it('confere: pico menor que o uso, tipo e horas inválidos, id repetido', () => {
    expect(conferirCargas({ cargas: [c({})] })).toEqual([]);
    const e = conferirCargas({
      cargas: [c({ pico_kW: 1 }), c({ tipo: 'gas', horas_dia: 25, simult: 0 })],
    });
    expect(e.some((m) => m.includes('pico menor'))).toBe(true);
    expect(e.some((m) => m.includes('tipo gas'))).toBe(true);
    expect(e.some((m) => m.includes('horas/dia'))).toBe(true);
    expect(e.some((m) => m.includes('simultaneidade'))).toBe(true);
    expect(e.some((m) => m.includes('id repetido'))).toBe(true);
  });

  it('o arquivo plan/energia-cargas.json passa na régua e tem a ordem de grandeza esperada', () => {
    const p = JSON.parse(fs.readFileSync('plan/energia-cargas.json', 'utf8'));
    expect(conferirCargas(p)).toEqual([]);
    const r = resumir(p);
    expect(r.eletrico.kwhDia).toBeGreaterThan(300);
    expect(r.eletrico.kwhDia).toBeLessThan(800);
    expect(r.maiores[0].id).toBe('hidroponia-led');
  });
});
