import { useState } from "react";
import type { ClientView } from "../../shared/types";
import { cls, fmt } from "../lib";
import { creds, type Game } from "../net";
import { sfx } from "../sound";
import { Avatar, Marquee, toast } from "../ui";
import { CIRCLES, WORDS } from "../../shared/catalog";

export function JoinScreen({ game, view }: { game: Game; view: ClientView }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const { startBalance, currency, allowJoinNew } = view.pub.settings;
  // a party with circles asks one more thing before you're in: how you know the star (and whether you want missions)
  const [step, setStep] = useState<{ payload: { playerId?: string; name?: string }; key: string; who: string } | null>(null);
  const [circle, setCircle] = useState<string | null>(null);
  const [spectator, setSpectator] = useState(false);
  // how they met the star: asked only if the organizer didn't already write it from the form
  const [story, setStory] = useState("");
  const [askStory, setAskStory] = useState(false);
  const star = view.pub.players.find((p) => p.isGroom);

  const pick = (payload: { playerId?: string; name?: string }, key: string, who: string, known: string | null, knownStory: string | null = null) => {
    if (!CIRCLES.length) return void join(payload, key);
    setCircle(known);
    setStory("");
    setAskStory(!knownStory && payload.playerId !== star?.id);
    setSpectator(false);
    setStep({ payload, key, who });
  };

  const join = async (payload: { playerId?: string; name?: string; circle?: string | null; story?: string; spectator?: boolean }, key: string) => {
    setBusy(key);
    try {
      const r = await game.act<{ token: string }>("join", payload);
      creds.token = r.token;
      game.rehello();
      sfx.join();
    } catch (e) {
      toast((e as Error).message, "err", 5000);
    } finally {
      setBusy(null);
    }
  };

  if (step)
    return (
      <div className="join">
        <h1 className="join-title">היי {step.who} 👋</h1>
        <p className="join-lede">{star && !(step.payload.playerId === star.id) ? `מאיפה אתם מכירים את ${star.name}?` : "מאיזה עולם הגעתם?"}</p>
        <div className="join-circles" role="radiogroup">
          {CIRCLES.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={circle === c} className={cls("circle-chip", circle === c && "on")} onClick={() => setCircle(c)}>
              {c}
            </button>
          ))}
        </div>
        <p className="join-hint">המשימות הסודיות שלכם יהיו בעיקר על אנשים מעולמות אחרים. ככה כולם מכירים את כולם.</p>
        {askStory && star && (
          <label className="field join-story">
            <span>איך הכרתם את {star.name}? משפט אחד. הוא עולה לטלוויזיה כשנכנסים</span>
            <input value={story} onChange={(e) => setStory(e.target.value)} maxLength={120} placeholder="למשל: ישבנו באותו שולחן בכיתה י׳ ולא הפסקנו לדבר" />
          </label>
        )}
        <label className="check join-spectator">
          <input type="checkbox" checked={spectator} onChange={(e) => setSpectator(e.target.checked)} />
          <span>רק להמר ולהצביע. בלי משימות סודיות</span>
        </label>
        <button type="button" className="btn btn-gold join-go" disabled={!circle || !!busy} onClick={() => void join({ ...step.payload, circle, spectator, ...(story.trim() ? { story: story.trim() } : {}) }, step.key)}>
          {busy ? "נכנס…" : "נכנסים למשחק"}
        </button>
        <button type="button" className="link-btn" onClick={() => setStep(null)}>
          חזרה
        </button>
      </div>
    );

  return (
    <div className="join">
      <Marquee size="m" />
      <p className="join-lede">
        {WORDS.joinText.replace("{start}", `${fmt(startBalance)} ${currency}`)}
      </p>
      <h1 className="join-title">בחרו את השם שלכם</h1>
      <div className="join-grid">
        {view.pub.players.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cls("join-card", p.claimed && "taken", p.isGroom && "groom")}
            disabled={!!busy}
            onClick={() =>
              p.claimed
                ? toast(`${p.name} כבר מחובר ממכשיר אחר. אם זה אתם, בקשו מהמנחה לשחרר את השם.`, "info", 5000)
                : pick({ playerId: p.id }, p.id, p.name, p.circle, p.story)
            }
          >
            <span className="card-corner top" aria-hidden="true">
              {p.ticker}
            </span>
            <Avatar p={p} size={72} />
            <span className="join-name">{p.name}</span>
            <span className="join-sub">{busy === p.id ? "מתחבר…" : p.claimed ? "כבר בפנים" : p.isGroom ? `${WORDS.star} 👑` : "פנוי"}</span>
            <span className="card-corner bottom" aria-hidden="true">
              {p.ticker}
            </span>
          </button>
        ))}
      </div>
      {allowJoinNew &&
        (showNew ? (
          <form
            className="join-new"
            onSubmit={(e) => {
              e.preventDefault();
              pick({ name: newName.trim() }, "new", newName.trim(), null);
            }}
          >
            <label className="field">
              <span>השם שלכם</span>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={16} autoFocus enterKeyHint="go" />
            </label>
            <button type="submit" className="btn btn-gold" disabled={newName.trim().length < 2 || !!busy}>
              הצטרפות
            </button>
          </form>
        ) : (
          <button type="button" className="link-btn" onClick={() => setShowNew(true)}>
            השם שלי לא ברשימה
          </button>
        ))}
    </div>
  );
}
