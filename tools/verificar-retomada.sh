#!/usr/bin/env bash
# Conferência de retomada numa janela nova: o ambiente serve para continuar o projeto?
# Só lê; com --instalar instala o que faltar (npm ci, venv do solver). Depois leia o LEIA-ME-RETOMADA.md.
#   bash tools/verificar-retomada.sh [--instalar]
set -u
cd "$(dirname "$0")/.."
export TZ=America/Sao_Paulo
INSTALAR=0; [ "${1:-}" = "--instalar" ] && INSTALAR=1
FALHAS=0
ok() { printf '  ✔ %s\n' "$*"; }
falta() { printf '  ✘ %s\n' "$*"; FALHAS=$((FALHAS + 1)); }

echo "== repositório"
git log -1 --format='  último commit: %h  %s' | cut -c1-160
[ -z "$(git status --short)" ] && ok "árvore limpa" || falta "há alterações não commitadas (git status)"

echo "== cronômetro e contador de tokens"
if [ ! -f logs/estado.txt ] && [ -d plan/retomada-logs ]; then
  mkdir -p logs && cp plan/retomada-logs/* logs/ && ok "logs restaurados de plan/retomada-logs (passo, cota de tokens)"
fi
[ -f logs/estado.txt ] && ok "cronômetro: $(cat logs/estado.txt) (etapa início fim passos pausa)" || falta "sem logs/estado.txt (abra a etapa: bash tools/passo.sh --inicio B0)"
[ -f logs/janela-inicio.txt ] && ok "janela de tokens ancorada em $(cat logs/janela-inicio.txt)" || falta "janela de 5 h sem âncora: python3 tools/tokens.py --inicio HH:MM (hora da 1ª mensagem desta janela)"
python3 tools/tokens.py --linha | sed 's/^/    /'

echo "== node, navegador e testes"
node -v >/dev/null 2>&1 && ok "node $(node -v), npm $(npm -v)" || falta "node ausente"
if [ -d node_modules ]; then ok "node_modules presente"; else
  falta "node_modules ausente (rode: npm ci)"
  if [ "$INSTALAR" = 1 ] && npm ci --no-audit --no-fund >/dev/null 2>&1; then ok "npm ci feito"; FALHAS=$((FALHAS - 1)); fi
fi
export NODE_PATH="$(npm root -g 2>/dev/null)"
node -e "require('playwright').chromium.launch().then(b=>b.close())" 2>/dev/null && ok "playwright abre o chromium" || falta "playwright/chromium não abrem (NODE_PATH=$NODE_PATH, PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-vazio})"

echo "== solver (python + ortools)"
VENV="${VENV_SITIO:-$HOME/venv-sitio}"
if python3 -c 'import ortools' 2>/dev/null; then ok "ortools no python3 (use: python3 -I tools/pack-lote.py ...)"
elif [ -x "$VENV/bin/python" ] && "$VENV/bin/python" -c 'import ortools' 2>/dev/null; then ok "ortools em $VENV (use: $VENV/bin/python -I tools/pack-lote.py ...)"
else
  falta "ortools ausente: python3 -m venv $VENV && $VENV/bin/pip install -r tools/requirements-solver.txt"
  if [ "$INSTALAR" = 1 ] && python3 -m venv "$VENV" && "$VENV/bin/pip" install -q -r tools/requirements-solver.txt; then ok "venv criado em $VENV"; FALHAS=$((FALHAS - 1)); fi
fi

echo "== réguas do projeto"
node tools/layout-check.mjs 2>&1 | tail -1 | grep -q 'layout: OK' && ok "layout: OK (réguas do bunker e do lote)" || falta "layout-check falhou (rode: node tools/layout-check.mjs)"

echo "== últimos passos"
bash tools/passo.sh --resumo 2>/dev/null | tail -3 | sed 's/^/    /'
echo
if [ "$FALHAS" = 0 ]; then echo 'TUDO PRONTO. Leia LEIA-ME-RETOMADA.md, avise o Mestre e espere o "segue".'
else echo "$FALHAS pendência(s) acima. Resolva (ou rode com --instalar) e confira de novo."; fi
