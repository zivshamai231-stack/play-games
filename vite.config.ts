import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// Which party this build is for: EVENT=<id> → src/content/<id>.ts, with its public files in events/<id>/public.
const id = process.env.EVENT || "birthday-demo";
const contentFile = `src/content/${id}.ts`;
const publicDir = `events/${id}/public`;
if (!existsSync(contentFile)) throw new Error(`EVENT=${id}: no ${contentFile}`);
if (!existsSync(publicDir)) throw new Error(`EVENT=${id}: no ${publicDir}`);

/** The page title and the link preview come from the party's words; the share picture only if the party has one. */
function eventHtml(): Plugin {
  const src = readFileSync(contentFile, "utf8");
  const brand = /brand:\s*\["([^"]*)",\s*"([^"]*)"\]/.exec(src)?.slice(1).join(" ") ?? id;
  const title = /\bevent:\s*"([^"]*)"/.exec(src)?.[1] ?? brand;
  const og = existsSync(`${publicDir}/og.jpg`)
    ? '<meta property="og:image" content="/og.jpg" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />'
    : "";
  return {
    name: "event-html",
    transformIndexHtml: (html) => html.replaceAll("%BRAND%", brand).replaceAll("%EVENT_TITLE%", title).replace("<!--og-image-->", og),
  };
}

export default defineConfig({
  plugins: [react(), cloudflare(), eventHtml()],
  publicDir,
  // only this party's content file is bundled
  resolve: { alias: { "@event-content": resolve(contentFile) } },
  server: { host: true, port: 5173, hmr: { overlay: false } },
});
