# Achados Fases 1 e 2 (somente leitura) — Sítio Vale do Café
Fonte de verdade do código: ../sitio-vale-do-cafe.html (= publicado v6). Nada alterado.
Scripts: sun.py (sol/sombra), analise.js + analise.html (coplanaridade, cópia com window.__scene), analise.out / analise2.out.

## CÓDIGO
- Orçamento medido: 286.306 tri (145.236 visíveis + 141.370 de contorno/hull ≈ 49%), 155 chamadas, 127 malhas.
- Flicker: 647 pares de triângulos coplanares sobrepostos, cor diferente (y exato):
  - argila y=0,160: 202 pares (14 discos `SB.cb(rr(2.2,4.2),0.06,…,y0=0.1)` linha 928, todos topo 0,16)
  - grama y=0,030: 270 pares (150 manchas linha 696-700)
  - poços y=1,40: 70 pares (x 12..19, z 30..36)
  - outros 361 (topos de parede 4,2 / 4,8 / 2,9 etc., interior subsolo); quase-coplanar 29 (cascalho 0,10 vs trilha 0,11)
- Etiquetas: 40 (LABELS linha 308). Engenho interior: 0 etiquetas para ~12 máquinas; Casa interior: 3; sem etiqueta: composteira, horta, tanques, biofiltro/sedimentador, corredor técnico, elevador, forno de tijolos. Regras de ocultar: celular mostra só m:1; interiores só com corte>40%; 1ª pessoa: nenhuma.
- Casa: 1 pavimento 4,2 m, telhado 4 águas 6 m; "2º andar" = sótão (caixotes, camas) dentro do grupo do telhado; col() sem nível 'a'. Interior estático.
- Engenho: ~12 máquinas = caixas simples estáticas (linhas 1081-1119); só roda d'água exterior gira.
- Subsolo: pit x8..32, z44..75; interior 20×24,6 = 492 m²; refúgio 156 m² para "mãe e sobrinha" (2 pessoas); 3 tanques de água r0,62×h2,4 ≈ 8,7 m³; 4 velas O2 600 L. Cisterna 80 m³ só no texto (BOM 11), não modelada no subsolo.
- Textos inconsistentes: subsolo "400 m²" (comentário) vs "≈490 m²" (BOM 13) vs 492 real; jazida "600 m²" comentário vs 570; bambu "800" vs 728.
- NÃO verificado ainda: código das quadras (orientação/BLOCK), profundidade near/far exata (só estimativa).

## ORIENTAÇÃO (achado importante)
- Norte = +z (frente, voltado ao observador). Observador olha para o SUL ⇒ direita da tela (+x) = OESTE. Compass confirma (agulha rotY→π).
- Logo x− = LESTE, x+ = OESTE. Textos dizem o contrário em: linhas 289 (porteira "a oeste" está em x−49 = leste), 393 (silvic "bloco leste" x17..43 = oeste), 459, 477, 729, 1548, 443, 464 (despensa "sul-oeste" = sul-leste). Apiário "borda oeste" (x16..19) está certo.

## SOL (lat −22,404, lon −43,663, UTC−3, NOAA)
- Meio-dia: 21/jun 44,1° (11:57); 22/set 67,0°; 21/dez 88,9°. Nascer/pôr: jun az 64°/296° (6:37→17:14); set 89°/271°; dez 115°/245°.
- Horas de sol direto (alt>8°, céu limpo, geométrico) jun/set/dez: Quadras 9,1–9,2 / 10,5–10,8 / 11–12; horta 9,2/10,8/11,9; tanques 9,2/10,7/11,8; galinheiro 9,2/10,6/12; estufa 8,6/9,5/11,1; curral 9,2/10,8/12; jazida 9,2/10,7/11,9; telhado N do engenho (PV) 9,2/10,1/10,2.
- Casa: fachada N 8,5 h (jun) / 6,6 (set) / 0 (dez); fachada S 0/0/6,1; fachadas L e O ≈ 1 h (protegidas por bambu e eucalipto).
- DEFEITO: apiário só 2,3 h (jun) / 2,8 (set) / 3,8 (dez): sombra da Casa de manhã e do eucalipto à tarde. Reposicionar.
- Pomar: resultado inconclusivo (auto-sombra do modelo).

## PESQUISA (fontes lidas)
- Embrapa Meio-Norte 2020 (PreparoCanteirosCultivoHortalicas.pdf): canteiro 1 m larg × 3–10 m compr; ruas 50 cm; parede ~20 cm; orientação nascente–poente (L–O); sombrite 50% a 1,8–2 m. ATUAL: 5 × 24 m × 1,3 m, rua 0,6 ⇒ comprimento fora do oficial (eixo L–O correto).
- Embrapa Sisteminha (UFU/Fapemig 2019): tanque circular 4,4 m × 0,70 m ≈ 9.000 L (150 tilápias, ~30 kg); local plano, perto de energia e água, sem árvores; reposição ≤1.000 L/dia (500–800 L/dia para vegetais por tanque); sedimentador balde 60–80 L; biofiltro balde 18–20 L; quintal 100 m² viável, 1.500 m² "suficiente"; ciclo ~90 dias. ATUAL: sedimentador ≈500 L e biofiltro ≈270 L (grandes demais, 6×/14×). Dimensões de galinheiro/composteira/minhocário: NÃO constam.
- Embrapa frango de corte: 14 aves/m² em galpão (corte, confinamento), galpão L–O. Não vale para poedeiras (galinheiro atual 3,3 m²/ave = semi-extensivo). Fonte para poedeiras: pendente.
- Vassouras: 22°24′14″S 43°39′46″W, 434 m (Wikipedia). Clima (Climatempo, série 30 anos): chuva anual 1.587 mm; jun 32, jul 32, ago 31 mm (seca); jan 282 mm; mín/máx jul 14/23 °C, jan 21/29 °C.
- Sphere: água ≥15 L/pessoa/dia (até 20; 50 em contexto urbano); área coberta 3,5 m²/pessoa (4,5–5,5 com cozinha/banho); pé-direito 2 m (2,6 m clima quente). kcal 2.100: NÃO confirmado nas páginas lidas.
- FEMA P-361/P-320: 5 e 3 ft²/pessoa para eventos de MINUTOS — não serve para 90 dias.
- NASA (BVAD via NTRS 20190027563): O2 0,89 kg/dia, CO2 1,08 kg/dia, água potável 2,79 kg/dia, comida ≈1,76 kg/dia, calor 148 W por tripulante (astronauta 82 kg, 90 min exercício). NASA NTRS 20140016951: 25 m³ habitáveis/pessoa, sem reduzir para missões curtas.
- ASHRAE 62.2 (via calculadora): 7,5 cfm/pessoa + 0,03 cfm/ft². CO2 interno 700–1000 ppm = ventilação adequada.
- Iluminância EN 12464-1 (DIALux): forja 200–300 lx; solda 300; torno 300; usinagem precisão 500; trabalho de precisão 1000; inspeção 750. Tabela NBR ISO/CIE 8995-1: NÃO lida.
- Estilo: UFRRJ fundada 20/10/1910 (REPÚBLICA, não Monarquia); campus protegido por tombamento estadual (1998); artigo cita arquitetura neocolonial e participação de Eugênio Sigaud no Pavilhão Central. Fotos (ipatrimônio/UFRRJ): bloco longo de 2 pavimentos, paredes amarelo-ocre, pavilhão central branco ornamentado com frontão, arcada de arcos no térreo, janelas ritmadas, cornija e pilastras brancas, telhado cerâmico baixo, gramado com caminho de pedra, árvores grandes.
- Monarquia (Fazenda Santa Rita, Valença, INEPAC): casarão térreo sobre porão alto de pedra, esteios de madeira + pau-a-pique, 4 águas, cimalha de madeira, janelas guilhotina, portas almofadadas com bandeira, cunhais de madeira, terreiro de café, tulha anexa; senzala/engenho não localizados.
- Engenho histórico (Toda Matéria): casa-grande, senzala (chão batido), casa de moenda (boi/água/braço), casa das caldeiras/fornalhas (tachos de cobre), casa de purgar (formas), capela, curral.
- NÃO achei/confirmei: zona bioclimática NBR 15220 de Vassouras; declinação magnética; irradiação CRESESB; vento INMET; ZARC; Embrapa Agrobiologia; NR-12; tabela NBR 8995-1.

## CÁLCULOS MEUS (estimativa, não fonte)
- 6 pessoas × 90 d = 540 pessoa-dia. O2 NASA: 480 kg (≈335 m³) ⇒ selado 90 d impossível por velas. 4 velas = 2,4 m³ ≈ 3,4 kg ≈ 15 h de 6 pessoas.
- Reserva selada de 72 h: O2 16 kg (clorato ≈36 kg, NaClO3 ≈45% O2) e CO2 19 kg (cal sodada ≈60 kg).
- Ar fresco ASHRAE 62.2 p/ 984 m²: ≈363 cfm ≈ 617 m³/h.
- Água 15 L = 8,1 m³; 25 L = 13,5 m³ (atual 8,7 m³).
- Comida 2.100 kcal ⇒ ≈1,13 milhão kcal; seca ≈0,8 kg/p/dia ≈430 kg (teto NASA ≈950 kg).
- Energia: Pelton 3,5 kW = 84 kWh/dia (7,6 MWh em 90 d); carga essencial estimada 25–35 kWh/dia = 2,3–3,2 MWh; bateria térmica 320 kWh ≈ 10 dias; risco: seca jun–ago.
- Padrões dão ≈30–60 m² de refúgio para 6; o "dobro" pedido é decisão de projeto (conforto + oficina + lab), não exigência de norma.
- Dobrar área útil (492→984 m²) num só nível exige poço ≈42×32 m (x −6..36): invade núcleo Sisteminha. Poço x2..36 × z43..75 dá ≈750 m² (+50%). Dois níveis (−8 e −12,5) com poço ≈34×32 dão ≈1.200–1.400 m². Margem ao córrego (x43): parede em x36,6 deixa 6 m; trilho gravitacional (x36,5) precisa ir para x≈39,5.

## DECISÕES APROVADAS (04/11/2026) — Fase 3 liberada
0. Regra primordial: NENHUMA área é fixa; tudo pode ser reposicionado/redimensionado se a análise apontar posição melhor.
1. Bunker maior, quadrado ou retangular, até 1.750 m² no total, lados inteiros (25/30/35/40/45/50). Para não invadir o Sisteminha: reposicionar Sisteminha e/ou bunker.
2. "Cara de senzala": só estética.
3. Casa Grande: pesquisar plantas de casas de senhores de engenho e barões do café (séc. XIX) e copiar disposição de cômodos, escadarias, pilastras, madeiramento, telhados, portas/janelas, cozinha, banheiros, suítes, serviço, lazer, tamanho; estética de casarão antigo recém-reformado.
4. Orientação: escolha minha (mantida: norte = +z/frente; textos L/O corrigidos; L/O na bússola).
5. Estilo: fazenda imperial reformada p/ 2026: cercas, portões, câmeras, LED/neon, refletores à noite; ocre e branco, madeira escura, ferro fundido bruto, rebites e parafusos grossos, azulejo português, mármore branco; toques UFRRJ.
6. Sliders: sol (hora/estação) e velocidade de animação; unificar água+vento em um só; acelera tudo (animais, objetos móveis).
7. Parada de estilo na fachada: SIM. 8. Etiquetas 1ª pessoa: HUD + placas de porta.

## REGISTRO DE EXECUÇÃO (atualizado 06/11/2026)
- v10: casa corrigida (janelas, escada, balcão, prateleiras, cunhais, banheiros reconstruídos); animais se afastam; bambu ajustado.
- v11: quadras 20×25 m (500 m² cada, 2.000 m²): Q1 x−36..−16 z−44..−19; Q2 x−12..8 z−44..−19; Q3 x−36..−16 z−14..11; Q4 x−12..8 z−14..11.
- v12: bunker 2 níveis 25×31 (1.550 m²) no poço antigo. SUBSTITUÍDO pelo pedido abaixo.
- PEDIDO ATUAL (05/11): bunker 1 nível, 1.400 m² (40×35), piso a −8,7 m, SOB a Casa Grande (x−12..28, z−73..−38; casa x−12..14, engenho parcialmente). Suíte dos pais e do Mestre menores e mais mobiliadas; cama redonda com mosquiteiro (cúpula translúcida), cabeceira em arco, neon. Sobra redistribuída (irmã, sobrinha, convidado, estar 199 m², cinema/jogos, despensa).
- Terreno: poço antigo (x7..32,z44..75) removido; cobertura (laje+terra+grama) do bunker vira vidro com o slider de corte (capMat).
- Dutos: Pelton e moinho agora entram pela parede sul do bunker (x20 e x16, z−38,2).
- Backups: backup_v10/v11/v12.html. Código novo do bunker: n_bunker2.js. Estado: integrado no html, FALTA: etiquetas L:'u'/'B' antigas, setores (f/lift), textos BOM, teste, publicar v13.

## v13 publicada
- Bunker 1 nível 1.400 m² sob casa/engenho. Corte: terra + base/piso térreo da casa + telhado da casa somem (opacidade); setor Subsolo esconde casa/engenho.
- Detector coplanar no bunker: só postes finos de chuveiro (irrelevante).
- Falta: água/O2 para 7, quadras liberadas, horta, apiário, iluminação noturna, regressão (test/fp/moto).

## Fase 0 concluída (07/11)
- Projeto em scratchpad/refactor (git, commit 9d177b7). `npm test` = metrics + coplanar + fp + golden. Código do sítio intocado.
- Achado: 2 batches com vértices NaN (324 e 576) → 3 avisos no console. Corrigir em fase própria.
- Aguardando "segue" para Fase 1.

## Fase 1 concluída (07/11)
- refactor/: Vite 8.3.6 + vite-plugin-singlefile, three 0.128.0 npm, styles/ (6 arquivos, concatenação idêntica ao original), index.html, src/main.js. Build: dist/ (minificado, 651 KB) e dist-debug/ (testes).
- npm test = TUDO OK (metrics idênticas, coplanar idêntico, golden <0,25%, smoke minificado).
- Única mudança de lógica: guarda window.THREE removida. Aguardando "segue" para Fase 2.

## Fase 2 concluída (07/11)
- 0 var; Prettier; código morto removido; ganchos só com ?debug; teste interact novo. npm test OK. Aguardando "segue" para Fase 3 (constantes e dados).

## Fase 3 concluída (07/11)
- data/, config/, validate.js criados; npm test OK; main.js 5939 → ~4600 linhas.
- DIVERGÊNCIA de texto x geometria (não corrigida, aguardando decisão do Mestre): geometria dos cômodos (ROOMS) dá irmã 63,1 / sobrinha 53,1 / convidado 49,8 m²; texto BOM diz 58 / 47 / 44. Outro trecho do BOM (cap. de suporte de vida) diz hidroponia 131 m², despensa 66 m², oficina 98 m²; geometria: 117 / 53 / 102. Cômodos somam 1.311 m² úteis (1.400 m² brutos com paredes).
- Aguardando "segue" para Fase 4 (núcleo: Batch, materiais, renderer, geometria).

## Fase 3.5 e 4 concluídas (08/11)
- Textos de área alinhados à geometria (validate.js confere).
- NaN resolvido: rotação numérica em 2 chamadas (suíte cyberpunk: 9 painéis curvos + 16 luzes de teto invisíveis). Corrigido; agora visíveis.
- Pendente de decisão do Mestre: textos da Casa Grande ("24 × 19 m · 456 m² · cozinha 80 · despensa 55 · varanda 24 × 3,2") divergem da geometria (casa ≈ 26 × 20 m; cozinha ≈ 54; despensa ≈ 42). BOM sem capítulos 10–12.
- Aguardando "segue" para Fase 5 (renomeação).

## Proposta final de medidas (08/11)
- Arquivo: an/PROPOSTA_MEDIDAS_FINAL.md (tabelas + checklist E1–E5). Aguardando OK do Mestre. Decisões do Mestre na memória /areas/sitio-vale-do-cafe.md.

- CORRECAO (08/11, T1): o BOM TEM os capitulos 10-12 (Armazenamento de energia, Hidrologia, Telecomunicacoes) desde a v13; a frase "BOM sem capitulos 10-12" acima e o comentario de cabecalho de src/data/bom.js ("01-09 e 13-25") estavam errados. B8 apenas reescreve os capitulos 10-12 (e os que citam areas) para o novo projeto. Decisao n.1 retirada do Plano Mestre.
