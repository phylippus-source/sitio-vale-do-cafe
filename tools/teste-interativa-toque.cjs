// Teste de toque (moto g52 ~ 412x915): arrastar item NÃO pode rolar a página. Rode: node tools/teste-interativa-toque.cjs
const { chromium } = require('playwright');
const fs = require('fs'),
  os = require('os'),
  path = require('path');
const SP = fs.mkdtempSync(path.join(os.tmpdir(), 'toque-'));
fs.writeFileSync(
  SP + '/i.html',
  '<!doctype html><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1">' +
    fs.readFileSync('plan/interativa.html', 'utf8'),
);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 412, height: 700 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const logs = [];
  p.on('pageerror', (e) => logs.push('PE ' + e.message));
  await p.goto('file://' + SP + '/i.html');
  const c = await ctx.newCDPSession(p);
  const r = await p.locator('.item[data-id=galpao] rect').boundingBox();
  const x = r.x + r.width / 2,
    y = r.y + r.height / 2;
  const st = () => p.evaluate(() => window.__lote.get().itens.find((i) => i.id === 'galpao'));
  const g0 = await st();
  const sy0 = await p.evaluate(() => scrollY);
  const t = (type, yy) =>
    c.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y: yy }],
    });
  await t('touchStart', y);
  const t0 = Date.now();
  for (let k = 1; k <= 12; k++) {
    await t('touchMove', y + k * 8);
    await p.waitForTimeout(16);
  }
  await t('touchEnd', y);
  await p.waitForTimeout(100);
  const g1 = await st();
  const sy1 = await p.evaluate(() => scrollY);
  console.log('galpão', [g0.x, g0.z], '→', [g1.x, g1.z], '| rolagem', sy0, '→', sy1);
  console.log('erros', logs);
  await b.close();
  if (logs.length || sy1 !== sy0 || (g1.x === g0.x && g1.z === g0.z)) process.exit(1);
})();
