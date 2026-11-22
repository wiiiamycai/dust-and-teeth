'use strict';
// ================= THE CHARACTER PANEL: you, in pictures, on the left =================
// Will: "character always open on the left if the journal is on the right. Stats, gear, perks, even guns graphic
// instead of text." The mirror of the journal: beside the screen on wide displays, under the journal on narrow ones,
// and it folds away. You as a pixel figure in your real armour with your real weapon, a picture of the weapon,
// pips for stats and skills, icons for what you carry, badges for perks. Looks only: the Character screen still
// does the wielding and the healing. No numbers unless you've earned Keen Eye (pillar 4).

// ---- pixel pictures: rows of palette letters (SPAL in data/sprites.js), '.' is see-through ----
const WPIX = {
  fists: ['..ssss..', '.ssssss.', 'ssssssss', 'sSsSsSss', '.ssssss.', '..ssss..'],
  knife: [
    '........................',
    'lll.xxxxxxxxxxxxxx......',
    'llllmxxxxxxxxxxxxxxxx...',
    'lll.XXXXXXXXXXXXXX......',
  ],
  pipe: [
    'MM....................MM',
    'MMmmmmmmmmmmmmmmmmmmmmMM',
    'MMMMMMMMMMMMMMMMMMMMMMMM',
    'MM....................MM',
  ],
  sledge: [
    '..................mmmmmm',
    '..................mmmmmm',
    'wwwwwwwwwwwwwwwwwwmmmmmm',
    'WWWWWWWWWWWWWWWWWWMMMMMM',
    '..................MMMMMM',
  ],
  cleaver: [
    '......xxxxxxxxxxxx',
    '......xxxxxxxxxxxx',
    'llllllxxxxxxxxxxxx',
    'llllllXXXXXXXXXXXX',
    '......XXXXXXXXXXXX',
  ],
  drill: [
    '......mmmmmmmm..........',
    'nnnnnnmmMMMMMMmxxxxxxx..',
    'nnnnnnmmMMMMMMmxxxxx....',
    '..nnn..mmmmmmm..........',
    '..nnn...................',
  ],
  zipgun: ['nnnnnnnnnnnnnnnn', 'mmmmmmmmmmmmmmn.', '..www...........', '..www...........', '..WWW...........'],
  rifle: [
    '........................nn',
    'wwwwwwwwmmmmmmmmmmmmmmmmmm',
    'WWWWWWWwnnmm..............',
    'WWW.....n.................',
  ],
  shotgun: ['wwwwwwwwnnnnnnnnnnnnnnnnnn', 'WWWWWWWwmmmmmmmmmmmmmmmmmm', 'WWW.....n.n...............'],
  molargun: [
    '.......nnnnn..............',
    'wwwwwwmmmmmmmmmmmmmmmmmmmt',
    'WWWWW.nMMMMMMnnnnnnnnnnnn.',
    '......nn..nn..............',
  ],
  plasma: [
    '......gggggggggggg......',
    'mmmmmmmmmmmmmmmmmmmmmgg.',
    'MMMMMmmnnnnnnnmmmmmmmgg.',
    '......nn................',
  ],
};
const IPIX = {
  gutglue: ['..mm..', '.xxxx.', '.xrrx.', '.xrrx.', '.xxxx.'],
  buzz: ['....m.', '..xgx.', '.xgx..', 'xgx...', 'm.....'],
  beer: ['..mm..', '..yy..', '.yyyy.', '.yYyy.', '.yyyy.'],
  meat: ['.rrr..', 'rrRrr.', 'rrrrrx', '.rrr.x'],
  ammo: ['.a.a.a', '.a.a.a', 'mamama', 'mmmmmm'],
  hat: ['..vv..', '.vvvv.', 'vvvvvv'],
  tophat: ['.nnnn.', '.nnnn.', '.nrrn.', 'nnnnnn'],
  coil: ['mmmmm.', 'm...m.', 'mmmmm.', 'm...m.', 'mmmmm.'],
  seeds: ['.xxxx.', '.xffx.', '.xffx.', '.xxxx.'],
  veg: ['.f.f..', 'rrrff.', 'wwwww.', '.www..'],
  letter: ['xxxxxx', 'xXxxXx', 'xxXXxx', 'xxxxxx'],
  ring: ['.yyy.', 'y...y', 'y...y', '.yyy.'],
  key: ['yy....', 'yyyyyy', 'yy..y.'],
  badge: ['..a..', '.aaa.', 'aaaaa', '.a.a.'],
  pig: ['.pppp.', 'pppppp', 'pnpppp', '.p..p.'],
  toaster: ['.yy.yy', 'mmmmmm', 'mMMMMm', 'mmmmmm'],
  grey: ['.xxx.', 'xmmmx', 'xmmmx', '.xxx.'],
  gumsteeth: ['.xxx.', 'xtttx', 'xtttx', '.xxx.'],
  tags: ['.m.m.', 'mmmmm', '.mmm.'],
  carb: ['mmmm', 'mMMm', 'mmmm'],
  carbfixed: ['mmmm', 'mMMm', 'mmmm'],
  matchbarrel: ['mmmmmmmm', 'MMMMMMMM'],
};
const PARTPIX = ['.mm.', 'mMMm', 'mMMm', '.mm.'];
function pixDraw(cv, rows, k, pal) {
  if (!cv || !cv.getContext) return;
  const h = rows.length,
    w = Math.max(...rows.map(r => r.length)),
    P = { ...SPAL, ...(pal || {}) },
    col = ch => P[ch] || (P[ch.toLowerCase()] ? sprHex(P[ch.toLowerCase()], 0.72) : null),
    at = (x, y) => (y >= 0 && y < h && x >= 0 && x < rows[y].length && rows[y][x] !== '.' ? rows[y][x] : null);
  cv.width = (w + 2) * k;
  cv.height = (h + 2) * k;
  const g = cv.getContext('2d');
  for (let y = -1; y <= h; y++)
    for (let x = -1; x <= w; x++) {
      const ch = at(x, y);
      let c = ch ? col(ch) : at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1) ? 'rgba(18,12,6,0.9)' : null;
      if (ch && c && !SGLOW.includes(ch) && (!at(x, y - 1) || !at(x - 1, y))) c = sprHex(c, 1.12);
      if (c) {
        g.fillStyle = c;
        g.fillRect((x + 1) * k, (y + 1) * k, k, k);
      }
    }
}
// You, as a sprite: an average man, in whatever you're wearing, holding whatever you're holding.
const DOLL_ARMOUR = {
  rags: { add: ['rags'] },
  jacket: { add: ['coat'], pal: { v: '#7a4c2c' } },
  spikes: { add: ['rags', 'spikes'] },
  vest: { add: ['vest', 'star'], pal: { v: '#5a4a34' } },
  plate: { add: ['plate'] },
  riot: { add: ['plate', 'goggles'], pal: { m: '#3a4a5e', u: '#2a3a4e' } },
  power: { add: ['plate', 'goggles'], pal: { m: '#5e6a4a', u: '#a8e07c' } },
};
const DOLL_HOLD = {
  knife: 'knife',
  cleaver: 'knife',
  pipe: 'cane',
  sledge: 'pick',
  drill: 'drill',
  zipgun: 'pistol',
  rifle: 'longgun',
  shotgun: 'shotgun',
  molargun: 'longgun',
  plasma: 'longgun',
};
function dollSpec() {
  const a = DOLL_ARMOUR[S.armor] || DOLL_ARMOUR.rags,
    add = [...a.add];
  if (has('tophat')) add.push('tophat');
  else if (has('hat')) add.push('hat');
  return { body: 'man', pal: { h: '#4a3424', c: '#6a5a44', ...(a.pal || {}) }, add, item: DOLL_HOLD[S.weapon] || null };
}
function dollDraw(cv, k) {
  if (!cv || !cv.getContext) return;
  const px = sprPixels(sprLetters(dollSpec()), 32, dollSpec().pal);
  cv.width = SW * k;
  cv.height = 32 * k;
  const g = cv.getContext('2d');
  for (let y = 0; y < 32; y++)
    for (let x = 0; x < SW; x++) {
      const c = px[y * SW + x];
      if (c) {
        g.fillStyle = c;
        g.fillRect(x * k, y * k, k, k);
      }
    }
}
// ---- the panel ----
const pips = (n, of) => `<span class="pips">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(of - n)}</span>`;
const SKICON = { melee: '👊', guns: '🔫', sneak: '👣', steal: '✋', speech: '💬', science: '⚙️' };
let sheetOpen = true;
function sheetDraw() {
  const el = $('sheet');
  if (!el) return;
  if (!S || S.end || ['title', 'intro', 'ending'].includes(S.scene)) {
    el.innerHTML = '';
    return;
  }
  const kn = keen(),
    st = S.stats,
    w = W[S.weapon],
    ar = A[S.armor],
    gun = isGun(S.weapon) && !w.free;
  const stats = Object.keys(st)
    .map(k => {
      const v = k === 'twitch' ? ptw() : st[k];
      return `<div class="row"><span class="nm">${cap(k)}</span>${pips(clamp(Math.ceil(v / 2), 0, 5), 5)}<span class="wd">${kn ? v : esc(statWord(v))}</span></div>`;
    })
    .join('');
  const skills = Object.keys(S.skills)
    .map(
      k =>
        `<div class="row"><span class="nm">${SKICON[k] || ''} ${cap(k)}</span>${pips(band(S.skills[k]) + 1, 5)}<span class="wd">${esc(skillWord(k))}${kn ? ' ' + S.skills[k] : ''}</span></div>`,
    )
    .join('');
  const inv = Object.keys(S.inv).filter(k => S.inv[k] > 0);
  const perks = S.perks.length
    ? S.perks
        .map(p => `<span class="perk" title="${esc(PERKS[p].d)}"><b>${esc(PERKS[p].n[0])}</b>${esc(PERKS[p].n)}</span>`)
        .join('')
    : '<p class="none">None yet. You earn them by what you do.</p>';
  el.innerHTML = `<details${sheetOpen ? ' open' : ''}><summary>${esc(S.name)}</summary>
<div class="doll"><canvas id="sh-doll"></canvas><div class="dollside"><div class="hpw">HP ${S.hp}/${S.maxhp}</div><div class="bar hp"><i style="width:${clamp((S.hp * 100) / S.maxhp, 0, 100)}%"></i></div><div class="kar">${esc(karmaTitle())}</div><div class="kar">🦷 ${S.teeth} · Day ${S.day} · ${S.kills} kills</div></div></div>
<p class="sh">Gear</p>
<div class="gear"><canvas id="sh-wep"></canvas><div><b>${esc(modName(S.weapon))}</b><span>${w.t === 'guns' ? 'Gun' : 'Melee'}${kn ? `, ${w.d[0]} to ${w.d[1]}` : ''}${gun ? ` · ${S.inv.ammo || 0} bullets` : ''}</span></div></div>
<div class="gear"><div><b>${esc(modName(S.armor))}</b><span>${kn ? `Stops ${ar.dr + modSum(S.armor, 'dr')} a hit` : ar.dr >= 7 ? 'Heavy' : ar.dr >= 3 ? 'Decent' : ar.dr ? 'Thin' : 'Nothing at all'}</span></div></div>
<p class="sh">Stats</p>${stats}
<p class="sh">Skills</p>${skills}
<p class="sh">Perks</p><div class="perks">${perks}</div>
<p class="sh">Carrying</p><div class="inv">${
    inv
      .map(
        k =>
          `<span class="it" title="${esc(ITEMS[k] || k)}"><canvas data-it="${k}"></canvas>${S.inv[k] > 1 ? `<i>${S.inv[k]}</i>` : ''}</span>`,
      )
      .join('') || '<p class="none">Regret.</p>'
  }</div>
${S.titles.length ? `<p class="sh">Known as</p><p class="ttl">${S.titles.map(esc).join(' · ')}</p>` : ''}
</details>`;
  try {
    el.querySelector('details').ontoggle = e => (sheetOpen = e.target.open);
  } catch (e) {}
  if (!canDraw()) return;
  try {
    dollDraw($('sh-doll'), 4);
    pixDraw($('sh-wep'), WPIX[S.weapon] || WPIX.fists, 4);
    el.querySelectorAll('canvas[data-it]').forEach(cv => pixDraw(cv, IPIX[cv.dataset.it] || PARTPIX, 4));
  } catch (e) {}
}
const _showSheet = show;
show = v => {
  _showSheet(v);
  sheetDraw();
};
