import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/pvgis': {
        target: 'https://re.jrc.ec.europa.eu/api/v5_2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pvgis/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Solar Calculator App)',
        },
      },
    },
  },
});