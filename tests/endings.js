// Checks that the ending remembers who you killed (scenes/epitaphs.js). Usage: node tests/endings.js index.html
// Kill each named person in turn, end the game, and read every slide: there must be one that says you did it,
// quietly ("Nobody ever found out") if nobody saw. Someone who dies by another hand must not be put on you.
const vm = require('vm'),
  code = require('./load')(process.argv[2] || 'index.html');
const el = () => ({ style: {}, children: [], appendChild() {}, classList: { add() {}, remove() {}, toggle() {} } });
const ctx = { console, Math, JSON, document: { getElementById: el, createElement: el, addEventListener() {}, body: el() }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const fails = vm.runInContext(
  `(() => {
  const out = [];
  const slides = (id, how, loud) => {
    newGame();
    say = () => {};
    bad = () => {};
    S.here = 'nowhere';
    if (how) kill(id, how, loud);
    else S.dead[id] = 1;
    S.end = { type: 'retired' };
    const t = [], sh = show;
    show = v => {
      t.push(v.text);
      if (v.opts && v.opts[0] && v.opts[0][0] === 'Next' && t.length < 300) v.opts[0][1]();
    };
    try { SC.ending(); } catch (e) { t.push('ERR ' + e.message); }
    show = sh;
    return t;
  };
  for (const id of IDS) {
    if (EPI_SKIP.includes(id)) continue;
    const n = NPC[id].n.replace(/^The /, 'the ');
    const q = slides(id, 'murder', false), l = slides(id, 'murder', true), o = slides(id);
    if (q.some(s => s.startsWith('ERR')) || l.some(s => s.startsWith('ERR'))) out.push(id + ': the ending throws');
    if (!q.some(s => s.startsWith('Nobody ever found out who killed ' + n + '.'))) out.push(id + ': no slide for a quiet killing');
    if (!l.some(s => s.startsWith('You killed ' + n + '.'))) out.push(id + ': no slide for a loud killing');
    if (o.some(s => s.includes('killed ' + n + '.'))) out.push(id + ': died by another hand, but the ending blames you');
    if (q.concat(l).some(s => s.includes('\\u2014'))) out.push(id + ': an em dash');
  }
  return out;
})()`,
  ctx,
);
if (fails.length) {
  console.log(fails.join('\n'));
  process.exit(1);
}
console.log('endings ok: everyone you kill gets a slide');
