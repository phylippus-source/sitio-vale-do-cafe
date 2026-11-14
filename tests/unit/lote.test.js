import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { sol, sombraDe, horasDeSombra, conferirLote } from '../../tools/lote-lib.mjs';

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

describe('conferirLote (régua do lote)', () => {
  it('o puxadinho da piscina fica colado na casa, mas colado só com quem ele declara', () => {
    const S = JSON.parse(fs.readFileSync('plan/site.json', 'utf8'));
    const bunker = { u: -12, v: -73, w: 48, d: 32 };
    const pux = S.itens.find((i) => i.id === 'puxadinho');
    expect(pux).toMatchObject({ w: 20, d: 7 });
    expect(conferirLote(S, bunker).erros).toEqual([]);
    pux.z = -40; // desencosta 3 m da casa
    expect(conferirLote(S, bunker).erros.some((e) => e.includes('devia estar colado'))).toBe(true);
    pux.z = -45; // entra na casa
    expect(
      conferirLote(S, bunker).erros.some((e) => e.includes('casa e puxadinho se sobrepõem')),
    ).toBe(true);
    pux.z = -43;
    delete pux.colado; // sem a declaração, encostar é erro de margem
    expect(
      conferirLote(S, bunker).erros.some((e) => e.includes('casa e puxadinho ficam a 0.0 m')),
    ).toBe(true);
  });

  const site = () => JSON.parse(fs.readFileSync('plan/site.json', 'utf8'));
  const bunker = { u: -12, v: -73, w: 48, d: 32 }; // opção ±2,5 m escolhida
  const erros = (S, b = bunker) => conferirLote(S, b).erros;
  const tem = (lista, trecho) => lista.some((e) => e.includes(trecho));
  const mexe = (S, id, mudancas) =>
    Object.assign(
      S.itens.find((i) => i.id === id),
      mudancas,
    );

  it('o plano atual passa, com bunker 48×32 e com 50×40', () => {
    expect(erros(site())).toEqual([]);
    expect(erros(site(), { u: -12, v: -73, w: 50, d: 40 })).toEqual([]);
  });

  it('mede lote, envelopes e distâncias', () => {
    const m = conferirLote(site(), bunker).metricas;
    expect(m.total).toBe(7990);
    expect(m.lotArea).toBe(15000);
    expect(m.dist.animaisCasa).toBeCloseTo(52, 0);
    expect(m.dist.pomarNucleo).toBe(2);
  });

  it('item com medida diferente do plano', () => {
    const S = site();
    mexe(S, 'engenho', { w: 25 });
    expect(tem(erros(S), 'engenho mede 25×10')).toBe(true);
  });

  it('falta item, ou item fora do plano', () => {
    const S = site();
    S.itens = S.itens.filter((i) => i.id !== 'galpao');
    expect(tem(erros(S), 'falta no layout: galpao')).toBe(true);
    const T = site();
    T.itens.push({ id: 'piscina', x: 0, z: 0, w: 5, d: 5, tipo: 'predio' });
    expect(tem(erros(T), 'item fora do plano: piscina')).toBe(true);
  });

  it('coordenada que não termina em 0 ou 5', () => {
    const S = site();
    mexe(S, 'galpao', { x: 19.3 });
    expect(tem(erros(S), 'galpao.x=19.3 não termina em 0 ou 5')).toBe(true);
  });

  it('item na divisa, sobreposto ou colado em outro', () => {
    const S = site();
    mexe(S, 'galpao', { x: -50 });
    expect(tem(erros(S), 'galpao sai do lote ou fica a menos de 2 m da divisa')).toBe(true);
    const T = site();
    mexe(T, 'galpao', { x: 25, z: -45 });
    expect(tem(erros(T), 'engenho e galpao se sobrepõem')).toBe(true);
    const U = site();
    mexe(U, 'galpao', { z: -58.5 }); // termina em z −43,5, a 0,5 m do engenho
    expect(tem(erros(U), 'engenho e galpao ficam a 0.5 m')).toBe(true);
  });

  it('invade a estrada ou o córrego', () => {
    const S = site();
    mexe(S, 'animais', { z: 20 });
    expect(tem(erros(S), 'animais invade a estrada')).toBe(true);
    const T = site();
    mexe(T, 'galpao', { x: 35 });
    expect(tem(erros(T), 'galpao')).toBe(true);
  });

  it('o engenho pode encostar no córrego (encosta), mas outro item não', () => {
    expect(tem(erros(site()), 'engenho')).toBe(false);
    const S = site();
    delete S.itens.find((i) => i.id === 'engenho').encosta;
    expect(tem(erros(S), 'engenho fica a')).toBe(true);
  });

  it('árvore e escavação ficam fora da projeção do bunker', () => {
    const S = site();
    mexe(S, 'bambuzal', { x: -10, z: -70 });
    expect(tem(erros(S), 'bambuzal (arvore) está sobre a projeção do bunker')).toBe(true);
    const T = site();
    mexe(T, 'jazida', { x: 15, z: -50 });
    expect(tem(erros(T), 'jazida (escavacao) está sobre a projeção do bunker')).toBe(true);
  });

  it('a Casa Grande tem de estar sobre o bunker', () => {
    expect(
      tem(erros(site(), { u: -12, v: -73, w: 20, d: 32 }), 'a Casa Grande não está sobre o bunker'),
    ).toBe(true);
  });

  it('regras de distância: animais longe da casa, perto do núcleo; pomar e estufa perto do núcleo', () => {
    const S = site();
    mexe(S, 'animais', { x: -5, z: -35 });
    expect(tem(erros(S), 'm da casa (mínimo 25 m)')).toBe(true);
    const T = site();
    mexe(T, 'pomar', { z: 20 });
    expect(tem(erros(T), 'pomar')).toBe(true);
  });

  it('soma das áreas diferente do plano', () => {
    const S = site();
    S.total_itens = 7000;
    expect(tem(erros(S), 'soma das áreas')).toBe(true);
  });
});

describe('opções do lote geradas pelo solver', () => {
  it('cada opção de plan/lote-opcoes.json passa na régua do lote, com o bunker escolhido', () => {
    const S = JSON.parse(fs.readFileSync('plan/site.json', 'utf8'));
    const oj = JSON.parse(fs.readFileSync('plan/bunker-opcoes.json', 'utf8'));
    const pg = oj.opcoes.find((o) => o.id === oj.escolhida).pegada;
    const lote = JSON.parse(fs.readFileSync('plan/lote-opcoes.json', 'utf8'));
    expect(lote.opcoes.length).toBeGreaterThan(0);
    for (const o of lote.opcoes) {
      expect(
        conferirLote({ ...S, itens: o.itens }, { u: -12, v: -73, w: pg.w, d: pg.d }).erros,
      ).toEqual([]);
    }
  });
});
