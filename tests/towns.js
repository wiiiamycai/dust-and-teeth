// Checks the walking towns painted with the kit (scenes/townmaps.js) in a real browser, since they need a canvas.
// Usage: node tests/towns.js   (needs Playwright; skips with a note if it isn't installed)
// For every town: it paints without an error; from where you arrive you can reach every exit, every district,
// every door (from the tile below it), and the tile next to everyone's spot; nobody stands in front of a door or
// on anything solid; and the people of every district fit.
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.log('towns: skipped (no Playwright)');
  process.exit(0);
}
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await pg.waitForTimeout(300);
  const fails = await pg.evaluate(() => {
    const out = [];
    newGame();
    for (const t in TOWNMAP) {
      let M;
      try {
        M = townBuild(t);
      } catch (e) {
        out.push(t + ': ' + e.message);
        continue;
      }
      const walk = (x, y) => M.rows[y] && ['.', 'E'].includes(M.rows[y][x]);
      const seen = new Set([M.spawn.join(',')]),
        q = [M.spawn];
      if (!walk(...M.spawn)) out.push(t + ': you arrive on something solid');
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const k = x + dx + ',' + (y + dy);
          if (!seen.has(k) && walk(x + dx, y + dy)) seen.add(k), q.push([x + dx, y + dy]);
        }
      }
      const reach = (x, y) => seen.has(x + ',' + y);
      const near = (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => reach(x + dx, y + dy));
      (M.D.exits || []).forEach(([x, y]) => reach(x, y) || out.push(`${t}: exit ${x},${y} can't be reached`));
      const fronts = new Set();
      M.rows.forEach((row, y) =>
        [...row].forEach((c, x) => {
          if (c !== 'D') return;
          fronts.add(x + ',' + (y + 1));
          if (!reach(x, y + 1)) out.push(`${t}: the door at ${x},${y} can't be reached from below`);
        }),
      );
      for (const id in M.spots) {
        const [x, y] = M.spots[id];
        if (!NPC[id]) out.push(`${t}: a spot for unknown ${id}`);
        if (!walk(x, y)) out.push(`${t}: ${id} stands on something solid at ${x},${y}`);
        else if (!near(x, y)) out.push(`${t}: you can't get next to ${id}`);
        if (fronts.has(x + ',' + y)) out.push(`${t}: ${id} stands in front of a door`);
      }
      (M.D.extra || []).forEach(([x, y]) => (walk(x, y) && near(x, y)) || out.push(`${t}: spare spot ${x},${y} is no good`));
      for (const [k, x0, y0, x1, y1] of M.D.areas || []) {
        let any = false;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) any = any || reach(x, y);
        if (!any) out.push(`${t}: you can't walk into ${k}`);
      }
      // everyone who could be in this town fits: its own people, plus room for a few who move in
      const places = Object.keys(LOC).filter(k => !LOC[k].sub && townOf(k) === t);
      const own = IDS.filter(id => places.includes(NPC[id].loc));
      const spare = (M.D.extra || []).length;
      own.forEach(id => M.spots[id] || out.push(`${t}: ${id} lives here but has no spot`));
      if (spare < 4) out.push(`${t}: only ${spare} spare spots for people who move in`);
    }
    return out;
  });
  await b.close();
  const all = [...fails, ...errs.map(e => 'page error: ' + e)];
  if (all.length) {
    console.log(all.join('\n'));
    process.exit(1);
  }
  console.log('towns ok');
})();
