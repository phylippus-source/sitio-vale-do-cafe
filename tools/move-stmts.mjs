// Move instrucoes de nivel superior da IIFE (funcoes/const/let) para modulos ES, por nome.
// manifesto: { "src/core/x.js": { header, imports: "...", items: [ {name, export} ... ] } }
// Statements com varios declaradores sao movidos inteiros (qualquer nome dentro dele serve).
import fs from 'node:fs';
import path from 'node:path';
import * as espree from 'espree';

const MAIN = 'src/main.js';
const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let src = fs.readFileSync(MAIN, 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true });
const stmt = ast.body.find((n) => n.type === 'ExpressionStatement');
const body = stmt.expression.callee.body.body;

function declaredNames(n) {
  if (n.type === 'FunctionDeclaration') return [n.id.name];
  if (n.type === 'VariableDeclaration') return n.declarations.map((d) => d.id.name);
  return [];
}
const cuts = [];
for (const [file, spec] of Object.entries(manifest)) {
  const parts = [];
  for (const it of spec.items) {
    const node = body.find((n) => declaredNames(n).includes(it.name));
    if (!node) throw new Error('nao achei ' + it.name);
    if (cuts.some((c) => c.node === node)) { continue; }
    let text = src.slice(node.range[0], node.range[1]);
    const exportNames = spec.items.filter((x) => x.export && declaredNames(node).includes(x.name)).map((x) => x.name);
    if (it.export) {
      if (node.type === 'FunctionDeclaration') text = 'export ' + text;
      else if (node.declarations.length === 1) text = 'export ' + text;
      else text = text + '\nexport { ' + exportNames.join(', ') + ' };';
    }
    // comentario de bloco imediatamente anterior (linha anterior) acompanha, se existir
    parts.push(text);
    const lineStart = src.lastIndexOf('\n', node.range[0] - 1) + 1;
    let a = lineStart, b = node.range[1];
    if (src[b] === '\n') b++;
    cuts.push({ node, a, b });
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '/* ' + spec.header + ' */\n' + (spec.imports ? spec.imports + '\n' : '') + '\n' + parts.join('\n\n') + '\n');
}
cuts.sort((x, y) => y.a - x.a);
for (const c of cuts) src = src.slice(0, c.a) + src.slice(c.b);
const imps = Object.entries(manifest).map(([file, spec]) => {
  const names = spec.items.filter((i) => i.export).map((i) => i.name);
  return names.length ? "import { " + names.join(', ') + " } from './" + path.relative('src', file).replace(/\\/g, '/') + "';" : '';
}).filter(Boolean);
src = src.replace("import * as THREE from 'three';\n", "import * as THREE from 'three';\n" + imps.join('\n') + '\n');
fs.writeFileSync(MAIN, src);
console.log('movidos:', cuts.length, 'statements para', Object.keys(manifest).length, 'modulos');
