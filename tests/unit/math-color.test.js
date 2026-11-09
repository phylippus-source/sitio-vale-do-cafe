import { describe, it, expect } from 'vitest';
import { clamp, smooth } from '../../src/core/math.js';
import { C } from '../../src/core/color.js';

describe('core/math', () => {
  it('clamp mantém valores que já estão dentro do intervalo', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('clamp corta abaixo e acima', () => {
    expect(clamp(-4, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it('smooth vale 0 antes de a e 1 depois de b', () => {
    expect(smooth(2, 6, -100)).toBe(0);
    expect(smooth(2, 6, 2)).toBe(0);
    expect(smooth(2, 6, 6)).toBe(1);
    expect(smooth(2, 6, 100)).toBe(1);
  });

  it('smooth vale 0,5 no ponto médio', () => {
    expect(smooth(0, 10, 5)).toBeCloseTo(0.5, 12);
  });

  it('smooth cresce sem voltar atrás ao longo do intervalo', () => {
    let prev = -1;
    for (let x = 0; x <= 10; x += 0.25) {
      const v = smooth(0, 10, x);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe('core/color: sRGB para linear', () => {
  it('branco e preto não mudam', () => {
    const w = C(0xffffff);
    const k = C(0x000000);
    expect([w.r, w.g, w.b]).toEqual([1, 1, 1]);
    expect([k.r, k.g, k.b]).toEqual([0, 0, 0]);
  });

  it('cinza médio vai para cerca de 0,216 (curva sRGB)', () => {
    const c = C(0x808080);
    expect(c.r).toBeCloseTo(0.2159, 3);
    expect(c.g).toBeCloseTo(c.r, 12);
    expect(c.b).toBeCloseTo(c.r, 12);
  });

  it('mantém os canais independentes', () => {
    const c = C(0xff0000);
    expect(c.r).toBeCloseTo(1, 12);
    expect(c.g).toBe(0);
    expect(c.b).toBe(0);
  });

  it('cores intermediárias ficam mais escuras que o valor original', () => {
    const c = C(0x6cc13e);
    expect(c.r).toBeLessThan(0x6c / 255);
    expect(c.g).toBeLessThan(0xc1 / 255);
  });

  it('cada chamada devolve uma cor nova, sem estado compartilhado', () => {
    const a = C(0x336699);
    const b = C(0x336699);
    expect(a).not.toBe(b);
    a.r = 0.9;
    expect(b.r).not.toBe(0.9);
  });
});
