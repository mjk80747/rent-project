import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('lottie')) return 'lottie';
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'motion';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-vendor';
          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
