'use strict';
// ================= DATA: PLACES & RELATIONSHIPS =================
const LOC = {
  scrapwell: { n: 'Scrapwell', i: '🏚️', lvl: 1, x: 13, y: 72 },
  farm: { n: "Hector's Farm", i: '🌾', lvl: 3, x: 30, y: 36 },
  diner: { n: "Mama Lou's", i: '🍲', lvl: 5, x: 37, y: 86 },
  rustwater: { n: 'Rustwater', i: '🚰', lvl: 2, x: 55, y: 58 },
  chainfield: { n: 'Chainfield', i: '⛓️', lvl: 6, x: 70, y: 24 },
  skybus: { n: 'The Sky-Bus', i: '✈️', lvl: 3, x: 84, y: 76 },
  silo: { n: 'Silo 9', i: '☢️', lvl: 9, x: 91, y: 14, hidden: 1 },
  well: { n: 'The Well', i: '🕳️', lvl: 1, sub: 1 },
};
const ROADS = [
  ['scrapwell', 'farm'],
  ['scrapwell', 'diner'],
  ['farm', 'rustwater'],
  ['diner', 'rustwater'],
  ['rustwater', 'chainfield'],
  ['rustwater', 'skybus'],
  ['skybus', 'silo'],
  ['chainfield', 'silo'],
  ['farm', 'chainfield'],
];
const REL = {
  family: [
    ['hector', 'bess'],
    ['hector', 'bert'],
    ['bess', 'bert'],
    ['lou', 'junior'],
    ['pell', 'pig'],
  ],
  friend: [
    ['elder', 'gus'],
    ['elder', 'crumb'],
    ['elder', 'pell'],
    ['gus', 'crumb'],
    ['gus', 'pell'],
    ['moe', 'sheriff'],
    ['moe', 'opal'],
    ['jeb', 'pete'],
    ['jeb', 'hector'],
    ['jeb', 'moe'],
    ['doc', 'moe'],
  ],
  enemy: [
    ['mayor', 'sheriff'],
    ['krug', 'opal'],
    ['krug', 'sheriff'],
    ['krug', 'teo'],
    ['king', 'sheriff'],
    ['lou', 'pete'],
  ],
};
function relOf(a, b) {
  if (!a || !b) return null;
  if (a === b) return 'self';
  for (const k in REL) for (const [x, y] of REL[k]) if ((x === a && y === b) || (x === b && y === a)) return k;
  return null;
}
const FAMW = {
  hector: { bess: 'daughter', bert: 'son' },
  bess: { hector: 'father', bert: 'brother' },
  bert: { hector: 'father', bess: 'sister' },
  lou: { junior: 'boy' },
  junior: { lou: 'mama' },
  pell: { pig: 'pig' },
};
