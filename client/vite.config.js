import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * In development the Vite dev server proxies everything the backend owns, so
 * one origin (http://localhost:5173) serves the site, the CMS and the API —
 * matching how production behaves, where Express serves the built site itself.
 */
const BACKEND = process.env.VITE_BACKEND_URL || 'http://localhost:5000'

const proxyPaths = ['/api', '/admin', '/uploads', '/sitemap.xml', '/robots.txt']

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      proxyPaths.map(path => [path, {
        target: BACKEND,
        changeOrigin: true,
        // The CMS uses an httpOnly refresh cookie; without this the Set-Cookie
        // domain would not match the dev origin and sessions would not persist.
        cookieDomainRewrite: 'localhost',
      }]),
    ),
  },
  build: {
    target: 'es2015',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => id.includes('node_modules') ? 'vendor' : undefined,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.webp', '**/*.avif'],
})
