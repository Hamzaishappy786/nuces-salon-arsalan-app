import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Capacitor requires a relative base path so assets load from the webview
  base: './',
  build: {
    outDir: 'dist',
    // Keep chunk sizes reasonable for APK bundling
    chunkSizeWarningLimit: 1000,
  },
})
