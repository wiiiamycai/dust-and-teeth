'use strict';
// ================= THE WORLD MAP, PAINTED =================
// Looks only: a wasteland drawn in code under the travel map's roads and place buttons (scenes/map.js).
// The land is the same every game (a fixed seed). On top go what changes: craters where a town was nuked,
// cracks round the place the Gutmaw is. No canvas: the plain map as before.

let MAPART = null; // { w, h, c } the painted land, kept until the map's size changes
function mapRand(seed) {
  let s = seed >>> 0 || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}
function mapPaintLand(w, h, dpr) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d'),
    r = mapRand(9137),
    X = f => f * w,
    Y = f => f * h;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // the ground: sand, darker towards the edges
  const bg = g.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#6a5638');
  bg.addColorStop(1, '#3a2e1e');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // grit
  for (let i = 0; i < (w * h) / 90; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(160,130,90,0.18)' : 'rgba(30,20,10,0.18)';
    g.fillRect(r() * w, r() * h, 1, 1);
  }
  // cracked flats: patches of dried mud
  for (const [cx, cy, rx, ry] of [
    [0.22, 0.55, 0.12, 0.1],
    [0.66, 0.42, 0.1, 0.08],
    [0.45, 0.78, 0.09, 0.06],
  ]) {
    g.save();
    g.beginPath();
    g.ellipse(X(cx), Y(cy), X(rx), Y(ry), 0, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = 'rgba(120,100,70,0.25)';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(30,20,10,0.35)';
    g.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      let x = X(cx) + (r() - 0.5) * X(rx) * 2,
        y = Y(cy) + (r() - 0.5) * Y(ry) * 2;
      g.beginPath();
      g.moveTo(x, y);
      for (let j = 0; j < 3; j++) {
        x += (r() - 0.5) * 18;
        y += (r() - 0.5) * 12;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    g.restore();
  }
  // a dry riverbed, winding down from the top
  g.strokeStyle = 'rgba(40,32,24,0.55)';
  g.lineWidth = Math.max(4, w * 0.012);
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(X(0.6), Y(-0.05));
  g.bezierCurveTo(X(0.5), Y(0.2), X(0.75), Y(0.35), X(0.62), Y(0.5));
  g.bezierCurveTo(X(0.5), Y(0.65), X(0.72), Y(0.8), X(0.66), Y(1.05));
  g.stroke();
  g.strokeStyle = 'rgba(150,130,100,0.18)';
  g.lineWidth = Math.max(1, w * 0.003);
  g.stroke();
  // dunes: soft ridges, lit on top, shadowed below
  for (let i = 0; i < 34; i++) {
    const x = r() * w,
      y = r() * h,
      len = 30 + r() * 90,
      bend = (r() - 0.5) * 20;
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(30,22,12,0.28)';
    g.beginPath();
    g.moveTo(x, y + 2);
    g.quadraticCurveTo(x + len / 2, y + bend + 2, x + len, y + 2);
    g.stroke();
    g.strokeStyle = 'rgba(190,160,110,0.22)';
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + len / 2, y + bend, x + len, y);
    g.stroke();
  }
  // mesas: flat-topped rocks with a dark south face
  for (const [mx, my, s] of [
    [0.08, 0.2, 1],
    [0.2, 0.12, 0.7],
    [0.78, 0.55, 0.9],
    [0.93, 0.42, 0.6],
    [0.12, 0.92, 0.8],
    [0.6, 0.9, 0.6],
  ]) {
    const cx = X(mx),
      cy = Y(my),
      rw = 26 * s,
      rh = 10 * s,
      tall = 12 * s;
    g.fillStyle = '#3a2e22';
    g.beginPath();
    g.ellipse(cx, cy + tall, rw, rh, 0, 0, Math.PI);
    g.lineTo(cx - rw, cy);
    g.ellipse(cx, cy, rw, rh, 0, Math.PI, 0, true);
    g.closePath();
    g.fill();
    g.fillStyle = '#7a6650';
    g.beginPath();
    g.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,230,190,0.12)';
    g.beginPath();
    g.ellipse(cx - rw * 0.25, cy - rh * 0.2, rw * 0.5, rh * 0.45, 0, 0, Math.PI * 2);
    g.fill();
  }
  // ruins: little broken blocks from before
  for (let i = 0; i < 14; i++) {
    const x = r() * w,
      y = r() * h;
    for (let j = 0; j < 4; j++) {
      g.fillStyle = r() < 0.5 ? '#4e4030' : '#5e5040';
      g.fillRect(x + (r() - 0.5) * 16, y + (r() - 0.5) * 10, 2 + r() * 5, 2 + r() * 4);
    }
  }
  // a survey grid, very faint, like an old printout
  g.strokeStyle = 'rgba(255,176,0,0.05)';
  g.lineWidth = 1;
  for (let i = 1; i < 10; i++) {
    g.beginPath();
    g.moveTo(X(i / 10), 0);
    g.lineTo(X(i / 10), h);
    g.moveTo(0, Y(i / 10));
    g.lineTo(w, Y(i / 10));
    g.stroke();
  }
  // a compass, bottom right
  const cx = w - 26,
    cy = h - 30;
  g.strokeStyle = 'rgba(255,176,0,0.5)';
  g.fillStyle = 'rgba(255,176,0,0.5)';
  g.beginPath();
  g.moveTo(cx, cy - 14);
  g.lineTo(cx + 5, cy);
  g.lineTo(cx, cy - 4);
  g.lineTo(cx - 5, cy);
  g.closePath();
  g.fill();
  g.beginPath();
  g.arc(cx, cy, 9, 0, Math.PI * 2);
  g.stroke();
  g.font = '10px "Courier New", monospace';
  g.textAlign = 'center';
  g.fillText('N', cx, cy - 17);
  // the edge of the world goes dark
  const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.65);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg;
  g.fillRect(0, 0, w, h);
  return c;
}
// Called by drawMap after it has put the roads in: paints the land under them.
function mapPaint(mp) {
  if (typeof canIso !== 'function' || !canIso() || !mp) return;
  const w = Math.round(mp.clientWidth || 820),
    h = Math.round(mp.clientHeight || (w * 9) / 16),
    dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  if (!MAPART || MAPART.w !== w || MAPART.h !== h) MAPART = { w, h, c: mapPaintLand(w, h, dpr) };
  const cv = document.createElement('canvas');
  cv.className = 'land';
  cv.width = MAPART.c.width;
  cv.height = MAPART.c.height;
  const g = cv.getContext('2d');
  g.drawImage(MAPART.c, 0, 0);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // craters where a town was nuked
  for (const k in S.crater || {}) {
    if (!S.crater[k] || !LOC[k]) continue;
    const x = (LOC[k].x / 100) * w,
      y = (LOC[k].y / 100) * h,
      cr = g.createRadialGradient(x, y, 2, x, y, 46);
    cr.addColorStop(0, 'rgba(10,8,4,0.95)');
    cr.addColorStop(0.5, 'rgba(40,30,16,0.7)');
    cr.addColorStop(0.8, 'rgba(140,200,90,0.12)');
    cr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = cr;
    g.fillRect(x - 50, y - 50, 100, 100);
  }
  // the ground cracks round wherever the Gutmaw is
  if (S.f && !S.f.gutDead && S.f.gutLoc && LOC[S.f.gutLoc]) {
    const x = (LOC[S.f.gutLoc].x / 100) * w,
      y = (LOC[S.f.gutLoc].y / 100) * h,
      rr = mapRand(7 + S.day);
    g.strokeStyle = 'rgba(20,12,6,0.6)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      const a = rr() * Math.PI * 2;
      let px = x + Math.cos(a) * 22,
        py = y + Math.sin(a) * 14;
      g.beginPath();
      g.moveTo(px, py);
      for (let j = 0; j < 3; j++) {
        px += Math.cos(a) * 8 + (rr() - 0.5) * 6;
        py += Math.sin(a) * 5 + (rr() - 0.5) * 4;
        g.lineTo(px, py);
      }
      g.stroke();
    }
  }
  mp.insertBefore(cv, mp.firstChild);
}
