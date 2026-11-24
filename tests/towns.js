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
    // a shut gate is knocked on from the road: it must be reachable
    for (const t in TOWNMAP) {
      const M = townLive(townBuild(t));
      for (const k in M.use)
        if (M.use[k] === 'menu') {
          const [x, y] = k.split(',').map(Number);
          if (!['.', 'E'].includes((M.rows[y + 1] || '')[x])) out.push(`${t}: the shut gate at ${k} can't be knocked on`);
        }
    }
    // the rest with every gate open (let into the Green, past the Silo's guards)
    S.f.greenIn = S.f.siloIn = 1;
    for (const t in TOWNMAP) {
      let M;
      try {
        M = townLive(townBuild(t));
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
      // every thing you can use (a pump, a cage, a pack of beasts) has a side you can stand at
      const uses = new Map();
      for (const k in M.use) {
        const u = M.use[k];
        if (!u || u === 'menu' || M.rows[+k.split(',')[1]][+k.split(',')[0]] === 'D') continue;
        const [x, y] = k.split(',').map(Number);
        uses.set(String(u), (uses.get(String(u)) || false) || near(x, y));
      }
      if (!M.D.key) for (const [u, ok] of uses) if (!ok) out.push(`${t}: you can't get to the thing for ${u}`);
      for (const k in M.D.from || {}) walk(...M.D.from[k]) && near(...M.D.from[k]) || out.push(`${t}: you come up out of ${k} somewhere you can't stand`);
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
      const places = LOC[t] && LOC[t].sub ? [t] : Object.keys(LOC).filter(k => !LOC[k].sub && townOf(k) === t);
      const own = IDS.filter(id => places.includes(NPC[id].loc));
      const spare = (M.D.extra || []).length;
      own.forEach(id => M.spots[id] || out.push(`${t}: ${id} lives here but has no spot`));
      if (spare < 4) out.push(`${t}: only ${spare} spare spots for people who move in`);
    }
    // a lost town, stage by stage: the pack you're up to stands somewhere you can reach, and it is that stage
    for (const t in TOWNMAP) {
      if (!TOWNMAP[t].key || !TOWNS[t]) continue;
      for (let n = 0; n < TOWNS[t].stages.length; n++) {
        S.f['town_' + t] = n;
        const M = townLive(townBuild(t)),
          walk = (x, y) => M.rows[y] && ['.', 'E'].includes(M.rows[y][x]),
          seen = new Set([M.spawn.join(',')]),
          q = [M.spawn];
        while (q.length) {
          const [x, y] = q.shift();
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const k = x + dx + ',' + (y + dy);
            if (!seen.has(k) && walk(x + dx, y + dy)) seen.add(k), q.push([x + dx, y + dy]);
          }
        }
        const label = TOWNS[t].stages[n][0];
        const ok = Object.keys(M.use).some(k => {
          const u = M.use[k],
            [x, y] = k.split(',').map(Number);
          return u instanceof RegExp && u.test(label) && [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => seen.has(x + dx + ',' + (y + dy)));
        });
        if (!ok) out.push(`${t}: stage ${n + 1} ("${label}") has no pack you can walk up to`);
      }
      S.f['town_' + t] = 0;
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
