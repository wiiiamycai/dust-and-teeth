'use strict';
// ================= SOUND =================
// Quiet, optional, and made in code: no audio files. Off until you turn it on with the speaker in the footer,
// and your choice is remembered in this browser (not in the save).
// It only reacts to what's on screen: a soft step when you walk, a thud or a bang when an enemy is hit,
// a sting when you're hurt, wind under everything, and a low note at the end. The game never waits on it.

const SND = { on: false, ctx: null, master: null, noise: null, wind: null };
const SND_KEY = 'dust_teeth_sound';
function sndCan() {
  return typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
}
function sndInit() {
  if (SND.ctx || !sndCan()) return SND.ctx;
  const AC = window.AudioContext || window.webkitAudioContext,
    c = (SND.ctx = new AC());
  SND.master = c.createGain();
  SND.master.gain.value = 0.22;
  SND.master.connect(c.destination);
  const len = c.sampleRate,
    b = c.createBuffer(1, len, c.sampleRate),
    d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  SND.noise = b;
  return c;
}
// A burst of filtered noise: steps, thuds, gunshots.
function sndNoise(dur, freq, q, vol, type) {
  const c = SND.ctx,
    t = c.currentTime,
    src = c.createBufferSource(),
    f = c.createBiquadFilter(),
    g = c.createGain();
  src.buffer = SND.noise;
  f.type = type || 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(SND.master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}
// A falling tone: stings and the end.
function sndTone(f0, f1, dur, vol, type) {
  const c = SND.ctx,
    t = c.currentTime,
    o = c.createOscillator(),
    g = c.createGain();
  o.type = type || 'triangle';
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(SND.master);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function sfx(name) {
  if (!SND.on || !sndInit() || SND.ctx.state !== 'running') return;
  try {
    if (name === 'step') sndNoise(0.06, 600 + Math.random() * 400, 1.2, 0.18, 'bandpass');
    else if (name === 'hit') {
      sndNoise(0.14, 220, 0.8, 0.9, 'lowpass');
      sndTone(130, 55, 0.14, 0.35, 'sine');
    } else if (name === 'shot') {
      sndNoise(0.35, 1400, 0.6, 1, 'lowpass');
      sndTone(90, 40, 0.25, 0.4, 'sine');
    } else if (name === 'hurt') sndTone(240, 90, 0.3, 0.2, 'sawtooth');
    else if (name === 'end') sndTone(110, 41, 3, 0.35, 'triangle');
  } catch (e) {}
}
// Wind: noise through a low filter, swelling slowly. Always on while sound is on.
function sndWind(on) {
  if (!SND.ctx) return;
  if (!on) {
    if (SND.wind) {
      try {
        SND.wind.src.stop();
      } catch (e) {}
      SND.wind = null;
    }
    return;
  }
  if (SND.wind) return;
  const c = SND.ctx,
    src = c.createBufferSource(),
    f = c.createBiquadFilter(),
    g = c.createGain(),
    lfo = c.createOscillator(),
    lg = c.createGain();
  src.buffer = SND.noise;
  src.loop = true;
  f.type = 'lowpass';
  f.frequency.value = 420;
  g.gain.value = 0.12;
  lfo.frequency.value = 0.07;
  lg.gain.value = 0.08;
  lfo.connect(lg).connect(g.gain);
  src.connect(f).connect(g).connect(SND.master);
  src.start();
  lfo.start();
  SND.wind = { src };
}
function sndLabel() {
  const b = typeof document !== 'undefined' && document.getElementById && document.getElementById('sndb');
  if (b) b.textContent = SND.on ? '🔊 Sound on' : '🔇 Sound off';
}
function sndToggle() {
  SND.on = !SND.on;
  try {
    localStorage.setItem(SND_KEY, SND.on ? '1' : '0');
  } catch (e) {}
  if (SND.on && sndInit()) {
    SND.ctx.resume();
    sndWind(true);
  } else sndWind(false);
  sndLabel();
}
// The speaker in the footer. Clicks are caught on the document, so redrawing the footer can't break it.
(() => {
  if (!sndCan() || typeof document === 'undefined' || !document.addEventListener) return;
  try {
    SND.on = localStorage.getItem(SND_KEY) === '1';
  } catch (e) {}
  const f = document.getElementById('foot');
  if (f) f.insertAdjacentHTML('beforeend', ' <button id="sndb" class="snd" type="button"></button>');
  sndLabel();
  document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('#sndb')) return sndToggle();
    // a browser only lets sound start after a click: if it was left on, start it now
    if (SND.on && sndInit() && SND.ctx.state !== 'running') SND.ctx.resume().then(() => sndWind(true));
  });
})();
