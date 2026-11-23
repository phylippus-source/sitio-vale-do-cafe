import { EPS, half, overlap, gap } from './layout-lib.mjs';

/* Régua do lote, funções puras. Convenção do modelo: x+ = oeste, z+ = norte (an/ACHADOS_FASE1-2.md). */
const rad = (g) => (g * Math.PI) / 180;

/* Direção do sol no mundo (x+ oeste, z+ norte) e elevação, para latitude, declinação e hora solar (graus, h). */
export function sol(lat, decl, hora) {
  const f = rad(lat),
    d = rad(decl),
    H = rad(15 * (hora - 12));
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
  for (const [px, pz] of [
    [c.x, c.z],
    [c.x + c.w, c.z],
    [c.x + c.w, c.z + c.d],
    [c.x, c.z + c.d],
  ])
    pts.push([px, pz], [px + dx, pz + dz]);
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const meio = (ps) => {
    const h = [];
    for (const p of ps) {
      while (h.length > 1 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    h.pop();
    return h;
  };
  return [...meio(pts), ...meio([...pts].reverse())];
}
function dentro(poly, px, pz) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i],
      b = poly[(i + 1) % poly.length];
    if ((b[0] - a[0]) * (pz - a[1]) - (b[1] - a[1]) * (px - a[0]) < -1e-9) return false;
  }
  return true;
}

/* Horas de sombra média sobre o alvo (caixa), entre as horas dadas (1 h por amostra), vindas de fontes {caixa, h}. */
export function horasDeSombra(alvo, fontes, { lat, decl, horas }, passo = 1) {
  const sois = horas.map((h) => sol(lat, decl, h));
  let sombreado = 0,
    total = 0;
  for (let x = alvo.x + passo / 2; x < alvo.x + alvo.w; x += passo)
    for (let z = alvo.z + passo / 2; z < alvo.z + alvo.d; z += passo) {
      total++;
      for (const s of sois) {
        if (!s) continue;
        if (
          fontes.some((f) => {
            const o = sombraDe(f.h, s);
            return dentro(varredura(f.caixa, o.dx, o.dz), x, z);
          })
        )
          sombreado++;
      }
    }
  return total ? sombreado / total : 0;
}

/* Confere a implantação do lote contra o plano. bunker = {u, v, w, d} em metros do mundo (projeção escolhida).
   Devolve { erros, metricas }; não imprime nada. */
export function conferirLote(S, bunker) {
  const erros = [];
  const err = (m) => erros.push(m);
  const R = (o) => ({ u: o.x, v: o.z, w: o.w, d: o.d });
  const box = (o) => ({ u: o.x1, v: o.z1, w: o.x2 - o.x1, d: o.z2 - o.z1 });
  const byId = new Map(S.itens.map((i) => [i.id, i]));
  let total = 0;
  for (const [id, [w, d]] of Object.entries(S.medidas)) {
    const it = byId.get(id);
    if (!it) {
      err('lote: falta no layout: ' + id);
      continue;
    }
    const ok =
      (Math.abs(it.w - w) < EPS && Math.abs(it.d - d) < EPS) ||
      (Math.abs(it.w - d) < EPS && Math.abs(it.d - w) < EPS);
    if (!ok) err(`lote: ${id} mede ${it.w}×${it.d} e o plano pede ${w}×${d}`);
    if (id === 'quadras') {
      const q = S.quadras_internas;
      const need = [2 * q.cada[0] + q.vao, 2 * q.cada[1] + q.vao];
      if (it.w !== need[0] || it.d !== need[1])
        err(`lote: as quadras giradas medem ${need[0]}×${need[1]}, o layout tem ${it.w}×${it.d}`);
      total += 4 * q.cada[0] * q.cada[1];
    } else total += w * d;
    if (S.areas_plano[id] !== undefined) {
      const a =
        id === 'quadras' ? 4 * S.quadras_internas.cada[0] * S.quadras_internas.cada[1] : w * d;
      if (id !== 'pomar' && Math.abs(a - S.areas_plano[id]) > EPS)
        err(`lote: área de ${id} (${a}) difere do plano (${S.areas_plano[id]})`);
    }
  }
  for (const id of byId.keys()) if (!(id in S.medidas)) err('lote: item fora do plano: ' + id);
  if (Math.abs(total - S.total_itens) > EPS)
    err(`lote: soma das áreas ${total} difere do plano ${S.total_itens}`);
  const L = S.lote;
  const obstacles = [
    ['estrada', box(S.estrada)],
    ['córrego', box({ x1: S.corrego.x1, x2: S.corrego.x2, z1: L.z1, z2: L.z2 })],
  ];
  for (const it of S.itens) {
    for (const k of ['x', 'z', 'w', 'd'])
      if (!half(it[k])) err(`lote: ${it.id}.${k}=${it[k]} não termina em 0 ou 5`);
    if (
      it.x < L.x1 + S.margem - EPS ||
      it.x + it.w > L.x2 - EPS ||
      it.z < L.z1 + S.margem - EPS ||
      it.z + it.d > L.z2 - S.margem + EPS
    )
      err(`lote: ${it.id} sai do lote ou fica a menos de ${S.margem} m da divisa`);
    for (const [nome, o] of obstacles) {
      const g = gap(R(it), o);
      const enc = (it.encosta || []).includes(nome.replace('ó', 'o'));
      if (overlap(R(it), o)) err(`lote: ${it.id} invade a ${nome}`);
      else if (g < (nome === 'córrego' ? (S.corrego_dist ?? S.margem) : S.margem) - EPS && !enc)
        err(
          `lote: ${it.id} fica a ${g.toFixed(1)} m da ${nome} (mínimo ${nome === 'córrego' ? (S.corrego_dist ?? S.margem) : S.margem} m)`,
        );
    }
    if (['arvore', 'escavacao'].includes(it.tipo) && overlap(R(it), bunker))
      err(`lote: ${it.id} (${it.tipo}) está sobre a projeção do bunker`);
  }
  for (let i = 0; i < S.itens.length; i++)
    for (let j = i + 1; j < S.itens.length; j++) {
      const a = S.itens[i],
        b = S.itens[j];
      const colados = (a.colado || []).includes(b.id) || (b.colado || []).includes(a.id);
      if (overlap(R(a), R(b))) err(`lote: ${a.id} e ${b.id} se sobrepõem`);
      else if (colados) {
        if (gap(R(a), R(b)) > EPS)
          err(
            `lote: ${a.id} devia estar colado em ${b.id}, mas fica a ${gap(R(a), R(b)).toFixed(1)} m`,
          );
      } else if (gap(R(a), R(b)) < (S.folga_itens ?? S.margem) - EPS)
        err(
          `lote: ${a.id} e ${b.id} ficam a ${gap(R(a), R(b)).toFixed(1)} m (mínimo ${S.folga_itens ?? S.margem} m)`,
        );
    }
  const casa = byId.get('casa');
  if (casa) {
    const c = R(casa);
    if (!(
      c.u >= bunker.u &&
      c.v >= bunker.v &&
      c.u + c.w <= bunker.u + bunker.w &&
      c.v + c.d <= bunker.v + bunker.d
    ))
      err('lote: a Casa Grande não está sobre o bunker');
  }
  const g2 = (a, b) => gap(R(byId.get(a)), R(byId.get(b)));
  const rule = S.regras;
  const dist = {
    animaisCasa: g2('animais', 'casa'),
    pomarNucleo: g2('pomar', 'nucleo'),
    estufaNucleo: g2('estufa', 'nucleo'),
    animaisNucleo: g2('animais', 'nucleo'),
  };
  if (rule.animais_longe_da_casa != null && dist.animaisCasa < rule.animais_longe_da_casa)
    err(
      `lote: animais a ${dist.animaisCasa.toFixed(1)} m da casa (mínimo ${rule.animais_longe_da_casa} m)`,
    );
  if (rule.pomar_perto_do_nucleo != null && dist.pomarNucleo > rule.pomar_perto_do_nucleo)
    err(
      `lote: pomar a ${dist.pomarNucleo.toFixed(1)} m do núcleo (máximo ${rule.pomar_perto_do_nucleo} m)`,
    );
  if (rule.estufa_perto_do_nucleo != null && dist.estufaNucleo > rule.estufa_perto_do_nucleo)
    err(
      `lote: estufa a ${dist.estufaNucleo.toFixed(1)} m do núcleo (máximo ${rule.estufa_perto_do_nucleo} m)`,
    );
  if (rule.animais_perto_do_nucleo != null && dist.animaisNucleo > rule.animais_perto_do_nucleo)
    err(
      `lote: animais a ${dist.animaisNucleo.toFixed(1)} m do núcleo (máximo ${rule.animais_perto_do_nucleo} m)`,
    );
  if (S.bloco) {
    const b = S.bloco,
      rb = { u: b.x, v: b.z, w: b.w, d: b.d };
    if (b.w % 5 || b.d % 5) err(`lote: bloco livre ${b.w}×${b.d} não tem lados de 5 em 5 m`);
    if (
      b.x < L.x1 + S.margem - EPS ||
      b.x + b.w > L.x2 - EPS ||
      b.z < L.z1 + S.margem - EPS ||
      b.z + b.d > L.z2 - S.margem + EPS
    )
      err('lote: bloco livre sai do lote ou fica a menos da margem da divisa');
    for (const [nome, o] of obstacles)
      if (overlap(rb, o)) err(`lote: bloco livre invade a ${nome}`);
    for (const it of S.itens)
      if (overlap(rb, R(it)) || gap(rb, R(it)) < S.margem - EPS)
        err(`lote: bloco livre fica a menos de ${S.margem} m de ${it.id}`);
  }
  const lotArea = (L.x2 - L.x1) * (L.z2 - L.z1);
  const env = S.itens.reduce((a, i) => a + i.w * i.d, 0);
  let sombra = null;
  if (S.alturas && S.orientacao) {
    const cfg = {
      lat: S.orientacao.latitude,
      decl: S.orientacao.decl_inverno,
      horas: [9, 10, 11, 12, 13, 14, 15],
    };
    const fontes = S.itens
      .filter((i) => S.alturas[i.id])
      .map((i) => ({ caixa: i, h: S.alturas[i.id] }));
    sombra = Object.fromEntries(
      S.itens
        .filter((i) => i.tipo === 'lavoura')
        .map((i) => [
          i.id,
          horasDeSombra(
            i,
            fontes.filter((f) => f.caixa !== i),
            cfg,
            1,
          ),
        ]),
    );
  }
  return { erros, metricas: { total, env, lotArea, dist, sombra } };
}
