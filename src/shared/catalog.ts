/** Things the phones, the TV and the server must agree on. The values come from the party's content (src/content). */
import { EVENT } from "../content";
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
