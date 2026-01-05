import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://aids-suitable-register-pendant.trycloudflare.com/',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'https://aids-suitable-register-pendant.trycloudflare.com/',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxy for SignalR
      }
    }
  }
})

