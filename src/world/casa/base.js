/* Casa Grande · base comum: grupos, lotes de geometria, colisões e a função `wall` (parede com vãos). */
import * as THREE from 'three';
import { toonMat } from '../../core/materials.js';
import { GX } from '../../core/geometries.js';
import { Batch } from '../../core/Batch.js';
import { GF, GHT, UF, CASA_ORIGIN } from '../../config/dimensions.js';
import { K, WHT, PAL } from '../../config/palette.js';
import { surface, addCollider } from '../scene.js';

/* ================= CASA GRANDE · SOBRADO IMPERIAL REFORMADO · 26 × 20 m (2 pavimentos + porão alto) =================
 Tipologia (INEPAC / fazendas do Vale do Café): sobrado de planta retangular sobre porão alto de pedra, esteios de madeira e pau-a-pique,
 corpo central com frontão triangular, escadaria monumental de mármore com espelhos de azulejo e gradil de ferro, portas-janela com guarda-corpo de ferro,
 capela e escritório ladeando o hall, escada interna que se bifurca em social e serviço, sala central no sobrado, telhado de quatro águas em capa e canal. */
export const casaG = new THREE.Group();
casaG.position.set(CASA_ORIGIN.x, CASA_ORIGIN.y, CASA_ORIGIN.z);
surface.add(casaG);
export const flrMat = toonMat.clone();
export const casaWalls = new THREE.Group(),
  casaRoofG = new THREE.Group(),
  casaUp = new THREE.Group(),
  casaUpW = new THREE.Group();
casaG.add(casaWalls);
casaG.add(casaRoofG);
casaG.add(casaUp);
casaUp.add(casaUpW);
/* piso térreo, pé-direito térreo, piso do sobrado, pé-direito do sobrado */
casaUp.position.y = UF;
export const roofMat = toonMat.clone();
roofMat.side = THREE.DoubleSide;
export function addCasaCollider(x1, z1, x2, z2, lv) {
  addCollider(x1 + CASA_ORIGIN.x, z1 + CASA_ORIGIN.z, x2 + CASA_ORIGIN.x, z2 + CASA_ORIGIN.z, lv);
} /* colisão em coordenadas locais da casa */
/* moldura de janela: verga, peitoril, vidro, ombreiras, montante e cornija */
function addWindowFrame(B, g, y0, fixed, th, sill, top, s) {
  const m = (g[0] + g[1]) / 2,
    w = g[1] - g[0],
    hh = top - sill;
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
  B.addBox(w, hh - 0.05, 0.06, PAL.glass.windowDeep, m, y0 + sill + 0.01, fixed); /* vidro */
  B.addBox(0.16, hh - 0.02, th + 0.12, WHT, g[0] - 0.02, y0 + sill + 0.01, fixed);
  B.addBox(0.16, hh - 0.02, th + 0.12, WHT, g[1] + 0.02, y0 + sill + 0.01, fixed); /* ombreiras */
  B.addBox(0.06, hh - 0.06, 0.08, K.woodD, m, y0 + sill + 0.03, fixed + 0.05 * s); /* montante */
  B.addGeometry(
    GX.box,
    WHT,
    m,
    y0 + top + 0.22 + 0.18,
    fixed,
    [w + 0.3, 0.36, th + 0.1],
    [0, 0, 0],
  ); /* cornija */
}
/* venezianas verdes nos dois lados do vão */
function addShutters(B, g, y0, fixed, th, sill, top, s) {
  const w = g[1] - g[0],
    hh = top - sill;
  const sz2 = fixed + (th / 2 + 0.06) * s;
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
/* parede com vãos: eixo 'x' (ao longo de x, em z=fixed) ou 'z'. gaps [a,b,sill,top] (alturas a partir de y0) */
export function wall(B, axis, fixed, lo, hi, gaps, y0, h, th, color, lv, deco) {
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
    if (deco && axis === 'x') {
      addWindowFrame(B, g, y0, fixed, th, sill, top, deco);
      addShutters(B, g, y0, fixed, th, sill, top, deco);
    }
    cur = g[1];
  });
  addWallPiece(cur, hi, 0, h);
  addWallCollider(cur, hi);
}
export const casaWallBatch = new Batch();
export const casaRoofBatch = new Batch();
export const casaInteriorBatch = new Batch();
export const casaUnlitBatch = new Batch();
export const porchBatch = new Batch();
export const upperWallBatch = new Batch();
export const upperInteriorBatch = new Batch();
export const upperUnlitBatch = new Batch();
export const porchLampBatch = new Batch();
export const casaBaseBatch = new Batch();
export const Y0 = GF,
  groundH = GHT;
