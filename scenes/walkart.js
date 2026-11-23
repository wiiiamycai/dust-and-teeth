'use strict';
// ================= WALKING ART, GBA STYLE (v6.8) =================
// Will: "look at Pokemon GBA graphics." Our own art in that style: every shape outlined, three or four shades with
// a lit side and a shadow side, buildings as proper fronts (shingled roof, eave shadow, framed windows, a step),
// ground that blends at its edges, and taller people with an outline, a shadow and a three-step walk.
// Looks only: this replaces how tiles and people are drawn in scenes/walk.js, nothing else.
const GP = {
  ink: '#2a1e18',
  sand: '#ecd9a4',
  sandHi: '#f6e8bc',
  sandLo: '#d2bb82',
  sandDot: '#c4a870',
  path: '#c8a26a',
  pathHi: '#d8b680',
  pathLo: '#a8844e',
  scrub: '#8fae4c',
  scrubHi: '#b4cc6a',
  scrubLo: '#5c7a30',
  scrubInk: '#3c5220',
  rock: '#9c8a78',
  rockHi: '#beac98',
  rockLo: '#6c5a4c',
  water: '#4c84c4',
  waterHi: '#8cc0ec',
  waterLo: '#305c94',
  foam: '#e4f2fa',
  roof: '#c4583a',
  roofHi: '#e07a52',
  roofLo: '#8a3826',
  chap: '#7c6cb0',
  chapHi: '#9e90cc',
  chapLo: '#544880',
  wall: '#e8cfa4',
  wallHi: '#f6e4c4',
  wallLo: '#c0a078',
  wood: '#946234',
  woodHi: '#b88048',
  woodLo: '#6a4222',
  glass: '#8ccce8',
  glassHi: '#d4f0fc',
  mud: '#8c6a44',
  mudLo: '#6c4e30',
  white: '#fbf8ec',
  shade: 'rgba(60,30,10,0.22)',
};
const R1 = (g, x, y, w, h, c) => {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
};
// a seeded speckle, so ground never shimmers
const speck = (g, n, c, k) => {
  for (let i = 0; i < k; i++) R1(g, (n * (i + 1) * 37 + i * 5) % 16, (n * (i + 3) * 53 + i * 7) % 16, 1, 1, c);
};
const sandBase = (g, n) => {
  R1(g, 0, 0, 16, 16, GP.sand);
  speck(g, n, GP.sandLo, 4);
  speck(g, n + 7, GP.sandHi, 3);
  if (n % 5 === 0) {
    R1(g, ((n * 3) % 12) + 1, ((n * 5) % 12) + 2, 2, 1, GP.sandDot);
  }
};
// Edges blend: a tile looks at its neighbours (at(dx, dy) gives the neighbour's letter).
const isPath = c => c === '=' || c === 'E' || c === 'O' || c === 'P';
const blockLike = c => 'Hh#CcDT'.includes(c);
const GTILE = {
  sand: (g, n, at) => {
    sandBase(g, n);
    // a building or rock to the north casts a soft shadow onto the ground
    if (blockLike(at(0, -1)) && at(0, -1) !== 'T') R1(g, 0, 0, 16, 3, GP.shade);
  },
  path: (g, n, at) => {
    R1(g, 0, 0, 16, 16, GP.path);
    speck(g, n, GP.pathLo, 5);
    speck(g, n + 3, GP.pathHi, 3);
    // soft, uneven edges where the path meets sand
    const edge = (dx, dy, draw) => {
      if (!isPath(at(dx, dy))) draw();
    };
    const lip = (x, y, w, h) => {
      R1(g, x, y, w, h, GP.sand);
      for (let i = 0; i < Math.max(w, h); i += 3)
        R1(g, x + (w > h ? i : 0), y + (w > h ? 0 : i), w > h ? 2 : w + 1, w > h ? h + 1 : 2, GP.sandLo);
    };
    edge(0, -1, () => lip(0, 0, 16, 2));
    edge(0, 1, () => lip(0, 14, 16, 2));
    edge(-1, 0, () => lip(0, 0, 2, 16));
    edge(1, 0, () => lip(14, 0, 2, 16));
    if (blockLike(at(0, -1)) && at(0, -1) !== 'T') R1(g, 0, 0, 16, 3, GP.shade);
  },
  scrub: (g, n, at) => {
    sandBase(g, n);
    // tufts of dry grass, each with a dark outline below and a light tip
    for (let i = 0; i < 5; i++) {
      const x = ((n * (i + 2) * 17) % 12) + 1,
        y = ((n * (i + 4) * 23) % 11) + 2;
      R1(g, x, y + 3, 4, 1, GP.scrubInk);
      R1(g, x, y + 1, 1, 2, GP.scrubLo);
      R1(g, x + 1, y, 1, 3, GP.scrub);
      R1(g, x + 2, y + 1, 1, 2, GP.scrubLo);
      R1(g, x + 1, y - 1, 1, 1, GP.scrubHi);
      R1(g, x + 3, y + 1, 1, 2, GP.scrub);
    }
  },
  rock: (g, n, at) => {
    sandBase(g, n);
    // a boulder with an outline, a lit top and a shadowed foot
    R1(g, 1, 3, 14, 12, GP.ink);
    R1(g, 2, 2, 12, 1, GP.ink);
    R1(g, 2, 3, 12, 11, GP.rock);
    R1(g, 3, 3, 8, 3, GP.rockHi);
    R1(g, 2, 11, 12, 3, GP.rockLo);
    R1(g, 9, 6, 1, 4, GP.rockLo);
    R1(g, 1, 15, 14, 1, GP.shade);
  },
  tree: (g, n, at) => {
    sandBase(g, n);
    // a dead tree: outlined trunk and branches, shadow at its foot
    R1(g, 3, 14, 10, 2, GP.shade);
    R1(g, 6, 4, 4, 11, GP.ink);
    R1(g, 7, 4, 2, 11, GP.wood);
    R1(g, 7, 4, 1, 11, GP.woodHi);
    R1(g, 2, 4, 5, 3, GP.ink);
    R1(g, 3, 5, 4, 1, GP.wood);
    R1(g, 9, 1, 5, 3, GP.ink);
    R1(g, 9, 2, 4, 1, GP.wood);
    R1(g, 2, 2, 2, 3, GP.ink);
    R1(g, 12, 0, 2, 2, GP.ink);
  },
  water: (g, n, at, t) => {
    R1(g, 0, 0, 16, 16, GP.water);
    const ph = Math.floor((t || 0) / 500) % 4;
    R1(g, (n * 3 + ph * 2) % 12, 4, 4, 1, GP.waterHi);
    R1(g, ((n * 7 + ph * 3) % 12) + 2, 10, 3, 1, GP.waterHi);
    R1(g, ((n * 5) % 10) + 3, 13, 4, 1, GP.waterLo);
    // foam where it meets land
    if (at(0, -1) !== '~') R1(g, 0, 0, 16, 2, GP.foam);
    if (at(0, 1) !== '~') R1(g, 0, 14, 16, 2, GP.foam);
    if (at(-1, 0) !== '~') R1(g, 0, 0, 2, 16, GP.foam);
    if (at(1, 0) !== '~') R1(g, 14, 0, 2, 16, GP.foam);
  },
  fence: (g, n, at) => {
    sandBase(g, n);
    const L = 'f';
    R1(g, 0, 13, 16, 2, GP.shade);
    // rails join to the next fence piece
    R1(g, at(-1, 0) === L ? 0 : 3, 5, at(1, 0) === L ? 16 : 10, 3, GP.ink);
    R1(g, at(-1, 0) === L ? 0 : 3, 6, at(1, 0) === L ? 16 : 10, 1, GP.woodHi);
    R1(g, at(-1, 0) === L ? 0 : 3, 10, at(1, 0) === L ? 16 : 10, 3, GP.ink);
    R1(g, at(-1, 0) === L ? 0 : 3, 11, at(1, 0) === L ? 16 : 10, 1, GP.wood);
    R1(g, 3, 3, 4, 11, GP.ink);
    R1(g, 4, 3, 2, 10, GP.wood);
    R1(g, 4, 3, 1, 10, GP.woodHi);
    if (at(0, -1) === L || at(0, 1) === L) {
      R1(g, 3, 0, 4, 16, GP.ink);
      R1(g, 4, 0, 2, 16, GP.wood);
    }
  },
  junk: (g, n, at) => {
    sandBase(g, n);
    R1(g, 1, 13, 14, 2, GP.shade);
    R1(g, 2, 7, 12, 7, GP.ink);
    R1(g, 3, 8, 10, 5, GP.rockLo);
    R1(g, 4, 4, 7, 5, GP.ink);
    R1(g, 5, 5, 5, 3, GP.wallLo);
    R1(g, 9, 9, 3, 2, GP.rockHi);
    R1(g, 3, 10, 4, 2, GP.wood);
    R1(g, 6, 2, 2, 3, GP.ink);
  },
  mud: (g, n, at) => {
    R1(g, 0, 0, 16, 16, GP.mud);
    speck(g, n, GP.mudLo, 7);
    R1(g, ((n * 3) % 10) + 2, ((n * 7) % 10) + 3, 3, 2, GP.mudLo);
  },
  // roofs: shingle rows, a ridge where the roof starts, and an eave that overhangs the wall below
  roof: (g, n, at, t, chapel) => {
    const [b, hi, lo] = chapel ? [GP.chap, GP.chapHi, GP.chapLo] : [GP.roof, GP.roofHi, GP.roofLo];
    const me = chapel ? 'C' : 'H';
    R1(g, 0, 0, 16, 16, b);
    for (let y = 0; y < 16; y += 4) {
      R1(g, 0, y + 3, 16, 1, lo);
      for (let x = (y / 4) % 2 ? 2 : 0; x < 16; x += 4) R1(g, x, y, 1, 3, lo);
      R1(g, 0, y, 16, 1, hi);
    }
    if (at(0, -1) !== me) {
      R1(g, 0, 0, 16, 2, GP.ink);
      R1(g, 0, 2, 16, 1, hi);
    }
    if (at(-1, 0) !== me) R1(g, 0, 0, 2, 16, GP.ink);
    if (at(1, 0) !== me) R1(g, 14, 0, 2, 16, GP.ink);
    if (at(0, 1) !== me) {
      R1(g, 0, 13, 16, 1, GP.ink);
      R1(g, 0, 14, 16, 2, lo);
    }
  },
  wall: (g, n, at, t, chapel) => {
    R1(g, 0, 0, 16, 16, GP.wall);
    for (let y = 2; y < 16; y += 5) R1(g, 0, y, 16, 1, GP.wallLo);
    R1(g, 0, 0, 16, 3, GP.shade); // the eave's shadow
    if (!'hcD'.includes(at(-1, 0))) R1(g, 0, 0, 2, 16, GP.ink);
    if (!'hcD'.includes(at(1, 0))) R1(g, 14, 0, 2, 16, GP.ink);
    R1(g, 0, 15, 16, 1, GP.ink);
    if (chapel) {
      // a tall pointed window
      R1(g, 5, 3, 6, 11, GP.ink);
      R1(g, 6, 5, 4, 8, GP.chapHi);
      R1(g, 7, 4, 2, 1, GP.chapHi);
      R1(g, 6, 9, 4, 1, GP.ink);
    } else {
      // a framed window with a sill
      R1(g, 3, 4, 10, 8, GP.ink);
      R1(g, 4, 5, 8, 6, GP.glass);
      R1(g, 4, 5, 3, 2, GP.glassHi);
      R1(g, 7, 5, 1, 6, GP.ink);
      R1(g, 2, 12, 12, 1, GP.woodLo);
    }
  },
  door: (g, n, at) => {
    R1(g, 0, 0, 16, 16, GP.wall);
    R1(g, 0, 0, 16, 3, GP.shade);
    R1(g, 2, 2, 12, 14, GP.ink);
    R1(g, 3, 3, 10, 13, GP.wood);
    R1(g, 3, 3, 10, 1, GP.woodHi);
    R1(g, 7, 3, 1, 13, GP.woodLo);
    R1(g, 10, 9, 2, 2, GP.white);
    R1(g, 1, 15, 14, 1, GP.rockLo); // the step
    if (!'hcD'.includes(at(-1, 0))) R1(g, 0, 0, 1, 16, GP.ink);
    if (!'hcD'.includes(at(1, 0))) R1(g, 15, 0, 1, 16, GP.ink);
  },
  well: (g, n, at) => {
    sandBase(g, n);
    R1(g, 1, 14, 14, 2, GP.shade);
    R1(g, 1, 6, 14, 9, GP.ink);
    R1(g, 2, 7, 12, 7, GP.rock);
    R1(g, 2, 7, 12, 2, GP.rockHi);
    R1(g, 4, 8, 8, 3, GP.waterLo);
    R1(g, 2, 0, 2, 8, GP.ink);
    R1(g, 12, 0, 2, 8, GP.ink);
    R1(g, 1, 0, 14, 2, GP.ink);
    R1(g, 2, 0, 12, 1, GP.woodHi);
    R1(g, 7, 2, 2, 5, GP.ink);
    R1(g, 7, 5, 2, 2, GP.woodLo);
  },
  pump: (g, n, at) => {
    GTILE.path(g, n, at);
    R1(g, 3, 13, 10, 2, GP.shade);
    R1(g, 5, 2, 6, 12, GP.ink);
    R1(g, 6, 3, 4, 10, GP.rockLo);
    R1(g, 6, 3, 2, 10, GP.rock);
    R1(g, 2, 4, 4, 2, GP.ink);
    R1(g, 10, 1, 4, 2, GP.ink);
    R1(g, 3, 6, 2, 3, GP.waterHi);
  },
  sign: (g, n, at) => {
    sandBase(g, n);
    R1(g, 4, 14, 8, 2, GP.shade);
    R1(g, 7, 8, 2, 7, GP.ink);
    R1(g, 1, 2, 14, 8, GP.ink);
    R1(g, 2, 3, 12, 6, GP.wood);
    R1(g, 2, 3, 12, 1, GP.woodHi);
    R1(g, 4, 5, 8, 1, GP.white);
    R1(g, 4, 7, 5, 1, GP.white);
  },
  house: (g, n, at) => {
    sandBase(g, n);
    R1(g, 1, 14, 14, 2, GP.shade);
    R1(g, 1, 2, 14, 6, GP.ink);
    R1(g, 2, 3, 12, 4, GP.roof);
    R1(g, 2, 3, 12, 1, GP.roofHi);
    R1(g, 2, 8, 12, 6, GP.ink);
    R1(g, 3, 8, 10, 5, GP.wall);
    R1(g, 7, 10, 3, 3, GP.wood);
  },
};
// map letters to the new drawings
const GMAP = {
  '.': 'sand',
  p: 'sand',
  ',': 'scrub',
  '=': 'path',
  E: 'path',
  O: 'path',
  s: 'mud',
  '#': 'rock',
  T: 'tree',
  '~': 'water',
  f: 'fence',
  x: 'junk',
  H: 'roof',
  C: 'roof',
  h: 'wall',
  c: 'wall',
  D: 'door',
  W: 'well',
  P: 'pump',
  S: 'sign',
  o: 'sand',
};
for (const k in GMAP) {
  if (!TILEDEF[k]) continue;
  const f = GTILE[GMAP[k]],
    chapel = k === 'C' || k === 'c';
  TILEDEF[k].draw = (g, x, y, n, at, t) => f(g, n, at || (() => '.'), t, chapel);
}
// ---- people: 16 wide and 24 tall, outlined, shaded, three steps ----
function drawWalkerGBA(g, ox, oy, look, dir, step) {
  const P = (x, y, w, h, c) => R1(g, ox + x, oy + y - 8, w, h, c);
  const dark = c => shadeHex(c, -0.35),
    lite = c => shadeHex(c, 0.25);
  // shadow on the ground
  g.fillStyle = 'rgba(40,20,10,0.3)';
  g.beginPath();
  g.ellipse(ox + 8, oy + 15, 6, 2.2, 0, 0, Math.PI * 2);
  g.fill();
  if (look.beast) {
    const b = look.body;
    const f = dir === 'l' ? -1 : 1;
    P(2, 13, 12, 9, GP.ink);
    P(3, 14, 10, 7, b);
    P(3, 14, 10, 2, lite(b));
    P(dir === 'l' ? 0 : 11, 10, 5, 6, GP.ink);
    P(dir === 'l' ? 1 : 12, 11, 3, 4, b);
    P(dir === 'l' ? 1 : 14, 12, 1, 1, GP.ink);
    P(4, 21, 2, 2 - (step % 2), GP.ink);
    P(10, 21, 2, 1 + (step % 2), GP.ink);
    P(dir === 'l' ? 13 : 1, 15, 2, 1, dark(b));
    return f;
  }
  const s = step; // 0 stand, 1 left foot, 2 right foot
  const lift = s === 0 ? 0 : 1;
  // legs
  const lx = s === 1 ? -1 : 0,
    rx = s === 2 ? 1 : 0;
  if (dir === 'l' || dir === 'r') {
    P(5 + lx, 17, 3, 6, GP.ink);
    P(8 + rx, 17, 3, 6, GP.ink);
    P(6 + lx, 17, 1, 5, look.legs);
    P(9 + rx, 17, 1, 5, dark(look.legs));
  } else {
    P(4, 17, 4, 6 - (s === 1 ? 1 : 0), GP.ink);
    P(8, 17, 4, 6 - (s === 2 ? 1 : 0), GP.ink);
    P(5, 17, 2, 5 - (s === 1 ? 1 : 0), look.legs);
    P(9, 17, 2, 5 - (s === 2 ? 1 : 0), dark(look.legs));
  }
  // body
  P(3, 10, 10, 8, GP.ink);
  P(4, 11, 8, 6, look.shirt);
  P(4, 11, 3, 6, lite(look.shirt));
  P(10, 11, 2, 6, dark(look.shirt));
  // arms swing with the step
  const al = s === 1 ? 1 : s === 2 ? -1 : 0;
  if (dir !== 'r') {
    P(2, 11 + al, 2, 6, GP.ink);
    P(2, 12 + al, 1, 4, look.skin);
  }
  if (dir !== 'l') {
    P(12, 11 - al, 2, 6, GP.ink);
    P(13, 12 - al, 1, 4, look.skin);
  }
  // head
  P(3, 2 - lift * 0, 10, 9, GP.ink);
  P(4, 3, 8, 7, look.skin);
  P(4, 3, 8, 1, lite(look.skin));
  P(10, 4, 2, 6, dark(look.skin));
  // hair, and which way you're looking
  P(3, 1, 10, 3, GP.ink);
  P(4, 2, 8, 2, look.hair);
  P(4, 2, 8, 1, lite(look.hair));
  if (dir === 'u') P(4, 3, 8, 6, look.hair);
  else if (dir === 'l') {
    P(9, 3, 3, 4, look.hair);
    P(5, 6, 1, 2, GP.ink);
  } else if (dir === 'r') {
    P(4, 3, 3, 4, look.hair);
    P(10, 6, 1, 2, GP.ink);
  } else {
    P(4, 3, 1, 3, look.hair);
    P(11, 3, 1, 3, look.hair);
    P(6, 6, 1, 2, GP.ink);
    P(9, 6, 1, 2, GP.ink);
    P(7, 9, 2, 1, dark(look.skin));
  }
  if (look.hat) {
    P(1, 1, 14, 2, GP.ink);
    P(2, 1, 12, 1, look.hat);
    P(4, -2, 8, 4, GP.ink);
    P(5, -1, 6, 2, look.hat);
    P(5, -1, 6, 1, lite(look.hat));
  }
}
function shadeHex(c, k) {
  if (!c || c[0] !== '#' || c.length !== 7) return c;
  const n = parseInt(c.slice(1), 16);
  const ch = s => {
    const v = (n >> s) & 255;
    return Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k));
  };
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}
