// Inventario de identificadores declarados em src/main.js (por escopo): nome, tipo, linha, usos.
import fs from 'node:fs';
import * as espree from 'espree';
import * as escope from 'eslint-scope';
const file = process.argv[2] || 'src/main.js';
const src = fs.readFileSync(file, 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
const rows = [];
for (const sc of sm.scopes) {
  let depth = 0; for (let p = sc.upper; p; p = p.upper) depth++;
  for (const v of sc.variables) {
    if (v.name === 'arguments' || !v.defs.length) continue;
    const d = v.defs[0];
    rows.push({ name: v.name, type: d.type, depth, scope: sc.type, line: d.name.loc.start.line, refs: v.references.length, defs: v.defs.length });
  }
}
const mode = process.argv[3] || 'top';
if (mode === 'decl') { } else
if (mode === 'top') {
  // escopo do IIFE principal = profundidade 3 (global > module > function)? imprime por profundidade
  const byDepth = {}; rows.forEach((r) => (byDepth[r.depth] = (byDepth[r.depth] || 0) + 1));
  console.error('por profundidade:', JSON.stringify(byDepth));
  const d = +process.argv[4] || 2;
  rows.filter((r) => r.depth === d).sort((a, b) => a.line - b.line).forEach((r) => console.log(String(r.line).padStart(5), r.name.padEnd(22), r.type.padEnd(13), 'usos', String(r.refs).padStart(4)));
} else {
  // todos os nomes curtos/cripticos por frequencia
  const cnt = {}; rows.forEach((r) => { (cnt[r.name] = cnt[r.name] || { n: 0, refs: 0, depths: new Set() }); cnt[r.name].n++; cnt[r.name].refs += r.refs; cnt[r.name].depths.add(r.depth); });
  Object.entries(cnt).sort((a, b) => b[1].refs - a[1].refs).forEach(([k, v]) => console.log(k.padEnd(20), 'decl', String(v.n).padStart(3), 'usos', String(v.refs).padStart(5), 'prof', [...v.depths].join(',')));
}

if (process.argv[3] === 'decl') {
  // node tools/names-inventory.mjs src/main.js decl <profMax> <regex>
  const maxD = +process.argv[4] || 3, re = new RegExp(process.argv[5] || '.');
  for (const sc of sm.scopes) {
    let depth = 0; for (let p = sc.upper; p; p = p.upper) depth++;
    if (depth > maxD) continue;
    for (const v of sc.variables) {
      if (!v.defs.length || !re.test(v.name)) continue;
      const d = v.defs[0];
      let init = '';
      if (d.type === 'Variable' && d.node.init) init = src.slice(d.node.init.range[0], Math.min(d.node.init.range[1], d.node.init.range[0] + 70)).replace(/\s+/g, ' ');
      else if (d.type === 'FunctionName') init = 'function(' + d.node.params.map((p) => src.slice(p.range[0], p.range[1])).join(', ') + ')';
      console.log(String(d.name.loc.start.line).padStart(5), 'p' + depth, v.name.padEnd(8), 'usos', String(v.references.length).padStart(4), ' =', init);
    }
  }
}
