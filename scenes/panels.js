'use strict';
// ================= THE JOURNAL AND SETTINGS SCREENS (v9.6) =================
// Opened from the 📜 and ⚙️ under the status bar (scenes/intro.js), closed back to where you were.
SC.journal = () => {
  const L = journalList(),
    act = L.filter(q => !q.done),
    old = L.filter(q => q.done),
    row = q => `• ${q.t} (${q.who})\n   ${q.done || q.hint}`;
  show({
    title: 'Journal',
    icon: '📜',
    sub: `${act.length} going · ${old.length} done`,
    text:
      (act.length ? act.map(row).join('\n\n') : 'Nothing yet. Talk to people. Everyone wants something.') +
      (old.length ? `\n\nDONE\n\n${old.map(row).join('\n\n')}` : ''),
    opts: [['Close', () => panelClose()]],
  });
};
SC.settings = () =>
  show({
    title: 'Settings',
    icon: '⚙️',
    sub: VERSION,
    text: 'Everyone remembers. Dying deletes your save.',
    opts: [
      typeof sndCan === 'function' && sndCan()
        ? [
            SND.on ? '🔊 Sound: on' : '🔇 Sound: off',
            () => {
              sndToggle();
              go('settings');
            },
          ]
        : null,
      ['↺ Start a new life', () => restartAsk(), 'danger'],
      ['Close', () => panelClose()],
    ],
  });
