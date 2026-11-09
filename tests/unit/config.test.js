import { describe, it, expect } from 'vitest';
import * as P from '../../src/config/palette.js';
import {
  FLOOR,
  BFL,
  BWH,
  GF,
  GHT,
  UF,
  UHT,
  LOT,
  STREAM,
  BUNKER,
  BUNKER_INNER,
  CASA_ORIGIN,
  BARN_ORIGIN,
} from '../../src/config/dimensions.js';

const isColor = (v) => Number.isInteger(v) && v >= 0 && v <= 0xffffff;
const named = Object.entries(P.PAL).flatMap(([group, o]) =>
  Object.entries(o).map(([name, hex]) => [group + '.' + name, hex]),
);
const insideLot = (x, z) => x >= LOT.x1 && x <= LOT.x2 && z >= LOT.z1 && z <= LOT.z2;

describe('config/palette', () => {
  it('toda cor de K é um inteiro RGB válido', () => {
    Object.entries(P.K).forEach(([name, v]) => expect(isColor(v), name).toBe(true));
  });

  it('as cores avulsas exportadas são válidas', () => {
    [P.CW, P.WHT, P.IRON, P.MARB, P.AZB, P.AZW, P.TERRA].forEach((v) => {
      expect(isColor(v)).toBe(true);
    });
  });

  it('PAL guarda 72 cores nomeadas, todas válidas', () => {
    expect(named).toHaveLength(72);
    named.forEach(([name, hex]) => expect(isColor(hex), name).toBe(true));
  });

  it('nenhum valor de cor se repete na PAL: uma cor, um nome', () => {
    const seen = new Map();
    named.forEach(([name, hex]) => {
      expect(seen.get(hex), name + ' repete ' + seen.get(hex)).toBeUndefined();
      seen.set(hex, name);
    });
  });
});

describe('config/dimensions', () => {
  it('a gleba tem 100 × 150 m, centrada na origem', () => {
    expect(LOT.x2 - LOT.x1).toBe(100);
    expect(LOT.z2 - LOT.z1).toBe(150);
    expect(LOT.x1 + LOT.x2).toBe(0);
    expect(LOT.z1 + LOT.z2).toBe(0);
  });

  it('o córrego fica dentro da gleba', () => {
    expect(STREAM.x1).toBeLessThan(STREAM.x2);
    expect(STREAM.x1).toBeGreaterThanOrEqual(LOT.x1);
    expect(STREAM.x2).toBeLessThanOrEqual(LOT.x2);
  });

  it('o interior útil do bunker é o bunker menos as paredes', () => {
    expect(BUNKER_INNER.x1).toBeCloseTo(BUNKER.x1 + BUNKER.wall, 9);
    expect(BUNKER_INNER.x2).toBeCloseTo(BUNKER.x2 - BUNKER.wall, 9);
    expect(BUNKER_INNER.z1).toBeCloseTo(BUNKER.z1 + BUNKER.wall, 9);
    expect(BUNKER_INNER.z2).toBeCloseTo(BUNKER.z2 - BUNKER.wall, 9);
  });

  it('o bunker cabe dentro da gleba', () => {
    expect(insideLot(BUNKER.x1, BUNKER.z1)).toBe(true);
    expect(insideLot(BUNKER.x2, BUNKER.z2)).toBe(true);
  });

  it('o corredor do bunker fica entre as paredes do interior', () => {
    expect(BUNKER_INNER.corridorZ1).toBeLessThan(BUNKER_INNER.corridorZ2);
    expect(BUNKER_INNER.corridorZ1).toBeGreaterThan(BUNKER_INNER.z1);
    expect(BUNKER_INNER.corridorZ2).toBeLessThan(BUNKER_INNER.z2);
  });

  it('as origens da casa e do engenho ficam dentro da gleba', () => {
    expect(insideLot(CASA_ORIGIN.x, CASA_ORIGIN.z)).toBe(true);
    expect(insideLot(BARN_ORIGIN.x, BARN_ORIGIN.z)).toBe(true);
  });

  it('as cotas verticais são coerentes', () => {
    expect(FLOOR).toBeLessThan(0);
    expect(BFL).toBeCloseTo(FLOOR + 0.2, 9);
    expect(BWH).toBeGreaterThan(0);
    expect(GHT).toBeGreaterThan(0);
    expect(UHT).toBeGreaterThan(0);
    expect(UF).toBeGreaterThanOrEqual(GF + GHT);
  });
});
