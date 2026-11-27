/* Bilingual presentation. Menu labels and role capabilities come from the original PHP configuration. */
(function () {
    'use strict';
    const M=window.DemoModel,T=window.DemoI18n;
    const e=value=>T.protect(String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
    const et=value=>e(T.t(value));
    const money=value=>new Intl.NumberFormat(T.locale()==='id'?'id-ID':'en-US',{style:'currency',currency:'IDR',minimumFractionDigits:2}).format((value||0)/100);
    const qty=value=>((value||0)/1000).toFixed(3);
    const human=value=>T.t(String(value||'').replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase().replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase()));
    const href=(role,path='dashboard',id='')=>'#/'+role+'/'+path+(id?'?id='+id:'');
    const link=(role,path,label,id='',cls='btn btn-outline-primary')=>'<a class="'+cls+'" href="'+href(role,path,id)+'">'+et(label)+'</a>';
    const badge=value=>'<span class="demo-status '+(['PAID','MATCHED_100','FULLY_RECEIVED','APPROVED_FOR_PO'].includes(value)?'good':['DISCREPANCY','HOLD_PAYMENT','HOLD_DISCREPANCY','REJECTED'].includes(value)?'warn':'')+'">'+e(human(value))+'</span>';
    const options=(rows,label,selected)=>rows.map(r=>'<option value="'+r.id+'" '+(Number(selected)===r.id?'selected':'')+'>'+e(label(r))+'</option>').join('');
    const table=(heads,rows,empty='No records in this view.')=>'<div class="table-responsive"><table class="table align-middle"><thead><tr>'+heads.map(h=>'<th scope="col">'+et(h)+'</th>').join('')+'</tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+heads.length+'" class="empty-state">'+et(empty)+'</td></tr>')+'</tbody></table></div>';
    const panel=(title,body,action='')=>'<section class="panel demo-panel"><div class="panel-heading"><h2>'+et(title)+'</h2>'+action+'</div>'+body+'</section>';
    const input=(label,name,value='',type='text',extra='')=>'<label class="form-label">'+et(label)+'<input class="form-control" name="'+name+'" value="'+e(value)+'" type="'+type+'" '+extra+' required></label>';
    const select=(label,name,content)=>'<label class="form-label">'+et(label)+'<select class="form-select" name="'+name+'" required>'+content+'</select></label>';
    const reason=()=>'<label class="form-label">Reason<textarea class="form-control" name="reason" rows="2" maxlength="500" required></textarea></label>';
    const form=(action,id,body,label,extra='')=>'<form data-action="'+action+'" '+(id?'data-id="'+id+'"':'')+' '+extra+'><div class="form-error" role="alert" hidden></div>'+body+'<button class="btn btn-primary mt-3" type="submit">'+et(label)+'</button></form>';
    const fieldGrid=body=>'<div class="form-grid">'+body+'</div>';
    const toggle=(title,body)=>'<details class="demo-disclosure"><summary>'+et(title)+'</summary>'+body+'</details>';
    function brand() { return '<a class="brand" href="#/welcome"><span class="brand-mark">P<span>↗</span></span><span>Procure<span class="brand-light">Sync</span><small>PROCUREMENT WORKSPACE</small></span></a>'; }
    function welcome() {
        const workflowKeys=['Submit Pr','Vendor sourcing & fixed price','Approve and reserve budget',
            'Issue batch purchase orders','Receive & allocate','Review & reconcile'];
        return '<div class="welcome"><header class="welcome-nav">'+brand()+T.switcher()+'<nav aria-label="Introduction"><a href="#workflow">Workflow</a><a href="#roles">Explore the roles</a><a class="btn btn-primary" href="#/login">Start Interactive Demo</a></nav></header>'+
        '<main id="main-content"><section class="welcome-hero"><div class="hero-copy"><div class="eyebrow">INTERACTIVE PRODUCT DEMO</div><h1>Every request.<br>Every delivery.<br><em>Connected.</em></h1><p>From the first requisition to the final invoice, ProcureSync brings purchasing, warehouse receiving, and financial reconciliation into one traceable workflow.</p><div class="creator-credit"><span>Created by</span><strong>Dewi Embun Permata Dini S.Kom.</strong></div><a class="btn btn-primary btn-lg" href="#/login">Start Interactive Demo</a><small>Six roles. One connected scenario. Explore at your own pace.</small></div>'+
        '<div class="hero-product"><div class="preview-bar"><span class="mini-brand">P</span><strong>ProcureSync</strong><span class="preview-demo">Interactive demo</span></div><div class="preview-layout"><div class="preview-sidebar"><span class="active">◈ Overview</span><span>▤ Requisitions</span><span>▣ Deliveries</span><span>⇄ Matching</span><span>◷ Activity</span></div><div class="preview-content"><div class="eyebrow muted">PROCUREMENT OVERVIEW</div><h2>A clear view of every handoff.</h2><div class="preview-stats"><div><b>PR</b><span>Request & source</span></div><div><b>GRN</b><span>Receive & allocate</span></div><div><b>3-way</b><span>Review & reconcile</span></div></div><div class="preview-document"><div><span class="document-icon">▤</span><strong>Protective gloves</strong><span class="demo-status">Pending sourcing</span></div><div class="preview-track"><span class="complete">Request</span><span class="current">Sourcing</span><span>Budget</span><span>Receiving</span></div><p>A single document connects the people responsible for the next step.</p></div><div class="preview-match"><span>✓</span><div><strong>Order. Receipt. Invoice.</strong><small>Three records, checked before payment.</small></div></div></div></div></div></section>'+
        '<section class="problem-strip"><div><span class="eyebrow">THE PROBLEM</span><h2>Disconnected records make small differences hard to see.</h2></div><p>A request, a delivery note, and an invoice describe the same purchase from different perspectives. ProcureSync preserves their relationship so teams can spot quantity differences, review damage, and explain every payment.</p></section>'+
        '<section class="welcome-section" id="workflow"><div class="section-heading"><div><span class="eyebrow">THE WORKFLOW</span><h2>Follow a purchase from request to settlement.</h2></div><p>Requesters start the process. Purchasing and Finance return at different stages.</p></div><div class="flow-cards">'+[['Production or Division Manager','Create & submit PR'],['Purchasing','Source vendor & fixed price'],['Finance','Approve & reserve budget'],['Purchasing','Issue vendor purchase orders'],['Warehouse','Receive goods & allocate FIFO'],['Finance','Review invoice, match & pay']].map(([role,step],index)=>{
            const roleLabel=T.locale()==='en'?role:role==='Production or Division Manager'?
                T.t('Production')+' / '+T.t('Division Manager'):T.t(role);
            const stepLabel=T.locale()==='en'?step:T.t(workflowKeys[index]);
            return '<div><span>'+e(roleLabel)+'</span><strong>'+e(stepLabel)+'</strong></div>';
        }).join('')+'</div></section>'+
        '<section class="welcome-section roles-section" id="roles"><div class="section-heading"><div><span class="eyebrow">SIX PERSPECTIVES</span><h2>Different responsibilities.<br>A shared source of context.</h2></div><p>Switch roles in the demo without logging in again. Each workspace has its own menus and view of the same records.</p></div><div class="role-cards">'+M.roles.map((role,i)=>'<article><span class="role-symbol">'+['◈','▤','▦','⇄','▣','♙'][i]+'</span><h3>'+et(M.names[role])+'</h3><p>'+et(roleDescriptions[role])+'</p></article>').join('')+'</div></section><section class="welcome-cta"><div><h2>Take a closer look at the work.</h2><p>Create a request, follow a delivery, or resolve an invoice discrepancy.</p></div><a href="#/login" class="btn btn-primary btn-lg">Start Interactive Demo</a></section></main><footer class="welcome-footer">'+brand()+'<p>Portfolio simulation · Fictional data · Runs entirely in your browser</p></footer></div>';
    }
    const roleDescriptions={
        PRODUCTION:'Create production requests with an operator identity and contract shift. Track the goods received against the original request.',
        DIVISION_MANAGER:'Request supplies for one division and follow its own documents. The Finance role performs budget approval.',
        PURCHASING:'Source vendors, record fixed prices, issue batch purchase orders, and follow up replacement deliveries.',
        FINANCE:'Control monthly budgets, review OCR, match PO/GRN/invoice, resolve damage, and approve and confirm payment.',
        WAREHOUSE:'Receive against incoming purchase orders without seeing prices. Record intact and damaged quantities under an active shift.',
        SUPER_ADMIN:'Manage accounts, cost centers, and item master data. Review the system audit and role permissions.'
    };
    function login() {
        return '<div class="login-language">'+T.switcher()+'</div><main id="main-content" class="demo-login"><section class="login-story">'+brand()+'<div class="story-content"><div class="eyebrow">PROCURESYNC INTERACTIVE DEMO</div><h1>Step into the<br><em>procurement workspace.</em></h1><p>Explore the same purchase across six roles, with a short explanation on every page.</p><div class="login-flow"><span>Request</span><span>Receive</span><span>Reconcile</span></div></div><p class="story-footer">A browser-based portfolio experience with fictional records.</p></section><section class="login-form-panel"><div class="login-form-wrap"><a class="back-link" href="#/welcome">Back to introduction</a><div class="form-eyebrow">WELCOME TO THE DEMO</div><h2>See how it works.</h2><p class="form-description">One shared demo password opens every role. You’ll start in the Production workspace.</p><form id="demo-login-form"><div class="form-error" role="alert" hidden></div>'+input('Demo password','password','','password','autocomplete="off"')+'<button class="btn btn-primary login-submit">Enter the workspace</button></form><div class="password-hint"><span>Demo password</span><code>ExploreProcure!2026</code><button class="text-button" type="button" data-use-password>Use this password</button></div><p class="form-text">Changes stay in this browser. Restart the demo whenever you want a fresh scenario.</p></div></section></main>';
    }
    function guide(title,about,purpose,next) {
        return '<aside class="page-guide" aria-label="Page guide"><div class="guide-heading"><span>ⓘ</span><h2>About this page</h2></div><h3>'+et(title)+'</h3><p>'+et(about)+'</p><h4>Business context</h4><p>'+et(purpose)+'</p>'+(next?'<div class="guide-next"><h4>What happens next</h4><p>'+et(next)+'</p></div>':'')+'<div class="guide-demo">Interactive demo<br><span>All records and actions are simulated.</span></div></aside>';
    }
    function guideFor(path,role) {
        const data={
            dashboard:[T.t('{role} overview',{role:T.t(M.names[role])}),roleDescriptions[role],'The dashboard reflects the current shared scenario. A change in another role updates the queues you see here.','Open a document or use the sidebar to explore a responsibility.'],
            'requisitions/new':['Purchase requisition','Record the required catalog items and quantities before submitting.','Production uses the selected operator’s contract. A Division Manager acts under their own cost center.','Submit the saved draft to Purchasing for sourcing.'],
            requisitions:['Requisition workspace','Follow requests through their actual procurement status.','Requesters see their own area. Purchasing sets quotes. Finance makes the budget decision.','A sourced request goes to Finance. An approved request returns to Purchasing.'],
            'requisitions/view':['A single requisition','This record keeps the requester, item quantities, and current handoff together.','Prices are visible to Purchasing and Finance. Requester views focus on the physical request.','The available actions depend on the current role and document state.'],
            orders:['Orders & sourcing cart','Select whole budget-approved requests and issue purchase orders grouped by vendor.','The fixed prices from sourcing are preserved. An official PO creates vendor price history.','Warehouse receives physical deliveries against the issued order.'],
            'orders/view':['Purchase order','Review the order and its receipt history.','Warehouse sees quantities and item specifications. Purchasing and Finance also see commercial amounts.','Goods may arrive in multiple deliveries. Their allocations retain the original requisition.'],
            'warehouse/incoming':['Incoming deliveries','Open an outstanding purchase order and record what physically arrived.','Receiving is blind to prices. An active dated shift identifies the person handling the delivery.','Finance reviews invoices against the PO and intact received goods.'],
            receipts:['Receipts & damage claims','Inspect delivered quantities, outstanding goods, and replacement claims.','Finance chooses a debit note or return to vendor. Purchasing follows up. Warehouse receives replacements.','Replacement receiving stays linked to the original damaged receipt.'],
            'receipts/new':['Record a delivery','Enter intact and damaged quantities from a delivery note.','Select one on-duty staff member. The shift comes from the active dated roster. Quantities allocate FIFO.','The goods receipt becomes evidence for invoice matching.'],
            'receipts/view':['Goods receipt & lineage','Inspect the receiving identity and allocations back to the original requisitions.','Damaged quantities need a Finance decision. Replacement deliveries retain their parent receipt.','Invoice matching uses intact goods, with resolved damage decisions required for approval.'],
            staff:['Staff & shift records','Maintain staff contracts and separate dated assignments.','Production records automatic overtime against the contract. Warehouse requires an active dated assignment.','Master edits affect future actions. Existing document identities remain recorded.'],
            history:['Activity history','Review the actions recorded during this scenario.','Events retain the actor and document reference. Requester histories are limited to their own cost center.','Switch roles to see a different permitted view.'],
            budgets:['Monthly budget control','Allocate the monthly spending ceiling and inspect requisition reservations.','Finance reserves the original sourced PR value on approval. Realized payments are tracked separately.','An approved request becomes eligible for the Purchasing sourcing cart.'],
            invoices:['Invoice review queue','Open a sample OCR discrepancy or create an invoice against an order and its receipts.','The original extraction is preserved. Human review corrects the billed quantities and prices.','Matching must succeed before Finance approves and confirms payment.'],
            'invoices/new':['Create a demo invoice','Select one order and its received goods, then run a local extraction simulation.','The transcript represents extracted document content. Unsupported or incorrect values require human review.','Review the values and resolve any PO/GRN/invoice discrepancies.'],
            'invoices/view':['Three-way matching','Compare the approved order, physical receipts, and reviewed invoice side by side.','Price and quantity differences prevent approval. Beneficiary verification and damage decisions also matter.','finance_a may approve the reviewed invoice and confirm one full transfer.'],
            'finance/reports':['Settlement & reports','Inspect actual simulated cash movements and their cost-center allocation.','Payments and reversals retain their evidence. Fees follow the invoiced goods value proportionally.','Printing produces a browser PDF of this demo report.'],
            vendors:['Vendor & SKU directory','Review suppliers and prices recorded when official orders were issued.','Purchasing maintains contacts. Finance verifies the beneficiary before invoice approval.','A newly sourced quote becomes price history only after PO issuance.'],
            profile:['Profile & cost center','View your own division and update the display name used for future actions.','Historical requisition identities retain their original names. Center assignment is controlled by governance.','Return to your division’s requests to follow their progress.'],
            'admin/users':['User account management','Inspect the six canonical roles and create a fictional account record.','This portfolio simulation uses a shared entry password. The original app enforces backend authentication.','Open role permissions to inspect the source application’s access boundaries.'],
            'admin/centers':['Cost center management','Maintain the names and active status of the fictional cost centers.','Closed centers stop accepting new requests. Existing documents and their history remain.','Finance controls budgets for the existing centers.'],
            'admin/masters':['Master data governance','Inspect catalog items and edit their descriptive fields.','A unit becomes locked once a SKU is used. The unit label follows the selected language.','Catalog data is reused by requesters, Purchasing, and Warehouse.']
        };
        return guide(...(data[path]||data.dashboard));
    }
    function prVisible(s,role) {
        if(role==='PRODUCTION')return s.prs.filter(p=>p.center===1);
        if(role==='DIVISION_MANAGER')return s.prs.filter(p=>p.center===2);
        if(['PURCHASING','FINANCE'].includes(role))return s.prs.filter(p=>p.status!=='DRAFT');
        return [];
    }
    function prTable(s,role,rows) {
        const commercial=['PURCHASING','FINANCE'].includes(role);
        return table(['Requisition','Cost center','Requested by','Status',...(commercial?['Quoted value']:[]),''],rows.map(p=>[link(role,'requisitions/view',p.number,p.id,'document-link'),e(M.find(s.centers,p.center).name),e(p.creator)+(p.overtime?'<small class="overtime">Overtime</small>':''),badge(p.status),...(commercial?[money(M.total(p.lines))]:[]),link(role,'requisitions/view','View',p.id,'table-link')]));
    }
    function workflow(s,role) {
        const visible=prVisible(s,role);
        const p=(visible.length?visible:s.prs).find(p=>p.id===s.focus)||(visible[0]||s.prs[0]);
        const nextRole={DRAFT:p.role,PENDING_SOURCING:'PURCHASING',PENDING_BUDGET:'FINANCE',APPROVED_FOR_PO:'PURCHASING',PO_ISSUED:'WAREHOUSE',REJECTED:p.role,CANCELLATION_REQUESTED:p.previous==='PENDING_SOURCING'?'PURCHASING':'FINANCE',CANCELLED:p.role}[p.status];
        const stages=['Request','Source','Budget','Issue PO','Receive','Reconcile'];
        let current={DRAFT:0,PENDING_SOURCING:1,PENDING_BUDGET:2,APPROVED_FOR_PO:3,PO_ISSUED:4}[p.status]??0;
        const po=s.orders.find(o=>o.lines.some(l=>l.sources.some(a=>a.pr===p.id)));
        if(po?.logistics==='FULLY_RECEIVED')current=5;
        if(po?.payment==='PAID')current=6;
        const next=po?.logistics==='FULLY_RECEIVED'?'FINANCE':nextRole;
        const path=p.status==='PO_ISSUED'?(next==='FINANCE'?'invoices':'warehouse/incoming'):next==='PURCHASING'&&p.status==='APPROVED_FOR_PO'?'orders':'requisitions/view';
        return '<section class="workflow-context"><div class="workflow-caption"><div><span>FOLLOW THIS REQUEST</span><strong>'+e(p.number)+'</strong> '+badge(p.status)+'</div>'+link(next,path,'Open '+M.names[next],path==='requisitions/view'?p.id:'','table-link')+'</div><div class="workflow-steps">'+stages.map((stage,i)=>'<div class="'+(i<current?'done':i===current?'current':'')+'"><i>'+(i<current?'✓':'')+'</i><span>'+stage+'</span></div>').join('')+'</div></section>';
    }
    function dashboard(s,role) {
        const visible=prVisible(s,role);
        const cards={
            PRODUCTION:[['Open requests',visible.filter(p=>['DRAFT','PENDING_SOURCING','PENDING_BUDGET'].includes(p.status)).length,'requisitions'],['Drafts',visible.filter(p=>p.status==='DRAFT').length,'requisitions'],['Approved / ordered',visible.filter(p=>['APPROVED_FOR_PO','PO_ISSUED'].includes(p.status)).length,'requisitions'],['Received deliveries',s.receipts.filter(r=>r.lines.some(l=>l.allocations.some(a=>a.center===1))).length,'requisitions']],
            DIVISION_MANAGER:[['Division requests',visible.length,'requisitions'],['Drafts',visible.filter(p=>p.status==='DRAFT').length,'requisitions'],['In progress',visible.filter(p=>['PENDING_SOURCING','PENDING_BUDGET'].includes(p.status)).length,'requisitions'],['Approved / ordered',visible.filter(p=>['APPROVED_FOR_PO','PO_ISSUED'].includes(p.status)).length,'requisitions']],
            PURCHASING:[['Awaiting sourcing',s.prs.filter(p=>p.status==='PENDING_SOURCING').length,'requisitions'],['Finance review',s.prs.filter(p=>p.status==='PENDING_BUDGET').length,'requisitions'],['Ready for PO',s.prs.filter(p=>p.status==='APPROVED_FOR_PO').length,'orders'],['Outstanding deliveries',s.orders.filter(o=>o.logistics!=='FULLY_RECEIVED').length,'orders']],
            FINANCE:[['Budget review',s.prs.filter(p=>p.status==='PENDING_BUDGET').length,'requisitions'],['Invoice discrepancies',s.invoices.filter(i=>i.active&&i.matching==='DISCREPANCY').length,'invoices'],['Ready for payment',s.invoices.filter(i=>i.active&&i.approval.startsWith('APPROVED')&&i.payment==='UNPAID').length,'finance/reports'],['Confirmed cash',money(s.payments.filter(p=>!p.reversed).reduce((n,p)=>n+p.amount,0)),'finance/reports']],
            WAREHOUSE:[['Incoming orders',s.orders.filter(o=>o.logistics==='IN_TRANSIT').length,'warehouse/incoming'],['Partial deliveries',s.orders.filter(o=>o.logistics==='PARTIAL_DELIVERY').length,'warehouse/incoming'],['Goods receipts',s.receipts.length,'receipts'],['Damaged lines',s.receipts.flatMap(r=>r.lines).filter(l=>l.damaged>0&&l.resolution==='PENDING').length,'receipts']],
            SUPER_ADMIN:[['Active users',s.users.filter(u=>u.active).length,'admin/users'],['Cost centers',s.centers.filter(c=>c.active).length,'admin/centers'],['Catalog items',s.catalog.length,'admin/masters'],['Audit events',s.events.length,'history']]
        }[role];
        const kpi='<div class="demo-kpis">'+cards.map(([label,value,path],i)=>'<a class="panel kpi-card" href="'+href(role,path)+'"><div><span>'+label+'</span><span class="kpi-icon">'+['▤','◷','✓','▦'][i]+'</span></div><strong>'+e(value)+'</strong><small>View workspace</small></a>').join('')+'</div>';
        const recent=visible.length?panel('Requisitions in your workspace',prTable(s,role,visible.slice(-5).reverse()),link(role,'requisitions','View all','','table-link')):panel(role==='WAREHOUSE'?'Incoming orders':'Recent activity',role==='WAREHOUSE'?orderTable(s,role,s.orders.filter(o=>o.logistics!=='FULLY_RECEIVED')):eventTable(s,role,s.events.slice(-5).reverse()));
        return (role==='SUPER_ADMIN'?'':workflow(s,role))+kpi+'<div class="demo-dashboard-grid">'+recent+panel('Request status overview','<div class="chart-wrap"><canvas id="status-chart" aria-label="Requisition counts by status" role="img"></canvas></div><p class="form-text">Based on the current simulated documents.</p>')+'</div>'+ (role==='PRODUCTION'?panel('Continue the sample scenario','<p>The protective-gloves draft is ready to try. Open it, choose an operator, then submit it to Purchasing.</p>'+link(role,'requisitions/view','Open sample request',1)):role==='FINANCE'?panel('A review that needs your attention','<p>The sample paper invoice contains a unit-price discrepancy. Open it to compare the order, receipt, and original extraction.</p>'+link(role,'invoices/view','Review sample invoice',1)+link(role,'vendors','Verify vendor banking')):role==='SUPER_ADMIN'?permissions():'');
    }
    function operatorField(s,role,receiving=false) {
        if(role!=='PRODUCTION'&&role!=='WAREHOUSE')return '';
        const staff=s.staff.filter(x=>x.active&&x.area===role).filter(x=>!receiving||s.schedules.some(a=>a.staff===x.id&&a.status==='SCHEDULED'&&Date.parse(a.start)<=Date.parse(s.now)&&Date.parse(a.end)>Date.parse(s.now)));
        return select('Active staff member','staff','<option value="">Select an active staff member</option>'+options(staff,x=>{
            const a=receiving?s.schedules.find(a=>a.staff===x.id&&a.status==='SCHEDULED'&&Date.parse(a.start)<=Date.parse(s.now)&&Date.parse(a.end)>Date.parse(s.now)):null;
            return T.t('{name} — {shift} shift ({start} - {end})',{name:x.name,shift:human(a?.shift||x.shift),start:a?a.start.slice(11,16):x.start,end:a?a.end.slice(11,16):x.end});
        }));
    }
    function lineEditor(s,lines=[{item:1,qty:1000,price:0}],kind='request') {
        return '<div class="table-responsive"><table class="table editor-table"><thead><tr><th>Catalog item</th><th>Quantity</th><th>Unit</th>'+(kind==='source'?'<th>Vendor</th><th>Fixed price (IDR)</th>':kind==='invoice'?'<th>Reviewed price (IDR)</th>':'<th></th>')+'</tr></thead><tbody data-lines>'+lines.map(l=>lineRow(s,l,kind)).join('')+'</tbody></table></div>'+(kind==='request'?'<button type="button" class="btn btn-outline-secondary btn-sm" data-add-line>Add item</button>':'');
    }
    function lineRow(s,line,kind='request') {
        const item=M.find(s.catalog,line.item);
        return '<tr data-line data-item="'+line.item+'"><td>'+(kind==='request'?'<select class="form-select" data-field="item" aria-label="Catalog item">'+options(s.catalog.filter(i=>i.active),i=>i.sku+' · '+i.name,line.item)+'</select>':'<strong>'+e(item.name)+'</strong><small class="table-subline">'+e(item.sku)+'</small>')+'</td><td><input class="form-control" type="number" data-field="qty" aria-label="'+(kind==='invoice'?'Reviewed quantity':'Quantity')+'" min="'+(item.fractional?'0.001':'1')+'" step="'+(item.fractional?'0.001':'1')+'" value="'+qty(line.qty)+'" '+(kind==='source'?'readonly':'')+' required></td><td data-unit>'+et(M.units[item.unit])+'</td>'+(kind==='source'?'<td><select class="form-select" data-field="vendor" aria-label="Vendor">'+options(s.vendors.filter(v=>v.active),v=>v.name,line.vendor)+'</select></td>':'')+(kind!=='request'?'<td><input class="form-control" type="number" data-field="price" aria-label="Fixed unit price" min="0.01" step="0.01" value="'+(line.price/100).toFixed(2)+'" required></td>':'<td><button class="text-button" type="button" data-remove-line>Remove</button></td>')+'</tr>';
    }
    function requestForm(s,role,p=null) {
        return panel(p?'Edit draft':'Requisition details',form(p?'updatePr':'createPr',p?.id,operatorField(s,role)+
            '<p class="form-text">Cost center · '+e(M.find(s.centers,role==='PRODUCTION'?1:2).name)+'. A document number is assigned when the draft is saved.</p>'+
            '<label class="form-label">Notes<textarea class="form-control" name="notes" rows="2" maxlength="500">'+e(p?.notes||'')+'</textarea></label>'+lineEditor(s,p?.lines),'Save draft'));
    }
    function requisitions(s,role,filter='') {
        let rows=prVisible(s,role).slice().reverse();
        if(filter)rows=rows.filter(p=>p.status===filter);
        return '<div class="filter-row"><label>Document status<select class="form-select" id="status-filter"><option value="">All statuses</option>'+M.prStates.map(v=>'<option value="'+v+'" '+(v===filter?'selected':'')+'>'+human(v)+'</option>').join('')+'</select></label>'+(['PRODUCTION','DIVISION_MANAGER'].includes(role)?link(role,'requisitions/new','Create requisition'):'')+'</div>'+panel('Requisition history & drafts',prTable(s,role,rows));
    }
    function prDetail(s,role,id) {
        const p=prVisible(s,role).find(p=>p.id===Number(id));
        if(!p)return denied(role);
        const commercial=['PURCHASING','FINANCE'].includes(role);
        const row=p.lines.map(l=>{const item=M.find(s.catalog,l.item);return [e(item.sku),e(item.name),qty(l.qty),et(M.units[item.unit]),...(commercial?[e(M.find(s.vendors,l.vendor).name),money(l.price),money(M.lineTotal(l))]:[])];});
        let content='<div class="document-heading"><div><span class="eyebrow muted">PURCHASE REQUISITION</span><h2>'+e(p.number)+'</h2><p>'+e(M.find(s.centers,p.center).name)+' · '+e(p.creator)+(p.shift?' · '+human(p.shift):'')+(p.overtime?' <span class="overtime">Overtime</span>':'')+'</p></div>'+badge(p.status)+'</div>'+workflow(s,role)+panel('Requested items',table(['SKU','Item','Quantity','Unit',...(commercial?['Vendor','Fixed unit price','Line total']:[])],row)+'<p class="document-notes">'+e(p.notes)+'</p>');
        if(p.reason)content+=panel('Recorded decision','<p>'+e(p.reason)+'</p>');
        if(['PRODUCTION','DIVISION_MANAGER'].includes(role)){
            if(p.status==='DRAFT')content+=requestForm(s,role,p)+panel('Send to Purchasing',form('submitPr',p.id,operatorField(s,role),'Submit requisition'));
            if(['DRAFT','PENDING_SOURCING','PENDING_BUDGET','APPROVED_FOR_PO'].includes(p.status))content+=toggle(p.status==='DRAFT'?'Cancel draft':'Request cancellation',form('cancelPr',p.id,operatorField(s,role)+reason(),'Send cancellation'));
            if(p.status==='REJECTED')content+=panel('Start a new draft',form('copyPr',p.id,operatorField(s,role),'Copy to new requisition'));
            const received=s.receipts.flatMap(r=>r.lines.flatMap(l=>l.allocations.filter(a=>a.pr===p.id).map(a=>[e(r.number),e(M.find(s.catalog,l.item).name),qty(a.good),et(M.units[M.find(s.catalog,l.item).unit])])));
            if(received.length)content+=panel('Intact goods received by Warehouse',table(['Goods receipt','Item','Intact quantity','Unit'],received));
        }
        if(role==='PURCHASING'&&p.status==='PENDING_SOURCING')content+=panel('Vendor sourcing & fixed price',form('source',p.id,lineEditor(s,p.lines.map(l=>({...l,price:l.price|| (l.item===2?5800000:18500000)})),'source'),'Send quotes to Finance'));
        if(role==='FINANCE'&&p.status==='PENDING_BUDGET') {
            const c=M.find(s.centers,p.center);
            content+=panel('Budget review','<div class="amount-summary"><div>Quoted value<strong>'+money(M.total(p.lines))+'</strong></div><div>Available budget<strong>'+money(c.budget-M.reserved(s,c.id))+'</strong></div></div>'+form('decideBudget',p.id,select('Decision','decision','<option value="approve">Approve and reserve budget</option><option value="reject">Reject with reason</option>')+'<label class="form-label">Reason for rejection<textarea name="reason" class="form-control"></textarea></label>','Record budget decision'));
        }
        if(p.status==='CANCELLATION_REQUESTED'&&role===(p.previous==='PENDING_SOURCING'?'PURCHASING':'FINANCE'))content+=panel('Cancellation review',form('decideCancellation',p.id,select('Decision','decision','<option value="approve">Approve cancellation</option><option value="reject">Keep previous workflow state</option>')+reason(),'Record review'));
        return content;
    }
    function orderTable(s,role,rows) {
        const priced=role!=='WAREHOUSE';
        return table(['Purchase order','Vendor','Logistics',...(priced?['Settlement','Grand total']:[]),''],rows.map(o=>[link(role,'orders/view',o.number,o.id,'document-link'),e(M.find(s.vendors,o.vendor).name),badge(o.logistics),...(priced?[badge(o.payment),money(o.grand)]:[]),link(role,'orders/view','View',o.id,'table-link')]));
    }
    function orders(s,role,incoming=false) {
        let body='';
        if(role==='PURCHASING'){
            const approved=s.prs.filter(p=>p.status==='APPROVED_FOR_PO');
            body+=panel('Sourcing cart · approved whole requisitions',approved.length?form('issue','',table(['Select','Requisition','Cost center','Approved value'],approved.map(p=>['<input class="form-check-input" type="checkbox" name="ids" value="'+p.id+'" aria-label="Select '+e(p.number)+'">',e(p.number),e(M.find(s.centers,p.center).name),money(M.total(p.lines))]))+fieldGrid(input('Discount per vendor PO (IDR)','discount','0','number','min="0" step="0.01"')+input('VAT (%)','vat','11','number','min="0" max="100" step="0.01"')+input('Shipping per vendor PO (IDR)','shipping','0','number','min="0" step="0.01"')),'Issue batch purchase orders'):'<p>No whole requisitions are awaiting PO issuance.</p>');
        }
        body+=panel(incoming?'Incoming delivery queue':'Issued purchase orders',orderTable(s,role,s.orders.filter(o=>!incoming||o.logistics!=='FULLY_RECEIVED').slice().reverse()));
        if(role==='PURCHASING')body+=claims(s,role);
        return body;
    }
    function orderDetail(s,role,id) {
        const po=M.find(s.orders,id),priced=role!=='WAREHOUSE';
        let body='<div class="document-heading"><div><span class="eyebrow muted">'+(priced?'PURCHASE ORDER':'BLIND RECEIVING')+'</span><h2>'+e(po.number)+'</h2><p>'+e(M.find(s.vendors,po.vendor).name)+'</p></div>'+badge(po.logistics)+'</div>'+panel('Order items',table(['Item','Specification','Quantity','Unit',...(priced?['Fixed price','Line total']:[])],po.lines.map(l=>{const item=M.find(s.catalog,l.item);return [e(item.name),e(item.spec),qty(l.qty),et(M.units[item.unit]),...(priced?[money(l.price),money(M.lineTotal(l))]:[])];})));
        if(priced)body+=financialSummary(po);
        if(role==='WAREHOUSE'&&po.logistics!=='FULLY_RECEIVED')body+=link(role,'receipts/new','Record delivery',po.id);
        body+=panel('Goods receipts',receiptTable(s,role,s.receipts.filter(r=>r.order===po.id)));
        return body;
    }
    function financialSummary(o) {
        return panel('Financial calculation','<div class="amount-summary">'+[['Subtotal',o.subtotal],['Discount',o.discount],['VAT',o.tax],['Shipping',o.shipping],['Grand total',o.grand]].map(([k,v])=>'<div>'+k+'<strong>'+money(v)+'</strong></div>').join('')+'</div>');
    }
    function receiptTable(s,role,rows) {
        return table(['Goods receipt','Purchase order','Received by','Shift / work date','Delivery type',''],rows.map(r=>[e(r.number),e(M.find(s.orders,r.order).number),e(r.actor),e(human(r.shift)+' · '+r.date),r.parent?'Replacement':'Normal',link(role,'receipts/view','Inspect',r.id,'table-link')]));
    }
    function claims(s,role) {
        const rows=[];
        for(const r of s.receipts)for(const l of r.lines)if(l.damaged>0)rows.push([e(r.number),e(M.find(s.catalog,l.item).name),qty(l.damaged),badge(l.resolution),link(role,'receipts/view','Review',r.id,'table-link')]);
        return panel('Damaged goods & replacement claims',table(['Receipt','Item','Damaged quantity','Decision',''],rows));
    }
    function receipts(s,role) { return claims(s,role)+panel('Goods receipt history',receiptTable(s,role,s.receipts.slice().reverse())); }
    function receiveForm(s,role,id,parentId='') {
        const po=M.find(s.orders,id),parent=parentId?M.find(s.receipts,parentId):null;
        const rows=po.lines.map(l=>{
            const item=M.find(s.catalog,l.item),r=M.totalsReceived(s,po.id,l.item),claim=parent?.lines.find(c=>c.item===l.item);
            let remaining=l.qty-r.normal;
            if(parent)remaining=claim?.resolution==='RETURN_TO_VENDOR'?claim.damaged-s.receipts.filter(g=>g.parent===parent.id).flatMap(g=>g.lines).filter(g=>g.item===l.item).reduce((n,g)=>n+g.good+g.damaged,0):0;
            if(remaining<=0)return '';
            return '<tr data-line data-item="'+item.id+'"><td>'+e(item.name)+'<small class="table-subline">'+e(item.sku)+'</small></td><td>'+qty(remaining)+' '+et(M.units[item.unit])+'</td><td><input class="form-control" data-field="good" aria-label="Intact quantity" type="number" min="0" max="'+qty(remaining)+'" step="'+(item.fractional?'0.001':'1')+'" value="0" required></td><td><input class="form-control" data-field="damaged" aria-label="Damaged quantity" type="number" min="0" max="'+qty(remaining)+'" step="'+(item.fractional?'0.001':'1')+'" value="0" required></td></tr>';
        }).join('');
        const body='<input type="hidden" name="order" value="'+po.id+'">'+(parent?'<input type="hidden" name="parent" value="'+parent.id+'">':'')+operatorField(s,role,true)+
            '<p class="form-text">Shift is resolved from the active dated roster at the scenario time. '+e(parent?'Replacement of '+parent.number:po.number)+'</p>'+fieldGrid(input('Delivery note number','note','DN-DEMO-'+(s.receipts.length+1001))+select('Delivery note scan','file','<option value="sample-delivery-note-'+M.next(s.receipts)+'.pdf">Use fictional sample delivery note</option>'))+'<div class="table-responsive"><table class="table editor-table"><thead><tr><th>Item</th><th>Available</th><th>Intact quantity</th><th>Damaged quantity</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
        return panel(parent?'Record replacement delivery':'Record delivery',form('receive','',body,'Post goods receipt'));
    }
    function receiptDetail(s,role,id) {
        const r=M.find(s.receipts,id),po=M.find(s.orders,r.order);
        let content=panel(r.number,'<p>'+e(po.number)+' · '+e(r.actor)+' · '+e(human(r.shift))+' · Work date '+e(r.date)+'</p>'+table(['Item','Intact','Damaged','Unit','Decision'],r.lines.map(l=>[e(M.find(s.catalog,l.item).name),qty(l.good),qty(l.damaged),et(M.units[M.find(s.catalog,l.item).unit]),badge(l.resolution)])));
        const alloc=r.lines.flatMap(l=>l.allocations.map(a=>[e(M.find(s.catalog,l.item).name),e(M.find(s.prs,a.pr).number),e(M.find(s.centers,a.center).name),qty(a.good),qty(a.damaged)]));
        content+=panel('FIFO source allocation',table(['Item','Original requisition','Cost center','Intact','Damaged'],alloc));
        for(const l of r.lines.filter(l=>l.damaged>0)){
            if(role==='FINANCE'&&l.resolution==='PENDING')content+=panel(T.t('Damage decision · {item}',{item:M.find(s.catalog,l.item).name}),form('damage',r.id,'<input type="hidden" name="item" value="'+l.item+'">'+select('Decision','decision','<option value="RETURN_TO_VENDOR">Return to vendor · replacement owed</option><option value="DEBIT_NOTE">Debit note · close damaged quantity</option>')+reason(),'Record damage decision'));
            if(role==='PURCHASING'&&l.resolution==='RETURN_TO_VENDOR')content+=panel('Vendor replacement follow-up',form('followup',r.id,'<input type="hidden" name="item" value="'+l.item+'">'+reason(),'Record vendor follow-up'));
            if(l.followup)content+=panel('Recorded follow-up','<p>'+e(l.followup)+'</p>');
        }
        if(role==='WAREHOUSE'&&r.lines.some(l=>l.resolution==='RETURN_TO_VENDOR'))content+='<a class="btn btn-primary" href="'+href(role,'receipts/new',po.id)+'&parent='+r.id+'">Record replacement delivery</a>';
        return content;
    }
    function budgets(s) { return panel('Monthly allocation & reservations',table(['Cost center','Allocated budget','PR reservations','Remaining','Adjust'],s.centers.map(c=>[e(c.name),money(c.budget),money(M.reserved(s,c.id)),money(c.budget-M.reserved(s,c.id)),toggle('Edit allocation',form('budget','', '<input type="hidden" name="center" value="'+c.id+'">'+input('Monthly budget (IDR)','amount',(c.budget/100).toFixed(2),'number','min="0" step="0.01"'),'Save allocation'))]))); }
    function invoiceTable(s,rows) { return table(['Invoice','Order','Extraction','Matching','Approval','Settlement','Total',''],rows.map(i=>[e(i.number),e(M.find(s.orders,i.order).number),badge(i.ocr),badge(i.matching),badge(i.active?i.approval:'VOIDED'),badge(i.payment),money(i.grand),link('FINANCE','invoices/view','Review',i.id,'table-link')])); }
    function invoices(s) { return panel('Invoice review queue',invoiceTable(s,s.invoices.slice().reverse()),link('FINANCE','invoices/new','Create demo invoice')); }
    function invoiceNew(s) {
        const orders=s.orders.filter(o=>s.receipts.some(r=>r.order===o.id));
        if(!orders.length)return panel('No received goods yet','<p>Record a Warehouse delivery before creating its invoice.</p>');
        return panel('Invoice extraction simulation',form('createInvoice','',fieldGrid(select('Purchase order','order',options(orders,o=>o.number))+
            input('Vendor invoice number','number','INV-DEMO-'+(M.next(s.invoices)+2000))+input('Invoice date','date',s.now.slice(0,10),'date'))+
            '<div id="invoice-receipt-options"></div><label class="form-label">Extraction transcript<textarea class="form-control code-input" name="raw" id="invoice-raw" rows="5" required></textarea></label><button class="btn btn-outline-secondary btn-sm" type="button" data-fill-transcript>Load sample transcript from selected order</button><p class="form-text">A local parser simulation reads SKU | quantity | unit price. Original extraction remains available after correction.</p>','Run extraction'));
    }
    function invoiceDetail(s,id) {
        const i=M.find(s.invoices,id),po=M.find(s.orders,i.order),v=M.find(s.vendors,po.vendor),hasHistory=s.payments.some(p=>p.invoice===i.id);
        let body='<div class="document-heading"><div><span class="eyebrow muted">THREE-WAY MATCHING</span><h2>'+e(i.number)+'</h2><p>'+e(v.name)+' · '+e(po.number)+'</p></div>'+badge(i.payment)+'</div><div class="matching-banner"><strong>'+human(i.matching)+'</strong><span>'+e(i.issues.length?i.issues.map(issue=>T.t(issue)).join(' '):T.t('The reviewed invoice matches the approved order and intact goods.'))+'</span></div><div class="comparison-grid">'+panel('Approved purchase order',table(['Item','Ordered','Fixed price'],po.lines.map(l=>[e(M.find(s.catalog,l.item).name),qty(l.qty),money(l.price)])))+panel('Physical goods receipts',table(['Receipt','Intact','Damaged'],s.receipts.filter(r=>i.receipts.includes(r.id)).flatMap(r=>r.lines.map(l=>[e(r.number),qty(l.good),qty(l.damaged)]))))+panel('Reviewed invoice',table(['Item','Billed','Unit price'],i.lines.map(l=>[e(M.find(s.catalog,l.item).name),qty(l.qty),money(l.price)])))+'</div>'+toggle('Original extraction evidence','<pre>'+e(i.raw)+'</pre>')+financialSummary(i);
        if(i.active&&!hasHistory)body+=panel('Human-in-the-loop correction',form('hitl',i.id,lineEditor(s,i.lines,'invoice')+fieldGrid(input('Discount (IDR)','discount',(i.discount/100).toFixed(2),'number','min="0" step="0.01"')+input('VAT (%)','vat',(i.vat/100).toFixed(2),'number','min="0" max="100" step="0.01"')+input('Shipping (IDR)','shipping',(i.shipping/100).toFixed(2),'number','min="0" step="0.01"'))+reason()+'<label class="check-label"><input type="checkbox" name="reviewed" required> I reviewed the original evidence and all billed values.</label>','Save reviewed values & match'));
        if(i.active&&i.payment!=='PAID'){
            body+=panel('Approval & beneficiary','<p>Beneficiary · '+e(v.bank)+' '+badge(v.verified?'VERIFIED':'UNVERIFIED')+'</p>'+link('FINANCE','vendors','Review beneficiary verification')+form('decideInvoice',i.id,select('Finance decision','decision','<option value="APPROVED_FULL_PAYMENT">Approve full invoice payment</option><option value="APPROVED_PARTIAL_DEBIT_NOTE">Approve with partial / debit note</option><option value="HOLD_PAYMENT">Hold payment</option>')+'<label class="form-label">Decision reason<textarea class="form-control" name="reason"></textarea></label>','Record Finance decision'));
            if(i.approval.startsWith('APPROVED'))body+=panel('Confirm payment · finance_a',form('pay',i.id,fieldGrid(input('Approved amount (IDR)','amount',(i.grand/100).toFixed(2),'number','min="0.01" step="0.01"')+input('Transfer date','date',s.now.slice(0,10),'date','max="'+s.now.slice(0,10)+'"')+input('Transfer reference','reference','TRANSFER-DEMO-'+M.next(s.payments))+input('Simulated proof identifier','file','proof-demo-'+M.next(s.payments)+'.pdf')),'Confirm payment'));
        }
        if(i.payment==='PAID')body+=toggle('Reverse the recorded transfer',form('reverse',i.id,input('Reversal reference','reference','REV-DEMO-'+M.next(s.payments))+reason(),'Record reversal'));
        if(i.active&&!hasHistory)body+=toggle('Void this invoice',form('voidInvoice',i.id,reason(),'Void and retain history'));
        return body;
    }
    function vendors(s,role) {
        let body=panel('Vendor directory',table(['Supplier','Contact','Status',...(role==='FINANCE'?['Beneficiary','Verification']:[])],s.vendors.map(v=>[e(v.name),e(v.contact),badge(v.active?'ACTIVE':'INACTIVE'),...(role==='FINANCE'?[e(v.bank),toggle(v.verified?'Verified · review':'Verify beneficiary',form('verifyBank',v.id,select('Bank status','verified','<option value="yes">Verified</option><option value="no">Unverified</option>')+reason(),'Save verification'))]:[])])));
        if(role==='PURCHASING')body+=toggle('Add vendor',form('createVendor','',fieldGrid(input('Company name','name')+input('Contact name','contact')),'Create vendor'));
        body+=panel('Official vendor price history',table(['Purchase order','Item','Vendor','Issued unit price'],s.priceHistory.map(p=>[e(M.find(s.orders,p.order).number),e(M.find(s.catalog,p.item).name),e(M.find(s.vendors,p.vendor).name),money(p.price)])));
        return body;
    }
    function staff(s,role) {
        const members=s.staff.filter(x=>role==='SUPER_ADMIN'||x.area===role);
        const editor=m=>form('staff',m?.id,fieldGrid(input('Full name & title','name',m?.name||'')+(role==='SUPER_ADMIN'?select('Work area','area','<option value="PRODUCTION">Production</option><option value="WAREHOUSE">Warehouse</option>'):'')+select('Work shift','shift',Object.keys(M.shifts).filter(k=>k!=='REGULAR').map(k=>'<option '+(m?.shift===k?'selected':'')+' value="'+k+'">'+human(k)+'</option>').join(''))+input('Start time','start',m?.start||'07:00','time')+input('End time','end',m?.end||'15:00','time')+(m?select('Status','active','<option value="yes" '+(m.active?'selected':'')+'>Active</option><option value="no" '+(!m.active?'selected':'')+'>Inactive</option>'):'')),m?'Save contract':'Add active staff');
        const roster=s.schedules.filter(a=>members.some(m=>m.id===a.staff));
        return panel('Staff contracts',table(['Name','Work shift','Contract hours','Status',''],members.map(m=>[e(m.name),human(m.shift),e(m.start+' - '+m.end),badge(m.active?'ACTIVE':'INACTIVE'),toggle('Edit',editor(m))])))+toggle('Add staff member',editor())+
            panel('Dated shift roster',table(['Staff','Work date','Shift','Starts at (WIB)','Ends at (WIB)','Status'],roster.map(a=>[e(M.find(s.staff,a.staff).name),e(a.date),human(a.shift),e(a.start.slice(0,16).replace('T',' ')),e(a.end.slice(0,16).replace('T',' ')),badge(a.status)]))+
            toggle('Schedule shift',form('schedule','',fieldGrid(select('Assigned staff','staff',options(members.filter(m=>m.active),m=>m.name))+select('Shift','shift',Object.keys(M.shifts).map(k=>'<option value="'+k+'">'+human(k)+'</option>').join(''))+input('Work date','date',s.now.slice(0,10),'date')+input('Start time','start','07:00','time')+input('End time','end','15:00','time')),'Create dated assignment')));
    }
    function eventTable(s,role,events) {
        return table(['Time (WIB)','Actor','Action','Document','Detail'],events.map(a=>[e(new Date(a.at).toLocaleTimeString('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})),e(a.actor)+(a.shift?'<small class="table-subline">'+human(a.shift)+'</small>':'')+(a.overtime?'<small class="overtime">Overtime</small>':''),e(human(a.action)),e(a.entity),e(a.detail)]));
    }
    function history(s,role) {
        const events=s.events.filter(a=>role==='SUPER_ADMIN'||a.role===role||(['PRODUCTION','DIVISION_MANAGER'].includes(role)&&a.center===(role==='PRODUCTION'?1:2)));
        return panel('Activity in selected scenario',eventTable(s,role,events.slice().reverse()),'<button class="btn btn-outline-secondary btn-sm" data-print>Print / save PDF</button>');
    }
    function reports(s) {
        const ready=s.invoices.filter(i=>i.active&&i.payment==='UNPAID'&&i.approval.startsWith('APPROVED'));
        const shares=s.centers.map(c=>[e(c.name),money(s.payments.filter(p=>!p.reversed).flatMap(p=>p.shares).filter(a=>a.center===c.id).reduce((n,a)=>n+a.amount,0)),money(M.reserved(s,c.id))]);
        return panel('Ready for settlement',invoiceTable(s,ready))+panel('Cash realization by cost center',table(['Cost center','Realized cash','Original PR reservation'],shares))+
            panel('Payment history',table(['Invoice','Transfer reference','Confirmed by','Amount','Status'],s.payments.map(p=>[e(M.find(s.invoices,p.invoice).number),e(p.reference),e(p.actor),money(p.amount),badge(p.reversed?'REVERSED':'PAID')])), '<button class="btn btn-outline-secondary btn-sm" data-print>Print / save PDF</button>');
    }
    function profile(s) {
        const u=M.find(s.users,2),c=M.find(s.centers,2);
        return panel('Profile & cost center','<dl class="profile-details"><dt>Username</dt><dd>'+e(u.username)+'</dd><dt>Cost center</dt><dd>'+e(c.code+' · '+c.name)+'</dd><dt>Status</dt><dd>'+badge(c.active?'ACTIVE':'CLOSED')+'</dd></dl>'+form('profile','',input('Display name','name',u.name),'Save profile'));
    }
    function permissions() {
        return panel('Role permissions in the original application',table(['Role','Capabilities'],M.roles.map(role=>[et(M.names[role]),'<span class="capabilities">'+e(window.DEMO_CONFIG.permissions[role].join(' · '))+'</span>'])));
    }
    function accounts(s) {
        return panel('User accounts',table(['Username','Name','Role','Status'],s.users.map(u=>[e(u.username),e(u.name),et(M.names[u.role]),badge(u.active?'ACTIVE':'INACTIVE')])))+
            toggle('Create a fictional account',form('account','',fieldGrid(input('Username','username','','text','pattern="[a-zA-Z0-9][a-zA-Z0-9_.-]{2,71}"')+input('Full name','name')+select('Role','role',M.roles.filter(r=>r!=='FINANCE').map(r=>'<option value="'+r+'">'+T.t(M.names[r])+'</option>').join(''))),'Create demo account'))+permissions();
    }
    function centers(s) { return panel('Cost center governance',table(['Code','Name','Status',''],s.centers.map(c=>[e(c.code),e(c.name),badge(c.active?'ACTIVE':'CLOSED'),toggle('Edit center',form('center',c.id,input('Name','name',c.name)+select('Status','active','<option value="yes">Active</option><option value="no">Closed to new requisitions</option>'),'Save center'))]))); }
    function masters(s) {
        const editor=i=>form('item',i?.id,fieldGrid(input('Item name','name',i?.name||'')+input('Specification','spec',i?.spec||'')+select('Unit','unit',Object.entries(M.units).map(([k,v])=>'<option value="'+k+'" '+(i?.unit===k?'selected':'')+'>'+et(v)+'</option>').join(''))),'Save catalog item');
        return panel('Item catalog',table(['SKU','Item','Specification','Unit',''],s.catalog.map(i=>[e(i.sku),e(i.name),e(i.spec),et(M.units[i.unit]),toggle('Edit item',editor(i))])))+toggle('Create catalog item',editor())+staff(s,'SUPER_ADMIN');
    }
    function denied(role) { return panel('This page belongs to another workspace','<p>Use the role navigation to explore that responsibility.</p>'+link(role,'dashboard','Return to dashboard')); }
    function page(s,role,path,id,query={}) {
        if(path==='dashboard')return dashboard(s,role);
        if(path==='requisitions/new')return requestForm(s,role);
        if(path==='requisitions')return requisitions(s,role,query.status);
        if(path==='requisitions/view')return prDetail(s,role,id);
        if(path==='orders')return orders(s,role);
        if(path==='warehouse/incoming')return orders(s,role,true);
        if(path==='orders/view')return orderDetail(s,role,id);
        if(path==='receipts')return receipts(s,role);
        if(path==='receipts/new')return receiveForm(s,role,id,query.parent);
        if(path==='receipts/view')return receiptDetail(s,role,id);
        if(path==='staff')return staff(s,role);
        if(path==='history')return history(s,role);
        if(path==='budgets')return budgets(s);
        if(path==='invoices')return invoices(s);
        if(path==='invoices/new')return invoiceNew(s);
        if(path==='invoices/view')return invoiceDetail(s,id);
        if(path==='vendors')return vendors(s,role);
        if(path==='finance/reports')return reports(s);
        if(path==='profile')return profile(s);
        if(path==='admin/users')return accounts(s);
        if(path==='admin/centers')return centers(s);
        if(path==='admin/masters')return masters(s);
        return denied(role);
    }
    function shell(s,role,path,id,query,flash) {
        const navigation=window.DEMO_CONFIG.navigation[role];
        const selected=path.startsWith('requisitions')?'requisitions':path.startsWith('orders')?'orders':path.startsWith('receipts')?'receipts':path;
        const menuPath=p=>p.startsWith('/dashboard/')?'dashboard':p.slice(1);
        const label=navigation.find(n=>menuPath(n[1])===selected)?.[0]||({'orders/view':'Purchase order','receipts/new':'Record delivery','invoices/view':'Invoice review'}[path])||human(path.split('/').at(-1));
        return '<div class="role-topbar"><button class="sidebar-toggle" type="button" data-toggle-sidebar aria-controls="demo-sidebar" aria-expanded="true" aria-label="Toggle sidebar">☰</button><nav class="role-navigation" aria-label="Switch role">'+M.roles.map((r,i)=>'<a href="'+href(r)+'" class="'+(r===role?'active':'')+'" '+(r===role?'aria-current="page"':'')+'><span>'+(i+1)+'</span>'+T.t(M.names[r])+'</a>').join('')+'</nav>'+T.switcher()+'<span class="demo-pill">Interactive demo</span></div><div class="demo-app"><aside class="sidebar" id="demo-sidebar">'+brand()+'<div class="workspace-label"><span class="workspace-dot"></span>'+et(M.names[role])+'<span class="workspace-mode">DEMO</span></div><div class="nav-caption">WORKSPACE</div><nav class="side-nav" aria-label="'+et(M.names[role])+' features">'+navigation.map(([name,path,_,icon])=>'<a class="'+(menuPath(path)===selected?'active':'')+'" href="'+href(role,menuPath(path))+'"><span>'+e(icon)+'</span><span>'+et(name)+'</span></a>').join('')+'</nav><div class="sidebar-bottom"><a href="#/welcome">System introduction</a><button type="button" class="restart-button" data-restart>↻ Restart Demo</button><small>Fictional data.<br>Your changes stay in this browser.</small></div></aside><div class="demo-content"><header class="workspace-top"><div><span>Workspace</span><strong>'+et(M.names[role])+'</strong></div><div><span>Scenario time · '+e(s.now.slice(11,16))+' WIB</span><button class="text-button" data-logout>Exit demo</button></div></header><div class="workspace-grid"><main id="main-content" tabindex="-1"><div class="page-heading"><div><div class="eyebrow muted">'+et(M.names[role].toUpperCase())+' WORKSPACE</div><h1>'+et(label)+'</h1></div>'+(['PRODUCTION','DIVISION_MANAGER'].includes(role)&&path==='dashboard'?link(role,'requisitions/new','Create requisition'):'')+'</div>'+(flash?'<div class="handoff-message" role="status"><span>✓</span><div>'+et(flash.notice)+(flash.destination?' '+link(flash.destination,'dashboard','Open '+M.names[flash.destination],'','table-link'):'')+'</div></div>':'')+page(s,role,path,id,query)+'</main>'+guideFor(path,role)+'</div><footer class="workspace-footer"><span>ProcureSync · Interactive portfolio demo</span><span>Browser simulation · Fictional data</span></footer></div></div>';
    }
    window.DemoViews={
        e,money,qty,human,href,brand,
        welcome:()=>T.render(()=>welcome()),
        login:()=>T.render(()=>login()),
        shell:(...args)=>T.render(()=>shell(...args)),
        lineRow:(...args)=>T.render(()=>lineRow(...args)),
        operatorField:(...args)=>T.render(()=>operatorField(...args))
    };
})();
