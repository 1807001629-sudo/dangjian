import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  // 解决路径问题
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  // 服务器配置（针对HBuilder X优化）
  server: {
    host: 'localhost',
    port: 3000,
    open: false,
    cors: true,
    hmr: true,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  
  // 公共基础路径（HBuilder X可能需要）
  base: './',
  
  // CSS配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: ''
      }
    }
  }
})