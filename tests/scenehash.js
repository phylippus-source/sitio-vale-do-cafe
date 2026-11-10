// Hash da cena: impressao digital deterministica de toda a geometria, materiais e transformacoes
// abaixo de `diorama`, comparada com golden/scene.baseline.json. Detecta qualquer mudanca na cena
// (posicao de uma arvore, cor de uma parede, ordem de construcao) sem depender de imagens.
//
// Determinismo: aleatorio semeado (harness) + relogio virtual (nenhum quadro roda sozinho).
// Duas fotografias: "inicial" (apos o 1o quadro do carregamento) e "animado" (apos STEPS quadros de
// DT_MS; cobre animais, peixes, roda, rotor e o corte). O diorama em si fica de fora: sua posicao
// depende da camera.
//
// Uso: node tests/scenehash.js [--update] [--repeat=N]
//   --update  regrava o baseline (so grava se tres capturas independentes forem identicas)
//   --repeat  repete a captura em navegadores novos e exige resultados identicos (teste de estabilidade)
const fs = require('fs');
const path = require('path');
const { open, step, ROOT } = require('./harness');

const BASELINE = path.join(ROOT, 'golden', 'scene.baseline.json');
const CONFIG = { width: 480, height: 320, steps: 10, dtMs: 40 };

/* Roda dentro da pagina. Devolve { total, counts, groups, meshes }. */
function fingerprint() {
  const diorama = window.__diorama;
  const Q = 1000; // quantizacao: 1 mm
  const QCOLOR = 10000; // cores: 1/255 de uma cor escura ainda muda o hash
  const hex8 = (n) => (n >>> 0).toString(16).padStart(8, '0');
  class H {
    constructor() { this.a = 0x811c9dc5 | 0; this.b = 0x9e3779b9 | 0; }
    int(v) {
      this.a = Math.imul(this.a ^ v, 16777619);
      this.b = Math.imul((this.b + v) | 0, 0x85ebca6b);
      this.b ^= this.b >>> 15;
    }
    num(x) { this.int(Number.isFinite(x) ? Math.round(x * Q) | 0 : 0x7fffffff); }
    str(s) { this.int(s.length); for (let i = 0; i < s.length; i++) this.int(s.charCodeAt(i)); }
    floats(arr, len = arr.length, q = Q) {
      let a = this.a, b = this.b;
      for (let i = 0; i < len; i++) {
        const x = arr[i];
        const v = Number.isFinite(x) ? Math.round(x * q) | 0 : 0x7fffffff;
        a = Math.imul(a ^ v, 16777619);
        b = Math.imul((b + v) | 0, 0x85ebca6b);
        b ^= b >>> 15;
      }
      this.a = a; this.b = b;
    }
    ints(arr) {
      let a = this.a, b = this.b;
      for (let i = 0; i < arr.length; i++) {
        const v = arr[i] | 0;
        a = Math.imul(a ^ v, 16777619);
        b = Math.imul((b + v) | 0, 0x85ebca6b);
        b ^= b >>> 15;
      }
      this.a = a; this.b = b;
    }
    hex() { return hex8(this.a) + hex8(this.b); }
  }

  function material(h, mat) {
    h.str(mat.type);
    h.int((mat.transparent ? 1 : 0) | (mat.depthWrite ? 2 : 0) | (mat.depthTest ? 4 : 0) | (mat.vertexColors ? 8 : 0) | (mat.flatShading ? 16 : 0) | (mat.wireframe ? 32 : 0));
    h.int(mat.side);
    h.num(mat.opacity);
    if (mat.color) h.int(mat.color.getHex());
    if (mat.emissive) h.int(mat.emissive.getHex());
    h.int(mat.gradientMap ? 1 : 0);
    if (mat.vertexShader) h.str(mat.vertexShader);
    if (mat.fragmentShader) h.str(mat.fragmentShader);
  }

  function geometry(h, g) {
    h.str(g.type);
    for (const name of Object.keys(g.attributes).sort()) {
      const at = g.attributes[name];
      h.str(name); h.int(at.itemSize); h.int(at.count); h.int(at.normalized ? 1 : 0);
      if (at.isInterleavedBufferAttribute) {
        for (let i = 0; i < at.count; i++) { h.num(at.getX(i)); if (at.itemSize > 1) h.num(at.getY(i)); if (at.itemSize > 2) h.num(at.getZ(i)); }
      } else h.floats(at.array, at.array.length, name === 'color' ? QCOLOR : Q);
    }
    if (g.index) { h.str('index'); h.int(g.index.count); h.ints(g.index.array); }
    h.int(g.groups.length);
    for (const gr of g.groups) { h.int(gr.start); h.int(gr.count); h.int(gr.materialIndex | 0); }
    h.int(g.drawRange.start); h.int(Math.min(g.drawRange.count, 0x7fffffff));
  }

  function vertsOf(node) {
    if (!node.isMesh) return 0;
    const g = node.geometry;
    return g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
  }

  function own(node, root) {
    const h = new H();
    h.str(node.type);
    h.int((node.visible ? 1 : 0) | (node.castShadow ? 2 : 0) | (node.receiveShadow ? 4 : 0) | (node.frustumCulled ? 8 : 0) | (node.matrixAutoUpdate ? 16 : 0));
    h.int(node.renderOrder | 0);
    h.int(node.children.length);
    if (!root) {
      h.num(node.position.x); h.num(node.position.y); h.num(node.position.z);
      h.num(node.rotation.x); h.num(node.rotation.y); h.num(node.rotation.z);
      h.num(node.scale.x); h.num(node.scale.y); h.num(node.scale.z);
    }
    if (node.isMesh) {
      geometry(h, node.geometry);
      (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) => material(h, m));
      if (node.isInstancedMesh) { h.int(node.count); h.floats(node.instanceMatrix.array, node.count * 16); }
    }
    return h;
  }

  function box(node) {
    const g = node.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox, r = (v) => Math.round(v * 10) / 10;
    return '[' + r(b.min.x) + ',' + r(b.max.x) + '|' + r(b.min.y) + ',' + r(b.max.y) + '|' + r(b.min.z) + ',' + r(b.max.z) + ']';
  }

  const out = { total: '', counts: { nodes: 0, meshes: 0, verts: 0, tris: 0 }, groups: {}, meshes: {} };
  function walk(node, p, depth) {
    const o = own(node, depth === 0);
    const sub = new H();
    sub.int(o.a); sub.int(o.b);
    let m = node.isMesh ? 1 : 0, v = vertsOf(node);
    out.counts.nodes++;
    node.children.forEach((c, i) => {
      const r = walk(c, p + '/' + i, depth + 1);
      sub.int(r.a); sub.int(r.b);
      m += r.m; v += r.v;
    });
    if (node.isMesh) {
      out.counts.meshes++; out.counts.verts += vertsOf(node);
      out.meshes[p] = o.hex() + ' v' + vertsOf(node) + ' ' + box(node);
    }
    if (depth <= 2) out.groups[p] = sub.hex() + ' m' + m + ' v' + v;
    return { a: sub.a, b: sub.b, m, v };
  }
  const r = walk(diorama, 'diorama', 0);
  const t = new H(); t.int(r.a); t.int(r.b);
  out.total = t.hex();
  out.counts.tris = out.counts.verts / 3;
  return out;
}

async function capture() {
  const { browser, page, errors } = await open({ width: CONFIG.width, height: CONFIG.height, virtualClock: true, settle: 400 });
  try {
    const inicial = await page.evaluate(fingerprint);
    await step(page, CONFIG.steps, CONFIG.dtMs);
    const animado = await page.evaluate(fingerprint);
    return { errors, snapshots: { inicial, animado } };
  } finally {
    await browser.close();
  }
}

const head = (s) => s.split(' ')[0];

/* Lista as diferencas entre duas fotografias: primeiro os grupos, depois as malhas. */
function diff(name, base, now) {
  const lines = [];
  if (base.total === now.total) return lines;
  lines.push('  [' + name + '] hash total ' + base.total + ' -> ' + now.total);
  Object.keys(base.counts).forEach((k) => {
    if (base.counts[k] !== now.counts[k]) lines.push('    contagem ' + k + ': ' + base.counts[k] + ' -> ' + now.counts[k]);
  });
  const changed = (a, b) => {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    return keys.filter((k) => !a[k] || !b[k] || head(a[k]) !== head(b[k]));
  };
  const show = (title, a, b, limit) => {
    const keys = changed(a, b);
    if (!keys.length) return;
    lines.push('    ' + title + ': ' + keys.length);
    keys.slice(0, limit).forEach((k) => lines.push('      ' + k + '  antes: ' + (a[k] || '(ausente)') + '  agora: ' + (b[k] || '(ausente)')));
    if (keys.length > limit) lines.push('      ... e mais ' + (keys.length - limit));
  };
  show('grupos diferentes (profundidade <= 2)', base.groups, now.groups, 8);
  show('malhas diferentes', base.meshes, now.meshes, 8);
  return lines;
}

(async () => {
  const update = process.argv.includes('--update');
  const rep = process.argv.find((a) => a.startsWith('--repeat='));
  const runs = Math.max(update ? 3 : 1, rep ? parseInt(rep.slice(9), 10) : 1);
  const caps = [];
  for (let i = 0; i < runs; i++) {
    const c = await capture();
    if (c.errors.length) { console.log('FAIL erro de execucao: ' + c.errors[0]); process.exit(1); }
    caps.push(c.snapshots);
  }
  const now = caps[0];
  // estabilidade: capturas independentes precisam coincidir
  for (let i = 1; i < caps.length; i++) {
    for (const name of Object.keys(now)) {
      const d = diff(name, now[name], caps[i][name]);
      if (d.length) { console.log('FAIL cena instavel entre capturas (execucao 1 x ' + (i + 1) + ')\n' + d.join('\n')); process.exit(1); }
    }
  }
  if (runs > 1) console.log('INFO ' + runs + ' capturas independentes idênticas');
  const summary = Object.entries(now).map(([k, v]) => k + ' ' + v.total.slice(0, 12)).join(' | ');
  if (update) {
    fs.writeFileSync(BASELINE, JSON.stringify({ version: 1, config: CONFIG, snapshots: now }, null, 1) + '\n');
    console.log('OK   baseline gravado: ' + path.relative(ROOT, BASELINE) + ' (' + summary + ')');
    process.exit(0);
  }
  if (!fs.existsSync(BASELINE)) { console.log('FAIL sem baseline; rode: node tests/scenehash.js --update'); process.exit(1); }
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const lines = [];
  for (const name of Object.keys(base.snapshots)) lines.push(...diff(name, base.snapshots[name], now[name]));
  if (lines.length) {
    console.log('FAIL a cena mudou\n' + lines.join('\n'));
    console.log('Se a mudanca e intencional: node tests/scenehash.js --update');
    process.exit(1);
  }
  const c = now.inicial.counts;
  console.log('OK   cena identica ao baseline (' + c.meshes + ' malhas, ' + c.tris + ' triangulos; ' + summary + ')');
})().catch((e) => { console.log('FAIL ' + e.message); process.exit(1); });
