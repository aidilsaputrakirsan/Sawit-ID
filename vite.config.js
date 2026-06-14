import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// .jsx di luar src perlu diizinkan untuk diimpor; dashboard.jsx ada di root.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // dengarkan di semua interface (akses dari LAN)
    port: 5173,
    open: true,
  },
});
