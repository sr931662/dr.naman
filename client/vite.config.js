import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = dirname(fileURLToPath(import.meta.url))

/**
 * The frontend owns the public site AND the CMS (served from public/admin), so
 * only genuinely backend-owned paths are proxied: the API, uploaded media, and
 * the generated SEO files.
 *
 * Proxying rather than calling the backend directly keeps the CMS same-origin
 * with the API, which is what makes its httpOnly login cookie a first-party
 * cookie — the same reason production proxies /api through Vercel.
 */
const BACKEND = process.env.VITE_BACKEND_URL || 'http://localhost:5000'

const proxyPaths = ['/api', '/uploads', '/sitemap.xml', '/robots.txt']

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
    /**
     * ES2015 output cost more than it bought: it downlevelled every
     * `async` function onto a shared runtime helper, and that helper landing
     * in `vendor` made the CMS preload React, the router and Helmet — none of
     * which it uses. Nothing here runs on a browser that old in any case, as
     * the CMS editor calls `structuredClone` (Chrome 98 / Safari 15.4) and the
     * site runs React 19.
     */
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      /**
       * Two entry points: the public React site, and the CMS.
       *
       * The CMS lives here rather than in public/ specifically so Vite
       * compiles it — that is what makes `import.meta.env.VITE_API_URL`
       * resolve inside the CMS exactly as it does in the React app. Files in
       * public/ are copied byte-for-byte and never see environment variables.
       */
      input: {
        main: resolve(root, 'index.html'),
        admin: resolve(root, 'admin/index.html'),
      },
      output: {
        /**
         * Motion gets its own chunk rather than sharing `vendor`.
         *
         * The CMS animates with Framer Motion's React-free `framer-motion/dom`
         * entry. Bucketing every dependency together would mean the CMS had to
         * download React, the router and Helmet to get it — so the two entry
         * points share this chunk and nothing else.
         */
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion'
          return 'vendor'
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.webp', '**/*.avif'],
})
