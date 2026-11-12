import * as THREE from 'three';
import { hullMat } from './core/materials.js';
import { validateData } from './data/validate.js';
import { $ } from './app/page.js';
import { diorama, renderer, scene } from './world/scene.js';
import './world/terrain.js';
import './world/sisteminha.js';
import './world/flora.js';
import { barnRoofG } from './world/engenho.js';
import { casaRoofG, casaWalls } from './world/casa/base.js';
import './world/casa/ground-floor.js';
import './world/casa/upper-floor.js';
import './world/casa/porch.js';
import './world/casa/roof.js';
import './world/yard.js';
import { wheelSpin } from './world/waterwheel.js';
import { rotor } from './world/windmill.js';
import { animals } from './world/animals.js';
import { fishList } from './world/fish.js';
import './world/foam.js';
import './world/bunker/shell.js';
import './world/bunker/index.js';
import { viewTarget, viewCurrent, walker } from './app/state.js';
import './world/finish.js';
import './ui/hud.js';
import './ui/labels.js';
import { focusOn, setInfo, SECTOR } from './ui/camera.js';
import './ui/orbit.js';
import './ui/controls.js';
import { setDrawer } from './ui/drawers.js';
import { fpGo, enterFP, exitFP } from './ui/firstperson.js';
import './ui/lists.js';
import { frame, adaptiveQuality } from './app/loop.js';

('use strict');
validateData().forEach(function (problem) {
  console.error('[dados] ' + problem);
});
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
