import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * IMPORTANT:
 * - We output a stable entry file: dist/assets/vault.js
 * - Ghost loads that script from Cloudflare Pages.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/vault.js",
        chunkFileNames: "assets/chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
