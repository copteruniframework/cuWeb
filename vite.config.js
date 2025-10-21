import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // vermeidet die Terser-Warnung
    cssCodeSplit: false, // CSS in eine Datei bündeln
    rollupOptions: {
      input: './assets/js/main.js',
      output: {
        entryFileNames: 'main.built.js',
        assetFileNames: 'main.built.[ext]',
        inlineDynamicImports: true, // muss HIER hinein
        manualChunks: undefined     // muss HIER hinein
      }
    }
  }
});