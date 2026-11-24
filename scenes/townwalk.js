'use strict';
// ================= WALKING A KIT TOWN (v9.23) =================
// The glue between the walking engine (scenes/walk.js) and the towns painted with the kit (scenes/townkit.js,
// scenes/townmaps.js). A town is one picture with several districts in it (the 10 stops): you keep your spot as
// you cross it, and stepping into another district's ground is arriving there, with no day passing. People stand
// still at their doors, drawn as the chibi sprites (scenes/chibi.js). Looks and movement only: what each person
// says and what each door does is still the place's own screen.
const TOWNB = {}; // town id -> its walking map, built once
const townTileAt = (D, x, y) => (D.rows[y] || '')[x] || '.';
function townBuild(t) {
  const D = TOWNMAP[t],
    T = TK.T,
    key = D.key ? D.key() : 0; // a lost town is painted again as its stages are cleared
  if (TOWNB[t] && TOWNB[t].key === key) return TOWNB[t];
  const P = TK.paintTown(D.rows, D.pal, () => D.paint(TK));
  const things = typeof D.things === 'function' ? D.things() : D.things || [];
  things.forEach(([x, y, w, h]) => P.solid.push([x, y, w, h]));
  const W = P.W,
    H = P.H,
    inside = (px, py, rects) => rects.some(([x, y, w, h]) => px >= x && px < x + w && py >= y && py < y + h);
  // a tile is solid when its middle is under something solid, or it's water
  const g = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++)
      row.push(inside(x * T + 12, y * T + 12, P.solid) || townTileAt(D, x, y) === '~' ? 'h' : '.');
    g.push(row);
  }
  const use = {};
  // each door: the solid tile it is set in, knocked on from the tile below
  P.doors.forEach((d, i) => {
    const tx = Math.floor((d.x + d.w / 2) / T),
      ty = Math.floor((d.y + 20) / T - 0.5);
    if (!g[ty] || tx < 0 || tx >= W) return;
    g[ty][tx] = 'D';
    use[tx + ',' + ty] = D.doors && i < D.doors.length ? D.doors[i] : null;
  });
  things.forEach(([x, y, w, h, u]) => {
    let n = 0;
    for (let ty = 0; ty < H; ty++)
      for (let tx = 0; tx < W; tx++)
        if (inside(tx * T + 12, ty * T + 12, [[x, y, w, h]])) {
          n++;
          if (!use[tx + ',' + ty]) use[tx + ',' + ty] = u;
        }
    // something smaller than a tile still takes the tile it sits on
    if (!n) {
      const tx = Math.floor((x + w / 2) / T),
        ty = Math.floor((y + h / 2) / T);
      if (g[ty] && g[ty][tx] === '.') g[ty][tx] = 'h';
      use[tx + ',' + ty] = u;
    }
  });
  (D.exits || []).forEach(([x, y]) => g[y] && (g[y][x] = 'E'));
  const area = (x, y) => {
    for (const [k, x0, y0, x1, y1] of D.areas || []) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return k;
    return t;
  };
  return (TOWNB[t] = {
    kit: 1,
    town: t,
    T,
    W,
    H,
    rows: g.map(r => r.join('')),
    use,
    spots: D.spots || {},
    spawn: D.spawn,
    big: P.c,
    area,
    D,
    key,
  });
}
// The town as it is today: a shut gate is solid, and knocking on it is the place's own choices
function townLive(M) {
  if (!M.D.live) return M;
  const rows = M.rows.map(r => [...r]),
    use = { ...M.use };
  M.D.live(rows, use);
  return { ...M, rows: rows.map(r => r.join('')), use };
}
// Everyone in the town's districts, each at their own spot (or the next free one), facing you.
function townPeople(M) {
  const places = Object.keys(LOC).filter(k => !LOC[k].sub && townOf(k) === M.town),
    used = new Set(),
    out = [];
  const ok = s => s && M.rows[s[1]] && M.rows[s[1]][s[0]] === '.' && !used.has(s.join(','));
  const extra = [...(M.D.extra || [])];
  IDS.filter(id => alive(id) && places.includes(S.n[id].loc) && (!M.D.who || M.D.who(id))).forEach(id => {
    let s = M.spots[id];
    if (!ok(s)) s = extra.find(ok);
    if (!s) return;
    used.add(s.join(','));
    out.push({ id, x: s[0], y: s[1], d: 'd', home: s, dist: S.n[id].loc, look: walkerLook(id) });
  });
  // the people held somewhere in town (Krug's pens), each on a spot inside it
  for (const at in M.D.held || {}) {
    const spots = M.D.held[at].filter(ok);
    IDS.filter(id => alive(id) && S.n[id].loc === at).forEach(id => {
      const s = spots.shift();
      if (!s) return;
      used.add(s.join(','));
      out.push({ id, x: s[0], y: s[1], d: 'd', home: s, dist: M.D.heldIn || M.town, look: walkerLook(id) });
    });
  }
  // someone locked up (Pete, in Lou's cage): drawn behind the bars, and you deal with the cage, not them
  for (const [id, at, s] of M.D.caged || [])
    if (alive(id) && S.n[id].loc === at)
      out.push({ id, x: s[0], y: s[1], d: 'd', home: s, cage: 1, look: walkerLook(id) });
  return out;
}
// ---- the chibi sprites, each pose drawn once and kept ----
const CHIBI_CACHE = {};
const CHIBI_DIR = { u: 'up', d: 'down', l: 'left', r: 'right' };
function chibiSprite(id, d, fr) {
  const k = (id || 'you') + d + fr;
  if (CHIBI_CACHE[k]) return CHIBI_CACHE[k];
  const c = document.createElement('canvas');
  c.width = CHIBI_W;
  c.height = CHIBI_H + 4;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  try {
    if (chibiDraw(g, CHIBI[id] ? id : null, CHIBI_DIR[d] || 'down', fr) === false) chibiDraw(g, null, CHIBI_DIR[d], fr);
  } catch (e) {}
  return (CHIBI_CACHE[k] = c);
}
function townWalker(g, q, sx, sy) {
  const T = TILE;
  // a soft shadow at their feet, then the sprite, its feet on the bottom of the tile
  g.fillStyle = 'rgba(40,24,12,0.35)';
  g.fillRect(sx + 4, sy + T - 4, T - 8, 3);
  g.fillRect(sx + 6, sy + T - 5, T - 12, 5);
  g.drawImage(chibiSprite(q.id, q.d || 'd', q.s || 0), sx, sy + T - CHIBI_H - 3);
  if (q.cage) {
    // the bars, in front of whoever is inside
    g.fillStyle = '#3a3a40';
    for (let x = sx - 4; x < sx + T + 4; x += 6) g.fillRect(x, sy + T - CHIBI_H - 2, 2, CHIBI_H + 2);
  }
}
// ---- crossing town: an exit takes you to the valley map, another district's ground is arriving there ----
function townArrive() {
  const M = WK.M,
    c = M.rows[S.wk.y][S.wk.x];
  if (c === 'E') {
    walkStop();
    S.wk.loc = null;
    save();
    go('map');
    return true;
  }
  const d = M.area(S.wk.x, S.wk.y);
  if (d !== S.here && LOC[d] && !LOC[S.here].sub) {
    save();
    walkStop();
    go('hub', d); // arriving there: its own screen runs (who's in, what's happened), and you walk on from here
    return true;
  }
  return false;
}
// Do something in another district: arrive there first, then do it if nothing else came up on the way in.
function townIn(d, f) {
  if (!d || d === S.here || !LOC[d]) return f();
  walkStop();
  go('hub', d);
  if (WK && S.here === d) f(); // the walking screen came back up: nothing else happened on the way in
}
// A: talk to whoever you're facing, or use the door or thing in front of you.
function townUse() {
  const [x, y] = walkFacing(),
    M = WK.M;
  const q = WK.ppl.find(p => p.x === x && p.y === y && !p.cage);
  if (q) {
    q.d = { u: 'd', d: 'u', l: 'r', r: 'l' }[S.wk.d];
    return townIn(q.dist, () => {
      walkStop();
      go('talk', q.id);
    });
  }
  const k = x + ',' + y;
  if (!(k in M.use)) return;
  const u = M.use[k];
  if (u === 'menu') {
    // the place's own screen, with all its choices (the gate: pay, bribe, fight, or another way in)
    WK.held = null;
    document.body.classList.add('walkmenu');
    $('wrap').scrollTop = 0;
    return;
  }
  if (typeof u === 'string') return walkSay(u);
  if (!(u instanceof RegExp)) return walkSay(pick(['The door is shut. Somebody inside says "No."', 'Nobody answers.']));
  townIn(M.area(x, y + 1), () => {
    const op = (WK.opts || []).find(o => o && !/^Walk to /.test(o[0]) && u.test(o[0]));
    if (op) {
      walkStop();
      return op[1]();
    }
    if (M.D.nope) return walkSay(M.D.nope);
    // nothing to do in there today: say who's about instead
    const by = WK.ppl.find(p => !p.cage && Math.abs(p.x - x) <= 2 && Math.abs(p.y - y) <= 2);
    walkSay(
      by
        ? `Nobody's inside. ${npcName(by.id)} is right here.`
        : pick([
            'The door is shut. Somebody inside says "No."',
            'Locked. You hear somebody holding their breath.',
            'Nobody answers.',
          ]),
    );
  });
}
