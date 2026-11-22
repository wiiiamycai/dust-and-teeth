'use strict';
// ================= SECRETS YOU TELL: a secret is something you use on somebody else =================
// Will: "What is the point to these, when they tell you something but you just blackmail them. It should
// affect others instead and open up possibilities." So the main use of a secret is telling it to the person it
// matters to. Each telling is a line on the hearer's talk screen, there only once you know the secret, and it
// changes what somebody does. The squeeze-or-keep screen on the owner stays as it was.
// Every telling is gossip too: the owner hears, days later, that you were the one who talked.
ITEMS.ring = "Ma Thistle's wedding ring";
EV.spilled = { self: -40, family: -20, friend: -15, other: 0 };
RXG.spilled = {
  self: () => '"You told people. About me. I know it was you."',
  family: v => `"You went round telling everyone about ${v}. Family hears things."`,
  friend: v => `"You sold ${v}'s secret for a story. I'll keep mine to myself."`,
};
// The hearer knows at once. The owner only hears when the news reaches them.
function spill(owner, hearer) {
  const ev = event('spilled', null, { wit: [hearer] });
  ev.v = owner;
  S.f['told_' + owner] = (S.f['told_' + owner] || 0) + 1;
}
const home = (id, loc) => alive(id) && S.n[id].loc === (loc || NPC[id].home || NPC[id].loc);

// ---- Moe sells strangers to Krug ----
jobs('sheriff', () => {
  const f = S.f;
  return [
    knew('moe.secret') &&
      !f.moeShut &&
      alive('moe') && [
        '"Moe sells Krug a description of every stranger who drinks at his bar."',
        () => {
          f.moeShut = 1;
          spill('moe', 'sheriff');
          bump('sheriff', 10);
          bump('moe', -45); // Crane leans on him, and only one stranger asks questions in his bar
          event('helped', null, { wit: ['sheriff'] });
          says('sheriff', '"Ten teeth a head?" She checks her rifle. "I drink there." She goes over the road. The bar goes quiet.');
          go('talk', 'sheriff');
        },
      ],
  ];
});
jobs('moe', () => {
  const f = S.f;
  return [
    knew('moe.secret') &&
      alive('krug') &&
      !f.moeCover &&
      !f.moeShut &&
      S.teeth >= 30 && [
        '"Next time Krug asks, describe somebody else. Taller. Uglier." (30 teeth)',
        () => {
          pay(30);
          f.moeCover = 1;
          says('moe', '"Taller and uglier. Easy. You\'re most of the way there already."');
          go('talk', 'moe');
        },
      ],
    // Gus's pawn is still behind the bar.
    knew('gus.secret') &&
      !f.ringBought &&
      !has('ring') && [
        `"Ma Thistle's ring. Gus pawned it. What do you want for it?" (${cost(40, 'moe')} teeth)`,
        () => {
          if (pay(cost(40, 'moe'))) {
            f.ringBought = 1;
            give('ring');
            says('moe', 'Moe fishes it out of a jar of other people\'s rings. "Two years of drink, that. Gus still owes me the interest."');
          }
          go('talk', 'moe');
        },
      ],
  ];
});
// Moe can't sell what he never tells, or what he tells wrong: Krug's slavers stop finding you on the road.
const _pickEncSecrets = pickEnc;
pickEnc = dest => {
  const r = _pickEncSecrets(dest);
  return r === 'slavers' && (S.f.moeShut || S.f.moeCover) && alive('moe') && roll(75) ? null : r;
};

// ---- Ma Thistle sold her third husband, Nigel's father, to Krug ----
jobs('nan', () => {
  const f = S.f;
  return [
    knew('elder.secret') &&
      !f.nanStops &&
      alive('elder') && [
        '"Your sister sold her third husband to Krug. For a goat and a rocking chair."',
        () => {
          f.nanStops = 1;
          spill('elder', 'nan');
          gain(30);
          later(5, 'envStop');
          says(
            'nan',
            '"Forty years I paid for that rocking chair." She tears this month\'s envelope in half. Then she thinks better of it, and gives you both halves. 30 teeth.',
          );
          go('talk', 'nan');
        },
      ],
  ];
});
jobs('nigel', () => {
  const f = S.f;
  return [
    knew('elder.secret') &&
      !f.nigelMa &&
      alive('elder') && [
        '"Ma Thistle didn\'t lose your father. She sold him to Krug. For a goat and a rocking chair."',
        () => {
          f.nigelMa = 1;
          spill('elder', 'nigel');
          bump('nigel', 10);
          later(1, 'nigelGlow');
          says('nigel', '"She said he walked into the wastes." Nigel glows brighter. Much brighter. The chicken starts to cook.');
          go('talk', 'nigel');
        },
      ],
  ];
});

// ---- Gus pawned Ma's ring ----
jobs('elder', () => {
  const f = S.f;
  return [
    has('ring') &&
      !f.ringBack && [
        '"Found your ring, Ma. Down the well, like you said."',
        () => {
          take('ring');
          f.ringBack = 'well';
          bump('elder', 30);
          bump('gus', 30); // you covered for him, and he knows it
          says('elder', 'Ma puts it on and doesn\'t say anything for a while. "Forty years. Gus, come and look." Gus looks at you like you saved his life. You did.');
          go('talk', 'elder');
        },
      ],
    knew('gus.secret') &&
      !f.gusOut &&
      !f.ringBack &&
      home('gus', 'scrapwell') && [
        '"Gus pawned your ring to Moe. For drink."',
        () => {
          f.gusOut = 1;
          spill('gus', 'elder');
          if (has('ring')) {
            take('ring');
            f.ringBack = 'truth';
          }
          bump('elder', 10);
          later(1, 'gusLeaves');
          says(
            'elder',
            f.ringBack
              ? 'Ma takes the ring, puts it on, and walks very slowly to Gus\'s door with her stick.'
              : '"My ring." Ma gets up. She takes her stick. She walks very slowly to Gus\'s door.',
          );
          go('talk', 'elder');
        },
      ],
  ];
});

// ---- Pell ate the other four Bacon Primes ----
jobs('lou', () => {
  const f = S.f;
  return [
    knew('pell.secret') &&
      !f.pellLou &&
      alive('pell') && [
        '"Old Pell ate the other four Bacon Primes. He cries every time."',
        () => {
          f.pellLou = 1;
          spill('pell', 'lou');
          if (plotOpen('pork')) stopPlot('pork');
          bump('lou', 10);
          rx('pell', '"Mama Lou had me round for dinner. I didn\'t ask what it was. I cried anyway. She said that\'s the seasoning."');
          says('lou', '"He eats his own pig, and WEEPS?" She puts a hand on her heart. "That\'s not a meal, honey. That\'s a sacrament. I won\'t touch his pig. I\'ll have him over Thursdays."');
          go('talk', 'lou');
        },
      ],
  ];
});

// ---- Bess leads the raiders on the farm road ----
const bessAtHome = () => home('bess', 'farm') && S.spouse !== 'bess';
jobs('jeb', () => {
  const f = S.f;
  return [
    knew('bess.secret') &&
      !f.bessTold &&
      bessAtHome() && [
        '"The raiders on the farm road? It\'s Bess. Hector\'s girl."',
        () => {
          f.bessTold = 'jeb';
          spill('bess', 'jeb');
          gain(40);
          bump('jeb', 20);
          later(3, 'bessShot');
          says('jeb', '"Bess? The polite one? She says thank you while she takes my gin." He counts out 40 teeth. "I\'ll hire some guns for the next run."');
          go('talk', 'jeb');
        },
      ],
  ];
});
jobs('sheriff', () => {
  const f = S.f;
  return [
    knew('bess.secret') &&
      !f.bessTold &&
      bessAtHome() && [
        '"The raiders hitting Jeb\'s caravan? Bess, from Hector\'s farm. She leads them."',
        () => {
          f.bessTold = 'crane';
          spill('bess', 'sheriff');
          bump('sheriff', 5);
          later(1, 'bessBounty');
          says('sheriff', '"Polite raiders are still raiders." She writes BESS on a poster, and a number under it.');
          go('talk', 'sheriff');
        },
      ],
  ];
});

// ---- Bert can't read ----
jobs('bert', () => {
  const f = S.f;
  return [
    knew('bert.secret') &&
      f.bertJob === 1 &&
      has('carb') &&
      !f.tractorRuns && [
        '"Bring the book. I\'ll teach you to read it." (two evenings)',
        () => {
          if (!waitFor(S.day + 2)) return go('ending');
          if (!home('bert', 'farm') || f.farmFailed || f.tractorRuns || !has('carb')) return goHere();
          take('carb');
          f.bertJob = 'done';
          f.bertReads = 1;
          f.tractorRuns = 1;
          bump('bert', 30);
          bump('hector', 20);
          gain(alive('hector') ? 60 : 0);
          says(
            'bert',
            'Two evenings, one lamp, a lot of pointing. On the third morning Bert reads "INSERT CARBURETTOR" out loud, slowly, and does. The tractor runs. He reads the rest of the book to the goats.',
          );
          go('talk', 'bert');
        },
      ],
  ];
});

// ---- Old Teo once owned Hector's farm ----
jobs('hector', () => {
  const f = S.f;
  return [
    knew('teo.secret') &&
      !f.teoBought &&
      alive('krug') &&
      alive('teo') &&
      S.n.teo.loc === 'chainfield' && [
        '"Old Teo, in Krug\'s pens. He owned this farm before your father did."',
        () => {
          f.teoBought = 1;
          spill('teo', 'hector');
          bump('hector', 10);
          later(2, 'teoHome');
          says('hector', '"...Teo? Dad said he moved away." Hector looks at the fields for a long time. "Krug sells old men cheap."');
          go('talk', 'hector');
        },
      ],
  ];
});

// ---- Vane was Doc's apprentice, thrown out for cruelty ----
jobs('doc', () => {
  const f = S.f;
  return [
    knew('vane.secret') &&
      !f.docUndercut &&
      alive('vane') && [
        '"Your old apprentice is selling at the Mall. Vane."',
        () => {
          f.docUndercut = 1;
          spill('vane', 'doc');
          bump('doc', 15);
          if (plotOpen('drugwar')) {
            stopPlot('drugwar');
            f.docWarned = 1;
          }
          says('doc', '"Vane. Too cruel even for me, and I saw legs off for fun." He smiles. "Then I\'ll sell cheaper than he can cut."');
          go('talk', 'doc');
        },
      ],
  ];
});
// Doc undercuts Vane, out of spite. You pay less.
const _costSecrets = cost;
cost = (base, id) =>
  id === 'doc' && S.f.docUndercut ? Math.max(1, Math.round(_costSecrets(base, id) * 0.7)) : _costSecrets(base, id);

// ---- Fern leaves seed packets in the pass; one grew Junior's cabbages ----
jobs('junior', () => {
  const f = S.f;
  return [
    knew('fern.secret') &&
      !f.juniorEast &&
      home('fern', 'green') &&
      home('junior', 'diner') && [
        '"Your cabbage seeds came from a girl in the Green. Fern. She leaves them in the pass, on purpose."',
        () => {
          f.juniorEast = 1;
          spill('fern', 'junior');
          bump('junior', 20);
          later(2, 'juniorGoes');
          says('junior', '"...On purpose? For somebody?" Junior puts the cleaver down. Nobody has ever seen him put the cleaver down.');
          go('talk', 'junior');
        },
      ],
  ];
});
jobs('gardener', () => {
  const f = S.f;
  return [
    knew('fern.secret') &&
      !f.fernLocked &&
      home('fern', 'green') && [
        '"Fern leaves seed packets in the pass. For strangers to find."',
        () => {
          if (plotOpen('gate')) stopPlot('gate');
          f.fernLocked = 1;
          spill('fern', 'gardener');
          bump('gardener', 15);
          bump('fern', -60); // he tells her who told him
          says('gardener', '"Seeds are the wall." He doesn\'t shout. He just goes and takes her key to the pass.');
          go('talk', 'gardener');
        },
      ],
  ];
});
const _gateLiveSecrets = PLOTS.gate.live;
PLOTS.gate.live = () => !S.f.fernLocked && _gateLiveSecrets();

// ---- what happens later ----
Object.assign(LATER, {
  envStop: () => {
    rx('elder', '"The Toaster has stopped providing. I must have sinned. I can\'t think what."');
    rx('crumb', '"Nan says no more envelopes. She won\'t say why. She just says rocking chair, rocking chair."');
  },
  nigelGlow: () =>
    rx(
      'elder',
      '"Nigel came up the well last night and stood outside my window. Glowing. All night. He didn\'t say a word."',
    ),
  gusLeaves: () => {
    if (!home('gus', 'scrapwell')) return;
    S.n.gus.loc = 'gone';
    S.f.gusGone = 1;
    rx('elder', '"I threw Gus out. He took his pick and walked east, toward the Silo. Good."');
    rx('tam', '"Gus went to the Silo? To be a Molar? He\'s doing what I did. Somebody stop him."');
  },
  bessShot: () => {
    if (!bessAtHome()) return;
    S.f.bessShot = 1;
    bump('bess', -40);
    bump('hector', -20);
    rx('bess', '"Jeb\'s new guns were waiting for us. Somebody told him. Somebody I know." She holds her shoulder.');
    rx('hector', '"Bess came home with a hole in her. The road money\'s gone. I know who talks to Jeb."');
    rx('gums', '"No more gin off the farm road. I\'ll have to buy it from Jeb like an animal."');
  },
  bessBounty: () => {
    if (!bessAtHome()) return;
    S.f.bessBounty = 1;
    S.n.bess.loc = 'gone';
    S.n.bess.st.goneDay = S.day; // three days on the run, then she's the Raider Queen
    bump('bess', -60);
    bump('hector', -40);
    bump('bert', -30);
    rx('hector', '"They put a bounty on my girl. She ran for the wastes. Somebody told the Sheriff."');
    rx('bert', '"Bess left in the night. She took the good hoe."');
  },
  teoHome: () => {
    if (!alive('teo') || S.n.teo.loc !== 'chainfield' || !alive('krug') || !home('hector', 'farm')) return;
    S.n.teo.loc = 'farm';
    S.f.teoHome = 1;
    rx('teo', '"Hector bought me. My own farm, and a man pays for me to sit on it. I sit very well."');
    rx('krug', '"Hector bought the old one. Fair price. I like a man who pays for his history."');
  },
  juniorGoes: () => {
    if (!home('junior', 'diner')) return;
    S.n.junior.loc = 'green';
    S.f.juniorGreen = 1;
    rx('lou', '"Junior walked east. Over a CABBAGE. Forty-four years and he leaves over a cabbage."');
    rx('fern', '"A man came over the pass with a sack of cabbages. He says I sent for him. I suppose I did."');
  },
});

// ---- ending slides ----
function secretLines() {
  const f = S.f,
    L = [];
  if (f.nanStops) L.push('Sweet Nan never sent another envelope. Ma Thistle sold the rocking chair.');
  if (f.nigelMa && alive('nigel'))
    L.push("Nigel stood outside Ma Thistle's window every night after that, glowing. She never slept in the dark again.");
  if (f.ringBack === 'well') L.push("Ma Thistle was buried with her ring on. Gus dug the grave, and never drank again.");
  if (f.gusGone)
    L.push(
      f.kingStopped
        ? 'Gus walked to Silo 9 to be a Molar, and found it empty. He dug a well there instead.'
        : 'Gus walked to Silo 9 and became a Molar. He pulled teeth for the King, and sent none home.',
    );
  if (f.pellLou && alive('pell'))
    L.push("Old Pell ate at Mama Lou's every Thursday. He wept into his bowl. Lou called it seasoning.");
  if (f.bessShot && alive('bess')) L.push('Bess never raided the farm road again. She kept the bullet on a string.');
  if (f.bessBounty && alive('bess') && S.n.bess.loc === 'gone')
    L.push("Bess ran from Crane's poster and kept running. Nobody on the farm says her name.");
  if (f.bertReads && alive('bert')) L.push('Bert reads now. Tractor manuals, mostly. He reads them aloud to the goats.');
  if (f.teoHome && alive('teo'))
    L.push("Old Teo died on the farm he once owned. Hector buried him under the corn and never told anyone why.");
  if (f.docUndercut && alive('doc'))
    L.push('Doc Ratchet sold cheap for years, just to spite Vane. The valley got healthier out of pure malice.');
  if (f.juniorGreen && alive('junior'))
    L.push('Junior walked over the pass to find the girl who sent the seeds. In the Green he cooks only vegetables.');
  if (f.fernLocked && alive('fern'))
    L.push('Fern never left another packet in the pass. The valley never knew what it missed.');
  const told = Object.keys(f).filter(k => k.startsWith('told_')).length;
  if (told >= 3) L.push(`You told ${told} secrets that weren't yours. In the valley, everyone knows who talks.`);
  return L;
}
const _webLinesSecrets = webLines;
webLines = () => [..._webLinesSecrets(), ...secretLines()];
