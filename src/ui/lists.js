/* Botões de setor (grade e fitas) e tabela da lista de materiais. */
import { SECTORS } from '../data/sectors.js';
import { BOM } from '../data/bom.js';
import { $ } from '../app/page.js';
import { focusOn } from './camera.js';

/* ================= DADOS ================= */

/* ================= UI: dados ================= */
const gridEl = $('#sector-grid'),
  chipsEl = $('#chips');
SECTORS.forEach(function (s) {
  [gridEl, chipsEl].forEach(function (host) {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = s.n;
    b.dataset.sector = s.k;
    b.setAttribute('aria-pressed', s.k === 'overview' ? 'true' : 'false');
    b.addEventListener('click', function () {
      focusOn(s.k);
    });
    host.appendChild(b);
  });
});
(function () {
  const host = $('#bom-body');
  BOM.forEach(function (c) {
    const d = document.createElement('section');
    d.className = 'cat';
    const h = document.createElement('h4');
    h.textContent = c.t;
    const sp = document.createElement('span');
    sp.textContent = c.tag;
    h.appendChild(sp);
    const ul = document.createElement('ul');
    c.items.forEach(function (it) {
      const li = document.createElement('li');
      const b = document.createElement('b');
      b.textContent = it[0] + ': ';
      li.appendChild(b);
      li.appendChild(document.createTextNode(it[1]));
      ul.appendChild(li);
    });
    d.appendChild(h);
    d.appendChild(ul);
    host.appendChild(d);
  });
})();
