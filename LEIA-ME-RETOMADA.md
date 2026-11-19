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

## 4. Estado atual (19/11/2026)
- **Etapa B0** (implantação). Bunker **aprovado**: opção ±2,5 m, 48×32 m, piso −10 m. Lote ainda **sem escolha final**: o Mestre está montando o arranjo dele na Arranjo do Lote.
- **Decisões de 18/11:** tudo é livre (casa, engenho, puxadinho e o próprio bunker, que ficou **solto da casa**; casa fora do bunker só dá aviso). Regras de proximidade (pomar/estufa/animais perto do núcleo) **desligadas**. Única regra de odor ligada: **animais ≥ 20 m da casa** (IN 11/2025 IMA-SC, referência). Respostas dele às 🧩: **folga 0 m entre canteiros, córrego a 4 m, bunker a 5 m do córrego**. **Ainda não aplicadas no código** (a régua usa `margem` 2 m para tudo e córrego 2 m).
- **Sol:** as fontes lidas não trazem horas por cultura; a única regra com base é horta/lavoura sem sombra. Estufa, pomar, galpão, casa e piscina só **medem** sombra.
- **Quer ainda:** mover a estrada e **redimensionar lotes** para um nesting melhor (liberar no solver).
- Arranjo dele **não foi salvo** (só existe na tela). Falta o botão **Exportar/Importar**.
- Último commit antes desta limpeza: `e01840d`.

## 5. Próximos passos (cada um = uma parte, espere o "segue")
1. **F5** (Médio): botão Exportar/Importar arranjo (JSON) na página; o Mestre cola aqui; `node tools/avaliar-arranjo.mjs arq.json` e `~/venv-sitio/bin/python -I tools/corrigir-arranjo.py ent.json saida.json` (deslocamento mínimo).
2. Parametrizar `margem` (itens 0 m, córrego 4 m, bunker 5 m) em `plan/site.json`, régua, solver e página; ajustar testes.
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
