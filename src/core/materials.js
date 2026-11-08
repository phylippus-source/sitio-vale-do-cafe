/* Materiais cel-shading (toon com 3 faixas), sem iluminação, contorno (casco invertido), água e lagoa. */
import * as THREE from 'three';
import { C } from './color.js';
import { K } from '../config/palette.js';

const gradData = new Uint8Array([0, 0, 0, 255, 128, 128, 128, 255, 255, 255, 255, 255]);
export const gradTex = new THREE.DataTexture(gradData, 3, 1, THREE.RGBAFormat);
gradTex.minFilter = gradTex.magFilter = THREE.NearestFilter;
gradTex.generateMipmaps = false;
gradTex.needsUpdate = true;
export const toonMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradTex });
export const unlitMat = new THREE.MeshBasicMaterial({ vertexColors: true });
export const hullMat = new THREE.ShaderMaterial({
  uniforms: { uRes: { value: new THREE.Vector2(1, 1) }, uThick: { value: 1.5 } },
  vertexShader: [
    'uniform vec2 uRes; uniform float uThick; attribute vec3 snormal;',
    'void main(){',
    '  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
    '  vec3 nv = normalize(normalMatrix * snormal);',
    '  vec4 nc = projectionMatrix * vec4(nv, 0.0);',
    '  vec2 dp = nc.xy * uRes; float l = length(dp); dp = l > 1e-5 ? dp / l : vec2(0.0);',
    '  clip.xy += dp * (2.0 * uThick / uRes) * clip.w;',
    '  clip.z += 0.0004 * clip.w;',
    '  gl_Position = clip;',
    '}',
  ].join('\n'),
  fragmentShader: 'void main(){ gl_FragColor = vec4(0.035, 0.027, 0.02, 1.0); }',
  side: THREE.BackSide,
});

export const waterMat = new THREE.MeshToonMaterial({ color: C(K.water), gradientMap: gradTex });
export const pondMat = new THREE.MeshToonMaterial({ color: C(K.pond), gradientMap: gradTex });
