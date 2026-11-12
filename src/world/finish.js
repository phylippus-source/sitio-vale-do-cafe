/* Acabamento da cena: monta o bunker (depois de todo o mundo) e a sombra falsa chapada sob a maquete. */
import * as THREE from 'three';
import { diorama } from './scene.js';
import { buildBunker } from './bunker/index.js';

/* =================== FILEIRA DOS FUNDOS: dormitórios (x −11,4 → 10,1) =================== */
/* ---- SUÍTE CYBERPUNK DO MESTRE (7,0 × 16,6 m): closet · lounge e estação dev · cama-casulo com mosquiteiro · banheiro ---- */
buildBunker();

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
