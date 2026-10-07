import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      // Request API lewat origin yang sama saat dev, sehingga tidak terkena
      // CORS / Chrome local-network-access check. Backend tetap jalan di 8000.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // File hasil upload (foto produk/kategori/gudang/merchant). Tanpa ini
      // <img> menunjuk ke localhost:8000 dari origin 5173 dan diblokir
      // Chrome karena cross-loopback request.
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Placeholder SVG milik backend (public/uploads). Dicari juga di sini
      // supaya placeholder tetap bisa dimuat walau URL dari API memakai host
      // backend yang berbeda.
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
