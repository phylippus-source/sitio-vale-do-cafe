const LoteWeb = (() => {
// Régua dos layouts de plan/: conferências e medições puras (sem ler arquivos), usadas por
// tools/layout-check.mjs e por tests/unit/layout.test.js. Metros; u vai para +x e v para +z.
// As mensagens saem sem prefixo: quem chama acrescenta "bunker: " ou "opção X: ".
const EPS = 1e-9;
const SALTOS_MAX = 2; // ambiente a até 2 saltos da circulação
const BORDA_MIN = 1; // m de borda comum para dois ambientes valerem como "encostados"

const half = (n) => Math.abs(n * 2 - Math.round(n * 2)) < EPS; // múltiplos de 0,5: termina em 0 ou 5
const overlap = (a, b) =>
  a.u < b.u + b.w - EPS && b.u < a.u + a.w - EPS && a.v < b.v + b.d - EPS && b.v < a.v + a.d - EPS;

/* comprimento da borda comum (0 se só se tocam num ponto ou não se tocam) */
function shared(a, b) {
  const du = Math.min(a.u + a.w, b.u + b.w) - Math.max(a.u, b.u);
  const dv = Math.min(a.v + a.d, b.v + b.d) - Math.max(a.v, b.v);
  if (Math.abs(a.u + a.w - b.u) < EPS || Math.abs(b.u + b.w - a.u) < EPS) return dv > EPS ? dv : 0;
  if (Math.abs(a.v + a.d - b.v) < EPS || Math.abs(b.v + b.d - a.v) < EPS) return du > EPS ? du : 0;
  return 0;
}

/* distância entre dois retângulos (0 se encostam ou se sobrepõem) */
const gap = (a, b) =>
  Math.hypot(
    Math.max(a.u - (b.u + b.w), b.u - (a.u + a.w), 0),
    Math.max(a.v - (b.v + b.d), b.v - (a.v + a.d), 0),
  );

const porId = (salas) => new Map(salas.map((s) => [s.id, s]));
const num = (x) => typeof x === 'number' && Number.isFinite(x);

/* o que o bunker herda do lote (plan/site.json): limites, córrego e a Casa Grande na grade do bunker */
function contextoLote(P, S) {
  const c = S.itens.find((i) => i.id === 'casa');
  return {
    lote: S.lote,
    corregoX: S.corrego.x1,
    itens: S.itens,
    casa: c ? { u: c.x - P.mundo.x0, v: c.z - P.mundo.z0, w: c.w, d: c.d } : null,
  };
}

/* ---------- o próprio plano: ids e valores das regras ---------- */

function conferirPlano(P) {
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
  const min =
    (T.lado_min.por_id || {})[s.id] ??
    (P.circulacao.includes(s.id) ? T.lado_min.circulacao : T.lado_min.ambiente);
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
function saltosAcesso(P, salas) {
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

/* regras.escotilha: o poço da escada de emergência sobe até uma escotilha que não pode ficar sob/ao lado
   da Casa Grande (sombra de queda) nem dentro dos outros itens do lote */
function conferirEscotilha(P, salas, ctx) {
  const R = P.regras && P.regras.escotilha;
  const e = R && salas.find((s) => s.id === R.ambiente);
  if (!e) return [];
  const erros = [];
  const c = { x: P.mundo.x0 + e.u, z: P.mundo.z0 + e.v, w: e.w, d: e.d };
  for (const it of ctx.itens) {
    const m = it.id === 'casa' ? R.fora_da_casa_m : R.fora_de_itens_m;
    const fora =
      c.x + c.w <= it.x - m + EPS || c.x >= it.x + it.w + m - EPS || c.z + c.d <= it.z - m + EPS || c.z >= it.z + it.d + m - EPS;
    if (!fora) erros.push(`a escotilha (x ${c.x}–${c.x + c.w}, z ${c.z}–${c.z + c.d}) fica a menos de ${m} m de ${it.id}`);
  }
  return erros;
}

function conferirRegras(P, F, salas, ctx) {
  return [
    ...conferirGeometria(F, salas),
    ...conferirEscotilha(P, salas, ctx),
    ...conferirMundo(P, F, ctx),
    ...conferirAcesso(P, salas),
    ...conferirSaidas(P, salas),
  ];
}

/* ---------- medições ---------- */

/* área da pegada que não é ambiente, em bolsões conexos (grade de 0,5 m) */
function bolsoes(F, salas, G = 0.5) {
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
function medir(P, F, salas) {
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
function conferirBase(P, S) {
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
function conferirOpcao(P, opcao, S) {
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
function mapa(F, salas) {
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


/* Régua do lote, funções puras. Convenção do modelo: x+ = oeste, z+ = norte (an/ACHADOS_FASE1-2.md). */
const rad = (g) => (g * Math.PI) / 180;

/* Direção do sol no mundo (x+ oeste, z+ norte) e elevação, para latitude, declinação e hora solar (graus, h). */
function sol(lat, decl, hora) {
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
function sombraDe(h, s) {
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
function horasDeSombra(alvo, fontes, { lat, decl, horas }, passo = 1) {
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
function conferirLote(S, bunker) {
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
      else if (g < S.margem - EPS && !enc)
        err(`lote: ${it.id} fica a ${g.toFixed(1)} m da ${nome} (mínimo ${S.margem} m)`);
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
      } else if (gap(R(a), R(b)) < S.margem - EPS)
        err(
          `lote: ${a.id} e ${b.id} ficam a ${gap(R(a), R(b)).toFixed(1)} m (mínimo ${S.margem} m)`,
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
  if (dist.animaisCasa < rule.animais_longe_da_casa)
    err(
      `lote: animais a ${dist.animaisCasa.toFixed(1)} m da casa (mínimo ${rule.animais_longe_da_casa} m)`,
    );
  if (dist.pomarNucleo > rule.pomar_perto_do_nucleo)
    err(
      `lote: pomar a ${dist.pomarNucleo.toFixed(1)} m do núcleo (máximo ${rule.pomar_perto_do_nucleo} m)`,
    );
  if (dist.estufaNucleo > rule.estufa_perto_do_nucleo)
    err(
      `lote: estufa a ${dist.estufaNucleo.toFixed(1)} m do núcleo (máximo ${rule.estufa_perto_do_nucleo} m)`,
    );
  if (dist.animaisNucleo > rule.animais_perto_do_nucleo)
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

// Rede de caminhos do lote (ferramenta de projeto, fora do app): árvore de caminhos ligando a estrada às portas dos itens,
// mais atalhos nos pares de maior peso de viagem. Grade de 1 m; as células de item, do bloco livre e do córrego são barradas.
// x+ = oeste e z+ = norte no modelo, mas aqui só importam as coordenadas do plano (x, z) como estão em plan/site.json.

class Fila {
  constructor() {
    this.a = [];
  }
  push(p, v) {
    const a = this.a;
    a.push([p, v]);
    let i = a.length - 1;
    while (i > 0) {
      const j = (i - 1) >> 1;
      if (a[j][0] <= a[i][0]) break;
      [a[i], a[j]] = [a[j], a[i]];
      i = j;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1,
          r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
  get size() {
    return this.a.length;
  }
}

function tracarCaminhos(S, o, { fatorAtalho = 1.3, ganhoMin = 0.5 } = {}) {
  const L = S.lote;
  const nx = Math.round(L.x2 - L.x1),
    nz = Math.round(L.z2 - L.z1);
  const idx = (i, j) => j * nx + i;
  const cx = (c) => L.x1 + (c % nx) + 0.5,
    cz = (c) => L.z1 + Math.floor(c / nx) + 0.5;
  const dentro = (r, x, z) => x > r.x && x < r.x + r.w && z > r.z && z < r.z + r.d;
  const E = o.estrada || S.estrada;
  const barra = new Uint8Array(nx * nz);
  const dono = new Int16Array(nx * nz).fill(-1);
  const estrada = new Uint8Array(nx * nz);
  for (let c = 0; c < nx * nz; c++) {
    const x = cx(c),
      z = cz(c);
    o.itens.forEach((it, n) => {
      if (dentro(it, x, z)) {
        barra[c] = 1;
        dono[c] = n;
      }
    });
    if (o.bloco && dentro(o.bloco, x, z)) barra[c] = 1;
    if (x > S.corrego.x1 && x < S.corrego.x2) barra[c] = 1;
    if (!barra[c] && x > E.x1 && x < E.x2 && z > E.z1 && z < E.z2) estrada[c] = 1;
  }
  const vizinhas = (c) => {
    const i = c % nx,
      j = Math.floor(c / nx),
      r = [];
    if (i > 0) r.push(c - 1);
    if (i < nx - 1) r.push(c + 1);
    if (j > 0) r.push(c - nx);
    if (j < nz - 1) r.push(c + nx);
    return r;
  };
  const rede = new Set();
  for (let c = 0; c < nx * nz; c++) if (estrada[c]) rede.add(c);

  // Dijkstra a partir de várias células; custo 1 por célula livre, `reuso` nas que já são rede
  const dijkstra = (fontes, reuso, alvo = -1) => {
    const dist = new Float64Array(nx * nz).fill(Infinity);
    const ant = new Int32Array(nx * nz).fill(-1);
    const q = new Fila();
    for (const s of fontes) {
      dist[s] = 0;
      q.push(0, s);
    }
    while (q.size) {
      const [d, c] = q.pop();
      if (d > dist[c]) continue;
      if (c === alvo) break;
      for (const n of vizinhas(c)) {
        if (barra[n]) continue;
        const nd = d + (rede.has(n) ? reuso : 1);
        if (nd < dist[n]) {
          dist[n] = nd;
          ant[n] = c;
          q.push(nd, n);
        }
      }
    }
    return { dist, ant };
  };

  // células livres coladas em cada item = candidatas a porta
  const adj = o.itens.map(() => new Set());
  for (let c = 0; c < nx * nz; c++)
    if (dono[c] >= 0) for (const n of vizinhas(c)) if (!barra[n]) adj[dono[c]].add(n);

  const portas = new Array(o.itens.length).fill(-1);
  const semRota = [];
  const restam = new Set(o.itens.map((_, n) => n));
  while (restam.size) {
    const { dist, ant } = dijkstra([...rede], 0);
    let par = null;
    for (const n of restam) {
      let m = null;
      for (const c of adj[n]) if (!m || dist[c] < dist[m]) m = c;
      if (m !== null && (!par || dist[m] < dist[par.c])) par = { n, c: m };
    }
    if (!par || !Number.isFinite(dist[par.c])) {
      for (const n of restam) semRota.push(o.itens[n].id);
      break;
    }
    for (let c = par.c; c !== -1 && !rede.has(c); c = ant[c]) rede.add(c);
    rede.add(par.c);
    portas[par.n] = par.c;
    restam.delete(par.n);
  }

  const bfs = (de) => {
    const dist = new Map([[de, 0]]);
    const fila = [de];
    for (let h = 0; h < fila.length; h++)
      for (const n of vizinhas(fila[h]))
        if (rede.has(n) && !dist.has(n)) {
          dist.set(n, dist.get(fila[h]) + 1);
          fila.push(n);
        }
    return dist;
  };
  const porta = (id) => portas[o.itens.findIndex((i) => i.id === id)];
  const l1 = (a, b) => Math.abs(cx(a) - cx(b)) + Math.abs(cz(a) - cz(b));
  const distRede = (a, b) => bfs(a).get(b) ?? Infinity;

  // atalhos: pares de maior peso, quando a rede dá volta demais
  const atalhos = [];
  const pares = [...S.viagens.pares].sort((p, q) => q.peso - p.peso);
  for (const p of pares) {
    const a = porta(p.a),
      b = porta(p.b);
    if (a < 0 || b < 0) continue;
    const d0 = distRede(a, b);
    if (!(d0 > fatorAtalho * l1(a, b))) continue;
    const { ant } = dijkstra([a], 0.3, b);
    const novas = [];
    for (let c = b; c !== -1 && c !== a; c = ant[c]) if (!rede.has(c)) novas.push(c);
    if (!novas.length || (ant[b] === -1 && a !== b)) continue;
    novas.forEach((c) => rede.add(c));
    const d1 = distRede(a, b);
    if (d1 < d0 && d0 - d1 >= ganhoMin * novas.length) atalhos.push(novas);
    else novas.forEach((c) => rede.delete(c));
  }

  const dists = Object.fromEntries(
    o.itens.map((it, n) => [it.id, portas[n] >= 0 ? bfs(portas[n]) : null]),
  );
  let viagemRede = 0,
    viagemDireta = 0;
  for (const p of S.viagens.pares) {
    const a = porta(p.a),
      b = porta(p.b);
    const d = dists[p.a] && b >= 0 ? (dists[p.a].get(b) ?? Infinity) : Infinity;
    viagemRede += p.peso * d;
    if (a >= 0 && b >= 0) viagemDireta += p.peso * l1(a, b);
  }
  const noCaminho = [...rede].filter((c) => !estrada[c]);
  return {
    celulas: [...rede],
    estradaCelulas: [...rede].filter((c) => estrada[c]),
    atalhos,
    portas: Object.fromEntries(
      o.itens.map((it, n) => [it.id, portas[n] >= 0 ? [cx(portas[n]), cz(portas[n])] : null]),
    ),
    semRota,
    comprimento: noCaminho.length,
    viagemRede,
    viagemDireta,
    nx,
    cx,
    cz,
  };
}

// Núcleo do lote para o navegador: régua, caminhos, viagens e sombra, sem fs. A página interativa usa o bundle gerado por build-web.mjs.


// Σ peso × distância L1 entre centros (viagens diretas)
function custoViagens(S, itens) {
  const por = new Map(itens.map((i) => [i.id, i]));
  return S.viagens.pares.reduce((t, par) => {
    const a = por.get(par.a),
      b = por.get(par.b);
    return (
      t +
      par.peso * (Math.abs(a.x + a.w / 2 - b.x - b.w / 2) + Math.abs(a.z + a.d / 2 - b.z - b.d / 2))
    );
  }, 0);
}

// Avalia um arranjo { itens, estrada?, bloco?, dz_bunker? }; `bunker` = { x0, z0, w, d } (pegada e origem no mundo)
function avaliar(S, bunker, arranjo) {
  const S2 = {
    ...S,
    itens: arranjo.itens,
    estrada: arranjo.estrada || S.estrada,
    bloco: arranjo.bloco,
  };
  const regua = conferirLote(S2, {
    u: bunker.x0,
    v: bunker.z0 + (arranjo.dz_bunker || 0),
    w: bunker.w,
    d: bunker.d,
  });
  const cam = tracarCaminhos(S, {
    itens: arranjo.itens,
    estrada: S2.estrada,
    bloco: arranjo.bloco,
  });
  return {
    erros: regua.erros,
    metricas: regua.metricas,
    viagens: custoViagens(S, arranjo.itens),
    cam,
  };
}

// ---- Arranjo manual: grade, ímã e giro (usados pela página interativa) ----
const GRADE = 5; // grade invisível, em metros
const CAPTURA = 3; // raio do ímã, em metros
const arred = (v) => Math.round(v * 100) / 100;

// Gira 90° no sentido horário em torno do centro (a tela tem z para baixo)
function girar(it) {
  const cx = it.x + it.w / 2,
    cz = it.z + it.d / 2;
  return {
    ...it,
    w: it.d,
    d: it.w,
    x: arred(cx - it.d / 2),
    z: arred(cz - it.w / 2),
    giro: ((it.giro || 0) + 1) % 4,
  };
}

// Retângulos que seguram os itens: córrego e estrada (afastados pela folga da régua)
function barreiras(S, estrada) {
  const L = S.lote,
    E = estrada || S.estrada;
  return [
    { x: S.corrego.x1, z: L.z1, w: S.corrego.x2 - S.corrego.x1, d: L.z2 - L.z1 },
    { x: E.x1, z: E.z1, w: E.x2 - E.x1, d: E.z2 - E.z1 },
  ];
}

// Posição final do item `it` quando o Mestre o solta perto de (x, z): ímã nas bordas vizinhas
// (folga S.margem, ou alinhado) e na divisa; sem ímã por perto, vai para a grade de 5 m.
function encaixar(it, x, z, S, outros, estrada, { ima = true } = {}) {
  const L = S.lote,
    M = S.margem;
  const alvos = [...outros.filter((o) => o.id !== it.id), ...barreiras(S, estrada)];
  const eixo = (pos, tam, lo, hi, ini, fim, perto) => {
    const minimo = lo + M,
      maximo = hi - M - tam;
    let melhor = null;
    const tenta = (c) => {
      if (
        Math.abs(c - pos) <= CAPTURA &&
        (melhor === null || Math.abs(c - pos) < Math.abs(melhor - pos))
      )
        melhor = c;
    };
    if (ima) {
      tenta(minimo);
      tenta(maximo);
      for (const o of alvos) {
        if (!perto(o)) continue;
        const [a, b] = [o[ini], o[ini] + o[fim]];
        tenta(a - M - tam);
        tenta(b + M);
        if ((it.colado || []).includes(o.id) || (o.colado || []).includes(it.id)) {
          tenta(a - tam); // item colado: o ímã também aceita encostar de vez
          tenta(b);
        }
        tenta(a);
        tenta(b - tam);
      }
    }
    const c = melhor ?? lo + Math.round((pos - lo) / GRADE) * GRADE;
    return arred(Math.min(Math.max(c, minimo), maximo));
  };
  const vizinhoZ = (zz) => (o) => zz < o.z + o.d + M + CAPTURA && zz + it.d > o.z - M - CAPTURA;
  const nx = eixo(x, it.w, L.x1, L.x2, 'x', 'w', vizinhoZ(z));
  const vizinhoX = (o) => nx < o.x + o.w + M + CAPTURA && nx + it.w > o.x - M - CAPTURA;
  const nz = eixo(z, it.d, L.z1, L.z2, 'z', 'd', vizinhoX);
  return { x: nx, z: nz };
}

return { conferirLote, tracarCaminhos, custoViagens, avaliar, girar, encaixar, barreiras, GRADE, CAPTURA };
})();
