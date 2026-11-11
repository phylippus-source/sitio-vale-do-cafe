// Desfaz um IIFE de nivel superior: `(function () { corpo })();` vira o proprio corpo no escopo de fora.
// Recusa quando a mudanca alteraria o sentido: `return`/`this`/`arguments` do proprio IIFE, nome local
// que ja existe no escopo de fora (redeclaracao) ou que esconde um import usado fora do IIFE.
// Uso: node tools/dissolve-iife.mjs arquivo.js LINHA_DO_IIFE
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import * as espree from 'espree';
import * as escope from 'eslint-scope';
import * as estraverse from 'estraverse';

const [file, lineArg] = process.argv.slice(2);
const line = +lineArg;
const text = fs.readFileSync(file, 'utf8');
const ast = espree.parse(text, { ecmaVersion: 2022, sourceType: 'module', range: true, loc: true });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
const fail = (m) => {
  console.error('ERRO: ' + m);
  process.exit(1);
};

let target = null;
estraverse.traverse(ast, {
  enter(n) {
    if (
      n.type === 'ExpressionStatement' &&
      n.loc.start.line === line &&
      n.expression.type === 'CallExpression' &&
      /FunctionExpression/.test(n.expression.callee.type) &&
      n.expression.arguments.length === 0
    )
      target = n;
  },
  fallback: 'iteration',
});
if (!target) fail('nao ha IIFE sem argumentos comecando na linha ' + line);
const fn = target.expression.callee;
if (fn.params.length || fn.async || fn.generator) fail('IIFE com parametros/async/generator');

const fnScope = sm.acquire(fn);
const inside = (n) => n.range[0] >= fn.range[0] && n.range[1] <= fn.range[1];

/* return / this / arguments do proprio IIFE */
let own = 0;
estraverse.traverse(fn.body, {
  enter(n) {
    if (/^(FunctionExpression|FunctionDeclaration)$/.test(n.type)) return estraverse.VisitorOption.Skip;
    if (n.type === 'ArrowFunctionExpression') return undefined; // arrow herda this
    if (n.type === 'ReturnStatement' || n.type === 'ThisExpression') own++;
    return undefined;
  },
  fallback: 'iteration',
});
if (own) fail('o IIFE tem return/this proprio (' + own + ')');
if (fnScope.references.some((r) => r.identifier.name === 'arguments')) fail('o IIFE usa arguments');

/* redeclaracao e captura de import */
const outer = fnScope.upper; // escopo de fora (funcao ou modulo)
const mod = sm.scopes.find((s) => s.type === 'module');
for (const v of fnScope.variables) {
  if (v.name === 'arguments' || !v.defs.length) continue;
  const o = outer.set.get(v.name);
  if (o && o.defs.length) fail('nome local ' + v.name + ' ja existe no escopo de fora (linha ' + o.defs[0].node.loc.start.line + ')');
  const imp = mod.set.get(v.name);
  if (imp && imp.defs.length && imp.references.some((r) => !inside(r.identifier)))
    fail('nome local ' + v.name + ' esconderia o import de mesmo nome usado fora do IIFE');
}
/* nomes de fora usados DENTRO apontam para o mesmo lugar? (sem mudanca: so se removem escopos) */

const b0 = fn.body.range[0];
const b1 = fn.body.range[1];
const inner = text.slice(b0 + 1, b1 - 1).replace(/^[ \t]*\n/, '').replace(/\n[ \t]*$/, '');
const next = text.slice(0, target.range[0]) + inner.replace(/^ {2}/gm, '') + text.slice(target.range[1]);
fs.writeFileSync(file, next);
espree.parse(next, { ecmaVersion: 2022, sourceType: 'module' }); // confere sintaxe e redeclaracoes
execFileSync('npx', ['prettier', '--write', file], { stdio: 'ignore' });
console.log('OK   IIFE da linha ' + line + ' desfeito em ' + file + ' (' + fnScope.variables.filter((v) => v.defs.length).length + ' nomes locais)');
