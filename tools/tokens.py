#!/usr/bin/env python3
"""Contador rudimentar de tokens da janela de 5 h (só leitura; lê as transcrições do Claude Code).

Peso = estimativa de custo: entrada 1, cache criado 1,25, cache lido 0,1, saída 5 (a saída já inclui o pensamento).
A cota real da conta não é publicada: o peso que vale 100% é calibrado quando o Mestre avisa quanto já gastou
(logs/tokens-cota.txt; sem o arquivo vale COTA_PADRAO). A janela de 5 h começa na 1ª mensagem depois do fim da
anterior; o início é informado com --inicio HH:MM (grava logs/janela-inicio.txt) e a janela avança sozinha.

Transcrições: acha sozinho os *.jsonl de ~/.claude/projects (e de $CLAUDE_CONFIG_DIR) tocados nas últimas 36 h,
de todas as sessões da máquina, porque a janela é da conta e não da sessão; --arquivo x.jsonl (repetível) força.
Livro-razão logs/tokens-ledger.jsonl: guarda cada resposta já vista, porque a compactação da conversa apaga o
histórico da transcrição e o contador ficava cego (15/11: marcou 69% com o limite real em 100%).
Limite que continua: gasto fora desta máquina (outra janela do app, outro aparelho) não aparece.

Uso: python3 tools/tokens.py [--linha] [--inicio HH:MM] [--calibrar PCT] [--passada INI FIM] [--cota PESO] [--arquivo x.jsonl]
  --linha            uma linha só (é o que tools/passo.sh e o início de cada "segue" usam)
  --inicio HH:MM     grava o início da janela atual (hora de Brasília, de hoje)
  --calibrar PCT     o Mestre disse que está em PCT% agora: grava a cota (peso da janela ÷ PCT)
  --passada INI FIM  a janela se esgotou entre INI e FIM (HH:MM de hoje): o peso desse trecho vira 100%
  --cota PESO        usa este peso como 100% só nesta execução"""
import argparse, glob, json, os, time
from datetime import datetime, timedelta, timezone

W = dict(i=1.0, cc=1.25, cr=0.1, o=5.0)
COTA_PADRAO = 2104699.0  # peso de 100%, calibrado com o aviso de 90% do Mestre em 14/11 às 23:39; recalibrar a cada aviso dele
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
LOGS = os.path.join(RAIZ, "logs")
CALIB, ANCORA, LIVRO = (os.path.join(LOGS, n) for n in ("tokens-cota.txt", "janela-inicio.txt", "tokens-ledger.jsonl"))
USO = ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens", "output_tokens_details")
LOC = timezone(timedelta(hours=-3))


def achar(horas=36):
    arqs = set()
    for r in filter(None, [os.environ.get("CLAUDE_CONFIG_DIR"), "~/.claude", "/root/.claude"]):
        arqs.update(glob.glob(os.path.join(os.path.expanduser(r), "projects", "**", "*.jsonl"), recursive=True))
    return sorted(a for a in arqs if os.path.getmtime(a) >= time.time() - horas * 3600)


def ler(arqs):
    ev = {}
    for arq in arqs:
        for l in open(arq, encoding="utf8", errors="replace"):
            try: o = json.loads(l)
            except ValueError: continue
            m = o.get("message")
            if isinstance(m, dict) and m.get("usage") and o.get("timestamp"):
                t = datetime.fromisoformat(o["timestamp"].replace("Z", "+00:00"))
                ev[m.get("id") or o.get("uuid")] = (t, m["usage"])  # dedup: vale o último
    return ev


def livro_ler():
    ev = {}
    if os.path.exists(LIVRO):
        for l in open(LIVRO, encoding="utf8"):
            try: o = json.loads(l)
            except ValueError: continue
            ev[o["id"]] = (datetime.fromisoformat(o["t"]), o["u"])
    return ev


def livro_gravar(ev):
    corte = datetime.now(timezone.utc) - timedelta(hours=72)
    tmp = LIVRO + ".tmp"
    with open(tmp, "w", encoding="utf8") as f:
        for k, (t, u) in sorted(ev.items(), key=lambda x: x[1][0]):
            if t >= corte: f.write(json.dumps({"id": k, "t": t.isoformat(), "u": {c: u[c] for c in USO if c in u}}) + "\n")
    os.replace(tmp, LIVRO)


def somar(us):
    s = dict(i=0, cc=0, cr=0, o=0, pens=0)
    for _, u in us:
        s["i"] += u.get("input_tokens", 0); s["cc"] += u.get("cache_creation_input_tokens", 0)
        s["cr"] += u.get("cache_read_input_tokens", 0); s["o"] += u.get("output_tokens", 0); s["pens"] += (u.get("output_tokens_details") or {}).get("thinking_tokens", 0)
    s["peso"] = sum(s[k] * W[k] for k in W)
    return s


def janela(ev):
    """Âncora (início informado) ou 1ª resposta; depois, cada resposta 5 h além do início abre a janela seguinte."""
    ini = datetime.fromisoformat(open(ANCORA).read().strip()) if os.path.exists(ANCORA) else None
    for t, _ in ev:
        if ini is None or t >= ini + timedelta(hours=5): ini = t
    return ini, [e for e in ev if e[0] >= ini]


def main():
    ap = argparse.ArgumentParser(description="Contador de tokens da janela de 5 h")
    ap.add_argument("--cota", type=float); ap.add_argument("--arquivo", action="append"); ap.add_argument("--linha", action="store_true")
    ap.add_argument("--inicio", help="HH:MM de hoje (Brasília): grava o início da janela atual")
    ap.add_argument("--passada", nargs=2, metavar=("INI", "FIM"), help="HH:MM HH:MM de hoje: a janela se esgotou nesse trecho; o peso dele vira 100%%")
    ap.add_argument("--calibrar", type=float, help="%% real agora, dito pelo Mestre (ex. 90)")
    a = ap.parse_args()
    os.makedirs(LOGS, exist_ok=True)
    ev = livro_ler(); ev.update(ler(a.arquivo or achar())); livro_gravar(ev)
    ev = sorted(ev.values(), key=lambda x: x[0])
    if not ev:
        print("tokens: sem transcrição do Claude Code nem livro-razão; nada para contar (use --arquivo x.jsonl ou peça a % ao Mestre)"); return
    hoje = datetime.now(LOC).date()
    hm = lambda t: datetime.combine(hoje, datetime.strptime(t, "%H:%M").time(), LOC)
    if a.inicio:
        open(ANCORA, "w").write(hm(a.inicio).isoformat()); print("início da janela gravado")
    if a.passada:
        i0, f0 = hm(a.passada[0]), hm(a.passada[1])
        sp = somar([e for e in ev if i0 <= e[0] <= f0])
        open(CALIB, "w").write(str(sp["peso"])); print(f"cota = peso de {a.passada[0]}–{a.passada[1]}: {sp['peso']:,.0f} (saída {sp['o']:,})")
    ini, jan = janela(ev); s = somar(jan); tot = somar(ev)
    if a.calibrar:
        open(CALIB, "w").write(str(s["peso"] / (a.calibrar / 100))); print("cota gravada")
    cota = a.cota or (float(open(CALIB).read()) if os.path.exists(CALIB) else COTA_PADRAO)
    pct = f" · {100 * s['peso'] / cota:.0f}% da janela"
    cab = f"janela desde {ini.astimezone(LOC):%H:%M} (fim {(ini + timedelta(hours=5)).astimezone(LOC):%H:%M})"
    if a.linha:
        print(f"tokens {cab}: saída {s['o']:,} · entrada nova {s['i'] + s['cc']:,} · cache lido {s['cr']:,}{pct}"); return
    print(cab)
    for k, n in (("i", "entrada"), ("cc", "cache criado"), ("cr", "cache lido"), ("o", "saída (inclui pensamento)"), ("pens", "  dos quais pensamento")):
        print(f"  {n:26}{s[k]:>14,}")
    print(f"  peso estimado {s['peso']:>13,.0f}{pct}  (100% = {cota:,.0f})")
    print(f"respostas guardadas: {len(ev)}, peso total {tot['peso']:,.0f}")


main()
