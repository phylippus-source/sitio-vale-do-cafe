import { describe, it, expect, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { Batch } from '../../src/core/Batch.js';
import { GX } from '../../src/core/geometries.js';
import { toonMat, unlitMat, hullMat } from '../../src/core/materials.js';
import { C } from '../../src/core/color.js';

const WHITE = 0xffffff;

/* Menor e maior coordenada de cada eixo entre os vértices acumulados. */
function extent(b) {
  const mn = [Infinity, Infinity, Infinity];
  const mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < b.pos.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      mn[k] = Math.min(mn[k], b.pos[i + k]);
      mx[k] = Math.max(mx[k], b.pos[i + k]);
    }
  }
  return { mn, mx };
}

const near = (got, want, digits = 5) =>
  got.forEach((v, i) => expect(v).toBeCloseTo(want[i], digits));

afterEach(() => vi.restoreAllMocks());

describe('Batch: acúmulo de primitivas', () => {
  it('nasce vazio e aberto', () => {
    const b = new Batch();
    expect(b.pos).toEqual([]);
    expect(b.sealed).toBe(false);
  });

  it('addBox junta 36 vértices (6 faces × 2 triângulos × 3)', () => {
    const b = new Batch().addBox(2, 3, 4, WHITE, 0, 0, 0);
    expect(b.pos.length / 3).toBe(36);
    expect(b.nor.length).toBe(b.pos.length);
    expect(b.col.length).toBe(b.pos.length);
  });

  it('addBox respeita tamanho e posição, com y0 no fundo da caixa', () => {
    const { mn, mx } = extent(new Batch().addBox(2, 3, 4, WHITE, 10, 5, -7));
    near(mn, [9, 5, -9]);
    near(mx, [11, 8, -5]);
  });

  it('todas as normais saem unitárias', () => {
    const b = new Batch().addBox(2, 3, 4, WHITE, 1, 2, 3, [0.3, 0.7, 0.1]);
    for (let i = 0; i < b.nor.length; i += 3) {
      expect(Math.hypot(b.nor[i], b.nor[i + 1], b.nor[i + 2])).toBeCloseTo(1, 5);
    }
  });

  it('a cor por vértice varia de 0,93 (base) a 1,05 (topo)', () => {
    const b = new Batch().addBox(1, 1, 1, WHITE, 0, 0, 0);
    expect(Math.min(...b.col)).toBeCloseTo(0.93, 5);
    expect(Math.max(...b.col)).toBeCloseTo(1.05, 5);
  });

  it('a cor passa pela conversão sRGB para linear antes do sombreado', () => {
    const b = new Batch().addBox(1, 1, 1, 0x808080, 0, 0, 0);
    expect(Math.max(...b.col)).toBeCloseTo(C(0x808080).r * 1.05, 5);
  });

  it('os métodos de adição devolvem o próprio batch, para encadear', () => {
    const b = new Batch();
    expect(b.addBox(1, 1, 1, WHITE, 0, 0, 0)).toBe(b);
    expect(b.setOrigin(1, 2, 3, 0)).toBe(b);
    expect(b.addSphere(1, WHITE, 0, 0, 0)).toBe(b);
  });
});

describe('Batch: origem, escala e giro', () => {
  it('setOrigin desloca tudo o que vem depois', () => {
    const b = new Batch().setOrigin(100, 2, -30, 0).addBox(2, 2, 2, WHITE, 0, 0, 0);
    const { mn, mx } = extent(b);
    near(mn, [99, 2, -31]);
    near(mx, [101, 4, -29]);
  });

  it('setOrigin gira em Y o ponto de inserção e a peça', () => {
    const b = new Batch().setOrigin(100, 2, -30, Math.PI / 2).addBox(2, 2, 2, WHITE, 5, 0, 0);
    const { mn, mx } = extent(b);
    near([(mn[0] + mx[0]) / 2, (mn[2] + mx[2]) / 2], [100, -35]);
  });

  it('escala numérica equivale à escala [s, s, s]', () => {
    const a = new Batch().addGeometry(GX.box, WHITE, 1, 2, 3, 2);
    const b = new Batch().addGeometry(GX.box, WHITE, 1, 2, 3, [2, 2, 2]);
    expect(a.pos).toEqual(b.pos);
  });

  it('o giro Euler [rx, ry, rz] troca largura e profundidade', () => {
    const { mn, mx } = extent(new Batch().addBox(4, 1, 2, WHITE, 0, 0, 0, [0, Math.PI / 2, 0]));
    near([mx[0] - mn[0], mx[2] - mn[2]], [2, 4]);
  });

  it('um quaternion tem prioridade sobre o giro Euler', () => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
    const b = new Batch().addGeometry(GX.box, WHITE, 0, 0, 0, [4, 1, 2], [0, 0, 0], q);
    const { mn, mx } = extent(b);
    near([mx[0] - mn[0], mx[2] - mn[2]], [2, 4]);
  });

  it('avisa no console quando a entrada não é finita', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    new Batch().addBox(1, 1, 1, WHITE, NaN, 0, 0);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('entrada não finita');
  });

  it('não avisa quando tudo é finito', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    new Batch().addBox(1, 1, 1, WHITE, 0, 0, 0, [0.1, 0.2, 0.3]);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('Batch: formas', () => {
  it('addCylinder afunila do raio da base ao raio do topo', () => {
    const b = new Batch().addCylinder(2, 4, WHITE, 0, 0, 0, 12, 1);
    let base = 0;
    let top = 0;
    for (let i = 0; i < b.pos.length; i += 3) {
      const r = Math.hypot(b.pos[i], b.pos[i + 2]);
      if (Math.abs(b.pos[i + 1]) < 1e-6) base = Math.max(base, r);
      if (Math.abs(b.pos[i + 1] - 4) < 1e-6) top = Math.max(top, r);
    }
    near([base, top], [2, 1]);
  });

  it('addCylinder sem raio de topo fica reto', () => {
    const b = new Batch().addCylinder(2, 4, WHITE, 0, 0, 0, 12);
    const radii = [];
    for (let i = 0; i < b.pos.length; i += 3) radii.push(Math.hypot(b.pos[i], b.pos[i + 2]));
    expect(Math.max(...radii)).toBeCloseTo(2, 5);
  });

  it('addCone termina em ponta no topo', () => {
    const b = new Batch().addCone(2, 5, WHITE, 0, 1, 0, 8);
    let topRadius = 0;
    for (let i = 0; i < b.pos.length; i += 3) {
      if (Math.abs(b.pos[i + 1] - 6) < 1e-6)
        topRadius = Math.max(topRadius, Math.hypot(b.pos[i], b.pos[i + 2]));
    }
    expect(topRadius).toBeCloseTo(0, 6);
    near([extent(b).mn[1], extent(b).mx[1]], [1, 6]);
  });

  it('addSphere põe todos os vértices à distância r do centro', () => {
    const b = new Batch().addSphere(3, WHITE, 10, 20, 30);
    for (let i = 0; i < b.pos.length; i += 3) {
      expect(Math.hypot(b.pos[i] - 10, b.pos[i + 1] - 20, b.pos[i + 2] - 30)).toBeCloseTo(3, 4);
    }
  });

  it('addSphere estica pelos semi-eixos sx, sy, sz', () => {
    const { mn, mx } = extent(new Batch().addSphere(1, WHITE, 0, 0, 0, 2, 1, 1));
    expect(mx[0] - mn[0]).toBeGreaterThan(2 * (mx[1] - mn[1]) - 1e-6);
  });

  it('addBeam liga dois pontos: vertical, de y = 0 a y = 10', () => {
    const b = new Batch().addBeam([0, 0, 0], [0, 10, 0], 0.5, WHITE);
    const { mn, mx } = extent(b);
    near([mn[1], mx[1]], [0, 10]);
    let radius = 0;
    for (let i = 0; i < b.pos.length; i += 3)
      radius = Math.max(radius, Math.hypot(b.pos[i], b.pos[i + 2]));
    expect(radius).toBeCloseTo(0.5, 5);
  });

  it('addBeam diagonal tem o comprimento exato entre os pontos', () => {
    const a = new THREE.Vector3(1, 2, 3);
    const c = new THREE.Vector3(4, 6, 15);
    const dir = c.clone().sub(a).normalize();
    const b = new Batch().addBeam(a.toArray(), c.toArray(), 0.2, WHITE);
    const proj = [];
    for (let i = 0; i < b.pos.length; i += 3) {
      proj.push(new THREE.Vector3(b.pos[i], b.pos[i + 1], b.pos[i + 2]).sub(a).dot(dir));
    }
    near([Math.min(...proj), Math.max(...proj)], [0, a.distanceTo(c)], 4);
  });
});

describe('Batch: build', () => {
  const mounted = () => new Batch().addBox(1, 1, 1, WHITE, 0, 0, 0);

  it('gera a malha com posição, normal e cor, e a pendura no pai', () => {
    const parent = new THREE.Group();
    const b = mounted();
    const count = b.pos.length / 3;
    const mesh = b.build(parent);
    expect(parent.children).toContain(mesh);
    expect(mesh.material).toBe(toonMat);
    for (const name of ['position', 'normal', 'color']) {
      expect(mesh.geometry.attributes[name].count).toBe(count);
    }
  });

  it('acrescenta o contorno (casco invertido) com normais suavizadas', () => {
    const mesh = mounted().build(null);
    expect(mesh.children).toHaveLength(1);
    expect(mesh.children[0].material).toBe(hullMat);
    expect(mesh.children[0].geometry.attributes.snormal.count).toBe(36);
  });

  it('no cubo, a normal suavizada de cada canto mistura as 3 faces e aponta para fora', () => {
    const mesh = mounted().build(null);
    const P = mesh.geometry.attributes.position;
    const sn = mesh.children[0].geometry.attributes.snormal;
    for (let i = 0; i < sn.count; i++) {
      const outward = [P.getX(i), P.getY(i) - 0.5, P.getZ(i)];
      const n = [sn.getX(i), sn.getY(i), sn.getZ(i)];
      expect(Math.hypot(...n)).toBeCloseTo(1, 5);
      n.forEach((v, k) => {
        expect(v).not.toBe(0);
        expect(Math.sign(v)).toBe(Math.sign(outward[k]));
      });
    }
  });

  it('outline: false não cria contorno', () => {
    expect(mounted().build(null, { outline: false }).children).toHaveLength(0);
  });

  it('unlit usa o material sem iluminação e mat sobrescreve o padrão', () => {
    expect(mounted().build(null, { unlit: true }).material).toBe(unlitMat);
    const mat = new THREE.MeshBasicMaterial();
    expect(mounted().build(null, { mat }).material).toBe(mat);
  });

  it('lacra o batch: libera as listas e recusa novas primitivas', () => {
    const b = mounted();
    b.build(null);
    expect(b.sealed).toBe(true);
    expect(b.pos).toBeNull();
    expect(() => b.addBox(1, 1, 1, WHITE, 0, 0, 0)).toThrow(/já construído/);
  });
});
