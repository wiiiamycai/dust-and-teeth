'use strict';
// ================= LINKS: the new cities, woven into the old valley =================
// Will: "make it all linked together". Everything in this file crosses a town line: the Drowned Mall and
// the Green change what happens in the valley, and the valley changes them back.

// ---- 1. trade: Rustwater eats Hector's corn, Fenwick's carrots cost the earth ----
const _huboRustLink = HUBO.rustwater;
HUBO.rustwater = () => {
  const o = _huboRustLink();
  if (S.f.harvest && alive('hector') && alive('moe') && S.n.moe.loc === 'rustwater')
    o.push([
      `A bowl of Hector's corn at Moe's (${cost(4, 'moe')} teeth, +15 HP)`,
      () => {
        if (pay(cost(4, 'moe'))) say(`+${heal(15)} HP. Moe: "From the farm. Real corn. I hate how good it is."`);
        goHere();
      },
    ]);
  if (S.f.mayorVeg && alive('mayor'))
    o.push([
      `One of Fenwick's carrots (${cost(20, 'mayor')} teeth, +25 HP)`,
      () => {
        if (pay(cost(20, 'mayor'))) say(`+${heal(25)} HP. It is a very good carrot. It is a very bad price.`);
        goHere();
      },
    ]);
  return o;
};

// ---- 2. Doc Ratchet, run out of Rustwater, goes home to his father ----
LATER.docEast = () => {
  if (!alive('doc') || S.n.doc.loc !== 'gone' || !alive('gardener') || S.n.gardener.loc !== 'green') return;
  S.n.doc.loc = 'green';
  S.f.docEast = 1;
  rx('gardener', '"My son came to the gate. I let him in. I didn\'t count him."');
  rx('fern', '"I have a brother! He\'s horrible. I love him."');
};
const _talkDocLink = TALK.doc;
TALK.doc = () => {
  const r = _talkDocLink();
  if (S.n.doc.loc === 'green')
    r.t =
      "Doc Ratchet, in the Green, in a clean coat, pulling weeds very badly. \"Father says I can stay if I don't steal anything. I'm on day three. It's agony.\"";
  return r;
};

// ---- 3. Opal crosses the pass for Marigold ----
const _talkOpalLink = TALK.opal;
TALK.opal = () => {
  const r = _talkOpalLink();
  if (
    knew('dice.secret') &&
    alive('dice') &&
    S.n.dice.loc === 'green' &&
    !S.f.sistersGreen &&
    S.n.opal.loc === 'rustwater'
  )
    r.o.unshift([
      '"Marigold is alive. She\'s in the Green, over the pass."',
      () => {
        S.f.sistersGreen = 1;
        S.n.opal.loc = 'green';
        if (alive('gloria') && S.n.gloria.loc === 'rustwater') S.f.gloriaRad = 1;
        bump('opal', 40);
        quote(
          'Opal empties the safe, puts on her travelling boots, and hands Gloria the keys to the Velvet Rad. "Count it twice, sugar." She walks east without looking back.',
        );
        goHere();
      },
    ]);
  if (S.n.opal.loc === 'green')
    r.t =
      'Madame Opal, in the Green, kneeling in the same bean row as her sister. Neither of them is talking. Both of them are weeding.';
  return r;
};

// ---- 4. news travels: what you do in the new cities is gossip in the old ones ----
// event() spreads it through the bonds, so people in other towns hear and change their minds.
const _plantLink = plantSeeds;
plantSeeds = (who, line) => {
  _plantLink(who, line);
  if (who !== 'mayor') event('helped', who, { wit: [who] });
};

// ---- 5. ending slides: the links ----
function linkLines() {
  const f = S.f,
    L = [];
  if (f.docEast && alive('doc'))
    L.push("Doc Ratchet walked east to his father's gate. The Warden let him in. The Gardener didn't count him.");
  if (f.sistersGreen && alive('opal') && alive('dice'))
    L.push(
      'Opal crossed the pass at sixty to find Marigold in a bean row. They still hardly talk. They weed side by side.',
    );
  if (f.fernWest && alive('fern') && alive('junior'))
    L.push(
      "Junior's cabbages had come from one of Fern's packets. When she came down the pass he cooked for her. Neither of them said much.",
    );
  if (f.harvest && alive('margie'))
    L.push("Margie's food court started buying Hector's corn. Mama Lou lost the Mall's order, and took it personally.");
  if (f.ginTold && f.harvest && alive('bess'))
    L.push(
      "With Gums watched and the farm green, Bess's polite raiders got jobs in Hector's rows. They still say thank you.",
    );
  if (f.harvest && !f.waterUp)
    L.push(
      'With the farm catching its own dew, Fenwick lost his best water customer. Water came down three teeth a cup.',
    );
  return L;
}
