// Transforma contadores soltos (`let i;` ... `for (i = 0; ...)`) em variaveis do proprio laco
// (`for (let i = 0; ...)`), quando toda referencia ao nome esta dentro de lacos que o inicializam.
// Isso tira o estado mutavel compartilhado entre trechos e permite cortar o arquivo em modulos.
// Uso: node tools/localize-counters.mjs arquivo.js [--dry]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import * as espree from 'espree';
import * as escope from 'eslint-scope';
import * as estraverse from 'estraverse';

const file = process.argv[2];
const dry = process.argv.includes('--dry');
const text = fs.readFileSync(file, 'utf8');
const ast = espree.parse(text, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });

const loops = [];
estraverse.traverse(ast, {
  enter(n) {
    if (/^(ForStatement|ForInStatement|ForOfStatement)$/.test(n.type)) loops.push(n);
  },
  fallback: 'iteration',
});
const within = (n, outer) => n.range[0] >= outer.range[0] && n.range[1] <= outer.range[1];
/* nomes atribuidos diretamente no init do laco (null se o init mistura outra coisa) */
function initTargets(L) {
  if (L.type !== 'ForStatement') return L.left.type === 'Identifier' ? [L.left] : null;
  const e = L.init;
  if (!e) return null;
  const list = e.type === 'SequenceExpression' ? e.expressions : [e];
  const out = [];
  for (const x of list) {
    if (x.type === 'AssignmentExpression' && x.operator === '=' && x.left.type === 'Identifier') out.push(x.left);
    else return null;
  }
  return out;
}

const cands = new Map(); // Variable -> { loops: [...] }
for (const sc of sm.scopes) {
  for (const v of sc.variables) {
    if (v.defs.length !== 1 || v.defs[0].type !== 'Variable') continue;
    const d = v.defs[0];
    if (d.parent.kind !== 'let' || d.node.init) continue;
    if (d.parent.parent && /^Export/.test(d.parent.parent.type)) continue;
    const refs = v.references.filter((r) => !r.init);
    if (!refs.length) continue;
    const ownLoops = new Set();
    let ok = true;
    for (const r of refs) {
      const encl = loops.filter((L) => within(r.identifier, L) && (initTargets(L) || []).some((t) => t.name === v.name));
      if (!encl.length) {
        ok = false;
        break;
      }
      encl.forEach((L) => ownLoops.add(L));
    }
    if (!ok) continue;
    // lacos aninhados que inicializam o mesmo nome: nao da para isolar
    const arr = [...ownLoops];
    if (arr.some((a) => arr.some((b) => a !== b && within(a, b)))) continue;
    // o init de cada laco precisa ser a primeira referencia dentro dele (sempre e)
    cands.set(v, { loops: arr });
  }
}
/* ponto fixo: laco cujo init mistura variavel candidata e nao candidata nao pode ser convertido */
let changed = true;
while (changed) {
  changed = false;
  for (const [v, c] of [...cands]) {
    for (const L of c.loops) {
      const t = initTargets(L);
      const allCand = t.every((id) => [...cands.keys()].some((x) => x.name === id.name && x.references.some((r) => r.identifier === id)));
      if (!allCand) {
        cands.delete(v);
        changed = true;
        break;
      }
    }
  }
}

const edits = []; // { pos, ins } | { from, to, repl }
const loopDone = new Set();
for (const [v, c] of cands) {
  for (const L of c.loops) {
    if (loopDone.has(L)) continue;
    loopDone.add(L);
    if (L.type === 'ForStatement') {
      edits.push({ from: L.init.range[0], to: L.init.range[0], repl: 'let ' });
    } else {
      // for-in/of: const quando o corpo nao reatribui
      const reassigned = v.references.some((r) => !r.init && r.isWrite() && within(r.identifier, L.body));
      edits.push({ from: L.left.range[0], to: L.left.range[0], repl: reassigned ? 'let ' : 'const ' });
    }
  }
  // remove o declarador `i` da declaracao `let i, j;`
  const decl = v.defs[0].parent;
  const d = v.defs[0].node;
  const mine = decl.declarations.filter((x) => [...cands.keys()].some((k) => k.defs[0].node === x));
  if (mine.length === decl.declarations.length) {
    if (!edits.some((e) => e.from === decl.range[0] && e.to === decl.range[1])) {
      // leva junto a quebra de linha que segue
      let end = decl.range[1];
      while (text[end] === ' ') end++;
      if (text[end] === '\n') end++;
      edits.push({ from: decl.range[0], to: end, repl: '' });
    }
  } else {
    const idx = decl.declarations.indexOf(d);
    const left = idx > 0 ? decl.declarations[idx - 1].range[1] : d.range[0];
    const right = idx > 0 ? d.range[1] : decl.declarations[idx + 1].range[0];
    edits.push({ from: left, to: right, repl: '' });
  }
}
edits.sort((a, b) => b.from - a.from);
let out = text;
for (const e of edits) out = out.slice(0, e.from) + e.repl + out.slice(e.to);
const names = [...cands.keys()].map((v) => v.name);
const skipped = [];
for (const sc of sm.scopes)
  for (const v of sc.variables)
    if (v.defs.length === 1 && v.defs[0].type === 'Variable' && v.defs[0].parent.kind === 'let' && !v.defs[0].node.init && !cands.has(v) && v.references.some((r) => !r.init && r.isWrite()))
      skipped.push(v.name + '@' + v.defs[0].node.loc.start.line);
console.log(`${cands.size} contadores isolados em lacos: ${names.join(' ')}`);
if (skipped.length) console.log('mantidos (uso fora de laco ou misto): ' + skipped.join(' '));
if (dry) process.exit(0);
espree.parse(out, { ecmaVersion: 2022, sourceType: 'module' });
fs.writeFileSync(file, out);
execFileSync('npx', ['prettier', '--write', file], { stdio: 'ignore' });
