'use strict';
// ================= DATA: CHECKS =================
// Every hidden check in the game. See engine/checks.js for what each field means.
// A function entry takes an argument (an NPC id or a place) and gets its own lock per argument.
const BESS_FLIRT = {
  sk: 'speech',
  who: 'bess',
  lock: 'retry',
  max: 3,
  group: 'bess.flirt',
  ear: { hector: -10 },
  mods: () => (S.stats.charm >= 8 ? 15 : 0),
  near: "Bess laughs, but she's still listening.",
  far: 'Bess goes back to sharpening the hoe. Harder.',
  shut: 'Bess: "Stop. Just stop." She won\'t look at you that way again.',
};
const CK = {
  // ---- places ----
  'kitchen.sneak': { sk: 'sneak', base: -10, who: 'junior', lock: 'week' },
  'pens.open': { sk: 'steal', base: -15, lock: 'week', mods: () => (S.f.slaver ? 15 : 0) },
  'plane.coil': { sk: 'science', base: 0, lock: 'none' },
  'silo.sneak': { sk: 'sneak', base: -25, lock: 'none' },
  'silo.armoury': { sk: 'steal', base: -15, lock: 'none' },
  'silo.pit': { sk: 'steal', base: -10, lock: 'none' },
  'silo.shaft': { sk: 'science', base: -20, lock: 'none' },
  'ambush.sneak': loc => ({ sk: 'sneak', base: -15, lock: 'none' }),

  // ---- the road (strangers: one try per meeting is enough) ----
  'raiders.talk': { sk: 'speech', base: 0, lock: 'none', mods: () => (S.kills >= 10 ? 10 : 0) },
  'taxman.gone': { sk: 'speech', base: 0, lock: 'none' },
  'taxman.fired': { sk: 'speech', base: -10, lock: 'none', mods: () => (S.armor === 'vest' ? 30 : 0) },
  'salesman.sand': { sk: 'speech', base: -10, lock: 'none' },
  'cow.settle': { sk: 'speech', base: 0, lock: 'none' },
  'queen.sorry': { sk: 'speech', base: -20, who: 'bess', lock: 'once', group: 'queen' },
  'queen.out': { sk: 'speech', base: -20, who: 'bess', lock: 'once', group: 'queen', likes: { 'bess.dreams': 20 } },
  'molar.talk': { sk: 'speech', base: 0, lock: 'none' },

  // ---- people ----
  murder: id => ({ sk: 'sneak', base: NPC[id].fighter ? -25 : -10, lock: 'none' }),
  'pen.lock': x => ({ sk: 'steal', base: -10, lock: 'none' }),
  'spouse.back': x => ({ sk: 'speech', base: -25, who: x, lock: 'once' }),
  'kitchen.cage': { sk: 'steal', base: -10, lock: 'none' },
  'wedding.out': { sk: 'speech', base: -20, who: 'hector', lock: 'once' },
  'gus.lie': { sk: 'speech', base: 0, who: 'gus', lock: 'none' },
  'toaster.fix': { sk: 'science', base: 0, lock: 'none' },
  'toaster.steal': { sk: 'steal', base: -10, who: 'crumb', lock: 'change' },
  'pig.steal': { sk: 'steal', base: -15, who: 'pell', lock: 'none' },
  'nigel.move': { sk: 'speech', base: -10, who: 'nigel', lock: 'change', likes: { 'nigel.lore': 10 } },
  'mayor.pump': { sk: 'speech', base: -30, who: 'mayor', lock: 'change' },
  'mayor.ledger': { sk: 'steal', base: -15, who: 'mayor', lock: 'none' },
  'mayor.hat': { sk: 'steal', base: -25, who: 'mayor', lock: 'week' },
  'doc.buzz': { sk: 'steal', base: -10, who: 'doc', lock: 'week' },
  'jeb.haggle': { sk: 'speech', base: -15, who: 'jeb', lock: 'retry', max: 3, group: 'jeb.haggle' },
  'hector.lying': { sk: 'speech', base: -25, who: 'hector', lock: 'once', group: 'hector.lying' },
  // Bess: two ways in, one shared set of three tries. Hector being around makes it harder.
  'bess.leave': { ...BESS_FLIRT, base: -5, likes: { 'bess.dreams': 25 } },
  'bess.pretty': { ...BESS_FLIRT, base: -20 },
  'jeb.found': { sk: 'speech', base: 10, who: 'jeb', lock: 'retry', max: 3, group: 'jeb.haggle' },
  'hector.drunk': {
    sk: 'speech',
    base: -25,
    who: 'hector',
    lock: 'once',
    group: 'hector.lying',
    likes: { 'jeb.drinks': 30 },
  },
  'lou.guards': { sk: 'speech', base: -10, who: 'lou', lock: 'once', group: 'lou.guards' },
  'lou.polish': {
    sk: 'speech',
    base: -10,
    who: 'lou',
    lock: 'once',
    group: 'lou.guards',
    likes: { 'lou.polish': 30 },
    mods: () => (has('badge') ? 10 : 0),
  },
  'king.mother': {
    sk: 'speech',
    base: -35,
    who: 'king',
    lock: 'once',
    group: 'king.talk',
    likes: { 'king.mother': 40 },
  },
  'lou.stop': { sk: 'speech', base: -15, who: 'lou', lock: 'none' },
  'king.talk': { sk: 'speech', base: -35, who: 'king', lock: 'once', group: 'king.talk' },
  'king.zero': { sk: 'speech', base: 10, who: 'king', lock: 'once', group: 'king.talk' },
  'king.key': { sk: 'steal', base: -30, who: 'king', lock: 'none' },
};
