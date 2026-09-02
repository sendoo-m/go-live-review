import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  // ✅ Fix EBUSY: exclude Flutter build folders from watcher
  watch: {
    ignored: [
      '**/mobile/**/build/**',
      '**/mobile/**/.dart_tool/**',
      '**/mobile/**/.flutter-plugins**',
      '**/node_modules/**',
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
