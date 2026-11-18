// Avalia um arranjo do lote feito à mão (JSON { estrada, bunker{x,z,w,d}, itens[] }): régua, regra do córrego do bunker,
// viagens (diretas e pela rede de caminhos) e sombra. Uso: node tools/avaliar-arranjo.mjs arranjo.json [--json]
import fs from 'node:fs';
import { conferirLote } from './lote-lib.mjs';
import { tracarCaminhos } from './caminhos-lib.mjs';
import { custoViagens } from './lote-web.mjs';

const S = JSON.parse(fs.readFileSync('plan/site.json', 'utf8'));
const B = JSON.parse(fs.readFileSync('plan/bunker.json', 'utf8'));

export function avaliarArranjo(a) {
  const bk = a.bunker;
  const S2 = { ...S, itens: a.itens, estrada: a.estrada };
  const r = conferirLote(S2, { u: bk.x, v: bk.z, w: bk.w, d: bk.d });
  const erros = r.erros.filter((e) => !/Casa Grande não está sobre o bunker/.test(e));
  const avisos = r.erros.filter((e) => /Casa Grande não está sobre o bunker/.test(e));
  const L = S.lote;
  const dc = B.mundo.distancia_corrego;
  if (bk.x < L.x1 + S.margem || bk.x + bk.w > S.corrego.x1 - dc || bk.z < L.z1 + S.margem || bk.z + bk.d > L.z2 - S.margem)
    erros.push(`bunker: sai do lote ou fica a menos de ${dc} m do córrego (x máx ${S.corrego.x1 - dc})`);
  const cam = tracarCaminhos(S, { itens: a.itens, estrada: a.estrada });
  // maior retângulo vazio (grade de 1 m): fora de itens, estrada e córrego; o bunker é subterrâneo e não conta
  const nx = L.x2 - L.x1, nz = L.z2 - L.z1;
  const ocup = Array.from({ length: nz }, () => new Uint8Array(nx));
  const marca = (r) => {
    for (let z = Math.max(0, Math.floor(r.z - L.z1)); z < Math.min(nz, Math.ceil(r.z + r.d - L.z1)); z++)
      for (let x = Math.max(0, Math.floor(r.x - L.x1)); x < Math.min(nx, Math.ceil(r.x + r.w - L.x1)); x++) ocup[z][x] = 1;
  };
  a.itens.forEach(marca);
  marca({ x: a.estrada.x1, z: a.estrada.z1, w: a.estrada.x2 - a.estrada.x1, d: a.estrada.z2 - a.estrada.z1 });
  marca({ x: S.corrego.x1, z: L.z1, w: S.corrego.x2 - S.corrego.x1, d: nz });
  let vazio = { area: 0 };
  const h = new Array(nx).fill(0);
  for (let z = 0; z < nz; z++) {
    for (let x = 0; x < nx; x++) h[x] = ocup[z][x] ? 0 : h[x] + 1;
    for (let i = 0; i < nx; i++) {
      let mn = Infinity;
      for (let j = i; j < nx && h[j]; j++) {
        mn = Math.min(mn, h[j]);
        if (mn * (j - i + 1) > vazio.area) vazio = { area: mn * (j - i + 1), w: j - i + 1, d: mn, x: L.x1 + i, z: L.z1 + z - mn + 1 };
      }
    }
  }
  const livreTotal = nx * nz - ocup.reduce((t, l) => t + l.reduce((a, b) => a + b, 0), 0);
  return {
    vazio,
    livreTotal,
    erros,
    avisos,
    viagens: custoViagens(S, a.itens),
    viagemRede: cam.viagemRede,
    caminhoM: cam.comprimento,
    semRota: cam.semRota,
    sombra: r.metricas.sombra,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const r = avaliarArranjo(a);
  if (process.argv.includes('--json')) console.log(JSON.stringify(r));
  else {
    console.log(`${a.nome || process.argv[2]}\nerros: ${r.erros.length}`);
    r.erros.forEach((e) => console.log(' -', e));
    r.avisos.forEach((e) => console.log(' (aviso)', e));
    console.log(`maior vazio ${r.vazio.w}×${r.vazio.d} m = ${r.vazio.area} m² (x ${r.vazio.x}, z ${r.vazio.z}) · livre total ${r.livreTotal} m²`);
    console.log(`viagens diretas ${r.viagens.toFixed(0)} · pela rede ${r.viagemRede.toFixed(0)} · caminhos ${r.caminhoM} m · sem rota: ${r.semRota.join(',') || '—'}`);
    console.log('sombra (h/dia médias por lavoura):', JSON.stringify(Object.fromEntries(Object.entries(r.sombra || {}).map(([k, v]) => [k, +v.toFixed(2)]))));
  }
}
