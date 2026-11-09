// Backup do projeto: git bundle (historico completo, verificado) + zip da arvore de trabalho.
// Os arquivos vao para FORA do repositorio (../backup por padrao, ou a pasta em SAVE_DIR).
//   npm run save                 nome com data e hora:   sitio-vale-do-cafe-20261109-1710-<commit>.*
//   npm run save -- M1           nome com rotulo:        sitio-vale-do-cafe-M1-<commit>.*
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.resolve(process.env.SAVE_DIR || path.join(root, '..', 'backup'));
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8', ...opts }).trim();
const mb = (file) => (statSync(file).size / 1048576).toFixed(1) + ' MB';

const commit = run('git', ['rev-parse', '--short', 'HEAD']);
const dirty = run('git', ['status', '--porcelain']);
let label = process.argv[2];
if (!label) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  label = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
const base = path.join(outDir, `sitio-vale-do-cafe-${label}-${commit}`);
mkdirSync(outDir, { recursive: true });
for (const f of [base + '.bundle', base + '.zip']) {
  if (existsSync(f)) {
    console.error('FALHOU: já existe ' + f);
    process.exit(1);
  }
}

if (dirty) console.log('AVISO: há alterações não commitadas. O bundle só leva commits; o zip leva a árvore de trabalho.');

run('git', ['bundle', 'create', base + '.bundle', '--all'], { stdio: 'pipe' });
run('git', ['bundle', 'verify', base + '.bundle'], { stdio: 'pipe' });
console.log('bundle verificado: ' + base + '.bundle (' + mb(base + '.bundle') + ')');

const skip = ['.git/*', 'node_modules/*', 'dist/*', 'dist-debug/*', 'golden/out/*', 'logs/*'];
run('zip', ['-r', '-q', base + '.zip', '.', '-x', ...skip]);
console.log('zip da árvore:     ' + base + '.zip (' + mb(base + '.zip') + ')');
console.log('Restaurar: git clone ' + path.basename(base) + '.bundle sitio && cd sitio && npm ci');
