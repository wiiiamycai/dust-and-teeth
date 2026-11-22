// Every weapon, alone, against fixed foes, at two skill levels. Not part of the tests: it's for balancing by eye.
// Usage: node tools/weaponodds.js [fights per cell] ['{"zipgun":{"d":[5,12]}}' to try different numbers]
const vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const code = require(path.join(root, 'tests/load'))(path.join(root, 'index.html'));
const N = +process.argv[2] || 1500;
function mk() { const e = { _h: '', children: [], hidden: false, style: {}, appendChild(c) { this.children.push(c); } };
  Object.defineProperty(e, 'innerHTML', { get() { return this._h; }, set(v) { this._h = v; this.children = []; } }); return e; }
const els = {}, store = {};
const ctx = { console, Math, JSON, String, Object, Array,
  document: { getElementById: id => els[id] || (els[id] = mk()), createElement: () => ({ style: {}, innerHTML: '', onclick: null }), addEventListener() {} },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, window: {} };
vm.createContext(ctx); vm.runInContext(code, ctx);
if (process.argv[3]) vm.runInContext(`for (const [k, v] of Object.entries(${process.argv[3]})) Object.assign(W[k], v)`, ctx);
vm.runInContext(`
  globalThis.duel = (wep, foe, skill, close) => {
    newGame(); S.c.fights = 99; S.f.penned = 1; S.weapons = [wep]; S.weapon = wep; S.armors = ['jacket']; S.armor = 'jacket';
    S.inv.ammo = 99; S.inv.gutglue = 1; for (const k in S.skills) S.skills[k] = skill;
    fight([spawn(foe)], { close, back: ['map'] });
    let r = 0, shots = 0;
    while (S && S.fight && !S.end && r++ < 80) {
      if (S.hp <= 10 && has('gutglue')) { take('gutglue'); heal(GLUE()); enemy(); continue; }
      if (!isGun(S.weapon) && !S.fight.close) closeIn(); else { if (isGun(S.weapon)) shots++; atk(0, null); }
    }
    return { won: !!S && !S.end && !S.fight, shots };
  };
`, ctx);
const weps = ['fists', 'knife', 'pipe', 'cleaver', 'sledge', 'drill', 'zipgun', 'rifle', 'molargun', 'shotgun', 'plasma'];
const cols = [['raider', 30, false], ['slaver', 30, false], ['slaver', 30, true], ['molarElite', 30, false], ['slaver', 55, false], ['molarElite', 55, false]];
console.log('weapon     dmg    hit  value' + cols.map(c => (c[0].slice(0, 6) + (c[2] ? 'C' : 'R') + c[1]).padStart(11)).join(''));
for (const w of weps) {
  const W = vm.runInContext(`W.${w}`, ctx);
  const row = cols.map(([f, sk, close]) => {
    let won = 0, sh = 0;
    for (let i = 0; i < N; i++) { vm.runInContext('S = null', ctx); const r = vm.runInContext(`duel('${w}', '${f}', ${sk}, ${close})`, ctx); if (r.won) { won++; sh += r.shots; } }
    return (Math.round(won * 100 / N) + '%' + (W.t === 'guns' && won ? '/' + Math.round(sh / won) : '')).padStart(11);
  });
  console.log(w.padEnd(10) + `${W.d[0]}-${W.d[1]}`.padStart(6) + String(W.a).padStart(5) + String(W.v).padStart(7) + row.join(''));
}
console.log('\nR = starts at range, C = up close; 30/55 = skill. Jacket, one Gut Glue. guns: win%/bullets used');
