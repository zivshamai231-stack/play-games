import type { GameState, Mission, PlayerRec, RoundKind, RoundOption, RoundRec, Settings } from "../shared/types";
import { EVENT, type QuizSeed, type RoundSeed } from "../content";

/* Builds a fresh game from the party's content (src/content). Nothing here is about a specific party. */

/** Ids that say nothing: an alert carries the mission id, and ordered ids would give away whose list it came from. */
function randomId() {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return [...a].map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
}

export const DEFAULT_SETTINGS: Settings = {
  currency: "שקדים",
  startBalance: 1000,
  allowJoinNew: false,
  bankBonus: 200,
  catchReward: 100,
  falsePenalty: 50,
  bailoutAmount: 300,
  prize1: "",
  prize2: "",
  prize3: "",
  prizeLast: "",
  nightCap: 300,
  catchWindow: 30,
  confirmByTarget: false,
  confirmWindow: 120,
  ...EVENT.settings,
};

/** Every seeded player as a vote option (the host's vote form and new guests refresh this when a vote opens). */
export const everyone = (): RoundOption[] => EVENT.players.map(([id, name]) => ({ id, label: name, playerId: id }));

function round(kind: RoundKind, seed: RoundSeed, i: number): RoundRec {
  const [emoji, title, note, options, noBet] = seed;
  return {
    id: `${kind === "night" ? "n" : "r"}${i + 1}`,
    kind,
    emoji,
    title,
    note,
    image: null,
    options,
    minBet: 50,
    maxBet: 500,
    seconds: kind === "night" ? 0 : 60,
    bonus: kind === "night" ? 300 : 200,
    reward: 0,
    correctId: null,
    noBet,
    status: "draft",
    openedAt: null,
    closesAt: null,
    winnerId: null,
    resolvedAt: null,
    refunded: false,
    losers: [],
    loserReason: null,
    lines: {},
    task: null,
    game: seed[5] ?? null,
    mult: 1,
    final: false,
    crown: null,
    phase: null,
  };
}

function quiz(seed: QuizSeed, i: number): RoundRec {
  const [emoji, title, note, options, correct, noBet] = seed;
  return { ...round("quiz", [emoji, title, note, options, noBet], i), id: `q${i + 1}`, seconds: 25, bonus: 50, reward: 100, correctId: correct };
}

function vote(title: string, i: number): RoundRec {
  return { ...round("vote", ["🗳️", title, EVENT.voteNote, everyone(), []], i), id: `v${i + 1}`, seconds: 40, bonus: 0, reward: 100 };
}

/** Two challenges, then a question or a vote, taking turns. */
function interleave(): RoundRec[] {
  const ch = EVENT.challenges.map((r, i) => round("challenge", r, i));
  const qz = EVENT.quiz.map(quiz);
  const vt = EVENT.votes.map(vote);
  const out: RoundRec[] = [];
  let turn = 0;
  while (ch.length || qz.length || vt.length) {
    out.push(...ch.splice(0, 2));
    const next = turn++ % 2 === 0 ? (qz.shift() ?? vt.shift()) : (vt.shift() ?? qz.shift());
    if (next) out.push(next);
  }
  return out;
}

export function seedState(now: number): GameState {
  const players: PlayerRec[] = EVENT.players.map(([id, name, ticker, star, circle]) => ({
    id,
    name,
    ticker,
    photo: null,
    isGroom: !!star,
    token: null,
    joinedAt: null,
    hat: null,
    item: null,
    circle: circle ?? null,
    spectator: false,
  }));
  const missions: Mission[] = EVENT.missions.map(([template, reward, audience]) => ({
    id: randomId(),
    template,
    text: template,
    targets: {},
    reward,
    audience,
    assignedTo: null,
    status: "open",
    claimedAt: null,
    doneAt: null,
    caughtBy: null,
    confirmBy: null,
  }));
  return {
    v: 1,
    seq: 0,
    settings: { ...DEFAULT_SETTINGS },
    players,
    rounds: [...interleave(), ...EVENT.night.map((r, i) => round("night", r, i))],
    bets: [],
    missions,
    ledger: [],
    accusations: [],
    bailouts: [],
    feed: [],
    wheel: null,
    tv: { mode: "lobby", at: now, step: 0 },
    activeRoundId: null,
    lastResolvedId: null,
    draw: null,
    shouts: [],
    doubleNext: false,
    king: null,
    kingAt: 0,
    cards: { veto: false, double: false, drink: false },
  };
}
