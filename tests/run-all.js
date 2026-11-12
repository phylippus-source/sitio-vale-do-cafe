// Roda a suite em sequencia, para na primeira falha e mostra o tempo de cada passo.
//   node tests/run-all.js                suite completa (rapida + coplanar + golden), meta: 4 min
//   node tests/run-all.js --fast         suite rapida, meta: 2 min
//   node tests/run-all.js --keep-going   nao para na primeira falha
// Os demais argumentos (ex.: --target=...) seguem para os testes de navegador.
const { spawnSync, execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const own = ['--fast', '--keep-going'];
const args = process.argv.slice(2);
const fast = args.includes('--fast');
const keepGoing = args.includes('--keep-going');
const extra = args.filter((a) => !own.includes(a));

// o Playwright costuma estar instalado globalmente; os testes o encontram por NODE_PATH
const env = { ...process.env };
try {
  require.resolve('playwright');
} catch (e) {
  if (!env.NODE_PATH) env.NODE_PATH = execSync('npm root -g', { encoding: 'utf8' }).trim();
}

const npm = (script) => ['npm', ['run', '--silent', script]];
const browser = (file) => ['node', ['tests/' + file + '.js', ...extra]];
const FAST = [
  ['lint', ...npm('lint')],
  ['names', ...npm('check:names')],
  ['layout', 'node', ['tools/layout-check.mjs']],
  ['format', ...npm('format:check')],
  ['unit', ...npm('test:unit')],
  ['build', ...npm('build')],
  ['scenehash', ...browser('scenehash')],
  ['metrics', ...browser('metrics')],
  ['fp', ...browser('fp')],
  ['smoke', ...browser('smoke')],
  ['interact', ...browser('interact')],
];
const FULL = [...FAST, ['coplanar', ...browser('coplanar')], ['golden', ...browser('golden')]];
const steps = fast ? FAST : FULL;
const budget = fast ? 120 : 240;

const secs = (ms) => (ms / 1000).toFixed(1) + ' s';
const results = [];
const t0 = Date.now();
for (const [name, cmd, cmdArgs] of steps) {
  console.log('\n=== ' + name + ' ===');
  const t = Date.now();
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit', cwd: ROOT, env });
  results.push({ name, ok: r.status === 0, ms: Date.now() - t });
  if (r.status !== 0 && !keepGoing) break;
}
const total = Date.now() - t0;
const failed = results.filter((r) => !r.ok).map((r) => r.name);
const skipped = steps.map((s) => s[0]).filter((n) => !results.some((r) => r.name === n));

console.log('\n=== resumo (' + (fast ? 'suite rapida' : 'suite completa') + ') ===');
results.forEach((r) => console.log('  ' + r.name.padEnd(10) + secs(r.ms).padStart(9) + '  ' + (r.ok ? 'ok' : 'FALHOU')));
if (skipped.length) console.log('  não rodaram: ' + skipped.join(', '));
console.log('  ' + 'total'.padEnd(10) + secs(total).padStart(9) + '  meta ' + budget + ' s: ' + (total / 1000 <= budget ? 'dentro' : 'ACIMA'));
console.log(failed.length ? 'FALHOU: ' + failed.join(', ') : skipped.length ? 'INCOMPLETO' : 'TUDO OK');
process.exit(failed.length || skipped.length ? 1 : 0);
