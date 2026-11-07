// Carrega o HTML alvo em Chromium headless (swiftshader), com three local, aleatorio fixo
// e ganchos de depuracao injetados (somente em memoria; o arquivo alvo nao e alterado).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
// Alvo padrao = build de producao (minificado); ganchos so com ?debug. Legado: --target=legacy/sitio-vale-do-cafe.raw.html
const DEFAULT_TARGET = path.join(ROOT, 'dist', 'index.html');
const THREE = fs.readFileSync(path.join(__dirname, 'three.min.js'), 'utf8');
const SEED_SCRIPT = '<script>(function(){var s=12345;Math.random=function(){s=(s*1664525+1013904223)%4294967296;return s/4294967296;};})();</script>';

function targetPath() {
  const a = process.argv.find((x) => x.startsWith('--target='));
  return a ? path.resolve(a.slice(9)) : DEFAULT_TARGET;
}

function prepareHtml(file) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/^\s*<!doctype/i.test(html)) throw new Error('alvo precisa ser documento HTML completo: ' + file);
  return html.replace('<head>', '<head>' + SEED_SCRIPT);
}

async function open({ width = 1200, height = 800, file = targetPath() } = {}) {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  const page = await (await browser.newContext({ viewport: { width, height } })).newPage();
  const errors = [];   // erros de execucao (quebram o teste)
  const warnings = []; // avisos do three (comparados com baseline)
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (t.startsWith('Failed to load resource')) return; // fontes externas bloqueadas no teste
    warnings.push(t.slice(0, 120));
  });
  const html = prepareHtml(file);
  const t0 = Date.now();
  await page.route('**/*', (r) => {
    const u = r.request().url();
    if (u.includes('three.min.js')) return r.fulfill({ body: THREE, contentType: 'application/javascript' });
    if (u.startsWith('http://local/')) return r.fulfill({ body: html, contentType: 'text/html' });
    return r.abort();
  });
  await page.goto('http://local/?debug');
  await page.waitForFunction(() => window.__sitio, { timeout: 90000 });
  await page.evaluate(() => { // three e cena vem do bundle; detectores de teste os usam como globais
    const d = window.__sitio; window.THREE = d.THREE; window.__scene = d.scene; window.__dio = d.dio; window.__hull = d.hull;
  });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(2500);
  return { browser, page, errors, warnings, loadMs };
}

/** Congela mundo (velocidade 0), fixa o sol e esconde rotulos para comparacao deterministica. */
async function freeze(page) {
  await page.evaluate(() => {
    document.body.classList.add('nolabels');
    const set = (id, v) => { const el = document.querySelector(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
    set('#s-speed', 0);
    set('#s-sun', 12);
  });
  await page.waitForTimeout(1500);
}

/** Posiciona a camera orbital. lift em 0..100 (corte). */
async function setView(page, { rotY, rotX, zoom, f, lift = 0, wait = 6000 }) {
  await page.evaluate(({ rotY, rotX, zoom, f, lift }) => {
    const s = __sitio.st; s.rotY = rotY; s.rotX = rotX; s.zoom = zoom; s.f.set(f[0], f[1], f[2]);
    const sl = document.querySelector('#s-xray'); sl.value = lift; sl.dispatchEvent(new Event('input', { bubbles: true }));
  }, { rotY, rotX, zoom, f, lift });
  await page.waitForTimeout(wait);
}

module.exports = { open, freeze, setView, targetPath, ROOT };
