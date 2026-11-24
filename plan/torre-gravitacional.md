# Torre gravitacional (E3-D) — 24/11/2026

Ideia do Mestre (23/11 23:47): grande torre com massa pesada presa por cabos e corrediças, subindo com excedente e descendo para gerar; a torre também serviria de antena para sinais de longa distância.

## Física (conta minha; g = 9,81)
Energia = massa × altura × g. **1 t elevada 1 m = 2,725 Wh.** (1 kWh = 367 t·m.)
Eficiência de ida e volta assumida 85% (chute; a fonte do E4 dá até ~90% para hidro reversível, não para guincho).

| Energia útil (kWh) | Altura de curso (m) | Massa (t) | Concreto 2,4 t/m³ (m³) | Terra compactada 1,8 t/m³ (m³) |
|---|---|---|---|---|
| 410 | 50 | 3,540 | 1475 | 1967 |
| 410 | 100 | 1,770 | 738 | 983 |
| 410 | 150 | 1,180 | 492 | 656 |
| 1333 | 50 | 11,510 | 4796 | 6394 |
| 1333 | 100 | 5,755 | 2398 | 3197 |
| 1333 | 150 | 3,837 | 1599 | 2131 |

- 410 kWh = 3 dias de T1 do bunker para 7 (parte C; a versão anterior tinha 485 por engano). 1.333 kWh = 3 dias de tudo (E1).
- A terra do bunker (~6.000 m³, decisão de 14/11) pesa ~10,800 t (1,8 t/m³, chute): com curso de 50 m daria ~1,251 kWh úteis, mas 10.000 t num bloco só é inviável: precisa dividir em blocos (como a Energy Vault, ver fontes).
- Potência: descer 1.770 t por 100 m em 4 h = 0,007 m/s, ~100 kW: guincho comum; o problema é o tamanho, não a velocidade.

## Leitura inicial (avaliação minha, antes das fontes)
- Vantagem: massa não degrada, vida de décadas, material local (terra, concreto), sem química.
- Desvantagem: 1.770 t a 100 m exige silo ou torre de concreto de ~125 m com cabos, corrediças e freios de segurança; queda da massa é risco grave; custo tende a passar o de bateria para 410 kWh (LFP: ~US$ 146 mil a US$ 356/kWh, PNNL 2022, rede).
- Torre de antena comum (treliça 60–100 m) NÃO aguenta a massa: antena entra no topo do silo, ou torre separada.
- Combinação inusitada: o silo vira chaminé de ventilação natural do bunker (efeito chaminé) e caixa d'água alta.

## Fontes (data da fonte; consulta 24/11/2026)
1. Wikipedia, Gravity battery (texto vigente em 24/11/2026): torre de 110 m com 35 t por bloco e 6 guindastes (protótipo suíço da Energy Vault, fim de 2020); Gravitricity espera 80–90% de eficiência e 50 anos; protótipo de 250 kW e 15 m em 04/2021; Tom Murphy (2011) chama o método de "incrivelmente fraco": 100 kg elevados 10 m igualam uma pilha AA (~3 Wh). Rudong (China) 25 MW/100 MWh: comissionado em 05/2024 segundo essa página.
2. Wikipedia, Energy Vault (texto vigente em 24/11/2026): torre de teste de ~70 m; ida e volta ~75% no teste de 12/2020; a empresa **se voltou para bateria de lítio** (contrato de 3 GWh em 09/2025) e diz que a gravidade "serve a usos muito estreitos". (Datas de Rudong divergem entre as duas páginas: 2023 ou 2024.)
3. Machines 13(12):1104, **28/11/2025**: protótipo de 1 kg, sem kWh medido; conclui que a gravidade só vence bateria em **grande escala e longa duração**; em pequena e média escala a bateria é preferível. Custo e vida: 50+ anos contra troca de bateria a cada ~5 anos (alegação do artigo). Defeito: números internos inconsistentes.
4. Inventions 4(4):64, **31/10/2019** (Ruoso et al.): pistão em poço de 12 m (4 m de diâmetro, 5 m de altura) guarda **11 kWh** para uma casa; eficiência 90% (de Gravitricity), vida de 50 anos; sem custo por kWh. A massa e a geometria do artigo não batem.

## Veredito (avaliação minha)
- **Como banco principal: não.** Para 410 kWh úteis pede ~1.770 t a 100 m de curso (~1.500 t sem perdas; versão anterior dizia 485 kWh e 1.780 t, que era a conta sem perdas), silo de ~125 m e cabos e freios de segurança. Escala pequena é o ponto fraco do método (fontes 2 e 3), e o líder de mercado migrou para lítio.
- **Como banco pequeno complementar:** 200 t a 100 m dão ~46 kWh úteis (conta), 0,3 dia de T1: não compensa a obra.
- **Torre em si: sim, para outros usos.** Antena de longo alcance no topo, chaminé de ventilação natural do bunker, caixa d'água alta (pressão para irrigação por gravidade, já aprovada pelo Mestre). Torre de antena comum é de treliça de 60–100 m: essas funções NÃO exigem a massa.
- **Terra do bunker (~6.000 m³):** melhor virar berma, morro e cobertura do bunker do que massa móvel.
- **Variante hídrica pendente:** se o terreno tiver desnível natural de 50–100 m, água em reservatório alto vira banco sem cabos (1 m³ a 100 m = 0,27 kWh): topografia do sítio NÃO levantada.
- Não pesquisado: custo de silo de concreto de 125 m no Brasil.
