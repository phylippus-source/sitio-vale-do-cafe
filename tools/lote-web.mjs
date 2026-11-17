// Núcleo do lote para o navegador: régua, caminhos, viagens e sombra, sem fs. A página interativa usa o bundle gerado por build-web.mjs.
import { conferirLote } from './lote-lib.mjs';
import { tracarCaminhos } from './caminhos-lib.mjs';

export { conferirLote, tracarCaminhos };

// Σ peso × distância L1 entre centros (viagens diretas)
export function custoViagens(S, itens) {
  const por = new Map(itens.map((i) => [i.id, i]));
  return S.viagens.pares.reduce((t, par) => {
    const a = por.get(par.a),
      b = por.get(par.b);
    return (
      t +
      par.peso * (Math.abs(a.x + a.w / 2 - b.x - b.w / 2) + Math.abs(a.z + a.d / 2 - b.z - b.d / 2))
    );
  }, 0);
}

// Avalia um arranjo { itens, estrada?, bloco?, dz_bunker? }; `bunker` = { x0, z0, w, d } (pegada e origem no mundo)
export function avaliar(S, bunker, arranjo) {
  const S2 = {
    ...S,
    itens: arranjo.itens,
    estrada: arranjo.estrada || S.estrada,
    bloco: arranjo.bloco,
  };
  const regua = conferirLote(S2, {
    u: bunker.x0,
    v: bunker.z0 + (arranjo.dz_bunker || 0),
    w: bunker.w,
    d: bunker.d,
  });
  const cam = tracarCaminhos(S, {
    itens: arranjo.itens,
    estrada: S2.estrada,
    bloco: arranjo.bloco,
  });
  return {
    erros: regua.erros,
    metricas: regua.metricas,
    viagens: custoViagens(S, arranjo.itens),
    cam,
  };
}

// ---- Arranjo manual: grade, ímã e giro (usados pela página interativa) ----
export const GRADE = 5; // grade invisível, em metros
export const CAPTURA = 3; // raio do ímã, em metros
const arred = (v) => Math.round(v * 100) / 100;

// Gira 90° no sentido horário em torno do centro (a tela tem z para baixo)
export function girar(it) {
  const cx = it.x + it.w / 2,
    cz = it.z + it.d / 2;
  return {
    ...it,
    w: it.d,
    d: it.w,
    x: arred(cx - it.d / 2),
    z: arred(cz - it.w / 2),
    giro: ((it.giro || 0) + 1) % 4,
  };
}

// Retângulos que seguram os itens: córrego e estrada (afastados pela folga da régua)
export function barreiras(S, estrada) {
  const L = S.lote,
    E = estrada || S.estrada;
  return [
    { x: S.corrego.x1, z: L.z1, w: S.corrego.x2 - S.corrego.x1, d: L.z2 - L.z1 },
    { x: E.x1, z: E.z1, w: E.x2 - E.x1, d: E.z2 - E.z1 },
  ];
}

// Posição final do item `it` quando o Mestre o solta perto de (x, z): ímã nas bordas vizinhas
// (folga S.margem, ou alinhado) e na divisa; sem ímã por perto, vai para a grade de 5 m.
export function encaixar(it, x, z, S, outros, estrada, { ima = true } = {}) {
  const L = S.lote,
    M = S.margem;
  const alvos = [...outros.filter((o) => o.id !== it.id), ...barreiras(S, estrada)];
  const eixo = (pos, tam, lo, hi, ini, fim, perto) => {
    const minimo = lo + M,
      maximo = hi - M - tam;
    let melhor = null;
    const tenta = (c) => {
      if (
        Math.abs(c - pos) <= CAPTURA &&
        (melhor === null || Math.abs(c - pos) < Math.abs(melhor - pos))
      )
        melhor = c;
    };
    if (ima) {
      tenta(minimo);
      tenta(maximo);
      for (const o of alvos) {
        if (!perto(o)) continue;
        const [a, b] = [o[ini], o[ini] + o[fim]];
        tenta(a - M - tam);
        tenta(b + M);
        tenta(a);
        tenta(b - tam);
      }
    }
    const c = melhor ?? lo + Math.round((pos - lo) / GRADE) * GRADE;
    return arred(Math.min(Math.max(c, minimo), maximo));
  };
  const vizinhoZ = (zz) => (o) => zz < o.z + o.d + M + CAPTURA && zz + it.d > o.z - M - CAPTURA;
  const nx = eixo(x, it.w, L.x1, L.x2, 'x', 'w', vizinhoZ(z));
  const vizinhoX = (o) => nx < o.x + o.w + M + CAPTURA && nx + it.w > o.x - M - CAPTURA;
  const nz = eixo(z, it.d, L.z1, L.z2, 'z', 'd', vizinhoX);
  return { x: nx, z: nz };
}
