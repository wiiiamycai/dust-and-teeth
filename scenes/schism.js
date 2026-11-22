'use strict';
// ================= THE TOASTER SCHISM: fanatics against tech priests =================
// Brother Crumb's church split over his silent Toaster.
//   The Crust (Deacon Rind, Scrapwell): a machine that works is the sin that burned the world.
//   The Coil (Mother Ohm, the crashed Sky-Bus): machines are the gods, asleep, and must be made to speak.
// No background noise. Four big moments on fixed days, each a plot you can swing, sell out or loot. Ignored, each
// one still happens and changes something for good. Between them the war is in the valley every day: patrols on
// the road, people you know picking sides, and whoever you help treats you better. Fixing the Toaster lifts the
// Coil; stealing it lifts the Crust. At the end, whoever won more holds the chapel and the plane.
const crustP = () => (S.f.crust || 0) + (S.f.tstolen ? 2 : 0);
const coilP = () => (S.f.coil || 0) + (S.f.tfixed ? 2 : 0);
const crustUp = n => (S.f.crust = (S.f.crust || 0) + n);
const coilUp = n => (S.f.coil = (S.f.coil || 0) + n);
const crustOn = () => alive('rind') && !S.f.crustBroken && !S.f.schismPeace;
const coilOn = () => alive('ohm') && !S.f.coilBroken && !S.f.schismPeace;
const schismOn = () => crustOn() && coilOn();
const crustFriend = () => S.f.faith === 'crust' || S.n.rind.op >= 30;
const coilFriend = () => S.f.faith === 'coil' || S.n.ohm.op >= 30;
const crustFoe = () => S.f.faith === 'coil' || S.n.rind.op <= -40;
const coilFoe = () => S.f.faith === 'crust' || S.n.ohm.op <= -40;
Object.assign(ENEMY, {
  zealot: { n: 'Crust zealot', i: '🔥', lvl: 3, wep: 'pipe' },
  acolyte: { n: 'Coil acolyte', i: '⚡', lvl: 3, wep: 'zipgun', arm: 'jacket' },
});
Object.assign(CK, {
  'rind.break': { sk: 'speech', base: -10, who: 'rind', lock: 'once' },
  'ohm.stay': { sk: 'speech', base: -10, who: 'ohm', lock: 'once', likes: { 'ohm.secret': 15 } },
  'crumb.peace': {
    sk: 'speech',
    base: -15,
    who: 'crumb',
    lock: 'change',
    likes: { 'rind.secret': 15, 'ohm.secret': 15 },
    mods: () => (S.f.tfixed ? 10 : 0),
  },
});

// ---- joining ----
function joinFaith(side) {
  const f = S.f;
  f.faith = side;
  if (side === 'crust') {
    bump('rind', 30);
    bump('ohm', -40);
    addTitle('Brother of the Crust');
    give('gutglue', 2);
    says(
      'rind',
      '"Brother." He smears ash on your forehead and gives you two loaves of blessed bread. It is Gut Glue. Bread is a strong word.',
    );
    confide('rind', 0);
    go('talk', 'rind');
  } else {
    bump('ohm', 30);
    bump('rind', -40);
    addTitle('Acolyte of the Coil');
    practice('science', 6);
    says(
      'ohm',
      '"Sit. Buckle in." She teaches you the first prayer, which is how a fuse works. Nobody has ever explained a fuse to you before.',
    );
    go('talk', 'ohm');
  }
}

// ---- the people ----
TALK.rind = () => {
  const f = S.f,
    o = [newsOpt('rind', '"Every machine that works is a lie about God. We are correcting the lies, one at a time."')];
  if (!knew('rind.creed'))
    o.push([
      '"What does the Crust want?"',
      () => {
        know('rind.creed');
        if (plotOpen('plane')) know('plot.plane');
        says(
          'rind',
          '"The Toaster was silent for two hundred years. That silence IS the sermon. Machines burned the world. The Coil worship the matches." He smiles. "On the ninth we burn their plane. Come and hold a torch."',
        );
        go('talk', 'rind');
      },
    ]);
  if (!f.faith && crustOn()) o.push(['"I want to join the Crust."', () => joinFaith('crust')]);
  if (knew('rind.secret') && crustOn())
    o.push(
      chkOpt('rind.break', null, '"You were a mechanic. You fixed the pump that poisoned your own village."', () => {
        if (attempt('rind.break')) {
          f.crustBroken = 1;
          stopSchism();
          karma(2);
          if (f.pumpBroken) {
            f.pumpBroken = 0;
            f.waterUp = Math.max(0, (f.waterUp || 0) - 4);
          }
          rx(
            'crumb',
            '"Rind came to the chapel and asked me to pray for his hands. I have never been so happy to be asked anything."',
          );
          rx(
            'ohm',
            '"The Crust have gone home. Their deacon is fixing things now. The Voice says nothing. I say thank you."',
          );
          say(
            'Rind looks at his hands for a long time. He puts the torch out in the sand. The Crust go home, one by one. Next morning he is in Rustwater with a wrench, fixing the pump.',
          );
        } else {
          bump('rind', -30);
          says('rind', '"A lie of the Coil. I know their voice." He stops smiling at you.');
        }
        go('talk', 'rind');
      }),
    );
  return {
    t: !crustOn()
      ? "Deacon Rind, sleeves rolled up, oil to the elbows. He doesn't preach any more. He fixes things, and won't say why."
      : f.faith === 'crust'
        ? 'Deacon Rind clasps your hands. He smells of lamp oil. "Brother. What have you broken today?"'
        : 'Deacon Rind: a burnt robe, a torch that never goes out, and mechanic\'s hands he keeps in his sleeves. Behind him, a dozen people in sackcloth are smashing a clock. "Repent, or burn. Both are fine."',
    o,
  };
};
TALK.ohm = () => {
  const f = S.f,
    o = [newsOpt('ohm', '"The radio spoke again last night. It said: please remain seated. We are remaining seated."')];
  if (!knew('ohm.creed'))
    o.push([
      '"What do you pray for?"',
      () => {
        know('ohm.creed');
        says(
          'ohm',
          '"For the machines to wake. They fell asleep when the bombs fell, and the world went quiet. We wake them one wire at a time. Bring me a coil, any coil, and you\'ll be blessed."',
        );
        go('talk', 'ohm');
      },
    ]);
  if (has('coil') && !f.ohmCoil)
    o.push([
      'Give Mother Ohm a heating coil',
      () => {
        take('coil');
        f.ohmCoil = 1;
        coilUp(1);
        practice('science', 6);
        say(
          `She kisses the coil. Then she shows you how it works, which nobody has ever done. She gives you ${partFind()} from the plane's hold. "The Voice thanks you. I thank you."`,
        );
        confide('ohm', 25);
        go('talk', 'ohm');
      },
    ]);
  if (!f.faith && coilOn()) o.push(['"I want to join the Coil."', () => joinFaith('coil')]);
  if (alive('nigel') && !knew('ohm.nigel'))
    o.push([
      '"There\'s a man in the Scrapwell well who glows."',
      () => {
        know('ohm.nigel');
        bump('ohm', 10);
        rx(
          'nigel',
          '"People in robes come to the well now. They pray at Nigel. They want Nigel to light a bulb. Nigel is not a bulb."',
        );
        says(
          'ohm',
          '"He GLOWS? Then he\'s a saint of current." She is writing it down. Nigel is about to get visitors.',
        );
        go('talk', 'ohm');
      },
    ]);
  if (knew('ohm.secret') && coilOn())
    o.push([
      '"Tell your flock the Voice is a recording. Or I will."',
      () => {
        f.coilBroken = 1;
        stopSchism();
        bump('ohm', -60);
        rx(
          'crumb',
          '"The Coil have unbuckled. Some came back to the chapel. They keep asking the Toaster to speak. I keep saying it already has."',
        );
        rx('rind', '"The Coil are finished. Their Voice was a tape. God is good, and silent."');
        say(
          'You play the loop to the whole plane: please remain seated, please remain seated. The Coil unbuckle, one by one, and walk out into the sand. Mother Ohm stays in her seat.',
        );
        go('talk', 'ohm');
      },
      'danger',
    ]);
  return {
    t: !coilOn()
      ? 'Mother Ohm, alone in the last seat of the plane, headset on. The radio says please remain seated. She remains seated.'
      : f.faith === 'coil'
        ? 'Mother Ohm makes room for you in the aisle. "Acolyte. Sit. Listen. It hums for you too."'
        : 'Mother Ohm: welding goggles, a robe sewn from seat covers, and a radio headset she never takes off. The Coil sit buckled into the seats around her. "Please. Sit. The Voice is about to speak."',
    o,
  };
};
// Crumb, caught in the middle. He can end it, if he gets both in one room.
const _crumbSchism = TALK.crumb;
TALK.crumb = () => {
  const r = _crumbSchism(),
    f = S.f;
  if (f.schismPeace) r.t += ' Two congregations now, one Toaster. They sit on opposite sides and pass the butter.';
  else if (schismOn()) r.t += ' Half his flock burns machines now, and half worships them. He prays for both, alone.';
  if (schismOn() && S.n.rind.ch && S.n.ohm.ch)
    r.o.push(
      chkOpt('crumb.peace', null, '"Get Rind and Mother Ohm in one room. You started this. End it."', () => {
        if (attempt('crumb.peace')) {
          f.schismPeace = 1;
          stopSchism();
          karma(2);
          addTitle('Breaker of Bread');
          bump('crumb', 30);
          rx(
            'rind',
            '"Crumb made me sit with the Mother of Wires. We ate toast. It was not a miracle. It was nearly one."',
          );
          rx('ohm', '"I shared bread with Rind. He burnt it on purpose. I ate it on purpose."');
          say(
            'Crumb puts the Toaster on the table between them. Nobody speaks for an hour. Then Rind says it was a good toaster, once. Mother Ohm says it still is. Something like peace starts there.',
          );
        } else
          says('crumb', '"They won\'t sit in the same room as each other. They barely sit in the same room as me."');
        go('talk', 'crumb');
      }),
    );
  return r;
};
function stopSchism() {
  for (const k of ['plane', 'pump', 'saint', 'tooth']) if (!S.f['plot_' + k]) S.f['plot_' + k] = 'stopped';
}

// ---- 1. the plane, day 9: the Crust come to burn the Coil's plane ----
PLOTS.plane = {
  where: 'skybus',
  day: () => 9,
  live: () => schismOn() && !S.f.planeStand && !S.f.planeLoot,
  known: () => plotKnown('plane'),
  clue: { crumb: 1, ohm: 1, nigel: 1 },
  clueLine: '"Rind\'s people are soaking rags in lamp oil. They say the Coil\'s plane burns on the ninth."',
  sign: {
    where: 'scrapwell',
    t: 'Behind the chapel, people in sackcloth soak rags in lamp oil and sing. One of them is drawing a plane, on fire.',
  },
  after: { skybus: () => (S.f.planeBurned ? "Half the plane is black. The Coil pray in the half that isn't." : '') },
  hit: seen => planeBurns(1, seen),
  opts: {
    ohm: () => [
      '"The Crust are coming to burn the plane on the ninth."',
      () => {
        stopPlot('plane');
        S.f.planeHeld = 1;
        coilUp(2);
        crustUp(-1);
        bump('ohm', 25);
        bump('rind', -15);
        rx('rind', '"The plane bit us. It was wired to its own battery. Somebody warned the Mother of Wires."');
        says(
          'ohm',
          '"Then we will let them touch it." The Coil wire the hull to the plane\'s last battery. When the Crust come, the plane bites back.',
        );
        go('talk', 'ohm');
      },
    ],
    ohm2: () =>
      S.day < 9
        ? [
            '"I\'ll stand with you when they come." (until day 9)',
            () => {
              S.f.planeStand = 1;
              if (!waitFor(9)) return go('ending');
              S.here = 'skybus';
              say('The ninth. Torches on the dunes. The Crust come singing.');
              fight([spawn('zealot'), spawn('zealot'), spawn('zealot')], {
                allies: alive('ohm') ? ['ohm'] : [],
                started: true,
                win: 'planeHeld',
                back: ['map'],
              });
            },
            'danger',
          ]
        : null,
    rind: () => [
      '"I\'ll show your people the soft way in."',
      () => {
        stopPlot('plane');
        planeBurns(2, true);
        crustUp(1);
        gain(40);
        karma(-1);
        bump('rind', 25);
        bump('ohm', -50);
        rx('ohm', '"Somebody showed them the cargo door. The wing where the Voice slept is ash."');
        says('rind', '"The cargo door. Of course. Forty teeth, brother. God loves an inside man."');
        go('talk', 'rind');
      },
      'danger',
    ],
  },
  hub: {
    skybus: () =>
      S.day < 9
        ? [
            'Come back on the ninth and strip the plane while they fight (until day 9)',
            () => {
              S.f.planeLoot = 1;
              if (!waitFor(9)) return go('ending');
              S.here = 'skybus';
              S.f.plot_plane = 'done';
              planeBurns(1, true);
              coilUp(-1);
              gain(40);
              say(
                `While the Crust and the Coil fight in the smoke, you walk out of the hold with ${partFind()}, ${partFind()} and 40 teeth. Both churches blame the other.`,
              );
              goHere();
            },
          ]
        : null,
  },
};
function planeBurns(how, seen) {
  S.f.planeBurned = how;
  crustUp(2);
  coilUp(-1);
  if (seen)
    bad(
      how === 2
        ? 'The Crust burned the whole wing. The Coil pray in the ashes.'
        : 'The Crust burned half the plane. The Coil held the cockpit.',
    );
  rx('crumb', '"Rind burned the Coil\'s plane. They were my congregation too. All of them were."');
}
WIN.planeHeld = () => {
  S.f.plot_plane = 'stopped';
  S.f.planeHeld = 1;
  coilUp(3);
  crustUp(-2);
  bump('ohm', 40);
  bump('rind', -30);
  give('ammo', 6);
  say(
    `The Crust run back over the dunes. Mother Ohm gives you 6 bullets and ${partFind()}. "The Voice saw that. I saw that."`,
  );
  go('hub', 'skybus');
};

// ---- 2. the pump, day 15: the Crust break Rustwater's pump ----
PLOTS.pump = {
  where: 'rustwater',
  day: () => 15,
  live: () => crustOn(),
  known: () => plotKnown('pump'),
  clue: { moe: 1, jeb: 1, rind: 1, sheriff: 1 },
  clueLine: "\"The Crust say Rustwater's pump is the devil's bladder. They're going to break it on the fifteenth.\"",
  sign: {
    where: 'rustwater',
    t: 'Someone has chalked a crossed-out cog on the pump housing. Then another. Then forty.',
  },
  after: { rustwater: 'The pump coughs more than it pumps. The Crust have chalked a halo over it.' },
  hit: seen => pumpBreaks(seen),
  opts: {
    sheriff: () => [
      '"The Crust will hit the pump on the fifteenth."',
      () => {
        stopPlot('pump');
        crustUp(-1);
        bump('sheriff', 10);
        bump('rind', -15);
        rx('rind', '"Crane sat on the pump all night with a rifle. Somebody told her. God sees who."');
        says('sheriff', '"Then I\'ll be sitting on it, with a rifle, all night." She is.');
        go('talk', 'sheriff');
      },
    ],
    mayor: () => [
      '"Fanatics are coming for your pump."',
      () => {
        stopPlot('pump');
        S.f.coilGuards = 1;
        S.f.waterUp = (S.f.waterUp || 0) + 1;
        coilUp(2);
        gain(30);
        rx(
          'ohm',
          '"Fenwick pays us to guard his pump. The Coil are paid to pray over a machine. This is the Second Coming."',
        );
        says(
          'mayor',
          '"Then I\'ll hire the OTHER fanatics to guard it. The ones who like machines. 30 teeth for your trouble. Water goes up one, for security."',
        );
        go('talk', 'mayor');
      },
    ],
    rind: () => [
      '"I\'ll carry the hammer."',
      () => {
        stopPlot('pump');
        pumpBreaks(true);
        crustUp(1);
        gain(30);
        karma(-2);
        bump('rind', 25);
        if (alive('sheriff')) bump('sheriff', -15);
        rx('sheriff', '"Someone broke the pump from inside the fence. Someone the town knows."');
        says(
          'rind',
          '"Swing it like a prayer, brother." You do. Rustwater will pay for that swing in water for a long time.',
        );
        go('talk', 'rind');
      },
      'danger',
    ],
  },
};
function pumpBreaks(seen) {
  S.f.pumpBroken = 1;
  S.f.waterUp = (S.f.waterUp || 0) + 4;
  crustUp(2);
  if (seen) bad("The Crust broke Rustwater's pump. Water costs four teeth more now.");
  rx('moe', '"Pump\'s half broke. Water\'s up four. Fanatics. In MY town."');
  rx('mayor', '"The fanatics broke my pump. I have raised the price of water, out of grief."');
}

// ---- 3. the saint, day 18: the Coil come for Sprocket, the Crust for her bench ----
PLOTS.saint = {
  where: 'mall',
  day: () => 18,
  live: () => schismOn() && alive('sprocket') && S.n.sprocket.loc === 'mall',
  known: () => plotKnown('saint'),
  clue: { eel: 1, gums: 1, margie: 1, ohm: 1, rind: 1 },
  clueLine:
    '"The Coil want Sprocket for a saint. The Crust want her bench in the fire. Both are coming for her on the eighteenth."',
  sign: {
    where: 'mall',
    t: "Two notes nailed to Sprocket's bench. One says BLESSED. One says BURN. She has nailed up a third: GO AWAY.",
  },
  after: {
    mall: () =>
      S.f.benchBurned
        ? "Sprocket's bench is a black frame. Somebody has painted a halo on it, and somebody else has crossed it out."
        : '',
  },
  hit: seen => {
    if (coilP() >= crustP()) sprocketTaken(seen);
    else benchBurns(seen);
  },
  opts: {
    sprocket: () => [
      '"The Coil want you for a saint. Go with them, on your terms."',
      () => {
        stopPlot('saint');
        sprocketTaken(false);
        bump('sprocket', 10);
        says(
          'sprocket',
          '"A saint gets a bigger bench, I suppose. And nobody burns a saint\'s." She packs her tools for the plane.',
        );
        goHere();
      },
    ],
    sprocket2: () => [
      '"Hide your tools. Let them both find an empty bench."',
      () => {
        stopPlot('saint');
        S.f.benchHidden = 1;
        crustUp(-1);
        coilUp(-1);
        bump('sprocket', 30);
        says(
          'sprocket',
          'She moves everything into a drowned shoe shop for a week. On the eighteenth both churches find a bare checkout, and fight each other over it instead.',
        );
        go('talk', 'sprocket');
      },
    ],
    rind: () => [
      '"Sprocket\'s bench is unguarded on the eighteenth."',
      () => {
        stopPlot('saint');
        benchBurns(true);
        crustUp(1);
        gain(30);
        karma(-1);
        bump('rind', 20);
        says('rind', '"A machine-mother\'s altar. Thirty teeth, brother. The smoke will be beautiful."');
        go('talk', 'rind');
      },
      'danger',
    ],
    ohm: () => [
      '"Take Sprocket now, before the Crust burn her bench."',
      () => {
        stopPlot('saint');
        sprocketTaken(true);
        coilUp(1);
        bump('ohm', 15);
        bump('sprocket', -20);
        says(
          'ohm',
          '"Now. Tonight. With singing." The Coil carry Sprocket to the plane in a chair. She does not sing.',
        );
        go('talk', 'ohm');
      },
    ],
  },
};
function sprocketTaken(seen) {
  S.f.saintSprocket = 1;
  S.n.sprocket.loc = 'skybus';
  coilUp(2);
  if (seen)
    bad('The Coil carried Sprocket to the plane on a chair, singing. She is their saint now. Her bench went with her.');
  rx('sprocket', '"They kneel when I fix things. I can\'t work with people kneeling. I work anyway."');
}
function benchBurns(seen) {
  S.f.benchBurned = 1;
  crustUp(2);
  if (seen)
    bad("The Crust burned Sprocket's bench to the frame. She stood in the smoke with a shotgun and didn't fire.");
  rx('sprocket', '"Twenty years of tools. They sang while it burned. I can fix anything except that."');
}
// The bench follows the saint. A burned bench is gone.
const _talkSprocketSchism = TALK.sprocket;
TALK.sprocket = () => {
  const r = _talkSprocketSchism();
  if (S.f.benchBurned) {
    r.o = r.o.filter(o => !o || !String(o[0]).includes('Can you fit something'));
    r.t =
      'Sprocket, sitting on the black frame of her bench, cleaning a gun nobody asked her to clean. "No bench. No mods. Don\'t ask."';
  } else if (S.n.sprocket.loc === 'skybus') {
    r.o.unshift(['"Can you fit something?" (upgrade your gear)', () => go('bench')]);
    r.t =
      'Saint Sprocket, at a bench in the plane\'s galley. Three acolytes kneel behind her. "Teeth plus parts. And tell them to stop kneeling."';
  }
  return r;
};

// ---- 4. the Big Tooth, day 23: the Coil march to kneel to the King's missile ----
PLOTS.tooth = {
  where: 'skybus',
  day: () => 23,
  live: () => coilOn() && alive('king') && !S.f.kingStopped && !S.f.toothMarch,
  known: () => plotKnown('tooth'),
  clue: { gums: 1, rook: 1, ohm: 1, rind: 1 },
  clueLine:
    '"The Coil say the King\'s missile is the Second Coming. On the twenty-third they march to the Silo to kneel to it. The Crust mean to meet them on the road."',
  sign: {
    where: 'skybus',
    t: 'The Coil are painting a banner: THE BIG TOOTH IS RISEN. Mother Ohm is polishing her goggles for a long walk.',
  },
  hit: seen => {
    if (crustOn() && crustP() > coilP()) coilMassacred(seen);
    else coilKneels(seen);
  },
  opts: {
    ohm: () =>
      chkOpt('ohm.stay', null, '"Don\'t march. The King will use you, then burn you."', () => {
        if (attempt('ohm.stay')) {
          stopPlot('tooth');
          coilUp(-1);
          bump('ohm', 15);
          says(
            'ohm',
            'Mother Ohm takes off her headset for the first time anyone remembers. "...Then we stay in our seats." The banner comes down.',
          );
        } else says('ohm', '"The Big Tooth calls. We go. You can come, or you can watch."');
        go('talk', 'ohm');
      }),
    ohm2: () =>
      S.day < 23
        ? [
            '"I\'ll march with you." (until day 23)',
            () => {
              S.f.toothMarch = 1;
              if (!waitFor(23)) return go('ending');
              learnSilo();
              if (crustOn() && crustP() > coilP()) {
                S.here = 'silo';
                say('The Silo road. The Crust are waiting in the rocks, exactly where Rind said they would be.');
                return fight([spawn('zealot'), spawn('zealot'), spawn('zealot')], {
                  allies: alive('ohm') ? ['ohm'] : [],
                  started: true,
                  win: 'toothMarch',
                  back: ['map'],
                });
              }
              WIN.toothMarch();
            },
            'danger',
          ]
        : null,
    rind: () => [
      '"The Coil march on the twenty-third. Here\'s their road."',
      () => {
        stopPlot('tooth');
        S.f.toothSold = 1;
        crustUp(3);
        gain(40);
        karma(-2);
        bump('rind', 25);
        later(Math.max(1, 23 - S.day), 'toothAmbush');
        says(
          'rind',
          '"Every rock on that road will be a deacon." He pays you 40 teeth and starts sharpening something.',
        );
        go('talk', 'rind');
      },
      'danger',
    ],
  },
};
function coilKneels(seen) {
  S.f.coilKing = 1;
  coilUp(2);
  if (seen)
    bad(
      'The Coil knelt at the Silo gate. The King took them in as acolytes. His gate has new guards who pray while they watch.',
    );
  rx(
    'king',
    '"A choir of tinkers came to worship my Tooth. I let them oil it. Everyone needs a hobby before the end."',
  );
}
function coilMassacred(seen) {
  offstage(
    'ohm',
    'The Crust met the Coil procession on the Silo road. Mother Ohm never reached the Big Tooth. Nobody in her robe did.',
    seen,
  );
  S.f.coilBroken = 1;
  S.f.coilMassacre = 1;
  crustUp(2);
}
LATER.toothAmbush = () => {
  if (!alive('ohm') || S.f.coilBroken) return;
  coilMassacred(true);
};
WIN.toothMarch = () => {
  S.f.plot_tooth = 'stopped';
  S.f.siloIn = 1;
  coilKneels(false);
  bump('ohm', 30);
  S.here = 'silo';
  say(
    'The Coil walk through the Silo gate singing, and you walk in among them in a borrowed robe. Nobody stops a choir.',
  );
  goHere();
};
// The King's new acolytes watch the gate. A friend of the Coil can walk in with them.
const _sneakSchism = CK['silo.sneak'].mods;
CK['silo.sneak'].mods = () => (_sneakSchism ? _sneakSchism() : 0) - (S.f.coilKing ? 10 : 0);
const _huboSiloSchism = HUBO.silo;
HUBO.silo = () => {
  const o = _huboSiloSchism();
  if (!S.f.siloIn && S.f.coilKing && alive('ohm') && coilFriend())
    o.unshift([
      'Walk in with the Coil, singing',
      () => {
        S.f.siloIn = 1;
        say('A Coil acolyte on the gate knows your face. "Brother of the wire." You walk in.');
        goHere();
      },
    ]);
  return o;
};

// ---- every day: the war on the road and in the towns ----
const _pickEncSchism = pickEnc;
pickEnc = dest => {
  const e = _pickEncSchism(dest);
  if (e || S.day < 3 || S.f.schismPeace || !roll(18)) return e;
  const sides = [crustOn() ? 'crust' : null, coilOn() ? 'coil' : null].filter(Boolean);
  return sides.length ? pick(sides) : null;
};
ENC.crust = d => {
  const en = () => [spawn('zealot'), spawn('zealot')];
  if (crustFoe())
    return {
      title: 'Crust zealots',
      icon: '🔥',
      t: 'Crust zealots across the road, torches lit. "That one. The machine-lover." They come at you singing.',
      o: [
        ['Fight', () => fight(en(), { started: true, win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          'Run',
          () => {
            if (roll(fleeP())) {
              say('You run. They sing after you for a long way.');
              go('hub', d);
            } else fight(en(), { win: 'enc', args: [d] });
          },
        ],
      ],
    };
  if (crustFriend())
    return {
      title: 'Crust zealots',
      icon: '🔥',
      t: 'Crust zealots on the road, smashing a pre-war clock with rocks. They know you. They bless you with ash and share their bread.',
      o: [
        [
          'Eat with them',
          () => {
            say(`Burnt bread, black at the edges. Holy, they say. +${heal(10)} HP.`);
            go('hub', d);
          },
        ],
      ],
    };
  return {
    title: 'Crust zealots',
    icon: '🔥',
    t: 'People in sackcloth around a fire, feeding it a radio. "Brother. Have you got anything that ticks? Throw it in."',
    o: [
      [
        'Throw something in and sing with them',
        () => {
          bump('rind', 10);
          bump('ohm', -5);
          say('You throw in a spoon. It does not tick. They cheer anyway. Word will get back to Rind.');
          go('hub', d);
        },
      ],
      ['Keep walking', () => go('hub', d)],
      ['Fight', () => fight(en(), { started: true, win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
    ],
  };
};
ENC.coil = d => {
  const en = () => [spawn('acolyte'), spawn('acolyte')];
  if (coilFoe())
    return {
      title: 'Coil acolytes',
      icon: '⚡',
      t: 'Coil acolytes on the road, goggles down. One points a zip gun at you. "The torch-bearer. The Voice says no."',
      o: [
        ['Fight', () => fight(en(), { started: true, win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
        [
          'Run',
          () => {
            if (roll(fleeP())) {
              say('You run. A zip gun misses you by a prayer.');
              go('hub', d);
            } else fight(en(), { win: 'enc', args: [d] });
          },
        ],
      ],
    };
  if (coilFriend())
    return {
      title: 'Coil acolytes',
      icon: '⚡',
      t: "Coil acolytes, dragging a dead generator home like a saint's body. They know you. One presses something into your hand.",
      o: [
        [
          'Take it',
          () => {
            say(`${partFind()}, still in its pre-war wrapper. "The Voice wants you armed."`);
            go('hub', d);
          },
        ],
      ],
    };
  return {
    title: 'Coil acolytes',
    icon: '⚡',
    t: 'Coil acolytes, kneeling round a broken traffic light, praying it green. "Brother. Five teeth for the Voice?"',
    o: [
      [
        `Give them 5 teeth for the Voice`,
        () => {
          if (pay(5)) {
            bump('ohm', 10);
            bump('rind', -5);
            say('They thank you in a language that is mostly part numbers. Word will get back to Mother Ohm.');
          }
          go('hub', d);
        },
      ],
      ['Keep walking', () => go('hub', d)],
      ['Fight', () => fight(en(), { started: true, win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
    ],
  };
};
// The Smiling Few are joining the side that is winning.
const _encCultSchism = ENC.cult;
ENC.cult = d => {
  const r = _encCultSchism(d);
  if (crustOn() && crustP() >= coilP() + 2)
    r.t += ' Their robes have a crossed-out cog sewn on. The Crust are recruiting.';
  else if (coilOn() && coilP() >= crustP() + 2)
    r.t += ' Each of them wears a copper wire round one wrist. The Coil are recruiting.';
  return r;
};
// What you see in Scrapwell and at the plane.
const _hubtScrapSchism = HUBT.scrapwell;
HUBT.scrapwell = () =>
  _hubtScrapSchism() +
  (S.f.schismPeace
    ? ' Two congregations share the chapel now, on alternate days.'
    : crustOn()
      ? ' Behind the chapel, the Crust smash something mechanical every morning, and sing about it.'
      : '');
const _hubtSkybusSchism = HUBT.skybus;
HUBT.skybus = () =>
  _hubtSkybusSchism() +
  (coilOn()
    ? ' Inside, the Coil sit buckled in their seats, waiting for the radio to speak.' +
      (S.f.planeBurned === 2 ? ' One wing is ash.' : S.f.planeBurned ? ' Half of it is black.' : '')
    : alive('ohm')
      ? ' One woman sits in the last seat, listening to a headset.'
      : '');

// ---- ripples ----
ripAdd('rind', () => {
  rx('crumb', '"Rind is dead. I taught him to pray. I will pray for him, and he would hate it."');
  rx(
    'ohm',
    '"The torch-bearer is dead. The Coil are not sad. I am, a little. He understood machines better than any of us."',
  );
});
ripAdd('ohm', () => {
  rx('crumb', '"Mother Ohm is gone. She heard a hum where I heard silence. We were both listening, at least."');
  rx('rind', '"The Mother of Wires is dead. Praise the silence."');
  rx('sprocket', '"That goggle woman is dead. She was the only person who ever thanked me properly."');
});

// ---- ending slides ----
const _linkLinesSchism = linkLines;
linkLines = () => {
  const f = S.f,
    L = _linkLinesSchism();
  if (f.schismPeace)
    L.push(
      "Crumb's two churches share one chapel. The Crust smash a clock on Sundays, and the Coil fix it on Mondays. Everyone gets toast.",
    );
  else if (f.crustBroken && alive('rind'))
    L.push(
      "Deacon Rind put down his torch and picked up a wrench. He keeps Rustwater's pump running, and won't say why.",
    );
  else if (f.coilMassacre)
    L.push(
      'The Crust met the Coil on the Silo road. Nobody kneels to a machine in the valley now. The plane is a shrine to fire.',
    );
  else if (f.coilBroken && alive('ohm'))
    L.push(
      'The Coil learned their Voice was a tape. Mother Ohm still listens to it, alone, in the last seat of the plane.',
    );
  else if (alive('rind') && alive('ohm')) {
    const c = crustP(),
      k = coilP();
    L.push(
      c > k
        ? 'The Crust won the quiet war. The chapel smells of smoke, and every clock in Scrapwell is stopped.'
        : k > c
          ? "The Coil won. Crumb's chapel is a workshop now. The Toaster sits on the altar, wired to a battery, warm forever."
          : "Neither church won. They still fight over Crumb's Toaster, in Crumb's chapel, in Crumb's name.",
    );
  }
  if (f.saintSprocket && alive('sprocket'))
    L.push(
      "Saint Sprocket kept the Coil's plane running until it almost flew. She never let them kneel while she worked.",
    );
  else if (f.benchBurned) L.push('Sprocket never rebuilt her bench. The Crust still sing about the night it burned.');
  if (f.pumpBroken && !f.crustBroken)
    L.push("Rustwater's pump never worked right after the Crust got to it. Water stayed dear.");
  if (f.faith)
    L.push(
      f.faith === 'crust'
        ? 'You wore the ash of the Crust to the end.'
        : 'You wore the copper wire of the Coil to the end.',
    );
  if (f.tractorRuns) L.push("Bert's tractor ran backwards for years. Hector's farm never quite died.");
  return L;
};
