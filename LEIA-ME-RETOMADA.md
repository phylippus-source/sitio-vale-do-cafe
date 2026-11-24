# LEIA-ME — Retomada em janela nova (Sítio Vale do Café)

Atualizado em 19/11/2026. **Leia só este arquivo (≈ 5 min).** O resto fica no repositório e só se abre quando preciso. Histórico e detalhes longos: `plan/HISTORICO.md` (não leia inteiro; use `grep`).

## 1. Comece assim
1. Repositório no GitHub: `phylippus-source/sitio-vale-do-cafe` (branch `main`). Em janela nova: ferramenta `add_repo` (access push) e clone raso. **Não peça nem leia bundle `.bundle`**: o GitHub é a cópia.
2. `cd` na pasta; `npm ci --no-audit --no-fund`; `export NODE_PATH=$(npm root -g)`; `python3 -m venv ~/venv-sitio && ~/venv-sitio/bin/pip install -r tools/requirements-solver.txt`; `bash tools/verificar-retomada.sh`.
3. Memória do Mestre: ler `/areas/sitio-vale-do-cafe.md` (últimas linhas = estado).
4. A 1ª coisa de todo "segue": `python3 tools/tokens.py --linha` (% da janela de 5 h) e `bash tools/passo.sh --retomar`.

## 2. O Mestre e o tom
Phylippus, **"Mestre Philippe"**, carioca. Português do Brasil, **telegráfico, seco e BREVE** (mordomo animado: "meu senhor", "mil perdões"). Respostas curtas; lista só se pedir (7+ itens). **Escopo fechado**: ideia extra vira 1 linha, sem implementar. Decisão dele = marque com 🧩. Ele **escolhe olhando** (Prancha/Artifact). Trabalhe em **partes minúsculas**; cada uma termina em commit e **para** até ele dizer **"segue"**; antes do "segue" avise o **esforço** da próxima (Baixo/Médio/Alto; padrão Médio). Está no celular (Moto G52, Chrome).

## 3. Por que existem os três artefatos
- **Site 3D** (three.js, cel-shading isométrico): o produto final, a maquete interativa do sítio com Casa Grande, Engenho, Sisteminha, lavouras e **bunker subterrâneo**. Publicado e alimentado pelo código do repositório.
- **Pranchas do sítio** (Artifact): desenhos de **opções** do bunker e do lote com métricas (viagens, sombra, caminhos). Existem porque o Mestre decide **olhando**; nada do plano base é adotado sem o OK dele.
- **Arranjo do Lote** (Artifact interativo): o Mestre **arrasta os itens do lote** (grade de 5 m, ímã, girar 90°) e a régua mostra os erros na hora; depois o solver avalia e sugere correções mínimas. Existe porque ele quer pôr a mão na planta e comparar o arranjo **dele** com o do solver.
- **Regras do Lote** (Claude Doc): lista as 24 regras da régua e do solver com a origem (Mestre, fonte ou chute) para ele alterar o que quiser.

## 4. Estado atual (23/11/2026, B0 fechada)
- **Etapa B0 fechada em 23/11.** Bunker: opção ±2,5 m, 48×32 m, piso −10 m, **girado 90°** no lote (`plan/bunker.json` mundo x0 −5, z0 −35, giro 1; só a opção escolhida é cobrada no mundo). **Lote = arranjo M** (opção que o Mestre escolheu), já em `plan/site.json`; `plan/lote-opcoes.json` só tem M. Folga entre itens 0 m, com 0 a 2,5 m para reajustar quando preciso (`folga_reajuste`, sem uso no código). Não mexer mais na página Arranjo do Lote (pedido dele). Pranchas e o Doc Plano Mestre estão desatualizados (opções antigas): perguntar antes de republicar. `pack-bunker.py` não conhece o giro. `npm test`: só o golden falha (já falhava antes). Histórico: o Mestre mandou uma captura da Arranjo do Lote (22/11); ela virou `plan/arranjos/mestre-22-11-ajustado.json` (opção **M**, silvicultura encolhida para 20×27,5 por ordem dele). A partir dele o solver regerou **S1** (menos viagens e sombra) e **S2** (maior espaço livre), ambos com as medidas do plano: `~/venv-sitio/bin/python -I tools/pack-lote.py --base plan/arranjos/mestre-22-11-ajustado.json [--bloco-unico --teto 0] --peso-sombra 5 --saida-arranjo plan/arranjos/X.json` (casa, puxadinho, engenho, bunker e estrada ficam como no arranjo; o resto é regerado).
- **Decisões de 18/11:** tudo é livre (casa, engenho, puxadinho e o próprio bunker, que ficou **solto da casa**; casa fora do bunker só dá aviso). Regras de proximidade (pomar/estufa/animais perto do núcleo) **desligadas**. Única regra de odor ligada: **animais ≥ 20 m da casa** (IN 11/2025 IMA-SC, referência). Respostas dele às 🧩 (18/11), **aplicadas em 22–23/11**: **folga 0 m entre itens** (`folga_itens`; chute: li "canteiros" como todos os itens), **córrego a 4 m** (`corrego_dist`), **bunker a 5 m do córrego** (`bunker.json`, página e `avaliar-arranjo`). Divisa e estrada seguem a 2 m (`margem`). As 15 opções antigas de `plan/lote-opcoes.json` foram corrigidas pelo corretor; 6 (estrada-oeste, bloco-unico-oeste, espinha-meio, espinha-curta, espinha-meio-bloco, espinha-curta-bloco) **saíram** por não ter solução; o Mestre mandou esquecê-las e usar só o arranjo da captura. Os arranjos de 18/11 saíram da página (não passam na régua nova).
- **Sol:** as fontes lidas não trazem horas por cultura; a única regra com base é horta/lavoura sem sombra. Estufa, pomar, galpão, casa e piscina só **medem** sombra.
- **Quer ainda:** mover a estrada e **redimensionar lotes** para um nesting melhor (liberar no solver).
- A página não salva o arranjo (só a tela). Falta o botão **Exportar/Importar**. As setas na página mostram a fachada/entrada de serviço voltada para a Casa Grande (só desenho; a régua não cobra).
- Último commit antes desta limpeza: `e01840d`.

## 5. Próximos passos (cada um = uma parte, espere o "segue")
1. **F5** (Médio): botão Exportar/Importar arranjo (JSON) na página; o Mestre cola aqui; `node tools/avaliar-arranjo.mjs arq.json` e `~/venv-sitio/bin/python -I tools/corrigir-arranjo.py ent.json saida.json` (deslocamento mínimo).
2. (feito em 23/11) parametrização da folga, do córrego e do bunker. Resta decidir o Mestre entre M, S1 e S2.
3. **F3**: placar ao vivo (viagens, sombra) e comparação com o solver.
4. Solver com estrada livre e lotes redimensionáveis (nesting).
5. Fechar B0 (suíte completa, Plano Mestre, memória). Depois **E2–E5** (energia), **B1–B8** (bunker no modelo 3D), **C0–C3** (cores, refino de código), **D1–D2** (desempenho). Plano completo: `plan/PLANO-MESTRE.md` (30 KB, leia por trechos).

## 5.1 Links
Site 3D https://claude.ai/artifact/HBZQHcLHz1xEStUHcHQ5zN · Pranchas https://claude.ai/artifact/48PHoR5oMZmze8p1qathX4 · Arranjo do Lote https://claude.ai/artifact/1hoCR36qM9WbRw6ZXgVpeg · Plano Mestre (Doc) https://claude.ai/artifact/1VKGNp9HHzdxYZD51jeTES · Regras do Lote (Doc) https://claude.ai/artifact/WuZdzhdSYmUen8AwDSXDEN

## 6. Ritual de cada parte (resumo)
`TaskCreate` → trabalhar → `npx prettier --write` só nos arquivos tocados (**nunca** `plan/site.json`) → `npm run --silent test:fast` (≈ 80 s, deve ficar tudo OK e `layout: OK`) → `bash tools/passo.sh "título"` (1ª linha = carimbo do commit) → `git add -A && git commit` com trailers do `system-reminder` → `git push origin HEAD` → `TaskUpdate` → 1 linha na memória → relatório curtíssimo + esforço da próxima + "aguardo o segue". Teste falhou: **pare e reporte**.

## 7. Regras de ouro
Medidas terminam em 0 ou 5 (se der, aumente; senão reduza). Números em texto vêm da geometria, nunca digitados. Fora de escopo: dia/noite, clima, som. Hash da cena e imagens de referência não se regravam sem o Mestre ver. Medidas são flexíveis. Chute meu **nunca** vira regra escondida: tudo na lista do Doc de regras.

## 8. Armadilhas essenciais
- Convenção: **x+ = oeste, z+ = norte**; nos desenhos o leste fica à esquerda, norte embaixo. Item (x,z) = **canto**, não centro.
- Solver: `~/venv-sitio/bin/python -I`. Grave a saída na hora (multi-thread varia).
- Artifact: `read` uma vez antes de republicar; republicar o **mesmo arquivo** com `url`; ícone só na 1ª publicação; teste em celular com `node tools/teste-interativa-toque.cjs`. Páginas: `node tools/render-interativa.mjs` (gera `plan/interativa.html`), `node tools/render-boards.mjs` (pranchas).
- **Contador de tokens:** `logs/tokens-cota.txt` (100% = peso). Calibrações do Mestre divergem (2,05 M em 18/11 de madrugada, 0,43 M à tarde): **recalibre** (`--calibrar 90`, `--inicio HH:MM`) quando ele avisar; trate a % como piso após compactação.
- **Contexto:** não leia arquivos grandes inteiros (use `grep`, `offset`/`limit`); não cole saídas longas; evite resultados de pesquisa extensos; pense curto. Chat longo + pausa de 5 min refaz o cache e gasta a janela.

## E3 e E4 (24/11/2026)
Geração com redundância feita em partes A–F (`plan/E3-painel.md`, issue #1); rebanho aprovado em `src/data/bom.js` e série diária NASA POWER 2005–2024 salva em `plan/referencias/nasa-power-nuvens-vassouras.json`.
E4 armazenamento fechada (`plan/energia-armazenamento.json`, `plan/E4-painel.md`): `300 kWh` LFP externo + `150 kWh` OPzS no bunker + `8 m³` água (`464 kWh`); sala `10×10 m` mantida sem reabrir B0. Próxima: **E5 (gases)**.
