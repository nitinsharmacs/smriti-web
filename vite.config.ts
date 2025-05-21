import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: '/src'
    }
  }, 
  test: {
    environment: 'jsdom',
    setupFiles: "./tests/setup.ts"
  },
  server: {
    port: 8080
  }
} as UserConfig)
