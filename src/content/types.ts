import type { Audience, ID, RoundOption, Settings } from "../shared/types";

/* Everything that changes from one party to the next lives in one EventContent object.
   The engine (rules, money, screens) never names a person, a place or a joke. */

/** [id, name, ticker, is the star of the night, circle (how they know the star)] */
export type PlayerSeed = [id: string, name: string, ticker: string, star?: boolean, circle?: string];
/** [emoji, title, note, options, who sits it out, one-on-one game id] */
export type RoundSeed = [emoji: string, title: string, note: string, options: RoundOption[], noBet: string[], game?: string];
/** [emoji, title, note, options, right answer (null = the host picks it live), who sits it out] */
export type QuizSeed = [emoji: string, title: string, note: string, options: RoundOption[], correct: ID | null, noBet: string[]];
/** {G} = the star, {X} / {Y} = other players picked when the mission is dealt */
export type MissionSeed = [template: string, reward: number, audience: Audience];

/** Announcer and TV one-liners. {n} a name (or names), {t} a target or a time span, {r} an amount, {w}/{l}/{game} a duel, {k} a streak, {o} the old king. */
export interface Lines {
  alert: string[];
  reveal: string[];
  revealN: string[];
  caught: string[];
  miss: string[];
  win1: string[];
  winN: string[];
  starWin: string[];
  lose1: string[];
  loseN: string[];
  starLose: string[];
  none: string[];
  duel: string[];
  fast: string[];
  wrong1: string[];
  wrongN: string[];
  silent1: string[];
  silentN: string[];
  slow: string[];
  /** what wrong answers do after a question: "לשתות שוט!" */
  quizPenalty: string;
  broke: string[];
  gift: string[];
  selfGift: string[];
  king: string[];
  kingFirst: string[];
  streak: string[];
  voted1: string[];
  votedN: string[];
  noVotes: string[];
  veto: string[];
  doubled: string[];
  drink: string[];
  photo: string[];
  /** the crown duel: {c} the challenger, {k} the king, {r} the stake */
  crownFell: string;
  crownHeld: string;
}

export interface Surprise {
  id: string;
  label: string;
  /** {king} and {last} are filled with names */
  line: string;
}

export interface ShopItem {
  id: string;
  emoji: string;
  name: string;
  price: number;
  /** a hat sits on the head, an item next to the face */
  slot: "hat" | "item";
}

/** The host's soundboard: plays on the TV right away. `line` is read out by the announcer, `fx` is a sound effect. */
export interface Sound {
  id: string;
  emoji: string;
  label: string;
  line?: string;
  fx: "siren" | "fanfare" | "applause" | "drumroll" | "horn" | "boo" | "boing" | "gotcha" | "alert" | "win";
}

export interface Rule {
  emoji: string;
  title: string;
  text: string;
  line: string;
}

/** Words the screens use. Short, so they fit on a phone. */
export interface Words {
  /** "מסיבת הרווקים של איתי" */
  event: string;
  /** the marquee sign, two lines in Latin letters */
  brand: [string, string];
  /** what the star of the night is called: "החתן", "בעל השמחה" */
  star: string;
  /** one coin of the currency: "שקד" */
  coin: string;
  /** the richest at the end: "מלך השקדים" */
  king: string;
  /** the poorest: "השקד המר" */
  last: string;
  /** "הבורסה של החתן נפתחה" */
  lobbyTitle: string;
  /** under the title on the TV lobby */
  lobbyText: string;
  /** on the join screen */
  joinText: string;
  /** the share certificate on the lobby: the company line ({n} the star's name), and one made-up row */
  certCompany: string;
  certRow: [label: string, value: string];
  awardsTitle: string;
  /** the photo contest */
  contestTitle: string;
  contestNow: string;
  /** examples in placeholders */
  shoutExample: string;
  accuseExample: string;
  roundExample: string;
  quizExample: string;
  /** what everybody sees on the TV ticker when the room is full */
  nudges: string[];
  /** status lines on the loading screen */
  loading: string[];
}

export interface Media {
  /** the loading picture(s); none = a drawn almond rodeo */
  intro: string[];
  /** the star's face in the middle of the wheel */
  wheelHub: string | null;
  /** the star's face on drawn characters (the loading rodeo); null = the star's profile photo */
  face: string | null;
  /** extra pictures of the star for the idle slideshow and the betting pop-ups, with captions */
  starGallery: [src: string, caption: string][];
  /** a JSON list of old photos of the star (the lobby certificate, the idle slideshow); null = none */
  gallery: string | null;
  /** caption for those photos */
  archiveCaption: string;
}

export interface EventContent {
  id: string;
  words: Words;
  media: Media;
  settings: Partial<Settings>;
  players: PlayerSeed[];
  /** circles a guest can pick when joining (how they know the star) */
  circles: string[];
  challenges: RoundSeed[];
  quiz: QuizSeed[];
  night: RoundSeed[];
  missions: MissionSeed[];
  votes: string[];
  voteNote: string;
  /** the party's own jokes, added on top of the host's tone (or the whole copy, with copyMode "replace") */
  copy?: Partial<Omit<import("./tones").TonePack, "lines">> & { lines?: Partial<Lines> };
  copyMode?: "add" | "replace";
  /** late in the night (after this many rounds) the late tasks join in */
  lateAfter: number;
  rules: Rule[];
  sounds: Sound[];
  games: Record<string, { emoji: string; name: string; note: string }>;
  shop: ShopItem[];
  reactions: string[];
  cards: Record<"veto" | "double" | "drink", { emoji: string; name: string; text: string }>;
}
