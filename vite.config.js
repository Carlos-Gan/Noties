import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Correcto: Rutas relativas para Electron
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist", // Asegúrate de que coincida con lo que busca main.js
    emptyOutDir: true,
    assetsDir: "assets", // Organiza los archivos JS/CSS
  },
});
