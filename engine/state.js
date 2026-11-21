"use strict";
// ================= STATE HELPERS =================
const alive=id=>!S.dead[id];
const lvl=id=>S.n[id].lvl;
const hostile=id=>alive(id)&&NPC[id].fighter&&S.n[id].op<=-60&&S.n[id].loc!=='party';
const perk=p=>S.perks.includes(p);
const evById=i=>S.ev[i];
function newGame(k){const p=PRESETS[k];const n={};
  IDS.forEach(id=>{const d=NPC[id];n[id]={loc:d.loc,op:d.op||0,k:[],rx:[],lvl:d.lvl,st:{}}});
  S={preset:k,name:p.name,stats:{...p.stats},skills:{...p.skills},hp:p.hp,maxhp:p.hp,teeth:p.teeth,weapons:[...p.weapons],weapon:p.weapon,armors:['rags'],armor:'rags',
    inv:{...p.inv},day:1,level:1,xp:0,pts:0,perks:[],perkPend:0,perkOpts:null,karma:0,titles:[],f:{},dead:{},kills:0,spouse:null,addicted:false,buzzOn:false,
    end:null,fight:null,scene:'intro',args:[],here:'scrapwell',ret:null,n,ev:[],evN:0,crater:{}};
}
function P(sk,mod){let v=S.skills[sk]+(mod||0);if(sk==='speech'){v+=(S.stats.charm-5)*3;if(perk('tongue'))v+=15}
  if(sk==='steal'||sk==='sneak'){v+=(S.stats.twitch-5)*2;if(perk('fingers'))v+=15}if(sk==='science')v+=(S.stats.brains-5)*2;return clamp(v,5,95)}
const tag=(sk,mod)=>`[${cap(sk)} ${P(sk,mod)}%]`;
function chk(sk,mod){const ok=roll(P(sk,mod));if(ok)gainXP(10);return ok}
function cost(base,id){const op=id&&S.n[id]?S.n[id].op:0;return Math.max(1,Math.round(base*clamp(1-op/200,.6,1.6)*(perk('tax')?.75:1)))}
function pay(n){if(S.teeth<n){bad(`You need ${n} teeth. You have ${S.teeth}.`);return false}S.teeth-=n;return true}
function gain(n){S.teeth+=n;say(`+${n} teeth.`)}
function give(k,n){S.inv[k]=(S.inv[k]||0)+(n||1)}
const has=k=>(S.inv[k]||0)>0;
function take(k){if(has(k)){S.inv[k]--;if(!S.inv[k])delete S.inv[k];return true}return false}
function heal(n){const b=S.hp;S.hp=clamp(S.hp+n,0,S.maxhp);return S.hp-b}
function hurt(n,cause){S.hp-=n;if(S.hp<=0){S.hp=0;die(cause);return true}return false}
function addTitle(t){if(!S.titles.includes(t)){S.titles.push(t);say(`Reputation: ${t}.`)}}
function karma(n){S.karma+=n}
function karmaTitle(){const k=S.karma;return k>=10?'Wasteland Saint':k>=4?'Decent Sort':k>-4?'Nobody Special':k>-10?'Scumbag':'Walking Atrocity'}
const xpFor=L=>75*(L-1)*L/2;
function gainXP(n){S.xp+=n;while(S.level<12&&S.xp>=xpFor(S.level+1)){S.level++;const pts=10+S.stats.brains*2,hp=3+Math.floor(S.stats.guts/2);S.pts+=pts;S.maxhp+=hp;S.hp+=hp;if(S.level%2===0)S.perkPend++;
  say(`LEVEL UP! Level ${S.level}. +${pts} skill points, +${hp} max HP${S.level%2===0?', and a new perk':''}. Open Character to spend them.`)}}
function die(cause){S.end={type:'death',cause};S.fight=null;go('ending')}
function learnSilo(){if(!S.f.knowSilo){S.f.knowSilo=1;say('Silo 9 is now on your map.')}}
function mood(op){return op<=-60?'😠 hostile':op<=-35?'😒 cold':op<-10?'🤨 wary':op<20?'😐 neutral':op<60?'🙂 friendly':'😍 loyal'}
const charOpt=()=>['Character (stats, gear, level up)',()=>{S.ret={scene:S.scene,args:S.args};go('char')}];
function corpseOpt(){if(!S.f.cannibal||!S.f.corpse)return null;return [`Eat ${S.f.corpse}`,()=>{const h=heal(perk('eater')?40:20);say(`You eat ${S.f.corpse}. +${h} HP. Peppery.`);if(!perk('eater'))karma(-1);S.f.corpse=null;go(S.scene,...S.args)}]}

