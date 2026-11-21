'use strict';
// ================= MEMORY & GOSSIP =================
function event(type, v, o) {
  o = o || {};
  const ev = {
    id: S.evN++,
    type,
    v: v || null,
    day: S.day,
    loc: o.loc || S.here,
    secret: !!o.secret,
    wit: [],
    tgt: o.tgt || null,
    loud: !!o.loud,
  };
  S.ev.push(ev);
  if (o.wit) ev.wit = o.wit.filter(x => alive(x));
  else if (!ev.secret) {
    // Gunfire carries: people one road away hear it too.
    const near = ev.loud ? neighbours(ev.loc) : [];
    ev.wit = IDS.filter(
      x =>
        x !== v && alive(x) && !NPC[x].animal && (S.n[x].loc === ev.loc || x === S.spouse || near.includes(S.n[x].loc)),
    );
  }
  ev.wit.forEach(x => learn(x, ev));
  if (v && alive(v) && !NPC[v].animal) learn(v, ev);
  if (o.all)
    IDS.forEach(x => {
      if (alive(x) && !NPC[x].animal) learn(x, ev);
    });
  return ev;
}
function opDelta(id, ev) {
  if (ev.secret) return 0;
  const T = EV[ev.type];
  if (!T) return 0;
  const r = ev.v ? relOf(id, ev.v) : null;
  let d = T.spec && T.spec[id] !== undefined ? T.spec[id] : T[r || 'other'] || 0;
  if (ev.wit.includes(id) && T.witness) d += T.witness;
  if (ev.type === 'rescued' && id === ev.v && knows(id, 'sold', id)) d = 30;
  if (T.crime && LAW[id] && ev.v && NPC[ev.v].home === LAW[id] && r !== 'enemy' && r !== 'self') d -= 40;
  return d;
}
function rxLine(id, ev, d) {
  const vn = ev.v ? NPC[ev.v].n : '',
    r = ev.v ? relOf(id, ev.v) : null,
    fw = (FAMW[id] || {})[ev.v] || 'kin';
  if (ev.type === 'raidkill') return r === 'family' || r === 'friend' ? `"The Molars got ${vn}."` : null;
  if (RXS[`${ev.type}::${id}`]) return RXS[`${ev.type}::${id}`];
  if (ev.secret) {
    if (r === 'family') return `"Someone killed my ${fw}. When I find out who..."`;
    if (r === 'friend') return `"Somebody murdered ${vn}. You hear anything?"`;
    return null;
  }
  const G = RXG[ev.type];
  if (!G) return null;
  const k = r || 'other';
  const fn = G[k];
  if (!fn) return null;
  if (k === 'other' && Math.abs(d) < 10) return null;
  return fn(vn, fw);
}
function learn(id, ev) {
  const n = S.n[id];
  if (!n || !alive(id) || n.k.includes(ev.id)) return;
  n.k.push(ev.id);
  const d = opDelta(id, ev);
  n.op = clamp(n.op + d, -100, 100);
  const l = rxLine(id, ev, d);
  if (l) {
    n.rx.push(l);
    if (n.rx.length > 3) n.rx.shift();
  }
  if (ev.type === 'sold' && relOf(id, ev.v) === 'family' && S.n[ev.v].loc === 'pen') {
    n.op = Math.max(n.op, -55);
    if (id === 'hector' && ev.v === 'bess') S.f.hectorKnew = S.day;
  }
  onLearn(id, ev);
}
const knows = (id, type, v) =>
  S.n[id].k.some(i => {
    const e = S.ev[i];
    return e.type === type && (v === undefined || e.v === v);
  });
function spread() {
  for (const ev of S.ev) {
    if (S.day - ev.day > 14) continue;
    for (const id of IDS) {
      if (!alive(id) || NPC[id].animal || S.n[id].k.includes(ev.id)) continue;
      const loc = S.n[id].loc;
      let p = 0;
      if (['cage', 'pen', 'gone', 'free'].includes(loc)) continue;
      if (IDS.some(o => o !== id && alive(o) && S.n[o].loc === loc && S.n[o].k.includes(ev.id))) p = 60;
      if (ev.loc === loc) p = Math.max(p, ev.secret ? 70 : 45);
      for (const o of IDS) {
        const r = relOf(id, o);
        if (r && r !== 'enemy' && r !== 'self' && alive(o) && S.n[o].k.includes(ev.id)) {
          p = Math.max(p, 45);
          break;
        }
      }
      if ((id === 'moe' || id === 'jeb') && !ev.secret) p = Math.max(p, ev.type === 'sold' ? 60 : 35);
      if (['hector', 'bess', 'bert', 'lou', 'junior'].includes(id) && alive('jeb') && S.n.jeb.k.includes(ev.id))
        p = Math.max(p, 50);
      if (ev.v && relOf(id, ev.v) === 'family') p = Math.max(p, 35);
      if (ev.loud) p = Math.min(95, Math.max(p + 20, 25)); // people talk about gunfire
      if (p && roll(p)) learn(id, ev);
    }
  }
}
function sumEv(ev) {
  const v = ev.v ? NPC[ev.v].n : '';
  return (
    {
      murder: `you killed ${v}`,
      slain: `you killed ${v}`,
      sold: `you sold ${v} to Krug`,
      stew: `you sold ${v} to Mama Lou. For stew`,
      rescued: `you got ${v} out alive`,
      freed: 'you emptied the Chainfield pens',
      married: `you married ${v}`,
      cannibal: 'you eat people now',
      slaver: 'you joined the slavers',
      pump: 'you got the Mayor to open the pump',
      hanged: 'you got the Mayor hanged',
      tfixed: 'you made the Holy Toaster speak',
      helped: `you helped ${v}`,
      nuked: `you nuked ${ev.tgt && LOC[ev.tgt] ? LOC[ev.tgt].n : 'somewhere'}`,
      lied: `you lied to ${v}`,
      gutmaw: 'you killed the Gutmaw',
    }[ev.type] || null
  );
}
function news(id, dflt) {
  const ks = S.n[id].k
    .map(evById)
    .filter(e => e && !e.secret && sumEv(e))
    .slice(-2);
  return ks.length ? `"Heard ${ks.map(sumEv).join('. And ')}."` : dflt;
}
