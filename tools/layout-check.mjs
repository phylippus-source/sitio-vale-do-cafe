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

checkBunker();
if (errors.length) {
  console.error('\nFALHOU (' + errors.length + '):\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('layout: OK');
