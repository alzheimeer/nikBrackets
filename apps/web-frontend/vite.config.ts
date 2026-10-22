import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/v1': 'http://localhost:4000',
      '/api/auth': 'http://localhost:4001',
      '/api/tokens': 'http://localhost:4001',
      '/lan': 'http://localhost:4002',
    },
  },
});
