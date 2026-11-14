import { describe, it, expect } from 'vitest';
import { sol, sombraDe, horasDeSombra } from '../../tools/lote-lib.mjs';

const LAT = -22.404;
const DECL = 23.44; // solstício de junho: inverno no sul

describe('sol e sombra (x+ oeste, z+ norte)', () => {
  it('meio-dia de inverno: 44,2° ao norte, sem componente leste-oeste', () => {
    const s = sol(LAT, DECL, 12);
    expect(s.elevacao).toBeCloseTo(44.16, 1); // 90 − |−22,404 − 23,44|
    expect(s.x).toBeCloseTo(0, 6);
    expect(s.z).toBeGreaterThan(0.7);
  });

  it('sombra de 10 m ao meio-dia cai ao sul (z−) e mede h / tan(elevação)', () => {
    const o = sombraDe(10, sol(LAT, DECL, 12));
    expect(o.dz).toBeCloseTo(-10 / Math.tan((44.156 * Math.PI) / 180), 1); // −10,30
    expect(o.dx).toBeCloseTo(0, 6);
  });

  it('de manhã o sol está a leste (x−), então a sombra vai para oeste (x+); à tarde, o inverso', () => {
    expect(sombraDe(10, sol(LAT, DECL, 9)).dx).toBeGreaterThan(3);
    expect(sombraDe(10, sol(LAT, DECL, 15)).dx).toBeLessThan(-3);
  });

  it('sol abaixo do horizonte não dá sombra', () => {
    expect(sol(LAT, DECL, 6)).toBeNull();
  });
});

describe('horas de sombra sobre um alvo', () => {
  const cfg = { lat: LAT, decl: DECL, horas: [12] };
  const arvore = { caixa: { x: 0, z: 10, w: 1, d: 1 }, h: 10 };

  it('alvo ao sul, dentro dos 10,3 m: 1 h de sombra', () => {
    expect(horasDeSombra({ x: 0, z: 0, w: 1, d: 1 }, [arvore], cfg, 0.5)).toBe(1);
  });

  it('alvo ao norte da árvore, ou além do alcance da sombra: 0', () => {
    expect(horasDeSombra({ x: 0, z: 20, w: 1, d: 1 }, [arvore], cfg, 0.5)).toBe(0);
    expect(horasDeSombra({ x: 0, z: -20, w: 1, d: 1 }, [arvore], cfg, 0.5)).toBe(0);
  });

  it('metade do alvo na sombra dá 0,5 h', () => {
    // sombra vai de z −0,3 a 11: alvo de z −2,3 a 1,7 (4 m) tem 2 m cobertos (z −0,3 a 1,7)
    expect(horasDeSombra({ x: 0, z: -2.3, w: 1, d: 4 }, [arvore], cfg, 0.5)).toBeCloseTo(0.5, 1);
  });

  it('várias horas: a manhã empurra a sombra para oeste, fora do alvo estreito', () => {
    const manha = { lat: LAT, decl: DECL, horas: [9] };
    expect(horasDeSombra({ x: 0, z: 0, w: 1, d: 1 }, [arvore], manha, 0.5)).toBe(0); // sombra das 9 h cai bem a oeste (x+)
    expect(horasDeSombra({ x: 6, z: 3, w: 1, d: 1 }, [arvore], manha, 0.5)).toBeGreaterThan(0);
  });
});
