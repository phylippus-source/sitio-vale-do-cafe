/* HUD da 1ª pessoa (nome do ambiente) e placas das portas. */
import * as THREE from 'three';
import { BFL, GF } from '../config/dimensions.js';
import { ROOMS } from '../data/rooms.js';
import { $ } from '../app/page.js';
import { under } from '../world/scene.js';
import { barnG } from '../world/engenho.js';
import { casaG, casaUp } from '../world/casa/base.js';
import { walker } from '../app/state.js';

/* ================= HUD DA 1ª PESSOA E PLACAS DE PORTA ================= */
function roomAt(x, z, lvl) {
  for (let i = 0; i < ROOMS.length; i++) {
    const r = ROOMS[i];
    if (r[5] === lvl && x >= r[1] && x <= r[3] && z >= r[2] && z <= r[4]) return r;
  }
  return null;
}
let hudEl = null;
let hudLast = '';
export function fpHud() {
  hudEl = hudEl || $('#fp-hud');
  const r = roomAt(walker.x, walker.z, walker.lvl),
    t = r ? r[0] + ' · ' + Math.round((r[3] - r[1]) * (r[4] - r[2])) + ' m²' : 'Sítio Vale do Café';
  if (t !== hudLast) {
    hudLast = t;
    hudEl.textContent = t;
  }
}
export const PLQ = [];
function plaque(parent, txt, x, y, z, ry) {
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 64;
  const c = cv.getContext('2d');
  c.fillStyle = '#2b1d12';
  c.fillRect(0, 0, 256, 64);
  c.strokeStyle = '#d4a24a';
  c.lineWidth = 4;
  c.strokeRect(3, 3, 250, 58);
  c.fillStyle = '#f6e7c3';
  c.font = 'bold 26px Georgia, serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(txt, 128, 34);
  const tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.25),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  m.position.set(x, y, z);
  m.rotation.y = ry || 0;
  m.visible = false;
  parent.add(m);
  PLQ.push(m);
}
/* casa: placas nas portas internas (coordenadas locais da casa) */
plaque(casaG, 'CAPELA', -6.75, GF + 3.05, 5.7, Math.PI / 2);
plaque(casaG, 'ESCRITÓRIO', 6.75, GF + 3.05, 5.7, -Math.PI / 2);
plaque(casaG, 'SALA DE JANTAR', 0, GF + 3.3, -3.8, 0);
plaque(casaG, 'COZINHA', -6.75, GF + 3.05, -6.3, Math.PI / 2);
plaque(casaG, 'DESPENSA', 6.75, GF + 3.05, -6.4, -Math.PI / 2);
plaque(casaG, 'BANHEIROS', 6.75, GF + 3.05, -1.85, -Math.PI / 2);
plaque(casaUp, 'CORREDOR DAS SUÍTES', 0, 3.2, 2.3, 0);
plaque(casaUp, 'SALA ÍNTIMA', 0, 3.2, -1.2, 0);
plaque(barnG, 'ENGENHO 1850', -6.0, 4.2, 4.4, Math.PI);
plaque(barnG, 'OFICINA', 3.0, 4.2, 4.4, Math.PI);
plaque(under, 'SUÍTE DO MESTRE', -8.2, BFL + 2.9, -55.6, 0);
plaque(under, 'PAIS', -2.3, BFL + 2.9, -55.6, 0);
plaque(under, 'IRMÃ', 2.0, BFL + 2.9, -55.6, 0);
plaque(under, 'SOBRINHA', 5.5, BFL + 2.9, -55.6, 0);
plaque(under, 'CONVIDADO', 8.6, BFL + 2.9, -55.6, 0);
plaque(under, 'DATACENTER', 13.1, BFL + 2.9, -55.6, 0);
plaque(under, 'LABORATÓRIOS', 18.05, BFL + 2.9, -55.6, 0);
plaque(under, 'SALA LIMPA', 21.5, BFL + 2.9, -55.6, 0);
plaque(under, 'SUPORTE DE VIDA', 25.2, BFL + 2.9, -55.6, 0);
plaque(under, 'DESPENSA', 4.0, BFL + 2.9, -53.0, Math.PI);
plaque(under, 'CINEMA E JOGOS', 9.1, BFL + 2.9, -53.0, Math.PI);
plaque(under, 'HIDROPONIA', 16.4, BFL + 2.9, -53.0, Math.PI);
plaque(under, 'OFICINA MAKER', 23.9, BFL + 2.9, -53.0, Math.PI);
