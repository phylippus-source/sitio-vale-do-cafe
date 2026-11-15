// Confere as pranchas de projeto (plan/*.json): medidas contra o plano, soma das areas,
// sobreposicoes, limites, regra 0/5 e acesso de cada ambiente.
// Uso: node tools/layout-check.mjs [--map] [--opcoes arquivo.json]
// Sem --opcoes, confere plan/bunker-opcoes.json se ele existir. As regras ficam em tools/layout-lib.mjs.
import { conferirLote } from './lote-lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EPS, half, overlap, gap, conferirBase, conferirOpcao, mapa } from './layout-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const showMap = process.argv.includes('--map');
const errors = [];
const err = (m) => errors.push(m);
const lerJson = (rel) => JSON.parse(fs.readFileSync(path.resolve(ROOT, rel), 'utf8'));

const fmt = (n) => String(Math.round(n * 100) / 100);
function resumo(m) {
  const a = m.afinidades;
  const r = m.ruido ? `${fmt(m.ruido.distancia)} m (${m.ruido.par.join(' ↔ ')})` : '—';
  return (
    `acesso máx ${m.acesso.max} salto(s), ${m.acesso.direto} de ${m.acesso.ambientes} direto na circulação; ` +
    `afinidades ${a.atendidas}/${a.total} (${a.pontos}/${a.maximo} pontos); ruído mais perto ${r}; ` +
    `saídas a ${m.saidas === null ? '—' : fmt(m.saidas) + ' m'}; encolhe ${fmt(m.encolhe)} m², cresce ${fmt(m.cresce)} m²`
  );
}

function checkBunker(P, S) {
  const r = conferirBase(P, S);
  r.erros.forEach((m) => err('bunker: ' + m));
  const m = r.metricas;
  const F = P.pegada;
  const W = P.mundo;
  console.log(
    `bunker: ${m.ambientes} ambientes, útil do plano ${m.nominal} m² (+ ramal novo ${m.util - m.nominal} m²), pegada ${F.w}×${F.d} = ${m.pegada.area} m²`,
  );
  console.log(
    `bunker: vazios ${m.vazio} m² em ${m.bolsoes.length} bolsões: ` +
      m.bolsoes.map((p) => `${p.area} m² (u ${p.u1}–${p.u2}, v ${p.v1}–${p.v2})`).join('; '),
  );
  console.log(`bunker: mundo x ${W.x0}…${W.x0 + F.w}, z ${W.z0}…${W.z0 + F.d}, piso ${W.piso} m`);
  console.log('bunker: ' + resumo(m));
  if (showMap) console.log(mapa(F, P.salas));
}

/* opções geradas pelo solver: cada uma confere com a tolerância do seu cenário */
function checkOpcoes(P, S) {
  const i = process.argv.indexOf('--opcoes');
  const rel = i > 0 ? process.argv[i + 1] : 'plan/bunker-opcoes.json';
  if (!fs.existsSync(path.resolve(ROOT, rel))) {
    if (i > 0) err('opções: arquivo não encontrado: ' + rel);
    return;
  }
  const lista = lerJson(rel).opcoes;
  if (!Array.isArray(lista)) return err('opções: o arquivo precisa ter a lista "opcoes"');
  lista.forEach((o, i) => {
    const nome = o && o.id ? o.id : '#' + (i + 1);
    const r = conferirOpcao(P, o, S);
    r.erros.forEach((m) => err(`opção ${nome}: ${m}`));
    if (!r.metricas) return;
    const m = r.metricas;
    console.log(
      `opção ${nome}: ${m.ambientes} ambientes, pegada ${o.pegada.w}×${o.pegada.d} = ${m.pegada.area} m², vazios ${m.vazio} m² em ${m.bolsoes.length} bolsões (maior ${m.bolsoes.length ? m.bolsoes[0].area : 0} m²)`,
    );
    console.log(`opção ${nome}: ` + resumo(m));
    if (showMap) console.log(mapa(o.pegada, o.salas));
  });
}

/* ---------- implantacao do lote ---------- */
function checkSite(S, B, escolhida) {
  const pg = escolhida ? escolhida.pegada : B.pegada;
  const bunker = { u: B.mundo.x0, v: B.mundo.z0, w: pg.w, d: pg.d };
  const { erros, metricas: m } = conferirLote(S, bunker);
  erros.forEach(err);
  console.log(
    `lote: bunker ${pg.w}×${pg.d} m${escolhida ? ' (opção escolhida)' : ''}; ${S.itens.length} itens, áreas do plano ${m.total} m², envelopes ${m.env} m² de ${m.lotArea} m² (${((m.env / m.lotArea) * 100).toFixed(0)}%)`,
  );
  if (m.sombra)
    console.log(
      `lote: sombra média no inverno, 9 h–15 h (informativo): ${Object.entries(m.sombra)
        .map(([k, v]) => `${k} ${v.toFixed(1)} h`)
        .join(', ')}`,
    );
  console.log(
    `lote: margem mínima ${S.margem} m; distâncias: animais–casa ${m.dist.animaisCasa.toFixed(0)} m, pomar–núcleo ${m.dist.pomarNucleo.toFixed(1)} m, estufa–núcleo ${m.dist.estufaNucleo.toFixed(1)} m, animais–núcleo ${m.dist.animaisNucleo.toFixed(1)} m`,
  );
}

/* Opções do lote (plan/lote-opcoes.json): cada uma troca só os itens do plano e passa pela mesma régua. */
function checkOpcoesLote(S, B, escolhida) {
  const arq = path.resolve(ROOT, 'plan/lote-opcoes.json');
  if (!fs.existsSync(arq)) return;
  const pg = escolhida ? escolhida.pegada : B.pegada;
  const bunker = { u: B.mundo.x0, v: B.mundo.z0, w: pg.w, d: pg.d };
  for (const o of JSON.parse(fs.readFileSync(arq, 'utf8')).opcoes) {
    const { erros, metricas: m } = conferirLote(
      { ...S, itens: o.itens, estrada: o.estrada || S.estrada },
      { ...bunker, v: bunker.v + (o.dz_bunker || 0) },
    );
    erros.forEach((e) => err(`lote opção ${o.id}: ${e.replace(/^lote: /, '')}`));
    const sombra = m.sombra
      ? Object.entries(m.sombra)
          .map(([k, v]) => `${k} ${v.toFixed(1)} h`)
          .join(', ')
      : '';
    console.log(
      `lote opção ${o.id}: ${erros.length ? erros.length + ' erro(s)' : 'passa na régua'}; sombra ${sombra}; animais–casa ${m.dist.animaisCasa.toFixed(0)} m`,
    );
  }
}

const planoBunker = lerJson('plan/bunker.json');
const planoLote = lerJson('plan/site.json');
checkBunker(planoBunker, planoLote);
const opcJson = fs.existsSync(path.resolve(ROOT, 'plan/bunker-opcoes.json'))
  ? lerJson('plan/bunker-opcoes.json')
  : null;
checkSite(
  planoLote,
  planoBunker,
  opcJson && opcJson.opcoes.find((o) => o.id === opcJson.escolhida),
);
checkOpcoes(planoBunker, planoLote);
checkOpcoesLote(
  planoLote,
  planoBunker,
  opcJson && opcJson.opcoes.find((o) => o.id === opcJson.escolhida),
);
if (errors.length) {
  console.error('\nFALHOU (' + errors.length + '):\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('layout: OK');
