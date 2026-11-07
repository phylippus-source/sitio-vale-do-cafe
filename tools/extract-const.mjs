// Move declaracoes const do escopo da IIFE para modulos ES, verificando igualdade profunda do valor.
// Uso: node tools/extract-const.mjs <manifesto.json>
//   manifesto: { "src/data/x.js": { "header": "...", "names": ["A","B"] }, ... }
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { pathToFileURL } from 'node:url';
import * as espree from 'espree';
import * as escope from 'eslint-scope';

const MAIN = 'src/main.js';
const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let src = fs.readFileSync(MAIN, 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
const iife = sm.scopes.find((s) => s.type === 'function' && s.upper && s.upper.type === 'module');

const found = {}; // nome -> { declarator, declaration, text }
for (const spec of Object.values(manifest)) {
  for (const name of spec.names) {
    const v = iife.set.get(name);
    if (!v) throw new Error('nao achei ' + name);
    const declarator = v.defs[0].node;
    const declaration = v.defs[0].parent;
    if (declaration.kind !== 'const') throw new Error(name + ' nao e const');
    const free = [];
    for (const sc of sm.scopes) for (const r of sc.references) {
      if (r.identifier.range[0] >= declarator.range[0] && r.identifier.range[1] <= declarator.range[1] && r.resolved && r.resolved.scope === iife) free.push(r.identifier.name);
    }
    const own = free.filter((n) => n !== name);
    if (own.length) throw new Error(name + ' depende de ' + own.join(','));
    found[name] = { declarator, declaration, init: src.slice(declarator.init.range[0], declarator.init.range[1]) };
  }
}

// 1) escreve modulos
const evalOld = (init) => new Function('Math', 'return (' + init + ')')(Math);
for (const [file, spec] of Object.entries(manifest)) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = spec.names.map((n) => 'export const ' + n + ' = ' + found[n].init + ';\n').join('\n');
  fs.writeFileSync(file, '/* ' + spec.header + ' */\n\n' + body);
}

// 2) remove de main.js (de tras para frente)
const cuts = [];
for (const name of Object.keys(found)) {
  const { declarator, declaration } = found[name];
  if (declaration.declarations.length === 1) {
    let a = declaration.range[0];
    a = src.lastIndexOf('\n', a - 1) + 1; // inicio da linha
    let b = declaration.range[1];
    if (src[b] === '\n') b++;
    cuts.push([a, b]);
  } else {
    const i = declaration.declarations.indexOf(declarator);
    const last = i === declaration.declarations.length - 1;
    if (last) cuts.push([declaration.declarations[i - 1].range[1], declarator.range[1]]);
    else cuts.push([declarator.range[0], declaration.declarations[i + 1].range[0]]);
  }
}
cuts.sort((x, y) => y[0] - x[0]);
for (const [a, b] of cuts) src = src.slice(0, a) + src.slice(b);

// 3) imports
const imports = Object.entries(manifest).map(([file, spec]) => "import { " + spec.names.join(', ') + " } from './" + path.relative('src', file).replace(/\\/g, '/') + "';");
src = src.replace("import * as THREE from 'three';\n", "import * as THREE from 'three';\n" + imports.join('\n') + '\n');
fs.writeFileSync(MAIN, src);

// 4) verificacao: valor novo == valor antigo
for (const [file, spec] of Object.entries(manifest)) {
  const mod = await import(pathToFileURL(path.resolve(file)).href + '?t=' + Date.now());
  for (const n of spec.names) { assert.deepStrictEqual(mod[n], evalOld(found[n].init), n); }
}
console.log('OK: ' + Object.keys(found).length + ' constantes movidas e verificadas (deepEqual).');
