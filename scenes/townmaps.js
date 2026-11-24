'use strict';
// ================= THE WALKING TOWNS: what goes where in each of the 10 stops (v9.23) =================
// Each town is painted once with the town kit (scenes/townkit.js), in the style of the approved mock-ups.
//   rows: the ground, one letter a tile (24 pixels):  . sand  , scrub  = road  ; field  ~ water (blocks)  # concrete  g grass  s salt
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
  from: { well: [6, 3] }, // climbing out of the well, you're beside it
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
// ---- the North Road: Krug's pens at Chainfield to the north, Snake Eyes to the south, a track between ----
TOWNMAP.snakeeyes = {
  rows: [
    '..........',
    '..........',
    '..........',
    '==========',
    '==========',
    '..........',
    '..........',
    '..........',
    '==========',
    '........==',
    '........==',
    '........==',
    ',,,,,,,,,=',
    '.........=',
    '.........=',
    '==========',
    '==========',
    '..........',
    '..........',
    '..........',
    '==========',
    ',,..==..,,',
    ',,..==..,,',
    ',,,.==.,,,',
  ],
  spawn: [4, 22],
  exits: [
    [4, 23],
    [5, 23],
  ],
  areas: [['chainfield', 0, 0, 9, 11]],
  // Krug's door, then the casino's
  doors: [/Krug|buy|sell|auction|price/i, /Bones/i],
  spots: { krug: [4, 2], teo: [2, 4], rook: [4, 15], pips: [6, 15], dice: [8, 16], tam: [5, 18], nan: [7, 18] },
  // the people in the pens stand inside the wire
  heldIn: 'chainfield',
  held: {
    pen: [
      [1, 6],
      [2, 6],
      [3, 6],
      [4, 6],
      [5, 6],
      [7, 6],
    ],
  },
  extra: [
    [7, 2],
    [8, 4],
    [1, 8],
    [8, 8],
    [1, 16],
    [9, 16],
    [2, 20],
    [8, 21],
  ],
  paint(K) {
    const { building, door, win, sign, props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g,
      top = 6,
      bot = 128,
      S = 288; // where Snake Eyes starts, in pixels
    // ---- Chainfield: rusty ground, Krug's hall, a watchtower, the pens ----
    g().fillStyle = 'rgba(150,80,40,0.12)';
    g().fillRect(0, 0, 240, S);
    building(62, top, 116, 20, 32, '#5a4a3a', '#8a6a48', { planks: 1 });
    door(114, top + 32, '#3a2a1a');
    win(74, top + 26, 1);
    win(152, top + 26, 0);
    sign(120, top + 8, 'KRUG', '#2a1e14', '#e8d8b0');
    [12, 40].forEach(x => M().rect(x, 14, 4, 46).paint(g(), R('#6a4a2e'), { hi: 1, ink: INK }));
    M().rect(6, 6, 42, 14).paint(g(), R('#7a5a38'), { hi: 1, ink: INK });
    M().rect(2, 0, 50, 6).paint(g(), R('#5a4030'), { hi: 1, ink: INK });
    K.solid(2, 0, 50, 60);
    // the pens: chain-link on posts, a gap where the gate hangs open, trolleys and bones inside
    P.chain(8, bot - 6, 88, 12);
    P.chain(144, bot - 6, 46, 12);
    P.chain(8, bot + 46, 182, 12);
    K.solid(4, bot - 6, 8, 64);
    K.solid(186, bot - 6, 8, 64);
    PX.line(g(), 8, bot - 2, 8, bot + 54, '#5a5a60');
    PX.line(g(), 189, bot - 2, 189, bot + 54, '#5a5a60');
    M()
      .rect(98, bot - 14, 4, 20)
      .paint(g(), R('#5a5a60'), { hi: 1, ink: INK });
    PX.line(g(), 102, bot - 10, 118, bot - 22, '#6a6a70');
    P.trolley(30, bot + 30);
    P.trolley(160, bot + 30);
    P.skull(110, bot + 40);
    P.barrel(200, 40);
    P.crate(186, 46);
    // ---- Snake Eyes: the casino in purple and neon, the fight pit, the rat track, Nan's bench, Dice's table ----
    g().fillStyle = 'rgba(40,20,90,0.16)';
    g().fillRect(0, S, 240, 288);
    building(14, S + top, 202, 22, 38, '#3a2448', '#6a2a3a', { tiles: 1, bricks: 1 });
    door(112, S + top + 40, '#e8b040', 16);
    [30, 62, 160, 182].forEach(x => win(x, S + top + 32, 1));
    const sw = K.textW('SNAKE EYES') + 10;
    M()
      .rect(120 - (sw >> 1), S + top + 6, sw, 13)
      .paint(g(), R('#1a1020'), { ink: INK });
    K.text(120 - (sw >> 1) + 5, S + top + 10, 'SNAKE EYES', '#ff70b0');
    [
      [100, S + top + 28],
      [132, S + top + 28],
    ].forEach(([x, y]) => {
      M().rect(x, y, 6, 6).paint(g(), R('#f0f0e8'), { ink: INK });
      p(x + 2, y + 2, INK);
      p(x + 4, y + 4, INK);
    });
    const px0 = 16,
      py0 = S + bot + 2;
    M().rect(px0, py0, 100, 52).paint(g(), R('#c8a878'), { line: false });
    r(px0, py0, 100, 3, '#8a2a2a');
    r(px0, py0 + 50, 100, 3, '#8a2a2a');
    r(px0, py0, 3, 52, '#8a2a2a');
    r(px0 + 97, py0, 3, 52, '#8a2a2a');
    [
      [px0, py0],
      [px0 + 96, py0],
      [px0, py0 + 48],
      [px0 + 96, py0 + 48],
    ].forEach(([x, y]) =>
      M()
        .rect(x - 1, y - 4, 6, 10)
        .paint(g(), R('#5a4a40'), { hi: 1, ink: INK }),
    );
    // the rat track: three lanes behind a low board
    M()
      .rect(146, S + bot - 6, 76, 16)
      .paint(g(), R('#8a6a48'), { hi: 1, ink: INK });
    [0, 1, 2].forEach(i => r(150, S + bot - 3 + i * 4, 68, 2, i % 2 ? '#5a3a24' : '#6a4a30'));
    [
      [160, 0],
      [184, 1],
      [204, 2],
    ].forEach(([x, i]) => PX.rows(g(), x, S + bot - 4 + i * 4, ['oo.', 'ooo'], { o: '#4a4040' }));
    M()
      .rect(158, S + bot + 34, 40, 6)
      .paint(g(), R('#7a5434'), { hi: 1, ink: INK });
    [160, 192].forEach(x =>
      M()
        .rect(x, S + bot + 40, 4, 8)
        .paint(g(), R('#5a3a24'), { ink: INK }),
    );
    K.solid(158, S + bot + 34, 40, 14);
    M()
      .oval(214, S + 78, 14, 6)
      .paint(g(), R('#2a6a3a'), { hi: 1, ink: INK });
    [
      [208, S + 76],
      [216, S + 78],
    ].forEach(([x, y]) => M().rect(x, y, 4, 5).paint(g(), R('#f0e8d8'), { ink: INK }));
    g().fillStyle = 'rgba(255,90,170,0.1)';
    g().fillRect(70, S, 100, 40);
  },
  things: [
    [16, 288 + 130, 100, 52, /The pit/i],
    [146, 288 + 122, 76, 16, /rat races/i],
    [200, 288 + 72, 28, 12, /Cards/i],
  ],
};
// ---- the Old Airport: the Sky-Bus crashed on the sand to the north, the Drowned Mall on its flooded car park ----
TOWNMAP.mall = {
  rows: [
    ',,,.......',
    '..........',
    '..........',
    '..........',
    '..........',
    '...,,.....',
    '..........',
    '..........',
    '==========',
    '==,,......',
    '==,,......',
    '==,,......',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '######~~~~',
    '#####~~~~~',
    '#####~~~~~',
    '#####~~~~~',
    '####~~~~~~',
    '####~~~~~~',
  ],
  spawn: [1, 22],
  exits: [
    [0, 23],
    [1, 23],
  ],
  areas: [['skybus', 0, 0, 9, 11]],
  doors: [],
  spots: { ohm: [6, 2], margie: [3, 15], vane: [8, 15], sprocket: [2, 18], gums: [3, 19], eel: [5, 17] },
  extra: [
    [7, 3],
    [1, 5],
    [8, 7],
    [3, 10],
    [0, 15],
    [6, 16],
    [1, 20],
    [2, 21],
  ],
  paint(K) {
    const { building, win, props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g,
      top = 6,
      bot = 128,
      S = 288;
    // ---- the Sky-Bus: the dead plane, broken across the sand ----
    shadow(10, 58, 230, 12);
    M().rect(30, 12, 180, 44).oval(30, 34, 22, 22).paint(g(), R('#d8d8d0'), { t: 0.85, hi: 1, ink: INK });
    K.solid(8, 12, 202, 44);
    r(10, 40, 200, 4, '#a83a30');
    for (let xx = 40; xx < 206; xx += 12)
      if (xx < 104 || xx > 136) M().rect(xx, 22, 6, 8).paint(g(), R('#4a5a6a'), { ink: INK });
    M().rect(104, 22, 32, 34).paint(g(), R('#5a5a58'), { hi: 1, ink: INK });
    r(108, 26, 24, 30, '#1a1814');
    M()
      .rows(208, 0, ['oooooooo', '.ooooooo', '..oooooo', '...ooooo', '....oooo', '....oooo', '....oooo'])
      .paint(g(), R('#c8c8c0'), { hi: 1, ink: INK });
    M()
      .rows(60, 60, [
        'oooooooooooooooooooooooo',
        '.ooooooooooooooooooooo..',
        '...ooooooooooooooooo....',
        '......oooooooooooo......',
      ])
      .paint(g(), R('#b8b8b0'), { hi: 1, ink: INK });
    // Coil banners, an antenna, mole holes
    [150, 186].forEach(x => {
      M().rect(x, 70, 2, 30).paint(g(), R('#6a6a70'), { ink: INK });
      M()
        .rect(x + 2, 70, 14, 10)
        .paint(g(), R('#4a6a9a'), { hi: 1, ink: INK });
      PX.rows(g(), x + 5, 72, ['.a.', 'aaa', '.a.', 'a.a'], { a: '#e8c040' });
    });
    PX.line(g(), 30, 0, 36, 12, '#6a6a70');
    r(28, 0, 4, 1, '#a8e07c');
    [
      [64, 150],
      [180, 140],
      [120, 172],
    ].forEach(([x, y]) => {
      M().oval(x, y, 8, 4).paint(g(), R('#8a6a48'), { hi: 1, ink: INK });
      M().oval(x, y, 4, 2).paint(g(), R('#2a1a10'), { line: false });
    });
    P.rock(96, 116);
    P.junk(196, 104);
    // ---- the Drowned Mall: ValuMart, half under water ----
    building(28, S + top - 2, 208, 16, 42, '#7a7a78', '#a8b4b4', { flat: 1, bricks: 1 });
    const sw = K.textW('VALUMART') + 10;
    M()
      .rect(132 - (sw >> 1), S + top + 2, sw, 11)
      .paint(g(), R('#f0ece0'), { ink: INK });
    K.text(132 - (sw >> 1) + 5, S + top + 5, 'VALUMART', '#c82a2a');
    M()
      .rect(100, S + top + 26, 40, 30)
      .paint(g(), R('#6a9aa8'), { hi: 1, ink: INK });
    r(119, S + top + 26, 2, 30, INK);
    r(104, S + top + 30, 4, 10, '#c8e8f0');
    win(44, S + top + 30, 0);
    win(70, S + top + 30, 0);
    win(172, S + top + 30, 1);
    M()
      .rows(204, S + top + 22, ['.oo.', 'oooo', '.oo.'])
      .paint(g(), R('#40a040'), { ink: INK });
    win(202, S + top + 30, 1);
    // Sprocket's checkout bench, Gums's tarp stall, a car going under
    M()
      .rect(10, S + bot + 14, 52, 14)
      .paint(g(), R('#8a8a84'), { hi: 1, ink: INK });
    r(14, S + bot + 16, 20, 4, '#3a4a4a');
    r(16, S + bot + 17, 6, 2, '#6aff8a');
    M()
      .rect(70, S + bot + 2, 50, 6)
      .paint(g(), R('#3a6a9a'), { hi: 1, ink: INK });
    [72, 116].forEach(x =>
      M()
        .rect(x, S + bot + 8, 3, 22)
        .paint(g(), R('#6a5a4a'), { ink: INK }),
    );
    M()
      .rect(74, S + bot + 22, 42, 10)
      .paint(g(), R('#7a5a3a'), { hi: 1, ink: INK });
    [80, 92, 104].forEach(x => r(x, S + bot + 20, 6, 3, '#e8e0d0'));
    M()
      .rect(176, S + bot + 10, 40, 16)
      .oval(196, S + bot + 10, 14, 6)
      .paint(g(), R('#a8343a'), { hi: 1, ink: INK });
    r(186, S + bot + 6, 20, 4, '#9ac0c8');
    P.barrel(214, S + 70);
    P.crate(220, S + 96);
  },
  things: [
    [104, 22, 32, 34, /Coil|pray|radio|plane|Ohm/i],
    [56, 146, 16, 8, /rad-moles/i],
    [172, 136, 16, 8, /rad-moles/i],
    [112, 168, 16, 8, /rad-moles/i],
    [100, 288 + 32, 40, 30, /Value Meal|food court|Margie|associate/i],
    [10, 288 + 142, 52, 14, /Sprocket|fit|mod|scope|barrel|plate/i],
    [70, 288 + 130, 50, 32, /Gums|parts|sell|buy/i],
    [176, 288 + 134, 40, 22, /Dive|vault/i],
  ],
};

// ---- the Green: the glasshouse, the beds and the wall. Outside the wall you only meet who is at the gate ----
TOWNMAP.green = {
  from: { vats: [5, 3] }, // up from the vat room, at the glasshouse door
  rows: [
    'gggggggggg',
    'gggggggggg',
    'gggggggggg',
    'gggg==gggg',
    'gggg==gggg',
    'gggg==gggg',
    'gggg==gggg',
    'gggg==gggg',
    '..........',
    ',,..==..,,',
    ',,..==..,,',
    ',,,.==.,,,',
  ],
  spawn: [4, 10],
  exits: [
    [4, 11],
    [5, 11],
  ],
  doors: [/glasshouse|seed house|Gardener|seed/i],
  spots: { gardener: [4, 3], fern: [7, 4], warden: [3, 8] },
  extra: [
    [6, 5],
    [2, 5],
    [8, 6],
    [1, 9],
    [7, 9],
    [8, 8],
  ],
  // who you can see: inside the wall only once you're let in
  who: id => S.f.greenIn || NPC[id].gate || S.n[id].st.gate || S.n[id].loc !== 'green',
  // the gate is shut until you're in: knocking is the place's own choices (pay, or the pipe round the side)
  live(rows, use) {
    if (S.f.greenIn) return;
    rows[7][4] = rows[7][5] = 'h';
    use['4,7'] = use['5,7'] = 'menu';
  },
  paint(K) {
    const { door, props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g,
      top = 6;
    // the glasshouse
    shadow(40, 62, 170, 10);
    M()
      .rect(36, top + 14, 168, 44)
      .paint(
        g(),
        {
          o: '#2a3a3a',
          d: 'rgba(120,180,190,0.55)',
          m: 'rgba(160,210,220,0.55)',
          l: 'rgba(200,235,240,0.6)',
          h: '#f0fafa',
        },
        { hi: 1, ink: '#3a4a4a' },
      );
    for (let xx = 36; xx < 204; xx += 14) r(xx, top + 14, 1, 44, '#4a5a5a');
    r(36, top + 34, 168, 1, '#4a5a5a');
    M()
      .oval(120, top + 14, 84, 12)
      .cut((x, y) => y > top + 14)
      .paint(
        g(),
        {
          o: '#2a3a3a',
          d: 'rgba(120,180,190,0.55)',
          m: 'rgba(170,220,230,0.6)',
          l: 'rgba(210,240,245,0.65)',
          h: '#f0fafa',
        },
        { hi: 1, ink: '#3a4a4a' },
      );
    door(114, top + 38, '#4a6a3a');
    // beds of tomatoes, sunflowers, the wall and its great gate
    [
      [8, 76],
      [150, 76],
    ].forEach(([x, y]) => {
      M().rect(x, y, 80, 30).paint(g(), R('#6a4a30'), { hi: 1, ink: INK });
      for (let yy = y + 6; yy < y + 28; yy += 8)
        for (let xx = x + 6; xx < x + 78; xx += 10) {
          PX.rows(g(), xx, yy, ['.g.', 'grg', '.g.'], { g: '#4a8a2a', r: '#e04030' });
        }
    });
    [196, 206, 216].forEach((x, i) => {
      r(x + 2, 120 - i * 2, 1, 14, '#4a7a2a');
      M()
        .oval(x + 2, 118 - i * 2, 4, 4)
        .paint(g(), R('#e8c030'), { hi: 1, ink: INK });
      p(x + 2, 118 - i * 2, '#5a3a1a');
    });
    M().rect(0, 176, 96, 18).rect(144, 176, 96, 18).paint(g(), R('#8a8478'), { hi: 1, ink: INK });
    for (let xx = 0; xx < 240; xx += 12) r(xx, 184, 1, 10, '#6a6458');
    M().rect(96, 172, 6, 22).rect(138, 172, 6, 22).paint(g(), R('#7a7468'), { hi: 1, ink: INK });
    K.solid(36, top + 14, 168, 44);
    K.solid(8, 76, 80, 30);
    K.solid(150, 76, 80, 30);
    K.solid(0, 176, 96, 18);
    K.solid(144, 176, 96, 18);
    // the outflow pipe, round the side of the wall
    M().rect(206, 186, 16, 10).paint(g(), R('#6a6a60'), { hi: 1, ink: INK });
    M().oval(214, 196, 5, 3).paint(g(), R('#3a4a3a'), { line: false });
  },
  things: [[206, 182, 16, 14, /outflow|pipe/i]],
};
// ---- Silo 9: the hatch over the Big Tooth, Molar tents, red lamps. Guards on the gate until you're in ----
TOWNMAP.silo = {
  rows: [
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '==========',
    '....==....',
    '....==....',
    '....==....',
  ],
  pal: { road: ['#6a5a50', '#5a4a40', '#7a6a60', '#3a2a22', '#2a1a14', '#8a7a70'] },
  spawn: [4, 10],
  exits: [
    [4, 11],
    [5, 11],
  ],
  doors: [],
  spots: { king: [5, 2] },
  extra: [
    [3, 2],
    [8, 3],
    [1, 5],
    [8, 5],
    [3, 7],
    [6, 7],
  ],
  who: id => S.f.siloIn || S.n[id].loc !== 'silo',
  // the gate across the road until you're in: two Molars with rifles, and the place's own choices
  live(rows, use) {
    if (S.f.siloIn) return;
    for (let x = 0; x < 10; x++) rows[8][x] = 'h';
    use['4,8'] = use['5,8'] = 'menu';
  },
  paint(K) {
    const { props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g;
    // the hatch over the Big Tooth: flush with the concrete, so no shadow. Set into the ground, its inner top edge
    // is in shade and its inner bottom edge catches the light.
    const ring = PX.mask().oval(120, 92, 64, 30);
    ring.each((x, y) => p(x, y, ((x >> 2) + (y >> 2)) % 2 ? '#d8b030' : '#2a2420'));
    PX.mask()
      .oval(120, 92, 64, 30)
      .cut((x, y) => (x - 120) ** 2 / (63 * 63) + (y - 92) ** 2 / (29 * 29) < 1)
      .each((x, y) => p(x, y, '#4a4640'));
    const doors = PX.mask().oval(120, 92, 52, 23);
    doors.each((x, y) => p(x, y, '#6a6e74'));
    doors.each((x, y) => {
      const k = (x - 120) ** 2 / (52 * 52) + (y - 92) ** 2 / (23 * 23);
      if (k > 0.82) p(x, y, y < 92 ? '#34363a' : '#9a9ea4');
    });
    for (let yy = 76; yy < 108; yy += 6) r(76, yy, 88, 1, 'rgba(40,40,44,0.35)');
    r(119, 69, 2, 47, '#2a2a2e');
    r(121, 69, 1, 47, '#8a8e94');
    [
      [96, 92],
      [144, 92],
    ].forEach(([x, y]) => {
      M().oval(x, y, 6, 4).paint(g(), R('#8a8e94'), { hi: 1, ink: '#3a3c40' });
      r(x - 3, y, 7, 1, '#4a4c50');
    });
    // Molar tents, a lamp
    // Molar tents: A-frames of patched canvas, pegged down, their shadow right under them
    [
      [14, 146],
      [174, 146],
    ].forEach(([x, y]) => {
      shadow(x - 4, y + 30, 60, 8);
      const C = R('#8a4a38'),
        tent = PX.mask();
      for (let j = 0; j <= 30; j++) {
        const half = Math.round(4 + j * 0.8);
        tent.rect(x + 26 - half, y + j, half * 2, 1);
      }
      tent.paint(g(), C, { t: 0.55, hi: 1, ink: INK });
      PX.line(g(), x + 26, y, x + 26, y + 30, C.d);
      M()
        .rows(x + 21, y + 14, [
          '....oo....',
          '...oooo...',
          '..oooooo..',
          '.oooooooo.',
          '.oooooooo.',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
          'oooooooooo',
        ])
        .paint(g(), R('#2a1814'), { line: false, flat: true });
      M()
        .rect(x + 6, y + 12, 6, 5)
        .paint(g(), R('#a8805a'), { ink: INK });
      PX.line(g(), x + 2, y + 31, x - 6, y + 34, '#c8b890');
      PX.line(g(), x + 50, y + 31, x + 58, y + 34, '#c8b890');
      [x - 7, x + 58].forEach(px => {
        r(px, y + 33, 2, 3, '#5a4030');
      });
      r(x + 25, y - 4, 2, 5, '#5a4a40');
      r(x + 27, y - 4, 6, 3, '#c82a2a');
    });
    [20, 214].forEach(x => {
      M().rect(x, 14, 4, 40).paint(g(), R('#4a4a50'), { ink: INK });
      M()
        .oval(x + 2, 12, 5, 3)
        .paint(g(), R('#ff6040'), { hi: 1, ink: INK });
    });
    P.barrel(40, 50);
    P.barrel(56, 46);
    P.crate(180, 48);
    P.skull(150, 130);
    P.skull(80, 134);
    K.solid(56, 62, 128, 60);
    K.solid(14, 146, 52, 32);
    K.solid(174, 146, 52, 32);
    K.solid(20, 14, 4, 40);
    K.solid(214, 14, 4, 40);
    g().fillStyle = 'rgba(120,20,10,0.14)';
    g().fillRect(0, 0, 240, 288);
  },
  things: [[56, 62, 128, 60, /hatch|launch|Tooth|key|sabotage|King/i]],
};

// ---- the lost towns: each stage of the way in is a pack of beasts standing where it lives ----
TOWNMAP.gristmill = {
  rows: [
    ',,,,,,,,,,',
    ',,,,,,,,,,',
    ',,,,,,,,,,',
    '==========',
    '==========',
    ',,,,,,~~,,',
    ',,,,,,~~,,',
    ',,,,,,~~,,',
    '======~~==',
    ',,..==..,,',
    ',,..==..,,',
    ',,,.==.,,,',
  ],
  pal: {},
  spawn: [4, 10],
  exits: [
    [4, 11],
    [5, 11],
  ],
  key: () => townStage('gristmill'),
  nope: 'Not that way yet. Clear what is in front of you first.',
  doors: [],
  spots: {},
  extra: [
    [1, 9],
    [8, 9],
    [2, 6],
    [9, 5],
  ],
  paint(K) {
    const { building, door, win, props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g,
      top = 6,
      bot = 128,
      st = townStage('gristmill');
    const ruinRoof = (x, y, w, h) =>
      [
        [0.2, 0.3],
        [0.65, 0.5],
      ].forEach(([a, b2]) =>
        M()
          .rows(Math.round(x + w * a), Math.round(y + h * b2 - 3), [
            '..oooo.',
            '.oooooo',
            'ooooooo',
            '.ooooo.',
            '..oo...',
          ])
          .paint(g(), R('#1a120c'), { line: false, flat: true }),
      );
    const boarded = (x, y) => {
      r(x, y, 12, 10, '#1a120c');
      PX.line(g(), x - 1, y + 2, x + 13, y + 5, '#9a7a50');
      PX.line(g(), x - 1, y + 7, x + 13, y + 4, '#8a6a44');
    };
    const gone = (x, y, w = 12) => {
      r(x, y, w, 20, '#140c08');
      PX.rows(g(), x, y + 14, ['o.o.oo.o.o.o', '.o.o..o.o.o.'], { o: '#6a4a30' });
    };
    const B = {
      hive: (x, y, w, h) => {
        const C = R('#c8a050');
        M()
          .oval(Math.round(x + w / 2), Math.round(y + h / 2), Math.round(w / 2), Math.round(h / 2))
          .paint(g(), C, { t: 0.7, hi: 1, ink: INK });
        for (let yy = y + 4; yy < y + h - 2; yy += 5) PX.line(g(), x + 4, yy, x + w - 4, yy + 1, C.d);
      },
    };
    building(4, top + 6, 60, 16, 28, '#7a6a50', '#9a7a54', { thatch: 1, planks: 1 });
    ruinRoof(4, top + 6, 60, 16);
    gone(29, top + 30);
    boarded(10, top + 26);
    // the mill: tall, with a wheel on the race
    building(150, top - 4, 50, 30, 92, '#6a5a44', '#a88a5a', { thatch: 1, planks: 1 });
    ruinRoof(150, top - 4, 50, 30);
    gone(170, top + 98, 12);
    boarded(160, top + 40);
    boarded(178, top + 66);
    M().oval(210, 100, 16, 16).paint(g(), R('#6a4a2e'), { hi: 1, ink: INK });
    for (let a = 0; a < 8; a++)
      PX.line(g(), 210, 100, 210 + Math.cos(a * 0.785) * 15, 100 + Math.sin(a * 0.785) * 15, '#4a3020');
    building(72, top + 8, 60, 14, 26, '#8a7a5a', '#b8985a', { planks: 1 });
    gone(97, top + 28);
    M()
      .rows(84, top + 48, ['.y.y..y.y.yy.y..y', 'y.yy.y.yy..y.yy.y'])
      .paint(g(), R('#e0c060'), { line: false });
    for (let i = 0; i < 30; i++) p(60 + ((K.hash(i, 1) * 120) | 0), 70 + ((K.hash(i, 2) * 40) | 0), '#e0c060');
    // the stages: rats in the outer houses, the granary, the race; the Queen at the top of the mill
    if (st < 1)
      [
        [22, 66],
        [58, 76],
        [6, 90],
      ].forEach(([x, y]) => BEAST.rat(g(), x, y));
    if (st < 2)
      [
        [98, 62],
        [118, 84],
      ].forEach(([x, y]) => BEAST.rat(g(), x, y));
    if (st < 3) BEAST.rat(g(), 196, 150);
    if (st < 4) BEAST.ratQueen(g(), 146, 112);
  },
  // each stage's pack, where it stands; once beaten it is gone and so is the way it blocked
  things: () =>
    [
      [0, 64, 84, 44, /outer houses/i],
      [96, 60, 44, 44, /granary/i],
      [190, 144, 30, 26, /mill race/i],
      [146, 112, 48, 40, /nest/i],
    ].filter((t, i) => townStage('gristmill') <= i),
};
TOWNMAP.saltpan = {
  rows: [
    'ssssssssss',
    'ssssssssss',
    'ssssssssss',
    'ssssssssss',
    'ssssssssss',
    'ssssssssss',
    'ssssssssss',
    'ssssssssss',
    '====ssssss',
    ',,..==..,,',
    ',,..==..,,',
    ',,,.==.,,,',
  ],
  pal: { road: ['#c8b890', '#b8a880', '#d8c8a0', '#9a8a68', '#7a6a50', '#e8dcc0'] },
  spawn: [4, 10],
  exits: [
    [4, 11],
    [5, 11],
  ],
  key: () => townStage('saltpan'),
  nope: 'Not that way yet. Clear what is in front of you first.',
  doors: [],
  spots: {},
  extra: [
    [1, 9],
    [8, 9],
    [2, 6],
    [7, 7],
  ],
  paint(K) {
    const { building, door, win, props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g,
      top = 6,
      bot = 128,
      st = townStage('saltpan');
    const ruinRoof = (x, y, w, h) =>
      [
        [0.2, 0.3],
        [0.65, 0.5],
      ].forEach(([a, b2]) =>
        M()
          .rows(Math.round(x + w * a), Math.round(y + h * b2 - 3), [
            '..oooo.',
            '.oooooo',
            'ooooooo',
            '.ooooo.',
            '..oo...',
          ])
          .paint(g(), R('#1a120c'), { line: false, flat: true }),
      );
    const boarded = (x, y) => {
      r(x, y, 12, 10, '#1a120c');
      PX.line(g(), x - 1, y + 2, x + 13, y + 5, '#9a7a50');
      PX.line(g(), x - 1, y + 7, x + 13, y + 4, '#8a6a44');
    };
    const gone = (x, y, w = 12) => {
      r(x, y, w, 20, '#140c08');
      PX.rows(g(), x, y + 14, ['o.o.oo.o.o.o', '.o.o..o.o.o.'], { o: '#6a4a30' });
    };
    const B = {
      hive: (x, y, w, h) => {
        const C = R('#c8a050');
        M()
          .oval(Math.round(x + w / 2), Math.round(y + h / 2), Math.round(w / 2), Math.round(h / 2))
          .paint(g(), C, { t: 0.7, hi: 1, ink: INK });
        for (let yy = y + 4; yy < y + h - 2; yy += 5) PX.line(g(), x + 4, yy, x + w - 4, yy + 1, C.d);
      },
    };
    building(4, top + 4, 64, 16, 30, '#8a8a84', '#b8b0a0', { tin: 1, rust: 1 });
    ruinRoof(4, top + 4, 64, 16);
    gone(30, top + 30);
    boarded(10, top + 26);
    // the pan-works: a boiling shed and its chimney
    M()
      .rect(118, top - 6, 10, 26)
      .paint(g(), R('#7a6a5e'), { hi: 1, ink: INK });
    building(90, top + 4, 70, 18, 32, '#7a7468', '#9a8a78', { tin: 1, rust: 1 });
    gone(116, top + 34, 16);
    // drying racks, cut to pieces
    for (let i = 0; i < 4; i++) {
      const x = 176 + i * 15;
      M().rect(x, 20, 3, 34).paint(g(), R('#8a6a44'), { ink: INK });
    }
    PX.line(g(), 176, 26, 224, 30, '#8a6a44');
    PX.line(g(), 176, 40, 206, 46, '#8a6a44');
    // the deep pan, which is a back
    M().oval(170, 140, 60, 26).paint(g(), R('#d8d2c4'), { line: false });
    if (st < 1)
      [
        [12, 64],
        [46, 78],
        [30, 140],
      ].forEach(([x, y]) => BEAST.crab(g(), x, y));
    if (st < 2) BEAST.saltback(g(), 88, 50);
    if (st < 3) BEAST.saltback(g(), 180, 46);
    if (st < 4) BEAST.oldShell(g(), 138, 124);
  },
  // each stage's pack, where it stands; once beaten it is gone and so is the way it blocked
  things: () =>
    [
      [8, 60, 72, 40, /outer flats/i],
      [84, 46, 40, 26, /pan-works/i],
      [176, 42, 40, 26, /drying racks/i],
      [130, 118, 80, 40, /deep pan/i],
    ].filter((t, i) => townStage('saltpan') <= i),
};
TOWNMAP.kettle = {
  rows: [
    ',,,,,,,,,,',
    '..........',
    '..........',
    '==========',
    '==========',
    '..........',
    '..........',
    '..........',
    '==========',
    ',,..==..,,',
    ',,..==..,,',
    ',,,.==.,,,',
  ],
  pal: {},
  spawn: [4, 10],
  exits: [
    [4, 11],
    [5, 11],
  ],
  key: () => townStage('kettle'),
  nope: 'Not that way yet. Clear what is in front of you first.',
  doors: [],
  spots: {},
  extra: [
    [1, 9],
    [8, 9],
    [0, 7],
    [9, 6],
  ],
  paint(K) {
    const { building, door, win, props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g,
      top = 6,
      bot = 128,
      st = townStage('kettle');
    const ruinRoof = (x, y, w, h) =>
      [
        [0.2, 0.3],
        [0.65, 0.5],
      ].forEach(([a, b2]) =>
        M()
          .rows(Math.round(x + w * a), Math.round(y + h * b2 - 3), [
            '..oooo.',
            '.oooooo',
            'ooooooo',
            '.ooooo.',
            '..oo...',
          ])
          .paint(g(), R('#1a120c'), { line: false, flat: true }),
      );
    const boarded = (x, y) => {
      r(x, y, 12, 10, '#1a120c');
      PX.line(g(), x - 1, y + 2, x + 13, y + 5, '#9a7a50');
      PX.line(g(), x - 1, y + 7, x + 13, y + 4, '#8a6a44');
    };
    const gone = (x, y, w = 12) => {
      r(x, y, w, 20, '#140c08');
      PX.rows(g(), x, y + 14, ['o.o.oo.o.o.o', '.o.o..o.o.o.'], { o: '#6a4a30' });
    };
    const B = {
      hive: (x, y, w, h) => {
        const C = R('#c8a050');
        M()
          .oval(Math.round(x + w / 2), Math.round(y + h / 2), Math.round(w / 2), Math.round(h / 2))
          .paint(g(), C, { t: 0.7, hi: 1, ink: INK });
        for (let yy = y + 4; yy < y + h - 2; yy += 5) PX.line(g(), x + 4, yy, x + w - 4, yy + 1, C.d);
      },
    };
    building(4, top + 4, 60, 16, 30, '#8a8478', '#a88a64', { planks: 1, tin: 1 });
    ruinRoof(4, top + 4, 60, 16);
    boarded(10, top + 26);
    gone(30, top + 30);
    building(176, top + 4, 60, 16, 30, '#8a8478', '#b89a6a', { adobe: 1, flat: 1 });
    boarded(184, top + 26);
    gone(206, top + 30);
    // the water tower, wrapped in hive
    shadow(80, 176, 84, 12);
    [
      [88, 90],
      [148, 90],
    ].forEach(([x, y]) => M().rect(x, y, 5, 88).paint(g(), R('#6a5a4a'), { hi: 1, ink: INK }));
    PX.line(g(), 92, 110, 148, 160, '#4a3a2a');
    PX.line(g(), 148, 110, 92, 160, '#4a3a2a');
    M().rect(76, 40, 88, 52).oval(120, 92, 44, 8).paint(g(), R('#6e9090'), { t: 0.78, hi: 1, ink: INK });
    M().oval(120, 40, 44, 9).paint(g(), R('#80a2a0'), { hi: 1, ink: INK });
    B.hive(84, 56, 30, 34);
    B.hive(126, 48, 40, 46);
    B.hive(100, 86, 28, 20);
    M()
      .rect(20, bot + 6, 48, 34)
      .paint(g(), R('#8a7a64'), { hi: 1, ink: INK });
    B.hive(24, bot + 2, 22, 18);
    gone(38, bot + 20, 14);
    if (st < 1)
      [
        [22, 62],
        [52, 48],
        [176, 68],
        [204, 56],
      ].forEach(([x, y]) => BEAST.stinger(g(), x, y));
    if (st < 2) BEAST.stinger(g(), 62, 124);
    if (st < 3) BEAST.stinger(g(), 158, 110);
    if (st < 4) BEAST.stinger(g(), 120, 4);
  },
  // each stage's pack, where it stands; once beaten it is gone and so is the way it blocked
  things: () =>
    [
      [20, 46, 210, 40, /main street/i],
      [56, 118, 24, 24, /pump house/i],
      [150, 104, 24, 24, /tower ladder/i],
      [110, 0, 24, 24, /tank|hive/i],
    ].filter((t, i) => townStage('kettle') <= i),
};
TOWNMAP.fanghill = {
  rows: [
    '..........',
    '..........',
    '..........',
    '==========',
    '==========',
    '..........',
    '..........',
    '..........',
    '==========',
    '....==....',
    '....==....',
    '....==....',
  ],
  pal: { sand: ['#c8a478', '#b48e62', '#d8b488', '#9a7850'] },
  spawn: [4, 10],
  exits: [
    [4, 11],
    [5, 11],
  ],
  key: () => townStage('fanghill'),
  nope: 'Not that way yet. Clear what is in front of you first.',
  doors: [],
  spots: {},
  extra: [
    [1, 9],
    [8, 9],
    [0, 6],
    [9, 6],
  ],
  paint(K) {
    const { building, door, win, props: P, shadow } = K,
      R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      p = (...a) => K.p(...a),
      M = () => PX.mask(),
      g = () => K.g,
      top = 6,
      bot = 128,
      st = townStage('fanghill');
    const ruinRoof = (x, y, w, h) =>
      [
        [0.2, 0.3],
        [0.65, 0.5],
      ].forEach(([a, b2]) =>
        M()
          .rows(Math.round(x + w * a), Math.round(y + h * b2 - 3), [
            '..oooo.',
            '.oooooo',
            'ooooooo',
            '.ooooo.',
            '..oo...',
          ])
          .paint(g(), R('#1a120c'), { line: false, flat: true }),
      );
    const boarded = (x, y) => {
      r(x, y, 12, 10, '#1a120c');
      PX.line(g(), x - 1, y + 2, x + 13, y + 5, '#9a7a50');
      PX.line(g(), x - 1, y + 7, x + 13, y + 4, '#8a6a44');
    };
    const gone = (x, y, w = 12) => {
      r(x, y, w, 20, '#140c08');
      PX.rows(g(), x, y + 14, ['o.o.oo.o.o.o', '.o.o..o.o.o.'], { o: '#6a4a30' });
    };
    const B = {
      hive: (x, y, w, h) => {
        const C = R('#c8a050');
        M()
          .oval(Math.round(x + w / 2), Math.round(y + h / 2), Math.round(w / 2), Math.round(h / 2))
          .paint(g(), C, { t: 0.7, hi: 1, ink: INK });
        for (let yy = y + 4; yy < y + h - 2; yy += 5) PX.line(g(), x + 4, yy, x + w - 4, yy + 1, C.d);
      },
    };
    building(10, top + 4, 70, 16, 30, '#5a4a3a', '#7a5a3a', { planks: 1 });
    ruinRoof(10, top + 4, 70, 16);
    gone(40, top + 30);
    boarded(16, top + 26);
    boarded(60, top + 26);
    // the burned caravan: wagons on their sides, a hoop of canvas gone black
    [
      [120, 20],
      [176, 34],
    ].forEach(([x, y]) => {
      shadow(x, y + 30, 54, 8);
      M()
        .rect(x, y + 10, 50, 18)
        .paint(g(), R('#4a3a2e'), { hi: 1, ink: INK });
      M()
        .oval(x + 25, y + 8, 22, 8)
        .cut((a, b2) => K.hash(a, b2) < 0.35)
        .paint(g(), R('#3a2a24'), { ink: INK });
      M()
        .oval(x + 8, y + 30, 6, 6)
        .paint(g(), R('#3a2a1e'), { hi: 1, ink: INK });
    });
    // the hill of graves: bones, skulls, a Molar flag left in the ground
    M().oval(160, 150, 60, 22).paint(g(), R('#a88a64'), { t: 0.7, hi: 1, ink: INK });
    [
      [120, 140],
      [150, 136],
      [180, 144],
      [200, 150],
      [140, 156],
    ].forEach(([x, y]) => P.skull(x, y));
    for (let i = 0; i < 10; i++)
      PX.line(g(), 110 + i * 10, 150 + (i % 3) * 3, 116 + i * 10, 152 + (i % 3) * 3, '#ece4d4');
    r(206, 118, 2, 20, '#5a4a40');
    r(208, 118, 10, 6, '#c82a2a');
    if (st < 1)
      [
        [16, 66],
        [56, 80],
        [96, 60],
      ].forEach(([x, y]) => BEAST.hound(g(), x, y));
    if (st < 2)
      [
        [176, 74],
        [20, 138],
      ].forEach(([x, y]) => BEAST.hound(g(), x, y));
    if (st < 3) BEAST.alpha(g(), 140, 98);
  },
  // each stage's pack, where it stands; once beaten it is gone and so is the way it blocked
  things: () =>
    [
      [10, 60, 110, 44, /burned wagons/i],
      [170, 68, 40, 30, /stockade/i],
      [136, 94, 52, 44, /bone pits/i],
      [10, 6, 70, 46, /long barn|den/i],
    ].filter((t, i) => townStage('fanghill') <= i),
};
// ---- the places under a town: the well under Scrapwell, the vat room under the Green ----
// Their own small maps. The rope (or the ladder) is the way out, back up to the town.
TOWNMAP.well = {
  rows: [
    '..........',
    '..........',
    '..........',
    '..........',
    '......~~~.',
    '.....~~~~.',
    '......~~..',
    '..........',
    '..........',
    '..........',
  ],
  pal: { sand: ['#3a3430', '#2e2a26', '#46403a', '#24201c'] },
  spawn: [4, 1],
  exits: [[4, 0]],
  doors: [],
  spots: { nigel: [5, 6] },
  extra: [
    [2, 3],
    [3, 7],
    [7, 8],
    [8, 2],
  ],
  paint(K) {
    const R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      M = () => PX.mask(),
      g = () => K.g;
    // the walls of the shaft: wet rock all round, closing in
    const rock = (x, y, w, h) => {
      M().rect(x, y, w, h).paint(g(), R('#4a4038'), { t: 0.7, hi: 1, ink: '#140e0a' });
      K.solid(x, y, w, h);
    };
    rock(0, 0, 72, 22);
    rock(132, 0, 108, 22);
    rock(0, 0, 18, 240);
    rock(222, 0, 18, 240);
    rock(0, 222, 240, 18);
    rock(18, 150, 40, 24);
    rock(170, 24, 50, 30);
    // drips, moss, bones of chickens
    for (let i = 0; i < 40; i++)
      K.p(20 + ((K.hash(i, 3) * 200) | 0), 24 + ((K.hash(i, 4) * 190) | 0), K.hash(i, 5) < 0.5 ? '#2a4a2a' : '#5a5048');
    K.props.skull(60, 196);
    PX.rows(g(), 150, 190, ['o...o', '.ooo.', 'o...o'], { o: '#c8c0b0' });
    // the rope down from the light, and the light itself
    r(100, 0, 2, 26, '#c8b890');
    g().fillStyle = 'rgba(230,220,180,0.10)';
    g().fillRect(80, 0, 44, 48);
    // the pool, and its glow: whatever is in the water is why the chickens go
    g().fillStyle = 'rgba(120,255,120,0.10)';
    for (let k = 0; k < 5; k++) {
      g().beginPath();
      g().arc(172, 128, 30 + k * 10, 0, 7);
      g().fill();
    }
  },
  things: [],
};
TOWNMAP.vats = {
  rows: [
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
  ],
  pal: {},
  spawn: [4, 8],
  exits: [[4, 9]],
  doors: [],
  spots: { moss: [4, 4] },
  extra: [
    [2, 6],
    [7, 6],
    [1, 8],
    [8, 8],
  ],
  paint(K) {
    const R = K.R,
      INK = K.INK,
      r = (...a) => K.r(...a),
      M = () => PX.mask(),
      g = () => K.g;
    g().fillStyle = 'rgba(20,40,30,0.35)';
    g().fillRect(0, 0, 240, 240);
    // the vats: big tanks of green, pipes between them
    const vat = (x, y) => {
      K.shadow(x - 2, y + 44, 40, 8);
      M()
        .rect(x, y + 6, 36, 38)
        .oval(x + 18, y + 6, 18, 6)
        .paint(g(), R('#6a7a70'), { t: 0.72, hi: 1, ink: INK });
      M()
        .oval(x + 18, y + 6, 14, 4)
        .paint(g(), R('#6ac85a'), { hi: 1, ink: '#2a4a2a' });
      r(x + 6, y + 18, 24, 3, '#4a5a50');
      K.solid(x, y, 36, 44);
    };
    [
      [12, 10],
      [102, 10],
      [192, 10],
      [12, 120],
      [192, 120],
    ].forEach(([x, y]) => vat(x, y));
    PX.line(g(), 48, 30, 102, 30, '#5a6a60');
    PX.line(g(), 138, 30, 192, 30, '#5a6a60');
    PX.line(g(), 30, 54, 30, 120, '#5a6a60');
    PX.line(g(), 210, 54, 210, 120, '#5a6a60');
    // the way up, a ladder in the corner of the floor
    for (let y = 222; y < 240; y += 4) r(98, y, 20, 1, '#8a6a44');
    r(98, 220, 2, 20, '#7a5a3a');
    r(116, 220, 2, 20, '#7a5a3a');
    g().fillStyle = 'rgba(120,220,100,0.08)';
    g().fillRect(0, 0, 240, 240);
  },
  things: [],
};
