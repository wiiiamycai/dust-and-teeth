'use strict';
// ================= THE LOST TOWNS: four places taken by beasts =================
// Will: "some towns are missing, they've been raided, or they're infested and taken over. Part of the quests
// is: can you kill these monsters? And it helps the neighbouring towns." Nothing here talks. Each town is
// found through a neighbour who needs it cleared, fought through in three stages and a boss (fixed strength,
// pillar 6), and you can turn back between stages and come back later. Clear it and its neighbours change.
// Leave it, and it spreads onto the roads.

// ---- the beasts: fixed strength, no gear, no teeth. Their heavy moves are in `moves` (engine/combat.js) ----
const mv = (w, h, x, acc) => ({ w, h, x, acc });
// Each town is built for one tier of Jeb's gear (scenes/shop.js), and its description says how bad it is:
//   Gristmill: starter gear (pipe or zip gun, a jacket). Saltpan: hard shells, so a heavy weapon (sledge, shotgun).
//   Fanghill: packs that hit hard, so real armour (plate, riot suit). Kettle: pre-war gear, or don't go.
Object.assign(ENEMY, {
  // Gristmill: tier 1
  ratling: {
    n: 'Rad-rat',
    kind: 'swarm',
    venom: 1,
    i: '🐀',
    lvl: 1,
    teeth: 0,
    hpm: 0.3,
    d: [2, 4],
    beast: 1,
    pack: 1,
    flee: 1,
    moves: [mv('A rad-rat crouches, quivering, ready to go for your face.', 'leap', 2, 10)],
  },
  bloater: {
    n: 'Bloated rad-rat',
    kind: 'swarm',
    venom: 1,
    i: '🐀',
    lvl: 2,
    teeth: 0,
    hpm: 0.5,
    d: [2, 5],
    beast: 1,
    rage: 1,
    loot: { meat: 1 },
    moves: [mv('The bloated rat swells up, wheezing. Its mouth is full of something yellow.', 'yellow spit', 2, 15)],
  },
  ratQueen: {
    n: 'The Rat Queen',
    kind: 'swarm',
    venom: 1,
    i: '🐀',
    lvl: 3,
    teeth: 0,
    hpm: 1.1,
    d: [3, 6],
    beast: 1,
    rage: 1,
    boss: 1,
    moves: [
      mv('The Rat Queen rears back, her throat swelling. She is going to spit.', 'acid spit', 2, 15),
      mv('The Rat Queen screams. The walls answer. Something is coming out of them.', 'swarm', 1.5, 25),
    ],
  },
  // Saltpan: tier 2. The shells shrug off light weapons.
  crawler: {
    n: 'Saltback crawler',
    kind: 'shell',
    i: '🦀',
    lvl: 2,
    teeth: 0,
    hpm: 0.5,
    d: [3, 6],
    dr: 4,
    beast: 1,
    pack: 1,
    flee: 1,
    moves: [mv('A crawler scuttles sideways, claw held low, looking for your ankle.', 'ankle snip', 2, 15)],
  },
  saltback: {
    n: 'Saltback',
    kind: 'shell',
    i: '🦀',
    lvl: 3,
    teeth: 0,
    hpm: 1,
    d: [4, 8],
    dr: 5,
    beast: 1,
    loot: { meat: 1 },
    moves: [mv('The saltback raises both claws high over its head.', 'double claw', 2, 10)],
  },
  oldShell: {
    n: 'The Old Shell',
    kind: 'shell',
    i: '🦀',
    lvl: 5,
    teeth: 0,
    hpm: 1.7,
    d: [5, 9],
    dr: 6,
    beast: 1,
    rage: 1,
    boss: 1,
    moves: [
      mv('The Old Shell digs its legs into the salt and goes very still. It is going to charge.', 'charge', 2.5, 0),
      mv('The Old Shell opens a claw the size of a door.', 'crushing claw', 2, 15),
    ],
  },
  // Fanghill: tier 3. Fast packs that hit hard: you want armour.
  hound: {
    n: 'Grave-hound',
    kind: 'flesh',
    i: '🐺',
    lvl: 4,
    teeth: 0,
    hpm: 0.7,
    d: [6, 11],
    beast: 1,
    pack: 1,
    flee: 1,
    moves: [mv('A grave-hound drops its head low. It is going for your throat.', 'throat lunge', 2, 15)],
  },
  alpha: {
    n: 'Grave-hound alpha',
    kind: 'flesh',
    i: '🐺',
    lvl: 5,
    teeth: 0,
    hpm: 1.1,
    d: [8, 13],
    beast: 1,
    pack: 1,
    rage: 1,
    loot: { meat: 1 },
    moves: [mv('The alpha circles behind you. The others hold still and wait for it.', 'flank', 2, 20)],
  },
  boneMother: {
    n: 'Old Mother Bone',
    kind: 'flesh',
    i: '🐺',
    lvl: 7,
    teeth: 0,
    hpm: 1.9,
    d: [10, 16],
    dr: 2,
    beast: 1,
    rage: 1,
    boss: 1,
    moves: [
      mv('Old Mother Bone throws her head back and howls. The pack goes mad.', 'pack rush', 1.5, 25),
      mv('Old Mother Bone crouches. Her jaws are as wide as your chest.', 'killing bite', 2.5, 15),
    ],
  },
  // Kettle: tier 4. Pre-war gear, flares, or a grave.
  stinger: {
    n: 'Stinger',
    kind: 'swarm',
    venom: 1,
    i: '🐝',
    lvl: 6,
    teeth: 0,
    hpm: 0.5,
    d: [9, 14],
    beast: 1,
    pack: 1,
    moves: [mv('A stinger hangs in the air in front of you, tail curled forward.', 'sting', 2, 25)],
  },
  drone: {
    n: 'Stinger drone',
    kind: 'swarm',
    venom: 1,
    i: '🐝',
    lvl: 7,
    teeth: 0,
    hpm: 0.8,
    d: [9, 14],
    dr: 2,
    beast: 1,
    pack: 1,
    rage: 1,
    moves: [mv('A drone drops low and hums one long note, louder and louder.', 'dive', 2, 20)],
  },
  hiveMother: {
    n: 'The Hive Mother',
    kind: 'swarm',
    venom: 1,
    i: '🐝',
    lvl: 9,
    teeth: 0,
    hpm: 1.7,
    d: [11, 17],
    dr: 3,
    beast: 1,
    rage: 1,
    boss: 1,
    moves: [
      mv('The Hive Mother curls her whole body into one long sting.', 'great sting', 2.5, 20),
      mv("The Hive Mother's wings go still. The whole tower hums one note.", 'the swarm', 1.5, 30),
    ],
  },
});
ITEMS.flare = 'Road flare';
ITEMS.molotov = 'Molotov';
// The Old Shell's carapace, cut to fit a man. Very hard, very heavy.
A.shell = { n: 'Saltback Shell', dr: 5, v: 120, tw: -2 };

// ---- the towns ----
const B = k => spawn(k);
const TOWNS = {
  gristmill: {
    n: 'Gristmill',
    i: '🌾',
    lvl: 3,
    x: 12,
    y: 36,
    hidden: 'knowGrist',
    lost: 'The grain town. Doors chewed through. Everything that was food is gone, and something is still eating.',
    clear:
      'Gristmill is quiet. The millwheel turns, slowly, for the first time in a year. A family has moved back into the end house.',
    stages: [
      [
        'Go in through the outer houses',
        'Furniture chewed to splinters. Squeaking in the walls.',
        () => [B('ratling'), B('ratling'), B('ratling')],
      ],
      [
        'Push into the granary',
        'The floor moves. It is rats. The floor is rats.',
        () => [B('ratling'), B('ratling'), B('bloater')],
      ],
      [
        'Wade down the mill race',
        'Black water, and things the size of dogs swimming in it.',
        () => [B('bloater'), B('bloater'), B('ratling')],
      ],
      [
        'Climb into the mill, to the nest',
        'Something huge breathes in the dark at the top of the mill. The Rat Queen.',
        () => [B('ratQueen'), B('ratling')],
      ],
    ],
    spreadDay: 12,
    spread: () => {
      S.f.ratsFarm = 1;
      rx(
        'hector',
        '"Rats in the corn. Big ones. From Gristmill. Somebody should do something, and it\'s not going to be me."',
      );
      rx('bert', '"A rat ate my boot. While I was in it."');
    },
    road: ['farm', 'scrapwell'],
  },
  saltpan: {
    n: 'Saltpan',
    i: '🧂',
    lvl: 4,
    x: 18,
    y: 94,
    hidden: 'knowSalt',
    lost: 'White salt flats, a pan-works, empty houses. The salt crunches. Then something under it moves.',
    clear:
      'The pans are working again. Two salt-boilers came back from the coast, and the first thing they did was put up a price list.',
    stages: [
      [
        'Cross the outer flats',
        'Little crabs, the size of dinner plates. A lot of dinner plates.',
        () => [B('crawler'), B('crawler'), B('crawler')],
      ],
      [
        'Into the pan-works',
        'A saltback is wedged in the boiling shed, and it does not want to share.',
        () => [B('saltback'), B('crawler'), B('crawler')],
      ],
      ['Along the drying racks', 'Two of them, back to back, clicking.', () => [B('saltback'), B('saltback')]],
      [
        'Out to the deep pan',
        'The deep pan is not a pan. It is a back. The Old Shell.',
        () => [B('oldShell'), B('saltback')],
      ],
    ],
    spreadDay: 14,
    spread: () => {
      S.f.crabsDiner = 1;
      rx('lou', '"Crabs on my road. Big ones. I tried one. Needs salt, honey. Everything needs salt."');
    },
    road: ['diner', 'scrapwell'],
  },
  kettle: {
    n: 'Kettle',
    i: '🗼',
    lvl: 5,
    x: 72,
    y: 52,
    hidden: 'knowKettle',
    lost: 'A dead town round a water tower that still has water in it. The tower hums. The hum has wings.',
    clear:
      'The tower is quiet. Somebody has painted FREE on the tank, in letters ten feet high, and people walk here from Rustwater with buckets.',
    stages: [
      [
        'Walk in down the main street',
        'Stingers, long as your hand, drifting between the houses.',
        () => [B('stinger'), B('stinger'), B('stinger')],
      ],
      [
        'Into the pump house',
        'Wax on every wall. A drone in the doorway.',
        () => [B('stinger'), B('stinger'), B('drone')],
      ],
      ['Up the tower ladder', 'Halfway up, the ladder is a nest.', () => [B('drone'), B('stinger'), B('stinger')]],
      [
        'Into the tank, to the hive',
        'The tank is one huge hive. In the middle of it, the Hive Mother.',
        () => [B('hiveMother'), B('stinger')],
      ],
    ],
    spreadDay: 10,
    spread: () => {
      S.f.stingRoad = 1;
      rx('sheriff', '"Stingers on the east road. Two dead this week. Kettle\'s hive is getting bigger."');
      rx('mayor', '"Stingers? On the Kettle road? Terrible. Terrible for Kettle. Water, citizen?"');
    },
    road: ['rustwater', 'skybus'],
  },
  fanghill: {
    n: 'Fanghill',
    i: '🦴',
    lvl: 5,
    x: 30,
    y: 10,
    hidden: 'knowFang',
    lost: 'A caravan stop the Molars hit last year. They took the people and left the bodies, and the bodies brought the dogs.',
    clear:
      'Fanghill has a well, a fence and a sign again. The caravans stop here on the north road. Somebody buried the bones.',
    stages: [
      [
        'Walk in past the burned wagons',
        'Bones in the road, picked clean. Then eyes in the dark.',
        () => [B('hound'), B('hound'), B('hound')],
      ],
      [
        'Into the stockade',
        'The pack lives here now. They are not afraid of you.',
        () => [B('hound'), B('hound'), B('alpha')],
      ],
      ['Round the bone pits', 'Two alphas, and a lot of old bones.', () => [B('alpha'), B('alpha')]],
      [
        'Into the long barn, to the den',
        'Something grey and enormous gets up off a bed of ribs. Old Mother Bone.',
        () => [B('boneMother'), B('hound'), B('hound')],
      ],
    ],
    spreadDay: 12,
    spread: () => {
      S.f.houndRoad = 1;
      rx('jeb', '"Grave-hounds on the Snake Eyes road now. They took a lizard. A whole lizard."');
      rx('pips', '"Customers keep getting eaten on the way here. Terrible for business."');
    },
    road: ['snakeeyes', 'farm'],
  },
};
for (const k in TOWNS) {
  const T = TOWNS[k];
  LOC[k] = { n: T.n, i: T.i, lvl: T.lvl, x: T.x, y: T.y, hidden: T.hidden };
  T.road.forEach(r => ROADS.push([k, r]));
}
const townStage = k => S.f['town_' + k] || 0; // stages cleared, 0 to 4
const townClear = k => townStage(k) >= 4;

SC.town = k => {
  const T = TOWNS[k],
    n = townStage(k);
  S.here = k;
  if (S.crater[k])
    return show({
      title: T.n,
      icon: '☢️',
      sub: 'crater',
      text: 'A glowing crater. Whatever lived here is ash.',
      opts: [['Leave (map)', () => go('map')], charOpt()],
    });
  const st = T.stages[n];
  show({
    title: T.n,
    icon: T.i,
    sub: `${townClear(k) ? 'cleared' : cap(placeWord(T.lvl))} · Day ${S.day}`,
    text: townClear(k) ? T.clear : `${T.lost}${n ? `\n\nYou've cleared ${n} of the way in. ` : '\n\n'}${st[1]}`,
    opts: [
      !townClear(k) && [
        st[0],
        () => fight(st[2](), { win: 'townStage', args: [k, n + 1], back: ['town', k] }),
        'danger',
      ],
      ['Leave (map)', () => go('map')],
      charOpt(),
    ],
  });
};
WIN.town = k => go('town', k);
WIN.townStage = (k, n) => {
  S.f['town_' + k] = Math.max(townStage(k), n);
  if (n >= 4) {
    S.f[k + 'Clear'] = S.day;
    addTitle({ gristmill: 'Rat-catcher', saltpan: 'Shell-cracker', kettle: 'Hive-breaker', fanghill: 'Dog-killer' }[k]);
    gainXP(150);
    say(`${TOWNS[k].n} is yours. Nothing in it is breathing that shouldn't be.`);
    TOWN_DONE[k]();
  }
  go('town', k);
};
const _hubTowns = SC.hub;
SC.hub = loc => (TOWNS[loc] ? go('town', loc) : _hubTowns(loc));

// ---- what clearing a town changes ----
const TOWN_DONE = {
  gristmill: () => {
    rx('crumb', '"Bread! Real bread, from the mill at Gristmill! The Toaster said! The Bread Times!"');
    rx('hector', '"No more rats in the corn. The mill wants my grain. I might get rich. I might even smile."');
  },
  saltpan: () => {
    if (!S.armors.includes('shell')) {
      S.armors.push('shell');
      say("You cut the Old Shell's back into something you can wear. Saltback Shell: very hard, very heavy.");
    }
    rx('lou', '"Salt! Real salt! Do you know what salt does to a man, honey? Brings out the flavour."');
    rx('junior', '"...Salt." Junior holds a pinch of it like it\'s gold. "For the cabbages."');
  },
  kettle: () => {
    S.f.waterUp = (S.f.waterUp || 0) - 4; // free water at Kettle, so Rustwater's pump has to compete
    bump('mayor', -40);
    rx('mayor', '"Free water. At KETTLE. Do you know what free water does to a man\'s business?"');
    rx('sheriff', '"People are walking to Kettle for water. Fenwick dropped his price the same day. Funny, that."');
  },
  fanghill: () => {
    S.f.jebUp = (S.f.jebUp || 0) - 2;
    rx('jeb', '"Fanghill\'s clear? The north road\'s open. I can feed my lizards on the way. Prices down, friend."');
    rx('pips', '"Customers arriving alive. Wonderful. Alive customers lose more."');
  },
};

// ---- who tells you, and who pays ----
jobs('hector', () => {
  const f = S.f;
  return [
    !f.knowGrist && [
      '"Seen anything odd on the north road?"',
      () => {
        f.knowGrist = 1;
        says(
          'hector',
          '"Gristmill. Rats took it a year back. Rats the size of dogs. Now they\'re eating my corn. Clear it and I\'ll pay you. 80 teeth."',
        );
        go('talk', 'hector');
      },
    ],
    townClear('gristmill') &&
      !f.gristPaid && [
        '"Gristmill\'s clear. The Rat Queen is dead."',
        () => {
          f.gristPaid = 1;
          gain(80);
          bump('hector', 25);
          says(
            'hector',
            '"The Queen? There was a QUEEN?" He pays you 80 teeth and looks at you like a gun he didn\'t know he owned.',
          );
          go('talk', 'hector');
        },
      ],
  ];
});
jobs('lou', () => {
  const f = S.f;
  return [
    !f.knowSalt && [
      '"Where do you get your salt, Lou?"',
      () => {
        f.knowSalt = 1;
        says(
          'lou',
          '"Saltpan, honey, past the flats. Or I did. Crabs took it. Crabs the size of carts. Bring me salt and I\'ll feed you free for a week. Bring me a crab and I\'ll feed you forever."',
        );
        go('talk', 'lou');
      },
    ],
    townClear('saltpan') &&
      !f.saltPaid && [
        '"Saltpan\'s open. The Old Shell is dead."',
        () => {
          f.saltPaid = 1;
          f.louSalt = S.day;
          bump('lou', 25);
          says('lou', 'Lou kisses you on the forehead. It leaves a mark. "Free stew. For as long as I like you."');
          go('talk', 'lou');
        },
      ],
  ];
});
jobs('sheriff', () => {
  const f = S.f;
  return [
    !f.knowKettle && [
      '"Where else could Rustwater get water?"',
      () => {
        f.knowKettle = 1;
        says(
          'sheriff',
          '"Kettle. East road. Free tower, full of water. And a hive of stingers in it the size of a house. Fenwick says that\'s a tragedy. He says it smiling."',
        );
        go('talk', 'sheriff');
      },
    ],
    townClear('kettle') &&
      !f.kettleThanked && [
        '"Kettle\'s tower is clear."',
        () => {
          f.kettleThanked = 1;
          bump('sheriff', 20);
          event('helped', null, { wit: ['sheriff'] });
          says(
            'sheriff',
            '"I walked out there this morning. People with buckets. Free water." She almost smiles. "You did a good thing."',
          );
          go('talk', 'sheriff');
        },
      ],
  ];
});
jobs('mayor', () => {
  const f = S.f;
  return [
    f.knowKettle &&
      !f.kettlePaid &&
      !townClear('kettle') && [
        '"Kettle\'s water tower. Somebody could clear it."',
        () => {
          f.kettlePaid = 1;
          gain(100);
          says(
            'mayor',
            '"Somebody could. Somebody could also take 100 teeth and never go near it." He counts them out. "Bees are nature, citizen. Respect nature."',
          );
          go('talk', 'mayor');
        },
      ],
  ];
});
jobs('jeb', () => {
  const f = S.f;
  return [
    !f.knowFang && [
      '"Why don\'t you take the north road any more?"',
      () => {
        f.knowFang = 1;
        says(
          'jeb',
          '"Fanghill. Molars hit it last year and left the bodies. Then the dogs came. Grave-hounds. Clear it and I\'ll pay 60, and drop my prices."',
        );
        go('talk', 'jeb');
      },
    ],
    townClear('fanghill') &&
      !f.fangPaid && [
        '"Fanghill\'s clear. Old Mother Bone is dead."',
        () => {
          f.fangPaid = 1;
          gain(60);
          bump('jeb', 25);
          says('jeb', '"The north road." Jeb pays you 60 teeth. "I\'m naming a lizard after you. The angry one."');
          go('talk', 'jeb');
        },
      ],
  ];
});
// Took Fenwick's money and cleared it anyway.
const _townDoneKettle = TOWN_DONE.kettle;
TOWN_DONE.kettle = () => {
  _townDoneKettle();
  if (S.f.kettlePaid) {
    bump('mayor', -30);
    rx(
      'mayor',
      '"I paid you to leave the bees ALONE. I want my 100 teeth back. I want them back with interest. In blood."',
    );
  }
};

// Throwables: Moe has bottles and rags. Sprocket has flares.
jobs('moe', () => [
  [
    `Molotov, a bottle and a rag (${cost(20, 'moe')})`,
    () => {
      if (pay(cost(20, 'moe'))) {
        give('molotov');
        say('"Don\'t drink it." Moe thinks. "Or do. Your funeral."');
      }
      go('talk', 'moe');
    },
  ],
]);
jobs('sprocket', () => [
  [
    `Road flare (${cost(15, 'sprocket')})`,
    () => {
      if (pay(cost(15, 'sprocket'))) {
        give('flare');
        say('"Pre-war. Burns red for a minute. Bugs hate it. Everything hates it."');
      }
      go('talk', 'sprocket');
    },
  ],
]);
// Salt in Lou's stew: free, and better.
const _stewTowns = stew;
stew = () => {
  if (S.f.louSalt && !S.f.louReformed && alive('lou') && S.n.lou.op >= 0) {
    S.teeth += 5; // free
    S.f.saltStew = (S.f.saltStew || 0) + 1;
  }
  return _stewTowns();
};

// ---- if you leave them: the towns spread onto the roads ----
function townsDaily() {
  for (const k in TOWNS) {
    const T = TOWNS[k];
    if (!townClear(k) && !S.f['spread_' + k] && S.day >= T.spreadDay) {
      S.f['spread_' + k] = 1;
      T.spread();
    }
  }
}
const _worldTowns = world;
world = () => {
  _worldTowns();
  if (S && !S.end) townsDaily();
};
// A road next to a spreading town gets its beasts.
const _pickEncTowns = pickEnc;
pickEnc = dest => {
  // Story encounters come first; the beasts take a trip that would otherwise be quiet.
  const r = _pickEncTowns(dest);
  if (r) return r;
  for (const k in TOWNS)
    if (S.f['spread_' + k] && !townClear(k) && TOWNS[k].road.includes(dest) && roll(30)) {
      S.f.encTown = k;
      return 'beasts';
    }
  return null;
};
ENC.beasts = d => {
  const k = S.f.encTown,
    T = TOWNS[k];
  return {
    title: `Out of ${T.n}`,
    icon: T.i,
    t: {
      gristmill: 'Rad-rats, a lot of them, crossing the road like a carpet. They stop. They look at you.',
      saltpan: 'The road crunches. It is not salt. It is crabs, and they are all facing you.',
      kettle: 'A hum on the wind. Then the stingers come over the ridge.',
      fanghill: 'Grave-hounds, trotting along the road ahead. One of them looks back. Then they all do.',
    }[k],
    o: [
      ['Fight', () => fight(T.stages[0][2](), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
      has('meat') && [
        'Throw them meat and walk on',
        () => {
          take('meat');
          say('They fall on the meat. You walk on, quickly, not running.');
          go('hub', d);
        },
      ],
      [
        'Run for it',
        () => {
          if (roll(fleeP())) {
            say('You run. They chase you a while, then lose interest.');
            go('hub', d);
          } else fight(T.stages[0][2](), { started: true, win: 'enc', args: [d], back: ['hub', d] });
        },
        'danger',
      ],
    ],
  };
};

// ---- ending slides ----
const _linkLinesTowns = linkLines;
linkLines = () => {
  const L = _linkLinesTowns(),
    f = S.f;
  if (townClear('gristmill'))
    L.push('Gristmill grinds again. Crumb calls every loaf a miracle. The bakers call it Tuesday.');
  else if (f.spread_gristmill)
    L.push('The rats came out of Gristmill and never went back. Hector farms with a shotgun and a cat.');
  if (townClear('saltpan')) L.push('Saltpan salts the whole valley. Mama Lou buys most of it. Nobody asks what for.');
  if (townClear('kettle'))
    L.push(
      f.kettlePaid
        ? "You took Fenwick's teeth and cleared Kettle anyway. The water is free. Fenwick never forgave you."
        : "Kettle's tower runs free. Rustwater learned what water costs when nobody owns it.",
    );
  else if (f.kettlePaid)
    L.push('Fenwick paid you to leave the Hive Mother alone. Kettle stayed dead, and Rustwater stayed thirsty.');
  if (townClear('fanghill'))
    L.push(
      'Fanghill is a caravan stop again. The bones are buried. The dogs are gone. Jeb has a lizard named after you.',
    );
  return L;
};
