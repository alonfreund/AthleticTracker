import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icons/*.png'],
    manifest: {
      id: './', name: 'AthleticTracker', short_name: 'AthleticTracker',
      description: 'Your local-first athletic training companion.',
      start_url: './', scope: './', display: 'standalone',
      theme_color: '#102a28', background_color: '#f4f7f5',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,png,webmanifest}'] },
  })],
})
