'use strict';
// ================= ENDING SLIDES: a pixel painting for each one =================
// Will: "actual pixel art for endings, much like Fallout 2." One place or person per slide, each with its own
// picture: a 192 x 108 pixel scene painted in code, blown up with hard edges. The picture is picked from the words
// on the slide (the game is over by then, so there's no state to read). People the slide names stand in it, drawn
// from their own sprites. Looks only: no canvas, no pictures, and nothing about the game changes.
const EW = 192,
  EH = 108,
  HZ = 70; // the horizon line
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function eRand(seed) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
const eR = (g, x, y, w, h, c) => {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
// Ordered dither: mix two colours in a block, t of the pixels in b.
function eDither(g, x0, y0, w, h, a, b, t) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) eR(g, x, y, 1, 1, BAYER[(y & 3) * 4 + (x & 3)] / 16 < t ? b : a);
}
// A sky in bands, dithered where they meet.
function eSky(g, cols, to) {
  const n = cols.length - 1,
    band = to / n;
  for (let i = 0; i < n; i++) {
    const y = Math.round(i * band),
      hh = Math.round(band);
    eR(g, 0, y, EW, hh, cols[i]);
    eDither(g, 0, y + hh - 4, EW, 4, cols[i], cols[i + 1], 0.5);
  }
}
function eSun(g, x, y, r, c, haze) {
  for (let yy = -r; yy <= r; yy++) {
    const w = Math.round(Math.sqrt(r * r - yy * yy));
    if ((yy + r) % 4 === 3 && yy > 0) continue; // bands of haze through the bottom
    eR(g, x - w, y + yy, w * 2, 1, c);
  }
  if (haze)
    for (let yy = -r - 4; yy <= r + 4; yy++) {
      const w = Math.round(Math.sqrt((r + 4) * (r + 4) - yy * yy)),
        w2 = Math.abs(yy) <= r ? Math.round(Math.sqrt(r * r - yy * yy)) : 0;
      eR(g, x - w, y + yy, w - w2, 1, 'rgba(255,170,80,0.22)');
      eR(g, x + w2, y + yy, w - w2, 1, 'rgba(255,170,80,0.22)');
    }
}
function eGround(g, top, a, b) {
  eR(g, 0, top, EW, EH - top, a);
  eDither(g, 0, top, EW, 6, a, b, 0.35);
  eDither(g, 0, top + 18, EW, EH - top - 18, a, b, 0.25);
}
function eMesas(g, r, y, c, n) {
  let x = -10;
  while (x < EW) {
    const w = 12 + r() * 30,
      h = 3 + r() * 10;
    eR(g, x + 2, y - h, w, h, c);
    eR(g, x, y - h + 2, w + 4, h - 2, c);
    x += w + 6 + (r() * 30) / n;
  }
}
// A person from data/sprites.js, standing with their feet at (x, y).
function eSprite(g, id, x, y, flip) {
  if (!SNPC[id]) return;
  const px = sprPixels(sprLetters(SNPC[id]), 32, SNPC[id].pal);
  eR(g, x - 1, y - 1, 18, 2, 'rgba(0,0,0,0.45)');
  for (let yy = 0; yy < 32; yy++)
    for (let xx = 0; xx < SW; xx++) {
      const c = px[yy * SW + (flip ? SW - 1 - xx : xx)];
      if (c) eR(g, x + xx, y - 32 + yy, 1, 1, c);
    }
}
function eShack(g, x, y, w, h, c, roof) {
  eR(g, x, y - h, w, h, c);
  eR(g, x - 2, y - h - 3, w + 4, 3, roof);
  eR(g, x + w / 2 - 2, y - 7, 4, 7, '#1a120c');
  eDither(g, x, y - h, w, h, c, '#2a1e14', 0.15);
}
function eStar(g, x, y, c) {
  eR(g, x, y - 2, 1, 5, c);
  eR(g, x - 2, y, 5, 1, c);
  eR(g, x - 1, y - 1, 3, 3, c);
}

// ---- the places ----
const DUSK = ['#160c12', '#3a1416', '#6a2418', '#a8441c', '#d8782a'];
const NIGHT = ['#06060e', '#0e0c1a', '#1a1424', '#2a1c26', '#3e2420'];
function eDesert(g, r, o) {
  o = o || {};
  eSky(g, o.sky || DUSK, HZ);
  if (o.sun !== false) eSun(g, o.sunX || 150, HZ - 10, 12, o.sunC || '#f0a040', 'rgba(255,190,90,1)');
  eMesas(g, r, HZ, '#3a1e14', 4);
  eMesas(g, r, HZ + 2, '#24120c', 6);
  eGround(g, HZ, o.ground || '#5a3e24', '#3a2616');
}
function eDisc(g, x, y, rr, c) {
  for (let yy = -rr; yy <= rr; yy++) {
    const w = Math.round(Math.sqrt(rr * rr - yy * yy));
    eR(g, x - w, y + yy, w * 2, 1, c);
  }
}
function eGutmaw(g, r, withCrane) {
  eDesert(g, r, { sky: ['#12060a', '#300c10', '#5a1410', '#8a2414', '#b03c18'], sunX: 168, sunC: '#d06030' });
  const base = HZ + 14;
  // the body: a ringed arc out of the sand on the right, over, and down into the sand head first
  const P0 = [170, base + 4],
    P1 = [118, -18],
    P2 = [62, base - 4],
    pts = [];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26,
      u = 1 - t;
    pts.push([
      u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0],
      u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1],
      9 + t * 5,
    ]);
  }
  pts.forEach(([x, y, rr], i) => {
    eDisc(g, x, y + 2, rr, '#3a1c14'); // underside
    eDisc(g, x, y, rr, i % 2 ? '#8e5640' : '#7a4836');
    eDisc(g, x - 2, y - 3, Math.max(2, rr - 5), i % 2 ? '#a86a4e' : '#946048'); // light from the left
    if (i % 2 === 0)
      for (let k = -rr; k <= rr; k += 2) eR(g, x + k * 0.2 - 1, y - rr + Math.abs(k) * 0.9, 1, 1, '#3a1c16');
    if (i % 3 === 0) {
      // a spine along the top
      eR(g, x - 1, y - rr - 3, 2, 3, '#d8c8a8');
      eR(g, x, y - rr - 5, 1, 2, '#ece2c8');
    }
  });
  // the head, half in the sand, mouth open at you: rings of teeth
  const hx = 56,
    hy = base - 6;
  eDisc(g, hx, hy, 17, '#6a3a2a');
  eDisc(g, hx - 2, hy - 3, 13, '#7e4a34');
  eDisc(g, hx + 1, hy + 1, 12, '#2a0808');
  eDisc(g, hx + 1, hy + 2, 7, '#120202');
  for (const [rad, n, c] of [
    [11, 18, '#ece2c8'],
    [7, 12, '#c8b898'],
  ])
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2,
        tx = hx + 1 + Math.cos(a) * rad,
        ty = hy + 1 + Math.sin(a) * rad;
      eR(g, tx, ty, 2, 2, c);
      eR(g, tx + Math.cos(a) * -2, ty + Math.sin(a) * -2, 1, 1, c);
    }
  // sand bursting up at both ends, and the sand line over the buried parts
  for (let i = 0; i < 90; i++) {
    const end = i % 2 ? hx : 170;
    eR(g, end - 22 + r() * 44, base - r() * 22, 1 + (r() < 0.2), 1, r() < 0.5 ? '#b08a5a' : '#7a5a38');
  }
  eR(g, 30, base + 2, 60, 4, '#5a3e24');
  eR(g, 150, base + 4, 42, 4, '#5a3e24');
  eDither(g, 30, base, 60, 3, '#5a3e24', '#7a5a38', 0.4);
  if (withCrane) {
    // all that's left of her: hat, star and rifle on a patch of pale sand, and her tracks running to the mouth
    const x = 126,
      y = EH - 14;
    eR(g, x - 30, y - 6, 66, 14, '#7a6040');
    eDither(g, x - 34, y - 8, 74, 18, '#7a6040', '#5a3e24', 0.5);
    for (let i = 0; i < 9; i++) eR(g, x - 12 - i * 7, y - 3 - i * 1.4, 3, 1, '#3a2616');
    eR(g, x - 8, y, 22, 2, '#2e1e12'); // brim
    eR(g, x - 3, y - 6, 12, 6, '#4a3020'); // crown
    eR(g, x - 2, y - 7, 10, 1, '#5e3e28');
    eR(g, x - 3, y - 2, 12, 1, '#8a2a20'); // band
    eStar(g, x + 24, y + 1, '#ffb000');
    eR(g, x - 30, y + 5, 30, 1, '#1e140c'); // the rifle
    eR(g, x - 32, y + 4, 8, 3, '#6a4428');
  }
}
function eRustwater(g, r, who) {
  eDesert(g, r, { sunX: 40 });
  for (let i = 0; i < 6; i++) eShack(g, 8 + i * 30 + r() * 6, HZ + 6, 18 + r() * 8, 10 + r() * 8, '#5e4e3c', '#3e3226');
  // the pump: a water tower on stilts
  const x = 120;
  for (const dx of [0, 14]) eR(g, x + dx, HZ - 20, 2, 26, '#3a2e24');
  eR(g, x - 4, HZ - 34, 24, 14, '#6a5a44');
  eR(g, x - 6, HZ - 36, 28, 3, '#4a3e30');
  eR(g, x + 4, HZ - 28, 8, 1, '#2e4a48');
  if (who) eSprite(g, who, 96, HZ + 26);
}
function eChapel(g, r, toaster) {
  eSky(g, ['#120c08', '#1e160e', '#2a2014', '#362818', '#3e2e1c'], EH);
  for (let x = 0; x < EW; x += 12) eR(g, x, 0, 1, EH, '#160f08');
  // a window at the back, sunset through it
  eR(g, 84, 12, 24, 30, '#2a1a10');
  eDither(g, 86, 14, 20, 26, '#a8441c', '#d8782a', 0.5);
  eR(g, 95, 14, 2, 26, '#2a1a10');
  eR(g, 86, 26, 20, 2, '#2a1a10');
  // the altar and the Toaster
  eR(g, 66, 66, 60, 12, '#4a3220');
  eR(g, 64, 64, 64, 3, '#5e4028');
  if (toaster !== false) {
    eR(g, 88, 52, 16, 12, '#9a9890');
    eR(g, 89, 53, 14, 2, '#c8c6be');
    eR(g, 91, 50, 4, 2, '#c8a040');
    eR(g, 97, 50, 4, 2, '#c8a040');
    eDither(g, 80, 40, 32, 24, 'rgba(0,0,0,0)', 'rgba(255,190,90,0.5)', 0.1);
  }
  for (const cx of [72, 120]) {
    eR(g, cx, 56, 2, 8, '#d8ccb0');
    eR(g, cx, 53, 2, 3, '#ffb000');
  }
  eR(g, 0, 78, EW, EH - 78, '#2a1c10');
  eDither(g, 0, 78, EW, EH - 78, '#2a1c10', '#3a2818', 0.3);
}
function eWedding(g, r) {
  eChapel(g, r);
  eSprite(g, 'crumb', 88, 64);
  eSprite(g, 'sheriff', 104, 98, true);
  // you: a silhouette, as on the road
  eR(g, 76, 66, 6, 6, '#0a0604');
  eR(g, 74, 72, 10, 16, '#0a0604');
  eR(g, 75, 88, 3, 10, '#0a0604');
  eR(g, 80, 88, 3, 10, '#0a0604');
  eStar(g, 113, 79, '#ffb000');
}
function eCradle(g, r, t) {
  t = t || '';
  eSky(g, ['#140e08', '#1e160c', '#281e12'], EH);
  eR(g, 120, 16, 34, 30, '#3a2a1c');
  eDither(g, 122, 18, 30, 26, '#a8441c', '#d8782a', 0.4);
  eR(g, 136, 18, 2, 26, '#3a2a1c');
  // a sheriff's star nailed to the wall, a rifle on pegs
  eStar(g, 60, 30, '#ffb000');
  eR(g, 40, 44, 40, 1, '#4a3424');
  eR(g, 40, 43, 8, 3, '#5a3e28');
  // the cradle, and a mobile of teeth over it
  eR(g, 72, 78, 48, 3, '#6a4a30');
  eR(g, 74, 68, 44, 10, '#5a3e28');
  eR(g, 74, 66, 44, 2, '#7a5a3c');
  eR(g, 72, 81, 4, 6, '#4a3220');
  eR(g, 116, 81, 4, 6, '#4a3220');
  eDither(g, 76, 68, 40, 4, '#5a3e28', '#d8ccb0', 0.5);
  eR(g, 95, 34, 1, 18, '#8c8a80');
  eR(g, 86, 52, 20, 1, '#8c8a80');
  for (const tx of [86, 93, 100, 105]) eR(g, tx, 53, 2, 3, '#e0d4b4');
  eR(g, 0, 87, EW, EH - 87, '#2a1e12');
  // whose it is: a keepsake of the father's hangs on the cradle, and if it's yours, you stand by it
  const who = (CRADLE_DAD.find(([re]) => re.test(t)) || [])[1];
  if (who) who(g);
  if (/Yours\b|\byours\b/.test(t)) {
    eR(g, 132, 66, 6, 6, '#0a0604');
    eR(g, 130, 72, 10, 16, '#0a0604');
    eR(g, 131, 88, 3, 9, '#0a0604');
    eR(g, 136, 88, 3, 9, '#0a0604');
  }
}
// Each father leaves something on the cradle. Found from the slide's words, like everything here.
const CRADLE_DAD = [
  [/Yours\b/, g => (eR(g, 80, 62, 14, 2, '#3a2a1c'), eR(g, 83, 58, 8, 4, '#4a3424'))], // your hat
  [
    /\bKrug\b/,
    g => {
      for (let i = 0; i < 10; i++) eR(g, 76 + i * 4, 70 + (i % 2), 3, 2, '#8c8a80');
    },
  ], // a chain
  [/\bJeb\b/, g => (eR(g, 100, 62, 10, 3, '#5e7e3a'), eR(g, 109, 61, 3, 2, '#5e7e3a'), eR(g, 98, 64, 3, 1, '#5e7e3a'))], // a lizard
  [/\bMoe\b/, g => (eR(g, 102, 58, 5, 8, '#c8a040'), eR(g, 102, 58, 5, 2, '#ece2c8'))], // a beer glass
  [
    /Fenwick|Mayor/,
    g => (eR(g, 98, 54, 8, 9, '#2a221c'), eR(g, 96, 63, 12, 2, '#2a221c'), eR(g, 98, 60, 8, 1, '#9a3a26')),
  ], // a top hat
  [/\bDoc\b/, g => (eR(g, 100, 62, 8, 2, '#c8c4b8'), eR(g, 107, 60, 2, 4, '#a8e07c'))], // a syringe of something green
  [/\bPips\b/, g => (eR(g, 100, 58, 6, 8, '#d8ccb0'), eR(g, 102, 60, 2, 2, '#9a3a26'))], // a playing card
  [/\bGus\b/, g => (eR(g, 100, 54, 1, 12, '#8a6440'), eR(g, 96, 54, 9, 2, '#8c8a80'))], // a pick
  [/Big Tam/, g => (eR(g, 100, 60, 7, 6, '#9a3a26'), eR(g, 100, 60, 7, 2, '#b04a30'))], // a boxing glove
  [/\bRook\b/, g => (eR(g, 100, 60, 2, 6, '#8c8a80'), eR(g, 99, 59, 4, 2, '#c8a040'))], // a door key
  [/Hector/, g => (eR(g, 96, 62, 14, 2, '#c8a040'), eR(g, 99, 58, 8, 4, '#c8a040'))], // a straw hat
  [/\bVane\b/, g => (eR(g, 101, 58, 4, 7, '#c8c4b8'), eR(g, 102, 56, 2, 2, '#8c8a80'))], // a flask
  [/\bGums\b/, g => (eR(g, 99, 60, 8, 5, '#d09088'), eR(g, 100, 61, 6, 1, '#ece2c8'))], // a set of dentures
  [/\bPete\b/, g => (eR(g, 102, 60, 4, 4, '#8c8a80'), eR(g, 103, 56, 1, 4, '#8c8a80'))], // a guard's whistle
];
function eChainfield(g, r, who) {
  eDesert(g, r, { sky: ['#0e0a10', '#2a1214', '#4a1c16', '#7a3018', '#a04a20'] });
  for (let i = 0; i < 7; i++) {
    const x = 14 + i * 24,
      y = HZ + 14;
    eR(g, x, y - 12, 18, 12, 'rgba(0,0,0,0)');
    for (let k = 0; k < 6; k++) eR(g, x + k * 3, y - 12, 1, 12, '#8c8a80');
    eR(g, x, y - 12, 18, 1, '#8c8a80');
    eR(g, x, y - 6, 18, 1, '#6a6860');
    eR(g, x + 2, y, 2, 2, '#3a3a36');
    eR(g, x + 14, y, 2, 2, '#3a3a36');
  }
  for (let i = 0; i < 30; i++) eR(g, 10 + i * 6, HZ + 20 + (i % 2), 3, 1, '#6a6860');
  if (who) eSprite(g, who, 150, HZ + 28);
}
function eCasino(g, r) {
  eDesert(g, r, { sky: NIGHT, sun: false, ground: '#4a3a24' });
  for (let i = 0; i < 40; i++) eR(g, r() * EW, r() * 40, 1, 1, '#6a6070');
  // a casino front, half buried, one letter of the sign still lit
  eR(g, 40, 34, 112, 40, '#4a3a30');
  eDither(g, 40, 34, 112, 40, '#4a3a30', '#2a2018', 0.2);
  eR(g, 50, 24, 92, 10, '#2a2018');
  const sign = 'SNAKE EYES';
  for (let i = 0; i < sign.length; i++)
    if (sign[i] !== ' ') eR(g, 54 + i * 9, 27, 6, 5, i === 4 ? '#ff6a4d' : '#3a2c24');
  eDither(g, 80, 20, 20, 16, 'rgba(0,0,0,0)', 'rgba(255,106,77,0.6)', 0.15);
  eR(g, 86, 52, 20, 22, '#1a120c');
  eR(g, 30, HZ + 4, 140, 10, '#5a4428');
  eDither(g, 30, HZ - 2, 140, 10, '#5a4428', '#4a3a30', 0.4);
  // a pair of dice in the sand
  eR(g, 150, HZ + 20, 6, 6, '#d8ccb0');
  eR(g, 152, HZ + 22, 2, 2, '#1a120c');
  eR(g, 158, HZ + 22, 6, 6, '#d8ccb0');
  eR(g, 159, HZ + 23, 1, 1, '#1a120c');
  eR(g, 162, HZ + 26, 1, 1, '#1a120c');
}
function eMall(g, r) {
  eSky(g, ['#1a1416', '#3a2820', '#5a3a26', '#7a5030'], 50);
  eR(g, 10, 20, 172, 40, '#5e5246');
  eDither(g, 10, 20, 172, 40, '#5e5246', '#3e3329', 0.25);
  eR(g, 60, 12, 72, 10, '#3e3329');
  for (let i = 0; i < 8; i++) eR(g, 66 + i * 8, 15, 5, 4, i === 2 ? '#ffb000' : '#5a4a3a');
  // the drowned floor: black-teal water up to the shop signs
  eR(g, 0, 52, EW, EH - 52, '#1e3432');
  eDither(g, 0, 52, EW, EH - 52, '#1e3432', '#2e4a48', 0.3);
  for (let i = 0; i < 40; i++) eR(g, r() * EW, 54 + r() * 50, 3 + r() * 6, 1, '#4a6a66');
  for (const sx of [24, 70, 128]) {
    eR(g, sx, 44, 30, 10, '#3a2e24');
    eR(g, sx + 2, 46, 26, 6, '#6a4a30');
  }
}
function eGreen(g, r) {
  eSky(g, ['#1a2430', '#2e3a40', '#4a5048', '#6a6a50'], HZ);
  eMesas(g, r, HZ, '#3a3a34', 3);
  eGround(g, HZ, '#5a4e36', '#3a3226');
  // the glass dome, green inside
  const cx = 96,
    cy = HZ + 6;
  for (let yy = -34; yy <= 0; yy++) {
    const w = Math.round(Math.sqrt(34 * 34 - yy * yy) * 1.5);
    eR(g, cx - w, cy + yy, w * 2, 1, yy % 3 ? '#4e7a3a' : '#5e8a44');
    eR(g, cx - w, cy + yy, 1, 1, '#a8c8b8');
    eR(g, cx + w - 1, cy + yy, 1, 1, '#a8c8b8');
  }
  for (let i = -3; i <= 3; i++)
    eR(g, cx + i * 14, cy - 30 + Math.abs(i) * 5, 1, 30 - Math.abs(i) * 5, 'rgba(200,230,220,0.5)');
  eR(g, cx - 52, cy, 104, 2, '#6a6a5a');
}
function eFarm(g, r) {
  eDesert(g, r, { sunX: 30, ground: '#5a4a2a' });
  for (let i = 0; i < 9; i++) eR(g, 0, HZ + 6 + i * 4, EW, 1, i % 2 ? '#6b6a2e' : '#4a4a20');
  // the barn and the tractor
  eR(g, 130, HZ - 24, 40, 30, '#6a3420');
  eR(g, 126, HZ - 28, 48, 5, '#4a2414');
  eR(g, 144, HZ - 8, 12, 14, '#2a140c');
  eR(g, 40, HZ + 10, 24, 10, '#7a4a28');
  eR(g, 56, HZ + 4, 8, 8, '#5a3a20');
  eR(g, 38, HZ + 18, 10, 10, '#1a120c');
  eR(g, 58, HZ + 20, 7, 7, '#1a120c');
  eR(g, 62, HZ, 2, 5, '#3a3a36');
}
function ePlane(g, r) {
  eDesert(g, r, { sunX: 170 });
  // a fuselage nose-down in the sand, one wing snapped
  eR(g, 30, HZ - 6, 110, 16, '#7a7468');
  eR(g, 30, HZ - 6, 110, 2, '#9a948a');
  for (let i = 0; i < 9; i++) eR(g, 42 + i * 10, HZ - 2, 5, 4, '#2a2a30');
  eR(g, 130, HZ - 22, 16, 18, '#6a645a');
  eR(g, 70, HZ + 8, 60, 5, '#5a544a');
  eR(g, 64, HZ + 12, 20, 3, '#5a544a');
  eR(g, 20, HZ + 2, 14, 12, '#5e5246');
  eDither(g, 30, HZ - 6, 110, 16, '#7a7468', '#2a1e14', 0.15);
}
function eSilo(g, r, nuke) {
  eDesert(g, r, { sky: nuke ? ['#200a06', '#5a1a0a', '#a03a10', '#e07a20', '#ffc060'] : NIGHT, sun: false });
  if (nuke) {
    const nx = 60;
    eR(g, nx - 4, 20, 8, HZ - 20, '#6a3a20');
    for (let i = 0; i < 30; i++) {
      const a = r() * Math.PI * 2,
        d = r() * 22;
      eR(g, nx + Math.cos(a) * d * 1.4 - 4, 18 + Math.sin(a) * d * 0.6, 8, 6, i % 2 ? '#8a4a24' : '#a85a2a');
    }
  } else for (let i = 0; i < 40; i++) eR(g, r() * EW, r() * 40, 1, 1, '#6a6070');
  // the silo: a concrete dome, and the nose of the Big Tooth showing
  eR(g, 110, HZ - 8, 60, 14, '#5a5650');
  eR(g, 116, HZ - 12, 48, 4, '#6a6660');
  eR(g, 136, HZ - 30, 8, 22, '#d8ccb0');
  eR(g, 137, HZ - 34, 6, 4, '#ece2c8');
  eR(g, 138, HZ - 36, 4, 2, '#ff6a4d');
}
function eDiner(g, r) {
  eDesert(g, r, { sunX: 160 });
  eR(g, 40, HZ - 18, 90, 24, '#6a5040');
  eR(g, 36, HZ - 22, 98, 5, '#4a3424');
  eR(g, 60, HZ - 34, 50, 10, '#3a2618');
  for (let i = 0; i < 5; i++) eR(g, 64 + i * 9, HZ - 31, 6, 5, '#ff6a4d');
  for (let i = 0; i < 4; i++) eR(g, 48 + i * 20, HZ - 12, 12, 8, '#d8782a');
  // steam from the chimney, which never stops
  for (let i = 0; i < 12; i++) eR(g, 118 + Math.sin(i) * 3, HZ - 30 - i * 3, 4, 3, 'rgba(200,190,170,0.4)');
  eR(g, 118, HZ - 30, 6, 10, '#3a2a1c');
}
function eScrapwell(g, r) {
  eDesert(g, r, { sunX: 60 });
  for (let i = 0; i < 5; i++) eShack(g, 10 + i * 36 + r() * 8, HZ + 6, 20, 12 + r() * 6, '#5a4a38', '#3e3226');
  // the well, glowing faintly
  eR(g, 90, HZ + 10, 16, 8, '#5e5246');
  eR(g, 92, HZ + 8, 12, 2, '#a8e07c');
  eDither(g, 84, HZ - 4, 28, 14, 'rgba(0,0,0,0)', 'rgba(168,224,124,0.5)', 0.15);
  eR(g, 90, HZ - 4, 2, 14, '#4a3a2a');
  eR(g, 104, HZ - 4, 2, 14, '#4a3a2a');
  eR(g, 88, HZ - 6, 20, 2, '#4a3a2a');
}
// Which picture a slide gets, from its words. First match wins.
const NUKED = t => /\bnuked?\b|crater|mushroom/i.test(t) || (/launched/i.test(t) && !/never launched/i.test(t));
const ESCENES = [
  [/\bGutmaw\b|\bworm\b/i, (g, r, t) => eGutmaw(g, r, /Crane|Sheriff/.test(t)), { noPeople: true }],
  [/\bmarried\b|\bwedding\b|\bvows\b/i, (g, r) => eWedding(g, r), { noPeople: true }],
  [/\bbaby\b|\bcarrying\b|\bchild\b/i, (g, r, t) => eCradle(g, r, t)],
  [/\bKrug\b|Chainfield|\bpens\b|\bslavers?\b/i, (g, r, t, who) => eChainfield(g, r, who)],
  [/Snake Eyes|\bthe pit\b|\bPips\b|\bDice\b|Big Tam|Sweet Nan|\bRook\b/, (g, r) => eCasino(g, r)],
  [/\bplane\b|Sky-Bus|\bCoil\b|Mother Ohm/, (g, r) => ePlane(g, r)],
  [/\bMall\b|Margie|\bEel\b|Sprocket|\bVane\b|\bGums\b|food court/, (g, r) => eMall(g, r)],
  [/\bGreen\b|Gardener|\bFern\b|\bMoss\b|Warden|\bdome\b/, (g, r) => eGreen(g, r)],
  [/Big Tooth|\bSilo\b|Dentist King|\blaunch|\bnuked?\b|crater/i, (g, r, t) => eSilo(g, r, NUKED(t))],
  [/\bLou\b|Lou's|\bdiner\b|\bstew\b|Thursday|Junior/, (g, r) => eDiner(g, r)],
  [/Scrapwell|Ma Thistle|\bGus\b|\bPell\b|Bacon Prime|\bNigel\b|\bwell\b/, (g, r) => eScrapwell(g, r)],
  [/Toaster|\bchapel\b|\bCrumb\b|\bCrust\b|Deacon Rind/, (g, r) => eChapel(g, r)],
  [/\bfarm\b|Hector|\bBess\b|\bBert\b|tractor|\bcorn\b|harvest/i, (g, r) => eFarm(g, r)],
  [
    /Crane|Sheriff|Rustwater|\bMoe\b|\bOpal\b|Gloria|\bJeb\b|\bDoc\b|Fenwick|Mayor|\bpump\b|\bPete\b/,
    (g, r, t, who) => eRustwater(g, r, who),
  ],
];
// The people a slide is about, by full name or a distinctive last name.
function eNamed(text) {
  const out = [];
  for (const id in NPC) {
    const n = NPC[id].n,
      last = n.split(' ').slice(-1)[0];
    if (
      SNPC[id] &&
      (text.includes(n) || (last.length >= 4 && /^[A-Z]/.test(last) && new RegExp('\\b' + last + '\\b').test(text)))
    )
      out.push(id);
  }
  return out;
}
function endPaint(text) {
  const vw = $('view'),
    w = Math.max(240, ((vw && vw.clientWidth) || 832) - 10),
    k = Math.max(2, Math.floor(w / EW)),
    { g, w: cw, h } = artCanvas(EH * k),
    pc = document.createElement('canvas');
  pc.width = EW;
  pc.height = EH;
  const p = pc.getContext('2d'),
    r = eRand(text.length * 131 + text.charCodeAt(0)),
    named = eNamed(text),
    hit = ESCENES.find(([re]) => re.test(text));
  if (hit) {
    const lead = named[0] || null;
    hit[1](p, r, text, lead);
    // everyone else the slide names stands in the foreground
    if (!(hit[2] && hit[2].noPeople))
      named
        .filter(id => id !== lead || !/eRustwater|eChainfield/.test(String(hit[1])))
        .slice(0, 3)
        .forEach((id, i) => eSprite(p, id, 20 + i * 22, EH - 4, i % 2 === 1));
  } else {
    eDesert(p, r);
    eR(p, 94, HZ + 14, 4, 4, '#0a0604');
    eR(p, 93, HZ + 18, 6, 8, '#0a0604');
  }
  g.fillStyle = '#000';
  g.fillRect(0, 0, cw, h);
  g.imageSmoothingEnabled = false;
  g.drawImage(pc, Math.round((cw - EW * k) / 2), 0, EW * k, EH * k);
  g.imageSmoothingEnabled = true;
  artScan(g, cw, h);
}
const _artMountEnd = artMount;
artMount = v => {
  if (v && !S && canDraw() && (v.title === 'The End' || v.title === 'What became of them')) {
    if (v.title === 'The End' && typeof sfx === 'function') sfx('end');
    try {
      endPaint(v.text || '');
    } catch (e) {
      _artMountEnd(v);
    }
    return;
  }
  _artMountEnd(v);
};
