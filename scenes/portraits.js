'use strict';
// ================= PORTRAITS: a detailed picture of everyone you can talk to (v9.0) =================
// Will: "forget about all the 2D thing, turn it back into text based, but draw detailed portraits for each
// character. Still optimise for phone." Each portrait is head and shoulders, drawn in code as pixel art on a
// 64 x 64 grid, our own art (nothing traced or borrowed). Shown big at the top of their talk screen, and on the
// ending slides. Anyone without one here falls back to the small sprite portrait (scenes/sprite.js).
//
// PORTRAIT[id] = (g, P, o) => draws on a 64 x 64 grid. g is the 2d context (one unit = one pixel),
//   P is the helpers below, o.shut is true for a blink (draw the eyes closed), o.mood the NPC's current mood.
const PW = 64,
  PH = 64;
const P = {
  r(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  },
  // a pixel
  p(g, x, y, c) {
    g.fillStyle = c;
    g.fillRect(x, y, 1, 1);
  },
  // rows of palette letters, '.' see-through: P.rows(g, x, y, ['..aa..', '.abba.'], { a: '#000', b: '#fff' })
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
  g.setTransform((css * dpr) / PW, 0, 0, (css * dpr) / PH, 0, 0);
  g.fillStyle = '#140e07';
  g.fillRect(0, 0, PW, PH);
  f(g, P, { shut: !!shut, mood: typeof S !== 'undefined' && S && S.n && S.n[id] ? S.n[id].op : 0 });
  return true;
}
