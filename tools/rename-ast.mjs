// Renomeia identificadores por AST, respeitando escopo (eslint-scope). Uso:
//   node tools/rename-ast.mjs tools/names-a1.json <lote> [--write]
// Sem --write so mostra o plano. Para se um nome for ambiguo ou o novo nome colidir.
import fs from 'node:fs';
import * as espree from 'espree';
import * as escope from 'eslint-scope';
import * as estraverse from 'estraverse';

const [mapFile, lot] = process.argv.slice(2);
const write = process.argv.includes('--write');
const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
const entries = map.lots[lot];
if (!entries) throw new Error('lote desconhecido: ' + lot);
const file = map.file;
let src = fs.readFileSync(file, 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true, comment: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });

const parents = new WeakMap();
estraverse.traverse(ast, { enter(n, p) { parents.set(n, p); }, keys: { Property: ['key', 'value'] }, fallback: 'iteration' });

const depthOf = (sc) => { let d = 0; for (let p = sc.upper; p; p = p.upper) d++; return d; };
const kindOf = (v) => {
  const d = v.defs[0];
  return d.type === 'FunctionName' || (d.type === 'Variable' && d.node.init && /Function/.test(d.node.init.type)) ? 'function' : 'variable';
};
const allVars = sm.scopes.flatMap((sc) => sc.variables.map((v) => ({ v, sc, depth: depthOf(sc) }))).filter((x) => x.v.defs.length);
const globalNames = new Set(sm.globalScope.through.map((r) => r.identifier.name));

const edits = [];
const problems = [];
for (const e of entries) {
  const hits = allVars.filter((x) => x.v.name === e.old && (e.depth === undefined || x.depth === e.depth) && (!e.kind || kindOf(x.v) === e.kind));
  if (hits.length !== 1) { problems.push(`${e.old}: ${hits.length} declaracoes candidatas (${hits.map((h) => 'p' + h.depth + '@' + h.v.defs[0].name.loc.start.line + ':' + kindOf(h.v)).join(', ')}) - refine com depth/kind`); continue; }
  const { v, sc } = hits[0];
  const ids = new Map();
  v.identifiers.forEach((i) => ids.set(i.range[0], i));
  v.references.forEach((r) => ids.set(r.identifier.range[0], r.identifier));
  // colisao: o novo nome nao pode existir em nenhum escopo da cadeia de onde o nome e usado
  const scopes = new Set([sc]);
  v.references.forEach((r) => scopes.add(r.from));
  for (const s0 of scopes) for (let s = s0; s; s = s.upper) {
    const other = s.set.get(e.new);
    if (other && other !== v) problems.push(`${e.old} -> ${e.new}: colide com declaracao existente no escopo ${s.type}`);
  }
  if (globalNames.has(e.new)) problems.push(`${e.old} -> ${e.new}: colide com global usado no arquivo`);
  let shorthand = 0;
  for (const id of ids.values()) {
    const p = parents.get(id);
    if (p && p.type === 'Property' && p.shorthand) { shorthand++; problems.push(`${e.old}: uso em propriedade abreviada (linha ${id.loc.start.line}); tratar a mao`); continue; }
    edits.push({ at: id.range, to: e.new });
  }
  console.log(`${e.old.padEnd(8)} -> ${e.new.padEnd(24)} ${String(ids.size).padStart(4)} ocorrencias (p${hits[0].depth}, ${kindOf(v)}, linha ${v.defs[0].name.loc.start.line})`);
}
if (problems.length) { console.error('\nPROBLEMAS:\n' + problems.map((p) => ' - ' + p).join('\n')); process.exit(1); }
// duplicadas (mesmo trecho) nao devem existir
const seen = new Set();
for (const ed of edits) { if (seen.has(ed.at[0])) throw new Error('edicao duplicada em ' + ed.at[0]); seen.add(ed.at[0]); }
if (!write) { console.log(`\nplano ok: ${edits.length} trocas (use --write para aplicar)`); process.exit(0); }
for (const ed of edits.sort((a, b) => b.at[0] - a.at[0])) src = src.slice(0, ed.at[0]) + ed.to + src.slice(ed.at[1]);
fs.writeFileSync(file, src);
console.log(`\naplicado: ${edits.length} trocas em ${file}`);
