# Retomada E4b — armazenamento "fim do mundo" (23/11/2026)

Pedido (13:28): avaliar ar comprimido, salmoura, areia quente com espelhos solares, água+sais como eletrólito, terras raras, químicas instáveis com extintores. Qual é a mais barata para longo prazo e baixa manutenção, estilo apocalipse? Pesquisar Google Acadêmico e Inovação Tecnológica.

Estado: limite de 5 h estourou ~13:35, reseta 18:10. Nada foi concluído além do que está em plan/armazenamento-pesquisa.json.

Já testado:
- Google Scholar: robots.txt proíbe, não lê. Semantic Scholar: erro. OpenAlex: limite de taxa (buscar 1 página por vez).
- Inovação Tecnológica: 3 buscas (links em plan/armazenamento-pesquisa.json > novas_tecnologias_inovacao_tecnologica), 3 artigos lidos.

Fazer, UMA página por vez (o WebFetch limita várias da mesma origem):
1. Ler os 11 artigos de "a_ler".
2. Custo por tecnologia: PNNL "2022 Grand Challenge Energy Storage Technology Cost and Performance Assessment" ($/kWh por tecnologia, 4 a 100 h); Lazard LCOS.
3. Fatos por tecnologia: Aquion (íon aquoso, água salgada); ESS ferro-fluxo (ferro, sal, água); Eos zinco; Form Energy ferro-ar; EnerVenue níquel-hidrogênio; Inlyte (sódio-metal-cloreto, Zebra); areia/partículas com helióstatos (CSP); lagoa solar de salmoura; ar líquido/CAES pequeno; bateria de água do mar; NiMH e terras raras; incêndio em Li-ion (NFPA 855); armazenamento a seco/descarregado (chumbo carregado a seco, NiFe).
4. Critérios fim-do-mundo: vida de prateleira, reparo com ferramenta comum, material barato/local, tolera abandono, falha segura, autodescarga, R$/kWh/ano.
5. Saída: seção "fim_do_mundo" em plan/armazenamento-pesquisa.json com ranking; marcar chute; commit.

Dica de custo de tokens: esforço Máx pesa muito; Médio/Alto basta para pesquisa.
