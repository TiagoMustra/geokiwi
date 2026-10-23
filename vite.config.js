import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks(id) {
      if (id.endsWith('/data/world.json')) return 'world-atlas';
      if (id.includes('/node_modules/')) return 'vendor';
    } } },
  },
});
