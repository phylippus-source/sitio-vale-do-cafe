// Fumaca do build minificado de producao: carrega sem erro e o estado do mundo responde.
const path = require('path');
const { open, ROOT } = require('./harness');

(async () => {
  const file = path.join(ROOT, 'dist', 'index.html');
  const { browser, page, errors, warnings, loadMs } = await open({ file });
  const st = await page.evaluate(() => __sitio.state());
  await browser.close();
  console.log('SMOKE', JSON.stringify({ loadMs, warnings: warnings.length, animals: st.animals, fish: st.fish, calls: st.calls }));
  const bad = [];
  if (errors.length) bad.push('erros: ' + errors[0]);
  if (!(st.animals > 0)) bad.push('sem animais');
  if (!(st.calls > 50)) bad.push('poucos draw calls');
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK   build minificado carrega e renderiza');
  process.exit(bad.length ? 1 : 0);
})();
