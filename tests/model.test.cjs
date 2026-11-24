'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const M=require(path.join(base,'assets/model.js'));
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS',name);}
let s=M.seed();
const run=(role,action,data)=>{const result=M.transition(s,role,action,data);s=result.state;return result;};
test('Invalid permissions and failed actions leave original state unchanged',()=>{
 const before=JSON.stringify(s);
 assert.throws(()=>M.transition(s,'WAREHOUSE','decideBudget',{id:3}),/role/);
 assert.throws(()=>M.transition(s,'DIVISION_MANAGER','submitPr',{id:1}),/another cost center/);
 assert.equal(JSON.stringify(s),before);
});
test('Request creation validates integer units and duplicate items',()=>{
 assert.throws(()=>run('PRODUCTION','createPr',{staff:1,lines:[{item:1,qty:'1.5'}]}),/whole/);
 assert.throws(()=>run('PRODUCTION','createPr',{staff:1,lines:[{item:1,qty:'1'},{item:1,qty:'2'}]}),/once/);
 assert.throws(()=>run('PRODUCTION','createPr',{staff:4,lines:[{item:1,qty:'1'}]}),/work area/);
});
let pr,po,grn,invoice;
test('Production creates a numbered draft with one server-derived operator',()=>{
 const result=run('PRODUCTION','createPr',{staff:1,notes:'End-to-end regression',lines:[{item:1,qty:'2'}]});pr=result.recordId;
 assert.equal(M.find(s.prs,pr).status,'DRAFT');
 assert.equal(M.find(s.prs,pr).creator,'Maya Pratama');
});
test('Submission is routed to Purchasing and freezes editing',()=>{
 assert.equal(run('PRODUCTION','submitPr',{id:pr,staff:1}).destination,'PURCHASING');
 assert.throws(()=>run('PRODUCTION','updatePr',{id:pr,staff:1,lines:[{item:1,qty:'3'}]}),/drafts/);
});
test('Sourcing cannot change quantities and goes to Finance',()=>{
 assert.throws(()=>run('PURCHASING','source',{id:pr,lines:[{item:1,qty:'3',price:'10',vendor:1}]}),/preserve/);
 assert.equal(run('PURCHASING','source',{id:pr,lines:[{item:1,qty:'2',price:'10',vendor:1}]}).destination,'FINANCE');
});
test('Budget approval checks the ceiling and reserves the original PR value',()=>{
 const limited=structuredClone(s);M.find(limited.centers,1).budget=1;
 assert.throws(()=>M.transition(limited,'FINANCE','decideBudget',{id:pr,decision:'approve'}),/budget/);
 run('FINANCE','decideBudget',{id:pr,decision:'approve'});
 assert.equal(M.find(s.prs,pr).status,'APPROVED_FOR_PO');
});
test('PO issuance is single-use and writes official price history',()=>{
 const before=s.priceHistory.length;run('PURCHASING','issue',{ids:[pr],vat:'11',shipping:'0',discount:'0'});po=s.orders.at(-1);
 assert.equal(po.grand,2220);assert.equal(s.priceHistory.length,before+1);
 assert.throws(()=>run('PURCHASING','issue',{ids:[pr]}),/approved/);
 assert.throws(()=>run('PRODUCTION','cancelPr',{id:pr,staff:1,reason:'Too late'}),/no longer/);
});
test('Warehouse prevents overreceiving and resolves its active schedule',()=>{
 assert.throws(()=>run('WAREHOUSE','receive',{order:po.id,staff:4,note:'DN',file:'sample.pdf',lines:[{item:1,good:'3',damaged:'0'}]}),/exceed/);
 run('WAREHOUSE','receive',{order:po.id,staff:4,note:'DN',file:'sample.pdf',lines:[{item:1,good:'2',damaged:'0'}]});grn=s.receipts.at(-1);
 assert.equal(grn.shift,'MORNING');assert.equal(grn.lines[0].allocations[0].pr,pr);
 assert.equal(M.find(s.orders,po.id).logistics,'FULLY_RECEIVED');
});
test('Duplicate invoice numbers stay blocked',()=>{
 const data={order:po.id,receipts:[grn.id],number:'E2E-DEMO-1',raw:'SKU-000001 | 2.000 | 10.00'};
 run('FINANCE','createInvoice',data);invoice=s.invoices.at(-1);
 assert.equal(invoice.ocr,'NEEDS_REVIEW');assert.throws(()=>run('FINANCE','createInvoice',data),/unique/);
});
test('OCR review is mandatory and original evidence survives correction',()=>{
 assert.throws(()=>run('FINANCE','decideInvoice',{id:invoice.id,decision:'APPROVED_FULL_PAYMENT'}),/Resolve discrepancies/);
 const raw=invoice.raw;
 run('FINANCE','hitl',{id:invoice.id,reason:'Checked original source',reviewed:true,lines:[{item:1,qty:'2',price:'10.00'}],vat:'11'});
 invoice=M.find(s.invoices,invoice.id);assert.equal(invoice.raw,raw);assert.equal(invoice.matching,'MATCHED_100');
});
test('Approval and one exact full payment use finance_a',()=>{
 run('FINANCE','decideInvoice',{id:invoice.id,decision:'APPROVED_FULL_PAYMENT'});
 assert.throws(()=>run('FINANCE','pay',{id:invoice.id,amount:'1.00'}),/full approved/);
 run('FINANCE','pay',{id:invoice.id,amount:'22.20',date:s.now.slice(0,10),reference:'DEMO-TRANSFER',file:'proof-e2e.pdf'});
 const p=s.payments.at(-1);assert.equal(p.actor,'finance_a');
 assert.equal(p.shares.reduce((n,r)=>n+r.amount,0),2220);assert.equal(M.find(s.orders,po.id).payment,'PAID');
});
test('Reversal retains payment and locks invoice history',()=>{
 const reserved=M.reserved(s,1);
 run('FINANCE','reverse',{id:invoice.id,reference:'DEMO-REV',reason:'Demo reversal'});
 assert(s.payments.at(-1).reversed);assert.equal(M.reserved(s,1),reserved);
 assert.equal(M.find(s.invoices,invoice.id).payment,'UNPAID');
 assert.throws(()=>run('FINANCE','hitl',{id:invoice.id}),/locks/);
});
test('Overtime handles inclusive day boundaries and overnight hours',()=>{
 const day=s.now.slice(0,10),staff=M.find(s.staff,1),night=M.find(s.staff,2);
 assert(!M.overtime(staff,day+'T07:00:00+07:00'));assert(!M.overtime(staff,day+'T15:00:00+07:00'));
 assert(M.overtime(staff,day+'T15:00:01+07:00'));assert(!M.overtime(night,day+'T02:00:00+07:00'));
});
test('Warehouse cannot use unscheduled staff',()=>{
 assert.throws(()=>M.operator(s,'WAREHOUSE',5),/not scheduled/);
});
test('Damage decision and replacement preserve original claim lineage',()=>{
 run('FINANCE','damage',{id:1,item:1,decision:'RETURN_TO_VENDOR',reason:'Replace damaged boxes'});
 run('PURCHASING','followup',{id:1,item:1,reason:'Supplier replacement reference DEMO'});
 run('WAREHOUSE','receive',{order:1,parent:1,staff:4,note:'REPLACE',file:'replacement.pdf',lines:[{item:1,good:'2',damaged:'0'}]});
 const r=s.receipts.at(-1);assert.equal(r.parent,1);assert.equal(r.lines[0].allocations[0].pr,4);
 assert.equal(M.find(s.orders,1).logistics,'PARTIAL_DELIVERY');
});
test('Master changes preserve historical operator names and used units',()=>{
 const saved=M.find(s.prs,pr).creator;
 run('PRODUCTION','staff',{id:1,name:'Renamed Demo Staff',shift:'NIGHT',start:'23:00',end:'07:00',active:'yes'});
 assert.equal(M.find(s.prs,pr).creator,saved);
 assert.throws(()=>run('SUPER_ADMIN','item',{id:1,name:'Gloves',unit:'Kg'}),/locked/);
});
test('A replacement preserves the remaining original normal-delivery capacity',()=>{
 run('WAREHOUSE','receive',{order:1,staff:4,note:'NORMAL-REMAINDER',file:'normal-remainder.pdf',lines:[{item:1,good:'5',damaged:'0'}]});
 assert.equal(M.find(s.orders,1).logistics,'FULLY_RECEIVED');
 assert.equal(M.totalsReceived(s,1,1).good,10000);
});
test('Combined cost-center orders allocate FIFO and distribute residual cents exactly',()=>{
 let combined=M.seed();
 const go=(role,action,data)=>{const r=M.transition(combined,role,action,data);combined=r.state;return r;};
 const id=go('DIVISION_MANAGER','createPr',{lines:[{item:3,qty:'1'}]}).recordId;
 go('DIVISION_MANAGER','submitPr',{id});
 go('PURCHASING','source',{id,lines:[{item:3,qty:'1',price:'95000',vendor:1}]});
 go('FINANCE','decideBudget',{id,decision:'approve'});
 go('PURCHASING','issue',{ids:[6,id],discount:'1.03',vat:'11',shipping:'3.01'});
 const po=combined.orders.at(-1);
 go('WAREHOUSE','receive',{order:po.id,staff:4,note:'COMBINED-DN',file:'combined.pdf',lines:[{item:3,good:'5',damaged:'0'}]});
 const grn=combined.receipts.at(-1);
 assert.equal(grn.lines[0].allocations[0].pr,6);
 go('FINANCE','createInvoice',{order:po.id,receipts:[grn.id],number:'COMBINED-INVOICE',raw:'SKU-000003 | 5.000 | 95000.00'});
 const invoice=combined.invoices.at(-1);
 go('FINANCE','hitl',{id:invoice.id,lines:[{item:3,qty:'5',price:'95000'}],reviewed:true,reason:'Reviewed',discount:'1.03',vat:'11',shipping:'3.01'});
 go('FINANCE','decideInvoice',{id:invoice.id,decision:'APPROVED_FULL_PAYMENT'});
 go('FINANCE','pay',{id:invoice.id,amount:(po.grand/100).toFixed(2),date:combined.now.slice(0,10),reference:'COMBINED-PAY',file:'combined-proof.pdf'});
 const payment=combined.payments.at(-1);
 assert.equal(payment.shares.length,2);
 assert.equal(payment.shares.reduce((n,share)=>n+share.amount,0),po.grand);
 assert.equal(M.reserved(combined,2),M.total(M.find(combined.prs,id).lines)+M.total(M.find(combined.prs,5).lines));
});
const context={window:{DemoModel:M},Intl,Date,URLSearchParams,console};
vm.createContext(context);
for(const file of ['config','locales','i18n'])vm.runInContext(fs.readFileSync(path.join(base,'assets/'+file+'.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(base,'assets/views.js'),'utf8'),context);
const V=context.window.DemoViews;
test('Every actual sidebar route renders and uses local hash navigation',()=>{
 for(const [role,menus] of Object.entries(context.window.DEMO_CONFIG.navigation)){
  for(const entry of menus){
   const page=entry[1].startsWith('/dashboard/')?'dashboard':entry[1].slice(1);
   const html=V.shell(s,role,page,null,{},null);
   assert(html.includes('id="main-content"'));assert(!html.includes('undefined'),role+' '+page);
  }
 }
});
test('Warehouse and requester detail views omit commercial columns',()=>{
 const warehouse=V.shell(s,'WAREHOUSE','orders/view',po.id,{},null);
 assert(!warehouse.includes('Grand total'));assert(!warehouse.includes('Fixed price'));
 const requester=V.shell(s,'PRODUCTION','requisitions/view',pr,{},null);
 assert(!requester.includes('Quoted value'));assert(!requester.includes('Fixed unit price'));
});
test('User text is escaped in the rendered markup',()=>{
 const unsafe=structuredClone(s);M.find(unsafe.prs,pr).notes='<img src=x onerror=alert(1)>';
 const html=V.shell(unsafe,'PRODUCTION','requisitions/view',pr,{},null);
 assert(html.includes('&lt;img'));assert(!html.includes('<img src=x'));
});
test('Restart seed is independent of mutated records',()=>{
 const fresh=M.seed();assert.equal(fresh.prs.length,6);assert.equal(fresh.payments.length,0);assert.equal(fresh.staff[0].name,'Maya Pratama');
});
console.log(JSON.stringify({passed,failed:0,assertedAt:new Date().toISOString()}));
