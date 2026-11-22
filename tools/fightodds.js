// Fight odds for real loadouts against real encounters, with Gut Glue used as a player would.
// Usage: node tools/fightodds.js [fights per cell]. Not part of the tests: it's for balancing by eye.
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
vm.runInContext(`
  globalThis.sim = (kit, enemies, opts) => {
    newGame(); S.c.fights = 99; S.f.penned = 1; // no pens rescue: a loss is a loss
    S.weapons = kit.w.slice(); S.weapon = kit.w[0]; S.armors = [kit.a]; S.armor = kit.a; S.inv.ammo = 60; S.inv.gutglue = kit.glue;
    S.mods = kit.mods || {};
    if (kit.skill) for (const k in S.skills) S.skills[k] = kit.skill;
    fight(enemies(), { close: !!(opts && opts.close), back: ['map'] });
    let r = 0;
    while (S && S.fight && !S.end && r++ < 80) {
      if (S.hp <= 12 && has('gutglue')) { take('gutglue'); heal(GLUE()); enemy(); continue; }
      const F = S.fight;
      if (!isGun(S.weapon) && !F.close) { const ow = otherWeapon(); if (ow) { S.weapon = ow; continue; } closeIn(); }
      else { if (dry(S.weapon)) { const ow = otherWeapon(); S.weapon = ow || 'fists'; continue; }
        if (F.close && isGun(S.weapon)) { const ow = otherWeapon(); if (ow && W[ow].d[1] >= W[S.weapon].d[1] - 2) { S.weapon = ow; continue; } }
        atk(0, null); }
    }
    return { won: !!S && !S.end && !S.fight, glue: S ? kit.glue - (S.inv.gutglue || 0) : 0 };
  };
`, ctx);
const kits = {
  start: { w: ['knife'], a: 'rags', glue: 3 },
  early: { w: ['pipe', 'zipgun'], a: 'jacket', glue: 3 },
  mid: { w: ['shotgun', 'sledge'], a: 'jacket', glue: 3 },
  midMod: { w: ['shotgun', 'sledge'], a: 'jacket', glue: 3, mods: { shotgun: ['scope', 'barrel'], sledge: ['edge', 'wrap'], jacket: ['plates'] } },
  late: { w: ['molargun', 'sledge'], a: 'riot', glue: 3, skill: 55 },
  lateMod: { w: ['molargun', 'sledge'], a: 'riot', glue: 3, skill: 55, mods: { molargun: ['scope', 'barrel'], sledge: ['edge', 'wrap'], riot: ['plates'] } },
};
const fights = {
  '2 raiders': "() => [spawn('raider'), spawn('raider')]",
  'raider gang': "() => [spawn('raiderBoss'), spawn('raider'), spawn('raider')]",
  '2 Molars (early)': "() => [spawn('molar'), spawn('molar')]",
  '3 Molars (day 17)': "() => [spawn('molar'), spawn('molarVet'), spawn('molar')]",
  '2 slavers': "() => [spawn('slaver'), spawn('slaver')]",
  'bounty pair': "() => [spawn('bounty'), spawn('bounty')]",
  'mall eel (close)': "() => [spawn('mallEel')]",
  'Warden + watchman': "() => [foe('warden'), spawn('watchman')]",
  'Krug + 2 slavers': "() => [foe('krug'), spawn('slaver'), spawn('slaver')]",
  'King + 2 elites': "() => [foe('king'), spawn('molarElite'), spawn('molarElite')]",
  'King alone': "() => [foe('king')]",
  'King alone, drill jammed': "() => { S.n.king.st.wep = 'sledge'; return [foe('king')]; }",
  'Gutmaw': "() => [gutmawE()]",
};
const ks = Object.keys(kits);
console.log('fight'.padEnd(28) + ks.map(k => k.padStart(9)).join(''));
for (const f in fights) {
  const row = ks.map(k => {
    let w = 0, g = 0;
    for (let i = 0; i < N; i++) { vm.runInContext('S = null', ctx); const r = vm.runInContext(`sim(${JSON.stringify(kits[k])}, ${fights[f]}, { close: ${/close/.test(f)} })`, ctx); if (r.won) { w++; g += r.glue; } }
    return (Math.round(w * 100 / N) + '%' + (w ? '/' + (g / w).toFixed(1) : '')).padStart(9);
  });
  console.log(f.padEnd(28) + row.join(''));
}
console.log('\nwin% / Gut Glue used when winning (3 carried)');
