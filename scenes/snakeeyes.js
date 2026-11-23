'use strict';
// ================= SNAKE EYES: the gambling town =================
// A pre-war casino half-buried in sand, north between the farm and Chainfield.
// Every game uses one of your skills, and the house always cheats, so you always have a reason to cheat back.
// The house bank has a limit: win 400 teeth net and Pips closes the tables to you. The pit stays open.
// Pit fights stop when someone yields. You can lose your stake, never your life.
// Debt is real: borrow from Sweet Nan and don't pay, and Pips sells your debt to Krug.
const HOUSE_LIMIT = 400;
const tablesShut = () => (S.f.houseUp || 0) >= HOUSE_LIMIT || (S.f.banUntil || 0) > S.day;
function houseWin(n) {
  S.f.houseUp = (S.f.houseUp || 0) + n;
}
function casinoBet(label, sizes, play) {
  return sizes.filter(b => S.teeth >= b).map(b => [`${label} (${b} teeth)`, () => play(b)]);
}
function throwOut(days, line) {
  S.f.banUntil = S.day + DAYS(days);
  bad(line || 'Rook picks you up by the collar and puts you outside. Gently. Like rubbish.');
  go('hub', 'snakeeyes');
}

const banned = () => (S.f.banUntil || 0) > S.day;
HUBT.snakeeyes = () =>
  (banned() ? 'Rook fills the door of the casino. You are not coming in today. ' : '') +
  'A pre-war casino half-buried in the sand. One letter of the neon still works, an E, buzzing. Inside: dice, cards, rats, and a pit.' +
  (S.f.honestDice ? ' Rook runs the place now. The dice are honest. Mostly.' : '') +
  plotText('snakeeyes');
HUBO.snakeeyes = () =>
  (banned()
    ? []
    : [
        ...(tablesShut()
          ? [
              [
                'The tables (closed to you)',
                () => (quote('Pips: "You\'ve had enough luck for one lifetime, friend. The house says no."'), goHere()),
              ],
            ]
          : [
              ['Bones, the dice table', () => go('bones')],
              ['Cards with Dice', () => go('cards')],
              ['The rat races', () => go('rats')],
            ]),
        ['The pit (fists and blades, to the yield)', () => go('pit')],
        ...plotHub('snakeeyes'),
      ]
  ).filter(Boolean);

// ---- Bones: loaded dice. Luck helps a little. Know they're loaded and you can call it, or swap in your own. ----
SC.bones = () => {
  const loaded = S.f.loadedDay === S.day,
    p = S.f.honestDice ? 50 : loaded ? 75 : 40 + (S.stats.luck - 5) * 2;
  const o = casinoBet('Roll', [10, 25, 50], b => {
    if (roll(p)) {
      gain(b);
      houseWin(b);
      say(loaded ? `Your dice, your sevens. +${b} teeth.` : `Seven! +${b} teeth.`);
    } else {
      S.teeth -= b;
      houseWin(-b);
      S.f.bonesLost = (S.f.bonesLost || 0) + b;
      bad(`Snake eyes. Of course. -${b} teeth.`);
    }
    if (tablesShut()) return goHere();
    go('bones');
  });
  if (knew('pips.secret') && !S.f.honestDice && alive('pips')) {
    if (!S.f.diceCalled)
      o.push([
        'Call the dice loaded, loudly',
        () => {
          S.f.diceCalled = 1;
          const back = S.f.bonesLost || 0;
          gain(back);
          S.f.bonesLost = 0;
          bump('pips', -30);
          quote(
            `The table goes silent. Pips laughs too loudly and refunds you ${back} teeth "as a gesture". Rook walks you out.`,
          );
          throwOut(1, 'You are banned for the rest of the day. Worth it.');
        },
        'danger',
      ]);
    if (!loaded)
      o.push(
        chkOpt('bones.swap', null, 'Swap the house dice for a pair loaded your way', () => {
          if (attempt('bones.swap')) {
            S.f.loadedDay = S.day;
            say('Palm, swap, smile. Tonight the dice love you.');
            go('bones');
          } else
            throwOut(
              3,
              'Pips catches your wrist. "Cheating? In MY casino? That is MY job." Rook throws you out for three days.',
            );
        }),
      );
  }
  o.push(['Back', () => goHere()]);
  show({
    title: 'Bones',
    icon: '🎲',
    sub: `You have ${S.teeth} teeth`,
    text: 'Two bone dice, older than the bombs. Seven wins, even money. The croupier smiles like he knows something. He does.',
    opts: o,
  });
};

// ---- Cards with Dice: Speech reads her. Steal deals you a better hand. Rook watches. ----
SC.cards = () => {
  if (!alive('dice') || S.n.dice.loc !== 'snakeeyes') {
    say('Her chair is empty. Somebody else deals now, badly.');
    return goHere();
  }
  const p = clamp(38 + Math.round((S.skills.speech - 35) / 3) + (S.n.dice.op >= 30 ? 10 : 0), 10, 70);
  const o = casinoBet('Play a hand', [10, 25, 50], b => {
    if (roll(p)) {
      gain(b);
      houseWin(b);
      S.f.diceWon = 1;
      say(`You read her. She folds. +${b} teeth.`);
    } else {
      S.teeth -= b;
      houseWin(-b);
      bad(`Dice turns over a hand that should not exist. -${b} teeth.`);
    }
    if (tablesShut()) return goHere();
    go('cards');
  });
  if (S.teeth >= 25)
    o.push(
      chkOpt('cards.cheat', null, 'Deal yourself a better hand (25 teeth, pays double)', () => {
        if (attempt('cards.cheat')) {
          S.f.diceWon = 1;
          gain(50);
          houseWin(50);
          bump('dice', 5);
          say('Four queens, from a deck with three. Dice raises an eyebrow and says nothing. +50 teeth.');
          if (tablesShut()) return goHere();
          go('cards');
        } else {
          S.teeth -= 25;
          bump('dice', -10);
          throwOut(3, 'A card falls out of your sleeve. Dice sighs. Rook throws you out for three days.');
        }
      }),
    );
  o.push(['Back', () => goHere()]);
  show({
    title: 'Cards with Dice',
    icon: '🎴',
    sub: `You have ${S.teeth} teeth`,
    text: 'Dice deals like she is counting down to something. "Sit, or move. Don\'t stand there."',
    opts: o,
  });
};

// ---- The rat races: pure luck at three to one. Unless your rat has had some Buzz. ----
const RATS = ['Lightning Gerald', 'Mrs Nibbles', 'The Professor', 'Gutterball'];
SC.rats = (pick, doped) => {
  if (pick == null) {
    const o = RATS.map((r, i) => [`Bet on ${r}`, () => go('rats', i, false)]);
    o.push(['Back', () => goHere()]);
    return show({
      title: 'The rat races',
      icon: '🐀',
      text: 'Four mole-rats in a gutter track. The crowd screams. One rat is asleep.',
      opts: o,
    });
  }
  const o = casinoBet(`${RATS[pick]} to win, three to one`, [10, 20], b => {
    S.teeth -= b;
    if (roll(doped ? 70 : 25)) {
      gain(b * 4);
      houseWin(b * 3);
      say(`${RATS[pick]} wins by a whisker! +${b * 3} teeth.`);
    } else {
      houseWin(-b);
      bad(`${RATS[pick]} stops to clean itself. -${b} teeth.`);
    }
    if (tablesShut()) return goHere();
    go('rats');
  });
  if (!doped && has('buzz'))
    o.push([
      `Slip ${RATS[pick]} some Buzz first`,
      () => {
        take('buzz');
        say(`${RATS[pick]} vibrates. Its eyes go wide. It is ready for anything.`);
        go('rats', pick, true);
      },
    ]);
  o.push(['Back', () => go('rats')]);
  show({
    title: 'The rat races',
    icon: '🐀',
    sub: `You have ${S.teeth} teeth`,
    text: `Your rat: ${RATS[pick]}.${doped ? ' Twitching.' : ''}`,
    opts: o,
  });
};

// ---- The pit: a ladder of four, one fight a day, to the yield. ----
const PIT = [
  { n: 'Gutterpup', i: '🐶', lv: 2, wep: 'knife', purse: 40 },
  { n: 'Sister Splint', i: '🩹', lv: 4, wep: 'pipe', arm: 'jacket', purse: 80 },
  { n: 'Molar Mick', i: '🦷', lv: 5, wep: 'cleaver', arm: 'spikes', purse: 150 },
  { n: 'Big Tam', i: '🥊', lv: 6, wep: 'sledge', arm: 'spikes', purse: 300, tam: 1 },
];
const bestMelee = () => S.weapons.filter(w => !isGun(w)).sort((a, b) => W[b].d[1] - W[a].d[1])[0] || 'fists';
SC.pit = () => {
  const r = S.f.pitRung || 0,
    next = PIT[r],
    o = [];
  if (next && next.tam && (!alive('tam') || S.n.tam.loc !== 'snakeeyes'))
    return show({
      title: 'The pit',
      icon: '🥊',
      text: 'The champion is gone. Pips is looking for a new one. You, maybe.',
      opts: [['Back', () => goHere()]],
    });
  if (!next) o.push(['Back', () => goHere()]);
  else if (S.f.pitDay === S.day) o.push(['Back (one fight a day; the crowd likes to miss you)', () => goHere()]);
  else
    o.push(
      [
        `Fight ${next.n} for ${next.purse} teeth`,
        () => {
          S.f.pitDay = S.day;
          S.weapon = bestMelee();
          fight([mkE(next.n, next.i, next.lv, { wep: next.wep, arm: next.arm, teeth: 0 })], {
            pit: true,
            close: true,
            win: 'pit',
            args: [r],
            back: ['hub', 'snakeeyes'],
          });
        },
        'danger',
      ],
      ['Back', () => goHere()],
    );
  show({
    title: 'The pit',
    icon: '🥊',
    text: next
      ? `Sand, blood, and a rail of screaming gamblers. Fists and blades only. You yield, you live. Next on the ladder: ${next.n}.`
      : 'You are the Champion of the Pit. Nobody will get in the sand with you any more. They just cheer when you walk past.',
    opts: o,
  });
};
WIN.pit = r => {
  const P = PIT[r];
  S.f.pitRung = r + 1;
  gain(P.purse);
  say(`${P.n} slaps the sand and yields. The crowd goes mad. +${P.purse} teeth.`);
  if (P.tam) {
    addTitle('Champion of the Pit');
    bump('tam', 20);
    rx('tam', '"Finally. Somebody. You don\'t know how tired I am."');
  }
  go('hub', 'snakeeyes');
};
function pitYield() {
  S.fight = null;
  S.buzzOn = false;
  S.hp = 1;
  bad('You go down and slap the sand. The crowd boos. Rook drags you out by the ankle. You live.');
  go('hub', 'snakeeyes');
}

// ---- the people ----
TALK.pips = () => ({
  t: S.f.diceCalled
    ? 'Mister Pips smiles at you the way a snake smiles at a lamp. "No hard feelings. Very hard feelings."'
    : 'Mister Pips: a grin, a tuxedo older than the bombs, and a ring on every finger. "Everybody wins at Snake Eyes. Eventually. Statistically. Somebody."',
  o: [newsOpt('pips', '"The house hears everything, friend. The house tells nothing."')],
});
TALK.dice = () => ({
  t: S.f.sisters
    ? "Dice, in Rustwater now. She and Opal live under the same roof and don't talk. Yet."
    : 'Dice shuffles without looking. Her eyes are on the door, always.',
  o: [newsOpt('dice', '"Cards don\'t lie. People do. I deal cards."')],
});
TALK.tam = () => {
  const o = [newsOpt('tam', '"I don\'t talk about before."')];
  if (knew('tam.secret') && !S.f.tamTold)
    o.push([
      '"Your brother Gus keeps your teeth in a tin."',
      () => {
        S.f.tamTold = 1;
        bump('tam', 15);
        quote(
          'Big Tam sits down hard, like the sand pulled him. "...They weren\'t mine. Does he... does he still dig?"',
        );
        go('talk', 'tam');
      },
    ]);
  return {
    t: S.f.brothers
      ? 'Big Tam and Gus, side by side, not talking, completely happy.'
      : 'Big Tam: scars on scars. He looks like someone you know, around the eyes.',
    o,
  };
};
TALK.nan = () => {
  const f = S.f,
    o = [newsOpt('nan', '"Sweet Nan lends to anybody, dear. Once."')];
  if (!f.debt && !f.debtSold)
    o.push([
      '"I need a loan." (100 teeth now, 150 back within 7 days)',
      () => {
        f.debt = 150;
        f.debtDue = S.day + DAYS(7);
        gain(100);
        later(7, 'nanDue');
        quote(
          'Nan counts out 100 teeth with fingers like twigs. "A month, dear. After that it isn\'t me who comes. It\'s much worse than me."',
        );
        go('talk', 'nan');
      },
      'danger',
    ]);
  if (f.debt)
    o.push([
      `"Here's what I owe." (${f.debt} teeth)`,
      () => {
        if (pay(f.debt)) {
          f.debt = 0;
          bump('nan', 10);
          quote('Nan: "Paid in full. How disappointing. Come again."');
        }
        go('talk', 'nan');
      },
    ]);
  return {
    t: "Sweet Nan: a tiny old woman knitting something that might be a noose. She has your aunt's smile, if your aunt was a shark.",
    o,
  };
};
TALK.rook = () => {
  const o = [newsOpt('rook', "\"I watch the door. That's all I do. That's all I've ever done.\"")];
  if (knew('rook.secret') && !S.f.backDoor)
    o.push(
      chkOpt('rook.code', null, '"The silo\'s back door. Give me the code."', () => {
        if (attempt('rook.code')) {
          S.f.backDoor = 1;
          quote(
            'Rook is quiet a long time. Then he writes four numbers in the sand with his boot, and rubs them out. "Go through it for all of us."',
          );
        } else {
          bump('rook', -10);
          quote('Rook: "I don\'t know what you mean." He knows exactly what you mean.');
        }
        go('talk', 'rook');
      }),
    );
  return { t: 'Rook fills the casino door. He does not move out of it. He does not need to.', o };
};
// Bring the brothers together.
const _gusSE = TALK.gus;
TALK.gus = () => {
  const r = _gusSE();
  if (S.f.tamTold && !S.f.brothers && alive('tam'))
    r.o.push([
      '"Your brother Tam is alive. He fights at Snake Eyes."',
      () => {
        S.f.brothers = 1;
        S.f.gusCame = 1;
        S.n.gus.loc = 'snakeeyes';
        bump('gus', 40);
        addTitle('Bringer of Brothers');
        quote("Gus drops his pick. He doesn't pick it up. He just starts walking north.");
        goHere();
      },
    ]);
  return r;
};
// Tell Opal her sister is alive, and Opal buys her out.
const _opalSE = TALK.opal;
TALK.opal = () => {
  const r = _opalSE();
  if (knew('dice.secret') && !S.f.sisters && alive('dice') && S.n.dice.loc === 'snakeeyes')
    r.o.push([
      '"Marigold is alive. She deals cards at Snake Eyes."',
      () => {
        S.f.sisters = 1;
        S.n.dice.loc = 'rustwater';
        bump('opal', 40);
        bump('dice', 20);
        quote(
          "Opal doesn't say anything. She opens the safe, takes everything in it, and rides north. She comes back the next morning with Marigold. They do not speak. They live under the same roof.",
        );
        go('talk', 'opal');
      },
    ]);
  return r;
};
// Rook's code: the back door of Silo 9.
const _huboSiloSE = HUBO.silo;
HUBO.silo = () => {
  const o = _huboSiloSE();
  if (!S.f.siloIn && S.f.backDoor)
    o.unshift([
      "Round the back: Rook's code on the old door",
      () => {
        S.f.siloIn = 1;
        say('Four numbers. A hiss of air two hundred years old. Nobody is guarding a door nobody knows about.');
        goHere();
      },
    ]);
  return o;
};

// ---- debt ----
LATER.nanDue = () => {
  const f = S.f;
  if (!f.debt) return;
  f.debtSold = 1;
  f.debt = 0;
  f.collectors = alive('krug') && !f.chainfieldBurned ? 'krug' : 'pips';
  bad(
    f.collectors === 'krug'
      ? 'Your seven days are up. Sweet Nan sold your debt to Pips. Pips sold it to Krug. Slavers are looking for you.'
      : "Your seven days are up. Pips's housemen are looking for you.",
  );
};
const _hubSE = SC.hub;
SC.hub = loc => {
  if (S.f.collectors && loc !== 'well' && !S.crater[loc]) {
    const who = S.f.collectors;
    S.f.collectors = null;
    S.here = loc;
    bad(
      who === 'krug'
        ? 'Two slavers step out of the shade. "Krug bought your paper. You belong to him now."'
        : 'Pips\'s housemen. "Nothing personal. It\'s arithmetic."',
    );
    return fight(who === 'krug' ? [slv(), slv()] : [spawn('houseman'), spawn('houseman')], {
      win: 'hub',
      args: [loc],
      back: ['map'],
    });
  }
  return _hubSE(loc);
};

// ---- plots at Snake Eyes ----
// Fight night, day 14: Big Tam against the King's champion, to the death for once.
// A fix with Pips beats everything, unless you warned Tam after you sold it (scenes/jobs.js).
const tamWins = () =>
  (!S.f.tamFixed || !!S.f.tamWarned) && !!(S.f.gusCame || S.f.incisorDrugged || S.f.tamFights || S.f.tamWarned);
PLOTS.fightnight = {
  where: 'snakeeyes',
  day: () => DAYS(14),
  live: () => alive('tam') && S.n.tam.loc === 'snakeeyes' && !S.f.tamSub,
  known: () => plotKnown('fightnight'),
  clue: { pips: 1, rook: 1, nan: 1 },
  clueLine:
    '"Fight night on the fourteenth. Big Tam against the Incisor, the King\'s champion. To the death, for once. Pips is selling tickets."',
  sign: {
    where: 'snakeeyes',
    t: 'A poster on the pit rail: FIGHT NIGHT, DAY 14. BIG TAM vs THE INCISOR. TO THE DEATH, FOR ONCE.',
  },
  after: {
    snakeeyes: () =>
      S.f.tamWon
        ? "The Incisor's helmet hangs over the bar. Big Tam drinks under it, quietly."
        : 'The pit sand is raked smooth, except one dark patch nobody rakes.',
  },
  hit: seen => {
    if (tamWins()) {
      S.f.tamWon = 1;
      if (seen)
        say(
          S.f.gusCame
            ? "Fight night. Gus is at the rail, screaming his brother's name. Big Tam hears it and breaks the Incisor in half."
            : 'Fight night. The Incisor is sick in the sand before the bell. Big Tam wins in a minute.',
        );
      if (S.f.betTam) {
        gain(S.f.betTam * 3);
        if (seen) say(`Your ticket on Tam pays ${S.f.betTam * 3} teeth.`);
        else rx('pips', `"Your ticket on Tam came in. ${S.f.betTam * 3} teeth. Don't spend it all here. Do."`);
      }
    } else offstage('tam', 'Fight night. The Incisor killed Big Tam in the sand, slowly, for the crowd.', seen);
  },
  opts: {
    pips: () =>
      !S.f.betTam && S.teeth >= 50
        ? [
            '"Fifty on Big Tam for fight night."',
            () => {
              S.teeth -= 50;
              S.f.betTam = 50;
              quote('Pips writes you a ticket. "Three to one. Sentimental money. My favourite kind."');
              go('talk', 'pips');
            },
          ]
        : null,
    tam: () =>
      S.day < DAYS(14)
        ? [
            '"Let me fight the Incisor in your place." (until day 14)',
            () => {
              S.f.tamSub = 1;
              if (!waitFor(DAYS(14))) return go('ending');
              say('Fight night. The crowd wanted Tam. They get you. The Incisor does not care who it kills.');
              fight([mkE('The Incisor', '🦷', 7, { wep: 'sledge', arm: 'plate', teeth: 0 })], {
                close: true,
                started: true,
                win: 'incisor',
                back: null,
              });
            },
            'danger',
          ]
        : null,
  },
  hub: {
    snakeeyes: () =>
      S.day < DAYS(14)
        ? chkOpt('incisor.drug', null, "Slip a dead mole-rat into the Incisor's water bucket", () => {
            if (attempt('incisor.drug')) {
              S.f.incisorDrugged = 1;
              say('Plop. By fight night his stomach will be fighting him harder than Tam.');
            } else {
              bump('pips', -20);
              bad('A houseman sees you. You talk your way out of a beating, not out of the bucket.');
            }
            goHere();
          })
        : null,
  },
};
WIN.incisor = () => {
  S.f.plot_fightnight = 'stopped';
  S.f.incisorBeat = 1;
  gain(250);
  addTitle('Killer of the Incisor');
  bump('tam', 40);
  rx('tam', '"You took my fight. You took my death, too. I owe you everything."');
  say('The Incisor goes down and stays down. Pips pays you 250 teeth through gritted teeth.');
  go('hub', 'snakeeyes');
};
// Marigold's escape, day 20: Dice robs the vault and runs, with you or without you.
PLOTS.vault = {
  where: 'snakeeyes',
  day: () => S.f.vaultDay || DAYS(20), // sooner if you cost Dice her savings
  live: () => alive('dice') && alive('pips') && S.n.dice.loc === 'snakeeyes',
  known: () => plotKnown('vault'),
  clue: { rook: 1, teo: 1 },
  clueLine: '"Dice has been asking about the vault rota. Very casually. Twice."',
  sign: {
    where: 'snakeeyes',
    t: 'Dice, on her break, sketching the vault door on a napkin. She burns the napkin when she sees you looking.',
  },
  after: {
    snakeeyes: "A new dealer sits in Dice's chair. He is bad at it. Pips watches him the way he never watched her.",
  },
  hit: seen =>
    offstage(
      'dice',
      alive('krug')
        ? 'Dice tried the vault alone. Rook caught her. Pips sold her to Krug the same night.'
        : 'Dice tried the vault alone. Rook caught her. Pips sold her east the same night.',
      seen,
    ),
  opts: {
    dice: () =>
      chkOpt('vault.rob', null, '"I\'ll help you with the vault."', () => {
        if (attempt('vault.rob')) {
          stopPlot('vault');
          S.f.vaultRobbed = 1;
          S.n.dice.loc = 'east';
          gain(200);
          bump('pips', -60);
          event('stole', 'pips', { wit: [] });
          quote(
            'In and out, in the dark. Half the King\'s money in two sacks. Dice kisses your cheek, takes her half, and is gone east by dawn. "Don\'t tell Opal. Or do."',
          );
          return goHere();
        }
        S.f.plot_vault = 'done';
        PLOTS.vault.hit(true);
        bad('An alarm older than the bombs. Rook is in the doorway.');
        fight([foe('rook'), spawn('houseman')], { started: true, win: 'back', back: ['map'] });
      }),
    pips: () => [
      '"Dice is planning to rob your vault."',
      () => {
        stopPlot('vault');
        S.f.diceSold = 1;
        karma(-3);
        gain(100);
        bump('pips', 30);
        offstage('dice', 'Pips thanks you with 100 teeth, and sells Dice before sundown.', true);
        go('talk', 'pips');
      },
      'danger',
    ],
    rook: () =>
      !S.f.rookLooks
        ? [
            '"When Dice runs, look the other way."',
            () => {
              S.f.rookLooks = 1;
              quote(
                'Rook watches the door for a long time. "...I\'ve been looking at this door for six years. I could stand to look at something else."',
              );
              go('talk', 'rook');
            },
          ]
        : null,
  },
};

// ---- ripples ----
Object.assign(RIPPLE, {
  pips: () => {
    if (alive('rook')) S.f.honestDice = 1;
    rx('rook', '"Pips is dead. The house is mine. The dice are honest now. Mostly."');
    rx('dice', '"Pips is dead. Nobody owns my debt. Nobody owns me."');
    rx('nan', '"No Pips? Who will buy my bad debts now? I\'ll have to be kind. Ugh."');
    rx('king', '"Somebody killed my banker. I will need a new banker. And a new somebody."');
  },
  nan: () => {
    if (S.f.debt) S.f.debt = 0;
    rx('elder', '"The Toaster has stopped providing. Forty years, every month, and now nothing. I don\'t understand."');
    rx('crumb', '"No more envelopes for Ma. I can\'t tell her. I can\'t not tell her."');
    rx('moe', '"Nan\'s dead? There goes my ten percent."');
  },
  tam: () => {
    rx(
      'gus',
      S.f.tamTold || S.f.brothers
        ? '"I had him back. For a little while. I had my brother back."'
        : '"Funny. I dreamt about my brother last night. First time in years."',
    );
    rx('rook', '"Tam\'s gone. Best fighter in the valley. He lost on purpose all those years. Not the last time."');
    rx('pips', '"Big Tam. Nine years. A tremendous investment."');
  },
  dice: () => {
    rx('teo', '"No card this month. I keep checking under my blanket."');
    rx('rook', '"Dice is gone. I watch the door. There is nothing to watch for now."');
    if (knew('dice.secret'))
      rx('opal', '"They say a dealer died at Snake Eyes. I don\'t know why I can\'t stop crying."');
  },
  rook: () => {
    rx('crumb', '"Rook is gone. Now there is only me who remembers that door. I will pray twice."');
    rx('dice', '"Rook\'s dead. Nobody watches the door now. Nobody watches me."');
  },
});

// ---- ending slides ----
function snakeLines() {
  const f = S.f,
    L = [];
  if (f.brothers && alive('tam') && alive('gus'))
    L.push(
      'Gus and Big Tam went back to Scrapwell together. They dig side by side and never talk about the silo. They never stop talking about everything else.',
    );
  else if (f.incisorBeat)
    L.push(
      "Snake Eyes still tells the story of the night a nobody stepped into the sand in Big Tam's place, and walked out.",
    );
  else if (f.tamWon)
    L.push('Big Tam beat the Incisor and never fought again. He sweeps the pit now. He likes the quiet.');
  if (f.sisters && alive('dice') && alive('opal'))
    L.push(
      'Opal and Marigold lived under one roof for the rest of their lives. One night, years later, Marigold sang. Opal cried until morning.',
    );
  else if (f.vaultRobbed)
    L.push(
      "Dice went east with half the Dentist King's money. Somewhere out there is a very rich woman who counts everything.",
    );
  else if (f.diceSold) L.push('You sold Dice for 100 teeth. Nobody at Snake Eyes ever says her name in front of you.');
  if (f.debtSold)
    L.push("You borrowed from Sweet Nan and didn't pay. In the valley, that is how most stories about Krug begin.");
  if ((f.pitRung || 0) >= 4)
    L.push('Champion of the Pit. Your name is scratched into the rail at Snake Eyes, under nine years of Big Tam.');
  if ((f.houseUp || 0) >= HOUSE_LIMIT)
    L.push(
      'You beat the house at Snake Eyes so badly they closed the tables to you. Pips kept your portrait behind the bar, as a warning.',
    );
  if (f.backDoor) L.push("Rook's code still opens the back door of Silo 9. Some secrets are worth more than teeth.");
  return L;
}
