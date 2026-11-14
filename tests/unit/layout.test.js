import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  conferirBase,
  conferirOpcao,
  conferirPlano,
  medir,
  mapa,
  shared,
  gap,
  half,
} from '../../tools/layout-lib.mjs';

const lerJson = (rel) =>
  JSON.parse(fs.readFileSync(new URL('../../' + rel, import.meta.url), 'utf8'));
const copia = (o) => JSON.parse(JSON.stringify(o));
const P = lerJson('plan/bunker.json');
const S = lerJson('plan/site.json');

/* o plano atual como opção, com ajustes por ambiente: { mestre: { v: 5, d: 10 } } */
function opcao(id, ajustes = {}, resto = {}) {
  const salas = P.salas.map((s) => ({ ...s, ...(ajustes[s.id] || {}) }));
  return { id, pegada: { ...P.pegada }, salas, ...resto };
}
const erros = (o, plano = P, lote = S) => conferirOpcao(plano, o, lote).erros;
const tem = (lista, trecho) => lista.some((m) => m.includes(trecho));

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

/* planta pequena conferida à mão: pegada 10×10, galeria no meio, a e b em cima, c ao lado de b
   a(0,0 4×4) b(4,0 4×4) c(8,0 2×2) / galeria(0,4 10×2); vazios: 10×4 embaixo e 2×2 sob c */
describe('régua numa planta feita à mão', () => {
  const mini = {
    mundo: { x0: 0, z0: 0, piso: -10, distancia_corrego: 5 },
    pegada: { w: 10, d: 10 },
    total_util: 56,
    areas: { galeria: 'G', a: 'A', b: 'B', c: 'C' },
    medidas: { galeria: [10, 2], a: [4, 4], b: [4, 4], c: [2, 2] },
    circulacao: ['galeria'],
    acesso_por: { c: ['b'] },
    afinidades: [
      { a: 'a', b: 'b', peso: 2 },
      { a: 'a', b: 'c', peso: 1 },
    ],
    ruido: { fontes: ['c'], sensiveis: ['b'] },
    salas: [
      { id: 'galeria', u: 0, v: 4, w: 10, d: 2 },
      { id: 'a', u: 0, v: 0, w: 4, d: 4 },
      { id: 'b', u: 4, v: 0, w: 4, d: 4 },
      { id: 'c', u: 8, v: 0, w: 2, d: 2, acesso: ['b'] },
    ],
  };
  const lote = {
    lote: { x1: -50, x2: 50, z1: -75, z2: 75 },
    corrego: { x1: 43 },
    itens: [{ id: 'casa', x: 1, z: 1, w: 4, d: 4 }],
  };

  it('passa sem erros', () => {
    expect(conferirBase(mini, lote).erros).toEqual([]);
  });

  it('mede o que se calcula na mão', () => {
    const m = medir(mini, mini.pegada, mini.salas);
    expect(m.util).toBe(56);
    expect(m.vazio).toBe(44);
    expect(m.bolsoes.map((b) => b.area)).toEqual([40, 4]);
    expect(m.acesso).toEqual({ max: 2, direto: 2, ambientes: 3 });
    expect(m.afinidades).toMatchObject({ atendidas: 1, total: 2, pontos: 2, maximo: 3 });
    expect(m.afinidades.faltam).toEqual(['a–c']);
    expect(m.ruido).toEqual({ distancia: 0, par: ['c', 'b'] });
    expect(m.saidas).toBeNull();
    expect(m.encolhe).toBe(0);
    expect(m.cresce).toBe(0);
  });

  it('encolher e crescer somam em separado', () => {
    const salas = copia(mini.salas);
    salas[1].w = 3; // a: 12 m² contra 16
    salas[3].w = 3; // c: 6 m² contra 4
    const m = medir(mini, mini.pegada, salas);
    expect(m.encolhe).toBe(4);
    expect(m.cresce).toBe(2);
  });

  it('o desenho tem uma letra por metro e uma legenda', () => {
    const linhas = mapa(mini.pegada, mini.salas).split('\n');
    expect(linhas).toHaveLength(11);
    expect(linhas[0]).toBe('BBBBCCCCDD'); // a=B, b=C, c=D (galeria é a letra A)
    expect(linhas[4]).toBe('AAAAAAAAAA');
    expect(linhas[9]).toBe('··········');
    expect(linhas[10]).toContain('A=galeria');
  });

  it('acusa a passagem declarada que não encosta', () => {
    const p = copia(mini);
    p.salas[3].acesso = ['a']; // c não toca a
    p.acesso_por.c = ['a'];
    expect(tem(conferirBase(p, lote).erros, 'c: acesso por a, mas as bordas não se tocam')).toBe(
      true,
    );
  });
});

describe('plano atual', () => {
  const r = conferirBase(P, S);

  it('passa sem erros', () => {
    expect(r.erros).toEqual([]);
  });

  it('pegada, vazios e bolsões fecham a conta', () => {
    const m = r.metricas;
    expect(m.pegada.area).toBe(2000);
    expect(m.util).toBe(1740); // 1665 do plano + 75 do ramal
    expect(m.vazio).toBe(m.pegada.area - m.util);
    expect(m.bolsoes.map((b) => b.area)).toEqual([175, 79.75, 2.75, 2.5]); // conta à mão: 225 - 25 (enfermaria) - 90 (mestre) - 27,5 (escada) = 82,5 em 2 bolsões;
    expect(m.bolsoes.reduce((a, b) => a + b.area, 0)).toBe(m.vazio);
    expect(m.encolhe).toBe(0);
    expect(m.cresce).toBe(0);
  });

  it('acesso, saídas e ruído', () => {
    const m = r.metricas;
    expect(m.acesso).toEqual({ max: 2, direto: 14, ambientes: 18 });
    expect(m.saidas).toBe(39.5); // escada em u 0,5–5,5, saída 2 em u 45–50
    expect(m.ruido.distancia).toBe(5); // oficina (v 20) a 5 m do fundo dos quartos (v 15)
  });

  it('afinidades: só hidroponia–estar e oficina–montacarga ficam sem tocar', () => {
    const a = r.metricas.afinidades;
    expect([...a.faltam].sort()).toEqual(['hidroponia–estar', 'oficina–montacarga']);
    expect(a.pontos).toBe(a.maximo - 1 - 1);
  });

  it('exige a medida do plano', () => {
    const p = copia(P);
    p.salas.find((s) => s.id === 'mestre').w = 12;
    expect(tem(conferirBase(p, S).erros, 'mestre mede 12×10')).toBe(true);
  });

  it('exige a distância do córrego a partir do site.json', () => {
    const lote = copia(S);
    lote.corrego.x1 = 40; // bunker termina em x = 38: sobram 2 m, a regra pede 5
    expect(tem(conferirBase(P, lote).erros, 'a menos de 5 m do córrego')).toBe(true);
  });
});

describe('consistência do plano', () => {
  it('o plano atual é consistente', () => {
    expect(conferirPlano(P)).toEqual([]);
  });

  it('id com erro de digitação em afinidades, ruído, acesso_por, saídas e quartos', () => {
    const p = copia(P);
    p.afinidades[0].a = 'suporte2';
    p.ruido.fontes.push('oficna');
    p.acesso_por.adega = ['estarr'];
    p.saidas.b = 'saida';
    p.tolerancia.nao_encolhem.push('mestre2');
    const e = conferirPlano(p);
    for (const id of ['suporte2', 'oficna', 'estarr', '"saida"', 'mestre2'])
      expect(tem(e, id), id).toBe(true);
  });

  it('valores inválidos', () => {
    const p = copia(P);
    p.afinidades[0].peso = 0;
    p.tolerancia.area_min = 1.5;
    p.tolerancia.cenarios.push({ id: 'exato', nome: 'repetido', lado: -1 });
    const e = conferirPlano(p);
    expect(tem(e, 'peso inválido')).toBe(true);
    expect(tem(e, 'area_min')).toBe(true);
    expect(tem(e, 'id repetido')).toBe(true);
    expect(tem(e, 'lado inválido')).toBe(true);
  });
});

describe('opções: forma do arquivo', () => {
  it('não derruba o conferidor', () => {
    expect(erros(null)).toEqual(['opção inválida']);
    expect(tem(erros({ id: 'exato', salas: [] }), 'pegada sem w e d')).toBe(true);
    expect(tem(erros({ id: 'exato', pegada: { w: 50, d: 40 } }), 'salas ausente')).toBe(true);
    const ruim = opcao('exato', { mestre: { u: '5' }, pais: { acesso: 'estar' } });
    const e = erros(ruim);
    expect(tem(e, 'mestre.u não é número')).toBe(true);
    expect(tem(e, 'pais.acesso deve ser lista de ids')).toBe(true);
  });

  it('plano sem bloco de tolerância', () => {
    const p = copia(P);
    delete p.tolerancia;
    expect(erros(opcao('exato'), p)).toEqual(['o plano não tem o bloco tolerancia']);
  });
});

describe('opções com tolerância', () => {
  it('o plano atual vale como opção exata', () => {
    expect(erros(opcao('exato'))).toEqual([]);
  });

  it('cenário desconhecido', () => {
    expect(tem(erros(opcao('inventado')), 'não existe')).toBe(true);
  });

  it('crescer 1 m só passa no cenário de ±1 m', () => {
    const ajuste = { mestre: { v: 4, d: 11 } }; // sobe 1 m para dentro do vazio de cima
    expect(tem(erros(opcao('exato', ajuste)), 'mestre mede 9×11, fora de ±0 m')).toBe(true);
    expect(erros(opcao('mais-menos-1', ajuste))).toEqual([]);
  });

  it('crescer além do lado do cenário falha', () => {
    const ajuste = { mestre: { v: 3, d: 12 } }; // +3 m no fundo: nem girado cabe em ±1 m
    expect(tem(erros(opcao('mais-menos-1', ajuste)), 'fora de ±1 m')).toBe(true);
    expect(erros(opcao('mais-menos-2-5', ajuste))).toEqual([]);
  });

  it('girar 90° é permitido, e proibido com giro desligado', () => {
    const girada = opcao('exato', { despensa: { w: 10, d: 5 } });
    expect(tem(erros(girada), 'despensa mede')).toBe(false);
    const p = copia(P);
    p.tolerancia.giro = false;
    expect(tem(erros(girada, p), 'despensa mede 10×5')).toBe(true);
  });

  it('quarto aprovado nunca encolhe, mesmo com área sobrando', () => {
    const e = erros(opcao('mais-menos-1', { mestre: { d: 9.5 } }));
    expect(tem(e, 'mestre não pode encolher')).toBe(true);
  });

  it('quarto quase quadrado gira para não encolher', () => {
    // o plano guarda o quarto girado (9×10); voltar a 10×9 também vale, é só giro
    expect(tem(erros(opcao('mais-menos-1', { mestre: { w: 10, d: 9 } })), 'mestre não pode')).toBe(
      false,
    );
  });

  it('área mínima de 90%', () => {
    expect(tem(erros(opcao('mais-menos-2-5', { estar: { w: 13 } })), 'estar tem 195 m²')).toBe(
      true,
    );
    expect(tem(erros(opcao('mais-menos-2-5', { estar: { w: 13.5 } })), 'estar tem')).toBe(false);
  });

  it('lado mínimo: 4 m na circulação', () => {
    const e = erros(opcao('mais-menos-2-5', { montacarga: { w: 3.5, d: 7.5 } }));
    expect(tem(e, 'montacarga tem lado 3.5 m, abaixo do mínimo 4 m')).toBe(true);
  });

  it('lado mínimo: 3 m nos ambientes', () => {
    const p = copia(P);
    p.tolerancia.lado_min.ambiente = 5.5;
    expect(tem(erros(opcao('exato'), p), 'enfermaria tem lado 5 m, abaixo do mínimo 5.5 m')).toBe(
      true,
    );
  });

  it('ramal: pode faltar, mas quem dependia dele perde o acesso', () => {
    const sem = opcao('exato');
    sem.salas = sem.salas.filter((s) => s.id !== 'ramal');
    const e = erros(sem);
    expect(tem(e, 'falta o extra')).toBe(false);
    expect(e).toContain('hidroponia não tem acesso até a circulação');
    expect(e).toContain('hidroponia: acesso por ramal, que não existe no layout');
  });

  it('ramal: obrigatório quando o plano diz que não é opcional', () => {
    const p = copia(P);
    p.tolerancia.ramal.opcional = false;
    const sem = opcao('exato');
    sem.salas = sem.salas.filter((s) => s.id !== 'ramal');
    expect(tem(erros(sem, p), 'falta o extra ramal')).toBe(true);
  });

  it('ramal: faixas próprias de lados', () => {
    const faixa = (aj) =>
      erros(opcao('exato', { ramal: aj })).filter((m) => m.includes('fora das faixas'));
    expect(faixa({ w: 2.5 })).toEqual([]);
    expect(faixa({ w: 2 })).toHaveLength(1);
    expect(faixa({ d: 20 })).toHaveLength(1);
  });

  it('ambiente que falta, repetido ou fora do plano', () => {
    const sem = opcao('exato');
    sem.salas = sem.salas.filter((s) => s.id !== 'cinema');
    expect(tem(erros(sem), 'falta no layout: cinema')).toBe(true);
    const dobro = opcao('exato');
    dobro.salas.push({ ...dobro.salas[0] });
    expect(tem(erros(dobro), 'ambiente repetido: galeria')).toBe(true);
    const extra = opcao('exato');
    extra.salas.push({ id: 'piscina', u: 0, v: 0, w: 5, d: 5 });
    expect(tem(erros(extra), 'ambiente fora do plano: piscina')).toBe(true);
  });

  it('pegada não passa do máximo do lote', () => {
    const e = erros(opcao('exato', {}, { pegada: { w: 55, d: 40 } }));
    expect(tem(e, 'maior que o máximo 50×40')).toBe(true);
    expect(tem(e, 'a menos de 5 m do córrego')).toBe(true);
  });

  it('a Casa Grande tem de caber na pegada', () => {
    expect(tem(erros(opcao('exato', {}, { pegada: { w: 20, d: 40 } })), 'Casa Grande')).toBe(true);
  });

  it('passagem só por ambiente previsto em acesso_por', () => {
    const e = erros(opcao('exato', { adega: { acesso: ['mestre'] } }));
    expect(tem(e, 'adega: acesso por mestre não está previsto')).toBe(true);
  });

  it('no máximo 2 saltos: datacenter só por baterias (que passa por suporte) dá 3', () => {
    const e = erros(opcao('exato', { datacenter: { acesso: ['baterias'] } }));
    expect(e).toContain('datacenter está a 3 saltos da circulação (máximo 2)');
    expect(erros(opcao('exato'))).toEqual([]);
  });

  it('saídas: sem mínimo (liberado pelo Mestre), mas a regra funciona se o mínimo voltar', () => {
    const perto = opcao('exato', { saida2: { u: 25, v: 35 } }); // a 27,9 m da escada
    expect(tem(erros(perto), 'saídas: mínimo')).toBe(false);
    const p = copia(P);
    p.saidas.distancia_min = 30;
    expect(tem(erros(perto, p), 'saídas: mínimo 30 m')).toBe(true);
    expect(tem(erros(opcao('exato'), p), 'saídas: mínimo')).toBe(false);
  });

  it('a escada fica toda sob a Casa Grande (u 0,5–25,5; v 5–30)', () => {
    const fora = erros(opcao('exato', { escada: { u: 0 } }));
    expect(tem(fora, 'a escada (u 0–5')).toBe(true);
    expect(tem(erros(opcao('exato', { escada: { u: 20, v: 24.5 } })), 'a escada')).toBe(false);
    const p = copia(P);
    p.regras.escada_sob_casa = false;
    expect(tem(erros(opcao('exato', { escada: { u: 0 } }), p), 'a escada')).toBe(false);
  });

  it('a escada real não encolhe: 5×5,5 m, queda de 10 m', () => {
    const e = erros(opcao('mais-menos-1', { escada: { w: 4.5 } }));
    expect(tem(e, 'escada não pode encolher')).toBe(true);
  });

  it('passagens abertas: quarto por estar sim, por oficina não', () => {
    expect(
      tem(erros(opcao('exato', { irma: { acesso: ['estar'] } })), 'irma: acesso por estar não'),
    ).toBe(false);
    expect(
      tem(
        erros(opcao('exato', { irma: { acesso: ['oficina'] } })),
        'irma: acesso por oficina não está previsto',
      ),
    ).toBe(true);
  });

  it('saída ausente é erro, não passa em silêncio', () => {
    const sem = opcao('exato');
    sem.salas = sem.salas.filter((s) => s.id !== 'saida2');
    expect(tem(erros(sem), 'saídas: falta escada ou saida2')).toBe(true);
  });

  it('sobreposição, regra 0/5 e fora da pegada', () => {
    expect(tem(erros(opcao('exato', { cinema: { u: 15 } })), 'se sobrepõem')).toBe(true);
    expect(tem(erros(opcao('exato', { mestre: { u: 5.25 } })), '0 ou 5')).toBe(true);
    expect(tem(erros(opcao('exato', { datacenter: { u: 45 } })), 'datacenter sai da pegada')).toBe(
      true,
    );
  });

  it('opção válida que encolhe um ambiente: a régua registra a sobra', () => {
    // cinema 10×10 → 9×10 (±1 m) libera 10 m²
    const o = opcao('mais-menos-1', { cinema: { w: 9 } });
    const r = conferirOpcao(P, o, S);
    expect(r.erros).toEqual([]);
    expect(r.metricas.encolhe).toBe(10);
    expect(r.metricas.vazio).toBe(2000 - 1740 + 10);
  });
});

describe('comando tools/layout-check.mjs', () => {
  const cli = fileURLToPath(new URL('../../tools/layout-check.mjs', import.meta.url));
  const rodar = (opcoes) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'layout-'));
    const args = [cli];
    if (opcoes !== undefined) {
      const arq = path.join(dir, 'opcoes.json');
      fs.writeFileSync(arq, JSON.stringify(opcoes));
      args.push('--opcoes', arq);
    }
    const r = spawnSync('node', args, { encoding: 'utf8' });
    fs.rmSync(dir, { recursive: true });
    return { codigo: r.status, texto: r.stdout + r.stderr };
  };

  it('sem opções confere só o plano e sai com 0', () => {
    const r = rodar();
    expect(r.codigo).toBe(0);
    expect(r.texto).toContain('layout: OK');
  });

  it('opção válida sai com 0 e mostra a linha da régua', () => {
    const r = rodar({ opcoes: [opcao('mais-menos-1', { cinema: { w: 9 } })] });
    expect(r.codigo).toBe(0);
    expect(r.texto).toContain('opção mais-menos-1:');
    expect(r.texto).toContain('encolhe 10 m²');
  });

  it('opção com erro, opção nula e arquivo sem lista saem com 1', () => {
    const ruim = rodar({ opcoes: [opcao('exato', { mestre: { d: 9.5 } }), null] });
    expect(ruim.codigo).toBe(1);
    expect(ruim.texto).toContain('opção exato: mestre mede 9×9.5');
    expect(ruim.texto).toContain('opção #2: opção inválida');
    expect(rodar({ x: 1 }).codigo).toBe(1);
  });
});
