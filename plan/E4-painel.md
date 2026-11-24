# Painel E4 — Dimensionamento de Armazenamento (24/11/2026)

Base técnica: `plan/energia-armazenamento.json`, `plan/referencias/nasa-power-nuvens-vassouras.json` (2005–2024, 7.305 dias), `plan/armazenamento-pesquisa.json` e `plan/energia-cargas.json`.

## 1. Armazenamento elétrico (`450 kWh` úteis ativos = `3,3` dias de T1)

| Camada | Química / Arquitetura | Útil | DoD | Nominal | Peso est. | Localização | Área no bunker |
|---|---|---:|---:|---:|---:|---|---:|
| **Banco A (diário)** | LFP (4 racks independentes ~94 kWh) | `300 kWh` | 80% | `375 kWh` | `~2,9 t` | Contêiner/abrigo externo ventilado (~`15 m²`, fora do bunker) | **`0 m²`** |
| **Banco B (reserva)** | Chumbo tubular OPzS 2 V (2–3 strings) | `150 kWh` | 50% | `300 kWh` | `~8,1 t` | Sala de baterias no bunker (−10 m, ~`22 °C`, exaustão H₂) | **`32 m²`** |
| **Reserva décadas** | Células chumbo secas + eletrólito separado | `75 kWh` | 50% | `150 kWh` | `~4,05 t` | Sala de baterias do bunker (prateleira seca/bombonas) | **`10 m²`** |
| **Total ativo (A+B)** | — | **`450 kWh`** | — | **`675 kWh`** | `~11,0 t` | Externo (LFP) + Bunker (OPzS) | **`42 m²` de `100 m²`** |

### Validação histórica de 20 anos (NASA POWER `2005–2024`, GHI horizontal, `PR = 0,75`)
- **FV 200 kWp vs T1 (`136,5 kWh/dia`):** déficit máximo acumulado em 20 anos = **`72,4 kWh`** (`2024-06-30..2024-07-01`). Banco de `410–450 kWh` **nunca zerou** (`0` dias / `0` episódios).
- **FV 152 kWp vs T1 (`136,5 kWh/dia`):** déficit máximo = **`120,5 kWh`** (`0` dias zerados).
- **FV 200 kWp vs T1+T2 (`310,4 kWh/dia`):** déficit máximo = **`612,8 kWh`** (`2015-09-05..2015-09-14`); banco de `410 kWh` esgotaria T2 em apenas **11 dias em 20 anos** (mantendo T1 intacto).

## 2. Armazenamento térmico (`464 kWh` úteis a `ΔT = 50 K`)

| Tipo | Capacidade / Volume | Autonomia | Papel | Local |
|---|---:|---:|---|---|
| **Água quente isolada (diário)** | **`2 × 4 m³`** (`8 m³` → `464 kWh`) | **`3,3 dias`** de `140,92 kWh/dia` | Água quente, sauna, piscina (coletores + excedente FV + biogás/biomassa) | Galpão técnico / laje externa (~`12 m²`) |
| **Areia quente `300–500 °C` (opcional)** | `4 m³` (calor) / `15 m³` (~`410 kWh` elét. a 25%) | Reserva de emergência | Bateria térmica opcional com Stirling ou vapor | Abrigo externo isolado |

## 3. Veredito da sala de baterias na B0
- **Planejado na B0:** `10 × 10 m` = **`100 m²`**.
- **Ocupado na E4:** **`42 m²`** (`32 m²` Banco B OPzS + inversores/quadros N+1 + `10 m²` prateleira seca), com **`58 m²` de folga**.
- **Decisão geométrica:** **`reabrir_solver_b0 = false`** — **não é necessário alterar o layout do bunker na B0** (LFP vai obrigatoriamente para abrigo externo fora do bunker por segurança contra fuga térmica/HF).

**Próximo passo:** **E5 — Gases** (exaustão de H₂ da sala OPzS, alívio de explosão do contêiner LFP, depuração de biogás e viabilidade de captura de hidrogênio).
