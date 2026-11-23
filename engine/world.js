'use strict';
// ================= WORLD CLOCK =================
function tick() {
  S.day++;
  S.f.corpse = null;
  spread();
  world();
  if (!S.end) reactions();
  return !!S.end;
}
function world() {
  const d = S.day,
    f = S.f;
  if (alive('pete') && S.n.pete.loc === 'cage' && d >= DAYS(6) && alive('lou')) {
    S.dead.pete = 1;
    f.peteEaten = 1;
    event('murder', 'pete', { loc: 'diner', secret: true });
  }
  for (const x of ['bess', 'bert']) {
    const n = S.n[x];
    if (alive(x) && n.loc === 'pen' && alive('krug') && d >= n.st.penDay + DAYS(4)) {
      n.loc = 'gone';
      n.st.goneDay = d;
      if (alive('hector') && knows('hector', 'sold', x)) {
        S.n.hector.op = Math.min(S.n.hector.op, -90);
        S.n.hector.rx.push(`"Krug sold my ${FAMW.hector[x]} on. Gone. So are you."`);
      }
    }
    if (x === 'bess' && alive(x) && n.loc === 'gone' && d >= n.st.goneDay + DAYS(3)) n.loc = 'wastes';
  }
  if (
    f.hectorKnew &&
    !f.bertWent &&
    S.n.bess.loc === 'pen' &&
    alive('bert') &&
    S.n.bert.loc === 'farm' &&
    d >= f.hectorKnew + DAYS(1) &&
    alive('krug')
  ) {
    f.bertWent = 1;
    S.n.bert.loc = 'pen';
    S.n.bert.st.penDay = d;
    if (alive('hector')) {
      S.n.hector.op = Math.max(S.n.hector.op - 20, -55);
      S.n.hector.rx.push(`"Bert went after his sister. Krug took him too. That's on you."`);
    }
  }
  if (f.mayorJob && !f.mayorPaid && !f.hitDone && alive('sheriff') && alive('mayor') && d >= f.mayorJobDay + DAYS(6)) {
    f.hitDone = 1;
    S.dead.sheriff = 1;
    event('murder', 'sheriff', { loc: 'rustwater', secret: true });
    S.n.mayor.rx.push(`"You took too long. I found someone cheaper. Molars work for scraps."`);
  }
  roamGutmaw();
  if (!f.kingStopped) {
    if (d >= DAYS(8) && !f.omen1) {
      f.omen1 = 1;
      bad('The ground shakes. Far to the east, something hums.');
    }
    if (d >= DAYS(12) && !f.raid) {
      f.raid = 1;
      raid();
    }
    if (d >= DAYS(17) && !f.omen2) {
      f.omen2 = 1;
      bad('A siren wails from somewhere east. It stops. Then starts again.');
    }
    if (d >= DAYS(22) && !f.omen3) {
      f.omen3 = 1;
      bad('The eastern sky glows green at night. The birds have stopped flying east.');
    }
    if (d >= DAYS(25)) S.end = { type: 'nuke' }; // day 120
  }
}
function raid() {
  const f = S.f;
  f.raidNews = 1;
  if (f.warned && alive('sheriff')) {
    f.raidResult = 'held';
    S.n.sheriff.op = clamp(S.n.sheriff.op + 15, -100, 100);
    S.n.sheriff.rx.push(`"The Molars came. We were ready. Thanks to you."`);
    IDS.forEach(x => {
      if (alive(x) && S.n[x].loc === 'rustwater') S.n[x].op = clamp(S.n[x].op + 10, -100, 100);
    });
    return;
  }
  f.raidResult = 'hit';
  const pool = ['moe', 'doc', 'opal', 'jeb'].filter(x => alive(x) && S.n[x].loc === 'rustwater');
  const dead = [];
  for (let i = 0; i < 2 && pool.length; i++) {
    const x = pool.splice(R(0, pool.length - 1), 1)[0];
    S.dead[x] = 1;
    dead.push(x);
  }
  f.raidDead = dead;
  if (alive('mayor')) f.mayorTribute = 1;
  dead.forEach(x => event('raidkill', x, { loc: 'rustwater', secret: true }));
}
