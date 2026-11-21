'use strict';
// ================= SEDUCTION & JEALOUSY =================
// Each woman is won her own way, and each takes news of another woman her own way.
// Being together is an event ('lover'), so it travels through gossip and jealousy lands days later.
//   Bess     adventure, leaving the farm (her checks are in talk.js) | goes after the other woman herself
//   Opal     honesty and money, hard to truly win                    | doesn't care
//   Crane    respect, earned by doing good in Rustwater               | dumps you, then investigates you
//   Lou      loving her cooking, all of it                            | smiles. A week later the other woman is the Thursday special
//   Gloria   easy to bed, nearly impossible to win                    | doesn't care
// Sex is always fade-to-black.
const FADE = [
  'Later. Much later. Neither of you mentions it, and both of you think about it.',
  "The lamp goes out. What happens next is nobody else's business.",
  'Some time passes. Some furniture does not survive it.',
];
function becomeLover(id, how) {
  S.lovers[id] = { day: S.day, how: how || 'lover' };
  event('lover', id, { wit: [] });
  say(pick(FADE));
}
const lover = id => !!S.lovers[id] && alive(id);
// Jealousy. Runs when a lover hears that you've been with someone else.
const JEALOUS = {
  bess: other => {
    if (S.f.catfight || S.f.catfightDone || !alive(other)) return;
    const where = S.n[other].loc;
    if (!LOC[where]) return;
    S.f.catfight = other;
    if (S.n.bess.loc !== 'party') S.n.bess.loc = where;
    S.n.bess.rx.push(
      `"I heard about you and ${NPC[other].n}. I'm going to go and have a word with her. With the hoe."`,
    );
    later(3, 'catfightOver');
  },
  sheriff: other => {
    delete S.lovers.sheriff;
    S.f.craneSuspect = 1;
    S.n.sheriff.op = Math.min(S.n.sheriff.op, -20);
    S.n.sheriff.rx.push(`"${NPC[other].n}. Right. We're done. And from now on I'm watching you."`);
    later(3, 'craneDigs');
  },
  lou: other => {
    if (S.f.thursday || !alive(other) || other === 'lou') return;
    S.f.thursday = other;
    S.n.lou.rx.push("Lou smiles at you. She doesn't say anything. She just keeps smiling.");
    later(7, 'thursday', other);
  },
  opal: () => S.n.opal.rx.push('"Heard you\'ve been busy, sugar. Doesn\'t bother me. Just pay on time."'),
  gloria: () => S.n.gloria.rx.push('"Heard about you and her. Good for you, honey. Got any teeth?"'),
};
REACT.lover = (id, ev) => {
  if (lover(id) && ev.v !== id && JEALOUS[id]) JEALOUS[id](ev.v);
};
REACT.married = REACT.lover;
LATER.thursday = x => {
  if (!alive(x) || !alive('lou') || x === 'lou') return;
  S.dead[x] = 1;
  delete S.lovers[x];
  if (S.spouse === x) {
    S.spouse = null;
    S.f.spouseFate = 'thursday';
  }
  S.f.thursdayDone = x;
  event('eaten', x, { loc: 'diner', wit: [] });
  bad(`${NPC[x].n} went to Mama Lou's for dinner. Nobody has seen her since.`);
};
// Crane digs into every quiet killing she can tie to you.
LATER.craneDigs = () => {
  if (!alive('sheriff')) return;
  S.ev
    .filter(e => e.type === 'murder' && e.secret && e.v)
    .forEach(e => {
      if (!S.n.sheriff.k.some(i => S.ev[i].type === 'murder' && S.ev[i].v === e.v && !S.ev[i].secret))
        event('murder', e.v, { loc: e.loc, wit: ['sheriff'] });
    });
};
// Nobody came to stop it, so it settled itself.
LATER.catfightOver = () => {
  const o = S.f.catfight;
  if (!o) return;
  S.f.catfight = null;
  S.f.catfightDone = 1;
  S.f.catfightHow = 'alone';
  if (S.n.bess.loc !== 'party' && alive('bess')) S.n.bess.loc = 'farm';
  delete S.lovers[o];
  if (alive(o)) S.n[o].op = clamp(S.n[o].op - 30, -100, 100);
};
const catfightHere = loc =>
  S.f.catfight &&
  alive('bess') &&
  alive(S.f.catfight) &&
  S.n[S.f.catfight].loc === loc &&
  (S.n.bess.loc === loc || S.n.bess.loc === 'party');
SC.catfight = loc => {
  const o = S.f.catfight,
    nm = NPC[o].n;
  const done = how => {
    S.f.catfight = null;
    S.f.catfightDone = 1;
    S.f.catfightHow = how;
    if (S.n.bess.loc !== 'party') S.n.bess.loc = 'farm';
    go('hub', loc);
  };
  const stayOut = {
    opal: () => {
      say(
        'Opal reaches under the counter. Bess looks at the shotgun, then at you, and walks home. She does not look back.',
      );
      delete S.lovers.bess;
      S.n.bess.op -= 30;
    },
    sheriff: () => {
      say(
        'Crane arrests Bess for disturbing the peace. Bess spends a night in a cell, screaming your name. Not fondly.',
      );
      delete S.lovers.bess;
      S.n.bess.op -= 30;
    },
    lou: () => {
      say(
        'You step outside. When you come back in, Lou is wiping the cleaver and Bess is nowhere. "She left, honey." The stew smells wonderful.',
      );
      S.dead.bess = 1;
      if (S.spouse === 'bess') {
        S.spouse = null;
        S.f.spouseFate = 'thursday';
      }
      S.f.thursdayDone = 'bess';
      event('eaten', 'bess', { loc: 'diner', wit: [] });
    },
    gloria: () => {
      say(
        'Gloria laughs so hard that Bess gives up halfway through the speech. She goes home. Gloria charges you for the show.',
      );
      delete S.lovers.bess;
      S.n.bess.op -= 20;
    },
  };
  show({
    title: 'Bess has found her',
    icon: '👩‍🌾',
    text: `Bess has ${nm} backed against the wall, hoe raised. "Tell her," Bess says to you. "Tell her what we are." ${nm} looks at you too.`,
    opts: [
      [
        'Stand with Bess',
        () => {
          delete S.lovers[o];
          S.n[o].op = clamp(S.n[o].op - 50, -100, 100);
          S.n.bess.op = clamp(S.n.bess.op + 20, -100, 100);
          quote(`Bess: "See?" ${nm} doesn't say anything. She doesn't have to. You're finished there.`);
          done('bess');
        },
      ],
      [
        `Stand with ${nm}`,
        () => {
          delete S.lovers.bess;
          S.n.bess.op = clamp(S.n.bess.op - 50, -100, 100);
          if (S.spouse === 'bess') {
            S.spouse = null;
            S.n.bess.loc = 'farm';
            S.f.spouseFate = 'left';
          }
          quote('Bess: "Eleven years on a farm and the first man I meet is THIS." She goes home. She takes the hoe.');
          done('other');
        },
      ],
      [
        'Stay out of it',
        () => {
          stayOut[o]();
          done('out');
        },
      ],
    ],
  });
};
// Romance lines, added to each woman's conversation.
function romanceOpts(id) {
  const f = S.f,
    o = [];
  if (id === 'opal' && !lover('opal') && S.teeth >= 100)
    o.push(
      chkOpt(
        'opal.honest',
        null,
        '"I have 100 teeth and no lies left. I want an evening with you. Not the girls. You."',
        () => {
          if (attempt('opal.honest')) {
            pay(100);
            quote('Opal: "Honest AND paying. You know how rare that is, sugar?" She locks the door.');
            becomeLover('opal');
          } else quote('Opal: "Everyone says that. Nobody means it. Come back when I believe you."');
          go('talk', 'opal');
        },
      ),
    );
  if (id === 'sheriff' && !lover('sheriff') && !f.craneSuspect && goodHeard('sheriff') >= 2)
    o.push(
      chkOpt(
        'crane.respect',
        null,
        '"You keep this town alive, Sheriff. Let me buy you a drink. Just a drink."',
        () => {
          if (attempt('crane.respect')) {
            quote('Crane: "Just a drink." It is not just a drink.');
            becomeLover('sheriff');
          } else quote('Crane: "I\'m working. I\'m always working." But she watches you go.');
          go('talk', 'sheriff');
        },
      ),
    );
  if (id === 'lou' && !lover('lou') && (f.stew || 0) >= 1)
    o.push(
      chkOpt(
        'lou.cook',
        null,
        f.cannibal
          ? '"Lou, I dream about your stew. All of it. Even the parts with names."'
          : '"Lou, that stew. I would walk through the wastes for that stew."',
        () => {
          if (attempt('lou.cook')) {
            quote('Lou goes pink. "Junior. Go chop something. Outside. For a long time."');
            becomeLover('lou');
          } else quote('Lou: "Everybody loves the stew, honey. Doesn\'t make you special."');
          go('talk', 'lou');
        },
      ),
    );
  if (id === 'gloria') {
    if (!lover('gloria'))
      o.push(
        chkOpt('gloria.bed', null, '"Gloria. Upstairs?"', () => {
          if (attempt('gloria.bed')) {
            quote('Gloria: "Thought you\'d never ask. You\'d be amazed how many never ask."');
            becomeLover('gloria', 'fling');
          } else quote('Gloria: "Not tonight, honey. Tonight I\'m tired of men."');
          go('talk', 'gloria');
        }),
      );
    else if (S.lovers.gloria.how !== 'won')
      o.push(
        chkOpt('gloria.win', null, '"Come away with me, Gloria. Out east. They say it\'s green."', () => {
          if (attempt('gloria.win')) {
            S.lovers.gloria.how = 'won';
            quote('Gloria stops laughing. It takes her a long time to say anything. "...Green?"');
          } else quote('Gloria laughs until she cries. Then she pats your face. "You\'re sweet. Get out."');
          go('talk', 'gloria');
        }),
      );
  }
  return o;
}
// Ending slides for every relationship.
function loveLines() {
  const L = [],
    f = S.f,
    al = x => !S.dead[x],
    t = f.thursdayDone;
  if (t) L.push(`Every Thursday, Mama Lou serves ${NPC[t].n}. It is her best seller. Lou always saves you a bowl.`);
  if (f.catfightHow === 'bess') L.push('Bess never let you out of her sight again. The hoe never left her hand.');
  if (lover('bess') && S.spouse !== 'bess')
    L.push('Bess kept meeting you behind the barn for years. Hector pretended not to know. Hector knew.');
  if (lover('opal'))
    L.push(
      'Madame Opal kept a room for you at the Velvet Rad. She never stopped charging you for it. You never stopped paying.',
    );
  if (lover('sheriff'))
    L.push(
      'Sheriff Crane let you buy her a drink every Friday for the rest of her life. She never called it love. She never arrested you, either.',
    );
  else if (f.craneSuspect && al('sheriff'))
    L.push('Crane kept a file on you. It got thick. One day it will be enough.');
  if (lover('lou'))
    L.push('You and Mama Lou grew old together. You never asked what was in the stew. You never had to.');
  if (lover('gloria'))
    L.push(
      S.lovers.gloria.how === 'won'
        ? 'Gloria came east with you. Nobody in Rustwater believed it. Some days, neither did she.'
        : "Gloria forgot your name within the month. She remembers everyone's teeth, though.",
    );
  return L;
}
