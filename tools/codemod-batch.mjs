// Renomeia metodos do Batch nos pontos de chamada e remove a definicao antiga de main.js.
import fs from 'node:fs';
import * as espree from 'espree';
let src = fs.readFileSync('src/main.js', 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true });
const map = { bb: 'addBox', cb: 'addCylinder', cn: 'addCone', ic: 'addSphere', beam: 'addBeam' };
const edits = [];
(function walk(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && !n.callee.computed) {
    const nm = n.callee.property.name; const k = n.arguments.length;
    let to = map[nm];
    if (nm === 'at' && k >= 3) to = 'setOrigin';
    if (nm === 'add' && k >= 5) to = 'addGeometry';
    if (to) edits.push([n.callee.property.range, to]);
  }
  for (const key of Object.keys(n)) { const v = n[key]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); }
})(ast);
// aplica de tras para frente; so fora da definicao antiga (Batch.prototype...), que e removida abaixo
const defA = src.indexOf('  /* ---------- Batch:');
const defB = src.indexOf('  /* paleta chapada */');
if (defA < 0 || defB < 0) throw new Error('marcadores nao encontrados');
let n = 0;
for (const [r, to] of edits.sort((a, b) => b[0][0] - a[0][0])) {
  if (r[0] >= defA && r[0] < defB) continue;
  src = src.slice(0, r[0]) + to + src.slice(r[1]); n++;
}
const a2 = src.indexOf('  /* ---------- Batch:'); const b2 = src.indexOf('  /* paleta chapada */');
src = src.slice(0, a2) + src.slice(b2);
src = src.replace("import { GX, cylG, coneG, ni } from './core/geometries.js';\n", "import { GX, cylG, coneG } from './core/geometries.js';\nimport { Batch } from './core/Batch.js';\n");
fs.writeFileSync('src/main.js', src);
console.log('chamadas renomeadas:', n);
