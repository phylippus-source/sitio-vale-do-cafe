/* Interação com a maquete: arrastar para girar, pinça e roda para zoom, deslizador de raios-X. */
import * as THREE from 'three';
import { clamp } from '../core/math.js';
import { $, glHost } from '../app/page.js';
import { camera } from '../world/scene.js';
import { viewTarget, viewCurrent, walker } from '../app/state.js';
import { viewHeight, setLift } from './camera.js';

/* ================= INTERAÇÃO ================= */
export const ptrs = new Map();
let lastDist = 0;
function panUnit() {
  const vf2 = THREE.MathUtils.degToRad(camera.fov),
    hf2 = 2 * Math.atan(Math.tan(vf2 / 2) * camera.aspect);
  return (
    (2 * Math.tan(vf2 / 2) * (104 / Math.sin(Math.min(vf2, hf2) / 2) / viewCurrent.zoom)) /
    viewHeight
  );
}
function pdist() {
  const a = Array.from(ptrs.values());
  return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
}
glHost.addEventListener('pointerdown', function (e) {
  try {
    glHost.setPointerCapture(e.pointerId);
  } catch {
    /* captura de ponteiro indisponível: segue sem captura */
  }
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 2) lastDist = pdist();
});
glHost.addEventListener('pointermove', function (e) {
  const p = ptrs.get(e.pointerId);
  if (!p) return;
  const dx = e.clientX - p.x,
    dy = e.clientY - p.y;
  p.x = e.clientX;
  p.y = e.clientY;
  if (walker.on) {
    walker.yaw -= dx * 0.0055;
    walker.pitch = clamp(walker.pitch - dy * 0.0045, -1.3, 1.3);
    return;
  }
  if (ptrs.size === 1) {
    viewTarget.rotY += dx * 0.0075;
    viewTarget.rotX = clamp(viewTarget.rotX + dy * 0.004, -0.2, 0.6);
  } else if (ptrs.size === 2) {
    const d = pdist();
    if (lastDist > 0) viewTarget.zoom = clamp((viewTarget.zoom * d) / lastDist, 0.55, 8);
    lastDist = d;
    const ppu = panUnit();
    viewTarget.panX = clamp(viewTarget.panX + dx * 0.5 * ppu, -90, 90);
    viewTarget.panY = clamp(viewTarget.panY - dy * 0.5 * ppu, -70, 90);
  }
});
function endPtr(e) {
  ptrs.delete(e.pointerId);
  lastDist = 0;
}
glHost.addEventListener('pointerup', endPtr);
glHost.addEventListener('pointercancel', endPtr);
glHost.addEventListener('lostpointercapture', endPtr);
glHost.addEventListener(
  'wheel',
  function (e) {
    e.preventDefault();
    if (walker.on) return;
    viewTarget.zoom = clamp(viewTarget.zoom * Math.exp(-e.deltaY * 0.0012), 0.55, 8);
  },
  { passive: false },
);

$('#s-xray').addEventListener('input', function (e) {
  setLift(parseFloat(e.target.value));
});
