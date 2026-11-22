'use strict';
// ================= DEPTH: things that happened, and now somebody cares =================
// From the depth audit (tools/AUDIT.md): flags the game set and never read again. Each one now changes
// something a day or two later, through a person's behaviour, a line, a door, or an ending slide.
// One-time consequences run from the daily world tick; each fires once (S.f.dx_<name>).
const DX = [
  // You warned Fenwick about the fanatics, so the Coil guard his pump. At night they see the chained shift.
  ['coilGuards', 2, () => {
    S.f.shiftSeen = 1;
    rx('ohm', '"My people guard the Mayor\'s pump. At night they hear chains in it. The Voice says pray. I say look."');
    rx('sheriff', '"The Coil on the pump say they hear chains at night. Fenwick says it\'s the pipes."');
  }],
  // Rustwater hanged Doc for Vane's poison. Doc's father and sister hear it in the Green.
  ['docLynched', 1, () => {
    rx('gardener', '"My son hanged in a town that drank his medicine for twenty years. Keep the gate shut."');
    rx('fern', '"They hanged my brother. I never even met him. I was going to."');
    rx('vane', '"Rustwater needed rope. I sell rope. I sell everything."');
  }],
  // Grey Buzz hit Rustwater. The bar remembers.
  ['greyHit', 1, () => {
    rx('moe', '"Two of my regulars stopped blinking. Then they stopped. No Buzz in my bar now. Ever."');
    rx('gloria', '"Half the girls tried the grey. I didn\'t. Somebody has to count the takings."');
  }],
  // The ledger hanged Fenwick. Krug lost his best customer, and the night shift saw daylight.
  ['ledgerGiven', 1, () => {
    S.f.shiftFreed = 1;
    bump('krug', -20);
    rx('krug', '"Fenwick bought my night stock for six years. Somebody cost me a customer. I know who."');
    rx('opal', '"Crane unchained the men under the pump. I sent them a bottle. Don\'t tell anyone I have a heart."');
  }],
  // Pete died in the Sheriff's door, because you made him a deputy.
  ['peteSaved', 1, () => {
    bump('sheriff', 15);
    rx('sheriff', '"Pete stood in the door. I keep thinking it should have been me in that door."');
    rx('eel', '"Pete died a hero? Pete? Sal would have laughed. Then he would have cried."');
    rx('lou', '"Pete. The one that got away. Well. Nobody gets away for long, honey."');
  }],
  // Somebody stole Bacon Prime.
  ['pigStolen', 1, () => {
    rx('pell', '"Somebody took Bacon Prime. I drew posters. I am very good at drawing him."');
    rx('sheriff', '"Old Pell reported a stolen pig. He brought a portrait. It was better than my wanted posters."');
  }],
  // The Coil held the plane because you warned them.
  ['planeHeld', 1, () => {
    rx('ohm', '"The Crust came with torches and found us singing. The Voice says thank you. So do I."');
    rx('rind', '"Somebody warned the Coil. God sees who. So do I."');
  }],
  // Krug's men hit Jeb's caravan. Gums gets the gin.
  ['routeHit', 1, () => {
    rx('gums', '"Krug\'s boys sold me Jeb\'s gin. I sold it back to Jeb. Everybody wins, except Jeb."');
    rx('krug', '"Jeb\'s lizards fetched a good price. Lizards don\'t complain. I like lizards."');
  }],
  // You came up the Green's outflow pipe. Moss saw. The Warden found out.
  ['sneakedGreen', 2, () => {
    bump('moss', 15);
    rx('moss', '"You came up my pipe. Nobody comes up my pipe. Come again."');
    rx('warden', '"Somebody came up the outflow. I welded the grate. If I find who, they go to the outer beds."');
    // The pipe is shut for good.
    S.tried['green.outflow'] = { n: 1, day: S.day, lock: 'once', who: null, op: null, kf: null };
  }],
  // You sold the Holy Toaster to Doc. Doc takes it apart and sells the pieces. Crumb sees them.
  ['toasterSold', 3, () => {
    bump('crumb', -40);
    rx('crumb', '"I saw my Toaster in Doc\'s window. In pieces. A price on every piece. He says a stranger sold it to him."');
    rx('doc', '"The toaster? Chrome, a spring, and a crumb older than the bombs. The crumb was the best part. Sold it for 40."');
  }],
  // You sold the Coil's road to the Crust. Ohm works out who knew it.
  ['toothSold', 1, () => {
    bump('ohm', -45); // the Coil take you for an enemy: their patrols come for you
    rx('ohm', '"Rind knew our road. One outsider knew our road. The Voice has gone very quiet about you."');
  }],
];
function depthDaily() {
  const f = S.f;
  for (const [k, wait, fn] of DX) {
    if (!f[k] || f['dx_' + k]) continue;
    if (f['dxDay_' + k] == null) f['dxDay_' + k] = S.day;
    if (S.day - f['dxDay_' + k] >= wait - 1) {  // the day it's noticed counts as day one
      f['dx_' + k] = 1;
      fn();
    }
  }
  // Nan's loan: two days before it's due, the valley warns you.
  if (f.debt && f.debtDue && S.day === f.debtDue - 2) {
    rx('nan', '"Two days, dear. I do so hate the part that comes after."');
    rx('moe', '"Nan\'s collectors were in. Asking where you sleep. I said I didn\'t know. For now."');
  }
}
const _worldDepth = world;
world = () => {
  _worldDepth();
  if (S && !S.end) depthDaily();
};

// After the Coil see the chained night shift, Crane can tell you what they saw.
jobs('sheriff', () =>
  S.f.shiftSeen && !knew('mayor.secret') && alive('mayor')
    ? [
        [
          '"Anything strange at the pump?"',
          () => {
            know('mayor.secret');
            says(
              'sheriff',
              '"The Coil swear there are men chained inside it at night. Krug\'s men. Fenwick buys them to pump in the dark." She looks at the pump. "I drink that water."',
            );
            go('talk', 'sheriff');
          },
        ],
      ]
    : [],
);

// Junior took Bacon Prime. Thursday's special is pedigree pork, and you can have some.
const _stewDepth = stew;
stew = () => {
  const f = S.f;
  if (f.porkDone && !f.ateBacon && !f.louReformed && S.here === 'diner') {
    if (!pay(5)) return goHere();
    f.stew = (f.stew || 0) + 1;
    f.ateBacon = 1;
    say(`It's pork. Real pork, for once. Pedigree. It is the best thing you have ever eaten. +${heal(25)} HP.`);
    bump('pell', -30);
    rx('pell', '"They say you ate him. At Lou\'s. With the gravy."');
    return goHere();
  }
  return _stewDepth();
};

// ---- ending slides ----
const _linkLinesDepth = linkLines;
linkLines = () => {
  const L = _linkLinesDepth(),
    f = S.f;
  if (f.docLynched) L.push("Rustwater hanged Doc Ratchet for Vane's poison. Vane sold them the rope.");
  if (f.greyHit && !f.docLynched) L.push('The grey stayed in Rustwater a long time. People stopped blinking. Then they stopped.');
  if (f.shiftFreed) L.push('Crane unchained the night shift under the pump. They pump in daylight now, for pay. Badly.');
  if (f.peteSaved) L.push('Crane buried Pete under the pump, with his whistle. Every morning she blows it once.');
  if (f.pigStolen && alive('pell'))
    L.push("Pell's posters of Bacon Prime stayed up for years. They were better drawn than any wanted poster in Rustwater.");
  if (f.ateBacon) L.push("You ate Bacon Prime at Mama Lou's, with the gravy. Pell never forgave you. It was worth it.");
  if (f.planeHeld) L.push('The Crust came for the plane on the ninth and found the Coil waiting, singing. Nobody burned.');
  if (f.toasterSold) L.push('Doc sold the Holy Toaster one part at a time. Each part came with a blessing, extra.');
  if (f.coilGuards && !f.shiftFreed) L.push("The Coil guarded Fenwick's pump for years. They prayed to it at every change of shift.");
  return L;
};
