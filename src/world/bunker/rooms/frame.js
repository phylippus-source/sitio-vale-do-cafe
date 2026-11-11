/* Referências de um cômodo do bunker a partir do retângulo { x1, z1, x2, z2 } (coordenadas do mundo). */
const WALL = 0.15; /* espessura da parede interna */

/* faces internas oeste (xw) e leste (xe), centro (cx), parede dos fundos (zb) e da porta (zf) */
export function frameOf(rect) {
  const xw = rect.x1 + WALL;
  const xe = rect.x2 - WALL;
  return { xw, xe, cx: (xw + xe) / 2, zb: rect.z1, zf: rect.z2 };
}
