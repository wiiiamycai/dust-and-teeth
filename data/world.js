'use strict';
// ================= DATA: PLACES & RELATIONSHIPS =================
const LOC = {
  scrapwell: { n: 'Scrapwell', i: '🏚️', lvl: 1, x: 50, y: 92 },
  farm: { n: "Hector's Farm", i: '🌾', lvl: 2, x: 34, y: 74 },
  diner: { n: "Mama Lou's", i: '🍲', lvl: 2, x: 76, y: 88 },
  rustwater: { n: 'Rustwater', i: '🚰', lvl: 2, x: 60, y: 72 },
  chainfield: { n: 'Chainfield', i: '⛓️', lvl: 6, x: 54, y: 30 },
  skybus: { n: 'The Sky-Bus', i: '✈️', lvl: 3, x: 85, y: 64 },
  silo: { n: 'Silo 9', i: '☢️', lvl: 9, x: 70, y: 8, hidden: 1 },
  snakeeyes: { n: 'Snake Eyes', i: '🎲', lvl: 3, x: 46, y: 54 },
  mall: { n: 'The Drowned Mall', i: '🏬', lvl: 4, x: 72, y: 46 },
  // hidden: the flag that puts it on your map (1 means the old knowSilo flag). sub: a place inside another (up).
  green: { n: 'The Green', i: '🌳', lvl: 6, x: 83, y: 26, hidden: 'knowGreen' },
  well: { n: 'The Well', i: '🕳️', lvl: 1, sub: 1, up: 'scrapwell' },
  vats: { n: 'The vat room', i: '🧪', lvl: 2, sub: 1, up: 'green' },
};
// Is this place on your map yet?
const onMap = k => !LOC[k].hidden || !!(S && S.f[LOC[k].hidden === 1 ? 'knowSilo' : LOC[k].hidden]);
// The roads (v9.5, Will: "make the roads meaningful, you have to pass one town to reach the other, a day per
// town"). Short roads between neighbours only. Three roads out of Scrapwell: west by the Farm (to Gristmill,
// Saltpan and Fanghill, added in scenes/beasts.js), north by Rustwater (Snake Eyes, Chainfield, then Kettle or
// the Silo) and east by Mama Lou's (the Sky-Bus, the Mall, the pass to the Green). Gossip and the Gutmaw follow them.
const ROADS = [
  ['scrapwell', 'rustwater'],
  ['farm', 'rustwater'],
  ['diner', 'rustwater'],
  ['rustwater', 'snakeeyes'],
  ['snakeeyes', 'chainfield'],
  ['chainfield', 'silo'],
  ['chainfield', 'mall'],
  ['diner', 'skybus'],
  ['skybus', 'mall'],
  ['skybus', 'green'],
];
// ---- the 10 stops (v9.21, Will: "10 stops look decent") ----
// Small places are districts of a bigger town: a short walk across it, no day, no road. Each keeps its own name,
// people and screen, so the story, the gossip and the checks are unchanged. The stop is named after its first
// place; the North Road and the Old Airport have names of their own on the map.
const TOWN_OF = { gully: 'scrapwell', farm: 'rustwater', diner: 'rustwater', chainfield: 'snakeeyes', skybus: 'mall' };
const STOP_N = { snakeeyes: 'The North Road', mall: 'The Old Airport' };
const townOf = k => (LOC[k] && LOC[k].up ? townOf(LOC[k].up) : TOWN_OF[k] || k);
// a road between two places of the same town is a street: no time, nothing on the way
const street = (a, b) => townOf(a) === townOf(b);
// the other districts of where you are, nearest first
const districts = k => Object.keys(LOC).filter(o => o !== k && !LOC[o].sub && townOf(o) === townOf(k));
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
