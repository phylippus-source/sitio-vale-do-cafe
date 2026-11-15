# Retomada B0-5e-4 (esforço Alto)
Estado: commit 1071565 (passo 31). Plano do lote intacto: layout "Equilíbrio" em plan/site.json (estrada no meio).
Pronto: plan/lote-opcoes.json com 6 opções (viagens, equilibrio*, sombra, estrada-frente, estrada-oeste, estrada-fundos); cada opção nova traz `estrada` e `dz_bunker`.
Fazer (partes pequenas, cada uma: prettier, suíte rápida, commit com tools/passo.sh, parar):
1. 5e-4a: Prancha 2 passa a mostrar as 3 variantes da estrada (cartões como na Prancha 1), usando `estrada` de cada opção; tabela de métricas (viagens, sombra, animais–casa, folga em z).
2. 5e-4b: rede de caminhos ramificados com atalhos entre os itens (árvore geradora + atalhos curtos) desenhada em cada variante; métrica de viagem pela rede (opcional no solver depois).
3. Republicar Artifact 48PHoR5oMZmze8p1qathX4 (mesmo plan/pranchas.html). Mestre escolhe a variante; só então muda plan/site.json (estrada e itens) e mundo.z0 se dz_bunker ≠ 0.
Notas: frente e fundos têm os mesmos itens; folga total ~19 m de profundidade; estrada-fundos passa sobre 3 m de teto do bunker.
Depois: Etapa E: E2 (recursos do sítio, Médio, pesquisa), E3, E4, E5. Hidroponia 100 m² (444 kWh/dia elétricos). Autonomia 3 dias; hidrogênio capturado.
Janela de tokens: reinicia 03:43 (início 22:43). Rodar `python3 tools/tokens.py --linha` primeiro e `tools/passo.sh --retomar`.
PEDIDO NOVO (14/11 23:48): incluir uma opção com TODO o espaço vazio reunido num bloco só, grande, sem prejudicar a estrada nem os caminhos ramificados até os lotes. Testar na próxima (maximizar o maior retângulo livre, qualquer lugar; estrada e rede de caminhos preservadas).
