'use strict';
// ================= COMBAT =================
const CRIT = {
  eyes: [t => `Eye shot. ${t} never sees it coming. Or anything else.`, t => `Right through ${t}'s eye.`],
  groin: [
    t => `Groin crit. ${t} makes a kettle noise and folds.`,
    t => `You hit ${t} somewhere nobody should be hit. Stunned.`,
  ],
  body: [t => `Crit! ${t} bends the wrong way.`, t => `Crit. Something in ${t} goes pop.`],
};
const KILLED = [
  t => `${t} dies. Not pretty. Very final.`,
  t => `${t} hits the dirt and stays there.`,
  t => `${t} is dead. The wasteland gets a little better fertilised.`,
];
const MISS = ['You miss. The air is unharmed.', 'Miss. A nearby rock flinches.', 'You miss and nearly hit yourself.'];
const QUIET = [
  n => `You wait until ${n} is alone. Then ${n} stays alone, forever.`,
  n => `${n} goes very quietly. You see to it.`,
];
// Everyone is the same flesh: every human has BODY HP, you included, and it never grows.
// Strength is what they carry: their weapon sets their damage, their armour sets their DR.
// Level only means training: a little more accuracy, and more teeth and XP when they die.
const BODY = 30;
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
// down. But a fight on the road starts at range, and closing in costs you a round of free hits.
const isGun = w => W[w].t === 'guns';
const ammo = () => S.inv.ammo || 0;
// Out of shots? Self-charging guns (the plasma rifle) never are.
const dry = w => isGun(w) && !W[w].free && ammo() <= 0;
const ammoTxt = w => (W[w].free ? 'self-charging' : `${ammo()} bullets`);
function hit(t, mod) {
  const w = W[S.weapon],
    F = S.fight;
  return clamp(
    S.skills[w.t] +
      w.a +
      modSum(S.weapon, 'hit') +
      (S.buzzOn ? 15 : 0) -
      (S.addicted && !S.buzzOn ? 10 : 0) -
      t.lvl * 2 +
      mod +
      (w.t === 'guns' ? (S.stats.eyes - 5) * 2 - (F && F.close ? 10 : 0) : 10),
    5,
    95,
  );
}
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
  if (S.spouse && alive(S.spouse) && !E.some(e => e.npc === S.spouse)) al.push(S.spouse);
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
    back: o.back || null,
    t: 0,
    round: 1,
    stun: [],
    wind: false,
    log: [],
    // You start up close if you picked the fight with someone in front of you, or were jumped indoors.
    close: !!(o.close || o.started),
    charge: false,
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
    gun = w.t === 'guns',
    ea = perk('eagle') ? -15 : -30,
    ga = perk('eagle') ? -10 : -20;
  const kn = keen();
  const cards = F.en.map((e, i) => ({
    icon: e.i,
    name: e.n,
    sub: kn
      ? `Lv ${e.lvl} · armour ${e.dr}${e.hp <= 0 ? ' · dead' : ''}${e.wep || e.arm || e.loot ? ' · has ' + [e.wep && W[e.wep].n, e.arm && A[e.arm].n, ...Object.keys(e.loot || {}).map(k => ITEMS[k])].filter(Boolean).join(', ') : ''}`
      : `${dangerWord(e.lvl)} · ${condWord(e.hp, e.max)}`,
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
  else if (!gun && !F.close) o.push([`Close in with your ${w.n}`, () => closeIn(), 'danger']);
  else {
    const v = gun ? 'Shoot' : 'Hit';
    o.push(
      [`${v} ${t.n}`, () => atk(0, null)],
      [`${v} for the eyes (hard, but it can end it)`, () => atk(ea, 'eyes')],
      [`${v} for the groin (tricky, a good one stuns)`, () => atk(ga, 'groin')],
    );
  }
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
    sub: `${w.n}${gun ? ` · ${ammoTxt(S.weapon)}` : ''} · ${F.close ? 'up close' : 'at range'}${F.en.filter(e => e.hp > 0).length > 1 ? ' · click an enemy to target it' : ''}`,
    text: F.log.join('\n'),
    cards,
    opts: [
      ...o,
      has('gutglue')
        ? [
            `Gut Glue, back to full (${S.inv.gutglue} left)`,
            () => {
              take('gutglue');
              F.log = [`You glue yourself back together. +${heal(GLUE())} HP.`];
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
            'Run',
            () => {
              if (roll(fleeP())) {
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
function closeIn() {
  const F = S.fight;
  F.log = [pick(['You charge.', 'You run at them, yelling.', 'You close the gap, head down.'])];
  F.close = true;
  F.charge = true;
  enemy();
}
function atk(mod, part) {
  const F = S.fight,
    t = F.en[F.t],
    w = W[S.weapon];
  F.log = [];
  if (w.t === 'guns') {
    if (!w.free) take('ammo');
    if (!F.loud) F.log.push('BANG. That will be heard for miles.');
    F.loud = true;
  }
  const landed = roll(hit(t, mod));
  practice(w.t, landed ? 1 : 0.4);
  if (landed) {
    if (part) count('aimHit');
    let d = R(w.d[0], w.d[1]) + modSum(S.weapon, 'dmg') + (w.t === 'melee' ? Math.max(0, S.stats.brawn - 5) : 0);
    if (w.t === 'melee' && perk('hands')) d = Math.round(d * 1.3);
    let crit = false;
    if (roll(S.stats.luck * 2 + (perk('lucky') ? 10 : 0) + (part === 'eyes' ? 30 : part === 'groin' ? 12 : 0))) {
      crit = true;
      d *= part === 'eyes' ? 3 : 2;
      count('crit');
      F.log.push(pick(CRIT[part || 'body'])(t.n));
      if (part === 'groin') F.stun.push(F.t);
    }
    d = Math.max(1, d - t.dr);
    t.hp -= d;
    F.log.push(`You hit ${t.n} for ${d}.`);
    if (t.hp <= 0) {
      t.hp = 0;
      F.log.push(pick(KILLED)(t.n));
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
  for (const a of F.al) {
    if (!alive(a)) continue;
    const tt = F.en.find(e => e.hp > 0);
    if (!tt) break;
    if (roll(clamp(30 + lvl(a) * 5 - tt.lvl * 2, 5, 90))) {
      const d = Math.max(1, R(lvl(a), 2 + lvl(a) * 2) - tt.dr);
      tt.hp -= d;
      F.log.push(`${NPC[a].n} hits ${tt.n} for ${d}.`);
      if (tt.hp <= 0) {
        tt.hp = 0;
        F.log.push(pick(KILLED)(tt.n));
      }
    }
  }
  if (F.en.every(e => e.hp <= 0)) return win();
  enemy();
}
function enemy() {
  const F = S.fight;
  for (let i = 0; i < F.en.length; i++) {
    const e = F.en[i];
    if (e.hp <= 0) continue;
    if (F.stun.includes(i)) {
      F.log.push(`${e.n} is on the ground.`);
      continue;
    }
    if (roll(clamp(e.skill - ptw() * 3 + (F.charge ? 20 : 0), 5, 95))) {
      const d = Math.max(1, R(e.d[0], e.d[1]) - pdr());
      S.hp -= d;
      count('dmgTaken', d);
      F.log.push(`${e.n} hits you for ${d}.`);
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
    } else F.log.push(`${e.n} misses.`);
  }
  F.stun = [];
  F.charge = false;
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
  if (id === 'elder') S.end = { type: 'elder' };
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
