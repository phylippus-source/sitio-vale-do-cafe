/* Auxiliares geométricos puros (sem estado de cena). */
import * as THREE from 'three';

/* Laje retangular entre (x1,z1) e (x2,z2), de y0 até y0+h, adicionada ao batch `b`. */
export function slab(b, x1, z1, x2, z2, y0, h, col) {
  b.addBox(x2 - x1, h, z2 - z1, col, (x1 + x2) / 2, y0, (z1 + z2) / 2);
}

/* Telhado de quatro águas: base W×D em y=0, cume de comprimento W−D a altura h. */
export function hipGeo(W, D, h) {
  const L = W - D;
  const hw = W / 2;
  const hd = D / 2;
  const hl = L / 2;
  const A = [-hw, 0, -hd];
  const B = [hw, 0, -hd];
  const Cc = [hw, 0, hd];
  const Dd = [-hw, 0, hd];
  const P = [-hl, h, 0];
  const Q = [hl, h, 0];
  const tris = [Dd, Cc, Q, Dd, Q, P, B, A, P, B, P, Q, Cc, B, Q, A, Dd, P];
  const pos = [];
  tris.forEach(function (v) {
    pos.push(v[0], v[1], v[2]);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
