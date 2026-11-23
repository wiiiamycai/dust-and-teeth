// Checks the walking maps (data/maps.js, scenes/walk.js) without a browser. Usage: node tests/walk.js index.html
// Every map is a rectangle of known tiles, its spawn and exit are walkable, every person's spot is walkable and
// on the map, and each place has room for everyone who can be there. The valley has a way into every place,
// and you can walk from any place's way in to every other.
const vm = require('vm'), code = require('./load')(process.argv[2] || 'index.html');
const ctx = { console, Math, JSON, document: { getElementById: () => ({ style: {}, children: [], appendChild() {} }), createElement: () => ({ style: {} }), addEventListener() {} }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const fails = [];
const r = vm.runInContext(`(() => {
  newGame();
  const out = [];
  const walk = c => TILEDEF[c] && TILEDEF[c].walk;
  for (const k in MAPS) {
    const M = MAPS[k], R = M.rows, W = R[0].length;
    if (!LOC[k]) out.push(k + ': no such place');
    R.forEach((row, y) => { if (row.length !== W) out.push(k + ': row ' + y + ' is ' + row.length + ' wide, not ' + W); [...row].forEach((c, x) => { if (!TILEDEF[c]) out.push(k + ': unknown tile ' + c + ' at ' + x + ',' + y); }); });
    if (!walk((R[M.spawn[1]] || '')[M.spawn[0]])) out.push(k + ': spawn is not walkable');
    if (!R.some(row => row.includes('E'))) out.push(k + ': no exit');
    for (const id in M.spots || {}) { const [x, y] = M.spots[id]; if (!NPC[id]) out.push(k + ': spot for unknown ' + id); if (!walk((R[y] || '')[x])) out.push(k + ': ' + id + ' stands on a tile you cannot walk'); }
    const free = R.join('').split('p').length - 1, can = IDS.filter(id => NPC[id].loc === k || NPC[id].home === k).length;
    if (free + Object.keys(M.spots || {}).length < can + 2) out.push(k + ': room for ' + (free + Object.keys(M.spots || {}).length) + ' people, but ' + can + ' live here');
  }
  // every place without a hand-drawn map gets one built: you can reach every door and every person from the way in
  for (const k of Object.keys(LOC)) {
    if (MAPS[k]) continue;
    const opts = Array.from({ length: 7 }, (_, i) => ['Option number ' + i + ' (10 teeth)', () => 0]);
    const ids = IDS.filter(id => NPC[id].loc === k || NPC[id].home === k);
    const M = genMap(k, opts, ids), R = M.rows, W = R[0].length, H = R.length;
    R.forEach((row, y) => { if (row.length !== W) out.push(k + ' (built): ragged row ' + y); });
    const seen = new Set([M.spawn.join(',')]), q = [M.spawn];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen.has(key) || !walk(R[ny][nx])) continue; seen.add(key); q.push([nx, ny]); } }
    const near = (x, y) => [[0,1],[0,-1],[1,0],[-1,0]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
    Object.keys(M.use).forEach(c => { const [x, y] = c.split(',').map(Number); if (!near(x, y)) out.push(k + ' (built): a door you cannot reach at ' + c); });
    if (Object.keys(M.use).length !== opts.length) out.push(k + ' (built): ' + Object.keys(M.use).length + ' doors for ' + opts.length + ' things to do');
    for (const id in M.spots) { const [x, y] = M.spots[id]; if (!seen.has(x + ',' + y) && !near(x, y)) out.push(k + ' (built): cannot reach ' + id); }
    ids.forEach(id => { if (!M.spots[id]) out.push(k + ' (built): no room for ' + id); });
    if (!R.some(r => r.includes('E'))) out.push(k + ' (built): no exit');
  }
  // the valley, at the start (only the places you know) and with everything found: every place has a way in,
  // and you can walk between all of them
  const check = tag => {
  const V = valleyRows(), H = V.length, W = V[0].length;
  const places = Object.keys(LOC).filter(k => !LOC[k].sub && onMap(k));
  const ins = places.map(k => [k, vx(LOC[k]), vy(LOC[k]) + 1]);
  ins.forEach(([k, x, y]) => { if (V[y][x] !== 'O') out.push('valley (' + tag + '): no way into ' + k); });
  const seen = new Set([ins[0][1] + ',' + ins[0][2]]), q = [[ins[0][1], ins[0][2]]];
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen.has(key) || !walk(V[ny][nx])) continue; seen.add(key); q.push([nx, ny]); } }
  ins.forEach(([k, x, y]) => { if (!seen.has(x + ',' + y)) out.push('valley (' + tag + '): you cannot walk to ' + k); });
  };
  check('start');
  Object.keys(LOC).forEach(k => { if (LOC[k].hidden) S.f[LOC[k].hidden === 1 ? 'knowSilo' : LOC[k].hidden] = 1; });
  check('all found');
  return out;
})()`, ctx);
if (r.length) { console.log(r.join('\n')); process.exit(1); }
console.log('walk ok');
