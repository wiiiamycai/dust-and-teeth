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
      'Use Gut Glue (back to full)',
      () => {
        take('gutglue');
        say(`+${heal(GLUE())} HP.`);
        go('char');
      },
    ]);
  if (has('meat') && S.hp < S.maxhp)
    o.push([
      'Eat questionable meat (+15)',
      () => {
        take('meat');
        say(`+${heal(15)} HP. Don't wonder.`);
        go('char');
      },
    ]);
  if (has('beer') && S.hp < S.maxhp)
    o.push([
      'Drink warm beer (+8)',
      () => {
        take('beer');
        say(`+${heal(8)} HP.`);
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
  o.push(['Close', () => panelClose()]);
  const items = Object.keys(S.inv)
    .filter(k => S.inv[k] > 0)
    .map(k => `${ITEMS[k] || k}${S.inv[k] > 1 ? ' x' + S.inv[k] : ''}`);
  const kn = keen(),
    stl = Object.keys(st)
      .map(k => `${cap(k)}: ${kn ? (k === 'twitch' ? ptw() : st[k]) : statWord(k === 'twitch' ? ptw() : st[k])}`)
      .join(', '),
    skl = Object.keys(sk)
      .map(k => `${cap(k)}: ${skillWord(k)}${kn ? ' (' + sk[k] + ')' : ''}`)
      .join(', ');
  const wp = W[S.weapon],
    gun = isGun(S.weapon) && !wp.free;
  show({
    title: 'You',
    icon: '🎒',
    sub: `HP ${S.hp}/${S.maxhp} · 🦷 ${S.teeth} · ${S.kills} kills`,
    text: `GEAR
Weapon: ${modName(S.weapon)}${gun ? ` (${S.inv.ammo || 0} bullets)` : ''}
Armour: ${modName(S.armor)}

CARRYING
${items.join(', ') || 'Regret.'}

BODY
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
