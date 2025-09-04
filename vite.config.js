import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // автоматическое обновление service worker
      includeAssets: ['favicon.ico', 'robots.txt'], // доп. ассеты для кэша
      manifest: {
        name: 'IAS Portal',
        short_name: 'IAS',
        description: 'Личный кабинет по охране труда',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: 'https://ias-m.ru/',
        scope: 'https://ias-m.ru/',
        lang: 'ru', // у тебя контент на русском, лучше указать так
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 час
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true // включает PWA в режиме dev (удобно для теста)
      }
    })
  ],
  server: {
    port: 3000,
    host: true // чтобы было доступно по сети (для тестов на телефоне)
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
