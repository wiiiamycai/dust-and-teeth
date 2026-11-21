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
function mkE(n, i, lv, o) {
  o = o || {};
  const hp = Math.round((8 + lv * 5) * (o.hpm || 1));
  return {
    n,
    i,
    lvl: lv,
    hp,
    max: hp,
    skill: 30 + lv * 5,
    d: [lv, 2 + lv * 2],
    dr: Math.floor(lv / 3),
    xp: lv * 20,
    teeth: o.teeth != null ? o.teeth : lv * 3,
    loot: o.loot || null,
    arm: o.arm || null,
    wep: o.wep || null,
    npc: o.npc || null,
  };
}
const foe = id => {
  const d = NPC[id];
  return mkE(d.n, d.i, lvl(id), { hpm: d.hpm, npc: id, teeth: 0, wep: S.n[id].st.wep || null });
};
const dep = () => mkE('Deputy', '👮', 3);
const slv = () => mkE('Slaver', '⛓️', 5);
function crew(id) {
  const e = [foe(id)];
  if (id === 'sheriff') e.push(dep(), dep());
  if (id === 'krug') e.push(slv(), slv());
  if (id === 'lou' && alive('junior') && S.n.junior.loc === 'diner') e.push(foe('junior'));
  if (id === 'junior' && alive('lou') && S.n.lou.loc === 'diner') e.push(foe('lou'));
  return e;
}
const pdr = () => A[S.armor].dr + (perk('skin') ? 3 : 0);
const ptw = () => S.stats.twitch + (A[S.armor].tw || 0);
const fleeP = () => clamp(ptw() * 7 + S.stats.luck * 2, 5, 90);
function hit(t, mod) {
  const w = W[S.weapon];
  return clamp(
    S.skills[w.t] +
      w.a +
      (S.buzzOn ? 15 : 0) -
      (S.addicted && !S.buzzOn ? 10 : 0) -
      t.lvl * 2 +
      mod +
      (w.t === 'guns' ? (S.stats.eyes - 5) * 2 : 0),
    5,
    95,
  );
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
  };
  go('fight');
}
SC.fight = () => {
  const F = S.fight;
  if (!F) return goHere();
  if (!F.en[F.t] || F.en[F.t].hp <= 0) F.t = F.en.findIndex(e => e.hp > 0);
  const t = F.en[F.t],
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
  show({
    title: `Fight · round ${F.round}`,
    icon: '⚔️',
    sub: F.en.filter(e => e.hp > 0).length > 1 ? 'Click an enemy to target it' : `${W[S.weapon].n} · armour ${pdr()}`,
    text: F.log.join('\n'),
    cards,
    opts: [
      [`Hit ${t.n} (${hit(t, 0)}%)`, () => atk(0, null)],
      [`Aim for the eyes (${hit(t, ea)}%, big crit)`, () => atk(ea, 'eyes')],
      [`Aim for the groin (${hit(t, ga)}%, crits stun)`, () => atk(ga, 'groin')],
      has('gutglue')
        ? [
            `Gut Glue +20 HP (${S.inv.gutglue} left)`,
            () => {
              take('gutglue');
              F.log = [`You glue yourself back together. +${heal(20)} HP.`];
              enemy();
            },
          ]
        : null,
      has('buzz') && !S.buzzOn
        ? [
            'Snort Buzz (+15% to hit)',
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
function atk(mod, part) {
  const F = S.fight,
    t = F.en[F.t],
    w = W[S.weapon];
  F.log = [];
  const landed = roll(hit(t, mod));
  practice(w.t, landed ? 1 : 0.4);
  if (landed) {
    if (part) count('aimHit');
    let d = R(w.d[0], w.d[1]) + (w.t === 'melee' ? Math.max(0, S.stats.brawn - 5) : 0);
    if (w.t === 'melee' && perk('hands')) d = Math.round(d * 1.3);
    if (roll(S.stats.luck * 2 + (perk('lucky') ? 10 : 0) + (part === 'eyes' ? 30 : part === 'groin' ? 12 : 0))) {
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
      F.log.push(`${e.n} is busy clutching themselves.`);
      continue;
    }
    if (roll(clamp(e.skill - ptw() * 3, 5, 95))) {
      const d = Math.max(1, R(e.d[0], e.d[1]) - pdr());
      S.hp -= d;
      count('dmgTaken', d);
      F.log.push(`${e.n} hits you for ${d}.`);
      if (S.hp <= 0) {
        if (perk('wind') && !F.wind) {
          F.wind = true;
          S.hp = 15;
          F.log.push('SECOND WIND. You refuse to die.');
        } else {
          S.hp = 0;
          return die(`Killed by ${e.n}.`);
        }
      }
    } else F.log.push(`${e.n} misses.`);
  }
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
  for (const e of F.en) {
    if (e.npc) {
      kill(e.npc, F.started ? 'murder' : 'slain');
      continue;
    }
    S.kills++;
    gainXP(e.xp);
    const L = [];
    if (e.teeth) {
      S.teeth += e.teeth;
      L.push(e.teeth + ' teeth');
    }
    if (e.loot)
      for (const k in e.loot) {
        give(k, e.loot[k]);
        L.push(ITEMS[k]);
      }
    if (e.wep && !S.weapons.includes(e.wep)) {
      S.weapons.push(e.wep);
      L.push(W[e.wep].n);
    }
    if (e.arm && !S.armors.includes(e.arm)) {
      S.armors.push(e.arm);
      L.push(A[e.arm].n);
    }
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
function kill(id, how) {
  if (S.dead[id]) return;
  S.dead[id] = 1;
  const d = NPC[id];
  S.kills++;
  karma(d.k || 0);
  S.f.corpse = d.n;
  gainXP(lvl(id) * 20);
  const L = [];
  if (d.teeth) {
    S.teeth += d.teeth;
    L.push(d.teeth + ' teeth');
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
  if (d.wep && !S.weapons.includes(d.wep)) {
    S.weapons.push(d.wep);
    L.push(W[d.wep].n);
  }
  if (d.arm && !S.armors.includes(d.arm)) {
    S.armors.push(d.arm);
    L.push(A[d.arm].n);
  }
  if (L.length) say(`From ${d.n}: ${L.join(', ')}.`);
  if (id === S.spouse) {
    S.spouse = null;
    S.f.spouseFate = 'killed';
    addTitle('Widowed by Your Own Hand');
  }
  if (id === 'nigel' && !S.f.nigel) S.f.nigel = 'dead';
  if (id === 'bess' && S.n.bess.loc === 'wastes') S.f.queenFate = 'killed';
  if (id === 'elder') S.end = { type: 'elder' };
  if (how === 'murder') event('murder', id);
  else if (how === 'slain') event('slain', id);
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
