// Melee vs guns balance. Usage: node tests/balance.js index.html [fights]
// Plays many duels with the starting character against fixed enemies, once per weapon,
// and fails if melee is strictly worse than guns again (the v2 problem).
// A road fight starts at range: melee must close in first. Guns get unlimited bullets here,
// so this is the gun's best case; in the real game every shot costs a bullet.
const vm = require('vm');
const code = require('./load')(process.argv[2]);
const N = +process.argv[3] || 3000;
function mk() {
  const e = { _h: '', children: [], hidden: false, style: {}, appendChild(c) { this.children.push(c); } };
  Object.defineProperty(e, 'innerHTML', { get() { return this._h; }, set(v) { this._h = v; this.children = []; } });
  return e;
}
const els = {}, store = {};
const ctx = { console, Math, JSON, String, Object, Array,
  document: { getElementById: id => els[id] || (els[id] = mk()), createElement: () => ({ style: {}, innerHTML: '', onclick: null }), addEventListener() {} },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
vm.runInContext(`
  function duel(wep, foeLv, close, mods) {
    newGame(); S.weapons.push(wep); S.weapon = wep; S.inv.ammo = 999; if (mods) S.mods[wep] = mods;
    S.c.fights = 99; // no toughness growth, no perks from this
    fight([mkE('Raider', 'R', foeLv)], { close });
    let rounds = 0;
    while (S && S.fight && !S.end && rounds < 60) {
      rounds++;
      if (!isGun(S.weapon) && !S.fight.close) closeIn(); else atk(0, null);
    }
    return { won: !!S && !S.end, hp: S && !S.end ? S.hp : 0, rounds };
  }
  globalThis.duel = duel;
`, ctx);
// Sprocket's mods: with both sides fully upgraded (melee: edge and grip; guns: scope and barrel), the same rule must hold.
const MM = "['edge','wrap']", GM = "['scope','barrel']";
const cases = [['knife', 'zipgun'], ['pipe', 'zipgun'], ['sledge', 'rifle'], ['cleaver', 'shotgun'], ['knife', 'zipgun', 1], ['sledge', 'rifle', 1], ['cleaver', 'shotgun', 1]];
let fail = 0;
for (const lv of [2, 4]) {
  for (const [m, g, modded] of cases) {
    const res = {};
    for (const w of [m, g]) {
      const mods = modded ? (w === m ? MM : GM) : 'null';
      let won = 0, hp = 0;
      for (let i = 0; i < N; i++) {
        vm.runInContext('S = null', ctx);
        const r = vm.runInContext(`duel('${w}', ${lv}, false, ${mods})`, ctx);
        if (r.won) { won++; hp += r.hp; }
      }
      res[w] = { win: Math.round((won * 100) / N), hpLeft: won ? Math.round(hp / won) : 0 };
    }
    // melee must not be strictly worse: either it wins about as often, or it leaves you healthier
    const ok = res[m].win >= res[g].win - 10 || res[m].hpLeft > res[g].hpLeft;
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'BAD '} Lv ${lv} raider, at range${modded ? ', all modded' : ''}:  ${m.padEnd(8)} win ${String(res[m].win).padStart(3)}% hp left ${String(res[m].hpLeft).padStart(2)}   |   ${g.padEnd(8)} win ${String(res[g].win).padStart(3)}% hp left ${String(res[g].hpLeft).padStart(2)}`);
  }
}
process.exit(fail ? 1 : 0);
