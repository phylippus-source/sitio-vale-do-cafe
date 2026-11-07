/* Aleatório determinístico (mulberry32): mesma semente, mesmo sítio. */

let _s = 11;

export function R() {
  _s |= 0;
  _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function rr(a, b) {
  return a + R() * (b - a);
}
