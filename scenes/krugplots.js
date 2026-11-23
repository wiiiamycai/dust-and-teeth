'use strict';
// ================= GETTING KRUG KILLED BY SOMEONE ELSE =================
// Three ways to talk someone else into doing it. All of them land days later, off-screen,
// and all of them can go wrong.
//   1. Sheriff Crane raids Chainfield, if you bring her proof (Old Teo as a witness, or Krug's notebook).
//      Ride with her, let her go alone, or sell her out to Krug.
//   2. The Dentist King burns Chainfield, if you convince him Krug cheats him (at his throne, or by
//      sending word with a Molar tax gang). Krug dies. Everyone in the pens is marched east to dig.
//   3. Hector goes in after Bess himself, if you talk him into it. Knowing the guard rota helps him live.
// Information drives all three: Teo knows the guard rota, and the rota helps every way into Chainfield.

function krugDown(how) {
  if (!alive('krug')) return;
  S.dead.krug = 1;
  S.f.krugHow = how;
  S.f.corpse = null;
}
// Free everyone in the pens ('home'), or hand them to the King ('east').
function emptyPens(to) {
  ['bess', 'bert'].forEach(x => {
    if (!alive(x) || S.n[x].loc !== 'pen') return;
    if (to === 'home') {
      S.n[x].loc = 'farm';
      if (x === 'bess') S.f.bessHome = 1;
    } else {
      S.n[x].loc = 'gone';
      S.n[x].st.goneDay = S.day;
    }
  });
  if (alive('teo') && S.n.teo.loc === 'chainfield') S.n.teo.loc = to === 'home' ? 'rustwater' : 'gone';
  if (to === 'home') S.f.freed = 1;
}

// ---- information: Old Teo ----
const _teo = TALK.teo;
TALK.teo = () => {
  const r = _teo();
  if (alive('krug') && !knew('krug.rota'))
    r.o.push([
      '"When do Krug\'s guards change?"',
      () => {
        know('krug.rota');
        quote('Teo: "Midnight. Two of them sleep through it. Krug sleeps like a baby, notebook under the pillow."');
        go('talk', 'teo');
      },
    ]);
  if (alive('krug') && !knew('krug.witness'))
    r.o.push([
      '"Would you tell the Sheriff what Krug does here?"',
      () => {
        if (S.n.teo.op >= 0) {
          know('krug.witness');
          quote('Teo: "Tell her? I\'ll sing it. Every name, every price."');
        } else quote('Teo: "Why would I trust you with my neck?"');
        go('talk', 'teo');
      },
    ]);
  return r;
};

// ---- Krug: his notebook, and selling out the Sheriff ----
const _krug = TALK.krug;
TALK.krug = () => {
  const r = _krug(),
    f = S.f;
  if (!has('krugbook'))
    r.o.push(
      chkOpt('krug.book', null, 'Lift the notebook from his coat', () => {
        if (attempt('krug.book')) {
          give('krugbook');
          say(
            "It's all in here. Names, prices, dates. Who bought whom. What the King pays for diggers who die in a week.",
          );
          go('talk', 'krug');
        } else {
          bad('Krug: "That is my PERSONAL notebook."');
          S.n.krug.op = -100;
          fight(crew('krug'), { started: true, win: 'back', back: ['map'] });
        }
      }),
    );
  if (f.craneRaid && !f.raidDone && !f.raidBetrayed && alive('sheriff'))
    r.o.push([
      '"Crane is coming for you. Three days, with every gun in Rustwater."',
      () => {
        f.raidBetrayed = 1;
        karma(-3);
        addTitle('Sold Out the Law');
        S.n.krug.op = clamp(S.n.krug.op + 30, -100, 100);
        quote('Krug writes it down. Neatly. "A valued colleague. Here, for your trouble." (+100 teeth)');
        gain(100);
        go('talk', 'krug');
      },
      'danger',
    ]);
  return r;
};

// ---- 1. Sheriff Crane's raid ----
const _sheriff = TALK.sheriff;
TALK.sheriff = () => {
  const r = _sheriff(),
    f = S.f;
  if (alive('krug') && !f.craneRaid && (knew('krug.witness') || has('krugbook')))
    r.o.push(
      chkOpt('crane.krug', null, '"Krug sells people. I can prove it."', () => {
        if (attempt('crane.krug')) {
          f.craneRaid = S.day + DAYS(3);
          go('raidask');
        } else {
          quote('Crane: "Proof, I said. Not a story about proof."');
          go('talk', 'sheriff');
        }
      }),
    );
  return r;
};
SC.raidask = () =>
  show({
    title: 'Sheriff Crane',
    icon: '⭐',
    text: `Crane reads it twice. ${has('krugbook') ? 'She closes the notebook very gently, like it might go off.' : 'Teo talks for an hour. She writes down every word.'} "Three days. I need every gun in Rustwater." She looks at you. "You riding with me?"`,
    opts: [
      [
        '"I\'ll be at the gate."',
        () => {
          S.f.raidJoin = 1;
          later(5, 'raidLate');
          quote('Crane: "Day after tomorrow, then the next. Chainfield gate. Don\'t be late."');
          go('talk', 'sheriff');
        },
      ],
      [
        '"It\'s your fight, Sheriff."',
        () => {
          later(3, 'craneRaid');
          quote('Crane: "It always was."');
          go('talk', 'sheriff');
        },
      ],
    ],
  });
// The odds when Crane goes in without you.
function raidOutcome(mod) {
  const f = S.f;
  if (f.raidDone || !alive('sheriff') || !alive('krug')) return;
  f.raidDone = 1;
  if (f.raidBetrayed) {
    S.dead.sheriff = 1;
    f.craneHow = 'ambushed';
    event('betrayed', 'sheriff', { loc: 'chainfield', wit: ['krug'] });
    bad("News from Chainfield: Krug was waiting at the gate for Crane. Rustwater doesn't have a sheriff any more.");
    return;
  }
  const p = 55 + mod + (knew('krug.rota') ? 15 : 0) + (f.raidResult === 'held' ? 10 : 0);
  if (roll(p)) {
    krugDown('crane');
    emptyPens('home');
    event('freed', null, { loc: 'chainfield', wit: [] });
    S.n.sheriff.op = clamp(S.n.sheriff.op + 20, -100, 100);
    S.n.sheriff.rx.push(
      '"We hanged Krug from his own gate. Couldn\'t have done it without you. Don\'t let it go to your head."',
    );
    bad('News from Chainfield: Crane hanged Krug from his own gate. The pens are empty.');
  } else {
    S.dead.sheriff = 1;
    f.craneHow = 'died';
    if (knew('krug.witness') && alive('teo')) S.dead.teo = 1;
    event('fell', 'sheriff', { loc: 'chainfield', wit: [] });
    bad("News from Chainfield: Crane rode in with four deputies. Krug's slavers rode out wearing their badges.");
  }
}
LATER.craneRaid = () => raidOutcome(0);
LATER.raidLate = () => {
  if (!S.f.raidDone && alive('sheriff') && alive('krug')) {
    S.n.sheriff.op = clamp(S.n.sheriff.op - 20, -100, 100);
    raidOutcome(-10);
  }
};
// Riding with her: turn up at Chainfield on or after the day.
const raidHere = loc =>
  loc === 'chainfield' && S.f.raidJoin && !S.f.raidDone && S.day >= S.f.craneRaid && alive('sheriff') && alive('krug');
SC.krugraid = () =>
  show({
    title: 'Chainfield gate',
    icon: '⭐',
    text: 'Crane and four deputies crouch behind a burnt-out car, rifles up. The pens are quiet. Krug is not. "Ready?"',
    opts: [
      [
        'Go in with them',
        () => {
          S.f.raidDone = 1;
          if (S.f.raidBetrayed) {
            bad('Krug is waiting for you. Of course he is. You told him.');
            S.f.craneHow = 'ambushed';
          }
          fight([foe('krug'), slv(), slv()], {
            started: true,
            close: true,
            allies: ['sheriff'],
            win: 'krugraid',
            back: ['map'],
          });
        },
        'danger',
      ],
      ['Hang back and let them go', () => (raidOutcome(-15), go('hub', 'chainfield'))],
    ],
  });
WIN.krugraid = () => {
  emptyPens('home');
  S.f.krugHow = 'raid';
  event('freed', null, { loc: 'chainfield', wit: [] });
  if (alive('sheriff')) {
    S.n.sheriff.op = clamp(S.n.sheriff.op + 25, -100, 100);
    quote('Crane: "Good work." She hangs Krug from his own gate. The pens open.');
  }
  go('hub', 'chainfield');
};

// ---- 2. The Dentist King burns Chainfield ----
function sendMolars() {
  S.f.molarsSent = 1;
  later(2, 'molarsBurn');
}
LATER.molarsBurn = () => {
  if (!alive('krug')) return;
  krugDown('molars');
  emptyPens('east');
  S.f.chainfieldBurned = 1;
  S.f.kingFed = 1;
  event('burned', null, { loc: 'chainfield', wit: [] });
  bad(
    "News from the east: the Molars burned Chainfield. Krug's head is on a pole. Everyone in the pens was marched east to dig.",
  );
};
function kingKrugOpts() {
  const f = S.f;
  if (!alive('krug') || f.kingStopped || f.molarsSent) return [];
  if (has('krugbook'))
    return [
      [
        '"Krug has been selling you dying men at full price. It\'s all in his book."',
        () => {
          take('krugbook');
          sendMolars();
          S.n.king.op = clamp(S.n.king.op + 20, -100, 100);
          quote('The King turns the pages slowly. "A rotten tooth." He sends for his elite.');
          go('throne');
        },
      ],
    ];
  return [
    chkOpt('king.krug', null, '"Krug laughs about you. Calls you the Tooth Fairy."', () => {
      if (attempt('king.krug')) {
        sendMolars();
        quote('The King goes very still. "The Tooth Fairy." He sends for his elite.');
      } else quote('King: "Krug has never laughed in his life. Nor have I."');
      go('throne');
    }),
  ];
}
const _molars = ENC.molars;
ENC.molars = d => {
  const e = _molars(d);
  if (alive('krug') && !S.f.molarsSent && !S.f.kingStopped) {
    if (has('krugbook'))
      e.o.push([
        '"Take this to your King. Krug is cheating him."',
        () => {
          take('krugbook');
          sendMolars();
          say('The Molar flicks through it, and stops smiling. They forget about your tooth and head east, fast.');
          go('hub', d);
        },
      ]);
    else
      e.o.push(
        chkOpt('molars.krug', null, '"Tell your King that Krug sells him dying men."', () => {
          if (attempt('molars.krug')) {
            sendMolars();
            say('They look at each other. Then they forget your tooth and head east, fast.');
            go('hub', d);
          } else {
            bad('"The King knows what he buys." They still want the tooth.');
            go('enc', 'molars', d);
          }
        }),
      );
  }
  return e;
};
const _hubtC = HUBT.chainfield,
  _huboC = HUBO.chainfield;
HUBT.chainfield = () =>
  S.f.chainfieldBurned
    ? "Burnt trolleys and burnt tents. Krug's head watches the road from a pole. The pens are empty, and not in a good way."
    : _hubtC();
HUBO.chainfield = () => (S.f.chainfieldBurned ? [] : _huboC());

// ---- 3. Hector goes in after his child ----
const _hector = TALK.hector;
TALK.hector = () => {
  const r = _hector(),
    f = S.f,
    x = ['bess', 'bert'].find(k => alive(k) && S.n[k].loc === 'pen');
  if (x && alive('krug') && !f.hectorWent && knows('hector', 'sold', x))
    r.o.push(
      chkOpt(
        'hector.go',
        null,
        knew('krug.rota')
          ? '"Krug changes guards at midnight. Two of them sleep. Go and get her yourself."'.replace(
              'her',
              x === 'bess' ? 'her' : 'him',
            )
          : `"You're ${NPC[x].n}'s father. Go and get ${x === 'bess' ? 'her' : 'him'} yourself."`,
        () => {
          if (attempt('hector.go')) {
            f.hectorWent = x;
            later(1, 'hectorRaid', x);
            quote('Hector says nothing. He loads the shotgun, one shell at a time, and walks out towards Chainfield.');
          } else quote('Hector: "And leave the farm to you? Get out."');
          go('talk', 'hector');
        },
      ),
    );
  return r;
};
LATER.hectorRaid = x => {
  if (!alive('hector') || !alive('krug') || S.n[x].loc !== 'pen') return;
  const nm = NPC[x].n;
  if (roll(35 + (knew('krug.rota') ? 25 : 0))) {
    krugDown('hector');
    emptyPens('home');
    S.n.hector.op = Math.max(S.n.hector.op, -20);
    S.n.hector.rx.push(`"I shot Krug through his own gate. ${nm}'s home. I still want to shoot you. Less."`);
    bad(`News from Chainfield: Hector shot Krug through his own gate at midnight and carried ${nm} home.`);
  } else {
    S.dead.hector = 1;
    S.f.hectorHow = 'krug';
    event('sentdeath', 'hector', { loc: 'chainfield', wit: [] });
    bad('News from Chainfield: Hector went in alone at midnight. Krug kept the shotgun as a souvenir.');
  }
};

// ---- endings ----
function krugLines() {
  const f = S.f,
    L = [];
  L.push(
    {
      crane: 'Sheriff Crane hanged Krug from his own gate. The notebook went in the fire, page by page, name by name.',
      raid: 'You and Crane took Chainfield together. Krug swung from his own gate. They still tell it in Rustwater, louder every year.',
      molars: 'The Molars burned Chainfield. Everyone in the pens went east to dig for the King. You sent them.',
      hector:
        'Hector shot Krug through his own gate and carried his child home. He never thanked you. He never shot you either.',
    }[f.krugHow] || '',
  );
  if (f.craneHow === 'ambushed')
    L.push(
      "Sheriff Crane died at Chainfield's gate, in an ambush somebody sold her into. Rustwater never found out who. You know who.",
    );
  else if (f.craneHow === 'died')
    L.push('Sheriff Crane rode into Chainfield and never rode out. Rustwater put up a statue. It faces east.');
  if (f.hectorHow === 'krug')
    L.push('Hector died at the Chainfield gate, trying to bring his child home. You told him how.');
  return L.filter(Boolean);
}
