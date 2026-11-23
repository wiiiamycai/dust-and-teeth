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
function battleArt(F) {
  const vw = $('view');
  vw.hidden = false;
  vw.innerHTML = `<div class="battle"><canvas id="bcv" width="${BW}" height="${BH}"></canvas></div>`;
  const cv = $('bcv'),
    g = cv.getContext('2d');
  g.imageSmoothingEnabled = false;
  const prev = BK && BK.hp ? BK.hp : [];
  BK = {
    cv,
    g,
    F,
    hp: F.en.map(e => e.hp),
    hit: F.en.map((e, i) => prev[i] != null && e.hp < prev[i]),
    t0: Date.now(),
  };
  // tap an enemy to target it
  cv.addEventListener('pointerdown', e => {
    const b = cv.getBoundingClientRect(),
      x = ((e.clientX - b.left) / b.width) * BW,
      y = ((e.clientY - b.top) / b.height) * BH;
    const i = (BK.spots || []).findIndex(s => s && Math.abs(x - s[0]) < 22 && y < s[1] + 4 && y > s[1] - 44);
    if (i >= 0 && F.en[i].hp > 0 && F.t !== i) {
      F.t = i;
      go('fight');
    }
  });
  const loop = () => {
    if (!BK || BK.cv !== cv) return;
    battleDraw();
    BK.raf = requestAnimationFrame(loop);
  };
  loop();
}
function infoBox(g, x, y, w, name, frac, sel, extra) {
  g.fillStyle = GP.ink;
  g.fillRect(x - 1, y - 1, w + 2, 20);
  g.fillStyle = '#fbf8ec';
  g.fillRect(x, y, w, 18);
  g.fillStyle = sel ? '#c4583a' : '#5a6a8a';
  g.fillRect(x, y, 2, 18);
  g.fillStyle = GP.ink;
  g.font = 'bold 7px monospace';
  g.fillText(name.slice(0, 18), x + 5, y + 8);
  // the health bar: green, then amber, then red
  const bw = w - 10;
  g.fillStyle = '#3a3028';
  g.fillRect(x + 5, y + 11, bw, 4);
  g.fillStyle = frac > 0.5 ? '#58b048' : frac > 0.2 ? '#e0a030' : '#d83a2a';
  g.fillRect(x + 5, y + 11, Math.round(bw * Math.max(0, frac)), 4);
  if (extra) {
    g.font = '6px monospace';
    g.fillStyle = '#6a5a4a';
    g.fillText(extra, x + w - g.measureText(extra).width - 3, y + 8);
  }
}
function battleDraw() {
  const { g, F } = BK,
    now = Date.now(),
    flash = now - BK.t0 < 450 && Math.floor((now - BK.t0) / 75) % 2 === 0;
  // ground: sand, a far ridge, and two worn patches where you and they stand
  const sky = g.createLinearGradient(0, 0, 0, 70);
  sky.addColorStop(0, '#f0d8a0');
  sky.addColorStop(1, '#e8c890');
  g.fillStyle = sky;
  g.fillRect(0, 0, BW, BH);
  g.fillStyle = '#d4b07a';
  g.fillRect(0, 48, BW, BH - 48);
  g.fillStyle = '#c8a06a';
  for (let x = 0; x < BW; x += 9) g.fillRect(x, 48 + ((x * 7) % 5), 4, 1);
  g.fillStyle = 'rgba(120,80,40,0.25)';
  g.beginPath();
  g.ellipse(170, 74, 64, 12, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(64, 134, 58, 11, 0, 0, Math.PI * 2);
  g.fill();
  // them, top right: up to three, the target a little forward
  const live = F.en.map((e, i) => [e, i]).filter(([e]) => e.hp > 0 || BK.hit[F.en.indexOf(e)]);
  const n = Math.max(1, live.length);
  BK.spots = [];
  const kn = keen();
  live.forEach(([e, i], k) => {
    const cx = n === 1 ? 172 : 128 + (k * 92) / Math.max(1, n - 1),
      by = 74 + (i === F.t ? 4 : 0);
    BK.spots[i] = [cx, by];
    const kind = kindOf(e),
      s = e.boss ? 1.9 : 1;
    const hurt = BK.hit[i] && flash;
    if (kind === 'man') {
      g.save();
      g.translate(cx - 24, by - 56);
      g.scale(3, 3);
      if (!hurt)
        drawWalkerGBA(
          g,
          0,
          8,
          e.npc ? walkerLook(e.npc) : { hair: '#3a2a1c', shirt: '#6a4a3a', legs: '#3a3028', skin: '#c8986c' },
          'd',
          0,
        );
      g.restore();
    } else drawBeast(g, kind, cx, by, s, hurt);
    if (e.tele && e.hp > 0) {
      g.fillStyle = '#d83a2a';
      g.font = 'bold 10px monospace';
      g.fillText('!', cx - 2, by - 48);
    }
  });
  // their info boxes, top left
  live.forEach(([e, i], k) => {
    const extra = kn ? `${Math.max(0, e.hp)}/${e.max}` : e.tele ? 'winding up' : '';
    infoBox(g, 4, 4 + k * 23, 104, e.n, e.hp / e.max, i === F.t, extra);
  });
  // you, bottom left, from behind
  g.save();
  g.translate(40, 82);
  g.scale(3, 3);
  drawWalkerGBA(g, 0, 8, walkerLook(null), 'u', 0);
  g.restore();
  // you: health, and under it the blue bar to your next perk, in one box
  const pb = perkBar(),
    py = pb ? BH - 37 : BH - 26;
  infoBox(g, BW - 112, py, 108, `You · ${W[S.weapon].n}`, S.hp / S.maxhp, false, `${S.hp}/${S.maxhp}`);
  if (pb) {
    g.fillStyle = GP.ink;
    g.fillRect(BW - 113, py + 18, 110, 15);
    g.fillStyle = '#fbf8ec';
    g.fillRect(BW - 112, py + 18, 108, 14);
    g.fillStyle = '#5a6a8a';
    g.fillRect(BW - 112, py + 18, 2, 14);
    g.fillStyle = '#2a3a5a';
    g.font = 'bold 6px monospace';
    g.fillText('★ ' + pb.txt, BW - 107, py + 25);
    g.fillStyle = '#3a3028';
    g.fillRect(BW - 107, py + 27, 98, 3);
    g.fillStyle = '#3a8ae0';
    g.fillRect(BW - 107, py + 27, Math.round(98 * pb.frac), 3);
  }
}
function battleStop() {
  if (BK && BK.raf) cancelAnimationFrame(BK.raf);
  BK = null;
}
// ---- the menu: FIGHT, BAG, RUN ----
const FIGHT_RE = /^(Hit |Shoot |Look for a weak spot|Close in|Click\. No bullets|Dodge|Brace)/;
const BAG_RE = /^(Gut Glue|Snort Buzz|Throw meat|Light a flare|Throw a molotov|Switch to)/;
const BATTLE_ON = false;
const _fightBattle = SC.fight;
SC.fight = () => {
  // v9.23: walking is back, but fights stay the text screen (the status bar and the moves agreed in v9.6)
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
