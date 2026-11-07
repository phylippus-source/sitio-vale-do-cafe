// Divide `let a = 1, b, c = 3;` em uma declaracao por linha (permite prefer-const agir).
import fs from 'node:fs';
import * as espree from 'espree';

const file = process.argv[2];
let src = fs.readFileSync(file, 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, comment: true });
const targets = [];
(function walk(node, parent) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'VariableDeclaration' && node.kind === 'let' && node.declarations.length > 1 &&
      !(parent && /^For(In|Of)?Statement$/.test(parent.type))) targets.push(node);
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => walk(c, node));
    else if (v && typeof v.type === 'string') walk(v, node);
  }
})(ast, null);
const comments = ast.comments;
let n = 0;
for (const node of targets.sort((a, b) => b.range[0] - a.range[0])) {
  const [s, e] = node.range;
  const inner = comments.filter((c) => c.range[0] > s && c.range[1] < e);
  if (inner.length) continue; // nao arriscar perder comentario
  const lineStart = src.lastIndexOf('\n', s) + 1;
  const indent = src.slice(lineStart, s).match(/^\s*/)[0];
  const parts = node.declarations.map((d) => 'let ' + src.slice(d.range[0], d.range[1]) + ';');
  src = src.slice(0, s) + parts.join('\n' + indent) + src.slice(e);
  n++;
}
fs.writeFileSync(file, src);
console.log('declaracoes divididas:', n, 'de', targets.length);
