import fs from 'node:fs';
import * as espree from 'espree';
import * as escope from 'eslint-scope';
const src = fs.readFileSync('src/main.js', 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
const names = process.argv.slice(2);
const iife = sm.scopes.find((s) => s.type === 'function' && s.block.type === 'FunctionExpression' && s.upper && s.upper.type === 'module');
for (const n of names) {
  const v = iife.set.get(n);
  if (!v) { console.log(n, 'NAO ENCONTRADO'); continue; }
  const def = v.defs[0];
  const decl = def.node; // VariableDeclarator
  const [a, b] = decl.range;
  const refs = new Set();
  for (const sc of sm.scopes) for (const r of sc.references) {
    if (r.identifier.range[0] >= a && r.identifier.range[1] <= b && r.resolved && r.resolved.scope === iife && r.resolved !== v) refs.add(r.identifier.name);
  }
  const globals = new Set();
  for (const sc of sm.scopes) for (const r of sc.references) if (r.identifier.range[0] >= a && r.identifier.range[1] <= b && !r.resolved) globals.add(r.identifier.name);
  console.log(n.padEnd(8), 'linhas', decl.loc.start.line + '-' + decl.loc.end.line, 'refs-IIFE:', [...refs].join(',') || '-', '| globais:', [...globals].join(',') || '-', '| usos:', v.references.filter((r) => !(r.identifier.range[0] >= a && r.identifier.range[1] <= b)).length);
}
