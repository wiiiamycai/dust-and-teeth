// 2D view checks. Usage: node tests/walk.js index.html [games]
// For every place: the map draws, and every object, person and exit can be reached from where you arrive.
// Walking into things does what it should. Then a random walker plays many games looking for errors.
const vm = require('vm');
const code = require('./load')(process.argv[2]);
const N = +process.argv[3] || 200;
function mk() {
  const e = { _h: '', children: [], hidden: false, style: {}, appendChild(c) { this.children.push(c); } };
  Object.defineProperty(e, 'innerHTML', { get() { return this._h; }, set(v) { this._h = v; this.children = []; } });
  return e;
}
let els = {};
const store = {};
const ctx = { console, Math, JSON, String, Object, Array, Map, Set,
  document: { getElementById: id => els[id] || (els[id] = mk()), createElement: () => ({ style: {}, innerHTML: '', onclick: null }), addEventListener() {} },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const run = s => vm.runInContext(s, ctx);
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const setups = { silo: ['S.f.knowSilo = 1', 'S.f.knowSilo = 1; S.f.siloIn = 1'], skybus: ['', 'S.f.molesDead = 1'], chainfield: ['', "S.n.bess.loc = 'pen'; S.n.bert.loc = 'pen'"] };
for (const loc of Object.keys(run('MAPS'))) {
  for (const setup of setups[loc] || ['']) {
    run(`newGame(); S.view = '2d'; ${setup}; S.pos = null; go('hub', '${loc}')`);
    const tag = `${loc}${setup ? ' [' + setup + ']' : ''}`;
    check(run('S.scene') === 'hub' && run('TOWN && TOWN.loc') === loc, `${tag}: 2D hub did not open`);
    check(run("$('view').innerHTML.includes('🧍')"), `${tag}: player not drawn`);
    const cells = run("($('view').innerHTML.match(/<i /g) || []).length"), wh = run('TOWN.T.w * TOWN.T.h');
    check(cells === wh, `${tag}: drew ${cells} cells, expected ${wh}`);
    const bad = run(`(() => {
      const T = TOWN.T, out = [];
      const live = claim(TOWN.v.opts).by;
      for (const o of T.objs) if (live.has(o) && !(o.open && o.open()) && !pathTo(o.x, o.y)) out.push('object ' + o.n);
      for (const k in TOWN.people) { const [x, y] = k.split(',').map(Number); if (!pathTo(x, y)) out.push('person ' + TOWN.people[k]); }
      for (const e of T.exits) if (!pathTo(e.x, e.y)) out.push('exit ' + e.x + ',' + e.y);
      if (!T.exits.length && !T.objs.some(o => o.re && o.re.test('Climb back up'))) out.push('no way out');
      const ids = TOWN.v.ids.filter(id => !Object.values(TOWN.people).includes(id));
      if (ids.length) out.push('nowhere to stand: ' + ids.join(','));
      return out;
    })()`);
    bad.forEach(b => check(false, `${tag}: can't reach ${b}`));
  }
}
// Walking into things.
run(`newGame(); S.view = '2d'; S.pos = null; go('hub', 'scrapwell'); const w = TOWN.T.objs.find(o => o.k === 'W'); walkTo(w.x, w.y)`);
check(run('S.here') === 'well', 'walking into the well should climb down it');
run(`newGame(); S.view = '2d'; S.pos = null; go('hub', 'scrapwell'); const k = Object.keys(TOWN.people).find(k => TOWN.people[k] === 'gus').split(',').map(Number); walkTo(k[0], k[1])`);
check(run("S.scene === 'talk' && S.args[0] === 'gus'"), 'walking into Gus should talk to him');
run(`newGame(); S.view = '2d'; S.pos = null; go('hub', 'scrapwell'); const e = TOWN.T.exits[0]; walkTo(e.x, e.y)`);
check(run("S.scene === 'map'"), 'walking onto the exit should leave for the map');
run(`newGame(); S.view = '2d'; S.pos = null; go('hub', 'rustwater'); const u = TOWN.T.objs.find(o => o.k === 'U'); walkTo(u.x, u.y)`);
check(run("S.teeth < 25 || (S.inv && true)"), 'walking into the pump should offer water');
run(`newGame(); S.view = '2d'; S.pos = null; go('hub', 'rustwater')`);
check(!run("cur.some(o => /water/i.test(o[0]))"), 'the pump option should only show when you stand next to the pump');
run(`(() => { const u = TOWN.T.objs.find(o => o.k === 'U'); const r = pathTo(u.x, u.y); r.path.forEach(p => stepTo(p.x, p.y)); })()`);
check(run("cur.some(o => /water/i.test(o[0]))"), 'standing next to the pump should show the water option');
run(`newGame(); S.view = '2d'; go('hub', 'scrapwell'); move(1, 0); move(1, 0)`);
check(run('S.pos.x') === 3, 'arrow keys should move you');
run(`S.view = 'text'; goHere()`);
check(!run("$('view').innerHTML") && run("cur.some(o => /Walk around/.test(o[0]))"), 'list view should hide the map and offer it back');
// A random walker: wander, bump into things, take options, for many games.
const errs = {};
for (let g = 0; g < N; g++) {
  try {
    run("newGame(); S.view = '2d'; go('hub', 'scrapwell')");
    for (let i = 0; i < 160; i++) {
      if (!run('S') || run('S.end')) break;
      if (run("S.scene === 'hub' && !!TOWN") && Math.random() < 0.7) {
        run('walkTo(Math.floor(Math.random() * TOWN.T.w), Math.floor(Math.random() * TOWN.T.h))');
      } else {
        const n = run('cur.length');
        if (!n) break;
        run(`choose(${Math.floor(Math.random() * n)})`);
      }
    }
  } catch (e) {
    const k = String(e.message).slice(0, 80);
    errs[k] = (errs[k] || 0) + 1;
  }
}
Object.keys(errs).forEach(k => check(false, `random walker error x${errs[k]}: ${k}`));
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
console.log('walk ok');
