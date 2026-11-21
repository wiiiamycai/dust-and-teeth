'use strict';
// ================= LOCATIONS =================
function card(x) {
  const n = S.n[x];
  return {
    icon: NPC[x].i,
    name: NPC[x].n,
    sub: `${sizeUp(n.lvl)} · ${mood(n.op)}${n.loc === 'pen' ? ' · in chains' : ''}`,
    bang: n.rx.length > 0,
    on: () => (x === 'king' ? go('throne') : go('talk', x)),
  };
}
function spouseTalk() {
  const s = S.spouse;
  if (!s || !alive(s)) return;
  const n = S.n[s];
  if (n.rx.length) {
    quote(`${NPC[s].n}: ${n.rx.shift()}`);
    return;
  }
  if (roll(25))
    quote(
      pick(
        s === 'bess'
          ? [
              `Bess: "Is this what outside is? Mostly sand."`,
              `Bess: "Can we kill something today? Just a little something?"`,
              `Bess: "I love you. I think. I've only met eleven people."`,
            ]
          : [
              `Bert: "Pre-war tractors had seats with springs. Springs!"`,
              `Bert: "If you ever sell me, get a good price. For my self-esteem."`,
              `Bert: "Married life is great. I have nothing to compare it to."`,
            ],
      ),
    );
}
const HUBT = {
  scrapwell: () =>
    `Thirty-one people, eleven goats, one filthy well.${alive('elder') ? '' : " Ma Thistle's chair is empty."}`,
  well: () =>
    S.n.nigel.loc === 'well' && alive('nigel')
      ? 'Dark, wet, and something down here glows.'
      : "Chicken bones and a dentist's chair made from a car seat.",
  rustwater: () =>
    S.f.pumpOpen || S.f.hanged
      ? 'The pump runs free. Someone is singing, badly.'
      : 'Two hundred people, one pump. The Mayor owns it. Water is 10 teeth a cup.',
  farm: () => 'Twenty acres of "resting" dirt.' + (S.f.scareHat ? '' : ' A scarecrow wears a surprisingly good hat.'),
  diner: () =>
    alive('lou')
      ? 'The sign says MEET. Lou waves a ladle at you.'
      : "Cold kitchen. The pot is still on the stove. Don't look in.",
  chainfield: () =>
    S.f.freed
      ? 'Empty pens. Someone wrote THANK YOU on the sign.'
      : 'A slaver camp in an old car park. Pens made of shopping trolleys.',
  skybus: () =>
    S.f.molesDead
      ? 'A dead plane. Every seat still full, everyone buckled in.'
      : 'A crashed plane. The sand around it is moving.',
  silo: () =>
    S.f.siloIn
      ? 'Concrete. Teeth on poles. A hum you can feel in your fillings.'
      : 'A hole in the desert ringed with poles. Each pole is topped with teeth. Guards at the gate.',
};
const HUBO = {
  scrapwell: () => [
    ['Climb down the well', () => go('hub', 'well')],
    ['Your shack (sleep, or retire)', () => go('shack')],
  ],
  rustwater: () => [
    S.f.pumpOpen || S.f.hanged
      ? [
          'Drink from the free pump',
          () => {
            say(`+${heal(6)} HP.`);
            goHere();
          },
        ]
      : [
          `Cup of water (10 teeth, +6 HP)`,
          () => {
            if (pay(10)) say(`+${heal(6)} HP. Tastes faintly of the Mayor.`);
            goHere();
          },
        ],
  ],
  farm: () => [
    !S.f.scareHat
      ? [
          "Take the scarecrow's hat",
          () => {
            S.f.scareHat = 1;
            give('hat');
            if (alive('hector') && roll(40)) {
              S.n.hector.op -= 5;
              say('Hector: "That\'ll be five teeth." You pay.');
              S.teeth = Math.max(0, S.teeth - 5);
            } else say('Got a hat.');
            goHere();
          },
        ]
      : null,
  ],
  diner: () =>
    alive('lou')
      ? [
          [`Order the stew (5 teeth)`, () => stew()],
          (S.f.kitchen || canTry('kitchen.sneak')) && [
            S.f.kitchen ? 'Go into the kitchen' : 'Sneak into the kitchen' + hint('kitchen.sneak'),
            () => {
              if (S.f.kitchen || attempt('kitchen.sneak')) {
                S.f.kitchen = 1;
                go('kitchen');
              } else {
                bad('Junior blocks the door. He puts a cleaver down, very slowly.');
                goHere();
              }
            },
          ],
        ]
      : [],
  chainfield: () =>
    S.f.freed
      ? []
      : [
          canTry('pens.open') && [
            'Open the pens at night' + hint('pens.open'),
            () => {
              if (attempt('pens.open')) freePens();
              else {
                if (knew('moe.lie') && !S.f.moeLieSprung) {
                  S.f.moeLieSprung = 1;
                  know('moe.betrayed');
                  bad('Krug is sitting on the pen gate, waiting. "Moe says hello."');
                } else bad('A lock squeals. Floodlights. "Thief!"');
                fight([...(alive('krug') ? [foe('krug')] : []), slv(), slv()], {
                  started: true,
                  win: 'pens',
                  back: ['map'],
                });
              }
            },
          ],
        ],
  skybus: () =>
    !S.f.molesDead
      ? [
          [
            'Fight the rad-moles',
            () =>
              fight(
                [mkE('Rad-mole', '🐀', 2, { loot: { meat: 1 }, teeth: 0 }), mkE('Rad-mole', '🐀', 2, { teeth: 0 })],
                { win: 'moles', back: ['map'] },
              ),
            'danger',
          ],
        ]
      : [
          !S.f.cockpit
            ? [
                'Search the cockpit',
                () => {
                  S.f.cockpit = 1;
                  if (!S.weapons.includes('rifle')) S.weapons.push('rifle');
                  give('ammo', 5);
                  say(
                    'A skeleton pilot. A Hunting Rifle and 5 bullets in the locker. A note: "We are cleared for landing. So is everything else."',
                  );
                  goHere();
                },
              ]
            : null,
          !S.f.coilGot && !has('coil')
            ? [
                'Salvage the galley heating coil' + hint('plane.coil'),
                () => {
                  if (attempt('plane.coil')) {
                    give('coil');
                    S.f.coilGot = 1;
                    say('One heating coil. It might toast.');
                  } else {
                    bad('Zap. -8 HP.');
                    if (hurt(8, 'Electrocuted by a plane that crashed 200 years ago.')) return;
                  }
                  goHere();
                },
              ]
            : null,
          !S.f.luggage
            ? [
                'Search the luggage',
                () => {
                  S.f.luggage = 1;
                  give('gutglue');
                  gain(15);
                  say('Gut Glue, 15 teeth, and a novel called "Fifty Shades of Beige". It\'s worse than the bombs.');
                  goHere();
                },
              ]
            : null,
        ],
  silo: () =>
    !S.f.siloIn
      ? [
          [
            'Attack the gate guards',
            () =>
              fight([mkE('Molar guard', '🦷', 6), mkE('Molar guard', '🦷', 6, { arm: 'spikes' })], {
                started: true,
                win: 'siloin',
                back: ['map'],
              }),
            'danger',
          ],
          [
            'Sneak past' + hint('silo.sneak'),
            () => {
              if (attempt('silo.sneak')) {
                S.f.siloIn = 1;
                say('You slip in behind a cart of diggers.');
                goHere();
              } else {
                bad('"Intruder!"');
                fight([mkE('Molar guard', '🦷', 6), mkE('Molar guard', '🦷', 6)], { win: 'siloin', back: ['map'] });
              }
            },
          ],
          S.f.slaver
            ? [
                'Flash your slaver tattoo: "Krug sent me."',
                () => {
                  S.f.siloIn = 1;
                  say("They wave you in. Krug's people come here all the time.");
                  goHere();
                },
              ]
            : null,
          [
            `Bribe them (150 teeth)`,
            () => {
              if (pay(150)) {
                S.f.siloIn = 1;
                say('They count it twice and step aside.');
              }
              goHere();
            },
          ],
        ]
      : [
          !S.armors.includes('riot')
            ? [
                'Break into the armoury' + hint('silo.armoury'),
                () => {
                  if (attempt('silo.armoury')) {
                    S.armors.push('riot');
                    S.armor = 'riot';
                    gainXP(100);
                    say('A PRE-WAR RIOT SUIT. You put it on. You feel like a walking tank. (Armour 10, equipped)');
                    goHere();
                  } else {
                    bad('Alarm!');
                    fight([mkE('Molar elite', '🦷', 7), mkE('Molar elite', '🦷', 7)], { win: 'back', back: ['map'] });
                  }
                },
              ]
            : null,
          !S.f.pitFreed
            ? [
                'Free the diggers in the pit' + hint('silo.pit'),
                () => {
                  if (attempt('silo.pit')) {
                    S.f.pitFreed = 1;
                    karma(3);
                    gainXP(150);
                    say("Chains drop. The diggers riot. The King's elite guards will be busy for a while.");
                  } else {
                    bad('A guard spots you.');
                    return fight([mkE('Molar elite', '🦷', 7)], { win: 'back', back: ['map'] });
                  }
                  goHere();
                },
              ]
            : null,
          !S.f.kingStopped
            ? [
                'Crawl the maintenance shaft to the launch console' + hint('silo.shaft'),
                () => {
                  if (attempt('silo.shaft')) {
                    stopKing('sabotage');
                    S.f.sabotaged = 1;
                    say('You cut the right wires. The Big Tooth goes quiet. Nobody knows yet.');
                  } else {
                    bad('Wrong wire. -10 HP.');
                    if (hurt(10, 'Fried in a missile silo.')) return;
                  }
                  goHere();
                },
              ]
            : null,
          alive('king')
            ? ['Enter the throne room', () => go('throne'), 'danger']
            : ['The launch console', () => go('console')],
        ],
};
SC.hub = loc => {
  S.here = loc;
  const L = LOC[loc];
  if (S.crater[loc])
    return show({
      title: L.n,
      icon: '☢️',
      sub: 'crater',
      text: 'A glowing crater. Nothing will live here again. You did that.',
      opts: [['Leave', () => go('map')], charOpt()],
    });
  const hs = IDS.filter(x => hostile(x) && S.n[x].loc === loc);
  if (hs.length && S.f.sneakIn !== loc) return go('ambush', loc);
  if (S.f.sneakIn && S.f.sneakIn !== loc) S.f.sneakIn = null;
  spouseTalk();
  if (loc === 'rustwater' && S.f.raidNews && !S.f.raidSeen) {
    S.f.raidSeen = 1;
    if (S.f.raidResult === 'held') say('Bullet holes, dead Molars, cheering. Rustwater held. Because you warned them.');
    else
      bad(
        `Smoke. The Molars hit Rustwater.${S.f.raidDead.length ? ' ' + S.f.raidDead.map(x => NPC[x].n).join(' and ') + " didn't make it." : ''}${S.f.mayorTribute ? " Funny: the Mayor's office wasn't touched." : ''}`,
      );
  }
  const cards =
    loc === 'silo' && !S.f.siloIn
      ? []
      : IDS.filter(
          x => alive(x) && x !== S.spouse && (S.n[x].loc === loc || (loc === 'chainfield' && S.n[x].loc === 'pen')),
        ).map(card);
  show({
    title: L.n,
    icon: L.i,
    sub: `Danger ${L.lvl} · Day ${S.day}`,
    text: HUBT[loc](),
    cards,
    opts: [
      ...(HUBO[loc] ? HUBO[loc]() : []),
      corpseOpt(),
      loc === 'well' ? ['Climb back up', () => go('hub', 'scrapwell')] : ['Leave (map)', () => go('map')],
      charOpt(),
    ],
  });
};
SC.ambush = loc => {
  const hs = IDS.filter(x => hostile(x) && S.n[x].loc === loc);
  if (!hs.length) return go('hub', loc);
  const en = [];
  hs.forEach(x =>
    crew(x).forEach(e => {
      if (!e.npc || !en.some(y => y.npc === e.npc)) en.push(e);
    }),
  );
  show({
    title: LOC[loc].n,
    icon: '⚠️',
    sub: 'They remember you',
    text: `${hs.map(x => NPC[x].n).join(' and ')} ${hs.length > 1 ? 'are' : 'is'} waiting for you.`,
    cards: en.map(e => ({ icon: e.i, name: e.n, sub: sizeUp(e.lvl) })),
    opts: [
      ['Fight', () => fight(en, { win: 'hub', args: [loc], back: ['map'] }), 'danger'],
      [
        'Sneak in' + hint('ambush.sneak', loc),
        () => {
          if (attempt('ambush.sneak', loc)) {
            S.f.sneakIn = loc;
            say('You slip past them.');
            go('hub', loc);
          } else {
            bad('Spotted.');
            fight(en, { win: 'hub', args: [loc], back: ['map'] });
          }
        },
      ],
      ['Turn back', () => go('map')],
    ],
  });
};
WIN.moles = () => {
  S.f.molesDead = 1;
  goHere();
};
WIN.siloin = () => {
  S.f.siloIn = 1;
  goHere();
};
WIN.pens = () => {
  freePens();
  go('hub', 'chainfield');
};
function freePens() {
  const f = S.f;
  if (f.freed) return;
  f.freed = 1;
  karma(5);
  addTitle('Liberator of Chainfield');
  gainXP(200);
  event('freed', null, { loc: 'chainfield' });
  ['bess', 'bert'].forEach(x => {
    if (alive(x) && S.n[x].loc === 'pen') {
      S.n[x].loc = 'farm';
      event('rescued', x, { loc: 'chainfield' });
      if (x === 'bess') f.bessHome = 1;
      say(`${NPC[x].n} runs for home.`);
    }
  });
  if (alive('teo')) S.n.teo.loc = 'rustwater';
  if (alive('krug')) S.n.krug.op = -100;
  f.sneakIn = 'chainfield';
  say('Forty people slip out into the night.');
}
SC.shack = () =>
  show({
    title: 'Your shack',
    icon: '🛏️',
    text: 'Four walls. Three of them yours.',
    opts: [
      [
        'Sleep until tomorrow (heal)',
        () => {
          if (tick()) return go('ending');
          if (S.f.netNight && !S.f.netDone && alive('krug')) {
            S.f.netDone = 1;
            const w = S.f.netNight;
            know('net.' + w);
            bad(`You wake up inside a net. Slavers. ${NPC[w].n} told Krug where you sleep.`);
            return fight([slv(), slv()], { win: 'go', args: ['shack'], back: ['hub', 'scrapwell'] });
          }
          if (S.addicted && !has('buzz')) {
            heal(Math.floor(S.maxhp / 3));
            bad('You sweat all night, dreaming of Buzz.');
          } else {
            heal(S.maxhp);
            say('You sleep like the dead.');
          }
          go('shack');
        },
      ],
      [
        'Retire. Never leave again.',
        () => {
          S.end = { type: 'retired' };
          go('ending');
        },
        'danger',
      ],
      ['Leave', () => go('hub', 'scrapwell')],
    ],
  });
