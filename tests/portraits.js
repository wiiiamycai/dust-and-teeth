// Checks the detailed portraits (scenes/portraits.js) without a browser. Usage: node tests/portraits.js index.html
// Everyone you can talk to has one, it draws without throwing, a blink changes the picture (the eyes close), and
// the file adds no top-level names beyond its own (PORT_*, PX, PORTRAIT, portrait*), since every script shares one scope.
const vm = require('vm'),
  fs = require('fs'),
  path = require('path'),
  code = require('./load')(process.argv[2] || 'index.html');
const ctx = { console, Math, JSON, document: { getElementById: () => ({ style: {}, children: [], appendChild() {} }), createElement: () => ({ style: {} }), addEventListener() {} }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const fails = [];
const IDS = 'elder gus crumb pell pig nigel moe mayor sheriff doc opal gloria jeb hector bess bert lou junior pete krug teo pips dice tam nan rook margie sprocket eel vane gums gardener warden moss fern rind ohm king'.split(' ');
// a pretend canvas that keeps the last colour put on every pixel
const fake = () => {
  const px = new Map(),
    g = {
      fillStyle: '#000',
      fillRect(x, y, w, h) {
        for (let j = Math.floor(y); j < y + h; j++) for (let i = Math.floor(x); i < x + w; i++) if (i >= 0 && j >= 0 && i < 64 && j < 64) px.set(j * 64 + i, g.fillStyle);
      },
    };
  return { g, px };
};
const r = vm.runInContext('({ PORTRAIT, PX, NPC })', ctx);
for (const id of IDS) {
  if (!r.NPC[id]) fails.push(id + ': not in NPC');
  if (typeof r.PORTRAIT[id] !== 'function') {
    fails.push(id + ': no portrait');
    continue;
  }
  const a = fake(),
    b = fake();
  try {
    r.PORTRAIT[id](a.g, r.PX, { shut: false, mood: 0 });
    r.PORTRAIT[id](b.g, r.PX, { shut: true, mood: 0 });
  } catch (e) {
    fails.push(id + ': ' + e.message);
    continue;
  }
  if (a.px.size < 64 * 64) fails.push(id + ': leaves ' + (64 * 64 - a.px.size) + ' pixels unpainted');
  let diff = 0;
  for (const [k, c] of a.px) if (b.px.get(k) !== c) diff++;
  if (!diff) fails.push(id + ': blinking changes nothing');
  if (diff > 60) fails.push(id + ': blinking changes ' + diff + ' pixels, more than the eyes');
}
// no stray globals
const src = fs.readFileSync(path.join(__dirname, '..', 'scenes', 'portraits.js'), 'utf8');
for (const m of src.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm))
  if (!/^(PORT_\w+|PX|PORTRAIT|portrait\w*|port[A-Z]\w*)$/.test(m[1])) fails.push('portraits.js: a new top-level name ' + m[1]);
for (const m of src.matchAll(/^const\s+PORT_W\s*=[^;]*,\s*\n?\s*(\w+)/gm)) if (!/^PORT_/.test(m[1])) fails.push('portraits.js: a new top-level name ' + m[1]);
if (fails.length) {
  console.log(fails.join('\n'));
  process.exit(1);
}
console.log('portraits ok: ' + IDS.length + ' drawn, all blink');
