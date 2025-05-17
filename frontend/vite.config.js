import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../Shared'),
    },
    dedupe: ['socket.io-client'],
  },
  server: {
    port: 5173,
  },
})
