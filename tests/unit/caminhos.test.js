import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { tracarCaminhos } from '../../tools/caminhos-lib.mjs';

const S = JSON.parse(fs.readFileSync('plan/site.json', 'utf8'));
const lote = JSON.parse(fs.readFileSync('plan/lote-opcoes.json', 'utf8'));
const opcoes = [{ id: 'plano', itens: S.itens, estrada: S.estrada }, ...lote.opcoes];

describe('rede de caminhos do lote', () => {
  for (const o of opcoes) {
    it(`opção ${o.id}: liga todas as portas, sem atravessar item, bloco ou córrego`, () => {
      const r = tracarCaminhos(S, o);
      expect(r.semRota).toEqual([]);
      expect(Object.values(r.portas).every(Boolean)).toBe(true);
      const dentro = (b, x, z) => x > b.x && x < b.x + b.w && z > b.z && z < b.z + b.d;
      for (const c of r.celulas) {
        const x = r.cx(c),
          z = r.cz(c);
        expect(o.itens.some((i) => dentro(i, x, z))).toBe(false);
        if (o.bloco) expect(dentro(o.bloco, x, z)).toBe(false);
        expect(x > S.corrego.x1 && x < S.corrego.x2).toBe(false);
      }
      // andar pela rede nunca é menos que a linha reta entre as portas
      expect(r.viagemRede).toBeGreaterThanOrEqual(r.viagemDireta);
      expect(Number.isFinite(r.viagemRede)).toBe(true);
    });
  }
  it('é determinística', () => {
    const a = tracarCaminhos(S, opcoes[1]),
      b = tracarCaminhos(S, opcoes[1]);
    expect(a.celulas).toEqual(b.celulas);
    expect(a.viagemRede).toBe(b.viagemRede);
  });
});
