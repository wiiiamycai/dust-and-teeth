// Pixel sprite checks. Usage: node tests/sprites.js index.html
// Every grid only uses palette letters and fits its 16 x 32 (or 16 x 12) box, every part a sprite names exists,
// every person, armour, weapon and map object has a sprite of the right kind, and every sprite builds.
const vm = require('vm');
const code = require('./load')(process.argv[2]);
function mk() {
  const e = { _h: '', children: [], hidden: false, style: {}, appendChild(c) { this.children.push(c); } };
  Object.defineProperty(e, 'innerHTML', { get() { return this._h; }, set(v) { this._h = v; this.children = []; } });
  return e;
}
const els = {}, store = {};
const g2d = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ({ addColorStop() {} })), set: (t, k, v) => ((t[k] = v), true) });
const ctx = { console, Math, JSON, String, Object, Array, Map, Set,
  document: { getElementById: id => els[id] || (els[id] = mk()), createElement: () => ({ style: {}, getContext: g2d }), addEventListener() {} },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const run = s => vm.runInContext(s, ctx);
const fails = run(`(() => {
  const out = [], ok = ch => ch === '.' || ch === ' ' || !!SPAL[ch] || !!SPAL[ch.toLowerCase()];
  const grid = (where, part, x0, y0, h) => {
    part.r.forEach((row, i) => {
      for (const ch of row) if (!ok(ch)) out.push(where + ': unknown letter ' + ch);
      if (x0 + row.length > 16 || x0 < 0) out.push(where + ': row ' + i + ' is wider than 16');
    });
    if (y0 < 0 || y0 + part.r.length > h) out.push(where + ': taller than ' + h);
  };
  for (const b in SBODY) SBODY[b].parts.forEach(p => grid('body ' + b, p, p.x || 0, p.y || 0, 32));
  for (const a in SADD) SADD[a].forEach(p => grid('layer ' + a, p, p.x || 0, p.y || 0, 32));
  for (const it in SITEM) for (const b in SBODY) {
    const I = SITEM[it], w = Math.max(...I.r.map(r => r.length));
    grid('item ' + it + ' on ' + b, I, Math.min(SBODY[b].hand[0] + I.dx, 16 - w), SBODY[b].hand[1] + I.dy, 32);
  }
  for (const k in SPROP) SPROP[k].forEach(p => grid('prop ' + k, p, p.x || 0, p.y || 0, 32));
  SBOARD.forEach(p => grid('sign board', p, p.x || 0, p.y || 0, 12));
  for (const k in SICON) grid('icon ' + k, { r: SICON[k] }, 4, 2, 12);
  SCORPSE.parts.forEach(p => grid('corpse', p, p.x || 0, p.y || 0, 32));
  const parts = (who, s) => {
    if (s.body && !SBODY[s.body]) out.push(who + ': no body ' + s.body);
    (s.add || []).forEach(a => SADD[a] || out.push(who + ': no layer ' + a));
    if (s.item && !SITEM[s.item]) out.push(who + ': no item ' + s.item);
    (s.parts || []).forEach((p, i) => grid(who + ' part ' + i, p, p.x || 0, p.y || 0, 32));
    if (!s.body && !(s.parts || []).length) out.push(who + ': nothing to draw');
  };
  for (const id of IDS) SNPC[id] ? parts('npc ' + id, SNPC[id]) : out.push('no sprite for ' + id);
  for (const id in SNPC) if (!NPC[id]) out.push('sprite for nobody: ' + id);
  for (const a in A) SARMOR[a] ? parts('armour ' + a, { body: 'man', ...SARMOR[a] }) : out.push('no sprite for armour ' + a);
  for (const w in W) if (w !== 'fists' && !SWEAPON[w]) out.push('no sprite for weapon ' + w);
  for (const w in SWEAPON) if (!SITEM[SWEAPON[w]]) out.push('weapon ' + w + ': no item ' + SWEAPON[w]);
  for (const k in SSIGN) if (!SICON[SSIGN[k]]) out.push('sign ' + k + ': no icon ' + SSIGN[k]);
  // Objects set into a wall need a sign; objects in the open need a prop.
  for (const loc in MAPS) {
    const T = townMap(loc), inner = (x, y) => chAt(T, x, y) === '#' && x > 0 && y > 0 && x < T.w - 1 && y < T.h - 1;
    for (const o of T.objs) {
      const key = loc + '.' + o.k, wall = neighbours4(o).some(p => inner(p.x, p.y));
      if (wall && !SSIGN[key]) out.push('no sign for ' + key + ' (' + o.n + ')');
      if (!wall && !SPROP[key]) out.push('no prop for ' + key + ' (' + o.n + ')');
    }
  }
  for (const k in SPROP) { const [loc, ch] = k.split('.'); if (!MAPS[loc] || !MAPS[loc].obj[ch]) out.push('prop for nothing: ' + k); }
  for (const k in SSIGN) { const [loc, ch] = k.split('.'); if (!MAPS[loc] || !MAPS[loc].obj[ch]) out.push('sign for nothing: ' + k); }
  // Everything builds, in every frame and facing, and draws something.
  newGame();
  const keys = [...IDS.map(i => 'npc:' + i), ...Object.keys(SPROP).map(k => 'prop:' + k), ...Object.keys(SSIGN).map(k => 'sign:' + k), 'corpse'];
  for (const a in A) for (const w in W) { S.armor = a; S.weapon = w; const s = sprBuild('you', 0, false, 2); if (!s || s.box[2] <= s.box[0]) out.push('you in ' + a + ' with ' + w + ' drew nothing'); }
  for (const k of keys) for (const f of [0, 1, 2, 3]) for (const fl of [false, true]) {
    const s = sprBuild(k, f, fl, 1.5);
    if (!s || s.box[2] <= s.box[0] || s.box[3] <= s.box[1]) out.push(k + ' frame ' + f + ' drew nothing');
  }
  return out;
})()`);
if (fails.length) { console.log([...new Set(fails)].join('\n')); process.exit(1); }
console.log('sprites ok');
