# Retomada às 17:20 · B0-5b-2 (esforço Alto)
Estado: commit 2f4ba99 (+ esta nota). Bunker: opção ±2,5 m escolhida (48×32, x −12 a 36, z −73 a −41). B0-5 liberada.
Ao voltar: o Mestre diz "voltei/resetaram"; rodar `tools/passo.sh --retomar` e `python3 tools/tokens.py --calibrar <% real>` se ele informar.
Fazer, em partes pequenas (suíte rápida, commit com carimbo, parar):
1. 5b-2 régua do lote: no site.json/checker, usar a pegada escolhida (48×32) como projeção do bunker (hoje usa plan/bunker.json 50×40); regras de zona (distância da casa por tipo: horta/galpão perto, pomar médio, lavouras e animais longe, mata no fundo); itens livres × fixos (casa fixa, engenho encosta no córrego, estrada fixa); tipos opcionais piscina e morro (tamanho em aberto, "tanto faz"). Testes em tests/unit/lote.test.js.
2. 5c solver do lote (CP-SAT, grade de 5 m): critérios 1–4 (caminhos curtos, sombra via tools/lote-lib.mjs, jazida/terra, piscina com sol).
3. 5d 2–3 opções, pranchas, republicar (Artifact 48PHoR5oMZmze8p1qathX4).
Pendências do Mestre: tamanho da piscina (sugestão 4×8 m), autonomia em dias (sugestão 3), hidrogênio, destino da terra (tanto faz). Etapa E (energia) está no Plano Mestre, depois da B0.
Convenção: x+ = oeste, z+ = norte. Alturas em site.json são [E] (estimativas minhas).
Medidas: lote 100×150 ocupa 56%; sombra atual: quadras 0 h, núcleo 0,7 h (9–15 h, inverno).
