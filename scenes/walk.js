'use strict';
// ================= THE 2D VIEW: walk around each place =================
// Every place is a tile map (data/maps.js). Click a tile, or use the arrow keys or WASD, to walk.
// Walk into a person to talk, into an object to use it, onto an exit to leave.
// Nothing about the game itself changes: talking, checks, plots and fights are the same screens as before.
// The places' options are still all there: the ones an object claims show up when you stand next to it,
// the rest are always listed under the map. One option switches between this and the list view.
// Three views, cycled by one option: isometric (scenes/iso.js), the flat emoji map, and the list.
// With no canvas, the isometric view isn't offered and the map option opens the flat map.
const is2D = () =>
  S && S.view ? S.view === '2d' || S.view === 'iso' : typeof window !== 'undefined' && !!window.innerWidth;
const viewOpt = () =>
  isIso()
    ? ['🔲 Flat map view', () => ((S.view = '2d'), goHere())]
    : is2D()
      ? ['📜 List view', () => ((S.view = 'text'), goHere())]
      : ['🗺️ Walk around (map view)', () => ((S.view = canIso() ? 'iso' : '2d'), goHere())];

// ---- parsing ----
const MAPC = {};
function townMap(loc) {
  if (MAPC[loc]) return MAPC[loc];
  const M = MAPS[loc];
  if (!M) return null;
  const w = Math.max(...M.rows.map(r => r.length)),
    rows = M.rows.map(r => r.padEnd(w, '#')),
    h = rows.length,
    objs = [],
    spots = {},
    exits = [];
  let start = null;
  rows.forEach((r, y) =>
    [...r].forEach((ch, x) => {
      if (ch === '@') start = { x, y };
      else if (ch === 'E') exits.push({ x, y });
      else if (M.obj[ch]) objs.push({ k: ch, x, y, ...M.obj[ch] });
      else if (/[a-z]/.test(ch)) spots[ch] = { x, y };
    }),
  );
  return (MAPC[loc] = { loc, w, h, rows, objs, spots, exits, start: start || exits[0], pen: M.pen || [], M });
}
const chAt = (T, x, y) => (x < 0 || y < 0 || x >= T.w || y >= T.h ? '#' : T.rows[y][x]);
const objHere = o => !o.when || o.when();
function objAt(T, x, y) {
  return T.objs.find(o => o.x === x && o.y === y && objHere(o)) || null;
}
// Can you stand here? Terrain, and not an object (unless it's an open gate).
function walkable(T, x, y) {
  const ch = chAt(T, x, y),
    o = objAt(T, x, y);
  if (o) return !!(o.open && o.open());
  if (T.M.obj[ch]) return true; // an object that isn't there right now: plain floor
  if (/[a-z]/.test(ch)) return true;
  return !!(TILE[ch] && TILE[ch].walk);
}

// ---- who stands where ----
function townPeople(T, ids) {
  const at = {},
    taken = new Set(),
    key = (x, y) => x + ',' + y;
  const free = [];
  T.rows.forEach((r, y) =>
    [...r].forEach((ch, x) => {
      if (walkable(T, x, y) && ch !== 'E' && ch !== '@' && !/[a-z]/.test(ch) && !objAt(T, x, y)) free.push({ x, y });
    }),
  );
  const spotOf = {};
  for (const l in T.M.spots) spotOf[T.M.spots[l]] = l;
  const penLeft = [...T.pen];
  for (const id of ids) {
    let p = null;
    if (S.n[id].loc === 'pen' && penLeft.length) p = T.spots[penLeft.shift()];
    else if (spotOf[id] && T.spots[spotOf[id]]) p = T.spots[spotOf[id]];
    if (!p || taken.has(key(p.x, p.y))) {
      // a visitor: a free tile picked from their name, so they stand in the same place each time
      let h = 0;
      for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973;
      for (let i = 0; i < free.length; i++) {
        const q = free[(h + i * 7) % free.length];
        if (!taken.has(key(q.x, q.y)) && Math.abs(q.x - T.start.x) + Math.abs(q.y - T.start.y) > 2) {
          p = q;
          break;
        }
      }
    }
    if (p) {
      taken.add(key(p.x, p.y));
      at[key(p.x, p.y)] = id;
    }
  }
  return at;
}

// ---- state for the place you're in ----
let TOWN = null; // { loc, T, v, people: {"x,y": id}, cardOf: {id: card} }
function townShow(loc, v) {
  const T = townMap(loc);
  if (!T) return show(v);
  if (!S.pos || S.pos.loc !== loc) S.pos = { loc, x: T.start.x, y: T.start.y };
  const cardOf = {};
  (v.ids || []).forEach((id, i) => (cardOf[id] = v.cards[i]));
  TOWN = { loc, T, v, cardOf, people: townPeople(T, v.ids || []) };
  // if someone now stands on you, step aside
  if (TOWN.people[S.pos.x + ',' + S.pos.y]) {
    const n = neighbours4(S.pos).find(p => walkable(T, p.x, p.y) && !TOWN.people[p.x + ',' + p.y]);
    if (n) Object.assign(S.pos, n);
  }
  show({ ...v, cards: [], view: townHTML(), opts: townOpts() });
  if (isIso()) {
    isoMount();
    save();
  }
}
const neighbours4 = p => [
  { x: p.x + 1, y: p.y },
  { x: p.x - 1, y: p.y },
  { x: p.x, y: p.y + 1 },
  { x: p.x, y: p.y - 1 },
];
const near = (a, b, d) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) <= (d || 1);
// Each option goes to the first object that claims it; the rest stay in the list.
function claim(opts) {
  const T = TOWN.T,
    by = new Map(),
    rest = [];
  for (const op of opts) {
    if (!op) continue;
    const o = T.objs.find(o => o.re && objHere(o) && o.re.test(op[0]));
    if (o) {
      if (!by.has(o)) by.set(o, []);
      by.get(o).push(op);
    } else rest.push(op);
  }
  return { by, rest };
}
const isLeave = op => op && /^(Leave|Climb back up)/.test(op[0]);
function townOpts() {
  const { by, rest } = claim(TOWN.v.opts),
    nearby = [];
  for (const [o, ops] of by) if (near(S.pos, o)) nearby.push(...ops);
  return [...nearby, ...rest, viewOpt()];
}
function townHTML() {
  if (isIso()) return isoHTML();
  const { T, people } = TOWN,
    claimed = claim(TOWN.v.opts).by;
  let h = `<div class="town" style="grid-template-columns:repeat(${T.w},1fr);max-width:${T.w * 30}px">`;
  for (let y = 0; y < T.h; y++)
    for (let x = 0; x < T.w; x++) {
      const ch = chAt(T, x, y),
        o = objAt(T, x, y),
        who = people[x + ',' + y];
      let cls, g, tip;
      if (S.pos.x === x && S.pos.y === y) [cls, g, tip] = ['t me', '🧍', 'You'];
      else if (who) [cls, g, tip] = ['t npc', NPC[who].i, NPC[who].n];
      else if (o && !(o.open && o.open())) {
        const live = claimed.has(o);
        [cls, g, tip] = [`t ob${live ? ' live' : ''}`, o.i, o.n];
      } else {
        const t = TILE[/[a-z]/.test(ch) ? '.' : ch] || TILE['.'];
        [cls, g, tip] = [`t ${o ? 'd' : t.c}`, o ? '▒' : t.g, ch === 'E' ? 'Leave' : ''];
      }
      h += `<i class="${cls}" data-x="${x}" data-y="${y}"${tip ? ` title="${esc(tip)}"` : ''}>${g}</i>`;
    }
  return h + '</div>' + townLegend('');
}
// Who's here, and what's next to you. Click a name to walk to them.
function townLegend(lead) {
  const { T, people } = TOWN;
  const who = Object.entries(people).map(
    ([k, id]) => `<span data-x="${k.split(',')[0]}" data-y="${k.split(',')[1]}">${NPC[id].i} ${esc(NPC[id].n)}</span>`,
  );
  const by = T.objs.filter(o => objHere(o) && near(S.pos, o) && !(o.open && o.open())).map(o => esc(o.n));
  return (
    `<div class="legend">${who.length ? who.join(' ') : 'Nobody here.'}</div>` +
    `<div class="legend dim">${lead}${by.length ? 'Next to you: ' + by.join(', ') + '.' : 'Click a tile or use the arrow keys to walk. Walk into people to talk, and into things to use them.'}</div>`
  );
}
// Redraw just the map and the options, so messages in the log stay put while you walk.
function townRedraw() {
  const vw = $('view');
  vw.innerHTML = townHTML();
  if (isIso()) isoMount();
  drawOpts(townOpts());
  save();
}

// ---- moving ----
function stepTo(x, y) {
  const T = TOWN.T,
    who = TOWN.people[x + ',' + y],
    o = objAt(T, x, y);
  if (who) {
    const c = TOWN.cardOf[who];
    if (c && c.on) c.on();
    return false;
  }
  if (o && !(o.open && o.open())) {
    const ops = claim(TOWN.v.opts).by.get(o) || [];
    if (ops.length === 1) ops[0][1]();
    else if (!ops.length) {
      say(`${o.n}.`);
      goHere();
    } else townRedraw();
    return false;
  }
  if (!walkable(T, x, y)) return false;
  S.pos.x = x;
  S.pos.y = y;
  if (chAt(T, x, y) === 'E') {
    const lv = TOWN.v.opts.find(isLeave);
    if (lv) lv[1]();
    return false;
  }
  townRedraw();
  return true;
}
function move(dx, dy) {
  if (!TOWN || !S || S.scene !== 'hub' || !is2D()) return;
  stopWalk();
  stepTo(S.pos.x + dx, S.pos.y + dy);
}
// Shortest path over tiles you can stand on, to the goal or (for people and objects) next to it.
function pathTo(tx, ty) {
  const T = TOWN.T,
    blocked = (x, y) => !walkable(T, x, y) || !!TOWN.people[x + ',' + y],
    target = TOWN.people[tx + ',' + ty] || (objAt(T, tx, ty) && !walkable(T, tx, ty)),
    goal = (x, y) => (target ? near({ x, y }, { x: tx, y: ty }, 1) && (x === tx || y === ty) : x === tx && y === ty);
  const seen = new Map(),
    q = [S.pos];
  seen.set(S.pos.x + ',' + S.pos.y, null);
  let end = null;
  while (q.length) {
    const p = q.shift();
    if (goal(p.x, p.y)) {
      end = p;
      break;
    }
    for (const n of neighbours4(p)) {
      const k = n.x + ',' + n.y;
      if (seen.has(k) || blocked(n.x, n.y)) continue;
      seen.set(k, p);
      q.push(n);
    }
  }
  // People behind a fence (the pens) can be talked to from two tiles away.
  if (!end && target) {
    for (const [k, prev] of seen) {
      const [x, y] = k.split(',').map(Number);
      if (near({ x, y }, { x: tx, y: ty }, 2)) {
        end = { x, y };
        break;
      }
    }
    if (!end) return null;
  }
  if (!end) return null;
  const path = [];
  for (let p = end; p && !(p.x === S.pos.x && p.y === S.pos.y); p = seen.get(p.x + ',' + p.y)) path.unshift(p);
  return { path, target: target ? { x: tx, y: ty } : null };
}
let walkTimer = null;
function stopWalk() {
  if (walkTimer && typeof clearTimeout === 'function') clearTimeout(walkTimer);
  walkTimer = null;
}
function walkTo(x, y) {
  if (!TOWN || S.scene !== 'hub') return;
  stopWalk();
  const r = pathTo(x, y);
  if (!r) return;
  const steps = r.path.slice();
  const finish = () => {
    if (r.target) {
      if (near(S.pos, r.target, 1)) stepTo(r.target.x, r.target.y);
      else {
        const c = TOWN.cardOf[TOWN.people[r.target.x + ',' + r.target.y]];
        if (c && c.on) c.on(); // through the fence
      }
    }
  };
  const next = () => {
    if (!steps.length) return finish();
    const p = steps.shift();
    if (!stepTo(p.x, p.y)) return;
    if (typeof setTimeout === 'function') walkTimer = setTimeout(next, 55);
    else next();
  };
  next();
}

// ---- input ----
if (typeof document !== 'undefined' && document.addEventListener)
  document.addEventListener('keydown', e => {
    const d = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0],
    }[e.key];
    if (d && TOWN && S && S.scene === 'hub' && is2D()) {
      if (e.preventDefault) e.preventDefault();
      move(d[0], d[1]);
    }
  });
(() => {
  const vw = typeof document !== 'undefined' && document.getElementById('view');
  if (vw && vw.addEventListener)
    vw.addEventListener('click', e => {
      if (e.target && e.target.id === 'isoc' && ISO) return void isoClick(...isoPoint(e));
      const c = e.target && e.target.closest && e.target.closest('[data-x]');
      if (c) walkTo(+c.dataset.x, +c.dataset.y);
    });
})();
