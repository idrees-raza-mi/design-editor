import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function copyDirRecursive(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }
  const entries = readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-fonts',
      closeBundle() {
        copyDirRecursive('public/fonts', 'dist/fonts')
        copyDirRecursive('public/text-wrapper', 'dist/text-wrapper')
        // Copy test.html as index.html so the hosted URL doesn't 404
        const testHtml = readFileSync('test.html', 'utf8')
        const prodHtml = testHtml
          .replace('./dist/editor.css', './editor.css')
          .replace('./dist/editor.js', './editor.js')
        writeFileSync('dist/index.html', prodHtml)
      }
    }
  ],
  publicDir: 'public',
  define: {
    'process.env': {}
  },
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
