/* Legendas flutuantes com linhas-guia: posicionamento sem sobreposição. */
import * as THREE from 'three';
import { clamp } from '../core/math.js';
import { LABELS } from '../data/labels.js';
import { $ } from '../app/page.js';
import { surface, under, camera } from '../world/scene.js';
import { barnG, barnRoofG } from '../world/engenho.js';
import { casaG, casaUp, casaRoofG } from '../world/casa/base.js';
import { walker, viewCurrent } from '../app/state.js';

/* ================= LEGENDAS ================= */
const labelsHost = $('#labels'),
  svg = $('#leaders'),
  NS = 'http://www.w3.org/2000/svg';
const labelItems = LABELS.map(function (d) {
  const anchor = new THREE.Object3D();
  anchor.position.set(d.p[0], d.p[1], d.p[2]);
  (
    ({ s: surface, u: under, c: casaRoofG, b: barnRoofG, i: casaG, e: barnG, U: casaUp })[d.L] ||
    surface
  ).add(anchor);
  const el = document.createElement('button');
  el.className = 'lbl';
  el.type = 'button';
  const b = document.createElement('span');
  b.textContent = d.t;
  el.appendChild(b);
  if (d.s) {
    const s = document.createElement('small');
    s.textContent = d.s;
    el.appendChild(s);
  }
  el.addEventListener('click', function () {
    labelHooks.onPick(d.k);
  });
  labelsHost.appendChild(el);
  const line = document.createElementNS(NS, 'line'),
    dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('r', '3');
  svg.appendChild(line);
  svg.appendChild(dot);
  return { d: d, anchor: anchor, el: el, line: line, dot: dot, w: 0, h: 0 };
});
export const labelState = { needMeasure: true, show: true };
/* quem escolhe a legenda é definido pelo main (evita ciclo com a câmera) */
export const labelHooks = { onPick: function () {} };
const vTmp = new THREE.Vector3();
function measure() {
  labelItems.forEach(function (it) {
    it.el.hidden = false;
    it.w = it.el.offsetWidth;
    it.h = it.el.offsetHeight;
  });
  labelState.needMeasure = false;
}

export function updateLabels(W, H) {
  if (!labelState.show || walker.on) return;
  if (labelState.needMeasure) measure();
  const narrow = W < 640,
    items = [];
  labelItems.forEach(function (it) {
    const hide =
      (narrow && !it.d.m) ||
      (!it.d.m && viewCurrent.zoom < 1.5) ||
      (it.d.i && viewCurrent.lift < 40) ||
      (it.d.z && viewCurrent.zoom < it.d.z);
    vTmp.setFromMatrixPosition(it.anchor.matrixWorld).project(camera);
    it.sx = (vTmp.x * 0.5 + 0.5) * W;
    it.sy = (-vTmp.y * 0.5 + 0.5) * H;
    it.vis = !hide && vTmp.z < 1 && it.sx > -20 && it.sx < W + 20 && it.sy > -20 && it.sy < H + 20;
    if (it.vis) items.push(it);
    else {
      it.el.hidden = true;
      it.line.style.display = 'none';
      it.dot.style.display = 'none';
    }
  });
  items.sort(function (a, b) {
    return b.d.m - a.d.m || b.sy - a.sy;
  });
  const placed = [];
  items.forEach(function (it) {
    const w = it.w;
    const h = it.h;
    const bx = it.sx - w / 2;
    const by = it.sy - 16 - h;
    let ok = false;
    let px = 0;
    let py = 0;
    for (let step = 0; step < 9 && !ok; step++) {
      for (let k = 0; k < 5 && !ok; k++) {
        const dx = [0, 1, -1, 2, -2][k] * (w * 0.55 + 4),
          x = clamp(bx + dx, 4, Math.max(4, W - w - 4)),
          y = by - step * (h + 5);
        if (y < 4 || y > H - h - 4) continue;
        let hit = false;
        for (let i = 0; i < placed.length; i++) {
          const p = placed[i];
          if (x < p.x + p.w + 4 && x + w + 4 > p.x && y < p.y + p.h + 4 && y + h + 4 > p.y) {
            hit = true;
            break;
          }
        }
        if (!hit) {
          ok = true;
          px = x;
          py = y;
        }
      }
    }
    if (!ok) {
      it.el.hidden = true;
      it.line.style.display = 'none';
      it.dot.style.display = 'none';
      return;
    }
    placed.push({ x: px, y: py, w: w, h: h });
    it.el.hidden = false;
    it.el.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px)';
    const lx = clamp(it.sx, px + 6, px + w - 6);
    it.line.style.display = '';
    it.dot.style.display = '';
    it.line.setAttribute('x1', it.sx.toFixed(1));
    it.line.setAttribute('y1', it.sy.toFixed(1));
    it.line.setAttribute('x2', lx.toFixed(1));
    it.line.setAttribute('y2', (py + h).toFixed(1));
    it.dot.setAttribute('cx', it.sx.toFixed(1));
    it.dot.setAttribute('cy', it.sy.toFixed(1));
  });
}
