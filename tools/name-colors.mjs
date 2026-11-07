// Troca literais 0xRRGGBB por PAL.grupo.nome (mapa em tools/color-names.json) e gera PAL em palette.js.
import fs from 'node:fs';
import * as espree from 'espree';

const map = JSON.parse(fs.readFileSync('tools/color-names.json', 'utf8'));
const MAIN = 'src/main.js';
const PALETTE = 'src/config/palette.js';
let src = fs.readFileSync(MAIN, 'utf8');
const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true });
const hits = [];
(function walk(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'Literal' && typeof n.value === 'number' && /^0x[0-9a-f]{6}$/i.test(n.raw)) {
    const key = n.raw.toLowerCase();
    if (map[key]) hits.push([n.range, 'PAL.' + map[key], key]);
  }
  for (const k of Object.keys(n)) { const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); }
})(ast);
const counts = {};
for (const [r, rep, key] of hits.sort((a, b) => b[0][0] - a[0][0])) { src = src.slice(0, r[0]) + rep + src.slice(r[1]); counts[key] = (counts[key] || 0) + 1; }
const unused = Object.keys(map).filter((k) => !counts[k]);
if (unused.length) throw new Error('mapeados sem uso: ' + unused.join(','));
src = src.replace(/import \{ ([^}]*) \} from '\.\/config\/palette\.js';/, (m, names) => "import { " + names + ", PAL } from './config/palette.js';");
fs.writeFileSync(MAIN, src);

// PAL agrupado
const groups = {};
for (const [hex, path] of Object.entries(map)) { const [g, n] = path.split('.'); (groups[g] ||= {})[n] = hex; }
const hexes = Object.values(map); if (new Set(hexes).size !== hexes.length) throw new Error('hex duplicado no mapa');
const names = Object.keys(map).map((h) => map[h]); if (new Set(names).size !== names.length) throw new Error('nome duplicado no mapa');
let out = '\n/* Cores usadas por 2 ou mais objetos, agrupadas pelo papel. Cores de uso único ficam junto do objeto. */\nexport const PAL = {\n';
for (const [g, items] of Object.entries(groups)) {
  out += '  ' + g + ': {\n' + Object.entries(items).map(([n, h]) => '    ' + n + ': ' + h + ',').join('\n') + '\n  },\n';
}
out += '};\n';
fs.appendFileSync(PALETTE, out);
console.log('literais trocados:', hits.length, '| cores nomeadas:', Object.keys(map).length);
