'use strict';
// ================= THE WEB: certain people, tied to certain people =================
// Not everyone knows everyone. The bonds in data/cast.js say who is tied to whom, and what you do to
// one person lands on the people tied to them:
// 1. Secrets come out naturally. Someone who knows a secret tells you, unprompted, once they trust you.
// 2. Plots run on their own clocks. Each leaves signs you can stumble on if you're in the right place.
//    You only hear how a plot ended if you knew about it or were there. Otherwise you find the aftermath.
// 3. Every plot can be changed three or more ways.
// 4. Ripples: when someone dies, the lives of the people tied to them change. Prices, homes, jobs, moods.
const trusts = a => S.n[a].op >= 25 || (S.n[a].ch || 0) >= 3;
const bump = (id, n) => {
  if (S.n[id]) S.n[id].op = clamp(S.n[id].op + n, -100, 100);
};
const rx = (id, line) => {
  if (alive(id)) S.n[id].rx.push(line);
};

// ---- 1. secrets ----
function spillSecret(id) {
  if (!trusts(id) || S.f.spillDay === S.day) return;
  const owner = Object.keys(SECRETS).find(
    x => x !== id && alive(x) && SECRETS[x].tell.includes(id) && !knew(x + '.secret'),
  );
  if (!owner) return;
  S.f.spillDay = S.day; // one secret a day, so they come out over time
  know(owner + '.secret');
  say(`${NPC[id].n} leans in. ${SECRETS[owner].t}`);
}
// A finished job earns trust: they tell you their own secret themselves, no gossip needed.
function confide(id, n) {
  bump(id, n == null ? 20 : n);
  if (!alive(id) || !SECRETS[id] || knew(id + '.secret')) return;
  know(id + '.secret');
  say(`${NPC[id].n} trusts you now, and tells you the thing nobody says. ${SECRETS[id].t}`);
}
SC.secret = id => {
  const d = NPC[id],
    sc = SECRETS[id],
    pay = sc.pay;
  show({
    title: d.n,
    icon: d.i,
    text: `You tell ${d.n} what you know. ${sc.t}\n\n${d.n} goes very still.`,
    opts: [
      [
        `"Keep it quiet? That'll cost you." (${pay} teeth)`,
        () => {
          S.f['sec_' + id] = 'squeezed';
          gain(pay);
          karma(-1);
          bump(id, -40);
          count('squeezed');
          quote(`${d.n}: "Take it. And if you ever say a word, I'll know where you sleep."`);
          go('talk', id);
        },
        'danger',
      ],
      [
        '"It\'s safe with me."',
        () => {
          S.f['sec_' + id] = 'kept';
          bump(id, 20);
          quote(`${d.n} lets out a breath. "...Thank you. I mean it."`);
          go('talk', id);
        },
      ],
      ['Back', () => go('talk', id)],
    ],
  });
};
// "Any news?" with nothing new: they talk about someone they're tied to.
const _newsWeb = news;
news = (id, dflt) => {
  const own = BONDS.filter(b => (b[0] === id && alive(b[1])) || (b[1] === id && alive(b[0])))
    .map(b => (b[0] === id ? b[3] : b[4]))
    .filter(l => l[0] === '"');
  return _newsWeb(id, own.length ? own[S.day % own.length] : dflt);
};

// ---- 2 and 3. plots ----
function offstage(id, line, seen) {
  if (!alive(id)) return;
  S.dead[id] = 1;
  delete S.lovers[id];
  if (S.spouse === id) S.spouse = null;
  if (seen) bad(line);
}
const plotKnown = k => knew('plot.' + k);
const plotOpen = k => !S.f['plot_' + k] && PLOTS[k].live();
const stopPlot = k => (S.f['plot_' + k] = 'stopped');
// Skip ahead to a plot's night, so you can be there when it happens.
function waitFor(day) {
  while (S.day < day && !S.end) tick();
  return !S.end;
}
const PLOTS = {
  // Lou wants Bacon Prime. Junior goes over the fence on day 9.
  pork: {
    where: 'scrapwell',
    day: () => 9,
    live: () => alive('pig') && alive('lou') && !S.f.styWatch,
    known: () => plotKnown('pork'),
    clue: { lou: 1, junior: 1, hector: 1 },
    clueLine: '"Thursday is pork at the diner, they say. Pedigree pork. You know whose pig is pedigree."',
    sign: {
      where: 'diner',
      t: 'Lou writes PEDIGREE PORK on the specials board, admires it, then rubs it out. "Not yet, sweetie."',
    },
    after: {
      scrapwell: "Pell's sty is empty. Pell is sitting in it.",
      diner: 'The board says PEDIGREE PORK. Lou winks at nobody in particular.',
    },
    hit: seen => {
      offstage('pig', 'Bacon Prime is gone. Junior came over the fence with a sack, and nobody stopped him.', seen);
      rx('pell', '"They took him. They TOOK him. Somebody knew, and said nothing."');
      S.f.porkDone = 1;
    },
    opts: {
      pell: () => [
        '"Lou\'s coming for Bacon Prime. Soon."',
        () => {
          stopPlot('pork');
          bump('pell', 30);
          quote(
            'Pell loads his shotgun and moves his chair into the sty. "Let her come." Bacon Prime is safe, and very confused.',
          );
          go('talk', 'pell');
        },
      ],
      lou: () => [
        '"You want Bacon Prime? I can get him for you."',
        () => {
          know('plot.pork');
          quote(
            'Lou: "In a sack, sweetie, alive. Forty teeth. Pell sleeps like a log, the pig doesn\'t." (Steal him, then sell him here.)',
          );
          go('talk', 'lou');
        },
      ],
    },
    hub: {
      scrapwell: () =>
        S.day < 9 && alive('junior')
          ? [
              'Sit up by the sty and wait for whoever comes (until day 9)',
              () => {
                S.f.styWatch = 1;
                if (waitFor(9)) go('sty');
                else go('ending');
              },
            ]
          : null,
    },
  },
  // Doc is poisoning the Mayor, a little every day, for the pump.
  poison: {
    where: 'rustwater',
    day: () => S.f.poisonDay || 10,
    live: () => alive('doc') && alive('mayor'),
    known: () => knew('doc.secret') || plotKnown('poison'),
    clue: { gloria: 1, opal: 1 },
    clueLine: '"Fenwick looks greener every week. Doc says it\'s his heart. Doc smiles when he says it."',
    sign: {
      where: 'rustwater',
      t: "Through Doc Ratchet's window: he measures drops into a teacup with FENWICK painted on it. He's humming.",
    },
    after: { rustwater: "Black bunting on the pump. Doc Ratchet is wearing the Mayor's hat." },
    hit: seen => {
      offstage(
        'mayor',
        'Mayor Fenwick died in his sleep. Doc Ratchet signed the certificate, then took the keys to the pump.',
        seen,
      );
      S.f.docPump = 1;
    },
    opts: {
      mayor: () => [
        '"Stop drinking the Doc\'s tea. It\'s poison."',
        () => {
          stopPlot('poison');
          bump('mayor', 30);
          bump('doc', -50);
          rx('doc', '"You told him. Of course you told him. I\'ll remember that, next time you\'re bleeding."');
          gain(60);
          quote(
            'Fenwick pours the tea into a plant. The plant dies by morning. He slides you 60 teeth. "We never had this talk."',
          );
          go('talk', 'mayor');
        },
      ],
      doc: () =>
        S.f.poisonHelped
          ? null
          : [
              '"Need a hand with the Mayor\'s tea?"',
              () => {
                S.f.poisonHelped = 1;
                S.f.poisonDay = S.day + 1;
                know('plot.poison');
                karma(-2);
                gain(80);
                bump('doc', 30);
                quote(
                  'Doc gives you a vial and 80 teeth. "Double dose. He likes it sweet." Fenwick will not see the day after tomorrow.',
                );
                go('talk', 'doc');
              },
              'danger',
            ],
      doc2: () =>
        chkOpt('doc.vial', null, "Swap the vial on Doc's shelf for plain water", () => {
          if (attempt('doc.vial')) {
            stopPlot('poison');
            S.f.vialSwapped = 1;
            say(
              "Water in, poison out. Doc doesn't notice. Fenwick will feel better and never know why. Neither will Doc.",
            );
          } else {
            bump('doc', -40);
            bad('Doc catches your wrist. "Medicine is for doctors."');
          }
          go('talk', 'doc');
        }),
      sheriff: () => [
        '"Doc Ratchet is poisoning the Mayor. Look in his teacup."',
        () => {
          stopPlot('poison');
          karma(1);
          bump('sheriff', 10);
          bump('mayor', 20);
          S.f.docHanged = 1;
          offstage(
            'doc',
            'Crane finds the vial. Doc Ratchet hangs from the pump at sundown. Rustwater has no healer now.',
            true,
          );
          go('talk', 'sheriff');
        },
      ],
    },
  },
  // Krug wants Jeb's road east. His men hit the caravan on day 11, the day before the Molars come.
  route: {
    where: 'rustwater',
    day: () => 11,
    live: () => alive('krug') && alive('jeb') && S.n.jeb.loc !== 'party' && !S.f.rideGuard,
    known: () => plotKnown('route'),
    clue: { moe: 1, teo: 1, pete: 1 },
    clueLine: '"Krug\'s men were in, asking when Jeb leaves and which road. Asking nice. That\'s never good."',
    sign: {
      where: 'rustwater',
      t: "Two of Krug's men at Moe's bar, buying drinks for anyone who knows when Jeb's caravan leaves.",
    },
    after: { rustwater: "Jeb's wagons are back, burnt down one side. The lizards won't look at anyone." },
    hit: seen => {
      if (S.f.routeSold)
        offstage(
          'jeb',
          "Krug's men hit Jeb's caravan on the east road. Jeb didn't make it. They knew exactly where he'd be.",
          seen,
        );
      else {
        if (seen) bad("Krug's men hit Jeb's caravan on the east road. Jeb lived. His prices won't.");
        S.f.jebUp = (S.f.jebUp || 0) + 3;
        if (alive('pete') && S.n.pete.loc === 'rustwater')
          offstage('pete', "Pete died guarding the lizards. He didn't run. Not this time.", seen);
      }
      S.f.routeHit = 1;
    },
    opts: {
      jeb: () => [
        '"Krug\'s men are coming for your caravan."',
        () => {
          stopPlot('route');
          bump('jeb', 30);
          S.f.jebCheap = 1;
          quote(
            'Jeb goes pale, then practical. He changes the road and doubles the guards. "You ride half price, forever. Don\'t argue."',
          );
          go('talk', 'jeb');
        },
      ],
      jeb2: () =>
        S.day < 11
          ? [
              '"I\'ll ride guard when they come." (until day 11)',
              () => {
                S.f.rideGuard = 1;
                if (!waitFor(11)) return go('ending');
                say("Night on the east road. Jeb's lanterns, then other lanterns. Krug's men.");
                fight([spawn('slaver'), spawn('slaver'), spawn('tracker')], {
                  allies: ['jeb', 'pete'],
                  win: 'guarded',
                  back: ['map'],
                });
              },
              'danger',
            ]
          : null,
      krug: () =>
        S.f.routeSold
          ? null
          : [
              '"I know which road Jeb takes. For a price."',
              () => {
                S.f.routeSold = 1;
                karma(-3);
                gain(80);
                bump('krug', 25);
                quote('Krug writes it down, neatly. "A pleasure doing business." 80 teeth.');
                go('talk', 'krug');
              },
              'danger',
            ],
      sheriff: () => [
        '"Krug\'s men are going to hit Jeb\'s caravan."',
        () => {
          stopPlot('route');
          bump('sheriff', 10);
          bump('jeb', 15);
          quote('Crane: "Not on my road." Deputies ride with the caravan. Krug\'s men take one look and go home.');
          go('talk', 'sheriff');
        },
      ],
    },
  },
  // Gloria has been skimming. Opal counts properly on day 16.
  skim: {
    where: 'rustwater',
    day: () => 16,
    live: () => alive('gloria') && alive('opal') && S.n.gloria.loc === 'rustwater',
    known: () => knew('gloria.secret') || plotKnown('skim'),
    clue: { jeb: 1, moe: 1 },
    clueLine: '"Opal\'s been up nights with the ledger. Somebody\'s fingers are in the till, and Opal can count."',
    sign: {
      where: 'rustwater',
      t: "Lamplight in the Velvet Rad's back room, late. Opal, a ledger, and a very quiet face.",
    },
    after: { rustwater: "Gloria is sitting on the steps behind Moe's bar with everything she owns in a pillowcase." },
    hit: seen => {
      S.f.gloriaOut = 1;
      bump('gloria', -10);
      if (seen) bad("Opal counted the takings. Gloria is sleeping behind Moe's bar now.");
    },
    opts: {
      gloria: () => [
        '"Opal\'s going to count the takings. Go, while you can."',
        () => {
          stopPlot('skim');
          bump('gloria', 40);
          gain(40);
          if (alive('jeb')) {
            S.f.gloriaEast = 1;
            S.n.gloria.loc = 'east';
            quote(
              'Gloria kisses your cheek and presses 40 teeth into your hand. "Jeb leaves tonight. He just doesn\'t know I\'m coming." She goes east.',
            );
            return goHere();
          }
          quote(
            'Gloria presses 40 teeth into your hand. "I\'ll put it all back. Most of it." She starts counting, very fast.',
          );
          go('talk', 'gloria');
        },
      ],
      gloria2: () => [
        '"I\'ll cover what you took." (150 teeth)',
        () => {
          if (pay(150)) {
            stopPlot('skim');
            S.f.skimPaid = 1;
            bump('gloria', 40);
            bump('opal', 20);
            quote(
              'Gloria stares at the teeth, then at you. "Nobody\'s ever paid MY debts." The till balances. Opal never knows. Gloria always will.',
            );
          }
          go('talk', 'gloria');
        },
      ],
      opal: () => [
        '"Gloria\'s been skimming you. For years."',
        () => {
          stopPlot('skim');
          S.f.gloriaOut = 1;
          bump('opal', 30);
          S.n.gloria.op = -80;
          quote(
            'Opal closes her eyes. "I knew. I didn\'t want to know." Gloria is out on the street by sundown, and she knows who told.',
          );
          go('talk', 'opal');
        },
        'danger',
      ],
    },
  },
  // Junior grows cabbages in secret. Lou finds them on day 18.
  cabbage: {
    where: 'diner',
    day: () => 18,
    live: () => alive('junior') && alive('lou') && S.n.junior.loc === 'diner',
    known: () => knew('junior.secret') || plotKnown('cabbage'),
    clue: { crumb: 1, bess: 1 },
    clueLine: '"Junior\'s growing something behind the diner. Green. Lou\'s going to find it one of these days."',
    sign: {
      where: 'diner',
      t: 'Behind the diner, under a tarp, a neat row of cabbages. Someone loves them very much.',
    },
    after: { diner: 'The ground behind the diner is white with salt.' },
    hit: seen => {
      S.f.cabbageSalted = 1;
      if (seen)
        bad(
          "Lou found the cabbages. She salted the earth behind the kitchen. Junior hasn't said a word since. Not even 'Mama'.",
        );
    },
    opts: {
      junior: () =>
        chkOpt('junior.leave', null, '"You could cook your cabbages in Rustwater. Your own place."', () => {
          if (attempt('junior.leave')) {
            stopPlot('cabbage');
            S.f.juniorFree = 1;
            S.n.junior.loc = 'rustwater';
            bump('junior', 40);
            bump('lou', -40);
            rx('lou', '"You took my boy. My BOY. For CABBAGES."');
            quote(
              'Junior puts down the cleaver. He picks up a very small spade. "...Yes." It is the longest speech of his life. He walks to Rustwater.',
            );
            return goHere();
          }
          quote('Junior looks at the kitchen door. He looks at the cleaver. "...Mama needs me." He keeps chopping.');
          go('talk', 'junior');
        }),
      lou: () =>
        chkOpt('lou.cabbage', null, '"Junior grows cabbages. He wants to cook them. Let him."', () => {
          if (attempt('lou.cabbage')) {
            stopPlot('cabbage');
            S.f.louCabbage = 1;
            bump('junior', 30);
            quote(
              'Lou goes quiet for a long time. "Vegetables. In MY kitchen." She sighs. "...Tuesdays. Only Tuesdays." Junior cries into the stockpot.',
            );
          } else {
            S.f.plot_cabbage = 'done';
            PLOTS.cabbage.hit(true);
            bump('junior', -50);
          }
          go('talk', 'lou');
        }),
    },
    hub: {
      diner: () =>
        chkOpt('diner.hide', null, 'Move the cabbages somewhere Lou never goes', () => {
          if (attempt('diner.hide')) {
            stopPlot('cabbage');
            S.f.cabbageHidden = 1;
            bump('junior', 30);
            rx('junior', '"...Thank you." He pats your shoulder. It hurts.');
            say(
              'You dig them up by moonlight and replant them behind the outhouse. Nobody, not even Lou, goes behind the outhouse.',
            );
          } else {
            bump('lou', -20);
            S.f.plot_cabbage = 'done';
            PLOTS.cabbage.hit(true);
          }
          goHere();
        }),
    },
  },
};
// The night at the sty.
SC.sty = () => {
  if (!alive('junior') || !alive('pig')) {
    S.f.plot_pork = 'void';
    say('You sit up all night. Nobody comes. The pig snores.');
    return goHere();
  }
  show({
    title: 'The sty, night',
    icon: '🐖',
    text: 'Past midnight, a shape the size of a wardrobe climbs the fence. Junior, with a sack. He sees you. He stops.',
    opts: [
      chkOpt('sty.scare', null, '"Go home, Junior. Tell her the pig wasn\'t here."', () => {
        if (attempt('sty.scare')) {
          S.f.plot_pork = 'stopped';
          bump('junior', 10);
          bump('pell', 20);
          rx('lou', '"Junior came home with an empty sack. Says a ghost talked to him. Was it you, sweetie?"');
          quote('Junior looks at the pig. He looks at you. "...Sorry." He climbs back over the fence.');
          return goHere();
        }
        S.f.plot_pork = 'done';
        PLOTS.pork.hit(true);
        goHere();
      }),
      [
        'Fight him for the pig',
        () => {
          S.f.plot_pork = 'stopped';
          bump('pell', 30);
          fight([foe('junior')], { started: true, win: 'back', back: ['map'] });
        },
        'danger',
      ],
      [
        'Let him take it',
        () => {
          S.f.plot_pork = 'done';
          PLOTS.pork.hit(true);
          goHere();
        },
      ],
    ].filter(Boolean),
  });
};
WIN.guarded = () => {
  stopPlot('route');
  bump('jeb', 40);
  S.f.jebCheap = 1;
  quote('Jeb: "Half price, forever. And you can keep whatever they were carrying."');
  go('hub', 'rustwater');
};
function runPlots() {
  for (const k in PLOTS) {
    const P = PLOTS[k];
    if (S.f['plot_' + k] || S.day < P.day()) continue;
    S.f['plot_' + k] = P.live() ? 'done' : 'void';
    if (S.f['plot_' + k] === 'done') P.hit(plotKnown(k) || S.here === P.where);
  }
}

// ---- 4. ripples: a death changes the lives tied to it ----
const RIPPLE = {
  krug: () => {
    if (alive('mayor') && !S.f.pumpOpen) S.f.waterUp = (S.f.waterUp || 0) + 10;
    rx('mayor', '"Krug is dead. Who is going to work the pump at night now? Water is going up. Blame the dead."');
    rx('moe', '"Krug\'s dead? Then I don\'t owe him. My knees thank you."');
    bump('moe', 10);
    rx('lou', '"Krug\'s gone. No more returns. Stew\'s going to be thin for a while, sweetie."');
    rx('opal', '"I slept last night. All night. First time in nine years."');
    rx('elder', '"Krug is dead? Good. Now I can stop sleeping with the ladle."');
  },
  doc: () => {
    rx('sheriff', '"Ratchet\'s gone. Next time I shoot someone, they stay shot."');
    rx('moe', '"No Doc. No hangover cure. I might have to stop selling the beer. Kidding."');
    rx('crumb', '"The powder man is gone. I will pray for him. Briefly."');
    rx('mayor', '"Who will do my drops now? My heart has never felt better, oddly."');
  },
  mayor: () => {
    if (!S.f.docPump && alive('sheriff')) {
      S.f.pumpOpen = 1;
      rx('sheriff', '"Fenwick\'s dead. I broke the lock on the pump myself. Water\'s free. Nobody argued."');
    }
    rx('moe', '"No Fenwick. No water bill. No protection either. Strange times."');
    rx('hector', "\"Fenwick's dead? My corn drinks for free now. I'll drink to that, if it's free.\"");
    bump('hector', 10);
    rx('elder', '"The Fenwick boy is dead? I outlived him. I outlive everyone."');
  },
  jeb: () => {
    if (alive('pete') && S.n.pete.loc === 'rustwater') {
      S.n.pete.loc = 'gone';
      S.f.peteLeft = 1;
    }
    rx('gloria', "\"Jeb's gone. So's the green. So's my ride out.\"");
    rx('hector', '"Jeb\'s dead. Who am I going to water lizards for?"');
    rx('moe', '"Nobody tips now. Nobody."');
  },
  elder: () => {
    rx('nigel', '"No soup. No soup down well. Nigel hungry. Nigel sad."');
    rx('gus', '"Ma\'s gone. I went to the bar. I didn\'t stop."');
    rx('crumb', '"Ma Thistle is with the Great Toaster now. Scrapwell is not ready."');
  },
  lou: () => {
    if (alive('junior') && S.n.junior.loc === 'diner') {
      S.n.junior.loc = 'rustwater';
      S.f.juniorFree = 1;
    }
    rx('junior', '"...Mama." He has a very small spade. He doesn\'t know what else to hold.');
    rx('pete', '"She\'s dead? Lou\'s dead? I can sleep. I can actually sleep."');
    rx('doc', '"No more... spare parts. My prices are going up."');
    rx('krug', '"Lou\'s dead. Where do I send the returns now?"');
  },
  sheriff: () => {
    if (alive('mayor') && !S.f.pumpOpen) S.f.waterUp = (S.f.waterUp || 0) + 5;
    rx('pete', '"She said I could be a deputy one day. Now there\'s no one to be a deputy for."');
    rx('lou', '"The Sheriff\'s dead? Stew for everyone, sweetie."');
    rx('moe', '"Crane\'s gone. Who\'s going to keep the drunks honest? Me? Ha."');
    rx('mayor', '"A terrible loss. Water is going up, out of respect."');
  },
  opal: () => {
    if (alive('gloria') && S.n.gloria.loc === 'rustwater') S.f.gloriaRad = 1;
    rx('gloria', "\"Opal's gone. The Rad's mine now. I never wanted it. I'll run it better than she did.\"");
    rx('teo', '"No more food from Opal. I\'ll tell the others. I don\'t know how."');
    rx('krug', '"Opal is dead? Shame. I liked being hated."');
  },
  hector: () => {
    if (alive('bess')) S.f.jebUp = (S.f.jebUp || 0) + 2;
    rx('bess', '"Pa\'s dead. The farm\'s mine. So is everything on the farm road."');
    rx('bert', '"Pa would want me to keep the tractor running. I don\'t know how without him."');
    rx('jeb', '"Hector\'s gone. The farm road\'s worse now. A lot worse."');
    rx('pell', '"Hector. He was a good coward. They don\'t make them like that any more."');
  },
  bess: () => {
    rx('jeb', '"The polite raiders stopped coming. Funny, that."');
    rx('gus', '"Bess. We were going to get married. She said I smelled. She was right."');
    rx('junior', 'Junior leaves a dead flower on the farm fence. Then another.');
  },
  moe: () => {
    rx('gus', '"Moe\'s dead. So\'s my tab. I feel terrible. I feel great. I feel terrible."');
    bump('gus', 5);
    rx('krug', '"Moe\'s gone. Who\'s going to tell me who comes to town now?"');
    rx('gloria', '"No more cards with Moe. He cheated so badly. I miss it."');
  },
  pell: () => rx('elder', '"Pell asked me to marry him once. I should have said yes. No. I shouldn\'t."'),
  gus: () => {
    rx('elder', '"Gus. A good boy. Fifty-three. He turned up when the roof fell in. Who turns up now?"');
    rx('bess', '"Gus is dead? He was sweet. He smelled like a mine."');
  },
  teo: () => {
    rx('opal', '"Teo is gone. He was the last one who saw her. Now nobody has."');
    rx('krug', '"Who is going to count now?"');
  },
  nigel: () => {
    rx('elder', '"Nigel. He glowed so nicely at night. The well is dark now."');
    rx('bert', '"Nigel won\'t hear the tractor facts any more. I\'ll keep saying them. Down the well. In case."');
  },
  crumb: () => {
    rx(
      'junior',
      'Junior sits at the back of the empty chapel for a long time. Nobody is weeping at the toast but him.',
    );
    rx('elder', '"Crumb\'s dead. Somebody has to keep the toaster company. Not me."');
  },
  junior: () => {
    rx('crumb', '"Junior never missed a service. He never said a word in one. I will miss both."');
    rx('bess', '"Junior. He left flowers. Dead ones. It was the thought."');
  },
  gloria: () => {
    rx('opal', '"Gloria. Best earner I had. Worst liar I ever met."');
    rx('jeb', '"Gloria wanted to see the green. I should have taken her."');
  },
  pete: () => {
    rx('jeb', '"Pete. The best guard I had. Not the best guard. The best I had."');
    rx('sheriff', '"Pete never got to be a deputy. I should have just given him the badge."');
  },
  bert: () => rx('nigel', '"Tractor man not come Sunday. Tractor man not come any Sunday."'),
};
function runRipples() {
  for (const id of IDS)
    if (!alive(id) && !S.f['rip_' + id]) {
      S.f['rip_' + id] = 1;
      if (RIPPLE[id]) RIPPLE[id]();
    }
}
const _reactWeb = reactions;
reactions = function () {
  _reactWeb();
  if (S.end) return;
  runPlots();
  runRipples();
};
// Water follows the town: Krug's night shift, the Sheriff, the Doc running the pump.
// The Green's seeds move it too: Hector's farm catches its own dew (cheaper), Fenwick waters his carrots first (dearer).
const waterCost = () =>
  10 + (S.f.waterUp || 0) + (S.f.docPump ? 5 : 0) + (S.f.mayorVeg ? 5 : 0) - (S.f.harvest ? 3 : 0);

// ---- what you see in a place ----
// Signs of a plot coming, and the aftermath of one that happened. Every place calls these.
function plotText(loc) {
  let t = '';
  for (const k in PLOTS) {
    const P = PLOTS[k],
      st = S.f['plot_' + k];
    if (!st && P.sign && P.sign.where === loc && S.day >= P.day() - 4 && P.live()) {
      know('plot.' + k);
      t += '\n\n' + P.sign.t;
    }
    if (st === 'done' && P.after && P.after[loc]) {
      const a = typeof P.after[loc] === 'function' ? P.after[loc]() : P.after[loc];
      if (a) t += '\n\n' + a;
    }
  }
  return t;
}
function plotHub(loc) {
  const o = [];
  for (const k in PLOTS) {
    const P = PLOTS[k];
    if (P.hub && P.hub[loc] && plotOpen(k) && P.known()) o.push(P.hub[loc]());
  }
  return o;
}
const _hubtWeb = {};
for (const loc in HUBT) {
  _hubtWeb[loc] = HUBT[loc];
  HUBT[loc] = () => _hubtWeb[loc]() + plotText(loc);
}
const _huboWeb = {};
for (const loc in HUBO) {
  _huboWeb[loc] = HUBO[loc];
  HUBO[loc] = () => {
    const o = [..._huboWeb[loc](), ...plotHub(loc)];
    if (loc === 'rustwater' && S.f.juniorFree && alive('junior') && S.n.junior.loc === 'rustwater')
      o.push([
        S.f.juniorGrows || S.f.juniorVeg
          ? "Junior's Greens: tomato and bean soup (5 teeth, +25 HP)"
          : "Junior's Greens: cabbage soup (5 teeth, +15 HP)",
        () => {
          if (pay(5))
            say(
              S.f.juniorGrows || S.f.juniorVeg
                ? `+${heal(25)} HP. Tomatoes from the Green's seeds. Junior talks you through every one.`
                : `+${heal(15)} HP. Vegetables. Real ones. Junior watches you eat it and nearly smiles.`,
            );
          goHere();
        },
      ]);
    return o.filter(Boolean);
  };
}

// ---- what you can say to someone, given what you know ----
function webOpts(id) {
  if (NPC[id].animal) return [];
  spillSecret(id);
  const o = [];
  for (const k in PLOTS) {
    const P = PLOTS[k];
    if (P.clue && P.clue[id] && plotOpen(k) && !P.known() && S.day >= P.day() - 5 && S.n[id].op >= 0) {
      know('plot.' + k);
      quote(`${NPC[id].n}: ${P.clueLine}`);
    }
  }
  const sc = SECRETS[id];
  if (sc && sc.short && knew(id + '.secret') && !S.f['sec_' + id])
    o.push([`"I know ${sc.short}."`, () => go('secret', id)]);
  for (const k in PLOTS) {
    const P = PLOTS[k];
    if (!plotOpen(k) || !P.known()) continue;
    for (const who in P.opts) if (who.replace(/\d$/, '') === id) o.push(P.opts[who]());
  }
  return o.filter(Boolean);
}

// ---- ending slides ----
function webLines() {
  const f = S.f,
    L = [];
  if (f.plot_poison === 'done')
    L.push("Doc Ratchet runs the pump now. Water costs more. Nobody asks what was in Fenwick's tea.");
  else if (f.docHanged) L.push('Doc Ratchet hanged from the pump he wanted. Rustwater never found another healer.');
  else if (f.vialSwapped && alive('mayor'))
    L.push('Fenwick lived, and never knew why. Doc never knew why either. You did.');
  else if (f.plot_poison === 'stopped' && alive('mayor'))
    L.push('Fenwick lived. He never drank tea again, and never forgave Doc, or thanked you.');
  if (f.plot_pork === 'done')
    L.push('Pell never got another pig. He sits on the step where the sty was and talks to the air.');
  else if (f.plot_pork === 'stopped' && alive('pig'))
    L.push('Bacon Prime lived to a great age, guarded day and night by an old man with a shotgun.');
  if (f.plot_route === 'done')
    L.push(
      f.routeSold
        ? "Jeb's caravan never reached the mountains. Krug's chains use his road now. You sold it."
        : "Jeb's caravan limped on, poorer and angrier.",
    );
  else if (f.plot_route === 'stopped' && alive('jeb'))
    L.push('Jeb kept his road. He named a lizard after you. It bites.');
  if (f.gloriaEast && !f.gloriaGreen)
    L.push('Gloria went east with Jeb. Whether it was green, she never wrote to say.');
  else if (f.skimPaid && !f.gloriaGreen)
    L.push('Gloria never skimmed again. She kept one tooth from your 150 on a string around her neck.');
  else if (f.gloriaRad)
    L.push('Gloria runs the Velvet Rad now. She counts the takings twice, and laughs like a cement mixer.');
  else if (f.gloriaOut && alive('gloria'))
    L.push("Gloria sleeps behind Moe's bar and still laughs like a cement mixer. Quieter now.");
  if (f.juniorFree && alive('junior'))
    L.push(
      "Junior's Greens, Rustwater: the only vegetables in the valley. He talks to the customers now. Whole sentences.",
    );
  else if (f.louCabbage)
    L.push(
      "Mama Lou's serves cabbage on Tuesdays. Junior cooks it. It's the only meal there that's exactly what it says.",
    );
  else if (f.cabbageHidden)
    L.push('Behind the outhouse at the diner, the cabbages grow taller every year. Lou has never looked.');
  else if (f.cabbageSalted) L.push('Junior never spoke again. The earth behind the diner stayed white with salt.');
  if (f.peteLeft) L.push("With Jeb gone, Pete walked west with nothing but a guard's whistle. Nobody heard it again.");
  const sq = S.c.squeezed || 0,
    kept = IDS.filter(x => S.f['sec_' + x] === 'kept').length;
  if (sq)
    L.push(
      `You squeezed ${sq} ${sq === 1 ? 'person' : 'people'} with their own secrets. The valley remembers who knows what.`,
    );
  if (kept >= 3) L.push(`You kept ${kept} secrets you could have sold. A few people slept easier because of you.`);
  return L;
}
