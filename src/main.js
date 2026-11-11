import * as THREE from 'three';
import { clamp, smooth } from './core/math.js';
import { R, rr } from './core/random.js';
import { C } from './core/color.js';
import { toonMat, hullMat, waterMat, pondMat } from './core/materials.js';
import { GX, cylG, coneG } from './core/geometries.js';
import { Batch } from './core/Batch.js';
import { hipGeo } from './core/geometry.js';
import {
  FLOOR,
  BFL,
  BWH,
  GF,
  GHT,
  UF,
  UHT,
  BUNKER_INNER,
  CASA_ORIGIN,
  BARN_ORIGIN,
} from './config/dimensions.js';
import { K, CW, WHT, IRON, MARB, AZB, AZW, TERRA, PAL } from './config/palette.js';
import { validateData } from './data/validate.js';
import { SECTORS } from './data/sectors.js';
import { LABELS } from './data/labels.js';
import { BOM } from './data/bom.js';
import { AURA } from './data/aura.js';
import { ROOMS } from './data/rooms.js';
import { FPSPOT } from './data/fpspots.js';
import { TANKS } from './data/sisteminha.js';
import { $, stage, glHost, reduce } from './app/page.js';
import {
  surface,
  addCollider,
  under,
  diorama,
  camera,
  renderer,
  SUNDIR,
  sun,
  colliders,
  scene,
} from './world/scene.js';
import { pondX, pondZ, waterBatch, pondBatch, surfaceBatch } from './world/terrain.js';
import './world/sisteminha.js';
import './world/flora.js';

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

  /* ================= ENGENHO 1850 · 22 × 10 m ================= */
  const barnG = new THREE.Group();
  barnG.position.set(BARN_ORIGIN.x, BARN_ORIGIN.y, BARN_ORIGIN.z);
  surface.add(barnG);
  const barnWalls = new THREE.Group(),
    barnRoofG = new THREE.Group();
  barnG.add(barnWalls);
  barnG.add(barnRoofG);
  const BH = 4.8,
    BTH = Math.atan2(3.6, 6.1);
  addCollider(21, -43, 43, -42.2);
  addCollider(21, -43, 21.8, -33);
  addCollider(42.2, -43, 43, -33);
  addCollider(21, -33.8, 28.5, -33);
  addCollider(33.5, -33.8, 38, -33);
  addCollider(39.4, -33.8, 43, -33); /* engenho: portão 5 m e porta de 1,4 m */
  (function () {
    const barnWallBatch = new Batch();
    const barnRoofBatch = new Batch();
    const barnInteriorBatch = new Batch();
    const barnUnlitBatch = new Batch();
    const glassC = PAL.glass.windowDeep;
    let i;
    /* paredes de pedra com 80 cm */
    barnWallBatch.addBox(22, BH, 0.8, K.stone, 0, 0, -4.6);
    barnWallBatch.addBox(0.8, BH, 10, K.stone, -10.6, 0, 0);
    barnWallBatch.addBox(0.8, BH, 10, K.stone, 10.6, 0, 0);
    barnWallBatch.addBox(7.5, BH, 0.8, K.stone, -7.25, 0, 4.6);
    barnWallBatch.addBox(4.5, BH, 0.8, K.stone, 3.75, 0, 4.6);
    barnWallBatch.addBox(3.6, BH, 0.8, K.stone, 9.2, 0, 4.6);
    barnWallBatch.addBox(5.0, 0.8, 0.8, K.stone, -1, 4.0, 4.6);
    barnWallBatch.addBox(1.4, 1.8, 0.8, K.stone, 6.7, 3.0, 4.6);
    [1, 2, 3, 4].forEach(function (y) {
      barnWallBatch.addBox(22, 0.09, 0.05, K.stoneD, 0, y, -5.02);
      barnWallBatch.addBox(0.05, 0.09, 10, K.stoneD, -11.02, y, 0);
      barnWallBatch.addBox(0.05, 0.09, 10, K.stoneD, 11.02, y, 0);
      barnWallBatch.addBox(7.5, 0.09, 0.05, K.stoneD, -7.25, y, 5.02);
      barnWallBatch.addBox(4.5, 0.09, 0.05, K.stoneD, 3.75, y, 5.02);
      barnWallBatch.addBox(3.6, 0.09, 0.05, K.stoneD, 9.2, y, 5.02);
    });
    for (i = 0; i < 5; i++)
      [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].forEach(function (c) {
        barnWallBatch.addBox(
          i % 2 ? 1.1 : 0.8,
          0.96,
          i % 2 ? 0.8 : 1.1,
          K.stoneL,
          c[0] * 10.7,
          i * 0.96,
          c[1] * 4.6,
        );
      });
    /* janelas e portas */
    [
      [-7.25, 5.02],
      [9.4, 5.02],
    ].forEach(function (p) {
      barnWallBatch.addBox(1.8, 1.7, 0.1, K.ocre, p[0], 1.6, p[1]);
      barnWallBatch.addBox(1.5, 1.4, 0.12, glassC, p[0], 1.75, p[1] + 0.02);
      barnWallBatch.addBox(0.08, 1.4, 0.14, K.woodD, p[0], 1.75, p[1] + 0.03);
    });
    [-7, 0, 7].forEach(function (x) {
      barnWallBatch.addBox(1.8, 1.7, 0.1, K.ocre, x, 1.8, -5.02);
      barnWallBatch.addBox(1.5, 1.4, 0.12, glassC, x, 1.95, -5.03);
    });
    [-11.02, 11.02].forEach(function (x) {
      [-2, 2].forEach(function (z) {
        barnWallBatch.addBox(0.1, 1.7, 1.8, K.ocre, x, 1.8, z);
        barnWallBatch.addBox(0.12, 1.4, 1.5, glassC, x, 1.95, z);
      });
    });
    barnWallBatch.addBox(0.5, 4.0, 1.1, K.woodD, -3.5, 0, 4.6);
    barnWallBatch.addBox(0.5, 4.0, 1.1, K.woodD, 1.5, 0, 4.6);
    barnWallBatch.addBox(1.3, 2.9, 0.2, K.wood, 6.7, 0, 4.75);
    barnWallBatch.addBox(0.12, 2.9, 0.26, K.woodD, 6.7, 0, 4.78);
    barnWallBatch.addBox(1.6, 0.14, 0.3, K.woodD, 6.7, 2.9, 4.76);
    barnWallBatch.build(barnWalls);

    /* telhado de duas águas + 48 painéis solares na vertente frontal */
    const ridgeY = BH + 3.6,
      sn = Math.sin(BTH),
      cs = Math.cos(BTH),
      slopeLen = Math.hypot(6.1, 3.6) + 0.3;
    [1, -1].forEach(function (sg) {
      const tm = slopeLen / 2 - 0.1;
      barnRoofBatch.addGeometry(
        GX.box,
        K.roof,
        0,
        ridgeY - tm * sn + 0.0,
        sg * tm * cs,
        [24, 0.3, slopeLen],
        [sg * BTH, 0, 0],
      );
      for (let t = 0.6; t < slopeLen - 0.3; t += 0.75) {
        barnRoofBatch.addGeometry(
          GX.box,
          K.roofD,
          0,
          ridgeY - t * sn + 0.18 * cs,
          sg * (t * cs + 0.18 * sn),
          [24, 0.05, 0.09],
          [sg * BTH, 0, 0],
        );
      }
    });
    for (let pr = 0; pr < 3; pr++)
      for (let pc = 0; pc < 16; pc++) {
        const t = 1.5 + pr * 1.95,
          px = -9.6 + pc * 1.28,
          d = 0.26;
        barnRoofBatch.addGeometry(
          GX.box,
          K.steel,
          px,
          ridgeY - t * sn + d * cs,
          t * cs + d * sn,
          [1.2, 0.08, 1.82],
          [BTH, 0, 0],
        );
        barnRoofBatch.addGeometry(
          GX.box,
          [0x2c5aa6, 0x27509a][(pr + pc) % 2],
          px,
          ridgeY - t * sn + (d + 0.06) * cs,
          t * cs + (d + 0.06) * sn,
          [1.1, 0.06, 1.7],
          [BTH, 0, 0],
        );
      }
    barnRoofBatch.addBox(24.4, 0.3, 0.55, K.roofD, 0, ridgeY - 0.02, 0);
    const tri = new THREE.Shape();
    tri.moveTo(-5.4, 0);
    tri.lineTo(5.4, 0);
    tri.lineTo(0, 3.35);
    const gg = new THREE.ExtrudeGeometry(tri, { depth: 0.8, bevelEnabled: false });
    gg.translate(0, 0, -0.4);
    gg.rotateY(Math.PI / 2);
    barnRoofBatch.addGeometry(gg, K.stone, -10.6, BH, 0);
    barnRoofBatch.addGeometry(gg, K.stone, 10.6, BH, 0);
    barnRoofBatch.addBox(1.4, 5.2, 1.4, K.stone, 7, BH - 0.2, -2.5);
    barnRoofBatch.addBox(1.8, 0.3, 1.8, K.stoneD, 7, BH + 5.0, -2.5);
    barnRoofBatch.build(barnRoofG);

    /* interior: engenho de 1850 à esquerda, oficina moderna à direita */
    barnInteriorBatch.addBox(21.4, 0.16, 9.2, 0xcbc4b4, 0, 0, 0);
    barnInteriorBatch.addBeam([-10.4, 2.0, -3.2], [10.9, 2.0, -3.2], 0.14, K.steel, 8);
    [-9, -4.5, 0, 4.5, 9].forEach(function (x) {
      barnInteriorBatch.addBox(0.5, 0.4, 0.5, PAL.clay.ochreDark, x, 1.8, -3.2);
      barnInteriorBatch.addBox(0.36, 1.8, 0.36, K.woodD, x, 0.16, -3.7);
    });
    [-8, -4, 2, 6].forEach(function (x) {
      barnInteriorBatch.addGeometry(
        cylG(1, 16),
        K.woodL,
        x,
        2.0,
        -3.2,
        [0.9, 0.34, 0.9],
        [0, 0, Math.PI / 2],
      );
    });
    [
      [-8, -8.2, -1.6],
      [-4, -5.0, -1.8],
      [2, -1.5, -1.8],
      [6, 4.0, -3.2],
    ].forEach(function (m) {
      barnInteriorBatch.addBeam([m[0], 1.7, -3.2], [m[1], 0.9, m[2]], 0.05, K.black, 4);
    });
    /* serra de fita */
    barnInteriorBatch.addBox(0.5, 3.4, 1.3, K.steelD, -8.6, 0.16, -1.6);
    barnInteriorBatch.addGeometry(
      cylG(1, 16),
      K.steel,
      -8.6,
      3.0,
      -1.6,
      [0.9, 0.18, 0.9],
      [Math.PI / 2, 0, 0],
    );
    barnInteriorBatch.addGeometry(
      cylG(1, 16),
      K.steel,
      -8.6,
      0.8,
      -1.6,
      [0.9, 0.18, 0.9],
      [Math.PI / 2, 0, 0],
    );
    barnInteriorBatch.addBox(0.05, 2.2, 0.1, K.black, -8.0, 0.8, -1.6);
    barnInteriorBatch.addBox(3.0, 0.16, 2.2, K.woodL, -8.6, 1.1, -0.6);
    barnInteriorBatch.addGeometry(
      cylG(1, 8),
      K.woodD,
      -8.6,
      1.55,
      -0.6,
      [0.38, 2.4, 0.38],
      [0, 0, Math.PI / 2],
    );
    /* moenda de pedra de 80 cm */
    barnInteriorBatch.addBox(2.2, 0.8, 2.2, K.woodD, -4.2, 0.16, -1.9);
    barnInteriorBatch.addCylinder(0.8, 0.3, K.concD, -4.2, 0.96, -1.9, 18);
    barnInteriorBatch.addCylinder(0.72, 0.3, 0xb7b3a9, -4.2, 1.26, -1.9, 18);
    barnInteriorBatch.addGeometry(
      coneG(4),
      K.wood,
      -4.2,
      2.1,
      -1.9,
      [0.8, 1.0, 0.8],
      [Math.PI, Math.PI / 4, 0],
    );
    for (i = 0; i < 4; i++)
      barnInteriorBatch.addBox(
        0.5,
        0.6,
        0.4,
        [0xdcc590, 0xd2b97f][i % 2],
        -2.6 + i * 0.55,
        0.16,
        -0.6,
      );
    /* engenho de cana de 3 rolos (300 L/h) */
    barnInteriorBatch.addBox(2.4, 0.35, 1.8, K.woodD, -1.4, 0.16, -2.0);
    [
      [-1.4, -1.4],
      [-0.6, -2.4],
      [-2.2, -2.4],
    ].forEach(function (p) {
      barnInteriorBatch.addCylinder(0.3, 1.5, PAL.clay.ochreDark, p[0], 0.5, p[1], 12);
      barnInteriorBatch.addCylinder(0.42, 0.12, K.steel, p[0], 2.0, p[1], 10);
    });
    barnInteriorBatch.addBeam([-3.3, 0.5, -0.4], [-0.4, 1.1, -0.9], 0.1, 0x7fb544, 5);
    barnInteriorBatch.addBeam([-3.3, 0.7, -0.2], [-0.4, 1.3, -0.7], 0.1, 0x6aa238, 5);
    barnInteriorBatch.addBeam([-3.3, 0.9, -0.6], [-0.4, 1.0, -1.1], 0.1, 0x93c654, 5);
    /* bomba de pistão duplo */
    [-9.3, -8.5].forEach(function (x) {
      barnInteriorBatch.addCylinder(0.36, 1.3, K.red, x, 0.16, 2.6, 10);
      barnInteriorBatch.addCylinder(0.07, 1.1, K.steel, x, 1.4, 2.6, 6);
    });
    barnInteriorBatch.addBox(1.4, 0.14, 0.14, K.steel, -8.9, 2.5, 2.6);
    /* forja de ferreiro com bigorna e fole */
    barnInteriorBatch.addBox(2.4, 1.3, 1.8, PAL.clay.terracotta, -5.4, 0.16, 2.9);
    barnInteriorBatch.addCone(1.1, 1.5, K.steelD, -5.4, 1.46, 2.9, 4);
    barnInteriorBatch.addCylinder(0.22, 2.0, K.steelD, -5.4, 2.96, 2.9, 8);
    barnUnlitBatch.addBox(1.6, 0.12, 1.0, PAL.flora.pumpkin, -5.4, 1.46, 2.9);
    barnInteriorBatch.addCylinder(0.38, 0.8, K.woodD, -3.4, 0.16, 2.8, 8);
    barnInteriorBatch.addBox(0.9, 0.28, 0.4, K.black, -3.4, 0.96, 2.8);
    barnInteriorBatch.addBox(0.3, 0.2, 0.3, K.black, -2.9, 1.1, 2.8);
    barnInteriorBatch.addBox(1.0, 0.7, 0.9, 0x8a5a30, -7, 0.16, 1.8);
    /* elevador oculto (3 × 5 m, 4,5 t) sob a porta da garagem */
    barnInteriorBatch.addBox(3.0, 0.1, 5.0, K.yellow, -1, 0.16, 2.2);
    for (i = 0; i < 6; i++)
      barnInteriorBatch.addBox(3.0, 0.12, 0.38, K.black, -1, 0.16, -0.1 + i * 0.9);
    /* oficina moderna: torno Nardini, fresadora, solda, prensa de 30 t, bancada */
    barnInteriorBatch.addBox(3.0, 0.9, 1.0, K.steelD, 4, 0.16, -3.2);
    barnInteriorBatch.addBox(3.2, 0.5, 0.9, 0x3d6b9e, 4, 1.06, -3.2);
    barnInteriorBatch.addBox(0.8, 0.9, 0.9, 0x2f5a8a, 2.8, 1.56, -3.2);
    barnInteriorBatch.addCylinder(0.3, 0.5, K.steel, 2.5, 1.8, -3.2, 10, 0.3, [0, 0, Math.PI / 2]);
    barnInteriorBatch.addBox(0.5, 0.6, 0.5, K.steel, 5.5, 1.56, -3.2);
    barnInteriorBatch.addBox(1.2, 0.4, 1.2, PAL.fabric.emerald, 7.2, 0.16, -3.2);
    barnInteriorBatch.addBox(0.5, 2.4, 0.5, PAL.fabric.emerald, 7.2, 0.56, -3.6);
    barnInteriorBatch.addBox(0.9, 0.6, 1.2, PAL.fabric.emerald, 7.2, 2.8, -3.1);
    barnInteriorBatch.addBox(1.5, 0.2, 1.0, K.steel, 7.2, 1.5, -2.9);
    barnInteriorBatch.addBox(2.4, 0.18, 1.3, K.steelD, 8, 1.0, -0.6);
    [
      [-1, -0.5],
      [1, -0.5],
      [-1, 0.5],
      [1, 0.5],
    ].forEach(function (l) {
      barnInteriorBatch.addBox(0.16, 0.9, 0.16, K.steelD, 8 + l[0], 0.16, -0.6 + l[1]);
    });
    barnInteriorBatch.addBox(0.9, 1.0, 0.9, K.red, 9.4, 0.16, 0.6);
    barnInteriorBatch.addBeam([9.0, 1.0, 0.4], [8.0, 1.4, -0.6], 0.05, K.black, 4);
    [
      [7.6, 1.3, -0.6, 0.16, PAL.light.white],
      [7.9, 1.45, -0.5, 0.12, 0x9fe3ff],
      [7.3, 1.35, -0.8, 0.1, 0xfff0a0],
      [8.0, 1.5, -0.7, 0.1, PAL.light.white],
      [7.7, 1.55, -0.9, 0.08, PAL.flora.sunflower],
    ].forEach(function (s) {
      barnUnlitBatch.addGeometry(GX.ico0, s[4], s[0], s[1], s[2], s[3]);
    });
    [4.4, 6.0].forEach(function (x) {
      barnInteriorBatch.addBox(0.28, 2.8, 0.28, K.red, x, 0.16, 1.4);
    });
    barnInteriorBatch.addBox(2.0, 0.4, 0.4, K.red, 5.2, 2.6, 1.4);
    barnInteriorBatch.addCylinder(0.22, 1.0, K.steel, 5.2, 1.6, 1.4, 8);
    barnInteriorBatch.addBox(1.6, 0.2, 0.7, K.red, 5.2, 0.16, 1.4);
    barnInteriorBatch.addBox(2.6, 0.14, 1.3, K.woodL, 7.2, 1.1, 3.7);
    [
      [-1.1, -0.5],
      [1.1, -0.5],
      [-1.1, 0.5],
      [1.1, 0.5],
    ].forEach(function (l) {
      barnInteriorBatch.addBox(0.12, 0.95, 0.12, K.woodD, 7.2 + l[0], 0.16, 3.7 + l[1]);
    });
    barnInteriorBatch.addBox(0.8, 0.5, 0.1, K.black, 6.6, 1.24, 3.3);
    barnUnlitBatch.addBox(0.7, 0.4, 0.02, 0x44ffb0, 6.6, 1.3, 3.36);
    barnInteriorBatch.addBox(0.4, 0.04, 0.3, PAL.fabric.jade, 7.4, 1.24, 3.8);
    barnInteriorBatch.addBox(0.3, 0.04, 0.25, PAL.fabric.jade, 7.9, 1.24, 3.5);
    barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 9.8, 0.16, -3.8);
    barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 9.8, 0.66, -3.8);
    barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 8.7, 0.16, -3.8);
    barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 9.5, 0.16, 3.0);
    barnInteriorBatch.addBox(1.0, 0.5, 0.6, K.red, 9.5, 0.66, 3.0);
    barnInteriorBatch.addBox(0.5, 0.12, 0.12, K.steel, 9.5, 1.2, 3.0);
    barnInteriorBatch.build(barnG);
    barnUnlitBatch.build(barnG, { unlit: true, outline: false });
  })();

  /* ================= CASA GRANDE · SOBRADO IMPERIAL REFORMADO · 26 × 20 m (2 pavimentos + porão alto) =================
   Tipologia (INEPAC / fazendas do Vale do Café): sobrado de planta retangular sobre porão alto de pedra, esteios de madeira e pau-a-pique,
   corpo central com frontão triangular, escadaria monumental de mármore com espelhos de azulejo e gradil de ferro, portas-janela com guarda-corpo de ferro,
   capela e escritório ladeando o hall, escada interna que se bifurca em social e serviço, sala central no sobrado, telhado de quatro águas em capa e canal. */
  const casaG = new THREE.Group();
  casaG.position.set(CASA_ORIGIN.x, CASA_ORIGIN.y, CASA_ORIGIN.z);
  surface.add(casaG);
  const flrMat = toonMat.clone();
  let casaBaseMesh;
  const casaWalls = new THREE.Group(),
    casaRoofG = new THREE.Group(),
    casaUp = new THREE.Group(),
    casaUpW = new THREE.Group();
  casaG.add(casaWalls);
  casaG.add(casaRoofG);
  casaG.add(casaUp);
  casaUp.add(casaUpW);
  /* piso térreo, pé-direito térreo, piso do sobrado, pé-direito do sobrado */
  casaUp.position.y = UF;
  const roofMat = toonMat.clone();
  roofMat.side = THREE.DoubleSide;
  function addCasaCollider(x1, z1, x2, z2, lv) {
    addCollider(x1 + CASA_ORIGIN.x, z1 + CASA_ORIGIN.z, x2 + CASA_ORIGIN.x, z2 + CASA_ORIGIN.z, lv);
  } /* colisão em coordenadas locais da casa */
  /* parede com vãos: eixo 'x' (ao longo de x, em z=fixed) ou 'z'. gaps [a,b,sill,top] (alturas a partir de y0) */
  function wall(B, axis, fixed, lo, hi, gaps, y0, h, th, color, lv, deco) {
    function addWallPiece(a, b, ya, yb) {
      if (b - a < 0.02 || yb - ya < 0.02) return;
      if (axis === 'x') B.addBox(b - a, yb - ya, th, color, (a + b) / 2, y0 + ya, fixed);
      else B.addBox(th, yb - ya, b - a, color, fixed, y0 + ya, (a + b) / 2);
    }
    function addWallCollider(a, b) {
      if (!lv) return;
      if (axis === 'x') addCasaCollider(a, fixed - th / 2, b, fixed + th / 2, lv);
      else addCasaCollider(fixed - th / 2, a, fixed + th / 2, b, lv);
    }
    let cur = lo;
    gaps = (gaps || []).slice().sort(function (p, q) {
      return p[0] - q[0];
    });
    gaps.forEach(function (g) {
      const sill = g[2] || 0,
        top = g[3] || h;
      addWallPiece(cur, g[0], 0, h);
      addWallCollider(cur, g[0]);
      if (sill > 0) {
        addWallPiece(g[0], g[1], 0, sill);
        addWallCollider(g[0], g[1]);
      }
      addWallPiece(g[0], g[1], top, h);
      if (deco) {
        const m = (g[0] + g[1]) / 2,
          w = g[1] - g[0],
          hh = top - sill;
        if (axis === 'x') {
          const s = deco,
            hf = th / 2;
          B.addBox(
            w + 0.5,
            0.22,
            th + 0.16,
            WHT,
            m,
            y0 + top - 0.04,
            fixed,
          ); /* verga (desce 4 cm: cobre a face inferior da parede) */
          B.addBox(
            w + 0.4,
            0.15,
            th + 0.2,
            WHT,
            m,
            y0 + sill - 0.12,
            fixed,
          ); /* peitoril (topo 3 cm acima do muro) */
          B.addBox(
            w,
            hh - 0.05,
            0.06,
            PAL.glass.windowDeep,
            m,
            y0 + sill + 0.01,
            fixed,
          ); /* vidro */
          B.addBox(0.16, hh - 0.02, th + 0.12, WHT, g[0] - 0.02, y0 + sill + 0.01, fixed);
          B.addBox(
            0.16,
            hh - 0.02,
            th + 0.12,
            WHT,
            g[1] + 0.02,
            y0 + sill + 0.01,
            fixed,
          ); /* ombreiras */
          B.addBox(
            0.06,
            hh - 0.06,
            0.08,
            K.woodD,
            m,
            y0 + sill + 0.03,
            fixed + 0.05 * s,
          ); /* montante */
          B.addGeometry(
            GX.box,
            WHT,
            m,
            y0 + top + 0.22 + 0.18,
            fixed,
            [w + 0.3, 0.36, th + 0.1],
            [0, 0, 0],
          ); /* cornija */
          const sz2 = fixed + (hf + 0.06) * s;
          B.addBox(
            w * 0.4,
            hh - 0.2,
            0.1,
            PAL.paint.shutterGreen,
            g[0] - w * 0.2 - 0.1,
            y0 + sill + 0.1,
            sz2,
          );
          B.addBox(
            w * 0.4,
            hh - 0.2,
            0.1,
            PAL.paint.shutterGreen,
            g[1] + w * 0.2 + 0.1,
            y0 + sill + 0.1,
            sz2,
          ); /* venezianas */
        }
      }
      cur = g[1];
    });
    addWallPiece(cur, hi, 0, h);
    addWallCollider(cur, hi);
  }
  (function () {
    const casaWallBatch = new Batch();
    const casaRoofBatch = new Batch();
    const casaInteriorBatch = new Batch();
    const casaUnlitBatch = new Batch();
    const porchBatch = new Batch();
    const upperWallBatch = new Batch();
    const upperInteriorBatch = new Batch();
    const upperUnlitBatch = new Batch();
    const porchLampBatch = new Batch();
    const casaBaseBatch = new Batch();
    let i;
    let j;
    const Y0 = GF,
      H = GHT;
    /* ---------- térreo: porão alto de pedra, paredes ocre, cunhais e cimalha brancos ---------- */
    casaBaseBatch.addBox(26.8, GF - 0.2, 20.8, K.stone, 0, 0, 0);
    for (i = 0; i < 4; i++) casaBaseBatch.addBox(26.9, 0.05, 20.9, K.stoneD, 0, 0.2 + i * 0.18, 0);
    [-9.5, -6.5, -3.5, 3.5, 6.5, 9.5].forEach(function (px) {
      casaWallBatch.addBox(0.6, 0.44, 0.16, PAL.dark.charcoal, px, 0.3, 10.46);
    }); /* respiros gradeados do porão */
    /* paredes externas */
    wall(
      casaWallBatch,
      'x',
      -10,
      -13,
      13,
      [
        [-9, -7.2, 0.9, 2.9],
        [-3.9, -2.1, 0.9, 2.9],
        [2.1, 3.9, 0.9, 2.9],
        [7.2, 9, 0.9, 2.9],
      ],
      Y0,
      H,
      0.5,
      CW,
      's',
      -1,
    );
    wall(
      casaWallBatch,
      'z',
      -13,
      -10,
      10,
      [
        [-6, -4.2, 0.9, 2.9],
        [-1, 0.8, 0.9, 2.9],
        [4.2, 6, 0.9, 2.9],
      ],
      Y0,
      H,
      0.5,
      CW,
      's',
      1,
    );
    wall(
      casaWallBatch,
      'z',
      13,
      -10,
      10,
      [
        [-6, -4.2, 0.9, 2.9],
        [-1, 0.8, 0.9, 2.9],
        [4.2, 6, 0.9, 2.9],
      ],
      Y0,
      H,
      0.5,
      CW,
      's',
      1,
    );
    wall(
      casaWallBatch,
      'x',
      10,
      -13,
      13,
      [
        [-11.4, -9.6, 0.9, 2.9],
        [-3.8, -2.6, 0.9, 2.9],
        [-1.3, 1.3, 0, 3.4],
        [2.6, 3.8, 0.9, 2.9],
        [9.6, 11.4, 0.9, 2.9],
      ],
      Y0,
      H,
      0.5,
      CW,
      's',
      1,
    );
    /* cunhais e cimalha */
    [
      [-13, -10],
      [13, -10],
      [-13, 10],
      [13, 10],
    ].forEach(function (c) {
      casaWallBatch.addBox(0.9, H + 0.2, 0.9, WHT, c[0], GF - 0.2, c[1]);
      casaWallBatch.addBox(1.0, 0.22, 1.0, K.stoneL, c[0], GF + H - 0.2, c[1]);
    });
    casaWallBatch.addBox(26.7, 0.32, 0.7, WHT, 0, GF + H - 0.28, 10.1);
    casaWallBatch.addBox(26.7, 0.32, 0.7, WHT, 0, GF + H - 0.28, -10.1);
    casaWallBatch.addBox(0.7, 0.32, 20.6, WHT, 13.1, GF + H - 0.28, 0);
    casaWallBatch.addBox(0.7, 0.32, 20.6, WHT, -13.1, GF + H - 0.28, 0);
    /* paredes internas (0,3 m) */
    const T = 0.3;
    wall(casaWallBatch, 'x', 2, -13, -7, [], Y0, H - 0.04, T, WHT, 's');
    wall(casaWallBatch, 'x', 2, -7, 13, [[-1.2, 1.2, 0, 3.2]], Y0, H - 0.04, T, WHT, 's');
    /* desenho da planta: capela | hall | escritório; sala de visitas e jantar ao centro; cozinha, copa e serviço nas alas */
    wall(
      casaWallBatch,
      'z',
      -7,
      -10,
      10,
      [
        [5, 6.4, 0, 3.0],
        [-7, -5.6, 0, 3.0],
        [-0.4, 0.8, 0, 3.0],
      ],
      Y0,
      H - 0.04,
      T,
      WHT,
      's',
    );
    wall(
      casaWallBatch,
      'z',
      7,
      -10,
      10,
      [
        [5, 6.4, 0, 3.0],
        [-7, -5.8, 0, 3.0],
        [-2.5, -1.2, 0, 3.0],
      ],
      Y0,
      H - 0.04,
      T,
      WHT,
      's',
    );
    wall(casaWallBatch, 'x', -4, -7, 7, [[-2.5, 2.5, 0, 3.2]], Y0, H - 0.04, T, WHT, 's');
    wall(casaWallBatch, 'x', -1, -13, -7, [[-10, -8.8, 0, 3.0]], Y0, H - 0.04, T, WHT, 's');
    wall(casaWallBatch, 'x', -3, 7, 13, [], Y0, H - 0.04, T, WHT, 's');
    casaWallBatch.build(casaWalls);
    /* ---------- pisos térreo (não se sobrepõem): ladrilho hidráulico, tábua corrida, mármore ---------- */
    function addGroundFloor(x1, z1, x2, z2, c) {
      casaBaseBatch.addBox(x2 - x1, 0.2, z2 - z1, c, (x1 + x2) / 2, GF - 0.2, (z1 + z2) / 2);
    }
    addGroundFloor(-13, 2, -7, 10, 0xcdb08a);
    addGroundFloor(-7, 2, 7, 10, MARB);
    addGroundFloor(7, 2, 13, 10, PAL.wood.floorBoard);
    addGroundFloor(-13, -1, -7, 2, 0xe6d6b0);
    addGroundFloor(-13, -10, -7, -1, TERRA);
    addGroundFloor(-7, -4, 7, 2, PAL.wood.oak);
    addGroundFloor(-7, -10, 7, -4, PAL.wood.oak);
    addGroundFloor(7, -3, 13, 2, 0x3b6ea5);
    addGroundFloor(7, -10, 13, -3, K.concD);
    casaBaseMesh = casaBaseBatch.build(casaG, { mat: flrMat, outline: false });
    for (i = 0; i < 7; i++)
      for (j = 0; j < 8; j++)
        if ((i + j) % 2)
          casaInteriorBatch.addBox(
            1.96,
            0.03,
            0.96,
            0x3d3d44,
            -6 + i * 2,
            GF,
            2.5 + j * 0.9 * 1.0,
          ); /* xadrez de mármore no hall (peças pretas) */
    /* escada interna: lance único que sobe do hall ao sobrado */
    for (i = 0; i < 24; i++) {
      const sh = GF + ((i + 1) * (UF - GF)) / 24;
      casaInteriorBatch.addBox(
        2.0,
        sh - GF + 0.0,
        0.275,
        [MARB, 0xe4e2d8][i % 2],
        0,
        GF,
        9.4 - (i + 0.5) * 0.275,
      );
    }
    [-1.05, 1.05].forEach(function (sx) {
      casaInteriorBatch.addBeam([sx, GF + 0.9, 9.6], [sx, UF + 0.9, 2.8], 0.04, IRON, 5);
      for (i = 0; i <= 24; i += 2)
        casaInteriorBatch.addBox(
          0.05,
          0.9,
          0.05,
          IRON,
          sx,
          GF + (i * (UF - GF)) / 24,
          9.4 - i * 0.275,
        );
    });
    /* capela: altar de madeira entalhada e dourada, tapete, bancos */
    casaInteriorBatch.addBox(3.0, 0.3, 1.2, K.woodD, -10, GF, 3.0);
    casaInteriorBatch.addBox(2.6, 2.4, 0.4, K.woodD, -10, GF, 2.4);
    casaInteriorBatch.addBox(2.2, 2.0, 0.1, PAL.clay.gold, -10, GF + 0.2, 2.65);
    casaInteriorBatch.addBox(0.3, 0.9, 0.3, PAL.clay.gold, -10, GF + 2.4, 2.4);
    casaInteriorBatch.addBox(1.1, 0.03, 5, PAL.fabric.brickRed, -10, GF, 6.2);
    for (i = 0; i < 3; i++) {
      casaInteriorBatch.addBox(2.8, 0.5, 0.6, K.woodL, -10, GF, 5.2 + i * 1.3);
      casaInteriorBatch.addBox(2.8, 0.5, 0.1, K.woodD, -10, GF + 0.5, 5.0 + i * 1.3);
    }
    /* hall: bancos de ferro, relógio de pé, quadros (molduras) */
    casaInteriorBatch.addBox(0.6, 2.2, 0.4, K.woodD, 5.6, GF, 2.4);
    casaInteriorBatch.addBox(0.4, 0.5, 0.1, PAL.clay.gold, 5.6, GF + 1.2, 2.62);
    casaInteriorBatch.addBox(1.4, 0.5, 0.5, IRON, -4.5, GF, 9.3);
    casaInteriorBatch.addBox(1.4, 0.1, 0.55, K.woodL, -4.5, GF + 0.5, 9.3);
    [
      [-5, 2.2],
      [-3, 2.2],
      [3, 2.2],
    ].forEach(function (q, n) {
      casaInteriorBatch.addBox(1.0, 1.3, 0.06, K.woodD, q[0], GF + 1.4, q[1] + 0.2);
      casaInteriorBatch.addBox(
        0.82,
        1.1,
        0.04,
        [0x4a6b8f, 0x8f6b4a, 0x5f8f5a][n],
        q[0],
        GF + 1.5,
        q[1] + 0.24,
      );
    });
    /* sala de jantar: mesa para 14, cadeiras, aparador */
    casaInteriorBatch.addBox(6.0, 0.12, 1.8, K.woodD, 0, GF + 0.76, -7.4);
    [
      [-2.8, -8.1],
      [2.8, -8.1],
      [-2.8, -6.7],
      [2.8, -6.7],
    ].forEach(function (l) {
      casaInteriorBatch.addBox(0.18, 0.76, 0.18, K.woodD, l[0], GF, l[1]);
    });
    for (i = 0; i < 7; i++) {
      casaInteriorBatch.addBox(0.45, 0.5, 0.45, K.woodL, -2.7 + i * 0.9, GF, -8.5);
      casaInteriorBatch.addBox(0.45, 0.5, 0.45, K.woodL, -2.7 + i * 0.9, GF, -6.3);
      casaInteriorBatch.addBox(0.45, 0.55, 0.06, K.woodD, -2.7 + i * 0.9, GF + 0.5, -8.75);
    }
    casaInteriorBatch.addBox(3.4, 0.9, 0.5, K.woodD, 0, GF, -9.6);
    casaInteriorBatch.addBox(3.5, 0.06, 0.55, MARB, 0, GF + 0.9, -9.6);
    [[-1.2], [0], [1.2]].forEach(function (c) {
      casaInteriorBatch.addBox(0.5, 0.4, 0.2, PAL.clay.gold, c[0], GF + 1.4, -9.7);
    });
    /* sala de visitas: sofá, poltronas, tapete, piano */
    casaInteriorBatch.addCylinder(2.0, 0.03, PAL.fabric.brickRed, 0, GF, -1, 22);
    casaInteriorBatch.addBox(3.0, 0.55, 0.9, PAL.fabric.burgundy, 0, GF, -2.9);
    casaInteriorBatch.addBox(3.0, 0.6, 0.25, PAL.fabric.burgundy, 0, GF + 0.5, -3.3);
    casaInteriorBatch.addBox(1.2, 0.4, 0.8, K.woodD, 0, GF, -0.8);
    [
      [-3.6, -0.5],
      [3.6, -0.5],
    ].forEach(function (p) {
      casaInteriorBatch.addBox(0.9, 0.5, 0.9, PAL.paint.shutterGreen, p[0], GF, p[1]);
      casaInteriorBatch.addBox(0.9, 0.5, 0.2, PAL.paint.shutterGreen, p[0], GF + 0.4, p[1] - 0.4);
    });
    casaInteriorBatch.addBox(1.6, 0.9, 0.7, PAL.dark.charcoal, 5.3, GF, 0.8);
    casaInteriorBatch.addBox(1.7, 0.06, 0.9, K.woodD, 5.3, GF + 0.9, 0.8);
    /* cozinha de serviço: fogão a lenha de ferro com coifa, bancada, pia, mesa, azulejos portugueses nas paredes */
    casaInteriorBatch.addBox(0.06, 1.6, 10.8, AZW, -12.72, GF + 0.9, -5.6);
    for (i = 0; i < 9; i++)
      casaInteriorBatch.addBox(
        0.07,
        0.4,
        0.4,
        AZB,
        -12.7,
        GF + 0.9 + (i % 4) * 0.4,
        -10.4 + i * 1.2,
      );
    casaInteriorBatch.addBox(2.2, 1.0, 1.1, IRON, -11.4, GF, -9.2);
    casaInteriorBatch.addCone(1.0, 1.0, IRON, -11.4, GF + 1.0, -9.2, 4, [0, Math.PI / 4, 0]);
    casaInteriorBatch.addCylinder(0.2, 1.8, IRON, -11.4, GF + 2.0, -9.2, 8);
    casaUnlitBatch.addBox(0.8, 0.25, 0.04, PAL.flora.pumpkin, -11.4, GF + 0.55, -8.62);
    casaInteriorBatch.addBox(0.7, 0.9, 4.5, K.woodL, -12.3, GF, -4.8);
    casaInteriorBatch.addBox(0.75, 0.06, 4.6, PAL.light.cream, -12.3, GF + 0.9, -4.8);
    casaInteriorBatch.addBox(0.5, 0.12, 0.9, K.steel, -12.3, GF + 0.94, -4.2);
    casaInteriorBatch.addBox(2.6, 0.14, 1.4, K.wood, -9.6, GF + 0.75, -5.0);
    [
      [-1.1, -0.5],
      [1.1, -0.5],
      [-1.1, 0.5],
      [1.1, 0.5],
    ].forEach(function (l) {
      casaInteriorBatch.addBox(0.14, 0.75, 0.14, K.woodD, -9.6 + l[0], GF, -5.0 + l[1]);
    });
    for (i = 0; i < 5; i++)
      casaInteriorBatch.addCylinder(0.12, 0.2, K.copper, -12.4 + 0.0, GF + 2.1, -9.5 + i * 0.5, 6);
    /* copa (balcão de passa-pratos) */
    casaInteriorBatch.addBox(0.8, 0.95, 2.4, K.woodD, -12.4, GF, 0.5);
    casaInteriorBatch.addBox(2.5, 0.9, 0.8, K.woodL, -8.5, GF, 0.6);
    /* despensa de catástrofe (42 m²): prateleiras, barris, galões, freezer */
    function jarColor(k) {
      return [
        PAL.flora.coral,
        PAL.flora.marigold,
        PAL.flora.sage,
        PAL.light.wheat,
        PAL.flora.purple,
        PAL.clay.copperBrown,
      ][k % 6];
    }
    function addPantryItem(B, x, y, z, k) {
      const m = k % 5;
      if (m === 0 || m === 3) B.addCylinder(0.12, 0.3, jarColor(k), x, y, z, 6);
      else if (m === 1) B.addCylinder(0.09, 0.2, K.steel, x, y, z, 6);
      else if (m === 2) B.addBox(0.34, 0.24, 0.3, PAL.clay.sandGold, x, y, z);
      else
        B.addBox(0.3, 0.3, 0.3, [K.woodL, PAL.clay.mustard, PAL.clay.terracotta][k % 3], x, y, z);
    }
    function shelfX(B, x1, x2, z, y0, t) {
      const L = x2 - x1,
        n = Math.floor(L / 0.5),
        nu = Math.max(1, Math.round(L / 1.5));
      for (let a = 0; a < 3; a++) {
        B.addBox(L, 0.06, 0.5, K.woodL, (x1 + x2) / 2, y0 + 0.55 + a * 0.7, z);
        for (let b = 0; b < n; b++)
          addPantryItem(B, x1 + 0.25 + b * 0.5, y0 + 0.61 + a * 0.7, z, b + a * 2 + (t || 0));
      }
      for (let c = 0; c <= nu; c++) B.addBox(0.08, 2.3, 0.54, K.woodD, x1 + (c * L) / nu, y0, z);
    }
    function shelfZ(B, z1, z2, x, y0, t) {
      const L = z2 - z1,
        n = Math.floor(L / 0.5),
        nu = Math.max(1, Math.round(L / 1.5));
      for (let a = 0; a < 3; a++) {
        B.addBox(0.5, 0.06, L, K.woodL, x, y0 + 0.55 + a * 0.7, (z1 + z2) / 2);
        for (let b = 0; b < n; b++)
          addPantryItem(B, x, y0 + 0.61 + a * 0.7, z1 + 0.25 + b * 0.5, b + a * 3 + (t || 0));
      }
      for (let c = 0; c <= nu; c++) B.addBox(0.54, 2.3, 0.08, K.woodD, x, y0, z1 + (c * L) / nu);
    }
    shelfX(casaInteriorBatch, 7.4, 12.7, -9.6, GF);
    shelfZ(casaInteriorBatch, -9.4, -3.4, 7.4, GF);
    shelfZ(casaInteriorBatch, -9.4, -3.4, 12.7, GF, 2);
    [
      [9.0, -6.8],
      [10.0, -6.8],
      [9.0, -5.6],
      [10.0, -5.6],
    ].forEach(function (b) {
      casaInteriorBatch.addCylinder(0.45, 0.9, K.wood, b[0], GF, b[1], 10, 0.42);
      casaInteriorBatch.addCylinder(0.47, 0.06, K.steelD, b[0], GF + 0.45, b[1], 10);
    });
    for (i = 0; i < 12; i++) {
      casaInteriorBatch.addCylinder(
        0.22,
        0.5,
        PAL.flora.cornflower,
        8.4 + (i % 4) * 0.5,
        GF,
        -4.6 + ((i / 4) | 0) * 0.5,
        8,
      );
    }
    casaInteriorBatch.addBox(2.0, 0.85, 0.8, K.white, 11.4, GF, -5.0);
    casaInteriorBatch.addBox(2.05, 0.08, 0.85, K.steel, 11.4, GF + 0.85, -5.0);
    /* banheiros coletivos (azulejo azul e branco, louças) */
    function toilet(B, x, y, z, ry) {
      B.setOrigin(x, 0, z, ry || 0);
      B.addBox(0.42, 0.42, 0.6, K.white, 0, y, 0);
      B.addBox(0.4, 0.55, 0.2, K.white, 0, y, -0.38);
      B.addBox(0.44, 0.05, 0.5, K.steel, 0, y + 0.42, 0.02);
      B.setOrigin(0, 0, 0, 0);
    }
    function sink(B, x, y, z, ry) {
      B.setOrigin(x, 0, z, ry || 0);
      B.addCylinder(0.1, 0.7, K.white, 0, y, 0, 6);
      B.addBox(0.65, 0.14, 0.48, K.white, 0, y + 0.7, 0);
      B.addCylinder(0.035, 0.3, K.steel, 0, y + 0.84, -0.17, 5);
      B.addBox(0.7, 0.7, 0.04, 0x9bd9f1, 0, y + 1.3, -0.3);
      B.setOrigin(0, 0, 0, 0);
    }
    /* chuveiro orientado: haste e ducha no lado (x - sx*0.5, z + sz*0.5), vidro do lado oposto em x */
    function shower2(B, x, y, z, sx, sz) {
      B.addBox(1.1, 0.08, 1.1, 0xeaf3f7, x, y, z);
      B.addCylinder(0.03, 1.9, K.steel, x - sx * 0.5, y + 0.08, z + sz * 0.5, 5);
      B.addBox(0.3, 0.05, 0.3, K.steel, x - sx * 0.38, y + 1.85, z + sz * 0.45);
      B.addBox(0.04, 1.9, 1.1, PAL.glass.showerGlass, x + sx * 0.55, y + 0.08, z);
    }
    casaInteriorBatch.addBox(0.06, 1.5, 4.8, AZB, 12.72, GF, -0.5);
    casaInteriorBatch.addBox(0.06, 0.48, 4.8, AZW, 12.7, GF + 1.01, -0.5);
    toilet(casaInteriorBatch, 8.0, GF, 1.35, Math.PI);
    toilet(casaInteriorBatch, 9.4, GF, 1.35, Math.PI);
    sink(casaInteriorBatch, 10.8, GF, 1.5, Math.PI);
    sink(casaInteriorBatch, 12.1, GF, 1.5, Math.PI);
    shower2(casaInteriorBatch, 8.6, GF, -2.2, 1, -1);
    shower2(casaInteriorBatch, 11.0, GF, -2.2, 1, -1);
    /* escritório: escrivaninha, estante, mapa */
    casaInteriorBatch.addBox(2.2, 0.1, 1.0, K.woodD, 10.0, GF + 0.76, 8.6);
    casaInteriorBatch.addBox(2.2, 0.76, 0.12, K.woodD, 10.0, GF, 8.2);
    casaInteriorBatch.addBox(0.5, 0.5, 0.5, K.woodL, 10.0, GF, 7.6);
    shelfZ(casaInteriorBatch, 3.2, 6.6, 12.7, GF, 4);
    casaInteriorBatch.addBox(1.6, 1.1, 0.05, 0xe8d9b0, 10.0, GF + 1.2, 9.7);
    casaInteriorBatch.build(casaG);
    casaUnlitBatch.build(casaG, { unlit: true, outline: false });

    /* ---------- sobrado: paredes, balcão de ferro, 6 suítes, sala central ---------- */
    upperWallBatch.addBox(26.7, 0.2, 0.0, K.black, 0, -9, 0); /* (sem efeito) */
    wall(
      upperWallBatch,
      'x',
      -10,
      -13,
      13,
      [
        [-9, -7.2, 0.9, 3.0],
        [-3.9, -2.1, 0.9, 3.0],
        [2.1, 3.9, 0.9, 3.0],
        [7.2, 9, 0.9, 3.0],
      ],
      0,
      UHT,
      0.5,
      CW,
      'a',
      -1,
    );
    wall(
      upperWallBatch,
      'z',
      -13,
      -10,
      10,
      [
        [-6, -4.2, 0.9, 3.0],
        [-1, 0.8, 0.9, 3.0],
        [4.2, 6, 0.9, 3.0],
      ],
      0,
      UHT,
      0.5,
      CW,
      'a',
      1,
    );
    wall(
      upperWallBatch,
      'z',
      13,
      -10,
      10,
      [
        [-6, -4.2, 0.9, 3.0],
        [-1, 0.8, 0.9, 3.0],
        [4.2, 6, 0.9, 3.0],
      ],
      0,
      UHT,
      0.5,
      CW,
      'a',
      1,
    );
    /* fachada do sobrado: 8 portas-janela até o chão, com balcão corrido */
    wall(
      upperWallBatch,
      'x',
      10,
      -13,
      13,
      [
        [-11.9, -10.3, 0, 3.1],
        [-9.2, -7.6, 0, 3.1],
        [-6.5, -4.9, 0, 3.1],
        [-3.8, -2.2, 0, 3.1],
        [2.2, 3.8, 0, 3.1],
        [4.9, 6.5, 0, 3.1],
        [7.6, 9.2, 0, 3.1],
        [10.3, 11.9, 0, 3.1],
      ],
      0,
      UHT,
      0.5,
      CW,
      'a',
      1,
    );
    [
      [-13, -10],
      [13, -10],
      [-13, 10],
      [13, 10],
    ].forEach(function (c) {
      upperWallBatch.addBox(0.9, UHT + 0.02, 0.9, WHT, c[0], 0, c[1]);
    });
    upperWallBatch.addBox(26.7, 0.34, 0.7, WHT, 0, UHT - 0.3, 10.1);
    upperWallBatch.addBox(26.7, 0.34, 0.7, WHT, 0, UHT - 0.3, -10.1);
    upperWallBatch.addBox(0.7, 0.34, 20.6, WHT, 13.1, UHT - 0.3, 0);
    upperWallBatch.addBox(0.7, 0.34, 20.6, WHT, -13.1, UHT - 0.3, 0);
    [-11.1, -8.4, -5.7, -3.0, 3.0, 5.7, 8.4, 11.1].forEach(function (px) {
      upperWallBatch.addBox(2.0, 0.18, 0.14, WHT, px, 3.1, 10.34);
      upperWallBatch.addGeometry(
        GX.box,
        WHT,
        px,
        3.1 + 0.18 + 0.2,
        10.34,
        [2.0, 0.4, 0.1],
        [0, 0, 0],
      );
      upperWallBatch.addBox(0.9, 0.9, 0.08, PAL.glass.windowDeep, px, 0.0, 10.28);
    });
    /* partições do sobrado */
    wall(
      upperWallBatch,
      'x',
      2.5,
      -13,
      -2,
      [
        [-9.2, -7.9, 0, 2.9],
        [-4.8, -3.5, 0, 2.9],
      ],
      0,
      UHT - 0.04,
      T,
      WHT,
      'a',
    );
    wall(
      upperWallBatch,
      'x',
      2.5,
      2,
      13,
      [
        [3.5, 4.8, 0, 2.9],
        [7.9, 9.2, 0, 2.9],
      ],
      0,
      UHT - 0.04,
      T,
      WHT,
      'a',
    );
    wall(upperWallBatch, 'z', -7.5, 2.5, 10, [], 0, UHT - 0.04, T, WHT, 'a');
    wall(upperWallBatch, 'z', -2, 2.5, 10, [], 0, UHT - 0.04, T, WHT, 'a');
    wall(upperWallBatch, 'z', 2, 2.5, 10, [], 0, UHT - 0.04, T, WHT, 'a');
    wall(upperWallBatch, 'z', 7.5, 2.5, 10, [], 0, UHT - 0.04, T, WHT, 'a');
    wall(upperWallBatch, 'x', -1, -13, -4, [[-9.8, -8.4, 0, 2.9]], 0, UHT - 0.04, T, WHT, 'a');
    wall(upperWallBatch, 'x', -1, 4, 13, [[8.4, 9.8, 0, 2.9]], 0, UHT - 0.04, T, WHT, 'a');
    wall(upperWallBatch, 'z', -4, -10, -1, [], 0, UHT - 0.04, T, WHT, 'a');
    wall(upperWallBatch, 'z', 4, -10, -1, [], 0, UHT - 0.04, T, WHT, 'a');

    /* banheiros privativos 2,4 x 2,4 m: cantos das suítes, paredes com porta, louças junto à parede do corredor, ducha ao fundo */
    function addUpperBathroom(xo, sx, zw, sz, dz) {
      const xi = xo + sx * 2.55,
        zf = zw + sz * 2.55;
      wall(
        upperWallBatch,
        'x',
        zf,
        Math.min(xo - sx * 0.15, xi + sx * 0.15),
        Math.max(xo - sx * 0.15, xi + sx * 0.15),
        [],
        0,
        UHT - 0.04,
        T,
        WHT,
        'a',
      );
      wall(
        upperWallBatch,
        'z',
        xi,
        Math.min(zw, zf),
        Math.max(zw, zf),
        [
          [
            Math.min(zw + sz * dz[0], zw + sz * dz[1]),
            Math.max(zw + sz * dz[0], zw + sz * dz[1]),
            0,
            2.4,
          ],
        ],
        0,
        UHT - 0.04,
        T,
        WHT,
        'a',
      );
      const ry = sz > 0 ? 0 : Math.PI;
      toilet(upperInteriorBatch, xo + sx * 0.45, 0.04, zw + sz * 0.5, ry);
      sink(upperInteriorBatch, xo + sx * 1.5, 0.04, zw + sz * 0.35, ry);
      upperInteriorBatch.addBox(
        2.38,
        0.04,
        2.38,
        0xeaf3f7,
        xo + sx * 1.2,
        0.04,
        zw + sz * 1.2,
      ); /* piso de ladrilho branco */
      shower2(upperInteriorBatch, xo + sx * 0.7, 0.08, zw + sz * 1.7, sx, sz);
      upperInteriorBatch.addBox(
        0.06,
        1.4,
        2.3,
        AZB,
        xo + sx * 0.04,
        0.08,
        zw + sz * 1.2,
      ); /* azulejo na parede externa */
    }
    addUpperBathroom(-12.75, 1, 2.65, 1, [0.7, 1.6]);
    addUpperBathroom(-7.35, 1, 2.65, 1, [0.7, 1.6]);
    addUpperBathroom(7.35, -1, 2.65, 1, [0.7, 1.6]);
    addUpperBathroom(12.75, -1, 2.65, 1, [0.7, 1.6]);
    addUpperBathroom(-12.75, 1, -1.15, -1, [0.7, 1.6]);
    addUpperBathroom(12.75, -1, -1.15, -1, [0.7, 1.6]);
    upperWallBatch.build(casaUpW);
    /* laje do sobrado com o vão da escada (x -1,1…1,1 · z 2,8…9,8) e balcão de ferro fundido */
    upperInteriorBatch.addBox(12.2, 0.2, 20.6, K.woodD, -7.2, -0.2, 0);
    upperInteriorBatch.addBox(12.2, 0.2, 20.6, K.woodD, 7.2, -0.2, 0);
    upperInteriorBatch.addBox(2.2, 0.2, 13.1, K.woodD, 0, -0.2, -3.75);
    upperInteriorBatch.addBox(2.2, 0.2, 0.5, K.woodD, 0, -0.2, 10.05);
    upperInteriorBatch.addBox(27.2, 0.2, 2.0, K.woodD, 0, -0.2, 11.4);
    upperInteriorBatch.addBox(27.2, 0.12, 0.2, IRON, 0, 0.0, 12.4);
    for (i = 0; i <= 54; i++)
      upperInteriorBatch.addBox(0.05, 1.0, 0.05, IRON, -13.5 + i * 0.5, 0, 12.4);
    upperInteriorBatch.addBox(27.2, 0.07, 0.1, IRON, 0, 1.0, 12.4);
    upperInteriorBatch.addBox(27.2, 0.05, 0.07, IRON, 0, 0.5, 12.4);
    for (i = 0; i <= 26; i++)
      if (i % 3 === 0)
        upperInteriorBatch.addSphere(
          0.14,
          IRON,
          -13 + i,
          1.15,
          12.4,
          1,
          1,
          1,
        ); /* rebites grossos */
    [-13.5, 13.5].forEach(function (px) {
      upperInteriorBatch.addBox(0.22, 1.0, 0.22, IRON, px, 0, 12.4);
    });
    [-9.5, -3.2, 3.2, 9.5].forEach(function (px) {
      upperInteriorBatch.addBox(0.24, 1.0, 0.24, IRON, px, 0, 12.4);
    });
    [-1.1, 1.1].forEach(function (sx) {
      upperInteriorBatch.addBox(0.06, 1.0, 7.0, IRON, sx, 0, 6.3);
    });
    upperInteriorBatch.addBox(2.2, 0.06, 0.06, IRON, 0, 1.0, 9.8);
    /* chão do sobrado: tábua larga e ladrilho; cada peça sem sobreposição */
    function addUpperFloor(x1, z1, x2, z2, c) {
      upperInteriorBatch.addBox(x2 - x1, 0.04, z2 - z1, c, (x1 + x2) / 2, 0, (z1 + z2) / 2);
    }
    addUpperFloor(-13, 2.5, -7.5, 10, PAL.wood.floorBoard);
    addUpperFloor(-7.5, 2.5, -2, 10, PAL.wood.floorBoard);
    addUpperFloor(2, 2.5, 7.5, 10, PAL.wood.floorBoard);
    addUpperFloor(7.5, 2.5, 13, 10, PAL.wood.floorBoard);
    addUpperFloor(-13, -1, 13, 2.5, TERRA);
    addUpperFloor(-13, -10, -4, -1, PAL.wood.floorBoard);
    addUpperFloor(-4, -10, 4, -1, PAL.wood.oak);
    addUpperFloor(4, -10, 13, -1, PAL.wood.floorBoard);
    addUpperFloor(-2, 2.5, -1, 10, PAL.wood.floorBoard);
    addUpperFloor(1, 2.5, 2, 10, PAL.wood.floorBoard);
    addUpperFloor(-1, 9.8, 1, 10, PAL.wood.floorBoard);
    function addUpperBed(bx, bz, c) {
      upperInteriorBatch.addBox(2.0, 0.5, 2.2, K.woodD, bx, 0.04, bz);
      upperInteriorBatch.addBox(1.9, 0.28, 2.1, PAL.light.ivory, bx, 0.54, bz);
      upperInteriorBatch.addBox(1.9, 0.12, 1.3, c, bx, 0.82, bz + 0.4);
      upperInteriorBatch.addBox(1.4, 0.18, 0.5, K.white, bx, 0.82, bz - 0.8);
      upperInteriorBatch.addBox(2.1, 1.3, 0.14, K.woodD, bx, 0.04, bz - 1.15);
      upperInteriorBatch.addBox(0.5, 0.45, 0.5, K.woodL, bx + 1.5, 0.04, bz - 0.8);
    }
    function wardrobe(wx, wz, wrot) {
      upperInteriorBatch.setOrigin(wx, 0, wz, wrot || 0);
      upperInteriorBatch.addBox(1.6, 2.3, 0.6, K.woodD, 0, 0.04, 0);
      upperInteriorBatch.addBox(0.03, 2.0, 0.05, PAL.clay.gold, 0, 0.2, 0.32);
      upperInteriorBatch.setOrigin(0, 0, 0, 0);
    }
    /* suítes de frente (A, B, C, D) */
    const sc = [
      PAL.flora.cornflower,
      PAL.flora.salmon,
      PAL.flora.grass,
      PAL.flora.violet,
      PAL.flora.marigold,
      PAL.flora.cornflower,
    ];
    addUpperBed(-10.2, 6.8, sc[0]);
    wardrobe(-7.95, 5.4, -Math.PI / 2);
    addUpperBed(-4.7, 6.8, sc[1]);
    wardrobe(-2.45, 5.4, -Math.PI / 2);
    addUpperBed(4.7, 6.8, sc[2]);
    wardrobe(2.45, 5.4, Math.PI / 2);
    addUpperBed(10.2, 6.8, sc[3]);
    wardrobe(7.95, 5.4, Math.PI / 2);
    /* suítes dos fundos (E, F) e sala íntima central */
    addUpperBed(-8.2, -6.5, sc[4]);
    wardrobe(-11.0, -9.45, 0);
    addUpperBed(8.2, -6.5, sc[5]);
    wardrobe(11.0, -9.45, 0);
    upperInteriorBatch.addCylinder(2.4, 0.03, PAL.fabric.rust, 0, 0.04, -5.5, 22);
    upperInteriorBatch.addBox(2.8, 0.55, 0.9, PAL.fabric.royalBlue, 0, 0.04, -8.4);
    upperInteriorBatch.addBox(2.8, 0.6, 0.25, PAL.fabric.royalBlue, 0, 0.5, -8.8);
    upperInteriorBatch.addBox(1.2, 0.4, 0.8, K.woodD, 0, 0.04, -5.5);
    [
      [-2.4, -6],
      [2.4, -6],
    ].forEach(function (p) {
      upperInteriorBatch.addBox(0.9, 0.5, 0.9, PAL.paint.shutterGreen, p[0], 0.04, p[1]);
    });
    /* lustres de ferro e lampiões */
    [
      [-8, 6],
      [8, 6],
      [0, -5],
      [0, 0.7],
    ].forEach(function (p) {
      upperInteriorBatch.addCylinder(0.03, 1.0, IRON, p[0], UHT - 1.0, p[1], 4);
      upperInteriorBatch.addCylinder(0.4, 0.06, IRON, p[0], UHT - 1.05, p[1], 10);
      upperUnlitBatch.addSphere(0.14, PAL.light.warmGlow, p[0], UHT - 1.1, p[1], 1, 1, 1);
    });
    upperInteriorBatch.build(casaUp);
    upperUnlitBatch.build(casaUp, { unlit: true, outline: false });

    /* ---------- varanda térrea, colunas e escadaria de mármore com espelhos de azulejo e gradil de ferro ---------- */
    porchBatch.addBox(26.8, GF - 0.2, 3.4, K.stone, 0, 0, 11.9);
    porchBatch.addBox(26.8, 0.2, 3.4, MARB, 0, GF - 0.2, 11.9);
    for (i = 0; i <= 8; i++) {
      const cx = -12 + i * 3.0;
      if (Math.abs(cx) < 0.1) continue;
      porchBatch.addCylinder(0.28, UF - GF - 0.12, WHT, cx, GF, 12.4, 10, 0.22);
      porchBatch.addBox(0.7, 0.22, 0.7, WHT, cx, GF, 12.4);
      porchBatch.addBox(0.6, 0.24, 0.6, K.stoneL, cx, UF - 0.28, 12.4);
    }
    [-1.5, 1.5].forEach(function (cx) {
      porchBatch.addCylinder(0.3, UF - GF - 0.12, WHT, cx, GF, 12.4, 10, 0.24);
      porchBatch.addBox(0.8, 0.24, 0.8, WHT, cx, GF, 12.4);
    });
    porchBatch.addBox(27, 0.3, 0.5, WHT, 0, UF - 0.38, 12.4);
    for (i = 0; i < 7; i++) {
      porchBatch.addBox(6.2 - i * 0.0, 0.14, 0.45, MARB, 0, i * (GF / 7), 13.6 + (6 - i) * 0.45);
      porchBatch.addBox(
        6.2,
        GF / 7,
        0.04,
        i % 2 ? AZB : AZW,
        0,
        i * (GF / 7) + 0.0,
        13.6 + (6 - i) * 0.45 + 0.23,
      );
    }
    [-3.2, 3.2].forEach(function (sx) {
      porchBatch.addBeam([sx, 0.9, 13.4], [sx, GF + 0.9, 16.8], 0.05, IRON, 5);
      porchBatch.addBox(0.2, 0.9, 0.2, WHT, sx, 0, 16.8);
      porchBatch.addSphere(0.22, K.stoneL, sx, 0.9 + 0.2, 16.8, 1, 1.4, 1);
      porchBatch.addSphere(0.22, K.stoneL, sx, GF + 1.1, 13.4, 1, 1.4, 1);
    });
    for (i = 0; i <= 6; i++)
      [-3.2, 3.2].forEach(function (sx) {
        porchBatch.addBox(0.04, 0.8, 0.04, IRON, sx, i * (GF / 7), 16.8 - i * 0.45);
      });
    for (i = 0; i <= 26; i++)
      if (Math.abs(i - 13) > 3) porchBatch.addBox(0.05, 0.9, 0.05, IRON, -13 + i, GF, 13.55);
    porchBatch.addBox(10.5, 0.07, 0.07, IRON, -8.2, GF + 0.9, 13.55);
    porchBatch.addBox(10.5, 0.07, 0.07, IRON, 8.2, GF + 0.9, 13.55);
    /* lampiões de ferro e refletores (noite) */
    [-12, -6, 6, 12].forEach(function (cx) {
      porchBatch.addBox(0.18, 0.5, 0.18, IRON, cx, UF - 1.0, 11.2);
      porchLampBatch.addSphere(0.17, 0xffe3a0, cx, UF - 1.2, 11.2, 1, 1.3, 1);
    });
    porchBatch.build(casaG);
    porchLampBatch.build(casaG, { unlit: true, outline: false });
    addCasaCollider(-13.4, 13.2, -3.2, 13.5, 's');
    addCasaCollider(3.2, 13.2, 13.4, 13.5, 's');
    addCasaCollider(-13.5, 10.2, -13.2, 13.5, 's');
    addCasaCollider(13.2, 10.2, 13.5, 13.5, 's');
    addCasaCollider(-13.5, -10.3, 13.5, -10.3, 'a');
    addCasaCollider(13.4, -10.4, 13.5, 12.6, 'a');
    addCasaCollider(-13.5, -10.4, -13.4, 12.6, 'a');
    addCasaCollider(-13.5, 12.4, 13.5, 12.6, 'a');
    addCasaCollider(-1.2, 4.2, -1.0, 9.9, 'a');
    addCasaCollider(1.0, 4.2, 1.2, 9.9, 'a');
    addCasaCollider(-1.2, 9.8, 1.2, 10.0, 'a');

    /* ---------- telhado de quatro águas em capa e canal, frontão central com relógio, beirais de 2 m ---------- */
    const RB = UF + UHT,
      RH = 4.6,
      RW = 30.2,
      RD = 24.2;
    casaRoofBatch.addGeometry(hipGeo(RW, RD, RH), K.roof, 0, RB, 0);
    casaRoofBatch.addBox(RW + 0.4, 0.3, RD + 0.4, K.woodD, 0, RB - 0.3, 0);
    const th = Math.atan2(RH, RD / 2),
      sn = Math.sin(th),
      cs = Math.cos(th);
    for (let tt = 0.5; tt < RD / 2 - 0.6; tt += 0.8) {
      const wdt = RW - 2 * tt - 0.6;
      [
        [1, 1],
        [-1, -1],
      ].forEach(function (sg) {
        casaRoofBatch.addGeometry(
          GX.box,
          K.roofD,
          0,
          RB + tt * sn + 0.04,
          sg[0] * (RD / 2 - tt * cs),
          [wdt, 0.05, 0.1],
          [sg[0] * th, 0, 0],
        );
      });
    }
    casaRoofBatch.addBox(RW - RD + 0.6, 0.3, 0.55, K.roofD, 0, RB + RH - 0.02, 0);
    const tri = new THREE.Shape();
    tri.moveTo(-4.4, 0);
    tri.lineTo(4.4, 0);
    tri.lineTo(0, 3.0);
    const gg = new THREE.ExtrudeGeometry(tri, { depth: 0.6, bevelEnabled: false });
    gg.translate(0, 0, -0.3);
    casaRoofBatch.addGeometry(gg, WHT, 0, RB - 0.1, 10.6);
    casaRoofBatch.addGeometry(gg, K.stoneL, 0, RB - 0.1, 10.2, [1.06, 1.06, 0.4]);
    casaRoofBatch.addCylinder(0.85, 0.14, WHT, 0, RB + 1.0, 10.98, 24, 0.85, [Math.PI / 2, 0, 0]);
    casaRoofBatch.addCylinder(0.7, 0.15, 0x1d3566, 0, RB + 1.0, 11.0, 24, 0.7, [Math.PI / 2, 0, 0]);
    casaRoofBatch.addBox(0.06, 0.55, 0.05, WHT, 0, RB + 1.0, 11.1);
    casaRoofBatch.addBox(0.4, 0.06, 0.05, WHT, 0.1, RB + 1.0, 11.1);
    [-4.5, 4.5].forEach(function (ax) {
      casaRoofBatch.addSphere(0.3, K.stoneL, ax, RB + 0.1, 10.6, 1, 1.3, 1);
    });
    casaRoofBatch.addSphere(0.3, K.stoneL, 0, RB + 3.1, 10.6, 1, 1.3, 1); /* acrotérios */
    for (i = 0; i <= 12; i++)
      casaRoofBatch.addBox(
        0.12,
        0.5,
        0.06,
        K.woodD,
        -12 + i * 2,
        RB - 0.7,
        12.1,
      ); /* lambrequins sob o beiral */
    casaRoofBatch.addBox(1.4, 3.4, 1.4, CW, 6, RB + 1.3, -3);
    casaRoofBatch.addBox(1.8, 0.3, 1.8, K.stoneD, 6, RB + 4.5, -3);
    casaRoofBatch.addBox(0.8, 0.9, 0.8, K.stone, 6, RB + 4.8, -3);
    casaRoofBatch.build(casaRoofG, { mat: roofMat });
  })();

  /* ================= PÁTIO TÉCNICO E OFICINA DE REPAROS ================= */
  const yardBatch = new Batch(),
    beacons = [];
  function localToWorldXZ(x0, z0, ry, lx, lz) {
    return [x0 + lx * Math.cos(ry) + lz * Math.sin(ry), z0 - lx * Math.sin(ry) + lz * Math.cos(ry)];
  }
  function track(b, x, len, h, w) {
    b.addBox(w, h, len, K.black, x, 0.0, 0);
    b.addGeometry(cylG(1, 12), K.black, x, h / 2, len / 2, [h / 2, w, h / 2], [0, 0, Math.PI / 2]);
    b.addGeometry(cylG(1, 12), K.black, x, h / 2, -len / 2, [h / 2, w, h / 2], [0, 0, Math.PI / 2]);
    for (let k = 0; k < 4; k++)
      b.addGeometry(
        cylG(1, 8),
        K.steelD,
        x,
        h * 0.42,
        -len / 2 + (len * (k + 0.5)) / 4,
        [h * 0.28, w * 1.04, h * 0.28],
        [0, 0, Math.PI / 2],
      );
  }
  function stripedCone(b, x, z) {
    b.addCone(0.34, 0.9, K.orange, x, 0, z, 8);
    b.addCylinder(0.27, 0.14, K.white, x, 0.3, z, 8, 0.23);
    b.addBox(0.8, 0.06, 0.8, K.black, x, 0, z);
  }
  function pallet(b, x, z, n, ry) {
    b.setOrigin(x, 0, z, ry || 0);
    for (let l = 0; l < n; l++) {
      b.addBox(1.2, 0.14, 1.0, K.woodL, 0, l * 0.42, 0);
      for (let f = 0; f < 3; f++)
        b.addBox(1.2, 0.1, 0.18, K.woodD, 0, l * 0.42 + 0.14, -0.38 + f * 0.38);
      for (let c = 0; c < 3; c++)
        b.addBox(0.12, 0.14, 1.0, K.woodD, -0.5 + c * 0.5, l * 0.42 + 0.24, 0);
    }
    b.setOrigin(0, 0, 0, 0);
  }
  function toolbox(b, x, z, ry, lv) {
    b.setOrigin(x, 0, z, ry || 0);
    for (let l = 0; l < (lv || 2); l++) {
      b.addBox(1.0, 0.5, 0.55, K.red, 0, l * 0.5, 0);
      b.addBox(0.55, 0.06, 0.07, K.steel, 0, l * 0.5 + 0.4, 0.3);
      b.addBox(1.02, 0.04, 0.57, K.redD || 0xa82a20, 0, l * 0.5 + 0.24, 0);
    }
    b.setOrigin(0, 0, 0, 0);
  }
  function beacon(x, y, z, col) {
    yardBatch.addCylinder(0.2, 0.12, K.black, x, y, z, 8);
    beacons.push({ x: x, y: y + 0.12, z: z, col: col });
  }

  /* laje de concreto cinza-claro e faixas de sinalização */
  yardBatch.addBox(18, 0.2, 19, K.conc, 30, 0, -22.5);
  yardBatch.addBox(18.2, 0.08, 0.3, K.concD, 30, 0.2, -13.2);
  for (let ys = 0; ys < 9; ys++)
    yardBatch.addBox(1.3, 0.03, 0.22, K.yellow, 21.8 + ys * 2.0, 0.2, -31.8);
  yardBatch.addBox(0.2, 0.03, 9, K.white, 24, 0.2, -20);
  yardBatch.addBox(0.2, 0.03, 9, K.white, 36.5, 0.2, -20);
  yardBatch.addBox(12, 0.03, 0.2, K.white, 30, 0.2, -16);
  [
    [22, -14.5],
    [38, -14.5],
  ].forEach(function (p) {
    yardBatch.addCylinder(0.12, 6.0, K.steelD, p[0], 0.2, p[1], 6);
    yardBatch.addBox(0.8, 0.2, 0.5, K.steel, p[0], 6.0, p[1]);
    yardBatch.addBox(0.6, 0.06, 0.3, 0xfff6c9, p[0], 5.94, p[1]);
  });

  /* minicarregadeira (skid steer) — amarelo Caterpillar, esteiras pretas */
  (function (b, X, Z, RY) {
    b.setOrigin(X, 0, Z, RY);
    track(b, -0.95, 2.5, 0.85, 0.5);
    track(b, 0.95, 2.5, 0.85, 0.5);
    b.addBox(1.5, 0.9, 2.2, K.yellow, 0, 0.55, -0.1);
    b.addBox(1.6, 0.2, 2.3, K.black, 0, 0.45, -0.1);
    b.addBox(1.2, 0.5, 0.9, K.black, 0, 1.45, -0.8);
    b.addBox(1.3, 0.08, 1.3, K.yellow, 0, 2.72, 0.1);
    [
      [-0.62, -0.58],
      [0.62, -0.58],
      [-0.62, 0.62],
      [0.62, 0.62],
    ].forEach(function (p) {
      b.addBox(0.1, 1.3, 0.1, K.yellow, p[0], 1.45, p[1]);
    });
    b.addBox(1.1, 1.0, 1.1, PAL.glass.paleBlue, 0, 1.45, 0.0);
    b.addBox(1.4, 0.1, 0.1, K.black, 0, 1.1, 0.62);
    b.addBeam([-0.82, 1.0, -0.7], [-0.82, 0.9, 1.9], 0.1, K.yellow, 6);
    b.addBeam([0.82, 1.0, -0.7], [0.82, 0.9, 1.9], 0.1, K.yellow, 6);
    b.addBox(1.9, 0.5, 0.7, K.black, 0, 0.45, 2.15);
    b.addBox(1.9, 0.7, 0.1, K.black, 0, 0.9, 2.45);
    b.addBox(1.9, 0.14, 0.5, K.steel, 0, 0.3, 2.4);
    b.addBeam([-0.6, 1.2, -0.9], [-0.5, 0.6, 1.2], 0.07, K.steelD, 5);
    b.setOrigin(0, 0, 0, 0);
    const p = localToWorldXZ(X, Z, RY, 0.6, -0.1);
    beacon(p[0], 2.8, p[1], K.orange);
  })(yardBatch, 30.7, -26.6, Math.PI);

  /* miniescavadeira com lâmina niveladora */
  (function (b, X, Z, RY) {
    b.setOrigin(X, 0, Z, RY);
    track(b, -1.0, 3.2, 0.8, 0.65);
    track(b, 1.0, 3.2, 0.8, 0.65);
    b.addBox(2.2, 0.4, 2.4, K.black, 0, 0.7, 0);
    b.addBox(2.2, 0.18, 0.5, K.orange, 0, 0.3, 1.95);
    b.addBeam([-1.0, 0.6, 0.8], [-1.0, 0.5, 1.9], 0.08, K.steelD, 5);
    b.addBeam([1.0, 0.6, 0.8], [1.0, 0.5, 1.9], 0.08, K.steelD, 5);
    b.setOrigin(X, 0, Z, RY - 0.55);
    b.addGeometry(cylG(1, 16), K.black, 0, 1.15, 0, [1.3, 0.12, 1.3]);
    b.addBox(2.0, 1.0, 2.3, K.orange, 0, 1.2, -0.3);
    b.addBox(1.8, 0.8, 0.9, K.black, 0, 2.2, -1.1);
    b.addBox(1.0, 1.5, 1.0, PAL.glass.paleBlue, -0.5, 2.2, 0.4);
    b.addBox(1.2, 0.1, 1.2, K.orange, -0.5, 3.7, 0.4);
    b.addBox(0.1, 1.5, 0.1, K.orange, -0.95, 2.2, 0.85);
    b.addBox(1.2, 0.7, 0.5, K.black, 0, 1.4, -1.5);
    b.addBeam([0.5, 1.7, 0.5], [0.5, 3.5, 2.5], 0.18, K.orange, 6);
    b.addBeam([0.5, 3.5, 2.5], [0.5, 2.0, 4.0], 0.14, K.orange, 6);
    b.addBeam([0.5, 1.9, 0.1], [0.5, 3.2, 1.6], 0.07, K.steel, 5);
    b.addGeometry(GX.box, K.black, 0.5, 1.55, 4.3, [0.6, 0.9, 0.6], [0.6, 0, 0]);
    b.addGeometry(GX.box, K.steel, 0.5, 1.2, 4.6, [0.62, 0.16, 0.35], [0.6, 0, 0]);
    b.setOrigin(0, 0, 0, 0);
    const p = localToWorldXZ(X, Z, RY - 0.55, -0.5, 0.4);
    beacon(p[0], 3.75, p[1], K.orange);
  })(yardBatch, 36.2, -23.2, -0.6);

  /* carrinhos utilitários elétricos de ferramentas */
  function cart(b, X, Z, RY, col) {
    b.setOrigin(X, 0, Z, RY);
    b.addBox(1.9, 0.14, 1.0, col, 0, 0.36, 0);
    b.addBox(0.14, 0.7, 1.0, K.black, -0.95, 0.4, 0);
    b.addBox(1.9, 0.5, 0.12, K.black, 0, 0.5, -0.5);
    [
      [-0.7, -0.5],
      [0.7, -0.5],
      [-0.7, 0.5],
      [0.7, 0.5],
    ].forEach(function (w) {
      b.addGeometry(
        cylG(1, 10),
        K.black,
        w[0],
        0.24,
        w[1],
        [0.24, 0.16, 0.24],
        [Math.PI / 2, 0, 0],
      );
    });
    b.addBox(0.8, 0.5, 0.55, K.red, 0.3, 0.5, 0.05);
    b.addBox(0.8, 0.04, 0.57, K.steel, 0.3, 1.0, 0.05);
    b.addBox(0.5, 0.3, 0.4, K.blue, -0.4, 0.5, 0.1);
    b.addBox(0.04, 0.9, 0.04, K.black, -1.0, 0.5, -0.4);
    b.addBox(0.04, 0.9, 0.04, K.black, -1.0, 0.5, 0.4);
    b.addBox(0.06, 0.06, 0.9, K.black, -1.0, 1.4, 0);
    b.setOrigin(0, 0, 0, 0);
  }
  cart(yardBatch, 25.6, -28.6, 0.35, K.orange);
  cart(yardBatch, 27.6, -21.6, -0.5, K.yellow);
  cart(yardBatch, 34.2, -29.4, 0.1, K.orange);

  /* van Asia Towner e moto de 175 cc */
  (function (b, X, Z, RY) {
    b.setOrigin(X, 0, Z, RY);
    b.addBox(1.9, 1.5, 3.1, K.white, 0, 0.5, -0.6);
    b.addBox(1.85, 1.0, 1.3, K.white, 0, 0.5, 1.6);
    b.addBox(1.7, 0.6, 0.1, PAL.glass.paleBlue, 0, 1.35, 2.25);
    b.addBox(1.95, 0.12, 4.6, K.blue, 0, 0.7, 0.2);
    b.addBox(1.6, 0.5, 0.1, PAL.glass.paleBlue, 0, 1.4, 0.95);
    b.addBox(0.1, 0.5, 1.0, PAL.glass.paleBlue, 0.93, 1.2, 1.6);
    b.addBox(0.1, 0.5, 1.0, PAL.glass.paleBlue, -0.93, 1.2, 1.6);
    [
      [-0.95, 1.5],
      [0.95, 1.5],
      [-0.95, -1.2],
      [0.95, -1.2],
    ].forEach(function (w) {
      b.addGeometry(cylG(1, 12), K.black, w[0], 0.4, w[1], [0.4, 0.26, 0.4], [0, 0, Math.PI / 2]);
      b.addGeometry(cylG(1, 8), K.steel, w[0], 0.4, w[1], [0.2, 0.28, 0.2], [0, 0, Math.PI / 2]);
    });
    b.addBox(1.5, 0.2, 0.1, K.black, 0, 0.5, 2.3);
    b.setOrigin(0, 0, 0, 0);
  })(yardBatch, 24.6, -18.6, 0.18);
  (function (b, X, Z, RY) {
    b.setOrigin(X, 0, Z, RY);
    b.addGeometry(cylG(1, 12), K.black, 0, 0.45, 0.8, [0.45, 0.16, 0.45], [0, 0, Math.PI / 2]);
    b.addGeometry(cylG(1, 12), K.black, 0, 0.45, -0.8, [0.45, 0.16, 0.45], [0, 0, Math.PI / 2]);
    b.addBox(0.3, 0.5, 1.2, K.red, 0, 0.55, 0);
    b.addBox(0.34, 0.14, 0.9, K.black, 0, 1.0, -0.2);
    b.addBox(0.7, 0.08, 0.08, K.steel, 0, 1.35, 0.55);
    b.addBox(0.16, 0.3, 0.2, K.white, 0, 1.1, 0.8);
    b.setOrigin(0, 0, 0, 0);
  })(yardBatch, 22.6, -16.0, 1.2);

  /* paletes, caixas de ferramenta vermelhas empilhadas, cones listrados */
  pallet(yardBatch, 37.3, -30.3, 3, 0.1);
  pallet(yardBatch, 37.5, -28.6, 2, -0.2);
  pallet(yardBatch, 22.8, -25.2, 2, 0.4);
  for (let tb = 0; tb < 3; tb++)
    toolbox(yardBatch, 23.0 + tb * 1.1, -30.2, 0.05 * tb, tb === 1 ? 3 : 2);
  toolbox(yardBatch, 37.2, -26.0, 0.3, 2);
  [
    [27.8, -24.0],
    [33.8, -24.8],
    [29.6, -30.2],
    [34.6, -26.8],
    [27.0, -17.0],
    [33.0, -16.4],
    [24.0, -23.6],
    [38.6, -20.6],
  ].forEach(function (c) {
    stripedCone(yardBatch, c[0], c[1]);
  });
  [
    [38.2, -17.4],
    [38.2, -16.4],
    [39.1, -17.0],
  ].forEach(function (p) {
    yardBatch.addCylinder(
      0.45,
      1.0,
      [K.blue, K.red, K.blue][((p[1] * 2) | 0) & 1],
      p[0],
      0.2,
      p[1],
      10,
    );
    yardBatch.addCylinder(0.46, 0.1, K.black, p[0], 0.8, p[1], 10);
  });
  yardBatch.addBox(1.4, 2.2, 0.16, K.white, 39.2, 0.2, -23.3);
  yardBatch.addBox(1.3, 0.5, 0.18, K.yellow, 39.2, 1.7, -23.3);
  yardBatch.addBox(0.2, 0.2, 0.2, K.black, 39.2, 1.0, -23.3);
  yardBatch.addBox(3.8, 2.6, 3.6, K.stone, 41, 0, -17);
  yardBatch.addBox(4.3, 0.3, 4.1, K.roofD, 41, 2.6, -17);
  yardBatch.addCylinder(0.8, 1.3, K.copper, 39.0, 0, -17, 10);
  yardBatch.addCylinder(0.2, 1.5, K.steelD, 39.0, 1.3, -17, 8);
  yardBatch.addBeam([43.6, 3.0, -22.5], [41.9, 1.6, -18.8], 0.3, K.steelD, 8);
  yardBatch.addBox(1.0, 0.8, 1.0, K.steel, 43.2, 2.6, -23);
  yardBatch.build(surface);
  beacons.forEach(function (bc) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 8, 6),
      new THREE.MeshBasicMaterial({ color: C(K.orange) }),
    );
    m.position.set(bc.x, bc.y + 0.22, bc.z);
    surface.add(m);
    bc.mesh = m;
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.06, 0.12),
      new THREE.MeshBasicMaterial({ color: C(PAL.light.butter) }),
    );
    bar.position.copy(m.position);
    surface.add(bar);
    bc.bar = bar;
  });

  /* ================= RODA D'ÁGUA OVERSHOT (dinâmica) ================= */
  const wheelG = new THREE.Group();
  wheelG.position.set(45.5, 2.0, -41.2);
  surface.add(wheelG);
  const wheelSpin = new THREE.Group();
  wheelG.add(wheelSpin);
  (function () {
    const b = new Batch();
    let i;
    const WR = 2.6;
    const WW = 3.0;
    const dark = PAL.wood.ebony;
    [-WW / 2, WW / 2].forEach(function (z) {
      b.addGeometry(GX.tor, dark, 0, 0, z, [WR, WR, 3.0]);
      b.addGeometry(GX.tor, dark, 0, 0, z, [WR - 0.5, WR - 0.5, 3.0]);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        b.addBeam([0, 0, z], [Math.cos(a) * WR, Math.sin(a) * WR, z], 0.11, K.woodD, 5);
      }
    });
    b.addGeometry(cylG(1, 10), K.steelD, 0, 0, 0, [0.34, WW + 1.4, 0.34], [Math.PI / 2, 0, 0]);
    b.addGeometry(cylG(1, 10), K.copper, 0, 0, 0, [0.52, 0.5, 0.52], [Math.PI / 2, 0, 0]);
    for (i = 0; i < 16; i++) {
      const a2 = (i / 16) * Math.PI * 2;
      b.addGeometry(
        GX.box,
        [K.wood, K.woodD][i % 2],
        Math.cos(a2) * (WR - 0.1),
        Math.sin(a2) * (WR - 0.1),
        0,
        [0.7, 0.12, WW],
        [0, 0, a2],
      );
    }
    b.build(wheelSpin);
    wheelG.rotation.y = Math.PI / 2; /* eixo paralelo ao eixo X do mundo, entrando no engenho */
  })();
  /* cavaletes, calha de alimentação (flume) e eixo para dentro do engenho */
  (function () {
    const b = new Batch();
    [43.3, 47.7].forEach(function (x) {
      b.addBox(0.5, 2.8, 0.5, K.woodD, x, -1.4, -41.2);
      b.addBox(0.9, 0.5, 0.9, K.stone, x, -1.4, -41.2);
      b.addBeam([x, -1.2, -43.2], [x, 2.2, -41.4], 0.14, K.woodD, 5);
      b.addBeam([x, -1.2, -39.2], [x, 2.2, -41.0], 0.14, K.woodD, 5);
      b.addBox(0.5, 0.4, 0.5, K.copper, x, 1.9, -41.2);
    });
    b.addBox(1.8, 0.25, 12, K.wood, 45.5, 4.9, -48.4);
    b.addBox(0.18, 0.55, 12, K.woodD, 44.7, 4.9, -48.4);
    b.addBox(0.18, 0.55, 12, K.woodD, 46.3, 4.9, -48.4);
    b.addBox(1.6, 0.06, 12, K.water, 45.5, 5.14, -48.4);
    [-53, -49, -44].forEach(function (z) {
      b.addBox(0.3, 5.0, 0.3, K.woodD, 44.5, 0, z);
      b.addBox(0.3, 5.0, 0.3, K.woodD, 46.5, 0, z);
    });
    b.addBeam([42.9, 2.0, -41.2], [44.4, 2.0, -41.2], 0.28, K.steelD, 8);
    b.build(surface);
  })();

  /* ================= MOINHO DE VENTO ================= */
  const windG = new THREE.Group();
  windG.position.set(6, 0, 36);
  surface.add(windG);
  const rotor = new THREE.Group();
  rotor.position.set(0, 14.4, 2.3);
  windG.add(rotor);
  (function () {
    const b = new Batch();
    let i;
    b.addBox(5.4, 0.5, 5.4, K.concD, 0, 0, 0);
    b.addCylinder(2.1, 12.8, 0xc9684a, 0, 0.5, 0, 10, 1.2);
    for (i = 0; i < 6; i++)
      b.addCylinder(2.1 - i * 0.15, 0.22, K.stoneL, 0, 1.2 + i * 2.1, 0, 10, 2.0 - i * 0.15);
    b.addBox(1.2, 2.0, 0.2, K.woodD, 0, 0.5, 2.0);
    b.addBox(0.7, 1.4, 0.1, K.wood, 0, 0.5, 2.1);
    b.addCylinder(1.7, 1.4, K.wood, 0, 13.3, 0, 10, 1.4);
    b.addCone(1.9, 1.8, K.roofD, 0, 14.6, 0, 10);
    b.addBox(1.7, 1.6, 2.6, K.steelD, 0, 13.5, 1.2);
    b.addBox(0.25, 0.7, 0.25, K.black, 0, 15.0, -0.2);
    b.addBox(1.4, 0.5, 0.1, K.black, 0, 13.9, 2.5);
    b.build(windG);
    const r = new Batch();
    r.addGeometry(cylG(0.55, 10), K.steelD, 0, 0, 0, [0.55, 1.1, 0.55], [Math.PI / 2, 0, 0]);
    r.addGeometry(coneG(8), K.white, 0, 0, 0.95, [0.5, 0.9, 0.5], [Math.PI / 2, 0, 0]);
    for (i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      r.addGeometry(
        GX.box,
        [0xf4f7f8, 0xdfe4e8][i % 2],
        Math.cos(a) * 1.55,
        Math.sin(a) * 1.55,
        0.1,
        [0.34, 2.1, 0.07],
        [0, 0, a - Math.PI / 2],
      );
      r.addGeometry(
        GX.box,
        K.steel,
        Math.cos(a) * 0.62,
        Math.sin(a) * 0.62,
        0.1,
        [0.14, 0.9, 0.12],
        [0, 0, a - Math.PI / 2],
      );
    }
    r.build(rotor);
  })();

  /* ================= ANIMAIS EM BAIXO-POLI (porcos, galinhas, cabras) ================= */
  function animalMesh(kind) {
    const b = new Batch();
    if (kind === 'pig') {
      b.addBox(1.5, 0.9, 0.85, K.pink, 0, 0.5, 0);
      b.addBox(0.6, 0.65, 0.7, 0xf6b7c6, 0.9, 0.62, 0);
      b.addBox(0.28, 0.28, 0.4, PAL.animal.pigPink, 1.25, 0.7, 0);
      b.addGeometry(GX.ico0, PAL.animal.pigPink, -0.78, 0.85, 0, [0.12, 0.12, 0.12]);
      [
        [-0.5, -0.3],
        [-0.5, 0.3],
        [0.5, -0.3],
        [0.5, 0.3],
      ].forEach(function (l) {
        b.addCylinder(0.11, 0.5, PAL.animal.pigPink, l[0], 0, l[1], 6);
      });
      b.addBox(0.1, 0.22, 0.15, PAL.animal.pigPink, 0.95, 1.18, -0.25);
      b.addBox(0.1, 0.22, 0.15, PAL.animal.pigPink, 0.95, 1.18, 0.25);
      b.addBox(0.07, 0.07, 0.07, K.black, 1.2, 0.88, -0.2);
      b.addBox(0.07, 0.07, 0.07, K.black, 1.2, 0.88, 0.2);
    } else if (kind === 'hen') {
      b.addBox(0.45, 0.4, 0.36, K.white, 0, 0.32, 0);
      b.addBox(0.22, 0.3, 0.24, K.white, 0.26, 0.55, 0);
      b.addGeometry(coneG(3), K.yellow, 0.43, 0.62, 0, [0.07, 0.16, 0.07], [0, 0, -Math.PI / 2]);
      b.addGeometry(GX.ico0, K.red, 0.3, 0.84, 0, [0.07, 0.08, 0.05]);
      b.addGeometry(
        coneG(3),
        K.white,
        -0.28,
        0.55,
        0,
        [0.18, 0.34, 0.2],
        [0, 0, (Math.PI / 2) * 1.15],
      );
      b.addCylinder(0.025, 0.25, K.yellow, 0, 0.0, -0.1, 4);
      b.addCylinder(0.025, 0.25, K.yellow, 0, 0.0, 0.1, 4);
    } else {
      b.addBox(1.2, 0.7, 0.5, 0xcfcac0, 0, 0.7, 0);
      b.addBox(0.4, 0.6, 0.38, 0xb9b3a6, 0.7, 1.1, 0);
      b.addBox(0.25, 0.22, 0.3, PAL.animal.grey, 0.95, 1.15, 0);
      b.addGeometry(coneG(3), PAL.animal.horn, 0.8, 1.62, -0.1, [0.07, 0.28, 0.07]);
      b.addGeometry(coneG(3), PAL.animal.horn, 0.8, 1.62, 0.1, [0.07, 0.28, 0.07]);
      b.addGeometry(GX.ico0, PAL.animal.horn, 0.82, 0.85, 0, [0.08, 0.22, 0.08]);
      [
        [-0.45, -0.16],
        [-0.45, 0.16],
        [0.45, -0.16],
        [0.45, 0.16],
      ].forEach(function (l) {
        b.addCylinder(0.07, 0.7, 0x7b756b, l[0], 0, l[1], 5);
      });
      b.addGeometry(
        coneG(3),
        PAL.animal.grey,
        -0.7,
        1.0,
        0,
        [0.1, 0.3, 0.1],
        [0, 0, (Math.PI / 2) * 1.2],
      );
    }
    const g = new THREE.Group();
    b.build(g);
    return g;
  }
  const animals = [];
  (function () {
    const tpl = { pig: animalMesh('pig'), hen: animalMesh('hen'), goat: animalMesh('goat') },
      spec = [
        ['pig', 4, 1.0],
        ['hen', 10, 1.0],
        ['goat', 5, 1.0],
      ];
    spec.forEach(function (sp) {
      for (let i = 0; i < sp[1]; i++) {
        const g = tpl[sp[0]].clone(true);
        const a = {
          g: g,
          kind: sp[0],
          cx: rr(25, 37),
          cz: rr(-8, 7),
          rx: rr(1.2, 3.8),
          rz: rr(1.0, 3.0),
          ph: rr(0, 6.28),
          sp: rr(0.18, 0.34) * (sp[0] === 'hen' ? 1.6 : 1) * (R() < 0.5 ? -1 : 1),
        };
        if (sp[0] === 'pig') {
          a.cx = rr(24.5, 29);
          a.cz = rr(-6, 6);
          a.rx = rr(0.8, 1.8);
          a.rz = rr(1.0, 2.4);
        }
        if (sp[0] === 'goat') {
          a.cx = rr(33.5, 37.5);
          a.cz = rr(-4, 3);
          a.rx = rr(0.8, 1.6);
          a.rz = rr(1.0, 2.6);
        }
        if (sp[0] === 'hen') {
          a.cx = rr(-41, -33);
          a.cz = rr(36.5, 38);
          a.rx = rr(0.8, 1.8);
          a.rz = rr(0.6, 1.5);
        }
        surface.add(g);
        animals.push(a);
      }
    });
  })();

  /* ================= PEIXES TRIANGULARES NA LAGOA ================= */
  const fishList = [];
  (function () {
    const b = new Batch();
    b.addGeometry(coneG(3), K.orange, 0.15, 0.1, 0, [0.28, 0.9, 0.14], [0, 0, -Math.PI / 2]);
    b.addGeometry(coneG(3), 0xffd9a0, -0.6, 0.1, 0, [0.22, 0.4, 0.1], [0, 0, Math.PI / 2]);
    const f1 = new THREE.Group();
    b.build(f1);
    const b2 = new Batch();
    b2.addGeometry(coneG(3), K.white, 0.15, 0.1, 0, [0.28, 0.9, 0.14], [0, 0, -Math.PI / 2]);
    b2.addGeometry(
      coneG(3),
      PAL.glass.iceBlue,
      -0.6,
      0.1,
      0,
      [0.22, 0.4, 0.1],
      [0, 0, Math.PI / 2],
    );
    const f2 = new THREE.Group();
    b2.build(f2);
    for (let i = 0; i < 8; i++) {
      const g = (i % 2 ? f2 : f1).clone(true);
      g.scale.setScalar(rr(0.9, 1.3));
      surface.add(g);
      fishList.push({
        g: g,
        cx: pondX,
        cz: pondZ,
        r: rr(1.8, 5.2),
        a: rr(0, 6.28),
        sp: rr(0.28, 0.62) * (i % 3 === 0 ? -1 : 1),
        y: 0.42,
      });
    }
    TANKS.forEach(function (tk) {
      for (let j = 0; j < 4; j++) {
        const g2 = (j % 2 ? f2 : f1).clone(true);
        g2.scale.setScalar(rr(0.7, 0.95));
        surface.add(g2);
        fishList.push({
          g: g2,
          cx: tk.x,
          cz: tk.z,
          r: rr(0.7, 1.7),
          a: rr(0, 6.28),
          sp: rr(0.5, 0.9) * (j % 2 ? -1 : 1),
          y: 0.9,
        });
      }
    });
  })();

  /* ================= ESPUMA, RESPINGOS E LAGOA/CÓRREGO ================= */
  waterBatch.build(surface, { mat: waterMat });
  pondBatch.build(surface, { mat: pondMat });
  surfaceBatch.build(surface);
  const foam = [];
  (function () {
    const gm = new THREE.MeshBasicMaterial({ color: PAL.light.white });
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(rr(0.8, 2.0), 0.06, 0.12), gm);
      let zr = i < 14 ? [-74, -62] : [-39, 74];
      if (i >= 14) {
        zr = [-36, 74];
      }
      m.position.set(rr(43.7, 47.3), -0.5, rr(zr[0], zr[1]));
      surface.add(m);
      foam.push({ m: m, v: rr(1.8, 3.4), z0: zr[0], z1: zr[1] });
    }
  })();
  const splash = [],
    splashGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22),
    splashMats = [
      new THREE.MeshBasicMaterial({ color: PAL.light.white }),
      new THREE.MeshBasicMaterial({ color: C(0x8fdcf5) }),
      new THREE.MeshBasicMaterial({ color: C(0x4cc6f2) }),
    ];
  for (let sI = 0; sI < 34; sI++) {
    const sm = new THREE.Mesh(splashGeo, splashMats[sI % 3]);
    sm.visible = false;
    surface.add(sm);
    splash.push({ m: sm, life: 0, vx: 0, vy: 0, vz: 0 });
  }
  let splashT = 0;

  /* ================= ANIMAÇÃO ================= */
  surface.userData.tick = function (dt, t, s) {
    /* roda d'água e moinho em velocidade constante e suave */
    const ws = (0.5 + s.flow * 1.6) * 0.8;
    wheelSpin.rotation.z -= dt * ws;
    rotor.rotation.z += dt * (0.5 + s.wind * 2.0);
    /* espuma do córrego */
    for (let i = 0; i < foam.length; i++) {
      const f = foam[i];
      f.m.position.z += f.v * dt * (0.5 + s.flow);
      if (f.m.position.z > f.z1) f.m.position.z = f.z0;
      f.m.scale.x = 0.8 + Math.sin(t * 3 + i) * 0.25;
    }
    /* respingos de cubos junto às pás */
    splashT += dt * (8 + s.flow * 18);
    while (splashT > 1) {
      splashT -= 1;
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
    /* peixes em círculo */
    fishList.forEach(function (fh) {
      fh.a += fh.sp * dt;
      fh.g.position.set(
        fh.cx + Math.cos(fh.a) * fh.r,
        fh.y + Math.sin(t * 2 + fh.a * 3) * 0.02,
        fh.cz + Math.sin(fh.a) * fh.r,
      );
      fh.g.rotation.y = -fh.a + (fh.sp > 0 ? -Math.PI / 2 : Math.PI / 2);
    });
    /* animais passeando */
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
    /* afastamento: animais da mesma espécie não se atravessam */
    const SEP = { pig: 1.7, hen: 0.6, goat: 1.3 };
    for (let ia = 0; ia < animals.length; ia++)
      for (let ib = ia + 1; ib < animals.length; ib++) {
        const A = animals[ia],
          B = animals[ib];
        if (A.kind !== B.kind) continue;
        const ddx = B.g.position.x - A.g.position.x,
          ddz = B.g.position.z - A.g.position.z,
          dd = Math.sqrt(ddx * ddx + ddz * ddz) || 0.001,
          mn = SEP[A.kind];
        if (dd < mn) {
          const pu = (mn - dd) / 2 / dd;
          A.g.position.x -= ddx * pu;
          A.g.position.z -= ddz * pu;
          B.g.position.x += ddx * pu;
          B.g.position.z += ddz * pu;
        }
      }
    /* giroflex e LEDs */
    beacons.forEach(function (bc, n) {
      const on = Math.floor(t * 2.2 + n * 0.4) % 2 === 0;
      bc.mesh.material.color.copy(C(on ? PAL.flora.sunflower : K.orange));
      bc.mesh.scale.setScalar(on ? 1.15 : 0.9);
      bc.bar.rotation.y = t * 7 + n;
    });
    ledGroups.forEach(function (lg, n) {
      lg.visible = Math.floor(t * (1.6 + n * 0.35) + n) % 4 !== 0;
    });
  };

  /* ================= BUNKER · UM NÍVEL · 40 × 35 m = 1.400 m² · piso a −8,7 m · sob a Casa Grande e parte do Engenho ================= */
  const ledGroups = [];
  let bunkCapMesh = null;
  const capMat = toonMat.clone();
  (function () {
    const FL = BFL;
    const WB = BWH;
    let i;
    let j;
    let k;
    const bunkerWallBatch = new Batch(),
      bunkerBatch = new Batch(),
      ledBatchA = new Batch(),
      ledBatchB = new Batch(),
      ledBatchC = new Batch(),
      glowBatch = new Batch(),
      neonBatch = new Batch(),
      netBatch = new Batch(),
      hatchBatch = new Batch(),
      capBatch = new Batch();
    const WALLC = 0xc4cad0,
      PW = 0xe9edf0,
      DARK = PAL.dark.navyBlack,
      NEON = 0xff2bd6,
      CY = PAL.neon.cyan,
      GRN = PAL.neon.mint;
    /* limites */
    const X1 = BUNKER_INNER.x1,
      X2 = BUNKER_INNER.x2,
      Z1 = BUNKER_INNER.z1,
      Z2 = BUNKER_INNER.z2,
      ZA = BUNKER_INNER.corridorZ1,
      ZB =
        BUNKER_INNER.corridorZ2; /* interior; fileira dos fundos até ZA, corredor ZA..ZB, fileira da frente ZB..Z2 */
    function addBunkerWallCollider(axis, fixed, lo, hi, gaps, th) {
      let cur = lo;
      (gaps || [])
        .slice()
        .sort(function (p, q) {
          return p[0] - q[0];
        })
        .forEach(function (q) {
          addColliderSegment(cur, q[0]);
          cur = q[1];
        });
      addColliderSegment(cur, hi);
      function addColliderSegment(a, b) {
        if (b - a < 0.05) return;
        if (axis === 'x') addCollider(a, fixed - th / 2, b, fixed + th / 2, 'u');
        else addCollider(fixed - th / 2, a, fixed + th / 2, b, 'u');
      }
    }
    function addPartitionX(z, x1, x2, gaps, color) {
      wall(bunkerWallBatch, 'x', z, x1, x2, gaps, FL, WB - 0.04, 0.3, color || PW, null);
      addBunkerWallCollider('x', z, x1, x2, gaps, 0.3);
    }
    function addPartitionZ(x, z1, z2, gaps, color) {
      wall(bunkerWallBatch, 'z', x, z1, z2, gaps, FL, WB - 0.04, 0.3, color || PW, null);
      addBunkerWallCollider('z', x, z1, z2, gaps, 0.3);
    }
    function tile(x1, z1, x2, z2, c) {
      bunkerBatch.addBox(x2 - x1, 0.06, z2 - z1, c, (x1 + x2) / 2, FL, (z1 + z2) / 2);
    }
    function doorGap(c, w) {
      return [c - w / 2, c + w / 2, 0, 2.5];
    }

    /* ---------- casca ---------- */
    bunkerWallBatch.addBox(40, 0.2, 35, 0xb8c0c7, 8, FLOOR, -55.5);
    bunkerWallBatch.addBox(0.6, WB, 35, WALLC, -11.7, FL, -55.5);
    bunkerWallBatch.addBox(0.6, WB, 35, WALLC, 27.7, FL, -55.5);
    bunkerWallBatch.addBox(40, WB, 0.6, WALLC, 8, FL, -72.7);
    bunkerWallBatch.addBox(40, WB, 0.6, WALLC, 8, FL, -38.3);
    addCollider(-12.2, -73.2, -11.4, -37.8, 'u');
    addCollider(27.4, -73.2, 28.2, -37.8, 'u');
    addCollider(-12.2, -73.2, 28.2, -72.4, 'u');
    addCollider(-12.2, -38.6, 28.2, -37.8, 'u');
    /* cobertura (laje + terra + grama): vira vidro com a abertura do corte */
    capBatch.addBox(40, 0.8, 35, 0xaab2b9, 8, -5.1, -55.5);
    [
      [-5, -2.4, 0x946037],
      [-2.4, -0.4, 0x6e4527],
    ].forEach(function (b) {
      const y0 = Math.max(b[0], -4.3),
        y1 = Math.min(b[1], -0.4);
      if (y1 > y0 + 0.01) capBatch.addBox(40, y1 - y0, 35, b[2], 8, y0, -55.5);
    });
    capBatch.addBox(40, 0.4, 35, K.grass, 8, -0.4, -55.5);
    capMat.transparent = false;
    bunkCapMesh = capBatch.build(surface, { mat: capMat, outline: false });

    /* ---------- paredes ---------- */
    addPartitionX(ZA, X1, X2, [
      doorGap(-8.2, 1.6),
      doorGap(-2.3, 1.2),
      doorGap(2.0, 1.2),
      doorGap(5.5, 1.2),
      doorGap(8.6, 1.2),
      doorGap(13.1, 1.4),
      doorGap(18.05, 1.3),
      doorGap(21.5, 1.2),
      doorGap(25.2, 1.2),
    ]);
    addPartitionX(ZB, X1, X2, [
      [-8.2, -2.2, 0, 2.8],
      doorGap(4.0, 1.2),
      doorGap(9.1, 1.4),
      doorGap(16.4, 1.6),
      doorGap(23.9, 1.4),
    ]);
    [-4.4, 0.1, 3.9, 7.1, 10.1, 16.1, 20.0, 23.0].forEach(function (x) {
      addPartitionZ(x, Z1, ZA, []);
    });
    [2.2, 5.8, 12.4, 20.4].forEach(function (x) {
      addPartitionZ(x, ZB, Z2, []);
    });
    /* pisos por ambiente */
    tile(X1, Z1, -4.4, ZA, 0x12141c);
    tile(-4.4, Z1, 0.1, ZA, PAL.wood.oak);
    tile(0.1, Z1, 3.9, ZA, PAL.wood.floorBoard);
    tile(3.9, Z1, 7.1, ZA, 0xe8c9d0);
    tile(7.1, Z1, 10.1, ZA, 0x6b7a8a);
    tile(10.1, Z1, 16.1, ZA, 0xdfe6ea);
    tile(16.1, Z1, 20, ZA, 0xeaf3f7);
    tile(20, Z1, 23, ZA, 0xf2f4f8);
    tile(23, Z1, X2, ZA, 0xe2e6ea);
    tile(X1, ZA, X2, ZB, PAL.dark.slate);
    tile(X1, ZB, 2.2, Z2, 0xb69a74);
    tile(2.2, ZB, 5.8, Z2, 0xe8d3b0);
    tile(5.8, ZB, 12.4, Z2, 0x1e1a26);
    tile(12.4, ZB, 20.4, Z2, 0x2c4a3a);
    tile(20.4, ZB, X2, Z2, PAL.light.tileGrey);
    /* corredor: neon e dutos */
    neonBatch.addBox(38.6, 0.05, 0.05, NEON, 8, FL + 3.3, ZA + 0.2);
    neonBatch.addBox(38.6, 0.05, 0.05, CY, 8, FL + 3.3, ZB - 0.2);
    bunkerBatch.addGeometry(
      cylG(1, 16),
      K.steel,
      8,
      FL + 3.0,
      -54.5,
      [0.18, 38, 0.18],
      [0, 0, Math.PI / 2],
    );
    bunkerBatch.addGeometry(
      cylG(1, 16),
      K.blue,
      8,
      FL + 2.65,
      -54.5,
      [0.14, 38, 0.14],
      [0, 0, Math.PI / 2],
    );
    /* escada de emergência: poço com escada de ferro até a escotilha na superfície */
    bunkerBatch.addBox(1.4, 0.1, 1.4, K.steelD, 26.5, FL, -54.5);
    [-0.5, 0.5].forEach(function (o) {
      bunkerBatch.addBeam([26.5 + o, FL, -54.5], [26.5 + o, -0.2, -54.5], 0.05, K.steelD, 5);
    });
    for (i = 0; i < 14; i++)
      bunkerBatch.addBox(1.0, 0.04, 0.04, K.steelD, 26.5, FL + 0.4 + i * 0.55, -54.5);
    hatchBatch.addBox(1.8, 0.12, 1.8, K.steelD, 26.5, 0, -54.5);
    hatchBatch.addBox(1.5, 0.06, 1.5, K.red, 26.5, 0.12, -54.5);
    hatchBatch.addCylinder(0.07, 0.12, K.steel, 26.5, 0.18, -54.5, 6);

    /* helpers de louça e móveis */
    function toilet(x, z, ry) {
      bunkerBatch.setOrigin(x, 0, z, ry || 0);
      bunkerBatch.addBox(0.42, 0.42, 0.6, K.white, 0, FL + 0.06, 0);
      bunkerBatch.addBox(0.4, 0.55, 0.2, K.white, 0, FL + 0.06, -0.38);
      bunkerBatch.addBox(0.44, 0.05, 0.5, K.steel, 0, FL + 0.48, 0.02);
      bunkerBatch.setOrigin(0, 0, 0, 0);
    }
    function sink(x, z, ry) {
      bunkerBatch.setOrigin(x, 0, z, ry || 0);
      bunkerBatch.addCylinder(0.1, 0.7, K.white, 0, FL + 0.06, 0, 6);
      bunkerBatch.addBox(0.65, 0.14, 0.48, K.white, 0, FL + 0.76, 0);
      bunkerBatch.addCylinder(0.035, 0.3, K.steel, 0, FL + 0.9, -0.17, 5);
      bunkerBatch.addBox(0.7, 0.7, 0.04, 0x9bd9f1, 0, FL + 1.36, -0.3);
      bunkerBatch.setOrigin(0, 0, 0, 0);
    }
    function shower(x, z, sz) {
      bunkerBatch.addBox(1.1, 0.08, 1.1, 0xeaf3f7, x, FL + 0.06, z);
      bunkerBatch.addCylinder(0.03, 1.9, K.steel, x - 0.5, FL + 0.14, z + sz * 0.5, 5);
      bunkerBatch.addBox(0.3, 0.05, 0.3, K.steel, x - 0.38, FL + 1.99, z + sz * 0.45);
      bunkerBatch.addBox(0.04, 1.9, 1.1, PAL.glass.showerGlass, x + 0.55, FL + 0.14, z);
    }
    /* banheiro nos fundos (zw = parede dos fundos, sz = +1): paredes com porta voltada ao quarto */
    function addBunkerBathroom(xo, bw, zw, dxa, dxb, sideWall) {
      const zf = zw + 2.55;
      wall(
        bunkerWallBatch,
        'x',
        zf,
        xo - 0.15,
        xo + bw + (sideWall ? 0.15 : 0),
        [[dxa, dxb, 0, 2.4]],
        FL,
        WB - 0.04,
        0.3,
        PW,
        null,
      );
      addBunkerWallCollider('x', zf, xo - 0.15, xo + bw, [[dxa, dxb, 0, 2.4]], 0.3);
      if (sideWall) {
        wall(bunkerWallBatch, 'z', xo + bw + 0.15, zw, zf, [], FL, WB - 0.04, 0.3, PW, null);
        addBunkerWallCollider('z', xo + bw + 0.15, zw, zf, [], 0.3);
      }
      tile(xo, zw, xo + bw, zf - 0.15, 0xeaf3f7);
      toilet(xo + 0.55, zw + 0.5, 0);
      sink(xo + 1.6, zw + 0.35, 0);
      shower(xo + 0.65, zw + 1.7, 1);
      bunkerBatch.addBox(0.06, 1.4, 2.3, AZB, xo + 0.04, FL + 0.06, zw + 1.2);
    }
    function addBunkerDoubleBed(bx, bz, c) {
      bunkerBatch.addBox(2.0, 0.5, 2.2, K.woodD, bx, FL + 0.06, bz);
      bunkerBatch.addBox(1.9, 0.28, 2.1, PAL.light.ivory, bx, FL + 0.56, bz);
      bunkerBatch.addBox(1.9, 0.12, 1.3, c, bx, FL + 0.84, bz + 0.4);
      bunkerBatch.addBox(1.4, 0.18, 0.5, K.white, bx, FL + 0.84, bz - 0.8);
      bunkerBatch.addBox(2.1, 1.3, 0.14, K.woodD, bx, FL + 0.06, bz - 1.15);
      bunkerBatch.addBox(0.5, 0.45, 0.5, K.woodL, bx + 1.5, FL + 0.06, bz - 0.8);
      bunkerBatch.addBox(0.5, 0.45, 0.5, K.woodL, bx - 1.5, FL + 0.06, bz - 0.8);
    }
    function addBunkerSingleBed(bx, bz, c) {
      bunkerBatch.addBox(1.1, 0.4, 2.0, K.woodD, bx, FL + 0.06, bz);
      bunkerBatch.addBox(1.0, 0.22, 1.9, PAL.light.ivory, bx, FL + 0.46, bz);
      bunkerBatch.addBox(1.0, 0.1, 1.2, c, bx, FL + 0.68, bz + 0.35);
      bunkerBatch.addBox(1.2, 1.0, 0.12, K.woodD, bx, FL + 0.06, bz - 1.05);
    }
    function wardrobe(wx, wz, r) {
      bunkerBatch.setOrigin(wx, 0, wz, r || 0);
      bunkerBatch.addBox(1.6, 2.3, 0.6, K.woodD, 0, FL + 0.06, 0);
      bunkerBatch.addBox(0.03, 2.0, 0.05, PAL.clay.gold, 0, FL + 0.26, 0.32);
      bunkerBatch.setOrigin(0, 0, 0, 0);
    }
    function desk(x, z, len, rot) {
      bunkerBatch.setOrigin(x, 0, z, rot || 0);
      bunkerBatch.addBox(len, 0.05, 0.8, K.woodL, 0, FL + 0.76, 0);
      bunkerBatch.addBox(0.06, 0.7, 0.7, K.woodD, -len / 2 + 0.05, FL + 0.06, 0);
      bunkerBatch.addBox(0.06, 0.7, 0.7, K.woodD, len / 2 - 0.05, FL + 0.06, 0);
      bunkerBatch.setOrigin(0, 0, 0, 0);
    }
    function chair(x, z, c) {
      bunkerBatch.addBox(0.5, 0.1, 0.5, c || PAL.dark.deviceBlack, x, FL + 0.5, z);
      bunkerBatch.addBox(0.5, 0.8, 0.08, c || PAL.dark.deviceBlack, x, FL + 0.55, z - 0.26);
      bunkerBatch.addCylinder(0.05, 0.44, K.steelD, x, FL + 0.06, z, 6);
      bunkerBatch.addCylinder(0.28, 0.04, K.steelD, x, FL + 0.06, z, 8);
    }
    function plant(x, z, s) {
      bunkerBatch.addCylinder(0.22 * s, 0.35 * s, PAL.clay.terracotta, x, FL + 0.06, z, 8);
      bunkerBatch.addSphere(0.4 * s, 0x3fae52, x, FL + 0.6 * s + 0.2, z, 1, 1.2, 1);
    }

    /* =================== FILEIRA DOS FUNDOS: dormitórios (x −11,4 → 10,1) =================== */
    /* ---- SUÍTE CYBERPUNK DO MESTRE (7,0 × 16,6 m): closet · lounge e estação dev · cama-casulo com mosquiteiro · banheiro ---- */
    (function () {
      const x0 = -11.25,
        x1 = -4.55;
      addBunkerBathroom(
        -7.35,
        2.8,
        Z1,
        -5.6,
        -4.7,
        false,
      ); /* banheiro-cabine no canto leste dos fundos */
      wardrobe(x0 + 0.3, -57.2, Math.PI / 2);
      wardrobe(x0 + 0.3, -58.8, Math.PI / 2);
      bunkerBatch.addBox(0.5, 0.8, 1.6, PAL.dark.navyBlack, x1 - 0.3, FL + 0.06, -57.4);
      neonBatch.addBox(0.04, 1.5, 1.2, CY, x1 - 0.04, FL + 0.9, -57.4);
      bunkerBatch.addBox(0.4, 0.05, 1.0, K.steelD, x1 - 0.4, FL + 0.5, -59.0);
      for (i = 0; i < 5; i++)
        bunkerBatch.addBox(
          0.3,
          0.1,
          0.18,
          [K.red, K.white, PAL.glass.windowDeep, K.yellow, PAL.dark.deviceBlack][i],
          x0 + 0.55,
          FL + 0.06 + i * 0.0,
          -59.9 + 0.0,
        );
      /* estação dev: mesa em L, 3 monitores curvos, PC com RGB, rack e cadeira gamer */
      desk(x0 + 0.5, -62.2, 3.8, Math.PI / 2);
      [-63.5, -62.2, -60.9].forEach(function (mz, n) {
        bunkerBatch.addBox(
          0.08,
          0.62,
          1.28,
          PAL.dark.void,
          x0 + 0.2,
          FL + 1.0,
          mz + (n === 0 ? 0.08 : n === 2 ? -0.08 : 0),
        );
        neonBatch.addBox(0.04, 0.56, 1.2, [CY, NEON, GRN][n], x0 + 0.28, FL + 1.03, mz);
      });
      bunkerBatch.addBox(0.3, 0.5, 0.6, PAL.dark.navyBlack, x0 + 0.5, FL + 0.81, -64.0);
      neonBatch.addBox(0.02, 0.4, 0.5, CY, x0 + 0.66, FL + 0.86, -64.0);
      bunkerBatch.addBox(0.5, 0.03, 0.2, K.black, x0 + 1.0, FL + 0.8, -62.2);
      chair(x0 + 1.7, -62.2, PAL.dark.deviceBlack);
      bunkerBatch.addBox(0.9, 1.9, 0.8, PAL.dark.graphite, x0 + 0.5, FL + 0.06, -65.4);
      for (i = 0; i < 9; i++)
        neonBatch.addBox(
          0.05,
          0.05,
          0.5,
          [CY, GRN, NEON][i % 3],
          x0 + 0.92,
          FL + 0.3 + i * 0.19,
          -65.4,
        );
      neonBatch.addBox(0.04, 0.04, 3.6, CY, x0 + 0.08, FL + 0.72, -62.2);
      /* mesa holográfica e área de lounge */
      bunkerBatch.addCylinder(0.9, 0.6, DARK, -6.9, FL + 0.06, -61.6, 16);
      neonBatch.addCylinder(0.95, 0.04, CY, -6.9, FL + 0.66, -61.6, 16);
      neonBatch.addSphere(0.55, CY, -6.9, FL + 1.6, -61.6, 1, 1, 1, 1);
      neonBatch.addCylinder(1.0, 0.03, NEON, -6.9, FL + 0.07, -61.6, 22);
      bunkerBatch.addBox(0.9, 0.5, 2.4, PAL.fabric.indigo, x1 - 0.5, FL + 0.06, -61.6);
      bunkerBatch.addBox(0.3, 0.8, 2.4, PAL.fabric.indigo, x1 - 0.2, FL + 0.06, -61.6);
      bunkerBatch.addCylinder(0.5, 0.4, PAL.flora.violet, -9.2, FL + 0.06, -59.9, 10);
      bunkerBatch.addCylinder(0.5, 0.4, PAL.neon.cyan, -9.2, FL + 0.06, -65.3, 10);
      bunkerBatch.addBox(0.9, 1.8, 0.8, PAL.dark.slate, -9.2, FL + 0.06, -56.8);
      neonBatch.addBox(
        0.7,
        0.5,
        0.04,
        NEON,
        -9.2,
        FL + 1.2,
        -56.4,
      ); /* fliperama (ao lado da porta) */
      /* cama-casulo redonda com mosquiteiro, cabeceira em arco e anel de neon */
      const bx = -8.1,
        bz = -67.9;
      bunkerBatch.addCylinder(1.95, 0.3, 0x15171f, bx, FL + 0.06, bz, 28);
      bunkerBatch.addCylinder(1.7, 0.3, 0xf0eef6, bx, FL + 0.36, bz, 28);
      neonBatch.addCylinder(2.0, 0.03, NEON, bx, FL + 0.07, bz, 32);
      bunkerBatch.addCylinder(
        0.55,
        0.18,
        PAL.flora.violet,
        bx - 0.6,
        FL + 0.66,
        bz - 0.8,
        10,
        0.45,
      );
      bunkerBatch.addCylinder(0.55, 0.18, PAL.neon.cyan, bx + 0.2, FL + 0.66, bz - 0.9, 10, 0.45);
      bunkerBatch.addCylinder(1.0, 0.06, PAL.dark.slate, bx, FL + 0.66, bz + 0.5, 20, 0.9);
      for (let th = -Math.PI / 2 - 1.1; th <= -Math.PI / 2 + 1.11; th += 0.275) {
        const sx = bx + 2.25 * Math.cos(th),
          sz = bz + 2.25 * Math.sin(th),
          rr2 = Math.atan2(-Math.cos(th), -Math.sin(th));
        bunkerBatch.addBox(0.48, 1.7, 0.12, DARK, sx, FL + 0.06, sz, [0, rr2, 0]);
        neonBatch.addBox(0.04, 1.5, 0.04, NEON, sx, FL + 0.16, sz + (sz < bz ? 0.07 : -0.07));
      }
      for (i = 0; i < 16; i++) {
        const a2 = (i / 16) * Math.PI * 2,
          cx2 = bx + 2.15 * Math.cos(a2),
          cz2 = bz + 2.15 * Math.sin(a2);
        const giroY = Math.atan2(-Math.cos(a2), -Math.sin(a2));
        neonBatch.addBox(0.5, 0.05, 0.1, CY, cx2, FL + 3.0, cz2, [0, giroY, 0]);
      }
      netBatch.addCylinder(
        2.1,
        2.9,
        0xeeeaff,
        bx,
        FL + 0.08,
        bz,
        28,
        0.35,
      ); /* mosquiteiro translúcido em cúpula */
      bunkerBatch.addCylinder(0.04, 0.5, K.steelD, bx, FL + 3.0, bz, 6);
      neonBatch.addSphere(0.14, PAL.light.warmGlow, bx, FL + 3.1, bz, 1, 1, 1, 1);
      /* parede aquário, skyline e prateleiras */
      bunkerBatch.addBox(3.6, 1.5, 0.3, 0x0a2a3a, -9.45, FL + 0.5, -72.2);
      neonBatch.addBox(3.4, 1.3, 0.05, 0x1a6fd0, -9.45, FL + 0.6, -72.0);
      [
        [-10.5, 0.9, 0xffa14a],
        [-9.4, 1.2, PAL.neon.magenta],
        [-8.4, 0.8, PAL.neon.yellow],
        [-9.9, 1.5, PAL.neon.mint],
      ].forEach(function (f) {
        neonBatch.addSphere(0.12, f[2], f[0], FL + f[1], -71.95, 1.6, 1, 0.6);
      });
      bunkerBatch.addBox(0.1, 2.6, 5.4, PAL.dark.void, x0 - 0.05, FL + 0.3, -68.6);
      for (i = 0; i < 18; i++) {
        const skh = 0.5 + (((i * 37) % 17) / 17) * 1.9;
        neonBatch.addBox(
          0.08,
          skh,
          0.26,
          [CY, NEON, PAL.neon.yellow, PAL.neon.violet][i % 4],
          x0 + 0.08,
          FL + 0.4,
          -71.0 + i * 0.3,
        );
      }
      for (i = 0; i < 3; i++) {
        bunkerBatch.addBox(0.3, 0.05, 1.6, K.woodD, x1 - 0.2, FL + 1.0 + i * 0.5, -68.4);
        for (j = 0; j < 4; j++)
          bunkerBatch.addSphere(
            0.1,
            [PAL.neon.magenta, PAL.neon.cyan, PAL.neon.yellow, PAL.flora.lime][(i + j) % 4],
            x1 - 0.2,
            FL + 1.15 + i * 0.5,
            -69.0 + j * 0.4,
            1,
            1.4,
            1,
          );
      }
      bunkerBatch.addBox(0.9, 0.8, 0.5, PAL.dark.slate, x1 - 0.4, FL + 0.06, -65.5);
      bunkerBatch.addBox(0.5, 0.1, 0.4, K.black, x1 - 0.4, FL + 0.86, -65.5);
      bunkerBatch.addCylinder(
        0.2,
        0.04,
        PAL.dark.deviceBlack,
        x1 - 0.4,
        FL + 0.96,
        -65.5,
        16,
      ); /* aparador com vitrola */
      bunkerBatch.addBox(0.4, 1.4, 0.3, PAL.dark.deviceBlack, x1 - 0.2, FL + 0.06, -64.6);
      bunkerBatch.addBox(
        0.4,
        1.4,
        0.3,
        PAL.dark.deviceBlack,
        x1 - 0.2,
        FL + 0.06,
        -66.4,
      ); /* caixas de som */
      plant(x0 + 0.45, -70.5, 1.2);
      plant(x1 - 0.4, -69.9, 1.0);
      neonBatch.addBox(6.4, 0.05, 0.05, NEON, -7.9, FL + 3.4, -62);
      neonBatch.addBox(6.4, 0.05, 0.05, CY, -7.9, FL + 3.4, -67);
    })();
    /* ---- SUÍTE DOS PAIS (4,5 × 16,6 m): cama king, poltrona de leitura, penteadeira, adega, TV, banheiro ---- */
    (function () {
      const x0 = -4.25,
        x1 = -0.05;
      addBunkerBathroom(x0, 2.6, Z1, -2.7, -1.8, true);
      wardrobe(-0.9, -72.1, 0);
      addBunkerDoubleBed(-1.9, -65.6, PAL.flora.grass);
      bunkerBatch.addBox(3.2, 1.6, 0.16, PAL.wood.darkWalnut, -1.9, FL + 0.06, -67.0);
      neonBatch.addBox(2.8, 0.05, 0.05, PAL.neon.amber, -1.9, FL + 1.55, -66.88);
      bunkerBatch.addBox(0.9, 1.0, 0.4, K.woodD, -3.9, FL + 0.06, -67.3);
      neonBatch.addCylinder(0.06, 0.05, PAL.light.warmGlow, -3.9, FL + 1.1, -67.3, 6);
      bunkerBatch.addBox(1.6, 0.9, 0.5, K.woodD, x1 - 0.3, FL + 0.06, -60.8);
      bunkerBatch.addBox(0.08, 1.1, 1.6, PAL.dark.void, x1 - 0.08, FL + 0.9, -60.8);
      neonBatch.addBox(0.03, 1.0, 1.5, PAL.neon.blue, x1 - 0.14, FL + 0.95, -60.8);
      bunkerBatch.addBox(1.0, 0.8, 0.5, K.woodL, x0 + 0.35, FL + 0.06, -57.3);
      bunkerBatch.addBox(0.04, 1.4, 0.9, PAL.glass.showerGlass, x0 + 0.1, FL + 0.9, -57.3);
      neonBatch.addBox(0.02, 1.4, 0.04, PAL.light.warmGlow, x0 + 0.12, FL + 0.9, -56.8);
      bunkerBatch.addBox(0.9, 0.5, 0.9, PAL.fabric.burgundy, x0 + 0.7, FL + 0.06, -61.5);
      bunkerBatch.addBox(0.2, 0.6, 0.9, PAL.fabric.burgundy, x0 + 0.3, FL + 0.06, -61.5);
      bunkerBatch.addCylinder(0.03, 1.2, K.steelD, x0 + 1.3, FL + 0.06, -61.6, 5);
      neonBatch.addSphere(0.16, PAL.light.warmGlow, x0 + 1.3, FL + 1.3, -61.6, 1, 1, 1, 1);
      bunkerBatch.addBox(0.7, 1.9, 0.5, PAL.wood.darkWalnut, x1 - 0.4, FL + 0.06, -70.8);
      for (i = 0; i < 6; i++)
        bunkerBatch.addCylinder(
          0.07,
          0.3,
          [PAL.fabric.wine, 0x2a4a1f, PAL.fabric.wine][i % 3],
          x1 - 0.45 + ((i % 2) * 0.2 - 0.1),
          FL + 0.4 + ((i / 2) | 0) * 0.45,
          -70.75,
          6,
        );
      bunkerBatch.addCylinder(1.2, 0.03, PAL.stone.sandstone, -1.9, FL + 0.06, -63.2, 20);
      neonBatch.addBox(3.6, 0.04, 0.04, PAL.neon.amber, -2.1, FL + 3.3, -64);
    })();
    /* ---- IRMÃ (3,5 m) · SOBRINHA 11 anos (2,9 m) · CONVIDADO (2,7 m) ---- */
    addBunkerBathroom(0.25, 2.4, Z1, 1.0, 1.9, true);
    addBunkerDoubleBed(2.4, -64.0, PAL.flora.salmon);
    wardrobe(3.45, -60.6, -Math.PI / 2);
    desk(0.7, -58.2, 1.3, 0);
    bunkerBatch.addBox(0.5, 0.4, 0.05, K.black, 0.7, FL + 0.85, -58.5);
    chair(0.7, -57.6, PAL.flora.purple);
    plant(3.4, -57.0, 1.0);
    bunkerBatch.addCylinder(0.9, 0.03, PAL.flora.purple, 1.0, FL + 0.06, -60.5, 18);
    addBunkerBathroom(4.05, 2.9, Z1, 5.0, 5.9, false);
    addBunkerSingleBed(6.0, -64.0, PAL.flora.violet);
    wardrobe(4.35, -60.5, Math.PI / 2);
    bunkerBatch.addBox(1.2, 0.06, 0.6, K.woodL, 5.6, FL + 0.76, -57.4);
    bunkerBatch.addBox(0.5, 0.4, 0.05, K.black, 5.6, FL + 0.85, -57.7);
    chair(5.6, -56.9, 0xff7ac8);
    neonBatch.addBox(2.6, 0.05, 0.05, 0xffd98a, 5.5, FL + 3.2, -70);
    bunkerBatch.addCone(0.7, 1.5, 0xe8c9a0, 4.8, FL + 0.06, -61.6, 6);
    neonBatch.addSphere(
      0.1,
      PAL.light.warmGlow,
      4.8,
      FL + 0.6,
      -61.6,
      1,
      1,
      1,
      1,
    ); /* cabaninha de leitura */
    for (i = 0; i < 10; i++)
      neonBatch.addBox(
        0.06,
        0.06,
        0.06,
        [PAL.neon.yellow, PAL.light.white, PAL.glass.iceBlue][i % 3],
        4.2 + ((i * 7) % 11) * 0.25,
        FL + 3.45,
        -57.5 - ((i * 5) % 9) * 1.2,
      ); /* estrelinhas no teto */
    addBunkerBathroom(7.25, 2.7, Z1, 8.2, 9.1, false);
    addBunkerSingleBed(9.1, -64.0, PAL.flora.cornflower);
    wardrobe(7.55, -60.5, Math.PI / 2);
    desk(8.6, -57.6, 1.2, 0);
    chair(8.6, -57.0, PAL.glass.windowDeep);

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
    for (i = 0; i < 5; i++) {
      const rx = 10.95 + i * 1.1;
      bunkerBatch.addBox(0.95, 2.3, 0.9, PAL.dark.graphite, rx, FL, -71.9);
      for (j = 0; j < 10; j++)
        for (k = 0; k < 3; k++)
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
    for (i = 0; i < 4; i++) {
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
    for (i = 0; i < 4; i++)
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
    for (i = 0; i < 4; i++) {
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
      let a;
      let b;
      let c;
      for (a = 0; a < 3; a++) {
        bunkerBatch.addBox(0.5, 0.06, L, K.woodL, x, FL + 0.6 + a * 0.7, (z1 + z2) / 2);
        for (b = 0; b < n; b++)
          addBunkerPantryItem(x, FL + 0.66 + a * 0.7, z1 + 0.25 + b * 0.5, b + a * 3);
      }
      for (c = 0; c <= nu; c++)
        bunkerBatch.addBox(0.54, 2.3, 0.08, K.woodD, x, FL + 0.06, z1 + (c * L) / nu);
    }
    shelfZ(-52.4, -39.4, 2.6);
    shelfZ(-52.4, -39.4, 5.4);
    for (i = 0; i < 4; i++)
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
      for (i = 0; i < 3; i++) {
        bunkerBatch.addBox(
          0.9,
          0.5,
          0.9,
          PAL.fabric.burgundy,
          7.2 + i * 1.5,
          FL + 0.06 + n * 0.3,
          z,
        );
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
    for (i = 0; i < 2; i++) {
      bunkerBatch.addBox(0.9, 1.8, 0.8, PAL.dark.slate, 10.2 + i * 1.1, FL + 0.06, -39.6);
      neonBatch.addBox(0.7, 0.5, 0.04, [NEON, CY][i], 10.2 + i * 1.1, FL + 1.2, -39.98);
    }
    neonBatch.addBox(6.2, 0.05, 0.05, CY, 9.1, FL + 3.3, -46);
    /* hidroponia */
    [14.2, 16.4, 18.6].forEach(function (hx) {
      for (j = 0; j < 4; j++) {
        bunkerBatch.addBox(1.0, 0.08, 12.4, K.steelD, hx, FL + 0.5 + j * 0.7, -46.2);
        for (k = 0; k < 19; k++)
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
    for (i = 0; i < 4; i++)
      bunkerBatch.addBox(0.2, 0.2, 0.9, K.woodL, 24.2, FL + 0.12 + i * 0.2, -41.2);
    bunkerBatch.addBox(0.2, 0.2, 1.6, K.yellow, 22.6, FL + 0.06, -40.6);
    bunkerBatch.addBox(0.9, 0.05, 1.6, K.steelD, 22.6, FL + 0.26, -40.6);
    for (i = 0; i < 9; i++)
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
  })();

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
    let i;
    let b;
    for (i = 0; i < colliders.length; i++) {
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
