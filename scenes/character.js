'use strict';
// ================= CHARACTER =================
SC.char = () => {
  const st = S.stats,
    sk = S.skills,
    o = [];

  S.weapons
    .filter(w => w !== S.weapon)
    .forEach(w =>
      o.push([
        `Wield ${W[w].n} (${W[w].t}, ${W[w].d[0]}-${W[w].d[1]})`,
        () => {
          S.weapon = w;
          go('char');
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
          go('char');
        },
      ]),
    );
  if (has('gutglue') && S.hp < S.maxhp)
    o.push([
      'Use Gut Glue (+20)',
      () => {
        take('gutglue');
        say(`+${heal(20)} HP.`);
        go('char');
      },
    ]);
  if (has('meat') && S.hp < S.maxhp)
    o.push([
      'Eat questionable meat (+8)',
      () => {
        take('meat');
        say(`+${heal(8)} HP. Don't wonder.`);
        go('char');
      },
    ]);
  if (has('beer') && S.hp < S.maxhp)
    o.push([
      'Drink warm beer (+3)',
      () => {
        take('beer');
        say(`+${heal(3)} HP.`);
        go('char');
      },
    ]);
  if (S.spouse)
    o.push([
      `Murder your spouse, ${NPC[S.spouse].n}`,
      () => {
        const r = S.ret || { scene: 'map', args: [] };
        fight([foe(S.spouse)], { started: true, win: 'go', args: [r.scene, ...r.args] });
      },
      'danger',
    ]);
  o.push([
    'Close',
    () => {
      const r = S.ret || { scene: 'map', args: [] };
      go(r.scene, ...r.args);
    },
  ]);
  const items = Object.keys(S.inv)
    .filter(k => S.inv[k] > 0)
    .map(k => `${ITEMS[k] || k}${S.inv[k] > 1 ? ' x' + S.inv[k] : ''}`);
  const kn = keen(),
    stl = Object.keys(st)
      .map(k => `${cap(k)}: ${kn ? (k === 'twitch' ? ptw() : st[k]) : statWord(k === 'twitch' ? ptw() : st[k])}`)
      .join('  '),
    skl = Object.keys(sk)
      .map(k => `${cap(k)}: ${skillWord(k)}${kn ? ' (' + sk[k] + ')' : ''}`)
      .join('  ');
  show({
    title: S.name,
    icon: '🧍',
    sub: `Day ${S.day} · ${S.kills} kills`,
    text: `${stl}
${skl}
Perks: ${S.perks.length ? S.perks.map(p => `${PERKS[p].n} (${PERKS[p].d})`).join(', ') : 'none yet. You earn them by what you do.'}
Carrying: ${items.join(', ') || 'regret'}
Reputation: ${karmaTitle()}${S.titles.length ? ' · ' + S.titles.join(' · ') : ''}${S.addicted ? ' · ADDICTED' : ''}${S.f.rash ? ' · RASH' : ''}`,
    opts: o,
  });
};
