'use strict';
// ================= THE BEASTS, as they stand in the lost towns (v9.23, from the approved mock-ups) =================
// Beasts drawn like monster sprites: facing you, big heads, thick outlines, glowing eyes, lots of texture.
// BEAST[id](g, x, y): normal ones are 32 x 32, bosses 48 x 48. The shadow is part of the sprite.
const BEAST = (() => {
  const R = PX.ramp,
    INK = '#1a0e0a',
    M = () => PX.mask(),
    o = { hi: 1, ink: INK, t: 0.68 };
  const p = (g, x, y, c) => PX.p(g, x, y, c),
    r = (g, x, y, w, h, c) => PX.r(g, x, y, w, h, c);
  const shadow = (g, cx, cy, rx, ry) => {
    g.fillStyle = 'rgba(40,20,10,0.35)';
    for (let j = -ry; j <= ry; j++) {
      const k = Math.round(rx * Math.sqrt(1 - (j * j) / (ry * ry)));
      g.fillRect(cx - k, cy + j, k * 2 + 1, 1);
    }
  };
  // a glowing eye: a dark socket, a hot iris, a white glint
  const eye = (g, x, y, c = '#ff3a20', big) => {
    r(g, x - 1, y - 1, big ? 5 : 4, big ? 4 : 3, INK);
    r(g, x, y, big ? 3 : 2, big ? 2 : 1, c);
    p(g, x, y, '#fff0b0');
    g.fillStyle = 'rgba(255,80,40,0.25)';
    g.fillRect(x - 2, y - 2, big ? 7 : 6, big ? 6 : 5);
  };
  // fur: little dark strokes over a mask, and a ragged edge
  const fur = (g, m, C, n, seed) => {
    let s = seed;
    m.each((x, y) => {
      s = (s * 9301 + 49297) % 233280;
      if (s / 233280 < n) p(g, x, y, s % 2 ? C.d : C.l);
    });
  };
  const B = {
    rat: (g, x, y) => {
      shadow(g, x + 16, y + 30, 11, 2);
      const F = R('#8a7c6c'),
        Pk = R('#d8968a');
      // the tail, curling out behind
      M()
        .line(x + 24, y + 26, x + 30, y + 22, 2)
        .line(x + 30, y + 22, x + 29, y + 15, 1)
        .paint(g, Pk, o);
      // body, crouched, a paler belly
      const body = M()
        .oval(x + 16, y + 22, 10, 7)
        .paint(g, F, o);
      fur(g, body, F, 0.12, 3);
      M()
        .oval(x + 16, y + 24, 5, 4)
        .paint(g, R('#b8a898'), { ink: INK });
      // ears, big and torn
      [
        [x + 7, y + 6],
        [x + 25, y + 6],
      ].forEach(([a, b]) => {
        M().oval(a, b, 4, 4).paint(g, F, o);
        M()
          .oval(a, b + 1, 2, 2)
          .paint(g, Pk, { line: false });
      });
      p(g, x + 4, y + 4, 'rgba(0,0,0,0)');
      r(g, x + 27, y + 3, 2, 1, INK);
      // the head, with a ragged crest of fur
      const head = M()
        .oval(x + 16, y + 13, 9, 7)
        .rows(x + 10, y + 4, ['.o..o.o..o.', 'ooooooooooo'])
        .paint(g, F, o);
      fur(g, head, F, 0.1, 7);
      eye(g, x + 11, y + 11);
      eye(g, x + 19, y + 11);
      // a long snout, a pink nose, yellow buck teeth
      M()
        .oval(x + 16, y + 17, 4, 3)
        .paint(g, R('#a89888'), { hi: 1, ink: INK });
      M()
        .oval(x + 16, y + 15, 1, 1)
        .paint(g, Pk, { ink: INK });
      r(g, x + 15, y + 20, 1, 2, '#f0d890');
      r(g, x + 17, y + 20, 1, 2, '#e8c870');
      r(g, x + 15, y + 22, 3, 1, INK);
      [
        [-1, 0],
        [-1, 1],
        [1, 0],
        [1, 1],
      ].forEach(([sx, k]) => PX.line(g, x + 16 + sx * 4, y + 17 + k, x + 16 + sx * 10, y + 15 + k * 3, '#d8d0c0'));
      // claws, and a radiation sore glowing on its flank
      [
        [x + 10, y + 28],
        [x + 22, y + 28],
      ].forEach(([a, b]) => {
        M().oval(a, b, 3, 2).paint(g, Pk, o);
        [a - 2, a, a + 2].forEach(c => p(g, c, b + 2, '#f0e8d8'));
      });
      M()
        .oval(x + 23, y + 20, 2, 1)
        .paint(g, R('#8ae05a'), { line: false, hi: 1 });
      p(g, x + 23, y + 20, '#e8ffb0');
    },
    ratQueen: (g, x, y) => {
      shadow(g, x + 24, y + 45, 20, 3);
      const F = R('#6a5e52'),
        Pk = R('#c8867a');
      M()
        .line(x + 40, y + 40, x + 47, y + 32, 3)
        .line(x + 47, y + 32, x + 44, y + 20, 2)
        .paint(g, Pk, o);
      const body = M()
        .oval(x + 24, y + 33, 18, 13)
        .paint(g, F, o);
      fur(g, body, F, 0.14, 11);
      M()
        .oval(x + 24, y + 36, 9, 7)
        .paint(g, R('#9a8a7a'), { ink: INK });
      [
        [x + 9, y + 9],
        [x + 39, y + 9],
      ].forEach(([a, b]) => {
        M().oval(a, b, 6, 6).paint(g, F, o);
        M()
          .oval(a, b + 1, 3, 3)
          .paint(g, Pk, { line: false });
      });
      const head = M()
        .oval(x + 24, y + 19, 15, 11)
        .paint(g, F, o);
      fur(g, head, F, 0.12, 5);
      // a crown of other animals' teeth
      M()
        .rows(x + 13, y + 3, [
          'o..o..o..o..o..o..o..o',
          'oo.oo.oo.oo.oo.oo.oo.o',
          'oooooooooooooooooooooo',
          'oooooooooooooooooooooo',
        ])
        .paint(g, R('#e8dcc0'), { hi: 1, ink: INK });
      eye(g, x + 16, y + 16, '#ff3a20', 1);
      eye(g, x + 29, y + 16, '#ff3a20', 1);
      p(g, x + 14, y + 13, INK);
      p(g, x + 21, y + 14, INK);
      p(g, x + 27, y + 14, INK);
      p(g, x + 34, y + 13, INK);
      // the maw: open, with long yellow teeth
      M()
        .oval(x + 24, y + 25, 7, 4)
        .paint(g, R('#3a1414'), { ink: INK });
      M()
        .rows(x + 18, y + 22, ['ww.ww.ww.ww', '.w..w..w..w'])
        .paint(g, R('#f0d890'), { line: false, flat: true });
      M()
        .oval(x + 24, y + 20, 2, 1)
        .paint(g, Pk, { ink: INK });
      [
        [x + 15, y + 44],
        [x + 33, y + 44],
      ].forEach(([a, b]) => {
        M().oval(a, b, 5, 3).paint(g, Pk, o);
        [a - 3, a, a + 3].forEach(c => r(g, c, b + 2, 1, 2, '#f0e8d8'));
      });
      [
        [x + 10, y + 30],
        [x + 36, y + 34],
        [x + 20, y + 40],
      ].forEach(([a, b]) => {
        M().oval(a, b, 2, 1).paint(g, R('#8ae05a'), { line: false, hi: 1 });
        p(g, a, b, '#e8ffb0');
      });
    },
    crab: (g, x, y) => {
      shadow(g, x + 16, y + 29, 13, 2);
      const C = R('#d0603a');
      // legs, three a side, splayed
      for (let i = 0; i < 3; i++) {
        M()
          .line(x + 9 - i, y + 20 + i, x + 2 - i, y + 26 + i * 1, 2)
          .paint(g, C, o);
        M()
          .line(x + 23 + i, y + 20 + i, x + 30 + i, y + 26 + i, 2)
          .paint(g, C, o);
      }
      // claws, raised: a fist and two pincer tips each
      [
        [x + 4, y + 11, -1],
        [x + 28, y + 11, 1],
      ].forEach(([a, b, d]) => {
        M()
          .line(a + d * -2, b + 9, a, b + 3, 3)
          .paint(g, C, o);
        M()
          .oval(a, b, 4, 4)
          .rows(a - 4, b - 9, ['.oo...oo.', 'ooo...ooo', 'oo.....oo', 'ooo...ooo', '.ooo.ooo.', '..ooooo..'])
          .paint(g, C, o);
        p(g, a - 2, b - 8, C.h);
        p(g, a + 2, b - 8, C.h);
      });
      // the shell, wide, with ridges and a bright rim
      M()
        .oval(x + 16, y + 19, 11, 7)
        .paint(g, C, o);
      [
        [x + 10, y + 17],
        [x + 16, y + 15],
        [x + 22, y + 17],
      ].forEach(([a, b]) => PX.rows(g, a - 1, b, ['lll', '.d.'], { l: C.h, d: C.d }));
      // eyes on stalks
      [
        [x + 12, y + 8],
        [x + 20, y + 8],
      ].forEach(([a, b]) => {
        M()
          .rect(a, b + 2, 2, 6)
          .paint(g, C, { ink: INK });
        M()
          .oval(a + 1, b + 1, 2, 2)
          .paint(g, R('#1a1414'), { ink: INK });
        p(g, a, b, '#ffffff');
      });
      r(g, x + 13, y + 23, 7, 1, INK);
      [x + 14, x + 16, x + 18].forEach(c => p(g, c, y + 24, '#f0c8a8'));
    },
    saltback: (g, x, y) => {
      shadow(g, x + 24, y + 45, 20, 3);
      B.crabBig(g, x, y, '#b8704a');
      // salt crusted on its back: white crystals, a blue-white glint
      for (let i = 0; i < 16; i++) {
        const a = x + 12 + ((i * 37) % 24),
          b = y + 22 + ((i * 17) % 10);
        PX.rows(g, a, b, ['.w.', 'wbw'], { w: '#f4f0e8', b: '#c8d8e8' });
      }
    },
    crabBig: (g, x, y, col) => {
      const C = R(col);
      for (let i = 0; i < 3; i++) {
        M()
          .line(x + 13 - i * 2, y + 32 + i * 2, x + 2 - i, y + 40 + i, 3)
          .paint(g, C, o);
        M()
          .line(x + 35 + i * 2, y + 32 + i * 2, x + 46 + i, y + 40 + i, 3)
          .paint(g, C, o);
      }
      [
        [x + 6, y + 16, -1],
        [x + 42, y + 16, 1],
      ].forEach(([a, b, d]) => {
        M()
          .line(a - d * 4, b + 16, a, b + 4, 4)
          .paint(g, C, o);
        M()
          .oval(a, b, 7, 6)
          .rows(a - 6, b - 14, [
            '.ooo.....ooo.',
            'oooo.....oooo',
            'ooo.......ooo',
            'ooo.......ooo',
            'oooo.....oooo',
            '.oooo...oooo.',
            '..ooooooooo..',
          ])
          .paint(g, C, o);
        p(g, a - 4, b - 13, C.h);
        p(g, a + 4, b - 13, C.h);
      });
      const sh = M().oval(x + 24, y + 30, 17, 11);
      for (let i = 0; i < 9; i++) sh.rows(x + 8 + i * 4, y + 17 - (i % 2) * 2, ['.o.', 'ooo']);
      sh.paint(g, C, o);
      [
        [x + 16, y + 26],
        [x + 24, y + 23],
        [x + 32, y + 26],
      ].forEach(([a, b]) => PX.rows(g, a - 2, b, ['lllll', '.ddd.'], { l: C.h, d: C.d }));
      [
        [x + 18, y + 12],
        [x + 28, y + 12],
      ].forEach(([a, b]) => {
        M()
          .rect(a, b + 3, 3, 8)
          .paint(g, C, { ink: INK });
        M()
          .oval(a + 1, b + 1, 3, 3)
          .paint(g, R('#1a1414'), { ink: INK });
        r(g, a, b, 2, 1, '#ffffff');
      });
      r(g, x + 19, y + 37, 11, 1, INK);
    },
    oldShell: (g, x, y) => {
      // 64 wide: a back the size of a pan, rising out of the salt, crusted and barnacled, two eyes at the rim
      const C = R('#a07a62');
      M()
        .oval(x + 32, y + 22, 31, 15)
        .paint(g, C, { ...o, t: 0.72 });
      for (let i = 0; i < 6; i++) PX.line(g, x + 8 + i * 10, y + 10, x + 4 + i * 11, y + 34, C.d);
      for (let i = 0; i < 26; i++) {
        const a = x + 8 + ((i * 41) % 48),
          b = y + 10 + ((i * 23) % 18);
        PX.rows(g, a, b, ['.w.', 'wbw'], { w: '#f4f0e8', b: '#c8d8e8' });
      }
      [
        [x + 20, y + 14],
        [x + 42, y + 18],
        [x + 30, y + 26],
      ].forEach(([a, b]) => {
        M().oval(a, b, 3, 2).paint(g, R('#d8d0c0'), { hi: 1, ink: INK });
        p(g, a, b, INK);
      });
      for (let xx = x - 2; xx < x + 66; xx += 3) r(g, xx, y + 32 + ((xx >> 2) % 3), 3, 6, '#ece8de');
      eye(g, x + 14, y + 30, '#ff5a20', 1);
      eye(g, x + 46, y + 30, '#ff5a20', 1);
    },
    stinger: (g, x, y) => {
      shadow(g, x + 16, y + 30, 8, 2);
      const Y = R('#e0b030'),
        K = R('#2a2018'),
        Wg = {
          o: '#5a6a7a',
          d: 'rgba(170,200,230,0.45)',
          m: 'rgba(200,225,245,0.55)',
          l: 'rgba(230,245,255,0.7)',
          h: '#ffffff',
        };
      // wings spread wide, see-through, veined
      M()
        .oval(x + 7, y + 7, 7, 5)
        .paint(g, Wg, { ink: '#4a5a6a', hi: 1 });
      M()
        .oval(x + 25, y + 7, 7, 5)
        .paint(g, Wg, { ink: '#4a5a6a', hi: 1 });
      PX.line(g, x + 3, y + 6, x + 12, y + 9, '#7a8a9a');
      PX.line(g, x + 29, y + 6, x + 20, y + 9, '#7a8a9a');
      // a striped sting hanging down, and dangling legs
      const ab = M()
        .oval(x + 16, y + 19, 5, 7)
        .paint(g, Y, o);
      [y + 15, y + 19, y + 23].forEach(b => r(g, x + 12, b, 9, 2, K.m));
      M()
        .rows(x + 15, y + 26, ['ooo', '.o.', '.o.'])
        .paint(g, K, { ink: INK });
      [
        [-1, 10],
        [1, 10],
        [-1, 13],
        [1, 13],
      ].forEach(([d, b]) => PX.line(g, x + 16 + d * 3, y + b, x + 16 + d * 8, y + b + 6, INK));
      // fuzzy thorax, a head with huge red compound eyes and mandibles
      const th = M()
        .oval(x + 16, y + 11, 5, 4)
        .paint(g, R('#8a6a2a'), o);
      fur(g, th, R('#8a6a2a'), 0.25, 5);
      M()
        .oval(x + 16, y + 6, 5, 4)
        .paint(g, Y, o);
      [
        [x + 12, y + 5],
        [x + 20, y + 5],
      ].forEach(([a, b]) => {
        M().oval(a, b, 2, 3).paint(g, R('#c82a2a'), { hi: 1, ink: INK });
        p(g, a - 1, b - 1, '#ffd0c0');
      });
      PX.line(g, x + 14, y + 10, x + 13, y + 12, INK);
      PX.line(g, x + 18, y + 10, x + 19, y + 12, INK);
      PX.line(g, x + 14, y + 2, x + 11, y - 2, INK);
      PX.line(g, x + 18, y + 2, x + 21, y - 2, INK);
    },
    hound: (g, x, y) => {
      shadow(g, x + 16, y + 30, 11, 2);
      const F = R('#6e6258');
      // front legs, straight and bony, black claws
      [
        [x + 10, y + 21],
        [x + 19, y + 21],
      ].forEach(([a, b]) => {
        M().rect(a, b, 4, 9).paint(g, F, o);
        [a, a + 2].forEach(c => r(g, c, b + 9, 1, 2, INK));
      });
      // the chest, ribs showing through mange
      const ch = M()
        .oval(x + 16, y + 19, 8, 6)
        .paint(g, F, o);
      fur(g, ch, F, 0.1, 9);
      [y + 17, y + 19, y + 21].forEach(b => {
        r(g, x + 12, b, 3, 1, F.d);
        r(g, x + 18, b, 3, 1, F.d);
      });
      // a ragged ruff of fur round the neck
      M()
        .rows(x + 6, y + 10, ['o.o.o.o.o.o.o.o.o.o', 'ooooooooooooooooooo', '.ooooooooooooooooo.'])
        .paint(g, R('#5a4e44'), { ink: INK });
      // the head: long ears back, a long muzzle, a snarl full of teeth
      [
        [x + 7, y + 4],
        [x + 25, y + 4],
      ].forEach(([a, b], i) =>
        M()
          .rows(
            a - 4,
            b,
            i ? ['......oo', '...ooooo', '.oooooo.', 'ooooo...'] : ['oo......', 'ooooo...', '.oooooo.', '...ooooo'],
          )
          .paint(g, F, o),
      );
      const hd = M()
        .oval(x + 16, y + 9, 8, 6)
        .paint(g, F, o);
      fur(g, hd, F, 0.1, 4);
      eye(g, x + 11, y + 8, '#ffb020');
      eye(g, x + 19, y + 8, '#ffb020');
      r(g, x + 13, y + 6, 6, 1, F.o);
      M()
        .oval(x + 16, y + 14, 5, 5)
        .paint(g, R('#8a7a6e'), { hi: 1, ink: INK });
      M()
        .oval(x + 16, y + 11, 2, 1)
        .paint(g, R('#1a1414'), { ink: INK });
      p(g, x + 15, y + 10, '#8a8a8a');
      r(g, x + 12, y + 15, 9, 2, '#3a1414');
      r(g, x + 15, y + 17, 3, 2, '#c84a5a');
      [x + 12, x + 14, x + 18, x + 20].forEach(c => p(g, c, y + 15, '#f0ead8'));
      [x + 13, x + 19].forEach(c => r(g, c, y + 16, 1, 2, '#f0ead8'));
    },
    alpha: (g, x, y) => {
      shadow(g, x + 24, y + 45, 18, 3);
      const F = R('#5a4e46');
      [
        [x + 14, y + 30],
        [x + 29, y + 30],
      ].forEach(([a, b]) => {
        M().rect(a, b, 6, 14).paint(g, F, o);
        [a, a + 2, a + 4].forEach(c => r(g, c, b + 14, 1, 3, INK));
      });
      const ch = M()
        .oval(x + 24, y + 28, 13, 9)
        .paint(g, F, o);
      fur(g, ch, F, 0.12, 21);
      [y + 25, y + 28, y + 31].forEach(b => {
        r(g, x + 17, b, 5, 1, F.d);
        r(g, x + 27, b, 5, 1, F.d);
      });
      // a collar of Molar teeth on a chain, scars
      for (let i = 0; i < 9; i++)
        M()
          .rows(x + 11 + i * 3, y + 21 + Math.round(Math.sin((i / 8) * Math.PI) * 3), ['oo', 'o.'])
          .paint(g, R('#efe6d0'), { ink: INK });
      M()
        .rows(x + 6, y + 12, [
          'o..o..o..o..o..o..o..o..o..o..o..o..o',
          'ooooooooooooooooooooooooooooooooooooo',
          '.ooooooooooooooooooooooooooooooooooo.',
        ])
        .paint(g, R('#4a4038'), { ink: INK });
      [
        [x + 10, y + 5],
        [x + 38, y + 5],
      ].forEach(([a, b], i) =>
        M()
          .rows(
            a - 6,
            b,
            i
              ? ['.........ooo', '.....ooooooo', '..ooooooooo.', 'oooooooo....']
              : ['ooo.........', 'ooooooo.....', '.ooooooooo..', '....oooooooo'],
          )
          .paint(g, F, o),
      );
      const hd = M()
        .oval(x + 24, y + 13, 13, 9)
        .paint(g, F, o);
      fur(g, hd, F, 0.12, 8);
      eye(g, x + 16, y + 11, '#ff9020', 1);
      eye(g, x + 29, y + 11, '#ff9020', 1);
      PX.line(g, x + 30, y + 5, x + 34, y + 15, F.h);
      PX.line(g, x + 31, y + 5, x + 35, y + 15, F.d);
      M()
        .oval(x + 24, y + 20, 8, 6)
        .paint(g, R('#7a6c62'), { hi: 1, ink: INK });
      M()
        .oval(x + 24, y + 15, 3, 2)
        .paint(g, R('#1a1414'), { ink: INK });
      p(g, x + 23, y + 14, '#8a8a8a');
      r(g, x + 17, y + 21, 15, 3, '#3a1414');
      for (let c = x + 17; c < x + 32; c += 2) p(g, c, y + 21, '#f4eedc');
      [x + 18, x + 30].forEach(c => r(g, c, y + 22, 1, 3, '#f4eedc'));
      p(g, x + 24, y + 26, '#c84040');
      p(g, x + 24, y + 27, '#a02020');
    },
  };
  return B;
})();
