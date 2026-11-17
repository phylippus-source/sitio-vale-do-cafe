import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { montarBundle } from '../../tools/build-web.mjs';
import { avaliar, encaixar, girar } from '../../tools/lote-web.mjs';

const S = JSON.parse(fs.readFileSync('plan/site.json', 'utf8'));
const B = JSON.parse(fs.readFileSync('plan/bunker.json', 'utf8'));
const lote = JSON.parse(fs.readFileSync('plan/lote-opcoes.json', 'utf8'));
const esc = JSON.parse(fs.readFileSync('plan/bunker-opcoes.json', 'utf8'));
const pg = esc.opcoes.find((o) => o.id === esc.escolhida).pegada;
const bunker = { x0: B.mundo.x0, z0: B.mundo.z0, w: pg.w, d: pg.d };
const web = new Function(`${montarBundle()}; return LoteWeb;`)();
const opcoes = [{ id: 'plano', itens: S.itens, estrada: S.estrada }, ...lote.opcoes];

describe('núcleo web do lote', () => {
  for (const o of opcoes) {
    it(`bundle e Node dão o mesmo resultado em ${o.id}`, () => {
      const a = avaliar(S, bunker, o),
        b = web.avaliar(S, bunker, o);
      expect(b.erros).toEqual(a.erros);
      expect(b.viagens).toBe(a.viagens);
      expect(b.metricas).toEqual(a.metricas);
      expect(b.cam.celulas).toEqual(a.cam.celulas);
      expect(b.cam.viagemRede).toBe(a.cam.viagemRede);
    });
  }
  it('o bundle não usa fs nem import', () => {
    expect(montarBundle()).not.toMatch(/\bimport\b|require\(|node:fs/);
  });
});

describe('arranjo manual: grade, ímã e giro', () => {
  const T = {
    lote: { x1: -50, x2: 50, z1: -75, z2: 75 },
    margem: 2,
    corrego: { x1: 43, x2: 48 },
    estrada: { x1: -50, x2: 43, z1: -2.5, z2: 2.5 },
  };
  const viz = { id: 'v', x: 0, z: 20, w: 10, d: 10 };
  const mov = { id: 'i', x: -30, z: 20, w: 10, d: 10 };

  it('sem ímã por perto, cai na grade de 5 m', () => {
    const p = encaixar(mov, -23.2, 41.4, T, [viz]);
    expect(Math.abs(p.x % 5)).toBe(0);
    expect(Math.abs(p.z % 5)).toBe(0);
  });
  it('ímã deixa a folga de 2 m do vizinho', () => {
    expect(encaixar(mov, 11, 20, T, [viz]).x).toBe(12);
    expect(encaixar(mov, -11.4, 20, T, [viz]).x).toBe(-12);
  });
  it('ímã na divisa deixa a margem de 2 m; Alt (sem ímã) usa só a grade', () => {
    expect(encaixar(mov, -47, 20, T, [viz]).x).toBe(-48);
    expect(encaixar(mov, -47, 20, T, [viz], undefined, { ima: false }).x).toBe(-45);
  });
  it('a estrada também prende, com 2 m de folga', () => {
    expect(encaixar(mov, -30, 3.4, T, [viz]).z).toBe(4.5);
  });
  it('quatro giros devolvem o item ao início', () => {
    const g = girar(girar(girar(girar({ ...mov, w: 25, d: 10 }))));
    expect(g).toEqual({ ...mov, w: 25, d: 10, giro: 0 });
  });
  it('um giro troca largura e profundidade mantendo o centro', () => {
    const g = girar({ id: 'q', x: 0, z: 0, w: 20, d: 10 });
    expect([g.w, g.d, g.x + g.w / 2, g.z + g.d / 2]).toEqual([10, 20, 10, 5]);
  });
});
