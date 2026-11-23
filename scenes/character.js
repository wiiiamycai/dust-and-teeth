'use strict';
// ================= CHARACTER =================
// 🎒 the bag: what you wield and wear, and what you carry, with using it
SC.inv = () => {
  const o = [];

  S.weapons
    .filter(w => w !== S.weapon)
    .forEach(w =>
      o.push([
        `Wield ${W[w].n} (${W[w].t}, ${W[w].d[0]}-${W[w].d[1]})`,
        () => {
          S.weapon = w;
          go('inv');
        },
      ]),
    );
  S.armors
    .filter(a => a !== S.armor)
    .forEach(a =>
      o.push([
        `Wear ${A[a].n} (armour ${A[a].dr}${A[a].tw ? ', twitch ' + A[a].tw : ''})`,
        () => {
          S.armor = a;
          go('inv');
        },
      ]),
    );
  if (has('gutglue') && S.hp < S.maxhp)
    o.push([
      'Use Gut Glue (back to full)',
      () => {
        take('gutglue');
        say(`+${heal(GLUE())} HP.`);
        go('inv');
      },
    ]);
  if (has('meat') && S.hp < S.maxhp)
    o.push([
      'Eat questionable meat (+15)',
      () => {
        take('meat');
        say(`+${heal(15)} HP. Don't wonder.`);
        go('inv');
      },
    ]);
  if (has('beer') && S.hp < S.maxhp)
    o.push([
      'Drink warm beer (+8)',
      () => {
        take('beer');
        say(`+${heal(8)} HP.`);
        go('inv');
      },
    ]);
  o.push(['Close', () => panelClose()]);
  const items = Object.keys(S.inv)
    .filter(k => S.inv[k] > 0)
    .map(k => `${ITEMS[k] || k}${S.inv[k] > 1 ? ' x' + S.inv[k] : ''}`);
  // what's in your hands shows its damage, what's on your back its armour, as the Wield and Wear lines do (v9.9)
  const wp = W[S.weapon],
    dm = modSum(S.weapon, 'dmg'),
    ar = A[S.armor];
  show({
    title: 'Bag',
    icon: '🎒',
    sub: `🦷 ${S.teeth} teeth`,
    text: `IN YOUR HANDS
${modName(S.weapon)} (${wp.t === 'guns' ? 'gun' : 'melee'}, ${wp.d[0] + dm}-${wp.d[1] + dm})

ON YOUR BACK
${modName(S.armor)} (armour ${ar.dr + modSum(S.armor, 'dr')}${ar.tw ? ', twitch ' + ar.tw : ''})

CARRYING
${items.join(', ') || 'Regret.'}`,
    opts: o,
  });
};
// 🧍 you: body, skills, perks, and what the valley calls you
SC.char = () => {
  const st = S.stats,
    sk = S.skills,
    o = [];
  if (S.spouse)
    o.push([
      `Murder your spouse, ${NPC[S.spouse].n}`,
      () => {
        const r = S.ret || { scene: 'map', args: [] };
        fight([foe(S.spouse)], { started: true, win: 'go', args: [r.scene, ...r.args] });
      },
      'danger',
    ]);
  o.push(['Close', () => panelClose()]);
  const kn = keen(),
    stl = Object.keys(st)
      .map(k => `${cap(k)}: ${kn ? (k === 'twitch' ? ptw() : st[k]) : statWord(k === 'twitch' ? ptw() : st[k])}`)
      .join(', '),
    skl = Object.keys(sk)
      .map(k => `${cap(k)}: ${skillWord(k)}${kn ? ' (' + sk[k] + ')' : ''}`)
      .join(', ');
  show({
    title: 'You',
    icon: '🧍',
    sub: `HP ${S.hp}/${S.maxhp} · Day ${S.day} · ${S.kills} kills`,
    text: `BODY
${stl}

SKILLS
${skl}

PERKS
${S.perks.length ? S.perks.map(p => `${PERKS[p].n}: ${PERKS[p].d}`).join('\n') : 'None yet. You earn them by what you do.'}

KNOWN AS
${karmaTitle()}${S.titles.length ? ' · ' + S.titles.join(' · ') : ''}${S.spouse ? ` · married to ${NPC[S.spouse].n}` : ''}${S.addicted ? ' · ADDICTED' : ''}${S.f.rash ? ' · RASH' : ''}`,
    opts: o,
  });
};
