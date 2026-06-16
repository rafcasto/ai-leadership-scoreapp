import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `vite dev` the /api functions are served by `vercel dev` on :3000.
// We proxy /api to it so the SPA and serverless functions work together locally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
