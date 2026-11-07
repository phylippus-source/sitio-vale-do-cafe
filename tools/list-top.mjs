import fs from 'node:fs';
import * as espree from 'espree';
const src = fs.readFileSync(process.argv[2] || 'src/main.js', 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const iife = ast.body.find((n) => n.type === 'ExpressionStatement').expression.callee ? ast.body.find((n) => n.type === 'ExpressionStatement').expression.callee.body : null;
const from = +process.argv[3] || 0, to = +process.argv[4] || 1e9;
for (const n of iife.body) {
  const l = n.loc.start.line, e = n.loc.end.line;
  if (l < from || l > to) continue;
  let d = n.type;
  if (n.type === 'FunctionDeclaration') d = 'fn ' + n.id.name;
  else if (n.type === 'VariableDeclaration') d = n.kind + ' ' + n.declarations.map((x) => x.id.name || '{}').join(',');
  else if (n.type === 'ExpressionStatement') d = 'expr ' + src.slice(n.range[0], n.range[0] + 50).replace(/\n/g, ' ');
  console.log(String(l).padStart(5) + '-' + String(e).padEnd(5) + ' ' + d.slice(0, 90));
}
