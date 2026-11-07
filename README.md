# Sítio Vale do Café — refatoração

Fase 0 (rede de segurança) concluída. Código do sítio **intocado**: `legacy/sitio-vale-do-cafe.raw.html` é a cópia do v13 publicado.

## Comandos
- `npm test` — metrics + coplanar + fp + golden (falha se algo mudar)
- `npm run golden:update` — regrava capturas de referência (só após mudança visual aprovada)
- `node tests/metrics.js --update` / `node tests/coplanar.js --update` — regrava baselines
- `--target=caminho.html` em qualquer teste roda contra outro arquivo

## Pré-requisito
Playwright global 1.63.0 (`export NODE_PATH=/home/claude/.npm-global/lib/node_modules`), Chromium swiftshader.

## Problemas conhecidos (a corrigir em fase própria)
- 2 batches com vértices NaN (324 + 576 vértices) → 3 avisos `computeBoundingSphere` no console. Baseline tolera 3.
- Detector coplanar: 31.678 pares na baseline (≈29.952 são do NaN). Regra: não aumentar.
- Hook `window.__sitio` já vai no arquivo de produção (remover na Fase 2).
