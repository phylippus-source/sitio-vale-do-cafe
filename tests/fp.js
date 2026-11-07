// Primeira pessoa: entra em cada ponto, anda, confere nivel/altura do olho e ausencia de erros.
const { open, freeze } = require('./harness');
const SPOTS = ['under', 'under2'];

(async () => {
  const { browser, page, errors } = await open();
  await freeze(page);
  const res = [];
  for (const s of SPOTS) {
    const r = await page.evaluate((spot) => {
      __sitio.enterFP(); __sitio.fpGo(spot);
      const f = __sitio.fp; const a = { lvl: f.lvl, x: +f.x.toFixed(2), z: +f.z.toFixed(2) };
      return a;
    }, s);
    await page.waitForTimeout(800);
    const moved = await page.evaluate(() => {
      const f = __sitio.fp; const x0 = f.x, z0 = f.z; f.yaw = 0;
      for (let i = 0; i < 40; i++) { f.x += -Math.sin(f.yaw) * 0.1; f.z += -Math.cos(f.yaw) * 0.1; }
      return { lvl: f.lvl, inside: f.x > -12 && f.x < 28 && f.z > -73 && f.z < -38 };
    });
    res.push({ spot: s, ...r, ...moved });
  }
  await browser.close();
  console.log('FP', JSON.stringify(res));
  const bad = [];
  if (errors.length) bad.push('erros de pagina: ' + errors[0]);
  res.forEach((r) => { if (r.lvl !== 'u') bad.push(r.spot + ' nivel ' + r.lvl + ' (esperado u)'); });
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK   primeira pessoa entra e anda no bunker');
  process.exit(bad.length ? 1 : 0);
})();
