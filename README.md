# Sítio Vale do Café — refatoração

Fase 0 (rede de segurança) e Fase 1 (dependências e estrutura) concluídas. `legacy/sitio-vale-do-cafe.raw.html` é a cópia do v13 publicado.

## Estrutura
- `index.html` — marcação (sem JS/CSS inline)
- `styles/` — `main.css` importa tokens, base, hud, panel, drawer, firstperson (ordem original)
- `src/main.js` — lógica legada (ainda monolítica; Fases 2–8)
- `vite.config.js` — Vite + singlefile; `npm run build` (minificado, `dist/`), `npm run build:debug` (`dist-debug/`, usado nos testes)
- three.js 0.128.0 vem do npm e é embutido (sem CDN)

## Comandos
- `npm test` — builda e roda metrics + coplanar + fp + golden + smoke (falha se algo mudar)
- `npm run golden:update` — regrava capturas de referência (só após mudança visual aprovada)
- `node tests/metrics.js --update` / `node tests/coplanar.js --update` — regrava baselines
- `--target=caminho.html` em qualquer teste roda contra outro arquivo

## Pré-requisito
Playwright global 1.63.0 (`export NODE_PATH=/home/claude/.npm-global/lib/node_modules`), Chromium swiftshader.

## Problemas conhecidos (a corrigir em fase própria)
- 2 batches com vértices NaN (324 + 576 vértices) → 3 avisos `computeBoundingSphere` no console. Baseline tolera 3.
- Detector coplanar: 31.678 pares na baseline (≈29.952 são do NaN). Regra: não aumentar.
- Hook `window.__sitio` já vai no arquivo de produção (remover na Fase 2).

## Mudanças de código na Fase 1 (únicas)
- `src/main.js`: removida a guarda `if (!window.THREE)` (three agora é import); `THREE` exposto em `__sitio` para os testes.
