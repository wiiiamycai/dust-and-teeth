'use strict';
// ================= THE MAYOR'S TOYS: power armour and a plasma rifle =================
// Fenwick keeps two pre-war treasures in his parlour "for show": a Plasma Rifle over the fireplace
// and a suit of Power Armour standing in the corner like a butler.
// Both are dead metal. The rifle wants a plasma cell and the suit a fusion core, and there is one of each left in
// the valley (Will, v9.14): the cell round Ma Thistle's neck, the core on a chain under Crane's vest. The only way
// to either is to kill the woman wearing it. Then the rifle can be lifted (Steal) and you can walk out in the suit
// (Sneak). Kill Fenwick and both are just lying there, still dead without their hearts.
// Get caught and his guards come for you, and the whole town hears you robbed the Mayor.
const fenwickGuards = () => [spawn('guard'), spawn('guard')];
function caughtByFenwick(what) {
  S.n.mayor.op = -100;
  event('stole', 'mayor');
  bad(`Fenwick: "GUARDS! They're stealing my ${what}!"`);
  fight(fenwickGuards(), { started: true, win: 'back', back: ['map'] });
}
const _mayorHeist = TALK.mayor;
TALK.mayor = () => {
  const r = _mayorHeist(),
    f = S.f;
  if (!f.parlour)
    r.o.push([
      '"Nice house. What\'s in the parlour?"',
      () => {
        f.parlour = 1;
        quote(
          'Fenwick shows you, because he cannot help himself. A Plasma Rifle over the fireplace. A suit of pre-war Power Armour in the corner, like a butler. "Both dead as my first wife. No power. But they make the voters nervous."',
        );
        go('talk', 'mayor');
      },
    ]);
  else {
    if (!S.weapons.includes('plasma'))
      r.o.push(
        has('cell')
          ? chkOpt(
              'mayor.plasma',
              null,
              "Slot Ma's plasma cell into the rifle and lift it off the wall while he pours a drink",
              () => {
                if (attempt('mayor.plasma')) {
                  take('cell');
                  S.weapons.push('plasma');
                  S.weapon = 'plasma';
                  f.plasmaStolen = 1;
                  say(
                    'The cell clicks home. The rifle hums against your ribs, and it charges itself. Fenwick toasts you and has no idea.',
                  );
                  go('talk', 'mayor');
                } else caughtByFenwick('rifle');
              },
            )
          : [
              'Look the Plasma Rifle over',
              () => {
                f.rifleSeen = 1;
                say(
                  "A slot for a plasma cell, empty. You have seen one. Ma Thistle wears it on a string round her neck, her fourth husband's last gift. He glowed too, near the end. She won't take it off while she's breathing.",
                );
                go('talk', 'mayor');
              },
            ],
      );
    if (!S.armors.includes('power'))
      r.o.push(
        has('core')
          ? chkOpt('mayor.suit', null, 'Slot the fusion core into the Power Armour and walk out in it', () => {
              wearSuit();
              if (attempt('mayor.suit')) {
                say(
                  'You clank past Fenwick. He looks up from his drink and decides, wisely, that he saw nothing. Nobody stops a walking tank.',
                );
                go('hub', 'rustwater');
              } else caughtByFenwick('ARMOUR');
            })
          : [
              'Look the Power Armour over',
              () => {
                f.suitSeen = 1;
                say(
                  "A socket in the back, empty. It wants a fusion core. You have seen one. Sheriff Crane wears it on a chain under her vest: Krug's wedding present. She has never taken it off. Not while she's breathing.",
                );
                go('talk', 'mayor');
              },
            ],
      );
  }
  return r;
};
function wearSuit() {
  take('core');
  S.armors.push('power');
  S.armor = 'power';
  addTitle('The Walking Tank');
}
// The Sky-Bus cargo hold: somebody got to the core first, a long time ago.
const _huboSky = HUBO.skybus;
HUBO.skybus = () => {
  const o = _huboSky();
  if (S.f.molesDead && !S.f.holdSeen)
    o.push([
      'Pry open the cargo hold',
      () => {
        S.f.holdSeen = 1;
        say(
          "Crates of nothing, and one crate stencilled FUSION CORE: DO NOT LICK. Empty. Somebody scratched a sheriff's star into the lid, a long time ago.",
        );
        goHere();
      },
    ]);
  return o;
};
// The two hearts: only from the women wearing them, and only by your hand.
const _killHearts = kill;
kill = (id, how, loud) => {
  const was = !S.dead[id];
  _killHearts(id, how, loud);
  if (!was || !S.dead[id]) return;
  if (id === 'sheriff' && !S.f.coreGot) {
    S.f.coreGot = 1;
    give('core');
    say("Under her vest, on a chain, still warm: a fusion core. Krug's wedding present. She never took it off.");
  }
  if (id === 'elder' && !S.f.cellGot) {
    S.f.cellGot = 1;
    give('cell');
    say("Round her neck, on a bit of string: a plasma cell, glowing faintly. Her fourth husband's last gift.");
  }
};
// Fenwick dead: his house is just a house now.
const _huboRust = HUBO.rustwater;
HUBO.rustwater = () => {
  const o = _huboRust();
  if (
    !alive('mayor') &&
    ((!S.weapons.includes('plasma') && has('cell')) || (!S.armors.includes('power') && has('core')))
  )
    o.push([
      "Search Fenwick's empty house",
      () => {
        const got = [];
        if (!S.weapons.includes('plasma') && has('cell')) {
          take('cell');
          S.weapons.push('plasma');
          got.push('a Plasma Rifle that charges itself');
        }
        if (!S.armors.includes('power') && has('core')) {
          wearSuit();
          got.push('a suit of Power Armour, which you are now wearing');
        }
        say(`Nobody guards a dead man's parlour. You take ${got.join(' and ')}.`);
        goHere();
      },
    ]);
  return o;
};
