import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// See README.md and _bmad-output/planning-artifacts/architecture spine (app-test,
// homelab-infra repo) for the rationale behind each choice below.
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Discord Webhook Sender',
        short_name: 'app-test',
        description: 'Envie mensagens para um webhook do Discord direto do navegador.',
        theme_color: '#5865F2',
        background_color: '#1e1f22',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the built app shell — there is no API/data to cache,
        // this app has no backend (NFR3).
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
});
