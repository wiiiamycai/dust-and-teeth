// Fixed-seed playthroughs that fingerprint every screen and every save.
// Use it to prove a refactor changed no behaviour.
//   node tests/golden.js index.html record   writes tests/golden.json
//   node tests/golden.js index.html          compares against tests/golden.json
// Re-record only when a change is MEANT to alter gameplay.
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const loadGame = require('./load');
const code = loadGame(process.argv[2]);
const RECORD = process.argv[3] === 'record';
const GOLD = path.join(__dirname, 'golden.json');
const GAMES = 300, STEPS = 400;

function rng(seed) { // mulberry32
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function mk() { const e = { _h: '', children: [], hidden: false, style: {}, appendChild(c) { this.children.push(c) } };
  Object.defineProperty(e, 'innerHTML', { get() { return this._h }, set(v) { this._h = v; this.children = [] } }); return e; }

const out = {};
for (let g = 0; g < GAMES; g++) {
  const store = {}, M = Object.create(Math), pickR = rng(g * 7919 + 1), survive = g % 2 === 1;
  M.random = rng(g + 1);
  let els, ctx;
  const boot = () => { els = {};
    ctx = { console, Math: M, JSON, String, Object, Array,
      document: { getElementById: id => els[id] || (els[id] = mk()), createElement: () => ({ style: {}, innerHTML: '', onclick: null }), addEventListener() {} },
      localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v }, removeItem: k => { delete store[k] } }, window: {} };
    vm.createContext(ctx); vm.runInContext(code, ctx); };
  const h = crypto.createHash('sha1');
  let err = null;
  try {
    boot();
    for (let s = 0; s < STEPS; s++) {
      if (pickR() < 0.03) boot(); // reload from save mid-game
      if (survive) vm.runInContext('if(S&&S.hp<8)S.hp=S.maxhp', ctx);
      const all = [...els.opts.children, ...els.cards.children.filter(c => c.onclick), ...(els.map && !els.map.hidden ? els.map.children : [])];
      h.update([els.hud, els.head, els.log, els.text, els.cards, els.map].map(e => e ? e.innerHTML + (e.hidden ? '#h' : '') : '').join('\x1f'));
      h.update(all.map(c => c.innerHTML).join('\x1e'));
      h.update(JSON.stringify(store));
      if (!all.length) break;
      all[Math.floor(pickR() * all.length)].onclick();
    }
  } catch (e) { err = e.message; h.update('ERR:' + e.message); }
  out[g] = h.digest('hex').slice(0, 16) + (err ? ' ERR ' + err : '');
}

if (RECORD) { fs.writeFileSync(GOLD, JSON.stringify(out, null, 1) + '\n'); console.log('recorded', GAMES, 'games to', GOLD); }
else {
  const gold = JSON.parse(fs.readFileSync(GOLD, 'utf8'));
  const diff = Object.keys(gold).filter(k => gold[k] !== out[k]);
  console.log(diff.length ? { mismatched: diff.length, first: diff.slice(0, 10) } : { golden: 'match', games: GAMES });
  if (diff.length) process.exit(1);
}
