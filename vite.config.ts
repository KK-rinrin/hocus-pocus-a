import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    emptyOutDir: false,
    outDir: 'target',
    rollupOptions: {
      input: 'src/features/tailwind.index.css',
      output: { assetFileNames: 'index.css' },
    },
  },
});
