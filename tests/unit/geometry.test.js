import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { slab, hipGeo } from '../../src/core/geometry.js';
import { GX, cylG, coneG, ni } from '../../src/core/geometries.js';

describe('core/geometry', () => {
  it('slab acrescenta uma caixa entre dois cantos, de y0 até y0 + h', () => {
    const batch = { addBox: vi.fn() };
    slab(batch, -2, 10, 6, 14, 3, 0.5, 0xabcdef);
    expect(batch.addBox).toHaveBeenCalledWith(8, 0.5, 4, 0xabcdef, 2, 3, 12);
  });

  it('hipGeo monta o telhado com 6 triângulos (18 vértices)', () => {
    const g = hipGeo(10, 6, 3);
    expect(g.attributes.position.count).toBe(18);
    expect(g.attributes.normal.count).toBe(18);
  });

  it('hipGeo respeita largura, profundidade e altura', () => {
    const g = hipGeo(10, 6, 3);
    g.computeBoundingBox();
    expect(g.boundingBox.min.toArray()).toEqual([-5, 0, -3]);
    expect(g.boundingBox.max.toArray()).toEqual([5, 3, 3]);
  });

  it('hipGeo tem cume de comprimento W − D, na altura h', () => {
    const g = hipGeo(10, 6, 3);
    const P = g.attributes.position;
    const ridge = [];
    for (let i = 0; i < P.count; i++) if (P.getY(i) === 3) ridge.push(P.getX(i));
    expect(Math.min(...ridge)).toBe(-2);
    expect(Math.max(...ridge)).toBe(2);
  });

  it('hipGeo tem normais unitárias e todas apontando para cima', () => {
    const g = hipGeo(12, 8, 2);
    const N = g.attributes.normal;
    for (let i = 0; i < N.count; i++) {
      expect(Math.hypot(N.getX(i), N.getY(i), N.getZ(i))).toBeCloseTo(1, 6);
      expect(N.getY(i)).toBeGreaterThan(0);
    }
  });
});

describe('core/geometries', () => {
  it('GX.box é a caixa unitária', () => {
    expect(GX.box.parameters).toMatchObject({ width: 1, height: 1, depth: 1 });
  });

  it('cylG guarda em cache por raio do topo e segmentos', () => {
    expect(cylG(0.5, 8)).toBe(cylG(0.5, 8));
    expect(cylG(0.5, 8)).not.toBe(cylG(0.5, 10));
    expect(cylG(0.5, 8)).not.toBe(cylG(0.6, 8));
  });

  it('cylG tem topo k, base 1 e altura 1', () => {
    expect(cylG(0.25, 12).parameters).toMatchObject({
      radiusTop: 0.25,
      radiusBottom: 1,
      height: 1,
      radialSegments: 12,
    });
  });

  it('coneG guarda em cache por segmentos', () => {
    expect(coneG(6)).toBe(coneG(6));
    expect(coneG(6)).not.toBe(coneG(8));
    expect(coneG(5).parameters).toMatchObject({ radius: 1, height: 1, radialSegments: 5 });
  });

  it('ni devolve a versão sem índice, com caixa envolvente', () => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    expect(g.index).not.toBeNull();
    const n = ni(g);
    expect(n.index).toBeNull();
    expect(n.attributes.position.count).toBe(g.index.count);
    expect(n.boundingBox).not.toBeNull();
  });

  it('ni guarda o resultado: a segunda chamada devolve o mesmo objeto', () => {
    const g = new THREE.BoxGeometry(2, 2, 2);
    expect(ni(g)).toBe(ni(g));
  });

  it('ni devolve a própria geometria quando ela já não tem índice', () => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
    expect(ni(g)).toBe(g);
  });
});
