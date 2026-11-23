// O plano adotado hoje (arranjo M do Mestre, escolhido em 23/11): lote, bunker girado e opção de bunker escolhida.
import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import { conferirLote, bunkerDoLote, AVISO_CASA } from '../../tools/lote-lib.mjs';
import { conferirOpcao, paraMundo, pegadaMundo } from '../../tools/layout-lib.mjs';

const ler = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const S = ler('plan/site.json');
const B = ler('plan/bunker.json');
const OJ = ler('plan/bunker-opcoes.json');
const esc = OJ.opcoes.find((o) => o.id === OJ.escolhida);
const M = ler('plan/arranjos/mestre-22-11-ajustado.json');

describe('plano adotado (arranjo M)', () => {
  it('itens, estrada e medidas vêm do arranjo M', () => {
    for (const it of M.itens)
      expect(S.itens.find((i) => i.id === it.id)).toMatchObject({
        x: it.x,
        z: it.z,
        w: it.w,
        d: it.d,
      });
    expect(S.estrada).toEqual(M.estrada);
    expect(S.medidas.silvicultura).toEqual([20, 27.5]);
  });

  it('o bunker adotado tem a projeção de M (−5, −35, 32×48) e a opção escolhida passa no mundo', () => {
    expect(bunkerDoLote(B, esc.pegada)).toEqual({ u: -5, v: -35, w: M.bunker.w, d: M.bunker.d });
    const r = conferirOpcao(B, esc, S); // com a régua do mundo: limites, córrego a 5 m, escotilha fora da casa (10 m) e dos itens (2 m)
    expect(r.erros).toEqual([]);
  });

  it('a régua do lote só avisa que a casa está fora do bunker', () => {
    const r = conferirLote(S, bunkerDoLote(B, esc.pegada));
    expect(r.erros.filter((e) => !AVISO_CASA.test(e))).toEqual([]);
    expect(r.erros.some((e) => AVISO_CASA.test(e))).toBe(true);
  });

  it('gira 90° no sentido horário: o canto de cima à esquerda da planta vai para o de cima à direita', () => {
    const F = { w: 48, d: 32 };
    const P = { mundo: { x0: 10, z0: 20, giro: 1 } };
    expect(pegadaMundo(P, F)).toEqual({ w: 32, d: 48 });
    expect(paraMundo(P, F, { u: 0, v: 0, w: 10, d: 5 })).toEqual({
      x: 10 + 32 - 5,
      z: 20,
      w: 5,
      d: 10,
    });
    expect(paraMundo({ mundo: { x0: 10, z0: 20 } }, F, { u: 3, v: 4, w: 10, d: 5 })).toEqual({
      x: 13,
      z: 24,
      w: 10,
      d: 5,
    });
  });
});
