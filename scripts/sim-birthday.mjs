// Checks for the open-door party features: joining with a circle, missions across circles,
// spectators, and whoever got played confirming a mission. Runs against the birthday demo content.
// Usage: node scripts/sim-birthday.mjs <baseUrl> <adminKey>   (resets the game)
const BASE = process.argv[2] ?? "http://localhost:5173";
const KEY = process.argv[3];
if (!KEY) throw new Error("admin key required");

let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log("  ✓", msg);
  else {
    failures++;
    console.log("  ✗", msg);
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function act(a, p = {}, { token, key } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers["x-token"] = token;
  if (key) headers["x-key"] = key;
  const res = await fetch(`${BASE}/api/act`, { method: "POST", headers, body: JSON.stringify({ a, p }) });
  return res.json();
}
const admin = (a, p) => act(a, p, { key: KEY });
async function view(token) {
  const headers = token ? { "x-token": token } : { "x-key": KEY };
  return (await fetch(`${BASE}/api/view`, { headers })).json();
}

console.log("setup");
ok((await admin("reseed")).ok, "reseed");
await admin("resetGame", { unclaim: true, undeal: true });
await admin("saveSettings", { settings: { catchWindow: 0, confirmWindow: 600, confirmByTarget: true } });
let v = await view();
ok(v.pub.settings.currency === "תמרים", "demo content is loaded (currency תמרים)");
ok(v.pub.settings.allowJoinNew === true, "open door: new names can join");

console.log("joining with a circle");
const seeded = ["tomer", "maya", "noam", "shira", "eden", "eitan", "lior", "yael"];
const tokens = {};
for (const id of seeded) {
  const r = await act("join", { playerId: id, circle: id === "maya" ? "משפחה" : undefined });
  tokens[id] = r.r?.token;
  ok(r.ok && r.d.me.missions.length === 3, `${id} joined with 3 missions`);
}
let r = await act("join", { name: "גיא", circle: "שכנים" });
ok(r.ok, "a new guest joins by name with a circle");
const guy = r.r.playerId;
tokens[guy] = r.r.token;
v = await view();
ok(v.pub.players.find((p) => p.id === guy)?.circle === "שכנים", "the new guest's circle is saved");

r = await act("join", { name: "רותם", circle: "עבודה", spectator: true });
ok(r.ok && r.d.me.missions.length === 0, "a spectator joins with no missions");
const rotem = r.r.playerId;
tokens[rotem] = r.r.token;
r = await act("extraMission", {}, { token: tokens[rotem] });
ok(!r.ok, "a spectator can't ask for an extra mission");

console.log("missions mix the circles");
v = await view();
const circleOf = Object.fromEntries(v.pub.players.map((p) => [p.id, p.circle]));
let cross = 0;
let total = 0;
for (const m of v.admin.missions.filter((x) => x.assignedTo)) {
  for (const [slot, t] of Object.entries(m.targets)) {
    if (slot === "G") continue;
    total++;
    if (circleOf[t] !== circleOf[m.assignedTo]) cross++;
  }
}
ok(total > 0 && cross / total >= 0.8, `targets from another circle: ${cross}/${total}`);

console.log("a spectator switches in and out");
r = await act("setSpectator", { on: false }, { token: tokens[rotem] });
ok(r.ok && r.d.me.missions.length === 3, "out of spectator mode: 3 missions dealt");
r = await act("setSpectator", { on: true }, { token: tokens[rotem] });
ok(r.ok && r.d.me.missions.length === 0, "back to spectator: open missions handed back");

console.log("whoever got played confirms");
const findWithTarget = async (holder) => {
  const vv = await view();
  return vv.admin.missions.find((m) => m.assignedTo === holder && m.status === "open" && Object.entries(m.targets).some(([, t]) => t !== holder));
};
const holder = "noam";
let m = await findWithTarget(holder);
ok(!!m, "noam has a mission about someone");
const victim = Object.values(m.targets).find((t) => t !== holder);
const balBefore = (await view()).pub.players.find((p) => p.id === holder).balance;
r = await act("claimMission", { missionId: m.id }, { token: tokens[holder] });
ok(r.ok, "noam claims it");
v = await view();
let mm = v.admin.missions.find((x) => x.id === m.id);
ok(mm.status === "confirm", "the mission waits for confirmation instead of paying");
let vv = await view(tokens[victim]);
ok(vv.me.toConfirm.some((c) => c.missionId === m.id && c.by === holder), "the victim's phone asks: did it happen?");
const someoneElse = seeded.find((x) => x !== holder && x !== victim && !Object.values(m.targets).includes(x));
r = await act("confirmMission", { missionId: m.id, yes: true }, { token: tokens[someoneElse] });
ok(!r.ok, "a bystander can't confirm it");
r = await act("confirmMission", { missionId: m.id, yes: false }, { token: tokens[victim] });
ok(r.ok, "the victim says it didn't happen");
v = await view();
mm = v.admin.missions.find((x) => x.id === m.id);
ok(mm.status === "open" && mm.deniedBy === victim, "the mission goes back to the holder, marked as denied");
ok(v.pub.players.find((p) => p.id === holder).balance === balBefore, "nobody got paid");

r = await act("claimMission", { missionId: m.id }, { token: tokens[holder] });
ok(r.ok, "noam tries again");
r = await act("confirmMission", { missionId: m.id, yes: true }, { token: tokens[victim] });
ok(r.ok, "this time the victim says yes");
v = await view();
mm = v.admin.missions.find((x) => x.id === m.id);
ok(mm.status === "done", "the mission is paid");
ok(v.pub.players.find((p) => p.id === holder).balance === balBefore + mm.reward, `noam got ${mm.reward}`);

console.log("silence counts as yes");
await admin("saveSettings", { settings: { confirmWindow: 2 } });
const h2 = "lior";
m = await findWithTarget(h2);
const b2 = (await view()).pub.players.find((p) => p.id === h2).balance;
await act("claimMission", { missionId: m.id }, { token: tokens[h2] });
await sleep(3500);
v = await view();
mm = v.admin.missions.find((x) => x.id === m.id);
ok(mm.status === "done", "nobody answered: it paid by itself");
ok(v.pub.players.find((p) => p.id === h2).balance === b2 + mm.reward, "lior got paid");

console.log("votes are about whoever is here");
const vote = v.admin.rounds.find((x) => x.kind === "vote" && x.status === "draft");
r = await admin("openRound", { roundId: vote.id, seconds: 30 });
ok(r.ok, "a vote opens");
v = await view();
const here = v.pub.players.filter((p) => p.claimed).map((p) => p.id).sort();
ok(JSON.stringify(v.pub.round.options.map((o) => o.playerId).sort()) === JSON.stringify(here), `vote options are the ${here.length} guests in the room`);
ok(v.pub.round.options.some((o) => o.playerId === guy), "including the guest who joined by name");
await admin("cancelRound", { roundId: vote.id });

console.log("cleanup");
await admin("saveSettings", { settings: { catchWindow: 30, confirmWindow: 90 } });
await admin("resetGame", { unclaim: true, undeal: true });
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
