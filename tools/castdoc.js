// Writes the readable cast bible from the game data. Usage: node tools/castdoc.js > CAST.md
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = {};
vm.createContext(ctx);
for (const f of ['data/npcs.js', 'data/world.js', 'data/cast.js'])
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8').replace(/^'use strict';/, '').replace(/\bconst (\w+) =/g, 'var $1 ='), ctx);
const { NPC, BONDS, SECRETS, LOC } = ctx;
const name = id => NPC[id].n;
const out = ['# Dust & Teeth: the cast', '', 'Generated from `data/cast.js` by `node tools/castdoc.js > CAST.md`. Mark it up and tell Claude what to change.', ''];
const homes = ['scrapwell', 'rustwater', 'farm', 'diner', 'chainfield', 'silo'];
for (const h of homes) {
  out.push(`## ${LOC[h].n}`, '');
  for (const id of Object.keys(NPC).filter(x => NPC[x].home === h)) {
    out.push(`### ${NPC[id].i} ${name(id)}`, '');
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
  'Each leaves a sign in one place in the days before. You only hear how it ended if you knew or were there; otherwise you find the aftermath.', '',
  "- **Day 9, Lou takes Bacon Prime.** Sign: the specials board at the diner. Clue: Lou, Junior, Hector. Change it: warn Pell; steal the pig for Lou yourself; sit up at the sty and scare off, fight, or let Junior go.",
  "- **Day 10, Doc poisons the Mayor.** Sign: through Doc's window in Rustwater. Clue: Gloria, Opal, or Doc's secret. Change it: warn Fenwick (60 teeth); help Doc (80 teeth, Fenwick dies tomorrow); swap the vial (Steal); tell Crane (Doc hangs, no healer).",
  "- **Day 11, Krug hits Jeb's caravan.** Sign: Krug's men at Moe's bar. Clue: Moe, Teo, Pete. Change it: warn Jeb (half price forever); ride guard and fight; tell Crane; sell Krug the road (80 teeth, Jeb dies). Ignored: Jeb lives, prices up, Pete dies.",
  "- **Day 16, Opal counts the takings.** Sign: Opal and her ledger, late. Clue: Jeb, Moe, or Gloria's secret. Change it: warn Gloria (she runs east with Jeb); pay back the 150 yourself; tell Opal (Gloria is thrown out).",
  "- **Day 18, Lou finds Junior's cabbages.** Sign: the cabbages behind the diner. Clue: Crumb, Bess. Change it: talk Junior into leaving (Junior's Greens in Rustwater); hide the patch (Sneak); tell Lou yourself (Speech: cabbage Tuesdays, or she salts it).",
  '', '## Ripples (a death changes the lives tied to it)', '',
  "- Krug: water goes up (no night shift at the pump), Moe's debt is gone, Lou's stew thins, Opal sleeps.",
  "- Mayor: Crane breaks the pump lock and water is free (unless Doc took the pump).",
  "- Jeb: Pete leaves the valley, Gloria is stuck, no shop and no ride east.",
  "- Lou: Junior moves to Rustwater and opens Junior's Greens.",
  "- Sheriff: Fenwick puts water up. Opal: Gloria runs the Velvet Rad. Hector: Bess takes the farm road, Jeb's prices rise.",
  '- Everyone else: the people tied to them say so, in their own words, the next time you talk.', '');
process.stdout.write(out.join('\n'));
