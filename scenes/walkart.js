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
  // Mesa (v8.3): blocked ground is raised sandstone. Its top is lit and cracked, with a rim where it ends; where it
  // drops to walkable ground it shows a striped cliff face with a shadow at the foot. Routes read as canyon trails.
  mesa: (g, n, at) => {
    const solid = c => c === '#' || c === 'T';
    const below = at(0, 1);
    if (!solid(below)) {
      // the cliff face
      R1(g, 0, 0, 16, 16, '#9a6a44');
      for (let x = (n % 3) + 1; x < 16; x += 4) R1(g, x, 2, 1, 12, '#845838');
      for (let x = (n % 4) + 3; x < 16; x += 5) R1(g, x, 3, 1, 9, '#b07a4e');
      R1(g, 0, 0, 16, 3, '#c89a64'); // the lip of the top above it
      R1(g, 0, 3, 16, 1, '#7a5034');
      R1(g, 0, 14, 16, 2, '#5a3a24');
      if (!solid(at(-1, 0))) R1(g, 0, 0, 2, 16, '#6a4430');
      if (!solid(at(1, 0))) R1(g, 14, 0, 2, 16, '#6a4430');
      return;
    }
    // the top
    R1(g, 0, 0, 16, 16, '#c89a64');
    speck(g, n, '#b88a56', 6);
    speck(g, n + 5, '#d8aa74', 4);
    if (n % 3 === 0) {
      R1(g, ((n * 5) % 10) + 2, ((n * 3) % 9) + 3, 4, 1, '#a87a4a');
      R1(g, ((n * 5) % 10) + 5, ((n * 3) % 9) + 4, 1, 2, '#a87a4a');
    }
    // a bright rim where the top ends beside a path or the edge of a drop
    if (!solid(at(0, -1))) R1(g, 0, 0, 16, 2, '#e4bc84');
    if (!solid(at(-1, 0))) R1(g, 0, 0, 2, 16, '#dcb07a');
    if (!solid(at(1, 0))) R1(g, 14, 0, 2, 16, '#a87a4a');
    // things on top: a cactus, a boulder, bleached bones
    const k = n % 17;
    if (k === 3) {
      R1(g, 6, 3, 4, 10, GP.ink);
      R1(g, 7, 4, 2, 9, '#5a9a3a');
      R1(g, 3, 6, 3, 2, GP.ink);
      R1(g, 3, 6, 2, 4, '#5a9a3a');
      R1(g, 10, 5, 3, 2, GP.ink);
      R1(g, 11, 4, 2, 4, '#5a9a3a');
      R1(g, 7, 4, 1, 8, '#7aba5a');
      R1(g, 5, 13, 7, 1, 'rgba(60,30,10,0.3)');
    } else if (k === 8) {
      R1(g, 3, 6, 10, 7, GP.ink);
      R1(g, 4, 6, 8, 6, GP.rock);
      R1(g, 4, 6, 5, 2, GP.rockHi);
      R1(g, 3, 13, 10, 1, 'rgba(60,30,10,0.3)');
    } else if (k === 5 || k === 11) {
      // a dead tree, rooted in the rock
      R1(g, 4, 13, 9, 2, 'rgba(60,30,10,0.3)');
      R1(g, 7, 4, 3, 10, GP.ink);
      R1(g, 8, 4, 1, 10, GP.wood);
      R1(g, 3, 5, 5, 2, GP.ink);
      R1(g, 4, 5, 3, 1, GP.wood);
      R1(g, 9, 2, 5, 2, GP.ink);
      R1(g, 10, 2, 3, 1, GP.wood);
      R1(g, 3, 3, 1, 3, GP.ink);
      R1(g, 13, 0, 1, 3, GP.ink);
    } else if (k === 13) {
      R1(g, 4, 8, 6, 4, '#f4ecd8');
      R1(g, 5, 9, 1, 1, GP.ink);
      R1(g, 8, 9, 1, 1, GP.ink);
      R1(g, 10, 10, 4, 1, '#f4ecd8');
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
  // roofs: each village has its own (BPAINT, set per building while the map is painted, v8.4)
  roof: (g, n, at, t, chapel) => {
    const st = chapel ? null : BPAINT;
    const [b, hi, lo] = chapel ? [GP.chap, GP.chapHi, GP.chapLo] : st.roof;
    const me = chapel ? 'C' : 'H';
    const kind = chapel ? 'tiles' : st.roofKind;
    R1(g, 0, 0, 16, 16, b);
    if (kind === 'tin') {
      // corrugated tin: ridges, and rust coming through
      for (let x = 0; x < 16; x += 2) R1(g, x, 0, 1, 16, x % 4 ? hi : lo);
      if (n % 3 === 0) R1(g, ((n * 3) % 10) + 2, ((n * 5) % 10) + 3, 4, 3, '#a0542a');
      if (n % 4 === 1) R1(g, ((n * 7) % 10) + 1, ((n * 3) % 8) + 2, 3, 2, '#8a8a80');
    } else if (kind === 'tarp') {
      // a canvas tarp, sagging between ropes
      for (let y = 4; y < 16; y += 6) R1(g, 0, y, 16, 1, lo);
      R1(g, 3, 0, 1, 16, lo);
      R1(g, 11, 0, 1, 16, lo);
      if (n % 3 === 0) R1(g, 6, 7, 3, 3, hi);
    } else if (kind === 'slab') {
      // a flat concrete roof with a vent
      speck(g, n, lo, 6);
      if (n % 4 === 0) {
        R1(g, 5, 5, 6, 5, GP.ink);
        R1(g, 6, 6, 4, 3, '#6a6a68');
      }
    } else if (kind === 'glass') {
      // greenhouse panes
      for (let x = 0; x < 16; x += 5) R1(g, x, 0, 1, 16, lo);
      for (let y = 0; y < 16; y += 5) R1(g, 0, y, 16, 1, lo);
      R1(g, 2, 2, 2, 2, '#f0fff8');
    } else if (kind === 'neon') {
      // a dark casino roof with a string of lights
      for (let y = 0; y < 16; y += 4) R1(g, 0, y + 3, 16, 1, lo);
      for (let x = 1; x < 16; x += 4) R1(g, x, 1, 2, 2, (x + n) % 8 < 4 ? '#f8e060' : '#f05a8a');
    } else {
      // clay tiles (and, on a ruin, holes in them)
      for (let y = 0; y < 16; y += 4) {
        R1(g, 0, y + 3, 16, 1, lo);
        for (let x = (y / 4) % 2 ? 2 : 0; x < 16; x += 4) R1(g, x, y, 1, 3, lo);
        R1(g, 0, y, 16, 1, hi);
      }
      if (kind === 'ruin' && n % 2 === 0) {
        R1(g, ((n * 3) % 9) + 2, ((n * 5) % 8) + 3, 5, 4, GP.ink);
        R1(g, ((n * 3) % 9) + 3, ((n * 5) % 8) + 4, 3, 2, '#3a2a1c');
      }
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
    const st = chapel ? { wall: [GP.wall, GP.wallLo], wallKind: 'adobe', win: 'frame' } : BPAINT;
    const [wb, wl] = st.wall;
    R1(g, 0, 0, 16, 16, wb);
    if (st.wallKind === 'plank') for (let x = 1; x < 16; x += 4) R1(g, x, 0, 1, 16, wl);
    else if (st.wallKind === 'scrap') {
      R1(g, 0, 0, 7, 8, wl);
      R1(g, 9, 6, 7, 10, shadeHex(wb, 0.15));
      R1(g, 3, 9, 5, 7, shadeHex(wl, -0.1));
      for (const [x, y] of [
        [1, 1],
        [14, 7],
        [4, 14],
      ])
        R1(g, x, y, 1, 1, GP.ink); // rivets
    } else if (st.wallKind === 'concrete') {
      for (let y = 4; y < 16; y += 6) R1(g, 0, y, 16, 1, wl);
      R1(g, 8, 0, 1, 16, wl);
    } else if (st.wallKind === 'chrome') {
      R1(g, 0, 9, 16, 3, '#c8302a');
      R1(g, 0, 9, 16, 1, '#e05a4a');
    } else if (st.wallKind === 'ruin') {
      for (let y = 2; y < 16; y += 5) R1(g, 0, y, 16, 1, wl);
      R1(g, ((n * 3) % 10) + 2, 2, 1, 6, GP.ink);
      R1(g, ((n * 3) % 10) + 3, 7, 1, 4, GP.ink);
    } else for (let y = 2; y < 16; y += 5) R1(g, 0, y, 16, 1, wl);
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
    } else if (st.win === 'boarded') {
      R1(g, 3, 4, 10, 8, GP.ink);
      R1(g, 4, 5, 8, 6, '#3a2a1c');
      R1(g, 3, 6, 10, 2, GP.wood);
      R1(g, 3, 9, 10, 2, GP.woodLo);
    } else if (st.win === 'neon') {
      R1(g, 3, 4, 10, 8, GP.ink);
      R1(g, 4, 5, 8, 6, n % 2 ? '#f8e060' : '#f0a040');
      R1(g, 4, 5, 8, 1, '#fff8c0');
    } else if (st.win === 'shop') {
      R1(g, 1, 3, 14, 10, GP.ink);
      R1(g, 2, 4, 12, 8, '#7aa8c8');
      R1(g, 2, 4, 5, 3, GP.glassHi);
    } else if (st.win === 'round') {
      R1(g, 5, 4, 6, 6, GP.ink);
      R1(g, 6, 5, 4, 4, GP.glass);
      R1(g, 6, 5, 2, 2, GP.glassHi);
    } else if (!(n % 5 === 0 && st.win === 'few')) {
      // a framed window with a sill, and sometimes a shutter
      R1(g, 3, 4, 10, 8, GP.ink);
      R1(g, 4, 5, 8, 6, GP.glass);
      R1(g, 4, 5, 3, 2, GP.glassHi);
      R1(g, 7, 5, 1, 6, GP.ink);
      R1(g, 2, 12, 12, 1, GP.woodLo);
      if (n % 3 === 0) R1(g, 1, 4, 2, 8, st.door || GP.wood);
    }
  },
  door: (g, n, at) => {
    const st = BPAINT;
    R1(g, 0, 0, 16, 16, st.wall[0]);
    if (st.wallKind === 'chrome') R1(g, 0, 9, 16, 3, '#c8302a');
    R1(g, 0, 0, 16, 3, GP.shade);
    R1(g, 2, 2, 12, 14, GP.ink);
    R1(g, 3, 3, 10, 13, st.door || GP.wood);
    R1(g, 3, 3, 10, 1, shadeHex(st.door || GP.wood, 0.25));
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
  barrel: (g, n, at) => {
    sandBase(g, n);
    R1(g, 3, 14, 10, 2, GP.shade);
    R1(g, 4, 3, 8, 12, GP.ink);
    R1(g, 5, 4, 6, 10, '#8a5a30');
    R1(g, 5, 4, 2, 10, '#a87040');
    R1(g, 4, 6, 8, 1, '#5a5a58');
    R1(g, 4, 11, 8, 1, '#5a5a58');
  },
  crate: (g, n, at) => {
    sandBase(g, n);
    R1(g, 2, 14, 12, 2, GP.shade);
    R1(g, 2, 4, 12, 11, GP.ink);
    R1(g, 3, 5, 10, 9, '#b08050');
    R1(g, 3, 5, 10, 1, '#c89a64');
    R1(g, 3, 9, 10, 1, '#7a5030');
    R1(g, 7, 5, 1, 9, '#7a5030');
  },
  lamp: (g, n, at) => {
    sandBase(g, n);
    R1(g, 6, 14, 5, 2, GP.shade);
    R1(g, 7, 3, 2, 12, GP.ink);
    R1(g, 5, 1, 6, 3, GP.ink);
    R1(g, 6, 2, 4, 1, '#f8e070');
  },
  trough: (g, n, at) => {
    sandBase(g, n);
    R1(g, 1, 13, 14, 2, GP.shade);
    R1(g, 1, 7, 14, 7, GP.ink);
    R1(g, 2, 8, 12, 5, '#8a6038');
    R1(g, 2, 8, 12, 2, GP.water);
    R1(g, 3, 8, 4, 1, GP.waterHi);
  },
  pot: (g, n, at) => {
    sandBase(g, n);
    R1(g, 4, 14, 8, 2, GP.shade);
    R1(g, 4, 10, 8, 5, GP.ink);
    R1(g, 5, 11, 6, 3, '#c0642a');
    R1(g, 7, 3, 3, 8, GP.ink);
    R1(g, 8, 4, 1, 7, '#5a9a3a');
    R1(g, 5, 6, 2, 1, GP.ink);
    R1(g, 5, 5, 1, 2, '#5a9a3a');
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
  '#': 'mesa',
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
  b: 'barrel',
  k: 'crate',
  l: 'lamp',
  q: 'trough',
  u: 'pot',
};
for (const k of 'bklqu') TILEDEF[k] = TILEDEF[k] || {}; // props: they block, like walls
for (const k in GMAP) {
  if (!TILEDEF[k]) continue;
  const f = GTILE[GMAP[k]],
    chapel = k === 'C' || k === 'c';
  TILEDEF[k].draw = (g, x, y, n, at, t) => f(g, n, at || (() => '.'), t, chapel);
}
// ---- each village's buildings (v8.4, Will: "the houses in the villages should also be unique") ----
// roof: a list of [base, light, dark] to pick from per building; wall: [base, line]; door colour; window kind.
const VSTYLE = {
  scrapwell: {
    roofKind: 'tin',
    roof: [
      ['#9a9a90', '#b8b8b0', '#6a6a64'],
      ['#8a7a6a', '#a89888', '#5a4a3c'],
      ['#a08a70', '#c0a888', '#6a5a48'],
    ],
    wallKind: 'plank',
    wall: [
      ['#c8a878', '#a8885a'],
      ['#b8986a', '#98784a'],
    ],
    door: ['#6a4a2a', '#4a6a4a'],
    win: 'few',
  },
  rustwater: {
    roofKind: 'tiles',
    roof: [
      ['#c4583a', '#e07a52', '#8a3826'],
      ['#3a8a8a', '#5aaaaa', '#2a6060'],
      ['#c8962a', '#e0b04a', '#8a6418'],
      ['#8a4a6a', '#aa6a8a', '#5a2a48'],
    ],
    wallKind: 'adobe',
    wall: [
      ['#e8cfa4', '#c0a078'],
      ['#e0bc90', '#b89468'],
      ['#f0dcb8', '#c8b08a'],
    ],
    door: ['#946234', '#2a6a8a', '#8a2a2a'],
    win: 'frame',
  },
  farm: {
    roofKind: 'tiles',
    roof: [['#8a5a3a', '#aa7a4a', '#5a3a24']],
    wallKind: 'plank',
    wall: [
      ['#c04a30', '#902e1c'],
      ['#d8b888', '#b09060'],
    ],
    door: ['#f0e0c0'],
    win: 'frame',
  },
  diner: {
    roofKind: 'slab',
    roof: [['#c8d4e8', '#e4ecf4', '#9aa8c0']],
    wallKind: 'chrome',
    wall: [['#f4f0e8', '#c8c0b0']],
    door: ['#c8302a'],
    win: 'shop',
  },
  chainfield: {
    roofKind: 'tarp',
    roof: [
      ['#7a8a5a', '#9aaa7a', '#4a5a3a'],
      ['#9a8a6a', '#b8a888', '#6a5a40'],
    ],
    wallKind: 'scrap',
    wall: [['#8a8a88', '#6a6a68']],
    door: ['#5a4a3a'],
    win: 'boarded',
  },
  snakeeyes: {
    roofKind: 'neon',
    roof: [['#3a2a4a', '#5a4a6a', '#1a1028']],
    wallKind: 'adobe',
    wall: [['#7a3a6a', '#5a2a4a']],
    door: ['#d8a020'],
    win: 'neon',
  },
  mall: {
    roofKind: 'slab',
    roof: [['#a8a8a0', '#c8c8c0', '#7a7a74']],
    wallKind: 'concrete',
    wall: [['#b8b0a0', '#8a8478']],
    door: ['#4a6a8a'],
    win: 'shop',
  },
  green: {
    roofKind: 'glass',
    roof: [['#a8dcc8', '#d8f4e8', '#6aa890']],
    wallKind: 'plank',
    wall: [['#c8b890', '#a89870']],
    door: ['#4a8a3a'],
    win: 'round',
  },
  skybus: {
    roofKind: 'slab',
    roof: [['#d8d8d0', '#f0f0e8', '#a8a8a0']],
    wallKind: 'concrete',
    wall: [['#d0d0c8', '#a8a8a0']],
    door: ['#8a3a2a'],
    win: 'round',
  },
  silo: {
    roofKind: 'slab',
    roof: [['#8a8a84', '#a8a8a0', '#5a5a56']],
    wallKind: 'concrete',
    wall: [['#9a9a92', '#6a6a64']],
    door: ['#d8c020'],
    win: 'boarded',
  },
  ruin: {
    roofKind: 'ruin',
    roof: [
      ['#8a5a44', '#a87a5a', '#5a3a2a'],
      ['#7a7a70', '#9a9a90', '#4a4a44'],
    ],
    wallKind: 'ruin',
    wall: [['#b8a890', '#8a7a64']],
    door: ['#4a3a2a'],
    win: 'boarded',
  },
};
['gristmill', 'saltpan', 'kettle', 'fanghill'].forEach(k => (VSTYLE[k] = VSTYLE.ruin));
VSTYLE.gully = VSTYLE.scrapwell; // the hunters' lean-to
const PROPS = {
  scrapwell: 'bkuk',
  rustwater: 'qlbu',
  farm: 'kbk',
  diner: 'bkl',
  chainfield: 'kbk',
  snakeeyes: 'llb',
  mall: 'kl',
  green: 'uu',
  skybus: 'kb',
  ruin: 'kb',
};
// the style for one building (by its number in the place), and the one in use while a building is painted
function villageStyle(loc, i) {
  const V = VSTYLE[loc] || VSTYLE.rustwater,
    pickOf = a => a[i % a.length];
  return {
    roofKind: V.roofKind,
    roof: pickOf(V.roof),
    wallKind: V.wallKind,
    wall: pickOf(V.wall),
    door: pickOf(V.door),
    win: V.win,
  };
}
let BPAINT = villageStyle('rustwater', 0);
// Things against the walls of a place: on the ground right below a wall, never below a door, never where somebody
// stands or where you come in. They block, like walls do.
function decorate(rows, loc, keepFree) {
  const set = PROPS[loc] || (VSTYLE[loc] === VSTYLE.ruin ? PROPS.ruin : 'kb');
  const g = rows.map(r => [...r]);
  for (let y = 1; y < g.length - 1; y++)
    for (let x = 1; x < g[0].length - 1; x++) {
      if (g[y][x] !== '.' || g[y - 1][x] !== 'h' || keepFree.has(x + ',' + y)) continue;
      const h = (x * 37 + y * 101 + loc.length * 7) % 100;
      if (h < 45) g[y][x] = set[h % set.length];
    }
  return g.map(r => r.join(''));
}
// ---- people: 16 wide and 24 tall, outlined, shaded, three steps ----
function drawWalkerGBA(g, ox, oy, look, dir, step) {
  // v8.3: rounder heads, their own hair and hats, dresses and robes, aprons and coats, boots, and what they carry.
  const P = (x, y, w, h, c) => R1(g, ox + x, oy + y - 8, w, h, c);
  const dark = c => shadeHex(c, -0.35),
    lite = c => shadeHex(c, 0.25),
    has = k => (look.add || []).includes(k);
  // shadow on the ground
  g.fillStyle = 'rgba(40,20,10,0.3)';
  g.beginPath();
  g.ellipse(ox + 8, oy + 15, 6, 2.2, 0, 0, Math.PI * 2);
  g.fill();
  if (look.beast) {
    // a pig, or another animal: a round body, a snout, little legs
    const b = look.body;
    P(2, 13, 12, 9, GP.ink);
    P(3, 14, 10, 7, b);
    P(3, 14, 10, 2, lite(b));
    P(dir === 'l' ? 0 : 11, 12, 5, 6, GP.ink);
    P(dir === 'l' ? 1 : 12, 13, 3, 4, b);
    P(dir === 'l' ? 0 : 14, 15, 2, 2, dark(b));
    P(dir === 'l' ? 2 : 13, 13, 1, 1, GP.ink);
    P(4, 21, 2, 2 - (step % 2), GP.ink);
    P(10, 21, 2, 1 + (step % 2), GP.ink);
    return;
  }
  const big = look.body === 'big',
    woman = look.body === 'woman',
    w0 = big ? 2 : 3,
    bw = big ? 12 : woman ? 9 : 10; // body width
  const s = step,
    lift = s ? 1 : 0,
    side = dir === 'l' || dir === 'r';
  const long = has('robe') || has('coat') || woman;
  // legs and boots (hidden under a robe)
  if (!has('robe')) {
    const lx = s === 1 ? -1 : 0,
      rx = s === 2 ? 1 : 0;
    if (side) {
      P(5 + lx, 17, 3, 6, GP.ink);
      P(8 + rx, 17, 3, 6, GP.ink);
      P(6 + lx, 17, 1, 4, look.legs);
      P(9 + rx, 17, 1, 4, dark(look.legs));
    } else {
      P(4, 17, 4, 6 - (s === 1 ? 1 : 0), GP.ink);
      P(8, 17, 4, 6 - (s === 2 ? 1 : 0), GP.ink);
      P(5, 17, 2, 4 - (s === 1 ? 1 : 0), look.legs);
      P(9, 17, 2, 4 - (s === 2 ? 1 : 0), dark(look.legs));
    }
  }
  // the body, rounded at the shoulders
  const bx = 8 - Math.round(bw / 2);
  P(bx, 10, bw, long ? 12 : 8, GP.ink);
  P(bx + 1, 9, bw - 2, 1, GP.ink);
  P(bx + 1, 11, bw - 2, long ? 10 : 6, look.shirt);
  P(bx + 1, 11, 3, long ? 10 : 6, lite(look.shirt));
  P(bx + bw - 3, 11, 2, long ? 10 : 6, dark(look.shirt));
  if (woman && !has('robe')) {
    // a skirt that flares, swaying as she walks
    P(bx, 17, bw, 4, GP.ink);
    P(bx - 1 + (s === 1 ? -1 : s === 2 ? 1 : 0), 19, bw + 2, 2, GP.ink);
    P(bx + 1, 17, bw - 2, 3, look.extra || look.shirt);
  }
  if (!woman && !long) P(bx + 1, 16, bw - 2, 1, GP.woodLo); // a belt
  if (has('apron') && dir !== 'u') {
    P(bx + 2, 12, bw - 4, 8, '#f0ead8');
    P(bx + 2, 12, bw - 4, 1, '#d8d0b8');
    if (has('blood')) {
      P(bx + 3, 15, 2, 2, '#a8201a');
      P(bx + 5, 17, 1, 1, '#a8201a');
    }
  }
  if (has('vest') && dir !== 'u') P(bx + 1, 11, 2, 6, dark(look.shirt));
  if (has('star') && dir !== 'u') P(bx + 2, 12, 2, 2, '#f0d040');
  if (has('necklace') || has('chains')) P(bx + 2, 11, bw - 4, 1, has('chains') ? '#b0b0b8' : '#f8f4e0');
  if (has('bowtie') && dir === 'd') P(7, 10, 2, 1, '#c02020');
  if ((has('spikes') || has('spikesBig')) && !side) {
    P(bx - 1, 9, 2, 2, '#c8c8d0');
    P(bx + bw - 1, 9, 2, 2, '#c8c8d0');
  }
  if (has('backpack') && dir === 'u') P(bx + 2, 11, bw - 4, 6, '#7a5a3a');
  // arms swing with the step
  const al = s === 1 ? 1 : s === 2 ? -1 : 0;
  if (dir !== 'r') {
    P(bx - 1, 11 + al, 2, 6, GP.ink);
    P(bx - 1, 12 + al, 1, 4, look.skin);
  }
  if (dir !== 'l') {
    P(bx + bw - 1, 11 - al, 2, 6, GP.ink);
    P(bx + bw, 12 - al, 1, 4, look.skin);
  }
  // what they carry, in the right hand
  if (look.item && dir !== 'u' && dir !== 'l') {
    const hx = bx + bw + 1,
      hy = 12 - al;
    const longItem = ['hoe', 'fork', 'pick', 'longgun', 'shotgun', 'cane', 'paddle', 'torch', 'sunflower'].includes(
      look.item,
    );
    P(hx, hy - (longItem ? 6 : 1), 2, longItem ? 10 : 4, GP.ink);
    P(hx, hy - (longItem ? 5 : 0), 1, longItem ? 8 : 2, look.item === 'torch' ? '#f0a020' : GP.wood);
    if (look.item === 'torch') P(hx - 1, hy - 8, 3, 3, '#f8c040');
    if (look.item === 'sunflower') P(hx - 1, hy - 8, 4, 3, '#f0c020');
  }
  // the head: rounded, with a light side and a shadowed side
  const glow = has('glowhead');
  const skin = glow ? '#9ae05a' : look.skin;
  P(4, 1 - lift * 0, 8, 1, GP.ink);
  P(3, 2, 10, 8, GP.ink);
  P(4, 10, 8, 1, GP.ink);
  P(4, 2, 8, 8, skin);
  P(4, 2, 8, 1, lite(skin));
  P(10, 3, 2, 7, dark(skin));
  if (glow) {
    g.fillStyle = 'rgba(160,240,100,0.25)';
    g.fillRect(ox + 1, oy - 8, 14, 14);
  }
  // hair
  const bald = has('tonsure') || glow;
  if (!bald) {
    P(3, 1, 10, 3, GP.ink);
    P(4, 1, 8, 2, look.hair);
    P(4, 1, 8, 1, lite(look.hair));
    if (dir === 'u') P(4, 2, 8, 7, look.hair);
    else if (dir === 'l') P(9, 2, 3, 5, look.hair);
    else if (dir === 'r') P(4, 2, 3, 5, look.hair);
    else {
      P(4, 2, 1, 3, look.hair);
      P(11, 2, 1, 3, look.hair);
    }
    if (woman && !has('bun')) {
      // long hair down the back and the sides
      if (dir === 'u') P(4, 2, 8, 10, look.hair);
      else {
        P(3, 3, 2, 7, GP.ink);
        P(11, 3, 2, 7, GP.ink);
        P(3, 3, 1, 6, look.hair);
        P(12, 3, 1, 6, look.hair);
      }
    }
  } else if (has('tonsure')) {
    P(3, 4, 1, 3, look.hair);
    P(12, 4, 1, 3, look.hair);
  }
  if (has('bun')) {
    P(6, -2, 4, 4, GP.ink);
    P(7, -1, 2, 2, look.hair);
  }
  // the face
  if (dir === 'd') {
    P(6, 5, 1, 2, GP.ink);
    P(9, 5, 1, 2, GP.ink);
    P(6, 5, 1, 1, '#fbf8ec');
    P(9, 5, 1, 1, '#fbf8ec');
    if (has('lips') || woman) P(7, 8, 2, 1, has('lips') ? '#c02040' : dark(skin));
    else P(7, 8, 2, 1, dark(skin));
    if (woman) {
      P(5, 7, 1, 1, '#e89a8a');
      P(10, 7, 1, 1, '#e89a8a');
    }
    if (has('beard')) {
      P(4, 7, 8, 3, look.hair);
      P(7, 8, 2, 1, dark(look.hair));
    }
    if (has('gummy')) P(6, 8, 4, 1, '#f8f4e0');
  } else if (dir === 'l') {
    P(5, 5, 1, 2, GP.ink);
    if (has('beard')) P(4, 7, 4, 3, look.hair);
  } else if (dir === 'r') {
    P(10, 5, 1, 2, GP.ink);
    if (has('beard')) P(8, 7, 4, 3, look.hair);
  }
  if (has('goggles')) {
    P(3, 4, 10, 2, GP.ink);
    if (dir !== 'u') {
      P(5, 4, 2, 2, '#8ac8e0');
      P(9, 4, 2, 2, '#8ac8e0');
    }
  }
  if (has('visor')) P(3, 3, 10, 1, '#2a6a8a');
  // hats
  const hat = look.hat
    ? 'brim'
    : has('tophat')
      ? 'top'
      : has('cap')
        ? 'cap'
        : has('straw')
          ? 'straw'
          : has('hat')
            ? 'brim'
            : has('paperhat')
              ? 'paper'
              : has('crown')
                ? 'crown'
                : null;
  const hc = look.hat || '#5a4030';
  if (hat === 'brim' || hat === 'straw') {
    const c = hat === 'straw' ? '#e0c070' : hc;
    P(1, 1, 14, 2, GP.ink);
    P(2, 1, 12, 1, c);
    P(4, -2, 8, 4, GP.ink);
    P(5, -1, 6, 2, c);
    P(5, -1, 6, 1, lite(c));
  } else if (hat === 'top') {
    P(2, 1, 12, 2, GP.ink);
    P(4, -5, 8, 7, GP.ink);
    P(5, -4, 6, 5, '#2a2a2a');
    P(5, -1, 6, 1, '#a8201a');
  } else if (hat === 'cap') {
    P(3, 0, 10, 3, GP.ink);
    P(4, 0, 8, 2, look.extra || '#4a6a8a');
    if (dir === 'd') P(4, 2, 8, 1, GP.ink);
    else if (dir === 'r') P(11, 2, 3, 1, GP.ink);
    else if (dir === 'l') P(2, 2, 3, 1, GP.ink);
  } else if (hat === 'paper') {
    P(4, -2, 8, 3, GP.ink);
    P(5, -1, 6, 2, '#f8f4e0');
  } else if (hat === 'crown') {
    P(4, -2, 8, 3, GP.ink);
    P(5, -1, 6, 2, '#f0d040');
    P(5, -2, 1, 1, '#f8f4e0');
    P(7, -2, 1, 1, '#f8f4e0');
    P(10, -2, 1, 1, '#f8f4e0');
  }
  // Scrapwell coveralls: patched knees, a dust scarf, a scrap shoulder plate, and the tooth on the back
  if (look.me) {
    if (dir === 'u' || dir === 'd') {
      P(5, 19, 2, 2, look.patch);
      P(9, 19, 2, 2, look.patch);
    } else P(dir === 'l' ? 6 : 9, 19, 1, 2, look.patch);
    P(bx + 1, 10, bw - 2, 2, look.scarf);
    P(bx + 1, 10, bw - 2, 1, lite(look.scarf));
    if (dir !== 'l') {
      P(bx + bw - 2, 10, 3, 3, GP.ink);
      P(bx + bw - 1, 11, 2, 1, look.plate);
    }
    if (dir === 'u') {
      P(6, 12, 4, 3, '#fbf8ec');
      P(6, 15, 1, 1, '#fbf8ec');
      P(9, 15, 1, 1, '#fbf8ec');
      P(7, 12, 2, 1, '#e8e0c8');
    } else if (dir === 'd') P(9, 12, 2, 2, '#fbf8ec');
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
