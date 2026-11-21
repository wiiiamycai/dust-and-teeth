'use strict';
// ================= SILO 9 =================
function kingFight() {
  const en = [foe('king')];
  if (!S.f.pitFreed)
    en.push(mkE('Molar elite', '🦷', 7, { wep: 'molargun' }), mkE('Molar elite', '🦷', 7, { arm: 'spikes' }));
  if (S.f.sheriffAlly && alive('sheriff')) say('Sheriff Crane kicks the door in behind you.');
  fight(en, { started: true, win: 'go', args: ['console'], allies: S.f.sheriffAlly ? ['sheriff'] : [] });
}
SC.throne = () => {
  const f = S.f;
  if (!alive('king')) return go('console');
  if (f.sabotaged && !f.kingTried) {
    f.kingTried = 1;
    quote('The King slams a big red button. Nothing. Again. Nothing. He turns to you, very slowly.');
  }
  show({
    title: 'The Dentist King',
    icon: '🦷',
    sub: sizeUp(lvl('king')),
    text: "A pre-war dentist's coat. A crown of other people's teeth. \"The world has a rotten tooth. I'm going to pull it.\"",
    opts: [
      [
        '"Why?"',
        () => {
          quote('King: "Two hundred years of rot. One clean extraction. Then something new can grow."');
          go('throne');
        },
      ],
      !f.kingStopped && canTry('king.talk')
        ? [
            '"Put the key down. Nobody needs pulling."' + hint('king.talk'),
            () => {
              if (attempt('king.talk')) {
                stopKing('talked');
                give('key');
                quote(
                  'An hour about his mother. About flossing. He sits down and cries, and hands you the launch key.',
                );
                go('console');
              } else {
                bad('King: "You sound like my patients."');
                kingFight();
              }
            },
          ]
        : null,
      !f.kingStopped && !knew('king.mother')
        ? [
            '"Who were you, before?"',
            () => {
              know('king.mother');
              quote('King: "My mother\'s boy. She ran the practice. Said I had gentle hands."');
              go('throne');
            },
          ]
        : null,
      !f.kingStopped && knew('king.mother') && canTry('king.mother')
        ? [
            '"Your mother said you had gentle hands. Use them. Put it down."' + hint('king.mother'),
            () => {
              if (attempt('king.mother')) {
                stopKing('talked');
                give('key');
                quote(
                  'The King looks at his hands for a long time. Then he takes off the crown and gives you the key.',
                );
                go('console');
              } else {
                bad('King: "Don\'t you DARE talk about her."');
                kingFight();
              }
            },
          ]
        : null,
      !f.kingStopped && S.stats.brains >= 8 && canTry('king.zero')
        ? [
            '"It launches from HERE. You\'re ground zero."' + hint('king.zero'),
            () => {
              if (attempt('king.zero')) {
                stopKing('talked');
                give('key');
                quote('He goes very pale. He had not considered that. He hands you the key.');
                go('console');
              } else {
                bad("He doesn't follow the maths.");
                kingFight();
              }
            },
          ]
        : null,
      !f.kingStopped
        ? [
            'Lift the launch key off his neck' + hint('king.key'),
            () => {
              if (attempt('king.key')) {
                stopKing('stolen');
                give('key');
                quote('You lift the key mid-monologue. He keeps monologuing.');
                go('throne');
              } else {
                bad('King: "Rude."');
                kingFight();
              }
            },
          ]
        : null,
      !f.kingStopped ? ['"Let me push the button."', () => go('launch', 'king'), 'danger'] : null,
      ['Fight him', () => kingFight(), 'danger'],
      ['Back', () => go('hub', 'silo')],
    ],
  });
};
SC.console = () => {
  const f = S.f;
  const o = [];
  if (!f.disarmed && !f.launched)
    o.push([
      'Disarm the Big Tooth for good',
      () => {
        f.disarmed = 1;
        stopKing(f.kingHow || 'killed');
        addTitle('Saviour Nobody Will Believe');
        gainXP(200);
        say('You pull every wire. The hum dies. The world will never know.');
        go('console');
      },
    ]);
  if (!f.disarmed && !f.launched && (has('key') || !alive('king')))
    o.push(['Launch it yourself', () => go('launch', 'you'), 'danger']);
  o.push(['Back', () => go('hub', 'silo')]);
  show({
    title: 'Launch console',
    icon: '🚀',
    text: f.disarmed
      ? 'Dead wires. A dead missile. A world that has no idea.'
      : f.launched
        ? 'The silo is empty. Somewhere, a crater glows.'
        : 'A big red button and a map of the wasteland with every town circled.',
    opts: o,
  });
};
SC.launch = who => {
  const t = Object.keys(LOC).filter(k => !LOC[k].sub && k !== 'silo' && !S.crater[k]);
  show({
    title: 'Choose a target',
    icon: '☢️',
    text:
      who === 'king'
        ? 'The King hands you the key, beaming. "You pick. It\'s your gift."'
        : 'Your finger over the button. Who goes?',
    opts: [
      ...t.map(k => [`Nuke ${LOC[k].n}`, () => nuke(k, who), 'danger']),
      [
        'EVERYTHING',
        () => {
          S.end = { type: 'destroyer' };
          go('ending');
        },
        'danger',
      ],
      ["Don't", () => go(who === 'king' ? 'throne' : 'console')],
    ],
  });
};
function nuke(k, who) {
  const f = S.f;
  f.launched = 1;
  f.kingStopped = 1;
  f.kingHow = f.kingHow || 'launched';
  f.nukedLoc = k;
  S.crater[k] = 1;
  karma(-20);
  addTitle(`Destroyer of ${LOC[k].n}`);
  let c = 0;
  IDS.forEach(x => {
    if (
      alive(x) &&
      (S.n[x].loc === k || (k === 'chainfield' && S.n[x].loc === 'pen') || (k === 'scrapwell' && S.n[x].loc === 'well'))
    ) {
      S.dead[x] = 1;
      c++;
    }
  });
  S.kills += c + (k === 'rustwater' ? 200 : 30);
  if (who === 'king') addTitle('Heir to the Dentist King');
  event('nuked', null, { all: true, tgt: k, loc: 'silo' });
  if (k === 'scrapwell') {
    S.end = { type: 'nukehome' };
    return go('ending');
  }
  bad(`The Big Tooth rises. ${LOC[k].n} is gone. Everyone there. Everyone.`);
  go('hub', 'silo');
}
