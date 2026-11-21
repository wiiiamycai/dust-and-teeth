// Writes the readable cast bible from the game data. Usage: node tools/castdoc.js > CAST.md
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = {};
vm.createContext(ctx);
for (const f of ['data/npcs.js', 'data/world.js', 'data/cast.js'])
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8').replace(/^'use strict';/, '').replace(/\bconst (\w+) =/g, 'var $1 ='), ctx);
const { NPC, BONDS, REP, SECRETS, LOC } = ctx;
const name = id => NPC[id].n;
const out = ['# Dust & Teeth: the cast', '', 'Generated from `data/cast.js` by `node tools/castdoc.js > CAST.md`. Mark it up and tell Claude what to change.', ''];
const homes = ['scrapwell', 'rustwater', 'farm', 'diner', 'chainfield', 'silo'];
for (const h of homes) {
  out.push(`## ${LOC[h].n}`, '');
  for (const id of Object.keys(NPC).filter(x => NPC[x].home === h)) {
    out.push(`### ${NPC[id].i} ${name(id)}`, '', `**What the valley says:** ${REP[id]}`, '');
    const s = SECRETS[id];
    if (s) out.push(`**Secret:** ${s.t}`, '', `Told by: ${s.tell.map(name).join(', ')}. Worth ${s.pay} teeth to keep quiet.`, '');
    const mine = BONDS.filter(b => b[0] === id || b[1] === id);
    if (mine.length) {
      out.push('**Bonds:**', '');
      for (const [a, b, kind, ab, ba] of mine) out.push(`- ${kind}, ${name(a === id ? b : a)}: ${a === id ? ab : ba}`);
      out.push('');
    }
  }
}
out.push('## Plots (people against people)', '',
  '- **Day 9, Lou takes Bacon Prime.** Clue: ask Lou or Junior about Pell or the pig, or Hector about Lou. Warn Pell to stop it.',
  '- **Day 10, Doc poisons the Mayor.** Learn Doc\'s secret (Gloria, Opal). Warn Fenwick (60 teeth), or help Doc speed it up (80 teeth, he dies tomorrow).',
  '- **Day 11, Krug hits Jeb\'s caravan.** Clue: ask Moe or Teo about Jeb or Krug, or Pete about Krug. Warn Jeb (half price forever), or sell Krug the road (80 teeth, Jeb dies). Ignored: Jeb lives, prices up, Pete dies guarding.',
  '- **Day 16, Opal counts the takings.** Learn Gloria\'s secret (Jeb, Moe). Warn Gloria (she runs east with Jeb), or tell Opal (Gloria is thrown out, and knows who told).',
  '- **Day 18, Lou finds Junior\'s cabbages.** Learn Junior\'s secret (Crumb, Bess). Talk him into leaving (speech): he opens Junior\'s Greens in Rustwater.',
  '- Already in the game: the Mayor\'s hit on the Sheriff, Opal\'s bounty on Krug, and every way to get Krug killed by someone else.', '');
process.stdout.write(out.join('\n'));
