// Guard for Will's rule: every character gives you a reason to care, on a FIRST meeting.
// Starts a fresh game, then for each person in IDS opens their talk screen at their own place
// and counts the real options: everything except "Any news?", attack, murder and back.
// Fails if any non-animal character offers none. Usage: node tests/care.js index.html [--list]
const vm = require('vm');
const code = require('./load')(process.argv[2] || 'index.html');
const list = process.argv.includes('--list');
function mk() {
  const e = { _h: '', children: [], hidden: false, style: {}, appendChild(c) { this.children.push(c); } };
  Object.defineProperty(e, 'innerHTML', { get() { return this._h; }, set(v) { this._h = v; this.children = []; } });
  return e;
}
const els = {}, store = {};
const ctx = {
  console, Math, JSON, String, Object, Array,
  document: { getElementById: id => els[id] || (els[id] = mk()), createElement: () => ({ style: {}, innerHTML: '', onclick: null }), addEventListener() {} },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } },
  window: {},
};
vm.createContext(ctx);
vm.runInContext(code, ctx);
const out = vm.runInContext(
  `(() => {
    const skip = /Any news|^Attack |^Murder |^Back$/;
    return IDS.map(id => {
      newGame();
      S.scene = 'hub';
      S.here = NPC[id].loc === 'cage' ? 'rustwater' : NPC[id].loc === 'vats' ? 'green' : NPC[id].loc === 'well' ? 'well' : NPC[id].loc;
      S.f.inGreen = 1;
      pend = [];
      let err = null;
      try { go('talk', id); } catch (e) { err = e.message; }
      const real = cur.map(o => o[0]).filter(t => !skip.test(t));
      return { id, animal: !!NPC[id].animal, err, real };
    });
  })()`,
  ctx,
);
let bad = 0;
for (const r of out) {
  const fail = r.err || (!r.animal && !r.real.length);
  if (fail) bad++;
  if (list || fail) console.log(`${fail ? 'FAIL' : 'ok  '} ${r.id.padEnd(9)} ${r.real.length}  ${r.err ? 'ERROR ' + r.err : r.real.join(' | ')}`);
}
console.log(bad ? `${bad} characters offer nothing on a first meeting` : `all ${out.length} characters offer something`);
process.exit(bad ? 1 : 0);
