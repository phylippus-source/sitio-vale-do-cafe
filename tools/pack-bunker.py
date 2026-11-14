#!/usr/bin/env python3
"""Encaixe 2D do bunker (ferramenta de desenvolvimento, fora do app e do npm test).

Lê plan/bunker.json e plan/site.json e procura a planta de MENOR PEGADA para um cenário de
tolerância (tolerancia.cenarios). Modelo CP-SAT (OR-tools) numa grade de 0,5 m:
  - cada ambiente é um retângulo de tamanho variável: tabela de pares (L, P) permitidos, montada
    com as mesmas regras do conferidor (lado ±, giro, quartos que só crescem, área >= 90%, lados mínimos);
  - NoOverlap2D entre todos; o ramal é opcional (tamanho 0 = ausente);
  - a pegada W×D começa no canto fixo do bunker; a Casa Grande tem de caber nela;
  - poço da escada de emergência fora da Casa Grande e dos itens do lote (regras.escotilha); poço e monta-carga
    separados de saidas.distancia_min (em x ou em z);
  - dica inicial: a planta atual, que vale em qualquer cenário.
Etapa atual (B0-4d-2c): etapas em ordem lexicográfica: 1 menor pegada; 2 menor desvio de área (pulada no "exato"); 3 conforto
(afinidades ×10 por ponto, acesso direto ×3, ruído ×1 por 0,5 m até 10 m). Acesso como na régua (toque na circulação
ou em parceiro de acesso_por). A opção gerada passa no conferidor.

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
    LM = T["lado_min"]
    minimo = u(LM.get("por_id", {}).get(id_, LM["circulacao" if id_ in P["circulacao"] else "ambiente"]))
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


BORDA_MIN = 2  # unidades: 1 m de borda comum, igual à régua


def pares_de_toque(P):
    """Pares (a, b) cujo toque interessa: circulação×todos, passagens (acesso_por) e afinidades."""
    ids = list(P["medidas"]) + list(P.get("extras", {}))
    ps = set()
    for c in P["circulacao"]:
        for o in ids:
            if o != c:
                ps.add(tuple(sorted((c, o))))
    for a, outros in P.get("acesso_por", {}).items():
        for b in outros:
            ps.add(tuple(sorted((a, b))))
    for f in P.get("afinidades", []):
        ps.add(tuple(sorted((f["a"], f["b"]))))
    return sorted(p for p in ps if p[0] in ids and p[1] in ids)


def toques(m, v, pares):
    """Literal t[(a,b)] = 1 só se a e b se tocam com borda comum >= BORDA_MIN (t -> geometria)."""
    t = {}
    for a, b in pares:
        A, B = v[a], v[b]
        lit = m.new_bool_var(f"toca_{a}_{b}")
        rel = []
        for p, q, eixo, outro in ((A, B, "x", "y"), (B, A, "x", "y"), (A, B, "y", "x"), (B, A, "y", "x")):
            r = m.new_bool_var(f"rel_{a}_{b}_{len(rel)}")
            m.add(p["e" + eixo] == q[eixo]).only_enforce_if(r)
            m.add(p["e" + outro] - q[outro] >= BORDA_MIN).only_enforce_if(r)
            m.add(q["e" + outro] - p[outro] >= BORDA_MIN).only_enforce_if(r)
            rel.append(r)
        m.add_bool_or(rel).only_enforce_if(lit)
        for id_, o in ((a, A), (b, B)):
            if o["pres"] is not None:
                m.add_implication(lit, o["pres"])
        t[(a, b)] = lit
    return t


def chave(a, b):
    return (a, b) if a < b else (b, a)


def acesso(m, v, t, P):
    """Acesso como a régua: circulação ligada à galeria (até 2 trechos); cada ambiente toca a circulação
    ou toca um parceiro de acesso_por que toca a circulação. Devolve D[id] (toca a circulação)."""
    circ = [c for c in P["circulacao"] if c in v]
    outros = [i for i in v if i not in circ]
    for c in circ:
        if c == "galeria":
            continue
        opc = [t[chave(c, "galeria")]]
        for k in circ:
            if k not in (c, "galeria"):
                y = m.new_bool_var(f"liga_{c}_{k}")
                m.add_implication(y, t[chave(c, k)])
                m.add_implication(y, t[chave(k, "galeria")])
                opc.append(y)
        if v[c]["pres"] is None:
            m.add_bool_or(opc)
        else:
            m.add_bool_or(opc).only_enforce_if(v[c]["pres"])
    D = {}
    for r in outros:
        D[r] = m.new_bool_var(f"D_{r}")
        m.add_bool_or([t[chave(r, c)] for c in circ if c != r]).only_enforce_if(D[r])
    for r in outros:
        opc = [D[r]]
        for p in P.get("acesso_por", {}).get(r, []):
            if p in D:
                y = m.new_bool_var(f"via_{r}_{p}")
                m.add_implication(y, t[chave(r, p)])
                m.add_implication(y, D[p])
                opc.append(y)
        m.add_bool_or(opc)
    return D


PESO_AFINIDADE, PESO_ACESSO_DIRETO, PESO_RUIDO = 10, 3, 1  # por ponto, por ambiente, por 0,5 m (até RUIDO_TETO)
RUIDO_TETO = 20  # unidades: 10 m


def desvio_de_area(m, v, P, ids):
    """Soma de |área − área nominal| dos ambientes do plano (o ramal não conta)."""
    devs = []
    for id_ in P["medidas"]:
        a0 = u(P["medidas"][id_][0]) * u(P["medidas"][id_][1])
        dv = m.new_int_var(0, 10**6, f"dev_{id_}")
        m.add(dv >= a0 - v[id_]["a"])
        m.add(dv >= v[id_]["a"] - a0)
        devs.append(dv)
    return sum(devs)


def conforto(m, v, t, DIR, P):
    """Expressão a maximizar: afinidades ×10/ponto + acesso direto ×3 + ruído (distância mínima fonte–quarto)."""
    af = sum(f["peso"] * t[chave(f["a"], f["b"])] for f in P.get("afinidades", []))
    ruido = P.get("ruido")
    nmin = m.new_int_var(0, RUIDO_TETO, "ruido_min")
    if ruido:
        for f in ruido["fontes"]:
            for q in ruido["sensiveis"]:
                F, Q = v[f], v[q]
                lits = [m.new_bool_var(f"rd_{f}_{q}_{k}") for k in range(4)]
                m.add(F["ex"] + nmin <= Q["x"]).only_enforce_if(lits[0])
                m.add(Q["ex"] + nmin <= F["x"]).only_enforce_if(lits[1])
                m.add(F["ey"] + nmin <= Q["y"]).only_enforce_if(lits[2])
                m.add(Q["ey"] + nmin <= F["y"]).only_enforce_if(lits[3])
                m.add_bool_or(lits)
    return PESO_AFINIDADE * af + PESO_ACESSO_DIRETO * sum(DIR.values()) + PESO_RUIDO * nmin, nmin


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

    # escotilha: o poço fica fora da Casa Grande (sombra de queda) e dos outros itens do lote
    R = P.get("regras", {}).get("escotilha")
    if R:
        e = v[R["ambiente"]]
        for it in S["itens"]:
            marg = u(R["fora_da_casa_m"] if it["id"] == "casa" else R["fora_de_itens_m"])
            x1, x2 = u(it["x"] - P["mundo"]["x0"]) - marg, u(it["x"] + it["w"] - P["mundo"]["x0"]) + marg
            y1, y2 = u(it["z"] - P["mundo"]["z0"]) - marg, u(it["z"] + it["d"] - P["mundo"]["z0"]) + marg
            lits = [m.new_bool_var(f"esc_{it['id']}_{k}") for k in range(4)]
            m.add(e["ex"] <= x1).only_enforce_if(lits[0])
            m.add(e["x"] >= x2).only_enforce_if(lits[1])
            m.add(e["ey"] <= y1).only_enforce_if(lits[2])
            m.add(e["y"] >= y2).only_enforce_if(lits[3])
            m.add_bool_or(lits)

    t = toques(m, v, pares_de_toque(P))
    DIR = acesso(m, v, t, P)

    A = m.new_int_var(0, Wmax * Dmax, "A")
    m.add_multiplication_equality(A, [W, D])
    m.add(sum(areas) <= A)  # redundante, mas dá limite inferior forte
    objetivos = dict(
        desvio=desvio_de_area(m, v, P, ids),
        conforto=conforto(m, v, t, DIR, P),
    )
    return m, dict(W=W, D=D, A=A, v=v, base=base, t=t, DIR=DIR, **objetivos)


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


def borda(a, b):
    """Borda comum em metros entre duas salas (dicts u, v, w, d), como a régua."""
    ox = min(a["u"] + a["w"], b["u"] + b["w"]) - max(a["u"], b["u"])
    oy = min(a["v"] + a["d"], b["v"] + b["d"]) - max(a["v"], b["v"])
    if (ox == 0 and oy > 0) or (oy == 0 and ox > 0):
        return max(ox, oy)
    return 0


def anotar_acesso(P, salas):
    """Preenche 'acesso' (parceiro) nas salas que só chegam à circulação por outro ambiente."""
    por = {s["id"]: s for s in salas}
    circ = set(P["circulacao"])
    direto = {i for i, s in por.items() if i in circ or any(borda(s, por[c]) >= 1 for c in circ if c in por and c != i)}
    for i, s in por.items():
        if i in direto:
            continue
        for p in P.get("acesso_por", {}).get(i, []):
            if p in direto and p in por and borda(s, por[p]) >= 1:
                s["acesso"] = [p]
                break


def resolver_etapa(m, tempo, log):
    s = cp_model.CpSolver()
    s.parameters.max_time_in_seconds = tempo
    s.parameters.num_workers = 2
    s.parameters.log_search_progress = log
    st = s.solve(m)
    return s, st


def dica_da_solucao(m, s):
    m.clear_hints()
    for i in range(len(m.proto.variables)):
        x = m.get_int_var_from_proto_index(i)
        m.add_hint(x, s.value(x))


def resolver(P, S, cenario, tempo, log=False):
    """Etapas em ordem lexicográfica: 1 menor pegada; 2 menor desvio de área (pulada no cenário exato);
    3 conforto (afinidades, acesso direto, ruído). Cada etapa trava o resultado da anterior."""
    lado = next(c for c in P["tolerancia"]["cenarios"] if c["id"] == cenario)
    m, ctx = construir(P, S, lado["lado"])
    dica(m, ctx, P)
    t0 = time.time()
    exato = lado["lado"] == 0
    fatias = (0.4, 0.0, 0.6) if exato else (0.4, 0.2, 0.4)
    m.minimize(ctx["A"])
    s, st = resolver_etapa(m, tempo * fatias[0], log)
    if st not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return None, dict(status=s.status_name(st), segundos=round(time.time() - t0, 1))
    info = dict(limite_inferior=round(s.best_objective_bound / (U * U), 1))
    m.add(ctx["A"] <= round(s.objective_value))
    if not exato:
        dica_da_solucao(m, s)
        m.minimize(ctx["desvio"])
        s, st = resolver_etapa(m, tempo * fatias[1], log)
        m.add(ctx["desvio"] <= round(s.objective_value))
    dica_da_solucao(m, s)
    expr, nmin = ctx["conforto"]
    m.maximize(expr)
    s, st = resolver_etapa(m, tempo * fatias[2], log)
    nome = s.status_name(st)
    salas = []
    for id_, r in ctx["v"].items():
        w, d = s.value(r["w"]), s.value(r["d"])
        if w == 0:
            continue  # ramal ausente
        sala = dict(id=id_, u=s.value(r["x"]) / U, v=s.value(r["y"]) / U, w=w / U, d=d / U)
        if ctx["base"].get(id_, {}).get("grupo"):
            sala["grupo"] = ctx["base"][id_]["grupo"]
        salas.append(sala)
    anotar_acesso(P, salas)
    Wm, Dm = s.value(ctx["W"]) / U, s.value(ctx["D"]) / U
    info.update(status=nome, segundos=round(time.time() - t0, 1), area=Wm * Dm)
    opcao = dict(id=cenario, nome=lado["nome"], etapa="pegada, desvio de área e conforto",
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
