'use strict';
// ================= ENGINE =================
const SAVE = 'dust_teeth_v2';
// Bump VERSION with every update Will can play, so he can see at a glance he has the new build.
const VERSION = 'v9.24 (23 Nov 2026)';
// The calendar (v9.5, Will: "set the nuke day to say 120 days instead of 25"). Every date and every wait in the
// story goes through DAYS: the old 25-day calendar, stretched 4.8 times, now that each town on a road is a day.
const TIME = 4.8;
const DAYS = n => Math.round(n * TIME);
let S = null,
  pend = [],
  cur = [];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const roll = p => Math.random() * 100 < p;
const cap = s => s[0].toUpperCase() + s.slice(1);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const $ = id => document.getElementById(id);
const shuffle = a => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
// Can this browser draw pictures? Portraits, the painted map and the title art need it. The headless tests can't.
function canDraw() {
  try {
    const c = typeof document !== 'undefined' && document.createElement && document.createElement('canvas');
    return !!(c && c.getContext && c.getContext('2d'));
  } catch (e) {
    return false;
  }
}
function save() {
  if (!S) return;
  try {
    localStorage.setItem(SAVE, JSON.stringify(S));
  } catch (e) {}
}
function wipe() {
  try {
    localStorage.removeItem(SAVE);
  } catch (e) {}
}
function load() {
  try {
    const s = localStorage.getItem(SAVE);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
function say(t) {
  pend.push(['m', t]);
}
function bad(t) {
  pend.push(['b', t]);
}
function quote(t) {
  pend.push(['q', t]);
}
function show(v) {
  // Talking to someone shows their pixel portrait (scenes/sprite.js), if the browser can draw it.
  // If drawing it fails for any reason, the emoji goes back in its place.
  const head = pid =>
    v.title
      ? `${pid ? '<canvas class="ic portrait" id="portc"></canvas>' : `<span class="ic">${v.icon || ''}</span>`}<div><h1>${esc(v.title)}</h1>${v.sub ? `<div class="sub">${esc(v.sub)}</div>` : ''}</div>`
      : '';
  let pid = null;
  try {
    pid = canDraw() && typeof sprPortraitId === 'function' ? sprPortraitId(v) : null;
    $('head').innerHTML = head(pid);
    if (pid) sprPortrait($('portc'), pid);
  } catch (e) {
    $('head').innerHTML = head(null);
  }
  if (cueQ.length) {
    cueQ.forEach(t => pend.push(['m', t]));
    cueQ = [];
  }
  if (S && typeof hearIn === 'function') {
    pend.forEach(([, t]) => hearIn(t));
    hearIn(v.text);
    (v.cards || []).forEach(c => hearIn(c.name)); // the people in front of you
  }
  $('log').innerHTML = pend
    .slice(-9)
    .map(([c, t]) => `<p class="${c}">${esc(t)}</p>`)
    .join('');
  pend = [];
  $('text').innerHTML = esc(v.text || '');
  const cd = $('cards');
  cd.innerHTML = '';
  (v.cards || []).forEach(c => {
    const b = document.createElement('button');
    b.className = 'card' + (c.sel ? ' sel' : '') + (c.dead ? ' dead' : '');
    b.innerHTML = `<div class="ci">${c.icon}</div><div class="cn">${esc(c.name)}${c.bang ? ' <span class="bang">!</span>' : ''}</div><div class="cs">${esc(c.sub || '')}</div>${c.hp != null ? `<div class="bar hp"><i style="width:${clamp((c.hp * 100) / c.max, 0, 100)}%"></i></div>` : ''}`;
    b.onclick = c.on || null;
    cd.appendChild(b);
  });
  const mp = $('map');
  if (v.map) {
    mp.hidden = false;
    drawMap(mp);
  } else {
    mp.hidden = true;
    mp.innerHTML = '';
  }
  const vw = $('view'); // only the title and ending art use this now
  vw.hidden = true;
  vw.innerHTML = '';
  try {
    if (typeof fightSfx === 'function') fightSfx(); // fight sounds (scenes/sound.js), only if switched on
    if (typeof artMount === 'function') artMount(v); // title and ending art (scenes/art.js), looks only
  } catch (e) {}
  drawOpts(v.opts);
  hud();
  save();
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
}
function drawOpts(list) {
  cur = (list || []).filter(Boolean);
  if (S && typeof mentionsStranger === 'function') cur = cur.filter(o => !mentionsStranger(o[0]));
  const o = $('opts');
  o.innerHTML = '';
  cur.forEach((op, i) => {
    const b = document.createElement('button');
    if (op[2]) b.className = op[2];
    b.innerHTML = `<span class="n">${i < 9 ? i + 1 : i === 9 ? 0 : '·'}.</span>${esc(op[0])}`;
    b.onclick = () => choose(i);
    o.appendChild(b);
  });
}
function choose(i) {
  const op = cur[i];
  if (!op) return;
  cur = [];
  op[1]();
}
document.addEventListener('keydown', e => {
  if (/^[0-9]$/.test(e.key)) choose(e.key === '0' ? 9 : +e.key - 1);
});
const SC = {};
// Screens laid over the game (the status bar's buttons, and the new-life question): they don't become where
// you are, so a reload or Close goes back to the screen under them.
const OVER = ['char', 'inv', 'journal', 'settings', 'restart'];
let PANEL = null;
function go(id, ...args) {
  if (S && !OVER.includes(id)) {
    S.scene = id;
    S.args = args;
  }
  PANEL = OVER.includes(id) ? id : null;
  SC[id](...args);
}
const goHere = () => go('hub', S.here || 'scrapwell');
const dumb = () => S.stats.brains <= 3;
const D = (n, d) => (dumb() ? d : n);
