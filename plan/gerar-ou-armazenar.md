# Armazenar mais ou gerar mais? (E3-C) — 24/11/2026

Sem pesquisa nova: conta sobre dados já salvos (Atlas INPE 2017, PNNL 2022, cargas E1). Premissas chutadas estão marcadas no plan/energia-geracao.json.

## Resposta curta (avaliação minha)
**Gerar mais primeiro, armazenar menos.** Armazenar não cria energia: sem sobra de geração o banco nunca recarrega depois de esgotado. E o excesso de FV não é desperdício: vira calor para os 141 kWh/dia térmicos.

## Os três números
1. **FV de ~200 kWp** (elétrico 444 + térmico 141 kWh/dia no pior mês, junho): 200 kWp. Os telhados de uma água a 22° dão 208 kWp (parte A). Cabe sem toldo e sem terra de plantio.
2. Com o FV de 152 kWp (só elétrico), o excesso de junho é 0; com 200 kWp ele é ~142 kWh/dia, que cobre os 141 térmicos em resistência (rendimento ~100%, chute).
3. **Armazenamento:** 3 dias de T1 vital = 3 × 136,5 ≈ **410 kWh úteis** (bunker para 7, decisão de 24/11; antes escrevi 485 por engano, supondo 10 no bunker), contra 1.333 kWh de tudo. O resto (T2, T3) corta em dia nublado seguido.

## Fator f = geração do pior mês ÷ carga elétrica
| f | kWp | Sobra em jun (kWh/dia) | Sobra no ano (MWh) | Sobra em fev (kWh/dia) |
|---|---|---|---|---|
| 1.0 | 152 | 0 | 21.0 | 151 |
| 1.25 | 190 | 111 | 66.8 | 300 |
| 1.32 | 200 | 142 | 79.7 | 342 |
| 1.5 | 228 | 222 | 112.6 | 449 |

Recarga após esgotar 3 dias: 3 ÷ (f−1) dias (f 1,25 → 12 dias; f 1,32 → 9; f 1,5 → 6). Térmico anual a cobrir: 51.5 MWh.

## Custo (PNNL 2022, rede; sem preço de FV pesquisado)
- 1 kWh de banco: US$ 356 (LFP) a 447 (chumbo). 1 kWh/dia de geração no pior mês pede 0,34 kWp.
- Empatam quando o FV custa ~US$ 1.050–1.300/kWp. **Preço do painel no Brasil: pendente (cotar).** Se o FV custar menos que isso, gerar a mais é mais barato que guardar.

## As gerações alternativas (quanto valem)
| Fonte | kWh elétricos/dia | Origem |
|---|---|---|
| Micro-hidro | 0,5–40 (típico 3–12) | parte B, sem medida |
| Biogás (20–100 animais) | 4,7–23,6 | Embrapa 0,14 m³/animal, motor 28% (chute) |
| Biomassa (eucalipto+bambu) em gasogênio/motor | 4,5–7 | 17,8–27,8 kWh térmicos × 25% (chute) |
| **Soma** | **~12–43** | **3–10% de 444; 9–31% de T1 (136,5)** |

As alternativas **não sustentam** a carga: servem de **colchão de 24 h** (hidro) e de **calor** (biomassa, biogás: cobrem ~13–60% dos 141 térmicos). A espinha dorsal é FV + banco.

## O que falta para fechar o tamanho do banco
Sequência real de dias nublados em Vassouras (série diária de sol): NASA e PVGIS bloqueiam robô, INMET não consultado. Pendente: o Mestre baixar a série (NASA POWER, diária, lat −22,404 lon −43,66) ou autorizar outra fonte.
