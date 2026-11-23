// Gera plan/pranchas.html (duas pranchas em SVG) a partir de plan/bunker.json, plan/site.json e plan/arranjos/.
import fs from 'node:fs';
import { conferirBase, conferirOpcao, paraMundo } from './layout-lib.mjs';
import { conferirLote, bunkerDoLote } from './lote-lib.mjs';
import { tracarCaminhos } from './caminhos-lib.mjs';
import { avaliarArranjo, sobreMedidas } from './avaliar-arranjo.mjs';

const lerJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const B = lerJson('plan/bunker.json');
const S = lerJson('plan/site.json');
const f = (n) => String(n).replace('.', ',').replace(/^-/, '−');
const fmt = (n, d = 1) => f(Number(Number(n).toFixed(d)));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const GRP = {
  circulação: 'g-circ',
  privada: 'g-priv',
  convivência: 'g-conv',
  armazenagem: 'g-arm',
  produção: 'g-prod',
  técnica: 'g-tec',
};

/* ---- prancha 1: opções de encaixe do bunker (plano atual como referência) ---- */
const OPJ = fs.existsSync('plan/bunker-opcoes.json')
  ? lerJson('plan/bunker-opcoes.json')
  : { opcoes: [] };
const OP = OPJ.opcoes;
const num = new Map(
  [...B.salas].sort((a, b) => a.v - b.v || a.u - b.u).map((r, i) => [r.id, i + 1]),
);
const nominal = (id) => B.medidas[id] || (B.extras || {})[id];
const k = 10;
const pad = 26;

function planta(o) {
  const W = o.pegada.w * k + pad * 2;
  const H = o.pegada.d * k + pad * 2;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Planta do bunker, opção ${esc(o.nome)}">`;
  s += `<rect x="${pad}" y="${pad}" width="${o.pegada.w * k}" height="${o.pegada.d * k}" fill="url(#hatch)" class="foot"/>`;
  for (let m = 0; m <= o.pegada.w; m += 10)
    s += `<text x="${pad + m * k}" y="${pad - 9}" class="tick" text-anchor="middle">${m}</text>`;
  for (let m = 0; m <= o.pegada.d; m += 10)
    s += `<text x="${pad - 7}" y="${pad + m * k + 4}" class="tick" text-anchor="end">${m}</text>`;
  for (const r of o.salas) {
    const x = pad + r.u * k;
    const y = pad + r.v * k;
    const w = r.w * k;
    const d = r.d * k;
    const grupo = r.grupo || B.salas.find((q) => q.id === r.id).grupo;
    s += `<g class="room ${GRP[grupo]}${r.id === 'ramal' ? ' novo' : ''}${r.id === 'escada' ? ' escada' : ''}"><rect x="${x}" y="${y}" width="${w}" height="${d}"/>`;
    const big = r.w >= 9 && r.d >= 9;
    s += `<text x="${x + w / 2}" y="${y + d / 2 - (big ? 6 : 0)}" class="num" text-anchor="middle" dominant-baseline="middle">${num.get(r.id)}</text>`;
    if (big)
      s += `<text x="${x + w / 2}" y="${y + d / 2 + 13}" class="dim" text-anchor="middle">${f(r.w)}×${f(r.d)}</text>`;
    s += '</g>';
  }
  return s + '</svg>';
}

const defs =
  '<svg class="defs" aria-hidden="true"><defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="hl"/></pattern></defs></svg>';
const base = { id: 'atual', nome: 'Plano atual (referência)', pegada: B.pegada, salas: B.salas };
const cols = [...OP, base];
const met = cols.map((o) =>
  o === base
    ? conferirBase(B, S, { semMundo: true })
    : conferirOpcao(B, o, S, { semMundo: o.id !== OPJ.escolhida }),
);
const bad = met.filter((r) => r.erros.length);
if (bad.length) throw new Error('opção com erro na régua: ' + bad[0].erros[0]);
const mt = met.map((r) => r.metricas);
const hatch = (o) => o.salas.find((r) => r.id === 'escada');
const cards = OP.map(
  (o) =>
    `<figure class="card"><figcaption><b>${esc(o.nome)}${o.id === OPJ.escolhida ? ' ★ escolhida' : ''}</b><span>${f(o.pegada.w)}×${f(o.pegada.d)} m · ${f(o.pegada.w * o.pegada.d)} m²</span></figcaption>${planta(o)}</figure>`,
).join('');

const medRows = [
  ['Pegada (m²)', (m) => f(m.pegada.area)],
  ['Útil (m²)', (m) => f(m.util)],
  ['Vazio (m²)', (m) => f(m.vazio)],
  ['Afinidades atendidas', (m) => `${m.afinidades.pontos} de ${m.afinidades.maximo} pontos`],
  ['Acesso direto à circulação', (m) => `${m.acesso.direto} de ${m.acesso.ambientes}`],
  ['Ruído: máquina–quarto mais perto', (m) => `${fmt(m.ruido.distancia)} m`],
  ['Escada–monta-carga', (m) => `${fmt(m.saidas)} m`],
  ['Ambientes que encolhem (m²)', (m) => f(m.encolhe)],
  [
    'Escotilha (x; z em m)',
    (m, o) => {
      const e = hatch(o);
      const w = paraMundo(B, o.pegada || B.pegada, e);
      return `${f(w.x)}; ${f(w.z)}`;
    },
  ],
]
  .map(
    ([t, fn]) => `<tr><td>${t}</td>${cols.map((o, i) => `<td>${fn(mt[i], o)}</td>`).join('')}</tr>`,
  )
  .join('');

const ids = [...num.keys()].sort((a, b) => num.get(a) - num.get(b));
const rows1 = ids
  .map((id) => {
    const nm = nominal(id);
    const cel = (o) => {
      const r = o.salas.find((q) => q.id === id);
      if (!r) return '<td class="nao">sem</td>';
      const dif = nm && !((r.w === nm[0] && r.d === nm[1]) || (r.w === nm[1] && r.d === nm[0]));
      return `<td${dif ? ' class="dif"' : ''}>${f(r.w)}×${f(r.d)}</td>`;
    };
    const grupo = B.salas.find((q) => q.id === id).grupo;
    return `<tr><td>${num.get(id)}</td><td>${esc(B.areas[id])}</td><td><span class="chip ${GRP[grupo]}">${grupo}</span></td><td>${nm ? f(nm[0]) + '×' + f(nm[1]) : ''}</td>${cols.map(cel).join('')}</tr>`;
  })
  .join('');

const heads = cols.map((o) => `<th>${esc(o.nome)}</th>`).join('');
const [mE, m1, m2o] = mt;
const esc2 = OP.find((o) => o.id === OPJ.escolhida) || { nome: 'Plano atual', pegada: B.pegada };
const pg = esc2.pegada;
const bk = bunkerDoLote(B, pg);
const bunkerCorregoAtual = S.corrego.x1 - (bk.u + bk.w);
const [escW, escD] = nominal('escada');
const [batW, batD] = nominal('baterias');

/* ---- prancha 2: lote 100×150 m (arranjo M adotado e alternativas S1/S2 do solver) ---- */
const LJ = lerJson('plan/lote-opcoes.json');
const escLote = LJ.opcoes.find((o) => o.id === LJ.escolhida) ||
  LJ.opcoes[0] || { id: 'plano', nome: 'Plano adotado' };
const L = S.lote;
const k2 = 4;
const p2 = 22;
const W2 = (L.x2 - L.x1) * k2 + p2 * 2;
const H2 = (L.z2 - L.z1) * k2 + p2 * 2;
const NUM = new Map(S.itens.map((i, n) => [i.id, n + 1]));

const opM = {
  id: escLote.id || 'mestre-22-11',
  curto: 'M ★',
  nome: `${escLote.nome} ★ adotado`,
  estrada: S.estrada,
  bunker: { x: bk.u, z: bk.v, w: bk.w, d: bk.d },
  itens: S.itens,
};
const candidatos = [opM];
for (const [curtoId, arq] of [
  ['S1', 'plan/arranjos/mestre-22-11-solver-viagens.json'],
  ['S2', 'plan/arranjos/mestre-22-11-solver-vazio.json'],
]) {
  if (!fs.existsSync(arq)) continue;
  const a = lerJson(arq);
  candidatos.push({ ...a, id: curtoId, curto: curtoId });
}

const met2 = candidatos.map((o) => {
  const r = avaliarArranjo(o);
  if (r.erros.length) throw new Error(`lote ${o.curto} com erro na régua: ${r.erros[0]}`);
  const S2 = { ...S, itens: o.itens, estrada: o.estrada, ...sobreMedidas(S, o) };
  const cl = conferirLote(S2, { u: o.bunker.x, v: o.bunker.z, w: o.bunker.w, d: o.bunker.d });
  const cam = tracarCaminhos(S, { itens: o.itens, estrada: o.estrada });
  const zmin = Math.min(...o.itens.map((i) => i.z));
  const zmax = Math.max(...o.itens.map((i) => i.z + i.d));
  const bunkerCorrego = S.corrego.x1 - (o.bunker.x + o.bunker.w);
  return {
    o,
    r,
    cl,
    cam,
    bunkerCorrego,
    fundos: zmin - L.z1,
    frente: L.z2 - zmax,
  };
});

function lotePlanta(o, cam, vazio) {
  const X = (x) => p2 + (x - L.x1) * k2;
  const Z = (z) => p2 + (z - L.z1) * k2;
  const E = o.estrada || S.estrada;
  const C = S.corrego;
  const bkO = o.bunker;
  let t = `<svg viewBox="0 0 ${W2} ${H2}" role="img" aria-label="Implantação do lote, ${esc(o.nome)}">`;
  t += `<rect x="${X(L.x1)}" y="${Z(L.z1)}" width="${(L.x2 - L.x1) * k2}" height="${(L.z2 - L.z1) * k2}" class="lote"/>`;
  t += `<text x="${p2 / 2}" y="${H2 / 2}" class="tick" text-anchor="middle" dominant-baseline="middle">L</text>`;
  t += `<text x="${W2 - p2 / 2}" y="${H2 / 2}" class="tick" text-anchor="middle" dominant-baseline="middle">O</text>`;
  t += `<text x="${W2 / 2}" y="${p2 / 2}" class="tick" text-anchor="middle" dominant-baseline="middle">S</text>`;
  t += `<text x="${W2 / 2}" y="${H2 - p2 / 2}" class="tick" text-anchor="middle" dominant-baseline="middle">N</text>`;
  t += `<rect x="${X(E.x1)}" y="${Z(E.z1)}" width="${Math.max(1, (E.x2 - E.x1) * k2)}" height="${Math.max(1, (E.z2 - E.z1) * k2)}" class="estrada"/>`;
  t += `<rect x="${X(C.x1)}" y="${Z(L.z1)}" width="${(C.x2 - C.x1) * k2}" height="${(L.z2 - L.z1) * k2}" class="corrego"/>`;
  if (vazio && vazio.area > 0) {
    t += `<rect x="${X(vazio.x)}" y="${Z(vazio.z)}" width="${vazio.w * k2}" height="${vazio.d * k2}" class="bloco"/>`;
    t += `<text x="${X(vazio.x) + (vazio.w * k2) / 2}" y="${Z(vazio.z) + (vazio.d * k2) / 2}" class="tick" text-anchor="middle" dominant-baseline="middle">livre ${f(vazio.w)}×${f(vazio.d)}</text>`;
  }
  if (cam) {
    const rede = new Set(cam.celulas);
    const atal = new Set(cam.atalhos.flat());
    const mid = (c) => [X(cam.cx(c)), Z(cam.cz(c))];
    for (const c of cam.celulas) {
      if (cam.estradaCelulas.includes(c)) continue;
      const [x, y] = mid(c);
      const cls = atal.has(c) ? 'atalho' : 'cam';
      t += `<circle cx="${x}" cy="${y}" r="${k2}" class="${cls}"/>`;
      for (const n of [c + 1, c + cam.nx])
        if (rede.has(n) && !cam.estradaCelulas.includes(n) && (n !== c + 1 || n % cam.nx !== 0))
          t += `<line x1="${x}" y1="${y}" x2="${mid(n)[0]}" y2="${mid(n)[1]}" class="${cls}"/>`;
    }
  }
  for (const it of o.itens) {
    t += `<g class="item t-${it.tipo}"><rect x="${X(it.x)}" y="${Z(it.z)}" width="${it.w * k2}" height="${it.d * k2}"/>`;
    if (it.id === 'quadras' && S.quadras_internas) {
      const q = S.quadras_internas;
      const aligned = Math.abs(it.w - (2 * q.cada[0] + q.vao)) < 1e-6;
      const qw = aligned ? q.cada[0] : q.cada[1];
      const qd = aligned ? q.cada[1] : q.cada[0];
      for (const ix of [0, 1])
        for (const iz of [0, 1])
          t += `<rect x="${X(it.x + ix * (qw + q.vao))}" y="${Z(it.z + iz * (qd + q.vao))}" width="${qw * k2}" height="${qd * k2}" class="sub"/>`;
    }
    const big = it.w >= 15 && it.d >= 15;
    t += `<text x="${X(it.x) + (it.w * k2) / 2}" y="${Z(it.z) + (it.d * k2) / 2 - (big ? 5 : 0)}" class="num" text-anchor="middle" dominant-baseline="middle">${NUM.get(it.id)}</text>`;
    if (big)
      t += `<text x="${X(it.x) + (it.w * k2) / 2}" y="${Z(it.z) + (it.d * k2) / 2 + 10}" class="dim" text-anchor="middle">${f(it.w)}×${f(it.d)}</text>`;
    t += '</g>';
  }
  t += `<rect x="${X(bkO.x)}" y="${Z(bkO.z)}" width="${bkO.w * k2}" height="${bkO.d * k2}" class="bunk"/>`;
  t += `<text x="${X(bkO.x) + 4}" y="${Z(bkO.z) + 12}" class="tick bunk-lbl">bunker ${f(bkO.w)}×${f(bkO.d)}</text>`;
  const py = (E.z1 + E.z2) / 2;
  t += `<circle cx="${X(L.x1)}" cy="${Z(py)}" r="5.5" class="gate"/><text x="${X(L.x1) + 8}" y="${Z(py) - 7}" class="tick">porteira</text>`;
  if (cam)
    for (const p of Object.values(cam.portas))
      if (p) t += `<circle cx="${X(p[0])}" cy="${Z(p[1])}" r="2.4" class="porta"/>`;
  return t + '</svg>';
}

const cards2 = met2
  .map(
    ({ o, r, cam }) =>
      `<figure><figcaption>${esc(o.nome)}</figcaption>${lotePlanta(o, cam, r.vazio)}</figure>`,
  )
  .join('');

const linhas2 = [
  ['Viagens diretas (menor é melhor)', (x) => f(Math.round(x.r.viagens))],
  ['Viagens pela rede de caminhos (menor é melhor)', (x) => f(Math.round(x.r.viagemRede))],
  ['Rede de caminhos fora da estrada (m)', (x) => f(x.r.caminhoM)],
  ['Atalhos', (x) => f(x.cam.atalhos.length)],
  [
    'Sombra nas quadras, inverno 9h–15h (h · meta 0 h)',
    (x) => fmt(x.r.sombraItens.quadras.horas, 1),
  ],
  ['Sombra no núcleo, inverno 9h–15h (h · meta 0 h)', (x) => fmt(x.r.sombraItens.nucleo.horas, 1)],
  [
    `Animais–casa (m · mín. ${f(S.regras.animais_longe_da_casa)} m, IN 11/2025 SC)`,
    (x) => fmt(x.cl.metricas.dist.animaisCasa, 1),
  ],
  [`Bunker–córrego (m · mín. ${f(B.mundo.distancia_corrego)} m)`, (x) => fmt(x.bunkerCorrego, 1)],
  [
    'Maior bloco livre contínuo (m² · L×P)',
    (x) => `${f(x.r.vazio.area)} (${f(x.r.vazio.w)}×${f(x.r.vazio.d)})`,
  ],
  ['Área livre total no lote (m²)', (x) => f(x.r.livreTotal)],
  ['Folga em z: fundos / frente (m)', (x) => `${f(x.fundos)} / ${f(x.frente)}`],
  [
    'Passa na régua',
    (x) =>
      x.r.erros.length ? 'NÃO' : x.r.avisos.length ? 'sim (aviso: Casa fora do bunker)' : 'sim',
  ],
]
  .map(([n, g]) => `<tr><td>${n}</td>${met2.map((x) => `<td>${g(x)}</td>`).join('')}</tr>`)
  .join('');

const tabela2 = `<table><thead><tr><th>Métrica</th>${met2.map((x) => `<th>${esc(x.o.curto)}</th>`).join('')}</tr></thead><tbody>${linhas2}</tbody></table>`;

const legenda2 = S.itens
  .map((i) => `<li>${NUM.get(i.id)} ${esc(S.nomes[i.id])} ${f(i.w)}×${f(i.d)}</li>`)
  .join('');

const mRef = met2[0];
const sameDim = (a, b) =>
  (Math.abs(a.w - b.w) < 1e-6 && Math.abs(a.d - b.d) < 1e-6) ||
  (Math.abs(a.w - b.d) < 1e-6 && Math.abs(a.d - b.w) < 1e-6);

const rowsItens = S.itens
  .map((itM) => {
    const numId = NUM.get(itM.id);
    const area = S.areas_plano[itM.id];
    const env = itM.w * itM.d;
    const areaTxt = Math.abs(area - env) > 1e-6 ? `${f(area)} (env. ${f(env)})` : f(area);
    const altCols = met2
      .slice(1)
      .map((m) => {
        const it = m.o.itens.find((x) => x.id === itM.id);
        const dif = !sameDim(it, itM);
        return `<td${dif ? ' class="dif"' : ''}>${f(it.w)}×${f(it.d)}</td>`;
      })
      .join('');
    return `<tr><td>${numId}</td><td>${esc(S.nomes[itM.id])}</td><td>${f(itM.w)}×${f(itM.d)}</td><td>${areaTxt}</td><td>${f(itM.x)}; ${f(itM.z)}</td>${altCols}</tr>`;
  })
  .join('');

const altHeads = met2
  .slice(1)
  .map((m) => `<th>${esc(m.o.curto)}</th>`)
  .join('');
const envPct = Math.round((mRef.cl.metricas.env / mRef.cl.metricas.lotArea) * 100);
const tabelaItens = `<table><thead><tr><th>Nº</th><th>Item</th><th>Medida M (m)</th><th>Área (m²)</th><th>Posição M (x; z)</th>${altHeads}</tr></thead><tbody>${rowsItens}<tr><td>—</td><td><b>Total do plano (M)</b></td><td>12 itens</td><td><b>${f(S.total_itens)}</b> (env. ${f(mRef.cl.metricas.env)} de ${f(mRef.cl.metricas.lotArea)} m² · ${envPct}%)</td><td>—</td>${met2
  .slice(1)
  .map((m) => `<td>${f(m.cl.metricas.total)} m²</td>`)
  .join('')}</tr></tbody></table>`;

const rowsSombra = S.itens
  .map((itM) => {
    const cobrada = itM.tipo === 'lavoura';
    const regTxt = cobrada ? 'Cobrada · 0 h (Embrapa)' : 'Só mede (sem limite)';
    const cels = met2
      .map((m) => {
        const s = m.r.sombraItens[itM.id];
        const quem = s.quem.length ? ` <span class="mut">(${esc(s.quem.join(', '))})</span>` : '';
        return `<td>${fmt(s.horas, 1)} h${quem}</td>`;
      })
      .join('');
    return `<tr><td>${NUM.get(itM.id)}</td><td>${esc(itM.id)}</td><td>${regTxt}</td>${cels}</tr>`;
  })
  .join('');

const tabelaSombra = `<table><thead><tr><th>Nº</th><th>Item</th><th>Regra de sol</th>${met2.map((x) => `<th>${esc(x.o.curto)}</th>`).join('')}</tr></thead><tbody>${rowsSombra}</tbody></table>`;

const regrasRows = [
  [
    'Divisas e estrada',
    `${f(S.margem)} m (engenho encosta no córrego)`,
    'Chute / Mestre',
    'Ligada',
  ],
  [
    'Folga entre itens',
    `${f(S.folga_itens)} m (puxadinho colado na casa 0 m; reajuste até ${f(S.folga_reajuste)} m)`,
    'Mestre',
    'Ligada',
  ],
  [
    'Córrego',
    `${f(S.corrego_dist)} m (Lei 12.651 art. 61-A pede 5 m até 1 mód. fiscal — confirmar CAR)`,
    'Mestre (lei: 5 m)',
    'Ligada',
  ],
  [
    'Bunker ao córrego e cobertura',
    `≥ ${f(B.mundo.distancia_corrego)} m; ${f(bk.w)}×${f(bk.d)} m sem árvores, bambu ou escavação`,
    'Mestre / Engenharia',
    'Ligada',
  ],
  [
    'Animais longe da casa (odor)',
    `≥ ${f(S.regras.animais_longe_da_casa)} m`,
    'Fonte (IN 11/2025 IMA-SC; confirmar municipal)',
    'Ligada',
  ],
  ['Casa Grande sobre o bunker', 'Bunker solto da casa', 'Mestre', 'Desligada (só aviso)'],
  ['Proximidade (pomar, estufa, animais ↔ núcleo)', '—', 'Chute', 'Desligadas'],
  [
    'Sombra em quadras e núcleo',
    `0 h meta, inverno 9h–15h, lat. ${f(S.orientacao.latitude)} (demais itens só medem)`,
    'Fonte (Embrapa)',
    'Ligada',
  ],
  ['Medidas e posições', 'Múltiplos de 0,5 m (terminam em 0 ou 5)', 'Mestre', 'Ligada'],
  [
    'Viagens, atalhos e alturas',
    `${S.viagens.pares.length} pares (pesos 1–3); atalho > 1,3×; alturas do plano`,
    'Chute',
    'Só mede / guia solver',
  ],
  [
    'Ruído, fumaça, aceiro e rizoma de bambu',
    'Sem número nas fontes (sugestão: barreira de rizoma no bambu)',
    'Fontes abertas',
    'Sem regra',
  ],
]
  .map(
    ([regra, val, orig, est]) =>
      `<tr><td>${esc(regra)}</td><td>${esc(val)}</td><td>${esc(orig)}</td><td>${esc(est)}</td></tr>`,
  )
  .join('');

const tabelaRegras = `<table class="regras"><thead><tr><th>Regra</th><th>Valor atual</th><th>Origem</th><th>Estado</th></tr></thead><tbody>${regrasRows}</tbody></table>`;

const escNomeCurto = esc2.nome.replace(/^Variação de /, '');
const silviAlt = met2
  .slice(1)
  .map((m) => m.o.itens.find((i) => i.id === 'silvicultura'))
  .find(Boolean);
const silviAltTxt = silviAlt ? `${f(silviAlt.w)}×${f(silviAlt.d)} m` : '';

const html = `<title>Pranchas do Sítio Vale do Café</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* layout: duas pranchas técnicas em cartela; no celular empilha */
:root{--bg:#f3f4f1;--fg:#1d2420;--mut:#5b645e;--line:#c9cfc8;--card:#ffffff;--acc:#1f5f4a;
--circ:#d9dcd8;--priv:#e3d6ee;--conv:#f3e1b8;--arm:#e9d3b3;--prod:#cfe5c9;--tec:#cbdcef;--novo:#ffffff;
--predio:#e8cfae;--lavoura:#d6e8b8;--arvore:#a9d3a0;--escav:#d8b9a0;--road:#8d9490;--creek:#9cc8e8;--bunk:#6a4c93;
--font:'Inter',system-ui,sans-serif;--mono:'JetBrains Mono',ui-monospace,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#171c19;--fg:#e6ebe7;--mut:#9aa6a0;--line:#37403a;--card:#1f2622;--acc:#6fc2a2;
--circ:#4a504c;--priv:#4d3f63;--conv:#6b5a2f;--arm:#5f4c33;--prod:#3b5a39;--tec:#34506e;--novo:#1f2622;
--predio:#6b5640;--lavoura:#4d6535;--arvore:#2f5a35;--escav:#6a4a38;--road:#6d7571;--creek:#2f5d7d;--bunk:#a98ad6;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#171c19;--fg:#e6ebe7;--mut:#9aa6a0;--line:#37403a;--card:#1f2622;--acc:#6fc2a2;
--circ:#4a504c;--priv:#4d3f63;--conv:#6b5a2f;--arm:#5f4c33;--prod:#3b5a39;--tec:#34506e;--novo:#1f2622;
--predio:#6b5640;--lavoura:#4d6535;--arvore:#2f5a35;--escav:#6a4a38;--road:#6d7571;--creek:#2f5d7d;--bunk:#a98ad6;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:14px/1.5 var(--font);margin:0;padding-block:20px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:28px}
h1{font-size:22px;margin:0;text-wrap:balance}h2{font-size:16px;margin:0}h3{font-size:13.5px;margin:6px 0 0;color:var(--mut)}
.sub1{color:var(--mut);margin:4px 0 0}
section{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:16px;display:flex;flex-direction:column;gap:12px}
.cols{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:16px;align-items:start}
@media (max-width:860px){.cols{grid-template-columns:minmax(0,1fr)}}
svg{width:100%;height:auto;display:block;background:var(--bg);border:1px solid var(--line)}
figure{margin:0;display:flex;flex-direction:column;gap:6px;min-width:0}figcaption{font-size:12.5px;font-weight:600}.grade2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px}.leg{display:flex;flex-wrap:wrap;gap:4px 14px;list-style:none;padding:0;margin:0;font-size:12px}svg.defs{width:0;height:0;border:0;position:absolute}
.tbl{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:12.5px}
th,td{text-align:left;padding:4px 8px;border-bottom:1px solid var(--line);vertical-align:top}
td:nth-child(n+3){white-space:nowrap}table.regras td{white-space:normal}th{color:var(--mut);font-weight:600}
.chip{padding:1px 7px;border-radius:10px;font-size:11.5px;color:var(--fg)}
.room rect{stroke:var(--fg);stroke-width:1.2}.novo rect{stroke-dasharray:5 3}
.g-circ rect,.chip.g-circ{fill:var(--circ);background:var(--circ)}.g-priv rect,.chip.g-priv{fill:var(--priv);background:var(--priv)}
.g-conv rect,.chip.g-conv{fill:var(--conv);background:var(--conv)}.g-arm rect,.chip.g-arm{fill:var(--arm);background:var(--arm)}
.g-prod rect,.chip.g-prod{fill:var(--prod);background:var(--prod)}.g-tec rect,.chip.g-tec{fill:var(--tec);background:var(--tec)}
.novo rect{fill:var(--novo)}.escada rect{stroke:var(--bunk);stroke-width:2.4}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px}.card{margin:0;display:flex;flex-direction:column;gap:6px;min-width:0}.card figcaption{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.card figcaption span{font:12px var(--mono);color:var(--mut)}
td.dif{font-weight:600;color:var(--acc)}td.nao,.mut{color:var(--mut)}.card .num{font-size:19px}.card .dim{font-size:12px}
.num{font:600 15px var(--font);fill:var(--fg)}.dim{font:500 11px var(--mono);fill:var(--fg)}.tick{font:11px var(--mono);fill:var(--mut)}.bunk-lbl{fill:var(--bunk)}
.hl{stroke:var(--line);stroke-width:1.5}.foot{stroke:var(--mut);stroke-dasharray:4 3;stroke-width:1}
.lote{fill:none;stroke:var(--fg);stroke-width:2}.estrada{fill:var(--road);opacity:.8}.corrego{fill:var(--creek);opacity:.85}
.bloco{fill:var(--arvore);opacity:.35;stroke:var(--fg);stroke-width:1.2;stroke-dasharray:6 4}.cam{stroke:#2f8f5b;stroke-width:8;stroke-linecap:round;fill:#2f8f5b;opacity:.75}.atalho{stroke:#d9822b;stroke-width:8;stroke-linecap:round;fill:#d9822b}.porta{fill:var(--fg)}.gate{fill:var(--fg);stroke:var(--bg);stroke-width:2}circle.cam,circle.atalho{stroke:none}
.bunk{fill:none;stroke:var(--bunk);stroke-width:2;stroke-dasharray:8 5}
.item rect{stroke:var(--fg);stroke-width:1.2}.t-predio rect{fill:var(--predio)}.t-lavoura rect{fill:var(--lavoura)}.t-arvore rect{fill:var(--arvore)}.t-escavacao rect{fill:var(--escav)}
.item rect.sub{fill:none;stroke:var(--fg);stroke-width:.8;stroke-dasharray:3 3}
ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px}.ask{border-left:3px solid var(--acc);padding-left:12px}
</style>
<main>
<header><h1>Pranchas do Sítio Vale do Café</h1><p class="sub1">Etapa B0 fechada (23/11): bunker escolhido (${esc(esc2.nome)}, ${f(pg.w)}×${f(pg.d)} m, cota ${f(B.mundo.piso)} m, girado 90° no lote → ${f(bk.w)}×${f(bk.d)} m) e lote adotado (${esc(escLote.nome)}, área útil ${f(S.total_itens)} m² em ${f(L.x2 - L.x1)}×${f(L.z2 - L.z1)} m). Todos os números abaixo vêm dos arquivos do plano e passam nas réguas.</p></header>
<section><h2>Prancha 1 · Bunker subterrâneo, cota ${f(B.mundo.piso)} m (pé-direito ${f(B.mundo.pe_direito)} m)</h2>
${defs}
<p class="sub1">Três plantas geradas pelo solver, uma por margem de medida (exato, ±1 m, ±2,5 m). O Mestre escolheu a de ${esc(esc2.nome.replace(/^Variação de /, ''))} em 14/11 (★): pegada ${f(pg.w)}×${f(pg.d)} m, girada ${B.mundo.giro ? '90° no sentido horário' : '0°'} no lote (${f(bk.w)}×${f(bk.d)} m em x ${f(bk.u)}…${f(bk.u + bk.w)}, z ${f(bk.v)}…${f(bk.v + bk.d)}, a ${f(bunkerCorregoAtual)} m do córrego, mínimo ${f(B.mundo.distancia_corrego)} m; solto da Casa Grande). O mesmo número é o mesmo ambiente em todas. Todas passam na régua. Célula destacada = medida diferente da nominal.</p>
<div class="cards">${cards}</div>
<div class="tbl"><table><thead><tr><th>Medida</th>${heads}</tr></thead><tbody>${medRows}</tbody></table></div>
<div class="tbl"><table><thead><tr><th>Nº</th><th>Ambiente</th><th>Grupo</th><th>Nominal</th>${heads}</tr></thead><tbody>${rows1}</tbody></table></div>
<ul><li><b>Escada de emergência:</b> escada de marinheiro vertical, num poço de ${f(escW)}×${f(escD)} m até uma escotilha no terreno (nº ${num.get('escada')}). Fica fora da Casa Grande (${f(B.regras.escotilha.fora_da_casa_m)} m) e dos itens do lote (${f(B.regras.escotilha.fora_de_itens_m)} m), a pelo menos ${f(B.saidas.distancia_min)} m do monta-carga. O acesso principal é o monta-carga.</li>
<li><b>Ramal de serviço (novo, a aprovar), nº ${num.get('ramal')}, tracejado:</b> liga a hidroponia e a água à galeria. Na opção ±2,5 m ele some, porque não é mais preciso.</li>
<li><b>Ruído:</b> nas opções com margem, máquinas ficam coladas em quartos. Decisão do Mestre: resolver com isolamento termoacústico (lã de rocha, cancelamento ativo), então a distância não é critério.</li>
<li><b>Sala de baterias</b> (nº ${num.get('baterias')}): ${f(batW)}×${f(batD)} m provisório até a etapa de energia (E2–E5).</li>
<li>Pegada hachurada atrás das salas = vazio. A opção exata deixa ${f(mE.vazio)} m² vazios; ±1 m deixa ${f(m1.vazio)} m²; ±2,5 m deixa ${f(m2o.vazio)} m².</li></ul></section>
<section><h2>Prancha 2 · Lote ${f(L.x2 - L.x1)}×${f(L.z2 - L.z1)} m: arranjo adotado (M ★) e alternativas do solver (S1, S2)</h2>
<div class="grade2">${cards2}</div>
<h3>Métricas comparativas</h3>
<div class="tbl">${tabela2}</div>
<ul class="leg">${legenda2}</ul>
<h3>Medidas atuais dos 12 itens (M ★ × S1 × S2)</h3>
<div class="tbl">${tabelaItens}</div>
<h3>Sombra por item no solstício de inverno (9h–15h, de 7 h, lat. ${f(S.orientacao.latitude)})</h3>
<div class="tbl">${tabelaSombra}</div>
<h3>Regras do Lote aplicadas nesta prancha</h3>
<div class="tbl">${tabelaRegras}</div>
<ul><li><b>Convenção do desenho:</b> tracejado roxo = projeção do bunker (${f(bk.w)}×${f(bk.d)} m, subterrâneo); faixa escura = estrada de ${f(S.estrada.z2 - S.estrada.z1)} m saindo da porteira (leste, x ${f(L.x1)}, z ${f((S.estrada.z1 + S.estrada.z2) / 2)}); faixa azul = córrego (x ${f(S.corrego.x1)}…${f(S.corrego.x2)}, a oeste). Nos desenhos, leste (L) à esquerda, oeste (O) à direita, sul (S) em cima e norte (N) embaixo (x+ = oeste, z+ = norte).</li>
<li><b>Caminhos e atalhos:</b> linhas verdes = rede de caminhos de menor árvore fora da estrada até a porta de cada item (círculo preto); linhas laranja = atalhos nos pares de maior viagem. Área tracejada verde = maior bloco livre contínuo encontrado no lote.</li>
<li><b>Comparativo M ★ × S1 × S2:</b> M adota a silvicultura encolhida para ${f(S.medidas.silvicultura[0])}×${f(S.medidas.silvicultura[1])} m (${f(S.total_itens)} m² no plano); S1 e S2 mantêm casa, puxadinho, engenho, bunker e estrada do Mestre e regeram o restante${silviAltTxt ? ` mantendo silvicultura em ${silviAltTxt}` : ''}.</li>
<li>Terra da escavação (~6.000 m³): o Mestre disse tanto faz (descartar ou morro oco com torre).</li>
</ul></section>
<section class="ask"><h2>Estado da Etapa B0 e pontos abertos</h2><ul><li><b>Etapa B0 fechada (23/11):</b> bunker ${esc(escNomeCurto)} (${f(pg.w)}×${f(pg.d)} m, girado ${B.mundo.giro ? '90°' : '0°'} em x ${f(bk.u)}, z ${f(bk.v)}) e lote <b>M</b> já estão adotados em <code>plan/site.json</code>.</li>
<li><b>Pontos abertos para decisão futura:</b> (1) manter o arranjo <b>M ★</b> ou trocar para <b>S1</b> (menos viagens e sombra) ou <b>S2</b> (maior bloco livre contínuo); (2) confirmar a norma municipal de odor (hoje ${f(S.regras.animais_longe_da_casa)} m pela IN 11/2025 SC) e a faixa do córrego no CAR (hoje ${f(S.corrego_dist)} m contra ${f(B.mundo.distancia_corrego)} m do bunker e 5 m da Lei 12.651 art. 61-A); (3) dimensionar a sala de baterias (${f(batW)}×${f(batD)} m provisório) na etapa de energia (E2–E5).</li></ul></section>
</main>
`;

fs.writeFileSync('plan/pranchas.html', html, 'utf8');
console.log('ok', html.length);
