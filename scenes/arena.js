'use strict';
// ================= THE FIGHT ARENA =================
// Looks only. During a fight, a strip of isometric ground above the options shows who's fighting:
// you on the left with anyone on your side, them on the right. At range they stand well off; up close
// they're in your face. Click one to target them, the same as clicking their card. The dead fall down.
// The fight itself (engine/combat.js) doesn't know this exists. No canvas: nothing changes.

let ARENA = null;
const ARENA_N = 10; // a 10 x 10 grid; the strip is the tiles near its middle diagonal
function arenaSlot(lane, row) {
  // lane 0 is far left, 9 far right; row -1 is a step back, 1 a step forward
  return { x: lane + Math.max(0, row), y: ARENA_N - 1 - lane + Math.max(0, -row) };
}
function arenaMount() {
  if (!S || S.scene !== 'fight' || !S.fight || typeof canIso !== 'function' || !canIso()) return;
  const F = S.fight,
    vw = $('view');
  vw.hidden = false;
  vw.innerHTML = '<canvas id="arenac" class="iso arena"></canvas>';
  const cv = $('arenac');
  if (!cv || !cv.getContext) return;
  const avail = Math.max(240, ((vw && vw.clientWidth) || 832) - 10),
    half = Math.max(10, Math.min(40, Math.floor(avail / (2 * ARENA_N)))),
    q = half / 2,
    tw = half * 2,
    head = Math.ceil(tw * 1.25),
    W = 2 * ARENA_N * half,
    H = Math.ceil(head + 5 * q + half + 6),
    dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1),
    old = ARENA && ARENA.fight === F ? ARENA : null;
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  if (cv.style) cv.style.width = W + 'px';
  ARENA = {
    fight: F,
    cv,
    W,
    H,
    half,
    q,
    tw,
    dpr,
    ox: W / 2,
    oy: head - (ARENA_N - 3) * q,
    hits: [],
    hp: S.hp,
    hurt: old && S.hp < old.hp,
    tick: 0,
  };
  arenaDraw();
  if (ARENA.hurt && cv.classList) {
    cv.classList.add('hurt');
  }
  const motion = typeof isoMotion === 'function' && isoMotion();
  if (motion && typeof setInterval === 'function') {
    const me = ARENA,
      id = setInterval(() => {
        if (ARENA !== me || !cv.isConnected) return clearInterval(id);
        me.tick++;
        arenaDraw();
      }, 650);
  }
}
function arenaDraw() {
  const A = ARENA,
    F = A.fight,
    g = A.cv.getContext('2d'),
    h = A.half,
    q = A.q,
    lt = typeof isoLight === 'function' ? isoLight() : { sh: 0 },
    at = (fx, fy) => [A.ox + (fx - fy) * h, A.oy + ((fx + fy) * h) / 2],
    ground = ISO_GROUND[','];
  g.setTransform(A.dpr, 0, 0, A.dpr, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = ISO_BG;
  g.fillRect(0, 0, A.W, A.H);
  // the ground: a strip that fades out at the edges
  for (let y = 0; y < ARENA_N; y++)
    for (let x = 0; x < ARENA_N; x++) {
      const band = Math.abs(x + y - (ARENA_N - 1));
      if (band > 2) continue;
      const side = Math.abs(x - y),
        k = (1 - 0.1 * band) * (side > 6 ? 1 - 0.25 * (side - 6) : 1) * (0.92 + 0.14 * hash(x, y, 9));
      if (k <= 0.05) continue;
      const [tx, ty] = at(x, y);
      g.beginPath();
      g.moveTo(tx, ty);
      g.lineTo(tx + h, ty + q);
      g.lineTo(tx, ty + h);
      g.lineTo(tx - h, ty + q);
      g.closePath();
      g.fillStyle = tone(ground, k, 0);
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.05)';
      g.stroke();
      for (let n = 0; n < 2; n++) {
        const [sx, sy] = at(x + 0.2 + 0.6 * hash(x, y, n), y + 0.2 + 0.6 * hash(x, y, n + 4));
        g.fillStyle = tone('#a89070', k, 0);
        g.fillRect(sx, sy, 1.5, 1.5);
      }
    }
  // who stands where
  const live = F.en.map((e, i) => ({ e, i })),
    who = [];
  const rows = [0, 1, -1, 2, -2];
  who.push({ key: 'you', lane: 2, row: 0, me: true });
  F.al.filter(a => alive(a)).forEach((a, i) => who.push({ key: 'npc:' + a, lane: 1, row: i ? -1 : 1 }));
  let n = 0;
  live.forEach(({ e, i }) => {
    const r = rows[n % rows.length],
      lane = (F.close ? 4 : 7) + Math.floor(n / rows.length);
    n++;
    who.push({ key: typeof sprFoeKey === 'function' ? sprFoeKey(e) : null, e, i, lane, row: r, foe: true });
  });
  who.forEach(o => (o.pos = arenaSlot(o.lane, o.row)));
  who.sort((a, b) => a.pos.x + a.pos.y - (b.pos.x + b.pos.y));
  A.hits = [];
  const cell = (A.tw * 0.95) / 32;
  for (const o of who) {
    const [cx, cy0] = at(o.pos.x + 0.5, o.pos.y + 0.5),
      cy = cy0 + q * 0.25,
      dead = o.foe && o.e.hp <= 0,
      target = o.foe && o.i === F.t && !dead;
    // shadow and rings
    g.fillStyle = 'rgba(0,0,0,0.32)';
    g.beginPath();
    g.ellipse(cx, cy0, h * 0.42, q * 0.42, 0, 0, Math.PI * 2);
    g.fill();
    if (o.me || target) {
      g.strokeStyle = o.me ? '#a8e07c' : '#ffb000';
      g.lineWidth = Math.max(1.5, A.half / 12);
      g.beginPath();
      g.ellipse(cx, cy0, h * 0.58, q * 0.6, 0, 0, Math.PI * 2);
      g.stroke();
    }
    let r = null;
    if (dead) r = sprDraw(g, 'corpse', cx, cy, cell, A.dpr, 0.9, 0, true);
    else if (o.key) {
      const spec = sprSpec(o.key),
        sc = (spec && spec.scale) || 1,
        fr = (A.tick + (o.foe ? o.i + 1 : 0)) % 2;
      r = sprDraw(g, o.key, cx, cy, cell * sc, A.dpr, 1, o.me && F.charge ? 2 : fr, !!o.foe);
    }
    if (!r && !dead) {
      // no sprite: the emoji
      const fs = Math.round(A.tw * 0.7),
        ch = o.me ? '🧍' : o.e ? o.e.i : NPC[o.key.slice(4)].i;
      g.font = fs + 'px ' + ISO_FONT;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      g.fillStyle = '#fff';
      g.fillText(ch, cx, cy);
      r = { l: cx - fs / 2, t: cy - fs, r: cx + fs / 2, b: cy };
    }
    if (o.foe && !dead && r) A.hits.push({ i: o.i, r });
  }
  // the light of the day
  if (lt.mul) {
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = lt.mul;
    g.fillRect(0, 0, A.W, A.H);
  }
  g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(A.W / 2, A.H / 2, A.H * 0.4, A.W / 2, A.H / 2, A.W * 0.55);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg;
  g.fillRect(0, 0, A.W, A.H);
}
// The enemy under a point on the canvas, by index into the fight's enemies, or -1.
function arenaPick(px, py) {
  if (!ARENA) return -1;
  for (let k = ARENA.hits.length - 1; k >= 0; k--) {
    const { i, r } = ARENA.hits[k];
    if (px >= r.l && px <= r.r && py >= r.t && py <= r.b) return i;
  }
  return -1;
}
function arenaClick(px, py) {
  const i = arenaPick(px, py),
    F = S && S.fight;
  if (i < 0 || !F || S.scene !== 'fight' || !F.en[i] || F.en[i].hp <= 0) return false;
  F.t = i;
  go('fight');
  return true;
}
(() => {
  const vw = typeof document !== 'undefined' && document.getElementById('view');
  if (!vw || !vw.addEventListener) return;
  vw.addEventListener('click', e => {
    if (!ARENA || !e.target || e.target.id !== 'arenac') return;
    const r = ARENA.cv.getBoundingClientRect();
    arenaClick(((e.clientX - r.left) * ARENA.W) / r.width, ((e.clientY - r.top) * ARENA.H) / r.height);
  });
})();
