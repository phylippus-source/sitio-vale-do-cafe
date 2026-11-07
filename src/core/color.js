/* Conversão de cor sRGB → linear para vertex colors. */
import * as THREE from 'three';

export function C(hex) {
  return new THREE.Color(hex).convertSRGBToLinear();
}
