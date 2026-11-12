/* 1ª pessoa (Orbwalk): colisão, escada, passos, joystick virtual, teclado e olhar livre. */
import { clamp } from '../core/math.js';
import { BFL, GF, UF } from '../config/dimensions.js';
import { FPSPOT } from '../data/fpspots.js';
import { $ } from '../app/page.js';
import { camera, colliders } from '../world/scene.js';
import { viewTarget, viewCurrent, walker } from '../app/state.js';
import { fpHud, PLQ } from './hud.js';
import { labelState } from './labels.js';
import { setLift, resize } from './camera.js';
import { setDrawer, panelEl, syncBody } from './drawers.js';
import { ptrs } from './orbit.js';

/* ================= 1ª PESSOA (ORBWALK): joystick virtual + olhar livre ================= */
const FPR = 0.38;
function stairY(lx, lz) {
  return clamp(GF + ((9.4 - lz) / 6.6) * (UF - GF), GF, UF);
}
function lvlFloor(x, z, lvl) {
  if (lvl === 'u') return BFL;
  const lx = x - 1,
    lz = z + 58;
  if (Math.abs(lx) < 1.1 && lz > 2.8 && lz < 9.9 && (lvl === 'a' || lvl === 's'))
    return stairY(lx, lz);
  if (lvl === 'a') return UF;
  if (Math.abs(lx) < 13.3 && lz > -10.3 && lz < 13.5) return GF; /* térreo da casa e varanda */
  if (Math.abs(lx) < 3.3 && lz >= 13.5 && lz < 16.8)
    return GF * (1 - (lz - 13.5) / 3.3); /* escadaria de mármore */
  if (x > 21 && x < 43 && z > -43 && z < -33) return 0.2;
  if (x > 21 && x < 39 && z > -32 && z < -13) return 0.2;
  return 0;
}
function fpBlocked(x, z, lvl) {
  const r = FPR;
  let b;
  for (let i = 0; i < colliders.length; i++) {
    b = colliders[i];
    if (b[4] !== lvl) continue;
    if (x > b[0] - r && x < b[2] + r && z > b[1] - r && z < b[3] + r) return true;
  }
  if (lvl === 's') {
    if (x < -49 || x > 42.4 || z < -73.5 || z > 73.5) return true;
  } else if (lvl === 'u') {
    if (x < -11.0 || x > 27.0 || z < -72.0 || z > -39.0) return true;
  } else if (Math.abs(x - 1) > 13.3 || z + 58 < -10.3 || z + 58 > 12.6) return true;
  return false;
}
export function fpStep(dt) {
  const k = walker.keys;
  let jx = walker.jx + (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0);
  let jy = walker.jy + (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0);
  let m = Math.hypot(jx, jy);
  if (m > 1) {
    jx /= m;
    jy /= m;
    m = 1;
  }
  if (m > 0.06) {
    const sp = 3.0 * (m > 0.92 ? 1.7 : 1) * (k.shift ? 1.6 : 1),
      fx = -Math.sin(walker.yaw),
      fz = -Math.cos(walker.yaw),
      rx = Math.cos(walker.yaw),
      rz = -Math.sin(walker.yaw);
    const vx = (fx * jy + rx * jx) * sp * dt,
      vz = (fz * jy + rz * jx) * sp * dt;
    if (!fpBlocked(walker.x + vx, walker.z, walker.lvl)) walker.x += vx;
    if (!fpBlocked(walker.x, walker.z + vz, walker.lvl)) walker.z += vz;
    walker.bob += dt * m * 8;
    walker.moved += Math.hypot(vx, vz);
    const fy = lvlFloor(walker.x, walker.z, walker.lvl),
      inSt = Math.abs(walker.x - 1) < 1.1 && walker.z + 58 > 2.8 && walker.z + 58 < 9.9;
    if (inSt) {
      if (walker.lvl === 's' && fy > 4.55) walker.lvl = 'a';
      else if (walker.lvl === 'a' && fy < 4.45) walker.lvl = 's';
    }
  }
  const target =
    lvlFloor(walker.x, walker.z, walker.lvl) +
    walker.eye +
    Math.sin(walker.bob) * 0.025 * Math.min(1, m);
  walker.eyeY += (target - walker.eyeY) * Math.min(1, dt * 9);
  fpHud();
}
function fpMarks() {
  document.querySelectorAll('[data-fpeye]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(parseFloat(b.dataset.fpeye) === walker.eye));
  });
  document.querySelectorAll('[data-fplvl]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.fplvl === walker.spot));
  });
}
export function fpGo(key) {
  const s = FPSPOT[key];
  if (!s) return;
  walker.x = s.x;
  walker.z = s.z;
  walker.yaw = s.yaw;
  walker.pitch = 0;
  walker.lvl = s.lvl;
  walker.spot = key;
  walker.eyeY = lvlFloor(walker.x, walker.z, walker.lvl) + walker.eye;
  PLQ.forEach(function (q) {
    q.visible = true;
  });
  fpMarks();
}
export function enterFP() {
  if (walker.on) return;
  walker.on = true;
  walker.prevLift = viewTarget.lift;
  setLift(0);
  viewCurrent.lift = 0;
  setDrawer(null);
  panelEl.classList.remove('open');
  syncBody();
  document.body.classList.add('fp');
  $('#fp-ui').hidden = false;
  const b = $('#fp-btn');
  b.setAttribute('aria-pressed', 'true');
  b.textContent = '✕ Sair da 1ª pessoa';
  ptrs.clear();
  fpGo('ground');
  resize();
}
export function exitFP() {
  if (!walker.on) return;
  walker.on = false;
  walker.jx = walker.jy = 0;
  walker.keys = {};
  $('#fp-knob').style.transform = '';
  document.body.classList.remove('fp');
  $('#fp-ui').hidden = true;
  PLQ.forEach(function (q) {
    q.visible = false;
  });
  const b = $('#fp-btn');
  b.setAttribute('aria-pressed', 'false');
  b.textContent = '🕹️ 1ª Pessoa (Orbwalk)';
  camera.fov = 26;
  setLift(walker.prevLift);
  labelState.needMeasure = true;
  resize();
}
$('#fp-btn').addEventListener('click', function () {
  if (walker.on) exitFP();
  else enterFP();
});
document.querySelectorAll('[data-fpeye]').forEach(function (b) {
  b.addEventListener('click', function () {
    walker.eye = parseFloat(b.dataset.fpeye);
    fpMarks();
  });
});
document.querySelectorAll('[data-fplvl]').forEach(function (b) {
  b.addEventListener('click', function () {
    fpGo(b.dataset.fplvl);
  });
});
/* joystick analógico */
const joy = $('#fp-joy');
const knob = $('#fp-knob');
let joyId = null;
const JR = 52;
function joyMove(e) {
  const r = joy.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width / 2);
  let dy = e.clientY - (r.top + r.height / 2);
  const d = Math.hypot(dx, dy);
  if (d > JR) {
    dx *= JR / d;
    dy *= JR / d;
  }
  knob.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
  walker.jx = dx / JR;
  walker.jy = -dy / JR;
}
function joyEnd(e) {
  if (e.pointerId !== joyId) return;
  joyId = null;
  walker.jx = walker.jy = 0;
  knob.style.transform = '';
}
joy.addEventListener('pointerdown', function (e) {
  joyId = e.pointerId;
  try {
    joy.setPointerCapture(e.pointerId);
  } catch {
    /* captura de ponteiro indisponível: segue sem captura */
  }
  joyMove(e);
  e.preventDefault();
});
joy.addEventListener('pointermove', function (e) {
  if (e.pointerId === joyId) joyMove(e);
});
joy.addEventListener('pointerup', joyEnd);
joy.addEventListener('pointercancel', joyEnd);
joy.addEventListener('lostpointercapture', joyEnd);
/* teclado (desktop) */
document.addEventListener('keydown', function (e) {
  if (!walker.on) return;
  walker.keys[e.key.toLowerCase()] = true;
  if (e.key.indexOf('Arrow') === 0) e.preventDefault();
});
document.addEventListener('keyup', function (e) {
  delete walker.keys[e.key.toLowerCase()];
});
window.addEventListener('blur', function () {
  walker.keys = {};
});
/* Esc: sai da 1ª pessoa ou fecha a gaveta */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (walker.on) exitFP();
    else setDrawer(null);
  }
});
