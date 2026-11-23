'use strict';
// ================= THE WALKING TOWNS: what goes where in each of the 10 stops (v9.23) =================
// Each town is painted once with the town kit (scenes/townkit.js), in the style of the approved mock-ups.
//   rows: the ground, one letter a tile (24 pixels):  . sand  , scrub  = road  ; field  ~ water  # rock  g grass  s snow
//   paint(): the buildings and props, in pixels. Each door() is noted in the order it is painted.
//   doors: what each door does, in that order: a pattern for one of the place's own options (the first that
//          matches), or words to say. null: a door that stays shut.
//   things: [x, y, w, h, use] in pixels: something solid you can use (a pump, a cage, a scarecrow).
//   areas: which district each tile is in, first match wins: [place, x0, y0, x1, y1] in tiles. The rest is the town.
//   spots: where each person stands, in tiles, just outside their own door. Nobody wanders and nobody is on a roof.
//   exits: tiles that lead out to the valley map.
const TOWNMAP = {};
TOWNMAP.rustwater = {
  rows: [
    ',,,,,,,,,,,,,,',
    ',,,,..........',
    ',,,,..........',
    '==============',
    '==============',
    ';;;;..........',
    ';;;;..........',
    ';;;;..........',
    ',,,,==========',
    ',,,,,,,,==,,,,',
    '........==....',
    '........==....',
    '........==....',
    '........==....',
    '..========....',
    '........==....',
    ',,,,,,,,==,,,,',
    ',,,,,,,,==,,,,',
  ],
  spawn: [8, 16],
  exits: [
    [8, 17],
    [9, 17],
    [13, 3],
    [13, 4],
  ],
  areas: [
    ['farm', 0, 0, 3, 9],
    ['diner', 0, 10, 13, 17],
  ],
  doors: [
    /Moe|drink|bar/i,
    /sheriff|office|bounty/i,
    /Doc|clinic|patch|heal/i,
    /Velvet|Opal|room/i,
    /Mayor|office|Fenwick/i,
    /hat|scarecrow|farmhouse/i,
    /stew|Order|eat|Lou/i,
  ],
  spots: {
    moe: [4, 2],
    sheriff: [8, 2],
    doc: [11, 2],
    opal: [4, 8],
    gloria: [5, 8],
    mayor: [8, 8],
    jeb: [11, 8],
    hector: [0, 2],
    bess: [1, 6],
    bert: [0, 8],
    lou: [3, 14],
    junior: [5, 14],
  },
  caged: [['pete', 'cage', [11, 13]]],
  // where people stand who have moved here, in order
  extra: [
    [6, 2],
    [10, 2],
    [6, 8],
    [10, 8],
    [12, 4],
    [2, 9],
    [7, 14],
    [6, 10],
  ],
  paint(K) {
    const { building, door, win, sign, props: P, shadow } = K,
      R = K.R,
      INK = K.INK;
    const r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g;
    const top = 6,
      bot = 128,
      X0 = 100;
    // ---- the town square ----
    building(X0, top, 66, 20, 30, '#9aa0a0', '#9a7450', { tin: 1, rust: 1, planks: 1 });
    door(X0 + 27, top + 30, '#6a4428');
    win(X0 + 6, top + 27, 1);
    win(X0 + 46, top + 27, 1);
    sign(X0 + 33, top + 12, "MOE'S");
    building(X0 + 83, top, 66, 16, 34, '#b8805a', '#d4a474', { adobe: 1, flat: 1 });
    door(X0 + 110, top + 30, '#4a3020');
    win(X0 + 90, top + 24, 0);
    win(X0 + 130, top + 24, 0);
    M()
      .rows(X0 + 111, top + 18, ['....oo....', 'oooooooooo', '.oooooooo.', '..oooooo..', '.ooo..ooo.', 'oo......oo'])
      .paint(g(), R('#e0b840'), { hi: 1, ink: INK });
    building(X0 + 166, top, 66, 18, 32, '#7a8a8a', '#e4ded0', { flat: 1 });
    door(X0 + 193, top + 30, '#5a6a6a');
    win(X0 + 173, top + 26, 0);
    win(X0 + 213, top + 26, 0);
    M()
      .rows(X0 + 195, top + 4, ['..oo..', '..oo..', 'oooooo', 'oooooo', '..oo..', '..oo..'])
      .paint(g(), R('#d84040'), { hi: 1, ink: INK });
    building(X0, bot, 66, 20, 30, '#b0343e', '#ead2b8', { tiles: 1, planks: 1 });
    door(X0 + 27, bot + 30, '#7a1a2c');
    win(X0 + 6, bot + 27, 1);
    win(X0 + 46, bot + 27, 1);
    [X0 + 18, X0 + 46].forEach(x => {
      r(x, bot + 20, 1, 4, INK);
      M()
        .oval(x, bot + 27, 2, 3)
        .paint(g(), R('#ee78a8'), { hi: 1, ink: INK });
    });
    building(X0 + 83, bot - 4, 66, 20, 34, '#4a3e5e', '#d8ccb0', { tiles: 1 });
    door(X0 + 110, bot + 30, '#3a2a40');
    win(X0 + 90, bot + 22, 1);
    win(X0 + 130, bot + 22, 1);
    [X0 + 87, X0 + 104, X0 + 124, X0 + 143].forEach(x =>
      M()
        .rect(x, bot + 18, 3, 32)
        .paint(g(), R('#f0e8d8'), { hi: 1, ink: INK }),
    );
    shadow(X0 + 170, bot + 48, 60, 8);
    M()
      .rect(X0 + 172, bot + 22, 56, 22)
      .paint(g(), R('#8a6a48'), { hi: 1, ink: INK });
    M()
      .oval(X0 + 200, bot + 18, 30, 12)
      .paint(g(), R('#d8ccb0'), { hi: 1, ink: INK });
    [X0 + 182, X0 + 218].forEach(x =>
      M()
        .oval(x, bot + 46, 6, 6)
        .paint(g(), R('#5a4030'), { hi: 1, ink: INK }),
    );
    const px = X0 + 98;
    shadow(px, 104, 36, 6);
    M()
      .rect(px - 2, 92, 36, 13)
      .paint(g(), R('#6a5038'), { hi: 1, ink: INK });
    r(px + 1, 95, 30, 6, '#3a7080');
    M()
      .rect(px + 20, 70, 6, 24)
      .paint(g(), R('#5a5a64'), { hi: 1, ink: INK });
    M()
      .line(px + 23, 72, px + 36, 62, 2)
      .paint(g(), R('#5a5a64'), { hi: 1, ink: INK });
    M()
      .rect(px + 16, 82, 6, 6)
      .paint(g(), R('#d0a840'), { hi: 1, ink: INK });
    // ---- Hector's farm, in the fields at the west edge of town ----
    building(4, top + 2, 72, 20, 30, '#7a5a3a', '#c8a878', { thatch: 1, planks: 1 });
    door(34, top + 32, '#5a3a20');
    win(10, top + 28, 1);
    win(56, top + 28, 1);
    P.vfence(90, 118, 7);
    const tx = 46,
      ty = 196;
    shadow(tx - 4, ty + 30, 50, 8);
    M()
      .rect(tx + 4, ty + 4, 30, 18)
      .paint(g(), R('#d8642a'), { hi: 1, ink: INK });
    M()
      .rect(tx + 22, ty - 6, 12, 12)
      .paint(g(), R('#d8642a'), { hi: 1, ink: INK });
    r(tx + 24, ty - 4, 8, 6, '#7ab0c0');
    M()
      .oval(tx + 30, ty + 24, 9, 9)
      .paint(g(), R('#3a3430'), { hi: 1, ink: INK });
    M()
      .oval(tx + 30, ty + 24, 4, 4)
      .paint(g(), R('#c8a040'), { hi: 1, ink: INK });
    M()
      .oval(tx + 6, ty + 26, 5, 5)
      .paint(g(), R('#3a3430'), { hi: 1, ink: INK });
    // ---- Mama Lou's roadhouse, a little way down the south road ----
    const dy = 290;
    M()
      .rect(146, dy - 10, 12, 22)
      .paint(g(), R('#7a6a5a'), { hi: 1, ink: INK });
    building(24, dy, 148, 20, 34, '#a83a30', '#e0d0b0', { tiles: 1, planks: 1 });
    door(92, dy + 34, '#8a2a24');
    [36, 64, 122, 148].forEach(x => win(x, dy + 28, 1));
    sign(98, dy + 10, "MAMA LOU'S", '#f0e8d0', '#a82a24');
    [
      [152, dy - 16],
      [154, dy - 20],
      [151, dy - 24],
    ].forEach(([a, b]) => r(a, b, 3, 3, 'rgba(220,210,200,0.6)'));
    M()
      .rect(128, dy + 58, 16, 10)
      .paint(g(), R('#8a6a48'), { hi: 1, ink: INK });
    P.fence(250, 360, 7);
    for (let yy = 378; yy < 404; yy += 10)
      for (let xx = 256; xx < 330; xx += 12) M().oval(xx, yy, 4, 3).paint(g(), R('#7aa848'), { hi: 1, ink: INK });
    // a signpost where the south road leaves for the valley
    M().rect(250, 404, 3, 20).paint(g(), R('#7a5434'), { ink: INK });
    M().rect(240, 400, 30, 8).paint(g(), R('#a8804a'), { hi: 1, ink: INK });
    P.barrel(X0 + 68, 40);
    P.crate(X0 + 152, 44);
    P.barrel(X0 + 68, 158);
    P.cactus(300, 228);
    P.rock(4, 380, 0.8);
    if (true) {
      const tx2 = 14,
        ty2 = 236;
      K.shadow(tx2 - 10, ty2 + 40, 36, 8);
      M()
        .rect(tx2, ty2 + 8, 5, 38)
        .paint(g(), R('#5a4a3e'), { hi: 1, ink: INK });
      [
        [tx2 + 2, ty2 + 14, tx2 - 10, ty2 + 2],
        [tx2 + 3, ty2 + 10, tx2 + 14, ty2 - 2],
        [tx2 + 2, ty2 + 22, tx2 + 16, ty2 + 14],
        [tx2 - 6, ty2 + 6, tx2 - 12, ty2 - 2],
        [tx2 + 10, ty2 + 2, tx2 + 12, ty2 - 6],
      ].forEach(([a, b2, c2, d2]) => M().line(a, b2, c2, d2, 2).paint(g(), R('#5a4a3e'), { ink: INK }));
    } else P.tree(-16, 236, '#6a8a3a');

    // ---- worse off (Will: "add 4 as well"): boarded windows, scorch, rust streaks, washing nobody took in, bones ----
    if (true) {
      const board = (x, y) => {
        r(x - 1, y - 1, 14, 12, '#1a120c');
        PX.line(g(), x - 1, y + 2, x + 13, y + 5, '#8a7050');
        PX.line(g(), x - 1, y + 7, x + 13, y + 3, '#7a6044');
        p(x + 1, y + 3, '#c8c0b0');
        p(x + 11, y + 5, '#c8c0b0');
      };
      const scorch = (x, y, w, h) => {
        for (let i = 0; i < (w * h) / 3; i++) {
          const a = x + ((K.hash(i, x) * w) | 0),
            b2 = y + ((K.hash(i, y + 1) * h) | 0),
            d = Math.hypot((a - x - w / 2) / w, (b2 - y - h) / h);
          if (d < 0.7) p(a, b2, d < 0.35 ? '#1a1410' : '#3a2e26');
        }
      };
      const streak = (x, y, n) => {
        for (let i = 0; i < n; i++) p(x, y + i, i % 3 ? '#8a4a2a' : '#a8603a');
      };
      // half the lit windows are boarded now
      [
        [X0 + 46, 33],
        [X0 + 90, 30],
        [X0 + 46, bot + 27],
        [X0 + 130, bot + 22],
        [10, 36],
        [64, dy + 28],
        [148, dy + 28],
      ].forEach(([x, y]) => board(x, y));
      // scorch up the wall of Doc's clinic and the Velvet Rad, rust running down from the tin and the tank
      scorch(X0 + 168, top + 18, 26, 30);
      scorch(X0 + 2, bot + 20, 22, 30);
      scorch(28, dy + 14, 30, 36);
      [X0 + 4, X0 + 14, X0 + 52, X0 + 60].forEach(x => streak(x, top + 21, 8 + (x % 5)));
      [X0 + 170, X0 + 220].forEach(x => streak(x, top + 19, 10));
      // washing on a line between Moe's and the office, grey and stiff with dust
      PX.line(g(), X0 + 66, top + 24, X0 + 84, top + 26, '#3a3430');
      [
        [X0 + 69, '#9a9488'],
        [X0 + 74, '#7a7468'],
        [X0 + 79, '#8a8478'],
      ].forEach(([x, c2]) => {
        r(x, top + 25, 4, 6, c2);
        p(x + 1, top + 31, c2);
      });
      // a crude tooth daubed on the clinic wall: the Molars were here
      PX.rows(g(), X0 + 205, top + 22, ['ooooo', 'o...o', 'o.o.o', '.o.o.'], { o: '#7a1a1a' });
      // bones and a skull in the gutters, a tyre, a dead dog of a tree
      [
        [X0 + 40, 66],
        [X0 + 154, 62],
        [130, 250],
        [220, 236],
        [60, 362],
        [300, 340],
      ].forEach(([x, y], i) =>
        i % 2 ? P.skull(x, y) : PX.rows(g(), x, y, ['o...o', '.ooo.', 'o...o'], { o: '#e4dccc' }),
      );
      M()
        .oval(X0 + 150, bot + 56, 5, 3)
        .paint(g(), R('#2a2624'), { hi: 1, ink: INK });
      M()
        .oval(X0 + 150, bot + 56, 2, 1)
        .paint(g(), R('#8a7a60'), { line: false });
      // the leafy tree is dead: a bare trunk and clawing branches
      r(-16, 236, 64, 64, 'rgba(0,0,0,0)');
    }

    // the town pump and its trough, on the road
    K.solid(198 - 2, 70, 36, 35);
    // a scarecrow in Hector's field, wearing a surprisingly good hat
    {
      const sx = 62,
        sy = 132;
      M()
        .rect(sx + 6, sy + 8, 3, 26)
        .rect(sx - 2, sy + 14, 19, 3)
        .paint(g(), R('#7a5434'), { ink: INK });
      M()
        .oval(sx + 7, sy + 8, 5, 5)
        .paint(g(), R('#c8b080'), { hi: 1, ink: INK });
      M()
        .rect(sx, sy, 15, 3)
        .rect(sx + 3, sy - 5, 9, 6)
        .paint(g(), R('#3a3040'), { hi: 1, ink: INK });
      M()
        .rect(sx + 1, sy + 17, 13, 10)
        .paint(g(), R('#8a5a3a'), { hi: 1, ink: INK });
    }
    // Pete's cage, in front of him
    const cx = 260,
      cy = 296;
    for (let xx = cx; xx <= cx + 48; xx += 6) M().rect(xx, cy, 2, 46).paint(g(), R('#6a6a70'), { hi: 1, ink: INK });
    M()
      .rect(cx - 2, cy - 2, 54, 4)
      .rect(cx - 2, cy + 44, 54, 4)
      .paint(g(), R('#5a5a60'), { hi: 1, ink: INK });
  },
  things: [
    [196, 70, 36, 35, /water/i],
    [58, 126, 24, 40, /scarecrow/i],
    [258, 294, 54, 50, /kitchen|Pete/i],
  ],
};
// ---- Scrapwell: home. The village, the well in the middle of it, and Rattle Gully on the rocks to the east ----
TOWNMAP.scrapwell = {
  rows: [
    ',,,,,,,,,,,,,,',
    '..........,,,,',
    '..........,,,,',
    '===========,,,',
    '===========,,,',
    '..........,,,,',
    '..........,,,,',
    '..........,,,,',
    '===========,,,',
    ',,..==..,,,,,,',
    ',,..==..,,,,,,',
    ',,,.==.,,,,,,',
  ],
  spawn: [4, 10],
  exits: [
    [4, 11],
    [5, 11],
  ],
  areas: [['gully', 11, 0, 13, 11]],
  doors: [null, /chapel|Crumb|pray|sermon/i, null, /shack|sleep|retire/i],
  spots: { elder: [0, 2], crumb: [4, 2], pell: [7, 2], gus: [6, 4], rind: [0, 7], pig: [8, 6] },
  extra: [
    [2, 2],
    [9, 2],
    [3, 7],
    [6, 6],
    [1, 9],
    [8, 9],
    [10, 6],
  ],
  paint(K) {
    const { building, door, win, props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      M = () => PX.mask(),
      g = () => K.g,
      top = 6,
      bot = 128;
    building(4, top + 4, 62, 16, 30, '#8a9090', '#8a6a48', { tin: 1, rust: 1, planks: 1 });
    door(29, top + 30, '#5a3a20');
    win(10, top + 26, 1);
    building(87, top, 66, 18, 32, '#a87050', '#cca070', { adobe: 1, flat: 1 });
    door(114, top + 30, '#4a3020');
    win(94, top + 26, 1);
    win(134, top + 26, 1);
    M()
      .rect(110, top - 4, 20, 10)
      .paint(g(), R('#cca070'), { hi: 1, ink: INK });
    M()
      .rect(114, top - 2, 12, 6)
      .paint(g(), R('#b8c4cc'), { hi: 1, ink: INK });
    building(172, top + 4, 62, 16, 30, '#9a9a90', '#7a5a3a', { tin: 1, rust: 1, planks: 1 });
    door(197, top + 30, '#5a3a20');
    win(216, top + 26, 0);
    // the well, in the middle of everything
    shadow(96, 112, 52, 8);
    M().oval(120, 100, 22, 10).paint(g(), R('#8a8478'), { hi: 1, ink: INK });
    M().oval(120, 98, 15, 6).paint(g(), R('#2a2420'), { line: false });
    M().oval(120, 99, 10, 3).paint(g(), R('#3a5a2a'), { line: false });
    [100, 138].forEach(x => M().rect(x, 72, 4, 28).paint(g(), R('#6a4a2e'), { hi: 1, ink: INK }));
    M().rect(98, 70, 46, 4).paint(g(), R('#7a5434'), { hi: 1, ink: INK });
    r(119, 74, 1, 20, '#c8b890');
    M().rect(116, 92, 8, 5).paint(g(), R('#6a5a3a'), { ink: INK });
    // your shack, the pig pen (a gap in the top rail), the Crust's fire
    building(90, bot + 6, 60, 16, 30, '#8a8a84', '#9a7a54', { tin: 1, planks: 1 });
    door(114, bot + 32, '#4a3424');
    win(96, bot + 26, 0);
    P.fence(172, bot + 4, 4);
    P.vfence(172, bot + 4, 4);
    P.vfence(234, bot + 16, 3);
    P.fence(172, bot + 44, 6);
    P.fire(28, bot + 24);
    P.junk(48, bot + 30);
    P.junk(2, 40);
    P.barrel(72, 42);
    P.skull(150, 70);
    // Rattle Gully: redder, stonier ground, a dry wash in the rocks, bones, and things that bite
    for (let y = 0; y < 288; y++)
      for (let x = 262; x < 336; x++) {
        const k = K.hash(x >> 1, y >> 1, 3);
        if (k < 0.5 - (x - 262) / 40) continue;
        K.p(x, y, k < 0.8 ? 'rgba(130,80,50,0.25)' : 'rgba(90,60,40,0.35)');
      }
    for (let y = 0; y < 288; y++) {
      const x = 286 + Math.round(Math.sin(y / 17) * 6);
      r(x, y, 10, 1, '#9a7a54');
      r(x + 2, y, 6, 1, '#7a5e40');
    }
    P.rock(262, 20, 1);
    P.rock(300, 110, 0.9);
    P.rock(256, 196, 1.1);
    P.rock(306, 236, 0.8);
    P.rock(318, 8, 0.7);
    P.rock(312, 60, 0.6);
    P.rock(268, 262, 0.7);
    P.rock(316, 160, 0.7);
    P.skull(276, 160);
    PX.rows(g(), 300, 180, ['o...o', '.ooo.', 'o...o'], { o: '#e4dccc' });
  },
  things: [
    [96, 70, 50, 42, /well/i],
    [262, 20, 22, 14, /Hunt|rocks/i],
    [300, 110, 20, 13, /Hunt|rocks/i],
    [256, 196, 24, 15, /Hunt|rocks/i],
  ],
};
