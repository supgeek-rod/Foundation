import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '起始页',
        short_name: '起始页',
        description: '简洁优雅的浏览器起始页：时间、天气、搜索与快捷方式',
        lang: 'zh-CN',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        start_url: '.',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\.(?:jpe?g|png|webp|avif|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bg-images',
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    // 允许通过反代域名访问开发服务器
    allowedHosts: ['foundation.just4fun.online'],
  },
  preview: {
    allowedHosts: ['foundation.just4fun.online'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
