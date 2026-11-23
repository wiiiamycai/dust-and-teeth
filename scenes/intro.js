'use strict';
// ================= TITLE / INTRO / ENDING =================
SC.title = () =>
  show({
    title: 'DUST & TEETH',
    icon: '🦷',
    sub: 'a nasty little wasteland',
    text: "The bombs fell 200 years ago. You're a nobody from Scrapwell. Not strong, not clever, not anything yet. No quest. No prophecy. Teeth for money.\n\nEveryone remembers what you do, and word gets around. Somewhere out east, something is waking up.\n\nNo reloads.",
    opts: [
      [
        'Crawl out of bed',
        () => {
          newGame();
          go('intro');
        },
      ],
    ],
  });
SC.intro = () =>
  show({
    title: 'Scrapwell',
    icon: '🏚️',
    text: D(
      'You step past the fence. Nobody needs you. Best thing about being nobody.',
      'Fence. You go past it. All by yourself. Head feels big.',
    ),
    opts: [['Go', () => go('hub', 'scrapwell')]],
  });
SC.ending = () => {
  const E = S.end,
    f = S.f,
    L = [];
  const al = x => !S.dead[x];
  const head =
    {
      elder: 'You killed Ma Thistle. Her last words: "I knew it would be you. The knives are under the goat."',
      death: `YOU DIED. ${E.cause || ''}`,
      caravan:
        "You ride east with Jeb. It's greenish over there. Nobody knows what you did." +
        (f.kingStopped ? '' : " Behind you, the sky turns white. You don't look back."),
      sold:
        'You sell yourself to Krug for twelve teeth and a blanket. You carry rocks for nineteen years.' +
        (f.kingStopped ? '' : ' Then the sky turns white.'),
      retired:
        'You sit down in your shack and never get up. You get a goat.' +
        (f.kingStopped ? '' : ' One morning the sky turns white. The goat goes first.'),
      nuke: f.knowSilo
        ? "Day 25. The Big Tooth launches. You knew where it was. You didn't get there in time."
        : 'Day 25. The sky turns white. You never even found out where it came from.',
      destroyer:
        "You push the button for EVERYTHING. The Dentist King weeps with joy. The world goes white. You were a nobody. Now you're the last thing anyone saw.",
      nukehome: 'You nuked Scrapwell. Your own home. Your own well. Even the King looks at you funny.',
      greensafe:
        'Day 25. The Big Tooth launches. You see the white light from under the glass, over the pass, and the mountains take it. The Green lives. So, somehow, do you.',
      green:
        'You stay in the Green. Real food, clean water, and forty people who count everything. Forty-one now.' +
        (f.kingStopped ? '' : ' On day 25 the western sky turns white. Under the glass, nobody looks up.'),
    }[E.type] +
    (E.type === 'nuke' && f.knowGreen && alive('gardener') && S.n.gardener.loc === 'green'
      ? ' Over the pass, under the glass, forty people watch the white sky and go back to weeding.'
      : '');
  if (E.type !== 'nuke' && E.type !== 'destroyer' && E.type !== 'greensafe') {
    L.push(
      !al('elder')
        ? 'Without Ma Thistle, Scrapwell fought over her chair until there was no village left.'
        : f.tfixed
          ? "The Holy Toaster pops once a year now. You're in the stained glass, holding a fork."
          : 'Scrapwell kept dying slowly, with good manners.',
    );
    if (f.nigel)
      L.push(
        {
          dentist: "Nigel became Scrapwell's glowing dentist. Gentle hands.",
          hat: 'Nigel lived under his hat, eating chickens only on Tuesdays.',
          lied: 'Nigel kept eating a chicken a week. Gus blamed foxes. There are no foxes.',
          moved: "Nigel lived happily in the Sky-Bus, doing dead men's teeth.",
          dead: 'Nobody missed Nigel. The chickens held no service.',
        }[f.nigel],
      );
    if (f.pigFate === 'stew') L.push('Bacon Prime was Thursday\'s special. "Aristocratic, with notes of grief."');
    else if (f.pigFate === 'slave')
      L.push("Bacon Prime pulled Krug's cart, escaped, and now leads a wild pig gang. He remembers your face.");
    if (f.nukedLoc) L.push(`${LOC[f.nukedLoc].n} is a glowing crater. You chose that.`);
    else if (f.hanged) L.push("The Mayor swung from his own pump. Rustwater's water stayed free for a generation.");
    else if (f.pumpOpen) L.push('Fenwick kept the pump open and told everyone it was his idea.');
    else if (!al('sheriff') && al('mayor'))
      L.push('With the Sheriff dead, water hit 20 teeth a cup. Funerals stayed free and popular.');
    else L.push('Rustwater stayed thirsty.');
    if (f.raidResult === 'held') L.push('Rustwater still tells the story of the night it beat the Molars.');
    if (f.louReformed && al('lou')) L.push('Mama Lou switched to mole-dog. Nobody could say why it tasted worse.');
    else if (al('lou'))
      L.push(
        f.cannibal
          ? 'Lou always saved you a bowl. You always ate it.'
          : "Travellers kept vanishing at Lou's. Nobody asked.",
      );
    if (al('pete') && S.n.pete.loc === 'rustwater')
      L.push('Pete never ate meat again. Every Tuesday he lit a candle for Sal.');
    else if (f.peteEaten) L.push('Pete was served on Tuesday, as planned.');
    L.push(
      f.krugHow === 'molars'
        ? null
        : f.freed
          ? "The freed people of Chainfield built a town from shopping trolleys. There's a statue of you. It's bad, but sincere."
          : !al('krug')
            ? 'Without Krug, his slavers fought over the notebook until none were left.'
            : f.slaver
              ? "You stayed in Krug's notebook as a valued colleague."
              : 'Krug kept perfect records for many more years.',
    );
    const b = S.n.bess;
    if (!al('bess'))
      L.push(
        f.queenFate === 'killed'
          ? "You killed the Raider Queen. Nobody knew she'd been a farm girl you sold."
          : f.spouseFate === 'stew' && f.spouseWho === 'bess'
            ? "Bess was Thursday's special."
            : 'Bess is dead. Hector never stopped hunting you.',
      );
    else if (b.loc === 'party')
      L.push(
        f.reunited
          ? 'Bess stayed with you. She held the knife from then on.'
          : 'Bess stayed by your side. Not a good marriage, but a long one.',
      );
    else if (b.loc === 'wastes')
      L.push(
        f.queenFate === 'spared' || f.queenFate === 'paid'
          ? 'Raider Queen Bess rules the eastern roads. Travellers who say your name get robbed twice.'
          : 'Somewhere out there, Raider Queen Bess is still looking for you.',
      );
    else if ((b.loc === 'gone' && !f.bessBounty) || b.loc === 'pen') L.push('Bess was sold on. Nobody knows where.');
    else if (f.bessHome) L.push('Bess came home from Chainfield. She sleeps with the hoe now.');
    if (al('bert') && (S.n.bert.loc === 'gone' || S.n.bert.loc === 'pen'))
      L.push('Bert was sold to a farm out west. He finally drives a real tractor. He calls it a happy ending.');
    L.push(
      f.kingHow === 'talked'
        ? 'The Dentist King retired and opened a practice in Rustwater. Fair prices. The chairs have straps.'
        : f.disarmed || f.kingHow === 'sabotage' || f.kingHow === 'stolen'
          ? 'The Big Tooth never launched. Nobody ever knew how close it came. You know.'
          : f.kingStopped
            ? ''
            : 'Out east, the Big Tooth was still waking up.',
    );
  }
  if (E.type !== 'nuke' && E.type !== 'destroyer' && E.type !== 'greensafe')
    L.push(
      ...krugLines(),
      ...webLines(),
      ...snakeLines(),
      ...mallLines(),
      ...greenLines(),
      ...linkLines(),
      ...loveLines(),
    );
  if (E.type === 'greensafe') L.push(...greenLines());
  const you = `${S.day} day${S.day === 1 ? '' : 's'}. ${S.kills} kills. ${S.teeth} teeth.\nKnown as: ${karmaTitle()}${S.titles.length ? '. ' + S.titles.join('. ') : ''}.`;
  // Fallout-style slides: the headline, then one slide for each place and person.
  const lines = L.filter(Boolean),
    slides = [head];
  slides.push(...lines); // one place or person per slide, each with its own picture (scenes/endart.js)
  slides.push(`${head}\n\n${you}\n\nThis life is over. Your save is gone.`);
  wipe();
  S = null;
  const slide = i =>
    show({
      title: i === 0 || i === slides.length - 1 ? 'The End' : 'What became of them',
      icon: '💀',
      text: slides[i],
      opts: [i < slides.length - 1 ? ['Next', () => slide(i + 1)] : ['Start a new life', () => go('title')]],
    });
  slide(0);
};
// ---- restart: the button in the footer. It asks first, because a life can't be got back. ----
function restartAsk() {
  if (!S || S.end || S.scene === 'restart') return;
  S.ret = { scene: S.scene, args: S.args };
  go('restart');
}
SC.restart = () => {
  if (!S) return go('title');
  const back = S.ret || { scene: 'hub', args: [S.here || 'scrapwell'] };
  show({
    title: 'Start over?',
    icon: '💀',
    text: 'This life ends here. No ending slides, no second chances. The save is gone for good.',
    opts: [
      [
        'Yes. Start a new life',
        () => {
          wipe();
          S = null;
          go('title');
        },
        'danger',
      ],
      ['No, keep going', () => go(back.scene, ...back.args)],
    ],
  });
};
(() => {
  if (typeof document === 'undefined' || !document.addEventListener) return;
  const f = document.getElementById('foot');
  if (f && f.insertAdjacentHTML)
    f.insertAdjacentHTML('beforeend', ' <button id="rstb" class="snd" type="button">↺ New life</button>');
  document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('#rstb')) restartAsk();
  });
})();
// ---- the status bar (v9.6, Will: "character and inventory in one, journals in one, as icons under the XP bar;
// audit the HUD, a lot of it doesn't make sense") ----
// Health, then the experience bar towards your next perk, teeth and the day; under them three buttons:
// 🧍 you (body, skills, perks, reputation), 🎒 your bag (gear and what you carry, v9.8: Will wanted them apart),
// 📜 the journal, ⚙️ sound and a new life.
// Your name (always Nobody), your gear and your reputation were crammed into the bar and cut off on a phone:
// they live in 🎒 now. The ☰ panel, the side panels and the footer are gone.
function openPanel(k) {
  if (!S || S.fight || S.end || !SC[k]) return;
  if (PANEL === k) return panelClose();
  if (!PANEL) S.ret = { scene: S.scene, args: S.args };
  go(k);
}
function panelClose() {
  const r = S.ret || { scene: 'map', args: [] };
  go(r.scene, ...(r.args || []));
}
function hud() {
  const h = $('hud');
  if (!S) {
    h.innerHTML = '<b>DUST &amp; TEETH</b>';
    return;
  }
  const pb = perkBar(),
    q = typeof journalList === 'function' ? journalList().filter(x => !x.done).length : 0,
    off = S.fight || ['title', 'intro', 'ending', 'restart'].includes(S.scene) ? ' disabled' : '',
    btn = (k, t) => `<button class="hb${S.scene === k ? ' on' : ''}" onclick="openPanel('${k}')"${off}>${t}</button>`;
  h.innerHTML =
    `<div class="hrow"><div class="hbars"><div class="bar hp"><i style="width:${clamp((S.hp * 100) / S.maxhp, 0, 100)}%"></i><span>HP ${S.hp}/${S.maxhp}</span></div>` +
    (pb
      ? `<div class="bar xp"><i style="width:${Math.round(pb.frac * 100)}%"></i><span>★ ${esc(pb.txt)}</span></div>`
      : '') +
    `</div><div class="hstat"><span>🦷 ${S.teeth}</span><span>Day ${S.day}</span></div></div>` +
    `<div class="hicons">${btn('char', '🧍 You')}${btn('inv', '🎒 Bag')}${btn('journal', `📜 Journal${q ? ` (${q})` : ''}`)}${btn('settings', '⚙️')}</div>`;
}
