// Corta o IIFE de src/main.js em modulos ES (etapa A2). Cada modulo recebe um trecho contiguo de
// instrucoes de nivel superior (por linhas) e/ou instrucoes puxadas pelo nome (ex.: constantes de DOM).
// A ordem de execucao e preservada: main.js importa os modulos na ordem do manifesto, e os modulos
// ficam antes do que sobra no IIFE (por isso so se extrai um prefixo do arquivo).
//
// O que a ferramenta calcula sozinha (analise de escopo com eslint-scope):
//   - imports de cada modulo (de three/core/data/config e dos modulos anteriores);
//   - exports (so o que outro modulo ou o main.js usa);
//   - erros: nome reatribuido por outro modulo, uso de nome que ficou no main.js, `return` no topo.
//
// Manifesto (JSON):
//   { "modules": [ { "file": "src/world/terrain.js", "header": "texto", "lines": [133, 422] },
//                  { "file": "src/app/page.js", "header": "...", "names": ["$", "reduce"] } ] }
//   "names" puxa a instrucao que declara o nome (so as proprias linhas; comentarios ficam no vizinho);
//   "lines" leva toda instrucao de nivel superior que COMECA no intervalo (inclusive comentarios antes dela).
// Uso: node tools/split-sections.mjs manifesto.json [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as espree from 'espree';
import * as escope from 'eslint-scope';

const MAIN = 'src/main.js';
const SRC = path.resolve('src');
const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const dry = process.argv.includes('--dry');
const fail = (m) => {
  console.error('ERRO: ' + m);
  process.exit(1);
};

const text = fs.readFileSync(MAIN, 'utf8');
const lines = text.split('\n');
const ast = espree.parse(text, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
const modScope = sm.scopes.find((s) => s.type === 'module');
const iife = sm.scopes.find(
  (s) => s.type === 'function' && s.block.type === 'FunctionExpression' && s.upper && s.upper.type === 'module',
);
const body = iife.block.body.body;
const N = body.length;
const sl = body.map((n) => n.loc.start.line);
const el = body.map((n) => n.loc.end.line);
const stmtOf = (pos) => body.findIndex((n) => n.range[0] <= pos && pos < n.range[1]);

/* definicoes e usos por instrucao */
const defStmt = new Map();
for (const v of iife.variables) {
  if (v.name === 'arguments' || !v.defs.length) continue;
  defStmt.set(v.name, stmtOf(v.defs[0].node.range[0]));
}
const uses = body.map(() => new Set()); // nomes do IIFE usados pela instrucao
const impUses = body.map(() => new Set()); // nomes de import (escopo do modulo) usados
const writers = new Map(); // nome -> Set(instrucao) que o reatribuem
for (const sc of sm.scopes) {
  for (const r of sc.references) {
    const v = r.resolved;
    if (!v) continue;
    const st = stmtOf(r.identifier.range[0]);
    if (st < 0) continue;
    if (v.scope === iife && defStmt.has(v.name)) {
      if (defStmt.get(v.name) !== st) uses[st].add(v.name);
      if (r.isWrite() && !r.init) {
        if (!writers.has(v.name)) writers.set(v.name, new Set());
        writers.get(v.name).add(st);
      }
    } else if (v.scope === modScope) impUses[st].add(v.name);
  }
}

/* `return` no topo do IIFE (fora de funcoes) */
const topReturns = [];
(function walk(n, inFn) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'ReturnStatement' && !inFn) topReturns.push(stmtOf(n.range[0]));
  const fn = inFn || /Function/.test(n.type);
  for (const k of Object.keys(n)) {
    const c = n[k];
    if (Array.isArray(c)) c.forEach((x) => walk(x, fn));
    else if (c && typeof c === 'object') walk(c, fn);
  }
})({ type: 'Block', body }, false);

/* imports originais do main.js */
const importDecls = ast.body.filter((n) => n.type === 'ImportDeclaration');
const impBinding = new Map(); // nome local -> { source, kind, imported }
for (const d of importDecls) {
  for (const s of d.specifiers) {
    impBinding.set(s.local.name, {
      source: d.source.value,
      kind: s.type === 'ImportNamespaceSpecifier' ? 'ns' : s.type === 'ImportDefaultSpecifier' ? 'def' : 'named',
      imported: s.imported ? s.imported.name : null,
    });
  }
}

/* atribuicao de instrucoes a modulos */
const modOf = new Array(N).fill(-1);
const byName = new Set();
manifest.modules.forEach((m, mi) => {
  for (const nm of m.names || []) {
    const d = defStmt.get(nm);
    if (d === undefined) fail('nome nao encontrado: ' + nm);
    if (modOf[d] !== -1 && modOf[d] !== mi) fail('instrucao de ' + nm + ' ja pertence a outro modulo');
    modOf[d] = mi;
    byName.add(d);
  }
});
manifest.modules.forEach((m, mi) => {
  if (!m.lines) return;
  for (let k = 0; k < N; k++) if (sl[k] >= m.lines[0] && sl[k] <= m.lines[1] && modOf[k] === -1) modOf[k] = mi;
});
manifest.modules.forEach((m, mi) => {
  if (!modOf.includes(mi)) fail('modulo vazio: ' + m.file);
});

/* prefixo: tudo que sobra no main.js vem depois do ultimo trecho movido (salvo as puxadas por nome) */
let lastMoved = -1;
for (let k = 0; k < N; k++) if (modOf[k] !== -1 && !byName.has(k)) lastMoved = k;
for (let k = 0; k < lastMoved; k++) {
  if (modOf[k] === -1 && !byName.has(k) && sl[k] > 0) {
    const allow = (manifest.stay || []).some((r) => sl[k] >= r[0] && sl[k] <= r[1]);
    if (!allow) fail('instrucao que fica no main.js antes de trecho movido (linha ' + sl[k] + '): quebra a ordem de execucao');
  }
}
modOf.forEach((mi, k) => {
  if (mi !== -1 && topReturns.includes(k)) fail('return no topo na instrucao da linha ' + sl[k] + ': trate a mao');
});

/* dono de cada linha: proprias linhas; comentarios/linhas vazias entre instrucoes vao para a proxima
   instrucao que nao foi puxada por nome */
const owner = new Array(lines.length + 2).fill(-1);
{
  let pending = [];
  let prevEnd = iife.block.body.loc.start.line;
  for (let k = 0; k < N; k++) {
    for (let L = prevEnd + 1; L < sl[k]; L++) pending.push(L);
    for (let L = sl[k]; L <= el[k]; L++) owner[L] = k;
    if (!byName.has(k)) {
      pending.forEach((L) => (owner[L] = k));
      pending = [];
    }
    prevEnd = el[k];
  }
}

/* usos cruzados */
const stmtMod = (k) => modOf[k]; // -1 = fica no main.js
const modNeeds = manifest.modules.map(() => ({ cross: new Map(), imp: new Set() }));
const mainNeeds = new Map(); // nome -> modulo definidor
const mainImp = new Set();
const exportsOf = manifest.modules.map(() => new Set());
for (let k = 0; k < N; k++) {
  const mk = stmtMod(k);
  for (const nm of uses[k]) {
    const d = defStmt.get(nm);
    const md = stmtMod(d);
    if (md === mk) continue;
    if (md === -1) {
      if (mk === -1) continue;
      fail('modulo ' + manifest.modules[mk].file + ' usa ' + nm + ', que fica no main.js (linha ' + sl[d] + ')');
    }
    exportsOf[md].add(nm);
    if (mk === -1) mainNeeds.set(nm, md);
    else {
      if (md > mk && !manifest.allowForward) fail(manifest.modules[mk].file + ' usa ' + nm + ' de modulo posterior ' + manifest.modules[md].file);
      modNeeds[mk].cross.set(nm, md);
    }
    const w = writers.get(nm);
    if (w) for (const ws of w) if (stmtMod(ws) !== md) fail('nome ' + nm + ' reatribuido fora do modulo que o define (linha ' + sl[ws] + ')');
  }
  for (const nm of impUses[k]) (mk === -1 ? mainImp : modNeeds[mk].imp).add(nm);
}

/* texto de cada modulo */
const relImport = (fromFile, targetFile) => {
  let r = path.relative(path.dirname(path.resolve(fromFile)), path.resolve(targetFile)).replace(/\\/g, '/');
  if (!r.startsWith('.')) r = './' + r;
  return r;
};
const importLines = (fromFile, names, crossMap) => {
  const bySource = new Map();
  const add = (src, spec) => {
    if (!bySource.has(src)) bySource.set(src, { named: [], ns: null, def: null });
    const e = bySource.get(src);
    if (spec.kind === 'ns') e.ns = spec.local;
    else if (spec.kind === 'def') e.def = spec.local;
    else e.named.push(spec.imported === spec.local ? spec.local : spec.imported + ' as ' + spec.local);
  };
  const wanted = new Set(names);
  for (const nm of [...impBinding.keys()].filter((n) => wanted.has(n))) {
    const b = impBinding.get(nm);
    const src = b.source.startsWith('.') ? relImport(fromFile, path.join(SRC, b.source)) : b.source;
    add(src, { ...b, local: nm });
  }
  for (const [nm, md] of crossMap) add(relImport(fromFile, manifest.modules[md].file), { kind: 'named', local: nm, imported: nm });
  const out = [];
  for (const [src, e] of bySource) {
    const parts = [];
    if (e.def) parts.push(e.def);
    if (e.ns) parts.push('* as ' + e.ns);
    if (e.named.length) parts.push('{ ' + e.named.join(', ') + ' }');
    out.push('import ' + parts.join(', ') + " from '" + src + "';");
  }
  return out;
};

const results = [];
manifest.modules.forEach((m, mi) => {
  const ls = [];
  for (let L = 1; L <= lines.length; L++) if (owner[L] !== -1 && modOf[owner[L]] === mi) ls.push(L);
  const out = ls.map((L) => lines[L - 1]);
  // export nas declaracoes que outro modulo/main usa
  const need = new Set(exportsOf[mi]);
  for (let k = 0; k < N; k++) {
    if (modOf[k] !== mi) continue;
    const names = [...defStmt].filter(([, d]) => d === k).map(([n]) => n);
    if (names.some((n) => need.has(n))) {
      const idx = ls.indexOf(sl[k]);
      const col = body[k].loc.start.column;
      out[idx] = out[idx].slice(0, col) + 'export ' + out[idx].slice(col);
    }
  }
  const code = out.map((l) => (l.startsWith('  ') ? l.slice(2) : l)).join('\n');
  const head = '/* ' + m.header + ' */\n';
  const imps = importLines(m.file, [...modNeeds[mi].imp], modNeeds[mi].cross);
  results.push({ file: m.file, text: head + imps.join('\n') + (imps.length ? '\n\n' : '\n') + code.replace(/^\n+/, '') + '\n', lines: ls.length, exports: [...need], imports: imps.length });
});

/* main.js: tira as linhas movidas e refaz os imports */
const first = importDecls[0].range[0];
const lastImp = importDecls[importDecls.length - 1].range[1];
const keepImp = new Map(); // fonte -> especificadores usados (na ordem original)
const pure = (s) => /^\.\/(world|app|ui)\//.test(s);
for (const d of importDecls) {
  const used = d.specifiers.filter((s) => mainImp.has(s.local.name));
  const srcv = d.source.value;
  if (!used.length && !pure(srcv)) continue;
  const e = keepImp.get(srcv) || { named: [], ns: null, def: null, order: keepImp.size };
  for (const s of used) {
    if (s.type === 'ImportNamespaceSpecifier') e.ns = s.local.name;
    else if (s.type === 'ImportDefaultSpecifier') e.def = s.local.name;
    else e.named.push(s.imported.name === s.local.name ? s.local.name : s.imported.name + ' as ' + s.local.name);
  }
  keepImp.set(srcv, e);
}
const mainImports = [];
const emit = (src, e) => {
  const parts = [];
  if (e.def) parts.push(e.def);
  if (e.ns) parts.push('* as ' + e.ns);
  if (e.named.length) parts.push('{ ' + e.named.join(', ') + ' }');
  mainImports.push(parts.length ? 'import ' + parts.join(', ') + " from '" + src + "';" : "import '" + src + "';");
};
for (const [src, e] of keepImp) emit(src, e);
manifest.modules.forEach((m, mi) => {
  const src = relImport(MAIN, m.file);
  const named = [...mainNeeds].filter(([, d]) => d === mi).map(([n]) => n);
  const e = keepImp.get(src) || { named: [], ns: null, def: null };
  if (keepImp.has(src)) return; // ja importado antes
  emit(src, { ...e, named });
});
const moved = new Set();
for (let L = 1; L <= lines.length; L++) if (owner[L] !== -1 && modOf[owner[L]] !== -1) moved.add(L);
const before = text.slice(0, first);
const afterImports = text.slice(lastImp);
const restLines = afterImports.split('\n');
const baseLine = ast.body.find((n) => n.type === 'ImportDeclaration').loc.end.line; // referencia
const lastImpLine = importDecls[importDecls.length - 1].loc.end.line;
const kept = [];
for (let L = lastImpLine + 1; L <= lines.length; L++) if (!moved.has(L)) kept.push(lines[L - 1]);
void restLines;
void baseLine;
const mainText = before + mainImports.join('\n') + '\n' + kept.join('\n');

console.log('modulos:');
results.forEach((r) =>
  console.log(`  ${r.file}: ${r.lines} linhas movidas, ${r.imports} imports, exports: ${r.exports.join(', ') || '-'}`),
);
console.log(`main.js: ${lines.length} -> ${mainText.split('\n').length} linhas; importa de modulos: ${[...mainNeeds.keys()].join(', ') || '-'}`);
if (dry) process.exit(0);
for (const r of results) {
  fs.mkdirSync(path.dirname(r.file), { recursive: true });
  fs.writeFileSync(r.file, r.text);
}
fs.writeFileSync(MAIN, mainText);
execFileSync('npx', ['prettier', '--write', MAIN, ...results.map((r) => r.file)], { stdio: 'inherit' });
