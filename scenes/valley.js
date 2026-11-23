'use strict';
// ================= THE VALLEY: the travel map of the 10 stops (v9.21) =================
// Looks only. The approved mock-up: a height map lit from the top left, terraces, the towns on their own shelves,
// dirt roads, five roads off the edge, the scars of the war, and a bleak grade. Drawn once at 240 x 360 and
// kept; the map screen puts it under the place buttons. No canvas (the headless tests): the plain map as before.
const VAL_W = 240,
  VAL_H = 360;
// where each stop sits on the picture, 0..100 across and down (before the margins)
const VALLEY_P = {
  scrapwell: [44, 92],
  rustwater: [56, 70],
  snakeeyes: [48, 40],
  mall: [80, 52],
  green: [84, 22],
  silo: [66, 6],
  gristmill: [12, 60],
  saltpan: [14, 34],
  kettle: [40, 12],
  fanghill: [20, 12],
};
const valleyX = k => Math.round(12 + (VALLEY_P[k][0] / 100) * (VAL_W - 24)),
  valleyY = k => Math.round(14 + (VALLEY_P[k][1] / 100) * (VAL_H - 60));
// the roads that lead off the map, with their labels: [from, end x, end y, label, label x, label y, way]
const VALLEY_EXITS = [
  ['green', VAL_W + 6, 22, 'East, over the pass', 205, 14, 'right'],
  ['saltpan', -6, 96, 'West, to the coast', 34, 108, 'left'],
  ['silo', 120, -6, 'North, Molar country', 110, 6, 'up'],
  ['fanghill', -6, 8, 'The caravan road', 32, 2, 'left'],
  ['scrapwell', -6, 300, 'The old highway', 34, 312, 'left'],
];
let VALLEY = null;
function valleyLand() {
  if (VALLEY) return VALLEY;
  const W = VAL_W,
    H = VAL_H,
    c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const R = PX.ramp,
    INK = '#2a1810',
    M = () => PX.mask(),
    r = (x, y, w, h, col) => PX.r(g, x, y, w, h, col),
    p = (x, y, col) => PX.p(g, x, y, col);
  const hash = (x, y, k = 0) => {
    let h = (x * 374761393 + y * 668265263 + k * 1442695041) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const P = {
    scrapwell: VALLEY_P.scrapwell,
    rustwater: VALLEY_P.rustwater,
    north: VALLEY_P.snakeeyes,
    airport: VALLEY_P.mall,
    green: VALLEY_P.green,
    silo: VALLEY_P.silo,
    gristmill: VALLEY_P.gristmill,
    saltpan: VALLEY_P.saltpan,
    kettle: VALLEY_P.kettle,
    fanghill: VALLEY_P.fanghill,
  };
  const X = k => Math.round(12 + (P[k][0] / 100) * (W - 24)),
    Y = k => Math.round(14 + (P[k][1] / 100) * (H - 60));
  const ROADS = [
    ['scrapwell', 'rustwater'],
    ['rustwater', 'north'],
    ['north', 'silo'],
    ['north', 'airport'],
    ['rustwater', 'airport'],
    ['airport', 'green'],
    ['gristmill', 'rustwater'],
    ['gristmill', 'saltpan'],
    ['saltpan', 'fanghill'],
    ['kettle', 'north'],
  ];
  const EXITS = VALLEY_EXITS;

  const EXIT_PTS = e => {
    const [k, ex, ey] = e,
      x1 = X(k),
      y1 = Y(k),
      mx = (x1 + ex) / 2 + (ey < 30 ? 0 : 0),
      my = (y1 + ey) / 2 + (ex > W ? 10 : -6);
    const pts = [];
    for (let t = 0; t <= 1.0001; t += 0.02)
      pts.push([
        Math.round((1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * ex),
        Math.round((1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * ey),
        t,
      ]);
    return pts;
  };
  // ---- the land: a height map, carved by the roads, terraced and lit from the top left ----
  const vn = (x, y, sc, k) => {
    const gx = x / sc,
      gy = y / sc,
      x0 = Math.floor(gx),
      y0 = Math.floor(gy),
      fx = gx - x0,
      fy = gy - y0,
      sm = t => t * t * (3 - 2 * t);
    const a = hash(x0, y0, k),
      b2 = hash(x0 + 1, y0, k),
      c2 = hash(x0, y0 + 1, k),
      d = hash(x0 + 1, y0 + 1, k),
      u = sm(fx),
      v = sm(fy);
    return a + (b2 - a) * u + (c2 - a) * v + (a - b2 - c2 + d) * u * v;
  };
  const fbm = (x, y) => vn(x, y, 48, 1) * 0.5 + vn(x, y, 24, 2) * 0.25 + vn(x, y, 12, 3) * 0.15 + vn(x, y, 6, 4) * 0.1;
  const segD = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax,
      dy = by - ay;
    if (!dx && !dy) return Math.hypot(px - ax, py - ay);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  };
  const ELEV = {
    scrapwell: 0,
    airport: 0,
    saltpan: 0,
    rustwater: 1,
    gristmill: 1,
    north: 2,
    kettle: 3,
    green: 3,
    fanghill: 4,
    silo: 5,
  };
  const TG = k => ELEV[k] * 0.085 + 0.04;
  const segDT = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax,
      dy = by - ay;
    if (!dx && !dy) return [Math.hypot(px - ax, py - ay), 0];
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return [Math.hypot(px - ax - t * dx, py - ay - t * dy), t];
  };
  const HT = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let h = fbm(x, y) * 0.7;
      // the eastern range: high, ridged, snowy
      const east = Math.max(0, (x - 150) / 90);
      h += east * east * 1.4 * (0.55 + 0.9 * (1 - Math.abs(vn(x, y, 34, 7) - 0.5) * 2) * (0.7 + 0.3 * vn(x, y, 14, 8)));
      // the north: a high plateau of red badlands, cut into mesas
      const north = Math.max(0, (70 - y) / 70);
      h += north * 0.45;
      // the west: rolling hills
      const west = Math.max(0, (60 - x) / 60);
      h += west * 0.25 * vn(x, y, 16, 9);
      // towns sit on their own shelf: a basin, a rise, a ridge, a hilltop, a plateau. Roads ramp between them.
      let best = [99, 0];
      ROADS.forEach(([a2, b3]) => {
        const [dd, t] = segDT(x, y, X(a2), Y(a2), X(b3), Y(b3));
        if (dd < best[0]) best = [dd, TG(a2) * (1 - t) + TG(b3) * t];
      });
      Object.keys(P).forEach(k => {
        const dd = Math.hypot(x - X(k), y - Y(k)) - 8;
        if (dd < best[0]) best = [dd, TG(k)];
      });
      EXITS.forEach(e => {
        const pts = EXIT_PTS(e);
        for (let i = 0; i < pts.length - 1; i += 2) {
          const [dd, t] = segDT(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
          const tt = (i + t) / pts.length;
          if (dd + 4 < best[0]) best = [dd + 4, TG(e[0]) * (1 - tt) + 0.2 * tt];
        }
      });
      const w = Math.max(0, Math.min(1, 1 - (best[0] - 3) / 22)),
        ww = w * w * (3 - 2 * w);
      h = h * (1 - ww) + best[1] * ww;
      // the land around a high place falls away below it
      Object.keys(P).forEach(k => {
        const dd = Math.hypot(x - X(k), y - Y(k));
        if (ELEV[k] >= 2 && dd < 40 && dd > 9) h = Math.max(h, TG(k) - (dd - 9) * 0.011);
        if (ELEV[k] === 0 && dd < 40 && dd > 12 && best[0] > 6) h = Math.max(h, (dd - 12) * 0.009);
      });
      HT[y * W + x] = h;
    }
  const ht = (x, y) => HT[Math.max(0, Math.min(H - 1, y)) * W + Math.max(0, Math.min(W - 1, x))];
  const BANDS = ['#dcc08a', '#d2b07c', '#c89e6a', '#b6865a', '#a2704e', '#8e6450', '#7e6a62', '#8e8682', '#e8e4dc'];
  const RED = ['#dcc08a', '#d4a878', '#c88a60', '#b47050', '#a05a44', '#8a4a3a', '#7a4a3e', '#8a6a5e', '#e0d4cc'];
  const GREEN = ['#8aa850', '#7a9a44', '#6a8a3a', '#5a7a34', '#a2704e', '#8e6450', '#7e6a62', '#8e8682', '#e8e4dc'];
  const STEP = 0.085,
    band = h => Math.max(0, Math.min(8, Math.floor(h / STEP)));
  const gx = X('green'),
    gy = Y('green');
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const h = ht(x, y),
        bi = band(h),
        sl = ht(x + 1, y) - ht(x - 1, y) + (ht(x, y + 1) - ht(x, y - 1));
      const green = Math.hypot(x - gx, y - gy) < 18 + vn(x, y, 8, 12) * 14 && bi <= 4,
        red = y < 80 && x > 80 && !green;
      const col = (green ? GREEN : red ? RED : BANDS)[bi],
        C = R(col);
      let c = col;
      if (sl > 0.03) c = C.d;
      else if (sl < -0.03) c = C.l;
      if (sl < -0.07) c = C.h;
      if (sl > 0.09) c = C.o === '#000000' ? C.d : R(C.d).d;
      // the edge of a terrace: a dark lip on the shadow side, a bright one on the lit side
      if (band(ht(x, y + 1)) < bi || band(ht(x + 1, y)) < bi) c = R(C.d).m;
      if (band(ht(x, y - 1)) < bi && bi > 0) c = C.l;
      if (bi === 0 && hash(x, y, 6) < 0.05) c = hash(x, y, 7) < 0.5 ? '#c8a870' : '#ecd8a8';
      p(x, y, c);
    }
  // wind ripples on the valley floor
  for (let y = 2; y < H; y += 6)
    for (let x = 0; x < W; x++)
      if (band(ht(x, y)) === 0 && hash((x >> 3) + y, y, 3) > 0.5)
        p(x, y + Math.round(Math.sin(x / 6 + y / 9) * 2), '#ccae78');
  // salt flats round Saltpan, and the reservoir in the low ground by the airport
  M()
    .oval(X('saltpan') + 4, Y('saltpan'), 26, 14)
    .paint(
      g,
      { o: '#a8a090', d: '#d8d2c4', m: '#ece8de', l: '#f6f2ea', h: '#ffffff' },
      { t: 0.8, hi: 1, ink: '#a8a090' },
    );
  M()
    .oval(X('airport') - 4, Y('airport') - 2, 24, 12)
    .oval(X('airport') - 20, Y('airport') + 4, 12, 7)
    .paint(g, R('#3a7a80'), { t: 0.8, hi: 1, ink: '#1e4448' });
  for (let i = 0; i < 12; i++)
    r(X('airport') - 28 + ((hash(i, 4) * 44) | 0), Y('airport') - 8 + ((hash(i, 5) * 20) | 0), 5, 1, '#7ab8bc');
  // dead trees and rocks scattered on the low hills
  for (let i = 0; i < 40; i++) {
    const x = (hash(i, 11) * W) | 0,
      y = 40 + ((hash(i, 12) * (H - 80)) | 0),
      bi = band(ht(x, y));
    if (bi < 1 || bi > 3) continue;
    M().oval(x, y, 2, 1).paint(g, R('#9a8a74'), { ink: INK });
  }
  // ---- the roads: dirt tracks that bend a little ----
  ROADS.forEach(([a, b2], i) => {
    const x1 = X(a),
      y1 = Y(a),
      x2 = X(b2),
      y2 = Y(b2),
      mx = (x1 + x2) / 2 + (hash(i, 1) - 0.5) * 24,
      my = (y1 + y2) / 2 + (hash(i, 2) - 0.5) * 24;
    const pts = [];
    for (let t = 0; t <= 1.0001; t += 0.02)
      pts.push([
        Math.round((1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2),
        Math.round((1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2),
      ]);
    pts.forEach(([x, y]) => r(x - 2, y - 2, 4, 4, '#8a6a44'));
    pts.forEach(([x, y]) => r(x - 1, y - 1, 3, 3, '#b88e5e'));
    pts.forEach(([x, y], j) => j % 3 || p(x, y, '#c8a070'));
  });
  EXITS.forEach(e => {
    EXIT_PTS(e).forEach(([x, y, t], j) => {
      g.globalAlpha = Math.max(0.15, 1 - t * 0.85);
      r(x - 2, y - 2, 4, 4, '#8a6a44');
      r(x - 1, y - 1, 3, 3, '#b88e5e');
      if (j % 4 === 0) r(x, y, 1, 1, '#c8a070');
      g.globalAlpha = 1;
    });
  });
  // a waymarker where each road leaves: a post with a rag tied to it
  EXITS.forEach(e => {
    const pts = EXIT_PTS(e),
      [x, y] = pts[Math.floor(pts.length * 0.45)];
    M()
      .rect(x + 3, y - 8, 2, 9)
      .paint(g, R('#7a5434'), { ink: INK });
    r(x + 5, y - 8, 4, 2, '#c8b890');
  });
  for (let i = 0; i < 28; i++) {
    const a = 0.02 * (28 - i);
    g.fillStyle = `rgba(232,220,196,${a})`;
    g.fillRect(0, i, W, 1);
    g.fillRect(0, H - 1 - i, W, 1);
    g.fillRect(i, 0, 1, H);
    g.fillRect(W - 1 - i, 0, 1, H);
  }

  // ---- bleaker: scars of the war, smoke, ash, haze, and a grade that drains the colour ----
  const BLEAK = true;
  const P_skull = (x, y) => PX.rows(g, x, y, ['.ooo.', 'owowo', 'ooooo', '.o.o.'], { o: '#ece4d4', w: '#3a2a2a' });
  if (BLEAK) {
    // old bomb craters: a raised lip, a sunken bowl, black glass at the bottom
    [
      [150, 120, 9],
      [60, 200, 7],
      [190, 300, 8],
      [104, 60, 6],
    ].forEach(([x, y, rr]) => {
      M()
        .oval(x, y, rr + 2, Math.round((rr + 2) * 0.6))
        .paint(g, R('#b89a70'), { t: 0.6, hi: 1, ink: '#6a5038' });
      M()
        .oval(x, y, rr, Math.round(rr * 0.6))
        .paint(g, R('#5a4a3a'), { line: false, t: 0.4 });
      M()
        .oval(x + 1, y + 1, Math.round(rr / 2), Math.round(rr * 0.3))
        .paint(g, R('#1e2420'), { line: false, hi: 1 });
      p(x - 1, y, '#5a7a6a');
    });
    // a broken stretch of pre-war highway, cracked asphalt with a faded line
    for (let i = 0; i < 46; i++) {
      const x = 40 + i * 2,
        y = 236 + Math.round(i * 0.9);
      if (i % 13 > 9) continue;
      r(x, y, 3, 6, '#5a5650');
      if (i % 3 === 0) p(x + 1, y + 3, '#c8b060');
    }
    // a fallen pylon
    PX.line(g, 176, 170, 204, 182, '#4a4440');
    PX.line(g, 176, 174, 204, 186, '#4a4440');
    for (let x = 178; x < 204; x += 4) PX.line(g, x, 171 + (x - 176) / 2.4, x + 2, 175 + (x - 176) / 2.4, '#4a4440');
    // rusted wrecks by the roads
    [
      [100, 270],
      [150, 196],
      [80, 150],
      [170, 96],
    ].forEach(([x, y]) => {
      M().rect(x, y, 9, 4).paint(g, R('#7a4a30'), { hi: 1, ink: INK });
      r(x + 2, y - 1, 4, 1, '#5a3a28');
      p(x + 1, y + 4, INK);
      p(x + 7, y + 4, INK);
    });
    // dead trees on the low hills
    [
      [30, 180],
      [70, 110],
      [200, 230],
      [130, 330],
      [24, 300],
    ].forEach(([x, y]) => {
      PX.line(g, x, y, x, y - 7, '#4a3a30');
      PX.line(g, x, y - 5, x - 3, y - 8, '#4a3a30');
      PX.line(g, x, y - 6, x + 3, y - 10, '#4a3a30');
    });
    // a wrecked convoy along the North Road
    [
      [132, 140],
      [138, 146],
      [126, 150],
    ].forEach(([x, y], i) => {
      M()
        .rect(x, y, 8, 4)
        .paint(g, R(i ? '#6a5a40' : '#7a4a30'), { hi: 1, ink: INK });
      r(x + 1, y - 2, 3, 2, '#4a4038');
    });
    // a mass grave: rows of crosses on a bare slope by Fanghill
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 6; i++) {
        const x = X('fanghill') - 40 + i * 4,
          y = Y('fanghill') + 24 + j * 5;
        r(x, y - 2, 1, 4, '#d8ccb0');
        r(x - 1, y - 1, 3, 1, '#d8ccb0');
      }
    // a beast's ribcage, bleached, half in the sand
    {
      const x = 70,
        y = 300;
      for (let i = 0; i < 6; i++) {
        PX.line(g, x + i * 4, y, x + i * 4 - 2, y - 6 + Math.abs(i - 2.5), '#e8e0cc');
      }
      PX.line(g, x - 2, y, x + 24, y + 1, '#d8d0bc');
      P_skull(x + 26, y - 3);
    }
    // a trench line with wire, and burned stumps where a wood once was
    for (let x = 20; x < 100; x += 2) {
      const y = 186 + Math.round(Math.sin(x / 9) * 3);
      p(x, y, '#3a2e24');
      p(x, y + 1, '#5a4a38');
      if (x % 6 === 0) {
        PX.line(g, x, y - 3, x + 3, y - 1, '#6a6660');
      }
    }
    for (let i = 0; i < 12; i++) {
      const x = 150 + ((hash(i, 41) * 40) | 0),
        y = 56 + ((hash(i, 42) * 26) | 0);
      r(x, y - 2, 1, 3, '#2a2420');
      p(x - 1, y - 2, '#2a2420');
    }
    // a toxic pool by Kettle
    M()
      .oval(X('kettle') + 22, Y('kettle') + 14, 7, 3)
      .paint(g, R('#7aa83a'), { hi: 1, ink: '#3a5a1a' });
    p(X('kettle') + 20, Y('kettle') + 13, '#d8ff80');
    // smoke from the Molar camps and the North Road's pit fires
    [
      [X('silo') - 14, Y('silo') - 4],
      [X('north') - 10, Y('north') - 14],
    ].forEach(([x, y]) => {
      for (let i = 0; i < 18; i++) {
        const yy = y - i * 2,
          xx = x + Math.round(Math.sin(i / 2.5) * 2) + Math.floor(i / 5);
        g.fillStyle = `rgba(60,56,54,${0.5 - i * 0.025})`;
        g.fillRect(xx - 1 - (i >> 3), yy, 3 + (i >> 2), 2);
      }
    });
  }
  // ---- the places: a little picture of each ----
  const hut = (x, y, roof, wall, w = 8) => {
    M()
      .rect(x, y + 3, w, 5)
      .paint(g, R(wall), { hi: 1, ink: INK });
    M()
      .rect(x - 1, y, w + 2, 4)
      .paint(g, R(roof), { hi: 1, ink: INK });
    r(x + (w >> 1) - 1, y + 5, 2, 3, INK);
  };
  const ruin = (x, y) => {
    hut(x, y, '#6a5a4a', '#8a7a64');
    r(x + 2, y + 1, 3, 2, INK);
  };
  const glow = (x, y, col) => {
    g.fillStyle = col;
    for (let k = 12; k > 4; k -= 2) {
      g.globalAlpha = 0.08;
      g.beginPath();
      g.arc(x, y, k, 0, 7);
      g.fill();
    }
    g.globalAlpha = 1;
  };
  const ICON = {
    rustwater: (x, y) => {
      hut(x - 16, y - 6, '#9a8a70', '#c8a878');
      hut(x - 6, y - 4, '#9aa0a0', '#9a7450');
      hut(x + 4, y - 8, '#b8805a', '#d4a474');
      hut(x + 6, y + 2, '#b0343e', '#ead2b8');
      M()
        .rect(x - 4, y - 18, 10, 7)
        .paint(g, R('#6e9090'), { hi: 1, ink: INK });
      r(x - 3, y - 11, 1, 8, '#5a4a3a');
      r(x + 4, y - 11, 1, 8, '#5a4a3a');
    },
    north: (x, y) => {
      // Snake Eyes: a squat casino, purple roof, a little sign lit up in pink and teal
      M()
        .rect(x - 20, y - 8, 20, 9)
        .paint(g, R('#6a2a3a'), { hi: 1, ink: INK });
      M()
        .rect(x - 22, y - 13, 24, 6)
        .paint(g, R('#4a2a5a'), { hi: 1, ink: INK });
      r(x - 16, y - 6, 12, 3, '#1a1020');
      r(x - 15, y - 5, 4, 1, '#ff70b0');
      r(x - 9, y - 5, 4, 1, '#7ad8c8');
      p(x - 16, y - 7, 'rgba(255,112,176,0.6)');
      p(x - 5, y - 7, 'rgba(122,216,200,0.6)');
      r(x - 12, y - 2, 4, 3, '#e8b040');
      p(x - 19, y - 2, '#f4c464');
      p(x - 4, y - 2, '#f4c464');
      // Krug's pens: a shed, and chain-link on posts
      M()
        .rect(x + 4, y - 10, 12, 7)
        .paint(g, R('#8a6a48'), { hi: 1, ink: INK });
      M()
        .rect(x + 3, y - 13, 14, 4)
        .paint(g, R('#5a4a3a'), { hi: 1, ink: INK });
      for (let yy = y; yy <= y + 10; yy += 10) r(x + 2, yy, 20, 1, '#5a5a60');
      for (let xx = x + 2; xx <= x + 22; xx += 5)
        M()
          .rect(xx, y - 1, 1, 12)
          .paint(g, R('#6a6a70'), { line: false });
      for (let i = 0; i < 16; i++) p(x + 3 + ((i * 7) % 18), y + 2 + ((i * 3) % 7), 'rgba(90,90,96,0.6)');
    },
    airport: (x, y) => {
      M()
        .rect(x - 14, y - 12, 24, 12)
        .paint(g, R('#a8b4b4'), { hi: 1, ink: INK });
      r(x - 15, y - 13, 26, 2, '#7a7a78');
      r(x - 8, y - 11, 12, 2, '#f0ece0');
      r(x - 6, y - 11, 8, 1, '#c82a2a');
      M()
        .rect(x + 14, y - 4, 24, 7)
        .oval(x + 14, y - 1, 3, 3)
        .paint(g, R('#d8d8d0'), { hi: 1, ink: INK });
      r(x + 14, y, 24, 1, '#a83a30');
      M()
        .rows(x + 36, y - 9, ['ooo', '.ooo', '..oo'])
        .paint(g, R('#c8c8c0'), { ink: INK });
      M()
        .rows(x + 20, y + 3, ['oooooooo', '.oooooo.'])
        .paint(g, R('#b8b8b0'), { ink: INK });
    },
    scrapwell: (x, y) => {
      hut(x - 12, y - 4, '#8a9090', '#8a6a48');
      hut(x + 4, y - 6, '#9a9a90', '#7a5a3a');
      hut(x - 4, y + 4, '#a87050', '#cca070');
      M()
        .oval(x + 8, y + 6, 3, 2)
        .paint(g, R('#8a8478'), { ink: INK });
    },
    farm: (x, y) => {
      for (let i = 0; i < 3; i++) r(x - 14, y - 2 + i * 4, 12, 3, i % 2 ? '#8aa040' : '#6a8a30');
      hut(x, y - 6, '#7a5a3a', '#c8a878');
      hut(x + 2, y + 3, '#5a3a30', '#a83a2a', 10);
    },
    diner: (x, y) => {
      hut(x - 8, y - 4, '#a83a30', '#e0d0b0', 16);
      r(x + 4, y - 9, 2, 5, '#7a6a5a');
      r(x + 4, y - 12, 2, 2, 'rgba(220,210,200,0.8)');
      r(x + 6, y - 14, 2, 2, 'rgba(220,210,200,0.6)');
    },
    chainfield: (x, y) => {
      hut(x - 6, y - 10, '#5a4a3a', '#8a6a48', 12);
      r(x - 14, y, 28, 1, '#5a5a60');
      r(x - 14, y + 10, 28, 1, '#5a5a60');
      r(x - 14, y, 1, 11, '#5a5a60');
      r(x + 13, y, 1, 11, '#5a5a60');
      for (let i = -12; i < 13; i += 3) r(x + i, y + 1, 1, 9, 'rgba(90,90,96,0.5)');
    },
    skybus: (x, y) => {
      M()
        .rect(x - 14, y - 4, 26, 8)
        .oval(x - 14, y, 4, 4)
        .paint(g, R('#d8d8d0'), { hi: 1, ink: INK });
      r(x - 14, y + 1, 26, 1, '#a83a30');
      M()
        .rows(x + 10, y - 9, ['ooo', '.ooo', '..oo'])
        .paint(g, R('#c8c8c0'), { ink: INK });
      M()
        .rows(x - 6, y + 4, ['oooooooo', '.oooooo.'])
        .paint(g, R('#b8b8b0'), { ink: INK });
    },
    silo: (x, y) => {
      M().oval(x, y, 10, 5).paint(g, R('#c8a030'), { ink: INK });
      M().oval(x, y, 7, 3).paint(g, R('#6a6e74'), { hi: 1, ink: INK });
      r(x, y - 3, 1, 7, INK);
      r(x - 14, y - 6, 1, 6, '#4a4a50');
      p(x - 14, y - 7, '#ff5040');
    },
    snakeeyes: (x, y) => {
      glow(x, y - 4, '#ff70b0');
      hut(x - 10, y - 4, '#3a2448', '#6a2a3a', 20);
      r(x - 6, y - 3, 12, 2, '#ff70b0');
    },
    mall: (x, y) => {
      M()
        .rect(x - 12, y - 10, 24, 12)
        .paint(g, R('#a8b4b4'), { hi: 1, ink: INK });
      r(x - 13, y - 11, 26, 2, '#7a7a78');
      r(x - 6, y - 9, 12, 2, '#f0ece0');
      r(x - 4, y - 9, 8, 1, '#c82a2a');
      r(x - 2, y - 4, 4, 6, '#6a9aa8');
    },
    green: (x, y) => {
      M()
        .oval(x, y - 2, 10, 6)
        .paint(
          g,
          {
            o: '#2a3a3a',
            d: 'rgba(120,180,190,0.7)',
            m: 'rgba(170,220,230,0.8)',
            l: 'rgba(210,240,245,0.85)',
            h: '#ffffff',
          },
          { hi: 1, ink: '#3a4a4a' },
        );
      for (let i = -8; i < 9; i += 4) r(x + i, y - 6, 1, 8, 'rgba(60,90,90,0.6)');
    },
    gristmill: (x, y) => {
      ruin(x - 12, y - 2);
      M()
        .rect(x + 2, y - 12, 7, 18)
        .paint(g, R('#a88a5a'), { hi: 1, ink: INK });
      M()
        .oval(x + 12, y, 4, 4)
        .paint(g, R('#6a4a2e'), { ink: INK });
    },
    saltpan: (x, y) => {
      ruin(x - 10, y - 4);
      ruin(x + 2, y - 2);
      r(x + 4, y - 10, 2, 6, '#7a6a5e');
    },
    kettle: (x, y) => {
      ruin(x - 12, y);
      M()
        .rect(x - 4, y - 12, 12, 8)
        .paint(g, R('#6e9090'), { hi: 1, ink: INK });
      M()
        .oval(x + 2, y - 8, 3, 3)
        .paint(g, R('#c8a050'), { ink: INK });
      r(x - 3, y - 4, 1, 9, '#5a4a3a');
      r(x + 7, y - 4, 1, 9, '#5a4a3a');
    },
    fanghill: (x, y) => {
      ruin(x - 10, y - 4);
      M()
        .oval(x + 6, y + 2, 8, 4)
        .paint(g, R('#a88a64'), { hi: 1, ink: INK });
      PX.rows(g, x + 3, y, ['.o.o.', 'ooooo'], { o: '#ece4d4' });
      r(x + 10, y - 6, 1, 6, '#5a4a40');
      r(x + 11, y - 6, 3, 2, '#c82a2a');
    },
    gully: (x, y) => {
      [
        [-8, 0],
        [0, -4],
        [6, 2],
      ].forEach(([a, b2]) =>
        M()
          .oval(x + a, y + b2, 5, 3)
          .paint(g, R('#9a8a74'), { hi: 1, ink: INK }),
      );
    },
  };
  const LOST = ['gristmill', 'saltpan', 'kettle', 'fanghill'];
  Object.keys(P).forEach(k => {
    const x = X(k),
      y = Y(k);
    g.fillStyle = 'rgba(70,40,20,0.28)';
    g.fillRect(x - 14, y + 8, 28, 3);
    ICON[k](x, y);
    if (LOST.includes(k)) {
      r(x + 8, y - 14, 5, 5, '#2a1410');
      r(x + 9, y - 13, 3, 3, '#e83a2a');
    }
  });
  // vignette
  for (let i = 0; i < 16; i++) {
    g.fillStyle = `rgba(20,10,0,${0.016 * (16 - i)})`;
    g.fillRect(0, i, W, 1);
    g.fillRect(0, H - 1 - i, W, 1);
    g.fillRect(i, 0, 1, H);
    g.fillRect(W - 1 - i, 0, 1, H);
  }

  if (BLEAK) {
    // dust haze, then the grade: half the colour drained, pushed to ochre and ash, sick green-grey shadows
    g.fillStyle = 'rgba(120,100,70,0.18)';
    g.fillRect(0, 0, W, H);
    const im = g.getImageData(0, 0, W, H),
      d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      let [rr, gg, bb] = [d[i], d[i + 1], d[i + 2]];
      const L = 0.3 * rr + 0.59 * gg + 0.11 * bb;
      rr = rr * 0.45 + L * 0.55;
      gg = gg * 0.45 + L * 0.55;
      bb = bb * 0.45 + L * 0.55;
      rr *= 0.98;
      gg *= 0.95;
      bb *= 0.82;
      if (L < 110) {
        gg += 4;
        bb += 3;
        rr -= 3;
      }
      const k = 0.86;
      d[i] = Math.max(0, Math.min(255, ((rr - 128) * 1.1 + 128) * k));
      d[i + 1] = Math.max(0, Math.min(255, ((gg - 128) * 1.1 + 128) * k));
      d[i + 2] = Math.max(0, Math.min(255, ((bb - 128) * 1.1 + 128) * k));
    }
    g.putImageData(im, 0, 0);
    for (let i = 0; i < 260; i++)
      p(
        (hash(i, 21) * W) | 0,
        (hash(i, 22) * H) | 0,
        hash(i, 23) < 0.5 ? 'rgba(200,196,190,0.7)' : 'rgba(80,76,72,0.6)',
      );
    for (let i = 0; i < 40; i++) {
      const a = 0.018 * (40 - i);
      g.fillStyle = `rgba(14,10,6,${a})`;
      g.fillRect(0, i, W, 1);
      g.fillRect(0, H - 1 - i, W, 1);
      g.fillRect(i, 0, 1, H);
      g.fillRect(W - 1 - i, 0, 1, H);
    }
  }
  VALLEY = c;
  return c;
}
// The map screen (scenes/map.js) builds its buttons, then calls mapPaint: here it gets the valley instead of the
// old painted land, and each button moves to sit under its town on the picture.
const _mapPaintValley = mapPaint;
mapPaint = mp => {
  if (!canDraw() || !mp) return;
  let land;
  try {
    land = valleyLand();
  } catch (e) {
    return _mapPaintValley(mp);
  }
  mp.classList.add('valley');
  const svg = mp.querySelector('svg');
  if (svg) svg.remove(); // the roads are in the picture
  const cv = document.createElement('canvas');
  cv.className = 'land';
  cv.width = VAL_W;
  cv.height = VAL_H;
  const g = cv.getContext('2d');
  g.drawImage(land, 0, 0);
  // a crater where a town was nuked
  for (const k in S.crater || {})
    if (S.crater[k] && VALLEY_P[k]) {
      const x = valleyX(k),
        y = valleyY(k);
      PX.mask().oval(x, y, 16, 10).paint(g, PX.ramp('#4a3a2a'), { t: 0.5, ink: '#1a1208' });
      PX.mask()
        .oval(x + 1, y + 1, 9, 5)
        .paint(g, PX.ramp('#1e2a1a'), { line: false, hi: 1 });
    }
  mp.prepend(cv);
  [...mp.querySelectorAll('.node')].forEach(b => {
    const k = b.stop;
    if (!k || !VALLEY_P[k]) return;
    b.style.left = (valleyX(k) / VAL_W) * 100 + '%';
    b.style.top = ((valleyY(k) + 15) / VAL_H) * 100 + '%';
    if (typeof TOWNS !== 'undefined' && TOWNS[k]) b.classList.add('lost');
  });
  VALLEY_EXITS.forEach(([, , , t, lx, ly, way]) => {
    const s = document.createElement('span');
    s.className = 'vexit';
    s.textContent = { left: '< ', right: '', up: '^ ' }[way] + t + (way === 'right' ? ' >' : '');
    s.style.left = (lx / VAL_W) * 100 + '%';
    s.style.top = ((ly + 3) / VAL_H) * 100 + '%';
    mp.appendChild(s);
  });
};
