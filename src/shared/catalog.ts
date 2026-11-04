/** Things the phones, the TV and the server must agree on. The values come from the party's content (src/content). */
import { EVENT } from "../content";
import { TONES, type Sip, type ToneId } from "../content/tones";
export type { ShopItem, Sound } from "../content";

export const SHOP = EVENT.shop;

/** One-on-one games: the host's quick duel, and the winner pictures. */
export const GAMES = EVENT.games;

/** What a phone can throw at the TV. */
export const REACTIONS = EVENT.reactions;

/** The host's soundboard: plays on the TV right away. */
export const SOUNDS = EVENT.sounds;

/** What the star's golden cards do, for his phone and the TV. */
export const CARDS = EVENT.cards;

/** "How to play" on the TV at the start of the night: the host clicks through, the announcer reads each one. */
export const RULES = EVENT.rules;

/** The words and media every screen uses. */
export const WORDS = EVENT.words;
export const MEDIA = EVENT.media;
export const CIRCLES = EVENT.circles;

/** The star's id in the seeded list, and the picture of his face for drawings. */
export const STAR_ID = EVENT.players.find((p) => p[3])?.[0] ?? null;
export const STAR_FACE = EVENT.media.face;

/** The evening's colors (the host can switch them live). Swatches: background, accent, paper. */
export const THEMES: { id: string; name: string; swatch: [string, string, string] }[] = [
  { id: "casino", name: "קזינו", swatch: ["#0b3b2b", "#e9b949", "#f3e3c3"] },
  { id: "neon", name: "מועדון", swatch: ["#1a0f3a", "#ff4fd8", "#f1eaff"] },
  { id: "sunset", name: "שקיעה", swatch: ["#4a1c12", "#ffb347", "#fff1e0"] },
  { id: "midnight", name: "חצות", swatch: ["#0d1d3d", "#d9dee8", "#e9eef7"] },
  { id: "rose", name: "רוז", swatch: ["#4a1027", "#f6c1a6", "#fff0f3"] },
];

/** What drinking is called on the screens tonight: follows the host's tone, unless the party set its own. */
export function sipFor(tone: string): Sip {
  return { ...(TONES[tone as ToneId] ?? TONES.playful).sip, ...EVENT.copy?.sip };
}
