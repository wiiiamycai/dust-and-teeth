'use strict';
// ================= THE MAYOR'S TOYS: power armour and a plasma rifle =================
// Fenwick keeps two pre-war treasures in his parlour "for show": a Plasma Rifle over the fireplace
// and a suit of Power Armour standing in the corner like a butler.
// The rifle can be lifted (Steal). The suit is dead metal until you bring it a fusion core
// from the Sky-Bus cargo hold, then you climb in and walk out (Sneak). Kill Fenwick and both are just lying there.
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
        chkOpt('mayor.plasma', null, 'Lift the Plasma Rifle off the wall while he pours a drink', () => {
          if (attempt('mayor.plasma')) {
            S.weapons.push('plasma');
            S.weapon = 'plasma';
            f.plasmaStolen = 1;
            say(
              'Into your coat. It hums against your ribs. Not dead after all: it charges itself. Fenwick toasts you and has no idea.',
            );
            go('talk', 'mayor');
          } else caughtByFenwick('rifle');
        }),
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
                  'A socket in the back, empty. It wants a fusion core. Planes used to carry them. There is a dead plane out east.',
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
// The core: in the Sky-Bus cargo hold, once the rad-moles are dead.
const _huboSky = HUBO.skybus;
HUBO.skybus = () => {
  const o = _huboSky();
  if (S.f.molesDead && !S.f.coreGot)
    o.push([
      'Pry open the cargo hold',
      () => {
        S.f.coreGot = 1;
        give('core');
        say(
          'Crates of nothing, and one crate stencilled FUSION CORE: DO NOT LICK. It is warm. It is the warmest thing for a hundred miles.' +
            (S.f.suitSeen || S.f.parlour ? ' The Mayor has a suit with an empty socket.' : ''),
        );
        goHere();
      },
    ]);
  return o;
};
// Fenwick dead: his house is just a house now.
const _huboRust = HUBO.rustwater;
HUBO.rustwater = () => {
  const o = _huboRust();
  if (!alive('mayor') && (!S.weapons.includes('plasma') || (!S.armors.includes('power') && has('core'))))
    o.push([
      "Search Fenwick's empty house",
      () => {
        const got = [];
        if (!S.weapons.includes('plasma')) {
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
