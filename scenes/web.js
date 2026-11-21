'use strict';
// ================= THE WEB: everyone knows everyone =================
// 1. Ask anyone about anyone. Strong bonds have their own lines (data/cast.js); everyone else gets
//    the valley's view, coloured by who is talking.
// 2. Secrets. Each person has one. The people who know it tell you once they like you.
//    Then you can lean on the owner for teeth, or promise to keep it.
// 3. Plots. People scheme against each other on their own clocks. Learn about a plot and you can
//    warn the target, help the schemer, or sell one to the other. Ignore it and it happens anyway.
const PLACE_ORDER = ['scrapwell', 'rustwater', 'farm', 'diner', 'chainfield', 'silo'];
const placeName = p => (p === 'silo' ? 'Out east (the silo)' : LOC[p].n);

function tieLine(a, b) {
  const A = NPC[a],
    B = NPC[b],
    bd = bondOf(a, b);
  if (!alive(b)) {
    if (!bd) return `"${B.n}? Dead, I heard. That's the valley."`;
    return ['enemy', 'rival'].includes(bd.kind)
      ? `"${B.n}? Dead. Good."`
      : `"${B.n}? Gone. I keep forgetting. Then I remember."`;
  }
  if (bd) return bd.line;
  if (a === 'junior') return `Junior thinks about ${B.n} for a long time. "...Hm." That's all you get.`;
  const tail =
    B.k >= 2 && A.k <= -1
      ? ' Keep away from that one.'
      : A.k >= 2 && B.k <= -2
        ? ' Too soft to last out here.'
        : NPC[b].home === NPC[a].home
          ? ' See them most days.'
          : '';
  return `"${B.n}? ${cap(REP[b])}${tail}"`;
}
const trusts = a => S.n[a].op >= 25 || (S.n[a].ch || 0) >= 3;

function askAbout(a, b) {
  const line = tieLine(a, b);
  if (line[0] === '"') quote(`${NPC[a].n}: ${line}`);
  else say(line);
  // a plot they know about
  for (const k in PLOTS) {
    const P = PLOTS[k];
    if (P.clue && P.clue[a] && P.clue[a].includes(b) && !S.f['plot_' + k] && P.live() && !knew('plot.' + k)) {
      know('plot.' + k);
      quote(`${NPC[a].n}: ${P.clueLine}`);
    }
  }
  // a secret they keep
  const sc = SECRETS[b];
  if (sc && sc.tell.includes(a) && !knew(b + '.secret')) {
    if (trusts(a)) {
      know(b + '.secret');
      say(`${NPC[a].n} leans in. ${sc.t}`);
    } else say(`${NPC[a].n} knows something else about ${NPC[b].n}. You can tell. Not yet, though.`);
  }
}

SC.askabout = (id, place) => {
  const d = NPC[id],
    o = [];
  if (!place) {
    PLACE_ORDER.forEach(p => o.push([placeName(p), () => go('askabout', id, p)]));
    o.push(['Back', () => go('talk', id)]);
    return show({ title: d.n, icon: d.i, text: `Who do you want to ask ${d.n} about? Pick a place.`, opts: o });
  }
  IDS.filter(x => x !== id && NPC[x].home === place).forEach(x =>
    o.push([
      `${NPC[x].n}${alive(x) ? '' : ' (dead)'}`,
      () => {
        askAbout(id, x);
        go('askabout', id, place);
      },
    ]),
  );
  o.push(['Somewhere else', () => go('askabout', id)], ['Back', () => go('talk', id)]);
  show({ title: d.n, icon: d.i, text: `${placeName(place)}. Who?`, opts: o });
};

// ---- secrets ----
SC.secret = id => {
  const d = NPC[id],
    sc = SECRETS[id],
    n = S.n[id],
    pay = sc.pay;
  show({
    title: d.n,
    icon: d.i,
    text: `You tell ${d.n} what you know. ${sc.t}\n\n${d.n} goes very still.`,
    opts: [
      [
        `"Keep it quiet? That'll cost you." (${pay} teeth)`,
        () => {
          S.f['sec_' + id] = 'squeezed';
          gain(pay);
          karma(-1);
          n.op = clamp(n.op - 40, -100, 100);
          count('squeezed');
          quote(`${d.n}: "Take it. And if you ever say a word, I'll know where you sleep."`);
          go('talk', id);
        },
        'danger',
      ],
      [
        '"It\'s safe with me."',
        () => {
          S.f['sec_' + id] = 'kept';
          n.op = clamp(n.op + 20, -100, 100);
          quote(`${d.n} lets out a breath. "...Thank you. I mean it."`);
          go('talk', id);
        },
      ],
      ['Back', () => go('talk', id)],
    ],
  });
};

// ---- plots: people against people ----
// day(): when it happens if nobody stops it. live(): can it still happen? hit(): what happens.
// opts[id](): what you can do about it, talking to id, once you know.
function offstage(id, line) {
  if (!alive(id)) return;
  S.dead[id] = 1;
  delete S.lovers[id];
  if (S.spouse === id) S.spouse = null;
  bad(line);
}
const plotKnown = k => knew('plot.' + k);
const plotOpen = k => !S.f['plot_' + k] && PLOTS[k].live();
function stopPlot(k) {
  S.f['plot_' + k] = 'stopped';
}
const PLOTS = {
  // Doc is poisoning the Mayor, a little every day, for the pump.
  poison: {
    day: () => S.f.poisonDay || 10,
    live: () => alive('doc') && alive('mayor'),
    known: () => knew('doc.secret') || plotKnown('poison'),
    hit: () => {
      offstage(
        'mayor',
        'News from Rustwater: Mayor Fenwick died in his sleep. Doc Ratchet signed the certificate, then took the keys to the pump.',
      );
      S.f.docPump = 1;
    },
    opts: {
      mayor: () => [
        '"Stop drinking the Doc\'s tea. It\'s poison."',
        () => {
          stopPlot('poison');
          S.n.mayor.op = clamp(S.n.mayor.op + 30, -100, 100);
          S.n.doc.op = clamp(S.n.doc.op - 50, -100, 100);
          S.n.doc.rx.push('"You told him. Of course you told him. I\'ll remember that, next time you\'re bleeding."');
          gain(60);
          quote(
            'Fenwick pours the tea into a plant. The plant dies by morning. He slides you 60 teeth. "We never had this talk."',
          );
          go('talk', 'mayor');
        },
      ],
      doc: () =>
        S.f.poisonHelped
          ? null
          : [
              '"Need a hand with the Mayor\'s tea?"',
              () => {
                S.f.poisonHelped = 1;
                S.f.poisonDay = S.day + 1;
                karma(-2);
                gain(80);
                S.n.doc.op = clamp(S.n.doc.op + 30, -100, 100);
                quote(
                  'Doc gives you a vial and 80 teeth. "Double dose. He likes it sweet." Fenwick will not see the day after tomorrow.',
                );
                go('talk', 'doc');
              },
              'danger',
            ],
    },
  },
  // Lou wants Bacon Prime. Junior goes over the fence on day 9.
  pork: {
    day: () => 9,
    live: () => alive('pig') && alive('lou'),
    clue: { lou: ['pell', 'pig'], junior: ['pell', 'pig'], hector: ['lou'] },
    clueLine: '"Thursday is pork, they say at the diner. Pedigree pork. You know whose pig is pedigree."',
    known: () => plotKnown('pork'),
    hit: () => {
      offstage(
        'pig',
        "News from Scrapwell: Bacon Prime vanished in the night. The board at Mama Lou's says PEDIGREE PORK.",
      );
      if (alive('pell')) S.n.pell.rx.push('"They took him. They TOOK him. Somebody knew and said nothing."');
      S.f.porkDone = 1;
    },
    opts: {
      pell: () => [
        '"Lou\'s coming for Bacon Prime. Soon."',
        () => {
          stopPlot('pork');
          S.n.pell.op = clamp(S.n.pell.op + 30, -100, 100);
          quote(
            'Pell loads his shotgun and moves his chair into the sty. "Let her come." Bacon Prime is safe, and very confused.',
          );
          go('talk', 'pell');
        },
      ],
    },
  },
  // Krug wants Jeb's road east. His men hit the caravan on day 11, the day before the Molars come.
  route: {
    day: () => 11,
    live: () => alive('krug') && alive('jeb') && S.n.jeb.loc !== 'party',
    clue: { moe: ['jeb', 'krug'], teo: ['jeb', 'krug'], pete: ['krug'] },
    clueLine: '"Krug\'s men were in, asking when Jeb leaves and which road. Asking nice. That\'s never good."',
    known: () => plotKnown('route'),
    hit: () => {
      if (S.f.routeSold) {
        offstage(
          'jeb',
          "News from the east road: Krug's men hit Jeb's caravan. Jeb didn't make it. They knew exactly where he'd be.",
        );
      } else {
        bad("News from the east road: Krug's men hit Jeb's caravan. Jeb lived. His prices won't.");
        S.f.jebUp = (S.f.jebUp || 0) + 3;
        if (alive('pete') && S.n.pete.loc === 'rustwater')
          offstage('pete', "Pete died guarding the lizards. He didn't run. Not this time.");
      }
      S.f.routeHit = 1;
    },
    opts: {
      jeb: () => [
        '"Krug\'s men are coming for your caravan."',
        () => {
          stopPlot('route');
          S.n.jeb.op = clamp(S.n.jeb.op + 30, -100, 100);
          S.f.jebCheap = 1;
          quote(
            'Jeb goes pale, then practical. He changes the road and doubles the guards. "You ride half price, forever. Don\'t argue."',
          );
          go('talk', 'jeb');
        },
      ],
      krug: () =>
        S.f.routeSold
          ? null
          : [
              '"I know which road Jeb takes. For a price."',
              () => {
                S.f.routeSold = 1;
                karma(-3);
                gain(80);
                S.n.krug.op = clamp(S.n.krug.op + 25, -100, 100);
                quote('Krug writes it down, neatly. "A pleasure doing business." 80 teeth.');
                go('talk', 'krug');
              },
              'danger',
            ],
    },
  },
  // Gloria has been skimming. Opal counts properly on day 16.
  skim: {
    day: () => 16,
    live: () => alive('gloria') && alive('opal') && S.n.gloria.loc === 'rustwater',
    known: () => knew('gloria.secret') || plotKnown('skim'),
    hit: () => {
      S.f.gloriaOut = 1;
      S.n.gloria.op = clamp(S.n.gloria.op - 10, -100, 100);
      bad("News from Rustwater: Opal counted the takings. Gloria is sleeping behind Moe's bar now.");
    },
    opts: {
      gloria: () => [
        '"Opal\'s going to count the takings. Go, while you can."',
        () => {
          stopPlot('skim');
          S.n.gloria.op = clamp(S.n.gloria.op + 40, -100, 100);
          gain(40);
          if (alive('jeb')) {
            S.f.gloriaEast = 1;
            S.n.gloria.loc = 'east';
            quote(
              'Gloria kisses your cheek and presses 40 teeth into your hand. "Jeb leaves tonight. He just doesn\'t know I\'m coming." She goes east.',
            );
            return goHere();
          }
          quote(
            'Gloria presses 40 teeth into your hand. "I\'ll put it all back. Most of it." She starts counting, very fast.',
          );
          go('talk', 'gloria');
        },
      ],
      opal: () => [
        '"Gloria\'s been skimming you. For years."',
        () => {
          stopPlot('skim');
          S.f.gloriaOut = 1;
          S.n.opal.op = clamp(S.n.opal.op + 30, -100, 100);
          S.n.gloria.op = -80;
          quote(
            'Opal closes her eyes. "I knew. I didn\'t want to know." Gloria is out on the street by sundown, and she knows who told.',
          );
          go('talk', 'opal');
        },
        'danger',
      ],
    },
  },
  // Junior grows cabbages in secret. Lou finds them on day 18, unless he's gone by then.
  cabbage: {
    day: () => 18,
    live: () => alive('junior') && alive('lou') && S.n.junior.loc === 'diner',
    known: () => knew('junior.secret'),
    hit: () => {
      S.f.cabbageSalted = 1;
      bad(
        "News from the diner: Lou found the cabbages. She salted the earth behind the kitchen. Junior hasn't said a word since. Not even 'Mama'.",
      );
    },
    opts: {
      junior: () =>
        chkOpt('junior.leave', null, '"You could cook your cabbages in Rustwater. Your own place."', () => {
          if (attempt('junior.leave')) {
            stopPlot('cabbage');
            S.f.juniorFree = 1;
            S.n.junior.loc = 'rustwater';
            S.n.junior.op = clamp(S.n.junior.op + 40, -100, 100);
            if (alive('lou')) {
              S.n.lou.op = clamp(S.n.lou.op - 40, -100, 100);
              S.n.lou.rx.push('"You took my boy. My BOY. For CABBAGES."');
            }
            quote(
              'Junior puts down the cleaver. He picks up a very small spade. "...Yes." It is the longest speech of his life. He walks to Rustwater.',
            );
            return goHere();
          }
          quote('Junior looks at the kitchen door. He looks at the cleaver. "...Mama needs me." He keeps chopping.');
          go('talk', 'junior');
        }),
    },
  },
};
function runPlots() {
  for (const k in PLOTS) {
    const P = PLOTS[k];
    if (S.f['plot_' + k] || S.day < P.day()) continue;
    S.f['plot_' + k] = P.live() ? 'done' : 'void';
    if (S.f['plot_' + k] === 'done') P.hit();
  }
}
const _reactWeb = reactions;
reactions = function () {
  _reactWeb();
  if (!S.end) runPlots();
};

// ---- what you can say to someone, given what you know ----
function webOpts(id) {
  if (NPC[id].animal) return [];
  const o = [['Ask about someone', () => go('askabout', id)]];
  const sc = SECRETS[id];
  if (sc && sc.short && knew(id + '.secret') && !S.f['sec_' + id])
    o.push([`"I know ${sc.short}."`, () => go('secret', id)]);
  for (const k in PLOTS) {
    const P = PLOTS[k];
    if (P.opts[id] && plotOpen(k) && P.known()) o.push(P.opts[id]());
  }
  return o.filter(Boolean);
}

// Junior's Greens: cabbage soup in Rustwater, once he's free.
const _huboRustWeb = HUBO.rustwater;
HUBO.rustwater = () => {
  const o = _huboRustWeb();
  if (S.f.juniorFree && alive('junior'))
    o.push([
      "Junior's Greens: cabbage soup (5 teeth, +15 HP)",
      () => {
        if (pay(5)) say(`+${heal(15)} HP. It's... vegetables. Real ones. Junior watches you eat it and nearly smiles.`);
        goHere();
      },
    ]);
  return o;
};

// ---- ending slides ----
function webLines() {
  const f = S.f,
    L = [];
  if (f.plot_poison === 'done')
    L.push("Doc Ratchet runs the pump now. Water costs more. Nobody asks what was in Fenwick's tea.");
  else if (f.plot_poison === 'stopped' && alive('mayor'))
    L.push('Fenwick lived. He never drank tea again, and never forgave Doc, or thanked you.');
  if (f.plot_pork === 'done')
    L.push('Pell never got another pig. He sits on the step where the sty was and talks to the air.');
  else if (f.plot_pork === 'stopped' && alive('pig'))
    L.push('Bacon Prime lived to a great age, guarded day and night by an old man with a shotgun.');
  if (f.plot_route === 'done')
    L.push(
      f.routeSold
        ? "Jeb's caravan never reached the mountains. Krug's chains use his road now. You sold it."
        : "Jeb's caravan limped on, poorer and angrier.",
    );
  else if (f.plot_route === 'stopped' && alive('jeb'))
    L.push('Jeb kept his road. He named a lizard after you. It bites.');
  if (f.gloriaEast) L.push('Gloria went east with Jeb. Whether it was green, she never wrote to say.');
  else if (f.gloriaOut && alive('gloria'))
    L.push("Gloria sleeps behind Moe's bar and still laughs like a cement mixer. Quieter now.");
  if (f.juniorFree && alive('junior'))
    L.push(
      "Junior's Greens, Rustwater: the only vegetables in the valley. He talks to the customers now. Whole sentences.",
    );
  else if (f.cabbageSalted) L.push('Junior never spoke again. The earth behind the diner stayed white with salt.');
  const sq = S.c.squeezed || 0,
    kept = IDS.filter(x => S.f['sec_' + x] === 'kept').length;
  if (sq)
    L.push(
      `You squeezed ${sq} ${sq === 1 ? 'person' : 'people'} with their own secrets. The valley remembers who knows what.`,
    );
  if (kept >= 3) L.push(`You kept ${kept} secrets you could have sold. A few people slept easier because of you.`);
  return L;
}
