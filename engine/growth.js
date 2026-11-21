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
function count(k, n) {
  S.c[k] = (S.c[k] || 0) + (n === undefined ? 1 : n);
  checkPerks();
}
function checkPerks() {
  for (const p in PERK_RULES)
    if (!S.perks.includes(p) && PERK_RULES[p](S.c)) {
      S.perks.push(p);
      say(`${EARNED[p]} (Perk: ${PERKS[p].n})`);
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
const sizeUp = l => (keen() ? `Lv ${l}` : dangerWord(l));
// --- after a fight. Your body never gets tougher: only better armour does that. ---
function survived() {
  count('fights');
  if (S.hp <= Math.ceil(S.maxhp * 0.2)) count('close');
  if (S.hp <= 3 && !S.f.injured) {
    S.f.injured = 1;
    statAdd('twitch', -1, 'Something tore in that fight. Your knee will never be right.');
  }
}
