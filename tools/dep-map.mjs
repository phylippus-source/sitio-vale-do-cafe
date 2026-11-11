// Mapa de dependencias do IIFE de src/main.js (etapa A2).
// Para cada instrucao de nivel superior: o que define, o que usa na hora (eager) e o que usa depois
// (lazy, dentro de funcoes). Agrupa por secao (comentarios "/* ===== NOME ===== */") e aponta:
//   - nomes reatribuidos (let/var escritos fora da declaracao): estado mutavel compartilhado;
//   - uso eager de nome definido mais adiante (funcoes icadas);
//   - matriz secao -> secao de nomes compartilhados.
// Uso: node tools/dep-map.mjs [--json=arquivo]
import fs from 'node:fs';
import * as espree from 'espree';
import * as escope from 'eslint-scope';

const FILE = 'src/main.js';
const src = fs.readFileSync(FILE, 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
const iife = sm.scopes.find(
  (s) => s.type === 'function' && s.block.type === 'FunctionExpression' && s.upper && s.upper.type === 'module',
);
const body = iife.block.body.body;

// secoes por linha de comentario
const lines = src.split('\n');
const marks = [];
lines.forEach((l, i) => {
  const m = /^ {2}\/\* =+ (.*?)(?: =+| \()/.exec(l);
  if (m) marks.push({ line: i + 1, name: m[1].replace(/\s+/g, ' ').trim() });
});
const secOf = (line) => {
  let s = -1;
  marks.forEach((m, i) => {
    if (m.line <= line) s = i;
  });
  return s;
};

const stmtOf = (pos) => body.findIndex((n) => n.range[0] <= pos && pos < n.range[1]);

const defs = new Map(); // nome -> { stmt, kind }
for (const v of iife.variables) {
  if (v.name === 'arguments' || !v.defs.length) continue;
  const d = v.defs[0];
  defs.set(v.name, { stmt: stmtOf(d.node.range[0]), kind: d.type === 'FunctionName' ? 'fn' : d.parent.kind });
}

const eager = body.map(() => new Set());
const lazy = body.map(() => new Set());
const writes = new Map(); // nome -> Set(stmt)
const isFnScope = (s) => s.type === 'function';
for (const sc of sm.scopes) {
  for (const r of sc.references) {
    const v = r.resolved;
    if (!v || v.scope !== iife || !defs.has(v.name)) continue;
    const st = stmtOf(r.identifier.range[0]);
    if (st < 0) continue; // fora do corpo (parametros do proprio IIFE)
    let s = r.from;
    let inFn = false;
    while (s && s !== iife) {
      if (isFnScope(s)) inFn = true;
      s = s.upper;
    }
    const own = defs.get(v.name).stmt === st;
    if (own && r.init) continue;
    (inFn ? lazy : eager)[st].add(v.name);
    if (r.isWrite() && !r.init) {
      if (!writes.has(v.name)) writes.set(v.name, new Set());
      writes.get(v.name).add(st);
    }
  }
}

const label = (i) => {
  const n = body[i];
  const l = n.loc.start.line;
  let d = n.type;
  if (n.type === 'FunctionDeclaration') d = 'fn ' + n.id.name;
  else if (n.type === 'VariableDeclaration') d = n.kind + ' ' + n.declarations.map((x) => x.id.name || '{}').join(',');
  return l + '-' + n.loc.end.line + ' ' + d.slice(0, 60);
};
const secName = (i) => (secOf(body[i].loc.start.line) < 0 ? '(topo)' : marks[secOf(body[i].loc.start.line)].name.slice(0, 28));

const out = [];
out.push('# Secoes');
marks.forEach((m, i) => out.push(`  ${i} L${m.line} ${m.name.slice(0, 70)}`));

out.push('\n# Nomes reatribuidos (estado mutavel)');
for (const [name, set] of writes) {
  const d = defs.get(name);
  const wsecs = [...set].map((i) => secOf(body[i].loc.start.line));
  const rsecs = new Set();
  body.forEach((_, i) => {
    if (eager[i].has(name) || lazy[i].has(name)) rsecs.add(secOf(body[i].loc.start.line));
  });
  out.push(`  ${name} (${d.kind}) def ${label(d.stmt)} | escrito em secoes ${[...new Set(wsecs)]} | lido em secoes ${[...rsecs].sort((a, b) => a - b)}`);
}

out.push('\n# Uso eager de nome definido adiante (funcoes icadas)');
body.forEach((_, i) => {
  for (const n of eager[i]) {
    const d = defs.get(n);
    if (d.stmt > i) out.push(`  stmt ${label(i)}  usa ${n} (${d.kind}) definido em ${label(d.stmt)}`);
  }
});

out.push('\n# Uso lazy de nome definido adiante em OUTRA secao (ciclo potencial)');
const lazyFwd = [];
body.forEach((_, i) => {
  for (const n of lazy[i]) {
    const d = defs.get(n);
    if (d.stmt > i && secOf(body[d.stmt].loc.start.line) !== secOf(body[i].loc.start.line)) lazyFwd.push([i, n, d]);
  }
});
lazyFwd.forEach(([i, n, d]) => out.push(`  ${label(i)}  usa ${n} definido em ${label(d.stmt)}`));

out.push('\n# Matriz de nomes compartilhados (secao que define -> secao que usa)');
const mat = new Map();
body.forEach((_, i) => {
  const si = secOf(body[i].loc.start.line);
  for (const n of new Set([...eager[i], ...lazy[i]])) {
    const sd = secOf(body[defs.get(n).stmt].loc.start.line);
    if (sd === si) continue;
    const k = sd + '->' + si;
    if (!mat.has(k)) mat.set(k, new Set());
    mat.get(k).add(n);
  }
});
[...mat.entries()]
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]) || parseInt(a[0].split('>')[1]) - parseInt(b[0].split('>')[1]))
  .forEach(([k, s]) => out.push(`  ${k}: ${s.size} nomes: ${[...s].slice(0, 14).join(',')}${s.size > 14 ? ',…' : ''}`));

console.log(out.join('\n'));
const j = process.argv.find((a) => a.startsWith('--json='));
if (j) {
  fs.writeFileSync(
    j.slice(7),
    JSON.stringify({ marks, defs: [...defs], eager: eager.map((s) => [...s]), lazy: lazy.map((s) => [...s]), writes: [...writes].map(([k, v]) => [k, [...v]]) }),
  );
}
