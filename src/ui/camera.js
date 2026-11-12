/* Câmera e estado da vista: tamanho da tela, foco em um setor, texto do painel e abertura do corte (raios-X). */
import { hullMat } from '../core/materials.js';
import { SECTORS } from '../data/sectors.js';
import { $, stage } from '../app/page.js';
import { camera, renderer } from '../world/scene.js';
import { viewTarget } from '../app/state.js';
import { labelState, labelHooks } from './labels.js';

export const SECTOR = Object.fromEntries(
  SECTORS.map(function (s) {
    return [s.k, s];
  }),
);

/* ================= CÂMERA E ESTADO ================= */
export let viewWidth = 1;
export let viewHeight = 1;

export function resize() {
  const r = stage.getBoundingClientRect();
  viewWidth = Math.max(1, r.width);
  viewHeight = Math.max(1, r.height);
  renderer.setSize(viewWidth, viewHeight);
  camera.aspect = viewWidth / viewHeight;
  camera.updateProjectionMatrix();
  labelState.needMeasure = true;
  hullMat.uniforms.uRes.value.set(viewWidth, viewHeight);
  hullMat.uniforms.uThick.value = viewWidth < 640 ? 1.15 : 1.5;
}
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
else window.addEventListener('resize', resize);
resize();

export let subView = false;
export function focusOn(key) {
  const s = SECTOR[key];
  if (!s) return;
  subView = ['bunker', 'datacenter', 'labs', 'clean', 'refuge', 'battery'].indexOf(key) >= 0;
  viewTarget.f.set(s.f[0], s.f[1], s.f[2]);
  viewTarget.rotY = s.ry;
  viewTarget.rotX = s.rx;
  viewTarget.zoom = s.z;
  viewTarget.panX = 0;
  viewTarget.panY = 0;
  if (key === 'overview') {
    setLift(0);
  } else if (s.lift != null) {
    setLift(s.lift);
  }
  setInfo(s);
  document.querySelectorAll('[data-sector]').forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.sector === key ? 'true' : 'false');
  });
  const chip = $('#chips').querySelector('[data-sector="' + key + '"]');
  if (chip && chip.scrollIntoView) {
    try {
      chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    } catch {
      /* rolagem suave indisponível: segue sem rolar */
    }
  }
}
labelHooks.onPick = focusOn;
export function setInfo(s) {
  $('#info-tag').textContent =
    ['bunker', 'datacenter', 'labs', 'clean', 'refuge', 'battery'].indexOf(s.k) >= 0
      ? 'Subsolo'
      : ['casa_in', 'barn_in'].indexOf(s.k) >= 0
        ? 'Interior'
        : s.k === 'overview'
          ? 'Visão geral'
          : 'Superfície';
  $('#info-title').textContent = s.n;
  $('#info-text').textContent = s.d;
}
export function setLift(pct) {
  viewTarget.lift = pct;
  const sl = $('#s-xray');
  sl.value = pct;
  $('#o-xray').textContent = Math.round(pct) + '%';
}
