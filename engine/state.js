'use strict';
// ================= STATE HELPERS =================
const alive = id => !S.dead[id];
const lvl = id => S.n[id].lvl;
const hostile = id => alive(id) && NPC[id].fighter && S.n[id].op <= -60 && S.n[id].loc !== 'party';
const perk = p => S.perks.includes(p);
const evById = i => S.ev[i];
function newGame() {
  const p = PLAYER;
  const n = {};
  IDS.forEach(id => {
    const d = NPC[id];
    n[id] = { loc: d.loc, op: d.op || 0, k: [], rx: [], lvl: d.lvl, st: {}, ch: 0 };
  });
  S = {
    name: p.name,
    stats: { ...p.stats },
    skills: { ...p.skills },
    hp: p.hp,
    maxhp: p.hp,
    teeth: p.teeth,
    weapons: [...p.weapons],
    weapon: p.weapon,
    armors: ['rags'],
    armor: 'rags',
    inv: { ...p.inv },
    day: 1,
    level: 1,
    xp: 0,
    pts: 0,
    perks: [],
    perkPend: 0,
    perkOpts: null,
    karma: 0,
    titles: [],
    f: { gutLoc: 'skybus' },
    dead: {},
    kills: 0,
    spouse: null,
    addicted: false,
    buzzOn: false,
    end: null,
    fight: null,
    scene: 'intro',
    args: [],
    here: 'scrapwell',
    ret: null,
    n,
    ev: [],
    evN: 0,
    crater: {},
    tried: {},
    know: {},
    talks: 0,
    later: [],
    c: {},
    skx: {},
    lovers: {},
  };
}
function P(sk, mod) {
  let v = S.skills[sk] + (mod || 0);
  if (sk === 'speech') {
    v += (S.stats.charm - 5) * 3;
    if (perk('tongue')) v += 15;
  }
  if (sk === 'steal' || sk === 'sneak') {
    v += (S.stats.twitch - 5) * 2;
    if (perk('fingers')) v += 15;
  }
  if (sk === 'science') v += (S.stats.brains - 5) * 2;
  return clamp(v, 5, 95);
}
function cost(base, id) {
  const op = id && S.n[id] ? S.n[id].op : 0;
  return Math.max(1, Math.round(base * clamp(1 - op / 200, 0.6, 1.6) * (perk('tax') ? 0.75 : 1)));
}
function pay(n) {
  if (S.teeth < n) {
    bad(`You need ${n} teeth. You have ${S.teeth}.`);
    return false;
  }
  S.teeth -= n;
  return true;
}
function gain(n) {
  S.teeth += n;
  say(`+${n} teeth.`);
}
function give(k, n) {
  S.inv[k] = (S.inv[k] || 0) + (n || 1);
}
const has = k => (S.inv[k] || 0) > 0;
function take(k) {
  if (has(k)) {
    S.inv[k]--;
    if (!S.inv[k]) delete S.inv[k];
    return true;
  }
  return false;
}
function heal(n) {
  const b = S.hp;
  S.hp = clamp(S.hp + n, 0, S.maxhp);
  return S.hp - b;
}
// Gut Glue puts you all the way back together, in one go.
const GLUE = () => S.maxhp;
function hurt(n, cause) {
  S.hp -= n;
  if (S.hp <= 0) {
    S.hp = 0;
    die(cause);
    return true;
  }
  return false;
}
function addTitle(t) {
  if (!S.titles.includes(t)) {
    S.titles.push(t);
    say(`Reputation: ${t}.`);
  }
}
function karma(n) {
  S.karma += n;
}
function karmaTitle() {
  const k = S.karma;
  return k >= 10
    ? 'Wasteland Saint'
    : k >= 4
      ? 'Decent Sort'
      : k > -4
        ? 'Nobody Special'
        : k > -10
          ? 'Scumbag'
          : 'Walking Atrocity';
}
// No levels in v3. XP is only a quiet tally of what you've done.
function gainXP(n) {
  S.xp += n;
}
function die(cause) {
  cueQ = [];
  S.end = { type: 'death', cause };
  S.fight = null;
  go('ending');
}
function learnSilo() {
  if (!S.f.knowSilo) {
    S.f.knowSilo = 1;
    say('Silo 9 is now on your map.');
  }
}
function mood(op) {
  return op <= -60
    ? '😠 hostile'
    : op <= -35
      ? '😒 cold'
      : op < -10
        ? '🤨 wary'
        : op < 20
          ? '😐 neutral'
          : op < 60
            ? '🙂 friendly'
            : '😍 loyal';
}
const charOpt = () => [
  'Character (stats, gear, perks)',
  () => {
    S.ret = { scene: S.scene, args: S.args };
    go('char');
  },
];
function corpseOpt() {
  if (!S.f.cannibal || !S.f.corpse) return null;
  return [
    `Eat ${S.f.corpse}`,
    () => {
      const h = heal(perk('eater') ? 40 : 20);
      count('eat');
      say(`You eat ${S.f.corpse}. +${h} HP. Peppery.`);
      if (!perk('eater')) karma(-1);
      S.f.corpse = null;
      go(S.scene, ...S.args);
    },
  ];
}
