'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../assets');
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS',name);}
const local=new Map(),session=new Map();
function storage(map){return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};}
function environment(hash='#/welcome',width=1366) {
 const app={innerHTML:'',querySelectorAll:()=>[],events:{},addEventListener(k,fn){this.events[k]=fn;}};
 const dialog={events:{},returnValue:'',addEventListener(k,fn){this.events[k]=fn;},showModal(){}};
 const toast={hidden:true,textContent:''},classes=new Set(),events={};
 const document={title:'',documentElement:{lang:'en'},querySelectorAll:()=>[],body:{classList:{add:k=>classes.add(k),contains:k=>classes.has(k),toggle:k=>classes.has(k)?classes.delete(k):classes.add(k)}},getElementById:id=>id==='app'?app:id==='confirm-dialog'?dialog:id==='toast'?toast:null,querySelector:()=>null};
 const window={addEventListener:(k,fn)=>events[k]=fn,scrollTo(){},print(){}};
 const ctx={window,document,location:{hash},localStorage:storage(local),sessionStorage:storage(session),innerWidth:width,Intl,Date,URLSearchParams,structuredClone,console,setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:fn=>fn(),FormData:class {constructor(form){return Object.entries(form.data||{});}}};
 vm.createContext(ctx);
 for(const file of ['config.js','locales.js','i18n.js','model.js','views.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
 return {ctx,app,events,dialog,classes};
}
let env=environment();
check('Direct file-style entry renders the welcome page',()=>assert(env.app.innerHTML.includes('Every request.')));
check('Login rejects an incorrect demo password',()=>{
 env.ctx.location.hash='#/login';env.events.hashchange();
 const error={hidden:true,textContent:''};
 env.app.events.submit({preventDefault(){},target:{id:'demo-login-form',elements:{password:{value:'wrong'}},querySelector:()=>error}});
 assert(!error.hidden);assert(!session.size);
});
check('Shared demo login opens Production and stores session separately from scenario data',()=>{
 env.app.events.submit({preventDefault(){},target:{id:'demo-login-form',elements:{password:{value:'ExploreProcure!2026'}}}});
 assert(env.ctx.location.hash.includes('PRODUCTION'));
 assert.equal(session.get('procuresync-demo-session'),'open');
 assert(JSON.parse(local.get('procuresync-portfolio-v1')).prs.length===6);
});
check('Each role navigation renders its own workspace and guide',()=>{
 for(const role of env.ctx.window.DemoModel.roles){
  env.ctx.location.hash='#/'+role+'/dashboard';env.events.hashchange();
  assert(env.app.innerHTML.includes('About this page'));assert(env.app.innerHTML.includes(role+'/dashboard" class="active"'));
 }
});
check('Client routing rejects a Warehouse attempt to open Finance budgets',()=>{
 env.ctx.location.hash='#/WAREHOUSE/budgets';env.events.hashchange();
 assert.equal(env.ctx.location.hash,'#/WAREHOUSE/dashboard');
});
check('Reload restores the selected workspace and session',()=>{
 env=environment('#/FINANCE/invoices',390);
 assert(env.app.innerHTML.includes('Invoice review queue'));assert(env.classes.has('sidebar-collapsed'));
});
check('Restart replaces all scenario data and starts again in Production',()=>{
 const saved=JSON.parse(local.get('procuresync-portfolio-v1'));saved.prs.length=1;local.set('procuresync-portfolio-v1',JSON.stringify(saved));
 env=environment('#/FINANCE/dashboard');
 env.dialog.returnValue='restart';env.dialog.events.close({target:env.dialog});
 assert.equal(JSON.parse(local.get('procuresync-portfolio-v1')).prs.length,6);
 assert.equal(env.ctx.location.hash,'#/PRODUCTION/dashboard');
});
check('Language switching retains the session, scenario and active route',()=>{
 const before=local.get('procuresync-portfolio-v1');
 env.app.events.change({target:{value:'id',matches:key=>key==='[data-demo-language]'}});
 assert.equal(env.ctx.document.documentElement.lang,'id');
 assert.equal(env.ctx.location.hash,'#/PRODUCTION/dashboard');
 assert.equal(local.get('procuresync-portfolio-v1'),before);
 assert.equal(session.get('procuresync-demo-session'),'open');
 assert(env.app.innerHTML.includes('Tentang halaman ini'));
 env.app.events.change({target:{value:'en',matches:key=>key==='[data-demo-language]'}});
 assert(env.app.innerHTML.includes('About this page'));
});
check('Unsaved form inputs survive language rerender',()=>{
 env.ctx.location.hash='#/PRODUCTION/requisitions/new';env.events.hashchange();
 const makeForm=()=>({
  dataset:{action:'createPr'},
  fields:[{value:'',type:'select-one'},{value:'',type:'textarea'}],
  querySelector:()=>null,
  querySelectorAll(selector){return selector==='input,select,textarea'?this.fields:[];}
 });
 let current=makeForm(),markup=env.app.innerHTML;
 current.fields[0].value='2';current.fields[1].value='Unsaved note: Box must stay Box';
 env.app.querySelectorAll=selector=>selector==='form'?[current]:[];
 Object.defineProperty(env.app,'innerHTML',{get:()=>markup,set:value=>{markup=value;current=makeForm();},configurable:true});
 env.app.events.change({target:{value:'id',matches:key=>key==='[data-demo-language]'}});
 assert.equal(current.fields[0].value,'2');
 assert.equal(current.fields[1].value,'Unsaved note: Box must stay Box');
 env.app.events.change({target:{value:'en',matches:key=>key==='[data-demo-language]'}});
});
check('Logout clears the session and retains the local scenario',()=>{
 env.app.events.click({target:{closest:()=>({matches:key=>key==='[data-logout]'})}});
 assert.equal(session.size,0);assert(local.size);
});
console.log(JSON.stringify({passed,failed:0}));
