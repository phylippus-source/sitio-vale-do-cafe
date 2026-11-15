#!/usr/bin/env python3
"""Contador rudimentar de tokens da sessão (lê a transcrição do Claude Code; só leitura).
Janelas de 5 h: começam na 1ª mensagem depois do fim da janela anterior.
Peso = estimativa de custo (entrada 1, cache criado 1,25, cache lido 0,1, saída 5). A cota real da
Anthropic não é publicada: use --cota (peso total que vale 100%) calibrada pelo aviso dos 90%.
Uso: python3 tools/tokens.py [--cota N] [--arquivo x.jsonl] [--linha]"""
import argparse, glob, json, os
from datetime import datetime, timedelta, timezone

W = dict(i=1.0, cc=1.25, cr=0.1, o=5.0)
ARQ = "/root/.claude/projects/-home-claude/dbdc108e-d298-59d6-ac01-45387eab7304.jsonl"
CALIB = os.path.join(os.path.dirname(__file__), "..", "logs", "tokens-cota.txt")

def ler(arq):
    ev = {}
    for l in open(arq, encoding="utf8"):
        try: o = json.loads(l)
        except ValueError: continue
        m = o.get("message")
        if isinstance(m, dict) and m.get("usage") and o.get("timestamp"):
            t = datetime.fromisoformat(o["timestamp"].replace("Z", "+00:00"))
            ev[m.get("id") or o.get("uuid")] = (t, m["usage"])  # dedup: vale o último
    return sorted(ev.values(), key=lambda x: x[0])

def somar(us):
    s = dict(i=0, cc=0, cr=0, o=0, pens=0)
    for _, u in us:
        s["i"] += u.get("input_tokens", 0); s["cc"] += u.get("cache_creation_input_tokens", 0)
        s["cr"] += u.get("cache_read_input_tokens", 0); s["o"] += u.get("output_tokens", 0); s["pens"] += (u.get("output_tokens_details") or {}).get("thinking_tokens", 0)
    s["peso"] = sum(s[k] * W[k] for k in W)
    return s

ANCORA = os.path.join(os.path.dirname(__file__), "..", "logs", "janela-inicio.txt")

def janela(ev, agora):
    if os.path.exists(ANCORA):  # início da janela atual, informado pelo Mestre (hora local -03:00)
        ini = datetime.fromisoformat(open(ANCORA).read().strip())
        return ini, [e for e in ev if e[0] >= ini]
    ini = None
    for t, _ in ev:
        if ini is None or t >= ini + timedelta(hours=5): ini = t
    return ini, [e for e in ev if e[0] >= ini]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--cota", type=float); ap.add_argument("--arquivo", default=ARQ)
    ap.add_argument("--linha", action="store_true"); ap.add_argument("--inicio", help="HH:MM local: grava início da janela atual"); ap.add_argument("--passada", nargs=2, metavar=("INI", "FIM"), help="HH:MM HH:MM locais de hoje: pesa esse trecho e grava como 100%% (esgotou)"); ap.add_argument("--calibrar", type=float, help="% real agora (ex. 90)")
    a = ap.parse_args()
    ev = ler(a.arquivo)
    loc0 = timezone(timedelta(hours=-3))
    hoje = datetime.now(loc0).date()
    hm = lambda t: datetime.combine(hoje, datetime.strptime(t, "%H:%M").time(), loc0)
    if a.inicio:
        open(ANCORA, "w").write(hm(a.inicio).isoformat()); print("início da janela gravado")
    if a.passada:
        i0, f0 = hm(a.passada[0]), hm(a.passada[1])
        sp = somar([e for e in ev if i0 <= e[0] <= f0])
        open(CALIB, "w").write(str(sp["peso"])); print(f"cota = peso de {a.passada[0]}–{a.passada[1]}: {sp['peso']:,.0f} (saída {sp['o']:,})")
    ini, jan = janela(ev, None); s = somar(jan); tot = somar(ev)
    if a.calibrar:
        open(CALIB, "w").write(str(s["peso"] / (a.calibrar / 100))); print("cota gravada")
    cota = a.cota or (float(open(CALIB).read()) if os.path.exists(CALIB) else None)
    loc = timezone(timedelta(hours=-3))
    pct = f" · {100 * s['peso'] / cota:.0f}% da janela" if cota else ""
    cab = f"janela desde {ini.astimezone(loc):%H:%M} (fim {(ini + timedelta(hours=5)).astimezone(loc):%H:%M})"
    if a.linha:
        print(f"tokens {cab}: saída {s['o']:,} · entrada nova {s['i'] + s['cc']:,} · cache lido {s['cr']:,}{pct}"); return
    print(cab)
    for k, n in (("i", "entrada"), ("cc", "cache criado"), ("cr", "cache lido"), ("o", "saída (inclui pensamento)"), ("pens", "  dos quais pensamento")):
        print(f"  {n:26}{s[k]:>14,}")
    print(f"  peso estimado {s['peso']:>13,.0f}{pct}")
    print(f"sessão inteira: peso {tot['peso']:,.0f}, saída {tot['o']:,}, {len(ev)} respostas")
main()
