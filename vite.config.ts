import { defineConfig } from 'vite'
import packageInfo from './package.json'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/AthleticTracker/',
  define: { __APP_VERSION__: JSON.stringify(packageInfo.version) },
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icons/*.png'],
    manifest: {
      id: './', name: 'AthleticTracker', short_name: 'AthleticTracker',
      description: 'Your local-first athletic training companion.',
      start_url: './', scope: './', display: 'standalone',
      theme_color: '#f5f7fa', background_color: '#f5f7fa',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: { skipWaiting: false, clientsClaim: true, globPatterns: ['**/*.{js,css,html,png,webmanifest}'] },
  })],
})
