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
