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
const says = (id, line) => quote(`${NPC[id].n}: ${line}`);

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
