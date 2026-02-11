import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
