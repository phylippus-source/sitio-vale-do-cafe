# Sítio Vale do Café — refatoração

Fase 0 (rede de segurança) e Fase 1 (dependências e estrutura) concluídas. `legacy/sitio-vale-do-cafe.raw.html` é a cópia do v13 publicado.

## Estrutura
- `index.html` — marcação (sem JS/CSS inline)
- `styles/` — `main.css` importa tokens, base, hud, panel, drawer, firstperson (ordem original)
- `src/main.js` — lógica legada (ainda monolítica; Fases 2–8)
- `vite.config.js` — Vite + singlefile; `npm run build` (minificado, `dist/`), `npm run build:debug` (`dist-debug/`, usado nos testes)
- three.js 0.128.0 vem do npm e é embutido (sem CDN)

## Comandos
- `npm test` — builda (produção, minificado) e roda metrics + coplanar + fp + interact + golden + smoke
- `npm run lint` / `npm run format` — ESLint (no-var, prefer-const, no-undef, no-unused-vars, max-lines-per-function) e Prettier (100 colunas)
- `npm run golden:update` — regrava capturas de referência (só após mudança visual aprovada)
- `node tests/metrics.js --update` / `node tests/coplanar.js --update` — regrava baselines
- `--target=caminho.html` em qualquer teste roda contra outro arquivo

## Pré-requisito
Playwright global 1.63.0 (`export NODE_PATH=/home/claude/.npm-global/lib/node_modules`), Chromium swiftshader.

## Problemas conhecidos (a corrigir em fase própria)
- 2 batches com vértices NaN (324 + 576 vértices) → 3 avisos `computeBoundingSphere` no console. Baseline tolera 3.
- Detector coplanar: 31.678 pares na baseline (≈29.952 são do NaN). Regra: não aumentar.


## Mudanças de código na Fase 1 (únicas)
- `src/main.js`: removida a guarda `if (!window.THREE)` (three agora é import); `THREE` exposto em `__sitio` para os testes.

## Fase 2 (feito)
- `var` → `const/let` (0 `var` restantes), uma declaração por linha, Prettier em tudo (5.9 mil linhas formatadas).
- Código morto removido: `bunkerCeil`, `rnd`, `TM`, `shower`, `wheel`, `GROUND`, `pulse`, `CH`, `casaUpY`, `CWD`, `bunkU`, variáveis sem uso. `catch {}` vazios ganharam comentário.
- Bug latente corrigido: laço `for (i=...)` que vazava `i`; variáveis de laço `fp`/`hb` redeclaradas (agora `let`, `fenceX/fenceZ`).
- Ganchos de teste (`window.__sitio`) só existem com `?debug` na URL. Testes rodam no build de produção.
- Pendente (fases 6–7): 3 funções acima de 80 linhas (`wall`, um IIFE do engenho/bunker, `frame`); `let i;` hoisted usados por laços sem escopo próprio.
