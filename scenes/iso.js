'use strict';
// ================= THE ISOMETRIC VIEW =================
// The same tile maps as the flat view, drawn on a canvas in the style set by ART_STYLE.md.
// Looks only: walking, paths, claiming and every rule stay in scenes/walk.js.
// With no canvas (an old browser, the headless tests) the flat map is used instead.
// Fog of war is saved per place in S.seen. Light follows the day number, since the game has no hours.

const ISO_BG = '#050302';
const ISO_GROUND = {
  ',': '#8c7650',
  '.': '#6e5a3c',
  ';': '#6b6a2e',
  _: '#4a4238',
  ':': '#5e5246',
  '~': '#2e4a48',
  '+': '#5a3a20',
  E: '#8c7650',
};
const ISO_WALL = '#7a6650';
const ISO_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
const LIGHTS = [
  { n: 'Dawn', mul: '#f4cdb8', sh: 0.95, sight: 7, dust: '232,196,160' },
  { n: 'Noon', bleach: 0.09, sh: 0.35, sight: 7, dust: '226,204,160' },
  { n: 'Afternoon', mul: '#f6e8d2', sh: 0.6, sight: 7, dust: '220,190,140' },
  { n: 'Dusk', mul: '#e8aa86', glow: 0.08, sh: 1, sight: 7, dust: '236,170,120' },
  { n: 'Night', mul: '#7c8cba', glow: 0.2, sh: 0, sight: 5, dust: '150,172,210' },
];
const isoLight = () => LIGHTS[(S.day || 1) % LIGHTS.length];

let ISO = null; // what's on screen: layout, fog, and the shapes to pick clicks from

function canIso() {
  try {
    const c = typeof document !== 'undefined' && document.createElement && document.createElement('canvas');
    return !!(c && c.getContext && c.getContext('2d'));
  } catch (e) {
    return false;
  }
}
const isIso = () => is2D() && (!S || !S.view || S.view === 'iso') && canIso();

// ---- colour ----
function tone(hex, k, grey) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16,
    g = (n >> 8) & 255,
    b = n & 255;
  if (grey) {
    const l = 0.3 * r + 0.59 * g + 0.11 * b;
    r += (l - r) * grey;
    g += (l - g) * grey;
    b += (l - b) * grey;
  }
  const f = v => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function hash(x, y, s) {
  let h = (Math.imul(x + 101, 374761393) + Math.imul(y + 7, 668265263) + Math.imul(s || 0, 1274126177)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---- geometry: tile (x, y) has its top corner at isoTop, its centre at isoXY ----
const isoAt = (fx, fy) => ({ x: ISO.ox + (fx - fy) * ISO.half, y: ISO.oy + ((fx + fy) * ISO.half) / 2 });
const isoTop = (x, y) => isoAt(x, y);
const isoXY = (x, y) => isoAt(x + 0.5, y + 0.5);
function isoGround(px, py) {
  const a = (px - ISO.ox) / ISO.half,
    b = (py - ISO.oy) / (ISO.half / 2);
  return { x: Math.floor((a + b) / 2), y: Math.floor((b - a) / 2) };
}
function inPoly(pts, x, y) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i],
      [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
// The tile under a point on the canvas: the front-most thing drawn there, or the ground under it.
function isoPick(px, py) {
  if (!ISO) return null;
  // people first, even behind a wall, since they're what you click on
  for (const pri of [true, false])
    for (let i = ISO.hits.length - 1; i >= 0; i--)
      if (!pri === !ISO.hits[i].pri && inPoly(ISO.hits[i].pts, px, py)) return { x: ISO.hits[i].x, y: ISO.hits[i].y };
  const t = isoGround(px, py);
  return t.x >= 0 && t.y >= 0 && t.x < ISO.T.w && t.y < ISO.T.h ? t : null;
}
function isoClick(px, py) {
  const t = isoPick(px, py);
  if (t) walkTo(t.x, t.y);
  return t;
}

// ---- what each tile is drawn as ----
// kerb: the low outer wall. wall: a building block. facade: an object set into a wall (a door, a sign).
// obj: an object standing in the open. fence. ground.
function isoKinds(T) {
  const out = [],
    inner = (x, y) => chAt(T, x, y) === '#' && x > 0 && y > 0 && x < T.w - 1 && y < T.h - 1;
  for (let y = 0; y < T.h; y++)
    for (let x = 0; x < T.w; x++) {
      const ch = chAt(T, x, y),
        o = objAt(T, x, y);
      if (ch === '#') out.push(inner(x, y) ? 'wall' : 'kerb');
      else if (o && !(o.open && o.open()))
        out.push(neighbours4({ x, y }).some(p => inner(p.x, p.y)) ? 'facade' : 'obj');
      else if (ch === '=') out.push('fence');
      else out.push('ground');
    }
  return out;
}
// The ground under letters (people's spots, objects, where you arrive): whatever surrounds them.
function isoGroundCh(T, x, y) {
  const ch = chAt(T, x, y);
  if (ISO_GROUND[ch]) return ch;
  const n = {};
  for (const p of [...neighbours4({ x, y }), { x: x + 1, y: y + 1 }, { x: x - 1, y: y - 1 }]) {
    const c = chAt(T, p.x, p.y);
    if (ISO_GROUND[c] && c !== 'E' && c !== '~' && c !== '+') n[c] = (n[c] || 0) + 1;
  }
  return Object.keys(n).sort((a, b) => n[b] - n[a])[0] || '.';
}

// ---- fog of war ----
function isoSeen(loc, n) {
  S.seen = S.seen || {};
  const hex = S.seen[loc] || '',
    a = new Uint8Array(n);
  for (let i = 0; i < n; i++) a[i] = (parseInt(hex[i >> 2] || '0', 16) >> (i & 3)) & 1;
  return a;
}
function isoSeenPut(loc, a) {
  let s = '';
  for (let i = 0; i < a.length; i += 4) s += (a[i] | (a[i + 1] << 1) | (a[i + 2] << 2) | (a[i + 3] << 3)).toString(16);
  S.seen[loc] = s;
}
// You see in a circle round you, and walls block sight. 1 is plain sight, fading to 0 at the edge.
function isoSight(T, kind, R) {
  const p = S.pos,
    vis = new Float32Array(T.w * T.h),
    opaque = (x, y) => {
      const k = kind[y * T.w + x];
      return k === 'wall' || k === 'kerb' || k === 'facade';
    };
  const line = (x0, y0, x1, y1) => {
    const dx = Math.abs(x1 - x0),
      dy = Math.abs(y1 - y0),
      sx = x0 < x1 ? 1 : -1,
      sy = y0 < y1 ? 1 : -1;
    let e = dx - dy,
      x = x0,
      y = y0;
    while (!(x === x1 && y === y1)) {
      const e2 = 2 * e;
      if (e2 > -dy) {
        e -= dy;
        x += sx;
      }
      if (e2 < dx) {
        e += dx;
        y += sy;
      }
      if (!(x === x1 && y === y1) && opaque(x, y)) return false;
    }
    return true;
  };
  for (let y = 0; y < T.h; y++)
    for (let x = 0; x < T.w; x++) {
      const v = clamp(R + 0.5 - Math.hypot(x - p.x, y - p.y), 0, 1);
      if (v && (line(p.x, p.y, x, y) || line(x, y, p.x, p.y))) vis[y * T.w + x] = v;
    }
  // A wall shows when you can see the ground beside it (otherwise walls hide the walls next to them).
  const out = vis.slice();
  for (let y = 0; y < T.h; y++)
    for (let x = 0; x < T.w; x++) {
      if (!opaque(x, y)) continue;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= T.w || ny >= T.h || opaque(nx, ny)) continue;
          out[y * T.w + x] = Math.max(out[y * T.w + x], vis[ny * T.w + nx]);
        }
    }
  return out;
}

// ---- drawing the scene (once per change, into ISO.base) ----
function isoDraw() {
  const L = ISO,
    { T, people } = TOWN,
    h = L.half,
    q = h / 2,
    g = L.base.getContext('2d'),
    lt = L.light,
    hits = (L.hits = []);
  g.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = ISO_BG;
  g.fillRect(0, 0, L.W, L.H);
  const idx = (x, y) => y * T.w + x,
    kindAt = (x, y) => (x < 0 || y < 0 || x >= T.w || y >= T.h ? 'kerb' : L.kind[idx(x, y)]),
    tall = k => k === 'wall' || k === 'facade',
    fogK = i => (L.vis[i] > 0 ? 0.4 + 0.6 * L.vis[i] : L.seen[i] ? 0.34 : 0),
    fogG = i => (L.vis[i] > 0 ? 0 : 0.7),
    dia = (x, y, lift) => {
      const p = isoTop(x, y);
      return [
        [p.x, p.y - lift],
        [p.x + h, p.y + q - lift],
        [p.x, p.y + h - lift],
        [p.x - h, p.y + q - lift],
      ];
    },
    path = pts => {
      g.beginPath();
      pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      g.closePath();
    },
    lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f],
    line = (a, b, col, w) => {
      g.strokeStyle = col;
      g.lineWidth = w || 1;
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
    },
    pt = (fx, fy) => {
      const p = isoAt(fx, fy);
      return [p.x, p.y];
    },
    dot = Math.max(1, Math.round(L.s * 2.2));

  // Pass 1: the ground, flat, so nothing on it is ever covered by it.
  for (let y = 0; y < T.h; y++)
    for (let x = 0; x < T.w; x++) {
      const i = idx(x, y),
        k = fogK(i),
        kd = L.kind[i];
      if (!k || kd === 'wall' || kd === 'kerb' || kd === 'facade') continue;
      const gr = fogG(i),
        ch = L.gch[i],
        pts = dia(x, y, 0);
      path(pts);
      g.fillStyle = tone(ISO_GROUND[ch], k * (0.91 + 0.16 * hash(x, y)), gr);
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.045)';
      g.lineWidth = 1;
      g.stroke();
      const r = n => hash(x, y, n);
      if (ch === '.')
        for (let n = 0; n < 2; n++) {
          const [sx, sy] = pt(x + 0.2 + 0.6 * r(n), y + 0.2 + 0.6 * r(n + 9));
          g.fillStyle = tone('#54442c', k, gr);
          g.fillRect(sx, sy, dot, dot);
        }
      else if (ch === ',')
        for (let n = 0; n < 3; n++) {
          const [sx, sy] = pt(x + 0.2 + 0.6 * r(n), y + 0.2 + 0.6 * r(n + 9));
          g.fillStyle = tone('#a89070', k, gr);
          g.fillRect(sx, sy, dot, dot);
        }
      else if (ch === ';')
        for (let n = 0; n < 5; n++) {
          const [sx, sy] = pt(x + 0.15 + 0.7 * r(n), y + 0.15 + 0.7 * r(n + 9));
          line([sx, sy], [sx + h * 0.04, sy - h * 0.32], tone('#8e8a3c', k, gr), Math.max(1, L.s * 1.6));
        }
      else if (ch === '_') {
        if (r(1) < 0.55) line(pt(x + 0.2, y + 0.3 + 0.4 * r(2)), pt(x + 0.75, y + 0.3 + 0.4 * r(3)), 'rgba(0,0,0,0.3)');
      } else if (ch === ':')
        for (let n = 0; n < 3; n++) {
          const [sx, sy] = pt(x + 0.2 + 0.6 * r(n), y + 0.2 + 0.6 * r(n + 9)),
            rw = h * (0.09 + 0.06 * r(n + 4));
          g.fillStyle = tone('#3e352c', k, gr);
          g.beginPath();
          g.ellipse(sx, sy + rw * 0.3, rw, rw * 0.5, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = tone('#7c6e5e', k, gr);
          g.beginPath();
          g.ellipse(sx, sy, rw * 0.8, rw * 0.4, 0, 0, Math.PI * 2);
          g.fill();
        }
      else if (ch === '~') {
        if (r(1) < 0.6) line(pt(x + 0.3, y + 0.45), pt(x + 0.6, y + 0.45), `rgba(170,210,200,${0.22 * k})`);
      } else if (ch === '+') {
        line(pt(x + 0.1, y + 0.35), pt(x + 0.9, y + 0.35), 'rgba(0,0,0,0.35)');
        line(pt(x + 0.1, y + 0.65), pt(x + 0.9, y + 0.65), 'rgba(0,0,0,0.35)');
      } else if (ch === 'E') {
        // an amber arrow pointing off the map
        const dx = x === 0 ? -1 : x === T.w - 1 ? 1 : 0,
          dy = y === 0 ? -1 : y === T.h - 1 ? 1 : 0,
          f = pt(x + 0.5 + dx * 0.3, y + 0.5 + dy * 0.3),
          b1 = pt(x + 0.5 - dx * 0.05 + dy * 0.25, y + 0.5 - dy * 0.05 + dx * 0.25),
          b2 = pt(x + 0.5 - dx * 0.05 - dy * 0.25, y + 0.5 - dy * 0.05 - dx * 0.25);
        g.strokeStyle = `rgba(255,176,0,${0.5 + 0.5 * k})`;
        g.lineWidth = Math.max(2, L.s * 4);
        g.beginPath();
        g.moveTo(b1[0], b1[1]);
        g.lineTo(f[0], f[1]);
        g.lineTo(b2[0], b2[1]);
        g.stroke();
        g.fillStyle = 'rgba(255,176,0,0.14)';
        path(pts);
        g.fill();
      }
      // a building on the upper left throws its shadow on you
      if (lt.sh && tall(kindAt(x - 1, y))) {
        const f = 0.25 + 0.5 * lt.sh;
        path([pts[0], lerp(pts[0], pts[1], f), lerp(pts[3], pts[2], f), pts[3]]);
        g.fillStyle = 'rgba(0,0,0,0.25)';
        g.fill();
      }
      hits.push({ x, y, pts });
    }

  // Pass 2: everything that stands up, back to front.
  const P = S.pos,
    items = [],
    fs = Math.max(12, L.tw * 0.72),
    claimed = claim(TOWN.v.opts).by;
  // A wall just in front of you, or of anyone in sight, turns see-through.
  const front = new Set();
  for (const k of [
    P.x + ',' + P.y,
    ...Object.keys(people).filter(k => {
      const [x, y] = k.split(',').map(Number);
      return L.vis[idx(x, y)] > 0;
    }),
  ]) {
    const [x, y] = k.split(',').map(Number);
    front
      .add(x + 1 + ',' + y)
      .add(x + ',' + (y + 1))
      .add(x + 1 + ',' + (y + 1));
  }
  const inFront = (x, y) => front.has(x + ',' + y);
  const block = (x, y, H, k, gr, alpha, door) => {
    const t = dia(x, y, H),
      b = dia(x, y, 0),
      sil = [t[0], t[1], b[1], b[2], b[3], t[3]],
      shade = hash(x, y, 3) * 0.08;
    g.globalAlpha = alpha;
    path([t[3], t[2], b[2], b[3]]);
    g.fillStyle = tone(ISO_WALL, k * (0.75 + shade), gr);
    g.fill();
    path([t[2], t[1], b[1], b[2]]);
    g.fillStyle = tone(ISO_WALL, k * (0.55 + shade), gr);
    g.fill();
    path(t);
    g.fillStyle = tone(ISO_WALL, k * (0.94 + shade), gr);
    g.fill();
    if (H > h * 0.4) {
      // corrugated tin: a few dark seams down each face
      for (const f of [0.33, 0.66]) {
        line(lerp(t[3], t[2], f), lerp(b[3], b[2], f), 'rgba(0,0,0,0.13)');
        line(lerp(t[2], t[1], f), lerp(b[2], b[1], f), 'rgba(0,0,0,0.13)');
      }
    }
    if (door) {
      const [e0, e1] = door === 'l' ? [b[3], b[2]] : [b[2], b[1]],
        a = lerp(e0, e1, 0.32),
        c = lerp(e0, e1, 0.68),
        up = H * 0.72;
      path([a, c, [c[0], c[1] - up], [a[0], a[1] - up]]);
      g.fillStyle = tone('#140d06', 1, 0);
      g.fill();
      g.strokeStyle = tone('#3a2a14', k, gr);
      g.lineWidth = 1;
      g.stroke();
    }
    path(sil);
    g.strokeStyle = 'rgba(18,12,6,0.6)';
    g.lineWidth = 1;
    g.stroke();
    line(t[3], t[2], 'rgba(18,12,6,0.45)');
    line(t[2], t[1], 'rgba(18,12,6,0.45)');
    line(t[3], t[0], `rgba(255,230,190,${0.16 * k})`);
    g.globalAlpha = 1;
    return sil;
  };
  const glyph = (x, y, ch, lift, alpha, tint, pri) => {
    const c = isoXY(x, y),
      by = c.y - lift + fs * 0.1;
    g.globalAlpha = alpha;
    g.filter = tint ? 'sepia(0.35) saturate(0.8)' : 'none';
    g.font = `${Math.round(fs)}px ${ISO_FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#fff'; // colour emoji take the fill's alpha in some browsers
    g.fillText(ch, c.x, by);
    g.filter = 'none';
    g.globalAlpha = 1;
    const l = c.x - fs * 0.5,
      tp = by - fs * 0.95;
    hits.push({
      x,
      y,
      pri,
      pts: [
        [l, tp],
        [l + fs, tp],
        [l + fs, by + fs * 0.1],
        [l, by + fs * 0.1],
      ],
    });
  };
  const shadow = (x, y) => {
    const c = isoXY(x, y);
    g.fillStyle = 'rgba(0,0,0,0.32)';
    g.beginPath();
    g.ellipse(c.x, c.y, h * 0.4, q * 0.42, 0, 0, Math.PI * 2);
    g.fill();
  };
  // Pixel sprites (scenes/sprite.js), standing on the tile; anything without one falls back to its emoji.
  const cell = (L.tw * 0.95) / 32,
    youX = isoXY(P.x, P.y).x,
    glows = [];
  const spr = (x, y, key, lift, alpha, o) => {
    const c = isoXY(x, y),
      sign = key.startsWith('sign:'),
      r = sprDraw(
        g,
        key,
        c.x,
        c.y - lift + (sign ? 0 : q * 0.25),
        sign ? (L.tw * 0.62) / 16 : cell,
        L.dpr,
        alpha,
        o.frame,
        o.flip,
      );
    if (!r) return false;
    hits.push({
      x,
      y,
      pri: o.pri,
      pts: [
        [r.l, r.t],
        [r.r, r.t],
        [r.r, r.b],
        [r.l, r.b],
      ],
    });
    if (r.glow) glows.push({ x: c.x, y: (r.t + r.b) / 2, col: r.glow });
    return true;
  };
  const breath = (x, y) => ((L.tick || 0) + (hash(x, y, 5) < 0.5 ? 1 : 0)) % 2;
  const okey = o => TOWN.loc + '.' + o.k;
  for (let y = 0; y < T.h; y++)
    for (let x = 0; x < T.w; x++) {
      const i = idx(x, y),
        kd = L.kind[i],
        k = fogK(i),
        gr = fogG(i),
        d = x + y;
      if (!k) continue;
      if (kd === 'wall' || kd === 'kerb' || kd === 'facade') {
        const H = kd === 'kerb' ? 8 * L.s : 28 * L.s;
        items.push([
          d,
          0,
          () => {
            const o = kd === 'facade' && objAt(T, x, y),
              open = (a, b) => !['wall', 'kerb', 'facade'].includes(kindAt(a, b)),
              door = o ? (open(x, y + 1) ? 'l' : open(x + 1, y) ? 'r' : '') : '';
            hits.push({ x, y, pts: block(x, y, H, k, gr, kd !== 'kerb' && inFront(x, y) ? 0.3 : 1, door) });
            const a = L.vis[i] > 0 ? 1 : 0.45;
            if (o && !spr(x, y, 'sign:' + okey(o), H + q * 0.55, a, {})) glyph(x, y, o.i, H + q * 0.9, a, true);
          },
        ]);
      } else if (kd === 'fence') {
        items.push([
          d,
          1,
          () => {
            const c = isoXY(x, y),
              Hf = 15 * L.s,
              col = tone('#a8683a', k, gr),
              rail = (fx, fy) => {
                const n = isoXY(fx, fy);
                line([c.x, c.y - Hf * 0.85], [n.x, n.y - Hf * 0.85], col, Math.max(1, L.s * 2));
                line([c.x, c.y - Hf * 0.4], [n.x, n.y - Hf * 0.4], tone('#8a6a50', k, gr), Math.max(1, L.s * 1.5));
              };
            if (kindAt(x + 1, y) === 'fence' || chAt(T, x + 1, y) === '+') rail(x + 1, y);
            if (kindAt(x, y + 1) === 'fence' || chAt(T, x, y + 1) === '+') rail(x, y + 1);
            if (kindAt(x - 1, y) !== 'fence' && chAt(T, x - 1, y) === '+') rail(x - 1, y);
            if (kindAt(x, y - 1) !== 'fence' && chAt(T, x, y - 1) === '+') rail(x, y - 1);
            line([c.x, c.y], [c.x, c.y - Hf], col, Math.max(1.5, L.s * 3.5));
          },
        ]);
      } else if (kd === 'obj') {
        const o = objAt(T, x, y);
        items.push([
          d,
          2,
          () => {
            const a = L.vis[i] > 0 ? 1 : 0.45;
            shadow(x, y);
            if (!spr(x, y, 'prop:' + okey(o), 0, a, {})) glyph(x, y, o.i, 0, a, true);
          },
        ]);
      }
      const who = people[x + ',' + y];
      if (who && L.vis[i] > 0 && !(P.x === x && P.y === y))
        items.push([
          d,
          2,
          () => {
            shadow(x, y);
            const o = { pri: true, frame: breath(x, y), flip: youX < isoXY(x, y).x };
            if (!spr(x, y, 'npc:' + who, 0, 1, o)) glyph(x, y, NPC[who].i, 0, 1, true, true);
          },
        ]);
    }
  items.push([
    P.x + P.y,
    3,
    () => {
      const c = isoXY(P.x, P.y);
      shadow(P.x, P.y);
      g.strokeStyle = '#a8e07c';
      g.lineWidth = Math.max(1.5, L.s * 3);
      g.beginPath();
      g.ellipse(c.x, c.y, h * 0.55, q * 0.58, 0, 0, Math.PI * 2);
      g.stroke();
      const o = { frame: L.stride ? 2 : (L.tick || 0) % 2, flip: L.face < 0 };
      if (!spr(P.x, P.y, 'you', 0, 1, o)) glyph(P.x, P.y, '🧍', 0, 1, false);
    },
  ]);
  // Someone just died here: the body lies on a free tile near the middle (looks only).
  // Only for a death in this place: a kill on the road shouldn't leave a body in the next town.
  if (S.f && S.f.corpse && (!isoCorpse || isoCorpse.name !== S.f.corpse))
    isoCorpse = { name: S.f.corpse, loc: isoPrevLoc === TOWN.loc ? TOWN.loc : null };
  if (S.f && S.f.corpse && isoCorpse.loc === TOWN.loc) {
    const free = [];
    for (let y = 1; y < T.h - 1; y++)
      for (let x = 1; x < T.w - 1; x++)
        if (
          L.kind[idx(x, y)] === 'ground' &&
          walkable(T, x, y) &&
          !people[x + ',' + y] &&
          !(x === P.x && y === P.y) &&
          chAt(T, x, y) !== 'E'
        )
          free.push({ x, y });
    let hh = 0;
    for (const ch of String(S.f.corpse)) hh = (hh * 31 + ch.charCodeAt(0)) % 9973;
    const at = free.length && free[hh % free.length];
    if (at && L.seen[idx(at.x, at.y)])
      items.push([at.x + at.y, 1, () => spr(at.x, at.y, 'corpse', 0, L.vis[idx(at.x, at.y)] > 0 ? 1 : 0.45, {})]);
  }
  items.sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(it => it[2]());

  // The light of the day, then a dark edge like an old screen.
  if (lt.mul) {
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = lt.mul;
    g.fillRect(0, 0, L.W, L.H);
  }
  if (lt.bleach) {
    g.globalCompositeOperation = 'screen';
    g.fillStyle = `rgba(235,222,196,${lt.bleach})`;
    g.fillRect(0, 0, L.W, L.H);
  }
  if (lt.glow) {
    // a little warm light round you, as far as you can see
    const c = isoXY(P.x, P.y),
      rx = lt.sight * h * 1.45;
    g.save();
    g.globalCompositeOperation = 'screen';
    g.translate(c.x, c.y);
    g.scale(1, 0.5);
    const lg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    lg.addColorStop(0, `rgba(255,178,100,${lt.glow})`);
    lg.addColorStop(1, 'rgba(255,178,100,0)');
    g.fillStyle = lg;
    g.fillRect(-rx, -rx, rx * 2, rx * 2);
    g.restore();
  }
  // Things that glow (Nigel) shine through the dark.
  for (const gl of glows) {
    const rr = L.tw * 1.3,
      lg = g.createRadialGradient(gl.x, gl.y, 0, gl.x, gl.y, rr),
      n = parseInt(gl.col.slice(1), 16),
      rgb = (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    g.globalCompositeOperation = 'screen';
    lg.addColorStop(0, 'rgba(' + rgb + ',0.35)');
    lg.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = lg;
    g.fillRect(gl.x - rr, gl.y - rr, rr * 2, rr * 2);
  }
  g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(
    L.W / 2,
    L.H / 2,
    Math.min(L.W, L.H) * 0.35,
    L.W / 2,
    L.H / 2,
    Math.max(L.W, L.H) * 0.62,
  );
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  g.fillStyle = vg;
  g.fillRect(0, 0, L.W, L.H);

  // Things you can use right now, for the pulsing highlight.
  L.live = [];
  for (const o of claimed.keys())
    if (!(o.open && o.open()) && (L.vis[idx(o.x, o.y)] > 0 || L.seen[idx(o.x, o.y)]))
      L.live.push({ x: o.x, y: o.y, lift: L.kind[idx(o.x, o.y)] === 'facade' ? 28 * L.s : 0 });
}

// ---- every frame: the scene, the highlights, the dust ----
let isoPrevLoc = null, // the place drawn last time, and the body lying here, if any (looks only, not saved)
  isoCorpse = null;
let isoRaf = 0,
  isoSeed = 12345;
const isoRand = () => (isoSeed = (Math.imul(isoSeed, 1103515245) + 12345) & 0x7fffffff) / 0x7fffffff;
const isoNow = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
const isoMotion = () =>
  !(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
function isoDust(L) {
  const n = Math.round(clamp((L.W * L.H) / 8000, 24, 90) * (L.light.n === 'Night' ? 0.5 : 1));
  return Array.from({ length: n }, () => ({
    x: isoRand() * L.W,
    y: isoRand() * L.H,
    r: isoRand() < 0.3 ? 2 : 1,
    a: 0.15 + isoRand() * 0.25,
    v: 6 + isoRand() * 16,
    ph: isoRand() * 6.28,
  }));
}
function isoOutline(g, x, y, lift, col, w) {
  const p = isoTop(x, y),
    h = ISO.half;
  g.strokeStyle = col;
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(p.x, p.y - lift + 1);
  g.lineTo(p.x + h - 2, p.y + h / 2 - lift);
  g.lineTo(p.x, p.y + h - lift - 1);
  g.lineTo(p.x - h + 2, p.y + h / 2 - lift);
  g.closePath();
  g.stroke();
}
function isoFrame(t) {
  if (isoMotion()) {
    const tick = Math.floor(t / 650);
    if (tick !== ISO.tick) {
      ISO.tick = tick;
      if (ISO.stride && t - ISO.stepAt > 220) ISO.stride = 0;
      isoDraw();
    }
  }
  const L = ISO,
    g = L.cv.getContext('2d'),
    dt = L.last ? Math.min(0.1, (t - L.last) / 1000) : 0;
  L.last = t;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(L.base, 0, 0);
  g.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
  const pulse = 0.4 + 0.3 * Math.sin(t / 380);
  for (const o of L.live) isoOutline(g, o.x, o.y, o.lift, `rgba(255,176,0,${pulse})`, Math.max(1.5, L.s * 3));
  if (L.hover) {
    const k = L.kind[L.hover.y * L.T.w + L.hover.x];
    isoOutline(
      g,
      L.hover.x,
      L.hover.y,
      k === 'wall' || k === 'facade' ? 28 * L.s : k === 'kerb' ? 8 * L.s : 0,
      'rgba(255,176,0,0.85)',
      1,
    );
  }
  // Dust drifts left to right; now and then a gust thickens it.
  const G = L.gust;
  if (t > G.next) {
    G.until = t + 2500 + isoRand() * 2000;
    G.next = G.until + 7000 + isoRand() * 9000;
  }
  const want = t < G.until ? 1 : 0;
  G.f += (want - G.f) * Math.min(1, dt * 1.5);
  for (const m of L.dust) {
    m.x += m.v * (1 + 2.5 * G.f) * dt;
    m.y += Math.sin(t / 1500 + m.ph) * 4 * dt;
    if (m.x > L.W + 2) {
      m.x = -2;
      m.y = isoRand() * L.H;
    }
    g.fillStyle = `rgba(${L.light.dust},${Math.min(0.6, m.a * (1 + 0.6 * G.f))})`;
    g.fillRect(m.x, m.y, m.r, m.r);
  }
}
function isoLoop(t) {
  isoRaf = 0;
  if (!ISO || !ISO.cv.isConnected || !isIso()) return;
  isoFrame(t);
  isoRaf = requestAnimationFrame(isoLoop);
}

// ---- putting it on screen: called after the view's HTML is set ----
function isoHTML() {
  return '<canvas id="isoc" class="iso"></canvas>' + townLegend(isoLight().n + '. ');
}
function isoMount() {
  const cv = $('isoc');
  if (!TOWN || !cv || !cv.getContext) return;
  const T = TOWN.T,
    vw = $('view'),
    avail = Math.max(200, ((vw && vw.clientWidth) || 832) - 10),
    half = Math.max(6, Math.min(32, Math.floor(avail / (T.w + T.h)))),
    s = half / 32,
    tw = half * 2,
    top = Math.ceil(28 * s + tw * 0.5),
    W = (T.w + T.h) * half,
    H = Math.ceil(top + ((T.w + T.h) * half) / 2 + 4),
    dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1),
    old = ISO && ISO.loc === T.loc && ISO.W === W ? ISO : null;
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  if (cv.style) cv.style.width = W + 'px';
  const base = old ? old.base : document.createElement('canvas');
  base.width = cv.width;
  base.height = cv.height;
  ISO = {
    loc: T.loc,
    T,
    cv,
    base,
    dpr,
    half,
    s,
    tw,
    W,
    H,
    ox: T.h * half,
    oy: top,
    light: isoLight(),
    hover: old ? old.hover : null,
    dust: old ? old.dust : null,
    gust: old ? old.gust : { until: 0, next: isoNow() + 5000, f: 0 },
    last: 0,
  };
  // You face the way you last walked (on screen), and step on alternate feet as you go.
  const now = isoNow(),
    was = old && old.pos,
    moved = was && (was.x !== S.pos.x || was.y !== S.pos.y),
    sx = moved ? S.pos.x - was.x - (S.pos.y - was.y) : 0;
  ISO.pos = { x: S.pos.x, y: S.pos.y };
  ISO.face = sx ? Math.sign(sx) : old ? old.face : 1;
  ISO.stepN = moved ? (old.stepN || 0) + 1 : old ? old.stepN || 0 : 0;
  ISO.stride = moved ? ISO.stepN % 2 : 0;
  ISO.stepAt = moved ? now : old ? old.stepAt : 0;
  ISO.tick = isoMotion() ? Math.floor(now / 650) : 0;
  if (moved && typeof sfx === 'function') sfx('step');
  ISO.kind = isoKinds(T);
  if (!T.gch) T.gch = T.rows.flatMap((r, y) => [...r].map((_, x) => isoGroundCh(T, x, y)));
  ISO.gch = T.gch;
  ISO.vis = isoSight(T, ISO.kind, ISO.light.sight);
  ISO.seen = isoSeen(T.loc, T.w * T.h);
  ISO.vis.forEach((v, i) => v > 0 && (ISO.seen[i] = 1));
  isoSeenPut(T.loc, ISO.seen);
  isoDraw();
  isoPrevLoc = T.loc;
  if (!ISO.dust) ISO.dust = isoDust(ISO);
  isoFrame(isoNow());
  if (!isoRaf && isoMotion() && typeof requestAnimationFrame === 'function') isoRaf = requestAnimationFrame(isoLoop);
}

// ---- mouse ----
function isoPoint(e) {
  const r = ISO.cv.getBoundingClientRect();
  return [((e.clientX - r.left) * ISO.W) / r.width, ((e.clientY - r.top) * ISO.H) / r.height];
}
(() => {
  const vw = typeof document !== 'undefined' && document.getElementById('view');
  if (!vw || !vw.addEventListener) return;
  vw.addEventListener('mousemove', e => {
    if (!ISO || !e.target || e.target.id !== 'isoc') return;
    const t = isoPick(...isoPoint(e)),
      same = ISO.hover && t && t.x === ISO.hover.x && t.y === ISO.hover.y;
    if (same) return;
    ISO.hover = t;
    if (!isoRaf) isoFrame(isoNow());
  });
  vw.addEventListener('mouseleave', () => {
    if (ISO && ISO.hover) {
      ISO.hover = null;
      if (!isoRaf) isoFrame(isoNow());
    }
  });
  if (typeof window !== 'undefined' && window.addEventListener) {
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(() => TOWN && S && S.scene === 'hub' && isIso() && isoMount(), 150);
    });
  }
})();
