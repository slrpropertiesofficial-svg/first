import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In local dev, /api calls are proxied to a running Pages Functions server
// (npx wrangler pages dev dist --d1=DB --r2=BUCKET) on port 8788.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:8788" } },
  build: { outDir: "dist", chunkSizeWarningLimit: 700 },
});
