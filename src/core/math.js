/* Funções matemáticas puras. */

export const clamp = function (v, a, b) {
  return Math.min(b, Math.max(a, v));
};

export function smooth(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
