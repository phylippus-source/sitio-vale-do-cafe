#!/usr/bin/env python3
"""Encaixe 2D do bunker (ferramenta de desenvolvimento, fora do app e do npm test).

Lê plan/bunker.json e plan/site.json e procura a planta de MENOR PEGADA para um cenário de
tolerância (tolerancia.cenarios). Modelo CP-SAT (OR-tools) numa grade de 0,5 m:
  - cada ambiente é um retângulo de tamanho variável: tabela de pares (L, P) permitidos, montada
    com as mesmas regras do conferidor (lado ±, giro, quartos que só crescem, área >= 90%, lados mínimos);
  - NoOverlap2D entre todos; o ramal é opcional (tamanho 0 = ausente);
  - a pegada W×D começa no canto fixo do bunker; a Casa Grande tem de caber nela;
  - escada inteira sob a Casa Grande (regras.escada_sob_casa); saídas separadas de saidas.distancia_min
    (em x ou em z) quando esse valor for maior que 0;
  - dica inicial: a planta atual, que vale em qualquer cenário.
Etapa atual (B0-4c): só a menor pegada. Acesso, afinidades e ruído entram na B0-4d, por isso a opção
gerada ainda NÃO passa no conferidor de acesso.

Uso (precisa de ortools: python3 -m venv venv && venv/bin/pip install -r tools/requirements-solver.txt):
  venv/bin/python tools/pack-bunker.py --cenario mais-menos-1 --tempo 60 --saida opcao.json
"""
import argparse
import json
import sys
import time
from pathlib import Path

from ortools.sat.python import cp_model

U = 2  # unidades por metro: grade de 0,5 m
ROOT = Path(__file__).resolve().parent.parent


def u(m):
    return int(round(m * U))


def ler(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf8"))


def pares_ambiente(P, id_, w0, d0, lado):
    """Pares (L, P) em unidades que o conferidor aceita para o ambiente id_."""
    T = P["tolerancia"]
    a0, b0 = u(w0), u(d0)
    orient = [(a0, b0)] + ([(b0, a0)] if T.get("giro", True) else [])
    nao_encolhe = id_ in T.get("nao_encolhem", [])
    minimo = u(T["lado_min"]["circulacao" if id_ in P["circulacao"] else "ambiente"])
    saida = set()
    for a, b in orient:
        for w in range(a - lado, a + lado + 1):
            for d in range(b - lado, b + lado + 1):
                if nao_encolhe and (w < a or d < b):
                    continue
                if min(w, d) < minimo:
                    continue
                if w * d < T["area_min"] * a0 * b0 - 1e-9:
                    continue
                saida.add((w, d))
    return sorted(saida)


def pares_ramal(P):
    R = P["tolerancia"]["ramal"]
    c1, c2 = u(R["lado_curto"][0]), u(R["lado_curto"][1])
    l1, l2 = u(R["lado_longo"][0]), u(R["lado_longo"][1])
    saida = {(0, 0)}  # ausente
    for c in range(c1, c2 + 1):
        for lg in range(l1, l2 + 1):
            saida.add((c, lg))
            saida.add((lg, c))
    return sorted(saida)


def construir(P, S, lado_m):
    T = P["tolerancia"]
    lado = u(lado_m)
    m = cp_model.CpModel()
    Wmax, Dmax = u(T["pegada_max"]["w"]), u(T["pegada_max"]["d"])
    W = m.new_int_var(0, Wmax, "W")
    D = m.new_int_var(0, Dmax, "D")
    casa = next(i for i in S["itens"] if i["id"] == "casa")
    cu, cv = casa["x"] - P["mundo"]["x0"], casa["z"] - P["mundo"]["z0"]
    m.add(W >= u(cu + casa["w"]))
    m.add(D >= u(cv + casa["d"]))

    base = {s["id"]: s for s in P["salas"]}
    ids = list(P["medidas"]) + list(P.get("extras", {}))
    v = {}  # id -> dict de variáveis
    xi, yi, areas = [], [], []
    for id_ in ids:
        ramal = id_ in P.get("extras", {})
        pares = pares_ramal(P) if ramal else pares_ambiente(P, id_, *P["medidas"][id_], lado)
        tabela = [(w, d, w * d) for w, d in pares]
        x = m.new_int_var(0, Wmax, f"x_{id_}")
        y = m.new_int_var(0, Dmax, f"y_{id_}")
        w = m.new_int_var(0, Wmax, f"w_{id_}")
        d = m.new_int_var(0, Dmax, f"d_{id_}")
        a = m.new_int_var(0, Wmax * Dmax, f"a_{id_}")
        m.add_allowed_assignments([w, d, a], tabela)
        ex = m.new_int_var(0, Wmax, f"ex_{id_}")
        ey = m.new_int_var(0, Dmax, f"ey_{id_}")
        m.add(ex == x + w)
        m.add(ey == y + d)
        if ramal:
            pres = m.new_bool_var("ramal_presente")
            m.add(w >= 1).only_enforce_if(pres)
            m.add(w == 0).only_enforce_if(pres.negated())
            m.add(x == 0).only_enforce_if(pres.negated())
            m.add(y == 0).only_enforce_if(pres.negated())
            xi.append(m.new_optional_interval_var(x, w, ex, pres, f"xi_{id_}"))
            yi.append(m.new_optional_interval_var(y, d, ey, pres, f"yi_{id_}"))
        else:
            pres = None
            xi.append(m.new_interval_var(x, w, ex, f"xi_{id_}"))
            yi.append(m.new_interval_var(y, d, ey, f"yi_{id_}"))
        m.add(ex <= W)
        m.add(ey <= D)
        areas.append(a)
        v[id_] = dict(x=x, y=y, w=w, d=d, a=a, ex=ex, ey=ey, pres=pres)
    m.add_no_overlap_2d(xi, yi)

    # saídas: separadas em x ou em z (conservador: o conferidor mede a distância em linha reta)
    S_ = P.get("saidas")
    if S_ and S_["distancia_min"] > 0:
        dmin = u(S_["distancia_min"])
        A_, B_ = v[S_["a"]], v[S_["b"]]
        opc = []
        for p, q, eixo in ((A_, B_, "x"), (B_, A_, "x"), (A_, B_, "y"), (B_, A_, "y")):
            lit = m.new_bool_var(f"saidas_{eixo}_{len(opc)}")
            m.add(q[eixo] >= p["e" + eixo] + dmin).only_enforce_if(lit)
            opc.append(lit)
        m.add_bool_or(opc)

    if P.get("regras", {}).get("escada_sob_casa"):
        e = v["escada"]
        m.add(e["x"] >= u(cu))
        m.add(e["ex"] <= u(cu + casa["w"]))
        m.add(e["y"] >= u(cv))
        m.add(e["ey"] <= u(cv + casa["d"]))

    A = m.new_int_var(0, Wmax * Dmax, "A")
    m.add_multiplication_equality(A, [W, D])
    m.add(sum(areas) <= A)  # redundante, mas dá limite inferior forte
    m.minimize(A)
    return m, dict(W=W, D=D, A=A, v=v, base=base)


def dica(m, ctx, P):
    """Planta atual como ponto de partida (vale em qualquer cenário)."""
    v, base = ctx["v"], ctx["base"]
    for id_, s in base.items():
        r = v[id_]
        w, d = u(s["w"]), u(s["d"])
        for k, val in (("x", u(s["u"])), ("y", u(s["v"])), ("w", w), ("d", d), ("a", w * d),
                       ("ex", u(s["u"]) + w), ("ey", u(s["v"]) + d)):
            m.add_hint(r[k], val)
        if r["pres"] is not None:
            m.add_hint(r["pres"], 1)
    W, D = u(P["pegada"]["w"]), u(P["pegada"]["d"])
    m.add_hint(ctx["W"], W)
    m.add_hint(ctx["D"], D)
    m.add_hint(ctx["A"], W * D)


def resolver(P, S, cenario, tempo, log=False):
    lado = next(c for c in P["tolerancia"]["cenarios"] if c["id"] == cenario)
    m, ctx = construir(P, S, lado["lado"])
    dica(m, ctx, P)
    s = cp_model.CpSolver()
    s.parameters.max_time_in_seconds = tempo
    s.parameters.num_workers = 2
    s.parameters.log_search_progress = log
    t0 = time.time()
    st = s.solve(m)
    dt = time.time() - t0
    nome = s.status_name(st)
    if st not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return None, dict(status=nome, segundos=round(dt, 1))
    salas = []
    for id_, r in ctx["v"].items():
        w, d = s.value(r["w"]), s.value(r["d"])
        if w == 0:
            continue  # ramal ausente
        sala = dict(id=id_, u=s.value(r["x"]) / U, v=s.value(r["y"]) / U, w=w / U, d=d / U)
        if ctx["base"].get(id_, {}).get("grupo"):
            sala["grupo"] = ctx["base"][id_]["grupo"]
        salas.append(sala)
    Wm, Dm = s.value(ctx["W"]) / U, s.value(ctx["D"]) / U
    info = dict(
        status=nome, segundos=round(dt, 1), area=Wm * Dm,
        limite_inferior=round(s.best_objective_bound / (U * U), 1),
    )
    opcao = dict(id=cenario, nome=lado["nome"], etapa="pegada (sem acesso)",
                 pegada=dict(w=Wm, d=Dm), salas=salas)
    return opcao, info


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("--cenario", required=True)
    ap.add_argument("--tempo", type=float, default=60)
    ap.add_argument("--saida", help="arquivo .json da opção")
    ap.add_argument("--log", action="store_true")
    a = ap.parse_args()
    P, S = ler("plan/bunker.json"), ler("plan/site.json")
    opcao, info = resolver(P, S, a.cenario, a.tempo, a.log)
    if opcao is None:
        print("sem solução:", info, file=sys.stderr)
        sys.exit(1)
    p = opcao["pegada"]
    print(f"{a.cenario}: {info['status']} | pegada {p['w']}×{p['d']} = {info['area']} m² "
          f"| limite inferior {info['limite_inferior']} m² | {info['segundos']} s")
    if a.saida:
        Path(a.saida).write_text(json.dumps({"opcoes": [opcao]}, ensure_ascii=False, indent=1), encoding="utf8")


if __name__ == "__main__":
    main()
