import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: '/src',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'istanbul',
      enabled: false,
      include: ['src/**/*.{ts,tsx}'],
      reporter: ['html', 'text'],
      threshold: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
      },
    },
  },
} as UserConfig);
