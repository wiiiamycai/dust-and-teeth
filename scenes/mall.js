'use strict';
// ================= THE DROWNED MALL: the scavenger market =================
// A pre-war mall south-east, between Mama Lou's and the Sky-Bus, sunk to its knees in salt water.
// Queen Margie runs the food court by a 200-year-old staff handbook. Customer Service is a religion.
// Sprocket fits mods (MODS in data/items.js) for teeth plus parts. Parts come from diving the flooded
// floor, or from Gums, who fences the Dentist King's surplus and whatever Bess's raiders take.
// Two plots: Eel, Sal's widow, wants to know who ate her husband (day 13). Dr. Vane wants Doc Ratchet's
// customers and is bagging poison with Doc's name on it (day 17).

const courtOpen = () => alive('margie') && S.n.margie.loc === 'mall';
HUBT.mall = () =>
  'A pre-war mall, sunk to its knees in salt water. The lower floor is a lake with shop signs in it. The food court above is a kingdom, and it has a queen.' +
  (courtOpen() ? '' : ' Nobody runs the food court now. The rats have opened a franchise.') +
  (S.f.vaneOut || S.f.vaneRules ? ' The old pharmacy is empty. The jars are gone.' : '') +
  plotText('mall');
HUBO.mall = () =>
  [
    courtOpen()
      ? [
          S.f.associate
            ? 'Staff meal at the food court (free for associates, +20 HP)'
            : `Value Meal at the food court (${cost(8, 'margie')} teeth, +20 HP)`,
          () => {
            if (S.f.associate || pay(cost(8, 'margie')))
              say(
                `+${heal(20)} HP. ` +
                  pick([
                    S.f.harvest
                      ? "Corn on the cob from Hector's farm. The associate looks at it like a miracle with butter."
                      : 'Fried something on a bun. A paper hat says THANK YOU FOR CHOOSING VALUMART.',
                    'It came in a box with a toy. The toy is a tooth.',
                    'You ask what the meat is. The associate checks the handbook. "Product."',
                  ]),
              );
            goHere();
          },
        ]
      : null,
    ['Dive the flooded floor', () => go('dive')],
    ...plotHub('mall'),
  ].filter(Boolean);

// ---- diving: a real risk, for real loot. One dive a day. ----
function partFind() {
  const p = pick(PARTS);
  give(p);
  return ITEMS[p];
}
SC.dive = () => {
  const o = [];
  if (S.f.diveDay === S.day) o.push(['Back (you are still coughing up the last dive)', () => goHere()]);
  else {
    o.push(
      ['The shallows by the escalator' + hint('dive.shallow'), () => dive('shallow')],
      ['The deep end, where the department store was' + hint('dive.deep'), () => dive('deep'), 'danger'],
    );
    if (knew('eel.secret') && !S.f.mallVault)
      o.push(['The bank vault Eel found' + hint('dive.vault'), () => dive('vault'), 'danger']);
    o.push(['Back', () => goHere()]);
  }
  show({
    title: 'The flooded floor',
    icon: '🌊',
    text: 'Black water up to the third step of the escalator. Shop signs under it, still lit by nothing. Something big turns over, far down, and goes back to sleep.',
    opts: o,
  });
};
function dive(where) {
  S.f.diveDay = S.day;
  const won = attempt('dive.' + where);
  if (where === 'shallow') {
    if (won) {
      const r = Math.random();
      if (r < 0.45) say(`You come up with ${partFind()}. Sprocket will want that.`);
      else if (r < 0.75) {
        const t = R(5, 15);
        say("A jar of somebody's teeth, in a shoe shop. Their loss.");
        gain(t);
      } else if (r < 0.9) {
        give('gutglue');
        say('A sealed first-aid box. Gut Glue, still sticky after two hundred years.');
      } else say('A mannequin. You bring it up anyway. You feel like it needed out.');
    } else {
      bad('A shopping bag wraps your face in the dark. You come up choking.');
      if (hurt(R(3, 7), 'Drowned in a food court, holding a shopping bag.')) return;
    }
    return go('dive');
  }
  if (where === 'deep') {
    if (won) {
      const t = R(15, 30);
      say(`Down past the perfume counter, in the dark: ${partFind()}, and a till still full of teeth.`);
      gain(t);
      if (!S.f.mallCore && roll(25)) {
        S.f.mallCore = 1;
        give('core');
        say("In the security office, a fusion core, still humming. Somebody's power armour would love that.");
      }
      return go('dive');
    }
    if (roll(50)) {
      bad('Something in the water finds your leg. It has more teeth than you.');
      return fight([spawn('mallEel')], { close: true, started: true, win: 'dived', back: ['hub', 'mall'] });
    }
    bad('Your air runs out between the shoe racks. You claw your way up, half drowned.');
    if (hurt(R(8, 14), 'Drowned in a department store. Nobody came to help.')) return;
    return go('dive');
  }
  // the vault
  if (won) {
    S.f.mallVault = 1;
    say("The vault door is open, like Eel said. The money is mush. The deposit boxes aren't: someone banked teeth.");
    gain(80);
    say(`And on a shelf, dry in a sealed case: ${partFind()} and ${partFind()}.`);
    rx('eel', '"You went in the vault. Sal\'s vault. ...Good. Somebody should."');
  } else {
    bad('The vault door swings on its hinges and pins your leg against the frame. You get it off. Most of you.');
    if (hurt(R(10, 16), 'Crushed in a bank vault, under water, rich.')) return;
  }
  go('dive');
}
WIN.dived = () => {
  say(
    roll(50)
      ? `It sinks. On the way up you find ${partFind()} in its gut.`
      : 'It sinks, and takes whatever was in its gut with it.',
  );
  go('dive');
};

// ---- Sprocket's bench: mods for teeth plus a part ----
const modFits = (m, k) => {
  const M = MODS[m];
  if (modsOf(k).includes(m)) return false;
  if (M.on === 'gun') return !!W[k] && isGun(k) && !W[k].free;
  if (M.on === 'melee') return !!W[k] && !isGun(k) && k !== 'fists';
  return !!A[k] && k !== 'rags' && k !== 'power' && (!M.untw || !!A[k].tw);
};
SC.bench = () => {
  const o = [],
    gear = [...S.weapons, ...S.armors];
  for (const k of gear)
    for (const m in MODS) {
      if (!modFits(m, k) || !has(MODS[m].part)) continue;
      const c = cost(MODS[m].cost, 'sprocket'),
        nm = W[k] ? W[k].n : A[k].n;
      o.push([
        `${nm}: ${MODS[m].t}. ${c} teeth and your ${ITEMS[MODS[m].part]}`,
        () => {
          if (pay(c)) {
            take(MODS[m].part);
            S.mods[k] = [...modsOf(k), m];
            say(
              `Sprocket works with her tongue between her teeth. "${pick(['There. Now it works the way it lies about working.', 'Done. Try not to die with it, it reflects on me.', 'Better. Not good. Better.'])}" (${modName(k)})`,
            );
          }
          go('bench');
        },
      ]);
    }
  if (alive('eel') && S.n.eel.loc === 'mall' && !S.f.eelArmed)
    o.push([
      `"Make Eel something better than a dive knife." (${cost(40, 'sprocket')} teeth)`,
      () => {
        if (pay(cost(40, 'sprocket'))) {
          S.f.eelArmed = 1;
          S.n.eel.st.wep = 'shotgun';
          bump('eel', 15);
          say(
            'Sprocket builds Eel a harpoon gun out of a fire extinguisher. Eel holds it like a baby. A dangerous baby.',
          );
        }
        go('bench');
      },
    ]);
  const fits = o.length - (o.length && /Make Eel/.test(o[o.length - 1][0]) ? 1 : 0);
  o.push(['Back', () => go('talk', 'sprocket')]);
  const any = gear.some(k => Object.keys(MODS).some(m => modFits(m, k)));
  show({
    title: "Sprocket's bench",
    icon: '🔧',
    sub: `You have ${S.teeth} teeth`,
    text: fits
      ? 'A pre-war checkout, covered in springs. "Pick one. I do it right or I do it twice."'
      : any
        ? 'Sprocket: "I need parts, not hope. A lens for a scope, a steel tube for a barrel, a file for an edge, rubber for a grip, sheet steel for plates. Dive for them, or see Gums."'
        : 'Sprocket: "Everything you own is as good as I can make it. That\'s not a compliment."',
    opts: o,
  });
};

// ---- Gums's stall: the King's surplus, parts, and he buys what you don't need ----
const GUMS = {
  wep: { molargun: 110 },
  arm: { spikes: 70, plate: 120 },
  part: { lens: 45, tube: 40, file: 30, grip: 20, sheet: 50 },
};
SC.gums = () => {
  const o = [],
    c = b => cost(b, 'gums'),
    surplus = alive('king') && !S.f.kingStopped;
  if (surplus) {
    for (const k in GUMS.wep)
      if (!S.weapons.includes(k))
        o.push([
          `${W[k].n}, the King's own. ${c(GUMS.wep[k])} teeth`,
          () => {
            if (pay(c(GUMS.wep[k]))) {
              S.weapons.push(k);
              S.weapon = k;
              say('Gums: "Fell off a Molar. The Molar fell off too."');
            }
            go('gums');
          },
        ]);
    for (const k in GUMS.arm)
      if (!S.armors.includes(k))
        o.push([
          `${A[k].n}: stops ${A[k].dr} a hit. ${c(GUMS.arm[k])} teeth`,
          () => {
            if (pay(c(GUMS.arm[k]))) {
              S.armors.push(k);
              if (A[k].dr > A[S.armor].dr) S.armor = k;
              say('Gums: "Barely worn. Barely anyone left in it."');
            }
            go('gums');
          },
        ]);
  }
  for (const k in GUMS.part)
    o.push([
      `${ITEMS[k]}. ${c(GUMS.part[k])} teeth`,
      () => {
        if (pay(c(GUMS.part[k]))) {
          give(k);
          say(`Gums wraps the ${ITEMS[k].toLowerCase()} in a page of the staff handbook.`);
        }
        go('gums');
      },
    ]);
  o.push([
    `10 bullets. ${c(20)} teeth`,
    () => {
      if (pay(c(20))) give('ammo', 10);
      go('gums');
    },
  ]);
  // What Bess's raiders took off Jeb's caravan this month, while they still have a buyer.
  if (alive('bess') && S.n.bess.loc === 'farm' && !S.f.ginTold)
    o.push([
      `A bottle of Jeb's gin, "found" on the farm road. ${c(4)} teeth`,
      () => {
        if (pay(c(4))) {
          give('beer');
          say('The label says PROPERTY OF CARAVAN JEB. Gums has drawn a moustache on it.');
        }
        go('gums');
      },
    ]);
  // He buys anything you aren't holding or wearing.
  for (const k of S.weapons)
    if (k !== S.weapon && k !== 'fists' && W[k].v) {
      const p = Math.round(W[k].v * 0.6 + modsOf(k).length * 15);
      o.push([
        `Sell him your ${modName(k)} (${p} teeth)`,
        () => {
          S.weapons = S.weapons.filter(x => x !== k);
          delete S.mods[k];
          gain(p);
          say('Gums sniffs it. "Same price I gave Bess for one just like it."');
          go('gums');
        },
      ]);
    }
  for (const k of S.armors)
    if (k !== S.armor && A[k].v) {
      const p = Math.round(A[k].v * 0.6 + modsOf(k).length * 15);
      o.push([
        `Sell him your ${modName(k)} (${p} teeth)`,
        () => {
          S.armors = S.armors.filter(x => x !== k);
          delete S.mods[k];
          gain(p);
          go('gums');
        },
      ]);
    }
  o.push(['Back', () => go('talk', 'gums')]);
  show({
    title: "Gums's stall",
    icon: '👄',
    sub: `You have ${S.teeth} teeth`,
    text: surplus
      ? 'Under a tarp: repeaters, spikes, plates, all stamped with a tooth. "The King\'s surplush. Surplus. I can\'t say it, no teeth."'
      : 'The King\'s crates are empty. "No more surplush. Parts, though. Always parts."',
    opts: o,
  });
};

// ---- the people ----
TALK.margie = () => {
  const o = [newsOpt('margie', '"Head Office has not been in touch. Head Office is very busy."')];
  if (!knew('margie.faith'))
    o.push([
      '"What is Customer Service?"',
      () => {
        know('margie.faith');
        quote(
          'Margie: "The customer is always right. The customer is never armed past the escalator. The customer comes back. That is the faith."',
        );
        go('talk', 'margie');
      },
    ]);
  if (!S.f.associate)
    o.push(
      chkOpt('margie.apply', null, '"I\'d like to apply for a position."', () => {
        if (attempt('margie.apply')) {
          S.f.associate = 1;
          bump('margie', 20);
          event('helped', 'margie', { wit: ['margie'] });
          addTitle('Associate of the Month');
          quote(
            'Margie pins a name badge on you. It says TRAINEE, over someone else\'s name. "Welcome to the family. Meals are free. Weekends are not."',
          );
        } else quote('Margie: "We will keep your application on file." She files it in the water.');
        go('talk', 'margie');
      }),
    );
  return {
    t: S.f.associate
      ? 'Queen Margie nods at your badge. "Associate. Smile with your eyes."'
      : 'Queen Margie: a paper hat, a badge that says MANAGER, and a staff handbook two hundred years old, held like a bible. "Welcome to ValuMart. How may I help you today?"',
    o,
  };
};
TALK.sprocket = () => {
  const o = [];
  if (S.n.sprocket.loc === 'mall') o.unshift(['"Can you fit something?" (upgrade your gear)', () => go('bench')]);
  if (knew('sprocket.secret') && alive('king') && !knew('king.drill'))
    o.push([
      '"You built the Dentist King\'s drill."',
      () => {
        know('king.drill');
        S.n.king.st.wep = 'sledge'; // half jammed: still heavy, no longer a drill
        bump('sprocket', -5);
        quote(
          'Sprocket goes white under the soot. "...It jams if sand gets in the intake. One handful in his face and it\'s just a very heavy hammer." She doesn\'t look up again.',
        );
        go('talk', 'sprocket');
      },
    ]);
  o.push(newsOpt('sprocket', '"Guns don\'t kill people. Bad maintenance kills people. Guns help."'));
  return {
    t: 'Sprocket: goggles, burn scars, and a bench made from a pre-war checkout. "Teeth plus parts. I fit it, you live longer. Probably."',
    o,
  };
};
TALK.eel = () => {
  const o = [newsOpt('eel', "\"Water's quiet today. That's when it's hungry.\"")];
  if (!knew('eel.tips'))
    o.push([
      '"Any tips for diving?"',
      () => {
        know('eel.tips');
        quote(
          'Eel: "Go down slow. Come up slower. If something touches your leg, it isn\'t seaweed. There is no seaweed."',
        );
        go('talk', 'eel');
      },
    ]);
  return {
    t: S.f.eelBadge
      ? 'Eel, drying her hair in the sun on the car park. She looks lighter, somehow.'
      : "Eel: a wetsuit cut from car tyres, a dive knife, and lungs like a bellows. \"If it's under water, I can get it. If it's Sal, I'm still looking.\"",
    o,
  };
};
TALK.vane = () => {
  const c = b => cost(b, 'vane'),
    o = [
      [
        `Gut Glue, Vane's own (${c(18)} teeth)`,
        () => {
          if (pay(c(18))) {
            give('gutglue');
            say('It smells of vinegar and somebody else\'s blood. "Same as Ratchet\'s. Cheaper. Mostly the same."');
          }
          go('talk', 'vane');
        },
      ],
      [
        `Buzz (${c(12)} teeth)`,
        () => {
          if (pay(c(12))) give('buzz');
          go('talk', 'vane');
        },
      ],
      newsOpt('vane', "\"Everyone's sick. That's not news. That's a market.\""),
    ];
  return {
    t:
      S.n.vane.loc === 'rustwater'
        ? 'Dr. Vane, in a clinic that used to be Doc\'s. "Rustwater needed a doctor. I needed Rustwater. Medicine is a love story."'
        : 'Dr. Vane: clean coat, dirty fingernails, a smile with too many teeth. Behind him the old pharmacy rattles with jars. "Ratchet\'s prices, half. Ratchet\'s results, double. Ask anyone who can still talk."',
    o,
  };
};
TALK.gums = () => {
  const o = [['"What have you got?" (buy and sell)', () => go('gums')]];
  if (!S.f.knowSilo)
    o.push([
      '"Where does the King live?"',
      () => {
        learnSilo();
        quote('Gums: "Shilo Nine. Silo. Past the plane. Don\'t tell him I told you. He\'ll take my gums."');
        go('talk', 'gums');
      },
    ]);
  o.push(newsOpt('gums', "\"Buyin', sellin'. Mostly buyin'.\""));
  return {
    t: 'Gums: an old Molar with no teeth left at all, so every word comes out soft. A stall of the King\'s spares under a tarp. "Everything\'s for shale. Sale."',
    o,
  };
};

// Jeb hears he has been buying his own gin back.
const _jebMall = TALK.jeb;
TALK.jeb = () => {
  const r = _jebMall();
  if (knew('gums.secret') && alive('gums') && !S.f.ginTold)
    r.o.splice(1, 0, [
      '"Gums at the Mall sells you your own stolen gin."',
      () => {
        S.f.ginTold = 1;
        S.f.jebUp = Math.max(0, (S.f.jebUp || 0) - 2);
        bump('jeb', 15);
        bump('gums', -40);
        rx('gums', '"Jeb came round. Called me a thief. I am a thief. He didn\'t have to say it like that."');
        rx('bess', '"Gums won\'t buy from us now. Jeb\'s watching him. Thanks for nothing."');
        quote(
          'Jeb: "ELEVEN times?" He goes very quiet, then very loud. The prices on his wagons come down. Gums is going to have a bad week.',
        );
        go('talk', 'jeb');
      },
    ]);
  return r;
};
// Pete hears Eel is coming.
const _peteMall = TALK.pete;
TALK.pete = () => {
  const r = _peteMall();
  if (S.f.eelHunt === 'pete' && !S.f.peteWarned && alive('eel'))
    r.o.unshift([
      '"Eel knows what you told Lou about Sal. She\'s coming."',
      () => {
        S.f.peteWarned = 1;
        bump('pete', 20);
        quote('Pete goes grey. "...I knew she would. I\'ll be at the Sheriff\'s. Under the desk. Thank you."');
        go('talk', 'pete');
      },
    ]);
  return r;
};

// ---- plot: the widow ----
// Eel asks after Sal until day 13, then walks into Mama Lou's to ask in person. Lou answers with a cleaver.
const eelCanBlameLou = () =>
  knew('pete.secret') || knew('lou.polish') || knew('sal.jeb') || knew('sal.lou') || !!S.f.kitchen || !!S.f.jebPaid;
PLOTS.widow = {
  where: 'mall',
  day: () => S.f.widowDay || DAYS(13),
  live: () => alive('eel') && S.n.eel.loc === 'mall' && alive('lou') && S.n.lou.loc === 'diner',
  known: () => plotKnown('widow'),
  clue: { pete: 1, jeb: 1, sprocket: 1 },
  clueLine:
    '"Eel at the Mall is still asking after Sal. She says she\'ll go to Mama Lou\'s herself on the thirteenth. Last place he ate."',
  sign: {
    where: 'mall',
    t: "Eel nails a drawing to a food court pillar: SAL. CARAVAN GUARD. BIG. KIND. LAST SEEN: MAMA LOU'S. Then she sharpens her knife.",
  },
  after: {
    diner: 'The specials board says EEL, TUESDAY ONLY. Lou winks at nobody in particular.',
    mall: "Eel's drawing of Sal is still on the pillar. Nobody has the heart to take it down.",
  },
  hit: seen => {
    S.f.eelEaten = 1;
    offstage(
      'eel',
      "Eel went to Mama Lou's to ask about Sal. She asked the wrong cook. The special that week was eel.",
      seen,
    );
    rx('pete', '"Eel went to Lou\'s. I should have told her. I should have told her years ago."');
  },
  opts: {
    eel: () =>
      eelCanBlameLou()
        ? [
            '"Sal never left Mama Lou\'s. Lou cooked him."',
            () => {
              stopPlot('widow');
              S.f.eelHunt = 'lou';
              later(1, 'eelHunt', 'lou');
              go('eelgo');
            },
            'danger',
          ]
        : null,
    eel2: () =>
      knew('pete.secret')
        ? [
            '"Pete told Lou that Sal was fatter. To save himself."',
            () => {
              stopPlot('widow');
              S.f.eelHunt = 'pete';
              later(2, 'eelHunt', 'pete');
              quote("Eel picks up her knife and walks north. She doesn't say a word. She doesn't need to.");
              goHere();
            },
            'danger',
          ]
        : null,
    eel3: () =>
      chkOpt('eel.lie', null, '"Sal went east with a girl from Rustwater. He isn\'t coming back."', () => {
        if (attempt('eel.lie')) {
          stopPlot('widow');
          S.f.eelLied = 1;
          bump('eel', -10);
          quote(
            'Eel tears the drawing off the pillar. "...East. With a girl." She laughs, horribly. "Good. Then I can stop."',
          );
        } else quote('Eel: "Sal couldn\'t walk to the end of the car park without me. East? Get away from me."');
        go('talk', 'eel');
      }),
    eel4: () =>
      has('badge')
        ? [
            "Give her Sal's guard badge from Lou's kitchen",
            () => {
              take('badge');
              stopPlot('widow');
              S.f.eelBadge = 1;
              bump('eel', 30);
              event('helped', 'eel', { wit: ['eel'] });
              know('eel.secret');
              quote(
                'Eel turns the gnawed badge over and over. She doesn\'t ask where you found it. "...He\'d want me to stop diving for him." Later she tells you where the old bank vault is. "Sal\'s retirement. Go on. Somebody should."',
              );
              go('talk', 'eel');
            },
          ]
        : null,
    lou: () =>
      !S.f.eelSold
        ? [
            '"Sal\'s widow is asking questions about your stew."',
            () => {
              S.f.eelSold = 1;
              S.f.widowDay = S.day + DAYS(1);
              event('sold', 'eel', { wit: ['lou'] });
              know('plot.widow');
              karma(-3);
              gain(30);
              bump('lou', 20);
              quote('Lou smiles. "Then I\'ll invite her to dinner, sweetie. Here, a finder\'s fee." 30 teeth.');
              go('talk', 'lou');
            },
            'danger',
          ]
        : null,
  },
};
SC.eelgo = () =>
  show({
    title: 'Eel',
    icon: '🐟',
    text: 'Eel takes the drawing of Sal off the pillar and folds it into her wetsuit. "Then I\'m going to Lou\'s. Tonight."',
    opts: [
      [
        '"Then we go together. Now."',
        () => {
          S.f.eelWith = 1;
          if (tick()) return go('ending');
          S.here = 'diner';
          if (!alive('lou') || !alive('eel')) return goHere();
          say(
            'The diner at night. Eel kicks the door in. Lou is already holding the cleaver, like she was expecting you.',
          );
          fight(crew('lou'), { allies: ['eel'], started: true, close: true, win: 'eelLou', back: ['map'] });
        },
        'danger',
      ],
      ['Let her go alone', () => goHere()],
    ],
  });
WIN.eelLou = () => {
  S.f.eelKilledLou = 1;
  rx('eel', '"It\'s done. I don\'t feel anything yet. I keep waiting to."');
  go('hub', 'diner');
};
LATER.eelHunt = who => {
  if (!alive('eel') || S.f.eelWith) return;
  if (who === 'lou') {
    if (!alive('lou') || S.n.lou.loc !== 'diner') return;
    if (roll(S.f.eelArmed ? 65 : 30)) {
      S.f.eelKilledLou = 1;
      offstage(
        'lou',
        "Eel walked into Mama Lou's with a harpoon. Lou is dead. Eel sat down after and didn't order.",
        true,
      );
      rx('eel', '"It\'s done. I don\'t feel anything yet. I keep waiting to."');
    } else {
      S.f.eelEaten = 1;
      offstage(
        'eel',
        "Eel walked into Mama Lou's to settle it. Lou had a cleaver and thirty years of practice. The special that week was eel.",
        true,
      );
    }
    return;
  }
  if (!alive('pete') || S.n.pete.loc !== 'rustwater') {
    rx('eel', '"Pete\'s gone. Nobody left to blame but me."');
    return;
  }
  if (S.f.peteWarned && alive('sheriff')) {
    S.f.eelDisarmed = 1;
    rx('eel', '"Crane took my knife. Pete hid under her desk like a child. Maybe that\'s all he is."');
    rx('pete', '"She came. Crane stopped her. I owe you my life twice now. I\'m not good for it."');
    return;
  }
  S.f.eelKilledPete = 1;
  offstage('pete', "Eel found Pete behind Moe's bar. He said sorry. She said she knew. Then she used the knife.", true);
  if (alive('sheriff')) {
    S.f.eelHanged = 1;
    offstage('eel', 'Crane hanged Eel from the pump at sundown. Nobody cheered.', true);
  }
};

// ---- plot: the drug war ----
// Dr. Vane bags grey poison with RATCHET on it. On day 17 it hits Rustwater and the town turns on Doc.
PLOTS.drugwar = {
  where: 'rustwater',
  day: () => S.f.drugDay || DAYS(17),
  live: () => alive('vane') && S.n.vane.loc === 'mall' && alive('doc') && S.n.doc.loc === 'rustwater',
  known: () => plotKnown('drugwar'),
  clue: { doc: 1, gums: 1, moe: 1 },
  clueLine:
    '"Grey Buzz is coming. Somebody at the Mall is bagging it with Doc\'s name on, for the seventeenth. People who take it stop blinking."',
  sign: {
    where: 'mall',
    t: 'Through the pharmacy grille: Dr. Vane funnels grey powder into little bags stamped RATCHET. He hums while he works.',
  },
  after: {
    rustwater: () =>
      S.f.docRunOut
        ? "Doc Ratchet's clinic is boarded up. Someone has painted POISONER on the door. Dr. Vane has the shop next to it."
        : "Doc Ratchet's clinic is boarded up. There's a rope on the pump nobody has taken down.",
  },
  hit: seen => {
    S.f.greyHit = 1;
    if (seen) bad("Grey Buzz hits Rustwater. Two of Moe's regulars die raving. The bags all say RATCHET.");
    if (alive('sheriff')) {
      S.f.docRunOut = 1;
      S.n.doc.loc = 'gone';
      if (seen) bad('Crane runs Doc Ratchet out of town. He goes laughing. Nobody knows why.');
    } else {
      S.f.docLynched = 1;
      offstage('doc', 'With no Sheriff to stop them, Rustwater hangs Doc Ratchet from the pump.', seen);
    }
    S.n.vane.loc = 'rustwater';
    S.f.vaneRules = 1;
    if (S.f.docRunOut) later(3, 'docEast'); // Doc goes home to his father, if the Green will have him
    rx('moe', '"Doc\'s gone. Vane\'s here. Same drugs, worse jokes."');
  },
  opts: {
    doc: () => [
      '"Someone is cutting Buzz with poison and selling it in your name."',
      () => {
        stopPlot('drugwar');
        S.f.docWarned = 1;
        bump('doc', 30);
        bump('vane', -40);
        gain(40);
        quote(
          'Doc reads the bag. "Vane. My old apprentice. He always did sign my name better than me." He burns his own street stock, puts his prices up out of spite, and gives you 40 teeth.',
        );
        go('talk', 'doc');
      },
    ],
    vane: () =>
      S.f.drugHelped
        ? null
        : [
            '"I can get your bags onto Moe\'s bar."',
            () => {
              S.f.drugHelped = 1;
              S.f.drugDay = S.day + DAYS(1);
              know('plot.drugwar');
              karma(-3);
              gain(120);
              bump('vane', 30);
              quote(
                'Vane counts out 120 teeth. "Tomorrow, then. Rustwater is going to feel so much better about Doctor Ratchet."',
              );
              go('talk', 'vane');
            },
            'danger',
          ],
    vane2: () =>
      S.n.vane.loc === 'mall'
        ? chkOpt('vane.flour', null, "Swap Vane's grey powder for flour while he's not looking", () => {
            if (attempt('vane.flour')) {
              stopPlot('drugwar');
              S.f.vaneFlour = 1;
              say("Grey out, flour in. Vane's grand batch will make Rustwater very calm and slightly full.");
            } else {
              bump('vane', -40);
              bad(
                'Vane catches you elbow-deep in his stock. "Customers who touch the product," he says, "become the product."',
              );
            }
            go('talk', 'vane');
          })
        : null,
    margie: () => [
      '"Dr. Vane is poisoning customers."',
      () => {
        stopPlot('drugwar');
        S.f.vaneOut = 1;
        S.n.vane.loc = 'gone';
        bump('margie', 15);
        quote(
          'Margie opens the handbook to page one. "Customer safety." Two associates walk Dr. Vane to the edge of the car park, and keep walking him.',
        );
        go('talk', 'margie');
      },
    ],
    sheriff: () => [
      '"Poison is coming into town with Doc\'s name on the bags."',
      () => {
        stopPlot('drugwar');
        S.f.craneDrug = 1;
        bump('sheriff', 10);
        bump('vane', -30);
        quote(
          'Crane: "Then nothing comes in without me opening it." She takes the bags at the edge of town and burns them in the street. Rustwater smells of chemistry for a week.',
        );
        go('talk', 'sheriff');
      },
    ],
  },
};

// ---- ripples: a death changes the lives tied to it ----
// Adds to a ripple that may already exist, so both run.
function ripAdd(id, fn) {
  const old = RIPPLE[id];
  RIPPLE[id] = () => {
    if (old) old();
    fn();
  };
}
ripAdd('margie', () => {
  rx('sprocket', '"Margie\'s dead. No more rent. No more rules. I miss the rules, which is strange."');
  rx('crumb', '"The paper-hat woman is gone. Her god was a shop. I will pray for the shop."');
  rx('gums', '"Margie\'s dead? Then the floor\'s mine. Nobody tell the rats."');
  rx('vane', '"The Store Manager has left the company. I will need a new landlord. Or none."');
});
ripAdd('sprocket', () => {
  S.f.jebUp = (S.f.jebUp || 0) + 1;
  rx('jeb', '"Sprocket\'s dead. My wagons are going to be full of guns that don\'t work."');
  rx('eel', '"Nobody buys what I bring up now. The water can keep it."');
  rx('bert', '"Sprocket\'s gone. Who\'s going to listen about carburettors?"');
});
ripAdd('eel', () => {
  rx('pete', '"Eel. I never told her. Now I never can."');
  rx('sprocket', '"Nobody brings things up from the water now. The water keeps them."');
  rx('jeb', '"Sal\'s widow is gone too. That family was owed better. By me."');
});
ripAdd('vane', () => {
  rx('doc', '"Vane\'s dead? Pity. He was my best mistake."');
  rx('margie', '"Our Pharmacy Associate has left the company."');
});
ripAdd('gums', () => {
  rx('bess', '"Gums is dead. Nobody buys what we take now. Might have to get honest. Ugh."');
  rx('hector', '"That fence at the Mall is dead. There goes my slice. Good. I hated the slice."');
  rx('king', '"Gums is dead? Who will sell my spares? I hate waste."');
});
ripAdd('lou', () => {
  if (!S.f.eelHunt) rx('eel', '"Lou\'s dead? Then I\'ll never get to ask her."');
});
ripAdd('doc', () => rx('vane', '"Ratchet\'s dead. Rustwater needs a doctor. How lucky for Rustwater."'));
ripAdd('jeb', () => rx('eel', '"Jeb hired Sal. Now they\'re both gone. I\'m running out of people to ask."'));
ripAdd('pete', () => {
  if (!S.f.eelKilledPete)
    rx('eel', '"Pete\'s dead. He brought me fish. He never looked at me. Now I know why, I think."');
});
ripAdd('king', () => {
  rx('gums', '"The King\'s dead? No more surplush. I mean it this time."');
  rx('sprocket', '"Somebody killed the King. I don\'t have to fix his drill. I\'m going to sleep for a week."');
});

// ---- ending slides ----
function mallLines() {
  const f = S.f,
    L = [];
  if (f.associate && alive('margie'))
    L.push(
      'Queen Margie kept you on as Associate of the Month for life. Your photo hangs crooked over the food court.',
    );
  else if (!alive('margie'))
    L.push('With Margie gone, the food court flooded too. The handbook floated for a week, then sank.');
  if (f.eelBadge)
    L.push("Eel buried Sal's badge in the dry fountain. She dives for herself now. She is very, very good.");
  else if (f.eelKilledLou)
    L.push(
      "Eel put a harpoon through Mama Lou for Sal. She never dived again. She said the water didn't need her any more.",
    );
  else if (f.eelHanged)
    L.push(
      'Eel killed Pete for what he said in the cage, and Crane hanged her for it. Sal would have hated all of it.',
    );
  else if (f.eelEaten)
    L.push(
      f.eelSold
        ? 'You sold Eel to Lou for 30 teeth. The special that week was eel.'
        : 'Eel never found out about Sal. Lou made sure of it, with a cleaver.',
    );
  else if (f.eelLied) L.push('Eel stopped diving for Sal. She hates him now. It turned out to be easier.');
  else if (f.eelDisarmed) L.push('Eel never got Pete. Some days she is glad. Most days she dives.');
  if (f.vaneRules)
    L.push(
      f.docRunOut
        ? "Doc Ratchet was run out of Rustwater for a poison he never made, which he found very funny. Dr. Vane runs the town's medicine now. His patients stop blinking."
        : "Rustwater hanged Doc Ratchet for Vane's poison. Dr. Vane runs the town's medicine now. His patients stop blinking.",
    );
  else if (f.vaneOut) L.push('Margie threw Dr. Vane out of the Mall. Customer safety is chapter one.');
  else if (f.vaneFlour)
    L.push("Dr. Vane's grand batch was flour. Rustwater spent a week very calm, and nobody ever knew why.");
  else if (f.docWarned)
    L.push(
      'Doc burned his own street stock and blamed the weather. He and Vane still send each other poison every Bombs Day.',
    );
  else if (f.craneDrug)
    L.push("Crane burned Vane's bags in the street. Rustwater smelled of chemistry for a week, then of nothing.");
  if (f.drugHelped)
    L.push("You put the grey on Moe's bar for 120 teeth. Two men died raving. The bags said RATCHET. You know better.");
  if (Object.values(S.mods || {}).some(m => m.length))
    L.push(
      "Sprocket's work kept you alive more than once. She'd want that on the record. She'd want the bill paid, too.",
    );
  if (f.ginTold) L.push('Jeb stopped buying his own gin back from Gums. Gums took it personally.');
  if (knew('king.drill') && !alive('king'))
    L.push("The Dentist King's drill jammed when it mattered. Sprocket's fault, and Sprocket's credit.");
  if (f.mallVault) L.push("You emptied the drowned bank vault. Sal's retirement. Somebody had to.");
  return L;
}
