// vite.config.ts - 完整配置
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // 开发服务器配置
    server: {
      port: 3000,
      host: true, // 允许外部访问
      open: true, // 自动打开浏览器
      
      // 代理配置 - 将API请求转发到后端
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false, // 如果是https需要设置false
          // 配置WebSocket代理
          ws: true,
          // 详细日志
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    
    // 构建配置
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'antd-vendor': ['antd', '@ant-design/icons'],
            'utils-vendor': ['axios', 'dayjs']
          }
        }
      }
    },
    
    // 环境变量配置
    define: {
      // 定义全局常量
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    // 解析配置
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@pages': '/src/pages',
        '@api': '/src/api',
        '@utils': '/src/utils',
        '@hooks': '/src/hooks',
        '@contexts': '/src/contexts',
        '@config': '/src/config',
        '@constants': '/src/constants'
      }
    },
    
    // 预构建配置
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'antd']
    }
  }
})