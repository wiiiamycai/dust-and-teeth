'use strict';
// ================= EPITAPHS: an ending slide for everyone you killed (v9.13) =================
// Will: "when i kill someone, the endings should reflect that". kill() (engine/combat.js) notes each killing in
// S.f.byYou[id] as the id of its gossip event. At the end, each person you killed gets a slide: who did it (you,
// or, if no one ever learned it, nobody but you), then what their death changed, two or three steps out. People
// whose deaths already have their own slide elsewhere (Ma Thistle, Crane, Bess, Krug, Margie) are left to it.
const EPI_SKIP = ['elder', 'sheriff', 'bess', 'krug', 'margie'];
// c.al(id): alive at the end. c.f: the story flags. Each returns the slide after its first line.
const EPITAPH = {
  gus: c =>
    (c.al('elder')
      ? 'Ma Thistle dug the next well herself, at ninety-four. It came up dry. '
      : 'Nobody dug in Scrapwell after that. ') +
    (c.al('tam') && !c.f.brothers && !c.f.tamTold
      ? 'In Snake Eyes, Big Tam fights on. He never knew his little brother was one road away.'
      : "The tin of his brother's teeth went to Moe, to settle the slate."),
  crumb: c =>
    'The Holy Toaster sat on a cold altar. ' +
    (c.al('junior')
      ? 'Junior still came every Sunday, sat at the back, and wept at no toast at all.'
      : 'Nobody prayed to it. Nobody had, really, but him.') +
    (c.al('king') ? ' The Dentist King sent flowers. Nobody knows how he heard.' : ''),
  pell: c =>
    c.al('pig')
      ? 'Bacon Prime the Fifth was never eaten. He outlived everyone who would have wept for him.'
      : 'Nobody wept for Pell the way Pell wept for his pigs.',
  pig: c =>
    c.al('pell')
      ? 'Old Pell wept, the way he always did. Then he got another one. Bacon Prime the Sixth has never forgiven you.'
      : 'The last purebred pig in the wastes. Nobody even checked his papers.',
  nigel: c =>
    'The well went dark. The chickens came back up whole, and somehow that was worse.' +
    (c.al('elder') ? ' Ma Thistle kept lowering soup for a month. Then she stopped.' : ''),
  moe: c =>
    'Nobody ever wiped that glass again. It is still on the bar.' +
    (c.al('gus') ? " Gus's tab died with Moe. He drank to it, somewhere worse." : '') +
    " Rustwater got its rumours from Krug's men after that, and believed them.",
  mayor: c =>
    c.f.docPump
      ? 'Doc Ratchet took the pump and the fridge desk. Water got dearer. Nobody missed Fenwick, but everyone noticed.'
      : c.al('sheriff')
        ? 'Crane broke the lock on his pump the same day. Water has been free ever since. Nobody says your name, but they pour you one.'
        : 'His top hat went to the man who found the body. The pump went to whoever had the most guns.',
  doc: c =>
    (c.al('gardener')
      ? 'Over the pass, the Gardener put his son in the outer beds. Doc would have hated that. He would also have insisted. '
      : '') +
    (c.al('vane') && S.n.vane.loc === 'rustwater'
      ? 'Dr. Vane took over his clinic. Half the prices. Double the results. Ask anyone who can still talk.'
      : "Rustwater's broken bones set crooked for a generation."),
  opal: c =>
    (c.f.gloriaRad && c.al('gloria')
      ? 'Gloria ran the Velvet Rad. Better than Opal did, and a lot louder.'
      : 'The Velvet Rad shut. The shotgun under the counter went to whoever got there first.') +
    (c.al('teo') ? ' Nobody brought food to the pens at Chainfield after that.' : ''),
  gloria: c =>
    (c.al('opal') ? 'Opal hired a girl who laughs like a person. Business fell off. ' : '') +
    'Gloria never saw the green. She would have hated it, loudly, for years.',
  jeb: c =>
    (c.f.peteLeft ? 'Pete left the valley the week after, on foot. ' : '') +
    'Nobody went east again. His pack-lizards went feral and are doing very well.' +
    (c.al('gloria') ? ' Gloria is still waiting for her ride out.' : ''),
  hector: c =>
    (c.al('bess') ? 'Bess got the farm, and everything on the farm road, and she has not been gentle with it. ' : '') +
    (c.al('bert')
      ? 'Bert keeps the tractor running. He talks to it like it is his pa.'
      : 'The corn grew wild. Nobody shot at anyone over it.'),
  bert: c =>
    (c.al('bess') ? 'Bess kept his tractor magazine. She can recite it now. She hates that. ' : '') +
    (c.al('nigel')
      ? 'Every Sunday, Nigel waits at the bottom of the well for tractor facts.'
      : 'A tractor can pull eight times its own weight. Bert never pulled anything.'),
  lou: c =>
    c.al('junior')
      ? "Junior buried her under the cabbages and opened Junior's Greens in Rustwater. Nobody vanishes on Tuesdays now."
      : 'The diner shut. Travellers stopped vanishing on that road. They vanished on other roads.',
  junior: c =>
    c.al('lou')
      ? 'Mama Lou smiled, said nothing, and set an extra place at the table every night. She cooks looking at the door now.'
      : 'The cabbages behind the diner went to seed. Nobody loved them after that.',
  pete: c =>
    (c.al('lou') ? 'Lou never forgave you for wasting him. ' : '') +
    (c.al('jeb')
      ? 'Jeb drank to the best guard he ever had. Not the best guard. The best he had.'
      : 'Nobody lit a candle for Sal after that.'),
  teo: c =>
    'Nobody named the trolleys any more.' +
    (c.al('krug') ? ' Krug counted them himself, and got it wrong.' : '') +
    (c.al('sheriff') && c.al('krug') ? ' Crane lost the one witness who could have hanged Krug.' : ''),
  pips: c =>
    (c.al('rook')
      ? 'Rook took the house. The dice have been honest ever since. Mostly.'
      : 'Snake Eyes went dark. Some nights the neon still flickers on, for nobody.') +
    (c.al('dice') ? " Dice's debt died with him. She walked out the front door and kept walking." : ''),
  dice: c =>
    'The vault door stayed shut. Her napkin plans went into the fire with her.' +
    (c.al('opal') ? ' In Rustwater, Opal set out two glasses that night, and drank both.' : ''),
  tam: c =>
    (c.al('gus')
      ? c.f.brothers || c.f.tamTold
        ? 'Gus had his brother back, for a little while. Then he had a second tin of teeth. '
        : 'Gus never knew the champion of Snake Eyes was his brother. He dreamt about him that night, for no reason. '
      : '') +
    (c.al('pips') ? 'Pips called it a tremendous loss, on a tremendous investment.' : 'The pit stayed empty.'),
  nan: c =>
    (c.al('elder')
      ? 'The envelopes stopped coming to Ma Thistle. Forty years of them, and she never knew her sister sent them. '
      : '') + 'Her knitting was finished. It was a noose. Nobody would wear it.',
  rook: c =>
    'The casino door stood open for the first time in its life. Everyone was too scared to walk through it.' +
    (c.al('crumb') ? ' Brother Crumb prays for both of them now. Rook would have hated it.' : ''),
  sprocket: () =>
    "Every gun in the valley jammed a little more each year. Jeb's prices went up. Nobody fixed anything properly again.",
  eel: c =>
    "Sal's drawing came down off the pillar at last. Nobody went looking for him again." +
    (c.al('pete') ? ' Pete never told her what happened to Sal. Now he never can.' : ' The water kept everything.'),
  vane: c =>
    'The little grey bags stopped coming.' +
    (c.al('doc')
      ? ' Doc Ratchet called him his best mistake, and raised his prices.'
      : ' Somebody else started printing RATCHET on theirs.'),
  gums: c =>
    (c.al('bess') && S.n.bess.loc === 'wastes'
      ? "Bess's raiders had nobody left to sell to. Some of them got honest. Not many. "
      : '') + "His stall stayed under its tarp. Nobody wanted the King's spares. Everything was for shale.",
  gardener: c =>
    c.f.fernRules && c.al('fern')
      ? 'Fern counts now. She counts badly, on purpose. Everyone in the Green eats more.'
      : 'Nobody talked to the tomatoes. They grew anyway, out of spite.',
  warden: () =>
    'The great gate became just a gate. Anyone could walk into the Green now, and in the end, everyone did.',
  moss: c =>
    c.f.greenDark
      ? 'The lights in the Green went out a week later. Forty people learned what dark is.'
      : 'The vat he stirred went still and grey.' +
        (c.al('nigel') ? ' Down the well, Nigel is the only light now.' : ''),
  fern: c =>
    (c.al('gardener') ? 'The Gardener did the sum, and she was in it. Then he stopped counting. ' : '') +
    'Nobody in the Green looked at the gate like it was a door again.',
  rind: c =>
    'The Crust burned one more clock in his honour, then lost interest.' +
    (c.al('crumb') ? ' Crumb prayed for him. Rind would have hated that.' : ''),
  ohm: c =>
    'On the Sky-Bus the radio still says please remain seated. Nobody is.' +
    (c.al('sprocket') ? ' Sprocket lost the only person who ever thanked her properly.' : ''),
  king: () =>
    'The Molars nailed his crown over the silo door and went home. They still pull teeth, out of habit, but nobody is collecting.',
};
// the slides: one for each person you killed, in the order you killed them
function epitaphLines() {
  const by = S.f.byYou || {},
    c = { al: alive, f: S.f };
  return Object.keys(by)
    .sort((a, b) => by[a] - by[b])
    .filter(id => NPC[id] && !EPI_SKIP.includes(id) && !alive(id))
    .map(id => {
      const n = NPC[id].n.replace(/^The /, 'the '),
        evId = by[id],
        // nobody knows if the killing was secret, nobody saw it, and no gossip ever carried it to anyone
        known =
          !(S.ev || []).some(e => e.id === evId && e.secret && !e.wit.length) || IDS.some(x => S.n[x].k.includes(evId)),
        first = known ? `You killed ${n}.` : `Nobody ever found out who killed ${n}. You did.`,
        body = EPITAPH[id] ? EPITAPH[id](c) : 'The people who loved them still say your name, and not kindly.';
      return `${first} ${body}`;
    });
}
const _loveLinesEpi = loveLines;
loveLines = () => [..._loveLinesEpi(), ...epitaphLines()];
