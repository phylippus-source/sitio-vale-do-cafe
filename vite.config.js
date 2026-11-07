import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// MODE=debug: sem minificar (nomes preservados para os ganchos dos testes). Padrao: minificado.
export default defineConfig(({ mode }) => ({
  plugins: [viteSingleFile()],
  build: {
    target: 'es2019',
    minify: mode === 'debug' ? false : true,
    outDir: mode === 'debug' ? 'dist-debug' : 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 4000,
  },
}));
