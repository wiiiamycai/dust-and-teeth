'use strict';
// ================= WALKING: a scrolling top-down world, in the style of a Game Boy Color RPG =================
// Will (v6.6): walk around, the map scrolls as you go, and you find people instead of picking them from a list.
// Our own art, drawn in code. The text game underneath is unchanged: walking is a way of getting to the same
// scenes. A place with a map (data/maps.js) is walked; a place without one is the text screen, as before.
// Talking, shops and everything else open as the usual screen; Back returns you to where you stood.
// No canvas (the headless tests), or the footer switch set to text: everything plays as text, exactly as before.
const TILE = 16;
// The screen fills the phone: 11 tiles across, and as many down as the phone is tall (set when the screen opens).
let VW = 15,
  VH = 10;
const walkSize = () => {
  const w = (typeof window !== 'undefined' && window.innerWidth) || 390,
    h = (typeof window !== 'undefined' && window.innerHeight) || 844;
  VW = w < h ? 13 : 19; // a little zoomed out (v7.9), so a place fits on about one screen
  VH = Math.max(7, Math.round((VW * h) / w));
};
const WALK_KEY = 'dust_teeth_walk';
// Walking is the only mode wherever the game can draw (Will, v7.4). No canvas (the headless tests): text.
const walkOn = () => canDraw();
// ---- palette and tiles, drawn once ----
const WPAL = {
  sand: '#e8d4a0',
  sand2: '#d8c088',
  scrub: '#9aa850',
  scrub2: '#6a7a34',
  path: '#c0a068',
  path2: '#a88850',
  rock: '#8a7868',
  rock2: '#5a4a3c',
  water: '#5888b8',
  water2: '#88b8e0',
  roof: '#b05838',
  roof2: '#803a24',
  wall: '#d8b890',
  wall2: '#a88860',
  door: '#5a3820',
  chapel: '#7a6aa0',
  chapel2: '#544878',
  mud: '#8a6a44',
  ink: '#28201c',
  white: '#f8f4e0',
  wood: '#8a6038',
};
const TILEDEF = {
  '.': { walk: 1, draw: (g, x, y, n) => fill(g, WPAL.sand, n, WPAL.sand2, 5) },
  p: { walk: 1, draw: (g, x, y, n) => fill(g, WPAL.sand, n, WPAL.sand2, 5) },
  ',': {
    walk: 1,
    draw: (g, x, y, n) => {
      fill(g, WPAL.scrub, n, WPAL.scrub2, 0);
      for (let i = 0; i < 4; i++) {
        const a = (n * (i + 3) * 7) % 12,
          b = (n * (i + 5) * 11) % 12;
        px(g, a + 1, b + 2, WPAL.scrub2, 1, 3);
        px(g, a + 2, b + 1, WPAL.scrub2, 1, 3);
        px(g, a, b + 3, WPAL.scrub2, 1, 2);
      }
    },
  },
  '=': { walk: 1, draw: (g, x, y, n) => fill(g, WPAL.path, n, WPAL.path2, 6) },
  E: { walk: 1, exit: 1, draw: (g, x, y, n) => fill(g, WPAL.path, n, WPAL.path2, 6) },
  s: { walk: 1, draw: (g, x, y, n) => fill(g, WPAL.mud, n, WPAL.path2, 8) },
  '#': {
    draw: (g, x, y, n) => {
      fill(g, WPAL.rock, n, WPAL.rock2, 0);
      px(g, 2, 3, WPAL.rock2, 5, 4);
      px(g, 9, 9, WPAL.rock2, 5, 4);
      px(g, 3, 4, WPAL.sand2, 2, 1);
      px(g, 10, 10, WPAL.sand2, 2, 1);
    },
  },
  T: {
    draw: (g, x, y, n) => {
      fill(g, WPAL.sand, n, WPAL.sand2, 5);
      px(g, 7, 4, WPAL.wood, 2, 11);
      px(g, 3, 5, WPAL.wood, 4, 1);
      px(g, 9, 3, WPAL.wood, 4, 1);
      px(g, 3, 3, WPAL.wood, 1, 2);
      px(g, 12, 1, WPAL.wood, 1, 2);
    },
  },
  '~': {
    draw: (g, x, y, n) => {
      fill(g, WPAL.water, n, WPAL.water2, 0);
      px(g, (n * 3) % 10, 4, WPAL.water2, 4, 1);
      px(g, ((n * 7) % 10) + 2, 11, WPAL.water2, 4, 1);
    },
  },
  f: {
    draw: (g, x, y, n) => {
      fill(g, WPAL.sand, n, WPAL.sand2, 5);
      px(g, 0, 6, WPAL.wood, 16, 2);
      px(g, 0, 11, WPAL.wood, 16, 2);
      px(g, 2, 4, WPAL.wood, 2, 10);
      px(g, 11, 4, WPAL.wood, 2, 10);
    },
  },
  x: {
    draw: (g, x, y, n) => {
      fill(g, WPAL.sand, n, WPAL.sand2, 5);
      px(g, 2, 6, WPAL.rock2, 12, 8);
      px(g, 4, 3, WPAL.wall2, 6, 4);
      px(g, 9, 8, WPAL.rock, 4, 3);
      px(g, 3, 9, WPAL.wood, 5, 2);
    },
  },
  H: {
    draw: (g, x, y, n) => {
      px(g, 0, 0, WPAL.roof, 16, 16);
      for (let i = 0; i < 16; i += 4) px(g, 0, i + 3, WPAL.roof2, 16, 1);
    },
  },
  C: {
    draw: (g, x, y, n) => {
      px(g, 0, 0, WPAL.chapel, 16, 16);
      for (let i = 0; i < 16; i += 4) px(g, 0, i + 3, WPAL.chapel2, 16, 1);
    },
  },
  h: {
    draw: (g, x, y, n) => {
      px(g, 0, 0, WPAL.wall, 16, 16);
      px(g, 0, 15, WPAL.wall2, 16, 1);
      px(g, 4, 4, WPAL.ink, 8, 6);
      px(g, 5, 5, WPAL.water2, 6, 4);
    },
  },
  c: {
    draw: (g, x, y, n) => {
      px(g, 0, 0, WPAL.wall, 16, 16);
      px(g, 0, 15, WPAL.wall2, 16, 1);
      px(g, 6, 3, WPAL.chapel2, 4, 8);
    },
  },
  D: {
    use: 1,
    draw: (g, x, y, n) => {
      px(g, 0, 0, WPAL.wall, 16, 16);
      px(g, 3, 2, WPAL.door, 10, 14);
      px(g, 10, 9, WPAL.white, 1, 1);
    },
  },
  W: {
    use: 1,
    draw: (g, x, y, n) => {
      fill(g, WPAL.sand, n, WPAL.sand2, 5);
      px(g, 2, 4, WPAL.rock, 12, 10);
      px(g, 4, 6, WPAL.ink, 8, 6);
      px(g, 1, 1, WPAL.wood, 2, 6);
      px(g, 13, 1, WPAL.wood, 2, 6);
      px(g, 1, 1, WPAL.wood, 14, 2);
    },
  },
  P: {
    use: 1,
    draw: (g, x, y, n) => {
      fill(g, WPAL.path, n, WPAL.path2, 6);
      px(g, 5, 2, WPAL.rock2, 6, 12);
      px(g, 3, 4, WPAL.rock2, 3, 2);
      px(g, 6, 10, WPAL.water2, 4, 2);
    },
  },
  S: {
    use: 1,
    draw: (g, x, y, n) => {
      fill(g, WPAL.sand, n, WPAL.sand2, 5);
      px(g, 7, 8, WPAL.wood, 2, 7);
      px(g, 2, 2, WPAL.wood, 12, 7);
      px(g, 4, 4, WPAL.white, 8, 1);
      px(g, 4, 6, WPAL.white, 6, 1);
    },
  },
  // the valley's own tiles: a place you can walk into, and its houses
  O: { walk: 1, town: 1, draw: (g, x, y, n) => fill(g, WPAL.path, n, WPAL.path2, 6) },
  o: {
    walk: 1,
    town: 1, // the whole picture of a place is a way in, from any side (v8.2)
    draw: (g, x, y, n) => {
      fill(g, WPAL.sand, n, WPAL.sand2, 5);
      px(g, 2, 3, WPAL.roof, 12, 5);
      px(g, 3, 8, WPAL.wall, 10, 6);
      px(g, 7, 10, WPAL.door, 3, 4);
    },
  },
};
function px(g, x, y, c, w, h) {
  g.fillStyle = c;
  g.fillRect(x, y, w || 1, h || 1);
}
// A flat colour with a little speckle, seeded by the tile's position so it doesn't shimmer.
function fill(g, c, n, c2, k) {
  px(g, 0, 0, c, 16, 16);
  for (let i = 0; i < k; i++) px(g, (n * (i + 1) * 37) % 16, (n * (i + 3) * 53) % 16, c2, 1, 1);
}
// ---- people, 16 x 16, four ways, two steps. Colours from their portrait (SNPC in data/sprites.js) ----
function walkerLook(id) {
  const p = (id && typeof SNPC !== 'undefined' && SNPC[id] && SNPC[id].pal) || {};
  // You: Scrapwell coveralls, our vault suit. Rust-orange, patched at the knees, a red dust scarf, a scrap-metal
  // shoulder plate, and Scrapwell's white tooth stitched on the back.
  if (!id)
    return {
      hair: '#4a3420',
      shirt: '#c0642a',
      legs: '#a8541e',
      skin: '#d8a878',
      hat: '#6a5038',
      me: 1,
      scarf: '#c8302a',
      patch: '#d8b888',
      plate: '#9aa0a8',
    };
  if (NPC[id] && NPC[id].animal) return { beast: 1, body: p.c || '#d89a90', skin: p.s || '#e8b0a8' };
  // everyone else, from their portrait: body shape, what they wear and carry (SNPC in data/sprites.js)
  const sp = (typeof SNPC !== 'undefined' && SNPC[id]) || {};
  return {
    hair: p.h || '#3a2a1c',
    shirt: p.c || '#6a5a7a',
    legs: p.d || '#4a4034',
    skin: p.s || '#c8986c',
    body: sp.body || (NPC[id] && NPC[id].g === 'f' ? 'woman' : 'man'),
    add: sp.add || [],
    item: sp.item || null,
    extra: p.v || p.a || null,
  };
}
function drawWalker(g, ox, oy, look, dir, step) {
  const P = (x, y, c, w, h) => px(g, ox + x, oy + y, c, w, h);
  if (look.beast) {
    P(2, 7, look.body, 12, 7);
    P(dir === 'l' ? 0 : 12, 5, look.body, 4, 5);
    P(3, 14, WPAL.ink, 2, 2);
    P(11, 14, WPAL.ink, 2, 2);
    P(dir === 'l' ? 1 : 14, 6, WPAL.ink, 1, 1);
    return;
  }
  // shadow, legs (they swap as you walk), body, arms, head, hair
  P(3, 14, 'rgba(0,0,0,0.25)', 10, 2);
  const a = step ? 1 : 0;
  P(5, 11 + (dir === 'u' || dir === 'd' ? a : 0), look.legs, 2, 4 - a);
  P(9, 11 + (dir === 'u' || dir === 'd' ? 1 - a : 0), look.legs, 2, 3 + a);
  P(4, 6, look.shirt, 8, 6);
  P(3, 7 + a, look.shirt, 1, 4);
  P(12, 8 - a, look.shirt, 1, 4);
  P(5, 1, look.skin, 6, 6);
  P(4, 0, look.hair, 8, 2);
  if (dir === 'u') P(5, 1, look.hair, 6, 5);
  else if (dir === 'l') {
    P(4, 2, look.hair, 2, 3);
    P(6, 3, WPAL.ink, 1, 1);
  } else if (dir === 'r') {
    P(10, 2, look.hair, 2, 3);
    P(9, 3, WPAL.ink, 1, 1);
  } else {
    P(4, 2, look.hair, 1, 3);
    P(11, 2, look.hair, 1, 3);
    P(6, 3, WPAL.ink, 1, 1);
    P(9, 3, WPAL.ink, 1, 1);
  }
  if (look.hat) {
    P(3, 0, look.hat, 10, 1);
    P(5, -2, look.hat, 6, 2);
  }
}
// ---- the valley, drawn from LOC and ROADS ----
function valleyRows() {
  const g = [];
  for (let y = 0; y < VALLEY_H; y++) {
    let r = '';
    for (let x = 0; x < VALLEY_W; x++) {
      const edge = x < 2 || y < 2 || x >= VALLEY_W - 2 || y >= VALLEY_H - 2;
      const n = Math.sin(x * 0.31 + y * 0.17) + Math.cos(x * 0.13 - y * 0.29) + Math.sin((x + y) * 0.07);
      const h = (x * 928371 + y * 1237) % 101; // a fixed scatter of small things
      r += edge ? '#' : n > 1.1 ? ',' : n < -1.8 ? '#' : h < 2 ? 'T' : h < 3 ? 'x' : h < 7 ? ',' : '.';
    }
    g.push(r.split(''));
  }
  const vis = k => !LOC[k].sub && onMap(k);
  const set = (x, y, c) => {
    if (x > 1 && y > 1 && x < VALLEY_W - 2 && y < VALLEY_H - 2) g[y][x] = c;
  };
  // roads: a dirt path from place to place, across first and then down
  ROADS.forEach(([a, b]) => {
    if (!vis(a) || !vis(b)) return;
    let x = vx(LOC[a]),
      y = vy(LOC[a]) + 1;
    const tx = vx(LOC[b]),
      ty = vy(LOC[b]) + 1;
    while (x !== tx) {
      set(x, y, '=');
      x += Math.sign(tx - x);
    }
    while (y !== ty) {
      set(x, y, '=');
      y += Math.sign(ty - y);
    }
  });
  // the Drowned Mall sits in its own lake
  if (vis('mall')) {
    const mx = vx(LOC.mall),
      my = vy(LOC.mall);
    for (let y = my - 3; y <= my + 3; y++)
      for (let x = mx - 5; x <= mx + 5; x++)
        if (
          g[y] &&
          g[y][x] !== '=' &&
          !(Math.abs(x - mx) <= 2 && y >= my - 1 && y <= my + 3) && // never round the way in
          (x - mx) ** 2 / 25 + (y - my) ** 2 / 9 <= 1
        )
          set(x, y, '~');
  }
  // each place: a block of roofs, with its way in at the bottom middle
  for (const k in LOC) {
    if (!vis(k)) continue;
    const x = vx(LOC[k]),
      y = vy(LOC[k]);
    for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 1; dx++) set(x + dx, y + dy, 'o');
    set(x, y + 1, 'O');
    // a small dirt square round the way in, so you always come out with ground on three sides,
    // joined to the road (Will got stuck at the Mall: up walked him back in, everything else was water)
    for (let dx = -1; dx <= 1; dx++) set(x + dx, y + 2, '=');
    set(x - 1, y + 1, '=');
    set(x + 1, y + 1, '=');
    set(x, y + 3, '=');
  }
  // Routes (v8.1, Will: "where it is pointless to roam, just lock it, or add paths to places that mean something"):
  // the roads and a strip of scrub along each side are walkable; everything else is rock and dead trees.
  const keep = new Set();
  for (let y = 0; y < VALLEY_H; y++)
    for (let x = 0; x < VALLEY_W; x++)
      if (g[y][x] === '=' || g[y][x] === 'O' || g[y][x] === 'o')
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keep.add(x + dx + ',' + (y + dy));
  for (let y = 0; y < VALLEY_H; y++)
    for (let x = 0; x < VALLEY_W; x++) {
      const c = g[y][x];
      if (c === '=' || c === 'O' || c === 'o' || c === '~') continue;
      const h = (x * 928371 + y * 1237) % 101;
      if (keep.has(x + ',' + y)) {
        if (!TILEDEF[c] || !TILEDEF[c].walk) g[y][x] = h < 60 ? ',' : '.'; // the verge: scrub and sand
      } else g[y][x] = '#';
    }
  return g.map(r => r.join(''));
}
// which place a tile of the valley belongs to: its way in, or any tile of its 3 x 2 picture
const valleyTown = (x, y) =>
  Object.keys(LOC).find(
    k =>
      !LOC[k].sub &&
      onMap(k) &&
      Math.abs(vx(LOC[k]) - x) <= 1 &&
      ((vy(LOC[k]) + 1 === y && vx(LOC[k]) === x) || (y >= vy(LOC[k]) - 1 && y <= vy(LOC[k]))),
  );
// ---- the walking state, kept in the save ----
let WK = null; // the live screen: canvas, map, people, timers
function walkMap(loc, opts, ids) {
  if (loc === 'valley') return { rows: valleyRows(), use: {}, spots: {}, valley: 1 };
  const M = MAPS[loc] || genMap(loc, opts || [], ids || []);
  if (M.decorated || typeof decorate !== 'function') return M;
  // things against the walls: never where somebody stands, where you come in, or in front of something you use
  const free = new Set([M.spawn.join(',')]);
  Object.values(M.spots || {}).forEach(s => free.add(s.join(',')));
  M.rows.forEach((row, y) => [...row].forEach((c, x) => c === 'p' && free.add(x + ',' + y)));
  Object.keys(M.use || {}).forEach(k => {
    if (k.includes(',')) {
      const [x, y] = k.split(',').map(Number);
      free.add(x + ',' + (y + 1));
    }
  });
  return { ...M, rows: decorate(M.rows, loc, free), decorated: 1 };
}
// ---- a map for every place without a hand-drawn one ----
// Built from what's actually there: each thing you can do is a building with a door and a name board over it,
// people stand along the paths, and the place has its own look. The same place always builds the same way.
const THEME = {
  farm: { fill: ',', deco: 'f', n: 6 },
  diner: { fill: '.', deco: 'x', n: 4 },
  chainfield: { fill: '.', deco: 'f', n: 10 },
  skybus: { fill: '.', deco: 'x', n: 8 },
  silo: { fill: '.', deco: '#', n: 10 },
  snakeeyes: { fill: '.', deco: 'x', n: 3 },
  mall: { fill: '.', deco: '~', n: 0, lake: 1 },
  green: { fill: ',', deco: 'T', n: 4 },
  well: { fill: 's', deco: '#', n: 12 },
  vats: { fill: 's', deco: '~', n: 6 },
  gristmill: { fill: ',', deco: 'x', n: 8 },
  gully: { fill: '.', deco: 'x', n: 14 },
  saltpan: { fill: '.', deco: '~', n: 6 },
  kettle: { fill: '.', deco: 'x', n: 6 },
  fanghill: { fill: '.', deco: 'T', n: 8 },
};
const optLabel = o => o[0].split(' (')[0].split(',')[0].replace(/^"|"$/g, '').slice(0, 15);
function genMap(loc, opts, ids) {
  // compact (v7.9, Will: "condense the world size but not the content"): one street up the middle, buildings
  // two to a row either side of it, people along the street. About one phone screen.
  const T = THEME[loc] || { fill: '.', deco: 'x', n: 5 };
  const sub = LOC[loc] && LOC[loc].sub;
  // in the well or the vats, the way back up is the exit, not a building
  const acts = opts.filter(o => o && !/^Back to walking/.test(o[0]) && !(sub && /^Climb|back up/i.test(o[0])));
  const rowsB = Math.max(1, Math.ceil(acts.length / 2)),
    W = 15,
    H = Math.max(12, 3 + rowsB * 4 + Math.ceil(ids.length / 4) * 2 + 2);
  const g = [];
  for (let y = 0; y < H; y++) g.push([...(y === 0 || y === H - 1 ? '#'.repeat(W) : '#' + T.fill.repeat(W - 2) + '#')]);
  const set = (x, y, c) => {
    if (y > 0 && y < H - 1 && x > 0 && x < W - 1) g[y][x] = c;
  };
  const mx = 7;
  // a seeded scatter of the place's look, kept off the street and the buildings
  let seed = [...loc].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < Math.min(T.n, 6); i++) {
    const x = 1 + Math.floor(rnd() * (W - 2)),
      y = 3 + rowsB * 4 + Math.floor(rnd() * Math.max(1, H - 5 - rowsB * 4));
    if (Math.abs(x - mx) > 2) set(x, y, T.deco === '~' ? 'x' : T.deco);
  }
  for (let y = 1; y < H - 1; y++) set(mx, y, '=');
  g[H - 1][mx] = 'E';
  const use = {},
    boards = [];
  acts.forEach((o, i) => {
    const row = Math.floor(i / 2),
      left = i % 2 === 0,
      bx = left ? 2 : 10,
      by = 1 + row * 4;
    for (let dx = 0; dx < 3; dx++) {
      set(bx + dx, by, 'H');
      set(bx + dx, by + 1, dx === 1 ? 'D' : 'h');
    }
    for (let x = Math.min(bx + 1, mx); x <= Math.max(bx + 1, mx); x++) set(x, by + 2, '=');
    use[`${bx + 1},${by + 1}`] = { opt: o[0] };
    boards.push({ x: bx + 1, y: by, t: optLabel(o) });
  });
  // people: along the street, either side, below the buildings
  const spots = {},
    free = [];
  for (let y = 3 + rowsB * 4; y < H - 1; y += 2) for (const x of [mx - 2, mx + 2, mx - 4, mx + 4]) free.push([x, y]);
  for (let y = 4; y < 3 + rowsB * 4; y += 4) for (const x of [mx - 2, mx + 2]) free.push([x, y]);
  ids.forEach(id => {
    const s = free.find(([x, y]) => g[y] && TILEDEF[g[y][x]] && TILEDEF[g[y][x]].walk);
    if (!s) return;
    free.splice(free.indexOf(s), 1);
    spots[id] = s;
  });
  return { rows: g.map(r => r.join('')), spawn: [mx, H - 2], use, spots, boards, sign: null, gen: 1 };
}
SC.walk = (loc, ids, opts, text) => {
  const M = walkMap(loc, opts, ids);
  S.wk = S.wk || {};
  // a spot saved on an older, bigger map may now be off the map or inside a wall: start at the way in
  const st = S.wk.loc === loc && TILEDEF[(M.rows[S.wk.y] || '')[S.wk.x]];
  if (S.wk.loc === loc && !(st && st.walk)) S.wk.loc = null;
  if (S.wk.loc !== loc) {
    let sp = M.spawn;
    if (M.valley) {
      const L = LOC[S.here] || LOC.scrapwell;
      sp = [vx(L), vy(L) + 2];
    }
    S.wk = { loc, x: sp[0], y: sp[1], d: M.valley ? 'd' : 'u' };
  }
  const title = M.valley ? 'The Wasteland' : LOC[loc].n;
  show({
    title,
    icon: M.valley ? '🏜️' : LOC[loc].i,
    sub: `Day ${S.day} · tap to walk, tap someone to talk`,
    text: M.valley ? 'Walk into a place to go there. Each trip takes a day.' : text || '',
    opts: [['Back to walking', () => document.body.classList.remove('walkmenu')], ...(opts || []), charOpt()],
  });
  walkMount(loc, M, ids || []);
};
function walkMount(loc, M, ids) {
  walkStop();
  walkSize();
  document.body.classList.add('walking');
  document.body.classList.remove('walkmenu', 'overlay');
  const vw = $('view');
  vw.hidden = false;
  const L = LOC[loc],
    hp = clamp((S.hp * 100) / S.maxhp, 0, 100);
  // the full screen: the map, a slim bar over the top, the message box, and the ring under your thumb
  vw.innerHTML =
    `<div class="walk"><canvas id="wcv" width="${VW * TILE}" height="${VH * TILE}"></canvas>` +
    `<div class="whud"><div class="wl"><b>${esc(M.valley ? 'The Wasteland' : L.n)}</b><span>🦷 ${S.teeth} · Day ${S.day}</span></div>` +
    `<div class="whp"><i style="width:${hp}%"></i></div><button class="wmenu">Menu</button></div>` +
    '<div id="wmsg" class="wmsg" hidden></div><div id="wring" class="wring" hidden></div>' +
    '<div class="wab"><button class="wb" data-k="b">B</button><button class="wa" data-k="a">A</button></div></div>';
  vw.querySelector('.wmenu').addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    WK.path = null;
    WK.held = null;
    document.body.classList.add('walkmenu');
    $('wrap').scrollTop = 0;
  });
  const cv = $('wcv');
  const rows = M.rows,
    H = rows.length,
    W = rows[0].length;
  // the map, painted once into one big picture
  const big = document.createElement('canvas');
  big.width = W * TILE;
  big.height = H * TILE;
  const bg = big.getContext('2d');
  // each building (a joined block of roof, wall and door) gets its own number, so its own variant of the style
  const block = {},
    blocks = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!'HhD'.includes(rows[y][x]) || block[x + ',' + y] != null) continue;
      const id = blocks.length,
        q = [[x, y]],
        cells = [];
      block[x + ',' + y] = id;
      while (q.length) {
        const [cx, cy] = q.shift();
        cells.push([cx, cy]);
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx,
            ny = cy + dy;
          if ('HhD'.includes((rows[ny] || '')[nx] || '#') && block[nx + ',' + ny] == null) {
            block[nx + ',' + ny] = id;
            q.push([nx, ny]);
          }
        }
      }
      blocks.push(cells);
    }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = TILEDEF[rows[y][x]] || TILEDEF['.'];
      const at = (dx, dy) => (rows[y + dy] || '')[x + dx] || '#';
      if (block[x + ',' + y] != null && typeof villageStyle === 'function')
        BPAINT = villageStyle(loc, block[x + ',' + y]);
      bg.save();
      bg.translate(x * TILE, y * TILE);
      t.draw(bg, x, y, (x * 73 + y * 151) % 97, at, 0);
      bg.restore();
    }
  // chimneys on some roofs (they smoke), and a flag over the biggest building
  const fx = { smoke: [], flag: null };
  const SMOKY = ['scrapwell', 'rustwater', 'farm', 'diner', 'saltpan', 'green', 'chainfield'];
  blocks.forEach((cells, i) => {
    const roofs = cells.filter(([cx, cy]) => rows[cy][cx] === 'H');
    if (!roofs.length) return;
    const top = Math.min(...roofs.map(c => c[1])),
      right = Math.max(...roofs.filter(c => c[1] === top).map(c => c[0]));
    if (SMOKY.includes(loc) && i % 2 === 0) {
      const px = right * TILE + 8,
        py = top * TILE + 2;
      bg.fillStyle = GP.ink;
      bg.fillRect(px - 1, py - 6, 7, 9);
      bg.fillStyle = '#9a5a3a';
      bg.fillRect(px, py - 5, 5, 7);
      bg.fillStyle = '#b87050';
      bg.fillRect(px, py - 5, 5, 1);
      fx.smoke.push([px + 2, py - 6]);
    }
  });
  if (blocks.length) {
    const bigB = blocks.reduce((a, b) => (b.length > a.length ? b : a));
    const roofs = bigB.filter(([cx, cy]) => rows[cy][cx] === 'H');
    if (roofs.length) {
      const top = Math.min(...roofs.map(c => c[1])),
        xs = roofs.filter(c => c[1] === top).map(c => c[0]);
      fx.flag = [Math.round(((Math.min(...xs) + Math.max(...xs)) / 2) * TILE + 4), top * TILE];
    }
  }
  // water moves: its tiles are redrawn on the big map every half second (v8.3)
  const wet = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (rows[y][x] === '~') wet.push([x, y]);
  if (wet.length)
    setTimeout(() => {
      if (!WK || WK.big !== big) return;
      WK.timers.push(
        setInterval(() => {
          const t = Date.now();
          for (const [x, y] of wet) {
            const at = (dx, dy) => (rows[y + dy] || '')[x + dx] || '#';
            bg.save();
            bg.translate(x * TILE, y * TILE);
            TILEDEF['~'].draw(bg, x, y, (x * 73 + y * 151) % 97, at, t);
            bg.restore();
          }
        }, 500),
      );
    }, 0);
  // each place on the valley map is drawn as itself (scenes/townart.js)
  if (M.valley && typeof valleyIcons === 'function') valleyIcons(bg);
  // people stand on their own spots, or on the free p spots in order
  const free = [];
  rows.forEach((r, y) => [...r].forEach((c, x) => c === 'p' && free.push([x, y])));
  const taken = new Set(Object.values(M.spots || {}).map(s => s.join(',')));
  const pool = free.filter(s => !taken.has(s.join(',')));
  const ppl = ids.map(id => {
    const s = (M.spots || {})[id] || pool.shift() || [1, 1];
    return { id, x: s[0], y: s[1], d: 'd', look: walkerLook(id), home: s };
  });
  WK = {
    loc,
    M,
    rows,
    fx,
    W,
    H,
    cv,
    g: cv.getContext('2d'),
    big,
    ppl,
    me: walkerLook(null),
    held: null,
    moving: 0,
    t0: 0,
    from: null,
    raf: 0,
    timers: [],
  };
  WK.g.imageSmoothingEnabled = false;
  // input: the pad and A/B on screen, arrows or WASD and Z/X on a keyboard
  // The hidden pad: put a thumb down anywhere and drag the way you want to go. You keep walking while it's
  // down, slide to steer, let go to stop. A tap alone does nothing (Will: "remove the touch to walk"): A and B do the rest.
  const ring = $('wring');
  cv.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (!WK || WK.busy) return;
    try {
      cv.setPointerCapture(e.pointerId);
    } catch (x) {}
    WK.touch = { x: e.clientX, y: e.clientY, t: Date.now(), drag: false };
  });
  cv.addEventListener('pointermove', e => {
    const T = WK && WK.touch;
    if (!T) return;
    const dx = e.clientX - T.x,
      dy = e.clientY - T.y;
    if (!T.drag && Math.hypot(dx, dy) < 14) return;
    if (!T.drag) {
      T.drag = true;
      WK.path = null;
      walkMsg(null);
      const b = $('view').getBoundingClientRect();
      ring.style.left = T.x - b.left + 'px';
      ring.style.top = T.y - b.top + 'px';
      ring.hidden = false;
    }
    WK.held = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : dy > 0 ? 'd' : 'u';
  });
  const lift = (e, cancel) => {
    const T = WK && WK.touch;
    if (!T) return;
    WK.touch = null;
    ring.hidden = true;
    WK.held = null;
  };
  // A talks to or uses whatever you're facing. B closes a message, or opens the menu.
  $('view')
    .querySelectorAll('.wab button')
    .forEach(btn =>
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        if (!WK || WK.busy) return;
        const m = $('wmsg');
        if (btn.dataset.k === 'a') {
          if (m && !m.hidden) return walkMsg(null);
          return walkUse();
        }
        if (m && !m.hidden) return walkMsg(null);
        WK.held = null;
        document.body.classList.add('walkmenu');
        $('wrap').scrollTop = 0;
      }),
    );
  cv.addEventListener('pointerup', e => lift(e, false));
  cv.addEventListener('pointercancel', e => lift(e, true));
  // A message from the place (what just happened) shows in the box when you arrive.
  const said = [...($('log').querySelectorAll('p') || [])]
    .slice(-2)
    .map(p => p.textContent)
    .join(' ');
  const look = ($('text').textContent || '').trim();
  if (said || (look && S.wk.seen !== loc + S.day)) setTimeout(() => walkMsg(said || look), 0);
  S.wk.seen = loc + S.day; // a place describes itself once a day
  // a few people wander a step or two from their spot
  WK.timers.push(
    setInterval(() => {
      if (!WK || WK.busy) return;
      for (const q of WK.ppl) {
        if (Math.random() > 0.25) continue;
        const [dx, dy, d] = pick([
          [1, 0, 'r'],
          [-1, 0, 'l'],
          [0, 1, 'd'],
          [0, -1, 'u'],
        ]);
        const nx = q.x + dx,
          ny = q.y + dy;
        q.d = d;
        if (Math.abs(nx - q.home[0]) + Math.abs(ny - q.home[1]) <= 1 && walkFree(nx, ny)) {
          q.x = nx;
          q.y = ny;
        }
      }
    }, 900),
  );
  const near = walkNear();
  if (near) walkSay(near);
  walkLoop();
}
function walkStop() {
  if (typeof document !== 'undefined' && document.body) document.body.classList.remove('walking');
  if (!WK) return;
  try {
    const bg = $('bgmap');
    if (bg && WK.cv) bg.style.backgroundImage = `url(${WK.cv.toDataURL()})`;
  } catch (e) {}
  cancelAnimationFrame(WK.raf);
  WK.timers.forEach(t => clearInterval(t));
  WK = null;
}
const walkTile = (x, y) => (WK.rows[y] || '')[x] || '#';
function walkFree(x, y) {
  const t = TILEDEF[walkTile(x, y)];
  if (!t || !t.walk) return false;
  if (S.wk && S.wk.x === x && S.wk.y === y) return false;
  return !WK.ppl.some(q => q.x === x && q.y === y);
}
const DIRV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
function walkKey(k, down) {
  if (!WK) return;
  if (DIRV[k]) {
    if (down) {
      WK.held = k;
      WK.path = null;
    } else if (WK.held === k) WK.held = null;
    return;
  }
  if (!down) return;
  if (k === 'a') walkUse();
  if (k === 'b') walkMsg(null);
}
if (typeof document !== 'undefined' && document.addEventListener) {
  const KEYS = {
    ArrowUp: 'u',
    ArrowDown: 'd',
    ArrowLeft: 'l',
    ArrowRight: 'r',
    w: 'u',
    s: 'd',
    a: 'l',
    d: 'r',
    z: 'a',
    Enter: 'a',
    ' ': 'a',
    x: 'b',
    Escape: 'b',
  };
  document.addEventListener('keydown', e => {
    if (WK && KEYS[e.key]) {
      e.preventDefault();
      walkKey(KEYS[e.key], true);
    }
  });
  document.addEventListener('keyup', e => {
    if (WK && KEYS[e.key]) walkKey(KEYS[e.key], false);
  });
}
// ---- moving: one tile at a time, smooth, and the camera follows ----
const STEP_MS = 165;
function walkLoop() {
  if (!WK) return;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let carry = now;
  if (WK.moving && now - WK.t0 >= STEP_MS) {
    carry = Math.min(now, WK.t0 + STEP_MS); // the next step starts where this one ended, so there's no hitch
    WK.moving = 0;
    walkArrive();
    if (!WK) return;
  }
  WK.carry = carry;
  if (!WK.moving && !WK.held && WK.path && !WK.busy) walkPathStep();
  if (!WK) return;
  if (!WK.moving && WK.held && !WK.busy) {
    const [dx, dy] = DIRV[WK.held];
    S.wk.d = WK.held;
    const nx = S.wk.x + dx,
      ny = S.wk.y + dy;
    if (walkFree(nx, ny)) {
      WK.from = [S.wk.x, S.wk.y];
      S.wk.x = nx;
      S.wk.y = ny;
      WK.moving = 1;
      WK.t0 = carry;
      walkMsg(null);
    }
  }
  walkDraw(now);
  WK.raf = requestAnimationFrame(walkLoop);
}
function walkDraw(now) {
  const { g, big, W, H } = WK;
  const k = WK.moving ? Math.min(1, (now - WK.t0) / STEP_MS) : 1;
  const fx = WK.moving ? WK.from[0] + (S.wk.x - WK.from[0]) * k : S.wk.x,
    fy = WK.moving ? WK.from[1] + (S.wk.y - WK.from[1]) * k : S.wk.y;
  // the camera keeps you in the middle, and stops at the edges of the map
  const SW = VW * TILE,
    SH = VH * TILE;
  const cam = (f, n, view) =>
    n * TILE <= view ? -(view - n * TILE) / 2 : clamp(f * TILE - (view - TILE) / 2, 0, n * TILE - view);
  const cx = cam(fx, W, SW),
    cy = cam(fy, H, SH);
  g.fillStyle = GP.ink;
  g.fillRect(0, 0, SW, SH);
  g.drawImage(big, Math.round(-cx), Math.round(-cy)); // the whole map, shifted; the canvas clips it
  // chimney smoke drifting up, and the flag over the biggest building, moving in the wind
  if (WK.fx) {
    for (const [sx, sy] of WK.fx.smoke)
      for (let i = 0; i < 3; i++) {
        const t = (((now / 1600 + i / 3 + sx * 0.01) % 1) + 1) % 1;
        g.fillStyle = `rgba(230,224,214,${0.55 * (1 - t)})`;
        g.beginPath();
        g.arc(
          Math.round(sx + Math.sin(t * 6 + i) * 3 + t * 6 - cx),
          Math.round(sy - t * 22 - cy),
          2 + t * 4,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    if (WK.fx.flag) {
      const X = WK.fx.flag[0] - cx,
        Y = WK.fx.flag[1] - cy;
      g.fillStyle = GP.ink;
      g.fillRect(Math.round(X), Math.round(Y - 18), 1, 19);
      const FC = {
        rustwater: '#3a8a8a',
        snakeeyes: '#d8a020',
        farm: '#c04a30',
        scrapwell: '#c0642a',
        diner: '#c8302a',
        mall: '#4a6a8a',
        chainfield: '#5a4a3a',
        green: '#4a9a3a',
      };
      g.fillStyle = FC[WK.loc] || '#c0642a';
      for (let i = 0; i < 9; i++)
        g.fillRect(Math.round(X + 1 + i), Math.round(Y - 18 + Math.sin(now / 220 + i * 0.7) * 1.5), 1, 6);
    }
  }
  // name boards over the buildings of a generated place
  for (const bd of [...(WK.M.boards || []), ...(WK.boards || [])]) {
    g.font = 'bold 7px monospace';
    const w = Math.ceil(g.measureText(bd.t).width) + 6,
      bx = Math.round(bd.x * TILE + 8 - w / 2 - cx),
      by = Math.round(bd.y * TILE - 9 - cy);
    g.fillStyle = GP.ink;
    g.fillRect(bx - 1, by - 1, w + 2, 11);
    g.fillStyle = GP.white;
    g.fillRect(bx, by, w, 9);
    g.fillStyle = GP.ink;
    g.fillText(bd.t, bx + 3, by + 7);
  }
  // people are taller than a tile, so the ones further down the screen are drawn last
  const step = WK.moving ? 1 + (Math.floor(now / (STEP_MS / 2)) % 2) : 0;
  const all = [
    ...WK.ppl.map(q => ({ x: q.x, y: q.y, look: q.look, d: q.d, s: 0 })),
    { x: fx, y: fy, look: WK.me, d: S.wk.d, s: step },
  ].sort((a, b) => a.y - b.y);
  for (const q of all) drawWalkerGBA(g, Math.round(q.x * TILE - cx), Math.round(q.y * TILE - cy), q.look, q.d, q.s);
  // warm light: a sun-baked glow from the top, and a soft vignette (v8.3)
  if (!WK.light || WK.light.w !== SW || WK.light.h !== SH) {
    const lc = document.createElement('canvas');
    lc.width = SW;
    lc.height = SH;
    const lg = lc.getContext('2d');
    const top = lg.createLinearGradient(0, 0, 0, SH);
    top.addColorStop(0, 'rgba(255,214,140,0.16)');
    top.addColorStop(0.5, 'rgba(255,214,140,0)');
    top.addColorStop(1, 'rgba(90,40,10,0.12)');
    lg.fillStyle = top;
    lg.fillRect(0, 0, SW, SH);
    const v = lg.createRadialGradient(SW / 2, SH / 2, Math.min(SW, SH) * 0.35, SW / 2, SH / 2, Math.max(SW, SH) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(40,20,8,0.28)');
    lg.fillStyle = v;
    lg.fillRect(0, 0, SW, SH);
    WK.light = { c: lc, w: SW, h: SH };
  }
  g.drawImage(WK.light.c, 0, 0);
  WK.sy = fy * TILE - cy; // where you are on screen, so a message never covers you
  WK.cx = cx;
  WK.cy = cy;
  // where a tap is taking you: a small blinking marker
  if (WK.path && WK.path.length && Math.floor(now / 300) % 2) {
    const [mx, my] = WK.goal;
    g.strokeStyle = GP.white;
    g.lineWidth = 1;
    g.strokeRect(Math.round(mx * TILE - cx) + 3.5, Math.round(my * TILE - cy) + 3.5, 9, 9);
  }
  // in the valley, a name board for the place you're standing at, like a route sign
  if (WK.M.valley && !WK.moving) {
    // the name board, for the place you're standing next to
    const t = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
      [0, 0],
    ]
      .map(([dx, dy]) => valleyTown(S.wk.x + dx, S.wk.y + dy))
      .find(Boolean);
    if (t) {
      const name = LOC[t].n.toUpperCase();
      g.font = 'bold 8px monospace';
      const w = Math.ceil(g.measureText(name).width) + 12;
      g.fillStyle = GP.ink;
      g.fillRect(2, 2, w + 4, 15);
      g.fillStyle = GP.white;
      g.fillRect(4, 4, w, 11);
      g.fillStyle = GP.wood;
      g.fillRect(4, 13, w, 2);
      g.fillStyle = GP.ink;
      g.fillText(name, 10, 12);
    }
  }
}
// ---- tap to walk ----
// The shortest way round walls and people (a breadth-first search over the tiles).
function walkRoute(tx, ty) {
  const key = (x, y) => x + ',' + y,
    from = new Map([[key(S.wk.x, S.wk.y), null]]),
    q = [[S.wk.x, S.wk.y]];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) break;
    for (const d of ['u', 'd', 'l', 'r']) {
      const nx = x + DIRV[d][0],
        ny = y + DIRV[d][1],
        k = key(nx, ny);
      if (from.has(k) || !walkFree(nx, ny)) continue;
      from.set(k, [x, y, d]);
      q.push([nx, ny]);
    }
  }
  if (!from.has(key(tx, ty))) return null;
  const path = [];
  for (let c = [tx, ty]; from.get(key(c[0], c[1])); ) {
    const p = from.get(key(c[0], c[1]));
    path.unshift(p[2]);
    c = [p[0], p[1]];
  }
  return path;
}
function walkTo(tx, ty) {
  const q = WK.ppl.find(p => p.x === tx && p.y === ty),
    c = walkTile(tx, ty),
    t = TILEDEF[c];
  WK.then = null;
  if (q || (t && t.use) || (WK.M.use || {})[`${tx},${ty}`]) {
    // a person or a thing: walk to the nearest side of it, then face it and talk or use it
    let best = null;
    for (const d of ['d', 'u', 'l', 'r']) {
      const sx = tx - DIRV[d][0],
        sy = ty - DIRV[d][1];
      if (sx === S.wk.x && sy === S.wk.y) best = { path: [], d };
      else if (walkFree(sx, sy)) {
        const p = walkRoute(sx, sy);
        if (p && (!best || p.length < best.path.length)) best = { path: p, d };
      }
    }
    if (!best) return walkSay("You can't get to that from here.");
    WK.path = best.path;
    WK.goal = [tx, ty];
    WK.then = best.d;
    if (!best.path.length) walkPathStep();
    return;
  }
  const p = walkRoute(tx, ty);
  if (!p) return;
  WK.path = p;
  WK.goal = [tx, ty];
}
function walkPathStep() {
  if (!WK.path.length) {
    WK.path = null;
    if (WK.then) {
      S.wk.d = WK.then;
      WK.then = null;
      walkUse();
    }
    return;
  }
  const d = WK.path[0],
    nx = S.wk.x + DIRV[d][0],
    ny = S.wk.y + DIRV[d][1];
  S.wk.d = d;
  if (!walkFree(nx, ny)) {
    // somebody wandered into the way: find another way to the same place
    const [gx, gy] = WK.goal,
      then = WK.then;
    WK.path = null;
    walkTo(gx, gy);
    if (WK && WK.path && WK.then == null) WK.then = then;
    return;
  }
  WK.path.shift();
  WK.from = [S.wk.x, S.wk.y];
  S.wk.x = nx;
  S.wk.y = ny;
  WK.moving = 1;
  WK.t0 = WK.carry || (typeof performance !== 'undefined' ? performance.now() : Date.now());
  walkMsg(null);
}
function walkArrive() {
  const t = TILEDEF[walkTile(S.wk.x, S.wk.y)];
  if (t && t.exit) {
    // out of town and onto the valley road; out of the well or the vats, back up to the place above
    const up = LOC[WK.loc] && LOC[WK.loc].sub ? LOC[WK.loc].up : null;
    walkStop();
    S.wk.loc = null;
    return up ? go('hub', up) : go('map');
  }
  if (WK.M.valley && t && t.town) {
    const k = valleyTown(S.wk.x, S.wk.y);
    if (k) {
      walkStop();
      S.wk.loc = null;
      if (k === S.here) return go('hub', k);
      return travel(k); // a day passes, and the road may have something to say about it
    }
  }
  save();
}
// What's in front of you: a person, or something you can use.
function walkFacing() {
  const [dx, dy] = DIRV[S.wk.d];
  return [S.wk.x + dx, S.wk.y + dy];
}
function walkNear() {
  return WK.M.sign || null;
}
function walkUse() {
  if (!WK || WK.moving) return;
  const [x, y] = walkFacing();
  const q = WK.ppl.find(p => p.x === x && p.y === y);
  if (q) {
    q.d = { u: 'd', d: 'u', l: 'r', r: 'l' }[S.wk.d];
    walkStop();
    return go('talk', q.id);
  }
  const c = walkTile(x, y),
    use = WK.M.use || {};
  const u = use[`${x},${y}`] || use[c];
  if (u && u.opt) {
    const op = (WK.opts || []).find(o => o && o[0] === u.opt);
    if (op) {
      walkStop();
      return op[1]();
    }
  }
  if (u instanceof RegExp) {
    const op = (WK.opts || []).find(o => o && u.test(o[0]));
    if (op) {
      walkStop();
      return op[1]();
    }
  }
  if (typeof u === 'string') return walkSay(u);
  if (c === 'D')
    return walkSay(
      pick([
        'The door is shut. Somebody inside says "No."',
        'Locked. You hear somebody holding their breath.',
        'Nobody answers.',
      ]),
    );
  if (c === 'W' || c === 'P') return walkSay('Nothing to do here right now.');
}
function walkMsg(t) {
  const m = $('wmsg');
  if (!m) return;
  m.hidden = !t;
  m.textContent = t || '';
  // the box sits at the bottom, like the handheld, unless you're standing down there
  const low = WK && WK.sy != null ? WK.sy > (VH * TILE) / 2 : true;
  m.classList.toggle('top', low);
}
const walkSay = t => walkMsg(t);

// ---- hooking it in: a place with a map is walked, the valley replaces the map screen ----
// The place screen still decides everything (ambushes, raids, who is here, what you can do): it is run quietly,
// and what it would have shown becomes the people you can find and the things you can use.
const _hubWalk = SC.hub;
SC.hub = loc => {
  if (!walkOn() || S.crater[loc] || !LOC[loc]) return _hubWalk(loc);
  if ((typeof TOWNS !== 'undefined' && TOWNS[loc]) || loc === 'gully') return go('town', loc); // the lost towns have their own screen
  let v = null;
  const _show = show;
  show = x => {
    v = x;
  };
  try {
    _hubWalk(loc);
  } finally {
    show = _show;
  }
  if (!v) return;
  if (S.scene !== 'hub' || !v.ids) return show(v); // something else happened on the way in: show that instead
  // the place's own options, without the map (you walk out) and without the people (you find them)
  const opts = (v.opts || []).filter(o => o && !/^Leave \(map\)$/.test(o[0]) && !/^Character/.test(o[0]));
  SC.walk(loc, v.ids, opts, v.text);
  if (WK) {
    WK.opts = opts;
    WK.boards = handBoards(WK.M, opts);
  }
};
// Name boards over the things on a hand-drawn map that do something here today.
function handBoards(M, opts) {
  if (M.gen || M.valley) return [];
  const out = [];
  for (const key in M.use || {}) {
    const u = M.use[key];
    if (!(u instanceof RegExp)) continue;
    const op = opts.find(o => o && u.test(o[0]));
    if (!op) continue;
    const at = key.includes(',')
      ? [key.split(',').map(Number)]
      : M.rows.flatMap((row, y) => [...row].map((c, x) => (c === key ? [x, y] : null)).filter(Boolean));
    at.forEach(([x, y]) => out.push({ x, y: y - (M.rows[y][x] === 'D' ? 1 : 0), t: optLabel(op) }));
  }
  return out;
}
const _mapWalk = SC.map;
SC.map = () => {
  if (!walkOn()) return _mapWalk();
  SC.walk('valley', [], []);
};
// The lost towns (scenes/beasts.js) are walked too: each stage is a building you go into.
if (typeof SC.town === 'function') {
  const _townWalk = SC.town;
  SC.town = k => {
    if (!walkOn() || S.crater[k]) return _townWalk(k);
    let v = null;
    const _show = show;
    show = x => {
      v = x;
    };
    try {
      _townWalk(k);
    } finally {
      show = _show;
    }
    if (!v) return;
    if (S.scene !== 'town') return show(v);
    const opts = (v.opts || []).filter(o => o && !/^Leave \(map\)$/.test(o[0]) && !/^Character/.test(o[0]));
    SC.walk(k, [], opts, v.text);
    if (WK) WK.opts = opts;
  };
}
// Leaving the walking screen for any other screen stops the walking loop.
const _goWalk = go;
const NO_OVERLAY = ['title', 'intro', 'ending', 'restart'];
go = (id, ...args) => {
  if (typeof document !== 'undefined' && document.body) {
    document.body.classList.remove('panel'); // a new screen closes the ☰ panel
    // every screen but walking (and the title and the end) sits over the map: Pokemon style
    document.body.classList.toggle('overlay', walkOn() && !NO_OVERLAY.includes(id));
  }
  if (id !== 'walk') walkStop();
  return _goWalk(id, ...args);
};
