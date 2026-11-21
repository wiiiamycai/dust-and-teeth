'use strict';
// ================= BOOT =================
(function boot() {
  const s = load();
  if (s && !s.end && s.scene && SC[s.scene] && s.n) {
    S = s;
    if (S.scene === 'fight' && !S.fight) {
      S.scene = 'hub';
      S.args = [S.here || 'scrapwell'];
    }
    go(S.scene, ...(S.args || []));
  } else go('title');
})();
