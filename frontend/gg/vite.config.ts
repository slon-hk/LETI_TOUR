import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // One Three.js instance for both PSV core and markers-plugin
    dedupe: ['three', '@photo-sphere-viewer/core'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // three + all PSV packages in one chunk — same Three.js instance guaranteed
          if (id.includes('photo-sphere-viewer') || id.includes('three')) return 'vendor-pano'
          if (id.includes('leaflet')) return 'vendor-map'
          if (id.includes('@tanstack')) return 'vendor-query'
        },
      },
    },
  },
})
