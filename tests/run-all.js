// Roda todas as verificacoes em sequencia. Saida != 0 se qualquer uma falhar.
const { spawnSync } = require('child_process');
const steps = ['metrics', 'coplanar', 'fp', 'golden', 'smoke'];
let failed = [];
for (const s of steps) {
  console.log('\n=== ' + s + ' ===');
  const r = spawnSync('node', ['tests/' + s + '.js', ...process.argv.slice(2)], { stdio: 'inherit' });
  if (r.status !== 0) failed.push(s);
}
console.log('\n' + (failed.length ? 'FALHOU: ' + failed.join(', ') : 'TUDO OK'));
process.exit(failed.length ? 1 : 0);
