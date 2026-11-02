import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: '/src/i18n' },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks(id) {
      if (id.includes('/maplibre-gl/')) return 'physical-map';
      if (id.endsWith('/data/world.json')) return 'world-atlas';
      if (id.includes('/node_modules/')) return 'vendor';
    } } },
  },
});
