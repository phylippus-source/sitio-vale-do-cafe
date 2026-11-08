import fs from 'node:fs';
import * as espree from 'espree';
const src = fs.readFileSync('src/main.js', 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const names = new Set(['bb', 'cb', 'cn', 'ic', 'beam', 'at', 'add']);
const stat = {}; const odd = []; const addRecv = {};
(function walk(n, parent) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'MemberExpression' && !n.computed && names.has(n.property.name)) {
    const isCallee = parent && parent.type === 'CallExpression' && parent.callee === n;
    const nm = n.property.name;
    stat[nm] = (stat[nm] || 0) + 1;
    if (!isCallee) odd.push(nm + ' linha ' + n.loc.start.line + ' (nao e chamada)');
    else if (nm === 'add') {
      const k = parent.arguments.length;
      const recv = src.slice(n.object.range[0], n.object.range[1]).slice(0, 25);
      const key = k + ' args';
      (addRecv[key] ||= {})[recv] = (addRecv[key][recv] || 0) + 1;
    }
  }
  for (const k of Object.keys(n)) { const v = n[k]; if (Array.isArray(v)) v.forEach((c) => walk(c, n)); else if (v && typeof v.type === 'string') walk(v, n); }
})(ast, null);
console.log(stat); console.log('NAO-CHAMADAS:', odd);
for (const [k, v] of Object.entries(addRecv)) console.log(k, JSON.stringify(v).slice(0, 600));
