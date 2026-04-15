import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/transactions': 'http://localhost:3000',
      '/api/v1': 'http://localhost:3000',
      '/investments': 'http://localhost:3000',
    },
  },
});
