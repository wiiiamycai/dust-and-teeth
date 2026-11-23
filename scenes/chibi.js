'use strict';
// ================= CHIBI: the walking people, 24 x 32 (v9.16, a preview, not loaded by the game yet) =================
// Will: "thinking about trying to do the 2D one again, look at how the characters are drawn, do it in similar style".
// Big heads, small bodies, a dark outline, two or three shades lit from the top left, four ways and two steps.
// Our own designs, coloured like their portraits (scenes/portraits.js). Drawn with the portrait toolkit (PX).
//
// chibiDraw(g, id, dir, frame): id null is you. dir 'down' | 'up' | 'left' | 'right'. frame 0 stands, 1 and 2 step.
const CHIBI_W = 24,
  CHIBI_H = 32;
// Each person: skin, hair colour and style, hat, top, bottom, shoes, build, and extras.
//   hair: short bald bun long bob braid tonsure messy slick buzz curly wild bunches
//   hat: cap brim tophat straw paper visor crown military rag headset
//   wear: trousers dress robe coat shorts.  build: normal big small old
//   x (extras): beard white moustache apron star pearls bowtie tie chains spikes glasses goggles scarf collar
//               pack plate gloves blood necklace glow lash blush grey square
const CHIBI = {
  you: { skin: '#d8a878', hair: '#4a3420', hs: 'messy', top: '#c0642a', bot: '#a8541e', x: ['scarf', 'plate'] },
  elder: {
    skin: '#b48a6a',
    hair: '#b4aca0',
    hs: 'bun',
    top: '#5e4a5e',
    bot: '#4a3a4a',
    wear: 'dress',
    build: 'old',
    x: ['lash', 'shawl'],
    hold: 'cane',
  },
  gus: {
    skin: '#a8765a',
    hair: '#3a2a1c',
    hs: 'short',
    hat: 'cap',
    hatc: '#4a4034',
    top: '#6a5a3a',
    bot: '#4a4034',
    build: 'big',
    x: ['beard'],
    hold: 'pick',
  },
  crumb: {
    skin: '#c8a080',
    hair: '#6a4a30',
    hs: 'tonsure',
    top: '#6a4a30',
    wear: 'robe',
    x: ['blush'],
    hold: 'toaster',
  },
  pell: {
    skin: '#b48a6a',
    hair: '#d8d0c0',
    hs: 'bald',
    top: '#7a6a4a',
    bot: '#5a4a34',
    build: 'old',
    x: ['white', 'apron'],
    apron: '#9a8c70',
    hold: 'fork',
  },
  pig: { pig: 1 },
  nigel: { skin: '#9ad070', hair: '#9ad070', hs: 'bald', top: '#5a5a4a', bot: '#4a4a3a', x: ['glow'] },
  moe: {
    skin: '#b07a5a',
    hair: '#2a1e14',
    hs: 'bald',
    top: '#8a7a5c',
    bot: '#4a3a2a',
    build: 'big',
    x: ['beard', 'apron'],
    apron: '#c8bca0',
    hold: 'mug',
  },
  mayor: {
    skin: '#d0a088',
    hair: '#8a8478',
    hs: 'bald',
    hat: 'tophat',
    hatc: '#2a2430',
    top: '#3a3040',
    bot: '#2a2430',
    build: 'big',
    x: ['moustache', 'bowtie', 'chains'],
  },
  sheriff: {
    skin: '#b88866',
    hair: '#5a3a22',
    hs: 'braid',
    hat: 'brim',
    hatc: '#7a6040',
    top: '#8a7a5c',
    bot: '#4a5e74',
    x: ['lash', 'star', 'vest'],
    vest: '#6a5034',
  },
  doc: {
    skin: '#c09878',
    hair: '#6a6a60',
    hs: 'wild',
    top: '#5a6a6a',
    bot: '#3a3a3a',
    wear: 'coat',
    coat: '#b8b0a0',
    x: ['goggles'],
  },
  opal: {
    skin: '#c89878',
    hair: '#1e1612',
    hs: 'bun',
    top: '#7a2a34',
    bot: '#7a2a34',
    wear: 'dress',
    x: ['lash', 'pearls', 'lips'],
    hold: 'rose',
  },
  gloria: {
    skin: '#d0a080',
    hair: '#d8b060',
    hs: 'curly',
    top: '#b06a7a',
    bot: '#b06a7a',
    wear: 'dress',
    x: ['lash', 'lips', 'boa'],
  },
  jeb: {
    skin: '#a87050',
    hair: '#5a3a22',
    hs: 'short',
    hat: 'brim',
    hatc: '#8a6a48',
    top: '#7a6a4a',
    bot: '#5e4a34',
    x: ['pack', 'scarf'],
    scarf: '#a8442a',
  },
  hector: {
    skin: '#a87656',
    hair: '#6a6a60',
    hs: 'short',
    hat: 'cap',
    hatc: '#8a3a26',
    top: '#8a6a4a',
    bot: '#4a5e74',
    x: ['moustache', 'straps'],
    hold: 'shotgun',
  },
  bess: {
    skin: '#c8966e',
    hair: '#8a4a24',
    hs: 'braid',
    hat: 'straw',
    hatc: '#d8bc6a',
    top: '#6a7a4a',
    bot: '#5a4a34',
    x: ['lash', 'freckles'],
    hold: 'hoe',
  },
  bert: {
    skin: '#c89070',
    hair: '#8a4a24',
    hs: 'short',
    hat: 'cap',
    hatc: '#6a6a50',
    top: '#8a6a4a',
    bot: '#4a5e74',
    build: 'big',
    x: ['straps', 'freckles'],
  },
  lou: {
    skin: '#c89474',
    hair: '#6a5a50',
    hs: 'bun',
    top: '#7a5a6a',
    bot: '#7a5a6a',
    wear: 'dress',
    build: 'big',
    x: ['lash', 'apron', 'blood', 'blush'],
    apron: '#c8bca0',
    hold: 'ladle',
  },
  junior: {
    skin: '#c89474',
    hair: '#c8a060',
    hs: 'buzz',
    top: '#9a8c74',
    bot: '#5a4a3a',
    build: 'big',
    x: ['apron', 'blood'],
    apron: '#c8bca0',
    hold: 'cleaver',
  },
  pete: {
    skin: '#a88466',
    hair: '#5a3a22',
    hs: 'messy',
    top: '#6a5a44',
    bot: '#4a3a2a',
    build: 'small',
    x: ['beard', 'rags'],
  },
  krug: {
    skin: '#b08a68',
    hair: '#2a1e14',
    hs: 'bald',
    top: '#5a3a24',
    bot: '#3e3428',
    build: 'big',
    x: ['goatee', 'glasses', 'chains', 'spikes'],
  },
  teo: {
    skin: '#a07a5a',
    hair: '#d8d0c0',
    hs: 'bald',
    top: '#6a5e4a',
    bot: '#4a4034',
    build: 'old',
    x: ['white', 'collar'],
    hold: 'cane',
  },
  pips: {
    skin: '#c8a080',
    hair: '#1e1612',
    hs: 'slick',
    top: '#2a2430',
    bot: '#2a2430',
    x: ['moustache', 'bowtie', 'shirt'],
  },
  dice: {
    skin: '#c89a7a',
    hair: '#8a2e24',
    hs: 'bob',
    hat: 'visor',
    hatc: '#4a9a5a',
    top: '#3a5a4a',
    bot: '#2a2a2a',
    x: ['lash', 'shirt'],
  },
  tam: {
    skin: '#b07a58',
    hair: '#2a1e14',
    hs: 'buzz',
    top: '#b07a58',
    bot: '#a82a24',
    wear: 'shorts',
    build: 'big',
    x: ['gloves', 'scars'],
  },
  nan: {
    skin: '#c8a088',
    hair: '#c8c0b8',
    hs: 'bun',
    top: '#b07a8a',
    bot: '#8a5a6a',
    wear: 'dress',
    build: 'old',
    x: ['lash', 'glasses', 'pearls'],
  },
  rook: {
    skin: '#9a948a',
    hair: '#9a948a',
    hs: 'bald',
    top: '#2a262a',
    bot: '#2a262a',
    build: 'big',
    x: ['square', 'shades', 'tie'],
  },
  margie: {
    skin: '#c8a07c',
    hair: '#8a5a3a',
    hs: 'curly',
    hat: 'paper',
    hatc: '#e0d8c8',
    top: '#9a3a30',
    bot: '#3a3a40',
    x: ['lash', 'badge'],
    hold: 'book',
  },
  sprocket: {
    skin: '#b88a6a',
    hair: '#2a1e14',
    hs: 'short',
    hat: 'rag',
    hatc: '#a83a2a',
    top: '#5a5a50',
    bot: '#4a4034',
    x: ['lash', 'goggles', 'apron'],
    apron: '#6a4a30',
    hold: 'wrench',
  },
  eel: {
    skin: '#b08a6a',
    hair: '#1e2a2a',
    hs: 'long',
    top: '#2e3232',
    bot: '#2e3232',
    x: ['lash', 'goggles', 'tread'],
  },
  vane: {
    skin: '#c8b098',
    hair: '#1a1a1a',
    hs: 'slick',
    top: '#3a3a3a',
    bot: '#2a2a2a',
    wear: 'coat',
    coat: '#d0ccc0',
    x: ['grin'],
  },
  gums: {
    skin: '#a88060',
    hair: '#6a6050',
    hs: 'wild',
    top: '#4a2a24',
    bot: '#3a2a20',
    build: 'old',
    x: ['spikes', 'necklace', 'gummy'],
  },
  gardener: {
    skin: '#b48a6a',
    hair: '#d8d0c0',
    hs: 'bald',
    hat: 'straw',
    hatc: '#c8ac60',
    top: '#5e6a3a',
    bot: '#4a5030',
    build: 'old',
    x: ['white'],
    hold: 'trowel',
  },
  warden: {
    skin: '#a87a5a',
    hair: '#2a1e14',
    hs: 'short',
    hat: 'military',
    hatc: '#3a3a30',
    top: '#4a4a3a',
    bot: '#3a3a30',
    x: ['lash', 'plate'],
    plate: '#5a7a8a',
    hold: 'rifle',
  },
  moss: { skin: '#7a9a64', hair: '#3e5a32', hs: 'messy', top: '#4a5a40', bot: '#3a4434', x: ['glow', 'chain'] },
  fern: {
    skin: '#c89a72',
    hair: '#8a5a2a',
    hs: 'bunches',
    top: '#5e7a3e',
    bot: '#5e7a3e',
    wear: 'dress',
    x: ['lash', 'apron', 'freckles', 'sunburn'],
    apron: '#b8a880',
    hold: 'sunflower',
  },
  rind: { skin: '#b08466', hair: '#2a1e14', hs: 'tonsure', top: '#5a4a3a', wear: 'robe', x: ['ash'], hold: 'torch' },
  ohm: {
    skin: '#b89478',
    hair: '#8c8a80',
    hs: 'long',
    hat: 'headset',
    hatc: '#5a5a60',
    top: '#4a5e74',
    wear: 'robe',
    x: ['lash', 'goggles'],
  },
  king: {
    skin: '#c09070',
    hair: '#3a2a1c',
    hs: 'slick',
    hat: 'crown',
    hatc: '#d8b040',
    top: '#7a1e2a',
    wear: 'robe',
    x: ['necklace', 'grin'],
    hold: 'drill',
  },
};
// ---- hair, as rows 19 wide from x = 3, y = 0. o is hair. Facing you. ----
const CHIBI_HAIR = {
  short: [
    '',
    '......ooooooo',
    '....ooooooooooo',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooo.oo.oo.oo.oo',
    '..oo...........oo',
    '..oo...........oo',
    '..o.............o',
  ],
  messy: [
    '.....o...o..o',
    '....oo.ooo.oo.o',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '.oooooooooooooooo',
    '..ooooooooooooooo',
    '..oo.ooo.oo.o.ooo',
    '..oo...........oo',
    '.ooo...........oo',
    '..o.............o',
  ],
  buzz: [
    '',
    '......ooooooo',
    '....ooooooooooo',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..oo...........oo',
    '..o.............o',
  ],
  slick: [
    '',
    '......ooooooo',
    '....ooooooooooo',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooo....oo',
    '..oo...........oo',
    '..oo...........oo',
    '..o.............o',
  ],
  bald: ['', '', '', '', '', '', '', '', '..oo...........oo', '..oo...........oo', '..o.............o'],
  tonsure: [
    '',
    '',
    '',
    '',
    '',
    '..o.............o',
    '..ooo.........ooo',
    '..ooooo.....ooooo',
    '..oo...........oo',
    '..oo...........oo',
    '..o.............o',
  ],
  wild: [
    '..o..o..o..o..o..o',
    '...o.ooooooooo.o',
    '..ooooooooooooooo',
    '.ooooooooooooooooo',
    'oooooooooooooooooo',
    '.ooooooooooooooooo',
    '.ooooooooooooooooo',
    '.ooo.oo.oo.oo.oooo',
    '.ooo...........ooo',
    'o.oo...........oo.o',
    '..o.............o',
  ],
  curly: [
    '',
    '.....o.ooooo.o',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '.ooooooooooooooooo',
    '.ooooooooooooooooo',
    '.ooooooooooooooooo',
    '.oooo.ooooooo.oooo',
    '.ooo...........ooo',
    '.ooo...........ooo',
    'oooo...........oooo',
    '.ooo...........ooo',
    '.oo.............oo',
    '..o.............o',
  ],
  long: [
    '',
    '......ooooooo',
    '....ooooooooooo',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '.oooooooooooooooo',
    '.oooooooo....ooooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    'ooo.............ooo',
    '.oo.............oo',
  ],
  bob: [
    '',
    '......ooooooo',
    '....ooooooooooo',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '.oooooooooooooooo',
    '.ooooooooooooooooo',
    '.ooo...........ooo',
    '.ooo...........ooo',
    '.ooo...........ooo',
    '.ooo...........ooo',
    '.ooo...........ooo',
    '.oooo.........oooo',
  ],
  bun: [
    '',
    '......ooooooo',
    '....ooooooooooo',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooo.ooooooo',
    '..oo...........oo',
    '..oo...........oo',
    '..o.............o',
  ],
  braid: [
    '',
    '......ooooooo',
    '....ooooooooooo',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooooo....oooooo',
    '..oo...........oo',
    '..oo...........oo',
    '..o.............o',
  ],
  bunches: [
    '',
    '......ooooooo',
    '....ooooooooooo',
    '...ooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooooooooooooooo',
    '..ooo.oo.oooo.ooo',
    'oooo...........oooo',
    'oooo...........oooo',
    'ooo.............ooo',
    'oo...............oo',
  ],
};
function chibiDraw(g, id, dir, fr) {
  g.save();
  g.translate(0, 3);
  try {
    return chibiFig(g, id, dir, fr);
  } finally {
    g.restore();
  }
}
function chibiFig(g, id, dir, fr) {
  if (dir === 'right') {
    g.save();
    g.translate(CHIBI_W, 0);
    g.scale(-1, 1);
    chibiFig(g, id, 'left', fr);
    g.restore();
    return;
  }
  const s = CHIBI[id || 'you'];
  if (!s) return false;
  if (s.pig) return chibiPig(g, dir, fr);
  const X = s.x || [],
    has = k => X.includes(k),
    R = PX.ramp,
    Sk = R(s.skin),
    H = R(s.hair),
    T = R(s.top),
    B = R(s.bot || s.top),
    Sh = R(s.shoes || '#3a2a1e'),
    side = dir === 'left',
    up = dir === 'up',
    down = dir === 'down',
    wear = s.wear || 'trousers',
    big = s.build === 'big',
    small = s.build === 'small' || s.build === 'old',
    bob = fr ? -1 : 0,
    // the body's left and right edges, facing you
    bx0 = big ? 4 : small ? 7 : 6,
    bx1 = big ? 19 : small ? 16 : 17,
    old = s.build === 'old' ? 1 : 0;
  // a shadow and a glow
  PX.oval(g, 12, 27, 7, 1, 'rgba(0,0,0,0.25)');
  if (has('glow')) PX.oval(g, 12, 14, 11, 14, 'rgba(168,224,124,0.16)');
  const o = { t: 0.72, hi: 1 };
  // ---- legs and shoes ----
  if (wear !== 'robe') {
    const L = PX.mask(),
      F = PX.mask(),
      legs = wear === 'dress' ? Sk : B;
    // the legs barely show: just the feet, peeking out under the body, one tucked up on each step
    if (side) {
      const a = fr === 1 ? -1 : fr === 2 ? 1 : 0;
      F.rect(9 + a, 24, 4, 3).rect(11 - a, 24, 4, 3);
    } else {
      const l = fr === 1 ? -1 : 0,
        r = fr === 2 ? -1 : 0;
      F.rect(8, 24, 3, 3 + l).rect(13, 24, 3, 3 + r);
    }
    if (wear === 'shorts' || wear === 'dress') L.rect(9, 24, 6, 1);
    L.paint(g, Sk, o);
    F.paint(g, Sh, o);
  }
  // ---- the body ----
  const y0 = 18 + bob + old;
  const body = PX.mask();
  if (side) body.rect(8, y0, 9, 25 - y0 + (wear === 'robe' ? 1 : 0));
  else body.rect(bx0, y0, bx1 - bx0 + 1, 25 - y0 + (wear === 'robe' ? 1 : 0));
  body.cut((x, y) => y === y0 && (x === (side ? 8 : bx0) || x === (side ? 16 : bx1)));
  body.paint(g, T, o);
  // trousers up to the belt, a skirt, a long coat
  if (wear === 'trousers' || wear === 'shorts')
    PX.mask()
      .rect(side ? 8 : bx0, 22 + bob, side ? 9 : bx1 - bx0 + 1, 3 - bob)
      .paint(g, B, o);
  if (wear === 'dress')
    PX.mask()
      .trap(22 + bob, 25, side ? 8 : bx0, side ? 16 : bx1, side ? 7 : bx0 - 1, side ? 17 : bx1 + 1)
      .paint(g, B, o);
  if (wear === 'robe') {
    PX.mask()
      .trap(19 + bob, 25, side ? 8 : bx0, side ? 16 : bx1, side ? 6 : bx0 - 2, side ? 18 : bx1 + 2)
      .paint(g, T, o);
    PX.r(g, side ? 7 : 9, 26, 3, 1, Sh.o);
    PX.r(g, side ? 11 : 13, 26, 3, 1, Sh.o);
  }
  if (wear === 'coat') {
    const C = R(s.coat);
    if (side)
      PX.mask()
        .rect(9, y0, 8, 25 - y0)
        .paint(g, C, o);
    else {
      PX.mask()
        .rect(bx0, y0, 4, 25 - y0)
        .paint(g, C, o);
      PX.mask()
        .rect(bx1 - 3, y0, 4, 25 - y0)
        .paint(g, C, o);
    }
  }
  // ---- what they wear on top ----
  if (!side && !up) {
    if (has('shirt'))
      PX.mask()
        .trap(y0, y0 + 4, 10, 13, 11, 12)
        .paint(g, R('#d8d0c0'), { line: false });
    if (has('vest')) {
      const V = R(s.vest);
      PX.mask()
        .rect(bx0, y0 + 1, 3, 25 - y0)
        .paint(g, V, o);
      PX.mask()
        .rect(bx1 - 2, y0 + 1, 3, 25 - y0)
        .paint(g, V, o);
    }
    if (has('apron')) {
      const A = R(s.apron);
      PX.mask()
        .rect(9, y0 + 2, 6, 27 - y0 - 1)
        .paint(g, A, o);
      PX.r(g, 9, y0, 1, 2, A.o);
      PX.r(g, 14, y0, 1, 2, A.o);
      if (has('blood'))
        [
          [10, y0 + 4],
          [12, y0 + 6],
          [13, y0 + 5],
        ].forEach(([x, y]) => PX.p(g, x, y, '#8a2a24'));
    }
    if (has('straps')) {
      PX.r(g, 9, y0, 1, 6, B.d);
      PX.r(g, 14, y0, 1, 6, B.d);
      PX.mask()
        .rect(8, y0 + 5, 8, 26 - y0 - 5)
        .paint(g, B, o);
    }
    if (has('plate'))
      PX.mask()
        .rect(8, y0 + 1, 8, 6)
        .paint(g, R(s.plate || '#9aa0a8'), o);
    if (has('star')) PX.rows(g, bx0 + 3, y0 + 2, ['.a.', 'aaa', '.a.'], { a: '#e8c040' });
    if (has('badge')) PX.r(g, bx1 - 4, y0 + 2, 3, 2, '#d8b040');
    if (has('pearls')) [9, 11, 13, 15].forEach(x => PX.p(g, x, y0 + 1, '#f0ece0'));
    if (has('necklace')) [8, 10, 12, 14, 16].forEach((x, i) => PX.p(g, x, y0 + 1 + (i === 2 ? 1 : 0), '#f0e8d0'));
    if (has('bowtie')) PX.rows(g, 10, y0, ['aa.aa', '.aaa.'], { a: '#8a1a2a' });
    if (has('tie')) PX.r(g, 11, y0, 2, 6, '#1a1a1a');
    if (has('chains')) for (let i = 0; i < 8; i++) PX.p(g, bx0 + 1 + i, y0 + 2 + (i >> 1), '#a8a8a8');
    if (has('scarf'))
      PX.mask()
        .rect(8, y0 - 1, 8, 2)
        .paint(g, R(s.scarf || '#c8302a'), o);
    if (has('collar')) PX.r(g, 9, y0, 6, 1, '#6a6a6a');
    if (has('boa'))
      PX.mask()
        .rect(bx0 - 1, y0, bx1 - bx0 + 3, 2)
        .paint(g, R('#d870a0'), o);
    if (has('shawl'))
      PX.mask()
        .trap(y0, y0 + 3, bx0, bx1, bx0 - 1, bx1 + 1)
        .paint(g, R('#6e5a6e'), o);
    if (has('tread')) for (let y = y0 + 1; y < 26; y += 2) PX.r(g, bx0 + 1, y, bx1 - bx0 - 1, 1, T.d);
    if (has('rags'))
      [
        [bx0 + 1, y0 + 3],
        [bx1 - 2, y0 + 5],
        [bx0 + 3, y0 + 6],
      ].forEach(([x, y]) => PX.p(g, x, y, T.l));
    if (has('scars')) {
      PX.p(g, 9, y0 + 3, Sk.l);
      PX.p(g, 10, y0 + 4, Sk.l);
      PX.p(g, 15, y0 + 2, Sk.l);
      PX.r(g, 12, y0 + 2, 1, 4, Sk.d);
    }
  }
  if (up && has('pack'))
    PX.mask()
      .rect(7, y0 - 1, 10, 9)
      .paint(g, R('#6a5030'), o);
  if (side && has('pack')) PX.mask().rect(15, y0, 4, 8).paint(g, R('#6a5030'), o);
  if (!up && !side && has('pack')) {
    PX.r(g, 8, y0, 1, 6, '#3a2a1a');
    PX.r(g, 15, y0, 1, 6, '#3a2a1a');
  }
  if (has('spikes') && !side) [bx0, bx1].forEach(x => PX.rows(g, x - 1, y0 - 2, ['.o.', 'ooo'], { o: '#a8a8a8' }));
  // ---- arms and hands ----
  const sleeve = wear === 'coat' ? R(s.coat) : T,
    hand = has('gloves') ? R('#a82a24') : Sk,
    arm = (x, y, w) => {
      PX.mask().rect(x, y, w, 3).paint(g, sleeve, o);
      PX.mask()
        .rect(x, y + 3, w, has('gloves') ? 3 : 2)
        .paint(g, hand, o);
    };
  if (side) arm(fr === 1 ? 10 : fr === 2 ? 13 : 11, y0 + 1, 3);
  else {
    arm(bx0 - 3, y0 + (fr === 1 ? 1 : 0), 3);
    arm(bx1 + 1, y0 + (fr === 2 ? 1 : 0), 3);
  }
  // ---- the head ----
  const hx = side ? 11 : 12,
    hy = 11 + bob + old,
    fy = hy + 2; // seen from above: the face sits low, under a big crown of hair
  const head = PX.mask();
  if (has('square'))
    head.rect(hx - 7, hy - 7, 15, 15).cut((x, y) => (x === hx - 7 || x === hx + 7) && (y === hy - 7 || y === hy + 7));
  else head.oval(hx, hy, side ? 8 : 9, 8);
  if (side) head.px(hx - 9, hy + 2);
  head.paint(g, Sk, { t: 0.74, hi: 1 });
  // hair
  if (s.hs === 'bun' || s.hs === 'braid') {
    if (s.hs === 'bun')
      PX.mask()
        .oval(side ? hx + 5 : hx, side ? hy - 7 : hy - 8, 3, 2)
        .paint(g, H, o);
  }
  const deep = r => (r.length > 7 ? [...r.slice(0, 7), r[6], r[6], r[6], r[6], ...r.slice(7)] : r),
    hm = PX.mask();
  if (up) {
    if (s.hs === 'tonsure')
      hm.rows(3, hy - 1, [
        '..o.............o',
        '..oo...........oo',
        '..ooo.........ooo',
        '..ooooooooooooooo',
        '...ooooooooooooo',
        '.....ooooooooo',
      ]);
    else if (s.hs === 'bald')
      hm.rows(3, hy, ['..o.............o', '..oo...........oo', '..ooo.........ooo', '...oo.........oo']);
    else {
      hm.oval(hx, hy, 9, 8).cut((x, y) => y > hy + 7);
      const rows = deep(CHIBI_HAIR[s.hs] || []);
      hm.rows(
        3,
        hy - 10,
        rows.map(r => r.replace(/\./g, (c, i) => (i > 1 && i < 17 ? 'o' : '.'))),
      );
    }
  } else if (side) {
    if (s.hs === 'bald' || s.hs === 'tonsure')
      hm.rows(
        hx + 1,
        hy - 2 - (s.hs === 'tonsure' ? 3 : 0),
        s.hs === 'tonsure'
          ? ['....oo', '...ooo', '..oooo', '...ooo', '...ooo', '....oo']
          : ['...ooo', '..oooo', '...ooo'],
      );
    else {
      hm.oval(hx + 1, hy, 8, 8).cut((x, y) => (x < hx + 1 && y > hy + 1) || (x < hx - 3 && y > hy - 1) || y > hy + 7);
      const long = ['long', 'curly', 'bob', 'bunches'].includes(s.hs) ? (s.hs === 'long' ? 9 : 4) : 0;
      if (long) hm.rect(hx + 2, hy, 7, long + 2);
      if (s.hs === 'messy' || s.hs === 'wild')
        hm.px(hx - 3, hy - 9)
          .px(hx + 2, hy - 9)
          .px(hx + 7, hy - 7);
    }
  } else hm.rows(3, hy - 10, deep(CHIBI_HAIR[s.hs] || []));
  hm.paint(g, H, o);
  // from the side, an ear, unless the hair hides it
  if (side && !['long', 'bob', 'curly', 'bunches'].includes(s.hs)) {
    PX.r(g, hx + 2, fy + 1, 2, 2, Sk.d);
    PX.p(g, hx + 2, fy + 1, Sk.m);
  }
  if (s.hs === 'braid')
    PX.mask()
      .rect(side ? hx + 5 : 17, hy + 4, 3, 9)
      .paint(g, H, o);
  if (s.hs === 'bun' && down)
    PX.mask()
      .oval(hx, hy - 8, 3, 2)
      .paint(g, H, o);
  // the face
  if (!up) {
    const ey = fy + 2,
      eye = (x, lash) => {
        PX.r(g, x, ey, 2, 2, '#1a1010');
        PX.p(g, x + (x < hx ? 1 : 0), ey + 1, '#3a2a28');
        if (lash) PX.p(g, x < hx ? x - 1 : x + 2, ey - 1, '#1a1010');
      };
    if (has('glow') || id === 'nigel') {
      // pale, glowing eyes
    }
    if (side) eye(hx - 6, has('lash'));
    else {
      eye(hx - 4, has('lash'));
      eye(hx + 3, has('lash'));
    }
    const mx = side ? hx - 6 : hx;
    if (has('grin')) PX.r(g, side ? mx - 1 : mx - 2, fy + 4, side ? 3 : 5, 1, '#f0ece0');
    else if (has('gummy')) PX.r(g, side ? mx - 1 : mx - 1, fy + 4, 3, 1, '#d8707a');
    else if (has('lips')) PX.r(g, side ? mx : mx - 1, fy + 4, 2, 1, '#b0303a');
    else PX.r(g, side ? mx : mx - 1, fy + 4, 2, 1, Sk.d);
    if (has('blush')) {
      PX.r(g, side ? hx - 6 : hx - 6, fy + 3, 2, 1, '#e08a7a');
      if (!side) PX.r(g, hx + 5, fy + 3, 2, 1, '#e08a7a');
    }
    if (has('freckles'))
      [
        [hx - 5, fy + 3],
        [hx - 3, fy + 4],
        [hx + 3, fy + 4],
        [hx + 5, fy + 3],
      ].forEach(([x, y]) => !(side && x > hx) && PX.p(g, x, y, '#a86a4a'));
    if (has('sunburn')) PX.r(g, side ? hx - 8 : hx - 1, fy + 3, 2, 1, '#e07a6a');
    if (has('ash')) PX.rows(g, hx - 1 - (side ? 3 : 0), fy - 4, ['.a.', 'aaa', '.a.'], { a: '#3a3430' });
    if (has('glasses') && !side)
      PX.rows(g, hx - 6, ey, ['ooooo.ooooo'.padEnd(13, '.'), 'o...ooo...o'], { o: '#c8a040' });
    if (has('shades')) PX.r(g, side ? hx - 7 : hx - 6, ey, side ? 4 : 13, 2, '#14141a');
    if (has('beard') || has('white') || has('goatee')) {
      const Bd = has('white') ? R('#d8d0c0') : H;
      const bm = PX.mask();
      if (has('goatee')) bm.rect(side ? hx - 7 : hx - 2, fy + 4, side ? 3 : 5, 4);
      else if (side) bm.rect(hx - 7, fy + 3, 7, 5).rect(hx - 6, fy + 8, 4, 1 + (has('white') ? 2 : 0));
      else
        bm.rect(hx - 6, fy + 3, 13, 4)
          .rect(hx - 5, fy + 7, 11, 1)
          .rect(hx - 3, fy + 8, 7, has('white') ? 3 : 1);
      bm.paint(g, Bd, o);
      PX.r(g, side ? hx - 7 : hx - 2, fy + 4, side ? 2 : 4, 1, '#3a1a14');
    }
    if (has('moustache')) PX.r(g, side ? hx - 8 : hx - 3, fy + 4, side ? 3 : 7, 1, H.d);
  }
  if (has('goggles') && !up) {
    PX.r(g, side ? hx - 7 : hx - 8, hy - 3, side ? 14 : 17, 1, '#3a3a30');
    if (side)
      PX.mask()
        .oval(hx - 5, hy - 3, 1, 1)
        .paint(g, R('#8ab0b0'), o);
    else {
      PX.mask()
        .oval(hx - 3, hy - 3, 1, 1)
        .paint(g, R('#8ab0b0'), o);
      PX.mask()
        .oval(hx + 3, hy - 3, 1, 1)
        .paint(g, R('#8ab0b0'), o);
    }
  }
  // ---- hats ----
  if (s.hat) chibiHat(g, s.hat, R(s.hatc), hx, hy, dir);
  // ---- what they carry, in the right hand, facing you or to the side ----
  if (s.hold && !up) chibiHold(g, s.hold, side ? 12 : bx1 + 2, y0 + 4);
  return true;
}
function chibiHat(g, k, C, hx, hy, dir) {
  const side = dir === 'left',
    up = dir === 'up',
    o = { t: 0.72, hi: 1 },
    M = () => PX.mask();
  const top = hy - 5;
  if (k === 'cap' || k === 'military') {
    M()
      .oval(hx + (side ? 1 : 0), top + 1, 9, 6)
      .cut((x, y) => y > top + 5)
      .paint(g, C, o);
    if (side)
      M()
        .rect(hx - 9, top + 5, 7, 2)
        .paint(g, C, o);
    else if (!up)
      M()
        .rect(hx - 7, top + 5, 15, 2 + (k === 'military' ? 0 : 1))
        .paint(g, C, o);
    else
      M()
        .rect(hx - 7, top + 5, 15, 1)
        .paint(g, C, o);
    if (k === 'military' && !up && !side) PX.p(g, hx, top + 2, '#c8a040');
  } else if (k === 'brim' || k === 'straw') {
    M()
      .oval(hx + (side ? 1 : 0), top, 7, 5)
      .paint(g, C, o);
    M()
      .rect(side ? hx - 10 : hx - 11, top + 4, side ? 22 : 23, 2)
      .paint(g, C, o);
    if (k === 'straw') PX.r(g, hx - 5, top + 3, 11, 1, '#8a3a2a');
    else PX.r(g, hx - 5, top + 3, 11, 1, C.d);
  } else if (k === 'tophat') {
    M()
      .rect(hx - 5, top - 6, 11, 10)
      .paint(g, C, o);
    PX.r(g, hx - 4, top + 1, 9, 1, '#8a2a2a');
    M()
      .rect(hx - 8, top + 4, 17, 2)
      .paint(g, C, o);
  } else if (k === 'paper') {
    M()
      .rows(hx - 7, top, ['.....ooooo.....', '...ooooooooo...', '.ooooooooooooo.', 'ooooooooooooooo'])
      .paint(g, C, o);
    PX.r(g, hx - 6, top + 3, 13, 1, '#c83a2a');
  } else if (k === 'visor') {
    if (!up)
      M()
        .rect(side ? hx - 9 : hx - 8, top + 5, side ? 12 : 17, 2)
        .paint(g, { o: '#1a3a1a', d: '#2a6a3a', m: '#4a9a5a', l: '#7ac88a', h: '#a8e8b0' }, o);
    PX.r(g, hx - 8, top + 4, 17, 1, '#1a1a1a');
  } else if (k === 'crown') {
    M()
      .rows(hx - 6, top - 4, ['o..o..o..o..o', 'oo.ooo.ooo.oo', 'ooooooooooooo', 'ooooooooooooo'])
      .paint(g, C, o);
    if (!up) [hx - 4, hx, hx + 4].forEach(x => PX.p(g, x, top - 1, '#f0e8d0'));
  } else if (k === 'rag') {
    M()
      .oval(hx + (side ? 1 : 0), top, 9, 5)
      .paint(g, C, o);
    if (!side)
      M()
        .rect(hx + 6, top + 1, 3, 2)
        .paint(g, C, o);
  } else if (k === 'headset') {
    PX.r(g, hx - 7, top - 3, 15, 1, C.o);
    if (!side) {
      M()
        .rect(hx - 9, hy - 1, 3, 4)
        .paint(g, C, o);
      M()
        .rect(hx + 7, hy - 1, 3, 4)
        .paint(g, C, o);
    } else
      M()
        .rect(hx + 2, hy - 1, 3, 4)
        .paint(g, C, o);
    PX.p(g, hx + 9, hy - 1, '#a8e07c');
  }
}
// small things to carry: rows of palette letters, anchored at the hand
const CHIBI_HOLD = {
  cane: [-1, -2, ['ww', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w'], { w: '#7a5434' }],
  pick: [
    -1,
    -10,
    ['.mmmmm', 'm..w..m', '...w', '...w', '...w', '...w', '...w', '...w', '...w', '...w', '...w'],
    { m: '#9a9aa0', w: '#7a5434' },
  ],
  toaster: [-3, -2, ['.mmmm.', 'mhmmmm', 'mhmmmm', 'mmmmmm'], { m: '#a8b4bc', h: '#e8f0f4' }],
  fork: [0, -6, ['m.m.m', 'mmmmm', '..m', '..m', '..m', '..m', '..m'], { m: '#b0b0b8' }],
  mug: [0, -1, ['mmm', 'yyym', 'yyym', 'yyy'], { m: '#e8e0c0', y: '#c89a30' }],
  rose: [0, -4, ['rr', 'rR', '.g', '.g'], { r: '#d83040', R: '#8a1a2a', g: '#4a6a3a' }],
  shotgun: [-2, -6, ['..mm', '..mm', '..mm', '..mm', '.ww', '.ww', 'ww', 'ww'], { m: '#5a5a60', w: '#7a4a2a' }],
  hoe: [
    0,
    -14,
    ['mmmm', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w', '.w'],
    { m: '#9a9aa0', w: '#8a5a30' },
  ],
  ladle: [0, -9, ['mmm', 'mMm', '.m', '.m', '.m', '.m', '.m', '.m', '.m', '.m'], { m: '#a0a0a8', M: '#6a6a70' }],
  cleaver: [0, -6, ['mmmm', 'mmmm', 'mmmm', 'mmmr', '..w', '..w'], { m: '#b0b0b8', r: '#8a2a24', w: '#5a3a24' }],
  book: [-2, -2, ['rrrr', 'ryyr', 'rrrr', 'rrrr'], { r: '#a82a2a', y: '#d8b040' }],
  wrench: [0, -5, ['m.m', 'mmm', '.m', '.m', '.m'], { m: '#a0a0a8' }],
  trowel: [0, -4, ['mm', 'mm', '.w', '.w'], { m: '#9a9a90', w: '#7a5434' }],
  rifle: [-1, -10, ['.m', '.m', '.m', '.m', 'mm', 'ww', 'ww', 'ww', 'ww', '.w'], { m: '#5a5a60', w: '#5a3a24' }],
  sunflower: [
    -1,
    -9,
    ['.yyy.', 'yybyy', 'ybbby', 'yybyy', '.yyy.', '..g', '..g', '..g', '..g'],
    { y: '#e8c030', b: '#5a3a1a', g: '#4a7a34' },
  ],
  torch: [0, -8, ['.r', 'ry', 'rr', '.w', '.w', '.w', '.w', '.w'], { r: '#e8602a', y: '#f8d060', w: '#6a4a2a' }],
  drill: [-1, -5, ['..m', '..m', 'mmmm', 'mmmm', '.ww', '.ww'], { m: '#a8a8b0', w: '#3a3a3a' }],
};
function chibiHold(g, k, x, y) {
  const h = CHIBI_HOLD[k];
  if (h) PX.rows(g, x + h[0], y + h[1], h[2], h[3]);
}
// Bacon Prime walks on four legs
function chibiPig(g, dir, fr) {
  const P = PX.ramp('#d8968a'),
    o = { t: 0.72, hi: 1 },
    st = fr === 1 ? 1 : fr === 2 ? -1 : 0;
  PX.oval(g, 12, 30, 8, 1, 'rgba(0,0,0,0.25)');
  if (dir === 'left') {
    PX.mask()
      .rect(6 + st, 25, 3, 5)
      .rect(15 - st, 25, 3, 5)
      .paint(g, P, o);
    PX.mask().oval(13, 21, 9, 6).paint(g, P, o);
    PX.mask().oval(5, 19, 5, 5).paint(g, P, o);
    PX.mask().oval(1, 20, 2, 2).paint(g, R2(), o);
    PX.mask().rows(5, 12, ['oo', 'ooo', '.oo']).paint(g, P, o);
    PX.r(g, 3, 18, 1, 1, '#1a1010');
    PX.p(g, 22, 17, P.d);
    PX.p(g, 23, 16, P.d);
  } else {
    PX.mask()
      .rect(6, 25, 3, 5 - (st > 0 ? 1 : 0))
      .rect(15, 25, 3, 5 - (st < 0 ? 1 : 0))
      .paint(g, P, o);
    PX.mask().oval(12, 21, 9, 6).paint(g, P, o);
    if (dir === 'down') {
      PX.mask().oval(12, 18, 7, 6).paint(g, P, o);
      PX.mask().rows(4, 11, ['oo', 'ooo', '.ooo']).paint(g, P, o);
      PX.mask().rows(17, 11, ['..oo', '.ooo', 'ooo.']).paint(g, P, o);
      PX.mask().oval(12, 21, 3, 2).paint(g, R2(), o);
      PX.p(g, 11, 21, '#5a2a2a');
      PX.p(g, 13, 21, '#5a2a2a');
      PX.r(g, 9, 17, 1, 1, '#1a1010');
      PX.r(g, 15, 17, 1, 1, '#1a1010');
      // the monocle
      PX.r(g, 14, 16, 3, 1, '#d8b050');
      PX.r(g, 14, 18, 3, 1, '#d8b050');
      PX.p(g, 14, 17, '#d8b050');
      PX.p(g, 16, 17, '#d8b050');
    } else {
      PX.rows(g, 11, 14, ['.a.', 'a.a', '..a'], { a: P.d });
    }
  }
  function R2() {
    return PX.ramp('#e0a89a');
  }
  return true;
}
