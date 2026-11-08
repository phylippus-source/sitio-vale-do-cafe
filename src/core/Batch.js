/* Batch: junta primitivas numa única malha com cor por vértice (poucos draw calls). */
import * as THREE from 'three';
import { C } from './color.js';
import { GX, cylG, coneG, ni } from './geometries.js';
import { toonMat, unlitMat, hullMat } from './materials.js';

const _m4 = new THREE.Matrix4();
const _q4 = new THREE.Quaternion();
const _e4 = new THREE.Euler();
const _v3 = new THREE.Vector3();
const _s3 = new THREE.Vector3();
const _nm3 = new THREE.Matrix3();
const _Y = new THREE.Vector3(0, 1, 0);

/* Normais suavizadas por posição (para o casco de contorno não abrir nas quinas). */
function smoothNormals(pos, nor) {
  const n = pos.length / 3;
  const map = new Map();
  const out = new Float32Array(pos.length);
  const keys = new Array(n);
  for (let i = 0; i < n; i++) {
    const k =
      Math.round(pos[3 * i] * 400) +
      10000 +
      20001 * (Math.round(pos[3 * i + 1] * 400) + 10000) +
      400040001 * (Math.round(pos[3 * i + 2] * 400) + 10000);
    keys[i] = k;
    let a = map.get(k);
    if (!a) {
      a = [0, 0, 0];
      map.set(k, a);
    }
    a[0] += nor[3 * i];
    a[1] += nor[3 * i + 1];
    a[2] += nor[3 * i + 2];
  }
  for (let i = 0; i < n; i++) {
    const v = map.get(keys[i]);
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    out[3 * i] = v[0] / l;
    out[3 * i + 1] = v[1] / l;
    out[3 * i + 2] = v[2] / l;
  }
  return out;
}

export class Batch {
  constructor() {
    this.pos = [];
    this.nor = [];
    this.col = [];
    this.base = new THREE.Matrix4();
    this.sealed = false;
  }

  /* Define a origem (posição e giro em Y) aplicada a tudo que for adicionado depois. */
  setOrigin(x, y, z, ry) {
    this.base.makeRotationY(ry || 0);
    this.base.setPosition(x || 0, y || 0, z || 0);
    return this;
  }

  /* Adiciona uma geometria já pronta: cor `hex`, posição, escala (número ou [x,y,z]), giro Euler `r` ou quaternion `q`. */
  addGeometry(geo, hex, x, y, z, s, r, q) {
    if (this.sealed) throw new Error('Batch já construído: não aceita mais primitivas');
    const g = ni(geo);
    const bb = g.boundingBox;
    const y0 = bb.min.y;
    const hh = Math.max(1e-6, bb.max.y - bb.min.y);
    if (typeof s === 'number') s = [s, s, s];
    s = s || [1, 1, 1];
    if (q) _q4.copy(q);
    else {
      r = r || [0, 0, 0];
      _e4.set(r[0], r[1], r[2]);
      _q4.setFromEuler(_e4);
    }
    if (!Number.isFinite(x + y + z + s[0] + s[1] + s[2] + _q4.x + _q4.y + _q4.z + _q4.w)) {
      console.error('[Batch] entrada não finita (rotação deve ser [rx, ry, rz])', {
        x,
        y,
        z,
        s,
        r,
      });
    }
    _v3.set(x, y, z);
    _s3.set(s[0], s[1], s[2]);
    _m4.compose(_v3, _q4, _s3);
    _m4.premultiply(this.base);
    _nm3.getNormalMatrix(_m4);
    const P = g.attributes.position;
    const N = g.attributes.normal;
    const c = C(hex);
    const n = P.count;
    for (let i = 0; i < n; i++) {
      _v3.fromBufferAttribute(P, i);
      const t = (_v3.y - y0) / hh;
      _v3.applyMatrix4(_m4);
      this.pos.push(_v3.x, _v3.y, _v3.z);
      _v3.fromBufferAttribute(N, i).applyMatrix3(_nm3).normalize();
      this.nor.push(_v3.x, _v3.y, _v3.z);
      const k = 0.93 + 0.12 * t;
      this.col.push(c.r * k, c.g * k, c.b * k);
    }
    return this;
  }

  /* Caixa pela base (y0 = fundo). */
  addBox(w, h, d, hex, x, y0, z, r) {
    return this.addGeometry(GX.box, hex, x, y0 + h / 2, z, [w, h, d], r);
  }

  /* Cilindro pela base: raio r, topo rt. */
  addCylinder(r, h, hex, x, y0, z, seg, rt, rot) {
    rt = rt == null ? r : rt;
    return this.addGeometry(cylG(rt / r, seg || 10), hex, x, y0 + h / 2, z, [r, h, r], rot);
  }

  /* Cone pela base. */
  addCone(r, h, hex, x, y0, z, seg, rot) {
    return this.addGeometry(coneG(seg || 6), hex, x, y0 + h / 2, z, [r, h, r], rot);
  }

  /* Icosfera (det = mais detalhada), com semi-eixos sx, sy, sz sobre o raio r. */
  addSphere(r, hex, x, y, z, sx, sy, sz, det) {
    return this.addGeometry(det ? GX.ico1 : GX.ico0, hex, x, y, z, [
      r * (sx || 1),
      r * (sy || 1),
      r * (sz || 1),
    ]);
  }

  /* Viga cilíndrica entre dois pontos a e b. */
  addBeam(a, b, rad, hex, seg) {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(b[0], b[1], b[2]);
    const len = A.distanceTo(B);
    const q = new THREE.Quaternion().setFromUnitVectors(_Y, B.clone().sub(A).normalize());
    return this.addGeometry(
      cylG(1, seg || 6),
      hex,
      (A.x + B.x) / 2,
      (A.y + B.y) / 2,
      (A.z + B.z) / 2,
      [rad, len, rad],
      null,
      q,
    );
  }

  /* Gera a malha (com contorno, salvo outline:false) e lacra o batch. */
  build(parent, o) {
    o = o || {};
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    const mesh = new THREE.Mesh(g, o.mat || (o.unlit ? unlitMat : toonMat));
    if (o.outline !== false) {
      const hg = new THREE.BufferGeometry();
      hg.setAttribute('position', g.attributes.position);
      hg.setAttribute(
        'snormal',
        new THREE.Float32BufferAttribute(smoothNormals(this.pos, this.nor), 3),
      );
      mesh.add(new THREE.Mesh(hg, hullMat));
    }
    if (parent) parent.add(mesh);
    this.pos = this.nor = this.col = null;
    this.sealed = true;
    return mesh;
  }
}
