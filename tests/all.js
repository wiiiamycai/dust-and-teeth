// Runs every test and exits non-zero if any fails. Usage: node tests/all.js [index.html] [--quick]
//   --quick  fewer fuzz games (300 instead of 1500), for fast iteration. Always do a full run before committing.
// Path cases live in tests/paths.json: [{ "name": "...", "steps": [...] }]. A case fails if path.js exits non-zero.
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const args = process.argv.slice(2),
  quick = args.includes('--quick'),
  html = args.find(a => !a.startsWith('--')) || 'index.html';
const T = f => path.join(__dirname, f),
  run = (f, a) => execFileSync(process.execPath, [T(f), html, ...a], { encoding: 'utf8', maxBuffer: 1 << 26 });
let fail = 0;
const ok = (name, good, detail) => {
  console.log(`${good ? 'PASS' : 'FAIL'}  ${name}${good ? '' : '\n      ' + detail}`);
  if (!good) fail++;
};
const N = quick ? '300' : '1500';
for (const mode of ['rand', 'survive', 'late']) {
  const j = JSON.parse(run('fuzz.js', [N, mode]));
  const probs = { errors: j.errors, dead: j.dead, bad: j.bad };
  ok(`fuzz ${mode} x${N}`, !Object.values(probs).some(o => Object.keys(o).length), JSON.stringify(probs).slice(0, 600));
}
try {
  const b = run('balance.js', [quick ? '500' : '2000']);
  ok('balance: melee is not strictly worse than guns', true);
  if (!quick) console.log(b.replace(/^/gm, '      ').trimEnd());
} catch (e) {
  ok('balance: melee is not strictly worse than guns', false, String(e.stdout).trim());
}
try {
  run('sprites.js', []);
  ok('portraits: every grid is well formed, and everyone has one', true);
} catch (e) {
  ok('portraits: every grid is well formed, and everyone has one', false, String(e.stdout || e.message).trim().slice(0, 600));
}
try {
  run('care.js', []);
  ok('care: every character offers something on a first meeting', true);
} catch (e) {
  ok('care: every character offers something on a first meeting', false, String(e.stdout || e.message).trim().slice(0, 600));
}
const r = run('reload.js', []);
ok('reload', /errs: \{\}, bad: \{\}/.test(r), r.trim().slice(0, 600));
if (fs.existsSync(T('paths.json')))
  for (const c of JSON.parse(fs.readFileSync(T('paths.json'), 'utf8'))) {
    try {
      run('path.js', [JSON.stringify(c.steps)]);
      ok('path: ' + c.name, true);
    } catch (e) {
      ok('path: ' + c.name, false, String(e.stdout || e.message).trim().split('\n').slice(-4).join('\n      '));
    }
  }
try {
  run('golden.js', []);
  ok('golden', true);
} catch (e) {
  ok('golden', false, 'mismatch: expected only if this change MEANS to alter gameplay. Then: node tests/golden.js index.html record');
}
console.log(fail ? `\n${fail} FAILED` : '\nALL PASS');
process.exit(fail ? 1 : 0);
