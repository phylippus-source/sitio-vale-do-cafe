# Sítio Vale do Café — refatoração

Fase 0 (rede de segurança) e Fase 1 (dependências e estrutura) concluídas. `legacy/sitio-vale-do-cafe.raw.html` é a cópia do v13 publicado.

## Estrutura
- `index.html` — marcação (sem JS/CSS inline)
- `styles/` — `main.css` importa tokens, base, hud, panel, drawer, firstperson (ordem original)
- `src/main.js` — lógica legada (ainda monolítica; Fases 4–8)
- `src/config/` — `palette.js` (K, cores da Casa, PAL agrupada), `dimensions.js` (cotas, gleba, bunker, origens)
- `src/data/` — tabelas puras (sectors, labels, bom, aura, rooms, fpspots, terrain, collision, crops, sisteminha), `areas.js` (áreas derivadas) e `validate.js` (checagem na carga; erro vira `console.error`, e o teste de métricas falha)
- `tools/` — scripts de migração (extract-const, name-colors, split-decls) com verificação deepEqual
- `vite.config.js` — Vite + singlefile; `npm run build` (minificado, `dist/`), `npm run build:debug` (`dist-debug/`, usado nos testes)
- three.js 0.128.0 vem do npm e é embutido (sem CDN)

## Comandos
- `npm run test:fast` — suíte rápida (meta: 2 min): lint, formatação, unitários, build, hash da cena, métricas, 1ª pessoa, smoke e interação. Para na primeira falha e mostra o tempo de cada passo
- `npm test` — suíte completa (meta: 4 min): a rápida + coplanar + golden (6 capturas)
- `npm run test:unit` — só os testes unitários (vitest, `tests/unit/`, ≈ 3 s)
- `npm run test:scenehash` — hash da cena: geometria, materiais e transformações abaixo do `dio`, em duas fotografias (inicial e após 10 quadros virtuais). A falha lista os grupos e as malhas que mudaram. `npm run scenehash:update` regrava o baseline, e só grava se 3 capturas independentes coincidirem
- `npm run lint` / `npm run format` / `npm run format:check` — ESLint (no-var, prefer-const, no-undef, no-unused-vars, max-lines-per-function; `--max-warnings 4` até a A2) e Prettier (100 colunas)
- `npm run golden:update` — regrava capturas de referência (só após mudança visual aprovada)
- `node tests/metrics.js --update` / `node tests/coplanar.js --update` — regrava baselines
- `npm run save [-- rótulo]` — backup: git bundle verificado + zip da árvore, em `../backup/` (ou na pasta `SAVE_DIR`)
- `tools/passo.sh` — cronômetro de passos (hora, duração, tempo da etapa; `--inicio`, `--retomar`, `--resumo`), log em `logs/` (fora do git)
- `--target=caminho.html` em qualquer teste de navegador roda contra outro arquivo

## Pré-requisito
Playwright global 1.63.0, Chromium swiftshader. `npm test` e `npm run test:fast` acham o Playwright sozinhos; para rodar um teste avulso (`node tests/fp.js`): `export NODE_PATH=$(npm root -g)`.

## Problemas conhecidos (a corrigir em fase própria)
- 4 funções acima de 80 linhas em `main.js`: `wall` (113), duas anônimas (95 e 94, esta é o `tick` da superfície) e `frame` (88). O lint tolera 4 avisos e zera na A2.
- Detector coplanar: 1.726 pares na baseline (eram 31.678 antes da Fase 4). Regra: não aumentar.


## Mudanças de código na Fase 1 (únicas)
- `src/main.js`: removida a guarda `if (!window.THREE)` (three agora é import); `THREE` exposto em `__sitio` para os testes.

## Fase 2 (feito)
- `var` → `const/let` (0 `var` restantes), uma declaração por linha, Prettier em tudo (5.9 mil linhas formatadas).
- Código morto removido: `bunkerCeil`, `rnd`, `TM`, `shower`, `wheel`, `GROUND`, `pulse`, `CH`, `casaUpY`, `CWD`, `bunkU`, variáveis sem uso. `catch {}` vazios ganharam comentário.
- Bug latente corrigido: laço `for (i=...)` que vazava `i`; variáveis de laço `fp`/`hb` redeclaradas (agora `let`, `fenceX/fenceZ`).
- Ganchos de teste (`window.__sitio`) só existem com `?debug` na URL. Testes rodam no build de produção.
- Pendente (fases 6–7): 3 funções acima de 80 linhas (`wall`, um IIFE do engenho/bunker, `frame`); `let i;` hoisted usados por laços sem escopo próprio.

## Fase 3 (feito)
- 12 tabelas movidas para `src/data` (valores idênticos, verificados por deepEqual); `main.js` caiu de 5,9 mil para 4,6 mil linhas.
- Paleta: `K` + cores da Casa em `config/palette.js`; 72 cores usadas 2+ vezes agora são `PAL.grupo.nome` (238 trocas). 167 literais de uso único ficam no lugar e migram para o bloco do próprio ambiente na Fase 6.
- Dimensões: `FLOOR`, `BFL`, `BWH`, `GF`, `GHT`, `UF`, `UHT`, `LOT`, `STREAM`, `BUNKER`, `BUNKER_INNER`, `CASA_ORIGIN`, `BARN_ORIGIN`. `RB/RH/RW/RD` (telhado) são locais de função: ficam para a Fase 6.
- Validação: cotas, setores, rótulos, cômodos (ladrilham o interior do bunker), quadras (500 m²), pontos de 1ª pessoa.
- Achado de conteúdo: textos de área divergem da geometria (ver ACHADOS_FASE1-2.md). Nada de texto foi alterado.

## Textos de área (feito, entre as fases 3 e 4)
- Textos de áreas do bunker e do quadro de áreas alinhados à geometria; `validate.js` confere texto × geometria a cada carga.

## Fase 4 (feito)
- `src/core/materials.js` (gradTex, toonMat, unlitMat, hullMat, waterMat, pondMat), `geometries.js` (GX, cylG, coneG, ni), `renderer.js` (`createRenderer`), `geometry.js` (`slab`, `hipGeo`).
- `src/core/Batch.js`: classe ES com batch lacrado após `build`. Métodos renomeados: `at→setOrigin`, `add→addGeometry`, `bb→addBox`, `cb→addCylinder`, `cn→addCone`, `ic→addSphere`, `beam→addBeam` (895 chamadas, por AST). Entrada não finita (ex.: rotação numérica em vez de `[rx,ry,rz]`) agora é avisada no console.
- Bug corrigido: duas chamadas passavam rotação como número → vértices NaN, peças invisíveis (9 painéis curvos da cabeceira + 16 luzes de teto da suíte cyberpunk). Agora aparecem. Golden `fp-suite-cyberpunk` atualizado; avisos do three: 3 → 0; pares coplanares: 31.678 → 1.726.

## Etapa T1 (feito): rede de testes reforçada
- 102 testes unitários (vitest 5.1.0, ≈ 3 s) para `core/`, `config/` e `data/`: Batch, cores, gerador aleatório, geometria, materiais, áreas, validação e tabelas. Mutação de sanidade: 6 estragos propositais, os 6 acusados.
- Hash da cena (`tests/scenehash.js`): relógio virtual (`requestAnimationFrame` parado, `window.__step`) e aleatório semeado dão captura idêntica em execuções independentes. Provado sensível a mudança de animação, de cor em 1/255 e de ordem do gerador aleatório.
- `tests/run-all.js` reescrito: `--fast`, tempo por passo, para na primeira falha, acha o Playwright sozinho.
- Interação 69 s → 17 s: as chamadas de desenho do WebGL ficam desligadas (`skipDraws` no harness); o JavaScript roda inteiro. `--draw` religa.
- `npm run save` e o cronômetro de passos (`tools/passo.sh`).
- Golden com tempo virtual (`tests/golden.js`): câmera, corte e sol assentam por número fixo de quadros (sem desenho, depois 2 com desenho), sem depender da velocidade da máquina. 97 s → 16 s; duas comparações seguidas dão 0,000%. Antes, o resultado variava com o tempo real (o `engenho` oscilava entre 0,40% e 0,57%, limite 0,5%) e a qualidade automática (`autoQ`) podia tirar os contornos no meio da execução. Referências regravadas: diferença para as antigas de 0,00% a 0,20%, só serrilhado. O golden pega mudança de câmera, contorno, luz e interface; desvio pequeno de cor só o hash da cena pega (pixelmatch 0,12 ignora).
- Golden em paralelo dispensado: o tempo virtual já deu a velocidade, e com 2 núcleos a GPU por software não ganha com páginas simultâneas.
