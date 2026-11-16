# Projeto: Prancha do lote interativa (parte nova da B0, "B0-5f")

Pedido do Mestre (16/11 01:00 e 01:13): reposicionar os itens do lote sozinho, "a meu bel prazer e estética", com grade invisível de 5 em 5 m, adesão magnética nas bordas e botão de girar 90° horário em torno do centro. Depois o Claude passa o solver e a régua por cima e compara a arrumação dele com a do solver (viagens, sombra e, se aprovado, cheiro, fumaça e ruído).

**Decisões já tomadas (16/11):** porteira no leste, no centro (x −50, z 0), sem ponte; córrego nos fundos (oeste); estrada principal em espinha de peixe, com ramos orgânicos para os lotes numerados; zona livre para expansão ainda em aberto.

## O que a página faz

1. **Arrastar** cada item (mouse e toque). Posição na **grade de 5 m** (origem no canto do lote, então todo número termina em 0 ou 5).
2. **Ímã:** a borda do item gruda na borda do vizinho, da divisa, da estrada e do córrego, com a folga de 2 m da régua (colado só onde o plano pede, ex.: puxadinho na Casa Grande). Raio de captura ≈ 3 m. Segurar Alt desliga o ímã.
3. **Girar 90° horário** em torno do centro (botão e tecla R), refeito na grade.
4. **Setas** movem 5 m; Ctrl+Z / Ctrl+Y desfazem e refazem; "voltar ao plano atual" e "carregar opção 1 a 5" como ponto de partida.
5. **Placar ao vivo** (a régua em JS, no navegador): erros por item (sobreposição, margem, estrada, córrego, árvore sobre o bunker, regras de distância), viagens diretas e pela rede, sombra por lavoura, área livre. Ao lado, o número do melhor do solver, para comparar na hora.
6. **Espinha ao vivo:** a estrada sai da porteira e se redesenha a cada movimento, com os ramos até cada porta (a mesma `caminhos-lib.mjs`, ≈ 50 ms). Ponta da espinha arrastável.
7. **Bloco livre** desenhável (retângulo de lados de 5 m): mostra a área e se cabe oval de pista (20×70).
8. **Exportar:** "copiar arranjo" gera um JSON compacto (itens x, z, w, d, giro; ponta da espinha; bloco). O Mestre cola na conversa. Guarda o último arranjo no navegador (com try/catch).

## Partes (cada uma termina em suíte rápida, commit e parada; "segue" antes de cada uma)

| Parte | Faz | Esforço | Aceite / teste |
|---|---|---|---|
| F1 | Núcleo sem `fs`: `lote-web.mjs` (régua + caminhos + viagens + sombra) e build que o embute na página | Alto | Mesma saída do Node em todas as opções (teste unitário comparando) |
| F2 | Página: SVG, arrastar, grade 5 m, ímã, girar, setas, desfazer | Alto | Teste Playwright: arrasto cai em múltiplo de 5; ímã deixa folga de 2 m; 4 giros voltam ao início |
| F3 | Placar ao vivo + comparação com as opções do solver; régua passa a aceitar as quadras giradas | Médio | Arranjo inválido mostra o erro certo; opções do solver mostram 0 erros |
| F4 | Espinha e ramos ao vivo, porteira fixa, ponta arrastável, bloco livre | Médio | Todo item sempre ligado à rede; nenhum caminho cruza item ou bloco |
| F5 | Exportar/importar JSON, memória local, teclado, aria, celular (Moto G52 emulado) | Médio | Importar o exportado reproduz o arranjo; sem scroll horizontal a 400 px |
| F6 | `tools/avaliar-arranjo.mjs`: lê o JSON, roda régua + caminhos e o solver com `--partir`; relatório "arranjo do Mestre × solver"; regras de cheiro, fumaça e ruído (se aprovadas) | Alto | Relatório com viagens, sombra, rede, regras; arranjo do solver reproduzido dá os mesmos números |
| F7 | Publicar como Artifact novo (separado da Prancha), commit, memória, atualizar o Plano Mestre | Médio | Página abre, arrasta e exporta no celular e no desktop |

Ordem: F1 → F7. Cabe antes de fechar a B0 (o arranjo final do Mestre vira o `site.json`).

## 🧩 Decisões que dependem do Mestre

1. **Casa Grande, puxadinho e engenho:** travados (recomendado) ou livres? Livres mexem no bunker (muda `mundo.z0`).
2. **Ímã:** folga de 2 m (régua) ou colar de vez?
3. **Quadras:** podem girar? (65×55 vira 55×65; ajusto a régua.)
4. **Cheiro, fumaça e ruído:** aprovar distâncias mínimas simples [E], por exemplo animais e biodigestor longe da casa e da estufa, forja e galpão técnico longe da casa e do pomar, jazida longe da piscina. Para valer de verdade falta o vento dominante (etapa E2, INMET Vassouras).
5. **Publicação:** Artifact novo (recomendado) ou dentro da Prancha 2.

## Riscos e salvaguardas

- **Régua duplicada** (Node e navegador): resolvido na F1, um só módulo e teste comparando as saídas.
- **Tokens:** partes pequenas; F2 e F6 são as pesadas (Alto).
- **Solver:** é Python e não roda no navegador; por isso o fluxo "copiar arranjo e colar na conversa".
- **Nada do plano muda sozinho:** o `site.json` só é atualizado depois da escolha final do Mestre.
