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
