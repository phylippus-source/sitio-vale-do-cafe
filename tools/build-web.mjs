// Junta as réguas do lote num único script (IIFE `LoteWeb`) para embutir na página interativa.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ARQUIVOS = ['layout-lib.mjs', 'lote-lib.mjs', 'caminhos-lib.mjs', 'lote-web.mjs'];
const aqui = (f) => fileURLToPath(new URL(f, import.meta.url));

export function montarBundle() {
  const corpo = ARQUIVOS.map((f) =>
    fs
      .readFileSync(aqui(f), 'utf8')
      .split('\n')
      .filter((l) => !/^import .*;$/.test(l) && !/^export \{.*\};$/.test(l))
      .join('\n')
      .replace(/^export /gm, ''),
  ).join('\n');
  return `const LoteWeb = (() => {\n${corpo}\nreturn { conferirLote, tracarCaminhos, custoViagens, avaliar };\n})();\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const saida = process.argv[2] || 'plan/lote-web.bundle.js';
  fs.writeFileSync(saida, montarBundle());
  console.log(`bundle: ${saida} (${fs.statSync(saida).size} bytes)`);
}
