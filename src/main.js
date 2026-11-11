import * as THREE from 'three';
import { clamp, smooth } from './core/math.js';
import { C } from './core/color.js';
import { toonMat, hullMat, waterMat, pondMat } from './core/materials.js';
import { cylG } from './core/geometries.js';
import { BFL, GF, UF } from './config/dimensions.js';
import { K, MARB, PAL } from './config/palette.js';
import { validateData } from './data/validate.js';
import { SECTORS } from './data/sectors.js';
import { LABELS } from './data/labels.js';
import { BOM } from './data/bom.js';
import { AURA } from './data/aura.js';
import { ROOMS, roomRect } from './data/rooms.js';
import { FPSPOT } from './data/fpspots.js';
import { $, stage, glHost, reduce } from './app/page.js';
import {
  surface,
  under,
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
import { ledGroups } from './world/animation.js';
import {
  bunkerBatch,
  FL,
  neonBatch,
  CY,
  NEON,
  netBatch,
  GRN,
  glowBatch,
  ledBatchA,
  ledBatchB,
  ledBatchC,
  bunkerWallBatch,
  hatchBatch,
  capMat,
  bunkCapMesh,
} from './world/bunker/shell.js';
import { plant } from './world/bunker/fixtures.js';
import { buildMasterSuite } from './world/bunker/rooms/master-suite.js';
import { buildParentsSuite } from './world/bunker/rooms/parents-suite.js';
import { buildSisterRoom } from './world/bunker/rooms/sister-room.js';
import { buildNieceRoom } from './world/bunker/rooms/niece-room.js';
import { buildGuestRoom } from './world/bunker/rooms/guest-room.js';

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

  /* =================== FILEIRA DOS FUNDOS: dormitórios (x −11,4 → 10,1) =================== */
  /* ---- SUÍTE CYBERPUNK DO MESTRE (7,0 × 16,6 m): closet · lounge e estação dev · cama-casulo com mosquiteiro · banheiro ---- */
  buildMasterSuite(roomRect('Suíte cyberpunk do Mestre'));
  buildParentsSuite(roomRect('Suíte dos pais'));
  buildSisterRoom(roomRect('Quarto da irmã'));
  buildNieceRoom(roomRect('Quarto da sobrinha'));
  buildGuestRoom(roomRect('Quarto do convidado'));

  /* =================== FILEIRA DOS FUNDOS: técnico (x 10,1 → 27,4) =================== */
  /* datacenter imerso */
  [
    [11.5, -68.4],
    [14.5, -68.4],
    [11.5, -65.4],
    [14.5, -65.4],
    [11.5, -62.4],
    [14.5, -62.4],
    [11.5, -59.4],
    [14.5, -59.4],
  ].forEach(function (t, n) {
    bunkerBatch.addBox(2.2, 1.0, 1.4, K.steel, t[0], FL, t[1]);
    bunkerBatch.addBox(2.0, 0.1, 1.2, 0x2c6f78, t[0], FL + 1.0, t[1]);
    glowBatch.addBox(1.8, 0.05, 1.0, 0x35e0b0, t[0], FL + 1.1, t[1]);
    ledBatchA.addBox(1.4, 0.06, 0.04, [CY, GRN][n % 2], t[0], FL + 0.6, t[1] + 0.72);
  });
  for (let i = 0; i < 5; i++) {
    const rx = 10.95 + i * 1.1;
    bunkerBatch.addBox(0.95, 2.3, 0.9, PAL.dark.graphite, rx, FL, -71.9);
    for (let j = 0; j < 10; j++)
      for (let k = 0; k < 3; k++)
        [ledBatchA, ledBatchB, ledBatchC][(i + j + k) % 3].addBox(
          0.12,
          0.07,
          0.04,
          [CY, GRN, PAL.flora.violet, PAL.neon.amber][(i * 3 + j + k) % 4],
          rx - 0.28 + k * 0.28,
          FL + 0.25 + j * 0.2,
          -71.42,
        );
  }
  /* laboratórios */
  bunkerBatch.addBox(0.9, 0.95, 12, K.white, 16.6, FL, -64.2);
  bunkerBatch.addBox(1.0, 0.07, 12.1, PAL.metal.blueSteel, 16.6, FL + 0.95, -64.2);
  bunkerBatch.addBox(0.9, 0.95, 12, K.white, 19.5, FL, -64.2);
  bunkerBatch.addBox(1.0, 0.07, 12.1, PAL.metal.blueSteel, 19.5, FL + 0.95, -64.2);
  [-70.5, -67.5, -64.5, -61.5].forEach(function (z, n) {
    bunkerBatch.addCylinder(0.2, 1.0, K.white, 16.6, FL + 1.02, z, 10);
    bunkerBatch.addSphere(0.35, PAL.glass.showerGlass, 16.6, FL + 1.7, z, 1, 1, 1, 1);
    bunkerBatch.addBox(0.6, 0.5, 0.6, [K.steelD, K.white][n % 2], 19.5, FL + 1.02, z);
    glowBatch.addBox(0.3, 0.3, 0.04, CY, 19.2, FL + 1.3, z);
  });
  bunkerBatch.addBox(1.2, 1.9, 1.0, K.steel, 18.0, FL, -57.2);
  /* sala limpa */
  bunkerBatch.addBox(1.4, 0.9, 3.0, 0x191c22, 21.6, FL, -69.6);
  bunkerBatch.addBox(0.7, 0.5, 0.9, K.white, 21.4, FL + 0.9, -70.2);
  glowBatch.addBox(0.6, 0.04, 0.8, PAL.neon.violet, 21.4, FL + 0.9, -70.2);
  bunkerBatch.addBox(0.2, 1.2, 0.2, K.steelD, 21.4, FL + 1.4, -70.2);
  bunkerBatch.addCylinder(0.5, 3.0, PAL.light.tileGrey, 22.4, FL, -64.6, 12);
  bunkerBatch.addBox(1.1, 1.1, 1.1, K.white, 21.6, FL, -59.4);
  ledBatchC.addBox(0.2, 0.06, 6, PAL.neon.violet, 21.5, FL + 3.2, -64);
  /* suporte de vida e baterias térmicas */
  [-70.6, -68.2, -65.8, -63.4].forEach(function (bz) {
    bunkerBatch.addGeometry(
      cylG(1, 16),
      K.steel,
      25.2,
      FL + 1.0,
      bz,
      [0.7, 3.0, 0.7],
      [0, 0, Math.PI / 2],
    );
    bunkerBatch.addGeometry(
      cylG(1, 16),
      K.orange,
      23.7,
      FL + 1.0,
      bz,
      [0.55, 0.14, 0.55],
      [0, 0, Math.PI / 2],
    );
    bunkerBatch.addBox(0.2, 1.0, 0.2, K.steelD, 24.4, FL, bz);
    bunkerBatch.addBox(0.2, 1.0, 0.2, K.steelD, 26.0, FL, bz);
    ledBatchC.addBox(0.12, 0.9, 0.9, 0xff7a2a, 23.6, FL + 0.55, bz);
  });
  [
    [24.2, -60.6],
    [25.4, -60.6],
    [26.6, -60.6],
  ].forEach(function (t) {
    bunkerBatch.addCylinder(0.5, 2.4, K.blue, t[0], FL, t[1], 12);
    bunkerBatch.addCylinder(0.52, 0.2, K.steel, t[0], FL + 2.4, t[1], 12);
  });
  for (let i = 0; i < 4; i++) {
    bunkerBatch.addCylinder(0.24, 0.9, K.red, 24.0 + i * 0.7, FL, -58.2, 8);
    bunkerBatch.addCylinder(0.18, 0.2, K.white, 24.0 + i * 0.7, FL + 0.9, -58.2, 8);
  }

  /* =================== FILEIRA DA FRENTE (x −11,4 → 27,4) =================== */
  /* estar, jantar e cozinha (13,6 × 14,6 m) */
  bunkerBatch.addBox(8.0, 0.9, 0.7, PAL.light.linen, -4.4, FL + 0.06, -52.7);
  bunkerBatch.addBox(8.1, 0.06, 0.8, PAL.light.cream, -4.4, FL + 0.96, -52.7);
  bunkerBatch.addBox(0.8, 0.12, 0.5, K.steel, -6.4, FL + 1.0, -52.7);
  bunkerBatch.addCylinder(0.035, 0.3, K.steel, -6.4, FL + 1.12, -52.5, 5);
  bunkerBatch.addBox(0.9, 0.1, 0.6, K.black, -3.4, FL + 1.02, -52.7);
  bunkerBatch.addBox(0.9, 1.9, 0.8, K.white, 0.9, FL + 0.06, -52.7);
  bunkerBatch.addBox(2.0, 0.1, 0.8, K.steelD, -3.4, FL + 2.5, -52.9);
  bunkerBatch.addBox(3.2, 0.95, 1.1, PAL.light.linen, -4.6, FL + 0.06, -49.4);
  bunkerBatch.addBox(3.3, 0.06, 1.2, MARB, -4.6, FL + 1.01, -49.4);
  for (let i = 0; i < 4; i++)
    bunkerBatch.addCylinder(0.22, 0.6, K.woodD, -5.8 + i * 0.8, FL + 0.06, -48.2, 8);
  bunkerBatch.addBox(3.4, 0.08, 1.3, K.woodD, -4.6, FL + 0.76, -44.6);
  [
    [-1.5, -0.5],
    [1.5, -0.5],
    [-1.5, 0.5],
    [1.5, 0.5],
  ].forEach(function (l) {
    bunkerBatch.addBox(0.12, 0.7, 0.12, K.woodD, -4.6 + l[0], FL + 0.06, -44.6 + l[1]);
  });
  for (let i = 0; i < 4; i++) {
    bunkerBatch.addBox(0.42, 0.5, 0.42, K.woodL, -5.9 + i * 0.8, FL + 0.06, -46.0);
    bunkerBatch.addBox(0.42, 0.5, 0.42, K.woodL, -5.9 + i * 0.8, FL + 0.06, -43.2);
  }
  bunkerBatch.addBox(0.42, 0.5, 0.42, K.woodL, -7.7, FL + 0.06, -44.6);
  bunkerBatch.addBox(0.42, 0.5, 0.42, K.woodL, -1.5, FL + 0.06, -44.6);
  bunkerBatch.addBox(1.0, 0.5, 3.8, PAL.fabric.royalBlue, -9.6, FL + 0.06, -41.9);
  bunkerBatch.addBox(0.3, 0.8, 3.8, PAL.fabric.royalBlue, -10.4, FL + 0.06, -41.9);
  bunkerBatch.addBox(3.2, 0.5, 1.0, PAL.fabric.royalBlue, -7.8, FL + 0.06, -39.9);
  bunkerBatch.addBox(1.0, 0.4, 1.0, K.woodD, -8.2, FL + 0.06, -42.2);
  bunkerBatch.addCylinder(1.6, 0.03, PAL.fabric.rust, -8.4, FL + 0.06, -43.0, 22);
  bunkerBatch.addBox(0.1, 1.5, 3.2, PAL.dark.void, -11.15, FL + 1.0, -47.5);
  neonBatch.addBox(0.02, 1.4, 3.1, PAL.neon.blue, -11.05, FL + 1.05, -47.5);
  bunkerBatch.addBox(0.5, 0.4, 2.6, K.woodD, -10.9, FL + 0.06, -47.5);
  bunkerBatch.addBox(2.2, 1.1, 0.5, PAL.dark.slate, 0.4, FL + 0.06, -40.2);
  neonBatch.addBox(1.8, 0.04, 0.04, PAL.neon.amber, 0.4, FL + 0.9, -39.9);
  [[-0.4], [0.4], [1.2]].forEach(function (s) {
    bunkerBatch.addCylinder(0.2, 0.5, K.woodD, s[0], FL + 0.06, -41.0, 8);
  }); /* bar com bancos */
  plant(-10.8, -52.6, 1.3);
  plant(1.7, -45.0, 1.3);
  neonBatch.addBox(12, 0.05, 0.05, PAL.light.warmGlow, -4.6, FL + 3.3, -46);
  /* despensa 90 dias */
  function addBunkerPantryItem(x, y, z, n) {
    const m = n % 5;
    if (m === 0 || m === 3)
      bunkerBatch.addCylinder(
        0.12,
        0.3,
        [
          PAL.flora.coral,
          PAL.flora.marigold,
          PAL.flora.sage,
          PAL.light.wheat,
          PAL.flora.purple,
          PAL.clay.copperBrown,
        ][n % 6],
        x,
        y,
        z,
        6,
      );
    else if (m === 1) bunkerBatch.addCylinder(0.09, 0.2, K.steel, x, y, z, 6);
    else if (m === 2) bunkerBatch.addBox(0.34, 0.24, 0.3, PAL.clay.sandGold, x, y, z);
    else
      bunkerBatch.addBox(
        0.3,
        0.3,
        0.3,
        [K.woodL, PAL.clay.mustard, PAL.clay.terracotta][n % 3],
        x,
        y,
        z,
      );
  }
  function shelfZ(z1, z2, x) {
    const L = z2 - z1;
    const n = Math.floor(L / 0.5);
    const nu = Math.round(L / 1.5);
    for (let a = 0; a < 3; a++) {
      bunkerBatch.addBox(0.5, 0.06, L, K.woodL, x, FL + 0.6 + a * 0.7, (z1 + z2) / 2);
      for (let b = 0; b < n; b++)
        addBunkerPantryItem(x, FL + 0.66 + a * 0.7, z1 + 0.25 + b * 0.5, b + a * 3);
    }
    for (let c = 0; c <= nu; c++)
      bunkerBatch.addBox(0.54, 2.3, 0.08, K.woodD, x, FL + 0.06, z1 + (c * L) / nu);
  }
  shelfZ(-52.4, -39.4, 2.6);
  shelfZ(-52.4, -39.4, 5.4);
  for (let i = 0; i < 4; i++)
    bunkerBatch.addCylinder(
      0.4,
      0.9,
      K.wood,
      3.5 + (i % 2) * 1.0,
      FL + 0.06,
      -47 + ((i / 2) | 0) * 1.0,
      10,
      0.37,
    );
  bunkerBatch.addBox(1.4, 0.85, 0.7, K.white, 4.0, FL + 0.06, -40.6);
  /* cinema e jogos */
  bunkerBatch.addBox(5.2, 2.6, 0.2, PAL.dark.void, 9.1, FL + 0.6, -52.9);
  neonBatch.addBox(4.9, 2.3, 0.04, PAL.neon.blue, 9.1, FL + 0.75, -52.78);
  [-50.0, -47.8].forEach(function (z, n) {
    for (let i = 0; i < 3; i++) {
      bunkerBatch.addBox(0.9, 0.5, 0.9, PAL.fabric.burgundy, 7.2 + i * 1.5, FL + 0.06 + n * 0.3, z);
      bunkerBatch.addBox(
        0.9,
        0.7,
        0.2,
        PAL.fabric.burgundy,
        7.2 + i * 1.5,
        FL + 0.4 + n * 0.3,
        z + 0.45,
      );
    }
  });
  bunkerBatch.addBox(2.4, 0.8, 1.3, 0x1a5a3a, 8.6, FL + 0.06, -42.4);
  bunkerBatch.addBox(2.5, 0.1, 1.4, K.woodD, 8.6, FL + 0.8, -42.4);
  bunkerBatch.addCylinder(0.1, 0.1, PAL.light.white, 8.2, FL + 0.92, -42.4, 8);
  bunkerBatch.addCylinder(0.1, 0.1, PAL.flora.tomatoRed, 8.9, FL + 0.92, -42.4, 8);
  bunkerBatch.addBox(0.08, 0.08, 1.5, K.woodD, 11.6, FL + 1.4, -42.4);
  neonBatch.addBox(2.2, 0.04, 0.04, NEON, 8.6, FL + 2.4, -42.4);
  for (let i = 0; i < 2; i++) {
    bunkerBatch.addBox(0.9, 1.8, 0.8, PAL.dark.slate, 10.2 + i * 1.1, FL + 0.06, -39.6);
    neonBatch.addBox(0.7, 0.5, 0.04, [NEON, CY][i], 10.2 + i * 1.1, FL + 1.2, -39.98);
  }
  neonBatch.addBox(6.2, 0.05, 0.05, CY, 9.1, FL + 3.3, -46);
  /* hidroponia */
  [14.2, 16.4, 18.6].forEach(function (hx) {
    for (let j = 0; j < 4; j++) {
      bunkerBatch.addBox(1.0, 0.08, 12.4, K.steelD, hx, FL + 0.5 + j * 0.7, -46.2);
      for (let k = 0; k < 19; k++)
        bunkerBatch.addSphere(
          0.26,
          [PAL.flora.cropGreenA, PAL.flora.cropGreenC, PAL.flora.lime][(k + j) % 3],
          hx + (k % 2 ? 0.2 : -0.2),
          FL + 0.78 + j * 0.7,
          -52.0 + k * 0.62,
          1,
          0.8,
          1,
        );
      neonBatch.addBox(0.9, 0.03, 12.0, 0xd44cff, hx, FL + 0.38 + j * 0.7, -46.2);
    }
    bunkerBatch.addBox(0.1, 3.0, 12.4, K.steelD, hx - 0.55, FL, -46.2);
    bunkerBatch.addBox(0.1, 3.0, 12.4, K.steelD, hx + 0.55, FL, -46.2);
  });
  bunkerBatch.addCylinder(0.5, 1.4, K.blue, 13.0, FL, -39.8, 10);
  bunkerBatch.addCylinder(0.5, 1.4, K.blue, 19.6, FL, -39.8, 10);
  /* oficina maker */
  bunkerBatch.addBox(0.8, 0.95, 10, K.woodL, 26.8, FL, -46.2);
  bunkerBatch.addBox(0.9, 0.06, 10.1, PAL.light.cream, 26.8, FL + 0.95, -46.2);
  [-51, -49, -47].forEach(function (pz) {
    bunkerBatch.addBox(0.5, 0.5, 0.5, K.white, 26.8, FL + 1.01, pz);
    glowBatch.addBox(0.3, 0.3, 0.04, CY, 26.54, FL + 1.3, pz);
  });
  bunkerBatch.addBox(1.6, 1.5, 1.4, K.steelD, 22.2, FL, -51.6);
  glowBatch.addBox(1.0, 0.5, 0.05, PAL.neon.amber, 22.2, FL + 0.8, -50.9);
  bunkerBatch.addBox(2.2, 0.8, 0.8, K.steel, 22.2, FL, -47.4);
  bunkerBatch.addCylinder(0.3, 0.5, K.black, 21.4, FL + 0.8, -47.4, 8);
  bunkerBatch.addBox(1.0, 0.9, 0.9, K.red, 21.6, FL, -43.4);
  bunkerBatch.addBox(1.2, 0.12, 2.4, K.steelD, 24.2, FL, -41.2);
  for (let i = 0; i < 4; i++)
    bunkerBatch.addBox(0.2, 0.2, 0.9, K.woodL, 24.2, FL + 0.12 + i * 0.2, -41.2);
  bunkerBatch.addBox(0.2, 0.2, 1.6, K.yellow, 22.6, FL + 0.06, -40.6);
  bunkerBatch.addBox(0.9, 0.05, 1.6, K.steelD, 22.6, FL + 0.26, -40.6);
  for (let i = 0; i < 9; i++)
    bunkerBatch.addBox(
      0.1,
      0.3,
      0.5 + (i % 3) * 0.12,
      [K.red, K.steel, K.yellow][i % 3],
      27.3,
      FL + 1.3 + (i % 3) * 0.4,
      -51 + i * 1.0,
    );

  bunkerWallBatch.build(under);
  bunkerBatch.build(under);
  glowBatch.build(under, { unlit: true, outline: false });
  neonBatch.build(under, { unlit: true, outline: false });
  const netMat = toonMat.clone();
  netMat.transparent = true;
  netMat.opacity = 0.3;
  netMat.depthWrite = false;
  netMat.side = THREE.DoubleSide;
  netBatch.build(under, { mat: netMat, outline: false });
  hatchBatch.build(surface);
  [ledBatchA, ledBatchB, ledBatchC].forEach(function (L) {
    ledGroups.push(L.build(under, { unlit: true, outline: false }));
  });

  /* sombra falsa chapada sob a maquete */
  (function () {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x2a2018,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    );
    m.rotation.x = -Math.PI / 2;
    m.scale.set(108, 158, 1);
    m.position.set(3, -10.12, 3);
    diorama.add(m);
  })();

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
  function fpHud() {
    hudEl = hudEl || $('#fp-hud');
    const r = roomAt(walker.x, walker.z, walker.lvl),
      t = r
        ? r[0] + ' · ' + Math.round((r[3] - r[1]) * (r[4] - r[2])) + ' m²'
        : 'Sítio Vale do Café';
    if (t !== hudLast) {
      hudLast = t;
      hudEl.textContent = t;
    }
  }
  const PLQ = [];
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
      focusOn(d.k);
    });
    labelsHost.appendChild(el);
    const line = document.createElementNS(NS, 'line'),
      dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '3');
    svg.appendChild(line);
    svg.appendChild(dot);
    return { d: d, anchor: anchor, el: el, line: line, dot: dot, w: 0, h: 0 };
  });
  let needMeasure = true;
  let showLabels = true;
  const vTmp = new THREE.Vector3();
  function measure() {
    labelItems.forEach(function (it) {
      it.el.hidden = false;
      it.w = it.el.offsetWidth;
      it.h = it.el.offsetHeight;
    });
    needMeasure = false;
  }

  function updateLabels(W, H) {
    if (!showLabels || walker.on) return;
    if (needMeasure) measure();
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
      it.vis =
        !hide && vTmp.z < 1 && it.sx > -20 && it.sx < W + 20 && it.sy > -20 && it.sy < H + 20;
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

  /* ================= CÂMERA E ESTADO ================= */
  const viewTarget = {
    rotY: -0.55,
    rotX: 0.17,
    zoom: 1.12,
    panX: 0,
    panY: 0,
    lift: 0,
    f: new THREE.Vector3(2, -4, 2),
  };
  const viewCurrent = {
    rotY: -0.55,
    rotX: 0.17,
    zoom: 1.12,
    panX: 0,
    panY: 0,
    lift: 0,
    f: new THREE.Vector3(2, -4, 2),
  };
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
    needMeasure = true;
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
    showLabels = !showLabels;
    e.currentTarget.setAttribute('aria-pressed', String(showLabels));
    e.currentTarget.textContent = 'Legendas: ' + (showLabels ? 'on' : 'off');
    document.body.classList.toggle('nolabels', !showLabels);
    if (showLabels) needMeasure = true;
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
  const walker = {
    on: false,
    x: 1,
    z: -50.6,
    yaw: 0,
    pitch: 0,
    lvl: 's',
    eye: 1.7,
    eyeY: 1.9,
    jx: 0,
    jy: 0,
    keys: {},
    prevLift: 0,
    bob: 0,
    moved: 0,
  };
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
    needMeasure = true;
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
