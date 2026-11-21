"use strict";
// ================= CHARACTER =================
SC.char=()=>{const st=S.stats,sk=S.skills,o=[];
  if(S.perkPend>0){if(!S.perkOpts||!S.perkOpts.length)S.perkOpts=shuffle(Object.keys(PERKS).filter(p=>!S.perks.includes(p))).slice(0,3);
    S.perkOpts.forEach(p=>o.push([`PERK: ${PERKS[p].n}. ${PERKS[p].d}`,()=>{S.perks.push(p);S.perkPend--;S.perkOpts=null;say(`Perk taken: ${PERKS[p].n}.`);go('char')}]))}
  if(S.pts>0)['melee','guns','sneak','steal','speech','science'].forEach(k=>o.push([`+${Math.min(5,S.pts)} ${cap(k)} (now ${sk[k]})`,()=>{const a=Math.min(5,S.pts);sk[k]+=a;S.pts-=a;go('char')}]));
  S.weapons.filter(w=>w!==S.weapon).forEach(w=>o.push([`Wield ${W[w].n} (${W[w].t}, ${W[w].d[0]}-${W[w].d[1]})`,()=>{S.weapon=w;go('char')}]));
  S.armors.filter(a=>a!==S.armor).forEach(a=>o.push([`Wear ${A[a].n} (armour ${A[a].dr}${A[a].tw?', twitch '+A[a].tw:''})`,()=>{S.armor=a;go('char')}]));
  if(has('gutglue')&&S.hp<S.maxhp)o.push(['Use Gut Glue (+20)',()=>{take('gutglue');say(`+${heal(20)} HP.`);go('char')}]);
  if(has('meat')&&S.hp<S.maxhp)o.push(['Eat questionable meat (+8)',()=>{take('meat');say(`+${heal(8)} HP. Don't wonder.`);go('char')}]);
  if(has('beer')&&S.hp<S.maxhp)o.push(['Drink warm beer (+3)',()=>{take('beer');say(`+${heal(3)} HP.`);go('char')}]);
  if(S.spouse)o.push([`Murder your spouse, ${NPC[S.spouse].n}`,()=>{const r=S.ret||{scene:'map',args:[]};fight([foe(S.spouse)],{started:true,win:'go',args:[r.scene,...r.args]})},'danger']);
  o.push(['Close',()=>{const r=S.ret||{scene:'map',args:[]};go(r.scene,...r.args)}]);
  const items=Object.keys(S.inv).filter(k=>S.inv[k]>0).map(k=>`${ITEMS[k]||k}${S.inv[k]>1?' x'+S.inv[k]:''}`);
  show({title:`${S.name}, ${PRESETS[S.preset].title}`,icon:'🧍',sub:`Level ${S.level} · ${S.pts} skill points · Day ${S.day} · ${S.kills} kills`,
    text:`Brawn ${st.brawn}  Eyes ${st.eyes}  Guts ${st.guts}  Charm ${st.charm}  Brains ${st.brains}  Twitch ${ptw()}  Luck ${st.luck}
Melee ${sk.melee}  Guns ${sk.guns}  Sneak ${sk.sneak}  Steal ${sk.steal}  Speech ${sk.speech}  Science ${sk.science}
Perks: ${S.perks.length?S.perks.map(p=>PERKS[p].n).join(', '):'none'}
Carrying: ${items.join(', ')||'regret'}
Reputation: ${karmaTitle()}${S.titles.length?' · '+S.titles.join(' · '):''}${S.addicted?' · ADDICTED':''}${S.f.rash?' · RASH':''}`,opts:o});
};

