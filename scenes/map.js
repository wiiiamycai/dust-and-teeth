'use strict';
// ================= MAP & TRAVEL =================
function drawMap(mp) {
  const vis = k => !LOC[k].sub && onMap(k);
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
      b.innerHTML = `<span class="ni">${c ? '☢️' : L.i}</span>${esc(L.n)}<span class="nl">${subJoin(c ? 'crater' : k === 'green' && S.day < GREEN_DAY && 'dust storms', !S.f.gutDead && S.f.gutLoc === k && 'tremors', S.here === k ? 'you' : (d => `${d} day${d > 1 ? 's' : ''}`)(tripDays(k))) || '&nbsp;'}</span>`;
      b.onclick = () => travel(k);
      mp.appendChild(b);
    });
  try {
    if (typeof mapPaint === 'function') mapPaint(mp); // the painted land under it all (scenes/mapart.js), looks only
  } catch (e) {}
}
SC.map = () => {
  spouseTalk();
  show({
    title: 'The Wasteland',
    icon: '🏜️',
    sub: `Day ${S.day}`,
    text: 'Tap a place. The road goes through the towns between, and each one is a day.',
    map: true,
    opts: [
      S.trip && S.trip !== S.here && LOC[S.trip] && onMap(S.trip)
        ? [
            `Carry on to ${LOC[S.trip].n} (${(d => `${d} day${d > 1 ? 's' : ''}`)(tripDays(S.trip))})`,
            () => travel(S.trip),
          ]
        : null,
      corpseOpt(),
      charOpt(),
    ],
  });
};
// ---- travel by road, a day a town (v9.5) ----
// The shortest road from where you are, through the places you know. Every leg is a day and may bring something
// on the road. You pass through the towns between, unless one of them has something for you, and then you stop.
function route(from, to) {
  if (!LOC[from] || LOC[from].sub) from = (LOC[from] && LOC[from].up) || 'scrapwell';
  if (from === to) return [to];
  const ok = k => LOC[k] && !LOC[k].sub && (onMap(k) || k === to),
    prev = { [from]: null },
    q = [from];
  while (q.length) {
    const c = q.shift();
    if (c === to) break;
    for (const n of neighbours(c)) if (ok(n) && !(n in prev)) (prev[n] = c), q.push(n);
  }
  if (!(to in prev)) return [to]; // no known road: you strike out across the sand, one long day
  const path = [];
  for (let c = to; c !== from; c = prev[c]) path.unshift(c);
  return path;
}
const tripDays = k => route(S.here, k).length;
// a reason to stop on the way: somebody there has something to say to you
function stopWhy(k) {
  const who = IDS.find(id => alive(id) && S.n[id].loc === k && S.n[id].rx.length);
  return who ? `${npcName(who)} wants a word.` : null;
}
function passLine(k) {
  const here = IDS.filter(id => alive(id) && S.n[id].loc === k && NPC[id].g);
  const bit = here.length
    ? pick([`${npcName(pick(here))} waves.`, `${npcName(pick(here))} watches you go by.`, `Nobody stops you.`])
    : pick(['Nobody stops you.', 'You fill your water and keep going.']);
  return `Day ${S.day}. You pass through ${LOC[k].n}. ${bit}`;
}
function travel(k) {
  S.trip = k; // where you're going, until you get there: a trip cut short can carry on from the map
  const path = route(S.here, k);
  for (let i = 0; i < path.length; i++) {
    const at = path[i];
    if (tick()) return go('ending');
    const e = pickEnc(at);
    if (e) {
      if (i === path.length - 1) S.trip = null;
      return go('enc', e, at); // whatever happens on the road, you come out at the end of that leg
    }
    if (i === path.length - 1) break;
    // passing a lost town that hasn't been cleared: sometimes it notices you
    if (typeof TOWNS !== 'undefined' && TOWNS[at] && !townClear(at) && !S.crater[at] && roll(30)) {
      say(`Day ${S.day}. You try to skirt ${LOC[at].n}. Something in it has seen you.`);
      S.here = at;
      return fight(TOWNS[at].stages[0][2](), { win: 'town', args: [at], back: ['map'] });
    }
    const why = !S.crater[at] && stopWhy(at);
    if (why) {
      say(`Day ${S.day}. You stop in ${LOC[at].n}: ${why}`);
      return go('hub', at);
    }
    say(passLine(at));
  }
  S.trip = null;
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
  const av = avengers();
  if (av.length && roll(30)) {
    f.hunter = pick(av);
    return 'hunter';
  }
  if (hostile('krug') && roll(25)) return 'slavers';
  if (alive('bess') && S.n.bess.loc === 'wastes' && !f.queenMet && roll(55)) return 'queen';
  if (gutNear(dest) ? roll(40) : !f.gutDead && roll(2)) return 'gutmaw';
  if (notoriety() >= 12 && roll(clamp(notoriety(), 10, 35))) return 'bounty';
  if (!roll(clamp(36 - S.stats.luck * 2, 12, 40))) return null;
  // Danger is mixed everywhere. Far from home the bad ones are just more likely.
  const far = (LOC[dest] ? LOC[dest].lvl : 2) >= 4;
  const pool = [
    ['raiders', 3],
    ['gang', far ? 2 : 0.5],
    ['taxman', 1],
    ['moles', far ? 1 : 3],
    ['wanderer', 2],
    ['salesman', 2],
    ['cow', far ? 1 : 2],
    ['cult', 1],
  ];
  if (S.day >= DAYS(4) && !f.kingStopped) pool.push(['molars', far ? 4 : 2]);
  let r = Math.random() * pool.reduce((a, p) => a + p[1], 0);
  for (const [k, w] of pool) if ((r -= w) < 0) return k;
  return pool[0][0];
}
const ENC = {
  gang: d => {
    const en = () => [spawn('raiderBoss'), spawn('raider'), spawn('raider')];
    return {
      title: 'A raider gang',
      icon: '☠️',
      t: 'A raider boss and two of his boys. The boss is huge, and every scar on him won a fight. "Everything you have. Then we decide about you."',
      o: [
        ['Fight', () => fight(en(), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          `Hand over everything (${S.teeth} teeth)`,
          () => {
            S.teeth = 0;
            say('They take every tooth. The boss pats your cheek. "Good dog."');
            go('hub', d);
          },
        ],
        [
          'Run',
          () => {
            if (roll(fleeP())) {
              say('You run. They laugh too hard to chase you far.');
              go('hub', d);
            } else {
              bad('The boss is faster than he looks.');
              fight(en(), { win: 'enc', args: [d] });
            }
          },
        ],
      ],
    };
  },
  bounty: d => {
    const en = bountyCrew();
    return {
      title: 'Bounty hunters',
      icon: '🎯',
      t: `${en.length === 3 ? 'Three' : 'Two'} bounty hunters. One holds a poster with your face on it. Fair likeness. The price says you've been busy.${en.length === 3 ? ' These are the expensive ones.' : ''}`,
      o: [
        ['Fight', () => fight(en, { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          `Pay them more than the bounty (${40 + notoriety() * 3} teeth)`,
          () => {
            if (pay(40 + notoriety() * 3)) {
              say('They count it, tear up the poster, and print another one as you leave.');
              go('hub', d);
            } else go('enc', 'bounty', d);
          },
        ],
        [
          'Run',
          () => {
            if (roll(fleeP() - 10)) {
              say('You lose them in the rocks. For now.');
              go('hub', d);
            } else {
              bad('They do this for a living.');
              fight(en, { win: 'enc', args: [d] });
            }
          },
        ],
      ],
    };
  },
  raiders: d => {
    const en = () => [spawn('raider'), spawn('raider', { arm: roll(35) ? 'spikes' : null })];
    return {
      t: 'Two raiders. Skinny, sunburnt, more mouth than muscle. Both tattoos say MOM. "20 teeth or your face."',
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
          '"Raider Guild inspection. Permits, please."' + hint('raiders.talk'),
          () => {
            if (attempt('raiders.talk')) {
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
    const en = molarCrew;
    return {
      t: `Raiders in necklaces of teeth.${S.day >= DAYS(17) ? ' Three of them now. The King is recruiting.' : S.day >= DAYS(12) ? ' These ones have done this before.' : ''} "Tooth tax. One of yours."`,
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
            statAdd('charm', -1, 'There is a gap in your smile now.');
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
        '"The government is gone. Two hundred years gone."' + hint('taxman.gone'),
        () => {
          if (attempt('taxman.gone')) {
            karma(1);
            gainXP(30);
            say('He sits in the sand. "Then what was it all for?" He wanders off to become a raider.');
            count('taxman');
          } else bad('"That\'s what a tax evader would say."');
          go('hub', d);
        },
      ],
      [
        '"I AM the government. You\'re fired."' + hint('taxman.fired'),
        () => {
          if (attempt('taxman.fired')) {
            gainXP(30);
            say(
              (S.armor === 'vest'
                ? 'He looks at your vest. He salutes. '
                : 'He believes you. Nobody has ever lied to him. ') +
                'He hands you 15 teeth of severance and walks into the desert.',
            );
            gain(15);
            count('taxman');
          } else bad('"Nice try. Where\'s your badge?"');
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
    const en = () => [spawn('moledog', { loot: { meat: 1 } }), spawn('moledog')];
    return {
      t: 'Mole-dogs burst from the sand. Dog body. Mole face. No manners.',
      o: [
        ['Fight', () => fight(en(), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          'Run',
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
              count('eat');
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
        '"Pre-war sand. Rad-free. Twenty-five teeth."' + hint('salesman.sand'),
        () => {
          if (attempt('salesman.sand')) {
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
        '"North is where the grass is. Both of you, look."' + hint('cow.settle'),
        () => {
          if (attempt('cow.settle')) {
            karma(1);
            say('Peace in the family.');
          } else say("Now they won't speak to each other. They share a stomach.");
          go('hub', d);
        },
      ],
      [
        'Kill it for meat',
        () =>
          fight([mkE('Two-headed cow', '🐄', 1, { loot: { meat: 3 }, teeth: 0, d: [2, 6] })], {
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
            statAdd('charm', 1, "You can't stop smiling. People seem to like it.");
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
          fight(
            [
              mkE('Smiler', '😃', 1, { wep: 'knife' }),
              mkE('Smiler', '😃', 1, { wep: 'knife' }),
              mkE('Smiler', '😃', 1, { wep: 'knife' }),
            ],
            {
              win: 'enc',
              args: [d],
              back: ['hub', d],
            },
          ),
        'danger',
      ],
    ],
  }),
  queen: d => {
    S.f.queenMet = 1;
    const lv = clamp(4 + Math.floor((S.day - (S.n.bess.st.goneDay || S.day)) / DAYS(2)), 4, 9);
    S.n.bess.lvl = lv;
    const en = () => [
      foe('bess'),
      spawn('raider', { n: 'Her raider' }),
      spawn('raider', { n: 'Her raider', arm: 'jacket' }),
    ];
    return {
      title: 'Raider Queen Bess',
      icon: '👑',
      t: `A raider gang blocks the road. Their queen wears Krug's chains as a necklace. It's Bess. She looks harder now. "Remember me?"`,
      o: [
        ['Fight', () => fight(en(), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        canTry('queen.sorry') && [
          '"I was wrong to sell you, Bess."' + hint('queen.sorry'),
          () => {
            if (attempt('queen.sorry')) {
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
        knew('bess.dreams') &&
          canTry('queen.out') && [
            '"You got out. You always wanted out. Maybe I helped."' + hint('queen.out'),
            () => {
              if (attempt('queen.out')) {
                S.f.queenFate = 'spared';
                S.n.bess.op += 20;
                quote('Bess laughs. It is not a nice laugh. "Maybe you did. Get off my road before I thank you."');
                go('hub', d);
              } else {
                bad('Bess: "Helped? You SOLD me."');
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
    t: `Sheriff Crane and ${notoriety() >= 20 ? 'three' : 'two'} deputies. "Time to answer for it."`,
    o: [
      [
        'Fight',
        () =>
          fight([...crew('sheriff'), ...(notoriety() >= 20 ? [dep()] : [])], {
            win: 'enc',
            args: [d],
            back: ['hub', d],
          }),
        'danger',
      ],
      [
        'Run',
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
  hunter: d => {
    const h = S.f.hunter && alive(S.f.hunter) ? S.f.hunter : 'hector',
      nm = NPC[h].n;
    const line = {
      hector: "Hector steps out from behind a rock with his shotgun. He doesn't say anything. He doesn't need to.",
      bert: 'Bert, on the road, with his father\'s rifle. His hands are shaking. "Pa said you\'d come this way."',
      junior: 'Junior is standing in the road. He has a cleaver in each hand. He says one word: "Mama."',
      lou: 'Mama Lou, apron on, cleaver out. "You took my boy, sweetie. I\'m taking you. Slowly. Low heat."',
    }[h];
    return {
      title: nm,
      icon: NPC[h].i,
      t: line,
      o: [
        ['Fight', () => fight([foe(h)], { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          'Run',
          () => {
            if (roll(fleeP())) {
              say(`You get away. ${nm} will be back.`);
              go('hub', d);
            } else {
              bad(`${nm} catches you. -8 HP.`);
              if (hurt(8, `${nm} found you.`)) return;
              fight([foe(h)], { win: 'enc', args: [d] });
            }
          },
        ],
      ],
    };
  },
  slavers: d => ({
    title: "Krug's hunters",
    icon: '⛓️',
    t: `Three slavers with nets${notoriety() >= 20 ? ", and Krug's tracker, who has never lost anyone" : ''}. "Krug wants you back. Alive, he said. Mostly."`,
    o: [
      [
        'Fight',
        () =>
          fight([slv(), slv(), slv(), ...(notoriety() >= 20 ? [spawn('tracker')] : [])], {
            win: 'enc',
            args: [d],
            back: ['hub', d],
          }),
        'danger',
      ],
      [
        'Run',
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
        S.stats.brawn >= 8
          ? 'Squeeze his throat until he talks'
          : '"Talk, and I\'ll give you water."' + hint('molar.talk'),
        () => {
          if (S.stats.brawn >= 8 || attempt('molar.talk')) {
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
