import { defineConfig } from 'vitest/config';

/* Testes unitários: módulos puros de src/core, src/config e src/data, sem navegador. */
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
    server: { deps: { inline: ['three'] } },
  },
});
