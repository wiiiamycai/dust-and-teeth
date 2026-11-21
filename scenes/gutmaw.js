'use strict';
// ================= THE GUTMAW =================
// A roaming apex burrower. It moves along the roads every day or two. You meet it on the road
// near wherever it is, and the place it's in shows the signs. Early on: run, hide, or throw it
// something to eat. Late on, with real armour and a real gun, it can be killed, and everyone hears.
function roamGutmaw() {
  const f = S.f;
  if (f.gutDead) return;
  if (!f.gutLoc) f.gutLoc = 'skybus';
  if (roll(50)) {
    const n = neighbours(f.gutLoc).filter(k => k !== 'well' && !S.crater[k]);
    if (n.length) f.gutLoc = pick(n);
  }
}
const gutNear = dest => !S.f.gutDead && (S.f.gutLoc === dest || S.f.gutLoc === S.here);
const fed = (d, what) => {
  say(
    `You throw it ${what}. The Gutmaw stops, and the ground swallows the noise of it eating. You don't wait to watch.`,
  );
  go('hub', d);
};
ENC.gutmaw = d => ({
  title: 'The Gutmaw',
  icon: '🪱',
  t: "The road bulges, then splits. The Gutmaw comes up through it: the size of a car, all mouth, rings of teeth going back into the dark. The ground shakes when it moves. It hasn't found you yet. It's smelling for you.",
  o: [
    [
      'Run',
      () => {
        if (roll(fleeP() - 25)) {
          say('You run until your lungs give out. Behind you the ground goes quiet again.');
          go('hub', d);
        } else {
          bad("It's faster underground than you are on top of it.");
          fight([gutmawE()], { win: 'gutmaw', args: [d], back: ['hub', d] });
        }
      },
    ],
    [
      'Lie flat in a ditch and do not breathe' + hint('gutmaw.hide'),
      () => {
        if (attempt('gutmaw.hide')) {
          say('It passes right over you. You feel it more than hear it. Then it is gone.');
          go('hub', d);
        } else {
          bad('A rock shifts under you. It hears it.');
          fight([gutmawE()], { win: 'gutmaw', args: [d], back: ['hub', d] });
        }
      },
    ],
    has('meat')
      ? [
          'Throw it your meat',
          () => {
            take('meat');
            fed(d, 'the meat');
          },
        ]
      : null,
    has('pig')
      ? [
          'Throw it Bacon Prime',
          () => {
            take('pig');
            S.f.pigFate = 'gutmaw';
            fed(d, 'the pig, sack and all. Bacon Prime goes out the way he lived: furious');
          },
        ]
      : null,
    S.spouse && alive(S.spouse)
      ? [
          `Shove ${NPC[S.spouse].n} at it`,
          () => {
            const x = S.spouse,
              nm = NPC[x].n;
            S.spouse = null;
            S.dead[x] = 1;
            S.f.spouseFate = 'gutmaw';
            karma(-6);
            addTitle('Fed Their Spouse to the Gutmaw');
            event('murder', x, { wit: [] });
            say(
              `${nm} looks at you once, on the way down. You will see that look for the rest of your life. It's not long.`,
            );
            go('hub', d);
          },
          'danger',
        ]
      : null,
    ['Fight it', () => fight([gutmawE()], { win: 'gutmaw', args: [d], back: ['hub', d] }), 'danger'],
  ],
});
WIN.gutmaw = d => {
  S.f.gutDead = 1;
  addTitle('Gutmaw Slayer');
  gain(120);
  event('gutmaw', null, { all: true });
  say("It dies the way mountains would, if mountains died. Its gut is full of teeth. Other people's. Yours now.");
  go('hub', d);
};
