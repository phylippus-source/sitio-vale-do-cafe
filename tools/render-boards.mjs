// Gera plan/pranchas.html (duas pranchas em SVG) a partir de plan/bunker.json e plan/site.json.
import fs from 'node:fs';
import { conferirBase, conferirOpcao, paraMundo } from './layout-lib.mjs';
import { conferirLote, bunkerDoLote } from './lote-lib.mjs';
import { tracarCaminhos } from './caminhos-lib.mjs';
const B = JSON.parse(fs.readFileSync('plan/bunker.json', 'utf8'));
const S = JSON.parse(fs.readFileSync('plan/site.json', 'utf8'));
const f = (n) => String(n).replace('.', ',');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
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
  ? JSON.parse(fs.readFileSync('plan/bunker-opcoes.json', 'utf8'))
  : { opcoes: [] };
const OP = OPJ.opcoes;
const num = new Map(
  [...B.salas].sort((a, b) => a.v - b.v || a.u - b.u).map((r, i) => [r.id, i + 1]),
);
const nominal = (id) => B.medidas[id] || (B.extras || {})[id];
const k = 10,
  pad = 26;
function planta(o) {
  const W = o.pegada.w * k + pad * 2,
    H = o.pegada.d * k + pad * 2;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Planta do bunker, opção ${esc(o.nome)}">`;
  s += `<rect x="${pad}" y="${pad}" width="${o.pegada.w * k}" height="${o.pegada.d * k}" fill="url(#hatch)" class="foot"/>`;
  for (let m = 0; m <= o.pegada.w; m += 10)
    s += `<text x="${pad + m * k}" y="${pad - 9}" class="tick" text-anchor="middle">${m}</text>`;
  for (let m = 0; m <= o.pegada.d; m += 10)
    s += `<text x="${pad - 7}" y="${pad + m * k + 4}" class="tick" text-anchor="end">${m}</text>`;
  for (const r of o.salas) {
    const x = pad + r.u * k,
      y = pad + r.v * k,
      w = r.w * k,
      d = r.d * k;
    const grupo = r.grupo || B.salas.find((q) => q.id === r.id).grupo;
    s += `<g class="room ${GRP[grupo]}${r.id === 'ramal' ? ' novo' : ''}${r.id === 'escada' ? ' escada' : ''}"><rect x="${x}" y="${y}" width="${w}" height="${d}"/>`;
    const big = r.w >= 9 && r.d >= 9;
    s += `<text x="${x + w / 2}" y="${y + d / 2 - (big ? 6 : 0)}" class="num" text-anchor="middle" dominant-baseline="middle">${num.get(r.id)}</text>`;
    if (big)
      s += `<text x="${x + w / 2}" y="${y + d / 2 + 13}" class="dim" text-anchor="middle">${f(r.w)}×${f(r.d)}</text>`;
    s += `</g>`;
  }
  return s + `</svg>`;
}
const defs = `<svg class="defs" aria-hidden="true"><defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="hl"/></pattern></defs></svg>`;
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
  (o, i) =>
    `<figure class="card"><figcaption><b>${esc(o.nome)}${o.id === OPJ.escolhida ? ' ★ escolhida' : ''}</b><span>${f(o.pegada.w)}×${f(o.pegada.d)} m · ${f(o.pegada.w * o.pegada.d)} m²</span></figcaption>${planta(o)}</figure>`,
).join('');
const fmt = (n, d = 1) => f(Number(n.toFixed(d)));
const medRows = [
  ['Pegada (m²)', (m, o) => f(m.pegada.area)],
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

/* ---- prancha 2: lote (plano atual e variantes da estrada) ---- */
const LJ = JSON.parse(fs.readFileSync('plan/lote-opcoes.json', 'utf8'));
const esc2 = OP.find((o) => o.id === OPJ.escolhida) || { pegada: B.pegada };
const pg = esc2.pegada;
const bk = bunkerDoLote(B, pg); // projeção do bunker no lote (com giro)
const L = S.lote;
const k2 = 4,
  p2 = 18;
const W2 = (L.x2 - L.x1) * k2 + p2 * 2,
  H2 = (L.z2 - L.z1) * k2 + p2 * 2;
const NUM = new Map(S.itens.map((i, n) => [i.id, n + 1]));
const custoViagens = (itens) => {
  const por = new Map(itens.map((i) => [i.id, i]));
  return S.viagens.pares.reduce((t, par) => {
    const a = por.get(par.a),
      b = por.get(par.b);
    return (
      t +
      par.peso * (Math.abs(a.x + a.w / 2 - b.x - b.w / 2) + Math.abs(a.z + a.d / 2 - b.z - b.d / 2))
    );
  }, 0);
};
function lotePlanta(o, cam) {
  const X = (x) => p2 + (x - L.x1) * k2,
    Z = (z) => p2 + (z - L.z1) * k2;
  const E = o.estrada || S.estrada,
    C = S.corrego,
    dz = o.dz_bunker || 0;
  let t = `<svg viewBox="0 0 ${W2} ${H2}" role="img" aria-label="Implantação do lote, ${esc(o.nome)}">`;
  t += `<rect x="${X(L.x1)}" y="${Z(L.z1)}" width="${(L.x2 - L.x1) * k2}" height="${(L.z2 - L.z1) * k2}" class="lote"/>`;
  t += `<rect x="${X(E.x1)}" y="${Z(E.z1)}" width="${Math.max(1, (E.x2 - E.x1) * k2)}" height="${Math.max(1, (E.z2 - E.z1) * k2)}" class="estrada"/>`;
  t += `<rect x="${X(C.x1)}" y="${Z(L.z1)}" width="${(C.x2 - C.x1) * k2}" height="${(L.z2 - L.z1) * k2}" class="corrego"/>`;
  t += `<rect x="${X(bk.u)}" y="${Z(bk.v + dz)}" width="${bk.w * k2}" height="${bk.d * k2}" class="bunk"/>`;
  if (o.bloco)
    t += `<rect x="${X(o.bloco.x)}" y="${Z(o.bloco.z)}" width="${o.bloco.w * k2}" height="${o.bloco.d * k2}" class="bloco"/><text x="${X(o.bloco.x) + (o.bloco.w * k2) / 2}" y="${Z(o.bloco.z) + (o.bloco.d * k2) / 2}" class="tick" text-anchor="middle" dominant-baseline="middle">livre ${f(o.bloco.w)}×${f(o.bloco.d)}</text>`;
  if (cam) {
    const rede = new Set(cam.celulas),
      atal = new Set(cam.atalhos.flat()),
      mid = (c) => [X(cam.cx(c)), Z(cam.cz(c))];
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
    t += `<text x="${X(it.x) + (it.w * k2) / 2}" y="${Z(it.z) + (it.d * k2) / 2}" class="num" text-anchor="middle" dominant-baseline="middle">${NUM.get(it.id)}</text></g>`;
  }
  if (o.id.startsWith('espinha-'))
    t += `<circle cx="${X(L.x1)}" cy="${Z(0)}" r="6" class="gate"/><text x="${X(L.x1) + 9}" y="${Z(0) - 8}" class="tick">porteira</text>`;
  if (cam)
    for (const p of Object.values(cam.portas))
      if (p) t += `<circle cx="${X(p[0])}" cy="${Z(p[1])}" r="2.4" class="porta"/>`;
  return t + `</svg>`;
}
const refs = [
  'equilibrio',
  'espinha-total',
  'espinha-meio',
  'espinha-curta',
  'espinha-meio-bloco',
  'espinha-curta-bloco',
].map((id) => LJ.opcoes.find((o) => o.id === id));
const nomes2 = {
  equilibrio: 'Plano atual (Equilíbrio): estrada no meio',
  'espinha-total': '1 · Espinha até o córrego',
  'espinha-meio': '2 · Espinha até o meio (x 0)',
  'espinha-curta': '3 · Espinha curta (até x −20)',
  'espinha-meio-bloco': '4 · Espinha até o meio + bloco único',
  'espinha-curta-bloco': '5 · Espinha curta + bloco único (pista)',
};
const curto = (id) => (nomes2[id].split(' · ')[1] ? nomes2[id].split(' · ')[0] : 'Atual');
const met2 = refs.map((o) => {
  const m = conferirLote(
    { ...S, itens: o.itens, estrada: o.estrada || S.estrada, bloco: o.bloco },
    { ...bk, v: bk.v + (o.dz_bunker || 0) },
  );
  const cam = tracarCaminhos(S, o);
  const zmin = Math.min(...o.itens.map((i) => i.z)),
    zmax = Math.max(...o.itens.map((i) => i.z + i.d));
  return { o, m, cam, viagens: custoViagens(o.itens), fundos: zmin - L.z1, frente: L.z2 - zmax };
});
const cards2 = met2
  .map(
    ({ o, cam }) =>
      `<figure><figcaption>${esc(nomes2[o.id])}</figcaption>${lotePlanta(o, cam)}</figure>`,
  )
  .join('');
const linhas2 = [
  ['Viagens (menor é melhor)', (x) => f(Math.round(x.viagens))],
  ['Sombra no núcleo, inverno (h)', (x) => f(x.m.metricas.sombra.nucleo.toFixed(1))],
  ['Sombra nas quadras (h)', (x) => f(x.m.metricas.sombra.quadras.toFixed(1))],
  ['Animais–casa (m)', (x) => f(Math.round(x.m.metricas.dist.animaisCasa))],
  ['Viagem pela rede de caminhos (menor é melhor)', (x) => f(Math.round(x.cam.viagemRede))],
  ['Rede de caminhos fora da estrada (m)', (x) => f(x.cam.comprimento)],
  ['Atalhos', (x) => f(x.cam.atalhos.length)],
  ['Bloco livre único (m²)', (x) => (x.o.bloco ? f(x.o.bloco.w * x.o.bloco.d) : '—')],
  ['Folga em z: fundos / frente (m)', (x) => `${f(x.fundos)} / ${f(x.frente)}`],
  ['Passa na régua', (x) => (x.m.erros.length ? 'NÃO' : 'sim')],
]
  .map(([n, g]) => `<tr><td>${n}</td>${met2.map((x) => `<td>${g(x)}</td>`).join('')}</tr>`)
  .join('');
const tabela2 = `<table><thead><tr><th>Métrica</th>${met2.map((x) => `<th>${esc(curto(x.o.id))}</th>`).join('')}</tr></thead><tbody>${linhas2}</tbody></table>`;
const legenda2 = S.itens
  .map((i) => `<li>${NUM.get(i.id)} ${esc(S.nomes[i.id])} ${f(i.w)}×${f(i.d)}</li>`)
  .join('');

const html = `<title>Pranchas do Sítio Vale do Café</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* layout: duas pranchas técnicas em cartela, planta à esquerda e legenda à direita; no celular empilha */
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
body{background:var(--bg);color:var(--fg);font:14px/1.5 var(--font);padding-block:20px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:28px}
h1{font-size:22px;margin:0;text-wrap:balance}h2{font-size:16px;margin:0}
.sub1{color:var(--mut);margin:4px 0 0}
section{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:16px;display:flex;flex-direction:column;gap:12px}
.cols{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:16px;align-items:start}
@media (max-width:860px){.cols{grid-template-columns:minmax(0,1fr)}}
svg{width:100%;height:auto;display:block;background:var(--bg);border:1px solid var(--line)}
figure{margin:0;display:flex;flex-direction:column;gap:6px}figcaption{font-size:12.5px;font-weight:600}.grade2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px}.leg{display:flex;flex-wrap:wrap;gap:4px 14px;list-style:none;padding:0;margin:0;font-size:12px}svg.defs{width:0;height:0;border:0;position:absolute}
.tbl{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:12.5px}
th,td{text-align:left;padding:4px 8px;border-bottom:1px solid var(--line);vertical-align:top}
td:nth-child(n+3){white-space:nowrap}th{color:var(--mut);font-weight:600}
.chip{padding:1px 7px;border-radius:10px;font-size:11.5px;color:var(--fg)}
.room rect{stroke:var(--fg);stroke-width:1.2}.novo rect{stroke-dasharray:5 3}
.g-circ rect,.chip.g-circ{fill:var(--circ);background:var(--circ)}.g-priv rect,.chip.g-priv{fill:var(--priv);background:var(--priv)}
.g-conv rect,.chip.g-conv{fill:var(--conv);background:var(--conv)}.g-arm rect,.chip.g-arm{fill:var(--arm);background:var(--arm)}
.g-prod rect,.chip.g-prod{fill:var(--prod);background:var(--prod)}.g-tec rect,.chip.g-tec{fill:var(--tec);background:var(--tec)}
.novo rect{fill:var(--novo)}.escada rect{stroke:var(--bunk);stroke-width:2.4}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}.card{margin:0;display:flex;flex-direction:column;gap:6px;min-width:0}.card figcaption{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.card figcaption span{font:12px var(--mono);color:var(--mut)}
td.dif{font-weight:600;color:var(--acc)}td.nao{color:var(--mut)}.card .num{font-size:19px}.card .dim{font-size:12px}
.num{font:600 15px var(--font);fill:var(--fg)}.dim{font:500 11px var(--mono);fill:var(--fg)}.tick{font:11px var(--mono);fill:var(--mut)}
.hl{stroke:var(--line);stroke-width:1.5}.foot{stroke:var(--mut);stroke-dasharray:4 3;stroke-width:1}
.lote{fill:none;stroke:var(--fg);stroke-width:2}.estrada{fill:var(--road);opacity:.8}.corrego{fill:var(--creek);opacity:.85}
.bloco{fill:var(--arvore);opacity:.35;stroke:var(--fg);stroke-width:1.2;stroke-dasharray:6 4}.cam{stroke:#2f8f5b;stroke-width:8;stroke-linecap:round;fill:#2f8f5b;opacity:.75}.atalho{stroke:#d9822b;stroke-width:8;stroke-linecap:round;fill:#d9822b}.porta{fill:var(--fg)}.gate{fill:var(--fg);stroke:var(--bg);stroke-width:2}circle.cam,circle.atalho{stroke:none}
.bunk{fill:none;stroke:var(--bunk);stroke-width:2;stroke-dasharray:8 5}
.item rect{stroke:var(--fg);stroke-width:1.2}.t-predio rect{fill:var(--predio)}.t-lavoura rect{fill:var(--lavoura)}.t-arvore rect{fill:var(--arvore)}.t-escavacao rect{fill:var(--escav)}
.item rect.sub{fill:none;stroke:var(--fg);stroke-width:.8;stroke-dasharray:3 3}
ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px}.ask{border-left:3px solid var(--acc);padding-left:12px}
</style>
<main>
<header><h1>Pranchas do Sítio Vale do Café</h1><p class="sub1">Etapa B0, para aprovação do Mestre. Nenhum código de produção mudou; as plantas do bunker são resultado do solver, não escolha minha; as medidas vêm do Plano Mestre e um script confere somas, sobreposições e margens.</p></header>
<section><h2>Prancha 1 · Opções de encaixe do bunker, cota −10 m (pé-direito 3 m)</h2>
${defs}
<p class="sub1">Três plantas geradas pelo solver, uma por margem de medida (exato, ±1 m, ±2,5 m). O Mestre escolheu a de ±2,5 m em 14/11 (★). O mesmo número é o mesmo ambiente em todas. Todas passam na régua: sem sobreposição, acesso em até 2 saltos, escotilha fora da Casa Grande. Célula destacada = medida diferente da nominal.</p>
<div class="cards">${cards}</div>
<div class="tbl"><table><thead><tr><th>Medida</th>${heads}</tr></thead><tbody>${medRows}</tbody></table></div>
<div class="tbl"><table><thead><tr><th>Nº</th><th>Ambiente</th><th>Grupo</th><th>Nominal</th>${heads}</tr></thead><tbody>${rows1}</tbody></table></div>
<ul><li><b>Escada de emergência:</b> escada de marinheiro vertical, num poço de 2×2 m até uma escotilha no terreno (nº ${num.get('escada')}). Fica fora da Casa Grande (10 m) e dos itens do lote, a pelo menos 15 m do monta-carga. O acesso principal é o monta-carga.</li>
<li><b>Ramal de serviço (novo, a aprovar), nº ${num.get('ramal')}, tracejado:</b> liga a hidroponia e a água à galeria. Na opção ±2,5 m ele some, porque não é mais preciso.</li>
<li><b>Ruído:</b> nas opções com margem, máquinas ficam coladas em quartos. Decisão do Mestre: resolver com isolamento termoacústico (lã de rocha, cancelamento ativo), então a distância não é critério.</li>
<li><b>Sala de baterias</b> (nº ${num.get('baterias')}): 10×10 provisório até a etapa de energia.</li>
<li>Pegada hachurada atrás das salas = vazio. A opção exata deixa ${f(mE.vazio)} m² vazios; ±1 m deixa ${f(m1.vazio)} m²; ±2,5 m deixa ${f(m2o.vazio)} m².</li></ul></section>
<section><h2>Prancha 2 · Lote 100×150 m: cinco opções com a espinha de peixe saindo da porteira (leste)</h2>
<div class="grade2">${cards2}</div>
<div class="tbl">${tabela2}</div>
<ul class="leg">${legenda2}</ul>
<ul><li>Cinza-azulado = projeção do bunker 48×32 (subterrâneo). Faixa escura = estrada de 5 m (a espinha). Faixa azul = córrego, nos fundos (oeste, à direita). O leste fica à esquerda: a porteira (círculo escuro na divisa) está no centro dessa borda, x −50, z 0. x cresce para a direita e z para baixo.</li>
<li><b>Espinha:</b> sai da porteira e vai para o oeste; os ramos verdes de 2 m saem dela até a porta de cada item (círculo preto). Linhas laranja = atalhos nos pares de maior viagem.</li>
<li><b>O que aprendi:</b> uma espinha que cruza o lote inteiro (opção 1) parte a gleba em duas metades de 72 m e as viagens pioram uns 23%. Quanto mais curta a espinha, melhor: a opção 3 empata com o plano atual (1067 contra 1062) e, andando pela rede de caminhos, a opção 2 é a melhor de todas (961).</li>
<li><b>Bloco livre único:</b> opção 4 com 1.000 m² (20×50) e opção 5 com 1.400 m² (20×70, cabe uma oval de pista de uns 180 m, curvas de 10 m de raio). Ambos ficam no lado da porteira, colados na divisa leste, onde dá para crescer.</li>
<li>Os pesos das viagens e as alturas dos itens são estimativas minhas. Cheiro, fumaça e ruído ainda não entram na régua.</li>
<li><b>Ainda não está no plano:</b> o plano segue com o Equilíbrio até o senhor escolher.</li>
<li>Terra da escavação (~6.000 m³): o Mestre disse tanto faz (descartar ou morro oco com torre).</li>
</ul></section>
<section class="ask"><h2>O que preciso do Mestre</h2><ul><li>Escolher uma das opções 1 a 5 ou manter o plano atual com a estrada no meio. O bunker ±2,5 m e o lote Equilíbrio já estão aprovados.</li></ul></section>
</main>`;
fs.writeFileSync('plan/pranchas.html', html);
console.log('ok', html.length);
