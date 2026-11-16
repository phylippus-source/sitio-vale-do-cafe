# LEIA-ME-RETOMADA — Sítio Vale do Café

> Instruções do Claude da janela anterior (15/11/2026, último commit de código `0c42245`) para o **Claude Sonnet 5.5 de uma janela nova, sem contexto**. Trate este arquivo como pedido direto do Mestre. Com ele, o repositório (bundle git) e o prompt de abertura você continua do mesmo jeito, com a mesma qualidade. Leia inteiro antes de agir (≈ 10 min); depois use o índice.

**Índice:** 0 Em 60 segundos · 1 Sua primeira resposta · 2 O Mestre e o tom · 3 Regras de ouro · 4 Ritual de cada parte · 5 Estado atual · 6 Mapa do plano · 7 Próximas partes · 8 Ambiente · 9 Ferramentas (inclui o **contador de tokens**) · 10 Armadilhas · 11 Mapa de arquivos · 12 Conferência final

---

## 0. Em 60 segundos

- **O que é:** maquete 3D interativa (three.js 0.128, Vite, cel-shading isométrico) do **"Sítio Vale do Café"**: gleba de 100×150 m com Casa Grande, Engenho, Sisteminha Embrapa, lavouras e um **bunker subterrâneo** (piso −10 m). O Mestre (**Phylippus, "Mestre Philippe"**, carioca) dirige; você executa **partes minúsculas** e ele autoriza cada uma com a palavra **"segue"**.
- **Links vivos:** site publicado https://claude.ai/artifact/HBZQHcLHz1xEStUHcHQ5zN · Pranchas de projeto (Artifact, v5) https://claude.ai/artifact/48PHoR5oMZmze8p1qathX4 · Plano Mestre (Claude Doc) https://claude.ai/artifact/1VKGNp9HHzdxYZD51jeTES (cópia em `plan/PLANO-MESTRE.md`, rev 48).
- **Onde estamos (16/11, commit `67268b4`):** B0 quase fechada. Porteira no **leste, centro (x −50, z 0)**, córrego nos fundos (oeste), estrada em **espinha de peixe**. Prancha 2 (v7) mostra 5 opções (`espinha-*` em `plan/lote-opcoes.json`); o Mestre ainda **não escolheu**. Ele pediu a **prancha interativa**: plano em `plan/PROJETO-PRANCHA-INTERATIVA.md` (partes F1–F7, decisões 🧩 pendentes). Nada da F1 foi commitado.
- **Repositório:** https://github.com/phylippus-source/sitio-vale-do-cafe (branch `main`, `origin`). Em conversa nova, use `add_repo` (owner `phylippus-source`, repo `sitio-vale-do-cafe`, access push) e clone raso; o bundle é só reserva.
- **Próxima parte:** **F1** (esforço **Alto**): `tools/lote-web.mjs` sem `fs` (régua + caminhos + viagens), build que concatena `layout-lib`, `lote-lib`, `caminhos-lib` num script único para a página, teste igualando a saída ao Node. Antes, pergunte as 🧩 do projeto (ou use os padrões recomendados: itens fixos travados, ímã 2 m, quadras giram, Artifact novo).
- **Economia de tokens (lição de 16/11):** conversa longa + pausas > 5 min recriam o cache (peso 1,25) e queimam a janela. Em conversa nova: não releia arquivos grandes (PLANO-MESTRE tem 30 KB), não cole os anexos de novo, use `grep`/`offset`, pensamento curto, partes pequenas, um "segue" por vez sem deixar o chat parado no meio. Abra chat novo quando o contexto passar de ~150 mil tokens.
- **O que fazer agora:** seção 1. **Não comece trabalho novo antes do "segue" do Mestre.**

---

## 1. Sua primeira resposta na janela nova

Faça nesta ordem (tudo curto, nada de relatório longo):

1. Leia este arquivo inteiro. Se existirem ferramentas de memória, leia também `/areas/sitio-vale-do-cafe.md` (log cronológico de todas as decisões; se conflitar com este arquivo, vale a decisão **mais recente** do Mestre; avise) e `/preferences.md`.
2. Restaure o repositório (se ainda não estiver na pasta):
   ```bash
   git clone <caminho-do-arquivo>.bundle sitio-vale-do-cafe && cd sitio-vale-do-cafe
   bash tools/verificar-retomada.sh --instalar   # npm ci, venv do solver, restaura logs, confere tudo
   ```
   Saída esperada no fim: `TUDO PRONTO`. (Pendências comuns: `ortools` ausente → o próprio `--instalar` cria o venv em `~/venv-sitio`.)
3. **Ancore a janela de tokens** (seção 9.2): `python3 tools/tokens.py --inicio HH:MM`, com HH:MM = hora de Brasília da 1ª mensagem do Mestre nesta janela de 5 h (se ele não disser, use a hora da primeira mensagem desta conversa: `TZ=America/Sao_Paulo date +%H:%M`). Depois `bash tools/passo.sh --retomar`.
4. Responda ao Mestre em **no máximo 6 linhas**, no tom da seção 2: (a) linha de tokens (`python3 tools/tokens.py --linha`); (b) ambiente OK/pendências; (c) estado em uma frase (último commit e etapa); (d) próxima parte + **esforço** necessário; (e) "aguardo o seu segue". **PARE.**

---

## 2. O Mestre e o tom

- Trate por **"Mestre"**, **"Mestre Philippe"**, "meu senhor", "meu amado mestre". Português do Brasil, **informal e acessível**; nada rebuscado.
- Estilo pedido por ele: **mordomo de alta classe no dia mais feliz da vida**, animado, **seco e BREVE**. Preferência extra do app: telegráfico, direto, "ligação interurbana a cobrar, cobrando por pulso": poucos conectivos, frases curtas, sem rodeio. Exemplos: "Pronto, meu senhor. Parte 5e-4b feita, commit `abc1234`. Tokens 31%. Próxima: 4c, esforço Alto. Aguardo o segue." / "Mil perdões, meu senhor: errei o sinal do z. Corrigido."
- Respostas **curtas por padrão**. Se ele pedir lista, faça lista **grande (7+ itens)**; se pedir mais exemplos, **nunca repita** os anteriores.
- **Escopo fechado:** não implemente nada que ele não pediu; ideia extra vira **uma linha de sugestão**, sem fazer. Ele quer pesquisar e **ver um plano antes** de qualquer solver ou mudança grande ("se sente mais seguro").
- Quando precisar de decisão ou opinião dele, marque com **🧩** (ele pediu isso) e, se houver a ferramenta `AskUserQuestion`, use perguntas de múltipla escolha curtas.
- Ele **escolhe olhando**: para decisões de projeto, mostre opções na **Prancha** (Artifact) e deixe-o escolher; nada do plano base é adotado sem o OK dele.
- Ele não segue horário fixo e pode sumir por horas: **cada parte termina num commit** (ponto seguro de retomada).
- Texto na tela e comentários: **português**. Nomes de código e funções: **inglês**; nomes de domínio brasileiro ficam (`casa`, `engenho`, `sisteminha`, `quadras`).

---

## 3. Regras de ouro (todas vieram do Mestre)

1. **Uma parte por vez, partes bem pequenas.** Ao fim: suíte rápida, commit com carimbo, tarefa, memória, relatório curtíssimo e **PARE** até o "segue". Os tokens acabam no meio dos processos; nada fica pela metade.
2. **Antes de cada "segue" (no fim da parte), avise o esforço** da parte seguinte: padrão **Médio**; **Alto** para desenho, solver, decisão de projeto, dependência entre módulos; **Extra/Máx** só com aviso explícito. Ele troca o nível manualmente.
3. **A 1ª coisa de todo "segue"** é imprimir a % de tokens da janela de 5 h (`python3 tools/tokens.py --linha`) e rodar `bash tools/passo.sh --retomar`.
4. **Regra de ouro das medidas:** números terminando em **0 ou 5**; se der para aumentar sem invadir vizinho, aumente; se não, **reduza para baixo** (ex.: 23×34 → 20×30). Exceções do Mestre prevalecem.
5. **Números em textos vêm da geometria** (gerados dos dados), nunca digitados.
6. **Fora de escopo, por decisão dele:** ciclo dia/noite, clima, som e as demais ideias extras da pesquisa web.
7. **Blocos T, A e C: visual congelado** (hash da cena e imagens de referência idênticos). **Bloco B: o visual muda**: você revisa as imagens, ele vê, e só então regrava hash e referências. Exceção: C0 (cores).
8. Se um teste falhar: **pare e reporte** (não contorne, não apague teste).
9. **Medidas são flexíveis** ("nada está escrito em pedra"): ajustar retângulos em metros ou centímetros é aceito se melhorar o encaixe.
10. Registro de tudo que ele decide: **uma linha na memória** + painel/registro do Plano Mestre no fim de etapa.

---

## 4. O ritual de cada parte

```bash
export SP=<pasta-do-repo>; cd $SP
export NODE_PATH=$(npm root -g)                       # Playwright global; o resto vem do npm ci
# 0. início do "segue"
python3 tools/tokens.py --linha ; bash tools/passo.sh --retomar
# 1. TaskCreate "B0-5e-4b …" (in_progress)  — a lista de tarefas é o painel que ele vê
# 2. trabalhar (parte minúscula)
# 3. npx prettier --write <arquivos de teste/ferramenta tocados>   # NUNCA em plan/site.json
# 4. npm run --silent test:fast                         # ≈ 75–90 s; tudo OK ou pare
# 5. bash tools/passo.sh "B0-5e-4b título curto"        # 1ª linha de saída = carimbo
# 6. git add -A && git commit -m "<carimbo> — título" -m "<detalhe curto>" + trailers de atribuição
# 7. TaskUpdate completed; no título: "… ✓ HH:MM · duração · commit abc1234"
# 8. memória: 1 linha [stated] em /areas/sitio-vale-do-cafe.md (reler para pegar o if_version atual)
# 9. relatório curtíssimo + esforço da próxima parte + "aguardo o segue"  → PARE
```

- **Carimbo do commit** (exemplo real): `⏱ 12:44:33 · +2m18s · passo 32 · B0 6h15m — B0-5e-4a prancha 2 com plano atual e 3 variantes da estrada`. É a 1ª linha que `tools/passo.sh "<título>"` imprime; cole-a como assunto do commit.
- **Trailers de atribuição:** use as linhas que o `system-reminder` desta janela mandar (formato: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` e `Claude-Session: <url da sessão atual>`).
- Cada passo conta tempo de trabalho; **pausas** (limite de tokens, espera do "segue") são marcadas por `--retomar` e **não contam**.
- **Fim de etapa** (ex.: B0 inteira): suíte **completa** (`npm test`, ≈ 90 s), commit "Etapa X", painel do Plano Mestre marcado (Doc), uma linha na memória, relatório de 5 linhas com tempos e total (`bash tools/passo.sh --resumo`).
- A memória tem um teto (49 KB; hoje ≈ 18 KB). Se encostar, condense linhas antigas relacionadas; **nunca** apague o arquivo.

---

## 5. Estado atual (15/11/2026)

### 5.1 Commits marcantes
| Marco | Commit | Nota |
|---|---|---|
| M0 (Fases 0–4) | `9dd563f` | rede de segurança, estrutura, dados, núcleo |
| T1 | `3b1c33e` | testes: unitários (vitest), hash da cena, imagens de referência |
| A1 | `5c7f8b5` | nomes em inglês por AST |
| A2 | `d70644f` | mundo em módulos; `main.js` com 77 linhas; 12 passos, 33 min |
| B0-1 / 2 / 3 | `debf36e` / `31bc4bb` / `23fbbdf` | planta do bunker, implantação do lote, 1ªs pranchas |
| B0-4 | `ee73672`, `02a89ac`, `2f9fc62`, `b694bdf`, `1d46188` | régua, solver do bunker, escada de marinheiro, opção ±2,5 m escolhida |
| B0-5 | `6d86ec1`, `73da24f`, `1d363c3`, `c85de9d`, `8f37ec6` | plano, solver do lote (viagens, sombra), 3 opções, Equilíbrio adotado |
| E1 | `565bf2b`, `9d9123e`, `bc3eda2` | cargas de energia, planilha, hidroponia 100 m² |
| B0-5e | `2c3eb68`, `1071565`, `0c42245` | blocos livres (limite medido), 3 variantes da estrada, Prancha 2 (v5) |
| **Pacote de retomada** | ver `git log -1` | este arquivo, `plan/PLANO-MESTRE.md`, `an/`, `plan/retomada-logs/`, `tools/verificar-retomada.sh`, contador de tokens reforçado |

Cronômetro: etapa **B0**, **passo 32** feito (6h15m de trabalho). O pacote ganha o passo 33. Logs em `plan/retomada-logs/` (restauram sozinhos em `logs/` via `tools/verificar-retomada.sh`).

### 5.2 Decisões do Mestre (nada disto se reabre sem ele)
| Tema | Decisão |
|---|---|
| Pessoas | 7 no dia a dia (ele, pais, irmã de 30, sobrinha de 11, 1 convidado); 12 só em visitas (estoque de emergência; comida de visita se compra) |
| Bunker | **uma opção escolhida: ±2,5 m, pegada 48×32 = 1.536 m², 22 ambientes**; piso −10 m, pé-direito 3 m, topo −7 m; 1 nível; acesso principal pelo monta-carga; **escotilha/escada de marinheiro 2×2** fora da Casa Grande e dos itens, ≥ 15 m do monta-carga; saídas podem ficar a < 30 m; passagens livres; **ruído não importa** (isolamento termoacústico ou cancelamento ativo), mas as afinidades entre cômodos mantêm peso alto |
| Quartos | Mestre 90 m² (cyberpunk, luxo tecnológico), pais 45 m² (9×5), irmã/sobrinha/convidado 3,5×5 com suíte 3×2 e cama de casal (convidado com beliche); banheiros coletivos 3×3,5 |
| Lote | 100×150 m; **layout "Equilíbrio" adotado** em `plan/site.json`; puxadinho coberto/aquecido **7×20 m colado pelo lado longo à Casa Grande**, com **piscina 5×18 m** dentro; sombra e caminhos curtos são critérios; jazida e terra: **terra (~6.000 m³) "tanto faz"** (descartar ou bateria gravitacional em morro oco) |
| Medidas-alvo | bambuzal 25×25, silvicultura 25×25, jazida 20×25, pátio técnico 15×15 etc.: ver `plan/PLANO-MESTRE.md` §6 e `an/PROPOSTA_MEDIDAS_FINAL.md`; estufa e biodigestor liberados para medidas menores ou não quadradas |
| Comida | produção contínua para 7 com sobra para vender; sem bovinos, só caprinos e suínos; aprovou verticalizar/compactar/automatizar (galinheiro sobre minhocário, cascata por gravidade, horta em laje, fibra ótica e espelhos para luz no subsolo) |
| Hidroponia | **100 m² de dossel: 40 m² de alto sustento + 60 m² de ervas de alto valor para renda** |
| Energia | **autonomia de 3 dias sem geração**; **hidrogênio capturado** para armazenamento de gases (bateria selada → filtros/botijões; ele perguntou se funciona junto com o biodigestor: circuitos de gás separados, tratar na E5); calor puro para água quente, sauna e piscina; elétrico para viver 100% off-grid |
| Estrada/lote (14/11) | quer **dois blocos grandes livres nas pontas de 150 m** (medido: **inviável com a estrada no meio**); escolheu a **opção 2: tirar a estrada do meio** (o espaço vira estrada, caminhos e atalhos), **mas quer ver opções na Prancha antes de decidir**; quer **caminhos ramificados com atalhos**; e (23:48) **uma opção com todo o espaço vazio num bloco só**, sem prejudicar estrada e caminhos |
| Estilo | fazenda imperial reformada 2026 (ocre, branco, ferro, azulejo, mármore, LED/neon); "colonial reformado" |
| Plano | etapas cumpridas em ordem; **C0** (paleta enxuta; hoje 281 cores) com aprovação dele; backup do Marco 1 dispensado |

### 5.3 Números e posições (referência)
- **Convenção do modelo:** x+ = **oeste**, z+ = **norte**; o observador olha para o sul. Lote x −50..50, z −75..75 (origem no centro); córrego em x 43..48.
- **Itens em `plan/site.json` (Equilíbrio; x,z = centro):** casa (−11,5; −68) 25×25 · engenho (23; −43) 20×10 · puxadinho (−11,5; −43) 20×7 · galpão (−28,5; −45) 15×10 · jazida (21; −31) 20×25 · quadras (−46; −33) 65×55 · núcleo (−11,5; 32,5) 25×30 · estufa (−36,5; 32,5) 20×7,5 · pomar (15,5; 32,5) 25×40 · silvicultura (−48; −73) 25×25 · bambuzal (−48; 42) · animais (22; 8,5) 15×15. Estrada de 5 m em z 25,5..30,5 (x −50..43). Bunker no mundo: x0 −12, z0 −73 (sob casa/engenho/puxadinho).
- **Métricas das opções do lote** (régua): Equilíbrio viagens 1062, sombra núcleo 0,4 h, quadras 0 h, animais–casa 52 m · Viagens 1055 / núcleo 1,7 h · Sombra 1126 / núcleo 0,1 h · variantes da estrada: frente (z 70..75) quadras 0,2 h/núcleo 0,9 h/animais–casa 65 m · oeste (x −50..−45) 0,0/0,9/45 m · fundos (z −75..−70) 0,2/0,9/65 m; folga total ≈ 19 m de profundidade; a estrada-fundos passa sobre 3 m do teto do bunker. Todas `dz_bunker = 0`.
- **Limite geométrico medido (5e-2):** os itens ocupam 124–131 m dos 150 m; com a estrada no meio os blocos livres somam no máximo **12 m** de profundidade (9,5 fundos + 2,5 frente, exigiria o conjunto casa/bunker andar 2,5 m); sem estrada, 26 m. Por isso os dois blocos grandes **não cabem** com a estrada no meio.
- **Energia (E1, estimativas [E]):** elétrico **444,3 kWh/dia** (média anual 429,7; pico simultâneo 53,4 kW; bunker 343,1 + lote 101,2); térmico **140,9 kWh/dia** (média 111,8); hidroponia LED 100 m² × 50 W/m² × 16 h = 80 kWh/dia (maior carga); **armazenamento mínimo para 3 dias: 1.332,9 kWh elétricos e 422,8 kWh térmicos**. Pendente: o Mestre **conferir as estimativas** em `plan/energia-cargas.xlsx`.
- **Site (para a D1):** 345.576 triângulos, 168 chamadas de desenho, HTML 742 KB; metas: ≤ 450 mil tri, ≤ 220 chamadas, ≤ 900 KB, 0 avisos do three. Moto G52 emulado (412×915, CPU 4× mais lenta).

---

## 6. Mapa do plano (fonte: `plan/PLANO-MESTRE.md`)

| Etapa | O que faz | Porte (esforço) | Estado |
|---|---|---|---|
| T1 · A1 · A2 | testes · nomes em inglês · mundo modular | M · M · G | **feitas** |
| **B0** | pranchas (bunker −10 m e lote) aprovadas pelo Mestre; script de layout | P | bunker + lote aprovados; **falta 5e-4b/4c e a escolha da estrada** |
| **E1–E5** | Energia: cargas (**E1 feita**) · recursos do sítio · geração com redundância · armazenamento · gases | Médio · Médio · Alto · Alto · Médio | E2 é a próxima do bloco; ordem: entre B0 e B1 |
| B1 | Bunker: casca, cotas, circulação (galeria 5 m, escadaria, monta-carga, saída 2) | G (Alto) | — |
| B2 · B3 · B4 | ala privada · convivência/armazenagem · técnico/produção/luz solar | M · M · G | — |
| B5 · B6 · B7 | Casa Grande e sobrado · lotes de produção · animais e infraestrutura | M · M · G | — |
| B8 | textos, BOM, publica a **v14** no mesmo link (Marco 2) | M | — |
| C0 | paleta enxuta: 281 cores → poucas, com amostras e **aprovação dele** | G | — |
| C1 · C2 · C3 | sistemas · interface (sem `innerHTML`, teclado) · robustez (sem WebGL etc.) | G · M · M | — |
| D1 · D2 | qualidade final (Moto G52 emulado) · entrega da **v15** no mesmo link | M · M | — |

Detalhes de aceite, testes por etapa, medidas-alvo (seção 6 do plano), riscos (seção 8) e protocolo (seção 9): **leia `plan/PLANO-MESTRE.md` quando for começar cada etapa**. A B0 é só projeto (nenhum código de produção muda).

---

## 7. Próximas partes, especificadas

### 7.1 B0-5e-4b — opção do lote com UM bloco livre (esforço **Alto**)
**Pedido do Mestre (14/11 23:48):** "uma opção onde todo o espaço vazio esteja reunido num bloco só grande, porém sem prejudicar a estrada e os caminhos ramificados para os lotes."
- Estenda `tools/pack-lote.py`: um **retângulo livre variável** `L` (x, z, w, h na grade de 0,5 m, margem 2 m) sem sobreposição com itens e estrada (mesmas 4 literais de separação par a par; **não use NoOverlap2D**, itens fixos se tocam); **maximize a área** (multiplicação em domínio pequeno ou lista de tamanhos "bonitos" de 5 em 5 m testados do maior para o menor) com **teto de perda** (ex.: viagens ≤ +15% sobre o Equilíbrio, sombra do núcleo ≤ 1 h) e, num 2º estágio (área fixada), **minimize viagens + sombra** (padrão lexicográfico, como `pack-bunker.py --partir`).
- A estrada: parta de uma das variantes (`--estrada-em`) e rode as quatro posições; o bloco tende a cair numa ponta ou canto, oposto aos itens. Deve passar na régua (`node tools/layout-check.mjs`; acrescente o campo do bloco em `lote-lib.mjs`/teste se virar regra).
- Saída: nova opção em `plan/lote-opcoes.json` (ex.: `id: "bloco-unico"`, com `bloco: {x,z,w,h}` e `estrada`). **`--saida` grava um arquivo à parte com `{opcoes:[op]}`**; junte o objeto à lista `opcoes` (não sobrescreva `plan/lote-opcoes.json`; tem 6 opções).
- **Não altere `plan/site.json`** (o Equilíbrio segue valendo até ele escolher). Teste: `layout-check` e `tests/unit/lote.test.js` (a lista de opções é testada).
- Se nenhuma opção válida existir com o teto de perda, **reporte os números** (tamanho máximo do bloco × perda) e deixe-o escolher o preço: 🧩.

### 7.2 B0-5e-4c — caminhos ramificados com atalhos + Prancha (esforço **Alto**)
- Rede de caminhos de 2 m entre as portas dos itens e a estrada: árvore geradora retilínea (ex.: MST em L1 sobre portas; roteamento em grade de 1 m, A*/Dijkstra desviando dos itens) **mais atalhos** nos pares de maior peso de viagem (`viagens.pares` em `plan/site.json`) quando o caminho pela árvore passar de ~1,3× a distância direta. Métrica nova: **viagem pela rede** = Σ peso × distância na rede (pode virar critério do solver depois).
- Desenhe a rede em cada variante (A/B/C e `bloco-unico`) em `tools/render-boards.mjs` (função `lotePlanta`) e mostre a métrica nos cartões; rode `node tools/render-boards.mjs`; **republique** a Prancha (seção 9.5). O Mestre escolhe olhando.
- **Só depois da escolha:** atualize `plan/site.json` (estrada e itens; **à mão ou por regex, sem `prettier --write`**), `mundo.z0` se `dz_bunker ≠ 0`, ajuste testes que dependem de posições (ex.: galpão em `tests/unit/lote.test.js`) e fecha a B0 (suíte completa, painel do Doc, memória).

### 7.3 Etapa E (Energia), depois da B0
Cada parte termina com suíte rápida, commit e carimbo; o Mestre manda "segue" antes de cada uma.
- **E2 recursos do sítio** (Médio, pesquisa web): sol (lat −22,404°, pior mês = junho; CRESESB/Sundata), vento (INMET, Vassouras), córrego (vazão e queda para microhidro; provavelmente **faltam dados medidos**: pergunte 🧩), biodigestor, biomassa (bambuzal, silvicultura), calor do solo. Cite fonte oficial; marque **[F]** fonte e **[E]** estimativa. Formato de saída: proponha ao Mestre (nota curta em `plan/` ou aba nova na planilha).
- **E3 geração com redundância** (Alto): quanto de cada fonte e o que cobre a falha de outra (sem sol, sem vento, córrego seco).
- **E4 armazenamento** (Alto): 7 opções pesquisadas em 14/11 (água salgada, fluxo de ferro ou vanádio, ferro-ar, níquel-ferro, chumbo tubular, sódio-íon, calor em areia ou sal); dimensionar pela autonomia de 3 dias; se a sala de baterias do bunker (10×10 provisória) mudar, reabra só essa sala no solver.
- **E5 gases** (Médio): bateria selada com saída para filtro e ventilação; hidrogênio em botijão só como opção estudada (pede norma); circuitos separados do biodigestor.

### 7.4 Depois: B1 a B8, C0 a C3, D1, D2
Ver seção 6 e o plano. B1 (Alto) é a primeira a mudar o visual: escavação, laje, galeria, ambientes como volumes (parede, porta, piso, sem mobília); regrava hash e imagens depois da revisão.

---

## 8. Ambiente

Pré-requisitos: **node 22**, npm 10, **Playwright 1.63.0 + Chromium** (no ambiente padrão já vêm: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, Playwright global; os testes acham por `NODE_PATH`), python3, git, zip.

```bash
git clone <bundle> sitio-vale-do-cafe && cd sitio-vale-do-cafe
npm ci --no-audit --no-fund                 # node_modules não vai no git
export NODE_PATH=$(npm root -g)             # sempre, antes dos testes
python3 -m venv ~/venv-sitio && ~/venv-sitio/bin/pip install -r tools/requirements-solver.txt   # ortools>=9.15 (solvers)
bash tools/verificar-retomada.sh            # confere tudo (add --instalar para instalar o que faltar)
```

Comandos do dia a dia: `npm run --silent test:fast` (≈ 80 s) · `npm test` (completa, ≈ 90 s) · `npm run test:unit` · `npm run lint` · `npm run format` · `npm run build` · `npm run check:names` · `npm run save` (backup: git bundle + zip **fora** do repo, em `../backup`; `SAVE_DIR=` muda a pasta). Rodar solvers: `~/venv-sitio/bin/python -I tools/pack-lote.py ...` (o `-I` isola do diretório atual).
Rede: o workspace só alcança registros npm/pip e GitHub; outras URLs só pelas ferramentas `WebSearch`/`WebFetch`.

---

## 9. Ferramentas

### 9.1 `tools/passo.sh` — cronômetro de passos
`--inicio ETAPA` abre etapa · `"descrição"` registra passo (imprime o carimbo e a linha de tokens) · `--retomar` volta de pausa (o intervalo **não conta**) · `--resumo` lista passos e total. Estado em `logs/estado.txt` (`etapa epoch_início epoch_último passos segundos_de_pausa`) e `logs/passos-<etapa>.log`. Hoje: `B0 … 32 passos`. Os logs ficam fora do git (`logs/`); cópia em `plan/retomada-logs/`, restaurada por `tools/verificar-retomada.sh`.

### 9.2 `tools/tokens.py` — contador de tokens da janela de 5 h (**use em todo "segue"**)
**O que faz:** soma o consumo estimado da janela de 5 h atual a partir das transcrições do Claude Code (só leitura) e imprime a **% da janela**. Pesos de custo: entrada 1 · cache criado 1,25 · cache lido 0,1 · saída 5 (saída já inclui o pensamento). A cota real da Anthropic não é publicada: o **peso que vale 100%** vem de calibração com o aviso do Mestre (`logs/tokens-cota.txt`; padrão `COTA_PADRAO = 2.104.699`, calibrado com o aviso de **90% em 14/11 às 23:39**).
**Como usar:**
```bash
python3 tools/tokens.py --linha                 # 1 linha: "tokens janela desde 18:43 (fim 23:43): saída … · 24% da janela"  ← 1ª coisa de todo segue
python3 tools/tokens.py                         # detalhe (entrada, cache, saída, pensamento, peso, cota)
python3 tools/tokens.py --inicio 18:43          # grava o início da janela atual (hora de Brasília, de hoje)
python3 tools/tokens.py --calibrar 90           # o Mestre disse "estou em 90% agora": regrava a cota
python3 tools/tokens.py --passada 12:42 17:42   # a janela esgotou nesse trecho: o peso do trecho vira 100%
```
**Regras do Mestre:** sempre que ele disser que os **tokens resetaram/voltaram** ou que **passou de 90%** (ou frase parecida), **recalibre** (`--calibrar PCT` ou `--inicio HH:MM`) e reestime a janela; informe a % no início de todo "segue"; `tools/passo.sh` já a imprime a cada commit.
**Como a janela funciona:** começa na **1ª mensagem depois do fim da anterior** (5 h de duração). `--inicio` ancora a atual; a janela **avança sozinha** (cada resposta 5 h além do início abre a seguinte).
**Transcrições:** acha sozinho os `*.jsonl` de `~/.claude/projects/**` (e `$CLAUDE_CONFIG_DIR`) tocados nas últimas 36 h, **de todas as sessões** (a janela é da conta). `--arquivo x.jsonl` (repetível) força. Se não houver nenhuma, imprime "nada para contar": peça a % ao Mestre.
**O ponto cego (importante):** a **compactação da conversa apaga o histórico da transcrição**; em 15/11 o contador marcou **69% com o limite real já em 100%**. Por isso existe o **livro-razão** `logs/tokens-ledger.jsonl` (cada resposta já vista fica guardada por 72 h): rodar o contador **com frequência** (todo `passo.sh` já roda) mantém a conta correta mesmo depois de compactar. Ainda não aparece: uso em **outra janela do app, outro aparelho** ou conversa antes do 1º uso do livro. **Regra prática:** depois de uma compactação, trate a % do contador como **piso**; com ≥ 60% numa janela que compactou, avise o Mestre e prefira partes menores. Peso alto vem de **pensamento longo e leitura de arquivos grandes**: pense curto, leia só o necessário (use `offset`/`limit`, `grep`).
**Calibração:** 100% ≈ 2,10 M de peso (14/11). Em 15/11 a janela 12:42–17:42 esgotou com o contador (cego) em ~75%, logo a cota verdadeira pode ser **um pouco menor**: ao receber um aviso novo do Mestre, regrave com `--calibrar`.

### 9.3 Solvers (CP-SAT, OR-tools 9.15)
- **`tools/pack-bunker.py`** — planta do bunker. `--cenario {exato,mais-menos-1,mais-menos-2-5}` · `--tempo 60` · `--saida x.json` · `--partir opcao.json` (parte de uma opção resolvida) · `--log`. Estágios lexicográficos (pegada → desvio → conforto). Dados: `plan/bunker.json` (ambientes, afinidades, tolerâncias) e `plan/bunker-opcoes.json` (3 opções; `escolhida: "mais-menos-2-5"`).
- **`tools/pack-lote.py`** — implantação do lote 100×150. Flags: `--tempo`, `--saida`, `--log`, `--id`, `--nome`, `--etapa`, `--peso-sombra N` (custo por par fonte×lavoura×hora com sombra; 30 dá sombra mínima), `--peso-bloco N`, `--mover-fixos` (casa/puxadinho/engenho/bunker andam juntos em z; muda `mundo.z0`; **exige OK**), `--estrada-em {meio,frente,oeste,fundos}`, `--sem-estrada` (experimento).
  - Modelo: grade de **0,5 m** (U=2), margem 2 m, origem no canto do lote (x1=−50, z1=−75); itens fixos (`fixo:true`: casa, engenho, puxadinho) e `encosta` (engenho no córrego), `colado` (puxadinho à casa); árvore/escavação fora da projeção do bunker; regras: animais ≥ 25 m da casa; pomar/estufa ≤ 5 m e animais ≤ 20 m do núcleo.
  - Objetivo: Σ peso × distância L1 entre centros (unidade: quarto de metro) + 4 × peso_sombra × (nº de booleanos fonte×lavoura×hora com sombra) + 2 × peso_bloco × (zmax − zmin).
  - Sombra: lat −22,404°, declinação de inverno 23,44°, horas 9–15; a sombra de altura h desloca −h·(sol x,z)/cima; **o solver usa a caixa envolvente (conservador)**, a régua JS usa o casco convexo exato: **sempre valide com `node tools/layout-check.mjs`**.
  - Dicas: variáveis com `hint` só quando `isinstance(r["w"], int)`; o solver é multi-thread (resultado pode variar entre rodadas): **grave a saída na hora**.

### 9.4 Réguas (JS puro, testadas)
`tools/layout-lib.mjs` (bunker: áreas, sobreposições, acesso ≤ 2 saltos, afinidades, ruído, saídas) · `tools/lote-lib.mjs` (lote: `sol`, `sombraDe`, `horasDeSombra`, `conferirLote(S, bunker) → {erros, metricas:{total,env,lotArea,dist,sombra}}`) · `tools/layout-check.mjs` (roda todas as opções; deve terminar com **`layout: OK`**) · `tools/energia-lib.mjs`. Testes em `tests/unit/` (`lote.test.js`, `energia.test.js`, …).

### 9.5 Pranchas (Artifact) — gerar e republicar
```bash
node tools/render-boards.mjs        # gera plan/pranchas.html (Prancha 1 bunker, Prancha 2 lote)
```
Publicação: ferramenta **Artifact**, `action: "read"` no link **uma vez nesta sessão** (senão a publicação é recusada e devolve a versão viva), depois `publish` com `file_path` = caminho absoluto de `plan/pranchas.html` e `url` = `https://claude.ai/artifact/48PHoR5oMZmze8p1qathX4` (o mesmo link; **sem `icon`** na republicação). Antes, carregue a skill `artifact-design`. Fotografe/confira o HTML (Playwright, `deviceScaleFactor: 2`) antes de publicar. Diga ao Mestre só uma frase do que mudou; não cole o link.

### 9.6 Energia
`plan/energia-cargas.json` (cargas: `uso_kW`, `horas_dia`, `fracao_ano`, `pico_kW`, `simult`, tipo elétrico/térmico, local bunker/lote; tudo **[E]** estimativa) → `tools/energia-lib.mjs` (totais) → `tests/unit/energia.test.js` → `tools/gerar-planilha-energia.py` gera `plan/energia-cargas.xlsx` (118 fórmulas; células azuis editáveis: B3 = 3 dias, B18 = 100 m², B19 = 50 W/m²; aba Resumo com SUMIFS). Depois de gerar, **recalcule** com o `recalc.py` da skill `anthropic-skills:xlsx` (sem isso as fórmulas ficam sem valor) e confira 0 erros. Se mudar o JSON, os totais testados mudam: atualize o teste.

### 9.7 Plano Mestre (Claude Doc) e sua cópia
- Doc id `1VKGNp9HHzdxYZD51jeTES`, corpo na aba `eb5ea0a0-9c15`. Antes de qualquer chamada ao Doc, carregue as guias (`mcp__Claude_Docs__guide` com `topic.index`). **Os ids dos blocos têm prefixo por sessão** (`msryz03zbex.` na anterior): **releia o doc** para pegar os ids atuais.
- Editar: `mcp__Claude_Docs__update` com operações (substituir texto por localizar/substituir; trocar bloco inteiro exige `ifHash` + `ifRev`; inserir antes/depois de um bloco pelo id completo). Leituras grandes são salvas em arquivo: a 1ª linha é o JSON `{"data":{"rev","xml"}}`; converta com `python3 tools/doc2md.py <arquivo> > /tmp/plano.md`, depois recoloque a linha de aviso do topo de `plan/PLANO-MESTRE.md`.
- Fim de etapa: marque o painel (seção 2 do Doc), acrescente linha no registro (seção 10), atualize a cópia `plan/PLANO-MESTRE.md`.

### 9.8 Testes (`tests/run-all.js`)
Rápida: lint (0 avisos) · nomes antigos · layout · formato · unitários (vitest) · build · hash da cena · métricas · 1ª pessoa · fumaça minificada · interação. Completa: + imagens de referência, coplanares. Blocos T/A/C: hash e imagens **idênticos**; Bloco B: mudam só onde esperado, revisados e regravados (`npm run scenehash:update`, `npm run golden:update` — **só depois de o Mestre ver**).

---

## 10. Armadilhas conhecidas

1. **Nunca `prettier --write` em `plan/site.json`** (expande as linhas compactas dos itens e gera ruído). Edite à mão/regex.
2. **Testes dependem de posições**: ao mudar o layout, o teste "engenho e galpão a 0,5 m" (galpão `x: 7.5`), as opções em `tests/unit/lote.test.js` e `layout-check` quebram: ajuste o teste, não a régua.
3. **`plan/lote-opcoes.json` guarda 6 opções**: `--saida` do solver cria arquivo à parte; não sobrescreva o JSON de opções.
4. **Orientação**: x+ = oeste, z+ = norte; vários textos antigos diziam o contrário (já corrigidos). Cheque o sinal ao mexer em sombra.
5. **A estrada na divisa de fundos passa sobre o teto do bunker (3 m)**; frente e fundos têm os mesmos itens.
6. **Solver sem `-I`/sem venv** falha com `No module named 'ortools'`. Use `~/venv-sitio/bin/python -I`.
7. **Contador de tokens**: ver 9.2 (cego após compactação sem livro-razão; recalibre quando ele avisar).
8. **Docs**: ids de bloco mudam por sessão; leitura grande vai para arquivo (1ª linha JSON); `"Extra data"` ao ler JSON = leia só a 1ª linha.
9. **Artifact**: ler antes de republicar; republicar o **mesmo** arquivo com `url`; ícone só na 1ª publicação.
10. **`gerar-planilha-energia.py` sem `recalc.py`** deixa fórmulas sem valor guardado.
11. **Leituras grandes custam tokens** (o PLANO-MESTRE tem 30 KB): leia por trechos; evite despejar logs inteiros.
12. **Nada de recursos extras**: ele reclama de implementação não pedida e prefere ver o plano antes.
13. **Hash/imagens de referência**: não regrave por conta própria (regra 7 da seção 3).
14. **Informações pessoais** do Mestre guardadas na memória não devem ser mencionadas sem ele puxar o assunto.

---

## 11. Mapa de arquivos

```
LEIA-ME-RETOMADA.md      este arquivo (leia primeiro)      README.md   estrutura, comandos, fases concluídas
src/                     código do site (three.js; main.js enxuto; módulos por região do mundo)
plan/                    PLANO-MESTRE.md (cópia rev 48) · site.json (itens e regras do lote) · lote-opcoes.json · bunker.json ·
                         bunker-opcoes.json · energia-cargas.json/.xlsx · pranchas.html · lote-plano.md · retomada-*.md ·
                         retomada-logs/ (estado do cronômetro, cota de tokens)
an/                      ACHADOS_FASE1-2.md (orientação, lat/lon, normas) · PROPOSTA_MEDIDAS_FINAL.md (medidas-alvo e checklist)
tools/                   passo.sh · tokens.py · verificar-retomada.sh · pack-bunker.py · pack-lote.py · layout-lib/lote-lib/energia-lib.mjs ·
                         layout-check.mjs · render-boards.mjs · gerar-planilha-energia.py · doc2md.py · save.mjs · requirements-solver.txt · (codemods antigos)
tests/                   run-all.js · harness.js · unit/ (vitest) · smoke/interação/1ª pessoa/métricas/coplanares
golden/                  baselines (scene.baseline.json, metrics, coplanar) e imagens de referência (ref/)
dist/, dist-debug/       builds (rastreados)       logs/ (ignorado; restaurado de plan/retomada-logs/)
```

---

## 12. Conferência final de retomada

- [ ] `bash tools/verificar-retomada.sh` termina em **TUDO PRONTO** (ou só com o venv do solver pendente, resolvido por `--instalar`).
- [ ] `node tools/layout-check.mjs` termina em **`layout: OK`**.
- [ ] `npm run --silent test:fast` passa (≈ 80 s) numa árvore limpa.
- [ ] `git log -3` mostra o último commit do pacote sobre `0c42245`.
- [ ] Janela de tokens ancorada; % impressa; cronômetro retomado.
- [ ] Resposta ao Mestre curta, no tom certo, com **próxima parte + esforço**, e **parada** esperando o "segue".

*Fim. Cada parte nova começa por `tokens.py --linha` e `passo.sh --retomar`; cada parte termina em commit, memória e parada.*
