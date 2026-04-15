import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimized build for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/v1': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/transactions': 'http://localhost:3000',
      '/investments': 'http://localhost:3000',
    },
  },
});
