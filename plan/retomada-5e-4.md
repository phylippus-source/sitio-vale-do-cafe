# Retomada B0-5e-4 (esforço Alto)
Estado: commit 0c42245 (passo 32, B0-5e-4a feita). Visão geral de tudo: LEIA-ME-RETOMADA.md (raiz). Esta nota é o histórico da B0-5e-4.
Plano do lote intacto: layout "Equilíbrio" em plan/site.json (estrada no meio). Só muda depois que o Mestre escolher uma variante olhando a Prancha 2.
Pronto: plan/lote-opcoes.json com 6 opções (viagens, equilibrio*, sombra, estrada-frente, estrada-oeste, estrada-fundos); as 3 novas trazem `estrada` e `dz_bunker` (0 nas três).
Feito: 5e-4a (0c42245): Prancha 2 mostra o plano atual + variantes A/B/C da estrada com métricas (Artifact 48PHoR5oMZmze8p1qathX4, versão 5).
Falta (partes pequenas, cada uma: prettier, suíte rápida, commit com tools/passo.sh, parar):
1. 5e-4b: opção do lote com TODO o espaço vazio reunido num bloco só, grande, sem prejudicar a estrada nem os caminhos até os lotes (pedido do Mestre em 14/11 23:48). Ideia: retângulo livre variável no solver, maximizar a área com teto de perda em viagens/sombra.
2. 5e-4c: rede de caminhos ramificados com atalhos entre os itens (árvore geradora + atalhos curtos), desenhada em cada variante; métrica de viagem pela rede; republicar a Prancha 2 (mesmo Artifact, mesmo plan/pranchas.html). O Mestre escolhe; só então muda plan/site.json (estrada e itens) e mundo.z0 se dz_bunker ≠ 0.
Notas: frente e fundos têm os mesmos itens; folga total ~19 m de profundidade; estrada-fundos passa sobre 3 m de teto do bunker.
Depois: Etapa E (E2 a E5). Hidroponia 100 m² (444 kWh/dia elétricos). Autonomia 3 dias; hidrogênio capturado.
