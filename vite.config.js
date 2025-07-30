import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import polyfillNode from 'rollup-plugin-polyfill-node'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  build: {
    rollupOptions: {
      plugins: [polyfillNode()],
    },
  },
  define: {
    'process.env': {},
  },
  server: {
    proxy: {
      // Quando você chamar '/api/login' no frontend, redireciona para o backend
      '/back': {
        target: 'http://35.196.79.227:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})