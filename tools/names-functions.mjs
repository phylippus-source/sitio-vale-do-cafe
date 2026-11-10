// Lista funcoes declaradas (declaracao ou const f = function/arrow) com escopo e usos.
import fs from 'node:fs';
import * as espree from 'espree';
import * as escope from 'eslint-scope';
const file = process.argv[2] || 'src/main.js';
const src = fs.readFileSync(file, 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
const out = [];
for (const sc of sm.scopes) {
  let depth = 0; for (let p = sc.upper; p; p = p.upper) depth++;
  for (const v of sc.variables) {
    const d = v.defs[0]; if (!d) continue;
    const isFn = d.type === 'FunctionName' || (d.type === 'Variable' && d.node.init && /Function/.test(d.node.init.type));
    if (!isFn) continue;
    const fn = d.type === 'FunctionName' ? d.node : d.node.init;
    out.push({ line: d.name.loc.start.line, depth, name: v.name, refs: v.references.length, params: fn.params.map((p) => src.slice(p.range[0], p.range[1])).join(', ') });
  }
}
out.sort((a, b) => a.line - b.line).forEach((o) => console.log(String(o.line).padStart(5), 'p' + o.depth, o.name.padEnd(16), String(o.refs).padStart(3), '(' + o.params.slice(0, 60) + ')'));
