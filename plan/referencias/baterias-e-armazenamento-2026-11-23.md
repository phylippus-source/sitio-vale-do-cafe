# Referência: baterias e armazenamento de energia (consulta de 23/11/2026)

Uso: base para projetos futuros. Dados completos em `plan/armazenamento-pesquisa.json` e `plan/energia-recursos.json`.
REGRA: toda fonte leva data da fonte e data da consulta. Este campo muda rápido: revisar antes de reusar (sugestão: a cada 6 meses, próxima ~maio/2027). Tecnologia "de laboratório" hoje pode ser comum amanhã.

Legenda de confiança: A = relatório oficial/artigo revisado; B = notícia sobre artigo; C = Wikipedia (sem data de edição lida), fórum ou fabricante.

| Fonte | Data da fonte | Consultada | Conf. | Para que serviu |
|---|---|---|---|---|
| PNNL-33283, Energy Storage Grand Challenge Cost and Performance Assessment (DOE) | 2022 (custos base 2021, projeção 2030) | 23/11/2026 | A | Custo US$/kWh, eficiência, vida: chumbo, LFP, NMC, vanádio, zinco, ar comprimido, calor (areia, sal), ar líquido. Só 386 mil caracteres lidos até 300 mil; hidrogênio e LCOS não lidos |
| Atlas Brasileiro de Energia Solar 2ª ed., INPE/LABREN | 2017 | 23/11/2026 | A | Sol de Vassouras (célula ID 7159) |
| Embrapa SDoc1961 (biogás), Embrapa Florestas 2021 cap. 26 (eucalipto) | 2021 (biogás: ano não conferido) | 23/11/2026 | A | Biogás e eucalipto |
| MDPI Energies 17(19):5005, micro-CAES residencial (Portugal) | 2024 | 23/11/2026 | A | Eficiência 61% simulada |
| MDPI Energies 16(18):6653, revisão de CAES (Fajinmi et al.) | 2023 | 23/11/2026 | A | Eficiência 21% medida em 3 kWh, densidade |
| MDPI Eng 6(11):309, armazenamento em sistemas isolados | 2025 | 23/11/2026 | A | Hidrogênio 30–50% eficiência; tabelas 1 e 2 não lidas |
| Nature Communications 15:2566 (ferro-fluxo, PNNL), via Inovação Tecnológica | 09/04/2024 | 23/11/2026 | B | Laboratório |
| Adv. Energy Mater. 2403030 (zinco >100 mil ciclos, TU Munique), via IT | 04/11/2024 | 23/11/2026 | B | Laboratório |
| Energy Environ. Mater. (zinco-lignina, Linköping), via IT | 17/05/2024 | 23/11/2026 | B | Laboratório |
| Adv. Mater. (baterias de água, RMIT), via IT | 23/02/2024 | 23/11/2026 | B | Pesquisa inicial |
| J. Bioresources Bioproducts 100232 (zinco e bambu), via IT | 14/01/2026 | 23/11/2026 | B | Laboratório |
| Chem. Mater. (lítio com óxido de ferro, Saarland), via IT | 13/02/2026 | 23/11/2026 | B | Laboratório |
| J. Mater. Chem. A (sódio-íon vanadato, Surrey), via IT | 06/03/2026 | 23/11/2026 | B | Laboratório |
| Fraunhofer, bateria térmica de zeólita, via IT | 08/06/2012 | 23/11/2026 | B | Antigo: checar se virou produto |
| Hunt et al., gravidade em montanha, via IT | 12/12/2019 | 23/11/2026 | B | Conceito |
| FSRI/UL, explosão de ESS Li-ion no Arizona (evento 19/04/2019) | PDF de 07/2021 | 23/11/2026 | A | Segurança, extintor, ventilação |
| Rolls Battery, ativação de baterias secas carregadas | sem data | 23/11/2026 | C | Vida de prateleira "vários anos" |
| Wikipedia: Aquion, ESS Tech, Form Energy, Solar pond, CSP, Dish Stirling, NiMH, Zebra, NaS, Li-ion, LFP, chumbo-ácido, NiFe, sódio-íon, fluxo, TES, CAES, ar líquido, rede elétrica, usinas de bateria | texto vigente em 23/11/2026 | 23/11/2026 | C | Dados gerais. Falências: Aquion 03/2017; ESS Tech 13/11/2026 (Chapter 7); NGK NaS parou 2025; Stirling Energy Systems 2011 |
| Victron, Webinar 2 Baterias (pt); Vertiv/Battcon 2011 (NiFe); OSE wiki, relatos NiFe | 2021; 2011; 2021 | 23/11/2026 | C | Vida e uso de chumbo e NiFe |
| Climatempo, climatologia de Vassouras | 30 anos, ano não conferido | 23/11/2026 | C | Chuva e temperatura |

Bloqueios (robots.txt, não contornar): Google Acadêmico, NASA POWER, PVGIS, NFPA, ScienceDirect, Semantic Scholar (erro). OpenAlex deu limite de taxa.

Conclusões provisórias de 23/11/2026 (revisar): ver `fim_do_mundo` no JSON. Dado volátil: situação de ESS Tech, Form Energy, Eos, sódio-íon (Natron fechou em 2025), preço de LFP (~US$ 100/kWh célula em 2023, Wikipedia).
