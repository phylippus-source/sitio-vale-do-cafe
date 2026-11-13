import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { conferirBase, conferirOpcao, shared, gap, half } from '../../tools/layout-lib.mjs';

const lerJson = (rel) =>
  JSON.parse(fs.readFileSync(new URL('../../' + rel, import.meta.url), 'utf8'));
const P = lerJson('plan/bunker.json');
const S = lerJson('plan/site.json');
const c = S.itens.find((i) => i.id === 'casa');
const casa = { u: c.x - P.mundo.x0, v: c.z - P.mundo.z0, w: c.w, d: c.d };

/* o plano atual como opção, com ajustes por ambiente: { mestre: { v: 5, d: 10 } } */
function opcao(id, ajustes = {}, resto = {}) {
  const salas = P.salas.map((s) => ({ ...s, ...(ajustes[s.id] || {}) }));
  return { id, pegada: { ...P.pegada }, salas, ...resto };
}
const erros = (o) => conferirOpcao(P, o, { casa }).erros;
const sobre = (lista, id) => lista.filter((m) => m.startsWith(id + ' ') || m.startsWith(id + ':'));

describe('geometria', () => {
  it('borda comum: lado a lado conta, só o canto não conta', () => {
    const a = { u: 0, v: 0, w: 5, d: 5 };
    expect(shared(a, { u: 5, v: 2, w: 5, d: 5 })).toBe(3);
    expect(shared(a, { u: 0, v: 5, w: 3, d: 5 })).toBe(3);
    expect(shared(a, { u: 5, v: 5, w: 5, d: 5 })).toBe(0);
    expect(shared(a, { u: 6, v: 0, w: 5, d: 5 })).toBe(0);
  });

  it('distância entre retângulos: 0 se encostam, diagonal pelo canto', () => {
    const a = { u: 0, v: 0, w: 5, d: 5 };
    expect(gap(a, { u: 5, v: 0, w: 5, d: 5 })).toBe(0);
    expect(gap(a, { u: 8, v: 9, w: 5, d: 5 })).toBe(5);
  });

  it('regra 0/5', () => {
    expect(half(3.5)).toBe(true);
    expect(half(0.25)).toBe(false);
  });
});

describe('plano atual', () => {
  const r = conferirBase(P);

  it('passa sem erros', () => {
    expect(r.erros).toEqual([]);
  });

  it('medidas da régua', () => {
    const m = r.metricas;
    expect(m.pegada.area).toBe(2000);
    expect(m.util).toBe(1762.5);
    expect(m.vazio).toBe(237.5);
    expect(m.bolsoes.map((b) => b.area)).toEqual([175, 60, 2.5]);
    expect(m.acesso).toEqual({ max: 2, direto: 14, ambientes: 18 });
    expect(m.encolhe).toBe(0);
    expect(m.cresce).toBe(0);
    expect(m.saidas).toBe(40);
    expect(m.ruido.distancia).toBe(5);
  });

  it('afinidades: só hidroponia–estar e oficina–montacarga ficam sem tocar', () => {
    const a = r.metricas.afinidades;
    expect(a.faltam.sort()).toEqual(['hidroponia–estar', 'oficina–montacarga']);
    expect(a.atendidas).toBe(9);
    expect(a.pontos).toBe(20);
    expect(a.maximo).toBe(22);
  });

  it('exige a medida do plano', () => {
    const p = JSON.parse(JSON.stringify(P));
    p.salas.find((s) => s.id === 'mestre').w = 11;
    expect(conferirBase(p).erros.some((m) => m.includes('mestre mede 11×9'))).toBe(true);
  });
});

describe('opções com tolerância', () => {
  it('o plano atual vale como opção exata', () => {
    expect(erros(opcao('exato'))).toEqual([]);
  });

  it('cenário desconhecido', () => {
    expect(erros(opcao('inventado')).some((m) => m.includes('não existe'))).toBe(true);
  });

  it('crescer 1 m só passa no cenário de ±1 m', () => {
    const ajuste = { mestre: { v: 5, d: 10 } };
    expect(sobre(erros(opcao('exato', ajuste)), 'mestre')).toHaveLength(1);
    expect(erros(opcao('mais-menos-1', ajuste))).toEqual([]);
  });

  it('girar 90° é permitido', () => {
    const girada = opcao('exato', { despensa: { w: 10, d: 5 } });
    expect(sobre(erros(girada), 'despensa')).toEqual([]);
  });

  it('quarto aprovado nunca encolhe', () => {
    const e = erros(opcao('mais-menos-1', { mestre: { w: 9.5 } }));
    expect(e.some((m) => m.includes('mestre não pode encolher'))).toBe(true);
  });

  it('área mínima de 90%', () => {
    const e = erros(opcao('mais-menos-2-5', { estar: { w: 13 } }));
    expect(e.some((m) => m.includes('estar tem 195 m²'))).toBe(true);
    expect(sobre(erros(opcao('mais-menos-2-5', { estar: { w: 14 } })), 'estar')).toEqual([]);
  });

  it('lado mínimo: 4 m na circulação', () => {
    const e = erros(opcao('mais-menos-2-5', { montacarga: { w: 3.5, d: 7.5 } }));
    expect(e.some((m) => m.includes('montacarga tem lado 3.5 m, abaixo do mínimo 4 m'))).toBe(true);
  });

  it('lado mínimo: 3 m nos ambientes', () => {
    const p = JSON.parse(JSON.stringify(P));
    p.tolerancia.lado_min.ambiente = 5.5;
    const e = conferirOpcao(p, opcao('exato'), { casa }).erros;
    expect(e.some((m) => m.includes('enfermaria tem lado 5 m, abaixo do mínimo 5.5 m'))).toBe(true);
  });

  it('ramal: pode faltar, mas então quem dependia dele perde o acesso', () => {
    const sem = opcao('exato');
    sem.salas = sem.salas.filter((s) => s.id !== 'ramal');
    const e = erros(sem);
    expect(e.some((m) => m.includes('falta o extra'))).toBe(false);
    expect(e).toContain('hidroponia não tem acesso até a circulação');
  });

  it('ramal: faixas próprias de lados', () => {
    const faixa = (aj) =>
      erros(opcao('exato', { ramal: aj })).filter((m) => m.includes('fora das faixas'));
    expect(faixa({ w: 2.5 })).toEqual([]);
    expect(faixa({ w: 2 })).toHaveLength(1);
    expect(faixa({ d: 20 })).toHaveLength(1);
  });

  it('pegada não passa do máximo do lote', () => {
    const e = erros(opcao('exato', {}, { pegada: { w: 55, d: 40 } }));
    expect(e.some((m) => m.includes('maior que o máximo 50×40'))).toBe(true);
  });

  it('a Casa Grande tem de caber na pegada', () => {
    const e = erros(opcao('exato', {}, { pegada: { w: 20, d: 40 } }));
    expect(e.some((m) => m.includes('Casa Grande'))).toBe(true);
  });

  it('passagem só por ambiente previsto em acesso_por', () => {
    const e = erros(opcao('exato', { adega: { acesso: ['mestre'] } }));
    expect(e.some((m) => m.includes('adega: acesso por mestre'))).toBe(true);
  });

  it('saídas a menos de 30 m uma da outra', () => {
    const e = erros(opcao('exato', { saida2: { u: 25, v: 35 } }));
    expect(e.some((m) => m.includes('saídas: mínimo 30 m'))).toBe(true);
  });

  it('sobreposição e regra 0/5', () => {
    expect(
      erros(opcao('exato', { cinema: { u: 15 } })).some((m) => m.includes('se sobrepõem')),
    ).toBe(true);
    expect(erros(opcao('exato', { mestre: { u: 5.25 } })).some((m) => m.includes('0 ou 5'))).toBe(
      true,
    );
  });
});
