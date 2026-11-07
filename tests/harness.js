// Carrega o HTML alvo em Chromium headless (swiftshader), com three local, aleatorio fixo
// e ganchos de depuracao injetados (somente em memoria; o arquivo alvo nao e alterado).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_TARGET = path.join(ROOT, 'legacy', 'sitio-vale-do-cafe.raw.html');
const THREE = fs.readFileSync(path.join(__dirname, 'three.min.js'), 'utf8');
const HOOK = 'window.__scene = scene; window.__dio = dio; window.__hull = hullMat; window.__sitio = {';
const SEED_SCRIPT = '<script>(function(){var s=12345;Math.random=function(){s=(s*1664525+1013904223)%4294967296;return s/4294967296;};})();</script>';

function targetPath() {
  const a = process.argv.find((x) => x.startsWith('--target='));
  return a ? path.resolve(a.slice(9)) : DEFAULT_TARGET;
}

function prepareHtml(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('window.__sitio = {')) throw new Error('gancho __sitio ausente em ' + file);
  if (!html.includes('window.__scene')) html = html.replace('window.__sitio = {', HOOK);
  return '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">' + SEED_SCRIPT + html;
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
    if (u === 'http://local/') return r.fulfill({ body: html, contentType: 'text/html' });
    return r.abort();
  });
  await page.goto('http://local/');
  await page.waitForFunction(() => window.__sitio && window.__scene, { timeout: 90000 });
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
