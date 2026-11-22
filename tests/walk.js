// 2D view checks. Usage: node tests/walk.js index.html [games]
// For every place: the map draws, and every object, person and exit can be reached from where you arrive.
// Walking into things does what it should. Then a random walker plays many games looking for errors.
// The isometric view (scenes/iso.js) is checked with a fake canvas: it draws everywhere, clicks map back
// to the right tiles, the views cycle, and the fog of war survives a reload.
const vm = require('vm');
const code = require('./load')(process.argv[2]);
const N = +process.argv[3] || 200;
function mk() {
  const e = { _h: '', children: [], hidden: false, style: {}, appendChild(c) { this.children.push(c); } };
  Object.defineProperty(e, 'innerHTML', { get() { return this._h; }, set(v) { this._h = v; this.children = []; } });
  return e;
}
// A canvas that draws nothing but accepts every call. Off until the isometric checks.
const g2d = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ({ addColorStop() {} })), set: (t, k, v) => ((t[k] = v), true) });
const canvas = () => ({ width: 0, height: 0, style: {}, isConnected: true, getContext: g2d,
  getBoundingClientRect() { return { left: 0, top: 0, width: this.width, height: this.height }; } });
let canvasOn = false;
function boot(store) {
  const els = {};
  const c = { console, Math, JSON, String, Object, Array, Map, Set,
    document: {
      getElementById: id => els[id] || (els[id] = (id === 'isoc' || id === 'portc') && canvasOn ? canvas() : mk()),
      createElement: t => (t === 'canvas' && canvasOn ? canvas() : { style: {}, innerHTML: '', onclick: null }),
      addEventListener() {},
    },
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, window: {} };
  vm.createContext(c);
  vm.runInContext(code, c);
  return c;
}
const store = {};
let ctx = boot(store);
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

// ---- the isometric view ----
canvasOn = true;
run("newGame(); S.view = 'text'; goHere()");
run("cur.find(o => /Walk around/.test(o[0]))[1]()");
check(run("S.view === 'iso' && isIso() && $('view').innerHTML.includes('isoc')"), 'with a canvas, the map option should open the isometric view');
for (const loc of Object.keys(run('MAPS'))) {
  for (const setup of setups[loc] || ['']) {
    run(`newGame(); S.view = 'iso'; ${setup}; S.pos = null; go('hub', '${loc}')`);
    const tag = `iso ${loc}${setup ? ' [' + setup + ']' : ''}`;
    check(run(`!!ISO && ISO.loc === '${loc}' && ISO.hits.length > 0 && ISO.W > 0`), `${tag}: did not draw`);
    check(run(`!$('view').innerHTML.includes('<i ') && $('view').innerHTML.includes('legend')`), `${tag}: should show the canvas and the legend, not the flat grid`);
    // The maths: the centre of every tile maps back to that tile.
    const off = run(`(() => { const out = []; for (let y = 0; y < TOWN.T.h; y++) for (let x = 0; x < TOWN.T.w; x++) { const c = isoXY(x, y), t = isoGround(c.x, c.y); if (t.x !== x || t.y !== y) out.push(x + ',' + y); } return out; })()`);
    check(!off.length, `${tag}: tile centres map back wrong: ${off.slice(0, 5).join(' ')}`);
    // A click lands on the tile under it, or on something drawn in front of it, never on something behind.
    const behind = run(`(() => { const out = []; for (let y = 0; y < TOWN.T.h; y++) for (let x = 0; x < TOWN.T.w; x++) { const c = isoXY(x, y), t = isoPick(c.x, c.y); if (!t || t.x + t.y < x + y) out.push(x + ',' + y); } return out; })()`);
    check(!behind.length, `${tag}: clicks pick a tile behind: ${behind.slice(0, 5).join(' ')}`);
    // Every exit and every person in sight can be clicked on directly.
    const miss = run(`(() => { const out = [], want = [...TOWN.T.exits, ...Object.keys(TOWN.people).map(k => { const [x, y] = k.split(',').map(Number); return { x, y }; })];
      for (const p of want) { if (!(ISO.vis[p.y * TOWN.T.w + p.x] > 0)) continue; const c = isoXY(p.x, p.y), t = isoPick(c.x, c.y - 2); if (!t || t.x !== p.x || t.y !== p.y) out.push(p.x + ',' + p.y); } return out; })()`);
    check(!miss.length, `${tag}: can't click on ${miss.join(' ')}`);
  }
}
run("newGame(); S.view = 'iso'; S.pos = null; go('hub', 'scrapwell'); { const c = isoXY(TOWN.T.exits[0].x, TOWN.T.exits[0].y); isoClick(c.x, c.y) }");
check(run("S.scene === 'map'"), 'iso: clicking the exit should leave for the map');
run("newGame(); S.view = 'iso'; S.pos = null; go('hub', 'scrapwell'); { const w = TOWN.T.objs.find(o => o.k === 'W'), c = isoXY(w.x, w.y); isoClick(c.x, c.y) }");
check(run("S.here === 'well'"), 'iso: clicking the well, out of sight, should still walk there and climb down');
run("newGame(); S.view = 'iso'; S.pos = null; go('hub', 'scrapwell'); move(1, 0); move(1, 0)");
check(run('S.pos.x') === 3 && run("$('view').innerHTML.includes('isoc')"), 'iso: arrow keys should move you');
// Light follows the day number.
run('S.day = 4; goHere()');
check(run("ISO.light.n === 'Night' && ISO.light.sight === 5 && $('view').innerHTML.includes('Night.')"), 'iso: day 4 should be night, with sight 5');
run('S.day = 1; goHere()');
check(run("ISO.light.n === 'Noon' && ISO.light.sight === 7"), 'iso: day 1 should be noon');
// The views cycle: isometric, flat, list, isometric.
run('cur.find(o => /Flat map view/.test(o[0]))[1]()');
check(run("S.view === '2d' && $('view').innerHTML.includes('<i ')"), 'iso: "Flat map view" should open the flat map');
run('cur.find(o => /List view/.test(o[0]))[1]()');
check(run("S.view === 'text' && !$('view').innerHTML"), 'flat: "List view" should open the list');
run('cur.find(o => /Walk around/.test(o[0]))[1]()');
check(run("S.view === 'iso'"), 'list: "Walk around" should go back to the isometric view');
// Fog of war: near you is seen, far away isn't, walking reveals more, and it survives a reload.
run("newGame(); S.view = 'iso'; S.pos = null; go('hub', 'scrapwell')");
const seenAt = () => run('[...ISO.seen].reduce((a, b) => a + b, 0)');
const s0 = seenAt();
check(s0 > 0 && s0 < run('TOWN.T.w * TOWN.T.h'), `iso: fog should show part of the map at first (saw ${s0})`);
check(run('ISO.seen[S.pos.y * TOWN.T.w + S.pos.x] === 1 && !ISO.seen[1 * TOWN.T.w + 22]'), 'iso: you should see your own tile and not the far corner');
run('walkTo(20, 6)');
const s1 = seenAt();
check(s1 > s0 && run('S.pos.x === 20 && S.pos.y === 6'), `iso: walking should reveal more (${s0} then ${s1})`);
const fog = run('S.seen.scrapwell');
run('save()');
ctx = boot(store);
check(run("!!S && S.scene === 'hub' && S.seen && S.seen.scrapwell") === fog, 'iso: the fog should be saved and loaded');
check(run("!!ISO && ISO.loc === 'scrapwell'") && seenAt() === s1, `iso: after a reload the same tiles should be seen (${s1} then ${seenAt()})`);
// A body lies where someone died here, but a kill on the road leaves nothing in the next town.
run("newGame(); S.view = 'iso'; S.pos = null; go('hub', 'scrapwell'); S.f.corpse = 'a raider'; goHere()");
check(run("isoCorpse && isoCorpse.loc === 'scrapwell'"), 'iso: a death here should leave a body here');
run("S.f.corpse = 'a mutant'; go('hub', 'rustwater')");
check(run('isoCorpse && isoCorpse.loc === null'), 'iso: a death on the road should not leave a body in the next town');
// Portraits: talking to someone shows theirs; a place's screen doesn't.
run("newGame(); go('talk', 'bess')");
check(run("$('head').innerHTML.includes('portc') && !$('head').innerHTML.includes('👩‍🌾')"), 'with a canvas, talking to Bess should show her portrait');
run("S.view = 'text'; go('hub', 'farm')");
check(run("!$('head').innerHTML.includes('portc')"), 'a place should not get a portrait');
// A random walker in the isometric view, clicking anywhere on the canvas.
const errs2 = {};
for (let g = 0; g < Math.ceil(N / 3); g++) {
  try {
    run("newGame(); S.view = 'iso'; go('hub', 'scrapwell')");
    for (let i = 0; i < 160; i++) {
      if (!run('S') || run('S.end')) break;
      if (run("S.scene === 'hub' && !!TOWN && !!ISO") && Math.random() < 0.7) run('isoClick(Math.random() * ISO.W, Math.random() * ISO.H)');
      else {
        const n = run('cur.length');
        if (!n) break;
        run(`choose(${Math.floor(Math.random() * n)})`);
      }
    }
  } catch (e) {
    const k = String(e.message).slice(0, 80);
    errs2[k] = (errs2[k] || 0) + 1;
  }
}
Object.keys(errs2).forEach(k => check(false, `iso random walker error x${errs2[k]}: ${k}`));
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
console.log('walk ok');
