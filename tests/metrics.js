// Metricas: triangulos, draw calls, malhas, tempo de carga, erros. --update grava baseline.
const fs = require('fs');
const path = require('path');
const { open, ROOT } = require('./harness');
const BASE = path.join(ROOT, 'golden', 'metrics.baseline.json');

(async () => {
  const { browser, page, errors, warnings, loadMs } = await open();
  const m = await page.evaluate(() => {
    const st = __sitio.state(); let meshes = 0, tris = 0;
    __scene.traverse((o) => { if (!o.isMesh) return; meshes++; const g = o.geometry; const n = g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0); tris += n / 3; });
    return { meshes, tris: Math.round(tris), drawCalls: st.calls };
  });
  const html = require('./harness').targetPath();
  m.bytes = fs.statSync(html).size; m.loadMs = loadMs; m.errors = errors.length; m.warnings = warnings.length;
  await browser.close();
  console.log('METRICAS', JSON.stringify(m));
  if (process.argv.includes('--update')) { fs.writeFileSync(BASE, JSON.stringify(m, null, 2)); console.log('baseline gravada'); return; }
  if (!fs.existsSync(BASE)) { console.log('sem baseline'); process.exit(1); }
  const b = JSON.parse(fs.readFileSync(BASE, 'utf8'));
  const bad = [];
  if (m.errors > 0) bad.push('erros de pagina');
  if (m.warnings > b.warnings) bad.push('avisos ' + b.warnings + ' -> ' + m.warnings);
  if (m.tris !== b.tris) bad.push('triangulos ' + b.tris + ' -> ' + m.tris);
  if (m.meshes !== b.meshes) bad.push('malhas ' + b.meshes + ' -> ' + m.meshes);
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK   metricas iguais a baseline');
  process.exit(bad.length ? 1 : 0);
})();
