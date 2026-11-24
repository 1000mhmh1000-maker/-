import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'www',
  base: './',
  build: {
    outDir: 'build',
    emptyOutDir: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: resolve(process.cwd(), 'www/game.js'),
      output: {
        entryFileNames: 'game.bundle.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  }
});
