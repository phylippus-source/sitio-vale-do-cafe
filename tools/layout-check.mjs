// Confere as pranchas de projeto (plan/*.json): medidas contra o plano, soma das areas,
// sobreposicoes, limites, regra 0/5 e acesso de cada ambiente.
// Uso: node tools/layout-check.mjs [--map]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const showMap = process.argv.includes('--map');
const errors = [];
const err = (m) => errors.push(m);
const EPS = 1e-9;

const half = (n) => Math.abs(n * 2 - Math.round(n * 2)) < EPS; // multiplos de 0,5: termina em 0 ou 5
const overlap = (a, b) => a.u < b.u + b.w - EPS && b.u < a.u + a.w - EPS && a.v < b.v + b.d - EPS && b.v < a.v + a.d - EPS;
/* comprimento da borda comum (0 se so se tocam num ponto ou nao se tocam) */
function shared(a, b) {
  const du = Math.min(a.u + a.w, b.u + b.w) - Math.max(a.u, b.u);
  const dv = Math.min(a.v + a.d, b.v + b.d) - Math.max(a.v, b.v);
  if (Math.abs(a.u + a.w - b.u) < EPS || Math.abs(b.u + b.w - a.u) < EPS) return dv > EPS ? dv : 0;
  if (Math.abs(a.v + a.d - b.v) < EPS || Math.abs(b.v + b.d - a.v) < EPS) return du > EPS ? du : 0;
  return 0;
}

function checkBunker() {
  const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'plan/bunker.json'), 'utf8'));
  const byId = new Map();
  for (const s of P.salas) {
    if (byId.has(s.id)) err('bunker: ambiente repetido: ' + s.id);
    byId.set(s.id, s);
  }
  /* 1. medidas e soma das areas do plano */
  let total = 0;
  for (const [id, [w, d]] of Object.entries(P.medidas)) {
    total += w * d;
    const s = byId.get(id);
    if (!s) {
      err('bunker: falta no layout: ' + id);
      continue;
    }
    const ok = (Math.abs(s.w - w) < EPS && Math.abs(s.d - d) < EPS) || (Math.abs(s.w - d) < EPS && Math.abs(s.d - w) < EPS);
    if (!ok) err(`bunker: ${id} mede ${s.w}×${s.d} e o plano pede ${w}×${d}`);
  }
  if (Math.abs(total - P.total_util) > EPS) err(`bunker: soma das medidas ${total} difere do total do plano ${P.total_util}`);
  for (const [id, [w, d]] of Object.entries(P.extras || {})) {
    const s = byId.get(id);
    if (!s) err('bunker: falta o extra ' + id);
    else if (s.w !== w || s.d !== d) err(`bunker: extra ${id} mede ${s.w}×${s.d}, esperado ${w}×${d}`);
  }
  for (const id of byId.keys()) if (!(id in P.medidas) && !(id in (P.extras || {}))) err('bunker: ambiente fora do plano: ' + id);
  for (const id of Object.keys(P.areas)) if (!byId.has(id)) err('bunker: nome sem ambiente: ' + id);
  /* 2. regra 0/5, limites e sobreposicao */
  const F = P.pegada;
  for (const s of P.salas) {
    for (const k of ['u', 'v', 'w', 'd']) if (!half(s[k])) err(`bunker: ${s.id}.${k}=${s[k]} não termina em 0 ou 5`);
    if (s.u < -EPS || s.v < -EPS || s.u + s.w > F.w + EPS || s.v + s.d > F.d + EPS) err(`bunker: ${s.id} sai da pegada ${F.w}×${F.d}`);
  }
  for (let i = 0; i < P.salas.length; i++)
    for (let j = i + 1; j < P.salas.length; j++)
      if (overlap(P.salas[i], P.salas[j])) err(`bunker: ${P.salas[i].id} e ${P.salas[j].id} se sobrepõem`);
  /* 3. acesso: toca a circulacao (borda >= 1 m) ou passa por ate 2 ambientes ligados */
  const circ = new Set(P.circulacao);
  const reach = new Map(); // id -> saltos ate a circulacao (a circulacao em si vale 0)
  reach.set('galeria', 0);
  for (let pass = 0; pass < 4; pass++)
    for (const id of circ) {
      const s = byId.get(id);
      if (!s || reach.has(id)) continue;
      if ([...reach.keys()].some((o) => circ.has(o) && shared(s, byId.get(o)) >= 1)) reach.set(id, 0);
    }
  for (let pass = 0; pass < 4; pass++)
    for (const s of P.salas) {
      if (reach.has(s.id)) continue;
      const links = [...circ, ...(s.acesso || [])].map((id) => byId.get(id)).filter(Boolean);
      for (const o of links) {
        if (o !== s && reach.has(o.id) && shared(s, o) >= 1) {
          reach.set(s.id, reach.get(o.id) + 1);
          break;
        }
      }
    }
  for (const s of P.salas) {
    if (!reach.has(s.id)) err(`bunker: ${s.id} não tem acesso até a circulação`);
    else if (reach.get(s.id) > 2) err(`bunker: ${s.id} está a ${reach.get(s.id)} saltos da circulação (máximo 2)`);
  }
  /* 4. vazios: area da pegada que nao e ambiente */
  const cells = new Map();
  const G = 0.5;
  for (let i = 0; i < F.w / G; i++)
    for (let j = 0; j < F.d / G; j++) {
      const c = { u: i * G + EPS * 2, v: j * G + EPS * 2, w: G - EPS * 4, d: G - EPS * 4 };
      if (!P.salas.some((s) => overlap(c, s))) cells.set(i + ',' + j, 0);
    }
  const freeArea = cells.size * G * G;
  const pockets = [];
  const seen = new Set();
  for (const key of cells.keys()) {
    if (seen.has(key)) continue;
    const stack = [key];
    seen.add(key);
    let n = 0;
    let u1 = 1e9, v1 = 1e9, u2 = -1, v2 = -1;
    while (stack.length) {
      const [i, j] = stack.pop().split(',').map(Number);
      n++;
      u1 = Math.min(u1, i * G); v1 = Math.min(v1, j * G); u2 = Math.max(u2, (i + 1) * G); v2 = Math.max(v2, (j + 1) * G);
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = i + a + ',' + (j + b);
        if (cells.has(k) && !seen.has(k)) {
          seen.add(k);
          stack.push(k);
        }
      }
    }
    pockets.push({ area: n * G * G, u1, v1, u2, v2 });
  }
  pockets.sort((a, b) => b.area - a.area);
  /* 5. dentro do lote e longe do corrego */
  const W = P.mundo;
  const x1 = W.x0, x2 = W.x0 + F.w, z1 = W.z0, z2 = W.z0 + F.d;
  if (x1 < -50 || x2 > 50 || z1 < -75 || z2 > 75) err('bunker: sai do lote');
  if (x2 > 43 - 5) err('bunker: a menos de 5 m do córrego (x ≥ 43)');
  const used = P.salas.reduce((a, s) => a + s.w * s.d, 0);
  console.log(`bunker: ${P.salas.length} ambientes, útil do plano ${total} m² (+ ramal novo ${used - total} m²), pegada ${F.w}×${F.d} = ${F.w * F.d} m²`);
  console.log(`bunker: vazios ${freeArea} m² em ${pockets.length} bolsões: ` + pockets.map((p) => `${p.area} m² (u ${p.u1}–${p.u2}, v ${p.v1}–${p.v2})`).join('; '));
  console.log(`bunker: mundo x ${x1}…${x2}, z ${z1}…${z2}, piso ${W.piso} m; acesso máximo ${Math.max(...reach.values())} salto(s) além da circulação`);
  if (showMap) printMap(P);
}

function printMap(P) {
  const sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij';
  const ids = P.salas.map((s) => s.id);
  const rows = [];
  for (let v = 0; v < P.pegada.d; v++) {
    let line = '';
    for (let u = 0; u < P.pegada.w; u++) {
      const s = P.salas.find((r) => u + 0.5 > r.u && u + 0.5 < r.u + r.w && v + 0.5 > r.v && v + 0.5 < r.v + r.d);
      line += s ? sym[ids.indexOf(s.id)] : '·';
    }
    rows.push(line);
  }
  console.log(rows.join('\n'));
  console.log(ids.map((id, i) => sym[i] + '=' + id).join(' '));
}


/* ---------- implantacao do lote ---------- */
function checkSite() {
  const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'plan/site.json'), 'utf8'));
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, 'plan/bunker.json'), 'utf8'));
  const R = (o) => ({ u: o.x, v: o.z, w: o.w, d: o.d });
  const box = (o) => ({ u: o.x1, v: o.z1, w: o.x2 - o.x1, d: o.z2 - o.z1 });
  const bunker = { u: B.mundo.x0, v: B.mundo.z0, w: B.pegada.w, d: B.pegada.d };
  const byId = new Map(S.itens.map((i) => [i.id, i]));
  /* gap entre retangulos (0 se encostam ou se sobrepoem) */
  const gap = (a, b) => Math.hypot(Math.max(a.u - (b.u + b.w), b.u - (a.u + a.w), 0), Math.max(a.v - (b.v + b.d), b.v - (a.v + a.d), 0));
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

checkBunker();
checkSite();
if (errors.length) {
  console.error('\nFALHOU (' + errors.length + '):\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('layout: OK');
