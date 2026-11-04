import type { GameState } from "../shared/types";
import { EVENT } from "../content";
import { TONES, type ToneId, type TonePack } from "../content/tones";
import type { Lines } from "../content/types";

/** The copy the game runs on right now: the host's tone, plus the party's own jokes, with names filled in. */
export type Copy = Omit<TonePack, "id" | "name" | "blurb">;
/** what a party adds: any part of it, lines one by one */
type Extra = Partial<Omit<Copy, "lines">> & { lines?: Partial<Lines> };

const cache = new Map<string, Copy>();

function deepFill<T>(v: T, f: (s: string) => string): T {
  if (typeof v === "string") return f(v) as T;
  if (Array.isArray(v)) return v.map((x) => deepFill(x, f)) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepFill(x, f)])) as T;
  return v;
}

/** The party's copy on top of a tone: lists are added to, single lines replace. */
function merge(base: Copy, extra: Extra, replace = false): Copy {
  if (replace) return { ...base, soundLines: {}, ...extra, lines: { ...base.lines, ...extra.lines } } as Copy;
  const out = { ...base, lines: { ...base.lines } } as Copy;
  for (const [k, v] of Object.entries(extra) as [keyof Copy, unknown][]) {
    if (v === undefined) continue;
    if (k === "lines") {
      for (const [lk, lv] of Object.entries(v as object)) {
        const cur = (out.lines as unknown as Record<string, unknown>)[lk];
        (out.lines as unknown as Record<string, unknown>)[lk] = Array.isArray(cur) && Array.isArray(lv) ? [...lv, ...cur] : lv;
      }
    } else if (k === "soundLines") out.soundLines = { ...out.soundLines, ...(v as object) };
    else if (Array.isArray(v) && Array.isArray(out[k]) && k !== "drinkWheel") (out as unknown as Record<string, unknown>)[k] = [...v, ...(out[k] as unknown[])];
    else (out as unknown as Record<string, unknown>)[k] = v;
  }
  return out;
}

export function toneOf(s: GameState): ToneId {
  return (s.settings.tone in TONES ? s.settings.tone : "playful") as ToneId;
}

export function copyFor(s: GameState): Copy {
  const tone = toneOf(s);
  const star = s.players.find((p) => p.isGroom)?.name ?? EVENT.words.star;
  const cur = s.settings.currency;
  const key = `${tone}|${star}|${cur}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const extra = EVENT.copy ?? {};
  const base: Copy = EVENT.copyMode === "replace" ? merge(TONES.playful, extra, true) : merge(TONES[tone], extra);
  const filled = deepFill(base, (t) =>
    t.replaceAll("{star}", star).replaceAll("{cur}", cur).replaceAll("{coin}", EVENT.words.coin).replaceAll("{kingT}", EVENT.words.king).replaceAll("{lastT}", EVENT.words.last),
  );
  if (cache.size > 50) cache.clear();
  cache.set(key, filled);
  return filled;
}
