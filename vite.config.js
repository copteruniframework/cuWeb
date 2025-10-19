import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',               // vermeidet die Terser-Warnung
    rollupOptions: {
      input: './assets/js/main.js',
      output: {
        entryFileNames: 'main.bundle.js',
        inlineDynamicImports: true,  // richtig platziert
        manualChunks: undefined      // Code-Splitting aus
      }
    },
    // optional: auch CSS zu einer Datei bündeln
    cssCodeSplit: false
  }
});