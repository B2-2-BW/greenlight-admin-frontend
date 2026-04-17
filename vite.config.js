import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: './env',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:28080', // Spring Boot 포트
        changeOrigin: true,
        // ✅ Nginx의 proxy_pass와 동일하게 /api 접두어 제거
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
});
