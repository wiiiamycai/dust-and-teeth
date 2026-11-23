'use strict';
// ================= THE TOWN KIT: ground tiles, buildings, props and signs for the walking towns (v9.23) =================
// From the mock-ups Will approved: compact towns at 24 pixels a tile, lit from the top left, an ink outline, and a
// bleak grade over the lot. A town is painted once into one picture (scenes/townmaps.js says what goes where).
// Everything solid it paints (a building, a barrel, a fence) is noted, so the walking knows where you can't go,
// and every door is noted, so you can knock on it. Looks only: no canvas (the headless tests), no towns.
const TK = (() => {
  const T = 24,
    INK = '#2a1810',
    R = PX.ramp;
  let W = 10,
    H = 12;
  let g,
    MAP,
    SOLID = [],
    DOORS = [];
  const solid = (x, y, w, h) => SOLID.push([x, y, w, h]);
  const r = (x, y, w, h, c) => PX.r(g, x, y, w, h, c),
    p = (x, y, c) => PX.p(g, x, y, c);
  const hash = (x, y, k = 0) => {
    let h = (x * 374761393 + y * 668265263 + k * 1442695041) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const at = (x, y) => (MAP[y] || '')[x] || '.';
  let PAL = {};
  const SANDS = {
    sand: ['#e2c690', '#d4b47c', '#ecd6a4', '#c4a26c'],
    rust: ['#c49a6c', '#b0845a', '#d4aa7c', '#9a7048'],
    night: ['#9a8a8a', '#8a7a7e', '#aa9a98', '#706068'],
  };
  const sand = (tx, ty) => {
    const S = PAL.sand || SANDS.sand,
      x0 = tx * T,
      y0 = ty * T;
    r(x0, y0, T, T, S[0]);
    for (let y = 0; y < T; y += 8)
      for (let x = 0; x < T; x++) {
        if (hash(tx * 31 + ((x0 + x) >> 3), ty * 17 + y, 5) < 0.45) continue;
        const yy = y + Math.round(Math.sin((x0 + x) / 5 + (y0 + y) / 7) * 1.5);
        if (yy >= 0 && yy < T) {
          p(x0 + x, y0 + yy, S[1]);
          if (yy > 0) p(x0 + x, y0 + yy - 1, S[2]);
        }
      }
    for (let i = 0; i < 3; i++)
      if (hash(tx, ty, i + 20) < 0.6) {
        const px = (hash(tx, ty, i) * 22) | 0,
          py = (hash(tx, ty, i + 9) * 22) | 0;
        p(x0 + px, y0 + py, S[3]);
        p(x0 + px + 1, y0 + py, S[2]);
      }
  };
  const tufts = (tx, ty, n, cols) => {
    for (let i = 0; i < n; i++) {
      const x = tx * T + ((hash(tx, ty, i) * 20) | 0) + 1,
        y = ty * T + ((hash(tx, ty, i + 40) * 19) | 0) + 3;
      PX.rows(g, x, y, ['a.b.a', '.aba.', '.cac.'], { a: cols[0], b: cols[1], c: cols[2] });
    }
  };
  const TILE = {
    s: (x, y) => {
      r(x * T, y * T, T, T, '#ece8de');
      for (let i = 0; i < 5; i++) {
        const xx = x * T + ((hash(x, y, i) * 20) | 0),
          yy = y * T + ((hash(x, y, i + 5) * 20) | 0);
        PX.line(g, xx, yy, xx + 3 + ((hash(x, y, i + 9) * 5) | 0), yy + 2, '#c8c2b4');
      }
      for (let i = 0; i < 10; i++)
        p(x * T + ((hash(x, y, i + 30) * 24) | 0), y * T + ((hash(x, y, i + 40) * 24) | 0), '#fffcf4');
    },
    '.': sand,
    ',': (x, y) => {
      sand(x, y);
      tufts(x, y, 9, ['#b8b058', '#d0c870', '#7a7a38']);
    },
    g: (x, y) => {
      r(x * T, y * T, T, T, '#6a9a3a');
      for (let i = 0; i < 26; i++)
        p(
          x * T + ((hash(x, y, i) * 24) | 0),
          y * T + ((hash(x, y, i + 50) * 24) | 0),
          hash(x, y, i + 9) < 0.5 ? '#5a8a30' : '#7aaa48',
        );
      tufts(x, y, 6, ['#4a7a2a', '#8aba58', '#3a6a22']);
    },
    ';': (x, y) => {
      r(x * T, y * T, T, T, '#7a5a38');
      for (let yy = 2; yy < T; yy += 6) {
        r(x * T, y * T + yy, T, 2, '#5a4028');
        for (let xx = 2; xx < T; xx += 5)
          PX.rows(g, x * T + xx, y * T + yy - 4, ['.a.', 'aba', '.a.'], { a: '#8aa040', b: '#c8c060' });
      }
    },
    '~': (x, y) => {
      r(x * T, y * T, T, T, '#3a6a70');
      for (let i = 0; i < 4; i++) {
        const xx = x * T + ((hash(x, y, i) * 18) | 0),
          yy = y * T + ((hash(x, y, i + 7) * 22) | 0);
        r(xx, yy, 6, 1, '#6aa0a4');
        r(xx + 2, yy + 1, 3, 1, '#2a5458');
      }
      if (at(x, y - 1) !== '~') {
        r(x * T, y * T, T, 2, '#d8e8e0');
        r(x * T, y * T + 2, T, 1, '#5a8a8a');
      }
    },
    '#': (x, y) => {
      r(x * T, y * T, T, T, '#8a8680');
      r(x * T, y * T, T, 1, '#6a6660');
      r(x * T, y * T, 1, T, '#6a6660');
      for (let i = 0; i < 8; i++)
        p(
          x * T + ((hash(x, y, i) * 24) | 0),
          y * T + ((hash(x, y, i + 3) * 24) | 0),
          hash(x, y, i + 5) < 0.5 ? '#7a7670' : '#9a968e',
        );
      if (hash(x, y, 77) < 0.3) PX.line(g, x * T + 4, y * T + 6, x * T + 14, y * T + 12, '#5a5650');
    },
    '=': (tx, ty) => {
      const x0 = tx * T,
        y0 = ty * T,
        D = PAL.road || ['#b88e5e', '#a07a4c', '#c89e6e', '#8a6a44', '#7a5a3a', '#d8b88a'];
      r(x0, y0, T, T, D[0]);
      for (let i = 0; i < 14; i++)
        p(
          x0 + ((hash(tx, ty, i) * 24) | 0),
          y0 + ((hash(tx, ty, i + 30) * 24) | 0),
          hash(tx, ty, i + 60) < 0.5 ? D[1] : D[2],
        );
      for (let i = 0; i < 2; i++) {
        const x = x0 + ((hash(tx, ty, i + 80) * 20) | 0),
          y = y0 + ((hash(tx, ty, i + 90) * 20) | 0);
        PX.rows(g, x, y, ['.oo.', 'ollo', '.oo.'], { o: D[4], l: D[5] });
      }
      if (at(tx, ty - 1) !== '=') {
        r(x0, y0, T, 2, D[3]);
        r(x0, y0 + 2, T, 1, D[1]);
      }
      if (at(tx, ty + 1) !== '=') r(x0, y0 + T - 2, T, 2, D[3]);
      if (at(tx - 1, ty) !== '=') {
        r(x0, y0, 2, T, D[3]);
        r(x0 + 2, y0, 1, T, D[1]);
      }
      if (at(tx + 1, ty) !== '=') r(x0 + T - 2, y0, 2, T, D[3]);
    },
  };
  const shadow = (x, y, w, h) => {
    g.fillStyle = 'rgba(70,40,20,0.32)';
    for (let j = 0; j < h; j++) {
      const k = Math.round((w / 2) * Math.sqrt(Math.max(0, 1 - ((j - h / 2) / (h / 2)) ** 2)));
      g.fillRect(Math.round(x + w / 2 - k), Math.round(y + j), k * 2, 1);
    }
  };
  const building = (x, y, w, rh, wh, roof, wall, o = {}) => {
    solid(x - 4, y, w + 8, rh + wh);
    shadow(x + 6, y + rh + wh - 4, w, 12);
    const Wl = R(wall),
      Rf = R(roof);
    PX.mask()
      .rect(x, y + rh, w, wh)
      .paint(g, Wl, { t: 0.92, hi: 1, ink: INK });
    if (o.planks)
      for (let yy = y + rh + 4; yy < y + rh + wh - 2; yy += 4) {
        r(x + 1, yy, w - 2, 1, Wl.d);
        for (let xx = x + 3 + ((yy / 4) % 2) * 9; xx < x + w - 2; xx += 18) p(xx, yy - 2, Wl.d);
      }
    if (o.adobe)
      for (let i = 0; i < (w * wh) / 26; i++)
        p(
          x + 2 + ((hash(i, 3) * (w - 4)) | 0),
          y + rh + 2 + ((hash(i, 4) * (wh - 4)) | 0),
          hash(i, 5) < 0.5 ? Wl.d : Wl.l,
        );
    if (o.bricks)
      for (let yy = y + rh + 3; yy < y + rh + wh - 2; yy += 4) {
        r(x + 1, yy, w - 2, 1, Wl.d);
        for (let xx = x + ((yy / 4) % 2) * 4; xx < x + w; xx += 8) p(xx, yy - 2, Wl.d);
      }
    PX.mask()
      .rect(x - 4, y, w + 8, rh)
      .paint(g, Rf, { t: 0.9, hi: 1, ink: INK });
    if (o.tin)
      for (let xx = x - 2; xx < x + w + 3; xx += 5) {
        r(xx, y + 2, 1, rh - 4, Rf.d);
        r(xx + 1, y + 2, 1, rh - 4, Rf.h);
        r(xx + 2, y + 2, 1, rh - 4, Rf.l);
      }
    if (o.rust)
      for (let i = 0; i < 26; i++) {
        const xx = x + ((hash(i, 7) * w) | 0),
          yy = y + 3 + ((hash(i, 8) * (rh - 6)) | 0);
        p(xx, yy, '#9a4a2a');
        p(xx + 1, yy, '#b8643a');
      }
    if (o.tiles)
      for (let yy = y + 2; yy < y + rh - 2; yy += 4)
        for (let xx = x - 3 + ((yy / 4) % 2) * 4; xx < x + w + 3; xx += 8) {
          r(xx, yy + 3, 7, 1, Rf.d);
          p(xx, yy, Rf.l);
        }
    if (o.flat) {
      r(x - 3, y + 1, w + 6, 2, Rf.l);
      r(x - 3, y + rh - 4, w + 6, 2, Rf.d);
    }
    if (o.thatch)
      for (let i = 0; i < w * 2; i++) {
        const xx = x - 3 + ((hash(i, 11) * (w + 6)) | 0),
          yy = y + 2 + ((hash(i, 12) * (rh - 4)) | 0);
        r(xx, yy, 1, 3, hash(i, 13) < 0.5 ? Rf.d : Rf.l);
      }
    r(x - 4, y + rh, w + 8, 2, INK);
    r(x, y + rh + 2, w, 1, 'rgba(40,20,10,0.35)');
  };
  const door = (x, y, col, w = 12) => {
    DOORS.push({ x, y, w });
    PX.mask()
      .rect(x - 2, y - 2, w + 4, 22)
      .paint(g, R('#5a3a24'), { ink: INK });
    PX.mask().rect(x, y, w, 20).paint(g, R(col), { hi: 1, ink: INK });
    r(x + w - 3, y + 10, 2, 2, '#e8c050');
  };
  const win = (x, y, lit) => {
    PX.mask()
      .rect(x - 1, y - 1, 14, 12)
      .paint(g, R('#6a4a30'), { ink: INK });
    r(x + 1, y + 1, 10, 8, lit ? '#f4c464' : '#34484c');
    r(x + 6, y + 1, 1, 8, '#6a4a30');
    r(x + 1, y + 5, 10, 1, '#6a4a30');
    if (lit) r(x + 1, y + 1, 3, 2, '#fff4b0');
    else p(x + 2, y + 2, '#7a9aa0');
    r(x - 2, y + 11, 16, 2, '#4a3020');
  };
  const FONT = {
    A: ['.a.', 'a.a', 'aaa', 'a.a', 'a.a'],
    B: ['aa.', 'a.a', 'aa.', 'a.a', 'aa.'],
    C: ['.aa', 'a..', 'a..', 'a..', '.aa'],
    D: ['aa.', 'a.a', 'a.a', 'a.a', 'aa.'],
    E: ['aaa', 'a..', 'aa.', 'a..', 'aaa'],
    F: ['aaa', 'a..', 'aa.', 'a..', 'a..'],
    G: ['.aa', 'a..', 'a.a', 'a.a', '.aa'],
    H: ['a.a', 'a.a', 'aaa', 'a.a', 'a.a'],
    I: ['aaa', '.a.', '.a.', '.a.', 'aaa'],
    K: ['a.a', 'a.a', 'aa.', 'a.a', 'a.a'],
    L: ['a..', 'a..', 'a..', 'a..', 'aaa'],
    M: ['a.a', 'aaa', 'aaa', 'a.a', 'a.a'],
    N: ['aa.', 'a.a', 'a.a', 'a.a', 'a.a'],
    O: ['.a.', 'a.a', 'a.a', 'a.a', '.a.'],
    P: ['aa.', 'a.a', 'aa.', 'a..', 'a..'],
    R: ['aa.', 'a.a', 'aa.', 'a.a', 'a.a'],
    S: ['.aa', 'a..', '.a.', '..a', 'aa.'],
    T: ['aaa', '.a.', '.a.', '.a.', '.a.'],
    U: ['a.a', 'a.a', 'a.a', 'a.a', 'aaa'],
    V: ['a.a', 'a.a', 'a.a', 'a.a', '.a.'],
    W: ['a.a', 'a.a', 'aaa', 'aaa', 'a.a'],
    Y: ['a.a', 'a.a', '.a.', '.a.', '.a.'],
    9: ['aaa', 'a.a', 'aaa', '..a', 'aaa'],
    "'": ['a', 'a', '.', '.', '.'],
    ' ': ['.', '.', '.', '.', '.'],
  };
  const text = (x, y, s, c) => {
    let xx = x;
    for (const ch of s) {
      const f = FONT[ch] || FONT[' '];
      PX.rows(g, xx, y, f, { a: c });
      xx += f[0].length + 1;
    }
    return xx - x - 1;
  };
  const textW = s => [...s].reduce((n, ch) => n + (FONT[ch] || FONT[' '])[0].length + 1, -1);
  const sign = (cx, y, s, bg = '#5a3a20', fg = '#f0d080') => {
    const w = textW(s) + 8;
    PX.mask()
      .rect(cx - (w >> 1), y, w, 11)
      .paint(g, R(bg), { hi: 1, ink: INK });
    text(cx - (w >> 1) + 4, y + 3, s, fg);
  };
  const props = {
    barrel: (x, y) => {
      shadow(x, y + 15, 16, 4);
      PX.mask()
        .rect(x + 1, y + 1, 13, 15)
        .cut((a, b) => (a === x + 1 || a === x + 13) && (b === y + 1 || b === y + 15))
        .paint(g, R('#8a5a34'), { hi: 1, ink: INK });
      r(x + 2, y + 5, 11, 1, '#4a4040');
      r(x + 2, y + 11, 11, 1, '#4a4040');
      PX.mask()
        .oval(x + 7, y + 2, 5, 1)
        .paint(g, R('#a87848'), { ink: INK });
    },
    crate: (x, y) => {
      shadow(x, y + 14, 18, 4);
      PX.mask().rect(x, y, 16, 15).paint(g, R('#b08a50'), { hi: 1, ink: INK });
      r(x + 1, y + 7, 14, 1, '#7a5a30');
      r(x + 7, y + 1, 1, 13, '#7a5a30');
    },
    rock: (x, y, s = 1) => {
      shadow(x + 2, y + 12 * s, 22 * s, 5);
      PX.mask()
        .oval(x + 12 * s, y + 8 * s, 11 * s, 7 * s)
        .oval(x + 5 * s, y + 10 * s, 5 * s, 4 * s)
        .paint(g, R('#9a8a74'), { t: 0.66, hi: 1, ink: INK });
    },
    cactus: (x, y) => {
      shadow(x + 2, y + 34, 22, 6);
      const C = R('#6a9a4a');
      PX.mask()
        .rect(x + 9, y + 4, 7, 34)
        .oval(x + 12, y + 4, 3, 3)
        .rect(x + 2, y + 14, 4, 10)
        .rect(x + 2, y + 22, 8, 4)
        .oval(x + 4, y + 14, 2, 2)
        .rect(x + 19, y + 10, 4, 10)
        .rect(x + 15, y + 18, 7, 4)
        .oval(x + 21, y + 10, 2, 2)
        .paint(g, C, { t: 0.66, hi: 1, ink: INK });
      for (let yy = y + 6; yy < y + 36; yy += 2) {
        p(x + 11, yy, C.h);
        p(x + 14, yy, C.d);
      }
    },
    tree: (x, y, col = '#7a8a3a') => {
      shadow(x - 2, y + 40, 56, 12);
      PX.mask()
        .rect(x + 20, y + 32, 9, 16)
        .paint(g, R('#6a4a2e'), { hi: 1, ink: INK });
      const L = R(col),
        m = PX.mask();
      [
        [24, 16, 22, 17],
        [8, 22, 13, 11],
        [40, 22, 13, 11],
        [24, 4, 15, 11],
        [12, 9, 10, 9],
        [36, 9, 10, 9],
        [24, 26, 16, 9],
      ].forEach(([cx, cy, rx, ry]) => m.oval(x + cx, y + cy, rx, ry));
      m.paint(g, L, { t: 0.62, hi: 1, ink: INK });
      [
        [14, 6],
        [22, 2],
        [8, 15],
        [18, 12],
        [28, 7],
        [36, 13],
        [24, 18],
        [4, 22],
        [30, 0],
        [12, 0],
      ].forEach(([a, b], i) => PX.rows(g, x + a, y + b, ['.hh.', 'h..h'], { h: i < 6 ? L.h : L.l }));
      [
        [32, 28],
        [42, 24],
        [22, 30],
        [46, 18],
        [10, 28],
        [38, 30],
      ].forEach(([a, b]) => PX.rows(g, x + a, y + b, ['.dd.', 'd..d'], { d: L.d }));
    },
    bush: (x, y, col = '#8a9a48') => {
      shadow(x, y + 10, 20, 4);
      PX.mask()
        .oval(x + 10, y + 6, 9, 6)
        .oval(x + 4, y + 8, 4, 3)
        .paint(g, R(col), { hi: 1, ink: INK });
    },
    fence: (x0, y, n, col = '#8a6040') => {
      for (let i = 0; i < n; i++)
        PX.mask()
          .rect(x0 + i * 12, y, 4, 16)
          .paint(g, R(col), { hi: 1, ink: INK });
      PX.mask()
        .rect(x0, y + 4, n * 12 - 8, 3)
        .rect(x0, y + 10, n * 12 - 8, 3)
        .paint(g, R(col), { hi: 1, ink: INK });
    },
    vfence: (x, y0, n, col = '#8a6040') => {
      PX.mask()
        .rect(x, y0, 4, n * 12)
        .paint(g, R(col), { hi: 1, ink: INK });
      for (let i = 0; i < n; i++)
        PX.mask()
          .rect(x - 1, y0 + i * 12, 6, 3)
          .paint(g, R(col), { ink: INK });
    },
    chain: (x, y, w, h) => {
      for (let yy = 0; yy < h; yy++)
        for (let xx = 0; xx < w; xx++)
          if ((xx + yy) % 5 === 0 || (xx - yy + 500) % 5 === 0) p(x + xx, y + yy, 'rgba(70,70,80,0.75)');
      for (let xx = 0; xx <= w; xx += 24)
        PX.mask()
          .rect(x + xx - 1, y - 4, 4, h + 6)
          .paint(g, R('#6a6a70'), { hi: 1, ink: INK });
      r(x, y - 2, w, 2, '#5a5a60');
    },
    flowers: (x, y) => PX.rows(g, x, y, ['.r.', 'ryr', '.r.', '.g.'], { r: '#e05a3a', y: '#f8d060', g: '#6a7a34' }),
    skull: (x, y) => PX.rows(g, x, y, ['.ooo.', 'owowo', 'ooooo', '.o.o.'], { o: '#ece4d4', w: '#3a2a2a' }),
    fire: (x, y) => {
      props.barrel(x, y);
      PX.mask()
        .rows(x + 2, y - 10, ['...o.....', '..ooo.o..', '.ooooooo.', 'ooooooooo', '.ooooooo.'])
        .paint(g, { o: '#a82a10', d: '#d84a18', m: '#f08a28', l: '#f8c050', h: '#fff0a0' }, { line: false, hi: 1 });
    },
    junk: (x, y) => {
      shadow(x, y + 12, 26, 5);
      PX.mask()
        .rect(x + 2, y + 4, 10, 9)
        .paint(g, R('#7a6a5a'), { hi: 1, ink: INK });
      PX.mask()
        .rect(x + 10, y + 2, 12, 11)
        .paint(g, R('#8a5a3a'), { hi: 1, ink: INK });
      PX.mask()
        .oval(x + 8, y + 11, 6, 3)
        .paint(g, R('#5a5a60'), { hi: 1, ink: INK });
    },
    trolley: (x, y) => {
      PX.mask().rect(x, y, 14, 9).paint(g, R('#9aa0a8'), { hi: 1, ink: INK });
      for (let xx = x + 3; xx < x + 13; xx += 3) r(xx, y + 1, 1, 7, '#6a7078');
      r(x + 2, y + 10, 2, 2, INK);
      r(x + 10, y + 10, 2, 2, INK);
      r(x - 3, y - 2, 4, 1, '#6a7078');
    },
  };
  // the solid footprint of each prop, so you walk round it
  const FOOT = {
    barrel: (x, y) => [x, y, 16, 16],
    crate: (x, y) => [x, y, 16, 15],
    rock: (x, y, s = 1) => [x, y, 22 * s, 14 * s],
    cactus: (x, y) => [x + 2, y + 4, 22, 34],
    tree: (x, y) => [x + 10, y + 14, 30, 34],
    bush: (x, y) => [x, y, 20, 12],
    junk: (x, y) => [x, y, 26, 14],
    trolley: (x, y) => [x, y, 14, 10],
    fire: (x, y) => [x, y, 16, 16],
    fence: (x0, y, n) => [x0, y, n * 12 - 8, 16],
    vfence: (x, y0, n) => [x, y0, 4, n * 12],
    chain: (x, y, w, h) => [x, y, w, h],
  };
  for (const k in FOOT) {
    const f = props[k];
    props[k] = (...a) => {
      solid(...FOOT[k](...a));
      return f(...a);
    };
  }
  // ---- a whole town: the ground from its rows, then paint() puts the rest on, then the bleak grade ----
  const paintTown = (map, pal, paint) => {
    W = map[0].length;
    H = map.length;
    SOLID = [];
    DOORS = [];
    const c = document.createElement('canvas');
    c.width = W * T;
    c.height = H * T;
    g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    MAP = map;
    PAL = pal || {};
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) (TILE[at(x, y)] || sand)(x, y);
    paint();
    g.fillStyle = 'rgba(120,100,70,0.16)';
    g.fillRect(0, 0, W * T, H * T);
    const im = g.getImageData(0, 0, W * T, H * T),
      d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      let rr = d[i],
        gg = d[i + 1],
        bb = d[i + 2];
      const L = 0.3 * rr + 0.59 * gg + 0.11 * bb;
      rr = (rr * 0.48 + L * 0.52) * 0.98;
      gg = (gg * 0.48 + L * 0.52) * 0.95;
      bb = (bb * 0.48 + L * 0.52) * 0.82;
      if (L < 110) {
        gg += 4;
        bb += 3;
        rr -= 3;
      }
      d[i] = Math.max(0, Math.min(255, ((rr - 128) * 1.1 + 128) * 0.88));
      d[i + 1] = Math.max(0, Math.min(255, ((gg - 128) * 1.1 + 128) * 0.88));
      d[i + 2] = Math.max(0, Math.min(255, ((bb - 128) * 1.1 + 128) * 0.88));
    }
    g.putImageData(im, 0, 0);
    for (let i = 0; i < 220; i++)
      p(
        (hash(i, 21) * W * T) | 0,
        (hash(i, 22) * H * T) | 0,
        hash(i, 23) < 0.5 ? 'rgba(200,196,190,0.7)' : 'rgba(80,76,72,0.6)',
      );
    return { c, solid: SOLID, doors: DOORS, W, H };
  };
  return {
    T,
    R,
    INK,
    r: (...a) => r(...a),
    p: (...a) => p(...a),
    get g() {
      return g;
    },
    shadow,
    building,
    door,
    win,
    sign,
    text,
    textW,
    props,
    hash,
    solid,
    paintTown,
  };
})();
