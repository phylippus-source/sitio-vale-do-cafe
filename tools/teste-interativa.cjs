// Teste de navegador da página interativa (arrastar, girar, desfazer, item fixo). Rode: node tools/teste-interativa.cjs
const { chromium } = require('playwright');
const fs = require('fs'),
  os = require('os'),
  path = require('path');
const SP = fs.mkdtempSync(path.join(os.tmpdir(), 'interativa-'));
fs.writeFileSync(
  SP + '/i.html',
  '<!doctype html><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1">' +
    fs.readFileSync('plan/interativa.html', 'utf8'),
);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const logs = [];
  p.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) logs.push(m.text());
  });
  p.on('pageerror', (e) => logs.push('PE ' + e.message));
  await p.goto('file://' + SP + '/i.html');
  const box = async (id) => {
    const r = await p.locator(`.item[data-id=${id}] rect`).boundingBox();
    return r;
  };
  const st = () =>
    p.evaluate(() => window.__lote.get().itens.map((i) => [i.id, i.x, i.z, i.w, i.d, i.giro]));
  const g0 = (await st()).find((i) => i[0] === 'galpao');
  const bx = await box('galpao');
  await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.mouse.down();
  await p.mouse.move(bx.x + bx.width / 2 + 60, bx.y + bx.height / 2 + 80, { steps: 8 });
  await p.mouse.up();
  const g1 = (await st()).find((i) => i[0] === 'galpao');
  console.log('galpao antes', g0.slice(1, 3), 'depois', g1.slice(1, 3));
  await p.keyboard.press('r');
  const g2 = (await st()).find((i) => i[0] === 'galpao');
  console.log('girado', g2.slice(1));
  for (let k = 0; k < 3; k++) await p.keyboard.press('r');
  console.log('4 giros', (await st()).find((i) => i[0] === 'galpao').slice(3));
  await p.keyboard.press('Control+z');
  await p.keyboard.press('Control+z');
  await p.keyboard.press('Control+z');
  await p.keyboard.press('Control+z');
  await p.keyboard.press('Control+z');
  console.log('desfeito', (await st()).find((i) => i[0] === 'galpao').slice(1, 3));
  // fixo não move
  const cb = await box('casa');
  await p.mouse.move(cb.x + 20, cb.y + 20);
  await p.mouse.down();
  await p.mouse.move(cb.x + 90, cb.y + 90, { steps: 4 });
  await p.mouse.up();
  console.log('casa', (await st()).find((i) => i[0] === 'casa').slice(1, 3));
  console.log('status', await p.locator('#status').textContent());
  await p.screenshot({ path: SP + '/i.png' });
  const erros = logs.filter((l) => !/ERR_TUNNEL|net::/.test(l));
  console.log('erros de página', erros);
  if (erros.length || g1.slice(1, 3).join() === g0.slice(1, 3).join()) process.exit(1);
  await b.close();
})();
