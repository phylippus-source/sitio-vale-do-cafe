// Página interativa do lote: arrastar, grade de 5 m, ímã, girar 90°, setas, desfazer. Usa LoteWeb (régua) e DADOS (dados do projeto).
(() => {
  const { S, bunker, opcoes } = DADOS;
  const NS = 'http://www.w3.org/2000/svg';
  const L = S.lote;
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs = {}, ...filhos) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    for (const f of filhos) n.append(f);
    return n;
  };
  const html = (tag, attrs = {}, ...filhos) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    n.append(...filhos);
    return n;
  };
  const f = (n) => String(Math.round(n * 100) / 100).replace('.', ',');

  let itens = [],
    estrada = S.estrada,
    bloco = null,
    sel = null,
    hist = [],
    fut = [],
    arrasto = null;
  const mapa = $('mapa');

  const foto = () => JSON.stringify({ itens, estrada, bloco });
  const restaura = (s) => ({ itens, estrada, bloco } = JSON.parse(s));
  const empilha = (antes) => {
    hist.push(antes);
    fut = [];
  };

  function carregar(id) {
    const o = opcoes.find((x) => x.id === id);
    itens = JSON.parse(JSON.stringify(o.itens)).map((i) => ({ giro: 0, ...i }));
    estrada = o.estrada || S.estrada;
    bloco = o.bloco || null;
    sel = null;
    hist = [];
    fut = [];
    desenhar();
  }

  // só a régua (a rede de caminhos fica de fora: é cara e esta página ainda não a desenha)
  const avaliacao = () =>
    LoteWeb.conferirLote(
      { ...S, itens, estrada, bloco },
      { u: bunker.x0, v: bunker.z0, w: bunker.w, d: bunker.d },
    );
  let ultima = { erros: [] };
  const grupos = new Map();

  function desenhar() {
    mapa.replaceChildren();
    const ava = (ultima = avaliacao());
    grupos.clear();
    mapa.append(
      el('rect', { x: L.x1, y: L.z1, width: L.x2 - L.x1, height: L.z2 - L.z1, class: 'lote' }),
      el('rect', {
        x: S.corrego.x1,
        y: L.z1,
        width: S.corrego.x2 - S.corrego.x1,
        height: L.z2 - L.z1,
        class: 'corrego',
      }),
      el('rect', {
        x: estrada.x1,
        y: estrada.z1,
        width: estrada.x2 - estrada.x1,
        height: estrada.z2 - estrada.z1,
        class: 'estrada',
      }),
      el('rect', { x: bunker.x0, y: bunker.z0, width: bunker.w, height: bunker.d, class: 'bunk' }),
    );
    const grade = el('g', { id: 'grade', class: 'grade' });
    for (let x = L.x1; x <= L.x2; x += 5)
      grade.append(el('line', { x1: x, y1: L.z1, x2: x, y2: L.z2 }));
    for (let z = L.z1; z <= L.z2; z += 5)
      grade.append(el('line', { x1: L.x1, y1: z, x2: L.x2, y2: z }));
    mapa.append(grade);
    if (bloco)
      mapa.append(
        el('rect', { x: bloco.x, y: bloco.z, width: bloco.w, height: bloco.d, class: 'bloco' }),
      );
    itens.forEach((it, n) => {
      const ruim = ava.erros.some((e) => new RegExp(`\\b${it.id}\\b`).test(e));
      const g = el('g', {
        class: `item t-${it.tipo}${it.fixo ? ' fixo' : ''}${sel === it.id ? ' sel' : ''}${ruim ? ' ruim' : ''}`,
        'data-id': it.id,
        tabindex: '0',
        role: 'button',
        'aria-label': `${it.id}${it.fixo ? ', fixo' : ''}, ${f(it.w)} por ${f(it.d)} metros`,
      });
      g.append(
        el('rect', { x: it.x, y: it.z, width: it.w, height: it.d }),
        Object.assign(
          el('text', {
            x: it.x + it.w / 2,
            y: it.z + it.d / 2 - 0.4,
            class: 'num',
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
          }),
          { textContent: n + 1 },
        ),
        Object.assign(
          el('text', {
            x: it.x + it.w / 2,
            y: it.z + it.d / 2 + 2.6,
            class: 'dim',
            'text-anchor': 'middle',
          }),
          { textContent: `${f(it.w)}×${f(it.d)}` },
        ),
      );
      if (!it.fixo) {
        const cx = it.x + it.w / 2,
          cz = it.z + it.d / 2 - 5.2;
        g.append(
          el('path', {
            d: `M${cx} ${cz - 1.2} l1 2 h-2 z`,
            class: 'seta',
            transform: `rotate(${(it.giro || 0) * 90} ${cx} ${it.z + it.d / 2})`,
          }),
        );
      }
      grupos.set(it.id, g);
      mapa.append(g);
    });

    mapa.append(
      el('circle', { cx: L.x1, cy: 0, r: 1.6, class: 'gate' }),
      Object.assign(el('text', { x: L.x1 + 2.4, y: -2.4, class: 'tick' }), {
        textContent: 'porteira',
      }),
    );
    painel(ava);
  }

  // move só o grupo do item (durante o arrasto): sem refazer a planta nem rodar a régua
  function posicionar(g, it) {
    const [r, n, d, seta] = g.children;
    const cx = it.x + it.w / 2,
      cz = it.z + it.d / 2;
    r.setAttribute('x', it.x);
    r.setAttribute('y', it.z);
    n.setAttribute('x', cx);
    n.setAttribute('y', cz - 0.4);
    d.setAttribute('x', cx);
    d.setAttribute('y', cz + 2.6);
    if (seta) {
      seta.setAttribute('d', `M${cx} ${cz - 6.4} l1 2 h-2 z`);
      seta.setAttribute('transform', `rotate(${(it.giro || 0) * 90} ${cx} ${cz})`);
    }
  }
  // seleciona sem destruir a planta (o dedo continua sobre o mesmo elemento)
  function selecionar(id) {
    sel = id;
    for (const [k, g] of grupos) g.classList.toggle('sel', k === id);
    painel(ultima);
  }

  function painel(ava) {
    const lista = $('lista');
    lista.replaceChildren(
      ...itens.map((it, n) => {
        const b = html(
          'button',
          { type: 'button', class: `liga${sel === it.id ? ' sel' : ''}`, 'data-id': it.id },
          `${n + 1} ${it.id}${it.fixo ? ' (fixo)' : ''}`,
        );
        return html('li', {}, b);
      }),
    );
    const it = itens.find((i) => i.id === sel);
    $('info').textContent = it
      ? `${it.id}: x ${f(it.x)} · z ${f(it.z)} · ${f(it.w)}×${f(it.d)} m${it.fixo ? ' · fixo' : ''}`
      : 'Clique num item para selecionar.';
    $('girar').disabled = !it || !!it.fixo;
    $('desf').disabled = !hist.length;
    $('ref').disabled = !fut.length;
    $('status').textContent = ava.erros.length
      ? `${ava.erros.length} problema(s) na régua`
      : 'Régua sem problemas';
    $('status').className = ava.erros.length ? 'ruim' : 'ok';
    $('problemas').replaceChildren(...ava.erros.map((e) => html('li', {}, e)));
  }

  const pt = (e) => {
    const p = mapa.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(mapa.getScreenCTM().inverse());
  };
  const achar = (alvo) => alvo.closest && alvo.closest('.item');
  const get = (id) => itens.find((i) => i.id === id);
  const outros = (id) => itens.filter((i) => i.id !== id);

  mapa.addEventListener('pointerdown', (e) => {
    const g = achar(e.target);
    if (!g) return;
    selecionar(g.dataset.id);
    const it = get(sel);
    if (!it.fixo) {
      const p = pt(e);
      arrasto = { id: sel, dx: p.x - it.x, dz: p.y - it.z, antes: foto(), moveu: false };
      mapa.setPointerCapture(e.pointerId);
      $('grade').classList.add('ligada');
    }
  });
  let quadro = 0,
    ultimoEv = null;
  const mexer = () => {
    quadro = 0;
    if (!arrasto || !ultimoEv) return;
    const e = ultimoEv,
      it = get(arrasto.id),
      p = pt(e);
    const pos = LoteWeb.encaixar(
      it,
      p.x - arrasto.dx,
      p.y - arrasto.dz,
      S,
      outros(it.id),
      estrada,
      {
        ima: $('ima').checked && !e.altKey,
      },
    );
    if (pos.x === it.x && pos.z === it.z) return;
    Object.assign(it, pos);
    arrasto.moveu = true;
    posicionar(grupos.get(it.id), it);
    $('info').textContent = `${it.id}: x ${f(it.x)} · z ${f(it.z)} · ${f(it.w)}×${f(it.d)} m`;
  };
  mapa.addEventListener('pointermove', (e) => {
    if (!arrasto) return;
    ultimoEv = e;
    if (!quadro) quadro = requestAnimationFrame(mexer); // no máximo uma atualização por quadro
  });
  // celular: sem isto o Chrome rola a página junto com o dedo e cancela o arrasto
  mapa.addEventListener(
    'touchstart',
    (e) => {
      const g = achar(e.target);
      if (g && !get(g.dataset.id).fixo) e.preventDefault();
    },
    { passive: false },
  );
  mapa.addEventListener(
    'touchmove',
    (e) => {
      if (arrasto) e.preventDefault();
    },
    { passive: false },
  );
  const solta = () => {
    if (!arrasto) return;
    if (quadro) {
      cancelAnimationFrame(quadro);
      mexer();
    }
    if (arrasto.moveu) empilha(arrasto.antes);
    arrasto = null;
    $('grade').classList.remove('ligada');
    desenhar();
  };
  mapa.addEventListener('pointerup', solta);
  mapa.addEventListener('pointercancel', solta);

  function mover(dx, dz) {
    const it = get(sel);
    if (!it || it.fixo) return;
    const antes = foto();
    const pos = LoteWeb.encaixar(it, it.x + dx, it.z + dz, S, outros(it.id), estrada, {
      ima: false,
    });
    if (pos.x === it.x && pos.z === it.z) return;
    Object.assign(it, pos);
    empilha(antes);
    desenhar();
  }
  function girar() {
    const it = get(sel);
    if (!it || it.fixo) return;
    const antes = foto();
    const g = LoteWeb.girar(it);
    Object.assign(
      it,
      g,
      LoteWeb.encaixar(g, g.x, g.z, S, outros(it.id), estrada, { ima: $('ima').checked }),
    );
    empilha(antes);
    desenhar();
  }
  function desfazer() {
    if (!hist.length) return;
    fut.push(foto());
    restaura(hist.pop());
    desenhar();
  }
  function refazer() {
    if (!fut.length) return;
    hist.push(foto());
    restaura(fut.pop());
    desenhar();
  }

  $('girar').addEventListener('click', girar);
  $('desf').addEventListener('click', desfazer);
  $('ref').addEventListener('click', refazer);
  $('reiniciar').addEventListener('click', () => carregar($('opcao').value));
  $('opcao').addEventListener('change', () => carregar($('opcao').value));
  $('lista').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) {
      sel = b.dataset.id;
      desenhar();
    }
  });
  mapa.addEventListener('keydown', (e) => {
    const g = achar(e.target);
    if (g && (e.key === 'Enter' || e.key === ' ')) {
      sel = g.dataset.id;
      desenhar();
      e.preventDefault();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    const passo = e.shiftKey ? 0.5 : 5;
    const setas = {
      ArrowLeft: [-passo, 0],
      ArrowRight: [passo, 0],
      ArrowUp: [0, -passo],
      ArrowDown: [0, passo],
    };
    if (setas[e.key] && sel) {
      mover(...setas[e.key]);
      e.preventDefault();
    } else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) girar();
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.shiftKey ? refazer() : desfazer();
      e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      refazer();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      sel = null;
      desenhar();
    }
  });

  for (const o of opcoes) $('opcao').append(html('option', { value: o.id }, o.nome));
  carregar(opcoes[0].id);
  window.__lote = { get: () => ({ itens, estrada, bloco, sel }) }; // para os testes de navegador
})();
