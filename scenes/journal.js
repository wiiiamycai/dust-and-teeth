'use strict';
// ================= THE JOURNAL: a quest list on the side =================
// Will: "a quest checklist on the side, when you accept a quest or unlock one."
// Nothing new is tracked: every entry reads the flags the quest already sets. A quest is on the list once you've
// taken it or learned of it, with the next step written plainly. Done quests stay, with how they ended.
// When a quest first appears you get a line in the log: "New in your journal: ...".
// No checks or numbers are shown (pillar 4). Plots appear only once you know about them.
const Q = (t, who, on, done, hint) => ({ t, who, on, done, hint });
const QUESTS = {
  // ---- the old valley ----
  well: Q(
    "Something's eating the chickens",
    'Gus, Scrapwell',
    () => S.f.wellQ,
    () => S.f.gusPaid && 'Gus paid you.',
    () => 'Climb down the well and see what lives there.',
  ),
  mayorhit: Q(
    "The Mayor's gardening accident",
    'Mayor Fenwick, Rustwater',
    () => S.f.mayorJob,
    () =>
      S.f.mayorPaid
        ? 'You killed Crane for him.'
        : S.f.hitDone
          ? 'He found someone cheaper.'
          : !alive('mayor')
            ? 'Fenwick is dead.'
            : null,
    () => '150 teeth if Sheriff Crane dies. Or warn her. He will not wait long.',
  ),
  opal: Q(
    "Opal's sister",
    'Madame Opal, Rustwater',
    () => S.f.opalJob,
    () => S.f.opalPaid && 'Krug is dead. Opal paid.',
    () => 'Bring Opal word that Krug is dead.',
  ),
  krugbounty: Q(
    'A bounty on Krug',
    'Sheriff Crane, Rustwater',
    () => S.f.krugBounty,
    () => S.f.krugPaid1 && 'Crane paid the bounty.',
    () => 'Krug, the slaver at Chainfield. 100 teeth, dead.',
  ),
  jeb: Q(
    'Two guards who went to lunch',
    'Caravan Jeb, Rustwater',
    () => S.f.jebQ,
    () => S.f.jebPaid && 'Jeb paid you.',
    () => "Pete and Sal never came back from Mama Lou's. Find out why.",
  ),
  // ---- Snake Eyes ----
  pips: Q(
    "Who's beating the tables?",
    'Mister Pips, Snake Eyes',
    () => S.f.pipsJob,
    () =>
      ({
        told: 'You turned Dice in.',
        covered: 'You covered for Dice.',
        cut: 'Dice paid you to keep quiet.',
        doubt: 'Pips is watching the tables himself.',
      })[S.f.pipsJob] || null,
    () =>
      S.f.diceSkim
        ? 'It is Dice. Turn her in, cover for her, or take a cut.'
        : 'Ask around the tables. Dice deals cards.',
  ),
  letter: Q(
    "Dice's letter",
    'Dice, Snake Eyes',
    () => S.f.diceLetter,
    () =>
      !has('letter')
        ? S.f.sisters
          ? 'Opal came for her sister.'
          : S.f.diceSold
            ? 'You sold it to Pips.'
            : 'Delivered.'
        : null,
    () => 'Carry it to Madame Opal at the Velvet Rad, in Rustwater.',
  ),
  nan: Q(
    "Fenwick's debt",
    'Sweet Nan, Snake Eyes',
    () => S.f.nanJob,
    () =>
      ({
        done: 'Nan was paid.',
        tipped: 'You tipped Fenwick off.',
        kept: 'You kept the money. Nan noticed.',
        lapsed: 'Nan gave up on you.',
      })[S.f.nanJob] || null,
    () =>
      S.f.nanColl
        ? 'Take Nan her 80 teeth before the week is out.'
        : 'Collect 100 teeth from Mayor Fenwick, cover it yourself, or warn him.',
  ),
  rook: Q(
    'A price on Rook',
    'Rook, Snake Eyes',
    () => S.f.rookJob,
    () =>
      ({ told: 'You told Rook the truth.', freed: 'You told Rook he was free.' })[S.f.rookJob] ||
      (!alive('rook') ? 'Rook is dead.' : null),
    () =>
      knew('rook.price')
        ? 'Tell Rook what Gums said. Or tell him something kinder.'
        : 'Ask Gums at the Drowned Mall. He used to be a Molar.',
  ),
  // ---- the Drowned Mall ----
  shifts: Q(
    'Three shifts at the food court',
    'Queen Margie, the Drowned Mall',
    () => S.f.associate,
    () => (S.f.shifts || 0) >= 3 && 'Shift Manager.',
    () => `Shift ${(S.f.shifts || 0) + 1} of 3. Ask Margie, one shift a day.`,
  ),
  barrel: Q(
    'The gun shop at the bottom',
    'Sprocket, the Drowned Mall',
    () => S.f.sprJob,
    () =>
      ({
        done: S.f.matchReady ? 'Sprocket owes you a free match barrel.' : 'Sprocket fitted your match barrel.',
        sold: 'You sold it to Gums.',
      })[S.f.sprJob] || null,
    () =>
      has('matchbarrel')
        ? 'Bring the barrel to Sprocket.'
        : 'Dive the flooded floor, to the gun shop at the very bottom.',
  ),
  sal: Q(
    'What happened to Sal?',
    'Eel, the Drowned Mall',
    () => S.f.eelJob,
    () => (S.f.eelJob === 'paid' ? 'Eel knows. She paid you.' : !alive('eel') ? 'Eel is dead.' : null),
    () => 'Ask Jeb in Rustwater, Mama Lou, or Pete. Then tell Eel what you found.',
  ),
  grey: Q(
    "Vane's grey",
    'Dr. Vane, the Drowned Mall',
    () => S.f.greyRun,
    () =>
      ({ done: "You left it on Moe's bar.", swapped: 'You swapped it for flour.', doc: 'You showed it to Doc.' })[
        S.f.greyRun
      ] || null,
    () =>
      has('grey')
        ? "Leave it on Moe's bar in Rustwater, swap it for flour, or show Doc."
        : 'Vane wants it on sale in Rustwater.',
  ),
  gumsteeth: Q(
    "Gums's teeth",
    'Gums, the Drowned Mall',
    () => S.f.gumsJob,
    () => ({ done: 'Gums has his teeth back.', sold: 'You sold Gums his own teeth.' })[S.f.gumsJob] || null,
    () => (has('gumsteeth') ? 'Bring the jar to Gums.' : 'Find the tooth-tax jar labelled GUMS, inside Silo 9.'),
  ),
  // ---- Scrapwell, Rustwater, the farm, the Green ----
  envelopes: Q(
    "Ma's envelopes",
    'Ma Thistle, Scrapwell',
    () => S.f.elderJob,
    () => ({ nan: 'You told Ma it was her sister.', toaster: 'You told Ma it was the Toaster.' })[S.f.elderJob] || null,
    () =>
      knew('nan.secret')
        ? "You know who sends it. Tell Ma, or keep the Toaster's secret."
        : 'Ask Brother Crumb who leaves the money.',
  ),
  sty: Q(
    'Something at the sty',
    'Old Pell, Scrapwell',
    () => S.f.pellJob,
    () => (S.f.pellJob === 'done' ? 'Bacon Prime is safe.' : !alive('pig') ? 'Bacon Prime is gone.' : null),
    () =>
      S.f.plot_pork === 'stopped'
        ? 'Tell Pell his pig is safe.'
        : "Someone wants pork for Thursday. Mama Lou's is a good place to ask.",
  ),
  ring: Q(
    "Ma Thistle's ring",
    'Moe, Rustwater',
    () => S.f.moeJob,
    () =>
      ({ ma: 'You gave it back to Ma.', gus: 'You gave it to Gus.', gums: 'You sold it at the Mall.' })[S.f.ringWent] ||
      null,
    () => (S.f.moeJob === 1 ? "Buy it from Moe, off Gus's tab." : 'Give it to Ma, to Gus, or sell it.'),
  ),
  ride: Q(
    'A ride east',
    'Gloria, Rustwater',
    () => S.f.gloriaJob,
    () => ({ done: 'Jeb will take her.', told: 'You told Opal instead.' })[S.f.gloriaJob] || null,
    () => (S.f.gloriaJob === 'ride' ? 'Tell Gloria Jeb said yes.' : 'Talk Caravan Jeb into taking her.'),
  ),
  deputy: Q(
    'A badge for Pete',
    'Pete, Rustwater',
    () => S.f.peteJob,
    () => (S.f.peteJob === 'done' ? 'Pete is a deputy.' : !alive('pete') ? 'Pete is dead.' : null),
    () => (S.f.peteJob === 'yes' ? 'Tell Pete the good news.' : 'Put a word in with Sheriff Crane.'),
  ),
  carb: Q(
    "Bert's carburettor",
    "Bert, Hector's Farm",
    () => S.f.bertJob,
    () => ({ done: 'The tractor runs.', sold: 'You sold it to Gums.' })[S.f.bertJob] || null,
    () => (has('carbfixed') ? 'Take it back to Bert.' : 'Sprocket at the Drowned Mall can fix it.'),
  ),
  scout: Q(
    'The scout on the ridge',
    'The Warden, the Green',
    () => S.f.wardenJob,
    () =>
      S.f.wardenJob === 'done'
        ? 'The Warden opened the gate.'
        : S.f.scoutGone && !has('tags')
          ? 'You let him go.'
          : null,
    () => (has('tags') ? 'Bring the Warden his tags.' : 'Climb the ridge outside the Green.'),
  ),
  crane: Q(
    'Sheriff Crane',
    'Sheriff Crane, Rustwater',
    () => lover('sheriff') || S.spouse === 'sheriff',
    () => (S.spouse === 'sheriff' ? 'You married her.' : null),
    () =>
      !knew('sheriff.secret')
        ? 'Ask her what keeps her up at night.'
        : alive('krug') && !S.f.craneRedeemed
          ? 'Bring Krug in, together.'
          : 'Ask Brother Crumb to marry you.',
  ),
};
// Every plot you know about is a quest too: it has a day, a place and an ending.
const PLOT_NAMES = {
  pork: 'Pedigree pork',
  poison: "The Mayor's tea",
  route: 'The caravan road',
  skim: "Opal's takings",
  cabbage: "Junior's cabbages",
  fightnight: 'Fight night',
  vault: "Dice's escape",
  widow: "Sal's widow",
  drugwar: 'Grey Buzz',
  gate: "The Green's gate",
  plane: "The Coil's plane",
  pump: "Rustwater's pump",
  saint: 'Saint Sprocket',
  tooth: 'The Big Tooth',
};
function journalList() {
  const L = [];
  for (const k in QUESTS) {
    const q = QUESTS[k];
    if (!q.on()) continue;
    const d = q.done();
    L.push({ k, t: q.t, who: q.who, done: d || null, hint: d ? null : q.hint() });
  }
  for (const id in S.f.asked || {}) {
    if (S.spouse === id) continue;
    const joined = S.f.joined && S.f.joined[id];
    L.push({
      k: 'ask_' + id,
      t: `${NPC[id].n} might come with you`,
      who: LOC[NPC[id].home] ? LOC[NPC[id].home].n : '',
      done: joined ? 'Came with you.' : !alive(id) ? 'Dead.' : null,
      hint:
        joined || !alive(id)
          ? null
          : [...(RECRUIT[id] || []), ...(S.n[id].op < 0 ? [['Stops disliking you', () => false]] : [])]
              .map(c => `${c[1]() ? '☑' : '☐'} ${c[0]}`)
              .join('\n'),
    });
  }
  for (const k in PLOTS) {
    const P = PLOTS[k];
    if (!P.known()) continue;
    const st = S.f['plot_' + k];
    L.push({
      k: 'plot_' + k,
      t: PLOT_NAMES[k] || cap(k),
      who: LOC[P.where] ? LOC[P.where].n : '',
      done: st
        ? { done: 'It happened.', stopped: 'You changed how it ended.', void: 'It never came to pass.' }[st]
        : null,
      hint: st ? null : S.day < P.day() ? `Coming on day ${P.day()}.` : 'Any day now.',
    });
  }
  return L;
}
// New quests get a line in the log, once.
function journalNotice() {
  if (!S || S.end) return;
  S.qs = S.qs || {};
  for (const q of journalList())
    if (!S.qs[q.k]) {
      S.qs[q.k] = 1;
      if (!q.done) pend.push(['m', `New in your journal: ${q.t}.`]);
    }
}
let journalOpen = true;
function journalDraw() {
  const el = $('journal');
  if (!el) return;
  if (!S || S.end || ['title', 'intro', 'ending'].includes(S.scene)) {
    el.innerHTML = '';
    return;
  }
  const L = journalList(),
    act = L.filter(q => !q.done),
    old = L.filter(q => q.done);
  const row = q =>
    `<li class="${q.done ? 'qd' : 'qa'}"><b>${esc(q.t)}</b><span class="qw">${esc(q.who)}</span><span class="qh">${esc(q.done || q.hint).replace(/\n/g, '<br>')}</span></li>`;
  el.innerHTML = `<details${journalOpen ? ' open' : ''}><summary>Journal${act.length ? ` (${act.length})` : ''}</summary>${
    act.length
      ? `<ul>${act.map(row).join('')}</ul>`
      : '<p class="qn">Nothing yet. Talk to people. Everyone wants something.</p>'
  }${old.length ? `<p class="qt">Done</p><ul>${old.map(row).join('')}</ul>` : ''}</details>`;
  try {
    el.querySelector('details').ontoggle = e => (journalOpen = e.target.open);
  } catch (e) {}
}
const _showJournal = show;
show = v => {
  journalNotice();
  _showJournal(v);
  journalDraw();
};
