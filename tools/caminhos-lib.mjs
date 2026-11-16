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

export function tracarCaminhos(S, o, { fatorAtalho = 1.3, ganhoMin = 0.5 } = {}) {
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
