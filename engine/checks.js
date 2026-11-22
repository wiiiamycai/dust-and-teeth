'use strict';
// ================= CHECKS =================
// Hidden checks. The player never sees a number. Every check has a key in CK (data/checks.js).
// A spec is { sk, base, who, lock, max, group, likes, ear, mods, near, far, shut }:
//   sk     skill rolled (speech, steal, sneak, science)
//   base   flat modifier, the old tag() number
//   who    the NPC it is aimed at. Speech checks get rapport (days chatted) and opinion from them.
//   likes  { fact: bonus } for things the player has learned (S.know)
//   ear    { npc: modifier } applied when that NPC is alive and here
//   mods   () => number, for gear, titles, flags
//   lock   what a failure does:
//          'none'   nothing, the scene's own consequence is enough (usually a fight)
//          'once'   closed for good
//          'change' closed until you learn a new fact about `who` or their opinion of you swings by 15
//          'week'   as 'change', or reopens after 7 days
//          'retry'  stays open for `max` failures (default 3), each one makes the next harder
//   group  several lines that share one lock (different ways to say the same thing)
//   near / far / shut   voiced cue lines. shut is said on the failure that closes a retry check.
let cueQ = [];
const PRON = { f: { he: 'she', him: 'her', his: 'her' }, m: { he: 'he', him: 'him', his: 'his' } };
const pr = id => PRON[(id && NPC[id] && NPC[id].g) || 'm'];
function spec(key, arg) {
  const c = CK[key];
  if (!c) throw new Error('No check ' + key);
  return typeof c === 'function' ? c(arg) : c;
}
const lockKey = (key, arg, s) => s.group || (arg != null ? key + ':' + arg : key);
const knew = f => !!S.know[f];
function know(f) {
  if (!S.know[f]) S.know[f] = S.day;
}
const factsAbout = who => Object.keys(S.know).filter(k => !who || k.startsWith(who + '.')).length;
function canTry(key, arg) {
  const s = spec(key, arg),
    r = S.tried[lockKey(key, arg, s)];
  if (!r) return true;
  if (r.lock === 'once') return false;
  if (r.lock === 'retry') return r.n < (r.max || 3);
  if (r.lock === 'week' && S.day - r.day >= 7) return true;
  // The baseline is taken the first time we look after the failure, so the failure's own
  // fallout (an opinion drop, say) doesn't count as "something changed".
  if (r.op == null) {
    r.op = r.who ? S.n[r.who].op : 0;
    r.kf = factsAbout(r.who);
    return false;
  }
  return factsAbout(r.who) > r.kf || (!!r.who && Math.abs(S.n[r.who].op - r.op) >= 15);
}
function chance(s, rec) {
  let m = s.base || 0;
  const w = s.who && S.n[s.who] ? s.who : null;
  if (w && s.sk === 'speech') {
    m += Math.min(12, (S.n[w].ch || 0) * 3);
    m += clamp(Math.round(S.n[w].op / 4), -15, 15);
    if (liarTo(w)) m -= 10; // they've heard you lie
  }
  for (const f in s.likes || {}) if (knew(f)) m += s.likes[f];
  for (const x in s.ear || {}) if (alive(x) && S.n[x].loc === S.here) m += s.ear[x];
  if (s.mods) m += s.mods();
  if (rec) m -= rec.n * (rec.lock === 'retry' ? 10 : 5);
  return P(s.sk, m);
}
const chanceOf = (key, arg) => {
  const s = spec(key, arg);
  return chance(s, S.tried[lockKey(key, arg, s)]);
};
function attempt(key, arg) {
  const s = spec(key, arg),
    lk = lockKey(key, arg, s),
    rec = S.tried[lk];
  const p = chance(s, rec),
    r = Math.random() * 100;
  const won = r < p;
  practice(s.sk, won ? 1.5 : 0.75); // you learn from failing too, just slower
  if (won) {
    gainXP(10);
    if (s.sk === 'speech') count('talkWin');
    if (s.sk === 'steal') count('stealWin');
    return true;
  }
  const lock = s.lock || 'change';
  let n = 1;
  if (lock !== 'none') {
    n = (rec ? rec.n : 0) + 1;
    S.tried[lk] = {
      n,
      day: S.day,
      lock,
      max: s.max,
      who: s.who || null,
      op: null,
      kf: null,
    };
  }
  if (lock === 'retry' && s.shut && n >= (s.max || 3)) cueQ.push(s.shut);
  else cueQ.push(cueLine(s, r - p));
  return false;
}
function cueLine(s, miss) {
  const near = miss < 15;
  if (near && s.near) return s.near;
  if (!near && s.far) return s.far;
  if (s.sk !== 'speech')
    return near
      ? pick(['Nearly had it.', 'So close.'])
      : pick(['Not even close.', 'Your hands knew that was hopeless.']);
  if (!s.who)
    return near
      ? pick(['They almost bought it.', 'Nearly. They wavered.'])
      : pick(['Not even close.', 'They look at you like a dog that talks.']);
  const p = pr(s.who),
    nm = NPC[s.who].n;
  return near
    ? pick([`${nm} almost goes for it.`, `${nm} hesitates. Not quite.`, `${cap(p.he)} wavers. You were close.`])
    : pick([
        `${nm} narrows ${p.his} eyes.`,
        `${nm} isn't buying it.`,
        `${cap(p.he)} looks at you like you're the weather.`,
      ]);
}
// Read People: a vague read on how a line will land. Never a number.
function hint(key, arg) {
  if (!S || !perk('reader')) return '';
  const s = spec(key, arg),
    p = chanceOf(key, arg);
  if (s.who && !NPC[s.who].animal) {
    const h = pr(s.who).he;
    return ` (${p >= 75 ? `${h}'s ready to hear it` : p >= 50 ? `${h} might go for it` : p >= 25 ? `${h}'s not there yet` : `${h}'ll laugh at you`})`;
  }
  return ` (${p >= 75 ? 'looks doable' : p >= 50 ? 'could go either way' : p >= 25 ? 'a long shot' : 'near hopeless'})`;
}
// Option helper: a check line that hides itself once its lock closes.
const chkOpt = (key, arg, label, fn, cls) => (canTry(key, arg) ? [label + hint(key, arg), fn, cls] : null);
// One chat per person per day counts as rapport. Enough of them earns Read People.
function chatted(id) {
  const n = S.n[id];
  if (n.cd === S.day) return;
  n.cd = S.day;
  n.ch = (n.ch || 0) + 1;
  S.talks = (S.talks || 0) + 1;
  practice('speech', 0.3);
  checkPerks();
}
// Fill in fields added after v2 so old saves keep working.
function migrate(s) {
  s.tried = s.tried || {};
  s.know = s.know || {};
  s.talks = s.talks || 0;
  s.later = s.later || [];
  s.c = s.c || {};
  s.lovers = s.lovers || {};
  // People added since the save was made: give them their starting state.
  IDS.forEach(id => {
    if (!s.n[id]) s.n[id] = { loc: NPC[id].loc, op: NPC[id].op || 0, k: [], rx: [], lvl: NPC[id].lvl, st: {}, ch: 0 };
  });
  if (!s.f.gutLoc && !s.f.gutDead) s.f.gutLoc = 'skybus';
  s.skx = s.skx || {};
  s.mods = s.mods || {}; // Sprocket's mods, added in v4.3
  delete s.view; // the walking and isometric views are gone (v4.3)
  delete s.pos;
  delete s.seen;
  IDS.forEach(id => {
    if (s.n[id]) s.n[id].ch = s.n[id].ch || 0;
  });
  return s;
}
