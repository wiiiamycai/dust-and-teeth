'use strict';
// ================= DATA =================
// The one and only player: an average man. Everything else is earned.
const PLAYER = {
  name: 'Nobody',
  stats: { brawn: 5, eyes: 5, guts: 5, charm: 5, brains: 5, twitch: 5, luck: 5 },
  skills: { melee: 35, guns: 30, sneak: 30, steal: 30, speech: 35, science: 30 },
  hp: 30, // the same as everyone else; see BODY in engine/combat.js
  teeth: 25,
  weapons: ['fists', 'knife'],
  weapon: 'knife',
  inv: { gutglue: 3 },
};
const W = {
  // melee: no ammo, quiet, +10 to hit up close, can knock down (kd adds to the chance)
  // v = scrap value in teeth. Loot you already own is stripped and sold for half of it.
  fists: { n: 'Fists', t: 'melee', d: [2, 5], a: 0, kd: 0, v: 0 },
  knife: { n: 'Rusty Knife', t: 'melee', d: [4, 9], a: 5, kd: 0, v: 8 },
  pipe: { n: 'Lead Pipe', t: 'melee', d: [6, 11], a: 0, kd: 10, v: 10 },
  sledge: { n: 'Sledgehammer', t: 'melee', d: [9, 18], a: -10, kd: 25, v: 30 },
  cleaver: { n: "Lou's Cleaver", t: 'melee', d: [6, 13], a: 5, kd: 5, v: 25 },
  drill: { n: "King's Drill", t: 'melee', d: [12, 24], a: 5, kd: 15, v: 80 },
  // guns: one bullet a shot, loud, best at range (-10 up close)
  zipgun: { n: 'Zip Gun', t: 'guns', d: [4, 10], a: -5, v: 20 },
  rifle: { n: 'Hunting Rifle', t: 'guns', d: [8, 16], a: 10, v: 50 },
  shotgun: { n: 'Shotgun', t: 'guns', d: [10, 20], a: 0, v: 60 },
  molargun: { n: 'Molar Repeater', t: 'guns', d: [9, 18], a: 5, v: 55 },
  // free: self-charging, never needs bullets
  plasma: { n: 'Plasma Rifle', t: 'guns', d: [24, 38], a: 15, v: 300, free: 1 },
};
const A = {
  rags: { n: 'Rags', dr: 0, v: 0 },
  jacket: { n: 'Leather Jacket', dr: 2, v: 30 },
  spikes: { n: 'Raider Spikes', dr: 3, v: 35 },
  vest: { n: "Sheriff's Vest", dr: 5, v: 60 },
  plate: { n: 'Car-Door Plate', dr: 7, tw: -2, v: 50 },
  riot: { n: 'Pre-War Riot Suit', dr: 10, v: 100 },
  power: { n: 'Power Armour', dr: 16, v: 400 },
};
const ITEMS = {
  gutglue: 'Gut Glue',
  buzz: 'Buzz',
  hat: 'Hat',
  tophat: 'Top hat',
  ledger: "Mayor's ledger",
  coil: 'Heating coil',
  toaster: 'Holy Toaster',
  meat: 'Questionable meat',
  beer: 'Warm beer',
  radbegone: 'Rad-Be-Gone',
  pig: 'Bacon Prime (in a sack)',
  badge: 'Guard badge',
  key: 'Launch key',
  ammo: 'Bullets',
  krugbook: "Krug's notebook",
  core: 'Fusion core',
  // parts for Sprocket's bench at the Drowned Mall
  lens: 'Pre-war lens',
  tube: 'Steel tube',
  file: 'Pre-war file',
  grip: 'Rubber grip',
  sheet: 'Sheet steel',
  // from the Green
  seeds: 'Seed packets from the Green',
  veg: 'A basket of real vegetables',
};
// Mods Sprocket fits at the Drowned Mall: teeth plus one part each. One of each per weapon or armour, kept in S.mods.
//   on: what it fits ('gun', 'melee', 'armour')   hit: to hit   dmg: damage   dr: damage stopped   untw: no twitch penalty
const MODS = {
  scope: { n: 'scope', on: 'gun', part: 'lens', cost: 40, hit: 10, t: 'a scope (easier to hit)' },
  barrel: { n: 'long barrel', on: 'gun', part: 'tube', cost: 50, dmg: 3, t: 'a longer barrel (hits harder)' },
  edge: {
    n: 'honed',
    on: 'melee',
    part: 'file',
    cost: 35,
    dmg: 3,
    t: 'a honed edge, or studs on the blunt ones (hits harder)',
  },
  wrap: { n: 'grip', on: 'melee', part: 'grip', cost: 25, hit: 8, t: 'a proper grip (easier to land)' },
  plates: { n: 'plated', on: 'armour', part: 'sheet', cost: 60, dr: 2, t: 'steel plates sewn in (stops more)' },
  straps: {
    n: 'restrapped',
    on: 'armour',
    part: 'grip',
    cost: 30,
    untw: 1,
    t: 'new straps (it stops slowing you down)',
  },
};
const PARTS = ['lens', 'tube', 'file', 'grip', 'sheet'];
const PERKS = {
  eater: { n: 'Messy Eater', d: 'Corpses heal double, no karma hit.' },
  tongue: { n: 'Silver Tongue', d: '+15 Speech.' },
  hombre: { n: 'Bad Hombre', d: 'Weaker nobodies sometimes flee.' },
  gut: { n: 'Iron Gut', d: 'Immune to addiction and the rash.' },
  eagle: { n: 'Eagle Eye', d: 'Aimed shots lose half the usual penalty.' },
  skin: { n: 'Thick Skin', d: '+3 damage reduction.' },
  fingers: { n: 'Sticky Fingers', d: '+15 Steal and Sneak.' },
  hands: { n: 'Bloody Hands', d: '+30% melee damage.' },
  lucky: { n: 'Lucky Bastard', d: '+10% crit chance.' },
  tax: { n: 'Tax Exempt', d: 'Everything costs 25% less.' },
  wind: { n: 'Second Wind', d: 'Once per fight, survive a killing blow.' },
  butcher: { n: "Butcher's Pal", d: 'Lou and Krug pay double.' },
  reader: { n: 'Read People', d: 'You can tell when someone is close to yes.' },
  keen: { n: 'Keen Eye', d: "You see a fighter's health, strength, armour and gear, and your own skills in numbers." },
};
