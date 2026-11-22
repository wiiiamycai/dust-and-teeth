'use strict';
// ================= LOGICAL CHECKS: know the thing, pass the check =================
// Will: "a lot of the checks are impossible to pass. Remove all % checks and make them logical: if you have info on
// X, then you can pass Y. Keep the random checks to meaningless, trivial parts, like random encounters or discount
// pricing. They shouldn't influence the main storyline."
// So: every check on the story passes if, and only if, you hold the right key: something you learned, something
// you carry, something you did, or someone who trusts you. No dice. A failure says, softly, what's missing.
// Dice stay for the trivial: the road, the tables, haggling, diving for loot, pocketing small things, a fling.
// Locks still work as before: a failed story check reopens when you learn something new about the person.
const DICE = new Set([
  // the road
  'ambush.sneak',
  'gutmaw.hide',
  'raiders.talk',
  'taxman.gone',
  'taxman.fired',
  'salesman.sand',
  'cow.settle',
  'molar.talk',
  // gambling, prices, loot, petty theft, flings, tips
  'bones.swap',
  'cards.cheat',
  'jeb.haggle',
  'jeb.found',
  'plane.coil',
  'dive.shallow',
  'dive.deep',
  'dive.vault',
  'dive.gunshop',
  'mayor.hat',
  'doc.buzz',
  'pig.steal',
  'gloria.bed',
  'shift.riot',
  'green.outflow',
  // a knife in the dark is a fight by other means
  'murder',
]);
const op = id => (S.n[id] ? S.n[id].op : 0);
const trusted = (id, n) => op(id) >= (n || 30);
// key: [what lets you pass, what you're told when you don't have it]
const LOGIC = {
  // ---- Mama Lou's ----
  'kitchen.sneak': [
    () => S.f.jebQ || knew('lou.polish') || knew('sal.lou') || knew('pete.secret'),
    'Junior never takes his eyes off that door. You need a reason to know what is behind it.',
  ],
  'kitchen.cage': [() => true, ''],
  'junior.leave': [
    () => !S.f.louReformed && (S.f.juniorBowl === 'ate' || trusted('junior', 20)),
    'Junior looks at the kitchen door. He needs to trust you first.',
  ],
  'diner.hide': [
    () => S.f.juniorBowl === 'ate' || trusted('junior', 20),
    "You don't know the ground behind the diner well enough. Junior does.",
  ],
  'lou.cabbage': [
    () => S.f.louReformed || S.f.louFriend || lover('lou'),
    "Lou won't hear it from a customer. From family, maybe. Or a friend.",
  ],
  'sty.scare': [() => trusted('junior', 20) || knew('junior.secret'), "Junior doesn't know you. Why would he listen?"],
  'lou.guards': [() => has('badge'), "Lou smiles. Without proof, it's just a question."],
  'lou.polish': [() => knew('lou.polish'), 'Lou smiles. You need proof of what goes in that stew.'],
  'lou.stop': [
    () => knew('lou.secret') || knew('lou.polish') || S.f.louFriend,
    "Lou isn't listening. She might, to someone who knew who she used to be.",
  ],
  'lou.cook': [
    () => S.f.cannibal || S.f.louFriend || (S.f.stew || 0) >= 3,
    'Lou: "Everybody says that." Come back when you\'ve really eaten here.',
  ],
  // ---- Chainfield and Krug ----
  'pens.open': [
    () => (knew('krug.rota') || S.f.slaver) && !(knew('moe.lie') && !S.f.moeLieSprung),
    "You don't know when the guards change. Somebody in the pens does.",
  ],
  'pen.lock': [
    () => knew('krug.rota') || S.f.slaver || !alive('krug'),
    'The guards never look away. Not unless you know when they change.',
  ],
  'krug.book': [() => knew('krug.rota'), "Krug never takes the coat off. You'd need to know when he sleeps."],
  'crane.krug': [
    () => has('krugbook') || knew('krug.witness'),
    'Crane: "Prove it." You need his notebook, or a witness.',
  ],
  'king.krug': [
    () => knew('krug.secret') || has('krugbook'),
    "The King doesn't care what you think of Krug. He might care what you know.",
  ],
  'molars.krug': [() => S.f.slaver || knew('krug.secret'), "The Molars don't take orders from a stranger."],
  'hector.go': [() => knew('krug.rota'), 'Hector: "And walk into his guns?" He needs a plan, not a speech.'],
  'krug.reform': [() => knew('krug.secret'), ''],
  // ---- the farm and family ----
  'spouse.back': [x => trusted(x, 10), 'They need a reason to trust you again.'],
  'wedding.out': [
    () => knew('hector.secret') || knew('hector.dying'),
    "Hector's shotgun has heard every excuse. Find something he cares about more.",
  ],
  // Knowing Jeb drinks only helps if you say so: the bare "Jeb's lying" still has nothing behind it.
  'hector.lying': [() => knew('hector.secret'), 'Hector: "Liar." You had nothing to back it up.'],
  'hector.drunk': [() => knew('jeb.drinks'), ''],
  // Her dream works anywhere. Away from her father, a friend (her trust) is enough.
  'bess.leave': [
    () => knew('bess.dreams') || (!(alive('hector') && S.n.hector.loc === S.here) && trusted('bess', 20)),
    "Bess goes back to the hoe. You don't know what she wants yet.",
  ],
  'bess.pretty': [() => S.stats.charm >= 8, 'Bess has heard that line from every raider on the farm road.'],
  'queen.sorry': [() => op('bess') >= -20 || S.f.bessHome, "The Raider Queen isn't ready to hear sorry from you."],
  'queen.out': [() => knew('bess.dreams'), "You don't know what she wanted from life. She does."],
  // ---- Scrapwell ----
  'gus.lie': [() => S.f.nigel === 'moved', 'Gus can still hear it humming down the well.'],
  'toaster.fix': [
    () => knew('crumb.coil') || knew('ohm.creed'),
    "You don't know how a holy toaster is wired. Ask someone who prays to it.",
  ],
  'toaster.steal': [() => trusted('crumb', 20), 'Crumb never leaves you alone with it.'],
  'nigel.move': [() => knew('nigel.lore'), "Nigel looks at you like you're the weather. Learn what he is first."],
  // ---- Rustwater: the pump, the Mayor ----
  'mayor.pump': [
    () => has('ledger') || knew('mayor.secret') || S.f.craneRedeemed,
    'Fenwick laughs. You need something on him: his books, or who works the pump at night.',
  ],
  'mayor.ledger': [
    () => S.f.mWell || knew('mayor.secret'),
    "You don't know what you're looking for in there. Ask him about the water first.",
  ],
  'mayor.plasma': [
    () => trusted('mayor', 30) || S.f.mayorPaid,
    'Fenwick never turns his back on you. He needs to like you more.',
  ],
  'mayor.suit': [() => !S.f.plasmaStolen, 'Fenwick has locks on everything now.'],
  'mayor.debt': [() => knew('mayor.secret') || has('ledger'), 'Fenwick: "I owe nobody." You need something on him.'],
  'doc.vial': [() => knew('doc.secret'), "You don't know which of Doc's bottles matters."],
  'opal.honest': [
    // Money alone never wins her: it buys the evening, not her belief.
    () => !liarTo('opal') && (heard('opal', 'freed') || knew('opal.secret')),
    'Opal: "Everyone says that." Show her you mean it.',
  ],
  'crane.respect': [() => goodHeard('sheriff') >= 2, "Crane is working. She's always working. Do good in her town."],
  'gloria.win': [
    () => S.f.freed || S.f.gloriaJob === 'done',
    'Gloria laughs. Words are cheap. Get her a way out first.',
  ],
  'sheriff.pete': [
    () => goodHeard('sheriff') >= 2 || S.f.craneRedeemed || lover('sheriff'),
    "Crane doesn't trust your judgement yet.",
  ],
  'crane.marry': [
    () => knew('sheriff.secret') && (S.f.craneRedeemed || !alive('krug')),
    'Crane: "Not while Krug is still out there."',
  ],
  'jeb.gloria': [
    () => knew('jeb.secret') || trusted('jeb', 20) || S.f.jebPaid,
    "Jeb won't take a passenger on a stranger's word.",
  ],
  'jeb.east': [() => knew('jeb.secret'), "Jeb changes the subject. There's something about the east he isn't saying."],
  // ---- Snake Eyes ----
  'rook.code': [
    () => S.f.rookJob === 'told' || trusted('rook', 20),
    'Rook: "I don\'t know what you mean." He needs to trust you.',
  ],
  'incisor.drug': [() => has('meat'), 'You need something rotten for his bucket.'],
  'vault.rob': [() => S.f.rookLooks || knew('pips.secret'), 'Rook watches the vault door. Someone has to look away.'],
  'pips.cover': [
    () => knew('pips.secret') || trusted('pips', 20),
    'Pips: "Luck? I own luck." You had nothing to back it up.',
  ],
  'tam.win': [
    () => knew('tam.secret') || (S.f.pitRung || 0) >= 2,
    "Tam doesn't know you. Fight in the pit, or find out who he really is.",
  ],
  'rook.lie': [() => trusted('rook', 30), 'Rook: "Nobody forgets a door."'],
  // ---- the Drowned Mall ----
  'margie.apply': [
    () => knew('margie.faith') || knew('margie.line'),
    'Margie: "That is not the Customer Service voice." Learn the faith first.',
  ],
  'vane.flour': [() => knew('vane.grey'), "You don't know what the grey is cut with, so you don't know what to swap."],
  'eel.lie': [() => trusted('eel', 20), 'Eel: "Get away from me." She doesn\'t trust you enough to believe you.'],
  'silo.jar': [() => true, ''],
  // ---- the Silo ----
  'silo.sneak': [
    () => knew('silo.back') || S.f.backDoor,
    'The gate guards never blink. You need to know another way in.',
  ],
  'silo.armoury': [
    () => knew('rook.secret') || knew('sprocket.secret') || knew('crumb.secret'),
    "You don't know the Silo's halls. A Molar who left would.",
  ],
  'silo.pit': [
    () => knew('crumb.secret') || S.f.backDoor || S.f.freed,
    "The diggers don't know you. Why would they riot for you?",
  ],
  'silo.shaft': [
    () => knew('rook.secret') || knew('crumb.secret') || knew('warden.secret') || knew('sprocket.secret'),
    "You don't know which wire is which. Somebody who served the King would.",
  ],
  'king.talk': [
    () => knew('king.secret') || knew('nigel.secret'),
    "The King isn't listening. You need to know what he's afraid of.",
  ],
  'king.mother': [() => knew('king.mother'), ''],
  'king.zero': [() => S.stats.brains >= 8, ''],
  'king.key': [
    () => knew('king.drill') || S.f.pitFreed,
    "The King's hand never leaves the key. You need a distraction.",
  ],
  // ---- the Green ----
  'plane.chart': [() => S.f.cockpit, "The charts make no sense without the cockpit's instruments."],
  'warden.fix': [
    () => S.f.tfixed || S.f.tractorRuns || S.f.ohmCoil || S.f.cockpit,
    'The Warden: "Everybody can fix things." Show her you\'ve fixed something.',
  ],
  'green.vault': [
    () => !(alive('warden') && S.n.warden.loc === 'green') || S.f.wardenJob === 'done',
    'The Warden counts the seed house twice a day.',
  ],
  'gardener.seeds': [
    () => knew('gardener.secret') || (knew('hector.dying') && knew('gardener.why')),
    'The Gardener: "Seeds are the wall." You need a better reason, or something on him.',
  ],
  'fern.seeds': [
    () => knew('hector.dying') || knew('fern.sea'),
    "Fern wants to know who they're for. Tell her about somebody who needs them.",
  ],
  'moss.free': [() => knew('moss.secret'), "You don't know where the key is kept."],
  'green.expose': [
    () => knew('gardener.secret') && !S.f.mossFree,
    'Nobody on the long table believes you. You need the truth about the outer beds.',
  ],
  'warden.gate': [
    () => knew('warden.secret') || knew('warden.rule') || S.f.wardenJob === 'done',
    '"Wrong answer." You need to know what she cares about.',
  ],
  // ---- the Toaster Schism ----
  'rind.break': [() => knew('rind.secret'), ''],
  'ohm.stay': [
    () => knew('ohm.secret') || S.f.faith === 'coil',
    'Mother Ohm: "The Big Tooth calls." You\'d need to know what her Voice really is.',
  ],
  'crumb.peace': [
    () => (knew('rind.secret') && knew('ohm.secret')) || S.f.tfixed,
    "They won't sit together. Not unless you know what each of them is hiding, or the Toaster speaks.",
  ],
};
// Each check now knows its own key, so the engine can tell a story check from a trivial one.
const _specLogic = spec;
spec = (key, arg) => {
  const s = _specLogic(key, arg),
    L = !DICE.has(key) && LOGIC[key];
  if (!L) return s;
  // Someone who has heard you lie won't take your word on anything, unless they trust you anyway.
  const lied = s.sk === 'speech' && s.who && S.n[s.who] && liarTo(s.who) && !trusted(s.who, 30);
  const cue = lied ? `${NPC[s.who].n} has heard about your lies.` : L[1];
  return { ...s, _logic: L, _arg: arg, _lied: lied, ...(cue ? { near: cue, far: cue } : {}) };
};
// A story check: it passes if you hold the key, and fails if you don't. 100 or 0, never a roll.
const _chanceLogic = chance;
chance = (s, rec) => {
  if (s && s._logic) return !s._lied && s._logic[0](s._arg) ? 100 : 0;
  return _chanceLogic(s, rec);
};
// Will: hide a story line until you hold what it needs. So a story check is offered only when it will work,
// and a line you can see is never a gamble. Old failure locks don't hide it: holding the key is enough.
const _canTryLogic = canTry;
canTry = (key, arg) => {
  const s = spec(key, arg);
  if (s._logic) return !s._lied && !!s._logic[0](s._arg);
  return _canTryLogic(key, arg);
};
// Read People has nothing to read on a line that always works.
const _hintLogic = hint;
hint = (key, arg) => (spec(key, arg)._logic ? '' : _hintLogic(key, arg));
