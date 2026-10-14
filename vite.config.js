import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:8788" } },
  build: {
    outDir: "dist",
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes("node_modules/react") || id.includes("node_modules/scheduler") ? "react" : undefined),
      },
    },
  },
  esbuild: { legalComments: "none", drop: ["debugger"], pure: ["console.log", "console.info", "console.debug"] },
});
