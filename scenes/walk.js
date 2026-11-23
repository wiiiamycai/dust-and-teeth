'use strict';
// ================= WALKING: a scrolling top-down world, in the style of a Game Boy Color RPG =================
// Will (v6.6): walk around, the map scrolls as you go, and you find people instead of picking them from a list.
// Our own art, drawn in code. The text game underneath is unchanged: walking is a way of getting to the same
// scenes. A place with a map (data/maps.js) is walked; a place without one is the text screen, as before.
// Talking, shops and everything else open as the usual screen; Back returns you to where you stood.
// No canvas (the headless tests), or the footer switch set to text: everything plays as text, exactly as before.
const TILE = 16,
  VW = 10,
  VH = 9; // the screen is 10 x 9 tiles, like the handheld
const WALK_KEY = 'dust_teeth_walk';
const walkOn = () => {
  try {
    return canDraw() && localStorage.getItem(WALK_KEY) !== 'text';
  } catch (e) {
    return false;
  }
};
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
  if (!id) return { hair: '#4a3420', shirt: '#7a6a4a', legs: '#4a4038', skin: '#d8a878', hat: '#6a5038' };
  if (NPC[id] && NPC[id].animal) return { beast: 1, body: p.c || '#d89a90', skin: p.s || '#e8b0a8' };
  return { hair: p.h || '#3a2a1c', shirt: p.c || '#6a5a7a', legs: p.d || '#4a4034', skin: p.s || '#c8986c' };
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
        if (g[y] && g[y][x] !== '=' && (x - mx) ** 2 / 25 + (y - my) ** 2 / 9 <= 1) set(x, y, '~');
  }
  // each place: a block of roofs, with its way in at the bottom middle
  for (const k in LOC) {
    if (!vis(k)) continue;
    const x = vx(LOC[k]),
      y = vy(LOC[k]);
    for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 1; dx++) set(x + dx, y + dy, 'o');
    set(x, y + 1, 'O');
    set(x, y + 2, '=');
  }
  return g.map(r => r.join(''));
}
const valleyTown = (x, y) =>
  Object.keys(LOC).find(k => !LOC[k].sub && onMap(k) && vx(LOC[k]) === x && vy(LOC[k]) + 1 === y);
// ---- the walking state, kept in the save ----
let WK = null; // the live screen: canvas, map, people, timers
function walkMap(loc) {
  if (loc === 'valley') return { rows: valleyRows(), use: {}, spots: {}, valley: 1 };
  return MAPS[loc] || null;
}
SC.walk = (loc, ids, opts, text) => {
  const M = walkMap(loc);
  S.wk = S.wk || {};
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
    sub: `Day ${S.day} · walk with the arrows or the pad · A to talk or use`,
    text: M.valley ? 'Walk into a place to go there. Each trip takes a day.' : text || '',
    opts: [...(opts || []), M.valley ? ['The old map (pick a place)', () => go('map', 'text')] : null, charOpt()],
  });
  walkMount(loc, M, ids || []);
};
function walkMount(loc, M, ids) {
  walkStop();
  const vw = $('view');
  vw.hidden = false;
  vw.innerHTML =
    '<div class="walk"><div class="scr"><canvas id="wcv" width="160" height="144"></canvas><div id="wmsg" class="wmsg" hidden></div></div>' +
    '<div class="pad"><button data-k="u" class="pu">▲</button><button data-k="l" class="pl">◀</button><button data-k="r" class="pr">▶</button><button data-k="d" class="pd">▼</button></div>' +
    '<div class="ab"><button data-k="b" class="kb">B</button><button data-k="a" class="ka">A</button></div></div>';
  const cv = $('wcv');
  const rows = M.rows,
    H = rows.length,
    W = rows[0].length;
  // the map, painted once into one big picture
  const big = document.createElement('canvas');
  big.width = W * TILE;
  big.height = H * TILE;
  const bg = big.getContext('2d');
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = TILEDEF[rows[y][x]] || TILEDEF['.'];
      bg.save();
      bg.translate(x * TILE, y * TILE);
      t.draw(bg, x, y, (x * 73 + y * 151) % 97);
      bg.restore();
    }
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
  vw.querySelectorAll('button[data-k]').forEach(b => {
    const k = b.dataset.k;
    const down = e => {
      e.preventDefault();
      walkKey(k, true);
    };
    const up = e => {
      e.preventDefault();
      walkKey(k, false);
    };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', up);
    b.addEventListener('pointercancel', up);
  });
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
  if (!WK) return;
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
    if (down) WK.held = k;
    else if (WK.held === k) WK.held = null;
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
const STEP_MS = 190;
function walkLoop() {
  if (!WK) return;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (WK.moving && now - WK.t0 >= STEP_MS) {
    WK.moving = 0;
    walkArrive();
    if (!WK) return;
  }
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
      WK.t0 = now;
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
  const cx = clamp(fx * TILE - 4.5 * TILE, 0, Math.max(0, W * TILE - VW * TILE)),
    cy = clamp(fy * TILE - 4 * TILE, 0, Math.max(0, H * TILE - VH * TILE));
  g.fillStyle = WPAL.ink;
  g.fillRect(0, 0, 160, 144);
  g.drawImage(big, Math.round(cx), Math.round(cy), 160, 144, 0, 0, 160, 144);
  for (const q of WK.ppl) drawWalker(g, Math.round(q.x * TILE - cx), Math.round(q.y * TILE - cy), q.look, q.d, 0);
  const step = WK.moving ? Math.floor(now / (STEP_MS / 2)) % 2 : 0;
  drawWalker(g, Math.round(fx * TILE - cx), Math.round(fy * TILE - cy), WK.me, S.wk.d, step);
  WK.sy = fy * TILE - cy; // where you are on screen, so a message never covers you
  // in the valley, the name of the place you're standing at
  if (WK.M.valley && !WK.moving) {
    const t = valleyTown(S.wk.x, S.wk.y - 1) || valleyTown(S.wk.x, S.wk.y);
    if (t) {
      g.fillStyle = WPAL.white;
      g.fillRect(0, 0, 160, 12);
      g.fillStyle = WPAL.ink;
      g.font = '8px monospace';
      g.fillText(LOC[t].n.toUpperCase(), 4, 9);
    }
  }
}
function walkArrive() {
  const t = TILEDEF[walkTile(S.wk.x, S.wk.y)];
  if (t && t.exit) {
    // out of town and onto the valley road
    walkStop();
    S.wk.loc = null;
    return go('map');
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
  const low = WK && WK.sy != null ? WK.sy > 72 : true;
  m.style.top = low ? '3px' : '';
  m.style.bottom = low ? '' : '3px';
}
const walkSay = t => walkMsg(t);

// ---- hooking it in: a place with a map is walked, the valley replaces the map screen ----
// The place screen still decides everything (ambushes, raids, who is here, what you can do): it is run quietly,
// and what it would have shown becomes the people you can find and the things you can use.
const _hubWalk = SC.hub;
SC.hub = loc => {
  if (!walkOn() || !MAPS[loc] || S.crater[loc]) return _hubWalk(loc);
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
  if (WK) WK.opts = opts;
};
const _mapWalk = SC.map;
SC.map = mode => {
  if (!walkOn() || mode === 'text') return _mapWalk();
  SC.walk('valley', [], []);
};
// Leaving the walking screen for any other screen stops the walking loop.
const _goWalk = go;
go = (id, ...args) => {
  if (id !== 'walk') walkStop();
  return _goWalk(id, ...args);
};
// The switch in the footer: walk, or play it all as text.
function walkSwitch() {
  try {
    if (!canDraw() || typeof document === 'undefined') return;
    const f = $('foot');
    if (!f || $('walksw')) return;
    const b = document.createElement('button');
    b.id = 'walksw';
    b.className = 'walksw';
    const label = () => (b.textContent = walkOn() ? 'Walking: on' : 'Walking: off');
    label();
    b.onclick = () => {
      localStorage.setItem(WALK_KEY, walkOn() ? 'text' : 'walk');
      label();
      if (S && !S.end && !S.fight) goHere();
    };
    f.appendChild(b);
  } catch (e) {}
}
walkSwitch();
