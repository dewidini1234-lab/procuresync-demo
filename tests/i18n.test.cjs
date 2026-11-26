'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../assets'),storage=new Map(),context={
 window:{},Intl,Date,URLSearchParams,structuredClone,console,
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}
};
vm.createContext(context);
for(const file of ['config','locales','i18n','model','views'])vm.runInContext(fs.readFileSync(path.join(base,file+'.js'),'utf8'),context);
const {DemoModel:M,DemoViews:V,DemoI18n:T,DEMO_LOCALES:L}=context.window;
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS',name);}
const s=M.seed(),before=JSON.stringify(s);
check('English is the initial locale and Indonesian persists independently',()=>{
 assert.equal(T.locale(),'en');T.setLocale('id');assert.equal(storage.get('procuresync-demo-locale'),'id');
 assert.equal(T.t('About this page'),'Tentang halaman ini');T.setLocale('en');
 assert.equal(T.t('About this page'),'About this page');
});
check('Welcome, login and role shell contain the language selector',()=>{
 for(const locale of ['en','id']) {
  T.setLocale(locale);
  for(const html of [V.welcome(),V.login(),V.shell(s,'PRODUCTION','dashboard',null,{},null)])
   assert(html.includes('data-demo-language'));
 }
});
check('All source-derived sidebar pages render their guide in both languages',()=>{
 for(const locale of ['en','id']){
  T.setLocale(locale);
  for(const [role,entries]of Object.entries(context.window.DEMO_CONFIG.navigation))
   for(const [,route]of entries) {
    const p=route.startsWith('/dashboard/')?'dashboard':route.slice(1),html=V.shell(s,role,p,null,{},null);
    assert(html.includes(locale==='id'?'Tentang halaman ini':'About this page'),locale+' '+role+' '+p);
    assert(!html.includes('\uE000')&&!html.includes('\uE001'),'Protected values must resolve.');
   }
 }
 assert.equal(JSON.stringify(s),before);
});
check('Landing workflow uses existing language keys and retains the English wording',()=>{
 T.setLocale('id');
 const id=V.welcome();
 for(const text of ['Ajukan permintaan pembelian','Terbitkan pesanan per pemasok','Terima dan alokasikan barang (FIFO)','Periksa, cocokkan, dan bayar'])assert(id.includes(text));
 for(const text of ['Production or Division Manager','Create &amp; submit PR','Source vendor &amp; fixed price','Review invoice, match &amp; pay'])assert(!id.includes(text));
 T.setLocale('en');
 const en=V.welcome();
 assert(en.includes('Production or Division Manager'));
 assert(en.includes('Create &amp; submit PR'));
 assert(en.includes('Review invoice, match &amp; pay'));
});
check('Menus, guide headings, unit options, status labels and buttons follow Indonesian',()=>{
 T.setLocale('id');
 const requisition=V.shell(s,'PRODUCTION','requisitions/view',1,{},null);
 assert(requisition.includes('Ajukan permintaan'));assert(requisition.includes('Kotak'));
 assert(requisition.includes('Shift Pagi (07:00–15:00)'));
 assert(!requisition.includes(' shift ('));assert(!requisition.includes('>Box<'));
 const masters=V.shell(s,'SUPER_ADMIN','admin/masters',null,{},null);
 for(const unit of ['Rim','Batang','Dus','Karung','Buah'])assert(masters.includes('>'+unit+'</option>'));
 assert.equal(V.human('MATCHED_100'),'Sesuai 100%');
 assert(V.shell(s,'FINANCE','invoices/view',1,{},null).includes('Pemeriksaan dan koreksi OCR'));
});
check('User-entered data identical to translation keys stays exactly as entered',()=>{
 const c=structuredClone(s);
 c.prs[0].notes='Start Interactive Demo';c.prs[0].creator='About this page';c.catalog[0].name='Box';
 T.setLocale('id');const html=V.shell(c,'PRODUCTION','requisitions/view',1,{},null);
 assert(html.includes('>Start Interactive Demo</textarea>'));
 assert(html.includes(' · About this page'));
 assert(html.includes('>Box</td>'));
 assert(html.includes('Kotak'));
 assert.equal(c.catalog[0].unit,'Box');assert.equal(c.prs[0].lines[0].qty,12000);
});
check('Validation, notices and dynamic placeholder messages have centralized Indonesian translations',()=>{
 T.setLocale('id');
 for(const message of ['The request exceeds the remaining monthly budget.','Submitted to Purchasing for vendor sourcing.','This staff member is not scheduled at the scenario time. Review the shift roster.','One transfer must equal the full approved invoice amount.','Use the demo password shown below.'])
  assert.notEqual(T.t(message),message,message);
 assert.equal(T.t('Damage decision · {item}',{item:'Box'}),'Penanganan barang rusak · Box');
 assert.equal(T.t('Enter a nonnegative decimal with up to 3 decimal places.'),'Masukkan angka nol atau lebih dengan maksimal 3 angka di belakang titik desimal.');
});
check('Locale changes preserve all scenario data including payment and audit records',()=>{
 const original=JSON.stringify(s);
 for(let i=0;i<4;i++){T.setLocale(i%2?'id':'en');V.shell(s,'FINANCE','invoices/view',1,{},null);}
 assert.equal(JSON.stringify(s),original);
});
check('Safe numeric input values and route/role codes remain stable across locales',()=>{
 for(const locale of ['en','id']){
  T.setLocale(locale);const html=V.shell(s,'PRODUCTION','requisitions/view',1,{},null);
  assert(html.includes('value="12.000"'));assert(html.includes('#/PURCHASING/dashboard'));assert(html.includes('value="Box"')===false);
 }
 assert.equal(V.href('FINANCE','invoices/view',1),'#/FINANCE/invoices/view?id=1');
});
console.log(JSON.stringify({passed,failed:0,catalogEntries:Object.keys(L.id).length}));
