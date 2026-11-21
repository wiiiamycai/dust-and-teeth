'use strict';
// ================= MAP & TRAVEL =================
function drawMap(mp) {
  const vis = k => !LOC[k].sub && (!LOC[k].hidden || S.f.knowSilo);
  let svg = '<svg viewBox="0 0 100 100" preserveAspectRatio="none">';
  ROADS.forEach(([a, b]) => {
    if (vis(a) && vis(b))
      svg += `<line x1="${LOC[a].x}" y1="${LOC[a].y}" x2="${LOC[b].x}" y2="${LOC[b].y}" stroke="#8a5f00" stroke-width=".5" stroke-dasharray="1.4 1.2" vector-effect="non-scaling-stroke"/>`;
  });
  mp.innerHTML = svg + '</svg>';
  Object.keys(LOC)
    .filter(vis)
    .forEach(k => {
      const L = LOC[k],
        c = S.crater[k];
      const b = document.createElement('button');
      b.className = 'node' + (S.here === k ? ' here' : '');
      b.style.left = L.x + '%';
      b.style.top = L.y + '%';
      b.innerHTML = `<span class="ni">${c ? '☢️' : L.i}</span>${esc(L.n)}<span class="nl">${c ? 'crater' : 'danger ' + L.lvl}${S.here === k ? ' · you' : ''}</span>`;
      b.onclick = () => travel(k);
      mp.appendChild(b);
    });
}
SC.map = () => {
  spouseTalk();
  show({
    title: 'The Wasteland',
    icon: '🏜️',
    sub: `Day ${S.day}`,
    text: 'Click a place on the map. Each trip takes a day.',
    map: true,
    opts: [corpseOpt(), charOpt()],
  });
};
function travel(k) {
  if (tick()) return go('ending');
  const e = pickEnc(k);
  if (e) return go('enc', e, k);
  say(
    pick([
      'You walk. The sun tries to kill you. Not today.',
      'A vulture follows you the whole way. Hopeful.',
      'A skeleton holds a sign: NEARLY THERE.',
      'Something screams in the distance. Then stops.',
    ]),
  );
  go('hub', k);
}
function pickEnc(dest) {
  const f = S.f;
  if (hostile('sheriff') && S.n.sheriff.loc === 'rustwater' && roll(30)) return 'posse';
  if (hostile('hector') && roll(30)) return 'hunter';
  if (hostile('krug') && roll(25)) return 'slavers';
  if (alive('bess') && S.n.bess.loc === 'wastes' && !f.queenMet && roll(55)) return 'queen';
  if (!roll(clamp(36 - S.stats.luck * 2, 12, 40))) return null;
  const pool = ['raiders', 'taxman', 'moles', 'wanderer', 'salesman', 'cow', 'cult'];
  if (S.day >= 4 && !f.kingStopped) pool.push('molars', 'molars', 'molars');
  return pick(pool);
}
const areaLv = d => clamp((LOC[d] ? LOC[d].lvl : 2) - 1, 1, 8);
const ENC = {
  raiders: d => {
    const lv = Math.max(2, areaLv(d)),
      en = () => [mkE('Raider', '💀', lv), mkE('Raider', '💀', lv, { arm: roll(35) ? 'spikes' : null })];
    return {
      t: 'Two raiders. Both tattoos say MOM. "20 teeth or your face."',
      o: [
        ['Fight', () => fight(en(), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          'Pay 20 teeth',
          () => {
            if (pay(20)) go('hub', d);
            else go('enc', 'raiders', d);
          },
        ],
        [
          `Talk past them ${tag('speech')}`,
          () => {
            if (chk('speech')) {
              say('You pose as a Raider Guild inspector. They pay YOU 5.');
              gain(5);
              go('hub', d);
            } else {
              bad('"Nice try."');
              fight(en(), { win: 'enc', args: [d], back: ['hub', d] });
            }
          },
        ],
        S.stats.brawn >= 8
          ? [
              'Crack your neck at them',
              () => {
                say('It sounds like a tree falling. They leave.');
                go('hub', d);
              },
            ]
          : null,
      ],
    };
  },
  molars: d => {
    const lv = Math.max(4, areaLv(d)) + (S.day >= 12 ? 1 : 0),
      en = () => [
        mkE('Molar raider', '🦷', lv, { wep: roll(25) ? 'molargun' : null }),
        mkE('Molar raider', '🦷', lv - 1, { arm: roll(30) ? 'spikes' : null }),
      ];
    return {
      t: 'Raiders in necklaces of teeth. "Tooth tax. One of yours."',
      o: [
        ['Fight', () => fight(en(), { win: 'molars', args: [d], back: ['hub', d] }), 'danger'],
        [
          'Pay 25 teeth',
          () => {
            if (pay(25)) go('hub', d);
            else go('enc', 'molars', d);
          },
        ],
        [
          'Let them pull one of yours (-3 max HP)',
          () => {
            S.maxhp -= 3;
            S.hp = Math.min(S.hp, S.maxhp);
            say('Pliers. Pain. They admire the root.');
            go('hub', d);
          },
        ],
      ],
    };
  },
  taxman: d => ({
    t: 'A man in a melted suit. "IRS. You owe 200 years of back taxes."',
    o: [
      [
        'Pay him 10',
        () => {
          if (pay(10)) say("You get a receipt. The most official thing you've ever held.");
          go('hub', d);
        },
      ],
      [
        `Explain the government is gone ${tag('speech')}`,
        () => {
          if (chk('speech')) {
            karma(1);
            gainXP(30);
            say('He sits in the sand. "Then what was it all for?" He wanders off to become a raider.');
          } else bad('"That\'s what a tax evader would say."');
          go('hub', d);
        },
      ],
      [
        'Audit him with your fists',
        () => {
          karma(-1);
          fight([mkE('Taxman', '💼', 1, { teeth: 40 })], { win: 'enc', args: [d], back: ['hub', d] });
        },
        'danger',
      ],
    ],
  }),
  moles: d => {
    const lv = Math.max(1, areaLv(d) - 1),
      en = () => [mkE('Mole-dog', '🐕', lv, { loot: { meat: 1 }, teeth: 0 }), mkE('Mole-dog', '🐕', lv, { teeth: 0 })];
    return {
      t: 'Mole-dogs burst from the sand. Dog body. Mole face. No manners.',
      o: [
        ['Fight', () => fight(en(), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          `Run (${fleeP()}%)`,
          () => {
            if (roll(fleeP())) {
              say('They stop to dig. You escape.');
              go('hub', d);
            } else {
              bad("They're faster than they look.");
              fight(en(), { win: 'enc', args: [d], back: ['hub', d] });
            }
          },
        ],
      ],
    };
  },
  wanderer: d => ({
    t: 'A dead wanderer. A note: "If you\'re reading this, I\'m dead. If not, stop reading my stuff."',
    o: [
      [
        'Loot him',
        () => {
          give('gutglue');
          gain(10);
          go('hub', d);
        },
      ],
      S.f.cannibal
        ? [
            'Eat him',
            () => {
              say(`+${heal(20)} HP. Mostly jerky already.`);
              if (!perk('eater')) karma(-1);
              go('hub', d);
            },
          ]
        : null,
      [
        'Leave him be',
        () => {
          karma(1);
          go('hub', d);
        },
      ],
    ],
  }),
  salesman: d => ({
    t: 'Silas the salesman: "Rad-Be-Gone! 20 teeth!" It\'s a jar of sand.',
    o: [
      [
        'Buy it',
        () => {
          if (pay(20)) give('radbegone');
          go('hub', d);
        },
      ],
      [
        `Sell him his own sand ${tag('speech', -10)}`,
        () => {
          if (chk('speech', -10)) {
            say('He buys sand from you. In a desert. +25.');
            gain(25);
          } else bad('"I invented that one, friend."');
          go('hub', d);
        },
      ],
      [
        'Kill Silas, take his stuff',
        () => {
          karma(-2);
          fight([mkE('Silas', '🧳', 2, { teeth: 45, wep: 'sledge' })], { win: 'enc', args: [d], back: ['hub', d] });
        },
        'danger',
      ],
    ],
  }),
  cow: d => ({
    t: 'A two-headed cow. The heads are arguing about which way is north.',
    o: [
      [
        `Settle it ${tag('speech')}`,
        () => {
          if (chk('speech')) {
            karma(1);
            say('Peace in the family.');
          } else say("Now they won't speak to each other. They share a stomach.");
          go('hub', d);
        },
      ],
      [
        'Kill it for meat',
        () =>
          fight([mkE('Two-headed cow', '🐄', 1, { loot: { meat: 3 }, teeth: 0 })], {
            win: 'enc',
            args: [d],
            back: ['hub', d],
          }),
      ],
      ['Leave them to it', () => go('hub', d)],
    ],
  }),
  cult: d => ({
    t: 'Three smiling people in robes. "Drink the Smile with us." It\'s bubbling.',
    o: [
      [
        'Drink',
        () => {
          if (roll(S.stats.luck * 8)) {
            S.maxhp += 5;
            heal(5);
            say('You feel incredible. +5 max HP.');
          } else {
            const l = Math.min(10, S.teeth);
            S.teeth -= l;
            tick();
            bad(`You wake in a ditch a day later. No shoes. ${l} fewer teeth. A smiley tattoo on your bum.`);
          }
          if (S.end) return go('ending');
          go('hub', d);
        },
      ],
      [
        'Decline',
        () => {
          say('They keep smiling. They are smiling now.');
          go('hub', d);
        },
      ],
      [
        'Attack them',
        () =>
          fight([mkE('Smiler', '😃', 1), mkE('Smiler', '😃', 1), mkE('Smiler', '😃', 1)], {
            win: 'enc',
            args: [d],
            back: ['hub', d],
          }),
        'danger',
      ],
    ],
  }),
  queen: d => {
    S.f.queenMet = 1;
    const lv = clamp(4 + Math.floor((S.day - (S.n.bess.st.goneDay || S.day)) / 2), 4, 9);
    S.n.bess.lvl = lv;
    const en = () => [foe('bess'), mkE('Her raider', '💀', lv - 2), mkE('Her raider', '💀', lv - 2)];
    return {
      title: 'Raider Queen Bess',
      icon: '👑',
      t: `A raider gang blocks the road. Their queen wears Krug's chains as a necklace. It's Bess. Level ${lv} now. "Remember me?"`,
      o: [
        ['Fight', () => fight(en(), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          `Apologise ${tag('speech', -20)}`,
          () => {
            if (chk('speech', -20)) {
              S.f.queenFate = 'spared';
              S.n.bess.op += 40;
              quote('Bess: "You\'re not worth the bullet. Get out of my wasteland."');
              go('hub', d);
            } else {
              bad('Bess: "Wrong answer."');
              fight(en(), { win: 'enc', args: [d], back: ['hub', d] });
            }
          },
        ],
        [
          'Give her all your teeth',
          () => {
            const t = S.teeth;
            S.teeth = 0;
            S.f.queenFate = 'paid';
            quote(`Bess takes all ${t}. "Now you know what being owned feels like."`);
            go('hub', d);
          },
        ],
      ],
    };
  },
  posse: d => ({
    title: 'A posse',
    icon: '⭐',
    t: 'Sheriff Crane and two deputies. "Time to answer for it."',
    o: [
      ['Fight', () => fight(crew('sheriff'), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
      [
        `Run (${fleeP()}%)`,
        () => {
          if (roll(fleeP())) {
            say('You lose them in the dunes.');
            go('hub', d);
          } else {
            bad('A bullet clips you. -5 HP.');
            if (hurt(5, 'Shot running from the law.')) return;
            fight(crew('sheriff'), { win: 'enc', args: [d] });
          }
        },
      ],
      [
        'Surrender. Pay every tooth as a fine.',
        () => {
          S.teeth = 0;
          S.n.sheriff.op = -45;
          quote('Crane: "Don\'t make me do this again."');
          go('hub', d);
        },
      ],
    ],
  }),
  hunter: d => ({
    title: 'Hector',
    icon: '🔫',
    t: "Hector steps out from behind a rock with his shotgun. He doesn't say anything. He doesn't need to.",
    o: [
      ['Fight', () => fight([foe('hector')], { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
      [
        `Run (${fleeP()}%)`,
        () => {
          if (roll(fleeP())) {
            say('Buckshot whistles past. You get away.');
            go('hub', d);
          } else {
            bad('Buckshot. -8 HP.');
            if (hurt(8, 'Hector found you.')) return;
            fight([foe('hector')], { win: 'enc', args: [d] });
          }
        },
      ],
    ],
  }),
  slavers: d => ({
    title: "Krug's hunters",
    icon: '⛓️',
    t: 'Three slavers with nets. "Krug wants you back. Alive, he said. Mostly."',
    o: [
      ['Fight', () => fight([slv(), slv(), slv()], { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
      [
        `Run (${fleeP()}%)`,
        () => {
          if (roll(fleeP())) {
            say('You slip the nets.');
            go('hub', d);
          } else {
            bad('A net. A struggle.');
            fight([slv(), slv(), slv()], { win: 'enc', args: [d] });
          }
        },
      ],
    ],
  }),
};
SC.enc = (type, d) => {
  const e = ENC[type](d);
  show({ title: e.title || 'On the road', icon: e.icon || '🏜️', sub: `Heading to ${LOC[d].n}`, text: e.t, opts: e.o });
};
WIN.molars = d => {
  if (!S.f.knowSilo || (!S.f.knowRaid && !S.f.raid)) go('interrog', d);
  else go('hub', d);
};
SC.interrog = d =>
  show({
    title: 'A survivor',
    icon: '🦷',
    text: 'One Molar is still breathing. Barely.',
    opts: [
      [
        `Make him talk ${S.stats.brawn >= 8 ? '[Brawn]' : tag('speech')}`,
        () => {
          if (S.stats.brawn >= 8 || chk('speech')) {
            learnSilo();
            if (!S.f.raid) S.f.knowRaid = 1;
            quote(
              '"Silo 9... past the plane... the King is waking the Big Tooth... we hit Rustwater on day twelve..." He dies mid-sentence.',
            );
          } else bad('He spits a tooth at you and dies.');
          go('hub', d);
        },
      ],
      [
        'Finish him',
        () => {
          gainXP(20);
          karma(-1);
          go('hub', d);
        },
      ],
      ['Leave him', () => go('hub', d)],
    ],
  });
