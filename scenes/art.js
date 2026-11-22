'use strict';
// ================= TITLE AND ENDING ART =================
// Looks only. The title screen gets a wasteland at sundown with a chunky pixel logo. The ending slides get
// the same land, a mushroom cloud if something was nuked, and portraits of the people each slide is about.
// Found from the screen's title, so no scene asks for it. No canvas: the screens are text, as before.

function artVista(g, w, h, o) {
  o = o || {};
  const r = mapRand(o.seed || 77),
    horizon = h * 0.66;
  // sky: a dirty sunset
  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, o.dark ? '#0e0a10' : '#1a1016');
  sky.addColorStop(0.55, o.dark ? '#3a1a14' : '#5a2a18');
  sky.addColorStop(1, o.dark ? '#7a3a1a' : '#c0702a');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, horizon);
  // the sun, cut by bands of haze
  const sx = w * (o.sunX || 0.7),
    sy = horizon - h * 0.08,
    sr = h * 0.22;
  const sg = g.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 2.2);
  sg.addColorStop(0, 'rgba(255,190,90,0.55)');
  sg.addColorStop(1, 'rgba(255,190,90,0)');
  g.fillStyle = sg;
  g.fillRect(0, 0, w, horizon);
  g.fillStyle = '#ffb04a';
  g.beginPath();
  g.arc(sx, sy, sr, 0, Math.PI * 2);
  g.fill();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = 'rgba(90,40,20,0.85)';
    g.fillRect(sx - sr - 2, sy + sr * (0.05 + i * 0.16), sr * 2 + 4, 1 + i);
  }
  // a mushroom cloud, far off
  if (o.nuke) {
    const nx = w * 0.3,
      base = horizon;
    g.fillStyle = 'rgba(120,70,40,0.85)';
    g.fillRect(nx - 8, base - h * 0.4, 16, h * 0.4);
    for (let i = 0; i < 14; i++) {
      g.fillStyle = i % 2 ? 'rgba(150,90,50,0.9)' : 'rgba(110,60,36,0.9)';
      g.beginPath();
      g.arc(nx + (r() - 0.5) * 70, base - h * 0.45 + (r() - 0.5) * 30, 14 + r() * 18, 0, Math.PI * 2);
      g.fill();
    }
    const ng = g.createRadialGradient(nx, base - h * 0.1, 4, nx, base - h * 0.1, h * 0.5);
    ng.addColorStop(0, 'rgba(255,220,140,0.5)');
    ng.addColorStop(1, 'rgba(255,220,140,0)');
    g.fillStyle = ng;
    g.fillRect(0, 0, w, h);
  }
  // mesas, two layers, flat tops
  for (const [col, y0, n] of [
    ['#3a1e14', horizon - h * 0.12, 5],
    ['#24120c', horizon - h * 0.05, 7],
  ]) {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, horizon);
    let x = 0;
    while (x < w) {
      const flat = w / n / 2 + r() * (w / n / 2),
        up = y0 - r() * h * 0.08;
      g.lineTo(x + 8, up);
      g.lineTo(x + flat, up);
      g.lineTo(x + flat + 10, horizon - 2);
      x += flat + 10 + r() * 30;
      g.lineTo(x, horizon - 2);
    }
    g.lineTo(w, horizon);
    g.closePath();
    g.fill();
  }
  // the ground, and a road running off to the sun
  const gr = g.createLinearGradient(0, horizon, 0, h);
  gr.addColorStop(0, '#3a2414');
  gr.addColorStop(1, '#120a06');
  g.fillStyle = gr;
  g.fillRect(0, horizon, w, h - horizon);
  g.fillStyle = '#1e140c';
  g.beginPath();
  g.moveTo(sx - 4, horizon);
  g.lineTo(sx + 4, horizon);
  g.lineTo(w * 0.62, h);
  g.lineTo(w * 0.38, h);
  g.closePath();
  g.fill();
  // a lone figure on the road, small, with a long shadow
  if (!o.empty) {
    const fx = w * 0.46,
      fy = h * 0.86,
      s = Math.max(2, Math.round(h / 110));
    g.fillStyle = 'rgba(0,0,0,0.5)';
    g.beginPath();
    g.ellipse(fx - 16 * s, fy, 18 * s, 2 * s, -0.15, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#0a0604';
    g.fillRect(fx - 2 * s, fy - 15 * s, 4 * s, 4 * s); // head
    g.fillRect(fx - 3 * s, fy - 11 * s, 6 * s, 6 * s); // body
    g.fillRect(fx - 3 * s, fy - 5 * s, 2 * s, 5 * s); // legs
    g.fillRect(fx + 1 * s, fy - 5 * s, 2 * s, 5 * s);
    g.fillRect(fx + 3 * s, fy - 11 * s, 1 * s, 9 * s); // a stick
  }
}
// "DUST & TEETH" in fat pixels: drawn small, then blown up with smoothing off.
function artLogo(g, w, y) {
  const small = document.createElement('canvas'),
    sw = 120,
    sh = 20;
  small.width = sw;
  small.height = sh;
  const s = small.getContext('2d');
  s.font = 'bold 15px "Courier New", monospace';
  s.textAlign = 'center';
  s.textBaseline = 'middle';
  s.fillStyle = '#1a0e06';
  s.fillText('DUST & TEETH', sw / 2 + 1, sh / 2 + 1);
  s.fillStyle = '#ffb000';
  s.fillText('DUST & TEETH', sw / 2, sh / 2);
  const k = Math.max(2, Math.floor((w * 0.8) / sw));
  g.imageSmoothingEnabled = false;
  g.drawImage(small, (w - sw * k) / 2, y, sw * k, sh * k);
  g.imageSmoothingEnabled = true;
  return sh * k;
}
function artCanvas(h) {
  const vw = $('view');
  vw.hidden = false;
  vw.innerHTML = '<canvas id="artc" class="iso art"></canvas>';
  const cv = $('artc'),
    w = Math.max(240, ((vw && vw.clientWidth) || 832) - 10),
    dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  if (cv.style) cv.style.width = w + 'px';
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w, h };
}
function artScan(g, w, h) {
  g.fillStyle = 'rgba(0,0,0,0.2)';
  for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
  const vg = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.6);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg;
  g.fillRect(0, 0, w, h);
}
// Called by show() for every screen: draws art only for the title and the ending.
function artMount(v) {
  if (!v || typeof canIso !== 'function' || !canIso()) return;
  if (v.title === 'DUST & TEETH' && !v.view && !v.map) {
    const { g, w, h } = artCanvas(240);
    artVista(g, w, h, { seed: 31 });
    artLogo(g, w, h * 0.12);
    artScan(g, w, h);
  } else if (!S && (v.title === 'The End' || v.title === 'What became of them')) {
    const text = v.text || '',
      named = [];
    for (const id in NPC) {
      const n = NPC[id].n,
        last = n.split(' ').slice(-1)[0];
      if (
        SNPC[id] &&
        (text.includes(n) || (last.length >= 3 && /^[A-Z]/.test(last) && new RegExp('\\b' + last + '\\b').test(text)))
      )
        named.push(id);
    }
    const nuke = /nuke|crater|mushroom|launched|ash/i.test(text);
    const { g, w, h } = artCanvas(named.length && v.title !== 'The End' ? 200 : 170);
    artVista(g, w, h, { seed: 50 + text.length, dark: true, nuke, empty: named.length > 0, sunX: 0.8 });
    // the people this slide is about, in a row of portraits
    const shown = named.slice(0, 6),
      cell = 4,
      pw = 16 * cell,
      ph = 17 * cell,
      gap = 14,
      x0 = (w - shown.length * pw - (shown.length - 1) * gap) / 2;
    shown.forEach((id, i) => {
      const pc = document.createElement('canvas');
      sprPortraitDraw(pc, id, false);
      const x = x0 + i * (pw + gap),
        y = h - ph - 18;
      g.fillStyle = 'rgba(0,0,0,0.6)';
      g.fillRect(x - 3, y - 3, pw + 6, ph + 6);
      g.drawImage(pc, x, y, pw, ph);
      g.strokeStyle = '#8a5f00';
      g.strokeRect(x - 0.5, y - 0.5, pw + 1, ph + 1);
    });
    artScan(g, w, h);
  }
}
