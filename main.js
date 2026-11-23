'use strict';
// ================= BOOT =================
(function boot() {
  $('foot').innerHTML += ` <span class="ver">${VERSION}</span>`;
  const s = load();
  if (s && !s.end && s.scene && SC[s.scene] && s.n) {
    S = migrate(s);
    if (S.scene === 'fight' && !S.fight) {
      S.scene = 'hub';
      S.args = [S.here || 'scrapwell'];
    }
    go(S.scene, ...(S.args || []));
  } else go('title');
})();
// Installed from the home screen, the game works offline (sw.js). Only over http(s): a file opened from disk,
// and the headless tests, skip it.
try {
  if (typeof navigator !== 'undefined' && navigator.serviceWorker && /^https?:/.test(location.protocol))
    navigator.serviceWorker.register('./sw.js');
} catch (e) {}
