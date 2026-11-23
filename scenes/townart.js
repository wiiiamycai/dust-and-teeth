'use strict';
// ================= THE WORLD MAP: each place drawn as itself (v8.0) =================
// Will: "the world map should have its own graphics and a unique design for each town that represents them."
// Each place on the valley map gets its own little picture, 48 x 32 pixels over its 3 x 2 tiles, in the same
// outlined, shaded style as the rest (scenes/walkart.js). Looks only.
const TA = {
  // helpers: a filled box with an ink outline, and a plain rect
  box(g, x, y, w, h, c, hi) {
    g.fillStyle = GP.ink;
    g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
    if (hi) {
      g.fillStyle = hi;
      g.fillRect(x, y, w, 1);
    }
  },
  r(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  },
  shadow(g, x, y, w) {
    g.fillStyle = 'rgba(60,30,10,0.25)';
    g.fillRect(x, y, w, 2);
  },
  house(g, x, y, w, roof) {
    TA.shadow(g, x, y + 13, w);
    TA.box(g, x, y, w, 5, roof || GP.roof, GP.roofHi);
    TA.box(g, x, y + 6, w, 7, GP.wall, GP.wallHi);
    TA.r(g, x + Math.floor(w / 2) - 1, y + 9, 3, 4, GP.wood);
  },
};
const TOWNART = {
  scrapwell: g => {
    TA.house(g, 3, 6, 12, '#9a9a90');
    TA.house(g, 31, 4, 13, '#8a8a80');
    TA.house(g, 17, 1, 10, '#a09a8a');
    // the well, in front
    TA.box(g, 20, 20, 9, 6, GP.rock, GP.rockHi);
    TA.r(g, 22, 21, 5, 3, GP.waterLo);
    TA.r(g, 19, 15, 1, 6, GP.wood);
    TA.r(g, 29, 15, 1, 6, GP.wood);
    TA.r(g, 19, 15, 11, 1, GP.wood);
    // a goat
    TA.box(g, 37, 22, 5, 3, '#e8e0d0');
    TA.r(g, 42, 21, 2, 2, '#e8e0d0');
  },
  farm: g => {
    // crop rows
    for (let i = 0; i < 4; i++) TA.r(g, 2, 3 + i * 4, 22, 2, i % 2 ? GP.scrub : GP.scrubLo);
    // the red barn
    TA.shadow(g, 26, 24, 20);
    TA.box(g, 27, 4, 18, 7, '#b0402a', '#d05a3a');
    TA.box(g, 27, 12, 18, 12, '#c04a30', '#d86040');
    TA.r(g, 33, 15, 6, 9, GP.ink);
    TA.r(g, 34, 16, 4, 8, '#e8cfa4');
    TA.r(g, 35, 16, 2, 8, '#c04a30');
    // fence
    for (let x = 2; x < 25; x += 4) TA.r(g, x, 21, 1, 5, GP.wood);
    TA.r(g, 2, 22, 23, 1, GP.woodHi);
  },
  diner: g => {
    TA.shadow(g, 3, 24, 42);
    TA.box(g, 4, 10, 40, 5, '#c8d4e8', '#e4ecf4');
    TA.box(g, 4, 16, 40, 8, '#e8cfa4', GP.wallHi);
    for (let x = 8; x < 40; x += 7) TA.r(g, x, 18, 4, 3, GP.glass);
    TA.r(g, 22, 18, 4, 6, GP.wood);
    // the sign on a pole, with a pot on it
    TA.r(g, 38, 1, 1, 9, GP.ink);
    TA.box(g, 31, 1, 12, 7, '#e05a3a');
    TA.box(g, 34, 3, 6, 3, GP.ink);
    TA.r(g, 33, 3, 1, 1, GP.ink);
    TA.r(g, 40, 3, 1, 1, GP.ink);
  },
  rustwater: g => {
    // the water tower
    TA.r(g, 6, 12, 1, 12, GP.ink);
    TA.r(g, 15, 12, 1, 12, GP.ink);
    TA.r(g, 6, 18, 10, 1, GP.ink);
    TA.box(g, 4, 3, 14, 9, '#6a8aa8', '#8aaac8');
    TA.r(g, 5, 7, 12, 1, '#4a6a88');
    // houses
    TA.house(g, 22, 4, 10);
    TA.house(g, 34, 8, 11);
    TA.house(g, 22, 17, 9, '#a06838');
    // the pump
    TA.box(g, 37, 23, 3, 6, GP.rockLo);
    TA.r(g, 40, 24, 3, 1, GP.ink);
    TA.r(g, 41, 27, 2, 2, GP.waterHi);
  },
  chainfield: g => {
    // trolley pens: a grid of thin wire
    for (const [px, py] of [
      [2, 4],
      [2, 17],
      [18, 17],
    ]) {
      TA.r(g, px, py, 14, 10, 'rgba(60,40,20,0.2)');
      for (let i = 0; i <= 14; i += 3) TA.r(g, px + i, py, 1, 10, '#8a8a90');
      for (let j = 0; j <= 10; j += 3) TA.r(g, px, py + j, 15, 1, '#8a8a90');
    }
    // Krug's tent
    TA.shadow(g, 30, 16, 16);
    g.fillStyle = GP.ink;
    g.beginPath();
    g.moveTo(37, 1);
    g.lineTo(46, 16);
    g.lineTo(28, 16);
    g.fill();
    g.fillStyle = '#8a6a4a';
    g.beginPath();
    g.moveTo(37, 3);
    g.lineTo(44, 15);
    g.lineTo(30, 15);
    g.fill();
    TA.r(g, 36, 9, 3, 6, GP.ink);
    // a chain
    for (let x = 18; x < 28; x += 3) TA.r(g, x, 10, 2, 1, '#b0b0b8');
  },
  skybus: g => {
    // the crashed plane: fuselage on its belly, a broken wing, the tail fin up
    TA.shadow(g, 3, 24, 42);
    TA.box(g, 4, 14, 38, 9, '#d8d8d0', '#f0f0e8');
    for (let x = 9; x < 38; x += 5) TA.r(g, x, 16, 3, 2, GP.glass);
    TA.r(g, 4, 20, 38, 1, '#a8a8a0');
    g.fillStyle = GP.ink;
    g.beginPath();
    g.moveTo(39, 14);
    g.lineTo(46, 2);
    g.lineTo(46, 14);
    g.fill();
    g.fillStyle = '#c04a30';
    g.beginPath();
    g.moveTo(41, 13);
    g.lineTo(45, 5);
    g.lineTo(45, 13);
    g.fill();
    TA.box(g, 14, 23, 16, 3, '#b8b8b0');
    TA.r(g, 2, 15, 4, 7, GP.rockLo); // the nose, broken off and buried
    // the moving sand round it
    for (let x = 6; x < 44; x += 7) TA.r(g, x, 28, 3, 1, GP.sandLo);
  },
  silo: g => {
    TA.shadow(g, 10, 26, 28);
    g.fillStyle = GP.ink;
    g.beginPath();
    g.arc(24, 24, 15, Math.PI, 0);
    g.fill();
    g.fillStyle = '#9a9a92';
    g.beginPath();
    g.arc(24, 24, 13, Math.PI, 0);
    g.fill();
    TA.r(g, 13, 16, 22, 1, '#b8b8b0');
    TA.r(g, 21, 18, 6, 6, GP.ink);
    TA.r(g, 22, 19, 4, 5, '#d8d020');
    // the poles, each topped with teeth
    for (const x of [3, 9, 39, 45]) {
      TA.r(g, x, 8, 1, 18, GP.wood);
      TA.r(g, x - 1, 6, 3, 3, '#f8f4e0');
    }
  },
  snakeeyes: g => {
    TA.shadow(g, 3, 27, 42);
    TA.box(g, 4, 13, 40, 13, '#7a3a6a', '#9a5a8a');
    for (let x = 8; x < 40; x += 6) TA.r(g, x, 17, 3, 4, '#f0d040');
    TA.r(g, 21, 20, 6, 6, GP.ink);
    // the giant dice on the roof: one showing a one, one showing a one. Snake eyes.
    for (const [dx, dy] of [
      [12, 2],
      [27, 3],
    ]) {
      TA.box(g, dx, dy, 9, 9, '#f8f4e0');
      TA.r(g, dx + 4, dy + 4, 2, 2, '#c02020');
    }
  },
  mall: g => {
    // a big box store sinking into its lake
    TA.r(g, 0, 22, 48, 10, GP.water);
    for (let x = 2; x < 46; x += 6) TA.r(g, x, 24, 3, 1, GP.waterHi);
    TA.box(g, 6, 4, 36, 19, '#b8a890', '#d0c0a8');
    TA.r(g, 6, 18, 36, 5, '#5a7ab0'); // the water line inside the windows
    for (let x = 9; x < 40; x += 8) TA.r(g, x, 9, 5, 6, '#3a3a48');
    TA.box(g, 12, 1, 24, 4, '#e05a3a');
    TA.r(g, 15, 2, 18, 2, '#f8f4e0');
  },
  green: g => {
    // a glass dome, green inside, a wall and a gate
    TA.r(g, 0, 25, 48, 3, GP.rockLo);
    TA.r(g, 21, 23, 6, 5, GP.wood);
    g.fillStyle = GP.ink;
    g.beginPath();
    g.arc(24, 24, 20, Math.PI, 0);
    g.fill();
    g.fillStyle = '#a8dcd0';
    g.beginPath();
    g.arc(24, 24, 18, Math.PI, 0);
    g.fill();
    for (let i = 0; i < 6; i++) {
      TA.r(g, 9 + i * 5, 15 + (i % 2) * 2, 4, 8, '#4a9a3a');
      TA.r(g, 10 + i * 5, 15 + (i % 2) * 2, 2, 2, '#7aca5a');
    }
    TA.r(g, 14, 9, 6, 2, '#e8f8f4');
    TA.r(g, 24, 6, 1, 18, 'rgba(255,255,255,0.4)');
  },
  gully: g => {
    // a dry gully: two rock walls, a lean-to, a skull on a post and a lizard on a rock
    TA.shadow(g, 2, 27, 44);
    for (const [x, y, w, h] of [
      [1, 10, 14, 17],
      [33, 8, 14, 19],
    ]) {
      TA.box(g, x, y, w, h, GP.rock, GP.rockHi);
      TA.r(g, x + 2, y + 5, w - 4, 2, GP.rockLo);
      TA.r(g, x + 3, y + 11, w - 6, 2, GP.rockLo);
    }
    TA.r(g, 16, 22, 16, 5, GP.sandLo);
    // the hunters' lean-to
    TA.box(g, 17, 12, 13, 3, '#8a8a80', '#b0b0a4');
    TA.r(g, 18, 15, 1, 8, GP.wood);
    TA.r(g, 28, 15, 1, 8, GP.wood);
    TA.r(g, 20, 17, 6, 4, '#a87a4a');
    // a skull on a post
    TA.r(g, 12, 3, 1, 8, GP.wood);
    TA.box(g, 10, 1, 5, 4, '#e8e0d0');
    TA.r(g, 11, 2, 1, 1, GP.ink);
    TA.r(g, 13, 2, 1, 1, GP.ink);
    // the lizard sunning itself
    TA.r(g, 36, 6, 8, 2, '#7a9a3a');
    TA.r(g, 43, 5, 2, 2, '#7a9a3a');
    TA.r(g, 33, 7, 3, 1, '#7a9a3a');
    TA.r(g, 44, 5, 1, 1, GP.ink);
  },
  gristmill: g => {
    // a windmill with its sails, and grain sacks
    TA.shadow(g, 14, 27, 20);
    g.fillStyle = GP.ink;
    g.beginPath();
    g.moveTo(17, 27);
    g.lineTo(20, 9);
    g.lineTo(28, 9);
    g.lineTo(31, 27);
    g.fill();
    g.fillStyle = '#c8b090';
    g.beginPath();
    g.moveTo(19, 26);
    g.lineTo(21, 10);
    g.lineTo(27, 10);
    g.lineTo(29, 26);
    g.fill();
    TA.r(g, 22, 20, 4, 6, GP.wood);
    g.strokeStyle = GP.ink;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(10, 1);
    g.lineTo(38, 17);
    g.moveTo(38, 1);
    g.lineTo(10, 17);
    g.stroke();
    TA.box(g, 22, 7, 4, 4, GP.wood);
    for (const x of [4, 9, 37, 42]) TA.box(g, x, 22, 4, 5, '#d8c090');
  },
  saltpan: g => {
    // white pans, and a boiling shed with smoke
    for (const [x, y] of [
      [2, 3],
      [16, 3],
      [2, 15],
      [16, 15],
    ])
      TA.box(g, x, y, 12, 9, '#f8f8f0', '#ffffff');
    TA.house(g, 32, 8, 13, '#8a8a80');
    TA.r(g, 37, 1, 3, 6, 'rgba(200,200,200,0.7)');
    // a crab, the size of a cart
    TA.box(g, 31, 24, 8, 4, '#c4583a');
    TA.r(g, 29, 22, 2, 2, '#c4583a');
    TA.r(g, 39, 22, 2, 2, '#c4583a');
  },
  kettle: g => {
    // a tall water tower with a hive on it, and stingers round it
    TA.r(g, 15, 12, 1, 15, GP.ink);
    TA.r(g, 27, 12, 1, 15, GP.ink);
    TA.r(g, 15, 19, 13, 1, GP.ink);
    TA.box(g, 12, 2, 19, 10, '#6a8aa8', '#8aaac8');
    TA.box(g, 25, 6, 9, 9, '#d8a030');
    TA.r(g, 27, 9, 5, 1, '#8a6010');
    TA.r(g, 27, 12, 5, 1, '#8a6010');
    for (const [x, y] of [
      [37, 4],
      [41, 9],
      [36, 13],
      [6, 7],
    ]) {
      TA.r(g, x, y, 2, 2, '#f0c040');
      TA.r(g, x, y + 1, 2, 1, GP.ink);
    }
    TA.house(g, 34, 18, 11, '#8a8a80');
  },
  fanghill: g => {
    // a hill, a stockade, bones
    g.fillStyle = GP.ink;
    g.beginPath();
    g.arc(24, 30, 22, Math.PI, 0);
    g.fill();
    g.fillStyle = '#b09a70';
    g.beginPath();
    g.arc(24, 30, 20, Math.PI, 0);
    g.fill();
    for (let x = 8; x < 40; x += 3) TA.r(g, x, 12, 2, 8, GP.wood);
    TA.r(g, 8, 12, 32, 1, GP.woodLo);
    for (const [x, y] of [
      [6, 24],
      [18, 25],
      [33, 23],
      [40, 26],
    ]) {
      TA.r(g, x, y, 5, 1, '#f8f4e0');
      TA.r(g, x - 1, y - 1, 1, 3, '#f8f4e0');
      TA.r(g, x + 5, y - 1, 1, 3, '#f8f4e0');
    }
  },
};
// Paint every place's picture onto the valley map, once, when it's drawn.
function valleyIcons(bg) {
  for (const k in LOC) {
    if (LOC[k].sub || !onMap(k) || !TOWNART[k]) continue;
    const x = (vx(LOC[k]) - 1) * TILE,
      y = (vy(LOC[k]) - 1) * TILE;
    bg.save();
    bg.translate(x, y);
    try {
      if (S.crater[k]) {
        // a crater instead: glowing, and nothing else
        bg.fillStyle = '#3a2a1c';
        bg.beginPath();
        bg.ellipse(24, 18, 22, 13, 0, 0, Math.PI * 2);
        bg.fill();
        bg.fillStyle = '#7ac83a';
        bg.beginPath();
        bg.ellipse(24, 18, 12, 6, 0, 0, Math.PI * 2);
        bg.fill();
      } else TOWNART[k](bg);
    } catch (e) {}
    bg.restore();
  }
}
