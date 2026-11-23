// Arranjos do lote em plan/arranjos (o do Mestre de 22/11 e os regerados pelo solver a partir dele)
// passam na régua de hoje: folga 0 m entre itens, córrego a 4 m, bunker a 5 m do córrego.
import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import { avaliarArranjo, sobreMedidas } from '../../tools/avaliar-arranjo.mjs';

const ler = (f) => JSON.parse(fs.readFileSync(`plan/arranjos/${f}`, 'utf8'));
const site = JSON.parse(fs.readFileSync('plan/site.json', 'utf8'));
const ARQUIVOS = [
  'mestre-22-11-ajustado.json',
  'mestre-22-11-solver-viagens.json',
  'mestre-22-11-solver-vazio.json',
];

describe('arranjos do lote (plan/arranjos)', () => {
  for (const f of ARQUIVOS) {
    it(`${f}: régua sem erros, todos os itens com rota`, () => {
      const r = avaliarArranjo(ler(f));
      expect(r.erros).toEqual([]);
      expect(r.semRota).toEqual([]);
    });
  }

  it('o arranjo do Mestre só encolhe a silvicultura; os do solver usam as medidas do plano', () => {
    expect(Object.keys(ler(ARQUIVOS[0]).medidas_alteradas)).toEqual(['silvicultura']);
    for (const f of ARQUIVOS.slice(1)) expect(sobreMedidas(site, ler(f))).toEqual({});
  });

  it('o solver parte das âncoras do Mestre: casa, puxadinho, engenho, bunker e estrada ficam no lugar', () => {
    const base = ler(ARQUIVOS[0]);
    const ancora = (a) =>
      ['casa', 'puxadinho', 'engenho'].map((id) => a.itens.find((i) => i.id === id));
    for (const f of ARQUIVOS.slice(1)) {
      const a = ler(f);
      expect(ancora(a).map(({ x, z, w, d }) => [x, z, w, d])).toEqual(
        ancora(base).map(({ x, z, w, d }) => [x, z, w, d]),
      );
      expect(a.bunker).toEqual(base.bunker);
      expect(a.estrada).toEqual(base.estrada);
    }
  });

  it('a regra de 5 m do bunker ao córrego vale', () => {
    const a = ler(ARQUIVOS[0]);
    a.bunker.x = site.corrego.x1 - 5 - a.bunker.w + 1; // 1 m a menos do que o mínimo
    expect(avaliarArranjo(a).erros.some((e) => e.startsWith('bunker:'))).toBe(true);
  });
});
