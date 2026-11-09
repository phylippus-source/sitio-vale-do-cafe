import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  gradTex,
  toonMat,
  unlitMat,
  hullMat,
  waterMat,
  pondMat,
} from '../../src/core/materials.js';
import { C } from '../../src/core/color.js';
import { K } from '../../src/config/palette.js';

describe('core/materials', () => {
  it('a rampa do cel-shading tem 3 faixas: escuro, médio e claro', () => {
    const { width, height, data } = gradTex.image;
    expect([width, height]).toEqual([3, 1]);
    expect([data[0], data[4], data[8]]).toEqual([0, 128, 255]);
  });

  it('a rampa não interpola nem gera mipmaps', () => {
    expect(gradTex.minFilter).toBe(THREE.NearestFilter);
    expect(gradTex.magFilter).toBe(THREE.NearestFilter);
    expect(gradTex.generateMipmaps).toBe(false);
  });

  it('toonMat usa cor por vértice e a rampa de 3 faixas', () => {
    expect(toonMat).toBeInstanceOf(THREE.MeshToonMaterial);
    expect(toonMat.vertexColors).toBe(true);
    expect(toonMat.gradientMap).toBe(gradTex);
  });

  it('unlitMat usa cor por vértice e não recebe luz', () => {
    expect(unlitMat).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(unlitMat.vertexColors).toBe(true);
  });

  it('hullMat desenha só as costas, com espessura inicial de 1,5 px', () => {
    expect(hullMat).toBeInstanceOf(THREE.ShaderMaterial);
    expect(hullMat.side).toBe(THREE.BackSide);
    expect(hullMat.uniforms.uThick.value).toBe(1.5);
  });

  it('o shader do contorno lê o atributo snormal', () => {
    expect(hullMat.vertexShader).toContain('attribute vec3 snormal');
  });

  it('água e lagoa usam as cores da paleta em espaço linear', () => {
    expect(waterMat.color.getHex()).toBe(C(K.water).getHex());
    expect(pondMat.color.getHex()).toBe(C(K.pond).getHex());
    expect(waterMat.gradientMap).toBe(gradTex);
    expect(pondMat.gradientMap).toBe(gradTex);
  });
});
