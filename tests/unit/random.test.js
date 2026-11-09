import { describe, it, expect, vi } from 'vitest';

/* O gerador guarda a semente dentro do módulo: cada teste carrega uma cópia nova (semente 11). */
async function freshRandom() {
  vi.resetModules();
  return import('../../src/core/random.js');
}

const FIRST_SIX = [
  0.5115870486479253, 0.5299464082345366, 0.6081185641232878, 0.5901576359756291,
  0.8507766961120069, 0.5380222974345088,
];

describe('core/random (mulberry32)', () => {
  it('começa sempre da mesma sequência, a da semente 11', async () => {
    const { R } = await freshRandom();
    expect(Array.from({ length: 6 }, () => R())).toEqual(FIRST_SIX);
  });

  it('duas cópias do módulo geram a mesma sequência', async () => {
    const a = await freshRandom();
    const seqA = Array.from({ length: 50 }, () => a.R());
    const b = await freshRandom();
    const seqB = Array.from({ length: 50 }, () => b.R());
    expect(seqB).toEqual(seqA);
  });

  it('devolve sempre valores em [0, 1)', async () => {
    const { R } = await freshRandom();
    for (let i = 0; i < 5000; i++) {
      const v = R();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('é aproximadamente uniforme: média perto de 0,5', async () => {
    const { R } = await freshRandom();
    const n = 20000;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += R();
    expect(sum / n).toBeGreaterThan(0.48);
    expect(sum / n).toBeLessThan(0.52);
  });

  it('rr(a, b) fica sempre no intervalo [a, b)', async () => {
    const { rr } = await freshRandom();
    for (let i = 0; i < 2000; i++) {
      const v = rr(-3, 7);
      expect(v).toBeGreaterThanOrEqual(-3);
      expect(v).toBeLessThan(7);
    }
  });

  it('rr consome exatamente um número por chamada', async () => {
    const { R, rr } = await freshRandom();
    expect(rr(10, 20)).toBeCloseTo(10 + FIRST_SIX[0] * 10, 12);
    expect(R()).toBe(FIRST_SIX[1]);
  });
});
