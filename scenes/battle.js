'use strict';
// ================= THE BATTLE SCREEN (v7.6) =================
// Will: "make this a Pokemon UI", in our own art and layout. A fight is a battle screen: the beasts at the top
// right with their name and health, you from behind at the bottom left, and the menu as FIGHT, BAG and RUN.
// FIGHT holds the attacks (with their odds) and, when something winds up, dodge and brace. BAG holds Gut Glue,
// Buzz, meat, flares, molotovs and switching weapon. The fight itself is unchanged (engine/combat.js): this only
// draws it and sorts its options. Health bars show for everyone, like the handheld; Keen Eye still adds the exact
// numbers, armour and what they carry. No canvas (the headless tests): the fight is the text screen, as before.
let BM = 'main', // which menu is open: main, fight or bag
  BK = null; // the live battle screen
const BW = 240,
  BH = 150;
// people (anyone with a name in the cast) are always drawn as people, whatever their icon: Jeb is no lizard
const kindOf = e =>
  e.npc
    ? 'man'
    : {
        '🐀': 'rat',
        '🦀': 'crab',
        '🐺': 'hound',
        '🐕': 'hound',
        '🐝': 'bee',
        '🪱': 'worm',
        '🐍': 'worm',
        '🐄': 'cow',
        '🦎': 'lizard',
        '🦅': 'bird',
      }[e.i] || (e.beast ? 'rat' : 'man');
// ---- beasts, drawn in code: outlined, shaded, facing you ----
function drawBeast(g, kind, cx, by, s, hurt) {
  const R = (x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(Math.round(cx + x * s), Math.round(by + y * s), Math.ceil(w * s), Math.ceil(h * s));
  };
  const ink = GP.ink;
  g.fillStyle = 'rgba(40,20,10,0.3)';
  g.beginPath();
  g.ellipse(cx, by, 14 * s, 3 * s, 0, 0, Math.PI * 2);
  g.fill();
  const tint = c => (hurt ? '#f8f4e0' : c);
  if (kind === 'rat') {
    R(-11, -14, 22, 13, ink);
    R(-10, -13, 20, 11, tint('#8a7a6a'));
    R(-10, -13, 20, 3, tint('#aa9a88'));
    R(-13, -19, 8, 8, ink);
    R(5, -19, 8, 8, ink);
    R(-12, -18, 6, 6, tint('#d8a0a0'));
    R(6, -18, 6, 6, tint('#d8a0a0'));
    R(-5, -9, 3, 3, '#e03a2a');
    R(2, -9, 3, 3, '#e03a2a');
    R(-2, -5, 4, 2, ink);
    R(-1, -3, 1, 2, '#f8f4e0');
    R(1, -3, 1, 2, '#f8f4e0');
    R(10, -6, 9, 2, ink);
    R(17, -9, 2, 4, ink);
    R(-9, -1, 4, 2, ink);
    R(5, -1, 4, 2, ink);
  } else if (kind === 'crab') {
    R(-14, -14, 28, 12, ink);
    R(-13, -13, 26, 10, tint('#c4583a'));
    R(-13, -13, 26, 3, tint('#e07a52'));
    R(-9, -10, 3, 2, tint('#8a3826'));
    R(6, -10, 3, 2, tint('#8a3826'));
    R(-22, -22, 9, 9, ink);
    R(13, -22, 9, 9, ink);
    R(-21, -21, 7, 7, tint('#c4583a'));
    R(14, -21, 7, 7, tint('#c4583a'));
    R(-21, -21, 3, 3, tint('#f8f4e0'));
    R(18, -21, 3, 3, tint('#f8f4e0'));
    R(-5, -18, 3, 5, ink);
    R(2, -18, 3, 5, ink);
    R(-5, -19, 3, 2, '#f8f4e0');
    R(2, -19, 3, 2, '#f8f4e0');
    for (const x of [-15, -11, 8, 12]) R(x, -3, 3, 4, ink);
  } else if (kind === 'hound') {
    R(-12, -16, 24, 14, ink);
    R(-11, -15, 22, 12, tint('#6a6a64'));
    R(-11, -15, 22, 3, tint('#8a8a82'));
    R(-8, -24, 16, 11, ink);
    R(-7, -23, 14, 9, tint('#7a7a72'));
    R(-9, -27, 5, 6, ink);
    R(4, -27, 5, 6, ink);
    R(-4, -20, 2, 2, '#f0c040');
    R(2, -20, 2, 2, '#f0c040');
    R(-4, -16, 8, 3, ink);
    R(-3, -15, 1, 2, '#f8f4e0');
    R(2, -15, 1, 2, '#f8f4e0');
    R(-10, -2, 4, 3, ink);
    R(6, -2, 4, 3, ink);
  } else if (kind === 'bee') {
    g.fillStyle = 'rgba(220,240,250,0.7)';
    g.fillRect(Math.round(cx - 18 * s), Math.round(by - 30 * s), Math.ceil(12 * s), Math.ceil(8 * s));
    g.fillRect(Math.round(cx + 6 * s), Math.round(by - 30 * s), Math.ceil(12 * s), Math.ceil(8 * s));
    R(-9, -24, 18, 14, ink);
    R(-8, -23, 16, 12, tint('#f0c040'));
    R(-8, -20, 16, 2, ink);
    R(-8, -16, 16, 2, ink);
    R(-5, -29, 10, 6, ink);
    R(-3, -27, 2, 2, '#e03a2a');
    R(1, -27, 2, 2, '#e03a2a');
    R(-1, -10, 2, 5, ink);
    R(-1, -6, 1, 2, '#f8f4e0');
  } else if (kind === 'cow') {
    // the two-headed cow: a white body with black patches, four legs, and two heads that disagree
    R(-17, -22, 34, 15, ink);
    R(-16, -21, 32, 13, tint('#f0ece0'));
    R(-16, -21, 32, 2, tint('#ffffff'));
    R(-11, -19, 8, 6, tint('#2a2420'));
    R(4, -15, 9, 5, tint('#2a2420'));
    R(-2, -21, 5, 3, tint('#2a2420'));
    R(-10, -10, 5, 3, tint('#e8b0b0')); // the udder
    for (const x of [-15, -9, 6, 12]) {
      R(x, -8, 4, 8, ink);
      R(x + 1, -8, 2, 7, tint('#e8e4d8'));
      R(x, -1, 4, 1, ink);
    }
    // two heads, leaning apart
    for (const [hx, hy] of [
      [-21, -30],
      [7, -31],
    ]) {
      R(hx, hy, 14, 12, ink);
      R(hx + 1, hy + 1, 12, 10, tint('#f0ece0'));
      R(hx + 1, hy + 6, 12, 5, tint('#e8b0a0')); // muzzle
      R(hx + 3, hy + 8, 2, 2, ink);
      R(hx + 9, hy + 8, 2, 2, ink);
      R(hx + 3, hy + 3, 2, 2, ink);
      R(hx + 9, hy + 3, 2, 2, ink);
      R(hx - 2, hy - 2, 4, 3, ink); // horns
      R(hx + 12, hy - 2, 4, 3, ink);
      R(hx - 1, hy - 1, 2, 1, tint('#e8dcc0'));
      R(hx + 13, hy - 1, 2, 1, tint('#e8dcc0'));
    }
    R(17, -20, 2, 9, ink); // tail
  } else if (kind === 'lizard') {
    R(-16, -12, 30, 10, ink);
    R(-15, -11, 28, 8, tint('#8aa04a'));
    R(-15, -11, 28, 2, tint('#aac06a'));
    for (let x = -12; x < 10; x += 5) R(x, -9, 2, 2, tint('#5a7a2a'));
    R(-24, -14, 11, 9, ink); // head
    R(-23, -13, 9, 7, tint('#9ab05a'));
    R(-21, -11, 2, 2, '#e8c020');
    R(-23, -8, 6, 1, ink);
    R(-17, -17, 6, 5, ink); // the frill
    R(-16, -16, 4, 3, tint('#d8703a'));
    R(13, -8, 10, 3, ink); // tail
    R(22, -6, 6, 2, ink);
    for (const x of [-12, -4, 4, 10]) R(x, -3, 3, 3, ink);
  } else if (kind === 'bird') {
    // a bone-picker, wings up
    R(-24, -30, 16, 6, ink);
    R(8, -30, 16, 6, ink);
    R(-23, -29, 14, 4, tint('#4a3a30'));
    R(9, -29, 14, 4, tint('#4a3a30'));
    R(-8, -28, 16, 18, ink);
    R(-7, -27, 14, 16, tint('#5a4a3a'));
    R(-5, -36, 10, 9, ink); // bald head
    R(-4, -35, 8, 7, tint('#d89a8a'));
    R(-3, -33, 2, 2, ink);
    R(1, -33, 2, 2, ink);
    R(-1, -30, 3, 4, tint('#e8c060'));
    R(-5, -10, 3, 8, ink);
    R(2, -10, 3, 8, ink);
  } else if (kind === 'worm') {
    R(-16, -34, 32, 34, ink);
    R(-15, -33, 30, 32, tint('#a87060'));
    for (let y = -30; y < 0; y += 6) R(-15, y, 30, 1, tint('#7a4a3a'));
    R(-11, -30, 22, 12, ink);
    R(-10, -29, 20, 10, '#3a1010');
    for (let x = -9; x < 10; x += 4) {
      R(x, -29, 2, 3, '#f8f4e0');
      R(x + 1, -22, 2, 3, '#f8f4e0');
    }
  }
}
// ---- the screen ----
// ---- v9.32: the battle screen again, in the approved art (Will: "start drawing pokemon combat UI again") ----
// The ground is the place you're in (the town kit's own ground), the beasts are the approved beast sprites,
// people are chibis (named people as themselves, the rest in a few stock looks), and you are your chibi from
// behind, big, bottom left. Names and health are sharp HTML boxes over the picture; a hit flashes the sprite,
// health slides down, the beaten fall, and you shake when you're hurt. The fight's rules are unchanged.
const BT_W = 240,
  BT_H = 176;
// stock looks for people with no name of their own
const BT_STOCK = {
  slaver: { skin: '#c89a78', hair: '#2a1e14', hs: 'buzz', top: '#5a4a3a', bot: '#3a3028', x: ['chains', 'beard'] },
  molar: { skin: '#b08a6a', hair: '#1a1210', hs: 'buzz', top: '#6a2a2a', bot: '#2a2420', x: ['spikes', 'necklace'] },
  raider: { skin: '#a87a5a', hair: '#6a4a2a', hs: 'messy', top: '#6a3a2a', bot: '#3a3028', x: ['scarf'] },
  drifter: { skin: '#c8a07a', hair: '#8a7a6a', hs: 'long', top: '#7a6a50', bot: '#4a4030', x: ['pack'] },
};
for (const k in BT_STOCK) CHIBI['_' + k] = BT_STOCK[k];
const btLook = e =>
  e.npc && CHIBI[e.npc]
    ? e.npc
    : /slaver|Krug/i.test(e.n)
      ? '_slaver'
      : /Molar|Incisor|Molar|Tooth|Fang/i.test(e.n)
        ? '_molar'
        : /wander|drifter|salesman|taxman|cult/i.test(e.n)
          ? '_drifter'
          : '_raider';
// which approved beast sprite: the bosses get the big ones
const btBeast = (e, kind) =>
  ({
    rat: e.boss ? 'ratQueen' : 'rat',
    crab: e.boss ? (/shell/i.test(e.n) ? 'oldShell' : 'crabBig') : /saltback|pincer/i.test(e.n) ? 'saltback' : 'crab',
    hound: e.boss ? 'alpha' : 'hound',
    bee: 'stinger',
    lizard: 'lizard',
    bird: 'bird',
    worm: 'worm',
    cow: 'cow',
  })[kind];
// the place's own ground and colours, from its town
function btGround() {
  const t = typeof TOWNMAP !== 'undefined' && (TOWNMAP[S.here] || TOWNMAP[townOf(S.here)]);
  if (!t) return { c: ',', pal: {} };
  const n = {};
  t.rows
    .join('')
    .replace(/[=~]/g, '')
    .split('')
    .forEach(c => (n[c] = (n[c] || 0) + 1));
  return { c: Object.keys(n).sort((a, b) => n[b] - n[a])[0] || '.', pal: t.pal || {} };
}
let BT_BG = {};
function btBack() {
  const gr = btGround(),
    key = gr.c + JSON.stringify(gr.pal);
  if (BT_BG[key]) return BT_BG[key];
  const P = TK.paintTown(Array(8).fill(gr.c.repeat(10)), gr.pal, () => {
    const g = TK.g;
    g.fillStyle = 'rgba(60,40,20,0.22)';
    g.beginPath();
    g.ellipse(176, 86, 70, 14, 0, 0, 7);
    g.fill();
    g.beginPath();
    g.ellipse(62, 170, 70, 16, 0, 0, 7);
    g.fill();
    TK.props.rock(8, 30, 1);
  });
  return (BT_BG[key] = P.c);
}
// one sprite, on its own small canvas; white when it's just been hit
function btSprite(e, hurt) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const kind = kindOf(e),
    bk = kind !== 'man' && btBeast(e, kind);
  if (kind === 'man') chibiDraw(g, btLook(e), 'down', 0);
  else if (bk && BEAST[bk]) BEAST[bk](g, 8, 12);
  else drawBeast(g, kind, 32, 52, e.boss ? 1.6 : 1, false);
  if (hurt) {
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(255,250,235,0.85)';
    g.fillRect(0, 0, 64, 64);
  }
  return { c, man: kind === 'man', big: !!e.boss };
}
function battleArt(F) {
  const vw = $('view');
  vw.hidden = false;
  const prev = BK && BK.F === F ? BK : null,
    hp0 = prev ? prev.hp : F.en.map(e => e.hp),
    me0 = prev ? prev.me : S.hp;
  vw.innerHTML = `<div class="bt"><canvas id="bcv" width="${BT_W}" height="${BT_H}"></canvas><div class="bfoes"></div><div class="bme"></div><div class="bround">Round ${F.round || 1}</div></div>`;
  // the newest words in view
  ['log', 'text'].forEach(id => {
    const el = $(id);
    if (el) requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
  });
  const cv = $('bcv'),
    g = cv.getContext('2d');
  g.imageSmoothingEnabled = false;
  BK = { cv, g, F, hp: F.en.map(e => e.hp), me: S.hp, t0: Date.now(), hit: F.en.map((e, i) => e.hp < hp0[i]), raf: 0 };
  const kn = keen();
  // the boxes: theirs top left (tap one to target it), yours bottom right
  const bar = f => `<div class="bb"><i style="width:${Math.max(0, f) * 100}%"></i></div>`;
  const shown = F.en.map((e, i) => [e, i]).filter(([e, i]) => e.hp > 0 || BK.hit[i]);
  const fo = vw.querySelector('.bfoes');
  shown.forEach(([e, i]) => {
    const d = document.createElement('div');
    d.className = 'bx' + (i === F.t && e.hp > 0 ? ' sel' : '') + (e.hp <= 0 ? ' gone' : '');
    const extra = kn
      ? `${Math.max(0, e.hp)}/${e.max}`
      : e.tele && e.hp > 0
        ? 'winding up!'
        : e.lvl
          ? 'Lv ' + e.lvl
          : '';
    d.innerHTML = `<div class="bn"><b>${esc(e.n)}</b><span>${esc(extra)}</span></div>${bar(hp0[i] / e.max)}`;
    d.onclick = () => {
      if (e.hp > 0 && F.t !== i) {
        F.t = i;
        go('fight');
      }
    };
    fo.appendChild(d);
    requestAnimationFrame(() => (d.querySelector('.bb i').style.width = (Math.max(0, e.hp) / e.max) * 100 + '%'));
  });
  const pb = perkBar(),
    me = vw.querySelector('.bme');
  me.innerHTML =
    `<div class="bx"><div class="bn"><b>You</b><span>${S.hp}/${S.maxhp}</span></div>${bar(me0 / S.maxhp)}` +
    `<div class="bs">${esc(W[S.weapon].n)}${F.range ? ' · at range' : ''}</div>` +
    (pb
      ? `<div class="bs bp">★ ${esc(pb.txt)}<div class="bb bl"><i style="width:${Math.round(pb.frac * 100)}%"></i></div></div>`
      : '') +
    '</div>';
  requestAnimationFrame(() => (me.querySelector('.bb i').style.width = (Math.max(0, S.hp) / S.maxhp) * 100 + '%'));
  if (S.hp < me0) {
    vw.querySelector('.bt').classList.add('shake'); // you were hurt
  }
  // tap a sprite to target it
  cv.addEventListener('pointerdown', ev => {
    const b = cv.getBoundingClientRect(),
      x = ((ev.clientX - b.left) / b.width) * BT_W,
      y = ((ev.clientY - b.top) / b.height) * BT_H;
    const i = (BK.spots || []).findIndex(s => s && x > s[0] && x < s[0] + s[2] && y > s[1] && y < s[1] + s[3]);
    if (i >= 0 && F.en[i].hp > 0 && F.t !== i) {
      F.t = i;
      go('fight');
    }
  });
  const loop = () => {
    if (!BK || BK.cv !== cv) return;
    battleDraw();
    if (Date.now() - BK.t0 < 1200) BK.raf = requestAnimationFrame(loop); // the hit and the fall, then it holds still
  };
  loop();
}
function battleDraw() {
  const { g, F } = BK,
    t = Date.now() - BK.t0;
  g.drawImage(btBack(), 0, 0, BT_W, BT_H, 0, 0, BT_W, BT_H);
  // them, back right, on their rise: the target a step forward
  const live = F.en.map((e, i) => [e, i]).filter(([e, i]) => e.hp > 0 || (BK.hit[i] && t < 900));
  const n = Math.max(1, live.length);
  BK.spots = [];
  live.forEach(([e, i], k) => {
    const flash = BK.hit[i] && t < 450 && Math.floor(t / 75) % 2 === 0,
      sp = btSprite(e, flash),
      cx = n === 1 ? 176 : 134 + (k * 84) / Math.max(1, n - 1),
      fwd = i === F.t ? 4 : 0;
    let w = sp.man ? 36 : 56,
      h = sp.man ? 54 : 56;
    if (sp.big) (w *= 1.4), (h *= 1.4);
    const x = Math.round(cx - w / 2),
      y = Math.round(84 + fwd - h);
    BK.spots[i] = [x, y, w, h];
    g.save();
    if (e.hp <= 0) {
      // beaten: it keels over and fades
      const k2 = Math.min(1, Math.max(0, (t - 300) / 600));
      g.globalAlpha = 1 - k2;
      g.translate(cx, 84);
      g.rotate((k2 * Math.PI) / 2.2);
      g.translate(-cx, -84);
    }
    // a person is the whole chibi; a beast, the 40 x 40 around it (so it stands as big as a person)
    if (sp.man) g.drawImage(sp.c, 0, 0, 24, 36, x, y, w, h);
    else g.drawImage(sp.c, 4, 8, 48, 48, x, y, w, h);
    g.restore();
    if (e.tele && e.hp > 0) {
      g.fillStyle = '#d83a2a';
      g.fillRect(cx - 1, y - 9, 3, 6);
      g.fillRect(cx - 1, y - 2, 3, 2);
    }
  });
  // you, from behind, big, bottom left
  const me = document.createElement('canvas');
  me.width = 24;
  me.height = 36;
  me.getContext('2d').imageSmoothingEnabled = false;
  if (!BK.meC) {
    chibiDraw(me.getContext('2d'), null, 'up', 0);
    BK.meC = me;
  }
  g.drawImage(BK.meC, 26, 74, 72, 108);
}
function battleStop() {
  if (BK && BK.raf) cancelAnimationFrame(BK.raf);
  BK = null;
}
// ---- the menu: FIGHT, BAG, RUN ----
const FIGHT_RE = /^(Hit |Shoot |Look for a weak spot|Close in|Click\. No bullets|Dodge|Brace)/;
const BAG_RE = /^(Gut Glue|Snort Buzz|Throw meat|Light a flare|Throw a molotov|Switch to)/;
const BATTLE_ON = true; // v9.32: on again, in the approved art
const _fightBattle = SC.fight;
SC.fight = () => {
  if (!walkOn() || !S.fight || !BATTLE_ON) return _fightBattle();
  let v = null;
  const _show = show;
  show = x => {
    v = x;
  };
  try {
    _fightBattle();
  } finally {
    show = _show;
  }
  if (!v) return;
  if (S.scene !== 'fight' || !S.fight) return show(v); // the fight ended on the way: show what came next
  battleMenu(v);
};
function battleMenu(v) {
  const all = (v.opts || []).filter(Boolean),
    fightO = all.filter(o => FIGHT_RE.test(o[0])),
    bagO = all.filter(o => BAG_RE.test(o[0])),
    runO = all.filter(o => /^Run/.test(o[0])),
    other = all.filter(o => !fightO.includes(o) && !bagO.includes(o) && !runO.includes(o));
  const F = S.fight,
    alive = F.en.filter(e => e.hp > 0);
  const open = m => () => {
    BM = m;
    battleMenu(v);
  };
  // after any action the menu goes back to the top
  const act = o => [
    o[0],
    () => {
      BM = 'main';
      o[1]();
    },
    o[2],
  ];
  let opts;
  if (BM === 'fight')
    opts = [
      ...fightO.map(act),
      alive.length > 1
        ? [
            `Target: ${F.en[F.t].n} (tap to change)`,
            () => {
              const idx = F.en.map((e, i) => i).filter(i => F.en[i].hp > 0);
              F.t = idx[(idx.indexOf(F.t) + 1) % idx.length];
              go('fight');
            },
          ]
        : null,
      ['Back', open('main')],
    ];
  else if (BM === 'bag') opts = [...bagO.map(act), ['Back', open('main')]];
  else
    opts = [
      fightO.length ? ['FIGHT', open('fight'), 'bfight'] : null,
      bagO.length ? ['BAG', open('bag'), 'bbag'] : null,
      ...runO.map(o => [o[0].replace(/^Run/, 'RUN'), act(o)[1], 'brun']),
      ...other.map(act),
    ];
  show({ title: v.title, icon: v.icon, sub: v.sub, text: v.text, opts });
  document.body.classList.add('inbattle');
  document.body.classList.toggle('bmain', BM === 'main');
  battleArt(F);
  // each button: what it is, and under it the odds or what it does
  const HINT = { FIGHT: 'hit, or find a weak spot', BAG: 'meds, throwables, weapons', Back: '' };
  $('opts')
    .querySelectorAll('button')
    .forEach(b => {
      const n = b.querySelector('.n'),
        txt = b.textContent.replace(n ? n.textContent : '', '').trim(),
        m = txt.match(/^(.*?)\s*\(([^)]*)\)[:,.]?\s*(.*)$/),
        main = m ? m[1] : txt,
        hint = m
          ? m[1] === 'RUN'
            ? m[2] + ' to get away'
            : [m[2], m[3]].filter(Boolean).join(' · ')
          : HINT[txt] || '';
      b.innerHTML =
        (n ? n.outerHTML : '') +
        `<b>${esc(main.replace(/^RUN$/, 'RUN'))}</b>` +
        (hint ? `<small>${esc(hint)}</small>` : '');
    });
}
// Leaving the fight stops the battle screen and resets the menu.
const _goBattle = go;
go = (id, ...args) => {
  if (id !== 'fight') {
    battleStop();
    BM = 'main';
    if (typeof document !== 'undefined' && document.body) document.body.classList.remove('inbattle', 'bmain');
  }
  return _goBattle(id, ...args);
};
