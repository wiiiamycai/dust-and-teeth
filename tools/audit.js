// Depth audit: where is the game thin? Usage: node tools/audit.js [index.html]
// Writes tools/AUDIT.md and prints a summary. It reads the code (and loads the game headless for its tables),
// so it finds shallow spots, not bugs:
//   1. facts a check needs (knew) that nothing teaches (know): checks you can never pass
//   2. flags set but never read: something happened, and nothing ever cares
//   3. secrets with no one to tell: they only feed the squeeze-or-keep screen
//   4. events with no reaction line or hook: nobody remarks on them
//   5. plots with fewer than three ways to change them (web.js promises three)
//   6. a depth table per person: jobs, secrets, bonds, plots, checks, ripples. Lowest first.
const fs = require('fs'),
  path = require('path'),
  vm = require('vm');
const html = process.argv[2] || path.join(__dirname, '..', 'index.html');
const dir = path.dirname(html);
const files = [...fs.readFileSync(html, 'utf8').matchAll(/<script src="([^"?]+)/g)].map(m => m[1]);
const SRC = files.map(f => ({ f, t: fs.readFileSync(path.join(dir, f), 'utf8') }));
const all = SRC.map(s => s.t).join('\n');
const where = re => {
  const out = [];
  for (const { f, t } of SRC)
    t.split('\n').forEach((l, i) => {
      if (re.test(l)) out.push(`${f}:${i + 1}`);
    });
  return out;
};
const lits = re => new Set([...all.matchAll(re)].map(m => m[1]));

// ---- load the game for its tables ----
const ctx = {
  console: { log() {}, warn() {}, error() {} },
  Math,
  JSON,
  document: {
    getElementById: () => ({ style: {}, children: [], appendChild() {} }),
    createElement: () => ({ style: {} }),
    addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  window: {},
};
vm.createContext(ctx);
vm.runInContext(require('../tests/load')(html), ctx);
const G = k => vm.runInContext(k, ctx);
const NPC = G('NPC'),
  SECRETS = G('SECRETS'),
  BONDS = G('BONDS'),
  PLOTS = G('PLOTS'),
  RIPPLE = G('RIPPLE'),
  EV = G('EV'),
  RXG = G('RXG'),
  RXS = G('RXS'),
  REACT = G('REACT'),
  LOGIC = G('LOGIC');
const people = Object.keys(NPC).filter(id => !NPC[id].animal);

// ---- 1. facts you need but can never learn ----
const needed = lits(/knew\('([^']+)'\)/g);
for (const m of all.matchAll(/likes:\s*\{([^}]*)\}/g)) for (const k of m[1].matchAll(/'([^']+)'/g)) needed.add(k[1]);
for (const m of all.matchAll(/plotKnown\('([^']+)'\)/g)) needed.add('plot.' + m[1]);
const taught = lits(/know\('([^']+)'\)/g);
for (const m of all.matchAll(/askOpt\(\s*'\w+',\s*'([^']+)'/g)) taught.add(m[1]); // Ask lines teach their fact
Object.keys(PLOTS).forEach(k => PLOTS[k].clue && taught.add('plot.' + k)); // clues teach plots
Object.keys(SECRETS).forEach(k => {
  // a secret is learnable if someone tells it, or its owner confides it after a job
  if (SECRETS[k].tell.length || new RegExp(`confide\\('${k}'`).test(all)) taught.add(k + '.secret');
});
const unlearnable = [...needed].filter(k => !taught.has(k)).sort();

// ---- 2. flags set but never read ----
const dynPrefix = [...all.matchAll(/S\.f\[\s*'([a-zA-Z_]+)'\s*\+/g)].map(m => m[1]);
const writes = new Map();
const writeRe = /(?<![\w.])(?:S\.)?f\.([a-zA-Z_]\w*)\s*(?:=(?!=)|\+\+|--|\+=|-=|\|\|=)/g;
const flagSRC = SRC.filter(s => /S\.f[.\[;,\s]/.test(s.t)); // files where f can mean S.f
for (const { f, t } of flagSRC)
  t.split('\n').forEach((l, i) => {
    for (const m of l.matchAll(writeRe)) if (!writes.has(m[1])) writes.set(m[1], `${f}:${i + 1}`);
  });
const reads = new Set();
const readRe = /(?<![\w.])(?:S\.)?f\.([a-zA-Z_]\w*)(?!\s*(?:=(?!=)|\+\+|--|\+=|-=|\|\|=))/g;
for (const m of flagSRC.map(s => s.t).join('\n').matchAll(readRe)) reads.add(m[1]);
for (const m of all.matchAll(/S\.f\['([a-zA-Z_]\w*)'\](?!\s*=(?!=))/g)) reads.add(m[1]);
const unread = [...writes.keys()].filter(k => !reads.has(k) && !dynPrefix.some(p => k.startsWith(p))).sort();

// ---- 3. secrets with no one to tell ----
const secretUses = {};
for (const k of Object.keys(SECRETS)) {
  const re = new RegExp(`knew\\('${k}\\.secret'\\)`, 'g');
  const inLogic = (fs.readFileSync(path.join(dir, 'scenes/logic.js'), 'utf8').match(re) || []).length;
  const inTell = (fs.readFileSync(path.join(dir, 'scenes/secrets.js'), 'utf8').match(re) || []).length;
  const total = (all.match(re) || []).length;
  secretUses[k] = { key: inLogic, tell: inTell, other: total - inLogic - inTell };
}
const untold = Object.keys(secretUses).filter(k => !secretUses[k].tell);
const idle = Object.keys(secretUses).filter(k => !secretUses[k].tell && !secretUses[k].key && !secretUses[k].other);

// ---- 4. events nobody reacts to ----
const emitted = lits(/event\('([a-z]+)'/g);
const evRows = [...new Set([...Object.keys(EV), ...emitted])].sort().map(t => ({
  t,
  def: !!EV[t],
  emit: emitted.has(t),
  line: !!RXG[t] || Object.keys(RXS).some(k => k.startsWith(t + '::')),
  hook:
    !!REACT[t] ||
    new RegExp(`type === '${t}'`).test(all) ||
    (all.match(new RegExp(`'${t}'`, 'g')) || []).length > (all.match(new RegExp(`event\\('${t}'`, 'g')) || []).length,
}));
const mute = evRows.filter(r => r.emit && !r.line && !r.hook).map(r => r.t);
const neverEmitted = evRows.filter(r => r.def && !r.emit).map(r => r.t);

// ---- 5. plots with fewer than three ways ----
const plotRows = Object.keys(PLOTS)
  .map(k => ({ k, ways: Object.keys(PLOTS[k].opts || {}).length }))
  .sort((a, b) => a.ways - b.ways);
const thinPlots = plotRows.filter(p => p.ways < 3);

// ---- 6. depth per person ----
const checksBy = {};
for (const key of Object.keys(LOGIC)) {
  let s;
  try {
    s = G(`CK[${JSON.stringify(key)}]`);
  } catch (e) {}
  const who = s && typeof s === 'object' && s.who;
  if (who) checksBy[who] = (checksBy[who] || 0) + 1;
}
const rows = people.map(id => {
  const jobs = (all.match(new RegExp(`jobs\\('${id}'`, 'g')) || []).length;
  const bonds = BONDS.filter(b => b[0] === id || b[1] === id).length;
  const plots = Object.keys(PLOTS).filter(
    k => Object.keys(PLOTS[k].opts || {}).some(o => o.replace(/\d$/, '') === id) || (PLOTS[k].clue || {})[id],
  ).length;
  const tells = Object.keys(SECRETS).filter(k => SECRETS[k].tell.includes(id)).length;
  const su = secretUses[id] || { key: 0, tell: 0, other: 0 };
  const own = SECRETS[id] ? su.key + su.tell + su.other : 0;
  const hears = (fs.readFileSync(path.join(dir, 'scenes/secrets.js'), 'utf8').match(new RegExp(`jobs\\('${id}'`, 'g')) || [])
    .length;
  const r = {
    id,
    n: NPC[id].n,
    jobs,
    bonds,
    plots,
    tells,
    own,
    hears,
    checks: checksBy[id] || 0,
    ripple: RIPPLE[id] ? 1 : 0,
  };
  r.score = r.jobs * 2 + r.bonds + r.plots * 2 + r.tells + r.own + r.hears * 2 + r.checks + r.ripple * 2;
  return r;
});
rows.sort((a, b) => a.score - b.score);

// ---- report ----
const L = [];
const sec = (t, items, why) => {
  L.push(`## ${t} (${items.length})`, '', why, '');
  if (!items.length) L.push('None.', '');
};
L.push(
  '# Depth audit',
  '',
  `Generated by \`node tools/audit.js\`. ${people.length} people, ${Object.keys(SECRETS).length} secrets, ${Object.keys(PLOTS).length} plots, ${Object.keys(EV).length} event types.`,
  '',
);
sec(
  '1. Facts a check needs that nothing teaches',
  unlearnable,
  'A line or check needs this fact, and no code ever teaches it. Either teach it somewhere, or it can never happen.',
);
unlearnable.forEach(k => L.push(`- \`${k}\`: needed at ${where(new RegExp(`'${k.replace('.', '\\.')}'`)).slice(0, 3).join(', ')}`));
if (unlearnable.length) L.push('');
sec(
  '2. Flags set but never read',
  unread,
  'Something happened and set a flag, and nothing ever looks at it again. Each is a consequence waiting to be written.',
);
unread.forEach(k => L.push(`- \`${k}\` (set at ${writes.get(k)})`));
if (unread.length) L.push('');
sec(
  '3. Secrets with no one to tell',
  untold,
  'Telling is the main use of a secret (decision 238). These have no telling yet. **Bold** ones are used nowhere at all.',
);
L.push('| Secret | Unlocks a check | Telling lines | Other uses |', '|---|---|---|---|');
untold.forEach(k => {
  const u = secretUses[k];
  L.push(`| ${idle.includes(k) ? `**${k}**` : k} (${NPC[k].n}) | ${u.key} | ${u.tell} | ${u.other} |`);
});
L.push('');
sec(
  '4. Events nobody reacts to',
  mute,
  'These events happen in the game, but no one has a line about them and no hook acts on them.',
);
mute.forEach(t => L.push(`- \`${t}\``));
if (neverEmitted.length) L.push('', `Defined but never happen: ${neverEmitted.map(t => '`' + t + '`').join(', ')}.`);
L.push('');
sec('5. Plots with fewer than three ways to change them', thinPlots, 'Every plot should be changeable three or more ways.');
L.push('| Plot | Ways |', '|---|---|');
plotRows.forEach(p => L.push(`| ${p.k} | ${p.ways} |`));
L.push('');
L.push(
  '## 6. Depth per person, thinnest first',
  '',
  'Score = jobs x2 + bonds + plots x2 + secrets they tell + uses of their own secret + telling lines they hear x2 + story checks aimed at them + a ripple when they die x2.',
  '',
  '| Person | Score | Jobs | Bonds | Plots | Tells | Own secret uses | Hears | Checks | Ripple |',
  '|---|---|---|---|---|---|---|---|---|---|',
);
rows.forEach(r =>
  L.push(
    `| ${r.n} | ${r.score} | ${r.jobs} | ${r.bonds} | ${r.plots} | ${r.tells} | ${r.own} | ${r.hears} | ${r.checks} | ${r.ripple} |`,
  ),
);
fs.writeFileSync(path.join(__dirname, 'AUDIT.md'), L.join('\n') + '\n');
console.log(
  [
    `unlearnable facts: ${unlearnable.length}`,
    `flags never read: ${unread.length}`,
    `secrets with no telling: ${untold.length} (${idle.length} used nowhere)`,
    `events nobody reacts to: ${mute.length}`,
    `plots under 3 ways: ${thinPlots.length}`,
    `thinnest people: ${rows
      .slice(0, 6)
      .map(r => `${r.n} (${r.score})`)
      .join(', ')}`,
    'Full report: tools/AUDIT.md',
  ].join('\n'),
);
