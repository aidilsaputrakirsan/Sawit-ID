import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/Sawit-ID/" hanya saat build (untuk GitHub Pages project site);
// saat dev lokal tetap "/" agar mudah diakses.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Sawit-ID/" : "/",
  plugins: [react()],
  server: {
    host: true, // dengarkan di semua interface (akses dari LAN)
    port: 5173,
    open: true,
  },
}));
