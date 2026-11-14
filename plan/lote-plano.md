# Plano da B0-5 · otimizar a implantação do lote (rascunho, 14/11)
Decisões do Mestre: critérios 1–6 aprovados; piscina e morro de terra "tanto faz"; terra pode ser descartada.
Base: bunker escolhido ±2,5 m (48×32, x −12 a 36, z −73 a −41), Casa Grande fixa sobre ele, engenho encostado no córrego, estrada fixa.

## Critérios (o que é "melhor")
1. Caminhos curtos entre casa, engenho, núcleo, animais, galpão (peso por viagem diária).
2. Sombra: árvores e bambu não sombreiam lavouras (hemisfério sul: sol ao norte, sombra cai para o sul).
3. Jazida e terra perto de quem usa.
4. Piscina aquecida anexa à Casa Grande, com sol; coletores solares de frente para o norte.
5. Morro de terra / bateria gravitacional: opcional.
6. Zonas de uso, guiadas por projetos reais e recomendações de sítio produtivo.

## Fontes lidas (14/11)
- Permacultura, zonas e setores (Redemption Permaculture): zona 1 horta anual, compostagem e galpão perto da casa; zona 2 pomar, galinhas, lagos; zona 3 lavouras e animais grandes; zona 4 mata/lenha. Setores: sol, água, vento, fogo.
- Embrapa, Sisteminha (cartilha UFU/Fapemig 2019): NÃO traz croqui nem distâncias entre módulos. Traz: tanque 3,5×4,5 m ou 4,4 m de diâmetro, local plano e sem árvores (folhas), perto de energia e de água; 1.500 m² bastam para peixes, aves, frutas e hortaliças; culturas preferidas no centro, mamão/quiabo/milho junto à cerca. Distâncias entre módulos vêm das nossas regras (site.json).

## Partes (cada uma: suíte rápida, commit com carimbo, parar)
- 5a plano (feito, Médio).
- 5b régua do lote (Alto): regras novas no site.json + checker: zona (distância da casa), sombra no solstício de inverno (latitude a confirmar), item livre ou fixo, bunker 48×32, piscina e morro como itens opcionais.
- 5c solver do lote (Alto): CP-SAT, grade de 5 m, posições livres dentro das regras, critérios 1–4 como objetivo.
- 5d opções e pranchas (Alto): 2–3 opções, pranchas, republicar.

## Pontos a conferir
- Hipótese: silvicultura (z 48–73, ao norte) lança sombra de ~25 m ao sul no inverno e pode chegar às lavouras (z até 23,5) ou à estrada; medir na 5b.
- Latitude/longitude do sítio: ver an/ACHADOS_FASE1-2.md.
