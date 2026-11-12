import * as THREE from 'three';
import { clamp, smooth } from './core/math.js';
import { hullMat } from './core/materials.js';
import { UF } from './config/dimensions.js';
import { validateData } from './data/validate.js';
import { SECTORS } from './data/sectors.js';
import { BOM } from './data/bom.js';
import { $, reduce } from './app/page.js';
import { surface, diorama, camera, renderer, SUNDIR, sun, scene } from './world/scene.js';
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
import { viewTarget, viewCurrent, walker, simulation } from './app/state.js';
import './world/finish.js';
import './ui/hud.js';
import { updateLabels } from './ui/labels.js';
import { focusOn, resize, subView, viewWidth, viewHeight, setInfo, SECTOR } from './ui/camera.js';
import './ui/orbit.js';
import './ui/controls.js';
import { setDrawer } from './ui/drawers.js';
import { fpStep, fpGo, enterFP, exitFP } from './ui/firstperson.js';

(function () {
  'use strict';
  validateData().forEach(function (problem) {
    console.error('[dados] ' + problem);
  });

  /* ================= DADOS ================= */

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
