# Painel E3 — geração e armazenamento (24/11/2026)

Acompanhamento no GitHub: issue #1 (cada parte tem comentário).

| Parte | Assunto | Arquivo | Resultado |
|---|---|---|---|
| A | Decisões do Mestre | plan/energia-geracao.json | T1–T3 aceitas; 10 moradores; telhado máximo; FV de telhados 208 kWp |
| B | Córrego típico | plan/corrego-tipico.md | cabeceira pequena; micro-hidro 0,5–40 kWh/dia (medir) |
| C | Gerar ou armazenar | plan/gerar-ou-armazenar.md | gerar mais: ~200 kWp; banco ~410 kWh |
| D | Torre gravitacional | plan/torre-gravitacional.md | torre sim (antena, chaminé); massa não como banco |
| E | Calor em eletricidade | plan/calor-em-eletricidade.md | só com 300–500 °C; calor <100 °C não vale; JTEC observar |
| F | Síntese | plan/energia-geracao.json (arquitetura_revisada_24_11) | ver pendências |

Decisões de 24/11 05:35: 10 moradores na Casa Grande; bunker projetado para no máximo 7 por tempo indefinido e pode crescer (escavação maior para despensa e equipamentos); telhado de uma água aprovado; o Mestre baixa a série diária de nuvens da NASA; rebanho: ele não sabe, Claude propõe.
Pendências: confirmar rebanho proposto, medir córrego e vento, série de nuvens, impacto de um bunker maior no plano (B0 fechada com 48×32).
Referência de baterias com datas: plan/referencias/baterias-e-armazenamento-2026-11-23.md.
Próximo: E4 dimensionar armazenamento (esforço Médio), depois E5 gases.
Reconciliação E3-B (24/11): integrada em `plan/energia-geracao.json` e `plan/energia-recursos.json` a proposta de rebanho (`rebanho_e3b_10_moradores`: 8 matrizes Saanen + 1 bode + 4 crias + 6 suínos + 55 aves, 1,29 m³/dia de biogás) e a conferência de sombra de inverno (`horasDeSombra`, 22/06) nos telhados FV.
