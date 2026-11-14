#!/usr/bin/env bash
# Cronometro de passos: cada passo concluido recebe hora (Sao Paulo), duracao desde o passo anterior,
# numero do passo e tempo acumulado da etapa. Estado e log ficam em logs/ (ignorado pelo git).
#   tools/passo.sh --inicio T1d        abre a etapa e zera o cronometro
#   tools/passo.sh "o que terminou"    registra um passo concluido
#   tools/passo.sh --retomar           volta de uma pausa (limite de tokens, espera pelo "segue"):
#                                      o intervalo desde o ultimo carimbo NAO conta no tempo
#   tools/passo.sh --resumo            lista os passos da etapa em curso, com total
set -eu
export TZ=America/Sao_Paulo
DIR="$(cd "$(dirname "$0")/.." && pwd)/logs"
mkdir -p "$DIR"
STATE="$DIR/estado.txt" # etapa epoch_inicio epoch_ultimo contagem segundos_de_pausa

fmt() { # segundos -> 1h02m, 3m07s ou 9s
  local s=$1
  if [ "$s" -ge 3600 ]; then printf '%dh%02dm' $((s / 3600)) $((s % 3600 / 60))
  elif [ "$s" -ge 60 ]; then printf '%dm%02ds' $((s / 60)) $((s % 60))
  else printf '%ds' "$s"; fi
}

now=$(date +%s)
stamp=$(date '+%Y-%m-%d %H:%M:%S')
case "${1:-}" in
  --inicio)
    etapa="${2:?uso: passo.sh --inicio ETAPA}"
    printf '%s %s %s 0 0\n' "$etapa" "$now" "$now" > "$STATE"
    printf '%s | %s | #0 | +0s | 0s | início da etapa\n' "$stamp" "$etapa" >> "$DIR/passos-$etapa.log"
    echo "⏱ $(date +%H:%M:%S) · início da etapa $etapa"
    exit 0 ;;
  --retomar)
    [ -f "$STATE" ] || { echo "sem etapa aberta" >&2; exit 1; }
    read -r etapa t0 tl n pausa < "$STATE"; pausa=${pausa:-0}
    gap=$((now - tl))
    pausa=$((pausa + gap))
    printf '%s %s %s %s %s\n' "$etapa" "$t0" "$now" "$n" "$pausa" > "$STATE"
    printf '%s | %s | -- | pausa de %s (não conta) | %s | retomada\n' "$stamp" "$etapa" "$(fmt $gap)" "$(fmt $((now - t0 - pausa)))" >> "$DIR/passos-$etapa.log"
    echo "⏱ $(date +%H:%M:%S) · retomada após pausa de $(fmt $gap) (não conta) · $etapa $(fmt $((now - t0 - pausa)))"
    exit 0 ;;
  --resumo)
    [ -f "$STATE" ] || { echo "sem etapa aberta" >&2; exit 1; }
    read -r etapa t0 tl n pausa < "$STATE"; pausa=${pausa:-0}
    cat "$DIR/passos-$etapa.log"
    echo "total: $n passos em $(fmt $((tl - t0 - pausa))) de trabalho (pausas: $(fmt "$pausa"))"
    exit 0 ;;
  "")
    echo 'uso: passo.sh --inicio ETAPA | passo.sh "descrição" | passo.sh --retomar | passo.sh --resumo' >&2
    exit 2 ;;
esac

[ -f "$STATE" ] || printf 'sem-etapa %s %s 0 0\n' "$now" "$now" > "$STATE"
read -r etapa t0 tl n pausa < "$STATE"; pausa=${pausa:-0}
n=$((n + 1))
delta=$((now - tl))
total=$((now - t0 - pausa))
printf '%s %s %s %s %s\n' "$etapa" "$t0" "$now" "$n" "$pausa" > "$STATE"
printf '%s | %s | #%s | +%s | %s | %s\n' "$stamp" "$etapa" "$n" "$(fmt $delta)" "$(fmt $total)" "$*" >> "$DIR/passos-$etapa.log"
echo "⏱ $(date +%H:%M:%S) · +$(fmt $delta) · passo $n · $etapa $(fmt $total) — $*"
python3 "$(dirname "$0")/tokens.py" --linha 2>/dev/null || true
