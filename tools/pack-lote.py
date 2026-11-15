#!/usr/bin/env python3
"""Encaixe 2D do lote (ferramenta de desenvolvimento, fora do app e do npm test).

Lê plan/site.json, plan/bunker.json e a opção escolhida de plan/bunker-opcoes.json. Itens fixos (fixo: true)
ficam onde estão; os livres mudam de posição (e giram 90°, exceto as quadras, que têm medida própria).
Modelo CP-SAT numa grade de 0,5 m:
  - afastamento de 2 m entre itens, e deles até a estrada e o córrego (pares com 4 alternativas, sem NoOverlap2D,
    porque os fixos colados — puxadinho na casa — não poderiam ficar no mesmo modelo);
  - dentro do lote, a 2 m da divisa;
  - árvore e escavação fora da projeção do bunker;
  - regras de distância do plano (animais longe da casa; pomar, estufa e animais perto do núcleo);
  - objetivo: menor soma peso × distância entre centros (site.viagens) + peso-sombra × (fonte alta, lavoura, hora de 9 a 15 h do
    solstício de inverno) com sombra: a sombra de cada fonte é a caixa envolvente da pegada varrida pelo deslocamento do sol.
Uso: venv/bin/python tools/pack-lote.py --tempo 60 --saida plan/lote-opcoes.json [--log]
"""
import argparse
import json
import math
import sys
import time
from pathlib import Path

from ortools.sat.python import cp_model

U = 2  # unidades por metro
ROOT = Path(__file__).resolve().parent.parent


def u(m):
    return int(round(m * U))


def ler(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf8"))


def sol(lat, decl, hora):
    """Mesma conta de tools/lote-lib.mjs: direção do sol (x+ oeste, z+ norte) e 'cima'; None se o sol está baixo demais."""
    f, d, h = math.radians(lat), math.radians(decl), math.radians(15 * (hora - 12))
    leste = -math.cos(d) * math.sin(h)
    norte = math.sin(d) * math.cos(f) - math.cos(d) * math.sin(f) * math.cos(h)
    cima = math.sin(d) * math.sin(f) + math.cos(d) * math.cos(f) * math.cos(h)
    return None if cima <= 0.05 else (-leste, norte, cima)


def deslocamentos(S, altura):
    """Deslocamento (dx, dz) em unidades da grade da sombra do topo de um objeto de altura (m), uma entrada por hora."""
    o = S["orientacao"]
    saida = []
    for h in range(9, 16):
        s = sol(o["latitude"], o["decl_inverno"], h)
        if s:
            saida.append((h, u(-altura * s[0] / s[2]), u(-altura * s[1] / s[2])))
    return saida


def construir(S, B, bunker, peso_sombra=0.0, peso_bloco=0.0, mover=False):
    L = S["lote"]
    ox, oz = L["x1"], L["z1"]  # origem do modelo: canto do lote
    W, D = u(L["x2"] - L["x1"]), u(L["z2"] - L["z1"])
    marg = u(S["margem"])
    m = cp_model.CpModel()
    v = {}
    # com mover=True o conjunto fixo (casa, puxadinho, engenho e a projeção do bunker) pode andar junto em z
    desl = m.new_int_var(0, D, "desl") if mover else 0

    def fixa(id_, x, y, w, d, anda=False):
        y = y + desl if anda else y
        return dict(x=x, y=y, w=w, d=d, ex=x + w, ey=y + d, fixo=True, id=id_)

    for it in S["itens"]:
        w0, d0 = u(it["w"]), u(it["d"])
        if it.get("fixo"):
            v[it["id"]] = fixa(it["id"], u(it["x"] - ox), u(it["z"] - oz), w0, d0, anda=True)
            continue
        x = m.new_int_var(marg, W - marg, f"x_{it['id']}")
        y = m.new_int_var(marg, D - marg, f"y_{it['id']}")
        if it["id"] == "quadras":
            w, d = w0, d0
        else:
            rot = m.new_bool_var(f"rot_{it['id']}")
            w = m.new_int_var(min(w0, d0), max(w0, d0), f"w_{it['id']}")
            d = m.new_int_var(min(w0, d0), max(w0, d0), f"d_{it['id']}")
            m.add(w == w0).only_enforce_if(rot.negated())
            m.add(d == d0).only_enforce_if(rot.negated())
            m.add(w == d0).only_enforce_if(rot)
            m.add(d == w0).only_enforce_if(rot)
            if w0 == d0:
                m.add(rot == 0)
        ex = m.new_int_var(0, W - marg, f"ex_{it['id']}")
        ey = m.new_int_var(0, D - marg, f"ey_{it['id']}")
        m.add(ex == x + w)
        m.add(ey == y + d)
        v[it["id"]] = dict(x=x, y=y, w=w, d=d, ex=ex, ey=ey, fixo=False, id=it["id"], rot=None if it["id"] == "quadras" else rot)

    def separados(a, b, k, nome):
        """a e b separados por pelo menos k unidades, em x ou em z."""
        lits = [m.new_bool_var(f"{nome}_{j}") for j in range(4)]
        m.add(a["ex"] + k <= b["x"]).only_enforce_if(lits[0])
        m.add(b["ex"] + k <= a["x"]).only_enforce_if(lits[1])
        m.add(a["ey"] + k <= b["y"]).only_enforce_if(lits[2])
        m.add(b["ey"] + k <= a["y"]).only_enforce_if(lits[3])
        m.add_bool_or(lits)

    ids = list(v)
    for i, a in enumerate(ids):
        for b in ids[i + 1:]:
            if v[a]["fixo"] and v[b]["fixo"]:
                continue  # fixos já estão onde estão; a régua os confere
            separados(v[a], v[b], marg, f"sep_{a}_{b}")
    for nome, o in (("estrada", S["estrada"]), ("corrego", dict(x1=S["corrego"]["x1"], x2=S["corrego"]["x2"], z1=L["z1"], z2=L["z2"]))):
        r = fixa(nome, u(o["x1"] - ox), u(o["z1"] - oz), u(o["x2"] - o["x1"]), u(o["z2"] - o["z1"]))
        for a in ids:
            if not v[a]["fixo"]:
                separados(v[a], r, marg, f"obs_{nome}_{a}")
            elif mover:
                it = next(i for i in S["itens"] if i["id"] == a)
                encosta = nome in (it.get("encosta") or [])
                separados(v[a], r, 0 if encosta else marg, f"obs_{nome}_{a}")

    if mover:  # o conjunto fixo continua dentro do lote, a 2 m da divisa
        for r in [v[i] for i in ids if v[i]["fixo"]] + [fixa("bunker", u(bunker["u"] - ox), u(bunker["v"] - oz), u(bunker["w"]), u(bunker["d"]), anda=True)]:
            m.add(r["y"] >= marg)
            m.add(r["ey"] <= D - marg)

    # árvore e escavação fora da projeção do bunker
    bk = fixa("bunker", u(bunker["u"] - ox), u(bunker["v"] - oz), u(bunker["w"]), u(bunker["d"]), anda=True)
    for it in S["itens"]:
        if it["tipo"] in ("arvore", "escavacao") and not it.get("fixo"):
            separados(v[it["id"]], bk, 0, f"bk_{it['id']}")

    def folga(a, b, nome):
        """gx + gz: soma das folgas em x e z (>= distância real); limita a distância por cima."""
        gx = m.new_int_var(0, W, f"gx_{nome}")
        gz = m.new_int_var(0, D, f"gz_{nome}")
        m.add(gx >= v[a]["x"] - v[b]["ex"])
        m.add(gx >= v[b]["x"] - v[a]["ex"])
        m.add(gz >= v[a]["y"] - v[b]["ey"])
        m.add(gz >= v[b]["y"] - v[a]["ey"])
        return gx + gz

    R = S["regras"]
    separados(v["animais"], v["casa"], u(R["animais_longe_da_casa"]), "animais_casa")
    for a, b, k in (("pomar", "nucleo", "pomar_perto_do_nucleo"), ("estufa", "nucleo", "estufa_perto_do_nucleo"), ("animais", "nucleo", "animais_perto_do_nucleo")):
        m.add(folga(a, b, f"{a}_{b}") <= u(R[k]))

    # objetivo: soma peso × distância (L1) entre centros; centros em unidades de 1/4 m (2x + w)
    termos = []
    for k, par in enumerate(S["viagens"]["pares"]):
        a, b = v[par["a"]], v[par["b"]]
        dx = m.new_int_var(0, 2 * W, f"vx_{k}")
        dz = m.new_int_var(0, 2 * D, f"vz_{k}")
        ax = m.new_int_var(-2 * W, 2 * W, "")
        az = m.new_int_var(-2 * D, 2 * D, "")
        m.add(ax == 2 * a["x"] + a["w"] - 2 * b["x"] - b["w"])
        m.add(az == 2 * a["y"] + a["d"] - 2 * b["y"] - b["d"])
        m.add_abs_equality(dx, ax)
        m.add_abs_equality(dz, az)
        termos.append(par["peso"] * (dx + dz))
    custo = sum(termos)

    # sombra de inverno (9–15 h) sobre as lavouras: caixa envolvente da sombra de cada fonte alta, hora a hora.
    # A caixa envolvente passa um pouco da sombra real (fecho convexo), então é prudente; a régua em JS confere o exato.
    sombra = []
    for alvo in (i for i in S["itens"] if i["tipo"] == "lavoura"):
        t = v[alvo["id"]]
        for fonte in (i for i in S["itens"] if S["alturas"].get(i["id"]) and i["id"] != alvo["id"]):
            f = v[fonte["id"]]
            for h, dx, dz in deslocamentos(S, S["alturas"][fonte["id"]]):
                b = m.new_bool_var(f"sombra_{alvo['id']}_{fonte['id']}_{h}")
                lits = [m.new_bool_var("") for _ in range(4)]
                m.add(f["ex"] + max(0, dx) <= t["x"]).only_enforce_if(lits[0])
                m.add(t["ex"] <= f["x"] + min(0, dx)).only_enforce_if(lits[1])
                m.add(f["ey"] + max(0, dz) <= t["y"]).only_enforce_if(lits[2])
                m.add(t["ey"] <= f["y"] + min(0, dz)).only_enforce_if(lits[3])
                m.add_bool_or(lits + [b])
                sombra.append(b)
    horas_sombra = sum(sombra)

    # blocos livres nas duas pontas do lado longo (z): os itens ficam entre zmin e zmax, e o que sobra nas pontas
    # (zmin do lado dos fundos, D - zmax do lado da frente) é espaço livre de ponta a ponta. Minimizar zmax - zmin
    # (unidades de 0,5 m) maximiza a soma dos dois blocos; 1 m de bloco vale peso_bloco pesos de viagem.
    zmin = m.new_int_var(0, D, "zmin")
    zmax = m.new_int_var(0, D, "zmax")
    for r in v.values():
        m.add(zmin <= r["y"])
        m.add(zmax >= r["ey"])
    m.minimize(custo + int(round(4 * peso_sombra)) * horas_sombra + int(round(2 * peso_bloco)) * (zmax - zmin))
    return m, v, custo, (ox, oz), desl


def dica(m, v, S, ox, oz):
    for it in S["itens"]:
        r = v[it["id"]]
        if r["fixo"]:
            continue
        w, d = u(it["w"]), u(it["d"])
        m.add_hint(r["x"], u(it["x"] - ox))
        m.add_hint(r["y"], u(it["z"] - oz))
        if not isinstance(r["w"], int):
            m.add_hint(r["w"], w)
            m.add_hint(r["d"], d)
        if r.get("rot") is not None:
            m.add_hint(r["rot"], 0)


def custo_do_layout(S, itens):
    """Mesmo custo do modelo, calculado direto nas posições (metros), para comparar com o plano atual."""
    por = {i["id"]: i for i in itens}
    t = 0.0
    for par in S["viagens"]["pares"]:
        a, b = por[par["a"]], por[par["b"]]
        t += par["peso"] * (abs(a["x"] + a["w"] / 2 - b["x"] - b["w"] / 2) + abs(a["z"] + a["d"] / 2 - b["z"] - b["d"] / 2))
    return t


def resolver(S, B, bunker, tempo, log=False, peso_sombra=0.0, peso_bloco=0.0, mover=False):
    m, v, custo, (ox, oz), desl = construir(S, B, bunker, peso_sombra, peso_bloco, mover)
    dica(m, v, S, ox, oz)
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
    dz = s.value(desl) / U if mover else 0
    itens = []
    for it in S["itens"]:
        r = v[it["id"]]
        if r["fixo"]:
            novo = {k: it[k] for k in it}
            novo["z"] = it["z"] + dz
            itens.append(novo)
            continue
        novo = dict(it)
        novo.update(x=s.value(r["x"]) / U + ox, z=s.value(r["y"]) / U + oz, w=s.value(r["w"]) / U, d=s.value(r["d"]) / U)
        itens.append(novo)
    return itens, dict(status=nome, segundos=round(dt, 1), custo=custo_do_layout(S, itens), dz=dz)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("--tempo", type=float, default=60)
    ap.add_argument("--saida", help="arquivo .json das opções do lote")
    ap.add_argument("--log", action="store_true")
    ap.add_argument("--mover-fixos", action="store_true", help="deixa casa, puxadinho, engenho e a projeção do bunker andarem juntos em z (muda mundo.z0; exige OK do Mestre)")
    ap.add_argument("--sem-estrada", action="store_true", help="experimento: tira a estrada do meio do lote (para medir quanto ela custa em espaço livre)")
    ap.add_argument("--peso-bloco", type=float, default=0.0, help="pesos de viagem trocados por metro de bloco livre nas pontas (fundos + frente)")
    ap.add_argument("--peso-sombra", type=float, default=0.0, help="custo de cada par fonte×lavoura×hora com sombra, em peso·metro de viagem")
    a = ap.parse_args()
    S, B = ler("plan/site.json"), ler("plan/bunker.json")
    if a.sem_estrada:
        S["estrada"] = dict(S["estrada"], z1=S["lote"]["z1"], z2=S["lote"]["z1"])
    oj = ler("plan/bunker-opcoes.json")
    esc = next(o for o in oj["opcoes"] if o["id"] == oj.get("escolhida"))
    bunker = dict(u=B["mundo"]["x0"], v=B["mundo"]["z0"], w=esc["pegada"]["w"], d=esc["pegada"]["d"])
    itens, info = resolver(S, B, bunker, a.tempo, a.log, a.peso_sombra, a.peso_bloco, a.mover_fixos)
    if itens is None:
        print("sem solução:", info, file=sys.stderr)
        sys.exit(1)
    base = custo_do_layout(S, S["itens"])
    zs = [i["z"] for i in itens]
    ze = [i["z"] + i["d"] for i in itens]
    L = S["lote"]
    fundos, frente = min(zs) - L["z1"], L["z2"] - max(ze)
    print(f"lote: {info['status']} | custo de viagens {info['custo']:.0f} (plano atual {base:.0f}) | blocos livres: fundos {fundos:g} m, frente {frente:g} m | conjunto fixo andou {info['dz']:g} m | {info['segundos']} s")
    if a.saida:
        op = dict(id="viagens", nome="Menores viagens (sem sombra)", etapa="5c-1: viagens", dz_bunker=info["dz"], itens=itens)
        Path(a.saida).write_text(json.dumps({"opcoes": [op]}, ensure_ascii=False, indent=1), encoding="utf8")


if __name__ == "__main__":
    main()
