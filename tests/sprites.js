// Portrait checks. Usage: node tests/sprites.js index.html
// Every grid only uses palette letters and fits its 16 x 32 box, every part a person names exists,
// every person has a portrait, and every portrait draws (with a fake canvas) open-eyed and blinking.
const vm = require('vm');
const code = require('./load')(process.argv[2]);
function mk() {
  const e = { _h: '', children: [], hidden: false, style: {}, appendChild(c) { this.children.push(c); } };
  Object.defineProperty(e, 'innerHTML', { get() { return this._h; }, set(v) { this._h = v; this.children = []; } });
  return e;
}
const els = {}, store = {};
let filled = 0;
const g2d = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === 'fillRect' ? () => filled++ : () => ({ addColorStop() {} })), set: (t, k, v) => ((t[k] = v), true) });
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
  for (const id of IDS) {
    const s = SNPC[id];
    if (!s) { out.push('no portrait for ' + id); continue; }
    if (s.body && !SBODY[s.body]) out.push(id + ': no body ' + s.body);
    (s.add || []).forEach(a => SADD[a] || out.push(id + ': no layer ' + a));
    if (s.item && !SITEM[s.item]) out.push(id + ': no item ' + s.item);
    (s.parts || []).forEach((p, i) => grid(id + ' part ' + i, p, p.x || 0, p.y || 0, 32));
    if (!s.body && !(s.parts || []).length) out.push(id + ': nothing to draw');
    for (const k in s.pal || {}) if (!/^#[0-9a-f]{6}$/i.test(s.pal[k])) out.push(id + ': bad colour ' + k);
  }
  for (const id in SNPC) if (!NPC[id]) out.push('portrait for nobody: ' + id);
  // Talking to someone finds their portrait from the screen.
  for (const id of IDS) if (SNPC[id] && sprPortraitId({ title: NPC[id].n, icon: NPC[id].i }) !== id) out.push('portrait not found for ' + id);
  return out;
})()`);
for (const id of run('IDS')) for (const shut of [false, true]) {
  const before = filled;
  try { run(`sprPortraitDraw(document.createElement('canvas'), '${id}', ${shut})`); } catch (e) { fails.push(id + ' portrait threw: ' + e.message); }
  if (filled - before < 40) fails.push(id + ' portrait drew almost nothing');
}
if (fails.length) { console.log([...new Set(fails)].join('\n')); process.exit(1); }
console.log('portraits ok');
