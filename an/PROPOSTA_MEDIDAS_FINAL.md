# Proposta final de medidas — Sítio Vale do Café (08/11/2026)
Status: PROPOSTA (nada aplicado ao modelo). Aguardando OK do Mestre.
Regras: (1) medidas 0/5; (2) cabendo, aumentar; senão reduzir p/ baixo; (3) exceções do Mestre prevalecem.
Convenção: [F]=fonte, [E]=estimativa. 7 pessoas contínuo + sobra p/ vender; 12 só estoque de emergência (despensa/água/ar/energia).

## 1. Bunker — cotas
- Piso −10,0 m; pé-direito 3,0 m; topo interno −7,0 m (7 m de terra por cima). Nível único. (antes: piso −8,9; BWH 3,6)
- Pode crescer além de 1.400 m² sem reduzir cômodos. Plano: ≈ 1.690 m² úteis + paredes ≈ 12% → ≈ 1.900–2.000 m² (ex.: 50×40).
- Risco a verificar: lençol freático a −10 m (laudo geotécnico). Escada de ≈ 55 degraus → monta-carga + 2 saídas.

## 2. Bunker — ambientes (m = larg×prof; área)
| Ambiente | Antes | Proposta | Área |
|---|---|---|---|
| Suíte do Mestre | 7×16,6 (116) | 10×9 (exceção do Mestre: 90 m²) | 90 |
| Suíte dos pais | 4,5×16,6 (75) | 9×5 (exceção) | 45 |
| Quarto da irmã | 63 | 3,5×5 c/ suíte 3×2, cama casal, guarda-roupa | 17,5 |
| Quarto da sobrinha | 53 | 3,5×5 idem | 17,5 |
| Quarto do convidado | 50 | 3,5×5 idem + beliche | 17,5 |
| Estar, jantar e cozinha | 199 | 15×15 | 225 |
| Cinema e jogos | 96 | 10×10 | 100 |
| Despensa 90 dias (estoque p/ 12) | 53 | 5×10 | 50 |
| Hidroponia | 117 | 10×15 | 150 |
| Oficina maker | 102 | 10×10 | 100 |
| Datacenter | 100 | 10×10 | 100 |
| Laboratórios | 65 | 5×15 | 75 |
| Sala limpa | 50 | 5×10 | 50 |
| Suporte de vida (ar/O2/CO2) | 73 (junto c/ baterias) | 10×10 | 100 |
| Baterias/energia (compartimento próprio, risco de fogo) | — | 10×10 | 100 |
| Reserva e tratamento de água (≥ 22 m³ p/ 12 × 90 d × 20 L [E]) | — | 10×10 | 100 |
| Enfermaria | — | 5×5 | 25 |
| Escadaria principal + monta-carga | — | 5×10 + 5×5 | 75 |
| Saída de emergência 2 (lado campo) | — | 5×10 | 50 |
| Galeria principal (empilhadeira/fuga) | 2,6 m larg. | 40×5 | 200 |
Soma úteis ≈ 1.690 m².

## 3. Casa Grande (pegada 25×20; térreo)
Cozinha 5×10 | Copa 5×5 | Capela 5×5 | Jantar 15×5 | Visitas 15×5 | Hall e escadaria 15×10 | Escritório 5×10 | Despensa de catástrofe 5×5 | Banheiros coletivos: módulo 5×5 com sala de banho 3×3,5 (exceção) | Varanda 25×5.
Sobrado 25×20: fundos (10 prof.) Suíte E 10×10 + Sala íntima 5×10 + Suíte F 10×10; corredor 25×5; frente (5 prof.) 4 suítes 5×5 + escada 5×5.

## 4. Sítio (lotes)
| Item | Antes | Proposta | Obs |
|---|---|---|---|
| Engenho | 22×10 | 20×10 | córrego a 43 limita |
| Quadras de rotação (milho+mandioca+feijão, rodízio c/ adubação verde) | 4×20×25 = 2.000 | 4×25×30 = 3.000 (2×2, vãos 5 m; ocupa x −48..7, z −44..21; fica abaixo da estrada) | pede 3.000–4.000 [E]; 4.000 exigiria realocar |
| Núcleo Sisteminha | 49×31 | 25×30 (750): 2 tanques 10 m³, galinheiro 5×5 (40 aves) + 4 piquetes 10×10, horta, minhocário | F: 10 m³ ≈ 108 kg peixe/ano |
| Estufa | 12×10 | 15×15 (2 naves de 7,5) | F: 10,2 kg/m² tomate/ciclo |
| Biodigestor | 17,5×6 | 15×5 (10–20 m³) | F: 8,8 m³ biogás/dia p/ 30 bovinos |
| Curral | 16×19 | 15×20 | rebanho a definir |
| Pátio técnico | 18×20 | 15×15 | conferir conteúdo/carga elétrica |
| Bambuzal | 28×26 | 25×25, touceiras 6×6 | |
| Silvicultura | 26×28 | 25×25, eucalipto 3×2 | lenha só p/ forno/engenho |
| Jazida de argila | 30×19 | 20×25 | |
| Pomar (novo) | — | 25×40 (1.000) mín. | local a definir |
Lote: ≈ 9.250 m² ocupados de 15.000.

## 5. Etapas de aplicação (marcar ao concluir)
- [ ] E1 cotas do bunker (FLOOR −10, BWH 3,0, UF/UHT conferidos) + escadas
- [ ] E2 ambientes do bunker (rooms.js, bunker, texto BOM, validate)
- [ ] E3 casa/sobrado (rooms.js, geometria, colisão)
- [ ] E4 lotes (quadras, núcleo, estufa, biodigestor, curral, pátio, bambuzal, silvicultura, jazida, pomar)
- [ ] E5 BOM/rótulos/regravar golden + coplanar + metrics
Cada etapa: npm test + commit + registrar aqui.

## 6. Opções verticais (pesquisa 08/11) — aguardando decisão do Mestre
- Mestre liberou estufa e biodigestor reduzidos e/ou não quadrados.
- Estufa: 7,5×20 (150 m², nave única padrão Embrapa 7,5–8 m; 1,5 t tomate/ciclo [F 10,2 kg/m²]) ou 10×15; bancadas em 2–3 níveis p/ folhosas [E].
- Biodigestor: tubular 10×5 (50 m²), 7–12 m³ [E]; cascata por gravidade curral→biodigestor→tanque usando aterro com a terra escavada do bunker.
- Hidroponia vertical LED no bunker: ≈50 kg/m²/ano e ≈20 kWh/kg [Thunder Said Energy]; 1 t/ano ≈ 20.000 kWh/ano ≈ 2,3 kW contínuos. Só folhosas/ervas. Prateleiras 3 níveis (pé-direito 3 m).
- Galinheiro suspenso: sobre minhocário/composteira OK; sobre tanque de peixe só com sedimentador (Embrapa usa sedimentador, 1 parte resíduo : 4 água); sobre suínos NÃO recomendado (risco sanitário).
- Tanque Sisteminha: 3,5×4,5×0,7 m ≈ 9 m³ ≈ 30 kg (150 tilápias) [F].
- Árvores em caixas empilhadas: luz impede; só morango/ervas em torres. Árvores em terraços/laje com 50–80 cm de solo [E].
- Painéis solares em telhados (engenho, curral, galpões) reduzem o pátio técnico.

## 7. REVISÃO 2 (08/11, após "aprovo tudo") — substitui itens conflitantes acima
Decisões do Mestre: aprova toda verticalização/compactação/automação (baixa manutenção); SEM bovinos (só caprinos e suínos); energia elétrica de sobra; enterrar o que der (infra, plantios); luz solar ao subsolo por fibra ótica/espelhos.
Pesquisa: aprisco ripado 0,8–1 m²/animal, piso a 0,8–1 m do solo [F Embrapa]; suíno ≈ 9 L dejeto/dia e ≈ 0,15 m³ biogás/dia (derivado, fonte duvidosa) [F]; lagoa coberta (BLC): prof. 3–4,5 m, razão 2:1, retenção 30–60 d [F]; tubo de luz < 10 m (≈ 15 m com Fresnel+heliostat), 44,7% a 2 m; fibra PMMA até ≈ 50 m, ≈ 18% a 20 m, filtrar IV (derrete > 70 °C); heliostat 23% a 70 m [F MDPI 2023].
- Zona de caprinos e suínos 15×15 (substitui curral 15×20): 2 terraços de aterro (terra do bunker): alto = aprisco ripado 5×5 (≈ 20 animais) + pocilga ≈ 10 m² + solários; meio = biodigestor enterrado; baixo = tanques/horta. Dejeto desce por gravidade.
- Biodigestor enterrado 10×5 (BLC, prof. 3–4,5 m): alimentado por suínos, caprinos, banheiros do bunker e restos de cozinha. Biogás estimado ≈ 1–2 m³/dia [E] NÃO cobre fogão de 7 (≈ 2–3,5 m³/dia [E]) → fogão principal elétrico/indução; biogás p/ forno e aquecimento de água.
- Estufa 7,5×20 (150 m²) com bancadas em níveis; irrigação por gotejo com timer/sensores (ESP32).
- Galpão técnico 10×15 com LAJE-JARDIM em cima (≈ 150 m² de horta/pomar em vasos); inversores/baterias no subsolo; painéis nos telhados (≈ 90 m² bastam p/ ≈ 13 kWp ≈ 20.000 kWh/ano [E]).
- Galinheiro 5×5 sobre minhocário/composteira semi-enterrado; porta automática, bebedouro/comedouro por gravidade, ninhos com ovo rolando p/ coleta externa; 4 piquetes 10×10 em rodízio.
- Tanque de peixes: alimentador automático + aeração solar; fica no terraço baixo.
- Bunker enterra também: adega/queijaria 5×10 (cura de queijo de cabra, temperatura estável), armazém de grãos, cisternas, minhocário, baterias, hidroponia 10×10 em 3 níveis LED.
- Luz solar no subsolo: tubos de luz c/ heliostat (estar, cozinha, quartos), fibra ótica p/ pontos e corredores; plantas = LED + energia (coletor solar p/ 100 m² de hidroponia é inviável).
- Estimativas [E] a validar: herd 10–12 cabras + 6 suínos; produção de energia; carga da laje-jardim (cálculo estrutural).
Etapas E1–E5 inalteradas; incluir E4b (zona caprinos/suínos, galpão-laje, terraços).
