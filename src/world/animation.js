/* Animação do mundo: laço de `surface.userData.tick` (roda, rotor, animais, peixes, espuma, balizas e LEDs). */
import { rr } from '../core/random.js';
import { C } from '../core/color.js';
import { K, PAL } from '../config/palette.js';
import { surface } from './scene.js';
import { wheelSpin } from './waterwheel.js';
import { rotor } from './windmill.js';
import { fishList } from './fish.js';
import { animals } from './animals.js';
import { beacons } from './yard.js';
import { foam, splash } from './foam.js';

export const ledGroups = [];
let splashT = 0;
const SEPARATION = { pig: 1.7, hen: 0.6, goat: 1.3 };

/* espuma do córrego */
function tickFoam(dt, t, s) {
  for (let i = 0; i < foam.length; i++) {
    const f = foam[i];
    f.m.position.z += f.v * dt * (0.5 + s.flow);
    if (f.m.position.z > f.z1) f.m.position.z = f.z0;
    f.m.scale.x = 0.8 + Math.sin(t * 3 + i) * 0.25;
  }
}

/* respingos de cubos junto às pás: nascem em ritmo ligado à vazão e caem em arco */
function spawnSplash() {
  for (let k = 0; k < splash.length; k++)
    if (splash[k].life <= 0) {
      const p = splash[k];
      p.life = rr(0.5, 0.95);
      p.m.visible = true;
      p.m.position.set(45.5 + rr(-1.5, 1.5), -0.4, -41.2 + rr(-1.5, -0.1) + 0);
      p.vx = rr(-0.8, 0.8);
      p.vy = rr(3.5, 6.5);
      p.vz = rr(-3, 1.5);
      break;
    }
}

function moveSplash(dt) {
  for (let j = 0; j < splash.length; j++) {
    const q = splash[j];
    if (q.life <= 0) continue;
    q.life -= dt;
    q.vy -= 14 * dt;
    q.m.position.x += q.vx * dt;
    q.m.position.y += q.vy * dt;
    q.m.position.z += q.vz * dt;
    q.m.rotation.x += dt * 5;
    q.m.rotation.y += dt * 4;
    const sc = Math.max(0.05, q.life * 1.4);
    q.m.scale.setScalar(Math.min(1, sc));
    if (q.life <= 0 || q.m.position.y < -0.55) {
      q.life = 0;
      q.m.visible = false;
    }
  }
}

function tickSplash(dt, s) {
  splashT += dt * (8 + s.flow * 18);
  while (splashT > 1) {
    splashT -= 1;
    spawnSplash();
  }
  moveSplash(dt);
}

/* peixes em círculo */
function tickFish(dt, t) {
  fishList.forEach(function (fh) {
    fh.a += fh.sp * dt;
    fh.g.position.set(
      fh.cx + Math.cos(fh.a) * fh.r,
      fh.y + Math.sin(t * 2 + fh.a * 3) * 0.02,
      fh.cz + Math.sin(fh.a) * fh.r,
    );
    fh.g.rotation.y = -fh.a + (fh.sp > 0 ? -Math.PI / 2 : Math.PI / 2);
  });
}

/* animais passeando */
function tickAnimals(dt, t) {
  animals.forEach(function (a) {
    a.ph += a.sp * dt;
    const x = a.cx + Math.cos(a.ph) * a.rx,
      z = a.cz + Math.sin(a.ph * 1.3) * a.rz,
      dx = -Math.sin(a.ph) * a.rx * (a.sp > 0 ? 1 : -1),
      dz = Math.cos(a.ph * 1.3) * a.rz * 1.3 * (a.sp > 0 ? 1 : -1);
    a.g.position.set(
      x,
      0.2 +
        Math.abs(Math.sin(t * (a.kind === 'hen' ? 9 : 4) + a.ph * 7)) *
          (a.kind === 'hen' ? 0.08 : 0.04),
      z,
    );
    a.g.rotation.y = Math.atan2(-dz, dx) * (a.sp > 0 ? 1 : 1);
  });
}

/* afastamento: animais da mesma espécie não se atravessam */
function separateAnimals() {
  for (let ia = 0; ia < animals.length; ia++)
    for (let ib = ia + 1; ib < animals.length; ib++) {
      const A = animals[ia],
        B = animals[ib];
      if (A.kind !== B.kind) continue;
      const ddx = B.g.position.x - A.g.position.x,
        ddz = B.g.position.z - A.g.position.z,
        dd = Math.sqrt(ddx * ddx + ddz * ddz) || 0.001,
        mn = SEPARATION[A.kind];
      if (dd < mn) {
        const pu = (mn - dd) / 2 / dd;
        A.g.position.x -= ddx * pu;
        A.g.position.z -= ddz * pu;
        B.g.position.x += ddx * pu;
        B.g.position.z += ddz * pu;
      }
    }
}

/* giroflex e LEDs */
function tickLights(t) {
  beacons.forEach(function (bc, n) {
    const on = Math.floor(t * 2.2 + n * 0.4) % 2 === 0;
    bc.mesh.material.color.copy(C(on ? PAL.flora.sunflower : K.orange));
    bc.mesh.scale.setScalar(on ? 1.15 : 0.9);
    bc.bar.rotation.y = t * 7 + n;
  });
  ledGroups.forEach(function (lg, n) {
    lg.visible = Math.floor(t * (1.6 + n * 0.35) + n) % 4 !== 0;
  });
}

/* ================= ANIMAÇÃO ================= */
surface.userData.tick = function (dt, t, s) {
  /* roda d'água e moinho em velocidade constante e suave */
  const ws = (0.5 + s.flow * 1.6) * 0.8;
  wheelSpin.rotation.z -= dt * ws;
  rotor.rotation.z += dt * (0.5 + s.wind * 2.0);
  tickFoam(dt, t, s);
  tickSplash(dt, s);
  tickFish(dt, t);
  tickAnimals(dt, t);
  separateAnimals();
  tickLights(t);
};
