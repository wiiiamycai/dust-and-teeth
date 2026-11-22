'use strict';
// ================= DEPTH: things that happened, and now somebody cares =================
// From the depth audit (tools/AUDIT.md): flags the game set and never read again. Each one now changes
// something a day or two later, through a person's behaviour, a line, a door, or an ending slide.
// One-time consequences run from the daily world tick; each fires once (S.f.dx_<name>).
const DX = [
  // You warned Fenwick about the fanatics, so the Coil guard his pump. At night they see the chained shift.
  [
    'coilGuards',
    2,
    () => {
      S.f.shiftSeen = 1;
      rx(
        'ohm',
        '"My people guard the Mayor\'s pump. At night they hear chains in it. The Voice says pray. I say look."',
      );
      rx('sheriff', '"The Coil on the pump say they hear chains at night. Fenwick says it\'s the pipes."');
    },
  ],
  // Rustwater hanged Doc for Vane's poison. Doc's father and sister hear it in the Green.
  [
    'docLynched',
    1,
    () => {
      rx('gardener', '"My son hanged in a town that drank his medicine for twenty years. Keep the gate shut."');
      rx('fern', '"They hanged my brother. I never even met him. I was going to."');
      rx('vane', '"Rustwater needed rope. I sell rope. I sell everything."');
    },
  ],
  // Grey Buzz hit Rustwater. The bar remembers.
  [
    'greyHit',
    1,
    () => {
      rx('moe', '"Two of my regulars stopped blinking. Then they stopped. No Buzz in my bar now. Ever."');
      rx('gloria', '"Half the girls tried the grey. I didn\'t. Somebody has to count the takings."');
    },
  ],
  // The ledger hanged Fenwick. Krug lost his best customer, and the night shift saw daylight.
  [
    'ledgerGiven',
    1,
    () => {
      S.f.shiftFreed = 1;
      bump('krug', -20);
      rx('krug', '"Fenwick bought my night stock for six years. Somebody cost me a customer. I know who."');
      rx('opal', '"Crane unchained the men under the pump. I sent them a bottle. Don\'t tell anyone I have a heart."');
    },
  ],
  // Pete died in the Sheriff's door, because you made him a deputy.
  [
    'peteSaved',
    1,
    () => {
      bump('sheriff', 15);
      rx('sheriff', '"Pete stood in the door. I keep thinking it should have been me in that door."');
      rx('eel', '"Pete died a hero? Pete? Sal would have laughed. Then he would have cried."');
      rx('lou', '"Pete. The one that got away. Well. Nobody gets away for long, honey."');
    },
  ],
  // Somebody stole Bacon Prime.
  [
    'pigStolen',
    1,
    () => {
      rx('pell', '"Somebody took Bacon Prime. I drew posters. I am very good at drawing him."');
      rx('sheriff', '"Old Pell reported a stolen pig. He brought a portrait. It was better than my wanted posters."');
    },
  ],
  // The Coil held the plane because you warned them.
  [
    'planeHeld',
    1,
    () => {
      rx('ohm', '"The Crust came with torches and found us singing. The Voice says thank you. So do I."');
      rx('rind', '"Somebody warned the Coil. God sees who. So do I."');
    },
  ],
  // Krug's men hit Jeb's caravan. Gums gets the gin.
  [
    'routeHit',
    1,
    () => {
      rx('gums', '"Krug\'s boys sold me Jeb\'s gin. I sold it back to Jeb. Everybody wins, except Jeb."');
      rx('krug', '"Jeb\'s lizards fetched a good price. Lizards don\'t complain. I like lizards."');
    },
  ],
  // You came up the Green's outflow pipe. Moss saw. The Warden found out.
  [
    'sneakedGreen',
    2,
    () => {
      bump('moss', 15);
      rx('moss', '"You came up my pipe. Nobody comes up my pipe. Come again."');
      rx('warden', '"Somebody came up the outflow. I welded the grate. If I find who, they go to the outer beds."');
      // The pipe is shut for good.
      S.tried['green.outflow'] = { n: 1, day: S.day, lock: 'once', who: null, op: null, kf: null };
    },
  ],
  // You sold the Holy Toaster to Doc. Doc takes it apart and sells the pieces. Crumb sees them.
  [
    'toasterSold',
    3,
    () => {
      bump('crumb', -40);
      rx(
        'crumb',
        '"I saw my Toaster in Doc\'s window. In pieces. A price on every piece. He says a stranger sold it to him."',
      );
      rx(
        'doc',
        '"The toaster? Chrome, a spring, and a crumb older than the bombs. The crumb was the best part. Sold it for 40."',
      );
    },
  ],
  // Somebody emptied the drowned vault: Sal's retirement. Eel finds out, unless you gave her his half.
  [
    'mallVault',
    3,
    () => {
      if (S.f.eelShare) return;
      bump('eel', -30);
      rx(
        'eel',
        '"Somebody emptied the vault. Sal\'s vault. Our retirement. I\'ll find them. I can hold my breath a long time."',
      );
    },
  ],
  // You sold the Coil's road to the Crust. Ohm works out who knew it.
  [
    'toothSold',
    1,
    () => {
      bump('ohm', -45); // the Coil take you for an enemy: their patrols come for you
      rx('ohm', '"Rind knew our road. One outsider knew our road. The Voice has gone very quiet about you."');
    },
  ],
];
function depthDaily() {
  const f = S.f;
  for (const [k, wait, fn] of DX) {
    if (!f[k] || f['dx_' + k]) continue;
    if (f['dxDay_' + k] == null) f['dxDay_' + k] = S.day;
    if (S.day - f['dxDay_' + k] >= wait - 1) {
      // the day it's noticed counts as day one
      f['dx_' + k] = 1;
      fn();
    }
  }
  // Nan's loan: two days before it's due, the valley warns you.
  if (f.debt && f.debtDue && S.day === f.debtDue - 2) {
    rx('nan', '"Two days, dear. I do so hate the part that comes after."');
    rx('moe', '"Nan\'s collectors were in. Asking where you sleep. I said I didn\'t know. For now."');
  }
}
const _worldDepth = world;
world = () => {
  _worldDepth();
  if (S && !S.end) depthDaily();
};

// After the Coil see the chained night shift, Crane can tell you what they saw.
jobs('sheriff', () =>
  S.f.shiftSeen && !knew('mayor.secret') && alive('mayor')
    ? [
        [
          '"Anything strange at the pump?"',
          () => {
            know('mayor.secret');
            says(
              'sheriff',
              '"The Coil swear there are men chained inside it at night. Krug\'s men. Fenwick buys them to pump in the dark." She looks at the pump. "I drink that water."',
            );
            go('talk', 'sheriff');
          },
        ],
      ]
    : [],
);

// Junior took Bacon Prime. Thursday's special is pedigree pork, and you can have some.
const _stewDepth = stew;
stew = () => {
  const f = S.f;
  if (f.porkDone && !f.ateBacon && !f.louReformed && S.here === 'diner') {
    if (!pay(5)) return goHere();
    f.stew = (f.stew || 0) + 1;
    f.ateBacon = 1;
    say(`It's pork. Real pork, for once. Pedigree. It is the best thing you have ever eaten. +${heal(25)} HP.`);
    bump('pell', -30);
    rx('pell', '"They say you ate him. At Lou\'s. With the gravy."');
    return goHere();
  }
  return _stewDepth();
};

// ---- ending slides ----
const _linkLinesDepth = linkLines;
linkLines = () => {
  const L = _linkLinesDepth(),
    f = S.f;
  if (f.docLynched) L.push("Rustwater hanged Doc Ratchet for Vane's poison. Vane sold them the rope.");
  if (f.greyHit && !f.docLynched)
    L.push('The grey stayed in Rustwater a long time. People stopped blinking. Then they stopped.');
  if (f.shiftFreed)
    L.push('Crane unchained the night shift under the pump. They pump in daylight now, for pay. Badly.');
  if (f.peteSaved) L.push('Crane buried Pete under the pump, with his whistle. Every morning she blows it once.');
  if (f.pigStolen && alive('pell'))
    L.push(
      "Pell's posters of Bacon Prime stayed up for years. They were better drawn than any wanted poster in Rustwater.",
    );
  if (f.ateBacon) L.push("You ate Bacon Prime at Mama Lou's, with the gravy. Pell never forgave you. It was worth it.");
  if (f.planeHeld)
    L.push('The Crust came for the plane on the ninth and found the Coil waiting, singing. Nobody burned.');
  if (f.toasterSold) L.push('Doc sold the Holy Toaster one part at a time. Each part came with a blessing, extra.');
  if (f.coilGuards && !f.shiftFreed)
    L.push("The Coil guarded Fenwick's pump for years. They prayed to it at every change of shift.");
  return L;
};

// ================= THE THINNEST PEOPLE (from the audit) =================
// Fern, Vane, Moss, Tam, Eel and Bert each get a secret told to them that changes what they do, or a job.
ITEMS.feather = "Nigel's chicken feather, for Moss";

// Fern: Jeb has never been east. So nobody has seen the sea. Somebody has to.
jobs('fern', () => {
  const f = S.f;
  return [
    knew('jeb.secret') &&
      !f.fernEast &&
      home('fern', 'green') && [
        '"Jeb has never been east. He sits in a cave for a month and comes back. Nobody has seen the sea."',
        () => {
          f.fernEast = 1;
          spill('jeb', 'fern');
          if (plotOpen('gate')) stopPlot('gate');
          later(2, 'fernGoes');
          says(
            'fern',
            '"Nobody?" Fern looks at the gate, then past it, east. "Then somebody has to." She starts packing seeds.',
          );
          go('talk', 'fern');
        },
      ],
  ];
});

// Vane: Doc is poisoning the Mayor. Vane sells the news to Fenwick, to put his old master in the ground.
jobs('vane', () => {
  const f = S.f;
  return [
    knew('doc.secret') &&
      !f.vaneTold &&
      plotOpen('poison') && [
        '"Doc puts slow poison in the Mayor\'s tea. Ten days, maybe."',
        () => {
          f.vaneTold = 1;
          spill('doc', 'vane');
          gain(30);
          later(1, 'vaneTells');
          says(
            'vane',
            '"Slow poison? Amateur." He pays you 30 teeth and reaches for his coat. "The Mayor will want to know who saved him. Me."',
          );
          go('talk', 'vane');
        },
      ],
  ];
});

// Moss and Nigel: two men who glow, a valley apart. Carry a message, and a feather back.
jobs('moss', () => {
  const f = S.f;
  return [
    knew('moss.nigel') &&
      !f.mossJob &&
      alive('nigel') && [
        '"Want me to tell Nigel anything?"',
        () => {
          f.mossJob = 1;
          says('moss', '"Tell him: B flat. He\'ll know."');
          go('talk', 'moss');
        },
      ],
    has('feather') && [
      '"Nigel sends this."',
      () => {
        take('feather');
        f.mossJob = 'done';
        f.mossBright = 1;
        say('Moss ties the feather to his chain. The vats hum. Every light in the Green goes up a notch, in B flat.');
        confide('moss', 30);
        go('talk', 'moss');
      },
    ],
  ];
});
jobs('nigel', () =>
  S.f.mossJob === 1 && !has('feather')
    ? [
        [
          '"Moss, under the Green, says: B flat."',
          () => {
            S.f.mossJob = 2;
            give('feather');
            bump('nigel', 20);
            says(
              'nigel',
              '"Moss is ALIVE?" Nigel hums, in B flat, for a long time. He pulls a feather off his chicken. "Give him this. He\'ll know."',
            );
            go('talk', 'nigel');
          },
        ],
      ]
    : [],
);

// Tam: his fighting paper is the King's paper. He walks out of the pit and goes home to his brother.
jobs('tam', () => {
  const f = S.f;
  return [
    knew('pips.secret') &&
      !f.tamQuit &&
      home('tam', 'snakeeyes') &&
      plotOpen('fightnight') && [
        '"Pips washes the Dentist King\'s teeth through the tables. Your paper is the King\'s paper."',
        () => {
          f.tamQuit = 1;
          spill('pips', 'tam');
          bump('tam', 25);
          later(1, 'tamWalks');
          says(
            'tam',
            '"Nine years." Big Tam unwraps his fists. "I ran from the silo so I would never bleed for the King again. Nine years I bled for him."',
          );
          go('talk', 'tam');
        },
      ],
  ];
});

// Eel: the drowned vault was Sal's retirement. Empty it, and you can give her Sal's half, or keep it all.
jobs('eel', () => {
  const f = S.f;
  return [
    f.mallVault &&
      !f.eelShare &&
      home('eel', 'mall') &&
      S.teeth >= 100 && [
        '"Sal\'s half of the vault. 100 teeth. It was always his."',
        () => {
          pay(100);
          f.eelShare = 1;
          bump('eel', 40);
          later(2, 'eelRetires');
          says(
            'eel',
            'Eel counts it twice, then stops counting. "He always said we\'d retire on it." She hangs her dive knife on the wall.',
          );
          go('talk', 'eel');
        },
      ],
  ];
});

// Bert: his father takes a cut from the raiders on the farm road. Bert goes to the Sheriff.
jobs('bert', () => {
  const f = S.f;
  return [
    knew('hector.secret') &&
      !f.bertTold &&
      home('bert', 'farm') &&
      alive('hector') && [
        '"Your dad takes a cut from the raiders on the farm road."',
        () => {
          f.bertTold = 1;
          spill('hector', 'bert');
          bump('bert', 10);
          later(1, 'bertReports');
          says(
            'bert',
            '"Dad says thieving is a sin." Bert stands up. "Dad says a lot of things." He puts his good boots on.',
          );
          go('talk', 'bert');
        },
      ],
  ];
});

Object.assign(LATER, {
  fernGoes: () => {
    if (!home('fern', 'green')) return;
    S.n.fern.loc = 'gone';
    S.f.fernGone = 1;
    rx(
      'gardener',
      '"Fern walked out of the gate this morning, east, with a sack of seeds. She didn\'t look back. She never does."',
    );
    rx('moss', '"Fern went to find the sea. She promised to tell me if it hums."');
  },
  vaneTells: () => {
    if (!plotOpen('poison')) return;
    stopPlot('poison');
    S.f.vaneSaved = 1;
    bump('doc', -40);
    rx('mayor', '"Dr. Vane says my tea was poison. I have switched to gin. For my heart."');
    rx(
      'doc',
      '"Vane told Fenwick. My own apprentice. I taught him everything except loyalty. I never had any to teach."',
    );
  },
  tamWalks: () => {
    if (!home('tam', 'snakeeyes')) return;
    S.f.tamHome = 1;
    if (alive('gus') && S.n.gus.loc === 'scrapwell') {
      S.n.tam.loc = 'scrapwell';
      S.f.brothers = 1;
      S.f.tamTold = 1;
      rx(
        'gus',
        '"A man walked into Scrapwell with my brother\'s face. He IS my brother. He took my pick off me and started digging."',
      );
    } else S.n.tam.loc = 'gone';
    rx(
      'pips',
      '"My fighter walked out. Somebody told him where the money goes. Fight night is cancelled. Refunds are not."',
    );
  },
  eelRetires: () => {
    if (!home('eel', 'mall')) return;
    S.n.eel.loc = 'rustwater';
    rx('eel', '"I bought a bath. A whole bath, in Rustwater. I fill it and I sit in it and I don\'t dive."');
  },
  bertReports: () => {
    if (!alive('hector') || !alive('sheriff')) return;
    S.f.hectorFined = 1;
    bump('hector', -30);
    rx(
      'sheriff',
      '"Bert came in about his own father. Brave boy. Stupid boy. Hector pays the road back, or I hang the road money on him."',
    );
    rx('hector', '"My own son. To the Sheriff. Over road money." He looks at you. "Who told him?"');
  },
});

const _linkLinesPeople = linkLines;
linkLines = () => {
  const L = _linkLinesPeople(),
    f = S.f;
  if (f.fernGone && alive('fern'))
    L.push(
      'Fern walked east to find out if the sea was real. She never wrote. The Green says she found it, because it would rather.',
    );
  if (f.vaneSaved && alive('mayor'))
    L.push("Dr. Vane saved the Mayor from Doc's tea. Fenwick paid him in water for life. Vane never drinks it.");
  if (f.mossBright && alive('moss'))
    L.push("Moss kept Nigel's feather tied to his chain. The Green's lights burned brighter after that, in B flat.");
  if (f.tamHome && alive('tam') && !f.brothers)
    L.push('Big Tam walked out of the pit and kept walking. Pips never found another fighter like him.');
  if (f.eelShare && alive('eel'))
    L.push("Eel retired on Sal's half of the vault. She bought a bath in Rustwater and never dived again.");
  else if (f.mallVault && alive('eel'))
    L.push(
      "Eel never knew who emptied Sal's vault. She dived for the thief every day, for years. She's still looking.",
    );
  if (f.hectorFined && alive('bert') && alive('hector'))
    L.push(
      'Bert turned his father in over the road money. Hector never spoke to him again. They farmed side by side for thirty years in silence.',
    );
  return L;
};
