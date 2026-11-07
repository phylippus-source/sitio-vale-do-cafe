// Percorre a interface: todos os botoes, sliders e pontos de 1a pessoa. Falha se houver erro de execucao
// (detecta, por exemplo, variavel usada antes da declaracao apos trocar var por let/const).
const { open } = require('./harness');

(async () => {
  const { browser, page, errors } = await open({ width: 1200, height: 800 });
  const clicked = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    let n = 0;
    for (const b of document.querySelectorAll('#sector-grid .btn, .panel .btn, .actions .btn')) {
      if (b.closest('#fp-ui')) continue;
      b.click(); n++; await wait(120);
    }
    for (const id of ['#s-xray', '#s-speed', '#s-sun']) {
      const el = document.querySelector(id);
      if (!el) continue;
      for (const v of [0, 50, 100]) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); n++; await wait(150); }
    }
    return n;
  });
  const fp = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const spots = [...document.querySelectorAll('#fp-ui .fp-chips .btn')];
    __sitio.enterFP();
    let n = 0;
    for (const b of spots) { b.click(); n++; await wait(150); }
    __sitio.exitFP();
    return n;
  });
  await page.waitForTimeout(1500);
  await browser.close();
  console.log('INTERACT', JSON.stringify({ clicked, fpSpots: fp }));
  console.log(errors.length ? 'FAIL erro: ' + errors[0] : 'OK   interface percorrida sem erros');
  process.exit(errors.length ? 1 : 0);
})();
