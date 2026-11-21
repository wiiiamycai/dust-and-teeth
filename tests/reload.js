// Random playthroughs with mid-game reloads to test saving. Usage: node tests/reload.js index.html
const fs=require('fs'),vm=require('vm');const _src=fs.readFileSync(process.argv[2],'utf8');const code=_src.includes('<script>')?_src.split('<script>')[1].split('</script>')[0]:_src;
function mk(){const e={_h:'',children:[],hidden:false,style:{},appendChild(c){this.children.push(c)}};Object.defineProperty(e,'innerHTML',{get(){return this._h},set(v){this._h=v;this.children=[]}});return e}
let errs={},bad={},rl=0;
for(let g=0;g<800;g++){const store={};let els,ctx;const boot=()=>{els={};ctx={console,Math,JSON,String,Object,Array,document:{getElementById:id=>els[id]||(els[id]=mk()),createElement:()=>({style:{}}),addEventListener(){}},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},window:{}};vm.createContext(ctx);vm.runInContext(code,ctx)};
 try{boot()}catch(e){errs['boot '+e.message]=1;continue}
 for(let s=0;s<800;s++){if(Math.random()<0.04){try{boot();rl++}catch(e){errs['reload '+e.message]=(errs['reload '+e.message]||0)+1;break}}
  vm.runInContext('if(S&&S.hp<8)S.hp=S.maxhp',ctx);
  const all=[...els.opts.children,...els.cards.children.filter(c=>c.onclick),...(els.map&&!els.map.hidden?els.map.children:[])];
  const t=els.text.innerHTML+els.log.innerHTML;if(/undefined|NaN/.test(t)){const m=t.match(/.{0,50}(undefined|NaN).{0,30}/)[0];bad[m]=(bad[m]||0)+1}
  if(/This life is over/.test(els.text.innerHTML)||!all.length)break;
  try{all[Math.floor(Math.random()*all.length)].onclick()}catch(e){const k=e.message+(e.stack||'').split('\n')[1];errs[k]=(errs[k]||0)+1;break}}}
console.log({rl,errs,bad});
