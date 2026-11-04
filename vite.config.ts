import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import birthday from "./src/content/birthday-demo";
import itay from "./src/content/itay";

// Which party this build is for: EVENT=<id> (src/content). Each party has its own public files in events/<id>/public.
const EVENTS = { [itay.id]: itay, [birthday.id]: birthday };
const event = EVENTS[process.env.EVENT ?? ""] ?? birthday;
const publicDir = `events/${event.id}/public`;

/** The page title and the link preview come from the party's content; the share picture only if the party has one. */
function eventHtml(): Plugin {
  const brand = event.words.brand.join(" ");
  const og = existsSync(`${publicDir}/og.jpg`)
    ? '<meta property="og:image" content="/og.jpg" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />'
    : "";
  return {
    name: "event-html",
    transformIndexHtml: (html) => html.replaceAll("%BRAND%", brand).replaceAll("%EVENT_TITLE%", event.words.event).replace("<!--og-image-->", og),
  };
}

export default defineConfig({
  plugins: [react(), cloudflare(), eventHtml()],
  publicDir,
  // which party's content goes into this build: only that one file is bundled
  resolve: { alias: { "@event-content": resolve(`src/content/${event.id}.ts`) } },
  server: { host: true, port: 5173, hmr: { overlay: false } },
});
