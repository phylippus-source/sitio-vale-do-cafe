/* Controles do painel: sol e estação, velocidade, sabor da água, legendas, recentrar e setas. */
import * as THREE from 'three';
import { clamp } from '../core/math.js';
import { C } from '../core/color.js';
import { waterMat, pondMat } from '../core/materials.js';
import { $ } from '../app/page.js';
import { SUNDIR, sun } from '../world/scene.js';
import { viewTarget, simulation } from '../app/state.js';
import { labelState } from './labels.js';
import { focusOn } from './camera.js';

function sunVec(h, decl) {
  const lat = (-22.4 * Math.PI) / 180,
    d = (decl * Math.PI) / 180,
    ha = ((h - 12) * 15 * Math.PI) / 180;
  const se = Math.sin(lat) * Math.sin(d) + Math.cos(lat) * Math.cos(d) * Math.cos(ha),
    el = Math.asin(se);
  const az =
    Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(d) * Math.cos(lat)) + Math.PI;
  return {
    v: new THREE.Vector3(-Math.sin(az) * Math.cos(el), se, Math.cos(az) * Math.cos(el)),
    se: se,
  };
} /* x = oeste, z = norte */
function applySun() {
  if (simulation.hour < 6) {
    SUNDIR.set(-0.55, 0.78, 0.55).normalize();
    sun.intensity = 0.34;
    $('#o-sun').textContent = 'Padrão';
    return;
  }
  const r = sunVec(simulation.hour, { jun: -23.44, set: 0, dez: 23.44 }[simulation.season]);
  r.v.y = Math.max(r.v.y, 0.04);
  SUNDIR.copy(r.v).normalize();
  sun.intensity = 0.34 * clamp(r.se * 4, 0.12, 1.1);
  const hh = Math.floor(simulation.hour),
    mm = Math.round((simulation.hour - hh) * 60);
  $('#o-sun').textContent = hh + ':' + (mm < 10 ? '0' : '') + mm;
}
$('#s-speed').addEventListener('input', function (e) {
  simulation.speed = parseFloat(e.target.value) / 100;
  $('#o-speed').textContent = Math.round(simulation.speed * 100) + '%';
});
$('#s-sun').addEventListener('input', function (e) {
  simulation.hour = parseFloat(e.target.value);
  applySun();
});
document.querySelectorAll('[data-season]').forEach(function (b) {
  b.addEventListener('click', function () {
    simulation.season = b.dataset.season;
    document.querySelectorAll('[data-season]').forEach(function (o) {
      o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
    });
    applySun();
  });
});
document.querySelectorAll('[data-flavour]').forEach(function (b) {
  b.addEventListener('click', function () {
    const hex = { cristal: 0x2bb3e6, lagoa: 0x2fbf8a, sinestesia: 0xb06be0 }[b.dataset.flavour];
    waterMat.color.copy(C(hex));
    pondMat.color.copy(C(hex));
    document.querySelectorAll('[data-flavour]').forEach(function (o) {
      o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
    });
  });
});
$('#b-labels').addEventListener('click', function (e) {
  labelState.show = !labelState.show;
  e.currentTarget.setAttribute('aria-pressed', String(labelState.show));
  e.currentTarget.textContent = 'Legendas: ' + (labelState.show ? 'on' : 'off');
  document.body.classList.toggle('nolabels', !labelState.show);
  if (labelState.show) labelState.needMeasure = true;
});
$('#b-reset').addEventListener('click', function () {
  focusOn('overview');
});
$('#d-up').addEventListener('click', function () {
  viewTarget.panY = clamp(viewTarget.panY + 9, -70, 90);
});
$('#d-down').addEventListener('click', function () {
  viewTarget.panY = clamp(viewTarget.panY - 9, -70, 90);
});
