'use strict';
// ================= LINKS: the new cities, woven into the old valley =================
// Will: "make it all linked together". Everything in this file crosses a town line: the Drowned Mall and
// the Green change what happens in the valley, and the valley changes them back.

// ---- 1. trade: Rustwater eats Hector's corn, Fenwick's carrots cost the earth ----
const _huboRustLink = HUBO.rustwater;
HUBO.rustwater = () => {
  const o = _huboRustLink();
  if (S.f.harvest && alive('hector') && alive('moe') && S.n.moe.loc === 'rustwater')
    o.push([
      `A bowl of Hector's corn at Moe's (${cost(4, 'moe')} teeth, +15 HP)`,
      () => {
        if (pay(cost(4, 'moe'))) say(`+${heal(15)} HP. Moe: "From the farm. Real corn. I hate how good it is."`);
        goHere();
      },
    ]);
  if (S.f.mayorVeg && alive('mayor'))
    o.push([
      `One of Fenwick's carrots (${cost(20, 'mayor')} teeth, +25 HP)`,
      () => {
        if (pay(cost(20, 'mayor'))) say(`+${heal(25)} HP. It is a very good carrot. It is a very bad price.`);
        goHere();
      },
    ]);
  return o;
};

// ---- 2. Doc Ratchet, run out of Rustwater, goes home to his father ----
LATER.docEast = () => {
  if (!alive('doc') || S.n.doc.loc !== 'gone' || !alive('gardener') || S.n.gardener.loc !== 'green') return;
  S.n.doc.loc = 'green';
  S.f.docEast = 1;
  rx('gardener', '"My son came to the gate. I let him in. I didn\'t count him."');
  rx('fern', '"I have a brother! He\'s horrible. I love him."');
};
const _talkDocLink = TALK.doc;
TALK.doc = () => {
  const r = _talkDocLink();
  if (S.n.doc.loc === 'green')
    r.t =
      "Doc Ratchet, in the Green, in a clean coat, pulling weeds very badly. \"Father says I can stay if I don't steal anything. I'm on day three. It's agony.\"";
  return r;
};

// ---- 3. Opal crosses the pass for Marigold ----
const _talkOpalLink = TALK.opal;
TALK.opal = () => {
  const r = _talkOpalLink();
  if (
    knew('dice.secret') &&
    alive('dice') &&
    S.n.dice.loc === 'green' &&
    !S.f.sistersGreen &&
    S.n.opal.loc === 'rustwater'
  )
    r.o.unshift([
      '"Marigold is alive. She\'s in the Green, over the pass."',
      () => {
        S.f.sistersGreen = 1;
        S.n.opal.loc = 'green';
        if (alive('gloria') && S.n.gloria.loc === 'rustwater') S.f.gloriaRad = 1;
        bump('opal', 40);
        quote(
          'Opal empties the safe, puts on her travelling boots, and hands Gloria the keys to the Velvet Rad. "Count it twice, sugar." She walks east without looking back.',
        );
        goHere();
      },
    ]);
  if (S.n.opal.loc === 'green')
    r.t =
      'Madame Opal, in the Green, kneeling in the same bean row as her sister. Neither of them is talking. Both of them are weeding.';
  return r;
};

// ---- 4. news travels: what you do in the new cities is gossip in the old ones ----
// event() spreads it through the bonds, so people in other towns hear and change their minds.
const _plantLink = plantSeeds;
plantSeeds = (who, line) => {
  _plantLink(who, line);
  if (who !== 'mayor') event('helped', who, { wit: [who] });
};

// ---- 5. ending slides: the links ----
function linkLines() {
  const f = S.f,
    L = [];
  if (f.docEast && alive('doc'))
    L.push("Doc Ratchet walked east to his father's gate. The Warden let him in. The Gardener didn't count him.");
  if (f.sistersGreen && alive('opal') && alive('dice'))
    L.push(
      'Opal crossed the pass at sixty to find Marigold in a bean row. They still hardly talk. They weed side by side.',
    );
  if (f.fernWest && alive('fern') && alive('junior'))
    L.push(
      "Junior's cabbages had come from one of Fern's packets. When she came down the pass he cooked for her. Neither of them said much.",
    );
  if (f.harvest && alive('margie'))
    L.push("Margie's food court started buying Hector's corn. Mama Lou lost the Mall's order, and took it personally.");
  if (f.ginTold && f.harvest && alive('bess'))
    L.push(
      "With Gums watched and the farm green, Bess's polite raiders got jobs in Hector's rows. They still say thank you.",
    );
  if (f.harvest && !f.waterUp)
    L.push(
      'With the farm catching its own dew, Fenwick lost his best water customer. Water came down three teeth a cup.',
    );
  return L;
}

// ---- 6. Pete walks to the Mall and tells Eel himself ----
const _talkPeteLink = TALK.pete;
TALK.pete = () => {
  const r = _talkPeteLink();
  const f = S.f;
  if (
    knew('pete.secret') &&
    alive('pete') &&
    S.n.pete.loc === 'rustwater' &&
    alive('eel') &&
    S.n.eel.loc === 'mall' &&
    !f.eelHunt &&
    !f.peteConfessed
  )
    r.o.unshift([
      '"Tell Eel what you said in the cage. Yourself. Before somebody else does."',
      () => {
        f.peteConfessed = 1;
        later(1, 'peteConfess');
        quote(
          'Pete is quiet a long time. Then he puts on his guard\'s jacket, the one that still fits. "...South, is it?"',
        );
        goHere();
      },
    ]);
  return r;
};
LATER.peteConfess = () => {
  if (!alive('pete') || !alive('eel')) return;
  S.n.pete.loc = 'mall';
  if (roll(S.f.eelBadge ? 85 : 45)) {
    S.f.eelForgave = 1;
    if (!S.f.plot_widow) stopPlot('widow');
    bump('eel', 15);
    rx('eel', '"Pete came and told me. All of it. I hit him once. Then I let him carry my tanks."');
    rx('pete', '"She hit me. Once. Then she let me carry her tanks. I think that\'s forgiveness, down here."');
  } else {
    S.f.eelKilledPete = 1;
    offstage(
      'pete',
      'Pete walked into the Drowned Mall and told Eel the truth. She used the knife. Crane called it fair.',
      true,
    );
  }
};

// ---- 7. Lou's death reaches the Mall's food court ----
ripAdd('lou', () => rx('margie', '"Our meat supplier has left the company. The Value Meal is now mostly bun."'));

// ---- 8. the handbook's last page, read aloud ----
const _huboMallLink = HUBO.mall;
HUBO.mall = () => {
  const o = _huboMallLink();
  if (S.f.associate && knew('margie.secret') && alive('margie') && !S.f.courtFreed)
    o.push([
      "Read the handbook's last page out loud at the staff meeting",
      () => {
        S.f.courtFreed = 1;
        karma(1);
        S.n.margie.op = Math.min(S.n.margie.op, -45); // she won't talk to you; she won't fight you either
        rx(
          'elder',
          '"Two of the Mall boys walked home to Scrapwell. They brought paper hats. Nobody knows why they salute me."',
        );
        quote(
          '"In the event of nuclear war, all associates are released from their duties." The hats come off, one by one. Margie keeps hers on, alone, until closing.',
        );
        goHere();
      },
      'danger',
    ]);
  return o;
};
const _hubtMallLink = HUBT.mall;
HUBT.mall = () =>
  _hubtMallLink() +
  (S.f.courtFreed
    ? ' A cardboard sign over the food court: OWNED BY THE PEOPLE WHO COOK HERE. Margie sits under it in her hat.'
    : '');

// ---- 9. Hector's tractor turns up on Gums's stall ----
ITEMS.tractor = "Hector's tractor (in four sacks)";
const _gumsLink = SC.gums;
SC.gums = () => {
  _gumsLink();
  if (S.f.farmFailed && !S.f.tractorBought && alive('gums')) {
    const c = cost(150, 'gums');
    const list = cur.slice();
    list.splice(list.length - 1, 0, [
      `Hector's tractor, in pieces. ${c} teeth`,
      () => {
        if (pay(c)) {
          S.f.tractorBought = 1;
          give('tractor');
          say('Gums: "Hector sold it me for seed money. There was no seed. Funny old world." It comes in four sacks.');
        }
        go('gums');
      },
    ]);
    drawOpts(list);
  }
};
const _talkBertLink = TALK.bert;
TALK.bert = () => {
  const r = _talkBertLink();
  if (has('tractor') && alive('bert') && S.n.bert.loc === 'farm')
    r.o.unshift([
      '"I got your tractor back."',
      () => {
        take('tractor');
        S.f.tractorBack = 1;
        bump('bert', 50);
        bump('hector', 25);
        event('helped', 'bert', { wit: ['bert'] });
        quote(
          "Bert opens the first sack and makes a noise nobody has heard a man make. He has it running by sundown. It runs backwards. He doesn't care.",
        );
        go('talk', 'bert');
      },
    ]);
  return r;
};

// ---- 10. sell Krug the pass: forty healthy people behind one wall ----
const GREENERS = ['gardener', 'fern'];
const _talkKrugLink = TALK.krug;
TALK.krug = () => {
  const r = _talkKrugLink();
  const f = S.f;
  if (f.knowGreen && !f.greenSold && alive('krug') && S.n.krug.loc === 'chainfield')
    r.o.push([
      '"I know a pass to a place with forty healthy people behind one wall."',
      () => {
        f.greenSold = 1;
        karma(-5);
        gain(150);
        bump('krug', 30);
        later(3, 'greenRaid');
        quote(
          'Krug writes it down very neatly, and underlines it twice. "Forty. Healthy. You\'ve made an old man happy." 150 teeth.',
        );
        go('talk', 'krug');
      },
      'danger',
    ]);
  for (const x of GREENERS)
    if (alive(x) && S.n[x].loc === 'pen')
      r.o.push([
        `Buy back ${NPC[x].n} (${cost(200, 'krug')} teeth)`,
        () => {
          if (pay(cost(200, 'krug'))) {
            S.n[x].loc = 'green';
            bump(x, 40);
            quote(`Krug unlocks the trolley. "${NPC[x].n}. Lovely soft hands. Never worked a day in the sun."`);
          }
          go('talk', 'krug');
        },
      ]);
  return r;
};
LATER.greenRaid = () => {
  const f = S.f;
  if (!alive('krug') || f.gateOpen) return;
  if (alive('warden') && S.n.warden.loc === 'green' && roll(60)) {
    f.greenRaidBeaten = 1;
    rx(
      'warden',
      '"Krug\'s men came up the pass with nets. Fewer went down. Somebody told them the way. I\'ll find out who."',
    );
    bump('warden', -30);
    return;
  }
  f.greenTaken = 1;
  if (alive('warden')) offstage('warden', '', false);
  for (const x of GREENERS) if (alive(x) && S.n[x].loc === 'green') S.n[x].loc = 'pen';
  rx('krug', '"Forty from the east. Soft hands, good teeth. I could kiss you. I won\'t."');
  rx('teo', '"New people in the pens. They smell of tomatoes. They keep crying about a wall."');
};
// The pens open, or Krug dies: the Green's people walk home.
const _freePensLink = freePens;
freePens = () => {
  const was = S.f.freed;
  _freePensLink();
  if (!was) for (const x of GREENERS) if (alive(x) && S.n[x].loc === 'pen') S.n[x].loc = 'green';
};
ripAdd('krug', () => {
  for (const x of GREENERS) if (alive(x) && S.n[x].loc === 'pen') S.n[x].loc = 'green';
});
const _talkGardenerLink = TALK.gardener;
TALK.gardener = () => {
  const r = _talkGardenerLink();
  if (S.n.gardener.loc === 'pen')
    r.t =
      'The Gardener, in a shopping-trolley pen, counting the other prisoners under his breath. "Thirty-nine. Thirty-eight."';
  return r;
};
const _hubtGreenLink = HUBT.green;
HUBT.green = () =>
  S.f.greenTaken && S.f.greenIn
    ? 'The gate hangs open. The beds are trampled flat. Nobody is counting anything.'
    : _hubtGreenLink();
const _greenArrivalsLink = greenArrivals;
greenArrivals = () => {
  _greenArrivalsLink();
  if (S.f.greenTaken) S.f.greenIn = 1;
};

// ---- more ending slides for the links ----
const _linkLinesMore = linkLines;
linkLines = () => {
  const f = S.f,
    L = _linkLinesMore();
  if (f.eelForgave && alive('pete') && alive('eel'))
    L.push(
      "Pete walked to the Mall and told Eel the truth. She hit him once, then let him carry her tanks. They don't talk about Sal. They talk about fish.",
    );
  if (f.courtFreed)
    L.push(
      'You read the last page of the handbook out loud. The associates own the food court now. Margie still wears the hat. Somebody brings her lunch.',
    );
  if (f.tractorBack && alive('bert'))
    L.push(
      "You bought Hector's tractor back off Gums. Bert drives it backwards across the farm every evening, waving.",
    );
  if (f.greenTaken)
    L.push(
      "You sold Krug the pass. His slavers walked the Green's people down the mountain in nets. The tomatoes rotted behind an open gate.",
    );
  else if (f.greenRaidBeaten)
    L.push('You sold Krug the pass. The Warden sent his slavers back down it. She is still looking for whoever told.');
  return L;
};

// ---- 11. one more question each: what they tell you changes a check, or opens a door elsewhere ----
function askOpt(id, fact, label, line, after) {
  return knew(fact)
    ? null
    : [
        label,
        () => {
          know(fact);
          quote(`${NPC[id].n}: ${line}`);
          if (after) after();
          go('talk', id);
        },
      ];
}
const ASK = {
  gums: () =>
    askOpt(
      'gums',
      'gums.teeth',
      '"What happened to your teeth?"',
      '"Tooth tax. Every month, nine years. I paid in mine till there weren\'t any. Then they let me collect it."',
      () => bump('gums', 10),
    ),
  vane: () =>
    askOpt(
      'vane',
      'vane.grey',
      '"What\'s actually in the grey?"',
      '"Buzz, chalk and rat poison. Mostly chalk. The rat poison is for flavour."',
    ),
  warden: () =>
    S.f.greenIn
      ? askOpt(
          'warden',
          'warden.rule',
          '"Why let anyone in at all?"',
          '"Forty. One goes to the outer beds, one comes in. Somebody died so you could eat that tomato. Enjoy it."',
        )
      : null,
  fern: () =>
    askOpt(
      'fern',
      'fern.sea',
      '"What do you want, Fern?"',
      '"To see the sea. Moss says it\'s real. Moss has never seen it either. We\'re both very sure."',
    ),
  margie: () =>
    askOpt(
      'margie',
      'margie.line',
      '"Who ran the store before you?"',
      '"My mother. Before her, hers. Before her, a man called Gary. The handbook says Gary was let go. We don\'t talk about Gary."',
    ),
  sprocket: () =>
    askOpt(
      'sprocket',
      'sprocket.hector',
      '"Who taught you guns?"',
      '"Hector\'s father. He fixed guns for the caravans. When he died I fixed his. Hector never came for them."',
    ),
};
for (const id in ASK) {
  const _t = TALK[id];
  TALK[id] = () => {
    const r = _t();
    const a = ASK[id]();
    if (a) r.o.splice(Math.max(0, r.o.length - 1), 0, a);
    return r;
  };
}
// What you learn feeds the checks.
CK['vane.flour'].likes = { 'vane.grey': 15 };
CK['warden.gate'].likes = { ...CK['warden.gate'].likes, 'warden.rule': 10 };
CK['fern.seeds'].likes = { ...CK['fern.seeds'].likes, 'fern.sea': 10 };
CK['margie.apply'].likes = { ...CK['margie.apply'].likes, 'margie.line': 10 };
// Sprocket's teacher was Hector's father: Hector has guns waiting at the Mall.
const _talkHectorLink = TALK.hector;
TALK.hector = () => {
  const r = _talkHectorLink();
  if (knew('sprocket.hector') && alive('hector') && !S.f.hectorGuns)
    r.o.push([
      '"Sprocket at the Mall says your father taught her guns. She still has his."',
      () => {
        S.f.hectorGuns = 1;
        bump('hector', 15);
        if (alive('sprocket')) bump('sprocket', 10);
        quote(
          "Hector looks at his hands for a long time. \"...Da's guns. I couldn't go and look at them. Tell her to keep them. Tell her thank you. Don't tell her I cried.\"",
        );
        go('talk', 'hector');
      },
    ]);
  return r;
};
