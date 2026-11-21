// Headless random playthroughs. Usage: node tests/fuzz.js index.html [games] [rand|survive]
const fs=require('fs'),vm=require('vm');
const code=require('./load')(process.argv[2]);const N=+process.argv[3]||1000;const MODE=process.argv[4]||'rand';
function mk(){const e={_h:'',children:[],hidden:false,style:{},appendChild(c){this.children.push(c)}};Object.defineProperty(e,'innerHTML',{get(){return this._h},set(v){this._h=v;this.children=[]}});return e}
const st={games:0,ends:{},errors:{},dead:{},bad:{},capped:0,maxLvl:{},scenes:{},maxDay:0,titles:{}};
for(let g=0;g<N;g++){const store={};const els={};
  const ctx={console,Math,JSON,String,Object,Array,document:{getElementById:id=>els[id]||(els[id]=mk()),createElement:()=>({style:{},innerHTML:'',onclick:null}),addEventListener(){}},
    localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},window:{}};
  vm.createContext(ctx);
  try{vm.runInContext(code,ctx)}catch(e){st.errors['boot:'+e.message]=(st.errors['boot:'+e.message]||0)+1;continue}
  st.games++;let ended=false,s=0,lastLvl=1;
  for(;s<1500;s++){
    const all=[...(els.opts?els.opts.children:[]),...(els.cards?els.cards.children:[]).filter(c=>c.onclick),...(els.map&&!els.map.hidden?els.map.children:[])];
    const txt=(els.text?els.text.innerHTML:'')+(els.log?els.log.innerHTML:'')+(els.head?els.head.innerHTML:'')+(els.hud?els.hud.innerHTML:'')+(els.opts?els.opts.children.map(c=>c.innerHTML).join(''):'');
    if(/undefined|NaN|\[object|null/.test(txt)){const m=txt.match(/.{0,60}(undefined|NaN|\[object|null).{0,30}/)[0];st.bad[m]=(st.bad[m]||0)+1}
    // visible checks are banned: no [Speech 62%], no [Brains], no Run (40%)
    {const vc=txt.match(/.{0,40}(\[[A-Z][a-z]+ \d+%\]|\[(Brains|Brawn|Charm)\]|Run \(\d+%\)|\(\d+%).{0,20}/);if(vc){const k='VISIBLE CHECK: '+vc[0];st.bad[k]=(st.bad[k]||0)+1}}
    let info;try{info=vm.runInContext('S?{sc:S.scene,l:S.level,d:S.day,t:S.titles.join("|")}:null',ctx)}catch(e){info=null}
    if(info){st.scenes[info.sc]=(st.scenes[info.sc]||0)+1;lastLvl=info.l;st.maxDay=Math.max(st.maxDay,info.d)}
    if(/This life is over/.test(els.text?els.text.innerHTML:'')){const k=(els.text.innerHTML.split(/[.!]/)[0]).slice(0,30);st.ends[k]=(st.ends[k]||0)+1;ended=true;break}
    if(!all.length){st.dead[info?info.sc:'?']=(st.dead[info?info.sc:'?']||0)+1;break}
    let pool=all;
    if(MODE==='survive'){ // avoid suicide-ish options
      const safe=all.filter(b=>!/Retire|Sell yourself|Ride the caravan|EVERYTHING|Ma Thistle quietly|Attack Ma Thistle|Nuke Scrapwell/.test(b.innerHTML||''));if(safe.length)pool=safe;
      vm.runInContext('if(S&&S.hp<8){S.hp=S.maxhp}',ctx);
    }
    const b=pool[Math.floor(Math.random()*pool.length)];
    try{b.onclick()}catch(e){const k=(info?info.sc:'?')+': '+e.message+' '+(e.stack||'').split('\n')[1];st.errors[k]=(st.errors[k]||0)+1;break}
  }
  if(!ended)st.capped++;st.maxLvl[lastLvl]=(st.maxLvl[lastLvl]||0)+1;
}
st.scenes=Object.keys(st.scenes).sort().join(',');
console.log(JSON.stringify(st,null,1));
