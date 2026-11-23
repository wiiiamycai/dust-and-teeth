'use strict';
// ================= GROWTH: LEARN BY DOING =================
// One fixed, average man. No levels, no points to spend.
//   Skills grow when used (practice), with diminishing returns as they get high.
//   Stats change only through story events (statAdd).
//   Perks are earned from deeds counted in S.c (count -> PERK_RULES).
//   Without Keen Eye, numbers are words: skills, stats, enemy strength and condition.

// --- skills ---
function practice(sk, base) {
  if (!(sk in S.skills)) return;
  const v = S.skills[sk];
  S.skx[sk] = (S.skx[sk] || 0) + base * Math.max(0.08, (100 - v) / 70);
  while (S.skx[sk] >= 1 && S.skills[sk] < 100) {
    S.skx[sk] -= 1;
    S.skills[sk]++;
  }
}
const SKW = {
  melee: ['Flailing', 'Scrappy', 'Handy', 'Brutal', 'Butcher'],
  guns: ['Spraying', 'Shaky', 'Steady', 'Sharp', 'Deadeye'],
  sneak: ['Noisy', 'Clumsy', 'Quiet', 'Shadow', 'Ghost'],
  steal: ['Fumbling', 'Grabby', 'Light-fingered', 'Slick', 'Phantom'],
  speech: ['Mumbling', 'Clumsy', 'Decent', 'Smooth', 'Silver'],
  science: ['Baffled', 'Tinkerer', 'Handy', 'Clever', 'Genius'],
};
const band = v => (v < 25 ? 0 : v < 40 ? 1 : v < 60 ? 2 : v < 80 ? 3 : 4);
const skillWord = k => SKW[k][band(S.skills[k])];
const statWord = v =>
  v <= 2 ? 'feeble' : v <= 4 ? 'below average' : v <= 6 ? 'average' : v <= 8 ? 'strong' : 'exceptional';
// --- stats: story only ---
function statAdd(k, n, why) {
  const b = S.stats[k];
  S.stats[k] = clamp(b + n, 1, 10);
  if (S.stats[k] !== b && why) (n > 0 ? say : bad)(`${why} (${cap(k)} ${n > 0 ? 'up' : 'down'})`);
}
// --- earned perks ---
const PERK_RULES = {
  reader: c => S.talks >= 15,
  tongue: c => (c.talkWin || 0) >= 8,
  fingers: c => (c.stealWin || 0) >= 8,
  hands: c => (c.meleeKill || 0) >= 10,
  eagle: c => (c.aimHit || 0) >= 10,
  keen: c => (c.fights || 0) >= 8 && (c.aimHit || 0) >= 6,
  hombre: c => S.kills >= 15,
  skin: c => (c.dmgTaken || 0) >= 150,
  lucky: c => (c.crit || 0) >= 8,
  wind: c => (c.close || 0) >= 3,
  eater: c => (c.eat || 0) >= 5,
  gut: c => (c.clean || 0) >= 1,
  tax: c => (c.taxman || 0) >= 1,
  butcher: c => (c.flesh || 0) >= 2,
};
const EARNED = {
  reader: "You've started to read people: the twitch before a yes, the breath before a no.",
  tongue: "You've talked your way out of enough trouble that words come easy now.",
  fingers: 'Your hands have learned to move while your face stays still.',
  hands: "You've done enough close work that it doesn't bother you. It should.",
  eagle: "You've learned to pick your spot. Eyes. Groin. Whatever's soft.",
  keen: "Enough fights and you learn to size a man up before he moves: how hurt, how strong, what he's carrying.",
  hombre: 'People have started stepping off the road when they see you coming.',
  skin: "You've been hit so often your body has stopped arguing about it.",
  lucky: 'Some people are lucky. You are one of them. Nobody knows why.',
  wind: "You've nearly died enough times that your body knows the way back.",
  eater: 'Your stomach has stopped complaining about what you put in it.',
  gut: 'You beat the Buzz. Your guts can handle anything now.',
  tax: 'The government is gone. You checked. You owe nothing to anyone.',
  butcher: 'Lou and Krug have started calling you a regular.',
};
// --- the experience bar (v8.8, Will: "there should be an experience bar as well") ---
// Still no levels: the bar fills towards a perk, by doing the thing that earns it. It follows whatever you did
// last (land an aimed shot and it shows Eagle Eye), or the perk you're closest to. The story perks (Iron Gut,
// Tax Exempt, Butcher's Pal) come as surprises and have no bar.
const PERK_GOAL = {
  hands: { k: 'meleeKill', n: 10, w: 'melee kills' },
  eagle: { k: 'aimHit', n: 10, w: 'aimed hits' },
  keen: { k: 'fights', n: 8, w: 'fights', and: { k: 'aimHit', n: 6 } },
  lucky: { k: 'crit', n: 8, w: 'critical hits' },
  tongue: { k: 'talkWin', n: 8, w: 'talk-downs' },
  fingers: { k: 'stealWin', n: 8, w: 'clean steals' },
  reader: { k: 'talks', n: 15, w: 'conversations' },
  hombre: { k: 'kills', n: 15, w: 'kills' },
  skin: { k: 'dmgTaken', n: 150, w: 'damage taken' },
  wind: { k: 'close', n: 3, w: 'near-deaths' },
  eater: { k: 'eat', n: 5, w: 'strange meals' },
};
const goalHave = k => (k === 'talks' ? S.talks || 0 : k === 'kills' ? S.kills : S.c[k] || 0);
const goalFrac = p => {
  const G = PERK_GOAL[p],
    a = Math.min(1, goalHave(G.k) / G.n);
  return G.and ? (a + Math.min(1, goalHave(G.and.k) / G.and.n)) / 2 : a;
};
// which perk the bar shows: the one you just worked at, else the nearest
function perkBar() {
  if (!S) return null;
  const open = Object.keys(PERK_GOAL).filter(p => !S.perks.includes(p));
  if (!open.length) return null;
  const p = open.includes(S.pfocus) ? S.pfocus : open.reduce((a, b) => (goalFrac(b) > goalFrac(a) ? b : a));
  const G = PERK_GOAL[p];
  return {
    p,
    n: PERKS[p].n,
    frac: goalFrac(p),
    txt: `${PERKS[p].n} ${Math.min(G.n, Math.floor(goalHave(G.k)))}/${G.n}`,
  };
}
function count(k, n) {
  S.c[k] = (S.c[k] || 0) + (n === undefined ? 1 : n);
  const p = Object.keys(PERK_GOAL).find(
    q => !S.perks.includes(q) && (PERK_GOAL[q].k === k || (PERK_GOAL[q].and || {}).k === k),
  );
  if (p) S.pfocus = p;
  checkPerks();
}
function checkPerks() {
  for (const p in PERK_RULES)
    if (!S.perks.includes(p) && PERK_RULES[p](S.c)) {
      S.perks.push(p);
      if (S.pfocus === p) S.pfocus = null;
      say(`★ NEW PERK: ${PERKS[p].n}! ${EARNED[p]} (${PERKS[p].d})`);
    }
}
// --- reading danger without Keen Eye ---
const keen = () => perk('keen');
const dangerWord = l =>
  l <= 2 ? 'harmless' : l <= 4 ? 'can handle themselves' : l <= 6 ? 'dangerous' : l <= 8 ? 'very dangerous' : 'deadly';
const condWord = (hp, max) =>
  hp <= 0
    ? 'dead'
    : hp >= max
      ? 'unhurt'
      : hp >= max * 0.75
        ? 'scratched'
        : hp >= max * 0.5
          ? 'wounded'
          : hp >= max * 0.25
            ? 'badly hurt'
            : 'barely standing';
// No danger words (v9.3, Will: "don't even bother with the difficulty labels, let the player find out
// themselves"): without Keen Eye you learn how strong someone is by fighting them.
const sizeUp = l => (keen() ? `Lv ${l}` : '');
const subJoin = (...a) => a.filter(Boolean).join(' · ');
// --- after a fight. Your body never gets tougher: only better armour does that. ---
function survived() {
  count('fights');
  if (S.hp <= Math.ceil(S.maxhp * 0.2)) count('close');
  if (S.hp <= 3 && !S.f.injured) {
    S.f.injured = 1;
    statAdd('twitch', -1, 'Something tore in that fight. Your knee will never be right.');
  }
}
