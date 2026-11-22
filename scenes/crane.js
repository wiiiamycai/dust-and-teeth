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
          craneWith('krug');
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

// ================= CRANE'S NIGHTS AT THE RAD, AND WHOSE BABY IT IS =================
// 4. Her offer. Once she's devoted to you (on the leash), and you're short of teeth, Crane offers to help any way
//    she can: bounty work, or nights at Opal's Velvet Rad. It is her idea and her call. She refuses if she's gone
//    cold on you, and after enough nights she asks you to let her stop. Each night is with a named man, costs a day,
//    and costs her standing in Rustwater. Fade to black.
// 5. Pregnancy. Every man she's been with goes in a log (you, Krug, her clients). Some days in, she's pregnant,
//    and the father is drawn from the log, weighted to the recent nights. Nobody knows who. That's the quest.
// 6. Will lifted the "no children" rule for this. The child stays offstage, and nothing can harm Crane while
//    she's carrying: no murder, no sale, no Thursday special, no hired Molar, no suicide raid.
const RAD_MEN = ['mayor', 'jeb', 'moe', 'doc', 'pips', 'gus', 'tam', 'rook', 'hector', 'vane', 'gums', 'pete'];
function craneWith(who) {
  S.f.craneWith = S.f.craneWith || [];
  S.f.craneWith.push([who, S.day]);
}
const cranePregnant = () => alive('sheriff') && !!S.f.cranePreg;
// Every night with Crane goes in the log.
const _becomeLoverCrane = becomeLover;
becomeLover = (id, how) => {
  _becomeLoverCrane(id, how);
  if (id === 'sheriff') craneWith('you');
};
const _craneAsksLog = SC.craneAsks;
SC.craneAsks = loc => {
  _craneAsksLog(loc);
  const i = cur.findIndex(o => o[0] === 'Give in');
  if (i >= 0) {
    const fn = cur[i][1];
    cur[i] = [cur[i][0], () => (craneWith('you'), fn()), cur[i][2]];
  }
};
const _threeNightLog = threeNight;
threeNight = (who, line) => {
  _threeNightLog(who, line);
  craneWith('you');
};

// ---- 4. her offer ----
const craneDevoted = () => craneLeashed() && S.n.sheriff.op >= 30;
const radOpen = () => alive('opal') && S.n.opal.loc === 'rustwater';
const _sheriffRad = TALK.sheriff;
TALK.sheriff = () => {
  const r = _sheriffRad();
  if (!r || !alive('sheriff') || S.n.sheriff.loc === 'pen') return r;
  const f = S.f;
  if (craneLeashed() && !f.craneOffered && S.teeth < 60)
    r.o.push([
      '"Crane, I\'m broke."',
      () => {
        f.craneOffered = 1;
        says(
          'sheriff',
          '"Then let me help. Any way I can." She doesn\'t look away. "I can bring in bounties. Or Opal\'s been after me to work a night at the Rad for years. I\'d do that too. For you. Your call, and mine."',
        );
        go('talk', 'sheriff');
      },
    ]);
  if (f.craneOffered && craneLeashed() && f.craneBountyDay !== S.day)
    r.o.push([
      '"Let\'s bring in a bounty together." (a day)',
      () => {
        f.craneBountyDay = S.day;
        if (tick()) return go('ending');
        const t = R(20, 40);
        gain(t);
        bump('sheriff', 3);
        say(
          `A day on the road with Crane and a wanted poster. Two bounty heads in a sack by sundown. +${t} teeth. She shoots better when you're watching.`,
        );
        go('talk', 'sheriff');
      },
    ]);
  if (
    f.craneOffered &&
    !f.craneStopped &&
    !f.craneRadNo &&
    f.craneRadDay !== S.day &&
    radOpen() &&
    S.here === 'rustwater' &&
    !cranePregnant()
  )
    r.o.push([
      f.craneNights ? '"Another night at the Rad?"' : '"The Rad, then. If you\'re sure."',
      () => go('craneRad'),
      'danger',
    ]);
  if (f.craneOffered && !f.craneNights && !f.craneStopped && !f.craneRadNo)
    r.o.push([
      '"No. Not that. Never that."',
      () => {
        f.craneRadNo = 1;
        bump('sheriff', 8);
        says(
          'sheriff',
          '"...Good." Something in her shoulders lets go. "I\'d have done it. I\'m glad you didn\'t ask."',
        );
        go('talk', 'sheriff');
      },
    ]);
  return r;
};
const RAD_LINE = [
  "Crane straightens her badge, then takes it off, and goes up the Velvet Rad's stairs without looking back.",
  'Second night. Opal has her own room ready. Crane goes up two stairs at a time, like a woman going to work.',
  'Crane goes up quieter tonight. At the top she looks back down at you, once.',
  'Rustwater has noticed. A drunk at Moe\'s calls her "Sheriff" in a voice that isn\'t respect. She shoots the bottle out of his hand on her way in.',
];
SC.craneRad = () => {
  const f = S.f,
    n = f.craneNights || 0;
  if (S.n.sheriff.op < 30) {
    says('sheriff', '"For you? Not any more."');
    return go('talk', 'sheriff');
  }
  if (n >= 5 && !f.craneAskedStop)
    return show({
      title: 'Sheriff Crane',
      icon: '⭐',
      text: 'Crane stops at the bottom of the stairs. "Five nights. I said any way I can, and I meant it." She doesn\'t turn round. "Tell me I can stop."',
      opts: [
        [
          '"You can stop. You should never have started."',
          () => {
            f.craneStopped = 1;
            bump('sheriff', 20);
            says(
              'sheriff',
              'Crane puts her badge back on, right there on the stairs. "...Thank you." She means it more than anything she has ever said to you.',
            );
            goHere();
          },
        ],
        [
          '"One more."',
          () => {
            f.craneAskedStop = 1;
            bump('sheriff', -15);
            say('Crane nods once, and goes up. She does not look back this time.');
            radNight();
          },
          'danger',
        ],
      ],
    });
  radNight();
};
function radNight() {
  const f = S.f,
    n = (f.craneNights = (f.craneNights || 0) + 1),
    men = RAD_MEN.filter(x => alive(x) && !following(x) && S.n[x].loc !== 'pen'),
    man = men.length ? pick(men) : null;
  f.craneRadDay = S.day;
  if (man) craneWith(man);
  const t = Math.round(R(60, 90) * 0.7); // Opal takes three in ten
  say(RAD_LINE[Math.min(n - 1, RAD_LINE.length - 1)] + ' ' + pick(FADE));
  if (tick()) return go('ending');
  gain(t);
  say(
    `In the morning Crane puts ${t} teeth in your hand, Opal's cut already taken. She doesn't say who it was. Opal's ledger would.`,
  );
  if (n >= 4) bump('sheriff', -5);
  if (n === 2) rx('moe', '"The Sheriff, at Opal\'s. At NIGHT. The whole bar knows. I hate that the whole bar knows."');
  if (n === 3 && alive('mayor')) {
    f.waterUp = (f.waterUp || 0) + 2;
    rx(
      'mayor',
      '"Our Sheriff has a second job, I hear. I won\'t mention it to anyone. Water is going up two. No reason."',
    );
  }
  if (man && roll(50)) rx(man, '"I won\'t say a word about the Sheriff. Not one. ...She was very professional."');
  goHere();
}

// ---- 5. the pregnancy ----
const _worldPreg = world;
world = function () {
  const f = S.f;
  const r = _worldPreg.apply(this, arguments);
  if (
    !f.cranePreg &&
    alive('sheriff') &&
    (f.craneWith || []).length >= 3 &&
    S.day >= f.craneWith[0][1] + 6 &&
    roll(35)
  ) {
    const recent = f.craneWith.filter(([, d]) => S.day - d <= 12),
      pool = recent.length ? recent : f.craneWith;
    f.cranePreg = S.day;
    f.craneDad = pick(pool)[0];
    f.craneSuspects = [...new Set(f.craneWith.map(([w]) => w))];
  }
  if (cranePregnant()) S.n.sheriff.op = Math.max(S.n.sheriff.op, -55); // never an enemy you could fight
  return r;
};
SC.cranePreg = () => {
  S.f.pregTold = 1;
  show({
    title: 'Sheriff Crane',
    icon: '⭐',
    text: 'Crane sits down on the edge of the desk, hard. "I\'m late. I\'m never late. Doc says I\'m carrying." She looks at you for a long time. "I don\'t know whose it is. I want to. Will you help me find out?"',
    opts: [
      [
        '"We\'ll find out. Together."',
        () => {
          S.f.dadQuest = 1;
          bump('sheriff', 10);
          says('sheriff', '"...Together." She takes your hand and puts it on her stomach, briefly, like evidence.');
          go('talk', 'sheriff');
        },
      ],
      [
        '"Does it matter? It\'s ours either way."',
        () => {
          S.f.dadQuest = 1;
          S.f.dadDoesntMatter = 1;
          bump('sheriff', 20);
          says(
            'sheriff',
            'Crane laughs, wet-eyed, for the first time you can remember. "...It matters to me. But thank you for saying that."',
          );
          go('talk', 'sheriff');
        },
      ],
    ],
  });
};
const _sheriffPreg = TALK.sheriff;
TALK.sheriff = () => {
  if (cranePregnant() && !S.f.pregTold && S.n.sheriff.loc !== 'pen') {
    go('cranePreg');
    return null;
  }
  const r = _sheriffPreg();
  if (!r || !cranePregnant()) return r;
  const f = S.f;
  if (f.dadQuest && !f.dadTold && f.dadKnown)
    r.o.push(
      ...[...new Set(['you', ...(f.craneSuspects || [])])].map(w => [
        w === 'you' ? '"It\'s mine."' : `"It's ${NPC[w].n}'s."`,
        () => tellCrane(w),
        w === f.dadKnown ? null : 'danger',
      ]),
    );
  r.t += ' One hand rests on her stomach when she thinks nobody is looking.';
  return r;
};
// ---- 6. the quest: who is the father? ----
const dadName = w => (w === 'you' ? 'you' : NPC[w].n);
// Doc's pre-war kit says yes or no for one man: you.
jobs('doc', () =>
  S.f.dadQuest && !S.f.dadTest && S.n.doc.loc === 'rustwater'
    ? [
        [
          `"Can you tell who the father of Crane's baby is?" (${cost(80, 'doc')} teeth)`,
          () => {
            if (pay(cost(80, 'doc'))) {
              S.f.dadTest = S.f.craneDad === 'you' ? 'yours' : 'not';
              says(
                'doc',
                S.f.craneDad === 'you'
                  ? '"Pre-war kit, two drops of blood, one prayer. ...Congratulations. Or condolences. It\'s yours."'
                  : '"Pre-war kit, two drops of blood, one prayer. ...It isn\'t yours. Whose it is, the kit doesn\'t say. It only knows you."',
              );
              if (S.f.craneDad === 'you') S.f.dadKnown = 'you';
              else if ((S.f.craneSuspects || []).filter(w => w !== 'you').length === 1)
                S.f.dadKnown = S.f.craneSuspects.find(w => w !== 'you');
            }
            go('talk', 'doc');
          },
        ],
      ]
    : [],
);
// Opal's ledger says who she saw at the Rad, and when.
jobs('opal', () =>
  S.f.dadQuest && S.f.craneNights && !S.f.dadLedger
    ? [
        [
          '"Who did Crane see at the Rad?"',
          () => {
            S.f.dadLedger = 1;
            const men = [...new Set((S.f.craneWith || []).filter(([w]) => RAD_MEN.includes(w)).map(([w]) => NPC[w].n))];
            says(
              'opal',
              `She opens the ledger without being asked twice. "${men.join(', ') || 'Nobody I wrote down'}. I keep good books, sugar. Go and ask them."`,
            );
            go('talk', 'opal');
          },
        ],
      ]
    : [],
);
// Ask any suspect. The father gives himself away; the others don't.
const DAD_YES = {
  mayor: '"...Mine? A Fenwick? Water will have to go up. For the nursery."',
  jeb: 'Jeb sits down on a lizard. "I counted the days. I count everything. It\'s mine. Oh, no. Oh, yes."',
  moe: 'Moe stops wiping the glass, for the first time in thirty years. "...Mine. I did the sums on a beer mat."',
  doc: "\"I ran my own blood through the kit after hers. It's mine. I'm going to be a terrible father. I'm so pleased.\"",
  pips: '"Statistically, it\'s mine." Pips is not smiling. Pips is, for once, afraid.',
  gus: 'Gus drops his pick. He doesn\'t pick it up. "...I\'m going to be a da."',
  tam: 'Big Tam sits down in the sand like you hit him. "...Mine. I\'d know. I\'d know it in the sand."',
  rook: 'Rook leaves the door. He has never left the door. "Mine. Tell her I\'ll watch over that one instead."',
  hector: 'Hector goes white. "...Bess and Bert are going to have a brother. Or a sister. Lord help me."',
  vane: '"Mine, of course. I\'ll be an excellent influence. Medically."',
  gums: '"Mine? A baby? Without teeth?" Gums laughs until he cries. "We\'ll match."',
  pete: 'Pete goes grey, then red. "...Mine. I\'ll be a deputy AND a dad. I can\'t do either."',
  krug: 'Krug opens his notebook, runs a finger down the page, and stops. "Mine. I keep records, Ruth knows I keep records."',
};
const DAD_NO = '"Mine? No. The dates are wrong, and I\'d know. Ask someone else."';
for (const w of [...RAD_MEN, 'krug'])
  jobs(w, () =>
    S.f.dadQuest && !S.f.dadKnown && (S.f.craneSuspects || []).includes(w) && !(S.f.dadAsked || {})[w]
      ? [
          [
            '"Crane is carrying. Could it be yours?"',
            () => {
              S.f.dadAsked = Object.assign(S.f.dadAsked || {}, { [w]: 1 });
              if (S.f.craneDad === w) {
                S.f.dadKnown = w;
                (DAD_YES[w][0] === '"' ? l => says(w, l) : say)(DAD_YES[w]);
              } else {
                says(w, DAD_NO);
                // By elimination: one name left that nobody has ruled out.
                const left = (S.f.craneSuspects || []).filter(
                  x => !(S.f.dadAsked || {})[x] && !(x === 'you' && S.f.dadTest === 'not'),
                );
                if (left.length === 1 && left[0] !== 'you' && S.f.dadTest === 'not') {
                  S.f.dadKnown = left[0];
                  say(`Everyone else is ruled out. That leaves ${NPC[left[0]].n}.`);
                }
              }
              go('talk', w);
            },
          ],
        ]
      : [],
  );
function tellCrane(w) {
  const f = S.f,
    truth = f.craneDad;
  f.dadTold = w;
  f.dadLied = w !== truth;
  if (w === 'you') {
    bump('sheriff', 25);
    says('sheriff', '"Ours, then." She says it like she is reading someone their rights, and means every word.');
  } else {
    bump('sheriff', 5);
    says(
      'sheriff',
      `"${NPC[w].n}." She is quiet a long time. "...Then that's who it is. It changes less than I thought."`,
    );
    if (alive(w)) rx(w, '"The Sheriff came to see me. About the baby. I don\'t know what to do with my hands."');
  }
  if (f.dadLied && roll(40)) later(5, 'dadLie');
  go('talk', 'sheriff');
}
LATER.dadLie = () => {
  if (!alive('sheriff')) return;
  bump('sheriff', -30);
  rx('sheriff', `"I found out whose it really is. You lied to me about my own child. Of everything, that."`);
};

// ---- 7. nothing harms her while she carries ----
const _talkPregGuard = SC.talk;
SC.talk = id => {
  _talkPregGuard(id);
  if (id === 'sheriff' && cranePregnant() && S.scene === 'talk')
    drawOpts(cur.filter(o => !/^(Attack|Murder) Sheriff Crane/.test(o[0])));
};
const _charPregGuard = SC.char;
SC.char = (...a) => {
  _charPregGuard(...a);
  if (cranePregnant()) drawOpts(cur.filter(o => !/^Murder your spouse/.test(o[0])));
};
const _thursdayPreg = LATER.thursday;
LATER.thursday = x => {
  if (x === 'sheriff' && cranePregnant()) {
    rx('lou', '"She\'s carrying, honey. Even I have rules. One rule."');
    return;
  }
  return _thursdayPreg(x);
};
const _raidPreg = raidOutcome;
raidOutcome = mod => {
  if (cranePregnant()) {
    S.f.raidDone = 1;
    rx('sheriff', '"I was going to ride on Chainfield. I\'m not riding anywhere now. Krug can wait nine months."');
    return;
  }
  return _raidPreg(mod);
};
const _worldHitPreg = world;
world = function () {
  const f = S.f;
  if (cranePregnant() && f.mayorJob && !f.mayorPaid && !f.hitDone && alive('mayor') && S.day >= f.mayorJobDay + 6) {
    f.hitDone = 1;
    rx(
      'mayor',
      '"The Molar I hired saw she was carrying and walked off. Molars have scruples now. What is the world coming to."',
    );
  }
  return _worldHitPreg.apply(this, arguments);
};
// The sale is off while she carries.
const _krugPreg = TALK.krug;
TALK.krug = () => {
  const r = _krugPreg();
  if (cranePregnant()) {
    r.o = r.o.filter(o => !o || !String(o[0]).includes('Your ex-wife'));
    if (following('sheriff')) r.t += ' He looks at Crane, then at her stomach, and for once says nothing at all.';
  }
  return r;
};

// ---- the journal ----
QUESTS.dad = Q(
  'Whose baby is it?',
  'Sheriff Crane, Rustwater',
  () => S.f.dadQuest,
  () =>
    S.f.dadTold
      ? S.f.dadTold === 'you'
        ? 'You told her it was yours.'
        : `You told her it was ${NPC[S.f.dadTold].n}'s.`
      : null,
  () =>
    S.f.dadKnown
      ? 'You know. Tell Crane.'
      : [
          !S.f.dadTest && 'Doc Ratchet has a pre-war test. It only knows you.',
          S.f.craneNights && !S.f.dadLedger && "Opal's ledger says who she saw at the Rad.",
          'Ask the men she was with.',
        ]
          .filter(Boolean)
          .join(' '),
);
QUESTS.radNights = Q(
  'Nights at the Velvet Rad',
  'Sheriff Crane, Rustwater',
  () => S.f.craneNights,
  () =>
    S.f.craneStopped
      ? `You let her stop after ${S.f.craneNights} nights.`
      : !alive('sheriff')
        ? 'Crane is dead.'
        : null,
  () =>
    `${S.f.craneNights} night${S.f.craneNights === 1 ? '' : 's'} so far. She'll go as long as you ask. She'll ask you to let her stop.`,
);

// ---- ending slides ----
const _linkLinesBaby = linkLines;
linkLines = () => {
  const L = _linkLinesBaby(),
    f = S.f;
  if (f.craneNights)
    L.push(
      f.craneStopped
        ? `Crane worked ${f.craneNights} nights at the Velvet Rad so you could eat, then you let her stop. Rustwater never looked at the badge the same way. She said she would do it again.`
        : `Crane worked ${f.craneNights} nights at the Velvet Rad because you let her. Rustwater stopped calling her Sheriff.`,
    );
  if (f.cranePreg && alive('sheriff')) {
    const told = f.dadTold,
      dad = f.craneDad;
    L.push(
      !told
        ? "Crane had the baby in the spring. She never found out who the father was. She decided it didn't matter, and mostly meant it."
        : told === dad
          ? `Crane had the baby in the spring. ${dad === 'you' ? 'Yours. It has your nose and her aim.' : `${NPC[dad].n}'s, and everybody knew it. The child grew up with two parents who were not together and a whole town that was.`}`
          : `Crane had the baby in the spring. You told her it was ${dadName(told)}'s. It was ${dadName(dad)}'s. Children grow into their faces, and this one did.`,
    );
  }
  return L;
};
