import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { montarBundle } from '../../tools/build-web.mjs';
import { avaliar } from '../../tools/lote-web.mjs';

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
