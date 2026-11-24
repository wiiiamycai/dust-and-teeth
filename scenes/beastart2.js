'use strict';
// ================= MORE BEASTS, for the battle screen (v9.32) =================
// The approved beast style (scenes/beastart.js): facing you, a big head, a thick outline, glowing eyes, texture.
// The road and the gully have beasts the lost towns don't: lizards, vultures, rad-moles and snakes, cows.
Object.assign(
  BEAST,
  (() => {
    const R = PX.ramp,
      INK = '#1a0e0a',
      M = () => PX.mask(),
      o = { hi: 1, ink: INK, t: 0.68 },
      p = (g, x, y, c) => PX.p(g, x, y, c),
      r = (g, x, y, w, h, c) => PX.r(g, x, y, w, h, c);
    const shadow = (g, cx, cy, rx, ry) => {
      g.fillStyle = 'rgba(40,20,10,0.35)';
      for (let j = -ry; j <= ry; j++) {
        const k = Math.round(rx * Math.sqrt(1 - (j * j) / (ry * ry)));
        g.fillRect(cx - k, cy + j, k * 2 + 1, 1);
      }
    };
    const eye = (g, x, y, c = '#ff3a20') => {
      r(g, x - 1, y - 1, 4, 3, INK);
      r(g, x, y, 2, 1, c);
      p(g, x, y, '#fff0b0');
      g.fillStyle = 'rgba(255,80,40,0.25)';
      g.fillRect(x - 2, y - 2, 6, 5);
    };
    const dots = (g, m, c, n, seed) => {
      let s = seed;
      m.each((x, y) => {
        s = (s * 9301 + 49297) % 233280;
        if (s / 233280 < n) p(g, x, y, c);
      });
    };
    return {
      // a gully lizard: flat and wide, a frill, a split tongue
      lizard: (g, x, y) => {
        shadow(g, x + 16, y + 29, 13, 2);
        const C = R('#7a8a4a'),
          Bl = R('#c8b070');
        M()
          .line(x + 25, y + 25, x + 31, y + 18, 2)
          .line(x + 31, y + 18, x + 30, y + 12, 1)
          .paint(g, C, o);
        [
          [x + 5, y + 26],
          [x + 27, y + 26],
          [x + 8, y + 20],
          [x + 24, y + 20],
        ].forEach(([a, b]) => M().oval(a, b, 3, 2).paint(g, C, o));
        const body = M()
          .oval(x + 16, y + 22, 10, 6)
          .paint(g, C, o);
        dots(g, body, C.d, 0.18, 5);
        M()
          .oval(x + 16, y + 24, 5, 3)
          .paint(g, Bl, { ink: INK });
        // the frill, spread behind the head
        M()
          .rows(x + 4, y + 4, ['o.o.o.o.o.o.o.o.o.o.o.o.o', 'ooooooooooooooooooooooooo', '.ooooooooooooooooooooooo.'])
          .paint(g, R('#c85a3a'), o);
        const head = M()
          .oval(x + 16, y + 13, 9, 6)
          .paint(g, C, o);
        dots(g, head, C.l, 0.15, 9);
        eye(g, x + 10, y + 11, '#ffd030');
        eye(g, x + 20, y + 11, '#ffd030');
        r(g, x + 11, y + 17, 10, 1, INK);
        PX.line(g, x + 16, y + 18, x + 16, y + 22, '#e04060');
        p(g, x + 15, y + 22, '#e04060');
        p(g, x + 17, y + 22, '#e04060');
      },
      // a bone-picker: a bald, hunched vulture, wings half open
      bird: (g, x, y) => {
        shadow(g, x + 16, y + 30, 11, 2);
        const F = R('#4a3a34'),
          Sk = R('#d0906a');
        [
          [x + 2, y + 14, 1],
          [x + 30, y + 14, -1],
        ].forEach(([a, b, d]) =>
          M()
            .rows(
              d > 0 ? a : a - 9,
              b,
              d > 0
                ? ['oooooooo..', 'ooooooooo.', '.ooooooooo', '..oooooooo', '...oooooo.', '....oooo..']
                : ['..oooooooo', '.ooooooooo', 'ooooooooo.', 'oooooooo..', '.oooooo...', '..oooo....'],
            )
            .paint(g, F, o),
        );
        const body = M()
          .oval(x + 16, y + 20, 8, 8)
          .paint(g, F, o);
        dots(g, body, F.l, 0.12, 4);
        M()
          .oval(x + 16, y + 13, 6, 2)
          .paint(g, R('#d8ccb8'), { ink: INK }); // the ruff
        M()
          .oval(x + 16, y + 8, 5, 5)
          .paint(g, Sk, o);
        eye(g, x + 13, y + 7);
        eye(g, x + 18, y + 7);
        M()
          .rows(x + 14, y + 10, ['oooo', '.oo.', '.o..'])
          .paint(g, R('#e8d070'), { ink: INK });
        [x + 12, x + 19].forEach(a => [a, a + 2].forEach(c => r(g, c, y + 28, 1, 2, '#e8c070')));
      },
      // a rad-mole or a snake: a fat grub-pink body, out of a hole, all teeth
      worm: (g, x, y) => {
        shadow(g, x + 16, y + 29, 13, 3);
        M()
          .oval(x + 16, y + 28, 12, 3)
          .paint(g, R('#3a2a1e'), { line: false });
        const C = R('#c88a7a');
        const body = M()
          .oval(x + 16, y + 22, 7, 7)
          .oval(x + 16, y + 13, 8, 7)
          .paint(g, C, o);
        for (let yy = y + 9; yy < y + 28; yy += 3) PX.line(g, x + 10, yy, x + 22, yy, C.d);
        dots(g, body, '#8ae05a', 0.03, 7);
        // the mouth: a ring of teeth
        M()
          .oval(x + 16, y + 11, 5, 4)
          .paint(g, R('#3a1010'), { ink: INK });
        for (let a = 0; a < 8; a++)
          p(g, x + 16 + Math.round(Math.cos(a * 0.785) * 4), y + 11 + Math.round(Math.sin(a * 0.785) * 3), '#f4ecd8');
        eye(g, x + 9, y + 9);
        eye(g, x + 21, y + 9);
      },
      // a two-headed cow, thin, with a bell
      cow: (g, x, y) => {
        shadow(g, x + 16, y + 30, 14, 2);
        const C = R('#b89a7a'),
          Bk = R('#3a2a22');
        [x + 8, x + 13, x + 19, x + 24].forEach(a =>
          M()
            .rect(a, y + 22, 3, 8)
            .paint(g, C, o),
        );
        const body = M()
          .oval(x + 16, y + 19, 12, 7)
          .paint(g, C, o);
        [
          [x + 10, y + 18],
          [x + 21, y + 21],
        ].forEach(([a, b]) => M().oval(a, b, 3, 2).paint(g, Bk, { line: false }));
        dots(g, body, C.d, 0.06, 3);
        [
          [x + 8, y + 8],
          [x + 24, y + 8],
        ].forEach(([a, b], i) => {
          M().oval(a, b, 5, 5).paint(g, C, o);
          M()
            .rows(a - 6, b - 6, ['o...........o', '.o.........o.'])
            .paint(g, R('#e8dcc0'), { ink: INK });
          eye(g, a - 3, b - 1);
          eye(g, a + 1, b - 1);
          M()
            .oval(a, b + 4, 3, 2)
            .paint(g, R('#d89a8a'), { ink: INK });
        });
        M()
          .oval(x + 16, y + 15, 2, 2)
          .paint(g, R('#c8a040'), { ink: INK });
      },
    };
  })(),
);
