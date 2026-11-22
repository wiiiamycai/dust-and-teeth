'use strict';
// ================= CRANE, AFTER THE LEASH: company, her ex-husband, and the worst thing you can do =================
// Crane was married to Krug once, before the badge. That's where his money came from (her secret).
// 1. Company: once she's on the leash she'll take a third into bed. Gloria says yes, Opal charges double, Bess may
//    turn on you halfway, and Lou is a death sentence for Crane a week later. Always fade to black.
// 2. Krug: Crane thinks one night, the three of you, might remind him who he was before the pens. A check decides
//    if it does. If it does, Krug opens his own pens and walks out of the valley for good.
// 3. Or you sell her back to him. You're told plainly what he'll do with her first. Non-sexual cruelty only:
//    chains, digging, being laughed at by his men. Content limits stand.

// ---- 1. company ----
const craneLeashed = () => S.f.craneLeash === 'yes' && lover('sheriff') && !S.f.craneSuspect;
const craneHere = () => following('sheriff') || (alive('sheriff') && S.n.sheriff.loc === S.here);
const _sheriffCompany = TALK.sheriff;
TALK.sheriff = () => {
  if (alive('sheriff') && S.n.sheriff.loc === 'pen')
    return {
      t: 'Crane, chained by Krug\'s gate with a shovel, filthy to the elbows. "You sold me to him." She keeps digging. "I keep waiting to hate you properly."',
      o: [],
    };
  const r = _sheriffCompany();
  if (!r) return r;
  if (craneLeashed() && !S.f.craneOpen)
    r.o.push([
      '"Ever thought about inviting someone else?"',
      () => {
        S.f.craneOpen = 1;
        know('crane.krug');
        says(
          'sheriff',
          '"...Yes. Gloria would. Opal would, for money. Not Lou. Never Lou." She looks at her boots. "And there\'s one more. Krug. I was married to him, before the badge. He wasn\'t always this. One night, the three of us, might remind him. Or it might not."',
        );
        go('talk', 'sheriff');
      },
    ]);
  return r;
};
function threeNight(who, line) {
  S.f.three = Object.assign(S.f.three || {}, { [who]: S.day });
  bump('sheriff', 5);
  say(line + ' ' + pick(FADE));
}
const invite = '"Crane and I were wondering if you\'d join us tonight."';
jobs('gloria', () =>
  S.f.craneOpen && craneLeashed() && craneHere() && !(S.f.three && S.f.three.gloria)
    ? [
        [
          invite,
          () => {
            threeNight('gloria', 'Gloria is already unbuttoning her gloves. "Honey, I thought you\'d NEVER ask."');
            rx(
              'moe',
              '"Gloria\'s telling everyone about her night with the Sheriff. EVERYONE. In detail. I had to leave my own bar."',
            );
            go('talk', 'gloria');
          },
        ],
      ]
    : [],
);
jobs('opal', () =>
  S.f.craneOpen && craneLeashed() && craneHere() && !(S.f.three && S.f.three.opal)
    ? [
        [
          `${invite} (${cost(60, 'opal')} teeth)`,
          () => {
            if (pay(cost(60, 'opal')))
              threeNight(
                'opal',
                'Opal counts the teeth twice. "Two clients, sugar. Double rate. And I don\'t talk about my clients. Ever."',
              );
            go('talk', 'opal');
          },
        ],
      ]
    : [],
);
jobs('bess', () =>
  S.f.craneOpen && craneLeashed() && craneHere() && lover('bess') && !(S.f.three && S.f.three.bess)
    ? [
        [
          invite,
          () => {
            if (roll(50))
              threeNight(
                'bess',
                'Bess looks at Crane, then at you, then grins. "Outside really is better than the farm."',
              );
            else {
              S.f.three = Object.assign(S.f.three || {}, { bess: S.day });
              delete S.lovers.bess;
              bump('bess', -30);
              bump('sheriff', -5);
              bad(
                'Halfway to the barn, Bess changes her mind about sharing. She chases Crane round the hay with the hoe. Nobody is arrested. Nobody is happy.',
              );
            }
            go('talk', 'bess');
          },
        ],
      ]
    : [],
);
jobs('lou', () =>
  S.f.craneOpen && craneLeashed() && craneHere() && !(S.f.three && S.f.three.lou)
    ? [
        [
          invite,
          () => {
            if (!S.f.craneLouOk) {
              S.f.craneLouOk = 1;
              says(
                'sheriff',
                '"Lou? She\'d have me on the menu by Thursday." Crane sighs. "...Ask her again if you really want to. I\'ll bring the rifle."',
              );
              return go('talk', 'lou');
            }
            threeNight(
              'lou',
              'Lou unties her apron slowly. "Junior. Go and chop something. Outside. For a long time."',
            );
            if (!S.f.thursday) {
              S.f.thursday = 'sheriff';
              later(7, 'thursday', 'sheriff');
            }
            rx('lou', "Lou smiles at Crane over the counter. She doesn't say anything. She just keeps smiling.");
            go('talk', 'lou');
          },
          'danger',
        ],
      ]
    : [],
);

// ---- 2. Krug: one night might remind him who he was ----
Object.assign(CK, {
  'krug.reform': {
    sk: 'speech',
    base: -15,
    who: 'krug',
    lock: 'once',
    likes: { 'krug.secret': 25 },
    mods: () => (S.f.craneRedeemed ? -30 : 0) + (S.f.freed ? -20 : 0),
  },
});
const _krugCrane = TALK.krug;
TALK.krug = () => {
  const r = _krugCrane(),
    f = S.f;
  // A spouse who is Crane is sold through the warning below, never the plain option.
  r.o = r.o.filter(o => !o || !(S.spouse === 'sheriff' && String(o[0]).startsWith('Sell your spouse')));
  if (knew('crane.krug') && craneLeashed() && following('sheriff') && !f.krugNight && canTry('krug.reform'))
    r.o.unshift(['"Crane has a proposal. For the three of us."', () => go('krugNight')]);
  if (following('sheriff') && !f.craneSold)
    r.o.push(['"Krug. I brought you something. Your ex-wife."', () => go('craneSale'), 'danger']);
  if (alive('sheriff') && S.n.sheriff.loc === 'pen')
    r.o.push([
      `Buy Crane back (${cost(600, 'krug')} teeth)`,
      () => {
        if (pay(cost(600, 'krug'))) {
          quote('Krug: "My ex-wife, twice sold. I should frame the receipt."');
          craneOut('bought');
        }
        goHere();
      },
    ]);
  return r;
};
SC.krugNight = () =>
  show({
    title: 'Krug',
    icon: '⛓️',
    text: 'Crane says it plainly. Krug says nothing for a long time. Then he sends the guards away, takes off his gloves, and pours three drinks. "...You always did surprise me, Ruth."',
    opts: [
      [
        'Go through with it',
        () => {
          S.f.krugNight = 1;
          const won = attempt('krug.reform');
          say(pick(FADE));
          if (won) {
            S.f.krugReformed = 1;
            bump('sheriff', 20);
            freePens();
            krugDown('reformed');
            karma(3);
            addTitle('Unchainer of Krug');
            bad(
              "In the morning Krug opens his own pens. He stands at the gate while forty people walk out past him. Then he puts his chains over his shoulder and walks east, and doesn't look back.",
            );
            quote('Crane: "...He used to sing. Before. I think he might again."');
          } else {
            bump('sheriff', -10);
            bad(
              'In the morning Krug is Krug. "Last night was last night, Ruth. Business is business." Crane doesn\'t speak all the way home.',
            );
          }
          goHere();
        },
      ],
      ['"On second thoughts, no."', () => go('talk', 'krug')],
    ],
  });
// A reformed Krug is gone from the valley, so everything that needed a living Krug stops. The ripple says so.
const _ripKrugReform = RIPPLE.krug;
RIPPLE.krug = () => {
  if (S.f.krugHow !== 'reformed') return _ripKrugReform();
  if (alive('mayor') && !S.f.pumpOpen) S.f.waterUp = (S.f.waterUp || 0) + 10;
  rx('mayor', '"Krug let his stock go and WALKED OFF. Who works my pump at night now? Water is going up."');
  rx('moe', '"Krug opened his own pens and left. I\'ve seen everything now. I can retire."');
  rx('teo', '"Krug held the gate open for us. He said sorry to every one of us. I don\'t know what to do with that."');
  rx('opal', '"Krug freed them himself? Then I can\'t even hate him properly. Thanks for nothing."');
};

// ---- 3. selling her back to him ----
SC.craneSale = () =>
  show({
    title: 'Krug',
    icon: '⛓️',
    text: 'Krug walks round Crane slowly, the way he walks round a mule. "My ex-wife. In my pens." He smiles. "She\'ll dig till her hands bleed. She\'ll sleep chained by my gate, where my men can laugh at her. And every morning she\'ll thank me for breakfast. 400 teeth."\n\nCrane is looking at you. She hasn\'t said a word.',
    opts: [
      [
        'Take the 400 teeth',
        () => {
          const f = S.f;
          f.craneSold = 1;
          if (S.spouse === 'sheriff') {
            S.spouse = null;
            f.spouseFate = 'slave';
          }
          delete S.lovers.sheriff;
          lawless(false);
          S.n.sheriff.loc = 'pen';
          if (!(f.peteDeputy && alive('pete'))) f.waterUp = (f.waterUp || 0) + 3;
          gain(perk('butcher') ? 800 : 400);
          karma(-6);
          addTitle('Sold the Sheriff');
          count('flesh');
          event('sold', 'sheriff', { loc: 'chainfield' });
          S.n.sheriff.op = -55; // hates you, but she's in chains: not an ambush
          rx('mayor', '"No Sheriff! What a tragedy. Water is going up, out of grief. And because I can."');
          rx('pete', '"They say you sold Crane to Krug. Tell me they\'re lying. Please."');
          rx('moe', '"Krug has the Sheriff in his pens. Nobody in Rustwater is drinking to that. Not even me."');
          quote(
            'Krug counts out the teeth. Crane holds out her wrists for the chain herself, and never once looks away from you.',
          );
          go('talk', 'krug');
        },
        'danger',
      ],
      [
        '"Changed my mind."',
        () => {
          bump('sheriff', -30);
          quote(
            'Crane: "...You brought me all the way out here for that." She doesn\'t speak to you all the way home.',
          );
          goHere();
        },
      ],
    ],
  });
// Getting her out: buy her back, pick her chain, free the pens, or kill Krug. She's free. You're finished.
function craneOut(how) {
  if (!alive('sheriff') || S.n.sheriff.loc !== 'pen') return;
  S.n.sheriff.loc = 'rustwater';
  S.f.craneFreed = how;
  S.f.craneSuspect = 1;
  S.n.sheriff.op = Math.max(-50, Math.min(S.n.sheriff.op + 30, -20));
  rx(
    'sheriff',
    "\"I'm out. I'm the Sheriff again. You and I are nothing again. Remember that you got me out. I'll remember why I needed it.\"",
  );
}
const _huboChainCrane = HUBO.chainfield;
HUBO.chainfield = () => {
  const o = _huboChainCrane();
  if (alive('sheriff') && S.n.sheriff.loc === 'pen' && alive('krug'))
    o.push([
      "Pick the lock on Crane's chain tonight" + hint('pen.lock', 'sheriff'),
      () => {
        if (attempt('pen.lock', 'sheriff')) {
          say('The chain gives. Crane is up and over the fence before you can say anything. Which is just as well.');
          craneOut('freed');
          goHere();
        } else {
          bad('A slaver spots you.');
          S.n.krug.op -= 30;
          fight([slv(), slv()], { started: true, win: 'hub', args: ['chainfield'], back: ['map'] });
        }
      },
    ]);
  return o;
};
const _freePensCrane = freePens;
freePens = () => {
  _freePensCrane();
  craneOut('freed');
};
ripAdd('krug', () => craneOut('krugdead'));

// ---- ending slides ----
const _linkLinesCrane = linkLines;
linkLines = () => {
  const L = _linkLinesCrane(),
    f = S.f,
    t = f.three || {};
  if (f.krugReformed)
    L.push(
      'Krug opened his own pens the morning after a night nobody in Chainfield talks about. He walked east with his chains over his shoulder and dropped them in the first river he found.',
    );
  if (f.craneSold && alive('sheriff') && S.n.sheriff.loc === 'pen')
    L.push(
      'You sold Sheriff Crane to her ex-husband for 400 teeth. She dug for Krug until she died, and thanked him every morning, because he made her.',
    );
  else if (f.craneSold && f.craneFreed && alive('sheriff'))
    L.push(
      'You sold Crane to Krug, and later you got her out. She wore the badge again. She never said your name again.',
    );
  if (t.gloria)
    L.push(
      'Gloria told the story of her night with you and the Sheriff for the rest of her life. It got longer every year.',
    );
  if (t.opal)
    L.push('Madame Opal kept your night with the Sheriff in her ledger, under "Discretion". She never told a soul.');
  if (t.lou && f.thursdayDone === 'sheriff')
    L.push('You took Crane to bed with Mama Lou. A week later, the Thursday special had a badge in it.');
  return L;
};

// A reformed Krug isn't dead, so nobody pays for his corpse.
const _opalCrane = TALK.opal;
TALK.opal = () => {
  const r = _opalCrane();
  if (S.f.krugReformed) r.o = r.o.filter(o => !o || o[0] !== '"Krug is dead."');
  return r;
};
const _sheriffBounty = TALK.sheriff;
TALK.sheriff = () => {
  const r = _sheriffBounty();
  if (r && S.f.krugReformed) r.o = r.o.filter(o => !o || o[0] !== 'Claim the Krug bounty');
  return r;
};
QUESTS.opal.done = () =>
  S.f.opalPaid ? 'Krug is dead. Opal paid.' : S.f.krugReformed ? 'Krug freed his own pens and left.' : null;
QUESTS.krugbounty.done = () =>
  S.f.krugPaid1 ? 'Crane paid the bounty.' : S.f.krugReformed ? 'Krug is gone, alive.' : null;
