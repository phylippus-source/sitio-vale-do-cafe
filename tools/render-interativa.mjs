// Gera plan/interativa.html: a página do arranjo manual do lote (dados + régua embutidos).
import fs from 'node:fs';
import { montarBundle } from './build-web.mjs';
import { sobreMedidas } from './avaliar-arranjo.mjs';

const lerJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const S = lerJson('plan/site.json');
const B = lerJson('plan/bunker.json');
const esc = lerJson('plan/bunker-opcoes.json');
const lote = lerJson('plan/lote-opcoes.json');
const pg = esc.opcoes.find((o) => o.id === esc.escolhida).pegada;
const nomes = {
  'espinha-total': '1 · Espinha até o córrego',
  'espinha-meio': '2 · Espinha até o meio',
  'espinha-curta': '3 · Espinha curta',
  'espinha-meio-bloco': '4 · Espinha até o meio + bloco único',
  'espinha-curta-bloco': '5 · Espinha curta + bloco único (pista)',
};
// arranjos (plan/arranjos): o do Mestre e os regerados pelo solver a partir dele, com bunker próprio
// (os de 18/11 saíram da página: não passam mais na régua de 22/11, folga 0 m e córrego a 4 m)
const arr = (id, nome, f) => {
  const a = lerJson(`plan/arranjos/${f}`);
  return {
    id,
    nome,
    itens: a.itens.map((i) => ({
      ...i,
      giro:
        i.w !== (a.medidas_alteradas?.[i.id]?.[0] ?? S.itens.find((x) => x.id === i.id).w) ? 1 : 0,
    })),
    estrada: a.estrada,
    sobre: sobreMedidas(S, a),
    bunker: { x0: a.bunker.x, z0: a.bunker.z, w: a.bunker.w, d: a.bunker.d, giro: 1 },
    bloco: a.bloco,
  };
};
const opcoes = [
  arr(
    'mestre-22-11',
    'M · Seu arranjo de 22/11, encaixado (silvicultura encolhida para 20×27,5)',
    'mestre-22-11-ajustado.json',
  ),
  arr(
    'solver-viagens',
    'S1 · Solver a partir do seu arranjo: menos viagens e sombra',
    'mestre-22-11-solver-viagens.json',
  ),
  arr(
    'solver-vazio',
    'S2 · Solver a partir do seu arranjo: maior espaço livre',
    'mestre-22-11-solver-vazio.json',
  ),
  {
    id: 'plano',
    nome: 'Plano atual (Equilíbrio, estrada no meio)',
    itens: S.itens,
    estrada: S.estrada,
  },
  ...lote.opcoes
    .filter((o) => nomes[o.id])
    .map((o) => ({
      id: o.id,
      nome: nomes[o.id],
      itens: o.itens,
      estrada: o.estrada,
      bloco: o.bloco,
    })),
];
const dados = {
  S,
  bunker: { x0: B.mundo.x0, z0: B.mundo.z0, w: pg.w, d: pg.d, dc: B.mundo.distancia_corrego },
  opcoes,
};
const json = JSON.stringify(dados).replace(/</g, '\\u003c');

const css = fs.readFileSync(new URL('./interativa.css', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('./interativa-page.js', import.meta.url), 'utf8');
const html = `<title>Arranjo do Lote</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap">
<style>${css}</style>
<main>
<header><h1>Arranjo do lote</h1>
<p class="sub">Arraste os itens pelo lote de 100×150 m. Grade invisível de 5 m, ímã nas bordas (folga de 2 m), girar 90° no sentido horário. Tudo é livre, inclusive o bunker (roxo, tracejado, botão B), solto da casa: se a casa sair de cima dele, a régua só avisa. O leste está à esquerda, o córrego (azul) à direita, a porteira no centro da divisa leste.</p></header>
<div class="cols">
<div class="planta"><svg id="mapa" viewBox="-52 -77 104 154" role="group" aria-label="Planta do lote"></svg></div>
<aside>
<label for="opcao">Ponto de partida</label>
<select id="opcao"></select>
<div class="botoes">
<button type="button" id="girar">Girar 90° (R)</button>
<button type="button" id="desf">Desfazer</button>
<button type="button" id="ref">Refazer</button>
<button type="button" id="reiniciar">Recomeçar</button>
</div>
<label class="chk"><input type="checkbox" id="ima" checked> Ímã nas bordas (segure Alt para soltar)</label>
<p id="info" class="info" aria-live="polite"></p>
<p id="status" class="ok" aria-live="polite"></p>
<ol id="lista" class="lista"></ol>
<details><summary>Problemas da régua</summary><ul id="problemas"></ul></details>
<p class="dica">Setas movem 5 m (Shift: 0,5 m). Ctrl+Z desfaz, Ctrl+Y refaz.</p>
</aside>
</div>
</main>
<script>${montarBundle()}</script>
<script>const DADOS = ${json};</script>
<script>${page}</script>
`;
fs.writeFileSync('plan/interativa.html', html);
console.log(`plan/interativa.html (${Math.round(html.length / 1024)} KB)`);
