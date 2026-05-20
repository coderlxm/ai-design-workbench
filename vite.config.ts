import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api/doubao': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/doubao/, '/api/v3'),
      },
      '/api/scene-reverse': {
        target: 'https://roosync-new.luteos.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/scene-reverse/, '/v1'),
      },
      '/api/gpt-image-2': {
        target: 'https://aigateway.edgecloudapp.com',
        changeOrigin: true,
        rewrite: () => '/v1/781fd50a39c9a94604c015c35441bf9b/lute-openai-img',
      },
      '/api/gpt-image-2-edit': {
        target: 'https://aigateway.edgecloudapp.com',
        changeOrigin: true,
        rewrite: () => '/v1/781fd50a39c9a94604c015c35441bf9b/lute-openai-img-edit',
      },
      '/api/nano-banana-pro': {
        target: 'https://aigateway.edgecloudapp.com',
        changeOrigin: true,
        rewrite: () => '/v1/781fd50a39c9a94604c015c35441bf9b/lute-openai-img',
      },
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
})
