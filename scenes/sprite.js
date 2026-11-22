'use strict';
// ================= PIXEL SPRITES: building and drawing them =================
// Turns the letter grids in data/sprites.js into small pictures for the isometric view.
// Each picture is built once per size, frame and facing, then cached.
// Keys: 'npc:<id>', 'you', 'prop:<place>.<letter>', 'sign:<place>.<letter>', 'corpse'.

const SW = 16;
function sprHex(hex, k) {
  const n = parseInt(hex.slice(1), 16),
    f = v =>
      Math.max(0, Math.min(255, Math.round(v * k)))
        .toString(16)
        .padStart(2, '0');
  return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255);
}
// What a key is made of: { body, add, item, parts, pal, h, glow }, or null if it has no sprite.
function sprSpec(key) {
  if (key === 'you') {
    const a = SARMOR[S.armor] || SARMOR.rags;
    return {
      body: a.body || SYOU.body,
      pal: { ...SYOU.pal, ...(a.pal || {}) },
      add: a.add || [],
      item: SWEAPON[S.weapon] || null,
    };
  }
  if (key === 'corpse') return SCORPSE;
  const [kind, id] = key.split(':');
  if (kind === 'npc') return SNPC[id] || null;
  if (kind === 'prop') return SPROP[id] ? { parts: SPROP[id] } : null;
  if (kind === 'sign') return SSIGN[id] ? { parts: [...SBOARD, { x: 4, y: 2, r: SICON[SSIGN[id]] }], h: 12 } : null;
  return null;
}
function sprPlace(grid, h, part, x0, y0) {
  part.r.forEach((row, i) =>
    [...row].forEach((ch, j) => {
      const x = x0 + j,
        y = y0 + i;
      if (ch !== '.' && ch !== ' ' && x >= 0 && y >= 0 && x < SW && y < h) grid[y * SW + x] = ch;
    }),
  );
}
// The letter grid for a spec: body, then layers, then what they hold, then any loose parts.
function sprLetters(spec) {
  const h = spec.h || 32,
    grid = new Array(SW * h).fill(null);
  if (spec.body) {
    const B = SBODY[spec.body];
    B.parts.forEach(p => sprPlace(grid, h, p, p.x || 0, p.y || 0));
    (spec.add || []).forEach(a => SADD[a].forEach(p => sprPlace(grid, h, p, p.x || 0, p.y || 0)));
    if (spec.item) {
      const it = SITEM[spec.item],
        w = Math.max(...it.r.map(r => r.length));
      sprPlace(grid, h, it, Math.min(B.hand[0] + it.dx, SW - w), B.hand[1] + it.dy);
    }
  }
  (spec.parts || []).forEach(p => sprPlace(grid, h, p, p.x || 0, p.y || 0));
  return grid;
}
// Frames for people: 1 breathes (the top half sits a pixel lower), 2 is mid-stride.
function sprFrame(grid, h, f) {
  if (!f) return grid;
  const g = grid.slice();
  if (f & 1) {
    for (let y = 20; y >= 0; y--) for (let x = 0; x < SW; x++) g[(y + 1) * SW + x] = grid[y * SW + x];
    for (let x = 0; x < SW; x++) g[x] = null;
  }
  if (f & 2) {
    const src = g.slice();
    for (let y = 26; y < h; y++)
      for (let x = 0; x < SW; x++) {
        g[y * SW + x] = null;
      }
    for (let y = 26; y < h; y++)
      for (let x = 0; x < SW; x++) {
        const ch = src[y * SW + x];
        if (!ch) continue;
        const nx = x < 8 ? x - 1 : x + 1;
        if (nx >= 0 && nx < SW) g[y * SW + nx] = ch;
      }
  }
  return g;
}
// Colours, light from the upper left, and a dark outline round the whole shape.
function sprPixels(letters, h, pal) {
  const P = { ...SPAL, ...(pal || {}) },
    col = ch => P[ch] || (P[ch.toLowerCase()] ? sprHex(P[ch.toLowerCase()], 0.72) : '#ff00ff'),
    out = new Array(SW * h).fill(null),
    at = (x, y) => (x < 0 || y < 0 || x >= SW || y >= h ? null : letters[y * SW + x]);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < SW; x++) {
      const ch = at(x, y);
      if (ch) {
        let c = col(ch);
        if (!SGLOW.includes(ch)) {
          if (!at(x + 1, y)) c = sprHex(c, 0.82);
          else if (!at(x, y - 1) || !at(x - 1, y)) c = sprHex(c, 1.1);
        }
        out[y * SW + x] = c;
      } else if (at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1)) out[y * SW + x] = 'rgba(18,12,6,0.85)';
    }
  return out;
}

const SCACHE = new Map();
// A built picture: { c: canvas, w, h (in device pixels), box: [x0, y0, x1, y1] in grid cells, h0: grid height }.
function sprBuild(key, frame, flip, p) {
  const k =
    key +
    (key === 'you' ? '/' + S.armor + '/' + S.weapon : '') +
    '|' +
    frame +
    '|' +
    (flip ? 1 : 0) +
    '|' +
    p.toFixed(3);
  if (SCACHE.has(k)) return SCACHE.get(k);
  const spec = sprSpec(key);
  if (!spec) return null;
  const h = spec.h || 32,
    fr = spec.body ? frame : key.startsWith('npc:') ? frame & 1 : 0, // animals breathe, things don't
    px = sprPixels(sprFrame(sprLetters(spec), h, fr), h, spec.pal),
    c = document.createElement('canvas'),
    W = Math.ceil(SW * p),
    H = Math.ceil(h * p);
  c.width = W;
  c.height = H;
  const g = c.getContext('2d'),
    box = [SW, h, 0, 0];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < SW; x++) {
      const v = px[y * SW + x];
      if (!v) continue;
      const gx = flip ? SW - 1 - x : x,
        x0 = Math.round(gx * p),
        y0 = Math.round(y * p);
      g.fillStyle = v;
      g.fillRect(x0, y0, Math.round((gx + 1) * p) - x0, Math.round((y + 1) * p) - y0);
      box[0] = Math.min(box[0], gx);
      box[1] = Math.min(box[1], y);
      box[2] = Math.max(box[2], gx + 1);
      box[3] = Math.max(box[3], y + 1);
    }
  const out = { c, w: W, h: H, box, h0: h, glow: spec.glow || null };
  if (SCACHE.size > 600) SCACHE.clear();
  SCACHE.set(k, out);
  return out;
}
// Draws a sprite with its bottom centre at (cx, by), size cells wide per pixel. Returns its clickable box, or null.
function sprDraw(g, key, cx, by, cell, dpr, alpha, frame, flip) {
  const s = sprBuild(key, frame || 0, !!flip, cell * dpr);
  if (!s) return null;
  const w = s.w / dpr,
    h = s.h / dpr,
    l = cx - w / 2,
    t = by - h;
  g.globalAlpha = alpha;
  g.drawImage(s.c, l, t, w, h);
  g.globalAlpha = 1;
  const [x0, y0, x1, y1] = s.box;
  return { l: l + x0 * cell, t: t + y0 * cell, r: l + x1 * cell, b: t + y1 * cell, glow: s.glow };
}

// ---- portraits: head and shoulders of the person you're talking to, in the header ----
// Found from the screen's title and icon, so no scene needs to ask for one. Blinks now and then.
function sprPortraitId(v) {
  if (!v || !v.title || typeof NPC === 'undefined') return null;
  for (const id in NPC) if (NPC[id].n === v.title && NPC[id].i === v.icon && SNPC[id]) return id;
  return null;
}
const SPORT = { rows: 17, cell: 5 }; // head and shoulders, from the top of the tallest hat
function sprPortraitDraw(cv, id, shut) {
  const spec = SNPC[id],
    h = 32,
    L = sprLetters(spec),
    rows = SPORT.rows,
    p = SPORT.cell,
    dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  let top = 1;
  if (!spec.body) {
    // an animal: frame whatever there is
    top = 0;
    while (top < h && !L.slice(top * SW, top * SW + SW).some(Boolean)) top++;
    top = Math.max(0, Math.min(top - 3, h - rows));
  }
  const px = sprPixels(
      L.map(ch => (shut && ch === 'e' ? 's' : ch)),
      h,
      spec.pal,
    ),
    W = SW * p,
    H = rows * p;
  cv.width = W * dpr;
  cv.height = H * dpr;
  if (cv.style) {
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
  }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = '#140e07';
  g.fillRect(0, 0, W, H);
  const lg = g.createRadialGradient(W / 2, H * 0.4, 2, W / 2, H * 0.4, W * 0.75);
  lg.addColorStop(0, 'rgba(255,176,0,0.16)');
  lg.addColorStop(1, 'rgba(255,176,0,0)');
  g.fillStyle = lg;
  g.fillRect(0, 0, W, H);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < SW; x++) {
      const v = px[(top + y) * SW + x];
      if (!v) continue;
      g.fillStyle = v;
      g.fillRect(x * p, y * p, p, p);
    }
  g.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
}
function sprPortrait(cv, id) {
  sprPortraitDraw(cv, id, false);
  const motion = !(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  if (!motion || typeof setTimeout !== 'function') return;
  const blink = () => {
    if (!cv.isConnected) return;
    sprPortraitDraw(cv, id, true);
    setTimeout(() => {
      if (!cv.isConnected) return;
      sprPortraitDraw(cv, id, false);
      setTimeout(blink, 2500 + Math.random() * 3500);
    }, 140);
  };
  setTimeout(blink, 1500 + Math.random() * 2500);
}
