// Starts a new party from the birthday demo: src/content/<id>.ts and events/<id>/public.
// Usage: node scripts/new-event.mjs <id>     (id: lowercase letters, digits and dashes, e.g. dana-40)
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error("usage: node scripts/new-event.mjs <id>  (a-z, 0-9, -)");
const file = `src/content/${id}.ts`;
const pub = `events/${id}/public`;
if (existsSync(file) || existsSync(pub)) throw new Error(`${id} already exists`);

const demo = readFileSync("src/content/birthday-demo.ts", "utf8").replace('id: "birthday-demo"', `id: "${id}"`);
writeFileSync(file, `// ${id}: written from the organizer's form. Start by replacing PLAYERS, words and settings.\n${demo}`);

mkdirSync(`${pub}/photos/ai`, { recursive: true });
for (const f of ["favicon.svg", "apple-touch-icon.png"]) copyFileSync(`events/birthday-demo/public/${f}`, `${pub}/${f}`);
const manifest = JSON.parse(readFileSync("events/birthday-demo/public/manifest.webmanifest", "utf8"));
writeFileSync(`${pub}/manifest.webmanifest`, JSON.stringify({ ...manifest, name: id, short_name: id }, null, 2) + "\n");

console.log(`created ${file} and ${pub}
next: fill the content, put pictures in ${pub}/photos, then
  EVENT=${id} npm run dev
  scripts/deploy-event.sh ${id} <admin-key>`);
