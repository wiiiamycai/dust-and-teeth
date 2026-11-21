'use strict';
// ================= GOSSIP THAT MAKES PEOPLE ACT =================
// News changes what people DO, not just what they think. Three hooks:
//   1. Scenes ask heard(id, type, v) and change what that person offers: services, new doors, lies.
//   2. onLearn(id, ev) runs the moment someone hears news. Use it to schedule consequences.
//   3. later(days, key, arg) queues a consequence. LATER[key] runs on that day's world tick,
//      so it lands days after the deed, when the player has moved on.
// Daily checks that depend on opinion (warnings, tip-offs) live in reactions().
const heard = (id, type, v) => alive(id) && knows(id, type, v);
const GOOD = ['tfixed', 'pump', 'hanged', 'rescued', 'freed', 'helped'];
const goodHeard = id => S.n[id].k.map(evById).filter(e => e && !e.secret && GOOD.includes(e.type)).length;
const liarTo = id => S.n[id].k.some(i => S.ev[i] && S.ev[i].type === 'lied');
function later(days, key, arg) {
  S.later.push({ day: S.day + days, key, arg: arg === undefined ? null : arg });
}
const LATER = {
  // Crane tells Rustwater you're alright. Coming from her, that counts.
  vouch: () => {
    if (!alive('sheriff')) return;
    ['moe', 'doc', 'opal', 'jeb'].forEach(x => {
      if (alive(x) && S.n[x].loc === 'rustwater') {
        S.n[x].op = clamp(S.n[x].op + 15, -100, 100);
        S.n[x].rx.push('"Crane says you\'re alright. Crane doesn\'t say that about anyone."');
      }
    });
  },
  // Someone in Scrapwell sells Krug the location of your bed.
  tipoff: who => {
    if (alive('krug') && alive(who)) S.f.netNight = who;
  },
};
const REACT = {
  hanged: id => {
    if (id === 'sheriff' && !S.f.vouched) {
      S.f.vouched = 1;
      later(2, 'vouch');
    }
  },
  pump: id => REACT.hanged(id),
};
function onLearn(id, ev) {
  if (REACT[ev.type]) REACT[ev.type](id, ev);
}
// People who hold a family grudge and will come looking for you on the road.
const AVENGE = ['hector', 'bert', 'junior', 'lou'];
function avengers() {
  return AVENGE.filter(x => {
    if (!hostile(x) || S.n[x].loc !== NPC[x].home) return false;
    if (x === 'hector') return true;
    return S.n[x].k.some(i => {
      const e = S.ev[i];
      return e && ['murder', 'slain', 'sold', 'stew'].includes(e.type) && relOf(x, e.v) === 'family';
    });
  });
}
function reactions() {
  const f = S.f;
  // Warning: Hector tells Bert what you are and hands him the spare rifle.
  if (hostile('hector') && alive('bert') && S.n.bert.loc === 'farm' && !f.bertWarned) {
    f.bertWarned = 1;
    const b = S.n.bert;
    b.op = Math.min(b.op, -65);
    b.lvl += 2;
    b.st.wep = 'rifle';
    b.rx.push('"Pa told me about you. Pa gave me his rifle."');
  }
  // Betrayal: someone back home who hates you tells Krug where you sleep. It lands two days later.
  if (!f.tipped && alive('krug')) {
    const t = ['elder', 'gus', 'crumb', 'pell'].find(x => alive(x) && S.n[x].op <= -50);
    if (t) {
      f.tipped = t;
      later(2, 'tipoff', t);
    }
  }
  const d = S.day;
  S.later = S.later.filter(q => {
    if (q.day > d) return true;
    LATER[q.key](q.arg);
    return false;
  });
}
