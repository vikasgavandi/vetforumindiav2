import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.trycloudflare.com',
        '.ngrok-free.app',
        '.localtunnel.me'
      ],
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    preview: {
      port: 80,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://backend:4000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://backend:4000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [react()],
    base: './',
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            lucide: ['lucide-react'],
            genai: ['@google/genai']
          }
        }
      },
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
      cssCodeSplit: true, // Enable CSS code splitting
      target: 'es2015'
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', '@google/genai']
    }
  };
});
