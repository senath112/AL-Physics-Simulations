import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dynamic port: uses PORT or VITE_PORT if provided in environment, or 0 (any free port) if explicitly requested,
    // and strictPort is false so it automatically finds the next available port instead of failing.
    port: process.env.VITE_PORT ? Number(process.env.VITE_PORT) : (process.env.PORT ? Number(process.env.PORT) : 0),
    strictPort: false,
    host: true,
  },
  preview: {
    port: process.env.VITE_PREVIEW_PORT ? Number(process.env.VITE_PREVIEW_PORT) : (process.env.PORT ? Number(process.env.PORT) : 0),
    strictPort: false,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('plotly.js')) {
              return 'plotly';
            }
            if (id.includes('katex')) {
              return 'katex';
            }
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
