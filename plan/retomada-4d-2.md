# Retomada B0-4d-2 (esforço Alto)
Estado: commit b694bdf; régua e plano com escotilha 2×2; 47 testes; suíte rápida OK.
Fazer, em partes pequenas (cada uma: suíte rápida, commit com tools/passo.sh, parar):
1. 4d-2a: variáveis de toque (4 relações, borda comum ≥1 m) no tools/pack-bunker.py.
2. 4d-2b: acesso ≤2 saltos (circulação direta ou via parceiro de acesso_por).
3. 4d-2c: etapas lexicográficas: 1 pegada, 2 encolhimento (pular no "exato"), 3 afinidade×10 + acesso direto×3 + ruído.
4. 4d-2d: rodar 3 cenários (2–4 min cada, chamadas separadas), validar na régua, gerar plan/bunker-opcoes.json.
Antes: rodar `tools/passo.sh --retomar`. Solver: work/venv/bin/python -I.
Hoje: solver só pegada (exato 48,5×35 = 1697,5 m², limite 1641,5).
Não iniciar B0-5.
