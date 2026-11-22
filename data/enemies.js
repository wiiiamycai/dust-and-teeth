'use strict';
// ================= DATA: ENEMIES =================
// Every enemy type has ONE fixed strength. Nothing here reads the player's skills, perks or progress.
// The world only gets worse through story (the Dentist King's army after the raid) and notoriety
// (the bigger the enemies you make, the bigger the people they send). See molarCrew() and bountyCrew().
// What they carry is what you get: kill them and their weapon and armour are yours.
const ENEMY = {
  raider: { n: 'Raider', i: '💀', lvl: 2, wep: 'pipe' },
  raiderBoss: { n: 'Raider boss', i: '☠️', lvl: 5, wep: 'sledge', arm: 'spikes' },
  moledog: { n: 'Mole-dog', i: '🐕', lvl: 1, teeth: 0, d: [3, 7], hpm: 0.6 },
  molar: { n: 'Molar raider', i: '🦷', lvl: 4, wep: 'molargun' },
  molarVet: { n: 'Molar veteran', i: '🦷', lvl: 5, wep: 'molargun', arm: 'spikes' },
  molarGuard: { n: 'Molar guard', i: '🦷', lvl: 6, wep: 'molargun', arm: 'spikes' },
  molarElite: { n: 'Molar elite', i: '🦷', lvl: 7, wep: 'molargun', arm: 'plate' },
  // cap: slavers want you alive. Lose to them once and you wake up in the pens, not dead.
  slaver: { n: 'Slaver', i: '⛓️', lvl: 5, wep: 'shotgun', arm: 'jacket', cap: 1 },
  tracker: { n: "Krug's tracker", i: '⛓️', lvl: 7, wep: 'rifle', arm: 'plate', cap: 1 },
  deputy: { n: 'Deputy', i: '👮', lvl: 3, wep: 'rifle', arm: 'jacket' },
  guard: { n: "Fenwick's guard", i: '💂', lvl: 4, wep: 'rifle', arm: 'vest' },
  houseman: { n: "Pips's houseman", i: '🎲', lvl: 4, wep: 'shotgun', arm: 'jacket' },
  bounty: { n: 'Bounty hunter', i: '🎯', lvl: 5, wep: 'rifle', arm: 'jacket' },
  bountyAce: { n: 'Bounty hunter', i: '🎯', lvl: 7, wep: 'molargun', arm: 'plate' },
  associate: { n: 'Mall associate', i: '🏷️', lvl: 3, wep: 'pipe', arm: 'jacket' },
  mallEel: { n: 'Something in the water', i: '🐍', lvl: 6, teeth: 0, d: [8, 16], dr: 2 },
  watchman: { n: 'Green watchman', i: '🌾', lvl: 4, wep: 'rifle', arm: 'jacket' },
};
const spawn = (k, o) => {
  const e = ENEMY[k];
  return mkE(e.n, e.i, e.lvl, { ...e, ...(o || {}) });
};
// Notoriety: how much blood is on you, and how many people want it back.
const notoriety = () => S.kills + Math.max(0, -S.karma);
// The King's army grows with the story, never with you.
const molarCrew = () => [
  spawn('molar'),
  S.day >= 12 ? spawn('molarVet') : spawn('molar', { arm: roll(30) ? 'spikes' : null }),
  ...(S.day >= 17 ? [spawn('molar')] : []),
  ...(S.f.kingFed ? [spawn('molar')] : []), // you fed him Chainfield's people
];
const bountyCrew = () =>
  notoriety() >= 25 ? [spawn('bountyAce'), spawn('bounty'), spawn('bounty')] : [spawn('bounty'), spawn('bounty')];
const placeWord = l => (l <= 1 ? 'quiet' : l <= 3 ? 'rough' : l <= 5 ? 'dangerous' : l <= 7 ? 'deadly' : 'hell');
// The Gutmaw: one per world, roams the roads, fixed and enormous. Early on you run, hide or feed it.
const gutmawE = () => {
  const e = mkE('The Gutmaw', '🪱', 12, { teeth: 0 });
  e.hp = e.max = 110;
  e.skill = 55;
  e.d = [9, 20];
  e.dr = 3;
  e.xp = 400;
  return e;
};
