'use strict';
// ================= THE GREEN: the rumour is true, sort of =================
// Far east, over the mountain pass: a walled greenhouse dome with real food and clean water. Forty people,
// and the Warden lets almost nobody in. Late game only: you need the pass (Jeb's cave, the Sky-Bus charts,
// or a ride with Jeb himself), and the dust storms over it don't drop until day 15. The pass takes two days.
// Underneath, Moss keeps the lights on, chained to the algae vats. The Gardener keeps it small, and kind, and
// counted. The big choice: smuggle seeds to the valley, which ends the Green being the only green, or keep
// the secret and have a bed behind the wall.

const GREEN_DAY = 15;
const greenOpen = () => !!S.f.knowGreen && S.day >= GREEN_DAY;
const inGreen = () => S.here === 'green' || S.here === 'vats';
function learnGreen(how) {
  if (S.f.knowGreen) return;
  S.f.knowGreen = how || 1;
  say(
    'The pass east is on your map.' +
      (S.day < GREEN_DAY ? ' The dust storms over it are a wall until the middle of the month.' : ''),
  );
}
// Travel: the pass is shut by storms until day 15, and takes two days each way.
const _travelGreen = travel;
travel = k => {
  if (k === 'green' && !greenOpen()) {
    if (tick()) return go('ending');
    bad('The pass is a wall of dust. You walk into it for a day and come out where you started, at the Sky-Bus.');
    return go('hub', 'skybus');
  }
  if ((k === 'green' || inGreen()) && k !== S.here) {
    say(k === 'green' ? 'Two days up the pass, through rock and old snow-fences.' : 'Two days down the pass.');
    if (tick()) return go('ending');
  }
  _travelGreen(k);
};
const _hubGreen = SC.hub;
SC.hub = loc => {
  if ((loc === 'green' || loc === 'vats') && !greenOpen()) return _hubGreen('skybus');
  if (loc === 'green') greenArrivals();
  return _hubGreen(loc);
};
// People who went "east" turn up here, eventually.
function greenArrivals() {
  if (alive('dice') && S.n.dice.loc === 'east') {
    S.n.dice.loc = 'green';
    S.f.diceGreen = 1;
  }
  if (alive('gloria') && S.n.gloria.loc === 'east') {
    S.n.gloria.loc = 'green';
    S.n.gloria.st.gate = 1;
  }
  if (S.f.jebRide) {
    S.f.jebRide = 0; // one ride, one welcome
    S.f.greenIn = 1;
    S.f.greenOut = 0;
    quote(
      'The Warden lowers her rifle. "The lizard man. After all these years. Fine. Both of you, and wipe your feet."',
    );
  }
  if (!alive('warden') && !S.f.greenIn) S.f.greenIn = 1;
}

// ---- finding the pass ----
const _jebGreen = TALK.jeb;
TALK.jeb = () => {
  const r = _jebGreen();
  if (knew('jeb.secret') && !S.f.knowGreen)
    r.o.splice(1, 0, [
      '"This cave you wait in. Where is it?"',
      () => {
        quote(
          'Jeb looks at his boots for a long time. "Past the plane. Foot of the mountains. There\'s a path up from the back of it. Goes all the way, I think. I never had the guts."',
        );
        learnGreen('jeb');
        go('talk', 'jeb');
      },
    ]);
  if (S.day >= GREEN_DAY && !S.f.jebEast && S.n.jeb.loc === 'rustwater')
    r.o.splice(
      1,
      0,
      chkOpt('jeb.east', null, '"Take me east. All the way, this time."', () => {
        if (attempt('jeb.east')) {
          S.f.jebEast = 1;
          S.f.jebRide = 1;
          learnGreen('jeb');
          quote('Jeb drinks the whole flask. "...Alright. All the way. If I turn back, shoot me."');
          say('Two days on lizard-back, up the path behind his cave. Jeb talks the whole way. Then he stops talking.');
          if (tick() || tick()) return go('ending');
          S.here = 'green';
          return go('hub', 'green');
        }
        quote('Jeb: "East is a feeling, friend. You don\'t go to a feeling."');
        go('talk', 'jeb');
      }),
    );
  return r;
};
const _huboSkyGreen = HUBO.skybus;
HUBO.skybus = () => {
  const o = _huboSkyGreen();
  if (S.f.cockpit && !S.f.knowGreen)
    o.push(
      chkOpt('plane.chart', null, "Make sense of the pilot's charts in the cockpit", () => {
        if (attempt('plane.chart')) {
          say(
            "Under the dead pilot's elbow, a flight plan: DIVERT TO EDEN DOME 7 (AGRICULTURAL). A pencil line runs east, through a pass in the mountains.",
          );
          learnGreen('chart');
        } else bad('Lines, numbers, a coffee ring. It could be a map. It could be a menu.');
        goHere();
      }),
    );
  return o;
};
// Day 15: the storms drop.
const _reactGreen = reactions;
reactions = function () {
  _reactGreen();
  if (S.end) return;
  const f = S.f;
  if (f.knowGreen && S.day >= GREEN_DAY && !f.stormSaid) {
    f.stormSaid = 1;
    say('Out east, the dust over the pass has dropped. You can see the mountains for the first time.');
  }
  // Without seeds, Hector's farm gives up.
  if (S.day >= 22 && !(f.seeded && f.seeded.hector) && alive('hector') && !f.farmFailed) {
    f.farmFailed = 1;
    rx('hector', '"Last crop failed. I sold the tractor for seed money. There\'s no seed to buy."');
    rx('bert', '"Pa sold the tractor. I keep sitting where it was."');
  }
};

// ---- the place ----
HUBT.green = () => {
  const f = S.f;
  if (!f.greenIn)
    return (
      'A dome of patched glass at the top of the pass. Inside, it is green. Actually green. A wall round it, a gate in the wall, and a woman on the gate with a repeater.' +
      (f.greenOut ? ' The gate stays shut for you.' : '') +
      (alive('gloria') && S.n.gloria.loc === 'green' && S.n.gloria.st.gate
        ? ' Somebody is camped by the gate in a tent made from a dress.'
        : '')
    );
  return (
    (f.greenDark
      ? 'The lamps are out under the glass. The beds are going brown, and the water in the channels has stopped.'
      : 'Rows of tomatoes, beans and corn under the glass. Clean water runs in little channels. Forty people, all of them fed. It smells like nothing you have ever smelled. It smells alive.') +
    (f.gateOpen ? ' The gate stands open. Valley people sit in the beds, eating with both hands.' : '') +
    (f.fernRules ? ' Fern runs it now. There is a sign: OPEN SUNDAYS.' : '') +
    (f.greenBroken && !f.gateOpen ? ' Half the beds are empty. A lot of people went west.' : '') +
    plotText('green')
  );
};
HUBO.green = () => {
  const f = S.f,
    o = [];
  if (!f.greenIn) {
    if (f.greenOut) return o;
    if (!alive('warden') || S.n.warden.loc !== 'green')
      return [
        [
          'Walk through the unguarded gate',
          () => {
            f.greenIn = 1;
            goHere();
          },
        ],
      ];
    o.push(
      chkOpt('warden.fix', null, '"I can fix things. Pumps, lights, anything with a wire in it."', () => {
        if (attempt('warden.fix')) {
          f.greenIn = 1;
          quote('The Warden tosses you a dead lamp. You make it live. "...Fine. Mechanic. Wipe your feet."');
        } else quote('The Warden: "Everybody can fix things. Nobody can. Go home."');
        goHere();
      }),
    );
    if (knew('warden.secret') && !f.gritTold)
      o.push([
        '"Corporal Grit. The King still asks after his best shot."',
        () => {
          f.gritTold = 1;
          f.greenIn = 1;
          bump('warden', -20);
          quote(
            'The Warden goes very still. Then she opens the gate. "Inside. Where I can see you. Say that name again and I\'ll bury you in the beans."',
          );
          goHere();
        },
      ]);
    if (alive('dice') && S.n.dice.loc === 'green')
      o.push([
        '"Dice! Tell them I\'m with you."',
        () => {
          f.greenIn = 1;
          quote(
            'Dice, from somewhere behind the glass: "They\'re alright. They helped me with a vault." The gate opens.',
          );
          goHere();
        },
      ]);
    if (!f.teethOffered)
      o.push([
        `"I can pay. Teeth." (${S.teeth} teeth)`,
        () => {
          f.teethOffered = 1;
          quote('The Warden: "Teeth. We grow food. What would we buy, a smile?"');
          goHere();
        },
      ]);
    o.push(
      chkOpt('green.outflow', null, 'Climb in through the outflow pipe round the side', () => {
        if (attempt('green.outflow')) {
          f.greenIn = 1;
          f.vatsFound = 1;
          f.sneakedGreen = 1;
          say('Warm green slime, a long dark pipe, and then a grate. You climb out somewhere hot, under the Green.');
          return go('hub', 'vats');
        }
        bad("The Warden fires one shot into the pipe beside your head. It's a warning. She doesn't give two.");
        if (hurt(6, 'Shot in a drain pipe by a very good shot.')) return;
        goHere();
      }),
    );
    return o;
  }
  if (!f.greenDark && f.greenMeal !== S.day)
    o.push([
      'Eat at the long table (a real meal)',
      () => {
        f.greenMeal = S.day;
        say(
          `+${heal(S.maxhp)} HP. A tomato. A real tomato, warm from the sun through the glass. You cry a bit. Everyone pretends not to see.`,
        );
        goHere();
      },
    ]);
  if (f.vatsFound) o.push(['Go down to the vats', () => go('hub', 'vats')]);
  if (!f.vaultTried)
    o.push(
      chkOpt('green.vault', null, 'Fill your pockets in the seed house', () => {
        f.vaultTried = 1;
        if (attempt('green.vault')) {
          give('seeds', 3);
          say(
            'Paper packets in neat drawers: BEANS, CORN, TOMATO, SQUASH. Three handfuls. Nobody counts the drawers at night. Somebody will.',
          );
        } else {
          banGreen('The Warden catches you with your hands in the drawers. "Out. Now. Forever."');
          return;
        }
        goHere();
      }),
    );
  if (alive('gloria') && S.n.gloria.loc === 'green' && S.n.gloria.st.gate)
    o.push([
      '"Let Gloria in. She\'ll work. She\'ll work harder than anyone."',
      () => {
        S.n.gloria.st.gate = 0;
        f.gloriaGreen = 1;
        quote('Gloria walks in through the gate very slowly, like the ground might change its mind. Then she runs.');
        goHere();
      },
    ]);
  if (f.vatsFound && knew('moss.secret') && alive('gardener') && !f.greenExposed && !f.fernRules)
    o.push(
      chkOpt('green.expose', null, 'Stand on the long table and tell the whole Green what is in the basement', () => {
        if (attempt('green.expose')) {
          f.greenExposed = 1;
          f.fernRules = 1;
          f.mossShifts = 1;
          bump('fern', 30);
          bump('moss', 30);
          bump('gardener', -50);
          quote(
            'Forty people go down the ladder and come back up very quiet. By evening the Gardener is just an old man with a spade, and Fern has the key on a string. Moss comes upstairs for the first time in nineteen years. He squints.',
          );
        } else
          banGreen('Nobody believes you. The Gardener asks the Warden, gently, to see you out. She is not gentle.');
        goHere();
      }),
    );
  if (f.greenSworn || f.fernRules)
    o.push([
      'Stay. Never go back down the pass.',
      () => {
        S.end = { type: 'green' };
        go('ending');
      },
      'danger',
    ]);
  return [...o, ...plotHub('green')];
};
function banGreen(line) {
  S.f.greenOut = 1;
  S.f.greenIn = 0;
  bad(line);
  go('hub', 'green');
}
HUBT.vats = () =>
  S.f.mossFree
    ? 'The vats are cold and grey. A chain lies on the floor where somebody used to sit.'
    : 'Under the Green: tanks of glowing green slime, pipes, and wet heat. The light upstairs comes from down here. So does the hum.';
HUBO.vats = () => [];

// ---- the people ----
TALK.gardener = () => {
  const f = S.f,
    o = [newsOpt('gardener', '"The beans are early. That\'s all the news I need."')];
  if (!knew('gardener.why'))
    o.push([
      '"Why keep it so small?"',
      () => {
        know('gardener.why');
        quote(
          'The Gardener: "Forty can live. Forty-one, and the vats can\'t keep up. Then nobody lives. I did the sum a long time ago. I do it again every night."',
        );
        go('talk', 'gardener');
      },
    ]);
  if (!f.greenSworn && !f.seedsHome)
    o.push([
      '"Your secret is safe. The valley will never hear about the Green."',
      () => {
        f.greenSworn = 1;
        give('veg');
        bump('gardener', 30);
        bump('fern', -20);
        addTitle('Friend of the Green');
        quote(
          'The Gardener takes your hand in both of his. They are warm. "Then you have a bed here, whenever you want it. And take these down with you. Somebody out there should taste a tomato, once."',
        );
        go('talk', 'gardener');
      },
    ]);
  if (!has('seeds') && !f.gardenerGave && !f.seedsHome)
    o.push(
      chkOpt('gardener.seeds', null, '"Give me seeds for the valley. People are starving down there."', () => {
        if (attempt('gardener.seeds')) {
          f.gardenerGave = 1;
          give('seeds', 3);
          quote(
            knew('gardener.secret')
              ? 'The Gardener looks at the outer beds for a long time. "...If the valley grows, maybe I can stop doing the sum." He gives you three packets. His hands shake.'
              : 'The Gardener sighs. "Then the Green won\'t be the only green. I\'m too old to be the only anything." Three packets.',
          );
        } else quote('The Gardener: "No. Seeds are the wall. I\'m sorry. I am. I\'m still saying no."');
        go('talk', 'gardener');
      }),
    );
  return {
    t: f.fernRules
      ? 'The Gardener, kneeling in a bed that used to be his. "Fern counts now. She counts worse. Everyone eats more." He doesn\'t sound sorry.'
      : 'The Gardener: an old man with soil in every line of his hands. He talks to the tomatoes before he talks to you. "Welcome. Don\'t touch anything. Everything here is counted."',
    o,
  };
};
TALK.warden = () => ({
  t: S.f.greenIn
    ? 'The Warden watches you the way she watches the pass. Her sleeve rides up. A tattoo of a tooth.'
    : 'The Warden: car-door plate, a Molar repeater, and a face like a shut gate. "Name. Use. Reason. In that order."',
  o: [newsOpt('warden', '"Nothing came up the pass today. That\'s the best news there is."')],
});
TALK.moss = () => {
  const f = S.f,
    o = [newsOpt('moss', '"The vats are happy today. I can tell. They hum in B flat."')];
  if (!knew('moss.secret'))
    o.push([
      '"Who chained you here?"',
      () => {
        know('moss.secret');
        quote(
          'Moss: "Nobody. Everybody. The Gardener keeps the key on a string. He says the Green needs a heart, and I\'m it. Hearts don\'t get days off."',
        );
        go('talk', 'moss');
      },
    ]);
  if (alive('nigel') && !knew('moss.nigel'))
    o.push([
      '"There\'s a man in a well in Scrapwell who glows like you. Nigel."',
      () => {
        know('moss.nigel');
        bump('moss', 20);
        quote('Moss: "Little Nigel! He lives in a WELL? ...He always did like the dark. Does he still hum?"');
        go('talk', 'moss');
      },
    ]);
  if (!f.mossFree && !f.mossShifts)
    o.push(
      chkOpt('moss.free', null, 'Pick the lock on his chain', () => {
        if (attempt('moss.free')) {
          f.mossFree = 1;
          S.n.moss.loc = alive('nigel') && S.n.nigel.loc === 'well' ? 'well' : 'scrapwell';
          later(2, 'greenDark');
          bump('moss', 40);
          bump('gardener', -60);
          bump('warden', -60);
          quote(
            'The lock gives. Moss stands up, and his knees crack like kindling. He looks at the vats he has stirred for nineteen years. "Which way is west?" Then he is gone up the outflow pipe.',
          );
          return go('hub', 'vats');
        }
        banGreen(
          'The lock screams. Boots on the ladder. The Warden drags you out by the collar and throws you down the pass.',
        );
      }),
    );
  return {
    t:
      S.n.moss.loc === 'vats'
        ? f.mossShifts
          ? 'Moss, working a short shift at the vats. The chain is gone. He hums.'
          : 'Moss: skin the colour of pond water, grey eyes, and a chain from his ankle to the biggest vat. He stirs it with a paddle and smiles like it costs nothing.'
        : "Moss, out in the dry air, blinking. His glow is fading in the sun. He doesn't seem to mind.",
    o,
  };
};
TALK.fern = () => {
  const f = S.f,
    o = [newsOpt('fern', '"Is it true there are whole towns down there? With people you haven\'t met?"')];
  if (!f.vatsFound && trusts('fern'))
    o.push([
      '"Show me what keeps the lights on."',
      () => {
        f.vatsFound = 1;
        quote(
          'Fern takes a lamp. "Don\'t tell Father I showed you. Don\'t tell anyone. Tell everyone." She lifts a hatch in the floor.',
        );
        go('hub', 'vats');
      },
    ]);
  if (!f.fernVeg)
    o.push([
      '"Can I take some vegetables down to someone?"',
      () => {
        f.fernVeg = 1;
        give('veg');
        quote(
          'Fern fills a basket without asking who. "Give them to someone who\'ll cook them properly. Not boil them. Promise."',
        );
        go('talk', 'fern');
      },
    ]);
  return {
    t:
      S.n.fern.loc === 'farm'
        ? "Fern, on Hector's farm, showing Bert how deep to plant beans. He is writing it down. He can't write. He's drawing it."
        : 'Fern: dirt to the elbows, a sunburnt nose, and the only person in the Green who looks at the gate like it\'s a door. "You came over the pass! Tell me everything. Tell me the bad bits."',
    o,
  };
};
// Gloria and Dice at the Green.
const _gloriaGreen = TALK.gloria;
TALK.gloria = () => {
  const r = _gloriaGreen();
  const g = S.n.gloria;
  if (g.loc === 'green')
    r.t = g.st.gate
      ? 'Gloria, camped by the Green\'s gate in a tent made from a dress. "I can SEE it. I can smell it. They won\'t let me in."'
      : 'Gloria, in the Green, up to her knees in beans. She keeps laughing at nothing. "Green. Look. GREEN."';
  else if (S.f.greenIn && !S.f.gloriaGreen && g.loc === 'rustwater')
    r.o.unshift([
      '"It\'s real, Gloria. The green. I\'ve been inside."',
      () => {
        S.f.gloriaGreen = 1;
        g.loc = 'green';
        bump('gloria', 40);
        quote(
          "Gloria doesn't pack. She doesn't say goodbye to Opal. She just starts walking east, and doesn't stop. \"Tell them I'm coming. Tell them I can count.\"",
        );
        goHere();
      },
    ]);
  return r;
};
const _diceGreen = TALK.dice;
TALK.dice = () => {
  const r = _diceGreen();
  if (S.n.dice.loc === 'green')
    r.t =
      'Dice, in the Green, counting tomatoes. "I paid them in the King\'s teeth. They ground them up for the beds. Best money I ever spent."';
  return r;
};

// ---- the seeds: what the valley does with them ----
function plantSeeds(who, line) {
  const f = S.f;
  take('seeds');
  f.seeded = Object.assign(f.seeded || {}, { [who]: S.day });
  if (!f.seedsHome) {
    f.seedsHome = S.day;
    if (alive('gardener')) later(3, 'greenHears');
  }
  if (f.greenSworn && !f.oathBroken) {
    f.oathBroken = 1;
    later(2, 'wardenHunt');
  }
  if (who !== 'mayor') karma(2);
  later(3, 'harvest', who);
  quote(line);
}
LATER.harvest = who => {
  const f = S.f;
  if (who === 'hector' && alive('hector')) {
    f.harvest = 1;
    f.farmFailed = 0;
    bump('hector', 40);
    rx('hector', '"Shoots. Green shoots. In my dirt. I don\'t know what to do with my hands."');
    rx('bert', '"The beans came up. I said hello to every one."');
    rx('krug', '"Business is slow. People are eating. It\'s disgusting."');
  }
  if (who === 'junior' && alive('junior')) {
    f.juniorGrows = 1;
    rx('junior', '"...Beans." He says it like a prayer.');
  }
  if (who === 'elder' && alive('elder')) {
    f.scrapGrows = 1;
    rx('elder', '"Corn by the well. The Toaster provides. Don\'t argue with me."');
    rx('crumb', '"Ma says the Toaster grew corn. I am not going to tell her otherwise. I am not brave."');
  }
  if (who === 'mayor' && alive('mayor')) {
    f.mayorVeg = 1;
    rx('moe', '"Fenwick\'s selling carrots. Twenty teeth a carrot. People are paying it."');
  }
};
// The Gardener hears the valley is growing.
LATER.greenHears = () => {
  const f = S.f;
  f.greenBroken = 1;
  rx('gardener', '"The valley is growing. You gave away the wall. ...I don\'t know if I hate you."');
  if (alive('fern') && S.n.fern.loc === 'green' && !f.fernLocked) {
    S.n.fern.loc = 'farm';
    f.fernWest = 1;
    rx(
      'hector',
      '"A girl came down the pass with a bag of seeds and twelve people. She says she\'s here to teach. Teach WHAT?"',
    );
  }
  if (alive('warden') && !f.fernRules && !f.gateOpen) {
    f.greenOut = 1;
    f.greenIn = 0;
  }
};
LATER.greenDark = () => {
  S.f.greenDark = 1;
  rx(
    'gardener',
    '"The lamps are out. The beds have a week, maybe two. Then forty people walk west. You did the sum for me."',
  );
};
LATER.wardenHunt = () => {
  if (alive('warden')) S.f.wardenHunt = 1;
};
const _pickEncGreen = pickEnc;
pickEnc = dest => {
  if (S.f.wardenHunt && alive('warden') && !S.f.wardenMet) return 'warden';
  return _pickEncGreen(dest);
};
ENC.warden = d => {
  S.f.wardenMet = 1;
  const en = () => [foe('warden'), spawn('watchman')];
  return {
    title: 'The Warden',
    icon: '🗝️',
    t: 'The Warden, on the road, a long way from her gate. "You swore. The Gardener cried. Nobody makes him cry."',
    o: [
      ['Fight', () => fight(en(), { win: 'enc', args: [d], back: ['hub', d] }), 'danger'],
      [
        '"The valley was starving. You\'d have done it too."' + hint('warden.gate'),
        () => {
          if (attempt('warden.gate')) {
            quote('The Warden lowers the repeater. "...Maybe. Don\'t come up the pass again." She walks east.');
            S.f.greenOut = 1;
            S.f.greenIn = 0;
            go('hub', d);
          } else {
            bad('"Wrong answer."');
            fight(en(), { win: 'enc', args: [d], back: ['hub', d] });
          }
        },
      ],
      [
        'Run',
        () => {
          if (roll(fleeP() - 20)) {
            say('You run. She lets you. She could have hit you at half a mile. She wants you to know that.');
            go('hub', d);
          } else {
            bad("A shot takes the heel off your boot. The next one won't.");
            fight(en(), { win: 'enc', args: [d] });
          }
        },
      ],
    ],
  };
};
// Hector, Junior, Ma Thistle and the Mayor, given seeds.
const _hectorGreen = TALK.hector;
TALK.hector = () => {
  const r = _hectorGreen();
  if (!knew('hector.dying'))
    r.o.push([
      '"How\'s the farm?"',
      () => {
        know('hector.dying');
        quote('Hector: "Dying. Three years of dust. I plant, the ground spits it back. Next year I sell the tractor."');
        go('talk', 'hector');
      },
    ]);
  if (has('seeds') && !(S.f.seeded && S.f.seeded.hector))
    r.o.unshift([
      '"Seeds. Real ones, from the Green."',
      () => {
        plantSeeds(
          'hector',
          'Hector opens a packet and pours the seeds into his palm. He stands there a long time. "...Bert. Get the tractor. If we still have the tractor."',
        );
        go('talk', 'hector');
      },
    ]);
  return r;
};
const _juniorGreen = TALK.junior;
TALK.junior = () => {
  const r = _juniorGreen();
  if (has('seeds') && !(S.f.seeded && S.f.seeded.junior))
    r.o.unshift([
      '"Seeds, Junior. More than cabbages."',
      () => {
        plantSeeds(
          'junior',
          "Junior holds the packet like a bird. He reads the word TOMATO out loud. It takes him a while. It's the most he's said all year.",
        );
        go('talk', 'junior');
      },
    ]);
  if (has('veg') && !S.f.juniorVeg)
    r.o.unshift([
      '"Real vegetables, from the Green. Cook them properly."',
      () => {
        take('veg');
        S.f.juniorVeg = 1;
        bump('junior', 40);
        say(
          `Junior cooks. Nobody has ever seen him cook like this, with his whole face. You eat it. +${heal(S.maxhp)} HP.`,
        );
        quote('Junior: "...Good?" It is the best thing you have ever eaten. You tell him. He goes red to the ears.');
        go('talk', 'junior');
      },
    ]);
  return r;
};
const _elderGreen = TALK.elder;
TALK.elder = () => {
  const r = _elderGreen();
  if (has('seeds') && !(S.f.seeded && S.f.seeded.elder))
    r.o.unshift([
      '"Seeds, Ma. Plant them by the well."',
      () => {
        plantSeeds(
          'elder',
          'Ma Thistle sniffs the packet. "Corn. Hm. The Toaster provides." She is already digging with a spoon.',
        );
        go('talk', 'elder');
      },
    ]);
  return r;
};
const _mayorGreen = TALK.mayor;
TALK.mayor = () => {
  const r = _mayorGreen();
  if (has('seeds') && !(S.f.seeded && S.f.seeded.mayor))
    r.o.push([
      '"Seeds from the Green. Yours for 150 teeth."',
      () => {
        gain(150);
        plantSeeds(
          'mayor',
          'Fenwick buys them without blinking. "Water AND food. Do you know what a man can charge for a carrot, when he has the only carrots?"',
        );
        go('talk', 'mayor');
      },
      'danger',
    ]);
  return r;
};
// The farm, growing or dying.
const _hubtFarmGreen = HUBT.farm;
HUBT.farm = () =>
  _hubtFarmGreen() +
  (S.f.harvest
    ? ' Green shoots in straight rows. Hector stands in them like a man in church.'
    : S.f.farmFailed
      ? ' The dirt is blowing away. The tractor is gone.'
      : '');
const _huboFarmGreen = HUBO.farm;
HUBO.farm = () => [
  ..._huboFarmGreen(),
  S.f.harvest && alive('hector')
    ? [
        `A sack of Hector's corn (${cost(6, 'hector')} teeth, +20 HP)`,
        () => {
          if (pay(cost(6, 'hector'))) say(`+${heal(20)} HP. Corn. Sweet, and nobody died for it.`);
          goHere();
        },
      ]
    : null,
];

// ---- plot: Fern opens the gate, day 21 ----
PLOTS.gate = {
  where: 'green',
  day: () => 21,
  live: () =>
    alive('fern') && S.n.fern.loc === 'green' && alive('warden') && !S.f.gateOpen && !S.f.fernRules && !S.f.fernLamp,
  known: () => plotKnown('gate'),
  clue: { warden: 1, dice: 1, moss: 1 },
  clueLine:
    '"Fern\'s been oiling the gate hinges at night. Every night. She thinks nobody hears. Day twenty-one, I reckon."',
  sign: {
    where: 'green',
    t: 'After dark, Fern at the great gate, oiling the hinges with a feather. She jumps when she sees you.',
  },
  after: { green: 'The gate hinges shine. There is a patch of gravel by the gate that nobody walks on.' },
  hit: seen =>
    offstage('fern', 'Fern opened the gate at midnight. The Warden shot her before it was a foot wide.', seen),
  opts: {
    fern: () =>
      S.day < 21
        ? [
            '"I\'ll hold the lamp when you open it." (until day 21)',
            () => {
              S.f.fernLamp = 1; // you're there, so the night is yours, not the plot's
              if (!waitFor(21)) return go('ending');
              if (!alive('fern') || !alive('warden')) return goHere();
              go('gatenight');
            },
            'danger',
          ]
        : null,
    fern2: () =>
      chkOpt('fern.seeds', null, '"Don\'t open the gate. Give me seeds, and I\'ll open the valley."', () => {
        if (attempt('fern.seeds')) {
          stopPlot('gate');
          give('seeds', 3);
          bump('fern', 20);
          quote(
            'Fern thinks about it for a long time. Then she empties her apron into your hands. "Three packets. Plant them somewhere they\'ll be seen."',
          );
        } else quote('Fern: "Seeds take years. People are hungry tonight."');
        go('talk', 'fern');
      }),
    gardener: () => [
      '"Fern is going to open the gate."',
      () => {
        stopPlot('gate');
        S.f.fernComposted = 1;
        karma(-3);
        bump('gardener', 40);
        if (!S.f.greenSworn) give('veg');
        offstage(
          'fern',
          "The Gardener holds Fern's hand all the way to the outer beds. He weeps the whole way. He doesn't stop walking.",
          true,
        );
        go('talk', 'gardener');
      },
      'danger',
    ],
    warden: () => [
      '"Fern plans to open the gate. Don\'t shoot her."',
      () => {
        stopPlot('gate');
        S.f.fernLocked = 1;
        bump('fern', -40);
        quote(
          "The Warden: \"I won't. I'll lock her in the seed house till she's sensible.\" Fern looks at you through the slats every time you pass.",
        );
        go('talk', 'warden');
      },
    ],
  },
};
SC.gatenight = () =>
  show({
    title: 'The gate, midnight',
    icon: '🌻',
    text: 'Fern pulls the bar. The hinges don\'t make a sound. Then the Warden steps out of the dark with her repeater up. "Fern. Step back."',
    opts: [
      [
        '"Let it open. Forty isn\'t a wall. It\'s a number."' + hint('warden.gate'),
        () => {
          if (attempt('warden.gate'))
            return openGate(
              'The Warden looks at the gate a long time. Then she lowers the repeater and helps Fern push.',
            );
          bad('The Warden: "No." She fires.');
          S.f.plot_gate = 'done';
          PLOTS.gate.hit(true);
          goHere();
        },
      ],
      [
        'Fight the Warden',
        () =>
          fight(crew('warden'), { allies: ['fern'], started: true, close: true, win: 'gate', back: ['hub', 'green'] }),
        'danger',
      ],
      [
        'Step back yourself',
        () => {
          S.f.plot_gate = 'done';
          PLOTS.gate.hit(true);
          goHere();
        },
      ],
    ],
  });
function openGate(line) {
  S.f.plot_gate = 'stopped';
  S.f.gateOpen = 1;
  S.f.greenIn = 1;
  S.f.greenOut = 0;
  bump('fern', 40);
  quote(line + ' By morning the first valley people are coming up the pass.');
  goHere();
}
WIN.gate = () => openGate('The Warden is down. Fern stares at her, then at the gate, then pushes.');

// ---- ripples ----
ripAdd('gardener', () => {
  if (alive('fern') && S.n.fern.loc === 'green' && !S.f.fernLocked) S.f.fernRules = 1;
  rx('fern', "\"Father's dead. I'm the one who counts now. I'm going to count badly on purpose.\"");
  rx('doc', "\"My father's dead? ...Put him in the outer beds. He'd hate that. He'd also insist.\"");
  rx('moss', '"The Gardener is gone. Nobody brings the tomato on Sundays now."');
});
ripAdd('warden', () => {
  rx('gardener', '"The Warden is dead. The gate is just a gate now. Anyone can come. I can\'t stop counting."');
  rx('gums', '"Heard Corporal Grit died up the pass. Best shot I ever saw. I said she\'d never write."');
});
ripAdd('moss', () => {
  if (!S.f.mossFree) S.f.greenDark = 1;
  rx('nigel', '"Moss light gone. Nigel feel it. Nigel only light now."');
  rx('fern', '"Moss is dead. Who will I read to? Who will keep the lights on? Nobody asked him to."');
  rx('gardener', '"The heart has stopped. We have a week of light. Maybe two."');
});
ripAdd('fern', () => {
  rx('gardener', '"Fern. My Fern. I did the sum, and she was in it."');
  rx('junior', '"...Seed lady." He puts the empty packet in his apron and keeps it there.');
  rx('moss', '"Nobody reads to me now. It\'s very quiet down here."');
});
ripAdd('doc', () => rx('gardener', '"My son is dead? He took one tomato. One. I should have let him keep it."'));
ripAdd('nigel', () => {
  if (S.n.moss.loc === 'well') rx('moss', '"Nigel is gone. I sit in his well and glow for both of us."');
});

// ---- ending slides ----
function greenLines() {
  const f = S.f,
    L = [];
  if (!f.knowGreen) return L;
  const sd = f.seeded || {};
  if (f.greenDark)
    L.push(
      'The lamps in the Green went out the winter after Moss stopped. By spring the dome was full of dead tomatoes, and forty people were walking west.',
    );
  else if (f.gateOpen)
    L.push(
      "Fern's gate stayed open. Four hundred people came over the pass in a month. The Green fed every one of them, for one summer.",
    );
  else if (f.fernRules)
    L.push(
      'Fern runs the Green now. The gate opens on Sundays. Moss works short shifts and goes upstairs to look at the sky.',
    );
  else if (f.greenBroken)
    L.push(
      "The Green stopped being the only green. Half the Gardener's people walked west to the valley. He let them. He hated that it felt like relief.",
    );
  else if (f.greenSworn)
    L.push(
      'You kept the Green secret. Forty people ate well behind the wall for the rest of their lives. The valley never knew.',
    );
  else if (f.greenIn) L.push('The Green went on behind its wall, forty people, counted every night.');
  if (f.mossFree && S.n.moss.loc === 'well' && alive('moss'))
    L.push(
      'Moss sat in the well with Nigel, glowing. Two lights in the dark. Neither of them ever went back up the pass.',
    );
  if (sd.hector && f.harvest)
    L.push(
      "Hector's farm came back green. He wept on the first cob. Bert drives the tractor through real corn, very slowly.",
    );
  else if (f.farmFailed) L.push("Hector's farm blew away, one acre at a time.");
  if (sd.junior || f.juniorVeg)
    L.push(
      'Junior cooks real vegetables now. People walk two days for his tomato soup. He talks to every one of them.',
    );
  if (sd.elder)
    L.push('Scrapwell grows corn by the well. Ma Thistle says the Toaster provided. Nobody argues with Ma.');
  if (sd.mayor)
    L.push(
      "Fenwick sold the Green's seeds back to the valley at twenty teeth a carrot. Rustwater ate better and hated him more.",
    );
  if (f.seedsHome && alive('krug'))
    L.push(
      'With food in the valley, fewer people walked into Chainfield to sell themselves. Krug complained about the economy.',
    );
  if (f.fernWest && alive('fern'))
    L.push(
      "Fern lives on Hector's farm and teaches anyone who'll listen how deep to plant a bean. Bert listens. Bert draws it.",
    );
  if (f.fernComposted)
    L.push(
      'You told the Gardener about Fern. He walked her to the outer beds himself. The tomatoes were very good that year.',
    );
  else if (f.fernLocked) L.push('The Warden kept Fern in the seed house until she was sensible. She never was.');
  if (f.gloriaGreen && alive('gloria'))
    L.push(
      'Gloria lives in the Green. She cried at her first tomato. She still cries at them, and laughs like a cement mixer after.',
    );
  if (f.diceGreen && alive('dice'))
    L.push(
      "Dice paid the Green in the Dentist King's teeth. They ground them into bone meal. The King's fortune grows tomatoes now.",
    );
  if (f.jebEast) L.push('Jeb finally went all the way east. It was green. He never told anyone, out of habit.');
  if (f.oathBroken)
    L.push('You swore to keep the Green secret, then gave its seeds away. The Gardener never said your name again.');
  return L;
}
