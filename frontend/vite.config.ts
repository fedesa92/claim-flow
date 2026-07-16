import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ClaimFlow — Sinistri, senza attrito',
        short_name: 'ClaimFlow',
        description: 'Denuncia digitale e prenotazione del perito',
        theme_color: '#113c35',
        background_color: '#f4f6f1',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    })
  ],
  server: { port: 5173, host: '0.0.0.0' }
})
