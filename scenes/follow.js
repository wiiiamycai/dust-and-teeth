'use strict';
// ================= FOLLOWERS: anyone can walk out and come with you =================
// Will: "everyone should be given an option to just waltz out and follow." One at a time.
// Ask anyone "Come with me." Most say yes if they don't dislike you; a few have their own reasons first.
// A follower walks with you (loc 'party'), fights beside you, talks on the road, and judges what you do.
// Push one too far and they walk home. While they're with you they're not at home: their shop, their post and
// their plot wait. A plot whose person is away on its day doesn't happen at all.
// The spouse is a follower too, so a spouse waits at home while someone else walks with you.
const inParty = () => IDS.find(x => alive(x) && S.n[x].loc === 'party') || null;
const following = id => alive(id) && S.n[id].loc === 'party';
const npcName = id => NPC[id].n;

// ---- who says yes, and why not ----
// Each returns null (yes) or the reason they won't, in their own voice.
const NOT_YET = {
  sheriff: () =>
    lover('sheriff') ? null : '"I\'ve got a town to keep alive. Ask me again when you\'ve earned more than a drink."',
  krug: () => (S.f.slaver || S.n.krug.op >= 40 ? null : '"Krug follows nobody. People follow Krug. In chains."'),
  teo: () =>
    alive('krug') && !S.f.freed && S.n.teo.loc === 'chainfield'
      ? '"Krug counts us twice a day. Get me out first."'
      : null,
  moss: () => (S.n.moss.loc === 'vats' && !S.f.mossShifts ? '"The chain says no. The chain always says no."' : null),
  nigel: () => (S.n.nigel.op >= 25 ? null : '"Nigel no go up. Up is bright. Up has people."'),
  junior: () =>
    S.n.junior.loc === 'diner' && alive('lou') && S.n.junior.op < 30 ? '"...Mama needs me." He keeps chopping.' : null,
  warden: () =>
    S.n.warden.op >= 20 ? null : '"Leave the gate? For you? Name. Use. Reason. You have none of the three."',
  gardener: () => (S.n.gardener.op >= 20 ? null : '"Forty people are counted here. I am one of them. No."'),
  mayor: () =>
    S.n.mayor.op >= 20 ? null : '"Walk? In the SUN? With YOU? I have a carriage for that. I don\'t, but I would."',
};
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
  const no = S.spouse === id ? null : S.n[id].op < 0 ? `"No. Not with you."` : NOT_YET[id] ? NOT_YET[id]() : null;
  return [
    [
      id === 'sheriff' ? '"Ride with me, Crane."' : '"Come with me."',
      () => {
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
  return f && f !== S.spouse ? [`Talk to ${npcName(f)} (with you)`, () => go('talk', f)] : null;
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
          '"Krug. Years back he paid me to look the other way, once. I took it. I\'ve been trying to shoot my way back from it ever since."',
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
