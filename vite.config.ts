import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    // ✅ Fix EBUSY: exclude Flutter build folders from the dev watcher
    watch: {
      ignored: [
        '**/mobile/**/build/**',
        '**/mobile/**/.dart_tool/**',
        '**/mobile/**/.flutter-plugins**',
        '**/node_modules/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
