/* Painel e gavetas (lista de materiais e Aura): a maquete se reenquadra no espaço que sobra. */
import { AURA } from '../data/aura.js';
import { $ } from '../app/page.js';

/* painel e gavetas: a maquete se reenquadra no espaço que sobra */
export const panelEl = $('#panel');
const mobileQ = window.matchMedia('(max-width:899px)');
let openDrawer = null;
export function syncBody() {
  const panelOpen = panelEl.classList.contains('open');
  document.body.classList.toggle('sheet-open', mobileQ.matches && (panelOpen || !!openDrawer));
  document.body.classList.toggle('drawer-open', !!openDrawer);
  $('#d-panel').setAttribute('aria-expanded', String(panelOpen));
  $('#d-bom').setAttribute('aria-pressed', String(openDrawer === 'bom'));
  $('#d-aura').setAttribute('aria-pressed', String(openDrawer === 'aura'));
}
export function setDrawer(id) {
  ['bom', 'aura'].forEach(function (k) {
    $('#' + k).hidden = k !== id;
  });
  openDrawer = id || null;
  if (id && mobileQ.matches) panelEl.classList.remove('open');
  syncBody();
}
$('#d-panel').addEventListener('click', function () {
  const willOpen = !panelEl.classList.contains('open');
  if (willOpen) setDrawer(null);
  panelEl.classList.toggle('open', willOpen);
  syncBody();
});
['#b-bom', '#d-bom'].forEach(function (s) {
  $(s).addEventListener('click', function () {
    setDrawer(openDrawer === 'bom' ? null : 'bom');
  });
});
['#b-aura', '#d-aura'].forEach(function (s) {
  $(s).addEventListener('click', function () {
    setDrawer(openDrawer === 'aura' ? null : 'aura');
  });
});
document.querySelectorAll('[data-close]').forEach(function (b) {
  b.addEventListener('click', function () {
    setDrawer(null);
  });
});
if (mobileQ.addEventListener) mobileQ.addEventListener('change', syncBody);
else if (mobileQ.addListener) mobileQ.addListener(syncBody);
document.querySelectorAll('[data-ask]').forEach(function (b) {
  b.addEventListener('click', function () {
    const log = $('#aura-log'),
      d = document.createElement('div');
    d.className = 'msg';
    const h = document.createElement('b');
    h.textContent = 'Aura · relatório';
    d.appendChild(h);
    d.appendChild(document.createTextNode(AURA[b.dataset.ask]));
    log.appendChild(d);
    const body = log.parentElement;
    body.scrollTop = body.scrollHeight;
  });
});
