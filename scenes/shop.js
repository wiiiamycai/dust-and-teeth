'use strict';
// ================= JEB'S CARAVAN: somewhere to buy better gear =================
// Gear is strength now, so you need a place to buy it. Jeb's wagons carry guns and armour
// for teeth. Prices follow what he thinks of you (cost()). The godlike stuff is not for sale:
// the Plasma Rifle and Power Armour are the Mayor's, and you have to take them.
// Four tiers (v6.5): starter (pipe, jacket), working (sledge, rifle, spikes), serious (shotgun, repeater, plate,
// riot suit) and pre-war (ripper, battle rifle, combat armour). Each tier is a clear step, at a clear price.
// Each lost town (scenes/beasts.js) is built for one tier.
const STOCK = {
  wep: { pipe: 25, sledge: 90, machete: 120, rifle: 110, shotgun: 190, molargun: 220, ripper: 420, autorifle: 460 },
  arm: { jacket: 45, spikes: 90, plate: 180, riot: 320, combat: 550 },
};
const _jebShop = TALK.jeb;
TALK.jeb = () => {
  const r = _jebShop();
  r.o.unshift(['"What\'s on the wagons?" (buy guns and armour)', () => go('shop')]);
  return r;
};
SC.shop = () => {
  const o = [];
  // While Sprocket lives, her work rides on Jeb's wagons: his rifles come scoped, and he carries her spares.
  const sprocket = alive('sprocket') && S.n.sprocket.loc === 'mall';
  for (const k in STOCK.wep)
    if (!S.weapons.includes(k)) {
      const scoped = k === 'rifle' && sprocket,
        c = cost(STOCK.wep[k] + (scoped ? 40 : 0), 'jeb'),
        w = W[k];
      o.push([
        `${w.n}${scoped ? ', scoped by Sprocket' : ''}: ${w.t}, ${w.d[0]}-${w.d[1]} damage. ${c} teeth`,
        () => {
          if (pay(c)) {
            S.weapons.push(k);
            S.weapon = k;
            if (scoped) S.mods[k] = ['scope'];
            say(`Jeb: "${w.n}. Point the loud end away from me." You're holding it.`);
          }
          go('shop');
        },
      ]);
    }
  if (sprocket)
    for (const k of ['lens', 'tube'])
      o.push([
        `${ITEMS[k]}, a spare from Sprocket's bench. ${cost(55, 'jeb')} teeth`,
        () => {
          if (pay(cost(55, 'jeb'))) give(k);
          go('shop');
        },
      ]);
  for (const k in STOCK.arm)
    if (!S.armors.includes(k)) {
      const c = cost(STOCK.arm[k], 'jeb'),
        a = A[k];
      o.push([
        `${a.n}: stops ${a.dr} damage a hit${a.tw ? ', slows you down' : ''}. ${c} teeth`,
        () => {
          if (pay(c)) {
            S.armors.push(k);
            if (a.dr > A[S.armor].dr) S.armor = k;
            say(`Jeb: "${a.n}. Previous owner didn't need it. Previous owner didn't need anything."`);
          }
          go('shop');
        },
      ]);
    }
  const b = cost(25, 'jeb');
  o.push([
    `10 bullets. ${b} teeth`,
    () => {
      if (pay(b)) give('ammo', 10);
      go('shop');
    },
  ]);
  o.push(['Back', () => go('talk', 'jeb')]);
  show({
    title: "Jeb's wagons",
    icon: '🦎',
    sub: `You have ${S.teeth} teeth`,
    text:
      o.length > 2
        ? 'Crates under tarps. Jeb pulls one back. "Everything works. Mostly. Teeth up front."'
        : 'Jeb: "You bought the lot. I\'m going to need a bigger caravan."',
    opts: o,
  });
};
