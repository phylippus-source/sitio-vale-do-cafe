/* Régua do lote, funções puras. Convenção do modelo: x+ = oeste, z+ = norte (an/ACHADOS_FASE1-2.md). */
const rad = (g) => (g * Math.PI) / 180;

/* Direção do sol no mundo (x+ oeste, z+ norte) e elevação, para latitude, declinação e hora solar (graus, h). */
export function sol(lat, decl, hora) {
  const f = rad(lat), d = rad(decl), H = rad(15 * (hora - 12));
  const leste = -Math.cos(d) * Math.sin(H);
  const norte = Math.sin(d) * Math.cos(f) - Math.cos(d) * Math.sin(f) * Math.cos(H);
  const cima = Math.sin(d) * Math.sin(f) + Math.cos(d) * Math.cos(f) * Math.cos(H);
  if (cima <= 0.05) return null; // sol baixo demais: sem sombra útil
  return { x: -leste, z: norte, cima, elevacao: (Math.asin(cima) * 180) / Math.PI };
}

/* Deslocamento da sombra do topo de um objeto de altura h (m): oposto ao sol. */
export function sombraDe(h, s) {
  return { dx: (-h * s.x) / s.cima, dz: (-h * s.z) / s.cima };
}

/* Fecho convexo da caixa (x, z, w, d) varrida pelo deslocamento: a sombra do objeto inteiro. */
function varredura(c, dx, dz) {
  const pts = [];
  for (const [px, pz] of [[c.x, c.z], [c.x + c.w, c.z], [c.x + c.w, c.z + c.d], [c.x, c.z + c.d]]) pts.push([px, pz], [px + dx, pz + dz]);
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const meio = (ps) => { const h = []; for (const p of ps) { while (h.length > 1 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); } h.pop(); return h; };
  return [...meio(pts), ...meio([...pts].reverse())];
}
function dentro(poly, px, pz) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if ((b[0] - a[0]) * (pz - a[1]) - (b[1] - a[1]) * (px - a[0]) < -1e-9) return false;
  }
  return true;
}

/* Horas de sombra média sobre o alvo (caixa), entre as horas dadas (1 h por amostra), vindas de fontes {caixa, h}. */
export function horasDeSombra(alvo, fontes, { lat, decl, horas }, passo = 1) {
  const sois = horas.map((h) => sol(lat, decl, h));
  let sombreado = 0, total = 0;
  for (let x = alvo.x + passo / 2; x < alvo.x + alvo.w; x += passo)
    for (let z = alvo.z + passo / 2; z < alvo.z + alvo.d; z += passo) {
      total++;
      for (const s of sois) {
        if (!s) continue;
        if (fontes.some((f) => { const o = sombraDe(f.h, s); return dentro(varredura(f.caixa, o.dx, o.dz), x, z); })) sombreado++;
      }
    }
  return total ? sombreado / total : 0;
}
