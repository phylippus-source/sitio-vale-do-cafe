// Confere a etapa A1: nenhum nome antigo (tools/names-a1.json) pode restar em src/, e todo nome novo
// precisa existir. Nome antigo unico: nenhuma ocorrencia em qualquer posicao (declaracao, uso, chave de
// objeto, propriedade) nem em comentarios. Nome compartilhado (com depth/kind): nenhuma declaracao daquele
// tipo/profundidade (outras variaveis locais de mesmo nome sao legitimas).
import fs from 'node:fs';
import path from 'node:path';
import * as espree from 'espree';
import * as escope from 'eslint-scope';
import * as estraverse from 'estraverse';

const map = JSON.parse(fs.readFileSync('tools/names-a1.json', 'utf8'));
const done = map.done || Object.keys(map.lots); // lotes ja aplicados
const entries = done.flatMap((l) => map.lots[l]);
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(p); } })('src');

const depthOf = (sc) => { let d = 0; for (let p = sc.upper; p; p = p.upper) d++; return d; };
const kindOf = (v) => { const d = v.defs[0]; return d.type === 'FunctionName' || (d.type === 'Variable' && d.node.init && /Function/.test(d.node.init.type)) ? 'function' : 'variable'; };
const carved = (f) => /^src[\\/](world|app|ui)[\\/]/.test(f); // modulos cortados do IIFE: um nivel de escopo a menos
const problems = [];
const declared = new Set();
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const ast = espree.parse(src, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true, comment: true });
  const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
  const vars = sm.scopes.flatMap((sc) => sc.variables.map((v) => ({ v, depth: depthOf(sc) }))).filter((x) => x.v.defs.length);
  vars.forEach((x) => declared.add(x.v.name));
  const idents = [];
  estraverse.traverse(ast, { enter(n) { if (n.type === 'Identifier') idents.push(n); }, fallback: 'iteration' });
  for (const e of entries) {
    if (e.depth === undefined && !e.kind) {
      idents.filter((n) => n.name === e.old).forEach((n) => problems.push(`${file}:${n.loc.start.line}  nome antigo ${e.old} (novo: ${e.new})`));
      const re = new RegExp('\\b' + e.old + '\\b');
      if (!e.noComment) ast.comments.filter((c) => re.test(c.value)).forEach((c) => problems.push(`${file}:${c.loc.start.line}  nome antigo ${e.old} em comentario (novo: ${e.new})`));
    } else if (file === map.file || carved(file)) {
      vars.filter((x) => x.v.name === e.old && (e.depth === undefined || x.depth + (carved(file) ? 1 : 0) === e.depth) && (!e.kind || kindOf(x.v) === e.kind))
        .forEach((x) => problems.push(`${file}:${x.v.defs[0].name.loc.start.line}  declaracao antiga ${e.old} (novo: ${e.new})`));
    }
  }
}
for (const e of entries) if (!declared.has(e.new)) problems.push(`nome novo ${e.new} nao existe (antigo: ${e.old})`);
if (problems.length) { console.log(`FAIL ${problems.length} problema(s) de nomes\n` + problems.slice(0, 40).map((p) => '  ' + p).join('\n') + (problems.length > 40 ? `\n  ... e mais ${problems.length - 40}` : '')); process.exit(1); }
console.log(`OK   zero nomes antigos (${entries.length} nomes conferidos em ${files.length} arquivos)`);
