// Confere as pranchas de projeto (plan/*.json): medidas contra o plano, soma das areas,
// sobreposicoes, limites, regra 0/5 e acesso de cada ambiente.
// Uso: node tools/layout-check.mjs [--map] [--opcoes arquivo.json]
// Sem --opcoes, confere plan/bunker-opcoes.json se ele existir. As regras ficam em tools/layout-lib.mjs.
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
  console.log(`bunker: ${m.ambientes} ambientes, útil do plano ${m.nominal} m² (+ ramal novo ${m.util - m.nominal} m²), pegada ${F.w}×${F.d} = ${m.pegada.area} m²`);
  console.log(`bunker: vazios ${m.vazio} m² em ${m.bolsoes.length} bolsões: ` + m.bolsoes.map((p) => `${p.area} m² (u ${p.u1}–${p.u2}, v ${p.v1}–${p.v2})`).join('; '));
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
    console.log(`opção ${nome}: ${m.ambientes} ambientes, pegada ${o.pegada.w}×${o.pegada.d} = ${m.pegada.area} m², vazios ${m.vazio} m² em ${m.bolsoes.length} bolsões (maior ${m.bolsoes.length ? m.bolsoes[0].area : 0} m²)`);
    console.log(`opção ${nome}: ` + resumo(m));
    if (showMap) console.log(mapa(o.pegada, o.salas));
  });
}

/* ---------- implantacao do lote ---------- */
function checkSite(S, B) {
  const R = (o) => ({ u: o.x, v: o.z, w: o.w, d: o.d });
  const box = (o) => ({ u: o.x1, v: o.z1, w: o.x2 - o.x1, d: o.z2 - o.z1 });
  const bunker = { u: B.mundo.x0, v: B.mundo.z0, w: B.pegada.w, d: B.pegada.d };
  const byId = new Map(S.itens.map((i) => [i.id, i]));
  let total = 0;
  for (const [id, [w, d]] of Object.entries(S.medidas)) {
    const it = byId.get(id);
    if (!it) {
      err('lote: falta no layout: ' + id);
      continue;
    }
    const ok = (Math.abs(it.w - w) < EPS && Math.abs(it.d - d) < EPS) || (Math.abs(it.w - d) < EPS && Math.abs(it.d - w) < EPS);
    if (!ok) err(`lote: ${id} mede ${it.w}×${it.d} e o plano pede ${w}×${d}`);
    if (id === 'quadras') {
      const q = S.quadras_internas;
      const need = [2 * q.cada[0] + q.vao, 2 * q.cada[1] + q.vao];
      if (it.w !== need[0] || it.d !== need[1]) err(`lote: as quadras giradas medem ${need[0]}×${need[1]}, o layout tem ${it.w}×${it.d}`);
      total += 4 * q.cada[0] * q.cada[1];
    } else total += w * d;
    if (S.areas_plano[id] !== undefined) {
      const a = id === 'quadras' ? 4 * S.quadras_internas.cada[0] * S.quadras_internas.cada[1] : w * d;
      if (id !== 'pomar' && Math.abs(a - S.areas_plano[id]) > EPS) err(`lote: área de ${id} (${a}) difere do plano (${S.areas_plano[id]})`);
    }
  }
  for (const id of byId.keys()) if (!(id in S.medidas)) err('lote: item fora do plano: ' + id);
  if (Math.abs(total - S.total_itens) > EPS) err(`lote: soma das áreas ${total} difere do plano ${S.total_itens}`);
  /* 0/5, limites, margens, sobreposicao */
  const L = S.lote;
  const obstacles = [
    ['estrada', box(S.estrada)],
    ['córrego', box({ x1: S.corrego.x1, x2: S.corrego.x2, z1: L.z1, z2: L.z2 })],
  ];
  for (const it of S.itens) {
    for (const k of ['x', 'z', 'w', 'd']) if (!half(it[k])) err(`lote: ${it.id}.${k}=${it[k]} não termina em 0 ou 5`);
    if (it.x < L.x1 + S.margem - EPS || it.x + it.w > L.x2 - EPS || it.z < L.z1 + S.margem - EPS || it.z + it.d > L.z2 - S.margem + EPS) err(`lote: ${it.id} sai do lote ou fica a menos de ${S.margem} m da divisa`);
    for (const [nome, o] of obstacles) {
      const g = gap(R(it), o);
      const enc = (it.encosta || []).includes(nome.replace('ó', 'o'));
      if (overlap(R(it), o)) err(`lote: ${it.id} invade a ${nome}`);
      else if (g < S.margem - EPS && !enc) err(`lote: ${it.id} fica a ${g.toFixed(1)} m da ${nome} (mínimo ${S.margem} m)`);
    }
    if (['arvore', 'escavacao'].includes(it.tipo) && overlap(R(it), bunker)) err(`lote: ${it.id} (${it.tipo}) está sobre a projeção do bunker`);
  }
  for (let i = 0; i < S.itens.length; i++)
    for (let j = i + 1; j < S.itens.length; j++) {
      const a = S.itens[i], b = S.itens[j];
      if (overlap(R(a), R(b))) err(`lote: ${a.id} e ${b.id} se sobrepõem`);
      else if (gap(R(a), R(b)) < S.margem - EPS) err(`lote: ${a.id} e ${b.id} ficam a ${gap(R(a), R(b)).toFixed(1)} m (mínimo ${S.margem} m)`);
    }
  /* casa sobre o bunker; distancias do plano */
  const c = R(byId.get('casa'));
  if (!(c.u >= bunker.u && c.v >= bunker.v && c.u + c.w <= bunker.u + bunker.w && c.v + c.d <= bunker.v + bunker.d)) err('lote: a Casa Grande não está sobre o bunker');
  const g2 = (a, b) => gap(R(byId.get(a)), R(byId.get(b)));
  const rule = S.regras;
  if (g2('animais', 'casa') < rule.animais_longe_da_casa) err(`lote: animais a ${g2('animais', 'casa').toFixed(1)} m da casa (mínimo ${rule.animais_longe_da_casa} m)`);
  if (g2('pomar', 'nucleo') > rule.pomar_perto_do_nucleo) err(`lote: pomar a ${g2('pomar', 'nucleo').toFixed(1)} m do núcleo (máximo ${rule.pomar_perto_do_nucleo} m)`);
  if (g2('estufa', 'nucleo') > rule.estufa_perto_do_nucleo) err(`lote: estufa a ${g2('estufa', 'nucleo').toFixed(1)} m do núcleo (máximo ${rule.estufa_perto_do_nucleo} m)`);
  if (g2('animais', 'nucleo') > rule.animais_perto_do_nucleo) err(`lote: animais a ${g2('animais', 'nucleo').toFixed(1)} m do núcleo (máximo ${rule.animais_perto_do_nucleo} m)`);
  const lotArea = (L.x2 - L.x1) * (L.z2 - L.z1);
  const env = S.itens.reduce((a, i) => a + i.w * i.d, 0);
  console.log(`lote: ${S.itens.length} itens, áreas do plano ${total} m², envelopes ${env} m² de ${lotArea} m² (${((env / lotArea) * 100).toFixed(0)}%)`);
  console.log(`lote: margem mínima ${S.margem} m; distâncias: animais–casa ${g2('animais', 'casa').toFixed(0)} m, pomar–núcleo ${g2('pomar', 'nucleo').toFixed(1)} m, estufa–núcleo ${g2('estufa', 'nucleo').toFixed(1)} m, animais–núcleo ${g2('animais', 'nucleo').toFixed(1)} m`);
}

const planoBunker = lerJson('plan/bunker.json');
const planoLote = lerJson('plan/site.json');
checkBunker(planoBunker, planoLote);
checkSite(planoLote, planoBunker);
checkOpcoes(planoBunker, planoLote);
if (errors.length) {
  console.error('\nFALHOU (' + errors.length + '):\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('layout: OK');
