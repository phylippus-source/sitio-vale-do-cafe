# Calor de baixa temperatura em eletricidade (E3-E) — 24/11/2026

Pedido do Mestre (23/11 23:47): converter calor "baixo" em eletricidade (método do criador da Super Soaker; biogás ou queima da silvicultura em emergência; motor a vapor ou Stirling); achar mais métodos; combinações inusitadas.

## Limite físico (conta minha): Carnot = 1 − Tfria/Tquente, frio a 22 °C (solo do bunker, chute do plano)
Eficiência real assumida = 40–50% do Carnot (chute; conhecimento geral, a conferir nas fontes).

| Quente (°C) | Carnot (%) | Real aprox. (%) |
|---|---|---|
| 70 | 14.0 | 5.6 |
| 90 | 18.8 | 7.5 |
| 150 | 30.3 | 12.1 |
| 300 | 48.5 | 21.8 |
| 500 | 61.8 | 30.9 |

Leitura: com água a 90 °C só ~7% vira eletricidade; com areia a 300–500 °C, 20–25%. **Quanto mais quente o reservatório, melhor; calor baixo rende pouco.**

## Peso do calor no sítio (conta)
- 485 kWh elétricos (3 dias de T1) a 25% pedem ~1.940 kWh térmicos: ~18 m³ de areia com ΔT 300 K (107 kWh/m³ com cp 0,8, chute) — ver armazenamento-pesquisa.json.
- Biomassa + biogás do sítio dão ~35–110 kWh térmicos/dia (partes anteriores): a 10–25% rendem **3–25 kWh elétricos/dia**.

## Métodos a avaliar (lista de trabalho)
JTEC (Lonnie Johnson, criador da Super Soaker); ciclo Rankine orgânico (ORC); motor Stirling (incl. baixa diferença de temperatura); máquina a vapor; gasogênio (gás de lenha) em motor; termelétrico (Seebeck); termoacústico; células termorregenerativas; gradiente de salinidade (salmoura); bomba de calor invertida. Fontes e números abaixo.

## Combinações inusitadas (ideias minhas, a testar)
1. **Bunker como sumidouro frio:** reservatório de 22 m³ a ~22 °C no lado frio do ciclo; quanto mais frio, maior o Carnot.
2. **Calor residual do datacenter** (2,5 kW → ~60 kWh/dia de calor) alimentando o lado quente de um ORC pequeno.
3. **Areia quente enterrada** carregada por espelhos e por excedente FV, com Stirling ou vapor como "bateria térmica" de emergência.
4. **Gasogênio de bambu/eucalipto** em motor reaproveitando o calor do escape para água quente (cogeração).
5. **Silo da torre** como chaminé para o ciclo e para ventilar o bunker.

## Fontes (data da fonte; consulta 24/11/2026)
1. **JTEC** (Lonnie Johnson, criador da Super Soaker): hidrogênio pressurizado através de membrana, sem combustão e com poucas peças móveis. Slashdot/AJC, **08/12/2025**: demonstração com água a ~200 °F (93 °C) acendendo luzes e som; **primeira unidade comercial prevista para início de 2026**, para uma concessionária do Sudeste dos EUA; Série A de US$ 30 mi (2022), 30+ engenheiros; **sem eficiência divulgada**; comentaristas lembram que o limite de Carnot a 93 °C é <20% e que motores reais ficam em poucos %. Wikipedia (Lonnie Johnson, até início de 2023): Popular Mechanics listou o JTEC entre as invenções de 2008/2009. IEEE Spectrum e ASME apareceram na busca e NÃO foram lidos.
2. **ORC** — Wikipedia (vigente em 24/11/2026): abaixo de 100 °C "a eficiência é muito baixa e depende muito da temperatura do sumidouro frio"; funciona em geotermia de 50–350 °C, biomassa pequena e média, calor residual. **Energies 10(4):413, 2017** (revisão): ORC de 1–100 kW tem custo específico alto; limiares de competitividade 3.500 €/kW (5–10 kW) e 2.500 €/kW (10–100 kW); sistemas pequenos citados a 1.500–2.000 por kW (unidade ambígua); expansor scroll ou palheta rotativa é o melhor de 1 a 10 kW (scroll 68–73% de eficiência do expansor); turbina só acima de ~10–50 kW; faltam dados de 10–100 kW; mercado pequeno. Não achei eficiência térmica a 80–150 °C.
3. **Stirling** — Wikipedia (vigente em 24/11/2026): usa qualquer fonte externa (solar, biomassa, calor residual); baixa potência por peso, serve a instalação fixa; rende mais com ambiente frio; grupo Philips de 1951 dava ~0,2 kW; micro-CHP recupera o calor rejeitado; uma instalação em Dundee foi trocada após falhas de peças quentes. Sem diferença mínima de temperatura nem custo.
4. **Gasogênio (gás de lenha)** — Wikipedia (vigente em 24/11/2026): gás de ~5,7 MJ/kg (madeira 15–18 MJ/kg), 27% CO, 14% H₂, 51% N₂; precisa limpar alcatrão e tirar cinza; **~500 mil veículos na Alemanha ao fim da guerra**, 73 mil na Suécia em 1942; fabricado hoje na China e Rússia. A página NÃO dá eficiência nem kg de madeira por kWh.
5. Carnot: conta minha (tabela acima).

## Veredito (avaliação minha)
**Calor baixo (<100 °C) NÃO vale como eletricidade**: ~5–8% de rendimento (conta de Carnot) e ORC de custo alto. Use direto como calor.
Ranking para "fim do mundo" (reservatório quente, de preferência 300–500 °C):
1. **Gasogênio + motor a gasolina/etanol adaptado**: peças comuns e história de 500 mil veículos; consome silvicultura e bambu (~3–7 kWh elétricos/dia no sítio, conta anterior). Exige limpeza de alcatrão. Eficiência: não achei fonte.
2. **Stirling ou vapor com areia quente (300–500 °C)** como "bateria térmica" de emergência: 20–30% (Carnot × 40–50%, chute). 485 kWh elétricos a 25% = ~1.940 kWh térmicos ≈ 18 m³ de areia com ΔT 300 K.
3. **ORC**: só com fonte ≥120–150 °C e 1–10 kW; 1.500–3.500 €/kW: caro para o que rende.
4. **JTEC**: promessa, sem eficiência pública, primeira unidade comercial só em 2026. **Observar** e reavaliar no meio de 2027.
5. Calor do datacenter (~60 kWh térmicos/dia a ~45 °C): Carnot ~7% × 40% ≈ 3%: ~2 kWh elétricos/dia. **Não compensa.** Use esse calor em água quente.

## Combinações inusitadas — o que sobrou
- **Vale testar:** areia enterrada carregada por FV e espelhos com Stirling/vapor; gasogênio em cogeração (escape aquece água); silo da torre como chaminé do bunker.
- **Não vale:** datacenter→ORC; água morna (<100 °C)→ORC.
- **A estudar só se o Mestre quiser (sem fonte lida):** termorregenerativas de amônia, termoacústico, gradiente de salinidade com salmoura.
