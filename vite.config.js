import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy AI Agent & MCP requests to BharatVerse AI Backend
      "/api/chat": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/api/itinerary": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/api/rag": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/api/mcp": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/api/health": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      // Proxy all other requests starting with /api to Strapi backend
      "/api": {
        target: "http://localhost:1337",
        changeOrigin: true,
        secure: false,
      },
      // Optionally proxy graphql and other paths if needed
      "/graphql": {
        target: "http://localhost:1337",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["lucide-react", "framer-motion"],
        },
      },
    },
  },
});
