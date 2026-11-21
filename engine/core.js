'use strict';
// ================= ENGINE =================
const SAVE = 'dust_teeth_v2';
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
  cur = (v.opts || []).filter(Boolean);
  $('head').innerHTML = v.title
    ? `<span class="ic">${v.icon || ''}</span><div><h1>${esc(v.title)}</h1>${v.sub ? `<div class="sub">${esc(v.sub)}</div>` : ''}</div>`
    : '';
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
  const o = $('opts');
  o.innerHTML = '';
  cur.forEach((op, i) => {
    const b = document.createElement('button');
    if (op[2]) b.className = op[2];
    b.innerHTML = `<span class="n">${i < 9 ? i + 1 : i === 9 ? 0 : '·'}.</span>${esc(op[0])}`;
    b.onclick = () => choose(i);
    o.appendChild(b);
  });
  hud();
  save();
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
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
function go(id, ...args) {
  if (S && id !== 'char') {
    S.scene = id;
    S.args = args;
  }
  SC[id](...args);
}
const goHere = () => go('hub', S.here || 'scrapwell');
const dumb = () => S.stats.brains <= 3;
const D = (n, d) => (dumb() ? d : n);
