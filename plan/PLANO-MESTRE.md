> Instantâneo do Claude Doc "Plano Mestre — Sítio Vale do Café", revisão 48, de 15/11/2026. O documento vivo (https://claude.ai/artifact/1VKGNp9HHzdxYZD51jeTES) manda: se divergir, vale o vivo. Como atualizar esta cópia: LEIA-ME-RETOMADA.md, seção 9.

# Plano Mestre — Sítio Vale do Café

2026-11-08 · @Marcus Philippe

## 1. Visão geral

O plano tem 17 etapas em cinco blocos: testes (T), código limpo (A), novo modelo (B), sistemas e interface (C) e entrega (D). O início foi a Fase 0, a rede de segurança. O ponto atual é a etapa A1 concluída, com a próxima etapa em A2. O fim é a D2, a publicação da versão final no mesmo link do Artifact.

Por que esta ordem:

1. **Código antes do modelo.** Com o visual congelado, o hash da cena e as imagens de referência provam que a limpeza não mudou nada.
2. **Modelo depois da divisão do mundo.** Com cada cômodo parametrizado por retângulo, mudar o bunker é trocar dados, não reescrever funções de 100 linhas.
3. **Sistemas e interface por último.** Eles não mudam o visual, então o novo modelo chega ao Mestre já no Marco 2.

Marcos: M0 (feito) Fases 0 a 4 · M1 após A2, código limpo e modular · M2 após B8, novo modelo publicado como v14 · M3 após D2, versão final v15.

[embed: incorporado]

Cada faixa é um bloco e cada losango é um marco, com o critério sob ele. Só o bloco B, em destaque, muda o visual.

Cada etapa termina com testes, commit, relatório curto e parada até o seu "segue". Os sub-passos dentro de uma etapa rodam em sequência, com teste rápido entre eles.

## 2. Painel de progresso

Em 23/11/2026 as etapas T1, A1, A2 e B0 estão concluídas: o Mestre escolheu o arranjo M do lote (captura de 22/11) e o bunker ±2,5 m (48×32) girado 90°. O Bloco E (energia) começou: E1 feita; a próxima é a E2. As Pranchas e este documento no Claude Docs ainda mostram as opções antigas. Marque cada etapa ao terminá-la.

- M0 — Fases 0 a 4: rede de segurança, estrutura, modernização, dados e núcleo (último commit: 9dd563f)
- T1 — Rede de testes reforçada (último commit: 3b1c33e)
- A1 — Renomeação em inglês (último commit: 5c7f8b5)
- A2 — Divisão do mundo em módulos (Marco 1) (último commit: d70644f)
- B0 — Pranchas de projeto, com aprovação do Mestre (concluída em 23/11: lote = arranjo M, bunker ±2,5 m girado 90° em x −5, z −35)
- B1 — Bunker: casca, cotas e circulação
- B2 — Bunker: ala privada
- B3 — Bunker: convivência e armazenagem
- B4 — Bunker: técnico, produção e luz solar
- B5 — Casa Grande e sobrado
- B6 — Lotes de produção
- B7 — Zona de animais e infraestrutura
- B8 — Textos, BOM e publicação da v14 (Marco 2)
- C0 — Paleta enxuta: unificar cores próximas e mover as 296 cores soltas para a paleta (com aprovação do Mestre)
- C1 — Sistemas
- C2 — Interface
- C3 — Robustez
- D1 — Qualidade final
- D2 — Entrega da versão final v15 (Marco 3)

Bloco E (energia, entre a B0 e a B1; seção 5): E1 feita em 14/11 (cargas e planilha; commits 565bf2b, 9d9123e e bc3eda2). E2 recursos (`plan/energia-recursos.json`) feita em 23/11, E3 geração (`plan/E3-painel.md`, rebanho aprovado + NASA POWER diária 2005–2024) feita em 24/11 e E4 armazenamento (`plan/energia-armazenamento.json`, `plan/E4-painel.md`; sala 10×10 mantida sem reabrir B0) concluída em 24/11; pesquisa base em `plan/armazenamento-pesquisa.json` e `plan/referencias/`. Próxima: E5 gases. Em outra janela, abrir primeiro o LEIA-ME-RETOMADA.md do repositório.

Fases antigas e etapas novas: Fases 0 a 4 = M0 · Fase 4.5 (medidas) = B0 a B8 · Fase 5 = A1 · Fase 6 = A2 · Fase 7 = C1 · Fase 8 = C2 · Fase 9 = C3 · Fase 10 = T1 e D1 · Fase 11 = D2.

## 3. Regras de cada etapa

1. Uma etapa por vez. Ao terminar, envio um relatório de cinco linhas e paro até o seu "segue".
2. Os sub-passos de uma etapa rodam em sequência, com a suíte rápida entre eles. Se um teste falhar, paro e reporto.
3. Carimbo de tempo: cada passo concluído (comando, teste, commit) recebe a hora de Brasília, a duração desde o passo anterior e o tempo acumulado da etapa. Cada tarefa do contador "Passo N de M" ganha no título "✓ hora · duração". Quem mede é tools/passo.sh, com log em logs/ (fora do git); o relatório de fim de etapa traz os tempos e o total. Pausas (limite de tokens, espera pelo "segue") são marcadas com --retomar e não contam no tempo.
4. Partes pequenas: cada sub-passo termina com suite rápida, commit e carimbo, e então o Claude PARA e espera o "segue" (pedido do Mestre em 11/11, porque os tokens acabam no meio dos processos). Nada fica pela metade: se o limite de tokens chegar, o último commit é um ponto seguro de retomada.
5. Esforço do modelo: antes de cada "segue", o Claude avisa qual nível de esforço a próxima parte pede (padrão Médio) e, sempre que for preciso subir (decisão de projeto, teste rígido, dependências entre módulos), avisa antecipadamente para o Mestre aumentar. Max e Extra só com aviso explícito. Toda mensagem de commit leva o carimbo de tempo do passo (hora · duração), como sai de tools/passo.sh.
6. Fim de etapa: suíte completa, commit "Etapa X", painel marcado neste documento e uma linha na memória do projeto.
7. Blocos T, A e C: o visual fica congelado. O hash da cena e as imagens de referência precisam ficar idênticos.
8. Bloco B: o visual muda. Eu reviso as imagens, o Mestre vê o resultado, e só então regravo o hash e as imagens de referência.
9. Números nos textos vêm da geometria (gerados dos dados), nunca digitados à mão.
10. Medidas seguem a regra do Mestre: números terminados em 0 ou 5; aumentar quando cabe, reduzir para baixo quando não cabe; as exceções dele prevalecem.
11. Fora de escopo, por decisão do Mestre: ciclo dia/noite, clima, som e as demais ideias extras da pesquisa web.

## 4. Portão de testes

Toda etapa passa por dois portões: a suíte rápida (≈ 1 min) depois de cada sub-passo e a completa (≈ 1,5 min) no fim da etapa. Metas da T1: 2 e 4 min; medido: 60 s e 83 s.

| Teste | Roda em | O que pega |
|---|---|---|
| Lint e formatação | rápida | erros de código, nomes não declarados, funções acima de 80 linhas |
| Testes unitários (vitest), novo na T1 | rápida | Batch, cores, gerador aleatório, dados e áreas |
| Build | rápida | falha de empacotamento |
| Hash da cena, novo na T1 | rápida | qualquer mudança de geometria ou da ordem do gerador aleatório |
| Métricas | rápida | malhas, triângulos, chamadas de desenho e avisos do three (meta: 0) |
| 1ª pessoa | rápida | caminhar pelo bunker e pelos 7 pontos |
| Interação | rápida | cliques em todos os botões e sliders, sem erro |
| Fumaça minificada | rápida | o build final abre |
| Imagens de referência (em paralelo na T1) | completa | diferença acima de 0,5% em alguma das vistas |
| Coplanares | completa | superfícies sobrepostas acima do limite |
| Layout, novo no Bloco B | rápida | lotes e árvores sobrepostos, cômodos fora do bunker, áreas que não somam, tubo de luz que não liga a superfície ao cômodo |

Blocos T, A e C: hash e imagens idênticos. Bloco B: hash e imagens mudam só onde esperado, são revistos e regravados.

Metas iniciais, a calibrar na D1 com o Moto G52 emulado: até 450 mil triângulos (hoje 345.576), 220 chamadas de desenho (hoje 168), HTML final até 900 KB (hoje 742 KB) e 0 avisos do three.

## 5. Etapas

Cada linha é uma etapa. Esforço: P pequeno, M médio, G grande. Toda etapa termina com a suíte completa, commit e parada.

### Bloco T — rede de testes

| Etapa | Faz | Testes ao fim | Aceite |
|---|---|---|---|
| T1 (M) | Testes unitários (vitest) de core/ e data/; hash da cena; imagens de referência em paralelo; scripts `test:fast` e `test`; `npm run save` (backup git bundle + zip). Não altera o código de produção. | Rápida e completa no código atual; hash base gravado. | Pelo menos 25 testes unitários; rápida em menos de 2 min; completa em menos de 4 min; 0 avisos. |

### Bloco A — código limpo, com o visual congelado

| Etapa | Faz | Testes ao fim | Aceite |
|---|---|---|---|
| A1 (M) | Renomeia para inglês, por AST, em 3 lotes: (a) batches e grupos (W2 → wallBatch, R2 → roofBatch, LI → bunkerBatch); (b) funções (fl → addGroundFloor, cl → addWallCollider); (c) estado e câmera (st → viewTarget, fp → walker, dio → diorama). Nomes de domínio ficam: casa, engenho, sisteminha, quadras. | Rápida depois de cada lote; completa no fim. | Zero nomes antigos (script `check-old-names`); hash e imagens idênticos; lint limpo. |
| A2 (G) | Divide o mundo em 5 sub-passos: (a) terreno, estratos, córrego, lavouras e árvores; (b) casa e sobrado; (c) engenho e roda d'água; (d) bunker, cada cômodo um módulo parametrizado por retângulo; (e) animais, sisteminha e tanque. | Rápida depois de cada sub-passo; completa no fim. | `main.js` com no máximo 400 linhas; nenhuma função acima de 80 linhas; hash e imagens idênticos. Marco 1: backup enviado ao Mestre. |

### Bloco B — novo modelo

O visual muda neste bloco. Cada etapa regrava imagens e hash depois da revisão. As medidas completas estão na seção 6.

| Etapa | Faz | Testes ao fim | Aceite |
|---|---|---|---|
| B0 (P) | Duas pranchas desenhadas com todas as medidas: planta do bunker (−10 m) e implantação do lote. Um script confere a soma das áreas e as sobreposições. | Script de layout sobre os dados das pranchas. | O Mestre aprova as duas pranchas. Nenhum código de produção muda. |
| B1 (G) | Bunker: piso −10 m, pé-direito 3 m, topo −7 m; pegada ≈ 50×40; escavação, laje e corte; galeria de 5 m; escadaria, monta-carga e saída 2. Todos os ambientes viram volumes com parede, porta e piso, sem mobília. | Rápida + layout; 1ª pessoa percorre a galeria; imagens do corte regravadas. | Ambientes ocupam a pegada (±0,5 m²); a escada chega à superfície; metas de desempenho mantidas. |
| B2 (M) | Ala privada: suíte do Mestre 10×9, pais 9×5, três quartos de 3,5×5 com banheiro 3×2, cama de casal e guarda-roupa (convidado com beliche). | Rápida + layout; 1ª pessoa entra em cada quarto; uma imagem nova por tipo de quarto. | Áreas dos textos iguais à geometria. |
| B3 (M) | Convivência e armazenagem: estar, jantar e cozinha 15×15 com fogão de indução; cinema 10×10; despensa 5×10 (estoque para 12); adega e queijaria 5×10; enfermaria 5×5. | Rápida + layout; imagens novas. | Despensa dimensionada para 12 pessoas por 90 dias. |
| B4 (G) | Técnico e produção: suporte de vida, baterias e água (10×10 cada); hidroponia 10×10 em 3 níveis; datacenter; laboratórios 5×15; sala limpa 5×10; oficina. Tubos de luz com heliostat (estar, cozinha, quartos) e fibra nos corredores. | Rápida + layout (cada tubo liga a superfície a um cômodo); imagens novas. | 3 níveis de hidroponia visíveis; baterias em compartimento próprio. |
| B5 (M) | Casa Grande e sobrado 25×20: térreo, sobrado, varanda 25×5 e colisões. | Rápida; 1ª pessoa no térreo e no sobrado; imagens. | Textos da casa iguais à geometria (resolve a divergência atual: texto 24×19, modelo 26×20). |
| B6 (M) | Lotes de produção: quadras 4×(25×30); núcleo Sisteminha 25×30; estufa 7,5×20 com bancadas em níveis; pomar; bambuzal 25×25 (touceiras a 6 m); silvicultura 25×25 (eucalipto 3×2 m); jazida 20×25; engenho 20×10. | Rápida + layout + árvores (distância mínima por espécie); imagens. | Nenhuma sobreposição; margens entre lotes definidas na B0. |
| B7 (G) | Zona de animais e infraestrutura: caprinos e suínos em 2 terraços de aterro (aprisco ripado 5×5, pocilga); biodigestor enterrado 10×5; tanques de peixe; galinheiro 5×5 sobre minhocário, com 4 piquetes de 10×10; galpão técnico 10×15 com laje-jardim; painéis nos telhados. | Rápida + layout + cotas (cada degrau da cascata fica abaixo do anterior); imagens. | Cascata por gravidade: o dejeto desce do aprisco ao biodigestor e ao tanque. |
| B8 (M) | Textos, BOM e fechamento: números do BOM gerados dos dados; capítulos 10 a 12 (energia, água e telecom) reescritos para o novo projeto; setores, câmeras e rótulos; fontes e marca "estimativa". Publica a v14 no mesmo link. | Completa; metas de desempenho; validação cruzada texto × geometria. | Nenhum número digitado em texto; 0 erros de validação; v14 no ar (Marco 2). |

### Bloco C — sistemas, interface e robustez

Exceto na C0 (cores unificadas, com imagens de referência regravadas só após aprovação), o visual volta a ficar congelado: hash e imagens idênticos ao fim de cada etapa.

| Etapa | Faz | Testes ao fim | Aceite |
|---|---|---|---|
| C0 (G) | Paleta enxuta, em 4 passos: (1) inventário das 281 cores hoje espalhadas (116 na paleta, 170 soltas); (2) agrupar as parecidas por distância de cor e propor a lista reduzida, com amostras lado a lado, para o Mestre aprovar; (3) aplicar o mapa antigo → novo; (4) mover tudo para config/palette.js e trancar com regra de lint (sem cor 0x fora da paleta). Meta: bem menos cores, sem mudar o desenho. | Rápida em cada passo; completa no fim. Hash e imagens de referência mudam de propósito: regravo só depois do OK do Mestre, com antes e depois lado a lado. | Nenhuma cor 0x fora de config/palette.js; total de cores bem menor, no tamanho aprovado; nenhuma peça troca de cor de forma visível sem aprovação; 0 avisos de lint. |
| C1 (G) | Sistemas: câmera, `computeCutaway`, 1ª pessoa, `frame()` dividido em passos curtos, animais, água, sol e qualidade gráfica; `subView` vira `viewState`. | Rápida depois de cada sistema; completa no fim, com interação e 1ª pessoa. | Nenhuma função acima de 80 linhas; hash e imagens idênticos; metas de desempenho mantidas. |
| C2 (M) | Interface: sem `innerHTML` com dados, módulo `dom.js`, atributos aria e uso pelo teclado. | Rápida + varredura de `innerHTML`; interação só com teclado (Tab, Enter, Esc). | Zero `innerHTML` com dados; todo botão e slider alcançável pelo teclado. |
| C3 (M) | Robustez: sem WebGL, `localStorage` com try/catch, perda de contexto e dados inválidos. | Fumaça com 4 falhas simuladas: sem WebGL, armazenamento bloqueado, contexto perdido, dado inválido. | Cada falha mostra mensagem em português; nunca tela em branco. |

### Bloco D — qualidade final e entrega

| Etapa | Faz | Testes ao fim | Aceite |
|---|---|---|---|
| D1 (M) | Qualidade final: perfil no Moto G52 emulado (≈ 412×915, CPU 4× mais lenta); metas de desempenho calibradas; comparativo antes e depois; README atualizado. | Completa + perfil no celular emulado. | Metas calibradas cumpridas; README com os números finais. |
| D2 (M) | Entrega: build final; publica a v15 no mesmo link; confere o conteúdo publicado; notas da versão; memória; backup final. | Completa no build final; o HTML publicado é lido de volta e comparado com o build. | v15 no ar e idêntica ao build; backup enviado ao Mestre (Marco 3). |

### Bloco E — Energia (nova, pedida em 14/11; fica depois da B0 e antes da B1)

Calcular o consumo total, dimensionar geração adequada e redundante com os meios do sítio e só depois dimensionar o armazenamento: calor puro (água quente, sauna, piscina aquecida anexa à Casa Grande) e eletricidade para viver 100% off-grid. Cada parte termina com a suíte rápida, commit e carimbo; o Mestre manda "segue" antes de cada uma. A sala de baterias do bunker fica com 10×10 provisório até a E4.

1. E1, cargas (FEITO em 14/11, commits 565bf2b, 9d9123e e bc3eda2; esforço Médio): lista de tudo que consome, em kWh por dia e pico em kW: bunker (hidroponia LED, datacenter, oficina, ar e O₂, água), Casa Grande, Engenho, bombas, sauna e piscina. Saída: planilha.
2. E2, recursos do sítio (Médio, com pesquisa na web): sol (latitude, pior mês), vento, córrego (vazão e queda para microhidro), biodigestor, biomassa (bambuzal e silvicultura), calor do solo; dados oficiais (CRESESB, INMET).
3. E3, geração com redundância (Alto): quanto de cada fonte e o que cobre a falha de outra (sem sol, sem vento, córrego seco).
4. E4, armazenamento (Alto): elétrico (7 opções pesquisadas em 14/11: água salgada, fluxo de ferro ou vanádio, ferro-ar, níquel-ferro, chumbo tubular, sódio-íon, calor em areia ou sal) e térmico, dimensionados pela autonomia; se a sala de baterias mudar de tamanho, reabrir só essa sala no solver.
5. E5, gases (Médio): bateria selada, saída para filtro e ventilação; hidrogênio em botijão só como opção estudada, pois pede norma.

Decisões do Mestre (14/11): piscina coberta e aquecida de 5×18 m dentro de um puxadinho de 7×20 m, colado ao lado longo da Casa Grande e já no lote; autonomia de 3 dias sem geração; hidrogênio capturado para armazenamento de gases (bateria selada com saída para filtros e botijões; ele perguntou se funciona junto com o biodigestor); hidroponia de 100 m² de dossel (40 m² de alto sustento e 60 m² de ervas de alto valor para renda); ruído do bunker se resolve com isolamento termoacústico e as afinidades entre cômodos mantêm peso alto. Resultado da E1 [estimativa]: 444 kWh/dia elétricos (pico simultâneo 53 kW) e 141 kWh/dia térmicos; com 3 dias de autonomia o armazenamento mínimo é 1.333 kWh elétricos e 423 kWh térmicos. Pendente do Mestre: conferir as estimativas de carga na planilha plan/energia-cargas.xlsx.

## 6. Especificação alvo das medidas

São as medidas que o modelo deve ter ao fim do Bloco B. A B0 as transforma em pranchas e o Mestre aprova. A B6 entrega os lotes (terreno, cercas e plantios) e a B7 entrega as construções e os animais dentro deles. Medidas em metros, largura × profundidade; áreas em m². [F] marca fonte e [E] marca estimativa.

### Bunker

Piso em −10 m, pé-direito de 3 m, topo em −7 m (7 m de terra por cima), nível único. A pegada fica perto de 50×40: áreas úteis mais cerca de 12% de paredes. O bunker pode passar de 1.400 m² sem reduzir nenhum cômodo.

| Ambiente | Medida | Área |
|---|---|---|
| Suíte do Mestre | 10×9 | 90 |
| Suíte dos pais | 9×5 | 45 |
| Quarto da irmã, com suíte 3×2, cama de casal e guarda-roupa | 3,5×5 | 17,5 |
| Quarto da sobrinha, igual ao da irmã | 3,5×5 | 17,5 |
| Quarto do convidado, igual, com beliche | 3,5×5 | 17,5 |
| Estar, jantar e cozinha | 15×15 | 225 |
| Cinema e jogos | 10×10 | 100 |
| Despensa: estoque para 12 pessoas por 90 dias, com grãos | 5×10 | 50 |
| Adega e queijaria | 5×10 | 50 |
| Enfermaria | 5×5 | 25 |
| Hidroponia em 3 níveis com LED | 10×10 | 100 |
| Oficina maker | 10×10 | 100 |
| Datacenter | 10×10 | 100 |
| Laboratórios | 5×15 | 75 |
| Sala limpa | 5×10 | 50 |
| Suporte de vida (ar, O₂, CO₂) | 10×10 | 100 |
| Baterias e energia, em compartimento próprio | 10×10 | 100 |
| Reserva e tratamento de água (≥ 22 m³) [E] | 10×10 | 100 |
| Escadaria principal 5×10 e monta-carga 5×5 | — | 75 |
| Saída de emergência 2, lado do campo | 5×10 | 50 |
| Galeria principal, para empilhadeira e fuga | 40×5 | 200 |
| **Total útil** |  | **1.687,5** |

A escada tem cerca de 55 degraus, por isso o monta-carga e a segunda saída. O lençol freático a −10 m depende de laudo geotécnico.

### Casa Grande

Pegada de 25×20 nos dois pavimentos.

| Pavimento e faixa | Divisão |
|---|---|
| Térreo, coluna A (5 de largura) | cozinha 5×10, copa 5×5, capela 5×5 |
| Térreo, coluna B (15) | jantar 15×5, visitas 15×5, hall e escadaria 15×10 |
| Térreo, coluna C (5) | escritório 5×10, despensa de catástrofe 5×5, banheiros coletivos em módulo 5×5 com sala de banho 3×3,5 |
| Varanda | 25×5, fora da pegada |
| Sobrado, fundos (10 de profundidade) | suíte E 10×10, sala íntima 5×10, suíte F 10×10 |
| Sobrado, meio (5) | corredor 25×5 |
| Sobrado, frente (5) | 4 suítes 5×5 e escada 5×5 |

### Sítio (lote 100×150 = 15.000 m²)

| Item | Medida | Área | Observação |
|---|---|---|---|
| Engenho | 20×10 | 200 | o córrego, a partir de x = 43, limita o lado |
| Quadras de rotação (milho, mandioca, feijão, com adubação verde) | 4×(25×30), em 2×2 com vãos de 5 m | 3.000 | posição provisória x −48 a 7, z −44 a 21, abaixo da estrada; a demanda pede 3.000 a 4.000 m² [E] |
| Núcleo Sisteminha | 25×30 | 750 | 2 tanques de 10 m³ (≈ 108 kg de peixe por ano em cada) [F], galinheiro 5×5 sobre minhocário (40 aves), 4 piquetes de 10×10 e horta |
| Estufa | 7,5×20, bancadas em níveis | 150 | nave única; tomate protegido 10,2 kg/m² por ciclo [F]; gotejo com timer e sensores |
| Zona de caprinos e suínos | 15×15, em 2 terraços de aterro | 225 | alto: aprisco ripado 5×5 (≈ 20 animais) e pocilga de ≈ 10 m²; médio: biodigestor enterrado 10×5; baixo: liga ao núcleo (tanques e horta) |
| Galpão técnico | 10×15, com laje-jardim | 150 | horta e pomar em vasos na laje (≈ 150 m²); inversores e baterias no subsolo; painéis nos telhados |
| Bambuzal | 25×25, touceiras a cada 6 m | 625 |  |
| Silvicultura | 25×25, eucalipto 3×2 m | 625 | lenha só para o forno e o engenho |
| Jazida de argila | 20×25 | 500 |  |
| Pomar | 25×40 no mínimo | 1.000 | local definido na B0 |

Os dez itens somam 7.225 m²; com a casa e a varanda (25×25 = 625 m²) chegam a 7.850 m² dos 15.000 m² do lote. O resto é estrada, córrego, garagem e margens.

A cascata por gravidade desce do aprisco (terraço alto) ao biodigestor (médio) e ao tanque de peixe (baixo), sobre o aterro feito com a terra escavada do bunker. O biogás estimado, de 1 a 2 m³ por dia [E], não cobre um fogão para 7 pessoas: o fogão principal é elétrico, de indução, e o biogás fica para o forno e o aquecimento de água. Painéis nos telhados: ≈ 90 m² para ≈ 13 kWp (≈ 20.000 kWh por ano) [E].

Fontes: Embrapa (Sisteminha, efluente de suínos, aprisco ripado, lagoa coberta), Pesagro (tomate protegido), IEA-SP (tilápia), Conab 2025/26 (milho e feijão), UnB (alface em NFT), Thunder Said Energy (agricultura vertical) e MDPI 2023 (tubos de luz, fibra ótica e heliostat). O detalhe de cada número está no arquivo PROPOSTA_MEDIDAS_FINAL.md, já enviado ao Mestre.

## 7. Decisões pendentes do Mestre

Nenhuma decisão bloqueia a T1 nem o Bloco A. Se o Mestre não responder, vale o padrão adotado. A última coluna diz em que etapa a decisão precisa estar fechada.

| Nº | Decisão | Padrão adotado | Fecha em |
|---|---|---|---|
| 1 | Área das quadras: 3.000 m² (4×25×30) ou 4.000 m² | 3.000 m²; 4.000 m² exigiria realocar a estrada | B0 |
| 2 | Local do pomar de 25×40 | perto do núcleo Sisteminha, marcado na prancha | B0 |
| 3 | Armazém de grãos | dentro da despensa 5×10, sem cômodo novo | B3 |
| 4 | Publicação intermediária | v14 ao fim do Bloco B (Marco 2); a v15 é a versão final | B8 |
| 5 | Backup fora do ambiente de trabalho | arquivo enviado ao Mestre em cada marco; GitHub privado é opcional | T1 |

Fora do modelo, antes de qualquer obra real: laudo geotécnico (lençol freático perto de −10 m), cálculo estrutural da laje-jardim e do bunker, e validação das estimativas [E] com um técnico (rebanho de 10 a 12 cabras e 6 suínos, biogás de 1 a 2 m³ por dia, ≈ 13 kWp de painéis).

## 8. Riscos e salvaguardas

| Risco | Salvaguarda |
|---|---|
| O gerador aleatório muda a cena sem querer, porque a ordem das chamadas decide tudo | o hash da cena (T1) acusa a primeira diferença; no Bloco B o hash só é regravado depois da revisão |
| O modelo fica pesado no celular | metas de triângulos, chamadas de desenho e tamanho do HTML em toda etapa; corte de detalhes se passarem; calibragem na D1 com o Moto G52 emulado |
| Texto e geometria divergem | números gerados dos dados e validação cruzada na B8 |
| Lotes, cômodos ou árvores se sobrepõem | teste de layout na suíte rápida a partir da B0 |
| Uma renomeação quebra algo sem aparecer | renomeação por AST em 3 lotes, suíte rápida depois de cada lote e o script `check-old-names` |
| O ambiente de trabalho some | git bundle e zip em cada marco, este documento e a memória do projeto |
| Os tokens acabam no meio de uma etapa | etapas pequenas, commit a cada sub-passo e o protocolo de retomada (seção 9) |
| Uma estimativa vira fato | toda estimativa leva a marca "estimativa" no modelo e no BOM |

## 9. Protocolo de retomada e backup

Para continuar depois de uma interrupção, por falta de tokens ou por perda do ambiente:

1. Ler o Painel de progresso (seção 2) e a memória do projeto (`/areas/sitio-vale-do-cafe.md`).
2. No repositório `refactor`, rodar `git log --oneline -5` e `git status`. O último commit precisa bater com o Registro (seção 10) e a árvore deve estar limpa.
3. Rodar o teste rápido, `npm run test:fast`.
4. Continuar pela primeira etapa desmarcada do Painel e, dentro dela, pelo primeiro sub-passo sem commit.
5. Se o ambiente sumiu: clonar do bundle mais recente (`git clone <arquivo>.bundle refactor`), rodar `npm ci` e o teste rápido.
6. Ao fim de cada etapa: commit "Etapa X", painel marcado, uma linha no Registro (com passos e tempo da etapa) e uma linha na memória. Em cada marco: `npm run save` e envio do arquivo ao Mestre.
7. Cronômetro: se a pasta logs/ sumiu, tools/passo.sh --inicio ETAPA recomeça a contagem; os tempos das etapas já concluídas estão no Registro.

Em uma janela nova do Claude: abrir o LEIA-ME-RETOMADA.md (raiz do repositório e do bundle), que reúne tom, regras, decisões, estado, comandos e os próximos passos.

Notas de operação:

- Os testes usam o Playwright já instalado: `export NODE_PATH=/home/claude/.npm-global/lib/node_modules`.
- Cada chamada de ferramenta dura no máximo 2 minutos. Suítes longas rodam em segundo plano com `nohup`, e a saída é lida do arquivo de log. A suíte rápida leva ≈ 1 min e a completa ≈ 1,5 min.
- Coordenadas do modelo: x+ aponta para o oeste e z+ para o norte. A casa tem origem em (1, 0, −58) e o engenho em (32, 0, −38). O lote vai de x −50 a 50 e de z −75 a 75; o córrego ocupa x 43 a 48 e a estrada z 25,5 a 30,5.
- O bunker antigo, a ser substituído na B1, ocupa x −12 a 28 e z −73 a −38, com piso em −8,9.

## 10. Registro de execução

Mais recente primeiro. Cada etapa concluída ganha uma linha com data, commit, resultado dos testes, número de passos e tempo gasto.

- 23/11/2026 — B0 fechada (B0-6): o Mestre escolheu o arranjo M (captura de 22/11, silvicultura encolhida para 20×27,5) e confirmou folga de 0 m entre itens, com 0 a 2,5 m para reajustar quando preciso (`folga_reajuste`, ainda sem uso no código). `plan/site.json` agora tem os itens e a estrada de M; `plan/bunker.json` ganhou `mundo.giro = 1` (planta girada 90° no sentido horário, x0 −5, z0 −35) e a régua do bunker (`tools/layout-lib.mjs`) aplica o giro; a Casa Grande não prende mais o bunker (só aviso). Só a opção de bunker escolhida é cobrada no mundo (escotilha ≥10 m da casa e ≥2 m dos itens, córrego a 5 m); o plano nominal de 50×40 e as opções exato e ±1 m não cabem na escotilha neste lote. `plan/lote-opcoes.json` ficou só com M; as outras opções e arranjos do solver (S1, S2) estão no git e em `plan/arranjos/`. Regras testadas contra o plano congelado em `tests/fixtures/`; o plano adotado, em `tests/unit/plano.test.js`. Testes unitários 198 ok; `layout-check` ok; `npm test` só falha o golden (3 imagens com diferença de 0,6–0,8%, as mesmas sem as mudanças de hoje). `tools/pack-bunker.py` ainda não conhece o giro.
- 15/11/2026 — B0-5e-4a feita (commit 0c42245): Prancha 2 republicada (v5) com o plano atual e três variantes da estrada na divisa do lote (A frente, B oeste, C fundos) e métricas; viagens 1005, 1055 e 1005 contra 1062 do plano atual. Pendentes: opção com todo o espaço livre num bloco só, rede de caminhos ramificados com atalhos e a escolha do Mestre.
- 14/11/2026 — Bloco E iniciado: E1a e E1b feitas (commits 565bf2b e 9d9123e) e hidroponia ajustada para 100 m² (bc3eda2). 28 cargas elétricas e 5 térmicas: 444 kWh/dia elétricos e 141 kWh/dia térmicos [estimativa]; armazenamento mínimo de 3 dias: 1.333 kWh elétricos e 423 kWh térmicos. Planilha plan/energia-cargas.xlsx com 118 fórmulas.
- 14/11/2026 — B0-4 e B0-5 por solver CP-SAT: bunker ±2,5 m (48×32, 1.536 m², commit 1d46188) e lote Equilíbrio (viagens 1062 contra 1136; sombra no núcleo 0,4 h; commit 8f37ec6), aprovados pelo Mestre; puxadinho da piscina 7×20 no lote (a60185d). Ferramentas: tools/pack-bunker.py, pack-lote.py, layout-lib.mjs e lote-lib.mjs. Limite medido na B0-5e-2: com a estrada no meio só sobram 4,5 m de profundidade livre (12 m se a casa e o bunker andarem 2,5 m); com a estrada na divisa, cerca de 19 m.

- 12/11/2026 — B0 feita, aguardando o OK do Mestre (commit 23fbbdf): planta do bunker (23 ambientes, pegada 50×40, ramal de serviço novo 5×15, vazios 237,5 m²) e implantação do lote (11 itens, margem 2 m, quadras giradas 30×25, pomar a oeste do núcleo). Script tools/layout-check.mjs na suíte rápida (passo layout). Pranchas em https://claude.ai/artifact/48PHoR5oMZmze8p1qathX4. Pendente: destino de ~6.000 m³ de terra [estimativa]. Suíte rápida 63 s. Tempo: 9 min 33 s em 3 passos cronometrados. Backup do Marco 1 dispensado pelo Mestre.
- 12/11/2026 — Etapa A2 concluída (commit d70644f): main.js de 4.909 para 77 linhas, em 70 arquivos de src/ (core, world, bunker com um módulo por cômodo, ui, app). Subpassos na ordem de construção: a = base, terreno, sisteminha e flora; b = engenho e casa; c = pátio até animação; d = bunker (14 cômodos por roomRect); e = interface e laço. Nenhuma função acima de 80 linhas, lint com 0 avisos, README atualizado. Hash da cena idêntico, golden 0,000% nas 6 capturas, coplanar 1.726. Suíte rápida 60 s (meta 120), completa 83 s (meta 240). Tempo: 33 min 19 s em 12 passos cronometrados. Marco 1 (backup) aguarda a autorização do Mestre.
- 10/11/2026 — Etapa A1 concluída (commit 5c7f8b5): 60 nomes crípticos em inglês, por AST, em 3 lotes (30 lotes de geometria, 20 funções, 10 de estado e câmera; 1.169 trocas), com npm run check:names na suíte rápida. W2 virou casaWallBatch e não wallBatch, porque W1 é parede do engenho. Hash da cena idêntico, golden 0,000% nas 6 capturas, coplanar 1.726 (sem aumento), build minificado idêntico após os lotes a e b. Suíte rápida 54 s (meta 120), completa 73 s (meta 240). Fora da A1: constantes locais crípticas (FL, WB, RB…) e as importadas (K, PAL, GF…). Tempo: 11 min em 6 passos cronometrados.
- 09/11/2026 — Etapa T1 concluída (commit 3b1c33e): 102 testes unitários, hash da cena, golden com tempo virtual (97 s → 16 s, 0,000% entre execuções, referências regravadas com diferença ≤ 0,20%), interação 69 s → 17 s, npm run save e cronômetro. Suíte rápida 60 s (meta 120), completa 83 s (meta 240), 0 avisos do three. Sensibilidade provada com estragos propositais em cada rede. O golden não vê desvio pequeno de cor; o hash da cena vê. Tempo: 23 min em 17 passos cronometrados (T1a a T1c, anteriores ao cronômetro, não contam).
- 08/11/2026 — Backup do Marco 0: bundle git (4,5 MB) com todo o histórico até 9dd563f, verificado e restaurado em pasta de teste; enviado ao Mestre.
- 08/11/2026 — Plano Mestre criado: 17 etapas em 5 blocos. Próxima etapa: T1, à espera do "segue" do Mestre. Última versão publicada do site: v13.
- 08/11/2026 — Fase 4 concluída (commit 9dd563f): núcleo com Batch, materiais, renderer e geometria. Achado e corrigido um bug de NaN em duas chamadas de rotação; imagem de referência fp-suite-cyberpunk regravada; todos os testes verdes.
- 07/11/2026 — Commits anteriores: 5c110ca (Fase 4a: math, random e color); d01199f (textos de área do bunker alinhados à geometria); 1c9843e (Fase 3B e 3D: dimensões em config e validação de dados); 06440b8 (Fase 3A: paleta nomeada); e83629e (Fase 3C: tabelas em src/data); 49b42f1, 7b47179 e 19ba9cc (Fase 2: ESLint, Prettier, const e let); c7e9349 (Fase 1: Vite e three 0.128.0); 9d177b7 (Fase 0: rede de segurança sobre a v13).

