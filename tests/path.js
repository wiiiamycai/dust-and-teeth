// Scripted playthrough. Usage: node tests/path.js index.html '["Go","Leave (map)","TRAVEL:Rustwater","EVAL:S.day"]'
const fs=require('fs'),vm=require('vm');const code=require('./load')(process.argv[2]);
function mk(){const e={_h:'',children:[],hidden:false,style:{},appendChild(c){this.children.push(c)}};Object.defineProperty(e,'innerHTML',{get(){return this._h},set(v){this._h=v;this.children=[]}});return e}
const els={},store={};const M=Object.create(Math);let seq=null;M.random=()=>seq!==null?seq:Math.random();
const ctx={console,Math:M,JSON,String,Object,Array,document:{getElementById:id=>els[id]||(els[id]=mk()),createElement:()=>({style:{},innerHTML:'',onclick:null}),addEventListener(){}},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},window:{}};
vm.createContext(ctx);vm.runInContext(code,ctx);
const strip=h=>h.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const clickables=()=>[...els.opts.children,...els.cards.children.filter(c=>c.onclick),...(els.map&&!els.map.hidden?els.map.children:[])];
const screen=()=>strip(els.head.innerHTML)+' | '+strip(els.log.innerHTML)+' | '+strip(els.text.innerHTML);
function click(sub){const b=clickables();const i=b.findIndex(x=>strip(x.innerHTML).includes(sub));if(i<0){console.log('MISSING:',sub,'\n SCREEN:',screen(),'\n HAVE:',b.map(x=>strip(x.innerHTML)).join(' | '));process.exit(1)}b[i].onclick()}
function fightOut(){let n=0;while(/Fight · round/.test(strip(els.head.innerHTML))&&n++<80)click('Hit ');}
const god=()=>vm.runInContext('if(S){S.hp=S.maxhp=999;for(const k in S.skills)S.skills[k]=200;}',ctx);
function travel(dest){click(dest);// may hit encounter
 for(let k=0;k<3;k++){const h=strip(els.head.innerHTML);if((/On the road|Raider Queen|A posse|Krug's hunters|A survivor/.test(h)||/🔫Hector$/.test(h))){const b=clickables();const f=b.find(x=>/Fight|Leave him|Pay|Apologise|Loot him|Leave them|Decline|Buy it|Explain/.test(strip(x.innerHTML)))||b[0];f.onclick();fightOut();}}}
const steps=JSON.parse(process.argv[3]);
for(const s of steps){god();if(process.env.V)console.log('>>',s,'::',screen().slice(0,250));
 if(s==='FIGHT'){fightOut();continue}
 if(s.startsWith('TRAVEL:')){travel(s.slice(7));continue}
 if(s.startsWith('EVAL:')){console.log('EVAL',vm.runInContext(s.slice(5),ctx));continue}
 if(s.startsWith('WAIT:')){for(let i=0;i<+s.slice(5);i++)vm.runInContext('tick()',ctx);continue}
 click(s)}
console.log('FINAL:',screen().slice(0,3000));
