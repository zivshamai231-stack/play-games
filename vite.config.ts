import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), cloudflare()],
  // which party's content goes into this build (src/content)
  define: { __EVENT__: JSON.stringify(process.env.EVENT ?? "") },
  server: { host: true, port: 5173, hmr: { overlay: false } },
});
