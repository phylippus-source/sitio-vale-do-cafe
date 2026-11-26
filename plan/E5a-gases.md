# E5a — Lista de gases e quantidades (25/11/2026)

Bunker para 7 pessoas. Contas em `plan/energia-gases.json`. Fonte de cada número com data na tabela do fim.

## Decisão do Mestre (25/11 21:21)
Bunker pode crescer +20 ± 5% de área (1.766 a 1.920 m² sobre os 1.536 m² de 48×32), com medidas terminando em 0 ou 5. Candidatas: **45×40 = 1.800 m² (+17%)**, 60×30 = 1.800, 55×35 = 1.925 (+25,3%, limite), 50×35 = 1.750 (+14%, abaixo da faixa). B0 só reabre com permissão dele.

## Gases e quantidades
| Gás | Origem | Quantidade | Risco / destino |
|---|---|---|---|
| **O₂** | respiração, 7 pessoas | 5,4 kg/dia = **4,05 m³/dia** (5,7 com exercício). 3 d: 12 m³; 30 d: 122 m³; 90 d: 365 m³ ≈ 37 cilindros de 50 L a 200 bar | falta só em fechamento longo; ar do bunker dá ~17 dias até 19,5% (chute meu) |
| **CO₂** | respiração | **2,45 m³/dia** (350 L/pessoa/dia, dieta 2.000 kcal) | **limita antes do O₂**: limite NASA 3 mmHg (≈ 0,39%) em ~**6,6 dias** (48×32×3 m, 4.608 m³) ou ~7,8 dias (45×40×3 m). Precisa depurador (E5c) |
| **H₂** | bateria OPzS 150 kWh, sobrecarga | pior caso **1,7 m³/h** (carregador limitado a C/20, toda a corrente virando gás) → exaustão ~**81 m³/h** para ficar em 2% (metade do LIE de 4%) = 0,27 troca/h numa sala de 300 m³ | exaustão para fora do bunker, sensor, sem faísca |
| **Gases de falha LFP** | contêiner externo 300 kWh | **sem número**: fonte aberta indisponível (NFPA bloqueada) | alívio de explosão, fora do bunker; E5b/c |
| **Biogás** | biodigestor, 1,29 m³/dia | CH₄ sem fonte nesta consulta (usei ~60% como chute); CO₂ 20–30%; **H₂S 100–10.000 ppm = 0,2 a 20 g/dia** | filtro de H₂S (óxido de ferro/carvão) antes do motor; armazenar 3 dias ≈ 4 m³ |
| **CO (gasogênio)** | lenha/bambu, emergência | sem número ainda | tóxico: só ao ar livre |
| **H₂ de eletrólise** | opção do Mestre | pendente E5b | depende de norma e filtro |

## Descobertas
- O gargalo do ar é o **CO₂ (~1 semana)**, não o oxigênio. Vale mais depurador que cilindro.
- O biogás é pouco gás: 1,29 m³/dia cabe em bolsa de ~4 m³.
- 90 dias de O₂ em cilindros é possível (37 de 50 L) mas ocupa sala; alternativa é eletrólise ou plantas (E5c).

## Fontes (data da fonte · data da consulta · confiança)
- NASA OCHMO-TB-002 Rev A, 20/04/2023 · consultada 25/11/2026 · A (O₂ 0,771 kg/dia; CO₂ 350 L/dia; limite 3 mmHg).
- industrialmonitordirect.com, 04/05/2026 · 25/11/2026 · C (fórmula qv = 0,006·n·I L/s para 2% de H₂; a própria página tem exemplo inconsistente; EN 50272-2 não confirmada, norma paga).
- Embrapa, Cap. IV (ano não informado, referências até 2016) · 25/11/2026 · B (CO₂ 20–30%, H₂S 100–10.000 ppm, 15–30 MJ/Nm³, métodos de remoção).
- Chutes meus: 60% CH₄, 3 m de pé-direito, ar do bunker = volume bruto, 19,5% de O₂ como piso, carregador a C/20, cilindro 50 L a 200 bar.
