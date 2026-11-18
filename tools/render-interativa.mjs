// Gera plan/interativa.html: a página do arranjo manual do lote (dados + régua embutidos).
import fs from 'node:fs';
import { montarBundle } from './build-web.mjs';

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
// arranjos do Mestre (plan/arranjos): o esboço dele e as correções da régua, com bunker próprio
const arr = (id, nome, f) => {
  const a = lerJson(`plan/arranjos/${f}`);
  return {
    id,
    nome,
    itens: a.itens.map((i) => ({
      ...i,
      giro: i.w !== S.itens.find((x) => x.id === i.id).w ? 1 : 0,
    })),
    estrada: a.estrada,
    bunker: { x0: a.bunker.x, z0: a.bunker.z, w: a.bunker.w, d: a.bunker.d, giro: 1 },
  };
};
const opcoes = [
  arr(
    'corrigido-a',
    'A · Seu esboço corrigido (mínimo de mudanças)',
    'mestre-18-11-corrigido.json',
  ),
  arr(
    'corrigido-b',
    'B · Corrigido + engenho ao sul (mais vazio)',
    'mestre-18-11-corrigido-vazio.json',
  ),
  arr('esboco', 'Seu esboço original (com erros)', 'mestre-18-11.json'),
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
const dados = { S, bunker: { x0: B.mundo.x0, z0: B.mundo.z0, w: pg.w, d: pg.d }, opcoes };
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
