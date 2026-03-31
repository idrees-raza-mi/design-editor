import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.jsx',
      name: 'DesignEditor',
      fileName: 'editor',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'editor.css',
        entryFileNames: 'editor.js'
      }
    }
  }
})
