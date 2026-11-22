'use strict';
// ================= DATA: PIXEL PORTRAITS =================
// Every sprite is a 16 x 32 grid of letters, one letter per colour, like the maps. '.' is see-through.
// People are built from parts: a body, then layers on top (hats, beards, aprons) and what they hold.
// Colours come from ART_STYLE.md. A person can swap any colour (pal). A capital letter is the shadow of
// its small letter: if only the small one is swapped, the shadow is worked out from it.
// The outline and the light from the upper left are added in code (scenes/sprite.js), not drawn here.
// People face right. Facing left is the same sprite, mirrored. Anything with no sprite falls back to its emoji.

const SPAL = {
  s: '#c49a74', // skin
  h: '#4a3424', // hair
  z: '#3a2a1c', // beard
  c: '#8a7a5c', // shirt, dress, robe
  d: '#5a5040', // trousers
  b: '#3a2c20', // boots
  e: '#1a120c', // eyes
  v: '#6a5034', // hats, vests, coats
  x: '#d8ccb0', // pale cloth, bone, paper
  m: '#8c8a80', // metal
  w: '#8a6440', // wood
  r: '#9a3a26', // red
  a: '#ffb000', // amber
  g: '#a8e07c', // glow
  y: '#c8a040', // gold, straw, beer
  p: '#d09088', // pink
  u: '#4a5e74', // blue, glass, denim
  t: '#ece2c8', // teeth
  n: '#2a221c', // black
  l: '#7a4c2c', // leather
  f: '#5e7e3a', // leaves, felt
};
const SGLOW = 'ag'; // these never get shaded

const srep = (n, s) => Array(n).fill(s);
const sbottom = (rows, x) => ({ x: x || 0, y: 32 - rows.length, r: rows });

// ---- bodies ----
const SBODY = {
  man: {
    hand: [12, 20],
    parts: [
      {
        y: 6,
        r: [
          '......hhhh......',
          '.....hhhhhh.....',
          '.....hsssss.....',
          '.....hssese.....',
          '.....sssssS.....',
          '......sSSs......',
          '.......ss.......',
          '....cccccccc....',
          '...cccccccccc...',
          ...srep(5, '...cCccccccCc...'),
          '...sDddddddDs...',
          '...s.dddddd.s...',
          '.....dddddd.....',
          '.....dddddd.....',
          ...srep(3, '.....dddDdd.....'),
          ...srep(3, '.....dd..dd.....'),
          ...srep(2, '....bbb..bbb....'),
        ],
      },
    ],
  },
  woman: {
    hand: [12, 20],
    parts: [
      {
        y: 6,
        r: [
          '......hhhh......',
          '.....hhhhhh.....',
          '....hhsssss.....',
          '....hhssese.....',
          '....hhssssS.....',
          '....hhsSSs......',
          '....hh.ss.......',
          '....hccccccc....',
          '...cccccccccc...',
          ...srep(5, '...cCccccccCc...'),
          '...sccccccccs...',
          '...s.cccccc.s...',
          '....cccccccc....',
          '....cccccccc....',
          '....cccCcccc....',
          '...ccccCccccc...',
          '...ccccCccccc...',
          '...cCccccccCc...',
          '...CCCCCCCCCC...',
          '.....ss..ss.....',
          ...srep(2, '....bbb..bbb....'),
        ],
      },
    ],
  },
  big: {
    hand: [14, 20],
    parts: [
      {
        y: 6,
        r: [
          '.....hhhhhh.....',
          '....hhhhhhhh....',
          '....hssssss.....',
          '....hsssesse....',
          '....sssssssS....',
          '.....sSSSSs.....',
          '......ssss......',
          '..cccccccccccc..',
          '.cccccccccccccc.',
          ...srep(5, '.cC' + 'c'.repeat(10) + 'Cc.'),
          '.sD' + 'd'.repeat(10) + 'Ds.',
          '.s.' + 'd'.repeat(10) + '.s.',
          ...srep(4, '...dddddddddd...'),
          '...ddddDDdddd...',
          ...srep(3, '...dddd..dddd...'),
          ...srep(2, '..bbbbb..bbbbb..'),
        ],
      },
    ],
  },
};

// ---- layers worn on top (drawn in the order listed) ----
const SADD = {
  beard: [{ y: 10, r: ['......zzzzz.....', '......zzzzz.....', '.......zzz......'] }],
  cap: [{ y: 5, r: ['.....vvvvvv.....', '.....vvvvvvvvv..'] }],
  hat: [{ y: 3, r: ['......vvvv......', '......vvvv......', '.....vVVVVv.....', '...vvvvvvvvvv...'] }],
  straw: [{ y: 3, r: ['......yyyy......', '......yyyy......', '.....yrrrry.....', '...yyyyyyyyyy...'] }],
  tophat: [{ y: 0, r: [...srep(4, '.....nnnnnn.....'), '.....nrrrrn.....', '...nnnnnnnnnn...'] }],
  bun: [{ y: 3, r: ['.......hhh......', '......hhhhh.....'] }],
  visor: [{ y: 7, r: ['.....ffffffff...'] }],
  crown: [{ y: 3, r: ['.....y.y.y.y....', '.....yyyyyyy....', '.....yaYaYay....'] }],
  goggles: [{ y: 7, r: ['.....nuunuun....'] }],
  tonsure: [{ y: 6, r: ['......ssss......'] }],
  glowhead: [{ y: 5, r: ['......gggg......'] }],
  apron: [{ y: 14, r: srep(11, '.....xxxxxx.....') }],
  blood: [
    { y: 17, r: ['.......r........'] },
    { y: 19, r: ['......r.r.......'] },
    { y: 22, r: ['........r.......'] },
  ],
  vest: [{ y: 13, r: srep(7, '....vv....vv....') }],
  star: [{ y: 15, r: ['......a.........'] }],
  straps: [
    { y: 13, r: srep(4, '.....d....d.....') },
    { y: 17, r: srep(3, '.....dddddd.....') },
  ],
  bowtie: [{ y: 13, r: ['.......rr.......'] }],
  coat: [
    { y: 13, r: srep(7, '...vv......vv...') },
    { y: 20, r: srep(2, '...sv......vs...') },
    { y: 22, r: srep(6, '....vv....vv....') },
  ],
  backpack: [{ y: 13, r: [...srep(8, '.ll.............'), '.LL.............'] }],
  robe: [{ y: 20, r: ['...sccccccccs...', '...scccccccCs...', ...srep(7, '....cccccccc....'), '....CCCCCCCC....'] }],
  chains: [{ y: 13, r: Array.from({ length: 9 }, (_, i) => '.'.repeat(3 + i) + (i % 2 ? 'M' : 'm')) }],
  spikes: [{ y: 12, r: ['...m........m...', '...mm......mm...'] }],
  spikesBig: [{ y: 12, r: ['.m............m.', '.mm..........mm.'] }],
  necklace: [{ y: 13, r: ['....txtxtxtx....'] }],
  gloves: [{ y: 19, r: srep(3, '.rr..........rr.') }],
  lips: [{ y: 11, r: ['........r.......'] }],
  plate: [{ y: 14, r: ['....mmmmmmmm....', ...srep(5, '....muuuuuum....'), '....mmmmmmmm....'] }],
  rags: [
    { y: 16, r: ['.....n...C......'] },
    { y: 18, r: ['........C..n....'] },
    { y: 23, r: ['......n.........'] },
  ],
  chainbelt: [{ y: 20, r: ['..yyyyyyyyyyyy..'] }],
  paperhat: [{ y: 4, r: ['.....xxxxxx.....', '....xrrrrrrx....'] }],
  gummy: [{ y: 10, r: ['.......nn.......'] }],
};

// ---- things people hold, placed from the hand: dx, dy is the top left corner ----
const SITEM = {
  hoe: { dx: 0, dy: -16, r: ['.mmm', '.wM.', ...srep(24, '.w')] },
  fork: { dx: -1, dy: -17, r: ['m.m.m', 'm.m.m', 'mmmmm', ...srep(24, '..w')] },
  pick: { dx: -2, dy: -12, r: ['.mmmm.', 'm..w.m', ...srep(12, '...w')] },
  shotgun: { dx: -4, dy: -1, r: ['WWWwnnnn', 'WW......'] },
  longgun: { dx: -4, dy: -1, r: ['WWwwMnnn', 'Ww......'] },
  pistol: { dx: 0, dy: -1, r: ['nnnn', 'n...'] },
  ladle: { dx: 0, dy: -7, r: ['mMm', ...srep(6, '.m')] },
  knife: { dx: 0, dy: -4, r: ['.x', '.x', '.X', 'nn'] },
  drill: { dx: 0, dy: -2, r: ['mmm', 'mmmxx', 'mmm', '.n'] },
  syringe: { dx: 0, dy: -1, r: ['xggxM'] },
  rose: { dx: 0, dy: -4, r: ['rr', 'rR', '.f', '.f'] },
  mug: { dx: 0, dy: -2, r: ['xxx', 'yyyY', 'yyyY'] },
  cards: { dx: 0, dy: -2, r: ['x.x', 'xrx', 'xxx'] },
  dice: { dx: 0, dy: -1, r: ['xx.xx', 'xn.nx'] },
  purse: { dx: -1, dy: 1, r: ['.V.', 'vvv', 'vav', 'vvv'] },
  cane: { dx: 0, dy: -1, r: ['WW', ...srep(12, '.W')] },
  toaster: { dx: -1, dy: -4, r: ['.yy.', 'mmmm', 'mMMm', 'mmmm'] },
  wrench: { dx: 0, dy: -4, r: ['M.M', 'MMM', '.M.', '.M.'] },
  potlid: { dx: -1, dy: -2, r: ['.MM.', 'MmmM', 'MmmM', '.MM.'] },
  chain: { dx: 0, dy: 1, r: ['m', 'M', 'm', 'M', 'm', 'M', 'm', 'M'] },
  handbook: { dx: -1, dy: -3, r: ['rrrr', 'rxxr', 'rxxr', 'RRRR'] },
  flask: { dx: 0, dy: -3, r: ['.x.', 'xmx', 'xMx'] },
  trowel: { dx: 0, dy: -4, r: ['mm', 'mM', '.w', '.w'] },
  paddle: { dx: 0, dy: -10, r: [...srep(9, '.w'), 'ww', 'wW', 'WW'] },
  sunflower: { dx: 0, dy: -5, r: ['yyy', 'yny', 'yyy', '.f', '.f'] },
};

// ---- the people ----
const SNPC = {
  elder: { body: 'woman', pal: { h: '#b4aca0', c: '#5e4a5e', s: '#b48a6a' }, add: ['bun'], item: 'cane' },
  gus: {
    body: 'man',
    pal: { h: '#3a2a1c', c: '#6a5a3a', d: '#4a4034', v: '#5a4a30' },
    add: ['beard', 'cap'],
    item: 'pick',
  },
  crumb: { body: 'man', pal: { h: '#6a4a30', c: '#6a4a30' }, add: ['tonsure', 'robe'], item: 'toaster' },
  pell: {
    body: 'man',
    pal: { h: '#d8d0c0', z: '#d8d0c0', c: '#7a6a4a', x: '#9a8c70', s: '#b48a6a' },
    add: ['beard', 'apron'],
    item: 'fork',
  },
  pig: {
    parts: [
      sbottom([
        '...........pP...',
        '..pppppppppppp..',
        '.ppppppppppppep.',
        '.pppppppppppppPP',
        '.ppppppppppppptP',
        '.Ppppppppppppp..',
        '..PPPPPPPPPPPP..',
        '..pp.pp...pp.pp.',
        '..PP.PP...PP.PP.',
        '..nn.nn...nn.nn.',
      ]),
    ],
  },
  nigel: { body: 'man', pal: { h: '#a8e07c', c: '#5a5a4a', s: '#b8a07a' }, add: ['glowhead', 'rags'], glow: '#a8e07c' },
  moe: {
    body: 'big',
    pal: { h: '#2a1e14', z: '#2a1e14', c: '#8a7a5c', x: '#c8bca0' },
    add: ['apron', 'beard'],
    item: 'mug',
  },
  mayor: { body: 'big', pal: { h: '#8a8478', c: '#3a3040', d: '#2a2430' }, add: ['tophat', 'chainbelt'] },
  sheriff: {
    body: 'woman',
    pal: { h: '#5a3a22', c: '#8a7a5c', v: '#6a5034' },
    add: ['hat', 'vest', 'star'],
    item: 'pistol',
  },
  doc: { body: 'man', pal: { h: '#6a6a60', c: '#b8b0a0', v: '#c8c0b0' }, add: ['coat', 'goggles'], item: 'syringe' },
  opal: { body: 'woman', pal: { h: '#1e1612', c: '#7a2a34' }, add: ['bun', 'lips'], item: 'rose' },
  gloria: { body: 'woman', pal: { h: '#d8b060', c: '#b06a7a' }, add: ['lips'] },
  jeb: { body: 'man', pal: { h: '#5a3a22', c: '#7a6a4a', v: '#5e4a34' }, add: ['backpack', 'coat', 'hat'] },
  hector: {
    body: 'man',
    pal: { h: '#5a5a50', c: '#8a6a4a', d: '#4a5e74', v: '#7a3a26' },
    add: ['straps', 'cap'],
    item: 'shotgun',
  },
  bess: { body: 'woman', pal: { h: '#8a4a24', c: '#6a7a4a' }, add: ['straw'], item: 'hoe' },
  bert: { body: 'big', pal: { h: '#8a4a24', c: '#8a6a4a', d: '#4a5e74', v: '#6a6a50' }, add: ['cap'], item: 'wrench' },
  lou: {
    body: 'big',
    pal: { h: '#6a5a50', c: '#7a5a6a', d: '#7a5a6a', x: '#c8bca0' },
    add: ['bun', 'apron', 'blood'],
    item: 'ladle',
  },
  junior: { body: 'man', pal: { h: '#c8a060', c: '#9a8c74', x: '#c8bca0' }, add: ['apron', 'blood'], item: 'knife' },
  pete: { body: 'man', pal: { h: '#5a3a22', z: '#5a3a22', c: '#6a5a44' }, add: ['beard', 'rags'], item: 'potlid' },
  krug: {
    body: 'big',
    pal: { h: '#b08a68', s: '#b08a68', z: '#2a1e14', c: '#5a3a24', d: '#3e3428' },
    add: ['beard', 'chains', 'spikesBig'],
    item: 'chain',
  },
  teo: { body: 'man', pal: { h: '#d8d0c0', z: '#d8d0c0', c: '#6a5e4a', s: '#b48a6a' }, add: ['beard'], item: 'cane' },
  pips: {
    body: 'man',
    pal: { h: '#1e1612', c: '#c8bca0', v: '#4a2a3a', d: '#2a2430' },
    add: ['vest', 'bowtie'],
    item: 'cards',
  },
  dice: { body: 'woman', pal: { h: '#7a2a24', c: '#3a5a4a', f: '#4a8a5a' }, add: ['visor'], item: 'dice' },
  tam: { body: 'big', pal: { h: '#2a1e14', c: '#b08060', d: '#8a2a24' }, add: ['gloves'] },
  nan: { body: 'woman', pal: { h: '#c8c0b8', c: '#b07a8a', v: '#6a3a4a' }, add: ['bun'], item: 'purse' },
  rook: { body: 'big', pal: { s: '#9a948a', h: '#9a948a', c: '#242024', d: '#242024' } },
  king: { body: 'man', pal: { h: '#3a2a1c', c: '#6a1e24' }, add: ['robe', 'necklace', 'crown'], item: 'drill' },
  // ---- the Drowned Mall ----
  margie: {
    body: 'woman',
    pal: { h: '#8a5a3a', c: '#8a3a30', s: '#c8a07c' },
    add: ['paperhat', 'star'],
    item: 'handbook',
  },
  sprocket: {
    body: 'woman',
    pal: { h: '#2a1e14', c: '#5a5a50', x: '#5a4030', u: '#8aa0a0' },
    add: ['goggles', 'apron'],
    item: 'wrench',
  },
  eel: {
    body: 'woman',
    pal: { h: '#1e2a2a', c: '#2a2e2e', s: '#b08a6a', u: '#5a8a8a' },
    add: ['goggles'],
    item: 'knife',
  },
  vane: { body: 'man', pal: { h: '#1a1a1a', c: '#c8c4b8', v: '#d8d4c8', d: '#3a3a3a' }, add: ['coat'], item: 'flask' },
  gums: {
    body: 'man',
    pal: { h: '#6a6050', c: '#4a2a24', s: '#a88060' },
    add: ['gummy', 'necklace', 'spikes'],
    item: 'longgun',
  },
  // ---- the Green ----
  gardener: {
    body: 'man',
    pal: { h: '#d8d0c0', z: '#d8d0c0', c: '#5e6a3a', s: '#b48a6a' },
    add: ['beard', 'straw'],
    item: 'trowel',
  },
  warden: { body: 'woman', pal: { h: '#2a1e14', c: '#4a4a3a', v: '#3a3a30' }, add: ['plate', 'cap'], item: 'longgun' },
  moss: {
    body: 'man',
    pal: { s: '#6a8a5a', h: '#3e5a32', c: '#4a5a40', d: '#3a4434' },
    add: ['glowhead', 'rags'],
    item: 'paddle',
    glow: '#a8e07c',
  },
  fern: { body: 'woman', pal: { h: '#8a5a2a', c: '#5e7a3e', x: '#b8a880' }, add: ['apron'], item: 'sunflower' },
};
