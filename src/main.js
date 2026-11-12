import * as THREE from 'three';
import { clamp, smooth } from './core/math.js';
import { C } from './core/color.js';
import { hullMat, waterMat, pondMat } from './core/materials.js';
import { BFL, GF, UF } from './config/dimensions.js';
import { validateData } from './data/validate.js';
import { SECTORS } from './data/sectors.js';
import { BOM } from './data/bom.js';
import { AURA } from './data/aura.js';
import { FPSPOT } from './data/fpspots.js';
import { $, stage, glHost, reduce } from './app/page.js';
import {
  surface,
  diorama,
  camera,
  renderer,
  SUNDIR,
  sun,
  colliders,
  scene,
} from './world/scene.js';
import './world/terrain.js';
import './world/sisteminha.js';
import './world/flora.js';
import { barnG, barnRoofG, barnWalls } from './world/engenho.js';
import {
  casaG,
  casaUp,
  casaRoofG,
  casaUpW,
  flrMat,
  roofMat,
  casaWalls,
} from './world/casa/base.js';
import { casaBaseMesh } from './world/casa/ground-floor.js';
import './world/casa/upper-floor.js';
import './world/casa/porch.js';
import './world/casa/roof.js';
import './world/yard.js';
import { wheelSpin } from './world/waterwheel.js';
import { rotor } from './world/windmill.js';
import { animals } from './world/animals.js';
import { fishList } from './world/fish.js';
import './world/foam.js';
import { capMat, bunkCapMesh } from './world/bunker/shell.js';
import './world/bunker/index.js';
import { viewTarget, viewCurrent, walker } from './app/state.js';
import './world/finish.js';
import { fpHud, PLQ } from './ui/hud.js';
import { labelState, labelHooks, updateLabels } from './ui/labels.js';

(function () {
  'use strict';
  validateData().forEach(function (problem) {
    console.error('[dados] ' + problem);
  });

  /* ================= DADOS ================= */
  const SECTOR = {};
  SECTORS.forEach(function (s) {
    SECTOR[s.k] = s;
  });

  /* ================= UI: dados ================= */
  const gridEl = $('#sector-grid'),
    chipsEl = $('#chips');
  SECTORS.forEach(function (s) {
    [gridEl, chipsEl].forEach(function (host) {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = s.n;
      b.dataset.sector = s.k;
      b.setAttribute('aria-pressed', s.k === 'overview' ? 'true' : 'false');
      b.addEventListener('click', function () {
        focusOn(s.k);
      });
      host.appendChild(b);
    });
  });
  (function () {
    const host = $('#bom-body');
    BOM.forEach(function (c) {
      const d = document.createElement('section');
      d.className = 'cat';
      const h = document.createElement('h4');
      h.textContent = c.t;
      const sp = document.createElement('span');
      sp.textContent = c.tag;
      h.appendChild(sp);
      const ul = document.createElement('ul');
      c.items.forEach(function (it) {
        const li = document.createElement('li');
        const b = document.createElement('b');
        b.textContent = it[0] + ': ';
        li.appendChild(b);
        li.appendChild(document.createTextNode(it[1]));
        ul.appendChild(li);
      });
      d.appendChild(h);
      d.appendChild(ul);
      host.appendChild(d);
    });
  })();

  /* ================= CÂMERA E ESTADO ================= */
  const simulation = { flow: 0.65, wind: 0.5 };
  let viewWidth = 1;
  let viewHeight = 1;

  function resize() {
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

  let subView = false;
  function focusOn(key) {
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
    const chip = chipsEl.querySelector('[data-sector="' + key + '"]');
    if (chip && chip.scrollIntoView) {
      try {
        chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      } catch {
        /* rolagem suave indisponível: segue sem rolar */
      }
    }
  }
  labelHooks.onPick = focusOn;
  function setInfo(s) {
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
  function setLift(pct) {
    viewTarget.lift = pct;
    const sl = $('#s-xray');
    sl.value = pct;
    $('#o-xray').textContent = Math.round(pct) + '%';
  }

  /* ================= INTERAÇÃO ================= */
  const ptrs = new Map();
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
  simulation.speed = 1;
  simulation.season = 'set';
  simulation.hour = 0;
  function sunVec(h, decl) {
    const lat = (-22.4 * Math.PI) / 180,
      d = (decl * Math.PI) / 180,
      ha = ((h - 12) * 15 * Math.PI) / 180;
    const se = Math.sin(lat) * Math.sin(d) + Math.cos(lat) * Math.cos(d) * Math.cos(ha),
      el = Math.asin(se);
    const az =
      Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(d) * Math.cos(lat)) +
      Math.PI;
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

  /* painel e gavetas: a maquete se reenquadra no espaço que sobra */
  const panelEl = $('#panel');
  const mobileQ = window.matchMedia('(max-width:899px)');
  let openDrawer = null;
  function syncBody() {
    const panelOpen = panelEl.classList.contains('open');
    document.body.classList.toggle('sheet-open', mobileQ.matches && (panelOpen || !!openDrawer));
    document.body.classList.toggle('drawer-open', !!openDrawer);
    $('#d-panel').setAttribute('aria-expanded', String(panelOpen));
    $('#d-bom').setAttribute('aria-pressed', String(openDrawer === 'bom'));
    $('#d-aura').setAttribute('aria-pressed', String(openDrawer === 'aura'));
  }
  function setDrawer(id) {
    ['bom', 'aura'].forEach(function (k) {
      $('#' + k).hidden = k !== id;
    });
    openDrawer = id || null;
    if (id && mobileQ.matches) panelEl.classList.remove('open');
    syncBody();
  }
  $('#d-panel').addEventListener('click', function () {
    const willOpen = !panelEl.classList.contains('open');
    if (willOpen) setDrawer(null);
    panelEl.classList.toggle('open', willOpen);
    syncBody();
  });
  ['#b-bom', '#d-bom'].forEach(function (s) {
    $(s).addEventListener('click', function () {
      setDrawer(openDrawer === 'bom' ? null : 'bom');
    });
  });
  ['#b-aura', '#d-aura'].forEach(function (s) {
    $(s).addEventListener('click', function () {
      setDrawer(openDrawer === 'aura' ? null : 'aura');
    });
  });
  document.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () {
      setDrawer(null);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (walker.on) exitFP();
      else setDrawer(null);
    }
  });
  if (mobileQ.addEventListener) mobileQ.addEventListener('change', syncBody);
  else if (mobileQ.addListener) mobileQ.addListener(syncBody);
  document.querySelectorAll('[data-ask]').forEach(function (b) {
    b.addEventListener('click', function () {
      const log = $('#aura-log'),
        d = document.createElement('div');
      d.className = 'msg';
      const h = document.createElement('b');
      h.textContent = 'Aura · relatório';
      d.appendChild(h);
      d.appendChild(document.createTextNode(AURA[b.dataset.ask]));
      log.appendChild(d);
      const body = log.parentElement;
      body.scrollTop = body.scrollHeight;
    });
  });

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
  function fpStep(dt) {
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
  function fpGo(key) {
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
  function enterFP() {
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
  function exitFP() {
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

  /* ================= LOOP ================= */
  const clock = new THREE.Clock();
  let elapsed = 0;
  const focusOffset = new THREE.Vector3();
  const motionScale = reduce ? 0.35 : 1;
  /* qualidade adaptativa: se a GPU não segura ~22 fps, baixa a resolução e depois tira os contornos */
  const adaptiveQuality = { lvl: 0, n: 0, sum: 0 };
  function autoQ(raw) {
    if (adaptiveQuality.lvl >= 2 || raw > 0.5) return;
    adaptiveQuality.n++;
    if (adaptiveQuality.n > 20) adaptiveQuality.sum += raw;
    if (adaptiveQuality.n < 100) return;
    const avg = adaptiveQuality.sum / 79;
    adaptiveQuality.n = 0;
    adaptiveQuality.sum = 0;
    if (avg > 0.045) {
      adaptiveQuality.lvl++;
      if (adaptiveQuality.lvl === 1) {
        renderer.setPixelRatio(1);
        resize();
      } else
        scene.traverse(function (o) {
          if (o.material === hullMat) o.visible = false;
        });
    }
  }
  function frame() {
    requestAnimationFrame(frame);
    const raw = clock.getDelta(),
      dt = Math.min(raw, 0.05),
      dtw = dt * simulation.speed;
    elapsed += dtw;
    autoQ(raw);
    const k = 1 - Math.pow(0.0008, dt);
    viewCurrent.rotY += (viewTarget.rotY - viewCurrent.rotY) * k;
    viewCurrent.rotX += (viewTarget.rotX - viewCurrent.rotX) * k;
    viewCurrent.zoom += (viewTarget.zoom - viewCurrent.zoom) * k;
    viewCurrent.panX += (viewTarget.panX - viewCurrent.panX) * k;
    viewCurrent.panY += (viewTarget.panY - viewCurrent.panY) * k;
    viewCurrent.lift += (viewTarget.lift - viewCurrent.lift) * k;
    viewCurrent.f.lerp(viewTarget.f, k);

    if (walker.on) {
      fpStep(dt);
      const fv = clamp(
        THREE.MathUtils.radToDeg(
          2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(42)) / camera.aspect),
        ),
        60,
        100,
      );
      camera.fov = fv;
      camera.near = 0.12;
      camera.far = 700;
      camera.updateProjectionMatrix();
      diorama.rotation.set(0, 0, 0);
      diorama.position.set(0, 0, 0);
      camera.position.set(walker.x, walker.eyeY, walker.z);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(walker.pitch, walker.yaw, 0);
      sun.position.copy(SUNDIR).multiplyScalar(260);
    } else {
      const vfov = THREE.MathUtils.degToRad(camera.fov),
        hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
      const dist = 104 / Math.sin(Math.min(vfov, hfov) / 2) / viewCurrent.zoom,
        elev = 0.5;
      camera.position.set(0, Math.sin(elev) * dist, Math.cos(elev) * dist);
      camera.lookAt(0, 0, 0);
      camera.near = Math.max(4, dist - 140);
      camera.far = dist + 320;
      camera.updateProjectionMatrix();

      diorama.rotation.set(viewCurrent.rotX, viewCurrent.rotY, 0);
      focusOffset.copy(viewCurrent.f).applyEuler(diorama.rotation);
      diorama.position.set(
        -focusOffset.x + viewCurrent.panX,
        -focusOffset.y + viewCurrent.panY,
        -focusOffset.z,
      );
      sun.position.copy(SUNDIR).applyEuler(diorama.rotation).multiplyScalar(260);
    }

    const ca = (walker.on ? Math.PI - walker.yaw : Math.PI - viewCurrent.rotY).toFixed(3) + 'rad';
    $('#compass-n').style.transform = 'rotate(' + ca + ')';
    $('#compass').style.setProperty('--a', ca);
    /* abertura do corte: telhados sobem e paredes rebaixam, revelando o interior */
    const u = clamp(viewCurrent.lift / 100, 0, 1),
      e = u * u * (3 - 2 * u),
      wcut = smooth(0.1, 0.95, u);
    casaRoofG.position.set(0, 20 * e, -7 * e);
    casaUp.position.y = UF + 9 * e;
    casaUpW.scale.y = 1 - 0.62 * wcut;
    barnRoofG.position.set(0, 13 * e, -5 * e);
    const capO = 1 - 0.97 * smooth(0.04, 0.4, u);
    capMat.opacity = capO;
    capMat.transparent = capO < 0.995;
    capMat.depthWrite = capO > 0.6;
    bunkCapMesh.visible = capO > 0.03;
    flrMat.opacity = capO;
    flrMat.transparent = capO < 0.995;
    flrMat.depthWrite = capO > 0.6;
    if (casaBaseMesh) casaBaseMesh.visible = capO > 0.03;
    const hideTop = subView && u > 0.9;
    casaG.visible = !hideTop;
    barnG.visible = !hideTop;
    const ro = 1 - 0.88 * smooth(0.55, 0.95, u);
    roofMat.opacity = ro;
    roofMat.transparent = ro < 0.995;
    roofMat.depthWrite = ro > 0.6;
    [casaRoofG, barnRoofG].forEach(function (g) {
      g.traverse(function (c) {
        if (c.material === hullMat) c.visible = ro > 0.6;
      });
    });
    casaWalls.scale.y = 1 - 0.62 * wcut;
    barnWalls.scale.y = 1 - 0.58 * wcut;

    surface.userData.tick(dtw, elapsed, {
      flow: simulation.flow * motionScale,
      wind: simulation.wind * motionScale,
    });

    diorama.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    renderer.render(scene, camera);
    updateLabels(viewWidth, viewHeight);
  }
  setInfo(SECTOR.overview);
  frame();
  setTimeout(function () {
    focusOn('overview');
  }, 60);
  /* Ganchos de depuração/teste: só existem com ?debug na URL. */
  if (new URLSearchParams(window.location.search).has('debug')) {
    window.__sitio = {
      THREE: THREE,
      scene: scene,
      diorama: diorama,
      hull: hullMat,
      viewTarget: viewTarget,
      walker: walker,
      fpGo: fpGo,
      enterFP: enterFP,
      exitFP: exitFP,
      state: function () {
        return {
          adaptiveQuality: adaptiveQuality.lvl,
          lift: viewCurrent.lift,
          casaRoofY: casaRoofG.position.y,
          barnRoofY: barnRoofG.position.y,
          wallsY: casaWalls.scale.y,
          wheel: wheelSpin.rotation.z,
          rotor: rotor.rotation.z,
          fish: fishList.length,
          animals: animals.length,
          tri: renderer.info.render.triangles,
          calls: renderer.info.render.calls,
        };
      },
      focusOn: focusOn,
      setDrawer: setDrawer,
      panel: function () {
        $('#d-panel').click();
      },
    };
  }
})();
