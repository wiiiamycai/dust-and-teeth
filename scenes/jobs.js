'use strict';
// ================= JOBS: a reason to care about everyone =================
// Will's rule: every character gives you a reason to care on a FIRST meeting. A want you can help or wreck,
// a payoff for you, and a consequence for somebody else. CARE.md is the audit, tests/care.js the guard.
// Finishing a job ends in confide(): they trust you, and tell you their own secret, no gossip needed.
function jobs(id, fn) {
  const _t = TALK[id];
  TALK[id] = () => {
    const r = _t();
    if (r && r.o) r.o.push(...fn().filter(Boolean));
    return r;
  };
}
// Speech is quoted with their name; a line that starts with narration is just said.
const says = (id, line) => (line[0] === '"' ? quote(`${NPC[id].n}: ${line}`) : say(line));

// ---- Snake Eyes: the House (Pips, Rook), Sweet Nan's money, and the pit ----
ITEMS.letter = "Dice's letter, sealed";
Object.assign(CK, {
  'pips.cover': { sk: 'speech', base: -5, who: 'pips', lock: 'once', likes: { 'pips.secret': 10 } },
  'tam.win': { sk: 'speech', base: 0, who: 'tam', lock: 'change', likes: { 'tam.secret': 15 } },
  'mayor.debt': { sk: 'speech', base: -5, who: 'mayor', lock: 'change', likes: { 'mayor.secret': 25 } },
  'rook.lie': { sk: 'speech', base: -15, who: 'rook', lock: 'once' },
});
// Dice loses her savings: she tries the vault sooner, alone.
function diceDesperate(days) {
  if (!S.f.plot_vault && S.day < 17) S.f.vaultDay = S.day + days;
}

// Pips: "Somebody's beating my tables." It's Dice, saving to escape.
jobs('pips', () => {
  const f = S.f,
    atDice = alive('dice') && S.n.dice.loc === 'snakeeyes';
  return [
    !f.pipsJob &&
      atDice && [
        '"You look like a man with a problem."',
        () => {
          f.pipsJob = 1;
          says(
            'pips',
            '"Somebody is beating my tables. A tooth here, a tooth there, every night. Find them, and the house is grateful."',
          );
          go('talk', 'pips');
        },
      ],
    f.pipsJob === 1 &&
      f.diceSkim &&
      atDice && [
        '"It\'s Dice. She skims her own table."',
        () => {
          f.pipsJob = 'told';
          gain(80);
          bump('dice', -60);
          bump('rook', -15);
          diceDesperate(3);
          rx('dice', '"You gave Pips my tin. Twelve years of teeth. I know your face now."');
          rx('rook', '"You turned in the dealer. The house pays well for that. I never took it."');
          says('pips', '"Dice? Twelve years. I\'m almost proud." He takes her tin and pays you 80 teeth out of it.');
          confide('pips');
          go('talk', 'pips');
        },
        'danger',
      ],
    f.pipsJob === 1 &&
      f.diceSkim &&
      atDice &&
      chkOpt('pips.cover', null, '"Nobody. The house had bad luck. It happens."', () => {
        if (attempt('pips.cover')) {
          f.pipsJob = 'covered';
          gain(20);
          says(
            'pips',
            '"Bad luck. I don\'t believe in it, and still I hate it." He pays you 20 teeth for your trouble.',
          );
          confide('dice', 30);
        } else {
          f.pipsJob = 'doubt';
          bump('pips', -15);
          later(2, 'pipsFinds');
          says('pips', '"Luck? Friend, I OWN luck." He starts watching the tables himself.');
        }
        go('talk', 'pips');
      }),
    has('letter') &&
      atDice && [
        '"Your dealer is writing letters to Rustwater. Want to read one?"',
        () => {
          take('letter');
          f.diceSold = 1;
          if (!f.plot_vault) stopPlot('vault');
          karma(-3);
          gain(60);
          offstage('dice', 'Pips reads the letter, smiles, pays you 60 teeth, and sells Dice before sundown.', true);
          go('talk', 'pips');
        },
        'danger',
      ],
    knew('tam.fix') &&
      plotOpen('fightnight') &&
      S.day < 14 &&
      !f.tamFixed &&
      !f.tamFights && [
        '"I\'ll make sure Big Tam goes down on fight night."',
        () => {
          f.tamFixed = 1;
          gain(60);
          karma(-2);
          bump('pips', 15);
          says('pips', '"Something in his water the night before. Enough to lose. Not enough to notice. Sixty now."');
          go('talk', 'pips');
        },
        'danger',
      ],
  ];
});
LATER.pipsFinds = () => {
  if (!alive('dice') || S.n.dice.loc !== 'snakeeyes' || !alive('pips')) return;
  bump('dice', -20);
  diceDesperate(3);
  rx('dice', '"Pips found my tin. Twelve years. He thanked me for saving it for him."');
};

// Dice: beat her at her own table and she asks you to carry a letter to her sister.
jobs('dice', () => {
  const f = S.f;
  if (!alive('dice') || S.n.dice.loc !== 'snakeeyes') return [];
  return [
    !tablesShut() && !banned() && ['"Deal me in."', () => go('cards')],
    !knew('dice.door') && [
      '"Why do you always watch the door?"',
      () => {
        know('dice.door');
        says('dice', '"Because one day I walk out of it. Beat me at my own table. Then ask me for a favour."');
        go('talk', 'dice');
      },
    ],
    f.pipsJob === 1 &&
      !f.diceSkim && [
        '"Pips says somebody is beating his tables."',
        () => {
          f.diceSkim = 1;
          says(
            'dice',
            '"...Me. My own table. One tooth a hand, into a tin, for twelve years. Forty more and I\'m gone. Going to tell him?"',
          );
          go('talk', 'dice');
        },
      ],
    f.pipsJob === 1 &&
      f.diceSkim && [
        '"Cut me in, or I tell Pips."',
        () => {
          f.pipsJob = 'cut';
          gain(40);
          karma(-1);
          bump('dice', -30);
          diceDesperate(5);
          says('dice', '"Forty. That\'s another month in this chair." She counts it out without looking at you.');
          go('talk', 'dice');
        },
        'danger',
      ],
    f.diceWon &&
      !f.diceLetter &&
      !f.sisters &&
      alive('opal') && [
        '"You said to ask you for a favour."',
        () => {
          f.diceLetter = 1;
          give('letter');
          says(
            'dice',
            '"You read people. Fine. Carry this to the Velvet Rad in Rustwater, to Madame Opal. Don\'t open it."',
          );
          go('talk', 'dice');
        },
      ],
  ];
});
// Opal gets the letter. Or you read it first, and learn who sold whom.
jobs('opal', () => {
  const f = S.f;
  if (!has('letter') || S.n.opal.loc !== 'rustwater') return [];
  return [
    !f.letterRead && [
      "Read Dice's letter first",
      () => {
        f.letterRead = 1;
        know('dice.secret');
        know('opal.secret');
        say(
          '"To the sister who sold me to Krug. I forgive you. Come and buy me back. Marigold." Dice is Opal\'s sister. Opal sold her.',
        );
        go('talk', 'opal');
      },
    ],
    [
      '"A letter for you. From a card dealer at Snake Eyes."',
      () => {
        take('letter');
        know('dice.secret');
        if (alive('dice') && S.n.dice.loc === 'snakeeyes' && !f.sisters) {
          f.sisters = 1;
          S.n.dice.loc = 'rustwater';
          bump('opal', 40);
          bump('dice', 20);
          gain(50);
          says(
            'opal',
            'She reads it twice. "...Marigold." She pays you 50 teeth without counting, empties the safe and rides north. By morning two sisters live under one roof, not speaking.',
          );
          confide('opal', 0);
        } else says('opal', 'She reads it and folds it very small. "Too late. It\'s always too late."');
        go('talk', 'opal');
      },
    ],
  ];
});

// Big Tam: Pips wants him down on fight night. Talk him into winning, fix it for Pips, or sell the fix and warn him.
jobs('tam', () => {
  const f = S.f;
  if (!alive('tam') || S.n.tam.loc !== 'snakeeyes') return [];
  const night = plotOpen('fightnight') && S.day < 14;
  return [
    night &&
      !knew('tam.fix') && [
        '"You look like a man with a fight coming."',
        () => {
          know('tam.fix');
          know('plot.fightnight');
          says(
            'tam',
            '"Fight night. The King\'s champion. Pips wants me down in the third. Nine years I go down when he says. This time it\'s to the death."',
          );
          go('talk', 'tam');
        },
      ],
    night &&
      knew('tam.fix') &&
      !f.tamFights &&
      !f.tamFixed &&
      chkOpt('tam.win', null, '"Then don\'t go down. Win it, for once."', () => {
        if (attempt('tam.win')) {
          f.tamFights = 1;
          says(
            'tam',
            'He looks at his hands for a long time. "...For once." Pips is going to lose a lot of the King\'s money.',
          );
          confide('tam', 15);
        } else says('tam', '"Pips owns my paper. Pips owns me. Go away."');
        go('talk', 'tam');
      }),
    night &&
      f.tamFixed &&
      !f.tamWarned && [
        '"Don\'t drink your water on fight night."',
        () => {
          f.tamWarned = 1;
          says(
            'tam',
            'Big Tam looks at the bucket, then at Pips\'s office. "...Whoever paid you, I hope they bet big."',
          );
          confide('tam', 20);
          go('talk', 'tam');
        },
      ],
    !f.tamTaught && [
      `"Teach me to fight." (${cost(20, 'tam')} teeth)`,
      () => {
        if (pay(cost(20, 'tam'))) {
          f.tamTaught = 1;
          practice('melee', 6);
          says('tam', '"Elbows. Nobody uses elbows." He shows you. It hurts for a week. You are better for it.');
        }
        go('talk', 'tam');
      },
    ],
  ];
});
const _fightnightHit = PLOTS.fightnight.hit;
PLOTS.fightnight.hit = seen => {
  _fightnightHit(seen);
  if (!S.f.tamWon) return;
  if (S.f.tamFixed) {
    bump('pips', -40);
    rx('pips', '"You took my money and warned him. The King lost a fortune on my tables. The house remembers."');
  } else if (S.f.tamFights) rx('pips', '"Big Tam was told to lose. Somebody talked to him. The house wonders who."');
};

// Sweet Nan: collect a hundred from Mayor Fenwick. Collect it, pay it yourself, or tip him off.
jobs('nan', () => {
  const f = S.f;
  return [
    !f.nanJob &&
      alive('mayor') && [
        '"Any work for a stranger, Nan?"',
        () => {
          f.nanJob = 1;
          later(7, 'nanJobDue');
          says(
            'nan',
            '"Fenwick, the Mayor of Rustwater. Plays on Thursdays, cries on Fridays. He owes me a hundred. Bring it, keep twenty. Seven days, dear."',
          );
          go('talk', 'nan');
        },
      ],
    f.nanJob === 1 &&
      f.nanColl && [
        '"Fenwick paid." (hand over 80, keep 20)',
        () => {
          if (S.teeth < 80) {
            says('nan', '"That isn\'t eighty, dear. Count again. Count faster."');
            return go('talk', 'nan');
          }
          S.teeth -= 80;
          f.nanJob = 'done';
          says('nan', '"From Fenwick. I could kiss you. I won\'t."');
          confide('nan');
          go('talk', 'nan');
        },
      ],
    f.nanJob === 1 &&
      !f.nanColl && [
        '"Fenwick can\'t pay. I\'ll cover it." (100 teeth)',
        () => {
          if (pay(100)) {
            f.nanJob = 'done';
            bump('mayor', 15);
            rx('mayor', '"Somebody paid my Thursdays at Snake Eyes. I don\'t like owing strangers. Thank you."');
            says('nan', '"You paid somebody else\'s debt? Nobody does that. Sit down, dear."');
            confide('nan', 30);
          }
          go('talk', 'nan');
        },
      ],
  ];
});
jobs('mayor', () => {
  const f = S.f;
  if (f.nanJob !== 1 || f.nanColl || !alive('nan')) return [];
  return [
    chkOpt('mayor.debt', null, '"Sweet Nan wants her hundred teeth."', () => {
      if (attempt('mayor.debt')) {
        f.nanColl = 1;
        gain(100);
        f.waterUp = (f.waterUp || 0) + 2;
        rx('moe', '"Water\'s up two teeth. Fenwick calls it the Thursday tax. Nobody knows what that means but me."');
        says(
          'mayor',
          '"Fine. FINE." He counts out 100 teeth. "Water goes up two. Somebody has to pay for my Thursdays."',
        );
      } else says('mayor', '"I owe nobody anything. Get out of my parlour."');
      go('talk', 'mayor');
    }),
    [
      '"Nan is sending people for you. Thought you should know."',
      () => {
        f.nanJob = 'tipped';
        gain(40);
        bump('mayor', 20);
        bump('nan', -40);
        rx('nan', '"Fenwick knew I was coming. So I sold his paper to Krug, dear. Then I thought about who told him."');
        rx('krug', '"Nan sold me the Mayor\'s debt. A mayor who owes me. I may buy him a hat."');
        says('mayor', '"A friend in the gambling trade! Forty teeth, for loyalty. I shall stay home on Thursdays."');
        go('talk', 'mayor');
      },
    ],
  ];
});
LATER.nanJobDue = () => {
  const f = S.f;
  if (f.nanJob !== 1 || !alive('nan')) return;
  if (!f.nanColl) {
    f.nanJob = 'lapsed';
    rx('nan', '"No hundred from Fenwick? Never mind, dear. I\'ll send someone who enjoys it."');
    return;
  }
  f.nanJob = 'kept';
  f.collectors = alive('krug') && !f.chainfieldBurned ? 'krug' : 'pips';
  bad(
    "You kept Fenwick's hundred. Sweet Nan noticed. " +
      (f.collectors === 'krug' ? "Your name is on Krug's list now." : "Pips's housemen are looking for you."),
  );
};

// Rook: does the King still want his head? Gums at the Mall knows. Tell him, lie to him, or sell him.
jobs('rook', () => {
  const f = S.f;
  if (!alive('rook') || S.n.rook.loc !== 'snakeeyes') return [];
  return [
    !f.rookJob && [
      '"Who are you watching the door for?"',
      () => {
        f.rookJob = 1;
        says(
          'rook',
          '"Molars. I was the King\'s doorman. I left his door without asking. Find out if he still wants my head. Gums at the Mall would know."',
        );
        go('talk', 'rook');
      },
    ],
    f.rookJob === 1 &&
      knew('rook.price') && [
        '"The King still wants you. Two hundred teeth, alive."',
        () => {
          f.rookJob = 'told';
          says('rook', '"...Thank you. Nobody tells a doorman anything." He stands a little further inside the door.');
          confide('rook', 25);
          go('talk', 'rook');
        },
      ],
    f.rookJob === 1 &&
      knew('rook.price') &&
      chkOpt('rook.lie', null, '"The King forgot you. You\'re free."', () => {
        if (attempt('rook.lie')) {
          f.rookJob = 'freed';
          f.rookLooks = 1;
          bump('rook', 20);
          says(
            'rook',
            'Rook sits on the step for the first time in six years. "Free." He stops watching the door. Anybody could walk through it now.',
          );
        } else {
          f.rookJob = 'told';
          bump('rook', -20);
          says('rook', '"Nobody forgets a door. Not him." He looks at you differently now.');
        }
        go('talk', 'rook');
      }),
    f.rookSold &&
      !f.rookWarned && [
        '"Molars are coming for you. Soon."',
        () => {
          f.rookWarned = 1;
          bump('rook', 15);
          says('rook', 'Rook takes the repeater down from over the door. "Let them knock."');
          go('talk', 'rook');
        },
      ],
  ];
});
jobs('gums', () => {
  const f = S.f,
    rookThere = alive('rook') && S.n.rook.loc === 'snakeeyes';
  return [
    f.rookJob === 1 &&
      !knew('rook.price') && [
        '"Does the King still want Rook, his old doorman?"',
        () => {
          know('rook.price');
          says('gums', '"Rook? Two hundred teeth, alive. The King never forgetsh a door. Forgets. Never."');
          go('talk', 'gums');
        },
      ],
    knew('rook.price') &&
      rookThere &&
      !f.rookSold &&
      alive('king') &&
      !f.kingStopped && [
        '"Tell the King where Rook is. We split the bounty."',
        () => {
          f.rookSold = 1;
          gain(80);
          karma(-3);
          later(3, 'rookTaken');
          says(
            'gums',
            '"Eighty now. The Molars do the resht." He doesn\'t look happy about it. He takes the money anyway.',
          );
          go('talk', 'gums');
        },
        'danger',
      ],
  ];
});
LATER.rookTaken = () => {
  if (!alive('rook') || S.n.rook.loc !== 'snakeeyes') return;
  if (S.f.rookWarned) {
    rx('rook', '"Three Molars came to the door. Three Molars are in the sand behind the casino now."');
    rx('gums', '"The Molars want their eighty teeth back. From ME."');
    bump('gums', -20);
    return;
  }
  offstage(
    'rook',
    "Molars came to Snake Eyes in the night. Rook held the door for a while. Then he didn't.",
    S.here === 'snakeeyes',
  );
  rx('gums', '"The King paid. Rook\'s back at his old door. On a spike, next to it."');
};

// ---- the Drowned Mall: Margie's food court, Vane's pharmacy, and the divers ----
ITEMS.matchbarrel = 'Pre-war match barrel';
ITEMS.grey = "Vane's grey Buzz, stamped RATCHET";
ITEMS.gumsteeth = "Gums's teeth, in a jar";
MODS.match = {
  n: 'match barrel',
  on: 'gun',
  cost: 0,
  hit: 5,
  dmg: 2,
  t: "Sprocket's match barrel (hits truer and harder)",
};
Object.assign(CK, {
  'shift.riot': { sk: 'speech', base: 0, lock: 'none', likes: { 'margie.faith': 15 } },
  'dive.gunshop': {
    sk: 'sneak',
    base: -25,
    lock: 'none',
    likes: { 'eel.tips': 15 },
    mods: () => (S.stats.guts - 5) * 3,
  },
  'silo.jar': { sk: 'steal', base: -10, lock: 'none' },
});

// Margie: the application becomes a job. Three shifts, one a day, trouble on each.
jobs('margie', () => {
  const f = S.f,
    n = f.shifts || 0;
  if (!f.associate || !courtOpen() || n >= 3) return [];
  return [f.shiftDay === S.day ? null : [`"Put me on a shift." (shift ${n + 1} of 3)`, () => go('shift', n + 1)]];
});
SC.shift = n => {
  const f = S.f,
    done = (line, fn) => () => {
      const r = fn ? fn() : null;
      if (r === false) return; // died on shift
      if (r === 'again') return go('shift', n); // couldn't pay
      f.shifts = n;
      f.shiftDay = S.day;
      if (line) say(line);
      if (n === 3) {
        addTitle('Shift Manager');
        gain(60);
        says(
          'margie',
          '"Three shifts. No deaths on the premises. You are Shift Manager now. 60 teeth. The handbook says I must tell you something."',
        );
        confide('margie');
      }
      go('talk', 'margie');
    };
  const T = {
    1: {
      t: 'Shift one. A scavenger is stuffing ketchup packets into his coat. A lot of ketchup packets. He sees you see him.',
      o: [
        [
          'Tackle him',
          done(
            'You bring him down by the fries. The packets burst. You look like a crime scene. Margie is delighted.',
            () => {
              bump('margie', 10);
              bump('gums', -10);
              rx('gums', '"One of my boys got tackled by an associate. Nobody tackles for minimum wage."');
            },
          ),
        ],
        [
          'Let him go',
          done(null, () => {
            bump('gums', 10);
            say(`He slips you ${partFind()} on the way out. "Gums pays me per packet. You never saw me."`);
          }),
        ],
      ],
    },
    2: {
      t: 'Shift two. A man in a clean coat is selling little grey bags at table six. Every bag says RATCHET.',
      o: [
        [
          'Throw him out',
          done(
            'You walk him to the car park. He tells you Dr. Vane will remember your face. The bags say RATCHET. The powder says Vane.',
            () => {
              bump('vane', -20);
              bump('margie', 10);
              know('plot.drugwar');
            },
          ),
        ],
        [
          `Buy a bag and say nothing (${cost(10, 'vane')} teeth)`,
          done(null, () => {
            if (!pay(cost(10, 'vane'))) return 'again';
            bump('vane', 10);
            know('vane.grey');
            say('Grey powder, chalky. It smells of rat poison. Now you know exactly what Vane is cutting it with.');
          }),
        ],
      ],
    },
    3: {
      t: 'Shift three. One Value Meal left. Two divers and a raider want it. The fists are coming out.',
      o: [
        chkOpt(
          'shift.riot',
          null,
          '"The customer is always right. All of you. Split it."',
          done(null, () => {
            if (attempt('shift.riot')) {
              gain(15);
              say('Three people share one burger in perfect hatred. They tip you 15 teeth to stop talking.');
            } else {
              bad('Nobody wants Customer Service. A raider wants your teeth. You keep most of them.');
              if (hurt(R(3, 6), 'Killed over the last Value Meal.')) return false;
            }
          }),
        ),
        [
          'Eat it yourself',
          done(null, () => {
            bump('margie', -15);
            say(
              `You eat the last Value Meal in front of all three of them. +${heal(20)} HP. Margie writes something in the handbook.`,
            );
          }),
        ],
        alive('eel') && S.n.eel.loc === 'mall'
          ? [
              'Give it to Eel, who dived all day',
              done('Eel eats it in four bites. The raider glares. The divers will remember this.', () =>
                bump('eel', 15),
              ),
            ]
          : null,
      ],
    },
  }[n];
  show({ title: 'The food court', icon: '🍟', text: T.t, opts: T.o.filter(Boolean) });
};

// Sprocket: one part from the deepest shop. A risky dive, and a mod nobody else has.
jobs('sprocket', () => {
  const f = S.f;
  if (S.n.sprocket.loc !== 'mall') return [];
  return [
    !f.sprJob && [
      '"Need anything from the water?"',
      () => {
        f.sprJob = 1;
        says(
          'sprocket',
          '"There\'s a gun shop at the very bottom. Behind the counter, a pre-war match barrel. Bring it up and I\'ll make you something nobody else has."',
        );
        go('talk', 'sprocket');
      },
    ],
    f.sprJob === 1 &&
      has('matchbarrel') && [
        '"Your match barrel. From the bottom."',
        () => {
          take('matchbarrel');
          f.sprJob = 'done';
          f.matchReady = 1;
          says(
            'sprocket',
            'She turns it in the light like a jewel. "Two hundred years and not a pit in it. Bring me a gun. Any gun. I\'ll fit it free."',
          );
          confide('sprocket');
          go('talk', 'sprocket');
        },
      ],
  ];
});
const _diveJob = SC.dive;
SC.dive = () => {
  _diveJob();
  if (S.f.sprJob === 1 && !has('matchbarrel') && S.f.diveDay !== S.day) {
    const list = cur.slice();
    list.splice(list.length - 1, 0, [
      'The gun shop at the very bottom' + hint('dive.gunshop'),
      () => gunshopDive(),
      'danger',
    ]);
    drawOpts(list);
  }
};
function gunshopDive() {
  S.f.diveDay = S.day;
  if (attempt('dive.gunshop')) {
    give('matchbarrel');
    say(
      'Down past the department store, past the light, to a shop with bars on the window. Behind the counter, wrapped in oilcloth: the barrel.',
    );
    return go('dive');
  }
  if (roll(50)) {
    bad('Something lives in the gun shop. It does not want you in the gun shop.');
    return fight([spawn('mallEel')], { close: true, started: true, win: 'dived', back: ['hub', 'mall'] });
  }
  bad('The bars on the window close behind you. You find another way out. It takes all your air.');
  if (hurt(R(10, 16), 'Drowned in a gun shop at the bottom of a mall.')) return;
  go('dive');
}
const _benchJob = SC.bench;
SC.bench = () => {
  _benchJob();
  if (!S.f.matchReady) return;
  const list = cur.slice();
  for (const k of S.weapons)
    if (W[k] && isGun(k) && !W[k].free && !modsOf(k).includes('match'))
      list.splice(list.length - 1, 0, [
        `${W[k].n}: the match barrel (free, once)`,
        () => {
          S.f.matchReady = 0;
          S.mods[k] = [...modsOf(k), 'match'];
          says('sprocket', `"There. The only one in the valley. Don't sell it to Gums." (${modName(k)})`);
          go('bench');
        },
      ]);
  drawOpts(list);
};
jobs('gums', () =>
  has('matchbarrel') && S.f.sprJob === 1
    ? [
        [
          `"A pre-war match barrel. Want it?" (${cost(90, 'gums')} teeth)`,
          () => {
            take('matchbarrel');
            S.f.sprJob = 'sold';
            gain(cost(90, 'gums'));
            bump('sprocket', -30);
            rx(
              'sprocket',
              '"Gums has my barrel. He sold it on to the Molars. Some Molar can hit you from a mile now. Thanks."',
            );
            rx('king', '"A beautiful barrel came up from the Mall. My best shot has it now."');
            says('gums', '"Shweet. Sweet. The Molars will pay double."');
            go('talk', 'gums');
          },
          'danger',
        ],
      ]
    : [],
);

// Eel: hire you from day one to ask around about Sal, so you can know before her day 13 walk to Lou's.
jobs('eel', () => {
  const f = S.f;
  if (!alive('eel') || S.n.eel.loc !== 'mall') return [];
  if (f.eelJob === 1 && f.plot_widow) {
    f.eelJob = 'paid';
    gain(20);
    say('Eel pays you the other 20 teeth. She keeps her word, whatever you told her.');
    if (!f.eelLied && !f.eelSold) confide('eel');
  }
  return [
    !f.eelJob &&
      plotOpen('widow') && [
        '"I could ask around about Sal."',
        () => {
          f.eelJob = 1;
          gain(20);
          know('plot.widow');
          says(
            'eel',
            '"Sal. Caravan guard. Big. Kind. Last seen at Mama Lou\'s. Twenty now, twenty when you know. Ask Jeb, he hired him. Ask anyone."',
          );
          go('talk', 'eel');
        },
      ],
  ];
});
jobs('jeb', () =>
  S.f.eelJob === 1 && !knew('sal.jeb')
    ? [
        [
          '"Eel at the Mall is asking after Sal. You hired him."',
          () => {
            know('sal.jeb');
            says(
              'jeb',
              '"Sal and Pete. Stopped at Lou\'s on the way back. Pete came home weeks later, from a cage. Sal never did. I stopped asking."',
            );
            go('talk', 'jeb');
          },
        ],
      ]
    : [],
);
jobs('lou', () =>
  S.f.eelJob === 1 && !knew('sal.lou')
    ? [
        [
          '"Ever cook for a caravan guard called Sal?"',
          () => {
            know('sal.lou');
            says('lou', '"Sweetie, I cook for everyone. Eventually." She keeps smiling. She stops stirring.');
            go('talk', 'lou');
          },
        ],
      ]
    : [],
);
jobs('pete', () =>
  S.f.eelJob === 1 && !knew('pete.secret') && alive('pete') && S.n.pete.loc === 'rustwater'
    ? [
        [
          '"Sal\'s widow wants to know what happened to him."',
          () => {
            know('pete.secret');
            says(
              'pete',
              'Pete goes grey. "...Lou had room for one more. I told her Sal was fatter. She took him first. That\'s what happened to Sal."',
            );
            go('talk', 'pete');
          },
        ],
      ]
    : [],
);

// Dr. Vane: a runner for the grey, under Doc's name. Leave it on Moe's bar, swap it for flour, or hand it to Doc.
jobs('vane', () => {
  const f = S.f;
  return [
    !f.greyRun &&
      !f.drugHelped &&
      plotOpen('drugwar') &&
      S.n.vane.loc === 'mall' && [
        '"You look like you need a runner."',
        () => {
          f.greyRun = 1;
          give('grey');
          gain(60);
          karma(-1);
          know('plot.drugwar');
          says(
            'vane',
            '"Legs in Rustwater. Little grey bags, Ratchet\'s name on every one. Leave them on Moe\'s bar. Sixty now, sixty after."',
          );
          go('talk', 'vane');
        },
        'danger',
      ],
  ];
});
const _vaneOpt = PLOTS.drugwar.opts.vane;
PLOTS.drugwar.opts.vane = () => (S.f.greyRun ? null : _vaneOpt());
const _huboRustJob = HUBO.rustwater;
HUBO.rustwater = () => {
  const o = _huboRustJob(),
    f = S.f;
  if (has('grey') && plotOpen('drugwar') && alive('moe') && S.n.moe.loc === 'rustwater')
    o.push(
      [
        "Leave Vane's grey on Moe's bar",
        () => {
          take('grey');
          f.greyRun = 'done';
          f.drugHelped = 1;
          f.drugDay = S.day + 1;
          karma(-3);
          gain(60);
          bump('vane', 30);
          say("Little grey bags, under the beer mats. Vane's man meets you at the pump with the other sixty.");
          goHere();
        },
        'danger',
      ],
      [
        'Swap the grey for flour, then leave it on the bar',
        () => {
          take('grey');
          f.greyRun = 'swapped';
          stopPlot('drugwar');
          f.vaneFlour = 1;
          gain(60);
          later(3, 'vaneKnows');
          say(
            "Grey into the pump trough, flour into the bags. Vane's man pays you the other sixty. Rustwater gets very calm.",
          );
          goHere();
        },
      ],
    );
  return o;
};
LATER.vaneKnows = () => {
  bump('vane', -50);
  rx('vane', '"My grand batch was FLOUR. Rustwater made bread with it. You will make a lovely patient one day."');
};
jobs('doc', () =>
  has('grey') && plotOpen('drugwar') && S.n.doc.loc === 'rustwater'
    ? [
        [
          '"Vane paid me to sell this under your name."',
          () => {
            take('grey');
            S.f.greyRun = 'doc';
            stopPlot('drugwar');
            S.f.docWarned = 1;
            bump('doc', 30);
            bump('vane', -40);
            gain(40);
            says(
              'doc',
              '"Vane. My old apprentice. He always did sign my name better than me." He burns the bags and pays you 40 teeth.',
            );
            confide('doc', 0);
            go('talk', 'doc');
          },
        ],
      ]
    : [],
);

// Gums: his teeth back, from the tooth-tax jar in the Silo.
jobs('gums', () => {
  const f = S.f;
  return [
    !f.gumsJob && [
      '"What do you want most, Gums?"',
      () => {
        f.gumsJob = 1;
        says(
          'gums',
          '"My teeth. The King keepsh the tooth tax in jars by his throne. Mine are in one. Top shelf. Labelled GUMS. Bring them, I\'ll make it worth it."',
        );
        go('talk', 'gums');
      },
    ],
    f.gumsJob === 1 &&
      has('gumsteeth') && [
        '"Your teeth. Top shelf, labelled GUMS."',
        () => {
          take('gumsteeth');
          f.gumsJob = 'done';
          bump('gums', 30);
          const gift = !S.armors.includes('plate');
          if (gift) S.armors.push('plate');
          else gain(100);
          says(
            'gums',
            `He holds the jar to his chest. "...Mine." ${gift ? 'He gives you a car-door plate off the stall. "Barely anyone left in it."' : 'He pays you 100 teeth.'}`,
          );
          confide('gums', 0);
          go('talk', 'gums');
        },
      ],
    f.gumsJob === 1 &&
      has('gumsteeth') && [
        `"Sixty teeth and they're yours."`,
        () => {
          take('gumsteeth');
          f.gumsJob = 'sold';
          gain(60);
          bump('gums', -30);
          says('gums', '"Buying my own teeth back. Like Jeb with his gin." He pays. He is used to paying.');
          go('talk', 'gums');
        },
        'danger',
      ],
  ];
});
const _huboSiloJob = HUBO.silo;
HUBO.silo = () => {
  const o = _huboSiloJob();
  if (S.f.siloIn && S.f.gumsJob === 1 && !has('gumsteeth') && alive('king'))
    o.unshift([
      'Find the tooth-tax jar labelled GUMS' + hint('silo.jar'),
      () => {
        if (attempt('silo.jar')) {
          give('gumsteeth');
          rx('king', '"Somebody robbed my tax jars. One jar. Why ONE jar?"');
          say('Jars of teeth to the ceiling, every one labelled. GUMS, top shelf. It rattles.');
          goHere();
        } else {
          bad('The shelf comes down. So does a Molar guard.');
          fight([spawn('molarGuard')], { win: 'back', back: ['map'] });
        }
      },
    ]);
  return o;
};
