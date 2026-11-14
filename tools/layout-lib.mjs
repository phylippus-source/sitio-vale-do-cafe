// Régua dos layouts de plan/: conferências e medições puras (sem ler arquivos), usadas por
// tools/layout-check.mjs e por tests/unit/layout.test.js. Metros; u vai para +x e v para +z.
// As mensagens saem sem prefixo: quem chama acrescenta "bunker: " ou "opção X: ".
export const EPS = 1e-9;
const SALTOS_MAX = 2; // ambiente a até 2 saltos da circulação
const BORDA_MIN = 1; // m de borda comum para dois ambientes valerem como "encostados"

export const half = (n) => Math.abs(n * 2 - Math.round(n * 2)) < EPS; // múltiplos de 0,5: termina em 0 ou 5
export const overlap = (a, b) =>
  a.u < b.u + b.w - EPS && b.u < a.u + a.w - EPS && a.v < b.v + b.d - EPS && b.v < a.v + a.d - EPS;

/* comprimento da borda comum (0 se só se tocam num ponto ou não se tocam) */
export function shared(a, b) {
  const du = Math.min(a.u + a.w, b.u + b.w) - Math.max(a.u, b.u);
  const dv = Math.min(a.v + a.d, b.v + b.d) - Math.max(a.v, b.v);
  if (Math.abs(a.u + a.w - b.u) < EPS || Math.abs(b.u + b.w - a.u) < EPS) return dv > EPS ? dv : 0;
  if (Math.abs(a.v + a.d - b.v) < EPS || Math.abs(b.v + b.d - a.v) < EPS) return du > EPS ? du : 0;
  return 0;
}

/* distância entre dois retângulos (0 se encostam ou se sobrepõem) */
export const gap = (a, b) =>
  Math.hypot(
    Math.max(a.u - (b.u + b.w), b.u - (a.u + a.w), 0),
    Math.max(a.v - (b.v + b.d), b.v - (a.v + a.d), 0),
  );

const porId = (salas) => new Map(salas.map((s) => [s.id, s]));
const num = (x) => typeof x === 'number' && Number.isFinite(x);

/* o que o bunker herda do lote (plan/site.json): limites, córrego e a Casa Grande na grade do bunker */
export function contextoLote(P, S) {
  const c = S.itens.find((i) => i.id === 'casa');
  return {
    lote: S.lote,
    corregoX: S.corrego.x1,
    casa: c ? { u: c.x - P.mundo.x0, v: c.z - P.mundo.z0, w: c.w, d: c.d } : null,
  };
}

/* ---------- o próprio plano: ids e valores das regras ---------- */

export function conferirPlano(P) {
  const erros = [];
  const ids = new Set([...Object.keys(P.medidas), ...Object.keys(P.extras || {})]);
  const existe = (onde, id) => {
    if (!ids.has(id)) erros.push(`${onde}: ambiente desconhecido "${id}"`);
  };
  P.circulacao.forEach((id) => existe('circulacao', id));
  for (const a of P.afinidades || []) {
    existe('afinidades', a.a);
    existe('afinidades', a.b);
    if (a.a === a.b) erros.push(`afinidades: ${a.a} com ele mesmo`);
    if (!num(a.peso) || a.peso <= 0) erros.push(`afinidades: peso inválido em ${a.a}–${a.b}`);
  }
  if (P.ruido) [...P.ruido.fontes, ...P.ruido.sensiveis].forEach((id) => existe('ruido', id));
  for (const [id, vias] of Object.entries(P.acesso_por || {})) {
    existe('acesso_por', id);
    vias.forEach((v) => existe('acesso_por', v));
  }
  if (P.saidas) {
    existe('saidas', P.saidas.a);
    existe('saidas', P.saidas.b);
    if (!num(P.saidas.distancia_min)) erros.push('saidas: distancia_min inválida');
  }
  const T = P.tolerancia;
  if (T) {
    (T.nao_encolhem || []).forEach((id) => existe('tolerancia.nao_encolhem', id));
    if (!(T.area_min > 0 && T.area_min <= 1)) erros.push('tolerancia.area_min deve estar entre 0 e 1');
    const vistos = new Set();
    for (const c of T.cenarios || []) {
      if (vistos.has(c.id)) erros.push(`tolerancia.cenarios: id repetido "${c.id}"`);
      vistos.add(c.id);
      if (!num(c.lado) || c.lado < 0) erros.push(`tolerancia.cenarios: lado inválido em "${c.id}"`);
    }
    if (!vistos.size) erros.push('tolerancia.cenarios vazio');
    if (!T.lado_min || !num(T.lado_min.ambiente) || !num(T.lado_min.circulacao))
      erros.push('tolerancia.lado_min precisa de ambiente e circulacao');
    if (!T.pegada_max || !num(T.pegada_max.w) || !num(T.pegada_max.d))
      erros.push('tolerancia.pegada_max precisa de w e d');
    if (P.extras && Object.keys(P.extras).length && !T.ramal) erros.push('tolerancia.ramal ausente');
  }
  if (!num(P.mundo.distancia_corrego)) erros.push('mundo.distancia_corrego ausente');
  return erros;
}

/* ---------- medidas ---------- */

/* plano atual: medidas exatas (giro permitido), soma das áreas e extras */
function conferirMedidasBase(P, salas) {
  const erros = [];
  const byId = new Map();
  for (const s of salas) {
    if (byId.has(s.id)) erros.push('ambiente repetido: ' + s.id);
    byId.set(s.id, s);
  }
  let total = 0;
  for (const [id, [w, d]] of Object.entries(P.medidas)) {
    total += w * d;
    const s = byId.get(id);
    if (!s) {
      erros.push('falta no layout: ' + id);
      continue;
    }
    const ok =
      (Math.abs(s.w - w) < EPS && Math.abs(s.d - d) < EPS) ||
      (Math.abs(s.w - d) < EPS && Math.abs(s.d - w) < EPS);
    if (!ok) erros.push(`${id} mede ${s.w}×${s.d} e o plano pede ${w}×${d}`);
  }
  if (Math.abs(total - P.total_util) > EPS)
    erros.push(`soma das medidas ${total} difere do total do plano ${P.total_util}`);
  for (const [id, [w, d]] of Object.entries(P.extras || {})) {
    const s = byId.get(id);
    if (!s) erros.push('falta o extra ' + id);
    else if (s.w !== w || s.d !== d) erros.push(`extra ${id} mede ${s.w}×${s.d}, esperado ${w}×${d}`);
  }
  for (const id of byId.keys())
    if (!(id in P.medidas) && !(id in (P.extras || {}))) erros.push('ambiente fora do plano: ' + id);
  for (const id of Object.keys(P.areas)) if (!byId.has(id)) erros.push('nome sem ambiente: ' + id);
  return { erros, total };
}

/* um ambiente de opção: mensagem de erro ou null. Cada lado varia até ± lado; giro permitido */
function medidaFlexivel(P, s, lado) {
  const T = P.tolerancia;
  const [w0, d0] = P.medidas[s.id];
  const orientacoes = T.giro === false ? [[w0, d0]] : [[w0, d0], [d0, w0]];
  let cand = orientacoes.filter(
    ([a, b]) => Math.abs(s.w - a) <= lado + EPS && Math.abs(s.d - b) <= lado + EPS,
  );
  if (!cand.length) return `${s.id} mede ${s.w}×${s.d}, fora de ±${lado} m de ${w0}×${d0}`;
  if ((T.nao_encolhem || []).includes(s.id)) {
    cand = cand.filter(([a, b]) => s.w >= a - EPS && s.d >= b - EPS);
    if (!cand.length) return `${s.id} não pode encolher (plano ${w0}×${d0}, layout ${s.w}×${s.d})`;
  }
  const area = s.w * s.d;
  if (area < T.area_min * w0 * d0 - EPS)
    return `${s.id} tem ${area} m², abaixo de ${T.area_min * 100}% do plano (${w0 * d0} m²)`;
  const min = P.circulacao.includes(s.id) ? T.lado_min.circulacao : T.lado_min.ambiente;
  if (Math.min(s.w, s.d) < min - EPS)
    return `${s.id} tem lado ${Math.min(s.w, s.d)} m, abaixo do mínimo ${min} m`;
  return null;
}

/* ramal: opcional, com faixa própria de lados */
function medidaRamal(P, s) {
  const [c1, c2] = P.tolerancia.ramal.lado_curto;
  const [l1, l2] = P.tolerancia.ramal.lado_longo;
  const curto = Math.min(s.w, s.d);
  const longo = Math.max(s.w, s.d);
  if (curto < c1 - EPS || curto > c2 + EPS || longo < l1 - EPS || longo > l2 + EPS)
    return `${s.id} mede ${s.w}×${s.d}, fora das faixas ${c1}–${c2} × ${l1}–${l2} m`;
  return null;
}

function conferirMedidasOpcao(P, salas, lado) {
  const erros = [];
  const byId = new Map();
  for (const s of salas) {
    if (byId.has(s.id)) erros.push('ambiente repetido: ' + s.id);
    byId.set(s.id, s);
  }
  for (const id of Object.keys(P.medidas)) {
    const s = byId.get(id);
    const e = s ? medidaFlexivel(P, s, lado) : 'falta no layout: ' + id;
    if (e) erros.push(e);
  }
  for (const id of Object.keys(P.extras || {})) {
    const s = byId.get(id);
    if (!s && !P.tolerancia.ramal.opcional) erros.push('falta o extra ' + id);
    const e = s && medidaRamal(P, s);
    if (e) erros.push(e);
  }
  for (const id of byId.keys())
    if (!(id in P.medidas) && !(id in (P.extras || {}))) erros.push('ambiente fora do plano: ' + id);
  return erros;
}

/* ---------- geometria, mundo, acesso, saídas ---------- */

function conferirGeometria(F, salas) {
  const erros = [];
  for (const s of salas) {
    for (const k of ['u', 'v', 'w', 'd'])
      if (!half(s[k])) erros.push(`${s.id}.${k}=${s[k]} não termina em 0 ou 5`);
    if (s.u < -EPS || s.v < -EPS || s.u + s.w > F.w + EPS || s.v + s.d > F.d + EPS)
      erros.push(`${s.id} sai da pegada ${F.w}×${F.d}`);
  }
  for (let i = 0; i < salas.length; i++)
    for (let j = i + 1; j < salas.length; j++)
      if (overlap(salas[i], salas[j])) erros.push(`${salas[i].id} e ${salas[j].id} se sobrepõem`);
  return erros;
}

function conferirMundo(P, F, ctx) {
  const erros = [];
  const x1 = P.mundo.x0;
  const x2 = x1 + F.w;
  const z1 = P.mundo.z0;
  const z2 = z1 + F.d;
  const L = ctx.lote;
  if (x1 < L.x1 - EPS || x2 > L.x2 + EPS || z1 < L.z1 - EPS || z2 > L.z2 + EPS)
    erros.push('sai do lote');
  const dist = P.mundo.distancia_corrego;
  if (x2 > ctx.corregoX - dist + EPS)
    erros.push(`a menos de ${dist} m do córrego (x ≥ ${ctx.corregoX})`);
  return erros;
}

/* saltos até a circulação: a circulação vale 0, quem a toca (borda ≥ 1 m) vale 1, e assim por diante */
export function saltosAcesso(P, salas) {
  const byId = porId(salas);
  const circ = new Set(P.circulacao.filter((id) => byId.has(id)));
  const reach = new Map();
  if (byId.has('galeria')) reach.set('galeria', 0);
  for (let pass = 0; pass < 4; pass++)
    for (const id of circ) {
      if (reach.has(id)) continue;
      const s = byId.get(id);
      if ([...reach.keys()].some((o) => circ.has(o) && shared(s, byId.get(o)) >= BORDA_MIN))
        reach.set(id, 0);
    }
  for (let pass = 0; pass < 4; pass++)
    for (const s of salas) {
      if (reach.has(s.id)) continue;
      const links = [...circ, ...(s.acesso || [])].map((id) => byId.get(id)).filter(Boolean);
      for (const o of links) {
        if (o !== s && reach.has(o.id) && shared(s, o) >= BORDA_MIN) {
          reach.set(s.id, reach.get(o.id) + 1);
          break;
        }
      }
    }
  return reach;
}

function conferirAcesso(P, salas) {
  const erros = [];
  const byId = porId(salas);
  const circ = new Set(P.circulacao);
  for (const s of salas)
    for (const id of s.acesso || []) {
      if (P.acesso_por && !circ.has(id) && !(P.acesso_por[s.id] || []).includes(id))
        erros.push(`${s.id}: acesso por ${id} não está previsto em acesso_por`);
      const o = byId.get(id);
      if (!o) erros.push(`${s.id}: acesso por ${id}, que não existe no layout`);
      else if (shared(s, o) < BORDA_MIN)
        erros.push(`${s.id}: acesso por ${id}, mas as bordas não se tocam`);
    }
  const reach = saltosAcesso(P, salas);
  for (const s of salas) {
    if (!reach.has(s.id)) erros.push(`${s.id} não tem acesso até a circulação`);
    else if (reach.get(s.id) > SALTOS_MAX)
      erros.push(`${s.id} está a ${reach.get(s.id)} saltos da circulação (máximo ${SALTOS_MAX})`);
  }
  return erros;
}

function distanciaSaidas(P, byId) {
  const S = P.saidas;
  const a = S && byId.get(S.a);
  const b = S && byId.get(S.b);
  return a && b ? gap(a, b) : null;
}

function conferirSaidas(P, salas) {
  if (!P.saidas) return [];
  const d = distanciaSaidas(P, porId(salas));
  const { a, b, distancia_min: min } = P.saidas;
  if (d === null) return [`saídas: falta ${a} ou ${b} no layout`];
  if (d < min - EPS) return [`${a} e ${b} ficam a ${d.toFixed(1)} m (saídas: mínimo ${min} m)`];
  return [];
}

/* regras.escada_sob_casa: a escada inteira dentro do retângulo da Casa Grande */
function conferirEscada(P, salas, ctx) {
  const e = salas.find((s) => s.id === 'escada');
  const c = ctx.casa;
  if (!(P.regras && P.regras.escada_sob_casa) || !e || !c) return [];
  if (e.u < c.u - EPS || e.v < c.v - EPS || e.u + e.w > c.u + c.w + EPS || e.v + e.d > c.v + c.d + EPS)
    return [`a escada (u ${e.u}–${e.u + e.w}, v ${e.v}–${e.v + e.d}) sai de baixo da Casa Grande (u ${c.u}–${c.u + c.w}, v ${c.v}–${c.v + c.d})`];
  return [];
}

function conferirRegras(P, F, salas, ctx) {
  return [
    ...conferirGeometria(F, salas),
    ...conferirEscada(P, salas, ctx),
    ...conferirMundo(P, F, ctx),
    ...conferirAcesso(P, salas),
    ...conferirSaidas(P, salas),
  ];
}

/* ---------- medições ---------- */

/* área da pegada que não é ambiente, em bolsões conexos (grade de 0,5 m) */
export function bolsoes(F, salas, G = 0.5) {
  const cells = new Set();
  for (let i = 0; i < F.w / G; i++)
    for (let j = 0; j < F.d / G; j++) {
      const c = { u: i * G + EPS * 2, v: j * G + EPS * 2, w: G - EPS * 4, d: G - EPS * 4 };
      if (!salas.some((s) => overlap(c, s))) cells.add(i + ',' + j);
    }
  const lista = [];
  const seen = new Set();
  for (const key of cells) {
    if (seen.has(key)) continue;
    const stack = [key];
    seen.add(key);
    let n = 0;
    let u1 = 1e9;
    let v1 = 1e9;
    let u2 = -1;
    let v2 = -1;
    while (stack.length) {
      const [i, j] = stack.pop().split(',').map(Number);
      n++;
      u1 = Math.min(u1, i * G);
      v1 = Math.min(v1, j * G);
      u2 = Math.max(u2, (i + 1) * G);
      v2 = Math.max(v2, (j + 1) * G);
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = i + a + ',' + (j + b);
        if (cells.has(k) && !seen.has(k)) {
          seen.add(k);
          stack.push(k);
        }
      }
    }
    lista.push({ area: n * G * G, u1, v1, u2, v2 });
  }
  lista.sort((a, b) => b.area - a.area);
  return { livre: cells.size * G * G, lista };
}

/* pares que devem ficar lado a lado: vale quando as bordas se tocam em 1 m ou mais */
function medirAfinidades(P, byId) {
  const lista = P.afinidades || [];
  const r = { atendidas: 0, total: lista.length, pontos: 0, maximo: 0, faltam: [] };
  for (const { a, b, peso = 1 } of lista) {
    r.maximo += peso;
    const A = byId.get(a);
    const B = byId.get(b);
    if (A && B && shared(A, B) >= BORDA_MIN) {
      r.atendidas++;
      r.pontos += peso;
    } else r.faltam.push(`${a}–${b}`);
  }
  return r;
}

/* par fonte de ruído–ambiente sensível mais próximo (quanto maior a distância, melhor) */
function medirRuido(P, byId) {
  let melhor = null;
  for (const f of P.ruido ? P.ruido.fontes : [])
    for (const q of P.ruido.sensiveis) {
      const A = byId.get(f);
      const B = byId.get(q);
      if (!A || !B) continue;
      const d = gap(A, B);
      if (!melhor || d < melhor.distancia) melhor = { distancia: d, par: [f, q] };
    }
  return melhor;
}

/* a régua: tudo que se compara entre o plano atual e as opções */
export function medir(P, F, salas) {
  const byId = porId(salas);
  const b = bolsoes(F, salas);
  const reach = saltosAcesso(P, salas);
  const circ = new Set(P.circulacao);
  const moradores = salas.filter((s) => !circ.has(s.id));
  let encolhe = 0;
  let cresce = 0;
  for (const s of salas) {
    const nom = P.medidas[s.id];
    if (!nom) continue;
    const dif = s.w * s.d - nom[0] * nom[1];
    if (dif < 0) encolhe -= dif;
    else cresce += dif;
  }
  return {
    ambientes: salas.length,
    pegada: { w: F.w, d: F.d, area: F.w * F.d },
    util: salas.reduce((a, s) => a + s.w * s.d, 0),
    vazio: b.livre,
    bolsoes: b.lista,
    acesso: {
      max: Math.max(0, ...reach.values()),
      direto: moradores.filter((s) => reach.get(s.id) === 1).length,
      ambientes: moradores.length,
    },
    encolhe,
    cresce,
    afinidades: medirAfinidades(P, byId),
    ruido: medirRuido(P, byId),
    saidas: distanciaSaidas(P, byId),
  };
}

/* ---------- conferências completas ---------- */

/* o plano atual (plan/bunker.json): medidas exatas. S = plan/site.json */
export function conferirBase(P, S) {
  const m = conferirMedidasBase(P, P.salas);
  const erros = [...conferirPlano(P), ...m.erros, ...conferirRegras(P, P.pegada, P.salas, contextoLote(P, S))];
  return { erros, metricas: { ...medir(P, P.pegada, P.salas), nominal: m.total } };
}

/* forma da opção: sem isto um arquivo malformado derrubaria o conferidor */
function conferirEstrutura(opcao) {
  if (!opcao || typeof opcao !== 'object') return ['opção inválida'];
  const erros = [];
  const F = opcao.pegada;
  if (!F || !num(F.w) || !num(F.d) || F.w <= 0 || F.d <= 0) erros.push('pegada sem w e d numéricos');
  if (!Array.isArray(opcao.salas)) return [...erros, 'salas ausente'];
  opcao.salas.forEach((s, i) => {
    if (!s || typeof s.id !== 'string') return erros.push(`sala ${i} sem id`);
    for (const k of ['u', 'v', 'w', 'd']) if (!num(s[k])) erros.push(`${s.id}.${k} não é número`);
    if (num(s.w) && s.w <= 0) erros.push(`${s.id}.w deve ser positivo`);
    if (num(s.d) && s.d <= 0) erros.push(`${s.id}.d deve ser positivo`);
    if (s.acesso !== undefined && !(Array.isArray(s.acesso) && s.acesso.every((a) => typeof a === 'string')))
      erros.push(`${s.id}.acesso deve ser lista de ids`);
  });
  return erros;
}

/* uma opção gerada ({ id, pegada, salas }): tolerância do cenário, pegada máxima e Casa Grande sobre o
   bunker. S = plan/site.json */
export function conferirOpcao(P, opcao, S) {
  const T = P.tolerancia;
  if (!T) return { erros: ['o plano não tem o bloco tolerancia'], metricas: null };
  const forma = conferirEstrutura(opcao);
  if (forma.length) return { erros: forma, metricas: null };
  const erros = [];
  const cen = T.cenarios.find((c) => c.id === opcao.id);
  if (!cen) erros.push(`cenário ${opcao.id} não existe em tolerancia.cenarios`);
  const F = opcao.pegada;
  const salas = opcao.salas;
  const ctx = contextoLote(P, S);
  for (const k of ['w', 'd']) if (!half(F[k])) erros.push(`pegada.${k}=${F[k]} não termina em 0 ou 5`);
  if (F.w > T.pegada_max.w + EPS || F.d > T.pegada_max.d + EPS)
    erros.push(`pegada ${F.w}×${F.d} maior que o máximo ${T.pegada_max.w}×${T.pegada_max.d}`);
  const c = ctx.casa;
  if (c && (c.u < -EPS || c.v < -EPS || c.u + c.w > F.w + EPS || c.v + c.d > F.d + EPS))
    erros.push(`a Casa Grande (u ${c.u}–${c.u + c.w}, v ${c.v}–${c.v + c.d}) não cabe na pegada`);
  erros.push(...conferirMedidasOpcao(P, salas, cen ? cen.lado : 0));
  erros.push(...conferirRegras(P, F, salas, ctx));
  return { erros, metricas: medir(P, F, salas) };
}

/* desenho em texto: uma letra por ambiente, a cada 1 m */
export function mapa(F, salas) {
  const sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const ids = salas.map((s) => s.id);
  const letra = (id) => sym[ids.indexOf(id)] || '?';
  const rows = [];
  for (let v = 0; v < F.d; v++) {
    let line = '';
    for (let u = 0; u < F.w; u++) {
      const s = salas.find(
        (r) => u + 0.5 > r.u && u + 0.5 < r.u + r.w && v + 0.5 > r.v && v + 0.5 < r.v + r.d,
      );
      line += s ? letra(s.id) : '·';
    }
    rows.push(line);
  }
  rows.push(ids.map((id) => letra(id) + '=' + id).join(' '));
  return rows.join('\n');
}
