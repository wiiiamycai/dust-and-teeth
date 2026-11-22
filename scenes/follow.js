'use strict';
// ================= FOLLOWERS: anyone can walk out and come with you =================
// Will: "everyone should be given an option to just waltz out and follow." One at a time.
// Ask anyone "Come with me." Each has their own conditions (RECRUIT). Not ready, and they say why, and the
// journal lists what it would take, with a box for each.
// A follower walks with you (loc 'party'), fights beside you, talks on the road, and judges what you do.
// Push one too far and they walk home. While they're with you they're not at home: their shop, their post and
// their plot wait. A plot whose person is away on its day doesn't happen at all.
// The spouse is a follower too, so a spouse waits at home while someone else walks with you.
const inParty = () => IDS.find(x => alive(x) && S.n[x].loc === 'party') || null;
const following = id => alive(id) && S.n[id].loc === 'party';
const npcName = id => NPC[id].n;

// ---- who comes, and what it takes ----
// Nobody just walks out with a stranger. Each person has their own conditions: usually their own job finished,
// and liking you enough. Ask before you're ready and they tell you why not, in their own words, and the journal
// gets an entry with a box for each condition, ticked as you meet it.
// Each condition is [what the journal says, test, what they say when it isn't met].
const likes = (id, n) => [
  'Likes you enough',
  () => S.n[id].op >= n,
  `"I don't know you well enough for that. Not yet."`,
];
const RECRUIT = {
  elder: [
    [
      'You found out who sends her money',
      () => ['nan', 'toaster'].includes(S.f.elderJob),
      `"Not while some fool leaves money on my step and I don't know who."`,
    ],
    likes('elder', 20),
  ],
  gus: [
    ['The thing in the well is dealt with', () => S.f.gusPaid, `"Chickens first. Then adventures."`],
    likes('gus', 15),
  ],
  crumb: [
    [
      'The Toaster has spoken, or the two churches made peace',
      () => S.f.tfixed || S.f.schismPeace,
      `"I can't leave Him silent, with my flock tearing itself in half."`,
    ],
  ],
  pell: [
    [
      'Bacon Prime is safe',
      () => S.f.pellJob === 'done' || !alive('pig'),
      `"And leave Prime alone with whoever's sniffing round the sty? No."`,
    ],
    likes('pell', 15),
  ],
  pig: [
    [
      'You have food on you',
      () => has('meat'),
      'Bacon Prime sniffs your empty hands and lies down. He is not that kind of pig.',
    ],
  ],
  nigel: [
    ['He has a hat for the sun', () => S.f.nigel === 'hat', `"Up is bright. Nigel need hat."`],
    likes('nigel', 25),
  ],
  moe: [
    [
      "Gus's tab is settled",
      () => S.f.moeJob === 'sold',
      `"Gus owes me two years. I leave this bar, I never see a tooth of it."`,
    ],
    likes('moe', 20),
  ],
  mayor: [
    [
      'He owes you a favour',
      () => S.f.nanJob === 'tipped' || S.f.mayorPaid,
      `"Walk with YOU? What have you ever done for me?"`,
    ],
    likes('mayor', 30),
  ],
  sheriff: [
    [
      'She is yours',
      () => lover('sheriff'),
      `"I've got a town to keep alive. Ask me again when you've earned more than a drink."`,
    ],
    [
      'She has told you what keeps her up at night',
      () => knew('sheriff.secret'),
      `"There's something you should know about me first. Ask me sometime. Not here."`,
    ],
  ],
  doc: [
    [
      'Nobody is selling poison in his name',
      () => !!S.f.plot_drugwar || !alive('vane'),
      `"Somebody is selling grey with my name on it. I stay and watch my shop."`,
    ],
    likes('doc', 20),
  ],
  opal: [
    [
      'Her sister is found',
      () => S.f.sisters || S.f.sistersGreen,
      `"Not while Marigold is out there. I need to be where the news comes."`,
    ],
    likes('opal', 25),
  ],
  gloria: [
    [
      'You found her a way east',
      () => S.f.gloriaJob === 'done',
      `"Following you where, honey? East? Then find me a ride first. Jeb's got wagons."`,
    ],
    likes('gloria', 10),
  ],
  jeb: [
    [
      'His road is safe',
      () => !!S.f.plot_route,
      `"Krug's got eyes on my road. I don't leave the wagons till that's settled."`,
    ],
    likes('jeb', 20),
  ],
  hector: [
    [
      'His farm will live',
      () => S.f.tractorRuns || S.f.harvest,
      `"And leave the farm to die? It's doing that fine without me watching."`,
    ],
    likes('hector', 25),
  ],
  bess: [
    [
      'You asked her what she does for fun',
      () => knew('bess.dreams'),
      `"Out there? With you? You don't even know what I like."`,
    ],
    likes('bess', 10),
  ],
  bert: [
    [
      'His tractor runs',
      () => S.f.tractorRuns,
      `"Can't leave Pa with a dead tractor. He'd sit in the field and stare."`,
    ],
    likes('bert', 15),
  ],
  lou: [
    [
      'She loves you, or your appetite',
      () => lover('lou') || S.f.cannibal,
      `"Leave my kitchen? For a customer? Honey, you'd have to be family. Or a regular."`,
    ],
  ],
  junior: [
    [
      'He trusts you with his cooking',
      () => S.f.juniorBowl === 'ate' || S.n.junior.op >= 30,
      'Junior looks at you, then at the kitchen door. He keeps chopping.',
    ],
    [
      'His cabbages are safe',
      () => S.f.juniorFree || S.f.louCabbage || S.f.cabbageHidden || !alive('lou'),
      `"...My cabbages." He looks out back, and doesn't move.`,
    ],
  ],
  pete: [
    [
      'He feels safe',
      () => S.f.peteDeputy || !alive('lou') || S.f.eelForgave || S.f.peteWarned,
      `"Out there? Lou's out there. And Eel. I stay near Crane, where it's safe."`,
    ],
  ],
  krug: [
    ['You wear the chain on your neck', () => S.f.slaver, `"Krug follows nobody. People follow Krug. In chains."`],
  ],
  teo: [
    [
      'He is free',
      () => !alive('krug') || S.f.freed || S.n.teo.loc !== 'chainfield',
      `"Krug counts us twice a day. Get me out first."`,
    ],
  ],
  pips: [
    [
      'The house owes you',
      () => S.f.pipsJob === 'told' || S.f.diceSold,
      `"The house doesn't leave the house, friend. Unless the house owes you."`,
    ],
    likes('pips', 20),
  ],
  dice: [
    [
      "Pips doesn't own her any more",
      () => S.f.pipsJob === 'covered' || S.f.vaultRobbed || S.f.sisters || !alive('pips'),
      `"Pips owns my paper. I walk out that door, Rook brings me back."`,
    ],
    likes('dice', 20),
  ],
  tam: [
    [
      "He means to win fight night, or it's over",
      () => !!S.f.plot_fightnight || S.f.tamFights || S.f.tamWarned,
      `"Fight night first. Till then Pips owns me."`,
    ],
    likes('tam', 15),
  ],
  nan: [
    [
      "Fenwick's debt is collected",
      () => S.f.nanJob === 'done',
      `"Leave my book, dear? Half the valley would stop paying. Collect Fenwick first."`,
    ],
    ['You owe her nothing', () => !S.f.debt, `"You owe me, dear. Debtors don't get walks."`],
  ],
  rook: [
    [
      'He knows where he stands with the King',
      () => ['told', 'freed'].includes(S.f.rookJob),
      `"Out there? If the King still wants my head, I'm safer in a doorway."`,
    ],
  ],
  margie: [
    [
      'You are Shift Manager',
      () => (S.f.shifts || 0) >= 3,
      `"Associates come and go. The Manager stays, unless she has a Shift Manager to leave in charge."`,
    ],
  ],
  sprocket: [
    [
      'She owes you a favour',
      () => S.f.sprJob === 'done' || S.f.saintSprocket || S.f.benchHidden,
      `"Leave my bench? For a customer? Bring me something worth leaving it for."`,
    ],
    likes('sprocket', 15),
  ],
  eel: [
    ["Sal's fate is settled", () => !!S.f.plot_widow, `"I'm still looking for Sal. I don't go anywhere till I know."`],
  ],
  vane: [
    [
      'You have run errands for him',
      () => S.f.greyRun === 'done' || S.f.vaneRules,
      `"A house call, with you? Do something for the pharmacy first."`,
    ],
  ],
  gums: [
    [
      'He has his teeth back',
      () => S.f.gumsJob === 'done',
      `"Out in the shun without my teeth? Sun. Bring me my teeth first."`,
    ],
  ],
  gardener: [
    [
      'The valley can feed itself',
      () => S.f.harvest || S.f.scrapGrows || S.f.juniorGrows,
      `"Forty people are counted here. I leave when the valley can feed itself."`,
    ],
    likes('gardener', 20),
  ],
  warden: [
    ['The ridge is clear', () => S.f.wardenJob === 'done', `"Leave the gate with a Molar on the ridge? No."`],
    likes('warden', 20),
  ],
  moss: [
    [
      'He is off the chain',
      () => S.n.moss.loc !== 'vats' || S.f.mossShifts,
      `"The chain says no. The chain always says no."`,
    ],
  ],
  fern: [
    [
      'You told her about the world',
      () => knew('fern.sea'),
      `"Tell me about it first. What's out there? What do I want to see?"`,
    ],
    likes('fern', 10),
  ],
  rind: [
    [
      'You walk with the Crust',
      () => S.f.faith === 'crust',
      `"Walk with an unbeliever? Kneel at the fire first, brother."`,
    ],
  ],
  ohm: [
    [
      'The Voice knows you',
      () => S.f.faith === 'coil' || S.f.ohmCoil,
      `"The Voice does not know you yet. Bring it a coil. Or kneel."`,
    ],
  ],
};
// What stops them, or null if they'll come. A spouse always comes. Anyone who dislikes you says no first.
function recruitNo(id) {
  if (S.spouse === id) return null;
  if (S.n[id].op < 0) return '"No. Not with you."';
  const miss = (RECRUIT[id] || [likes(id, 15)]).find(c => !c[1]());
  return miss ? miss[2] : null;
}
const YES = {
  elder: '"About time somebody took me somewhere. I\'ll bring the goat leather."',
  gus: '"Chickens can sort themselves out. Where are we digging?"',
  crumb: '"The Toaster will understand. I\'ll bring a slice, in case."',
  pell: '"Prime can mind himself for a day. He\'s smarter than me."',
  pig: 'Bacon Prime trots after you with the dignity of a minor duke.',
  nigel: '"Nigel go up. For you. Nigel bring hat."',
  moe: '"Somebody else can wipe the glass for a while. I\'ll bring the glass."',
  mayor: '"Very well. I shall see how my citizens live. From a safe distance."',
  sheriff:
    '"Somebody has to keep you honest out there." She pins a tin star on you. "Deputy. Don\'t make me regret it."',
  doc: '"A walking clinic. I\'ll charge you, of course. I\'ll charge you less."',
  opal: '"The girls can run the house. I\'ve been wanting to see what my money looks like outside."',
  gloria: '"Finally. A man going somewhere. Which way is east?"',
  jeb: '"The lizards can wait. Mostly they wait anyway."',
  hector: '"Bert, mind the farm. If you break the tractor, don\'t tell me."',
  bess: '"OUTSIDE. Finally. Can we kill something on the way?"',
  bert: '"I\'ll bring the magazine. In case there\'s a tractor."',
  lou: '"Junior, mind the pot. I\'m going for a walk with my favourite customer."',
  junior: 'Junior takes off his apron, folds it twice, and follows you out without a word.',
  pete: '"Anywhere but a kitchen. Anywhere."',
  krug: '"A business trip. I\'ll bring the chains. You never know."',
  teo: '"I haven\'t walked anywhere I chose in eleven years. Lead on."',
  pips: '"The house travels. Rook, mind the tables. Don\'t let anyone win."',
  dice: '"Out the door. At last." She doesn\'t look back at the table once.',
  tam: '"I\'ve only ever fought in sand. Show me what else there is."',
  nan: '"A walk, dear? I\'ll bring my knitting. And my book of debts."',
  rook: '"Six years watching a door. Let\'s go through some."',
  margie: '"An off-site visit. The handbook allows for off-site visits. Chapter nine."',
  sprocket: '"Fine. I\'ll bring a bag of tools. You\'ll be wanting things fitted on the road."',
  eel: '"Somewhere with no water. Please."',
  vane: '"A house call. How novel. I\'ll bring my bag."',
  gums: '"A roadshow! I\'ll bring stock. Shtock."',
  gardener: '"I haven\'t been past the gate in thirty years. Fern can count."',
  warden: '"Fine. I\'ll watch your back the way I watch the pass."',
  moss: '"West? Is that where you\'re going? I\'ve never been anywhere."',
  fern: '"YES. Finally. Tell me everything on the way."',
  rind: '"I\'ll walk with you, brother. We\'ll see what needs burning."',
  ohm: '"The Voice says go. I go." She keeps the headset on.',
};
// What they say on the road. Bess and Bert keep their own lines in scenes/locations.js.
const BARK = {
  elder: '"In my day the sand was cleaner."',
  gus: '"Good dirt round here. I can tell by the smell."',
  crumb: '"Every rock looks a bit like a toaster if you pray hard enough."',
  pell: '"I hope Prime is eating properly."',
  pig: 'Bacon Prime snorts at something only he can see.',
  nigel: '"Sun is loud. Nigel not like loud."',
  moe: '"Heard a thing about a man. I\'ll tell you later. For a tip."',
  mayor: '"Is all of this mine? It should be. Remind me to tax it."',
  sheriff: '"Eyes up. Somebody always wants what you\'re carrying."',
  doc: '"Your colour\'s bad. Everyone\'s colour is bad. Lovely for business."',
  opal: '"You walk like a man who owes money, sugar."',
  gloria: '"Is it greener this way? It\'s greener this way."',
  jeb: '"Mind the ridge. Mind everything."',
  hector: '"Too far from the farm. Every step is too far."',
  lou: '"You look peckish, honey. I brought snacks. Don\'t ask."',
  junior: 'Junior picks a weed, smells it, and puts it in his pocket for later.',
  pete: '"If anyone offers us dinner, we say no."',
  krug: '"Strong back on that one. Good teeth. Just looking."',
  teo: '"Every step without a chain is a good step."',
  pips: '"The odds of us surviving today are excellent. I\'d still bet against."',
  dice: '"Twelve years at a table. My legs forgot how to walk."',
  tam: '"Somebody\'s watching us. Let them."',
  nan: '"You\'re doing very well, dear. Interest is accruing."',
  rook: '"I keep checking behind us. Old habit. Good habit."',
  margie: '"Smile with your eyes. Even out here."',
  sprocket: '"Your gear rattles. I can hear it from here. It offends me."',
  eel: '"So dry. I love it."',
  vane: '"Everyone we meet is a patient. They just don\'t know it yet."',
  gums: '"Lovely shpot for a shtall. Spot. Stall."',
  gardener: '"Nothing grows here. Yet. Things always want to grow."',
  warden: '"Rider on the ridge. No. Rock. Still watching it."',
  moss: '"The sky goes up forever. Nobody told me."',
  fern: '"Is that a town? Can we go? Can we go to all of them?"',
  rind: '"That windmill turns. It shouldn\'t."',
  ohm: '"Hear that hum? No? Listen harder."',
};
// What they think of what you do. Positive: they warm to you. Negative enough: they walk home.
const TEMPER_DEFAULT = {
  murder: -10,
  sold: -20,
  stew: -25,
  cannibal: -15,
  slaver: -20,
  stole: -5,
  freed: 10,
  rescued: 10,
  helped: 5,
  pump: 10,
  betrayed: -20,
};
const TEMPER = {
  sheriff: { murder: -30, stole: -15, sold: -40, slaver: -50, freed: 20, rescued: 15, hanged: 15 },
  lou: { murder: 10, cannibal: 25, stew: 20, sold: 10, freed: -10 },
  krug: { sold: 30, slaver: 30, freed: -60, murder: 5, rescued: -10 },
  bess: { murder: 5, slain: 5 },
  crumb: { murder: -20, tfixed: 20, tstolen: -30 },
  rind: { tfixed: -30, tstolen: 20 },
  ohm: { tfixed: 30, tstolen: -30 },
  opal: { freed: 30, sold: -30, slaver: -60 },
  teo: { freed: 40, sold: -50, slaver: -60 },
  vane: { murder: 5, cannibal: 0 },
  pips: { stole: 5 },
  nan: { stole: 0 },
  junior: { cannibal: 0, stew: 0 },
};
const _eventFollow = event;
event = (type, victim, opts) => {
  const r = _eventFollow(type, victim, opts);
  const f = inParty();
  if (f && !NPC[f].animal && victim !== f) {
    const t = TEMPER[f] || {},
      d = type in t ? t[type] : TEMPER_DEFAULT[type] || 0;
    if (d) {
      bump(f, d);
      const p = pr(f);
      if (S.n[f].op <= -30) {
        sendHome(f);
        bad(`${npcName(f)} has seen enough. ${cap(p.he)} walks home without a word.`);
      } else if (d > 0) say(`${npcName(f)} nods at you. ${cap(p.he)} saw that.`);
      else say(`${npcName(f)} looks at you like ${p.he} doesn't know you.`);
    }
  }
  return r;
};

// ---- joining and leaving ----
function follow(id) {
  S.f.joined = S.f.joined || {};
  S.f.joined[id] = 1;
  const now = inParty();
  if (now && now !== id) {
    sendHome(now);
    say(`${npcName(now)} heads ${S.spouse === now ? 'home to wait for you' : 'home'}.`);
  }
  S.f.followFrom = S.f.followFrom || {};
  S.f.followFrom[id] = S.n[id].loc;
  S.n[id].loc = 'party';
  if (id === 'pig' && alive('pell')) {
    bump('pell', -40);
    rx('pell', '"Prime walked off after you. My PIG. Bring him back. Bring him back fed."');
  }
  if (id === 'sheriff') lawless(true);
}
function sendHome(id) {
  const from = S.f.followFrom && S.f.followFrom[id];
  S.n[id].loc = from && LOC[from] ? from : NPC[id].home;
  if (id === 'sheriff') lawless(false);
}
// Crane away: Pete keeps the peace if he's her deputy. If not, Fenwick's men charge for shade.
function lawless(on) {
  const f = S.f;
  if (on && !f.lawless && !(f.peteDeputy && alive('pete'))) {
    f.lawless = 1;
    f.waterUp = (f.waterUp || 0) + 2;
    rx('moe', '"Crane\'s gone off with you. Fenwick put water up two the same morning. Funny, that."');
  } else if (!on && f.lawless) {
    f.lawless = 0;
    f.waterUp = Math.max(0, (f.waterUp || 0) - 2);
  }
}
function followOpts(id) {
  if (!alive(id) || S.n[id].loc === 'pen' || S.n[id].loc === 'cage') return [];
  if (following(id))
    return [
      [
        S.spouse === id ? '"Go home and wait for me."' : '"Go home. I\'ll manage."',
        () => {
          sendHome(id);
          say(`${npcName(id)} heads home.`);
          goHere();
        },
      ],
    ];
  return [
    [
      id === 'sheriff' ? '"Ride with me, Crane."' : '"Come with me."',
      () => {
        const no = recruitNo(id);
        S.f.asked = S.f.asked || {};
        S.f.asked[id] = 1;
        if (no) {
          NPC[id].animal ? say(no) : says(id, no);
          return go('talk', id);
        }
        follow(id);
        (NPC[id].animal ? say : l => says(id, l))(YES[id] || '"Fine. Lead on."');
        goHere();
      },
    ],
  ];
}
// The ask is added to every talk screen, after the romance lines.
const _romanceFollow = romanceOpts;
romanceOpts = id => [..._romanceFollow(id), ...followOpts(id)];
// ---- talking to your follower, wherever you are ----
function followerOpt() {
  const f = inParty();
  return f ? [`Talk to ${npcName(f)} (with you)`, () => go('talk', f)] : null; // a spouse too: Crane needs talking to
}
const _hubFollow = SC.hub;
SC.hub = loc => {
  _hubFollow(loc);
  const o = followerOpt();
  if (o && S.scene === 'hub' && !S.fight) drawOpts([...cur, o]);
};
const _mapFollow = SC.map;
SC.map = () => {
  _mapFollow();
  const o = followerOpt();
  if (o && S.scene === 'map') drawOpts([...cur, o]);
};
// Sprocket on the road fits mods anywhere. Doc heals anywhere already: his talk is his shop.
const _sprocketFollow = TALK.sprocket;
TALK.sprocket = () => {
  const r = _sprocketFollow();
  if (following('sprocket') && !S.f.benchBurned)
    r.o.unshift(['"Can you fit something?" (upgrade your gear)', () => go('bench')]);
  return r;
};
const _hubtRustFollow = HUBT.rustwater;
HUBT.rustwater = () =>
  _hubtRustFollow() +
  (following('sheriff')
    ? S.f.peteDeputy && alive('pete')
      ? " Pete wears Crane's badge while she's away. He takes it very, very seriously."
      : " With Crane away, Fenwick's men are charging for shade."
    : '');

// ---- Sheriff Crane: the whole romance ----
// 1. respect (good deeds in Rustwater)  2. the drink (romance.js)  3. her secret, told by her
// 4. ride with me (she follows, deputises you)  5. bring Krug in together  6. marry her in Crumb's chapel
Object.assign(CK, {
  'crane.marry': {
    sk: 'speech',
    base: -10,
    who: 'sheriff',
    lock: 'change',
    likes: { 'sheriff.secret': 15 },
    mods: () => (S.f.craneRedeemed ? 25 : 0),
  },
});
const _sheriffFollow = TALK.sheriff;
TALK.sheriff = () => {
  const r = _sheriffFollow(),
    f = S.f;
  if (f.sec_sheriff === 'squeezed' && lover('sheriff')) {
    delete S.lovers.sheriff;
    f.craneSuspect = 1;
    if (following('sheriff')) sendHome('sheriff');
    r.t = 'Crane takes the tin star back off you without a word. Then she opens a file with your name on it.';
    return r;
  }
  if (lover('sheriff') && !knew('sheriff.secret'))
    r.o.push([
      '"What keeps you up at night, Crane?"',
      () => {
        says(
          'sheriff',
          '"Krug. I was married to him, before the badge. When I left, he paid me to look the other way. I took it. I\'ve been trying to shoot my way back from it ever since."',
        );
        confide('sheriff', 10);
        go('talk', 'sheriff');
      },
    ]);
  if (lover('sheriff') && knew('sheriff.secret') && alive('krug') && !f.craneKrug)
    r.o.push([
      '"Then let\'s go and bring Krug in. Together."',
      () => {
        f.craneKrug = 1;
        follow('sheriff');
        says(
          'sheriff',
          'Crane takes the rifle down off the wall. "Together." She pins a tin star on you. "Deputy. Chainfield. Now."',
        );
        goHere();
      },
    ]);
  if (following('sheriff') && !S.spouse)
    r.t = 'Crane, walking beside you, rifle on her shoulder. She keeps her eyes on the ridges and her hand near yours.';
  else if (S.spouse === 'sheriff')
    r.t = 'Your wife, the Sheriff. She still checks your pockets for stolen goods. Lovingly.';
  return r;
};
const _krugFollow = TALK.krug;
TALK.krug = () => {
  const r = _krugFollow();
  if (S.f.craneKrug && following('sheriff') && !S.f.craneRedeemed)
    r.o.unshift([
      '"Krug. You\'re under arrest. Sheriff\'s orders."',
      () => {
        quote('Crane: "Remember me, Krug? You paid me once. This is your change."');
        fight(crew('krug'), { started: true, win: 'craneKrug', back: ['map'] });
      },
      'danger',
    ]);
  return r;
};
WIN.craneKrug = () => {
  S.f.craneRedeemed = 1;
  bump('sheriff', 30);
  karma(2);
  addTitle('Deputy of Rustwater');
  quote(
    'Crane, breathing hard: "...That\'s that paid back." She holds your hand on the way home and doesn\'t let go at the gate.',
  );
  goHere();
};
// The wedding, in Crumb's chapel. No shotguns.
const _crumbFollow = TALK.crumb;
TALK.crumb = () => {
  const r = _crumbFollow();
  if (
    lover('sheriff') &&
    !S.spouse &&
    S.lovers.sheriff.how !== 'married' &&
    (following('sheriff') || S.n.sheriff.loc === S.here)
  )
    r.o.push(
      chkOpt('crane.marry', null, '"Brother Crumb. Marry me and Crane."', () => {
        if (attempt('crane.marry')) {
          S.spouse = 'sheriff';
          S.f.spouseWho = 'sheriff';
          S.lovers.sheriff.how = 'married';
          craneWith('you');
          if (!following('sheriff')) follow('sheriff');
          addTitle('Married');
          event('married', 'sheriff', { loc: 'scrapwell' });
          say(
            'Crumb marries you in front of the Toaster. Crane keeps her badge on for the vows. She says "I do" like she is reading someone their rights, and means every word. ' +
              pick(FADE),
          );
        } else says('sheriff', '"Not yet. Ask me when I can look at myself in the badge."');
        go('talk', 'crumb');
      }),
    );
  return r;
};

// ---- ending slides ----
const _linkLinesFollow = linkLines;
linkLines = () => {
  const L = _linkLinesFollow(),
    f = S.f,
    w = inParty();
  if (S.spouse === 'sheriff' && alive('sheriff'))
    L.push(
      'You married Sheriff Crane in a chapel with a toaster on the altar. She kept her badge on. She kept you honest, mostly.',
    );
  if (f.craneRedeemed)
    L.push(
      "Crane walked into Chainfield with you and walked out with Krug. She hung his chains on the pump, and never took anyone's money again.",
    );
  if (w && w !== S.spouse) L.push(`${npcName(w)} walked beside you to the very end.`);
  return L;
};

// ---- Crane's leash: what she asks for once she's in love with you ----
// The day after she tells you her secret, she trusts you with something else. All day she holds this town on a
// short leash. At night she wants to wear one. She asks; you choose. Fade to black, always.
const craneReady = () =>
  lover('sheriff') &&
  knew('sheriff.secret') &&
  !S.f.craneLeash &&
  S.day > S.know['sheriff.secret'] &&
  !S.f.craneSuspect;
const _sheriffLeash = TALK.sheriff;
TALK.sheriff = () => {
  if (craneReady()) {
    go('craneLeash');
    return null;
  }
  return _sheriffLeash();
};
SC.craneLeash = () =>
  show({
    title: 'Sheriff Crane',
    icon: '⭐',
    text:
      "Crane locks the office door, hangs up her hat, and gets down on her knees on the floorboards. She nudges your hand with her head, like a dog would, and won't look at you.\n\n" +
      '"You know my worst thing now, so you might as well know this. All day I\'m the one holding this town on a leash." She holds one up. A real one. Her hand is shaking. "At night I want to be the one wearing it. Say no if it\'s no. I\'ll still be the Sheriff in the morning."',
    opts: [
      [
        'Clip the leash on. "Good girl."',
        () => {
          S.f.craneLeash = 'yes';
          craneWith('you');
          bump('sheriff', 20);
          say(
            'She closes her eyes when the clip clicks, and lets out a breath she has been holding for about ten years. ' +
              pick(FADE),
          );
          goHere();
        },
      ],
      [
        '"No. But I\'m not going anywhere."',
        () => {
          S.f.craneLeash = 'no';
          bump('sheriff', 10);
          quote('Crane gets up and puts the leash away. "...Thank you for not laughing." She means it.');
          goHere();
        },
      ],
      [
        'Laugh',
        () => {
          S.f.craneLeash = 'laughed';
          delete S.lovers.sheriff;
          S.f.craneSuspect = 1;
          S.n.sheriff.op = Math.min(S.n.sheriff.op - 40, -20);
          if (following('sheriff')) sendHome('sheriff');
          if (S.spouse === 'sheriff') {
            S.spouse = null;
            S.f.spouseFate = 'left';
          }
          bad(
            'Crane stands up, puts her hat back on, and is the Sheriff again. She opens a file with your name on it.',
          );
          goHere();
        },
        'danger',
      ],
    ],
  });
// On the road, when nobody's looking.
const _barkLeash = BARK.sheriff;
Object.defineProperty(BARK, 'sheriff', {
  get: () =>
    S && S.f.craneLeash === 'yes' && roll(50)
      ? 'When nobody is looking, Crane nudges your hand with her head. Then she checks the ridges again, all business.'
      : _barkLeash,
});
const _linkLinesLeash = linkLines;
linkLines = () => {
  const L = _linkLinesLeash();
  if (S.f.craneLeash === 'yes' && alive('sheriff') && !S.f.craneSuspect)
    L.push(
      'By day, Sheriff Crane held the whole valley on a short leash. By night, you held hers. Nobody in Rustwater ever knew.',
    );
  return L;
};

// ---- after the leash: Crane, insatiable, at the worst possible times ----
// Once you've clipped it on and she walks with you, she wants you. Now. Wherever you are, whoever is watching.
// At most once a day, on arriving somewhere. You choose each time. It always fades to black.
const CRANE_WHEN = {
  rustwater:
    'Outside the Mayor\'s office, in front of half the town, Crane leans in. "Deputy. My office. I need you to frisk me. Thoroughly."',
  scrapwell:
    'In the chapel doorway, while Crumb is mid-blessing, Crane tugs your sleeve. "There\'s a confession booth. I have a lot to confess. Out loud."',
  diner:
    'Mama Lou is pouring your coffee when Crane\'s hand lands on your knee under the table. "The walk-in freezer. I hear it\'s private." Lou smiles. Lou is listening.',
  snakeeyes:
    'At the dice table, with the whole casino watching the roll, Crane whispers: "Win or lose, you\'re taking me upstairs." Pips raises an eyebrow.',
  mall: 'In the middle of the food court, Crane looks at the changing rooms of a drowned shop. "Those still have curtains."',
  chainfield:
    'Surrounded by Krug\'s slavers, rifle up, Crane says out of the side of her mouth: "This is so dangerous. I want you so badly right now."',
  farm: 'Hector is three feet away, loading his shotgun, when Crane nods at the barn. "Hay. Lots of hay."',
  skybus:
    'The Coil are deep in prayer when Crane eyes the plane\'s toilet. "Mile high club. Technically. It flew once."',
  green:
    'In the bean rows, with forty people counting everything, Crane pulls you down. "Nobody counts the bean rows. Do they?"',
  silo: 'At the gate of the Dentist King\'s fortress, Crane grabs your collar. "We might die in there. Behind that rock. Now."',
};
const craneHungry = () => S.f.craneLeash === 'yes' && following('sheriff') && !S.f.craneSuspect;
const _hubCraneAsks = SC.hub;
SC.hub = loc => {
  if (craneHungry() && S.f.craneAskDay !== S.day && (S.f.craneCool || 0) <= S.day && !S.fight && roll(30)) {
    S.f.craneAskDay = S.day;
    S.here = loc;
    return go('craneAsks', loc);
  }
  return _hubCraneAsks(loc);
};
SC.craneAsks = loc => {
  const who = IDS.filter(x => alive(x) && !NPC[x].animal && x !== 'sheriff' && S.n[x].loc === loc),
    seen = who.length ? pick(who) : null;
  show({
    title: 'Sheriff Crane',
    icon: '⭐',
    text:
      CRANE_WHEN[loc] ||
      'Crane stops dead in the middle of the road and looks at you like you are the last canteen in the desert. "Now. Right now. Behind that rock."',
    opts: [
      [
        'Give in',
        () => {
          S.f.craneGiven = (S.f.craneGiven || 0) + 1;
          S.f.craneNo = 0;
          bump('sheriff', 3);
          say(`${pick(FADE)} +${heal(5)} HP. Your dignity does not heal.`);
          if (seen && roll(50))
            rx(
              seen,
              pick([
                '"Everybody heard the Sheriff. EVERYBODY. I can\'t look at her badge the same way."',
                '"You two. In broad daylight. I have to live here."',
                '"I saw nothing. I heard everything. I would like to un-hear it."',
              ]),
            );
          goHere();
        },
      ],
      [
        '"Not now, Crane."',
        () => {
          S.f.craneNo = (S.f.craneNo || 0) + 1;
          bump('sheriff', -3);
          if (S.f.craneNo >= 3) {
            S.f.craneNo = 0;
            S.f.craneCool = S.day + 2;
            quote(
              "Crane: \"Fine. FINE. I'll wait. I'm very good at waiting. I'll be thinking about it the whole time.\"",
            );
          } else quote('Crane straightens her hat, pink to the ears. "...Later, then. I\'m holding you to later."');
          goHere();
        },
      ],
      [
        '"Heel."',
        () => {
          bump('sheriff', 2);
          say('One word. Crane falls in at your side, eyes front, all business. She is very, very pleased about it.');
          goHere();
        },
      ],
    ],
  });
};
