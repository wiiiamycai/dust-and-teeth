'use strict';
// ================= COMBAT =================
const CRIT = {
  body: [
    t => `Crit! ${t} bends the wrong way.`,
    t => `Crit. Something in ${t} goes pop.`,
    t => `Crit. ${t} coughs up something important.`,
    t => `Crit. You can see daylight through ${t}.`,
  ],
};
const KILLED = [
  t => `${t} dies. Not pretty. Very final.`,
  t => `${t} hits the dirt and stays there.`,
  t => `${t} is dead. The wasteland gets a little better fertilised.`,
  t => `${t} drops like a sack of wet teeth.`,
  t => `${t} twitches twice, then takes up a career as scenery.`,
];
const KILLED_BEAST = [
  t => `${t} squeals, kicks, and goes still. Something will eat it by morning.`,
  t => `${t} folds up in a heap of fur and bad smells.`,
  t => `${t} dies with its mouth open, still trying.`,
];
const deathLine = e => pick(e.beast ? KILLED_BEAST : KILLED)(e.n);
const MISS = ['You miss. The air is unharmed.', 'Miss. A nearby rock flinches.', 'You miss and nearly hit yourself.'];
const QUIET = [
  n => `You wait until ${n} is alone. Then ${n} stays alone, forever.`,
  n => `${n} goes very quietly. You see to it.`,
];
// Everyone is the same flesh: every human has BODY HP, you included, and it never grows.
// Strength is what they carry: their weapon sets their damage, their armour sets their DR.
// Level only means training: a little more accuracy, and more teeth and XP when they die.
const BODY = 30;
// Everyone hits far more often since v8.6, so what lands on you is cut to keep fights as dangerous as before.
const ENEMY_DMG = 0.5;
function mkE(n, i, lv, o) {
  o = o || {};
  const hp = Math.round(BODY * (o.hpm || 1)),
    w = W[o.wep] || W.fists,
    a = A[o.arm];
  return {
    n,
    i,
    lvl: lv,
    hp,
    max: hp,
    skill: 30 + lv * 2,
    d: o.d || w.d.slice(),
    dr: (a ? a.dr : 0) + (o.dr || 0),
    xp: lv * 20,
    teeth: o.teeth != null ? o.teeth : lv * 4 + R(0, lv * 2),
    loot: o.loot || null,
    arm: o.arm || null,
    wep: o.wep || null,
    npc: o.npc || null,
    cap: o.cap || (o.npc === 'krug' ? 1 : null),
    // Beasts (no talking, no gear), their heavy moves, and how they behave. See TELE below.
    beast: !!o.beast,
    kind: o.kind || null, // shell, swarm or flesh (MATCH above); people have none
    venom: !!o.venom, // its bite poisons you
    bleed: 0,
    burn: 0,
    moves: o.moves || null,
    pack: !!o.pack,
    flee: !!o.flee,
    rage: !!o.rage,
    boss: !!o.boss,
    lame: false,
    weak: false,
    blind: 0,
    tele: null,
  };
}
const foe = id => {
  const d = NPC[id];
  return mkE(d.n, d.i, lvl(id), { hpm: d.hpm, npc: id, teeth: 0, wep: S.n[id].st.wep || d.wep || null, arm: d.arm });
};
const dep = () => spawn('deputy');
const slv = () => spawn('slaver');
function crew(id) {
  const e = [foe(id)];
  if (id === 'sheriff') e.push(dep(), dep());
  if (id === 'krug') e.push(slv(), slv());
  if (id === 'pips') {
    if (alive('rook') && S.n.rook.loc === 'snakeeyes') e.push(foe('rook'));
    e.push(spawn('houseman'));
  }
  if (id === 'lou' && alive('junior') && S.n.junior.loc === 'diner') e.push(foe('junior'));
  if (id === 'junior' && alive('lou') && S.n.lou.loc === 'diner') e.push(foe('lou'));
  if (id === 'margie') e.push(spawn('associate'), spawn('associate'));
  if (id === 'warden') e.push(spawn('watchman'));
  return e;
}
// ---- Sprocket's mods (MODS in data/items.js), kept per weapon and per armour in S.mods ----
const modsOf = k => (S && S.mods && S.mods[k]) || [];
const modSum = (k, f) => modsOf(k).reduce((a, m) => a + (MODS[m][f] || 0), 0);
const modName = k => {
  const base = W[k] ? W[k].n : A[k].n,
    m = modsOf(k);
  return m.length ? `${base} (${m.map(x => MODS[x].n).join(', ')})` : base;
};
const pdr = () => A[S.armor].dr + modSum(S.armor, 'dr') + (perk('skin') ? 3 : 0);
const ptw = () => S.stats.twitch + (modSum(S.armor, 'untw') ? 0 : A[S.armor].tw || 0);
const fleeP = () => clamp(ptw() * 7 + S.stats.luck * 2, 5, 90);
// ---- melee vs guns ----
// Guns: strong at range, cost bullets, and LOUD. Gunfire is heard next door and gossip about it moves faster.
// Melee: no ammo, quiet (kill with nobody around and nobody knows), easy to land up close, can knock a man
// down. A fight on the road starts at range; a blade closes the gap with its first swing (v9.9).
const isGun = w => W[w].t === 'guns';
const ammo = () => S.inv.ammo || 0;
// Out of shots? Self-charging guns (the plasma rifle) never are.
const dry = w => isGun(w) && !W[w].free && ammo() <= 0;
const ammoTxt = w => (W[w].free ? 'self-charging' : `${ammo()} bullets`);
// To hit (v8.6, Will: "the miss chances are way too high, make miss chance like 10%"). A plain hit lands about
// nine times in ten; skill, weapon, eyes and the rest still move it, a quarter as much as before, so getting
// better still shows. Aimed shots (eyes, groin, legs, arms) keep their full cost, half again: those are the gamble.
const HIT_BASE = 90;
function hit(t, mod) {
  const w = W[S.weapon],
    F = S.fight,
    skill =
      S.skills[w.t] +
      w.a -
      t.lvl * 2 +
      (w.t === 'guns' ? (S.stats.eyes - 5) * 2 - (F && F.close && !w.close ? 10 : 0) : 10);
  // a gun at range strays a little more than a blade in your hand
  return clamp(
    Math.round(
      HIT_BASE +
        (skill - 50) / 4 +
        (w.t === 'guns' && !(F && F.close) ? -6 : 0) +
        // gear and Buzz count in full: you paid for them
        modSum(S.weapon, 'hit') +
        (S.buzzOn ? 15 : 0) -
        (S.addicted && !S.buzzOn ? 10 : 0) +
        (mod < 0 ? mod * 1.5 : mod),
    ),
    5,
    97,
  );
}
// ---- the right tool: damage types against beast kinds (Pokemon-style matchups, Will's idea) ----
// Shells crack under blunt weapons and shrug off blades and bullets. Swarms are torn up by spread shot and fire,
// and a single bullet mostly misses something that small. Flesh bleeds under a blade. People are neutral.
const DTYPE = {
  fists: 'blunt',
  knife: 'cut',
  pipe: 'blunt',
  sledge: 'blunt',
  cleaver: 'cut',
  machete: 'cut',
  drill: 'blunt',
  ripper: 'cut',
  shotgun: 'spread',
  plasma: 'energy',
};
const dtype = w => DTYPE[w] || (W[w].t === 'guns' ? 'shot' : 'blunt');
const MATCH = {
  shell: { blunt: 1.5, cut: 0.5, shot: 0.5, spread: 0.75, fire: 0.75 },
  swarm: { spread: 1.5, fire: 1.5, shot: 0.6 },
  flesh: { cut: 1.5, fire: 1.25 },
};
const matchOf = (e, ty) => (e.kind && MATCH[e.kind] && MATCH[e.kind][ty]) || 1;
const matchTxt = m => (m >= 1.5 ? ': this works on it' : m <= 0.6 ? ': it barely feels this' : '');
const SUPER = [t => `That's the way to hurt ${t}.`, t => `${t} was not built for that.`, t => `That got through.`];
const WRONG = [t => `It barely bothers ${t}. Wrong tool.`, t => `${t} shrugs it off.`, t => `Like hitting a wall.`];
// ---- reading the enemy: heavy moves you see coming ----
// Every so often an enemy winds up something big, and says so. Next round it lands at double damage, unless
// you put it down first (no dodge or brace since v9.6: hit it, throw something at it, or run). Beasts bring their own moves; people get one by weapon.
function teleFor(e) {
  if (e.moves) return pick(e.moves);
  const g = e.wep && W[e.wep] && W[e.wep].t === 'guns';
  return g
    ? { w: `${e.n} stops, and takes careful aim at your head.`, h: 'aimed shot', x: 2, acc: 20 }
    : { w: `${e.n} winds up a huge swing.`, h: 'big swing', x: 2, acc: 10 };
}
// Running (Will: "the harder the fight, the lower the percentage to run"): every living enemy costs you
// two points a level, scaled by how much of it is left, and a boss costs fifteen more. One hurt rat is easy
// to leave; the Hive Mother is not.
const threat = live =>
  Math.max(0, live.reduce((t, e) => t + e.lvl * 2 * (0.5 + (0.5 * e.hp) / e.max) + (e.boss ? 15 : 0), 0) - 2);
const runP = () => {
  const live = S.fight.en.filter(e => e.hp > 0);
  return clamp(Math.round(fleeP() - threat(live) + (live.length && live.every(e => e.lame) ? 30 : 0)), 5, 95);
};
const winding = () => S.fight.en.some(e => e.hp > 0 && e.tele);
const pct = n => ` (${n}%)`;
// The best weapon of the other kind, for a quick switch mid-fight.
function otherWeapon() {
  if (S.fight && S.fight.pit) return null; // fists and blades only in the pit
  const gun = isGun(S.weapon),
    pool = S.weapons.filter(w => w !== S.weapon && isGun(w) !== gun && !dry(w));
  return pool.sort((a, b) => W[b].d[1] - W[a].d[1])[0] || null;
}
function fight(en, o) {
  o = o || {};
  let E = en;
  const al = [];
  // Whoever walks with you (a spouse or a follower, scenes/follow.js) fights beside you.
  IDS.forEach(x => {
    if (alive(x) && S.n[x].loc === 'party' && !E.some(e => e.npc === x)) al.push(x);
  });
  (o.allies || []).forEach(a => {
    if (alive(a) && !al.includes(a) && !E.some(e => e.npc === a)) al.push(a);
  });
  if (perk('hombre')) {
    const fl = E.filter(e => !e.npc && e.lvl <= 3 && roll(40));
    if (fl.length) {
      say(`${fl.length} of them take one look at you and run.`);
      E = E.filter(e => !fl.includes(e));
    }
    if (!E.length) return WIN[o.win || 'back'](...(o.args || []));
  }
  S.fight = {
    en: E,
    al,
    started: !!o.started,
    win: o.win || 'back',
    args: o.args || [],
    // a fight on the road can always be run from: you get away towards where you were going (v9.33, Will)
    back: o.back || (o.win === 'enc' && o.args && o.args[0] ? ['hub', o.args[0]] : null),
    t: 0,
    round: 1,
    stun: [],
    wind: false,
    log: [],
    // You start up close if you picked the fight with someone in front of you, or were jumped indoors.
    close: !!(o.close || o.started),
    loud: false,
    pit: !!o.pit,
  };
  go('fight');
}
SC.fight = () => {
  const F = S.fight;
  if (!F) return goHere();
  if (!F.en[F.t] || F.en[F.t].hp <= 0) F.t = F.en.findIndex(e => e.hp > 0);
  const t = F.en[F.t],
    w = W[S.weapon],
    gun = w.t === 'guns';
  const kn = keen();
  const cards = F.en.map((e, i) => ({
    icon: e.i,
    name: e.n,
    sub:
      (kn
        ? `Lv ${e.lvl} · armour ${e.dr}${e.hp <= 0 ? (e.fled ? ' · fled' : ' · dead') : ''}${e.wep || e.arm || e.loot ? ' · has ' + [e.wep && W[e.wep].n, e.arm && A[e.arm].n, ...Object.keys(e.loot || {}).map(k => ITEMS[k])].filter(Boolean).join(', ') : ''}`
        : e.fled
          ? 'fled'
          : condWord(e.hp, e.max)) +
      (e.hp > 0
        ? (e.tele ? ' · winding up' : '') +
          (e.lame ? ' · limping' : '') +
          (e.weak ? ' · crippled' : '') +
          (e.blind ? ' · dazzled' : '') +
          (e.bleed ? ' · bleeding' : '') +
          (e.burn ? ' · on fire' : '')
        : ''),
    hp: kn ? e.hp : null,
    max: e.max,
    sel: i === F.t,
    dead: e.hp <= 0,
    on:
      e.hp > 0
        ? () => {
            F.t = i;
            go('fight');
          }
        : null,
  }));
  F.al.forEach(a => {
    if (alive(a)) cards.push({ icon: NPC[a].i, name: NPC[a].n, sub: 'on your side' });
  });
  const o = [];
  if (dry(S.weapon)) o.push(null);
  else {
    // Two choices (v9.6, Will: "remove all the options to shoot things in the leg. One standard attack with a miss
    // chance, and one with a chance to find a weakness, at 30%"). Found, every hit after it does 150 to 200%.
    const v = gun ? 'Shoot' : 'Hit';
    o.push([
      `${v} ${t.n}${pct(hit(t, 0))}${matchTxt(matchOf(t, dtype(S.weapon)))}${t.weakSpot ? ': weak spot' : ''}`,
      () => atk(0),
    ]);
    if (!t.weakSpot) o.push([`Look for a weak spot${pct(weakP())}`, () => seekWeak()]);
  }
  // Things to throw.
  const beasts = F.en.some(e => e.hp > 0 && e.beast);
  if (has('meat') && beasts)
    o.push([
      `Throw meat (${S.inv.meat}): beasts go for it`,
      () => {
        take('meat');
        F.log = ['You throw the meat. Every beast in the fight forgets you exist.'];
        F.en.forEach((e, i) => {
          if (e.hp > 0 && e.beast && !F.stun.includes(i)) F.stun.push(i);
        });
        enemy();
      },
    ]);
  if (has('flare'))
    o.push([
      `Light a flare (${S.inv.flare}): dazzles them all`,
      () => {
        take('flare');
        F.log = ['You crack a flare. Red light, and a lot of squinting.'];
        F.en.forEach(e => {
          if (e.hp > 0) {
            e.blind = 2;
            e.tele = null;
          }
        });
        enemy();
      },
    ]);
  if (has('molotov'))
    o.push([
      `Throw a molotov (${S.inv.molotov}): burns them all`,
      () => {
        take('molotov');
        F.loud = true;
        F.log = ['Glass, a rag, and then everything is on fire.'];
        F.en.forEach(e => {
          if (e.hp <= 0) return;
          const d = Math.round(R(6, 12) * matchOf(e, 'fire'));
          e.hp -= d;
          e.burn = 2;
          F.log.push(`${e.n} burns for ${d}.`);
          if (e.hp <= 0) {
            e.hp = 0;
            F.log.push(deathLine(e));
          }
        });
        if (F.en.every(e => e.hp <= 0)) return win();
        enemy();
      },
    ]);
  const ow = otherWeapon();
  if (ow)
    o.push([
      `Switch to ${W[ow].n}${isGun(ow) ? ` (${ammoTxt(ow)})` : ''}`,
      () => {
        S.weapon = ow;
        go('fight');
      },
    ]);
  if (dry(S.weapon) && !ow)
    o.push([
      'Click. No bullets. Use your fists',
      () => {
        S.weapon = 'fists';
        go('fight');
      },
    ]);
  show({
    title: `Fight · round ${F.round}`,
    icon: '⚔️',
    sub: `${w.n}${gun ? ` · ${ammoTxt(S.weapon)}` : ''} · ${F.close ? 'up close' : 'at range'}${F.en.filter(e => e.hp > 0).length > 1 ? ' · tap one to target it' : ''}`,
    text: F.log.join('\n'),
    cards,
    opts: [
      ...o,
      has('gutglue')
        ? [
            `Gut Glue, back to full (${S.inv.gutglue})`,
            () => {
              take('gutglue');
              F.log = [
                `You glue yourself back together. +${heal(GLUE())} HP.${F.poison ? ' The poison goes with it.' : ''}`,
              ];
              F.poison = 0;
              enemy();
            },
          ]
        : null,
      has('buzz') && !S.buzzOn
        ? [
            'Snort Buzz (sharper aim)',
            () => {
              F.log = [];
              useBuzz();
              enemy();
            },
          ]
        : null,
      F.back
        ? [
            `Run${pct(runP())}`,
            () => {
              if (roll(runP())) {
                say('You run. Your dignity covers your escape.');
                S.fight = null;
                S.buzzOn = false;
                go(F.back[0], ...F.back.slice(1));
              } else {
                F.log = ['You trip over your own ambition.'];
                enemy();
              }
            },
            'danger',
          ]
        : null,
    ],
  });
};
// Beaten by slavers: they want you alive, once. They take your teeth and you wake up in a pen.
function penned() {
  S.f.penned = 1;
  S.fight = null;
  S.buzzOn = false;
  S.hp = 8;
  const t = S.teeth;
  S.teeth = 0;
  bad(`You wake up in a shopping-trolley pen at Chainfield. They took all ${t} of your teeth.`);
  say(
    alive('teo') && S.n.teo.loc === 'chainfield'
      ? 'That night Old Teo picks the lock with a fishbone. "Run. Next time he sells you east, and east is a hole."'
      : 'That night you pick the lock with a fishbone. Next time Krug will sell you east, and east is a hole.',
  );
  go('hub', 'rustwater');
}
// ---- the weak spot ----
const weakP = () => (perk('eagle') ? 45 : 30);
const weakX = () => R(150, 200) / 100; // rolled fresh on every hit
const WEAK = [
  t => `You watch ${t} move, and see it: the place it keeps covering. You know where to hit now.`,
  t => `There. An old wound on ${t}, badly healed. Everything you hit from now on goes there.`,
  t => `${t} favours one side. You see it, and it sees you see it.`,
];
function seekWeak() {
  const F = S.fight,
    t = F.en[F.t];
  F.log = [];
  if (roll(weakP())) {
    t.weakSpot = true;
    count('weakSpot');
    F.log.push(pick(WEAK)(t.n));
  } else F.log.push(`You watch ${t.n} for an opening, and it doesn't give you one.`);
  allyTurn();
  if (F.en.every(e => e.hp <= 0)) return win();
  enemy();
}
function atk(mod) {
  const F = S.fight,
    t = F.en[F.t],
    w = W[S.weapon];
  F.log = [];
  // a blade at range: you close the gap and strike in the same move (v9.9, Will: "drop close in as well")
  if (w.t !== 'guns' && !F.close) {
    F.close = true;
    F.log.push(pick(['You charge.', 'You run at them, yelling.', 'You close the gap, head down.']));
  }
  if (w.t === 'guns') {
    if (!w.free) take('ammo');
    if (!F.loud) F.log.push('BANG. That will be heard for miles.');
    F.loud = true;
  }
  const landed = roll(hit(t, mod));
  practice(w.t, landed ? 1 : 0.4);
  if (landed) {
    let d = R(w.d[0], w.d[1]) + modSum(S.weapon, 'dmg') + (w.t === 'melee' ? Math.max(0, S.stats.brawn - 5) : 0);
    if (w.t === 'melee' && perk('hands')) d = Math.round(d * 1.3);
    let crit = false;
    if (roll(S.stats.luck * 2 + (perk('lucky') ? 10 : 0))) {
      crit = true;
      d *= 2;
      count('crit');
      F.log.push(pick(CRIT.body)(t.n));
    }
    if (t.weakSpot) {
      const x = weakX();
      d = Math.round(d * x);
      F.log.push(x >= 1.8 ? 'Deep in the weak spot. That one went all the way in.' : 'Right in the weak spot.'); // words, not numbers (pillar 4)
    }
    const m = matchOf(t, dtype(S.weapon));
    if (m !== 1) {
      d = Math.round(d * m);
      F.log.push(pick(m > 1 ? SUPER : WRONG)(t.n));
    }
    if (dtype(S.weapon) === 'cut' && t.kind !== 'shell' && !t.bleed && roll(t.kind === 'flesh' ? 50 : 25)) {
      t.bleed = 3;
      F.log.push(`${t.n} is bleeding.`);
    }
    d = Math.max(1, d - t.dr);
    t.hp -= d;
    F.log.push(`You hit ${t.n} for ${d}.`);
    if (t.hp <= 0) {
      t.hp = 0;
      F.log.push(deathLine(t));
      if (w.t === 'melee') count('meleeKill');
    } else if (
      w.t === 'melee' &&
      !crit &&
      !F.stun.includes(F.t) &&
      roll(clamp(10 + (S.stats.brawn - 5) * 6 + (w.kd || 0), 5, 60))
    ) {
      F.stun.push(F.t);
      F.log.push(`${t.n} goes down.`);
    }
  } else F.log.push(pick(MISS));
  allyTurn();
  if (F.en.every(e => e.hp <= 0)) return win();
  enemy();
}
// whoever walks with you hits someone too
function allyTurn() {
  const F = S.fight;
  for (const a of F.al) {
    if (!alive(a)) continue;
    const tt = F.en.find(e => e.hp > 0);
    if (!tt) break;
    if (roll(clamp(80 + lvl(a) * 2 - tt.lvl * 2, 5, 95))) {
      const d = Math.max(1, R(lvl(a), 2 + lvl(a) * 2) - tt.dr);
      tt.hp -= d;
      F.log.push(`${NPC[a].n} hits ${tt.n} for ${d}.`);
      if (tt.hp <= 0) {
        tt.hp = 0;
        F.log.push(deathLine(tt));
      }
    }
  }
}
function enemy() {
  const F = S.fight;
  const pack = F.en.filter(e => e.hp > 0 && e.pack).length >= 2;
  for (let i = 0; i < F.en.length; i++) {
    const e = F.en[i];
    if (e.hp <= 0) continue;
    // Bleeding and burning tick before it acts.
    for (const [k, dmg, txt] of [
      ['bleed', 2, 'bleeds'],
      ['burn', 3, 'burns'],
    ])
      if (e[k] > 0) {
        e[k]--;
        e.hp -= dmg;
        F.log.push(`${e.n} ${txt}. ${dmg} damage.`);
      }
    if (e.hp <= 0) {
      e.hp = 0;
      F.log.push(deathLine(e));
      continue;
    }
    // A hurt beast that values its skin runs for it. No loot from a thing that got away.
    if (e.flee && !e.boss && e.hp < e.max * 0.3 && roll(40)) {
      e.hp = 0;
      e.fled = true;
      e.tele = null;
      F.log.push(`${e.n} bolts, bleeding, into the dark.`);
      continue;
    }
    if (F.stun.includes(i)) {
      if (e.tele) F.log.push(`${e.n} loses its wind-up.`);
      e.tele = null;
      F.log.push(e.beast && !e.lame ? `${e.n} is busy with something else.` : `${e.n} is on the ground.`);
      continue;
    }
    if (e.rage && !e.raged && e.hp <= e.max / 2) {
      e.raged = true;
      F.log.push(`${e.n} is angry now. Properly angry.`);
    }
    const heavy = e.tele;
    e.tele = null;
    // They land about nine in ten too (v8.6), less the quicker you are; their damage is cut to match (ENEMY_DMG).
    const acc =
      HIT_BASE -
      2 +
      (e.skill - ptw() * 3 - 17) / 4 +
      (heavy ? heavy.acc || 0 : 0) +
      (pack && e.pack ? 10 : 0) +
      (e.raged ? 15 : 0) -
      (e.lame ? 10 : 0) -
      (e.blind ? 30 : 0);
    if (roll(clamp(Math.round(acc), 5, 97))) {
      let d = R(e.d[0], e.d[1]) + (e.raged ? 3 : 0);
      if (heavy) d *= heavy.x || 2;
      if (e.weak) d = Math.round(d * 0.6);
      d = Math.max(1, Math.round((d - pdr()) * ENEMY_DMG));
      S.hp -= d;
      count('dmgTaken', d);
      F.log.push(heavy ? `${e.n}'s ${heavy.h} lands. ${d} damage.` : `${e.n} hits you for ${d}.`);
      if (e.venom && !F.poison && roll(40)) {
        F.poison = 3;
        F.log.push('Its bite burns. You are poisoned.');
      }
      if (S.hp <= 0) {
        if (perk('wind') && !F.wind) {
          F.wind = true;
          S.hp = 15;
          F.log.push('SECOND WIND. You refuse to die.');
        } else if (F.pit) {
          return pitYield();
        } else if (!S.f.penned && !S.f.chainfieldBurned && F.en.some(x => x.cap && x.hp > 0)) {
          return penned();
        } else {
          S.hp = 0;
          return die(`Killed by ${e.n}.`);
        }
      }
    } else F.log.push(heavy ? `${e.n}'s ${heavy.h} misses you by a hair.` : `${e.n} misses.`);
    if (e.blind) e.blind--;
    // Wind up the next big one. You'll see it coming.
    if (e.hp > 0 && !e.weak && !e.blind && roll(e.beast ? 35 : 25)) {
      e.tele = teleFor(e);
      F.log.push(e.tele.w);
    }
  }
  if (pack && F.round === 1) F.log.push('They spread out. They have done this before.');
  // Poison works on you at the end of every round, until it runs out or Gut Glue cleans it out.
  if (F.poison > 0) {
    F.poison--;
    S.hp -= 2;
    F.log.push('The poison bites. 2 damage.');
    if (S.hp <= 0) {
      S.hp = 0;
      return die('Poisoned, in a fight with animals.');
    }
  }
  // Everything left ran away: the fight is over, and you're still standing.
  if (F.en.every(e => e.hp <= 0)) return win();
  F.stun = [];
  F.round++;
  go('fight');
}
function win() {
  const F = S.fight;
  S.fight = null;
  S.buzzOn = false;
  F.log.forEach(l => say(l));
  survived();
  // The pit: they yield, nobody dies, nothing is looted. The prize is the purse.
  if (F.pit) return WIN[F.win](...F.args);
  for (const e of F.en) {
    if (e.fled) continue;
    if (e.npc) {
      kill(e.npc, F.started ? 'murder' : 'slain', F.loud);
      continue;
    }
    S.kills++;
    gainXP(e.xp);
    const L = [];
    if (e.teeth) {
      const t = e.teeth * 2;
      S.teeth += t;
      L.push(t + ' teeth');
    }
    if (e.loot)
      for (const k in e.loot) {
        give(k, e.loot[k]);
        L.push(ITEMS[k]);
      }
    if (e.wep && isGun(e.wep)) {
      const b = R(3, 6);
      give('ammo', b);
      L.push(`${b} bullets`);
    } else if (e.teeth > 0 && e.lvl >= 2 && roll(35)) {
      const b = R(1, 3);
      give('ammo', b);
      L.push(`${b} bullet${b > 1 ? 's' : ''}`);
    }
    takeGear(e.wep, e.arm, L);
    if (L.length) say(`Loot: ${L.join(', ')}.`);
    S.f.corpse = e.n;
  }
  if (S.end) return go('ending');
  WIN[F.win](...F.args);
}
function useBuzz() {
  take('buzz');
  S.buzzOn = true;
  say('You snort Buzz. You could punch the sun.');
  if (!perk('gut') && !S.addicted && !roll(S.stats.luck * 6 + 25)) {
    S.addicted = true;
    bad('You are now addicted to Buzz. -10% to hit without it.');
    statAdd('charm', -1, 'Buzz is rotting your teeth. Your smile has gone grey.');
  }
}
// Strip the body. New gear is yours; better armour goes straight on; spares are sold for scrap.
function takeGear(wep, arm, L) {
  if (wep && W[wep] && wep !== 'fists') {
    if (!S.weapons.includes(wep)) {
      S.weapons.push(wep);
      L.push(W[wep].n);
    } else if (W[wep].v) {
      const t = Math.round(W[wep].v / 2);
      S.teeth += t;
      L.push(`a spare ${W[wep].n} (scrap, +${t} teeth)`);
    }
  }
  if (arm && A[arm]) {
    if (!S.armors.includes(arm)) {
      S.armors.push(arm);
      if (A[arm].dr > A[S.armor].dr) {
        S.armor = arm;
        L.push(`${A[arm].n} (you put it on)`);
      } else L.push(A[arm].n);
    } else if (A[arm].v) {
      const t = Math.round(A[arm].v / 2);
      S.teeth += t;
      L.push(`a spare ${A[arm].n} (scrap, +${t} teeth)`);
    }
  }
}
function kill(id, how, loud) {
  if (S.dead[id]) return;
  S.dead[id] = 1;
  const d = NPC[id];
  S.kills++;
  karma(d.k || 0);
  S.f.corpse = d.n;
  gainXP(lvl(id) * 20);
  const L = [];
  if (d.teeth) {
    S.teeth += d.teeth * 2;
    L.push(d.teeth * 2 + ' teeth');
  }
  if (d.loot)
    for (const k in d.loot) {
      give(k, d.loot[k]);
      L.push(ITEMS[k]);
    }
  if (id === 'mayor' && !S.f.ledgerTaken) {
    give('ledger');
    S.f.ledgerTaken = 1;
    L.push(ITEMS.ledger);
  }
  if (id === 'doc' && !S.f.coilGot) {
    give('coil');
    S.f.coilGot = 1;
    L.push(ITEMS.coil);
  }
  takeGear(S.n[id].st.wep || d.wep, d.arm, L);
  if (S.n[id].st.wep && d.wep && S.n[id].st.wep !== d.wep) takeGear(d.wep, null, L);
  if (L.length) say(`From ${d.n}: ${L.join(', ')}.`);
  if (id === S.spouse) {
    S.spouse = null;
    S.f.spouseFate = 'killed';
    addTitle('Widowed by Your Own Hand');
  }
  if (id === 'nigel' && !S.f.nigel) S.f.nigel = 'dead';
  if (id === 'bess' && S.n.bess.loc === 'wastes') S.f.queenFate = 'killed';
  // A quiet kill with nobody else in the room stays secret. A gunshot never does.
  const nobody = !IDS.some(x => x !== id && alive(x) && !NPC[x].animal && S.n[x].loc === S.here);
  if ((how === 'murder' || how === 'slain') && !loud && nobody) event(how, id, { secret: true });
  else if (how === 'murder' || how === 'slain') event(how, id, { loud: !!loud });
  else if (how === 'secret') {
    const pres = IDS.filter(x => x !== id && alive(x) && !NPC[x].animal && S.n[x].loc === S.here);
    if (pres.length && roll(25)) {
      const w = pick(pres);
      bad(`${NPC[w].n} saw you. Of course they did.`);
      event('murder', id, { wit: [w] });
    } else event('murder', id, { secret: true });
  }
  // remember it was you, for the ending (scenes/epitaphs.js): the id of the gossip event about it
  const ev = S.ev[S.ev.length - 1];
  (S.f.byYou || (S.f.byYou = {}))[id] = ev && ev.v === id ? ev.id : -1;
}
function quiet(id) {
  if (attempt('murder', id)) {
    say(pick(QUIET)(NPC[id].n));
    kill(id, 'secret');
    if (S.end) return go('ending');
    goHere();
  } else {
    bad(`${NPC[id].n} notices you at the worst moment.`);
    fight(crew(id), { started: true, win: 'back', back: ['map'] });
  }
}
const WIN = { back: () => goHere(), go: (s, ...a) => go(s, ...a), hub: l => go('hub', l), enc: d => go('hub', d) };
