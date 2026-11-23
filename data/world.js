'use strict';
// ================= DATA: PLACES & RELATIONSHIPS =================
const LOC = {
  scrapwell: { n: 'Scrapwell', i: '🏚️', lvl: 1, x: 50, y: 92 },
  farm: { n: "Hector's Farm", i: '🌾', lvl: 2, x: 38, y: 74 },
  diner: { n: "Mama Lou's", i: '🍲', lvl: 2, x: 74, y: 90 },
  rustwater: { n: 'Rustwater', i: '🚰', lvl: 2, x: 62, y: 74 },
  chainfield: { n: 'Chainfield', i: '⛓️', lvl: 6, x: 60, y: 32 },
  skybus: { n: 'The Sky-Bus', i: '✈️', lvl: 3, x: 90, y: 70 },
  silo: { n: 'Silo 9', i: '☢️', lvl: 9, x: 88, y: 8, hidden: 1 },
  snakeeyes: { n: 'Snake Eyes', i: '🎲', lvl: 3, x: 50, y: 56 },
  mall: { n: 'The Drowned Mall', i: '🏬', lvl: 4, x: 84, y: 48 },
  // hidden: the flag that puts it on your map (1 means the old knowSilo flag). sub: a place inside another (up).
  green: { n: 'The Green', i: '🌳', lvl: 6, x: 90, y: 26, hidden: 'knowGreen' },
  well: { n: 'The Well', i: '🕳️', lvl: 1, sub: 1, up: 'scrapwell' },
  vats: { n: 'The vat room', i: '🧪', lvl: 2, sub: 1, up: 'green' },
};
// Is this place on your map yet?
const onMap = k => !LOC[k].hidden || !!(S && S.f[LOC[k].hidden === 1 ? 'knowSilo' : LOC[k].hidden]);
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
  ['farm', 'snakeeyes'],
  ['snakeeyes', 'chainfield'],
  ['diner', 'mall'],
  ['mall', 'skybus'],
  ['skybus', 'green'],
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
    ['opal', 'gloria'],
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
const neighbours = loc => {
  const out = ROADS.filter(r => r.includes(loc)).map(r => (r[0] === loc ? r[1] : r[0]));
  for (const k in LOC) if (LOC[k].up === loc) out.push(k);
  if (LOC[loc] && LOC[loc].up) out.push(LOC[loc].up);
  return out;
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
