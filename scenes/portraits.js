'use strict';
// ================= PORTRAITS: a detailed picture of everyone you can talk to (v9.0) =================
// Will: "forget about all the 2D thing, turn it back into text based, but draw detailed portraits for each
// character. Still optimise for phone." Each portrait is head and shoulders, drawn in code as pixel art on a
// 64 x 64 grid, our own art (nothing traced or borrowed). Shown big at the top of their talk screen, and on the
// ending slides. Anyone without one here falls back to the small sprite portrait (scenes/sprite.js).
//
// PORTRAIT[id] = (g, PX, o) => draws on a 64 x 64 grid. g is the 2d context (one unit = one pixel),
//   PX is the helpers below, o.shut is true for a blink (draw the eyes closed), o.mood the NPC's current mood.
const PORT_W = 64,
  PORT_H = 64;
const PX = {
  r(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  },
  // a pixel
  p(g, x, y, c) {
    g.fillStyle = c;
    g.fillRect(x, y, 1, 1);
  },
  // rows of palette letters, '.' see-through: PX.rows(g, x, y, ['..aa..', '.abba.'], { a: '#000', b: '#fff' })
  rows(g, x, y, rows, pal) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const c = pal[row[i]];
        if (c) {
          g.fillStyle = c;
          g.fillRect(x + i, y + j, 1, 1);
        }
      }
    });
  },
  // a filled ellipse, pixel-snapped
  oval(g, cx, cy, rx, ry, c) {
    g.fillStyle = c;
    for (let y = -ry; y <= ry; y++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      g.fillRect(cx - w, cy + y, w * 2 + 1, 1);
    }
  },
};
const PORTRAIT = {};

function portraitDraw(cv, id, shut) {
  const f = PORTRAIT[id];
  if (!f) return false;
  const dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1),
    css = 128; // shown at 2x on the phone: 128 css pixels square
  cv.width = css * dpr;
  cv.height = css * dpr;
  if (cv.style) {
    cv.style.width = css + 'px';
    cv.style.height = css + 'px';
  }
  const g = cv.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.setTransform((css * dpr) / PORT_W, 0, 0, (css * dpr) / PORT_H, 0, 0);
  g.fillStyle = '#140e07';
  g.fillRect(0, 0, PORT_W, PORT_H);
  f(g, PX, { shut: !!shut, mood: typeof S !== 'undefined' && S && S.n && S.n[id] ? S.n[id].op : 0 });
  return true;
}

// ---- the toolkit: colour ramps, shaded masks, eyes and backgrounds. Light comes from the top left. ----
Object.assign(PX, {
  // '#rrggbb' to [h 0..360, s 0..1, l 0..1] and back
  hsl(c) {
    const n = parseInt(c.slice(1), 16),
      r = (n >> 16) / 255,
      gr = ((n >> 8) & 255) / 255,
      b = (n & 255) / 255,
      mx = Math.max(r, gr, b),
      mn = Math.min(r, gr, b),
      l = (mx + mn) / 2,
      d = mx - mn;
    if (!d) return [0, 0, l];
    const s = d / (1 - Math.abs(2 * l - 1));
    let h = mx === r ? ((gr - b) / d) % 6 : mx === gr ? (b - r) / d + 2 : (r - gr) / d + 4;
    return [(h * 60 + 360) % 360, s, l];
  },
  hex(h, s, l) {
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    const k = n => (n + h / 30) % 12,
      a = s * Math.min(l, 1 - l),
      f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
    return '#' + ((1 << 24) | (f(0) << 16) | (f(8) << 8) | f(4)).toString(16).slice(1);
  },
  // turn a hue towards another one, the short way round
  hueTo(h, t, a) {
    const d = ((t - h + 540) % 360) - 180;
    return (h + Math.sign(d) * Math.min(Math.abs(d), a) + 360) % 360;
  },
  // one material in five shades: o ink, d shadow, m base, l lit, h highlight. Shadows lean purple, lights lean gold.
  ramp(c) {
    const [h, s, l] = PX.hsl(c);
    return {
      o: PX.hex(PX.hueTo(h, 260, 25), s * 0.6, Math.min(l * 0.32, 0.11)),
      d: PX.hex(PX.hueTo(h, 260, 12), Math.min(1, s * 1.08), l * 0.68),
      m: c,
      l: PX.hex(PX.hueTo(h, 50, 8), s * 0.95, l + (1 - l) * 0.24),
      h: PX.hex(PX.hueTo(h, 55, 12), s * 0.8, l + (1 - l) * 0.46),
    };
  },
  // a mask: pixels added by shapes, then painted in one go with an ink outline and top-left light
  mask() {
    const s = new Set(),
      // room for big drawings too (a town is 384 wide): 4096 across, from -512
      K = (x, y) => (y + 512) * 4096 + x + 512,
      M = {
        s,
        has: (x, y) => s.has(K(x, y)),
        px(x, y) {
          s.add(K(Math.round(x), Math.round(y)));
          return M;
        },
        rect(x, y, w, h) {
          for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) s.add(K(x + i, y + j));
          return M;
        },
        oval(cx, cy, rx, ry) {
          for (let y = -ry; y <= ry; y++) {
            const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
            for (let x = -w; x <= w; x++) s.add(K(cx + x, cy + y));
          }
          return M;
        },
        // rows of characters: anything but '.' or ' ' is in
        rows(x, y, rows) {
          rows.forEach((r, j) => {
            for (let i = 0; i < r.length; i++) if (r[i] !== '.' && r[i] !== ' ') s.add(K(x + i, y + j));
          });
          return M;
        },
        // one span per row, from y: [x1, x2] inclusive
        spans(y, sp) {
          sp.forEach((a, j) => a && M.rect(a[0], y + j, a[1] - a[0] + 1, 1));
          return M;
        },
        // a trapezoid row by row: from (xa1..xa2) at y1 to (xb1..xb2) at y2
        trap(y1, y2, xa1, xa2, xb1, xb2) {
          for (let y = y1; y <= y2; y++) {
            const t = y2 === y1 ? 0 : (y - y1) / (y2 - y1);
            M.rect(
              Math.round(xa1 + (xb1 - xa1) * t),
              y,
              Math.round(xa2 + (xb2 - xa2) * t) - Math.round(xa1 + (xb1 - xa1) * t) + 1,
              1,
            );
          }
          return M;
        },
        // a straight stroke w pixels thick
        line(x0, y0, x1, y1, w = 1) {
          const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
          for (let i = 0; i <= n; i++)
            M.rect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), w, w);
          return M;
        },
        // take pixels out: (x, y) => true removes it
        cut(f) {
          for (const k of [...s]) if (f((k % 4096) - 512, Math.floor(k / 4096) - 512)) s.delete(k);
          return M;
        },
        // keep only what is also in another mask
        and(o) {
          for (const k of [...s]) if (!o.s.has(k)) s.delete(k);
          return M;
        },
        add(o) {
          for (const k of o.s) s.add(k);
          return M;
        },
        each(f) {
          for (const k of s) f((k % 4096) - 512, Math.floor(k / 4096) - 512);
        },
        // paint: R is a ramp. o.line false skips the outline, o.t is where the shadow side starts (0..1 across
        // each row), o.flat paints just R.m, o.hi adds a highlight rim, o.ink a different outline colour
        paint(g, R, o = {}) {
          const has = M.has,
            T = o.t === undefined ? 0.7 : o.t,
            ext = {};
          M.each((x, y) => {
            const e = ext[y] || (ext[y] = [x, x]);
            if (x < e[0]) e[0] = x;
            if (x > e[1]) e[1] = x;
          });
          M.each((x, y) => {
            let c = R.m;
            const edge = !has(x - 1, y) || !has(x + 1, y) || !has(x, y - 1) || !has(x, y + 1);
            if (o.line !== false && edge) c = o.ink || R.o;
            else if (!o.flat) {
              const [x1, x2] = ext[y],
                t = (x - x1) / Math.max(1, x2 - x1),
                dark = t > T || (t > T - 0.08 && (x + y) % 2) || !has(x, y + 2) || !has(x + 2, y + 1),
                lit = !has(x - 2, y) || !has(x - 1, y - 2) || !has(x - 2, y - 1);
              if (dark && !(lit && t < 0.3)) c = R.d;
              else if (lit && t < 0.6) c = o.hi && (!has(x - 1, y - 1) || !has(x - 2, y)) && t < 0.4 ? R.h : R.l;
            }
            PX.p(g, x, y, c);
          });
          return M;
        },
      };
    return M;
  },
  // rows with a palette, but '.' and ' ' both see-through (PX.rows already does this for missing letters)
  // ---- eyes: (x, y) is the top-left of the lid line. k: w width 3..5, iris, white, skin (a ramp), tall (2 rows),
  // look -1/0/1, lash (a flick at the outer corner), lid (a heavy lid row over the top), bag (a shadow under)
  eye(g, o, x, y, k, flip) {
    const w = k.w || 4,
      S = k.skin,
      ink = k.ink || S.o;
    if (o.shut) {
      PX.r(g, x, y, w, 2 + (k.tall ? 1 : 0), S.m);
      PX.r(g, x, y + 1, w, 1, ink);
      if (k.lash) PX.p(g, flip ? x - 1 : x + w, y + 1, ink);
      if (k.bag) PX.r(g, x, y + 2, w, 1, S.d);
      return;
    }
    if (k.lid) PX.r(g, x, y - 1, w, 1, S.d);
    PX.r(g, x, y, w, 1, ink);
    const wh = k.white || '#e8dcc8',
      ir = k.iris || '#4a3020',
      lk = k.look || 0,
      ix = x + Math.floor((w - 2) / 2) + lk;
    PX.r(g, x, y + 1, w, 1, wh);
    PX.p(g, ix, y + 1, ir);
    PX.p(g, ix + 1, y + 1, k.pupil || '#120a08');
    if (k.tall) {
      PX.r(g, x, y + 2, w, 1, S.d);
      PX.r(g, ix, y + 2, 2, 1, ir);
    }
    if (k.lash) PX.p(g, flip ? x - 1 : x + w, y, ink);
    if (k.bag) PX.r(g, x, y + (k.tall ? 3 : 2), w, 1, S.d);
  },
  // a pair: left eye at x, right eye at x + gap (the right one is mirrored for lashes)
  eyes(g, o, x, y, gap, k) {
    PX.eye(g, o, x, y, k, true);
    PX.eye(g, o, x + gap, y, k, false);
  },
  line(g, x0, y0, x1, y1, c, w = 1) {
    PX.mask().line(x0, y0, x1, y1, w).paint(g, { m: c }, { line: false, flat: true });
  },
  // a head: an oval with the jaw narrowing from jy down (k pixels in per row), shaded
  head(g, cx, cy, rx, ry, S, jy, k = 1, o = {}) {
    return PX.mask()
      .oval(cx, cy, rx, ry)
      .cut((x, y) => jy !== undefined && y > jy && Math.abs(x - cx) > rx - (y - jy) * k)
      .paint(g, S, { t: 0.68, hi: 1, ...o });
  },
  ear(g, x, y, S, h = 3) {
    PX.mask().oval(x, y, 1, h).paint(g, S);
  },
  // shoulders: a trapezoid from (xa1..xa2) at y down to (xb1..xb2) at the bottom
  torso(g, R, y, xa1, xa2, xb1, xb2, o = {}) {
    return PX.mask()
      .trap(y, 63, xa1, xa2, xb1, xb2)
      .paint(g, R, { t: 0.7, ...o });
  },
  // noses, mouths and brows, centred on x. Letters: l lit, d shadow, o ink, m base, w teeth, r inside
  NOSE: {
    long: ['.l.', '.ld', '.ld', '.ld', 'lld', 'dood'],
    button: ['.l.', 'lld', 'dod'],
    small: ['.l', 'ld', 'o.'],
    broad: ['..l..', '..ld.', '.lld.', 'lmmdd', 'do.od'],
    hook: ['.l..', '.ld.', '.lld', '.lld', 'll.d', '.doo'],
    bulb: ['.l..', '.ld.', '.ld.', 'lhld', 'llmd', 'dood'],
    flat: ['.l.', '.d.', 'ldd', 'o.o'],
  },
  nose(g, x, y, kind, S) {
    const r = PX.NOSE[kind] || kind;
    PX.rows(g, x - Math.floor(r[0].length / 2), y, r, { l: S.l, d: S.d, o: S.o, m: S.m, h: S.h });
  },
  MOUTH: {
    flat: ['ooooo'],
    smile: ['o.....o', '.ooooo.'],
    grin: ['oooooooo', 'owwwwwwo', '.oooooo.'],
    frown: ['.ooooo.', 'o.....o'],
    smirk: ['......o', 'oooooo.'],
    open: ['.ooo.', 'orrro', 'orrro', '.ooo.'],
    pout: ['.ooo.', 'ollld', '.ddd.'],
  },
  mouth(g, x, y, kind, S, lip, teeth) {
    const r = PX.MOUTH[kind] || kind;
    PX.rows(g, x - Math.floor(r[0].length / 2), y, r, {
      o: lip || S.o,
      w: teeth || '#d8ccb0',
      r: '#3a1414',
      l: S.l,
      d: S.d,
      m: S.m,
      x: '#8a7a60',
    });
  },
  BROW: {
    flat: ['aaaa'],
    angry: ['aa...', '..aaa'],
    sad: ['...aa', 'aaa..'],
    raised: ['.aaa.', 'a...a'],
    thick: ['aaaaa', 'aaaaa'],
    cross: ['aa...', '.aaaa', '...aa'],
    arch: ['.aaa', 'a...'],
  },
  // a pair of brows: the left one at x, the right one at x + gap, mirrored
  brows(g, x, y, gap, kind, c) {
    const r = PX.BROW[kind] || kind;
    PX.rows(g, x, y, r, { a: c });
    PX.rows(
      g,
      x + gap,
      y,
      r.map(s => [...s].reverse().join('')),
      { a: c },
    );
  },
  // a sky or wall in bands, top to bottom, with a dithered row where two colours meet
  bands(g, cols, y0 = 0, y1 = 64) {
    const n = cols.length,
      h = (y1 - y0) / n;
    cols.forEach((c, i) => PX.r(g, 0, Math.round(y0 + i * h), 64, Math.ceil(h) + 1, c));
    for (let i = 1; i < n; i++) {
      const y = Math.round(y0 + i * h);
      for (let x = 0; x < 64; x++) {
        if (x % 2) PX.p(g, x, y, cols[i - 1]);
        if (x % 4 === 0) PX.p(g, x, y + 1, cols[i - 1]);
      }
    }
  },
  // a scatter that is the same every time: n points from a seed
  dots(seed, n, f) {
    let v = seed;
    for (let i = 0; i < n; i++) {
      v = (v * 9301 + 49297) % 233280;
      const a = v / 233280;
      v = (v * 9301 + 49297) % 233280;
      f(Math.floor(a * 64), Math.floor((v / 233280) * 64), i);
    }
  },
  // the background of each place
  bg(g, place) {
    const B = PX.BG[place] || PX.BG.scrapwell;
    B(g);
  },
  BG: {
    scrapwell(g) {
      PX.bands(g, ['#2a1a2e', '#4a2434', '#7a3434', '#a8523a', '#c87a44', '#d89a58']);
      PX.dots(7, 14, (x, y) => y < 18 && PX.p(g, x, y, '#5a3a4a'));
      // a skyline of junk shacks and the well's winch
      const m = '#3a2026';
      PX.r(g, 0, 50, 64, 14, m);
      [
        [0, 44, 9],
        [8, 47, 7],
        [46, 42, 8],
        [54, 46, 10],
      ].forEach(([x, y, w]) => PX.r(g, x, y, w, 64 - y, m));
      PX.r(g, 3, 41, 1, 3, m);
      PX.r(g, 49, 37, 1, 5, m);
      PX.r(g, 47, 37, 5, 1, m);
      PX.oval(g, 52, 12, 3, 3, '#e8b070');
      PX.oval(g, 52, 12, 2, 2, '#f4d090');
    },
    well(g) {
      PX.bands(g, ['#0a120a', '#101c10', '#14261a', '#1a3420']);
      for (let y = 0; y < 64; y += 6)
        for (let x = (y / 6) % 2 ? 0 : 5; x < 64; x += 10) {
          PX.r(g, x, y, 9, 5, '#1a281c');
          PX.r(g, x, y, 9, 1, '#22361f');
        }
      PX.oval(g, 32, 30, 24, 22, '#1e3a1e');
      PX.dots(3, 30, (x, y) => PX.p(g, x, y, '#2e5a24'));
    },
    rustwater(g) {
      PX.bands(g, ['#0e2a2e', '#14383a', '#1c4a48', '#2a5e58', '#3a6e62']);
      // the water tower and the pump
      const m = '#0e2426';
      PX.r(g, 44, 14, 14, 10, m);
      PX.r(g, 46, 24, 1, 40, m);
      PX.r(g, 55, 24, 1, 40, m);
      PX.r(g, 46, 34, 10, 1, m);
      PX.r(g, 43, 13, 16, 1, m);
      PX.r(g, 0, 52, 64, 12, '#12302e');
      PX.r(g, 2, 40, 8, 24, m);
      PX.r(g, 1, 39, 10, 1, m);
      PX.dots(11, 10, (x, y) => y < 26 && PX.p(g, x, y, '#2a5a58'));
    },
    farm(g) {
      PX.bands(g, ['#5a7a8a', '#8aa098', '#c8b888', '#d8c47a']);
      PX.r(g, 0, 46, 64, 18, '#8a7a3a');
      for (let x = 0; x < 64; x += 2) PX.r(g, x, 44 + (x % 4 ? 1 : 0), 1, 3, '#a8963e');
      // fence posts and a wire
      [2, 14, 50, 62].forEach(x => PX.r(g, x, 38, 2, 12, '#5a3a20'));
      PX.r(g, 0, 41, 64, 1, '#4a3a2a');
      PX.r(g, 54, 22, 9, 8, '#7a3a26');
      PX.r(g, 53, 21, 11, 1, '#5a2a1a');
    },
    diner(g) {
      PX.bands(g, ['#2a1410', '#3a1c14', '#4a2418']);
      for (let x = 0; x < 64; x += 8)
        for (let y = 40; y < 64; y += 8) PX.r(g, x + ((y / 8) % 2) * 4, y, 4, 4, '#5a3020');
      PX.r(g, 0, 39, 64, 1, '#1a0c08');
      // hooks on a rail, a menu board
      PX.r(g, 0, 6, 64, 1, '#5a5048');
      [6, 15, 52, 59].forEach(x => {
        PX.r(g, x, 7, 1, 3, '#6a6058');
        PX.p(g, x + 1, 10, '#6a6058');
      });
      PX.r(g, 2, 16, 11, 9, '#1a1410');
      PX.r(g, 3, 17, 9, 1, '#c8bca0');
      PX.r(g, 3, 19, 7, 1, '#8a8070');
      PX.r(g, 3, 21, 8, 1, '#8a8070');
    },
    cage(g) {
      PX.bands(g, ['#140c08', '#1e140e', '#2a1c12']);
      for (let x = 2; x < 64; x += 7) {
        PX.r(g, x, 0, 2, 64, '#3a3430');
        PX.r(g, x, 0, 1, 64, '#5a5048');
      }
      PX.r(g, 0, 8, 64, 2, '#3a3430');
    },
    chainfield(g) {
      PX.bands(g, ['#3a2a24', '#5a3a2a', '#7a4a30', '#8a5a3a']);
      for (let y = 0; y < 50; y++)
        for (let x = 0; x < 64; x++) if ((x + y) % 6 === 0 || (x - y + 60) % 6 === 0) PX.p(g, x, y, '#4a3a30');
      PX.r(g, 0, 50, 64, 14, '#4a3226');
      [8, 32, 56].forEach(x => PX.r(g, x, 0, 2, 52, '#2a1e18'));
    },
    snakeeyes(g) {
      PX.bands(g, ['#1a0e24', '#24122e', '#2e1838', '#3a1e40']);
      // a neon sign and a curtain
      for (let x = 0; x < 64; x += 4) PX.r(g, x, 20, 2, 44, '#4a1e3a');
      PX.r(g, 0, 18, 64, 2, '#5a2a48');
      PX.dots(5, 8, (x, y) => y < 16 && PX.p(g, x, y, '#e870a8'));
      PX.r(g, 4, 6, 12, 1, '#7ad8c8');
      PX.r(g, 4, 10, 12, 1, '#7ad8c8');
      PX.r(g, 4, 6, 1, 5, '#7ad8c8');
      PX.r(g, 15, 6, 1, 5, '#7ad8c8');
      PX.p(g, 8, 8, '#e8607a');
      PX.p(g, 11, 8, '#e8607a');
    },
    mall(g) {
      PX.bands(g, ['#1a2630', '#22323a', '#2a3e44', '#1e3a40']);
      // a fluorescent tube, shop shutters, the water line
      PX.r(g, 8, 4, 48, 2, '#a8d0c8');
      PX.r(g, 8, 6, 48, 1, '#4a6a6a');
      for (let y = 14; y < 46; y += 3) PX.r(g, 0, y, 64, 1, '#2a3a40');
      PX.r(g, 0, 46, 64, 18, '#1a3a3e');
      for (let x = 0; x < 64; x += 5) PX.r(g, x, 46, 3, 1, '#4a7a78');
    },
    green(g) {
      PX.bands(g, ['#2a4a2a', '#3a5e30', '#4a7034', '#5a7e3a']);
      PX.dots(9, 60, (x, y) => {
        PX.p(g, x, y, '#6a9a44');
        PX.p(g, x + 1, y, '#3a5a2a');
      });
      PX.dots(21, 8, (x, y) => PX.p(g, x, y, '#d84a3a'));
    },
    vats(g) {
      PX.bands(g, ['#0e1a12', '#142418', '#1a2e1c', '#22381e']);
      [4, 50].forEach(x => {
        PX.r(g, x, 10, 12, 54, '#1e2e22');
        PX.r(g, x, 10, 12, 2, '#3a4a34');
        PX.r(g, x + 2, 14, 2, 40, '#2a3e2a');
      });
      PX.dots(4, 18, (x, y) => PX.p(g, x, y, '#6aa04a'));
    },
    skybus(g) {
      PX.bands(g, ['#0e1428', '#16203a', '#1e2c4a', '#2a3a58']);
      // the cabin of a dead plane: ribs and a round window full of stars
      for (let x = 0; x < 64; x += 12) PX.r(g, x, 0, 3, 64, '#3a4458');
      PX.oval(g, 52, 18, 6, 8, '#3a4458');
      PX.oval(g, 52, 18, 4, 6, '#0a0e1e');
      PX.p(g, 51, 15, '#e8e0c0');
      PX.p(g, 54, 20, '#a8b0c8');
    },
    silo(g) {
      PX.bands(g, ['#140808', '#200c0c', '#2e1010', '#3a1410']);
      for (let x = -64; x < 64; x += 8) for (let i = 0; i < 4; i++) PX.r(g, x + i + 50, 56 + i, 4, 1, '#c8a030');
      PX.r(g, 0, 55, 64, 1, '#0a0404');
      PX.oval(g, 32, 8, 4, 2, '#e84030');
      PX.oval(g, 32, 8, 2, 1, '#ff8060');
      PX.dots(13, 12, (x, y) => y < 50 && PX.p(g, x, y, '#4a1a14'));
    },
  },
});

// ================= Scrapwell =================
// Ma Thistle: 94, smokes goat leather, a grey bun, a plum shawl, her cane, and no time for you
PORTRAIT.elder = (g, PX, o) => {
  PX.bg(g, 'scrapwell');
  const S = PX.ramp('#b48a6a'),
    H = PX.ramp('#b4aca0'),
    C = PX.ramp('#5e4a5e'),
    Wd = PX.ramp('#7a5434');
  // shawl, with a knot at the throat and a fringe
  PX.mask().trap(43, 63, 16, 46, 2, 61).paint(g, C, { t: 0.62 });
  for (let x = 4; x < 60; x += 3) PX.p(g, x, 60 + (x % 2), C.l);
  PX.rows(g, 14, 48, ['..a....', '.a.a...', 'a...a..'], { a: C.d });
  PX.rows(g, 42, 50, ['...a.', '..a.a', '.a...'], { a: C.d });
  // neck, all cords
  PX.mask().rect(26, 37, 11, 9).paint(g, S, { t: 0.55 });
  PX.r(g, 28, 40, 1, 5, S.d);
  PX.r(g, 34, 40, 1, 5, S.d);
  PX.mask().oval(31, 46, 4, 2).paint(g, C, { hi: 1 });
  // the hair behind, and the bun with a bone pin through it
  PX.mask().oval(31, 25, 11, 11).oval(32, 12, 5, 4).paint(g, H, { hi: 1 });
  PX.rows(g, 27, 10, ['..aa.a...', '.a..a..a.', 'a.a...a..', '..a..a...'], { a: H.d });
  PX.r(g, 27, 10, 11, 1, '#e8dcc0');
  PX.p(g, 27, 10, '#5a4a40');
  PX.p(g, 37, 10, '#5a4a40');
  // a long, narrow old face
  PX.mask()
    .oval(31, 28, 10, 12)
    .cut((x, y) => y > 33 && Math.abs(x - 31) > 9 - (y - 33) * 1.1)
    .paint(g, S, { t: 0.68, hi: 1 });
  // hair scraped back hard, a few strands escaping
  PX.mask()
    .spans(16, [
      [25, 37],
      [23, 39],
      [22, 40],
      [21, 26],
      [21, 23],
      [21, 22],
    ])
    .rect(38, 19, 3, 2)
    .rect(40, 21, 1, 3)
    .paint(g, H, { hi: 1 });
  PX.rows(g, 24, 16, ['...a..a..a..a', '.a..a..a..a..a', '..a..a...a..a'], { a: H.d });
  PX.p(g, 20, 27, H.l);
  PX.p(g, 19, 29, H.l);
  PX.p(g, 19, 30, H.m);
  // ears with heavy lobes
  PX.mask().oval(20, 29, 1, 3).paint(g, S);
  PX.mask().oval(42, 29, 1, 3).paint(g, S);
  // forehead lines, a scowl
  PX.r(g, 27, 21, 8, 1, S.d);
  PX.r(g, 28, 23, 6, 1, S.d);
  PX.rows(g, 24, 24, ['bbb.......bb.', '...bb...bbb..'], { b: H.d });
  PX.p(g, 31, 25, S.d);
  // squinting, heavy-lidded eyes in deep sockets
  PX.eyes(g, o, 25, 26, 9, { w: 4, skin: S, iris: '#5a6a5a', lid: 1, bag: 1 });
  PX.rows(g, 23, 27, ['a', '.a'], { a: S.d });
  PX.rows(g, 39, 27, ['.a', 'a'], { a: S.d });
  // the nose: long and hooked
  PX.rows(g, 30, 28, ['.l.', '.ld', '.ld', '.ld', 'lld', 'dood'], { l: S.l, d: S.d, o: S.o });
  // hollow cheeks and the lines from nose to mouth
  PX.rows(g, 25, 31, ['d..........d', 'd...........d', '.d.........d.'], { d: S.d });
  PX.rows(g, 27, 33, ['d.......d', '.d.......d', '.d.......d'], { d: S.d });
  // pursed lips round the smoke, lines above them
  PX.rows(g, 28, 35, ['.d.d.d', 'oooooo', '.ddd..'], { o: '#4a2a26', d: S.d });
  PX.p(g, 31, 39, S.d);
  // the goat-leather cigarette, drooping from the corner of her mouth, and its smoke
  PX.rows(g, 33, 35, ['oo.......', 'owwo.....', '.oWwwo...', '..oWwwwo.', '...ooWwar', '.....ooay'], {
    o: '#2a1a12',
    w: Wd.l,
    W: Wd.m,
    y: '#f8c860',
    r: '#e8602a',
    a: '#9a8a80',
  });
  const sm = 'rgba(210,200,190,0.6)';
  [
    [42, 38],
    [43, 37],
    [43, 36],
    [44, 35],
    [45, 34],
    [45, 33],
    [44, 32],
    [44, 31],
    [45, 30],
    [46, 29],
    [47, 28],
    [47, 27],
    [46, 26],
    [46, 25],
    [47, 24],
    [48, 23],
    [49, 22],
    [49, 21],
    [48, 20],
  ].forEach(([x, y], i) => {
    PX.p(g, x, y, sm);
    if (i % 3 === 0) PX.p(g, x + 1, y, sm);
  });
  // her knuckly hand on the crook of the cane
  PX.mask().rect(51, 46, 3, 18).paint(g, Wd);
  PX.mask().oval(52, 42, 3, 3).paint(g, Wd, { hi: 1 });
  PX.mask().oval(51, 46, 4, 3).paint(g, S, { hi: 1 });
  PX.rows(g, 48, 45, ['.d.d.d.', '.......', '..d.d..'], { d: S.d });
};

// Gus: a miner, mostly forearms, a wet man most nights. Black beard, a cap, the pick on his shoulder.
PORTRAIT.gus = (g, PX, o) => {
  PX.bg(g, 'scrapwell');
  const S = PX.ramp('#a8765a'),
    H = PX.ramp('#3a2a1c'),
    C = PX.ramp('#6a5a3a'),
    V = PX.ramp('#5a4a30'),
    Cp = PX.ramp('#4a4034'),
    Mt = PX.ramp('#8a8a90'),
    Wd = PX.ramp('#7a5434'),
    N = PX.ramp('#c0645a');
  // the pick, resting on his shoulder behind his head
  PX.mask().line(4, 60, 50, 12, 2).paint(g, Wd);
  PX.mask()
    .rows(40, 4, [
      '.....oo.......',
      '..oooooooo....',
      'oooooooooooo..',
      'oo......ooooo.',
      'o.........oooo',
      '............oo',
      '.............o',
    ])
    .paint(g, Mt, { hi: 1 });
  // broad shoulders, a shirt and a leather vest
  PX.torso(g, C, 43, 18, 46, 0, 63);
  PX.mask().trap(44, 63, 14, 22, 0, 22).paint(g, V);
  PX.mask().trap(44, 63, 42, 50, 42, 63).paint(g, V);
  // a thick neck
  PX.mask().rect(25, 36, 14, 10).paint(g, S, { t: 0.6 });
  // big arms folded across his chest, hairy
  PX.mask().oval(22, 56, 14, 5).paint(g, S, { hi: 1 });
  PX.mask().oval(42, 58, 14, 5).paint(g, S, { hi: 1 });
  PX.dots(17, 26, (x, y) => PX.p(g, 10 + (x % 44), 53 + (y % 9), S.d));
  PX.rows(g, 52, 54, ['.dd', 'd.d', 'dd.'], { d: S.d });
  // a square head
  PX.ear(g, 20, 28, S);
  PX.ear(g, 44, 28, S);
  PX.head(g, 32, 27, 11, 12, S, 31, 0.5);
  // the beard, black and wiry, with a mouth in it
  PX.mask()
    .spans(31, [
      [21, 23],
      [21, 24],
      [21, 26],
      [21, 43],
      [21, 43],
      [22, 42],
      [22, 42],
      [23, 41],
      [24, 40],
      [26, 38],
      [28, 36],
      [30, 34],
    ])
    .rect(40, 31, 3, 3)
    .paint(g, H, { hi: 1 });
  PX.rows(g, 23, 34, ['a.a..a....a..a.a', '.a.a...a..a..a..', 'a..a.a..a...a.a.', '..a..a...a..a...'], { a: H.l });
  PX.mask()
    .spans(33, [
      [27, 37],
      [27, 37],
    ])
    .paint(g, H, { line: false, flat: true });
  PX.mouth(g, 32, 35, ['.ooooo.', 'oxxxxxo'], S, H.o);
  PX.r(g, 27, 33, 11, 1, H.d);
  // eyes under one heavy brow, a drinker's nose
  PX.brows(g, 24, 23, 11, 'thick', H.m);
  PX.r(g, 29, 24, 6, 1, H.d);
  PX.eyes(g, o, 25, 26, 10, { w: 4, skin: S, iris: '#4a3a2a', bag: 1 });
  PX.nose(g, 32, 27, 'bulb', N);
  PX.p(g, 26, 31, N.m);
  PX.p(g, 37, 31, N.m);
  // a cloth cap pulled low
  PX.mask().oval(32, 16, 12, 6).rect(20, 16, 25, 4).paint(g, Cp, { hi: 1 });
  PX.mask().rows(18, 20, ['.ooooooooooooooooooooooooo.', 'oooooooooooooooooooooooooooo']).paint(g, Cp);
  PX.r(g, 31, 10, 3, 1, Cp.l);
  // dirt
  PX.p(g, 22, 25, S.d);
  PX.p(g, 40, 21, S.d);
  PX.p(g, 41, 22, S.d);
};

// Brother Crumb: a monk who prays to a chrome toaster. Once a Molar, the King's tooth-puller. Praying to be forgiven.
PORTRAIT.crumb = (g, PX, o) => {
  PX.bg(g, 'scrapwell');
  const S = PX.ramp('#c8a080'),
    H = PX.ramp('#6a4a30'),
    R = PX.ramp('#6a4a30'),
    Ch = PX.ramp('#a8b4bc'),
    Br = PX.ramp('#c8904a');
  // a heavy robe with a deep hood fallen back
  PX.torso(g, R, 42, 14, 50, 2, 62, { t: 0.66 });
  PX.mask().oval(32, 44, 15, 5).paint(g, R, { hi: 1 });
  PX.r(g, 31, 48, 2, 16, R.d);
  PX.rows(g, 10, 52, ['a......', '.a.....', '..a....'], { a: R.d });
  // a string of bread crusts on a cord
  PX.line(g, 22, 44, 28, 54, '#3a2a1a');
  PX.line(g, 42, 44, 36, 54, '#3a2a1a');
  [
    [23, 46],
    [25, 50],
    [41, 46],
    [39, 50],
  ].forEach(([x, y]) => PX.mask().rect(x, y, 2, 2).paint(g, Br, { line: false }));
  PX.mask().rect(25, 38, 14, 7).paint(g, S, { t: 0.6 });
  // a round, soft, kindly head
  PX.ear(g, 19, 28, S);
  PX.ear(g, 45, 28, S);
  PX.head(g, 32, 27, 13, 13, S, 32, 0.9);
  // the tonsure: a ring of hair around a bald crown
  PX.mask()
    .oval(32, 24, 14, 10)
    .cut(
      (x, y) =>
        y > 28 || (y < 28 && Math.abs(x - 32) < 14 - (28 - y) * 0.2 && y < 21) || (y >= 21 && Math.abs(x - 32) < 11),
    )
    .paint(g, H, { hi: 1 });
  PX.p(g, 27, 15, S.h);
  PX.p(g, 28, 15, S.h);
  PX.p(g, 26, 16, S.h);
  // eyes turned up to heaven, sad brows
  PX.brows(g, 25, 23, 10, 'sad', H.d);
  PX.eyes(g, o, 25, 26, 10, { w: 4, skin: S, iris: '#5a7aa0', look: 0, tall: 1 });
  if (!o.shut) {
    PX.p(g, 26, 27, '#5a7aa0');
    PX.p(g, 27, 27, '#120a08');
    PX.p(g, 36, 27, '#5a7aa0');
    PX.p(g, 37, 27, '#120a08');
    PX.r(g, 26, 28, 2, 1, '#e8dcc8');
    PX.r(g, 36, 28, 2, 1, '#e8dcc8');
  }
  PX.nose(g, 32, 29, 'button', S);
  // round cheeks
  PX.r(g, 23, 32, 3, 1, '#d88a78');
  PX.r(g, 38, 32, 3, 1, '#d88a78');
  PX.mouth(g, 32, 34, ['.o...o.', '..ooo..'], S, '#7a3a30');
  // a double chin
  PX.r(g, 27, 38, 10, 1, S.d);
  // the holy Toaster, held up in both hands
  PX.mask()
    .rect(40, 46, 18, 14)
    .cut((x, y) => (x === 40 || x === 57) && (y === 46 || y === 59))
    .paint(g, Ch, { hi: 1, t: 0.72 });
  PX.r(g, 43, 46, 5, 1, Ch.o);
  PX.r(g, 50, 46, 5, 1, Ch.o);
  PX.r(g, 43, 50, 12, 1, Ch.d);
  PX.r(g, 42, 48, 4, 8, Ch.h);
  PX.r(g, 56, 52, 2, 3, '#3a3a3a');
  PX.rows(g, 47, 54, ['oooooo', 'owooo.', 'oooooo'], { o: Ch.d, w: Ch.h });
  PX.mask().oval(39, 57, 3, 3).paint(g, S, { hi: 1 });
  PX.mask().oval(58, 57, 3, 3).paint(g, S, { hi: 1 });
};

// Old Pell: white beard, a stained apron, a fork. Ate four pigs called Bacon Prime. Wept every time.
PORTRAIT.pell = (g, PX, o) => {
  PX.bg(g, 'scrapwell');
  const S = PX.ramp('#b48a6a'),
    H = PX.ramp('#d8d0c0'),
    C = PX.ramp('#7a6a4a'),
    A = PX.ramp('#9a8c70'),
    Mt = PX.ramp('#9a9aa0');
  PX.torso(g, C, 44, 16, 48, 4, 60);
  // the apron over it, with a grease stain the shape of a pig
  PX.mask().trap(46, 63, 22, 42, 18, 46).paint(g, A, { t: 0.7 });
  PX.r(g, 22, 46, 1, -1, A.o);
  PX.line(g, 22, 46, 26, 38, A.o);
  PX.line(g, 42, 46, 38, 38, A.o);
  PX.rows(g, 30, 54, ['.aaa.', 'aaaaa', '.a.a.'], { a: A.d });
  PX.mask().rect(27, 37, 10, 8).paint(g, S, { t: 0.55 });
  // a bald head with a fringe of white hair
  PX.ear(g, 20, 28, S, 4);
  PX.ear(g, 44, 28, S, 4);
  PX.head(g, 32, 26, 11, 13, S, 30, 0.6);
  PX.mask()
    .spans(22, [
      [19, 22],
      [19, 22],
      [19, 22],
      [20, 22],
      [20, 22],
      [20, 21],
    ])
    .paint(g, H);
  PX.mask()
    .spans(22, [
      [42, 45],
      [42, 45],
      [42, 45],
      [42, 44],
      [42, 44],
      [43, 44],
    ])
    .paint(g, H);
  PX.p(g, 27, 15, S.h);
  PX.p(g, 28, 15, S.h);
  PX.p(g, 26, 16, S.h);
  PX.r(g, 28, 19, 8, 1, S.d);
  PX.r(g, 27, 21, 10, 1, S.d);
  // a big white beard to the chest
  PX.mask()
    .spans(31, [
      [21, 26],
      [21, 27],
      [21, 43],
      [21, 43],
      [21, 43],
      [22, 42],
      [22, 42],
      [23, 41],
      [23, 41],
      [24, 40],
      [25, 39],
      [25, 39],
      [26, 38],
      [27, 37],
      [28, 36],
      [29, 35],
      [30, 34],
      [31, 33],
    ])
    .rect(37, 31, 7, 2)
    .paint(g, H, { hi: 1 });
  PX.rows(
    g,
    24,
    35,
    [
      '.a..a...a..a..a.',
      'a..a..a...a..a..',
      '..a...a..a...a..',
      '.a..a...a...a...',
      '...a..a..a..a...',
      '.....a...a......',
    ],
    { a: H.d },
  );
  PX.mask()
    .spans(31, [
      [27, 37],
      [26, 38],
    ])
    .paint(g, H, { line: false, flat: true });
  PX.r(g, 26, 32, 13, 1, H.l);
  PX.mouth(g, 32, 34, ['.ooooo.', 'o.....o'], S, '#5a3a30');
  // sad, wet eyes
  PX.brows(g, 24, 23, 11, 'sad', H.m);
  PX.eyes(g, o, 25, 26, 10, { w: 4, skin: S, iris: '#6a5a40', bag: 1 });
  if (!o.shut) {
    PX.p(g, 27, 29, '#8ac0e0');
    PX.p(g, 27, 30, '#8ac0e0');
    PX.p(g, 36, 29, '#8ac0e0');
  }
  PX.nose(g, 32, 27, 'bulb', S);
  // the fork, held up
  PX.mask().rect(52, 34, 2, 30).paint(g, Mt);
  PX.mask()
    .rows(49, 27, ['o.o.o.o', 'o.o.o.o', 'o.o.o.o', 'o.o.o.o', 'ooooooo', '.ooooo.', '..ooo..'])
    .paint(g, Mt, { line: false, hi: 1 });
  PX.mask().oval(52, 46, 4, 4).paint(g, S, { hi: 1 });
  PX.rows(g, 49, 45, ['.d.d.d', '......', 'd.d.d.'], { d: S.d });
};

// Bacon Prime: the last purebred pig in the wastes, the fifth of his name. Regards you like a minor aristocrat.
PORTRAIT.pig = (g, PX, o) => {
  PX.bg(g, 'scrapwell');
  const P = PX.ramp('#d8968a'),
    Sn = PX.ramp('#e0a89a'),
    Mud = PX.ramp('#5a4030'),
    Au = PX.ramp('#d8b050');
  // a wide body behind, mud to the knees
  PX.mask().oval(32, 62, 28, 12).paint(g, P);
  PX.dots(31, 40, (x, y) => PX.p(g, 4 + (x % 56), 56 + (y % 8), y % 3 ? Mud.m : Mud.d));
  // the great head, chin up
  PX.mask().oval(32, 31, 19, 17).paint(g, P, { t: 0.76, hi: 1 });
  PX.r(g, 26, 17, 12, 1, P.d);
  PX.r(g, 28, 19, 8, 1, P.d);
  // floppy ears, flopped forward over his brow
  PX.mask()
    .rows(10, 10, [
      '....oooooooo',
      '..oooooooooo',
      '.ooooooooooo',
      'oooooooooooo',
      'ooooooooooo.',
      'oooooooooo..',
      '.oooooooo...',
      '.ooooooo....',
      '..ooooo.....',
      '..oooo......',
      '...oo.......',
    ])
    .paint(g, P, { hi: 1 });
  PX.mask()
    .rows(42, 10, [
      'oooooooo....',
      'oooooooooo..',
      'ooooooooooo.',
      'oooooooooooo',
      '.ooooooooooo',
      '..oooooooooo',
      '...oooooooo.',
      '....ooooooo.',
      '.....ooooo..',
      '......oooo..',
      '.......oo...',
    ])
    .paint(g, P, { t: 0.4 });
  PX.rows(g, 13, 13, ['...aaaa', '..aaa', '.aa'], { a: P.d });
  // the snout
  PX.mask().oval(32, 39, 9, 5).paint(g, Sn, { hi: 1 });
  PX.mask().oval(28, 39, 1, 2).paint(g, { m: '#5a2a2a' }, { line: false, flat: true });
  PX.mask().oval(36, 39, 1, 2).paint(g, { m: '#5a2a2a' }, { line: false, flat: true });
  PX.r(g, 26, 47, 12, 1, P.o);
  PX.r(g, 28, 48, 8, 1, P.d);
  // half-lidded, unimpressed eyes
  PX.eyes(g, o, 22, 29, 16, { w: 4, skin: P, iris: '#2a1a14', white: '#2a1a14', lid: 1 });
  if (!o.shut) {
    PX.r(g, 22, 29, 4, 1, P.d);
    PX.r(g, 38, 29, 4, 1, P.d);
    PX.p(g, 24, 30, '#e8dcc8');
    PX.p(g, 40, 30, '#e8dcc8');
  }
  PX.brows(g, 21, 26, 17, 'flat', P.d);
  // the monocle, on a little gold chain
  PX.mask()
    .oval(40, 30, 4, 4)
    .cut(
      (x, y) =>
        Math.abs(x - 40) < 3 &&
        Math.abs(y - 30) < 3 &&
        (Math.abs(x - 40) < 3 || Math.abs(y - 30) < 3) &&
        (x - 40) ** 2 + (y - 30) ** 2 < 10,
    )
    .paint(g, Au, { line: false, hi: 1 });
  PX.p(g, 38, 28, 'rgba(255,255,255,0.6)');
  PX.line(g, 44, 31, 47, 38, Au.d);
  PX.line(g, 47, 38, 46, 46, Au.d);
};

// Nigel the Glower: a green, glowing man who lives in the well, eating the chickens. "Please don't scream."
PORTRAIT.nigel = (g, PX, o) => {
  PX.bg(g, 'well');
  const S = PX.ramp('#9ad070'),
    Rg = PX.ramp('#5a5a4a'),
    Ck = PX.ramp('#e8d0a0'),
    Fe = PX.ramp('#e8e0d0');
  // his glow on the stones
  for (let r = 26; r > 14; r -= 4) PX.oval(g, 32, 28, r, r - 2, `rgba(168,224,124,${0.06 + (26 - r) * 0.012})`);
  // rags
  PX.torso(g, Rg, 44, 18, 46, 4, 60);
  PX.rows(g, 6, 56, ['a..a...a', '.a..a.a.', 'a....a..'], { a: Rg.d });
  PX.rows(g, 44, 50, ['a.a.a', '.a..a', 'a.a..'], { a: Rg.l });
  PX.mask().rect(27, 38, 10, 8).paint(g, S, { t: 0.55 });
  // a bald, lumpy, glowing head
  PX.ear(g, 20, 27, S);
  PX.ear(g, 44, 27, S);
  PX.head(g, 32, 26, 12, 13, S, 31, 0.8, { ink: '#1a3a14' });
  PX.mask().oval(27, 17, 3, 2).paint(g, S, { line: false, hi: 1 });
  PX.p(g, 37, 19, S.d);
  PX.p(g, 38, 20, S.d);
  PX.p(g, 25, 31, S.d);
  PX.p(g, 40, 23, S.l);
  // worried brows, pale glowing eyes
  PX.brows(g, 24, 22, 11, 'sad', S.o);
  PX.eyes(g, o, 25, 25, 10, {
    w: 4,
    skin: S,
    white: '#f0f8c0',
    iris: '#40a040',
    pupil: '#0a2a0a',
    tall: 1,
    ink: '#1a3a14',
  });
  PX.nose(g, 32, 28, 'small', S);
  // an awkward, apologetic smile with feathers on it
  PX.mouth(g, 32, 34, ['o.......o', '.ooooooo.', '..wwww...'], S, '#1a3a14', '#d8e8a0');
  PX.p(g, 37, 35, Fe.m);
  // half a chicken in his hand
  PX.mask().oval(14, 52, 8, 6).paint(g, Ck, { hi: 1 });
  PX.mask().rect(7, 47, 4, 3).paint(g, Ck);
  PX.rows(g, 10, 50, ['d.d.d', '.d.d.', 'd.d.d'], { d: Ck.d });
  PX.mask().rows(5, 44, ['.ww', 'www', 'ww.']).paint(g, Fe, { line: false });
  PX.mask().oval(22, 56, 4, 4).paint(g, S, { hi: 1, ink: '#1a3a14' });
  // feathers drifting
  [
    [8, 14],
    [52, 10],
    [56, 34],
    [6, 30],
    [48, 50],
  ].forEach(([x, y]) => PX.rows(g, x, y, ['.w', 'ww', 'w.'], { w: Fe.m }));
};

// Deacon Rind: Crumb's best acolyte, now he burns clocks. Lamp oil, ash and a torch. "What have you broken today?"
PORTRAIT.rind = (g, PX, o) => {
  PX.bg(g, 'scrapwell');
  const S = PX.ramp('#b08466'),
    H = PX.ramp('#2a1e14'),
    R = PX.ramp('#5a4a3a'),
    Wd = PX.ramp('#6a4a2a');
  // firelight from the torch, on the right
  PX.oval(g, 52, 18, 14, 14, 'rgba(255,160,60,0.18)');
  // sackcloth, roped at the neck
  PX.torso(g, R, 43, 18, 46, 3, 61);
  for (let y = 46; y < 64; y += 2) for (let x = 6 + (y % 4); x < 58; x += 4) PX.p(g, x, y, R.d);
  PX.line(g, 24, 44, 40, 44, '#8a7a50');
  PX.line(g, 32, 44, 30, 54, '#8a7a50');
  PX.mask().rect(27, 37, 10, 8).paint(g, S, { t: 0.55 });
  // a gaunt face, cheekbones like knuckles
  PX.ear(g, 21, 27, S);
  PX.ear(g, 43, 27, S);
  PX.head(g, 32, 26, 10, 13, S, 31, 1);
  PX.mask()
    .oval(32, 22, 11, 9)
    .cut(
      (x, y) =>
        y > 22 || (y > 14 && Math.abs(x - 32) < 9 - (22 - y) * 0.1 && y > 15) || (y <= 15 && Math.abs(x - 32) < 7),
    )
    .paint(g, H, { hi: 1 });
  // the ash mark of the Crust on his brow
  PX.rows(g, 30, 17, ['.a.', 'aaa', '.a.', '.a.'], { a: '#3a3430' });
  // wide, burning eyes, white all round
  PX.brows(g, 25, 22, 10, 'angry', H.m);
  PX.eyes(g, o, 25, 25, 10, { w: 5, skin: S, iris: '#c87a2a', tall: 1, white: '#f0e4cc' });
  if (!o.shut) {
    PX.p(g, 27, 26, '#f8d070');
    PX.p(g, 37, 26, '#f8d070');
  }
  PX.rows(g, 24, 29, ['dd..........dd', '.d..........d.', '.d..........d.'], { d: S.d });
  PX.nose(g, 32, 27, 'long', S);
  PX.mouth(g, 32, 33, 'grin', S, '#3a1a14', '#e8dcc0');
  // soot
  PX.p(g, 24, 33, '#3a3430');
  PX.p(g, 25, 34, '#3a3430');
  PX.p(g, 39, 20, '#3a3430');
  // the torch, raised
  PX.mask().line(53, 63, 52, 22, 2).paint(g, Wd);
  PX.mask().rect(50, 20, 6, 4).paint(g, PX.ramp('#5a4a40'));
  PX.mask()
    .rows(48, 7, [
      '...o.....',
      '...oo..o.',
      '..ooo.oo.',
      '.oooooooo',
      '.ooooooo.',
      'oooooooo.',
      'ooooooooo',
      '.ooooooo.',
      '..ooooo..',
      '...ooo...',
      '...ooo...',
      '..ooooo..',
      '...ooo...',
    ])
    .paint(
      g,
      { o: '#a82a10', d: '#d84a18', m: '#f08a28', l: '#f8c050', h: '#fff0a0' },
      { line: false, t: 0.75, hi: 1 },
    );
  PX.mask().oval(53, 46, 4, 4).paint(g, S, { hi: 1 });
};

// ================= Rustwater =================
// Moe: a big barman with a black beard, wiping the same dirty glass he's wiped for thirty years
PORTRAIT.moe = (g, PX, o) => {
  PX.bg(g, 'rustwater');
  const S = PX.ramp('#b07a5a'),
    H = PX.ramp('#2a1e14'),
    C = PX.ramp('#8a7a5c'),
    A = PX.ramp('#c8bca0'),
    Gl = PX.ramp('#8ab0a8'),
    Rg = PX.ramp('#a09078');
  PX.torso(g, C, 42, 12, 52, 0, 63);
  PX.mask().trap(46, 63, 20, 44, 16, 48).paint(g, A, { t: 0.72 });
  PX.line(g, 20, 46, 18, 40, A.d);
  PX.line(g, 44, 46, 46, 40, A.d);
  PX.dots(41, 8, (x, y) => PX.p(g, 20 + (x % 24), 50 + (y % 12), A.d));
  PX.mask().rect(23, 36, 18, 9).paint(g, S, { t: 0.6 });
  // a big round head, bald on top, jowls
  PX.ear(g, 17, 27, S, 4);
  PX.ear(g, 47, 27, S, 4);
  PX.head(g, 32, 26, 14, 14, S, 30, 0.4);
  PX.p(g, 26, 15, S.h);
  PX.p(g, 27, 14, S.h);
  PX.p(g, 28, 14, S.h);
  PX.mask()
    .spans(20, [
      [17, 20],
      [17, 20],
      [17, 20],
      [17, 19],
      [17, 19],
    ])
    .paint(g, H);
  PX.mask()
    .spans(20, [
      [44, 47],
      [44, 47],
      [44, 47],
      [45, 47],
      [45, 47],
    ])
    .paint(g, H);
  // a big black beard, a moustache over it
  PX.mask()
    .spans(30, [
      [18, 21],
      [18, 23],
      [18, 46],
      [18, 46],
      [18, 46],
      [19, 45],
      [19, 45],
      [20, 44],
      [21, 43],
      [22, 42],
      [24, 40],
      [26, 38],
      [29, 35],
    ])
    .rect(42, 30, 5, 3)
    .paint(g, H, { hi: 1 });
  PX.rows(
    g,
    21,
    34,
    ['.a..a..a...a..a..a..a', 'a..a..a..a...a..a..a.', '..a...a..a..a...a....', '....a...a...a..a.....'],
    { a: H.l },
  );
  PX.mask().rows(24, 31, ['..ooooooooooooo..', 'ooooooooooooooooo', 'ooo...........ooo']).paint(g, H, { hi: 1 });
  PX.mouth(g, 32, 34, ['.oooooo.'], S, '#1a0e08');
  // small, patient eyes, one brow up
  PX.brows(g, 24, 21, 11, 'flat', H.m);
  PX.r(g, 35, 20, 4, 1, H.m);
  PX.eyes(g, o, 25, 24, 11, { w: 4, skin: S, iris: '#3a2a1a', bag: 1 });
  PX.nose(g, 32, 25, 'broad', S);
  PX.r(g, 21, 29, 3, 1, '#c87a6a');
  PX.r(g, 41, 29, 3, 1, '#c87a6a');
  // the glass and the rag, wiping
  PX.mask().rect(10, 46, 9, 12).paint(g, Gl, { hi: 1, t: 0.7 });
  PX.r(g, 11, 48, 2, 8, '#d8f0e8');
  PX.r(g, 11, 54, 7, 3, '#8a7a4a');
  PX.mask().oval(12, 58, 6, 4).paint(g, S, { hi: 1 });
  PX.mask().rows(16, 44, ['.ooo', 'ooooo', 'oooooo', 'ooooo.', '.ooo.', 'oo...', 'o....']).paint(g, Rg);
  PX.mask().oval(19, 46, 4, 3).paint(g, S, { hi: 1 });
};

// Mayor Fenwick: soft man, hard top hat, desk made from a fridge. Sells the town its own water.
PORTRAIT.mayor = (g, PX, o) => {
  PX.bg(g, 'rustwater');
  const S = PX.ramp('#d0a088'),
    H = PX.ramp('#8a8478'),
    C = PX.ramp('#3a3040'),
    Hat = PX.ramp('#2a2430'),
    Sh = PX.ramp('#c8c0b0'),
    Au = PX.ramp('#c8a040');
  // a fat man in a good coat, a chain across his belly
  PX.torso(g, C, 42, 12, 52, 0, 63);
  PX.mask().trap(42, 63, 26, 38, 24, 40).paint(g, Sh);
  PX.mask()
    .rows(28, 43, ['ooooooooo', '.ooooooo.', '..ooooo..', '...ooo...', '....o....'])
    .paint(g, PX.ramp('#7a2a2a'));
  PX.mask().line(12, 58, 30, 56, 1).line(34, 56, 52, 58, 1).paint(g, Au, { line: false });
  PX.mask().oval(32, 56, 2, 2).paint(g, Au, { hi: 1 });
  PX.r(g, 24, 50, 2, 1, Au.l);
  // soft round face, jowls over the collar
  PX.ear(g, 18, 30, S);
  PX.ear(g, 46, 30, S);
  PX.mask().oval(32, 30, 14, 13).oval(32, 39, 12, 5).paint(g, S, { t: 0.7, hi: 1 });
  PX.r(g, 22, 38, 3, 1, S.d);
  PX.r(g, 39, 38, 3, 1, S.d);
  PX.r(g, 26, 42, 12, 1, S.d);
  // grey hair, slicked flat at the sides, and the hard top hat
  PX.mask()
    .spans(22, [
      [18, 21],
      [18, 21],
      [18, 21],
      [19, 21],
    ])
    .paint(g, H, { hi: 1 });
  PX.mask()
    .spans(22, [
      [43, 46],
      [43, 46],
      [43, 46],
      [43, 45],
    ])
    .paint(g, H);
  PX.mask().rect(22, 2, 20, 18).paint(g, Hat, { hi: 1, t: 0.72 });
  PX.r(g, 23, 15, 18, 2, '#6a2a2a');
  PX.mask().rows(15, 19, ['.oooooooooooooooooooooooooooooooooo.', 'oooooooooooooooooooooooooooooooooo']).paint(g, Hat);
  // small eyes buried in pleasant fat, a little smile
  PX.brows(g, 24, 25, 11, 'raised', H.d);
  PX.eyes(g, o, 25, 28, 11, { w: 3, skin: S, iris: '#3a3a5a', lid: 1 });
  PX.nose(g, 32, 29, 'button', S);
  PX.r(g, 21, 33, 3, 1, '#e08a7a');
  PX.r(g, 41, 33, 3, 1, '#e08a7a');
  PX.mouth(g, 32, 35, 'smirk', S, '#7a3a34');
  PX.mouth(g, 33, 34, ['......d'], S);
  // a thin moustache
  PX.rows(g, 28, 33, ['aaa..aaa'], { a: H.d });
};

// Sheriff Crane: has shot a lot of people, regrets maybe two. Krug's ex-wife, Ruth. Copper hair, green eyes, a white
// uniform shirt and shoulder boards (Will's reference, v9.17).
PORTRAIT.sheriff = (g, PX, o) => {
  // Crane, from Will's picture: shrunk to the cast's size, a few muted colours and an ink outline.
  // One character per pixel (a palette index), '.' shows the Rustwater sky behind.
  PX.bg(g, 'rustwater');
  const pal =
      '#140c0a #6c1108 #ca9c8b #a63618 #b66f60 #26262a #270b11 #3a9a80 #1f5e52 #8d8d9c #5a5b71 #acacb9 #cac4c2 #dfdeda #6a6e82'.split(
        ' ',
      ),
    rows = [
      '................................................................',
      '................................................................',
      '................................................................',
      '................................................................',
      '................................................................',
      '................................................................',
      '................................................................',
      '................................................................',
      '.........0......................................................',
      '.........0......................................................',
      '.............................00000000...........................',
      '...........................001111110200.........................',
      '.........................0011113333042500.......................',
      '.........0..............011111333313300050......................',
      '.........0.............01111133331133330050.....................',
      '.........0............0111113331113333310050....................',
      '.........0...........00111333311133333311020....................',
      '.........0..........0311111311113333331110050...................',
      '.........0..........03111111111044333311110550..................',
      '.........0.........033316611100422433111110050..................',
      '.........0.........033360000042222243111111050..................',
      '.........0.........0333044442222222243111110550.................',
      '.........0........04333442222222222220111110250.................',
      '.........0........0433344222222222222201111005500...............',
      '.........0........04333442222222222222201110454250..............',
      '.........0........0433344222222224442222011345040.0.............',
      '.........0........0433042222222000222222400442030..0........0...',
      '.........0........00311000422203330004224424240300.........00...',
      '.........0........03313401042244000002224444440100..00...0.00...',
      '.........0.......043300000004224478422224444201130....000..00...',
      '.........0.......04330..08780222242222244442401110.....000020...',
      '.........0.......0330..00.00422222222224444206111000......020...',
      '.........0........030..020244222222222449420661110420.....020...',
      '.........0........000...042442222222224429a66611133440....020...',
      '.........0.........00...042442442222224222066611333300....020...',
      '.........0..........00..0444304422222222220661133311340....0....',
      '.........0...........000024434222222222429061133311113000.......',
      '.........0...........00..04444442222222424061113111133330..00...',
      '.........0.........000...024003442222244a40611111111311100..0...',
      '.........0........040.....00.04422222240340661111111111100......',
      '.........0.......000.......00a042222400042a661166611111100......',
      '.........0......00........0224222224310424900666661111600.......',
      '.........0......00.........0924222401302224b006666111660400.....',
      '.........0......00........09992440033342224bc066613316613440....',
      '.........0.......00........0009924333022222cb0611333116113420...',
      '.........0........00..........0924333422cddcb0611111116133340...',
      '.........0........000.........0b2433422ddddcb9011661666113340...',
      '.........0.........000.........094334cddddddcb066666666611130...',
      '.........0..........00........0a9434cdddddddb9a66666666661330...',
      '.........0...........0.......0aa924cdddddddb0aa66166611111330...',
      '.........0..........00.......0aae2cdddddddc066666666111111130...',
      '.........0.........00......0.0a60cddddddddc006666666611111110...',
      '.........0................00.0a00dddddddddcb90006600000011110...',
      '.........0..............00c0.06a0cdddddddcccccb0009bbbbb00100...',
      '.........0.............0bccc00aaa00ddddddccccccdddcb9999c0100...',
      '.........0.........0..0a09cc90eeea00ddddbcccccddd00000a0b0100...',
      '.........0.........00000a09c909990600ddbcccccdddb0bccb9e90020...',
      '.........0.......0002bcc060c0a9be06600bbcccccddcbddccbbbb0340...',
      '.........0........0cccc06609a0b90660ee9ccccccdcbcdccbbbbb0040...',
      '.........0......009cbc06666aa9b06609bbccccccddbbdccccbbcb020....',
      '.........0......00bcb006660a0c06609cbcccccccdcbcccdb0000cc0.....',
      '.........0......00bcbb066099b00609cccccccccccccccb000600b0......',
      '.........0.......0ccbb060bb9e0600cccccccccccccccb0aa6ae000......',
      '.........0.......0ccc0060cbe0600dcccccccccbbccccb0aa099000......',
    ];
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 64; ) {
      const c = rows[y][x];
      let n = 1;
      while (x + n < 64 && rows[y][x + n] === c) n++;
      if (c !== '.') {
        g.fillStyle = pal[parseInt(c, 16)];
        g.fillRect(x, y, n, 1);
      }
      x += n;
    }
  // a blink: skin over the eye, the lashes as a dark line under it
  if (o.shut)
    for (const [x, y, w] of [
      [24, 29, 5],
      [32, 28, 4],
    ]) {
      PX.r(g, x, y, w, 1, '#ca9c8b');
      PX.r(g, x, y + 1, w, 1, '#140c0a');
    }
};

// Doc Ratchet: his degree is a cereal box with DOCTOR on it. Goggles up, a dirty coat, a syringe ready.
PORTRAIT.doc = (g, PX, o) => {
  PX.bg(g, 'rustwater');
  const S = PX.ramp('#c09878'),
    H = PX.ramp('#6a6a60'),
    C = PX.ramp('#b8b0a0'),
    Sh = PX.ramp('#5a6a6a'),
    Gg = PX.ramp('#7a6a4a'),
    Gl = PX.ramp('#8ac8c0');
  PX.torso(g, C, 43, 16, 48, 2, 62);
  PX.mask().trap(43, 63, 26, 38, 26, 38).paint(g, Sh);
  PX.line(g, 26, 43, 31, 63, C.o);
  PX.line(g, 38, 43, 33, 63, C.o);
  // stains, a pen, and a syringe in the pocket
  PX.dots(19, 6, (x, y) => PX.p(g, 6 + (x % 18), 50 + (y % 12), '#8a5a3a'));
  PX.p(g, 45, 52, '#7a3a2a');
  PX.p(g, 46, 53, '#7a3a2a');
  PX.mask().rect(40, 52, 8, 1).paint(g, C, { line: false });
  PX.r(g, 40, 52, 8, 1, C.d);
  PX.rows(g, 41, 46, ['.m', '.m', 'gg', 'gg', 'gg', 'xx'], { m: '#a8a8b0', g: '#a8e07c', x: '#6a6a70' });
  PX.mask().rect(27, 37, 10, 7).paint(g, S, { t: 0.55 });
  // a thin, pointed, clever face, wild grey hair
  PX.ear(g, 21, 28, S);
  PX.ear(g, 43, 28, S);
  PX.mask().oval(32, 18, 13, 7).rect(19, 18, 3, 8).rect(43, 18, 3, 8).paint(g, H, { hi: 1 });
  PX.rows(g, 17, 10, ['.a.....a.....a..a...a.', 'a.a..a..a..a..a..a.a..', '...a..a..a..a.....a..a'], { a: H.d });
  PX.head(g, 32, 27, 10, 12, S, 28, 1);
  PX.mask()
    .spans(15, [
      [24, 40],
      [22, 42],
      [22, 42],
    ])
    .paint(g, H, { hi: 1 });
  // the goggles, pushed up on his forehead
  PX.r(g, 21, 19, 22, 1, Gg.o);
  PX.mask().oval(27, 19, 3, 2).paint(g, Gg, { hi: 1 });
  PX.mask().oval(37, 19, 3, 2).paint(g, Gg, { hi: 1 });
  PX.mask().oval(27, 19, 1, 1).paint(g, Gl, { line: false, hi: 1 });
  PX.mask().oval(37, 19, 1, 1).paint(g, Gl, { line: false, hi: 1 });
  // eager eyes, one bigger than the other, a crooked grin
  PX.brows(g, 25, 23, 10, 'raised', H.d);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#5a7a3a', tall: 1, bag: 1 });
  PX.nose(g, 32, 27, 'hook', S);
  PX.mouth(g, 32, 33, ['o.......', '.oooooo.', '..wxwxo.'], S, '#4a2a24', '#d8c890');
  PX.r(g, 30, 38, 4, 1, S.d);
  PX.rows(g, 28, 37, ['a.a.a.a'], { a: H.d });
};

// Madame Opal: runs the Velvet Rad. Warm smile, shotgun under the counter. A rose, a black bun, red silk.
PORTRAIT.opal = (g, PX, o) => {
  PX.bg(g, 'rustwater');
  PX.r(g, 0, 0, 64, 64, 'rgba(120,30,50,0.28)');
  const S = PX.ramp('#c89878'),
    H = PX.ramp('#1e1612'),
    C = PX.ramp('#7a2a34'),
    Pl = PX.ramp('#e8e0d0'),
    Rs = PX.ramp('#c83040'),
    Lf = PX.ramp('#4a6a3a');
  // a red silk dress off the shoulder, a fur stole
  PX.mask().trap(44, 63, 20, 44, 6, 58).paint(g, S, { t: 0.7 });
  PX.mask().trap(50, 63, 14, 50, 8, 56).paint(g, C, { hi: 1 });
  PX.rows(g, 22, 52, ['d.d.d.d.d.d.d.d.d.d'], { d: C.d });
  const Fx = PX.ramp('#9a6a44');
  PX.mask().oval(12, 49, 10, 5).oval(52, 49, 10, 5).paint(g, Fx, { hi: 1 });
  PX.dots(29, 30, (x, y) => PX.p(g, x < 32 ? 4 + (x % 16) : 44 + (x % 16), 46 + (y % 6), y % 2 ? Fx.l : Fx.d));
  // a string of pearls
  [
    [25, 46],
    [27, 47],
    [29, 48],
    [31, 48],
    [33, 48],
    [35, 47],
    [37, 46],
    [32, 49],
  ].forEach(([x, y]) => PX.p(g, x, y, Pl.l));
  PX.mask().rect(28, 37, 8, 8).paint(g, S, { t: 0.55 });
  // the black hair and its bun
  PX.mask().oval(32, 25, 12, 13).oval(43, 15, 6, 5).paint(g, H, { hi: 1 });
  PX.r(g, 40, 13, 6, 1, H.l);
  // an oval face, a beauty mark, red lips
  PX.head(g, 32, 27, 10, 12, S, 31, 1);
  PX.mask()
    .spans(15, [
      [25, 40],
      [23, 41],
      [22, 42],
      [22, 30],
      [22, 27],
      [22, 25],
      [22, 24],
    ])
    .paint(g, H, { hi: 1 });
  PX.brows(g, 25, 23, 10, 'arch', H.m);
  PX.eyes(g, o, 26, 25, 9, { w: 4, skin: S, iris: '#3a2a1a', lash: 1, lid: 1 });
  PX.nose(g, 32, 27, 'small', S);
  PX.mouth(g, 32, 32, ['.rr.rr.', 'rrrrrrr', '.rrrrr.'], S, '#000', '#000');
  PX.rows(g, 29, 32, ['.aa.aa.', 'aaaaaaa', '.bbbbb.'], { a: '#a8202c', b: '#d8404a' });
  PX.p(g, 37, 30, '#2a1410');
  PX.r(g, 24, 30, 2, 1, '#d88070');
  PX.r(g, 38, 30, 2, 1, '#d88070');
  // the rose in her hand, at her lips
  PX.line(g, 48, 63, 44, 40, Lf.d);
  PX.mask().rows(44, 47, ['..ooo', 'ooooo', 'oooo.']).paint(g, Lf, { line: false });
  PX.mask().oval(44, 37, 3, 3).paint(g, Rs, { hi: 1 });
  PX.rows(g, 43, 36, ['.a.', 'a.a', '.a.'], { a: Rs.d });
  PX.mask().oval(47, 50, 4, 3).paint(g, S, { hi: 1 });
};

// Gloria: works for Opal. Laughs like a cement mixer, counts teeth faster than anyone alive. Big blonde hair.
PORTRAIT.gloria = (g, PX, o) => {
  PX.bg(g, 'rustwater');
  PX.r(g, 0, 0, 64, 64, 'rgba(140,40,80,0.22)');
  const S = PX.ramp('#d0a080'),
    H = PX.ramp('#d8b060'),
    C = PX.ramp('#b06a7a'),
    Th = PX.ramp('#e8dcc0');
  // big, big hair
  PX.mask().oval(32, 24, 19, 17).oval(18, 36, 7, 9).oval(46, 36, 7, 9).paint(g, H, { hi: 1 });
  PX.rows(g, 15, 12, ['..a....a.....a....a...a..', 'a...a....a.....a....a....', '...a..a...a...a..a.....a.'], {
    a: H.d,
  });
  // a pink top with a feather boa
  PX.mask().trap(44, 63, 18, 46, 4, 60).paint(g, S, { t: 0.7 });
  PX.mask().trap(52, 63, 12, 52, 6, 58).paint(g, C, { hi: 1 });
  PX.mask()
    .oval(14, 48, 7, 4)
    .oval(22, 51, 5, 3)
    .oval(50, 48, 7, 4)
    .oval(42, 51, 5, 3)
    .paint(g, PX.ramp('#d870a0'), { hi: 1 });
  PX.mask().rect(28, 38, 8, 7).paint(g, S, { t: 0.55 });
  // a round face, head thrown back laughing
  PX.head(g, 32, 28, 11, 12, S, 32, 1);
  PX.mask()
    .spans(16, [
      [24, 40],
      [22, 42],
      [21, 43],
      [21, 28],
      [21, 25],
      [21, 23],
    ])
    .rect(37, 18, 6, 2)
    .paint(g, H, { hi: 1 });
  PX.brows(g, 24, 22, 11, 'raised', H.d);
  // eyes squeezed shut with laughing, or wide open, counting
  if (o.shut) PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, lash: 1 });
  else if ((o.mood || 0) >= 0) {
    PX.rows(g, 25, 25, ['.aa.', 'a..a'], { a: S.o });
    PX.rows(g, 35, 25, ['.aa.', 'a..a'], { a: S.o });
    PX.p(g, 24, 25, S.o);
    PX.p(g, 39, 25, S.o);
  } else PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#4a6a8a', lash: 1 });
  PX.nose(g, 32, 27, 'button', S);
  PX.r(g, 23, 30, 3, 1, '#e07a7a');
  PX.r(g, 39, 30, 3, 1, '#e07a7a');
  // the cement-mixer laugh
  PX.mouth(g, 32, 32, ['oooooooo', 'owwwwwwo', 'orrrrrro', 'orrrrrro', '.oooooo.'], S, '#b02a3a', '#f0e8d8');
  PX.r(g, 30, 35, 4, 1, '#c84a5a');
  // a fistful of teeth
  PX.mask().oval(52, 58, 5, 4).paint(g, S, { hi: 1 });
  [
    [49, 54],
    [52, 53],
    [55, 54],
    [51, 55],
    [54, 55],
  ].forEach(([x, y]) => PX.mask().rect(x, y, 2, 2).paint(g, Th, { line: false, hi: 1 }));
};

// Caravan Jeb: six pack-lizards and a cart. Heading east, past the mountains. A drinker. A good shot.
PORTRAIT.jeb = (g, PX, o) => {
  PX.bg(g, 'rustwater');
  const S = PX.ramp('#a87050'),
    H = PX.ramp('#5a3a22'),
    C = PX.ramp('#7a6a4a'),
    V = PX.ramp('#5e4a34'),
    Hat = PX.ramp('#8a6a48'),
    Bk = PX.ramp('#6a5030'),
    Lz = PX.ramp('#7a9a4a'),
    Sc = PX.ramp('#a8442a');
  // the pack frame behind his shoulders
  PX.mask().rect(10, 34, 8, 30).rect(46, 34, 8, 30).paint(g, Bk, { hi: 1 });
  PX.mask().rect(9, 30, 2, 34).rect(53, 30, 2, 34).paint(g, PX.ramp('#5a4a3a'));
  PX.torso(g, V, 43, 16, 48, 2, 62);
  PX.mask().trap(43, 63, 24, 40, 22, 42).paint(g, C);
  PX.mask()
    .rows(22, 41, [
      'ooo...........ooo',
      'oooo.........oooo',
      '.oooo.......oooo.',
      '..oooooooooooooo.',
      '....ooooooooo....',
    ])
    .paint(g, Sc, { hi: 1 });
  PX.mask().rect(27, 36, 10, 6).paint(g, S, { t: 0.55 });
  // a long, sun-cooked face, stubble
  PX.ear(g, 21, 27, S);
  PX.ear(g, 43, 27, S);
  PX.head(g, 32, 26, 10, 13, S, 30, 0.9);
  PX.mask()
    .spans(16, [
      [23, 41],
      [22, 42],
      [22, 42],
      [22, 24],
      [22, 23],
    ])
    .paint(g, H, { hi: 1 });
  PX.dots(23, 40, (x, y) => {
    const xx = 24 + (x % 17),
      yy = 31 + (y % 8);
    if (Math.abs(xx - 32) < 9 - (yy - 31) * 0.9) PX.p(g, xx, yy, S.d);
  });
  // squinting at the horizon, crow's feet, a gap-toothed grin
  PX.brows(g, 24, 22, 11, 'flat', H.d);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#4a7a9a', lid: 1 });
  PX.rows(g, 23, 25, ['a', '.', 'a'], { a: S.d });
  PX.rows(g, 40, 25, ['a', '.', 'a'], { a: S.d });
  PX.nose(g, 32, 27, 'long', S);
  PX.mouth(g, 32, 34, ['o......o', '.owwrwo.', '..oooo..'], S, '#3a1a14', '#e0d0a8');
  PX.r(g, 22, 29, 2, 1, '#c86a5a');
  PX.r(g, 40, 29, 2, 1, '#c86a5a');
  // a wide sweat-stained hat
  PX.mask().oval(32, 14, 10, 5).paint(g, Hat, { hi: 1 });
  PX.r(g, 23, 15, 19, 2, '#4a3a2a');
  PX.mask()
    .rows(12, 17, [
      '....oooooooooooooooooooooooooooooooo....',
      'oooooooooooooooooooooooooooooooooooooooo',
      '.ooo..............................ooo..',
    ])
    .paint(g, Hat);
  PX.r(g, 28, 11, 8, 1, Hat.d);
  // a pack-lizard looking over his shoulder
  PX.mask().oval(52, 28, 7, 4).rect(46, 30, 6, 6).paint(g, Lz, { hi: 1 });
  PX.p(g, 54, 27, '#1a1a0a');
  PX.p(g, 55, 26, '#e8d860');
  PX.r(g, 56, 31, 3, 1, Lz.o);
  PX.rows(g, 47, 25, ['a.a.a'], { a: Lz.d });
};

// Pete: a caravan guard in Mama Lou's cage, waiting to be Tuesday's lunch. Hollow, filthy, holding a pot lid.
PORTRAIT.pete = (g, PX, o) => {
  PX.bg(g, 'cage');
  const S = PX.ramp('#a88466'),
    H = PX.ramp('#5a3a22'),
    C = PX.ramp('#6a5a44'),
    Mt = PX.ramp('#8a8a88');
  PX.torso(g, C, 44, 16, 48, 4, 60);
  PX.rows(g, 10, 50, ['a...a...', '.a.a....', '..a..a..', 'a....a..'], { a: C.d });
  PX.rows(g, 40, 54, ['.a..a', 'a..a.', '.a..a'], { a: C.l });
  PX.mask().rect(27, 37, 10, 8).paint(g, S, { t: 0.55 });
  PX.r(g, 29, 40, 1, 4, S.d);
  // a gaunt, hungry face, a ragged beard, matted hair
  PX.ear(g, 21, 27, S);
  PX.ear(g, 43, 27, S);
  PX.mask().oval(32, 20, 13, 9).rect(19, 20, 4, 12).rect(42, 20, 4, 12).paint(g, H, { hi: 1 });
  PX.head(g, 32, 26, 10, 12, S, 30, 0.8);
  PX.mask()
    .spans(15, [
      [24, 40],
      [22, 42],
      [21, 43],
      [21, 30],
      [21, 26],
      [21, 24],
      [21, 23],
    ])
    .rect(36, 18, 7, 2)
    .rect(39, 20, 4, 2)
    .paint(g, H, { hi: 1 });
  PX.mask()
    .spans(31, [
      [22, 25],
      [22, 26],
      [22, 42],
      [23, 41],
      [24, 40],
      [25, 39],
      [27, 37],
      [29, 35],
      [31, 33],
    ])
    .rect(38, 31, 4, 2)
    .paint(g, H, { hi: 1 });
  PX.rows(g, 24, 33, ['a.a..a..a..a.a.', '.a..a..a..a..a.', '..a...a...a....'], { a: H.l });
  // terrified eyes, sunken cheeks
  PX.brows(g, 24, 22, 11, 'sad', H.d);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#5a4a3a', tall: 1, white: '#f0e8d8', bag: 1 });
  PX.rows(g, 24, 30, ['d.........d', 'd.........d'], { d: S.d });
  PX.nose(g, 32, 27, 'small', S);
  PX.mouth(g, 32, 32, ['.oooo.', 'orrrro', '.oooo.'], S, '#2a1410');
  PX.p(g, 25, 23, '#3a2a1a');
  PX.p(g, 40, 30, '#3a2a1a');
  // the pot lid, his only shield
  PX.mask().oval(14, 56, 10, 9).paint(g, Mt, { hi: 1, t: 0.66 });
  PX.mask().oval(14, 56, 6, 5).paint(g, Mt, { line: false, t: 0.6 });
  PX.mask().rect(12, 54, 4, 2).paint(g, PX.ramp('#3a3a3a'));
  PX.p(g, 10, 51, Mt.h);
  // bars in front of him, left and right
  [3, 59].forEach(x => {
    PX.r(g, x, 0, 3, 64, '#2a2420');
    PX.r(g, x, 0, 1, 64, '#6a6058');
  });
};

// ================= Hector's farm =================
// Hector: a hard old farmer with a shotgun and two grown children he won't let go of
PORTRAIT.hector = (g, PX, o) => {
  PX.bg(g, 'farm');
  const S = PX.ramp('#a87656'),
    H = PX.ramp('#6a6a60'),
    C = PX.ramp('#8a6a4a'),
    D = PX.ramp('#4a5e74'),
    Cap = PX.ramp('#8a3a26'),
    Mt = PX.ramp('#5a5a60'),
    Wd = PX.ramp('#7a4a2a');
  PX.torso(g, C, 43, 16, 48, 2, 62);
  // overalls with their straps
  PX.mask().trap(50, 63, 20, 44, 18, 46).paint(g, D, { hi: 1 });
  PX.mask().rect(20, 43, 4, 8).rect(40, 43, 4, 8).paint(g, D);
  PX.mask().rect(21, 49, 2, 2).rect(41, 49, 2, 2).paint(g, PX.ramp('#c8a040'), { line: false, hi: 1 });
  PX.mask().rect(27, 36, 10, 8).paint(g, S, { t: 0.55 });
  // a square, lined face, a grey moustache like a broom
  PX.ear(g, 20, 27, S);
  PX.ear(g, 44, 27, S);
  PX.head(g, 32, 26, 11, 12, S, 31, 0.6);
  PX.mask()
    .spans(20, [
      [20, 22],
      [20, 22],
      [20, 22],
      [20, 22],
    ])
    .paint(g, H);
  PX.mask()
    .spans(20, [
      [42, 44],
      [42, 44],
      [42, 44],
      [42, 44],
    ])
    .paint(g, H);
  PX.r(g, 26, 20, 12, 1, S.d);
  PX.brows(g, 24, 22, 11, 'angry', H.d);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#4a5a6a', lid: 1, bag: 1 });
  PX.nose(g, 32, 26, 'broad', S);
  PX.mask()
    .rows(25, 31, ['..ooooooooooo..', '.ooooooooooooo.', 'ooooo.....ooooo', 'ooo.........ooo'])
    .paint(g, H, { hi: 1 });
  PX.mouth(g, 32, 34, ['ooooo'], S, '#3a1a14');
  PX.r(g, 23, 30, 1, 5, S.d);
  PX.r(g, 40, 30, 1, 5, S.d);
  PX.r(g, 28, 37, 8, 1, S.d);
  // a red cap with a short bill
  PX.mask().oval(32, 16, 11, 6).rect(21, 16, 23, 3).paint(g, Cap, { hi: 1 });
  PX.mask().rows(19, 18, ['.ooooooooooooooooooooooooo.', 'oooooooooooooooooooooooooo']).paint(g, PX.ramp('#6a2a1a'));
  // the shotgun across his chest
  PX.mask().line(4, 62, 56, 44, 3).paint(g, Wd, { hi: 1 });
  PX.mask().line(30, 54, 60, 42, 2).line(30, 52, 60, 40, 2).paint(g, Mt, { hi: 1 });
  PX.mask().oval(22, 57, 4, 3).oval(46, 49, 4, 3).paint(g, S, { hi: 1 });
};

// Bess: 29, has been "about to leave" for eleven years. Sharpening a hoe that doesn't need it.
PORTRAIT.bess = (g, PX, o) => {
  PX.bg(g, 'farm');
  const S = PX.ramp('#c8966e'),
    H = PX.ramp('#8a4a24'),
    C = PX.ramp('#6a7a4a'),
    St = PX.ramp('#d8bc6a'),
    Mt = PX.ramp('#9a9aa0'),
    Wd = PX.ramp('#8a5a30');
  // the hoe, held upright beside her
  PX.mask().rect(50, 4, 3, 60).paint(g, Wd, { hi: 1 });
  PX.mask().rows(44, 2, ['ooooooooooooo', 'ooooooooooooo', '.ooooooooooo.', '..ooooooooo..']).paint(g, Mt, { hi: 1 });
  PX.r(g, 45, 3, 11, 1, Mt.h);
  // a work shirt, sleeves rolled
  PX.torso(g, C, 44, 18, 46, 4, 60);
  PX.mask().rows(27, 44, ['o........o', '.o......o.', '..o....o..', '...oooo...']).paint(g, S, { line: false });
  PX.line(g, 26, 44, 31, 50, C.o);
  PX.line(g, 38, 44, 33, 50, C.o);
  PX.mask().rect(28, 37, 8, 7).paint(g, S, { t: 0.55 });
  // red-brown hair in a long plait, freckles
  PX.mask().oval(32, 25, 12, 12).line(22, 30, 18, 52, 3).paint(g, H, { hi: 1 });
  PX.rows(g, 18, 36, ['.a', 'a.', '.a', 'a.', '.a', 'a.', '.a', 'a.', '.a', 'a.', '.a', 'a.', '.a'], { a: H.d });
  PX.head(g, 32, 27, 10, 12, S, 31, 1);
  PX.mask()
    .spans(17, [
      [25, 40],
      [23, 41],
      [22, 42],
      [22, 34],
      [22, 28],
      [22, 25],
      [22, 24],
    ])
    .paint(g, H, { hi: 1 });
  // eyes on the road out, a set mouth
  PX.brows(g, 25, 22, 10, 'flat', H.d);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#5a8a5a', lash: 1, look: 1 });
  PX.nose(g, 32, 27, 'small', S);
  PX.mouth(g, 32, 33, ['ooooooo', '.ddddd.'], S, '#8a4038');
  [
    [25, 29],
    [27, 30],
    [24, 31],
    [38, 29],
    [40, 30],
    [37, 31],
    [30, 30],
    [34, 30],
  ].forEach(([x, y]) => PX.p(g, x, y, '#a86a4a'));
  // a straw hat pushed back
  PX.mask().oval(32, 15, 9, 4).paint(g, St, { hi: 1 });
  PX.mask()
    .rows(15, 16, [
      '....oooooooooooooooooooooooooo....',
      'oooooooooooooooooooooooooooooooooo',
      '.oooo........................oooo.',
    ])
    .paint(g, St);
  PX.r(g, 24, 17, 17, 1, '#8a3a2a');
  PX.rows(g, 25, 12, ['.a.a.a.a.a.a.a.'], { a: St.d });
  // a whetstone in her hand at the blade
  PX.mask().oval(52, 30, 4, 3).paint(g, S, { hi: 1 });
  PX.mask().rect(54, 26, 5, 3).paint(g, PX.ramp('#6a6a6a'));
};

// Bert: 31, Bess's brother, big and gentle. Has read the same tractor magazine every night of his adult life.
PORTRAIT.bert = (g, PX, o) => {
  PX.bg(g, 'farm');
  const S = PX.ramp('#c89070'),
    H = PX.ramp('#8a4a24'),
    C = PX.ramp('#8a6a4a'),
    D = PX.ramp('#4a5e74'),
    Cap = PX.ramp('#6a6a50'),
    Pp = PX.ramp('#d8c8a0');
  PX.torso(g, C, 42, 10, 54, 0, 63);
  PX.mask().trap(48, 63, 16, 48, 14, 50).paint(g, D, { hi: 1 });
  PX.mask().rect(17, 42, 5, 8).rect(42, 42, 5, 8).paint(g, D);
  PX.mask().rect(24, 35, 16, 9).paint(g, S, { t: 0.6 });
  // a broad, open, freckled face, a little lost
  PX.ear(g, 18, 27, S, 4);
  PX.ear(g, 46, 27, S, 4);
  PX.head(g, 32, 26, 13, 13, S, 30, 0.5);
  PX.mask()
    .spans(20, [
      [19, 22],
      [19, 22],
      [19, 21],
      [19, 21],
    ])
    .paint(g, H, { hi: 1 });
  PX.mask()
    .spans(20, [
      [42, 45],
      [42, 45],
      [43, 45],
      [43, 45],
    ])
    .paint(g, H);
  PX.brows(g, 24, 22, 12, 'raised', H.m);
  PX.eyes(g, o, 25, 25, 11, { w: 4, skin: S, iris: '#6a8aa0', tall: 1 });
  PX.nose(g, 32, 27, 'button', S);
  [
    [23, 30],
    [25, 31],
    [40, 30],
    [42, 31],
    [29, 30],
    [35, 30],
  ].forEach(([x, y]) => PX.p(g, x, y, '#a86a4a'));
  PX.mouth(g, 32, 33, ['o......o', '.oooooo.'], S, '#7a3a30');
  PX.r(g, 30, 37, 5, 1, S.d);
  // a farm cap
  PX.mask().oval(32, 16, 12, 6).rect(20, 16, 25, 3).paint(g, Cap, { hi: 1 });
  PX.mask()
    .rows(17, 18, ['.ooooooooooooooooooooooooooooo.', 'ooooooooooooooooooooooooooooooo'])
    .paint(g, PX.ramp('#4a4a38'));
  PX.mask().oval(32, 12, 3, 2).paint(g, PX.ramp('#c8a040'), { line: false, hi: 1 });
  // the tractor magazine, held up with love
  PX.mask().rect(36, 44, 22, 18).paint(g, Pp, { t: 0.85, hi: 1 });
  PX.r(g, 38, 46, 18, 3, '#a83a2a');
  PX.rows(g, 39, 46, ['a.a.aa.aa.aa.a.a', '.a..a.a.a..a..a.', 'a.a.aa.aa.aa.a.a'], { a: '#f0e0c0' });
  PX.rows(
    g,
    39,
    51,
    [
      '.....oooo......',
      '....oddddo.....',
      'oooodddddoooo..',
      'oddddddddddddo.',
      '.ooo.....ooo...',
      'oxxxo...oxxxo..',
      '.ooo.....ooo...',
    ],
    { o: '#2a2a1a', d: '#c87a2a', x: '#4a4a4a' },
  );
  PX.r(g, 37, 45, 1, 16, Pp.d);
  PX.mask().oval(36, 56, 4, 4).oval(58, 52, 4, 4).paint(g, S, { hi: 1 });
};

// ================= Mama Lou's =================
// Mama Lou: built like a fridge. "Sit down, honey. You look delicious. Hungry! You look hungry."
PORTRAIT.lou = (g, PX, o) => {
  PX.bg(g, 'diner');
  const S = PX.ramp('#c89474'),
    H = PX.ramp('#6a5a50'),
    C = PX.ramp('#7a5a6a'),
    A = PX.ramp('#c8bca0'),
    Mt = PX.ramp('#9a9aa0');
  PX.torso(g, C, 40, 8, 56, 0, 63);
  PX.mask().trap(44, 63, 14, 50, 10, 54).paint(g, A, { t: 0.74 });
  PX.mask().line(14, 44, 22, 40, 1).line(50, 44, 42, 40, 1).paint(g, A, { line: false });
  // blood on the apron, wiped, not hidden
  PX.rows(
    g,
    18,
    48,
    [
      '..aa......a......',
      '.aaaa....aa.....a',
      '..aa......a....aa',
      '...........a.....',
      '.......a......a..',
      '......aa.........',
    ],
    { a: '#8a2a24' },
  );
  PX.mask().rect(22, 35, 20, 8).paint(g, S, { t: 0.6 });
  // a wide face, a big bun, a kind smile you shouldn't trust
  PX.mask().oval(32, 12, 8, 6).paint(g, H, { hi: 1 });
  PX.r(g, 27, 11, 10, 1, H.d);
  PX.mask().oval(32, 24, 15, 11).paint(g, H, { hi: 1 });
  PX.ear(g, 17, 28, S, 3);
  PX.ear(g, 47, 28, S, 3);
  PX.mask().oval(32, 28, 14, 12).oval(32, 38, 11, 4).paint(g, S, { t: 0.7, hi: 1 });
  PX.mask()
    .spans(16, [
      [24, 40],
      [21, 43],
      [19, 45],
      [18, 28],
      [18, 23],
      [18, 21],
    ])
    .rect(37, 19, 8, 1)
    .paint(g, H, { hi: 1 });
  PX.brows(g, 23, 22, 13, 'arch', H.d);
  PX.eyes(g, o, 24, 25, 12, { w: 4, skin: S, iris: '#4a3020', lash: 1 });
  if (!o.shut) {
    PX.r(g, 24, 27, 4, 1, S.d);
    PX.r(g, 36, 27, 4, 1, S.d);
  }
  PX.nose(g, 32, 27, 'button', S);
  PX.r(g, 20, 30, 4, 2, '#d8706a');
  PX.r(g, 40, 30, 4, 2, '#d8706a');
  PX.mouth(g, 32, 32, ['o..........o', '.oooooooooo.', '..wwwwwwww..', '...oooooo...'], S, '#8a2a3a', '#f0e8d8');
  PX.r(g, 27, 39, 10, 1, S.d);
  PX.p(g, 37, 28, '#3a2010');
  // the ladle
  PX.mask().rect(52, 22, 2, 34).paint(g, Mt, { hi: 1 });
  PX.mask().oval(53, 18, 5, 4).paint(g, Mt, { hi: 1 });
  PX.r(g, 49, 17, 9, 1, '#8a3a2a');
  PX.mask().oval(53, 52, 5, 4).paint(g, S, { hi: 1 });
};

// Junior: 44, Lou's son, built like a bigger fridge. He grunts and keeps chopping.
PORTRAIT.junior = (g, PX, o) => {
  PX.bg(g, 'diner');
  const S = PX.ramp('#c89474'),
    H = PX.ramp('#c8a060'),
    C = PX.ramp('#9a8c74'),
    A = PX.ramp('#c8bca0'),
    Mt = PX.ramp('#a0a0a8'),
    Wd = PX.ramp('#5a3a24');
  // shoulders that fill the door
  PX.torso(g, C, 36, 4, 60, 0, 63);
  PX.mask().oval(8, 42, 9, 7).oval(56, 42, 9, 7).paint(g, S, { hi: 1 });
  PX.mask().trap(44, 63, 18, 46, 14, 50).paint(g, A, { t: 0.74 });
  PX.rows(g, 22, 50, ['.aa.....a...', 'aaaa...aaa..', '.aa.....a..a', '.......a....'], { a: '#8a2a24' });
  PX.mask().rect(22, 32, 20, 9).paint(g, S, { t: 0.62 });
  // a small head on a huge neck: low brow, buzzed hair
  PX.ear(g, 22, 24, S);
  PX.ear(g, 42, 24, S);
  PX.head(g, 32, 23, 10, 11, S, 26, 0.3);
  PX.mask()
    .spans(12, [
      [26, 38],
      [24, 40],
      [23, 41],
      [22, 42],
    ])
    .paint(g, H, { hi: 1 });
  PX.dots(5, 12, (x, y) => PX.p(g, 24 + (x % 17), 12 + (y % 4), H.d));
  PX.mask().rect(24, 18, 16, 2).paint(g, S, { line: false, t: 1 });
  PX.r(g, 24, 19, 16, 1, S.d);
  PX.eyes(g, o, 26, 20, 8, { w: 3, skin: S, iris: '#3a3020', lid: 1 });
  PX.nose(g, 32, 22, 'flat', S);
  PX.mouth(g, 32, 28, ['ooooooo', '.......'], S, '#5a2a24');
  PX.r(g, 27, 30, 10, 1, S.d);
  // a cleaver in one fist
  PX.mask().rect(50, 44, 3, 12).paint(g, Wd, { hi: 1 });
  PX.mask()
    .rows(44, 22, [
      'oooooooooooo',
      'oooooooooooo',
      'oooooooooooo',
      'oooooooooooo',
      'oooooooooooo',
      'oooooooooooo',
      'oooooooooooo',
      'oooooooooooo',
      '.ooooooooooo',
      '.......ooooo',
      '.......ooo..',
      '.......ooo..',
      '.......oooo.',
      '.......oooo.',
      '.......oooo.',
      '.......oooo.',
      '.......oooo.',
      '.......oooo.',
      '.......oooo.',
      '.......oooo.',
      '.......oooo.',
      '.......oooo.',
    ])
    .paint(g, Mt, { hi: 1 });
  PX.r(g, 45, 22, 11, 1, Mt.h);
  PX.rows(g, 46, 26, ['aa.a', '.a..'], { a: '#8a2a24' });
  PX.mask().oval(52, 50, 5, 5).paint(g, S, { hi: 1 });
  PX.rows(g, 48, 49, ['.d.d.d', '......', '.d.d.d'], { d: S.d });
};

// ================= Chainfield =================
// Krug: huge, polite, immaculate records. "Everything has a price. Mostly people."
PORTRAIT.krug = (g, PX, o) => {
  PX.bg(g, 'chainfield');
  const S = PX.ramp('#b08a68'),
    H = PX.ramp('#2a1e14'),
    C = PX.ramp('#5a3a24'),
    D = PX.ramp('#3e3428'),
    Mt = PX.ramp('#8a8a8a'),
    Pp = PX.ramp('#d8ccb0');
  PX.torso(g, C, 40, 6, 58, 0, 63);
  // spiked pauldrons
  PX.mask().oval(10, 44, 10, 6).paint(g, D, { hi: 1 });
  PX.mask().oval(54, 44, 10, 6).paint(g, D, { hi: 1 });
  [
    [4, 36],
    [10, 34],
    [16, 36],
    [48, 36],
    [54, 34],
    [60, 36],
  ].forEach(([x, y]) =>
    PX.mask()
      .rows(x - 1, y, ['.o.', '.o.', 'ooo', 'ooo'])
      .paint(g, Mt, { hi: 1 }),
  );
  // chains across his chest
  for (let i = 0; i < 12; i++) {
    PX.mask()
      .oval(14 + i * 3, 50 + Math.round(Math.sin(i / 3.6) * 4), 1, 1)
      .paint(g, Mt, { hi: 1 });
  }
  PX.mask().rect(24, 34, 16, 8).paint(g, S, { t: 0.6 });
  // a big bald head, a neat pointed beard, little round spectacles
  PX.ear(g, 18, 26, S, 3);
  PX.ear(g, 46, 26, S, 3);
  PX.head(g, 32, 24, 13, 13, S, 28, 0.5);
  PX.p(g, 26, 13, S.h);
  PX.p(g, 27, 13, S.h);
  PX.p(g, 25, 14, S.h);
  PX.mask()
    .spans(29, [
      [21, 23],
      [21, 24],
      [22, 42],
      [22, 42],
      [23, 41],
      [25, 39],
      [27, 37],
      [28, 36],
      [29, 35],
      [30, 34],
      [31, 33],
    ])
    .rect(40, 29, 3, 2)
    .paint(g, H, { hi: 1 });
  PX.mask()
    .spans(29, [[27, 37]])
    .paint(g, H, { line: false, flat: true });
  PX.mouth(g, 32, 32, ['o.....o', '.ooooo.'], S, '#4a2a20');
  PX.mask()
    .spans(30, [[28, 36]])
    .paint(g, S, { line: false, t: 1 });
  PX.mouth(g, 32, 30, ['oooooooo', 'o.wwww.o'], S, '#1a0e08', '#e0d4b0');
  PX.brows(g, 23, 20, 12, 'flat', H.m);
  PX.eyes(g, o, 24, 22, 12, { w: 4, skin: S, iris: '#3a2a20' });
  PX.rows(
    g,
    22,
    21,
    ['.oooooo.....oooooo.', 'o......o...o......o', 'o......ooooo......o', 'o......o...o......o', '.oooooo.....oooooo.'],
    { o: '#c8a040' },
  );
  PX.p(g, 24, 22, 'rgba(255,255,255,0.5)');
  PX.p(g, 36, 22, 'rgba(255,255,255,0.5)');
  PX.nose(g, 32, 25, 'broad', S);
  // his ledger
  PX.mask().rect(44, 50, 16, 13).paint(g, PX.ramp('#3a2a2a'), { hi: 1 });
  PX.mask().rect(46, 50, 13, 12).paint(g, Pp, { t: 0.9 });
  [52, 54, 56, 58].forEach(y => PX.r(g, 47, y, 10, 1, Pp.d));
  PX.mask().oval(46, 58, 4, 4).paint(g, S, { hi: 1 });
};

// Old Teo: a slave in Krug's pens. Named all the trolleys. Free one day, broke, smiling anyway.
PORTRAIT.teo = (g, PX, o) => {
  PX.bg(g, 'chainfield');
  const S = PX.ramp('#a07a5a'),
    H = PX.ramp('#d8d0c0'),
    C = PX.ramp('#6a5e4a'),
    Mt = PX.ramp('#6a6a6a');
  PX.torso(g, C, 44, 18, 46, 4, 60);
  PX.rows(g, 10, 50, ['a.......a', '.a.....a.', '..a...a..'], { a: C.d });
  PX.rows(g, 44, 52, ['.a.', 'a.a', '...', 'a..'], { a: C.l });
  PX.mask().rect(27, 37, 10, 8).paint(g, S, { t: 0.55 });
  // the iron collar, and its broken chain
  PX.mask().rect(25, 41, 14, 3).paint(g, Mt, { hi: 1 });
  PX.mask().oval(32, 45, 1, 1).oval(31, 48, 1, 1).oval(32, 51, 1, 1).paint(g, Mt, { hi: 1 });
  // a thin old face, a white beard, wisps of hair
  PX.ear(g, 21, 27, S, 4);
  PX.ear(g, 43, 27, S, 4);
  PX.head(g, 32, 26, 10, 12, S, 30, 0.7);
  PX.rows(g, 22, 14, ['..a...a....a..a', '.a.a.a..a.a.a..', 'a.......a......', '.a.....a.....a.', 'a.............a'], {
    a: H.m,
  });
  PX.r(g, 27, 19, 10, 1, S.d);
  PX.r(g, 28, 21, 8, 1, S.d);
  PX.mask()
    .spans(31, [
      [23, 26],
      [23, 27],
      [23, 41],
      [24, 40],
      [25, 39],
      [26, 38],
      [27, 37],
      [28, 36],
      [29, 35],
      [30, 34],
    ])
    .rect(37, 31, 4, 2)
    .paint(g, H, { hi: 1 });
  PX.rows(g, 25, 34, ['.a..a..a..a..', 'a..a..a..a..a', '..a..a...a...'], { a: H.d });
  PX.mask()
    .spans(32, [[28, 36]])
    .paint(g, H, { line: false, flat: true });
  // a toothless, delighted smile, eyes crinkled
  PX.mouth(g, 32, 33, ['o.......o', '.orrrrro.', '..ooooo..'], S, '#3a1a14');
  PX.brows(g, 24, 22, 11, 'raised', H.m);
  if (o.shut) PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S });
  else {
    PX.rows(g, 25, 25, ['.aa.', 'a..a'], { a: S.o });
    PX.rows(g, 35, 25, ['.aa.', 'a..a'], { a: S.o });
  }
  PX.rows(g, 22, 25, ['a', '.a', 'a'], { a: S.d });
  PX.rows(g, 40, 25, ['.a', 'a', '.a'], { a: S.d });
  PX.nose(g, 32, 27, 'long', S);
  // his cane
  PX.mask().rect(52, 30, 3, 34).paint(g, PX.ramp('#7a5434'), { hi: 1 });
  PX.mask().oval(53, 44, 4, 4).paint(g, S, { hi: 1 });
};

// ================= Snake Eyes =================
// Mister Pips: a grin, a tuxedo older than the bombs, and a ring on every finger
PORTRAIT.pips = (g, PX, o) => {
  PX.bg(g, 'snakeeyes');
  const S = PX.ramp('#c8a080'),
    H = PX.ramp('#1e1612'),
    C = PX.ramp('#2a2430'),
    Sh = PX.ramp('#c8bca0'),
    V = PX.ramp('#6a2a4a'),
    Au = PX.ramp('#d8b040'),
    Cd = PX.ramp('#e8e0d0');
  PX.torso(g, C, 43, 14, 50, 0, 63);
  PX.mask().trap(43, 63, 24, 40, 20, 44).paint(g, Sh);
  PX.mask()
    .trap(48, 63, 22, 42, 18, 46)
    .cut((x, y) => Math.abs(x - 32) < 3 + (y - 48) * 0.3)
    .paint(g, V, { hi: 1 });
  PX.mask()
    .rows(26, 43, ['ooo.....ooo', 'ooooo.ooooo', 'ooooooooooo', 'ooooo.ooooo', 'ooo.....ooo'])
    .paint(g, PX.ramp('#8a1a2a'), { hi: 1 });
  PX.mask().rect(28, 37, 8, 6).paint(g, S, { t: 0.55 });
  // slicked black hair with a widow's peak, a long narrow face
  PX.ear(g, 21, 27, S);
  PX.ear(g, 43, 27, S);
  PX.mask().oval(32, 22, 12, 9).paint(g, H, { hi: 1 });
  PX.head(g, 32, 27, 10, 12, S, 30, 0.9);
  PX.mask()
    .spans(14, [
      [24, 40],
      [22, 42],
      [22, 42],
      [22, 31],
      [22, 29],
      [22, 24],
      [22, 23],
    ])
    .rect(33, 17, 9, 1)
    .rect(38, 18, 4, 2)
    .paint(g, H, { hi: 1 });
  PX.r(g, 25, 15, 12, 1, H.h);
  // a snake's eyes and a snake's grin, a pencil moustache
  PX.brows(g, 24, 22, 11, 'arch', H.m);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#a8a030', pupil: '#0a0a04', lid: 1 });
  PX.nose(g, 32, 27, 'hook', S);
  PX.rows(g, 27, 32, ['aaaa..aaaa'], { a: H.m });
  PX.mouth(g, 32, 33, ['oooooooooooo', '.owwwwwwwwo.', '..oooooooo..'], S, '#3a1418', '#e8e0c8');
  PX.p(g, 29, 34, '#d8b040');
  PX.rows(g, 25, 31, ['d..........d', '.d........d.'], { d: S.d });
  // a fan of cards in a hand with a ring on every finger
  PX.mask().oval(50, 58, 6, 5).paint(g, S, { hi: 1 });
  [-2, -1, 0, 1, 2].forEach(i => {
    const x = 50 + i * 4;
    PX.mask()
      .rect(x - 2, 44 + Math.abs(i), 5, 9)
      .paint(g, Cd, { hi: 1, t: 0.85 });
    PX.p(g, x - 1, 45 + Math.abs(i), i % 2 ? '#c82a2a' : '#1a1a1a');
  });
  [
    [46, 56],
    [49, 55],
    [52, 55],
    [55, 56],
  ].forEach(([x, y]) => PX.mask().rect(x, y, 2, 1).paint(g, Au, { line: false, hi: 1 }));
  PX.p(g, 52, 55, '#e84050');
};

// Dice: a dealer who shuffles without looking. Her eyes are on the door, always. Opal's sister, planning a way out.
PORTRAIT.dice = (g, PX, o) => {
  PX.bg(g, 'snakeeyes');
  const S = PX.ramp('#c89a7a'),
    H = PX.ramp('#8a2e24'),
    C = PX.ramp('#3a5a4a'),
    Sh = PX.ramp('#d8d0c0'),
    Vz = PX.ramp('#4a9a5a'),
    Cd = PX.ramp('#e8e0d0');
  PX.torso(g, Sh, 44, 18, 46, 4, 60);
  PX.mask().trap(46, 63, 16, 27, 6, 27).paint(g, C);
  PX.mask().trap(46, 63, 37, 48, 37, 58).paint(g, C);
  PX.mask().rect(19, 52, 8, 2).rect(37, 52, 8, 2).paint(g, PX.ramp('#8a1a2a'), { line: false });
  PX.mask().rect(28, 37, 8, 7).paint(g, S, { t: 0.55 });
  PX.mask().rows(28, 43, ['oo..oo', '.oooo.', 'oo..oo']).paint(g, { o: '#1a1a1a', m: '#1a1a1a' }, { flat: true });
  // red hair cut short and sharp, at the jaw
  PX.mask().oval(32, 25, 13, 12).rect(19, 25, 5, 12).rect(40, 25, 5, 12).paint(g, H, { hi: 1 });
  PX.head(g, 32, 27, 10, 12, S, 31, 1);
  PX.mask()
    .spans(17, [
      [23, 41],
      [22, 42],
      [22, 42],
      [36, 42],
      [38, 42],
      [40, 42],
    ])
    .rect(22, 20, 3, 8)
    .rect(40, 20, 3, 8)
    .paint(g, H, { hi: 1 });
  // eyes slid to the door, a straight mouth
  PX.brows(g, 25, 23, 10, 'flat', H.d);
  PX.eyes(g, o, 25, 26, 10, { w: 4, skin: S, iris: '#4a7a5a', lash: 1, look: 1 });
  PX.nose(g, 32, 28, 'small', S);
  PX.mouth(g, 32, 33, ['.ooooo.'], S, '#8a3a34');
  PX.r(g, 31, 34, 3, 1, '#b0605a');
  // the dealer's green visor
  PX.mask()
    .rows(19, 18, [
      '......oooooooooooo......',
      '..oooooooooooooooooooo..',
      'oooooooooooooooooooooooo',
      '.oooooooooooooooooooooo.',
    ])
    .paint(
      g,
      { o: '#1a3a1a', d: '#2a6a3a', m: 'rgba(74,154,90,0.85)', l: 'rgba(120,200,130,0.85)', h: '#a8e8b0' },
      { hi: 1 },
    );
  PX.r(g, 21, 22, 22, 1, '#2a6a3a');
  PX.r(g, 22, 22, 20, 3, 'rgba(40,120,60,0.3)');
  PX.r(g, 22, 17, 20, 1, '#1a1a1a');
  // cards running from hand to hand
  PX.mask().oval(14, 58, 5, 4).oval(50, 58, 5, 4).paint(g, S, { hi: 1 });
  for (let i = 0; i < 7; i++)
    PX.mask()
      .rect(17 + i * 4, 50 - Math.round(Math.sin((i / 6) * Math.PI) * 6), 4, 6)
      .paint(g, Cd, { t: 0.9 });
};

// Big Tam: the pit champion. Scars on scars. Gus's brother: he looks like someone you know, around the eyes.
PORTRAIT.tam = (g, PX, o) => {
  PX.bg(g, 'snakeeyes');
  const S = PX.ramp('#b07a58'),
    H = PX.ramp('#2a1e14'),
    Gv = PX.ramp('#a82a24'),
    Wr = PX.ramp('#c8bca0');
  // a bare, scarred chest and huge shoulders
  PX.mask().trap(38, 63, 8, 56, 0, 63).oval(8, 44, 10, 8).oval(56, 44, 10, 8).paint(g, S, { t: 0.7, hi: 1 });
  PX.rows(g, 16, 48, ['...ddddddd..........ddddddd', '..d.......d........d.......d', '............................'], {
    d: S.d,
  });
  PX.r(g, 31, 44, 1, 16, S.d);
  [
    [12, 52, 20, 46],
    [40, 50, 50, 58],
    [24, 56, 30, 62],
    [6, 42, 10, 48],
  ].forEach(([a, b, c, d]) => PX.line(g, a, b, c, d, S.l));
  PX.mask().rect(24, 32, 16, 8).paint(g, S, { t: 0.62 });
  // a lumpy, broken face: flat nose, cauliflower ear, a split brow
  PX.ear(g, 19, 25, S, 3);
  PX.mask().oval(45, 25, 2, 3).paint(g, S, { hi: 1 });
  PX.p(g, 45, 24, S.d);
  PX.head(g, 32, 23, 12, 12, S, 27, 0.5);
  PX.mask()
    .spans(11, [
      [26, 38],
      [23, 41],
      [22, 42],
      [21, 43],
    ])
    .paint(g, H, { hi: 1 });
  PX.dots(15, 14, (x, y) => PX.p(g, 23 + (x % 19), 11 + (y % 3), H.l));
  // Gus's eyes, under a swollen brow
  PX.mask().oval(28, 20, 4, 2).paint(g, S, { line: false, hi: 1 });
  PX.brows(g, 24, 19, 11, 'thick', H.m);
  PX.eyes(g, o, 25, 22, 10, { w: 4, skin: S, iris: '#4a3a2a', bag: 1 });
  PX.r(g, 35, 22, 4, 1, '#7a3a3a');
  PX.line(g, 37, 17, 39, 21, S.l);
  PX.nose(g, 32, 24, ['.ll..', 'lldd.', 'lmmmd', 'oo.oo'], S);
  PX.mouth(g, 32, 30, ['oooooo', '.w.ww.'], S, '#3a1a14', '#d8c8a0');
  PX.r(g, 28, 33, 8, 1, S.d);
  // fists in red gloves, up
  PX.mask().oval(10, 54, 8, 9).paint(g, Gv, { hi: 1 });
  PX.mask().oval(54, 54, 8, 9).paint(g, Gv, { hi: 1 });
  PX.mask().rect(5, 61, 10, 3).rect(49, 61, 10, 3).paint(g, Wr);
  PX.r(g, 6, 50, 3, 1, Gv.h);
  PX.r(g, 50, 50, 3, 1, Gv.h);
};

// Sweet Nan: a tiny old woman knitting something that might be a noose. Your aunt's smile, if your aunt was a shark.
PORTRAIT.nan = (g, PX, o) => {
  PX.bg(g, 'snakeeyes');
  const S = PX.ramp('#c8a088'),
    H = PX.ramp('#c8c0b8'),
    C = PX.ramp('#b07a8a'),
    Rp = PX.ramp('#b8a070'),
    Mt = PX.ramp('#b0b0b8');
  // a pink cardigan with pearl buttons, a lace collar
  PX.torso(g, C, 44, 18, 46, 6, 58);
  for (let y = 48; y < 64; y += 2) for (let x = 8 + (y % 4); x < 56; x += 4) PX.p(g, x, y, C.d);
  PX.mask().rows(23, 43, ['oooooooooooooooooo', '.o.o.o.o..o.o.o.o.']).paint(g, PX.ramp('#e8e0d0'), { flat: true });
  [47, 51, 55].forEach(y => PX.mask().rect(32, y, 1, 1).paint(g, PX.ramp('#e8e0d0'), { line: false }));
  PX.mask().rect(28, 37, 8, 6).paint(g, S, { t: 0.55 });
  // a small old head with a tight bun and big spectacles
  PX.mask().oval(32, 24, 11, 11).oval(32, 12, 5, 4).paint(g, H, { hi: 1 });
  PX.head(g, 32, 28, 9, 11, S, 31, 0.9);
  PX.mask()
    .spans(17, [
      [26, 38],
      [24, 40],
      [23, 41],
      [23, 27],
      [23, 25],
    ])
    .rect(37, 20, 4, 2)
    .paint(g, H, { hi: 1 });
  PX.rows(g, 25, 18, ['.a..a..a..a..a', 'a..a..a..a..a.'], { a: H.d });
  PX.r(g, 28, 22, 8, 1, S.d);
  PX.eyes(g, o, 26, 26, 9, { w: 3, skin: S, iris: '#2a2a3a', lash: 1 });
  PX.rows(g, 24, 25, ['.ooooo...ooooo.', 'o.....ooo.....o', 'o.....o.o.....o', '.ooooo...ooooo.'], { o: '#c8b060' });
  PX.p(g, 25, 26, 'rgba(255,255,255,0.6)');
  PX.p(g, 34, 26, 'rgba(255,255,255,0.6)');
  PX.line(g, 24, 26, 22, 28, '#c8b060');
  PX.nose(g, 32, 28, 'small', S);
  // the shark smile: far too many teeth
  PX.mouth(g, 32, 33, ['ooooooooooo', '.owwwwwwwo.', '..ooooooo..'], S, '#8a2a3a', '#f0ece0');
  PX.rows(g, 28, 34, ['.o.o.o.o.'], { o: '#c8b8a0' });
  PX.r(g, 24, 31, 2, 1, '#e08a90');
  PX.r(g, 38, 31, 2, 1, '#e08a90');
  // needles, and a rope with a slip knot in it
  PX.line(g, 18, 58, 30, 46, Mt.m);
  PX.line(g, 46, 58, 36, 46, Mt.m);
  PX.mask()
    .rect(20, 50, 24, 8)
    .cut((x, y) => (x + y) % 3 === 0)
    .paint(g, Rp, { line: false });
  PX.mask()
    .oval(32, 54, 3, 4)
    .cut((x, y) => (x - 32) ** 2 + (y - 54) ** 2 < 4)
    .paint(g, Rp, { hi: 1 });
  PX.mask().oval(18, 59, 4, 3).oval(46, 59, 4, 3).paint(g, S, { hi: 1 });
};

// Rook: Pips's doorman. He fills the door. He does not move out of it. He does not need to. Grey, square, still.
PORTRAIT.rook = (g, PX, o) => {
  PX.bg(g, 'snakeeyes');
  const S = PX.ramp('#9a948a'),
    C = PX.ramp('#2a262a'),
    Sh = PX.ramp('#d0ccc0'),
    Gl = PX.ramp('#1a1a20');
  // a black suit stretched over a wall of a man
  PX.torso(g, C, 38, 4, 60, 0, 63, { hi: 1 });
  PX.mask().trap(38, 63, 26, 38, 22, 42).paint(g, Sh);
  PX.mask().trap(40, 63, 30, 34, 29, 35).paint(g, PX.ramp('#1a1a1a'));
  PX.line(g, 22, 40, 30, 63, C.o);
  PX.line(g, 42, 40, 34, 63, C.o);
  PX.mask().rect(22, 32, 20, 8).paint(g, S, { t: 0.62 });
  // a curly wire in one ear
  PX.line(g, 44, 26, 46, 38, '#3a3a3a');
  // a square stone head
  PX.ear(g, 19, 24, S, 3);
  PX.ear(g, 45, 24, S, 3);
  PX.mask()
    .rect(20, 10, 25, 25)
    .cut((x, y) => (x === 20 || x === 44) && (y === 10 || y === 34))
    .paint(g, S, { t: 0.7, hi: 1 });
  PX.r(g, 22, 10, 21, 1, S.o);
  // a heavy brow, small dark glasses, a mouth like a crack in a wall
  PX.mask().rect(21, 18, 23, 3).paint(g, S, { line: false, hi: 1, t: 0.75 });
  PX.r(g, 21, 20, 23, 1, S.d);
  PX.mask().rect(22, 21, 9, 4).rect(34, 21, 9, 4).rect(30, 21, 5, 1).paint(g, Gl, { hi: 1 });
  PX.r(g, 23, 22, 3, 1, '#5a5a6a');
  PX.r(g, 35, 22, 3, 1, '#5a5a6a');
  if (o.shut) {
    PX.r(g, 23, 22, 3, 1, '#2a2a30');
    PX.r(g, 35, 22, 3, 1, '#2a2a30');
  }
  PX.nose(g, 32, 24, 'flat', S);
  PX.mouth(g, 32, 30, ['ooooooooo'], S);
  PX.r(g, 27, 33, 11, 1, S.d);
  // the King's tooth, tattooed small on his neck
  PX.rows(g, 25, 35, ['ooo', 'o.o'], { o: '#3a4a6a' });
};

// ================= The Drowned Mall =================
// Queen Margie: a paper hat, a MANAGER badge, and a staff handbook two hundred years old, held like a bible
PORTRAIT.margie = (g, PX, o) => {
  PX.bg(g, 'mall');
  const S = PX.ramp('#c8a07c'),
    H = PX.ramp('#8a5a3a'),
    C = PX.ramp('#9a3a30'),
    Pp = PX.ramp('#e0d8c8'),
    Bk = PX.ramp('#a82a2a'),
    Bd = PX.ramp('#d8b040');
  // the ValuMart uniform: a red polo with a collar
  PX.torso(g, C, 44, 18, 46, 4, 60);
  PX.mask().rows(24, 43, ['oooooo....oooooo', '.ooooo....ooooo.', '..oooo....oooo..']).paint(g, C, { hi: 1 });
  PX.mask().rect(28, 37, 8, 7).paint(g, S, { t: 0.55 });
  // the MANAGER badge
  PX.mask().rect(38, 49, 12, 5).paint(g, Bd, { hi: 1 });
  PX.r(g, 40, 51, 8, 1, Bd.o);
  // permed hair under a paper hat
  PX.mask().oval(32, 25, 14, 12).paint(g, H, { hi: 1 });
  PX.dots(37, 50, (x, y) => {
    const dx = x - 32,
      dy = (y % 24) + 13 - 25;
    if (dx * dx + dy * dy * 1.36 < 180 && (x + y) % 2) PX.p(g, x, (y % 24) + 13, H.l);
  });
  PX.head(g, 32, 27, 10, 12, S, 31, 1);
  PX.mask()
    .spans(16, [
      [25, 39],
      [23, 41],
      [22, 42],
      [22, 26],
      [38, 42],
    ])
    .paint(g, H, { hi: 1 });
  PX.mask()
    .rows(20, 10, [
      '.....oooooooooooooo.....',
      '...oooooooooooooooooo...',
      '.oooooooooooooooooooooo.',
      'oooooooooooooooooooooooo',
      'oooooooooooooooooooooooo',
    ])
    .paint(g, Pp, { hi: 1, t: 0.8 });
  PX.r(g, 21, 13, 22, 1, '#c83a2a');
  PX.rows(g, 27, 11, ['a.aa.a.aa.'], { a: '#c83a2a' });
  // a customer-service smile that has not slipped in thirty years
  PX.brows(g, 25, 22, 10, 'raised', H.d);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#5a4a3a', lash: 1, tall: 1 });
  PX.nose(g, 32, 28, 'button', S);
  PX.mouth(g, 32, 32, ['o.........o', '.ooooooooo.', '..wwwwwww..', '...ooooo...'], S, '#8a2a2a', '#f0ecd8');
  PX.r(g, 23, 31, 2, 1, '#e08a7a');
  PX.r(g, 39, 31, 2, 1, '#e08a7a');
  // the handbook, clutched to her heart
  PX.mask().rect(12, 46, 17, 16).paint(g, Bk, { hi: 1 });
  PX.r(g, 13, 47, 2, 14, Bk.d);
  PX.mask().rect(17, 50, 9, 3).paint(g, Bd, { line: false });
  PX.r(g, 17, 55, 9, 1, Bd.d);
  PX.r(g, 28, 47, 1, 14, Pp.m);
  PX.mask().oval(28, 56, 4, 4).paint(g, S, { hi: 1 });
};

// Sprocket: goggles, burn scars, and a bench made from a pre-war checkout. "I fit it, you live longer. Probably."
PORTRAIT.sprocket = (g, PX, o) => {
  PX.bg(g, 'mall');
  const S = PX.ramp('#b88a6a'),
    H = PX.ramp('#2a1e14'),
    C = PX.ramp('#5a5a50'),
    A = PX.ramp('#6a4a30'),
    Gg = PX.ramp('#4a4a40'),
    Gl = PX.ramp('#8ab0b0'),
    Mt = PX.ramp('#9a9aa0');
  PX.torso(g, C, 44, 18, 46, 4, 60);
  PX.mask().trap(46, 63, 22, 42, 18, 46).paint(g, A, { hi: 1 });
  PX.line(g, 22, 46, 26, 40, A.o);
  PX.line(g, 42, 46, 38, 40, A.o);
  PX.rows(g, 24, 50, ['.mm.......', 'm..m....mm', '.mm.....mm'], { m: Mt.m });
  PX.mask().rect(28, 37, 8, 7).paint(g, S, { t: 0.55 });
  // hair tied up in a rag, a face with a burn down one side
  PX.mask().oval(32, 24, 12, 12).paint(g, H, { hi: 1 });
  PX.mask().oval(32, 16, 11, 5).paint(g, PX.ramp('#a83a2a'), { hi: 1 });
  PX.mask().rows(42, 12, ['oo', 'ooo', '.oo']).paint(g, PX.ramp('#a83a2a'));
  PX.head(g, 32, 27, 10, 12, S, 31, 1);
  PX.mask()
    .spans(19, [
      [23, 41],
      [22, 42],
      [22, 26],
      [22, 24],
    ])
    .paint(g, H, { hi: 1 });
  // the burn: shiny, pink, puckered
  PX.mask()
    .rows(34, 28, ['..aa..', '.aaaa.', 'aaaaaa', 'aaaaa.', '.aaa..', '..a...'])
    .paint(g, { o: '#8a4a40', d: '#b0645a', m: '#d0847a', l: '#e8a49a', h: '#f0c0b8' }, { line: false, hi: 1 });
  // goggles down over her eyes, the glass reflecting the shop
  PX.r(g, 21, 25, 22, 2, Gg.o);
  PX.mask().oval(27, 26, 4, 3).oval(37, 26, 4, 3).paint(g, Gg, { hi: 1 });
  PX.mask().oval(27, 26, 2, 2).oval(37, 26, 2, 2).paint(g, Gl, { line: false, hi: 1 });
  if (!o.shut) {
    PX.p(g, 27, 26, '#2a3a3a');
    PX.p(g, 37, 26, '#2a3a3a');
  }
  PX.p(g, 25, 25, '#e8f8f8');
  PX.p(g, 35, 25, '#e8f8f8');
  PX.nose(g, 32, 29, 'small', S);
  PX.mouth(g, 32, 33, ['......o', 'oooooo.'], S, '#7a3a30');
  PX.p(g, 26, 35, '#3a3030');
  PX.p(g, 27, 36, '#3a3030');
  // the wrench
  PX.mask().line(48, 63, 56, 36, 3).paint(g, Mt, { hi: 1 });
  PX.mask().rows(52, 30, ['oo...oo', 'oo...oo', 'ooo.ooo', '.ooooo.', '..ooo..']).paint(g, Mt, { hi: 1 });
  PX.mask().oval(52, 52, 4, 4).paint(g, S, { hi: 1 });
};

// Eel: a wetsuit cut from car tyres, a dive knife, lungs like a bellows. Still looking for Sal.
PORTRAIT.eel = (g, PX, o) => {
  PX.bg(g, 'mall');
  const S = PX.ramp('#b08a6a'),
    H = PX.ramp('#1e2a2a'),
    C = PX.ramp('#2e3232'),
    Gg = PX.ramp('#3a4a4a'),
    Gl = PX.ramp('#5a9a9a'),
    Mt = PX.ramp('#a8b0b0');
  // the tyre wetsuit, tread and all, up to the throat
  PX.torso(g, C, 40, 18, 46, 4, 60, { hi: 1 });
  for (let y = 44; y < 64; y += 3)
    for (let x = 6 + (y % 2) * 2; x < 58; x += 5) PX.rows(g, x, y, ['aa', '.a'], { a: C.d });
  PX.line(g, 32, 42, 32, 63, '#5a5a50');
  PX.mask().rect(27, 36, 10, 7).paint(g, C, { t: 0.55 });
  // wet hair slicked flat, drips
  PX.mask().oval(32, 25, 12, 12).rect(20, 25, 4, 14).rect(40, 25, 4, 14).paint(g, H, { hi: 1 });
  PX.head(g, 32, 27, 10, 12, S, 31, 1);
  PX.mask()
    .spans(16, [
      [24, 40],
      [22, 42],
      [22, 42],
      [22, 25],
      [40, 42],
    ])
    .paint(g, H, { hi: 1 });
  PX.rows(g, 24, 16, ['.h..h....h..h'], { h: H.h });
  [
    [21, 41],
    [43, 39],
    [22, 44],
  ].forEach(([x, y]) => PX.p(g, x, y, '#8ad0d8'));
  // dive goggles pushed up, hard eyes, a straight mouth
  PX.r(g, 20, 19, 24, 1, Gg.o);
  PX.mask().oval(27, 19, 4, 2).oval(37, 19, 4, 2).paint(g, Gg, { hi: 1 });
  PX.mask().oval(27, 19, 2, 1).oval(37, 19, 2, 1).paint(g, Gl, { line: false, hi: 1 });
  PX.brows(g, 25, 23, 10, 'angry', H.m);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#3a6a6a', lash: 1 });
  PX.nose(g, 32, 27, 'small', S);
  PX.mouth(g, 32, 33, ['ooooo'], S, '#6a3a34');
  PX.p(g, 41, 28, '#8ad0d8');
  // the dive knife, held point up
  PX.mask()
    .rows(49, 26, ['..o..', '.ooo.', '.ooo.', '.ooo.', '.ooo.', '.ooo.', '.ooo.', '.ooo.', '.ooo.', '.ooo.', 'ooooo'])
    .paint(g, Mt, { hi: 1 });
  PX.mask().rect(50, 37, 3, 8).paint(g, PX.ramp('#3a3030'));
  PX.mask().oval(51, 46, 4, 4).paint(g, S, { hi: 1 });
  // the drawing of Sal, folded in her belt
  PX.mask().rect(10, 54, 9, 7).paint(g, PX.ramp('#d8ccb0'), { t: 0.85 });
  PX.rows(g, 12, 55, ['.aa.', 'a..a', '.aa.', 'aaaa'], { a: '#5a4a3a' });
};

// Dr. Vane: clean coat, dirty fingernails, a smile with too many teeth. Cuts Ratchet's prices in half.
PORTRAIT.vane = (g, PX, o) => {
  PX.bg(g, 'mall');
  PX.r(g, 0, 0, 64, 64, 'rgba(160,200,160,0.08)');
  const S = PX.ramp('#c8b098'),
    H = PX.ramp('#1a1a1a'),
    C = PX.ramp('#d0ccc0'),
    Sh = PX.ramp('#3a3a3a'),
    Gl = PX.ramp('#9ab8a8'),
    Pw = PX.ramp('#8a8a80');
  PX.torso(g, C, 43, 16, 48, 2, 62, { hi: 1 });
  PX.mask().trap(43, 63, 26, 38, 26, 38).paint(g, Sh);
  PX.mask().rows(29, 43, ['ooooooo', '.ooooo.', '..ooo..', '...o...']).paint(g, PX.ramp('#5a7a6a'), { flat: true });
  PX.line(g, 26, 43, 31, 63, C.d);
  PX.line(g, 38, 43, 33, 63, C.d);
  PX.mask().rect(28, 37, 8, 6).paint(g, S, { t: 0.55 });
  // black hair combed flat and shining, a long pale face
  PX.ear(g, 21, 28, S);
  PX.ear(g, 43, 28, S);
  PX.mask().oval(32, 21, 12, 8).paint(g, H, { hi: 1 });
  PX.head(g, 32, 27, 10, 13, S, 30, 0.9);
  PX.mask()
    .spans(14, [
      [24, 40],
      [22, 42],
      [22, 42],
      [22, 36],
      [22, 30],
      [22, 26],
      [22, 24],
    ])
    .paint(g, H, { hi: 1 });
  PX.line(g, 26, 15, 36, 15, '#5a5a6a');
  // pleased eyes, and that smile
  PX.brows(g, 25, 22, 10, 'arch', H.m);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#6a8a6a', lid: 1 });
  PX.nose(g, 32, 27, 'long', S);
  PX.mouth(
    g,
    32,
    33,
    ['o............o', '.oooooooooooo.', '.owwwwwwwwwwo.', '..oooooooooo..'],
    S,
    '#5a2a2a',
    '#f0f0e0',
  );
  PX.rows(g, 27, 35, ['o.o.o.o.o.o'], { o: '#b8b8a8' });
  PX.rows(g, 24, 31, ['d..............d', '.d............d.'], { d: S.d });
  // a flask of grey powder, held up to the light, by dirty fingers
  PX.mask()
    .rows(46, 34, ['...oo...', '...oo...', '..oooo..', '.oooooo.', 'oooooooo', 'oooooooo', 'oooooooo', '.oooooo.'])
    .paint(g, Gl, { hi: 1 });
  PX.mask().rect(47, 39, 6, 3).paint(g, Pw, { line: false });
  PX.r(g, 49, 33, 2, 1, '#6a4a3a');
  PX.mask().oval(50, 45, 4, 3).paint(g, S, { hi: 1 });
  [
    [47, 43],
    [50, 43],
    [53, 43],
  ].forEach(([x, y]) => PX.p(g, x, y, '#4a3a2a'));
};

// Gums: an old Molar with no teeth left at all, so every word comes out soft. "Everything's for shale. Sale."
PORTRAIT.gums = (g, PX, o) => {
  PX.bg(g, 'mall');
  const S = PX.ramp('#a88060'),
    H = PX.ramp('#6a6050'),
    C = PX.ramp('#4a2a24'),
    Mt = PX.ramp('#8a8a8a'),
    Th = PX.ramp('#e0d4b0'),
    Wd = PX.ramp('#5a3a24');
  // the long gun on his back
  PX.mask().line(8, 60, 30, 6, 2).paint(g, Wd);
  PX.mask().line(26, 16, 34, -2, 1).paint(g, Mt, { line: false });
  // Molar leathers, shoulder spikes
  PX.torso(g, C, 43, 16, 48, 2, 62, { hi: 1 });
  [
    [14, 42],
    [19, 40],
    [45, 40],
    [50, 42],
  ].forEach(([x, y]) =>
    PX.mask()
      .rows(x - 1, y - 3, ['.o.', '.o.', 'ooo'])
      .paint(g, Mt, { hi: 1 }),
  );
  PX.mask().rect(27, 37, 10, 7).paint(g, S, { t: 0.55 });
  // the necklace of other people's teeth
  for (let i = 0; i < 11; i++) {
    const x = 22 + i * 2,
      y = 44 + Math.round(Math.sin((i / 10) * Math.PI) * 5);
    PX.mask().rect(x, y, 1, 2).paint(g, Th, { line: false, hi: 1 });
  }
  PX.line(g, 22, 43, 42, 43, '#3a2a1a');
  // a collapsed old face, cheeks fallen in where the teeth were
  PX.ear(g, 21, 26, S, 3);
  PX.ear(g, 43, 26, S, 3);
  PX.head(g, 32, 25, 10, 11, S, 29, 0.6);
  PX.rows(g, 22, 13, ['..a..a...a..a....', '.a..a...a...a..a.', 'a............a..a', '.a..............a'], { a: H.m });
  PX.r(g, 27, 18, 10, 1, S.d);
  PX.brows(g, 24, 21, 11, 'sad', H.d);
  PX.eyes(g, o, 25, 24, 10, { w: 4, skin: S, iris: '#6a5a4a', bag: 1 });
  PX.nose(g, 32, 25, 'hook', S);
  PX.rows(g, 24, 29, ['dd........dd', '.d........d.'], { d: S.d });
  // the gummy grin: all gum, not one tooth
  PX.mouth(g, 32, 31, ['oooooooo', 'oggggggo', 'orrrrrro', '.oooooo.'], S, '#3a1414');
  PX.rows(g, 29, 32, ['gggggg'], { g: '#d8707a' });
  PX.r(g, 29, 35, 6, 1, S.d);
  PX.r(g, 29, 36, 6, 1, S.l);
};

// ================= The Green =================
// The Gardener: an old man with soil in every line of his hands. Talks to the tomatoes before he talks to you.
PORTRAIT.gardener = (g, PX, o) => {
  PX.bg(g, 'green');
  const S = PX.ramp('#b48a6a'),
    H = PX.ramp('#d8d0c0'),
    C = PX.ramp('#5e6a3a'),
    St = PX.ramp('#c8ac60'),
    Tm = PX.ramp('#c8402a'),
    Lf = PX.ramp('#4a7a34'),
    Mt = PX.ramp('#8a8a80');
  PX.torso(g, C, 44, 16, 48, 4, 60);
  PX.rows(g, 10, 52, ['a.a.a', '.a.a.', 'a.a.a'], { a: C.d });
  PX.mask().rect(27, 38, 10, 7).paint(g, S, { t: 0.55 });
  // a gentle old face, a long white beard
  PX.ear(g, 21, 28, S, 4);
  PX.ear(g, 43, 28, S, 4);
  PX.head(g, 32, 27, 10, 12, S, 31, 0.6);
  PX.mask()
    .spans(31, [
      [22, 25],
      [22, 26],
      [22, 42],
      [22, 42],
      [23, 41],
      [24, 40],
      [25, 39],
      [26, 38],
      [27, 37],
      [28, 36],
      [29, 35],
      [30, 34],
      [31, 33],
      [31, 33],
    ])
    .rect(38, 31, 4, 2)
    .paint(g, H, { hi: 1 });
  PX.rows(g, 24, 34, ['.a..a..a..a..a.', 'a..a..a..a..a..', '..a..a..a...a..', '.a...a...a.....'], { a: H.d });
  PX.mask()
    .spans(32, [[27, 37]])
    .paint(g, H, { line: false, flat: true });
  PX.mouth(g, 32, 33, ['o.....o', '.ooooo.'], S, '#5a3a30');
  PX.brows(g, 24, 23, 11, 'sad', H.m);
  PX.eyes(g, o, 25, 26, 10, { w: 4, skin: S, iris: '#4a6a3a', lid: 1, bag: 1 });
  PX.nose(g, 32, 28, 'bulb', S);
  PX.r(g, 23, 30, 3, 1, '#c87a6a');
  PX.r(g, 39, 30, 3, 1, '#c87a6a');
  // a battered straw hat
  PX.mask().oval(32, 16, 9, 5).paint(g, St, { hi: 1 });
  PX.mask()
    .rows(14, 18, [
      '...oooooooooooooooooooooooooooooo...',
      'oooooooooooooooooooooooooooooooooooo',
      '.oo.ooo..........................oo.',
    ])
    .paint(g, St);
  PX.r(g, 24, 19, 17, 1, Lf.d);
  PX.rows(g, 26, 13, ['.a.a.a.a.a.a.'], { a: St.d });
  PX.p(g, 36, 12, St.o);
  // a tomato in a soil-black hand, the trowel in the other
  PX.mask().oval(14, 52, 6, 5).paint(g, Tm, { hi: 1 });
  PX.rows(g, 12, 46, ['a.a.a', '.aaa.'], { a: Lf.m });
  PX.mask().oval(14, 58, 6, 4).paint(g, S, { hi: 1 });
  PX.rows(g, 9, 57, ['d.d.d.d.d', '.d.d.d.d.'], { d: '#3a2a1a' });
  PX.mask().rows(49, 40, ['.ooo.', 'ooooo', 'ooooo', 'ooooo', '.ooo.', '..o..']).paint(g, Mt, { hi: 1 });
  PX.mask().rect(50, 46, 3, 10).paint(g, PX.ramp('#7a5434'));
  PX.mask().oval(51, 57, 4, 4).paint(g, S, { hi: 1 });
};

// The Warden: car-door plate, a Molar repeater, a face like a shut gate. "Name. Use. Reason. In that order."
PORTRAIT.warden = (g, PX, o) => {
  PX.bg(g, 'green');
  const S = PX.ramp('#a87a5a'),
    H = PX.ramp('#2a1e14'),
    C = PX.ramp('#4a4a3a'),
    Pl = PX.ramp('#5a7a8a'),
    Cap = PX.ramp('#3a3a30'),
    Mt = PX.ramp('#5a5a60'),
    Wd = PX.ramp('#5a3a24');
  PX.torso(g, C, 43, 16, 48, 2, 62);
  // a car door for a breastplate: paint, rust, the window crank
  PX.mask().trap(44, 63, 18, 46, 14, 50).paint(g, Pl, { hi: 1 });
  PX.r(g, 18, 46, 28, 1, Pl.d);
  PX.dots(43, 14, (x, y) => PX.p(g, 16 + (x % 32), 48 + (y % 14), '#8a4a2a'));
  PX.mask().rect(38, 52, 6, 2).paint(g, PX.ramp('#aaaaaa'), { hi: 1 });
  PX.mask().oval(39, 53, 1, 1).paint(g, PX.ramp('#aaaaaa'));
  PX.mask().rect(28, 37, 8, 7).paint(g, S, { t: 0.55 });
  // a hard, square face, hair cropped under a cap
  PX.ear(g, 21, 27, S);
  PX.ear(g, 43, 27, S);
  PX.head(g, 32, 27, 10, 12, S, 32, 0.6);
  PX.mask()
    .spans(19, [
      [22, 24],
      [22, 24],
      [22, 24],
      [22, 23],
    ])
    .paint(g, H);
  PX.mask()
    .spans(19, [
      [40, 42],
      [40, 42],
      [40, 42],
      [41, 42],
    ])
    .paint(g, H);
  PX.brows(g, 25, 23, 10, 'flat', H.m);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#3a4a3a', lid: 1, lash: 1 });
  PX.nose(g, 32, 27, 'small', S);
  PX.mouth(g, 32, 33, ['ooooooo'], S, '#4a2a24');
  PX.r(g, 28, 36, 8, 1, S.d);
  PX.r(g, 23, 30, 1, 4, S.d);
  PX.r(g, 41, 30, 1, 4, S.d);
  // a scar through the brow
  PX.line(g, 37, 21, 39, 27, S.l);
  // a military cap, peak pulled straight
  PX.mask().oval(32, 16, 11, 5).rect(21, 16, 23, 3).paint(g, Cap, { hi: 1 });
  PX.mask().rows(20, 19, ['oooooooooooooooooooooooooo', '.oooooooooooooooooooooooo.']).paint(g, PX.ramp('#22221c'));
  // the repeater, up, and her hands on it
  PX.mask().line(46, 63, 58, 6, 3).paint(g, Wd, { hi: 1 });
  PX.mask().line(53, 30, 59, 2, 2).paint(g, Mt, { hi: 1 });
  PX.mask().rect(53, 30, 5, 6).paint(g, Mt, { hi: 1 });
  PX.mask().oval(51, 46, 4, 4).paint(g, S, { hi: 1 });
};

// Moss: skin the colour of pond water, grey eyes, a chain from his ankle to the biggest vat. Stirs it and smiles.
PORTRAIT.moss = (g, PX, o) => {
  PX.bg(g, 'vats');
  const S = PX.ramp('#7a9a64'),
    H = PX.ramp('#3e5a32'),
    C = PX.ramp('#4a5a40'),
    Wd = PX.ramp('#6a5a3a'),
    Mt = PX.ramp('#6a6a60');
  PX.oval(g, 32, 30, 26, 26, 'rgba(0,0,0,0.35)');
  for (let r = 24; r > 12; r -= 4) PX.oval(g, 32, 26, r, r - 2, `rgba(168,224,124,${0.05 + (24 - r) * 0.012})`);
  // the paddle, over his shoulder
  PX.mask().line(46, 63, 58, 14, 2).paint(g, Wd, { hi: 1 });
  PX.mask()
    .rows(54, 2, ['.oooo.', 'oooooo', 'oooooo', 'oooooo', 'oooooo', 'oooooo', '.oooo.', '..oo..'])
    .paint(g, Wd, { hi: 1 });
  PX.torso(g, C, 44, 18, 46, 4, 60);
  PX.rows(g, 8, 52, ['a..a...a', '.a..a.a.', 'a....a..'], { a: C.d });
  PX.mask().rect(27, 37, 10, 8).paint(g, S, { t: 0.55 });
  // the chain, its links climbing out of the frame
  for (let i = 0; i < 5; i++)
    PX.mask()
      .oval(14 + (i % 2), 62 - i * 3, 1, 1)
      .paint(g, Mt, { hi: 1 });
  // a soft, damp, peaceful face, hair like weed
  PX.ear(g, 21, 27, S);
  PX.ear(g, 43, 27, S);
  PX.mask().oval(32, 23, 12, 10).rect(20, 23, 3, 10).rect(42, 23, 3, 10).paint(g, H, { hi: 1 });
  PX.head(g, 32, 27, 10, 12, S, 31, 0.9, { ink: '#14220e' });
  PX.mask()
    .spans(15, [
      [24, 40],
      [22, 42],
      [22, 42],
      [22, 30],
      [33, 42],
      [22, 25],
      [40, 42],
    ])
    .rect(22, 22, 2, 4)
    .paint(g, H, { hi: 1 });
  PX.rows(g, 22, 15, ['.a..a..a..a..a..a.', 'a..a..a..a..a..a..'], { a: H.l });
  PX.p(g, 26, 31, S.l);
  PX.p(g, 38, 30, S.l);
  PX.p(g, 30, 20, '#a8e07c');
  PX.p(g, 35, 19, '#a8e07c');
  // calm grey eyes, a free smile
  PX.brows(g, 25, 23, 10, 'raised', H.d);
  PX.eyes(g, o, 25, 25, 10, {
    w: 4,
    skin: S,
    iris: '#8a9a9a',
    pupil: '#2a3a3a',
    white: '#d8e8c8',
    lid: 1,
    ink: '#14220e',
  });
  PX.nose(g, 32, 27, 'small', S);
  PX.mouth(g, 32, 33, ['o.....o', '.ooooo.'], S, '#2a3a1e');
};

// Fern: dirt to the elbows, a sunburnt nose, and the only person in the Green who looks at the gate like it's a door
PORTRAIT.fern = (g, PX, o) => {
  PX.bg(g, 'green');
  const S = PX.ramp('#c89a72'),
    H = PX.ramp('#8a5a2a'),
    C = PX.ramp('#5e7a3e'),
    A = PX.ramp('#b8a880'),
    Sf = PX.ramp('#e8c030'),
    Lf = PX.ramp('#4a7a34');
  PX.torso(g, C, 44, 18, 46, 4, 60);
  PX.mask().trap(48, 63, 22, 42, 20, 44).paint(g, A, { hi: 1 });
  PX.dots(47, 12, (x, y) => PX.p(g, 22 + (x % 22), 50 + (y % 14), A.d));
  PX.mask().rect(28, 37, 8, 7).paint(g, S, { t: 0.55 });
  // hair in two bunches, flyaway
  PX.mask().oval(32, 25, 12, 12).oval(18, 30, 4, 5).oval(46, 30, 4, 5).paint(g, H, { hi: 1 });
  PX.p(g, 15, 27, H.m);
  PX.p(g, 49, 27, H.m);
  PX.mask().rect(19, 26, 2, 2).rect(44, 26, 2, 2).paint(g, PX.ramp('#c83a3a'));
  PX.head(g, 32, 27, 10, 12, S, 31, 1);
  PX.mask()
    .spans(15, [
      [25, 39],
      [23, 41],
      [22, 42],
      [22, 28],
      [31, 33],
      [22, 24],
      [40, 42],
    ])
    .paint(g, H, { hi: 1 });
  // wide, eager eyes, a sunburnt nose, an open grin
  PX.brows(g, 25, 22, 10, 'raised', H.d);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#6a8a3a', lash: 1, tall: 1 });
  PX.nose(g, 32, 28, ['.l', 'rr', 'o.'], { l: '#e8907a', d: '#c8604a', o: S.o, m: S.m, h: S.h });
  PX.r(g, 29, 29, 2, 1, '#e07a6a');
  PX.r(g, 33, 29, 2, 1, '#e07a6a');
  PX.mouth(g, 32, 32, ['ooooooo', 'owwwwwo', '.orrro.', '..ooo..'], S, '#8a3a30', '#f0e8d8');
  PX.p(g, 24, 33, '#5a3a20');
  PX.p(g, 25, 34, '#5a3a20');
  // dirt-black arms holding up a sunflower
  PX.mask().line(50, 63, 50, 30, 1).paint(g, Lf, { hi: 1 });
  PX.mask().rows(51, 40, ['.oo', 'ooo', 'oo.']).paint(g, Lf, { line: false });
  PX.mask().oval(50, 22, 7, 7).paint(g, Sf, { hi: 1 });
  PX.mask().oval(50, 22, 3, 3).paint(g, PX.ramp('#5a3a1a'), { hi: 1 });
  PX.dots(59, 10, (x, y) => PX.p(g, 48 + (x % 5), 20 + (y % 5), '#3a2a10'));
  PX.mask().oval(50, 52, 4, 4).paint(g, PX.ramp('#6a4a30'), { hi: 1 });
};

// ================= The Sky-Bus =================
// Mother Ohm: alone in the last seat of the dead plane, headset on, listening to the Voice. Prays to wires, kindly.
PORTRAIT.ohm = (g, PX, o) => {
  PX.bg(g, 'skybus');
  const S = PX.ramp('#b89478'),
    H = PX.ramp('#8c8a80'),
    C = PX.ramp('#4a5e74'),
    Gg = PX.ramp('#5a5040'),
    Gl = PX.ramp('#e8a040'),
    Wr = PX.ramp('#c86a2a'),
    Mt = PX.ramp('#7a7a80');
  // the seat back behind her
  PX.mask()
    .rect(12, 8, 40, 56)
    .cut((x, y) => (x < 14 || x > 49) && y < 10)
    .paint(g, PX.ramp('#3a4a6a'), { hi: 1 });
  PX.r(g, 16, 10, 32, 1, '#5a6a8a');
  // a blue robe hung with wire and fuses
  PX.torso(g, C, 44, 16, 48, 4, 60, { hi: 1 });
  PX.line(g, 18, 46, 46, 56, Wr.m);
  PX.line(g, 46, 46, 18, 58, PX.ramp('#4a8aa0').m);
  [
    [24, 49],
    [38, 52],
    [30, 55],
  ].forEach(([x, y]) => PX.mask().rect(x, y, 3, 2).paint(g, PX.ramp('#c8b040'), { hi: 1 }));
  PX.mask().rect(28, 37, 8, 7).paint(g, S, { t: 0.55 });
  // long grey hair, a serene face
  PX.mask().oval(32, 26, 13, 13).rect(19, 26, 5, 18).rect(40, 26, 5, 18).paint(g, H, { hi: 1 });
  PX.rows(g, 20, 30, ['a', '.', 'a', '.', 'a', '.', 'a'], { a: H.d });
  PX.rows(g, 43, 30, ['a', '.', 'a', '.', 'a', '.', 'a'], { a: H.d });
  PX.head(g, 32, 27, 10, 12, S, 31, 1);
  PX.mask()
    .spans(16, [
      [25, 39],
      [23, 41],
      [22, 42],
      [22, 31],
      [22, 26],
      [22, 24],
    ])
    .rect(37, 19, 6, 2)
    .paint(g, H, { hi: 1 });
  PX.brows(g, 25, 23, 10, 'flat', H.d);
  // eyes half closed, listening
  PX.eyes(g, o, 25, 26, 10, { w: 4, skin: S, iris: '#5a7a9a', lid: 1, lash: 1 });
  if (!o.shut) {
    PX.r(g, 25, 26, 4, 1, S.d);
    PX.r(g, 35, 26, 4, 1, S.d);
    PX.r(g, 25, 27, 4, 1, S.o);
    PX.r(g, 35, 27, 4, 1, S.o);
    PX.p(g, 27, 27, '#5a7a9a');
    PX.p(g, 37, 27, '#5a7a9a');
  }
  PX.nose(g, 32, 28, 'small', S);
  PX.mouth(g, 32, 33, ['o...o', '.ooo.'], S, '#7a4a44');
  // the headset, and goggles pushed up into the grey
  PX.mask()
    .rows(19, 12, [
      '.....oooooooooooooooo.....',
      '...oo................oo...',
      '..o....................o..',
      '.o......................o.',
    ])
    .paint(g, Mt, { line: false, flat: true });
  PX.mask().rect(18, 24, 4, 7).paint(g, PX.ramp('#3a3a40'), { hi: 1 });
  PX.mask().rect(42, 24, 4, 7).paint(g, PX.ramp('#3a3a40'), { hi: 1 });
  PX.mask().line(21, 30, 26, 35, 1).paint(g, Mt, { line: false, flat: true });
  PX.mask().oval(27, 35, 1, 1).paint(g, PX.ramp('#2a2a2a'));
  PX.r(g, 22, 18, 20, 1, Gg.o);
  PX.mask().oval(28, 18, 3, 2).oval(36, 18, 3, 2).paint(g, Gg, { hi: 1 });
  PX.mask().oval(28, 18, 1, 1).oval(36, 18, 1, 1).paint(g, Gl, { line: false, hi: 1 });
  // a little light on the headset, on
  PX.p(g, 44, 26, '#a8e07c');
};

// ================= Silo 9 =================
// The Dentist King: a crown of teeth, a robe the colour of a gum, a drill, and a missile. Collects teeth. And people.
PORTRAIT.king = (g, PX, o) => {
  PX.bg(g, 'silo');
  const S = PX.ramp('#c09070'),
    H = PX.ramp('#3a2a1c'),
    C = PX.ramp('#7a1e2a'),
    Fr = PX.ramp('#d8ccb0'),
    Th = PX.ramp('#f0e8d0'),
    Au = PX.ramp('#d8b040'),
    Mt = PX.ramp('#a8a8b0');
  // red light behind him
  PX.oval(g, 32, 28, 24, 22, 'rgba(232,64,48,0.12)');
  // a robe of gum-red, a high collar
  PX.torso(g, C, 42, 12, 52, 0, 63, { hi: 1 });
  PX.mask()
    .rows(12, 36, [
      'ooo..................................ooo',
      'oooo................................oooo',
      'ooooo..............................ooooo',
      '.ooooo............................ooooo.',
      '..ooooo..........................ooooo..',
      '...oooooo......................oooooo...',
      '....ooooooo..................ooooooo....',
    ])
    .paint(g, C, { hi: 1 });
  // a necklace of big molars
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 3,
      y = 46 + Math.round(Math.sin((i / 8) * Math.PI) * 6);
    PX.mask().rows(x, y, ['ooo', 'ooo', 'o.o']).paint(g, Th, { line: false, hi: 1 });
    PX.p(g, x + 2, y + 1, Th.d);
  }
  PX.mask().rect(27, 36, 10, 8).paint(g, S, { t: 0.55 });
  // a long, proud face, a dentist's head mirror, oiled hair
  PX.ear(g, 21, 28, S);
  PX.ear(g, 43, 28, S);
  PX.mask().oval(32, 23, 12, 10).paint(g, H, { hi: 1 });
  PX.head(g, 32, 27, 10, 12, S, 30, 0.8);
  PX.mask()
    .spans(16, [
      [24, 40],
      [22, 42],
      [22, 42],
      [22, 27],
      [37, 42],
      [22, 24],
      [40, 42],
    ])
    .paint(g, H, { hi: 1 });
  // eyes that have already decided, a perfect smile, a gold tooth in the middle
  PX.brows(g, 24, 22, 11, 'angry', H.o);
  PX.eyes(g, o, 25, 25, 10, { w: 4, skin: S, iris: '#7a2a2a', lid: 1 });
  if (!o.shut) {
    PX.p(g, 26, 26, '#ff6040');
    PX.p(g, 36, 26, '#ff6040');
  }
  PX.nose(g, 32, 27, 'long', S);
  PX.mouth(g, 32, 33, ['oooooooooooo', 'owwwwwwwwwwo', '.oooooooooo.'], S, '#3a1014', '#f8f4e8');
  PX.rows(g, 27, 34, ['.o.o.o.o.o.'], { o: '#c8c0a8' });
  PX.p(g, 32, 34, Au.l);
  PX.rows(g, 26, 31, ['aaa.....aaa'], { a: H.m });
  PX.p(g, 32, 37, H.m);
  PX.p(g, 32, 38, H.m);
  // the crown: gold, set with teeth
  PX.mask()
    .rows(20, 10, [
      'o....o.....o.....o....o',
      'oo..ooo...ooo...ooo..oo',
      'ooooooooooooooooooooooo',
      'ooooooooooooooooooooooo',
      'ooooooooooooooooooooooo',
    ])
    .paint(g, Au, { hi: 1 });
  [22, 27, 32, 37, 42].forEach(x =>
    PX.mask()
      .rows(x - 1, 9, ['ooo', 'o.o'])
      .paint(g, Fr, { line: false }),
  );
  PX.r(g, 20, 15, 23, 1, Au.d);
  // the drill, raised, still wet
  PX.mask().rect(46, 40, 10, 9).paint(g, Mt, { hi: 1 });
  PX.mask().rect(49, 49, 4, 14).paint(g, PX.ramp('#3a3a3a'), { hi: 1 });
  PX.mask()
    .rows(49, 30, ['.oo.', '.oo.', 'oooo', 'oooo', 'oooo', '.oo.', '.oo.', '.oo.', '..o.', '..o.'])
    .paint(g, Mt, { hi: 1 });
  PX.p(g, 51, 30, '#c83030');
  PX.p(g, 51, 31, '#c83030');
  PX.mask().oval(51, 56, 5, 4).paint(g, S, { hi: 1 });
};
