import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
