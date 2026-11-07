// Capturas de referencia (golden) e comparacao por pixel. --update regrava as referencias.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const { open, freeze, setView, ROOT } = require('./harness');

const REF = path.join(ROOT, 'golden', 'ref');
const OUT = path.join(ROOT, 'golden', 'out');
const TOLERANCE_PCT = 0.5; // % maximo de pixels diferentes

const VIEWS = [
  { name: 'visao-geral', rotY: 0.6, rotX: 0.55, zoom: 1.0, f: [0, 0, 0], lift: 0 },
  { name: 'corte-100', rotY: 0, rotX: 0.9, zoom: 2.4, f: [8, -6, -55], lift: 100 },
  { name: 'casa-fachada', rotY: 0.2, rotX: 0.35, zoom: 2.6, f: [1, 3, -58], lift: 0 },
  { name: 'engenho', rotY: -0.5, rotX: 0.4, zoom: 2.8, f: [32, 2, -38], lift: 0 },
];
const FP = [
  { name: 'fp-bunker-corredor', spot: 'under', yaw: -1.57 },
  { name: 'fp-suite-cyberpunk', spot: 'under2', yaw: 0 },
];

function diff(a, b) {
  const A = PNG.sync.read(fs.readFileSync(a)); const B = PNG.sync.read(fs.readFileSync(b));
  if (A.width !== B.width || A.height !== B.height) return 100;
  const n = pixelmatch(A.data, B.data, null, A.width, A.height, { threshold: 0.12 });
  return (n / (A.width * A.height)) * 100;
}

(async () => {
  const update = process.argv.includes('--update');
  fs.mkdirSync(REF, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
  const { browser, page, errors } = await open();
  await freeze(page);
  const shots = [];
  for (const v of VIEWS) {
    await setView(page, { ...v, wait: v.lift ? 20000 : 12000 });
    const p = path.join(update ? REF : OUT, v.name + '.png'); await page.screenshot({ path: p }); shots.push(v.name);
  }
  await setView(page, { rotY: 0, rotX: 0.5, zoom: 1, f: [0, 0, 0], lift: 0, wait: 3000 });
  for (const v of FP) {
    await page.evaluate(({ spot, yaw }) => { __sitio.enterFP(); __sitio.fpGo(spot); __sitio.fp.yaw = yaw; }, v);
    await page.waitForTimeout(2000);
    const p = path.join(update ? REF : OUT, v.name + '.png'); await page.screenshot({ path: p }); shots.push(v.name);
  }
  await browser.close();
  if (update) { console.log('GOLDEN atualizado:', shots.join(', ')); process.exit(errors.length ? 1 : 0); }
  let fail = errors.length > 0; if (errors.length) console.log('ERROS DE PAGINA', errors);
  for (const s of shots) {
    const ref = path.join(REF, s + '.png');
    if (!fs.existsSync(ref)) { console.log('FALTA referencia', s); fail = true; continue; }
    const pct = diff(ref, path.join(OUT, s + '.png'));
    const ok = pct <= TOLERANCE_PCT; if (!ok) fail = true;
    console.log((ok ? 'OK   ' : 'FAIL ') + s + ' diff ' + pct.toFixed(3) + '%');
  }
  process.exit(fail ? 1 : 0);
})();
