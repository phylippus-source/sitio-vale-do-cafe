"""Corrige um arranjo do lote feito à mão mexendo o MÍNIMO possível (CP-SAT, grade de 0,5 m).
Mantém tamanhos e giros do Mestre; só desloca. Regras = as da régua (tools/lote-lib.mjs) + bunker ≥ 5 m do córrego.
Uso: ~/venv-sitio/bin/python -I tools/corrigir-arranjo.py ENTRADA.json SAIDA.json [--tempo 60]"""
import json, sys, math
from ortools.sat.python import cp_model

U = 2  # unidades por metro (0,5 m)
u = lambda m: int(round(m * U))
m2 = lambda n: n / U


def main():
    entrada, saida = sys.argv[1], sys.argv[2]
    tempo = float(sys.argv[sys.argv.index("--tempo") + 1]) if "--tempo" in sys.argv else 60
    S = json.load(open("plan/site.json"))
    B = json.load(open("plan/bunker.json"))
    A = json.load(open(entrada))
    L, M = S["lote"], u(S["margem"])
    MI = u(S.get("folga_itens", S["margem"]))  # folga entre itens (Mestre 18/11: 0 m)
    CORR = u(float(sys.argv[sys.argv.index("--corrego") + 1])) if "--corrego" in sys.argv else u(S.get("corrego_dist", S["margem"]))  # recuo do córrego (Mestre: 4 m)
    X1, X2, Z1, Z2 = u(L["x1"]), u(L["x2"]), u(L["z1"]), u(L["z2"])
    C1 = u(S["corrego"]["x1"])
    E = A["estrada"]
    m = cp_model.CpModel()
    R = {}  # id -> dict(x, z, w, d, ex, ez, x0, z0)
    custo = []

    extra = {a.split("=")[0]: float(a.split("=")[1]) for a in sys.argv if "=" in a}  # ex.: nucleo=10 (custo de mover)

    def peso(id_):
        return extra.get(id_, 2 if id_ in ("casa", "bunker") else 1)

    def mover(id_, x0, z0, w, d, xmin, xmax, zmin, zmax):
        x = m.new_int_var(xmin, xmax, "x_" + id_)
        z = m.new_int_var(zmin, zmax, "z_" + id_)
        dx, dz = m.new_int_var(0, 4000, "dx_" + id_), m.new_int_var(0, 4000, "dz_" + id_)
        m.add_abs_equality(dx, x - x0)
        m.add_abs_equality(dz, z - z0)
        custo.append(int(peso(id_) * 10) * (dx + dz))
        R[id_] = dict(x=x, z=z, w=w, d=d, ex=x + w, ez=z + d, x0=x0, z0=z0)

    for it in A["itens"]:
        w, d = u(it["w"]), u(it["d"])
        enc = "corrego" in it.get("encosta", [])
        mover(it["id"], u(it["x"]), u(it["z"]), w, d, X1 + M, min(X2, C1 + (0 if enc else -CORR)) - w, Z1 + M, Z2 - M - d)
    bk = A["bunker"]
    dc = u(B["mundo"]["distancia_corrego"])
    mover("bunker", u(bk["x"]), u(bk["z"]), u(bk["w"]), u(bk["d"]), X1 + M, C1 - dc - u(bk["w"]), Z1 + M, Z2 - M - u(bk["d"]))

    ids = [it["id"] for it in A["itens"]]
    por = {it["id"]: it for it in A["itens"]}
    colados = {frozenset((i["id"], c)) for i in A["itens"] for c in i.get("colado", [])}

    # estrada: o item fica inteiro acima ou abaixo, com folga
    ez1, ez2 = u(E["z1"]), u(E["z2"])
    for i in ids:
        r = R[i]
        acima = m.new_bool_var("ac_" + i)
        m.add(r["ez"] + M <= ez1).only_enforce_if(acima)
        m.add(r["z"] >= ez2 + M).only_enforce_if(acima.Not())

    # pares: folga mínima (L∞, mais rígida que a euclidiana da régua); colados se encostam
    for a in range(len(ids)):
        for b in range(a + 1, len(ids)):
            p, q = R[ids[a]], R[ids[b]]
            lados = [m.new_bool_var(f"s{a}_{b}_{k}") for k in range(4)]
            if frozenset((ids[a], ids[b])) in colados:
                # encostados lado a lado, com pelo menos 1 m de borda comum
                m.add(p["ex"] == q["x"]).only_enforce_if(lados[0])
                m.add(q["ex"] == p["x"]).only_enforce_if(lados[1])
                m.add(p["ez"] == q["z"]).only_enforce_if(lados[2])
                m.add(q["ez"] == p["z"]).only_enforce_if(lados[3])
                for k in (0, 1):
                    m.add(p["z"] + U <= q["ez"]).only_enforce_if(lados[k])
                    m.add(q["z"] + U <= p["ez"]).only_enforce_if(lados[k])
                for k in (2, 3):
                    m.add(p["x"] + U <= q["ex"]).only_enforce_if(lados[k])
                    m.add(q["x"] + U <= p["ex"]).only_enforce_if(lados[k])
            else:
                m.add(p["ex"] + MI <= q["x"]).only_enforce_if(lados[0])
                m.add(q["ex"] + MI <= p["x"]).only_enforce_if(lados[1])
                m.add(p["ez"] + MI <= q["z"]).only_enforce_if(lados[2])
                m.add(q["ez"] + MI <= p["z"]).only_enforce_if(lados[3])
            m.add_bool_or(lados)

    # reserva: retângulo que o Mestre deixou livre de propósito (espaço sobrando); nenhum item entra
    for k, rv in enumerate(A.get("reserva", [])):
        rx, rz, rex, rez = u(rv["x"]), u(rv["z"]), u(rv["x"] + rv["w"]), u(rv["z"] + rv["d"])
        for i in ids:
            r = R[i]
            ls = [m.new_bool_var(f"rv{k}_{i}_{j}") for j in range(4)]
            m.add(r["ex"] <= rx).only_enforce_if(ls[0])
            m.add(rex <= r["x"]).only_enforce_if(ls[1])
            m.add(r["ez"] <= rz).only_enforce_if(ls[2])
            m.add(rez <= r["z"]).only_enforce_if(ls[3])
            m.add_bool_or(ls)

    # árvores e escavação fora da projeção do bunker
    bkr = R["bunker"]
    for i in ids:
        if por[i]["tipo"] in ("arvore", "escavacao"):
            r = R[i]
            ls = [m.new_bool_var(f"bk_{i}_{k}") for k in range(4)]
            m.add(r["ex"] <= bkr["x"]).only_enforce_if(ls[0])
            m.add(bkr["ex"] <= r["x"]).only_enforce_if(ls[1])
            m.add(r["ez"] <= bkr["z"]).only_enforce_if(ls[2])
            m.add(bkr["ez"] <= r["z"]).only_enforce_if(ls[3])
            m.add_bool_or(ls)

    # regras de distância euclidiana entre bordas (gx² + gz²)
    def gap2(a, b, tag):
        p, q = R[a], R[b]
        gx, gz = m.new_int_var(0, 4000, "gx" + tag), m.new_int_var(0, 4000, "gz" + tag)
        m.add_max_equality(gx, [0, p["x"] - q["ex"], q["x"] - p["ex"]])
        m.add_max_equality(gz, [0, p["z"] - q["ez"], q["z"] - p["ez"]])
        sx, sz = m.new_int_var(0, 16_000_000, "sx" + tag), m.new_int_var(0, 16_000_000, "sz" + tag)
        m.add_multiplication_equality(sx, [gx, gx])
        m.add_multiplication_equality(sz, [gz, gz])
        return sx + sz

    r_ = S["regras"]
    if r_.get("animais_longe_da_casa") is not None:
        m.add(gap2("animais", "casa", "ac") >= u(r_["animais_longe_da_casa"]) ** 2)
    for a, b, k, tag in (("pomar", "nucleo", "pomar_perto_do_nucleo", "pn"), ("estufa", "nucleo", "estufa_perto_do_nucleo", "en"), ("animais", "nucleo", "animais_perto_do_nucleo", "an")):
        if r_.get(k) is not None:
            m.add(gap2(a, b, tag) <= u(r_[k]) ** 2)

    # vazio: um retângulo livre (variável) o maior possível; K m² de vazio valem 1 m de deslocamento ponderado
    K = float(sys.argv[sys.argv.index("--vazio") + 1]) if "--vazio" in sys.argv else 0
    area = 0
    if K:
        rx, rz = m.new_int_var(X1, X2, "rx"), m.new_int_var(Z1, Z2, "rz")
        rw, rd = m.new_int_var(0, X2 - X1, "rw"), m.new_int_var(0, Z2 - Z1, "rd")
        rex, rez = rx + rw, rz + rd
        m.add(rex <= C1)  # antes do córrego
        m.add(rez <= Z2)
        acima = m.new_bool_var("vz_acima")  # inteiro acima ou abaixo da estrada
        m.add(rez <= ez1).only_enforce_if(acima)
        m.add(rz >= ez2).only_enforce_if(acima.Not())
        for i in ids:
            r = R[i]
            ls = [m.new_bool_var(f"vz_{i}_{j}") for j in range(4)]
            m.add(r["ex"] <= rx).only_enforce_if(ls[0])
            m.add(rex <= r["x"]).only_enforce_if(ls[1])
            m.add(r["ez"] <= rz).only_enforce_if(ls[2])
            m.add(rez <= r["z"]).only_enforce_if(ls[3])
            m.add_bool_or(ls)
        area = m.new_int_var(0, (X2 - X1) * (Z2 - Z1), "area")
        m.add_multiplication_equality(area, [rw, rd])
        # 1 m ponderado de deslocamento = 20 unidades de custo; 1 m² de vazio = 80/K·... ajustado: custo×4K − área×20 (área em 0,25 m²)
        m.minimize(sum(custo) * int(4 * K) - area * 20)
    else:
        m.minimize(sum(custo))
    s = cp_model.CpSolver()
    s.parameters.max_time_in_seconds = tempo
    s.parameters.num_workers = 8
    st = s.solve(m)
    if st not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        print("sem solução:", s.status_name(st))
        sys.exit(2)
    out = json.loads(json.dumps(A))
    out["nome"] = (A.get("nome", "arranjo") + " — corrigido (deslocamento mínimo)")
    mov = []
    for it in out["itens"]:
        r = R[it["id"]]
        nx, nz = m2(s.value(r["x"])), m2(s.value(r["z"]))
        if (nx, nz) != (it["x"], it["z"]):
            mov.append((it["id"], it["x"], it["z"], nx, nz))
        it["x"], it["z"] = nx, nz
    r = R["bunker"]
    nb = (m2(s.value(r["x"])), m2(s.value(r["z"])))
    if nb != (out["bunker"]["x"], out["bunker"]["z"]):
        mov.append(("bunker", out["bunker"]["x"], out["bunker"]["z"], *nb))
    out["bunker"]["x"], out["bunker"]["z"] = nb
    json.dump(out, open(saida, "w"), indent=1, ensure_ascii=False)
    if K:
        print(f"vazio escolhido: x {m2(s.value(rx))} z {m2(s.value(rz))} {m2(s.value(rw))}×{m2(s.value(rd))} m")
    print(s.status_name(st))
    for i, x0, z0, x1, z1 in mov:
        print(f"  {i}: ({x0}, {z0}) → ({x1}, {z1})  [{abs(x1-x0)+abs(z1-z0):g} m]")


main()
