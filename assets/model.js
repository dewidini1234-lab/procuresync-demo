/* Browser-only simulation of implemented ProcureSync transitions. No application API calls. */
(function (root) {
    'use strict';
    const roles = ['PRODUCTION', 'DIVISION_MANAGER', 'PURCHASING', 'FINANCE', 'WAREHOUSE', 'SUPER_ADMIN'];
    const names = {PRODUCTION:'Production', DIVISION_MANAGER:'Division Manager', PURCHASING:'Purchasing', FINANCE:'Finance', WAREHOUSE:'Warehouse', SUPER_ADMIN:'Super Admin'};
    const shifts = {MORNING:['07:00','15:00'], AFTERNOON:['15:00','23:00'], NIGHT:['23:00','07:00'], REGULAR:['08:00','17:00']};
    const units = {Unit:'Unit', Pcs:'Piece', Box:'Box', Rim:'Ream', Roll:'Roll', Set:'Set', Pack:'Pack', Batang:'Rod', Dus:'Carton', Karung:'Sack', Kg:'Kilogram', Liter:'Liter', Meter:'Meter'};
    const prStates = ['DRAFT','PENDING_SOURCING','PENDING_BUDGET','APPROVED_FOR_PO','PO_ISSUED','CANCELLATION_REQUESTED','CANCELLED','REJECTED'];
    function must(condition, message) { if (!condition) throw new Error(message); }
    function find(rows, id) { const row = rows.find(r => r.id === Number(id)); must(row, 'Record not found.'); return row; }
    function next(rows) { return Math.max(0,...rows.map(r => r.id)) + 1; }
    function decimal(value, scale=2) {
        const text = String(value).trim();
        must(new RegExp('^\\d{1,8}(?:\\.\\d{1,'+scale+'})?$').test(text), 'Enter a nonnegative decimal with up to '+scale+' decimal places.');
        const [whole, fraction=''] = text.split('.');
        const result = Number(whole) * 10 ** scale + Number(fraction.padEnd(scale,'0'));
        must(Number.isSafeInteger(result), 'This value is too large for the demo.');
        return result;
    }
    function rounded(product, divisor) {
        const value=Number((BigInt(product) + BigInt(divisor)/2n) / BigInt(divisor));
        must(Number.isSafeInteger(value),'This transaction exceeds the exact numeric range of the lightweight demo.');
        return value;
    }
    function lineTotal(line) { return rounded(BigInt(line.qty)*BigInt(line.price),1000); }
    function total(lines) { return lines.reduce((sum,line) => sum + lineTotal(line), 0); }
    function amounts(subtotal, discount=0, vat=1100, shipping=0) {
        must(discount <= subtotal, 'Discount cannot exceed the subtotal.');
        const tax = rounded(BigInt(subtotal-discount)*BigInt(vat),10000);
        return {subtotal,discount,vat,tax,shipping,grand:subtotal-discount+tax+shipping};
    }
    function number(prefix,id) { return prefix+'-202611-'+String(id).padStart(6,'0'); }
    function seed() {
        const day = new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'});
        return {
            version:1, now:day+'T10:30:00+07:00', focus:1,
            centers:[{id:1,name:'Production',code:'PROD',active:true,budget:2500000000},{id:2,name:'People & Administration',code:'HRD',active:true,budget:1500000000},{id:3,name:'Technology',code:'IT',active:true,budget:1200000000}],
            catalog:[{id:1,sku:'SKU-000001',name:'Protective gloves',spec:'Nitrile, powder-free · 100 pieces per box',unit:'Box',fractional:false,active:true},{id:2,sku:'SKU-000002',name:'A4 copy paper',spec:'80 gsm · 500 sheets per ream',unit:'Rim',fractional:false,active:true},{id:3,sku:'SKU-000003',name:'Machine lubricant',spec:'Industrial grade ISO VG 68',unit:'Liter',fractional:true,active:true},{id:4,sku:'SKU-000004',name:'Aluminum profile',spec:'20 × 20 mm · 1 meter',unit:'Batang',fractional:false,active:true}],
            vendors:[{id:1,name:'Atlas Industrial Supply',contact:'Demo sales desk',verified:true,active:true,bank:'Demo Bank · DEMO-ATLAS-001'},{id:2,name:'Northline Office Supplies',contact:'Demo account desk',verified:true,active:true,bank:'Demo Bank · DEMO-NORTH-002'}],
            staff:[{id:1,name:'Maya Pratama',area:'PRODUCTION',shift:'MORNING',start:'07:00',end:'15:00',active:true},{id:2,name:'Arif Santoso',area:'PRODUCTION',shift:'NIGHT',start:'23:00',end:'07:00',active:true},{id:4,name:'Rina Wibowo',area:'WAREHOUSE',shift:'MORNING',start:'07:00',end:'15:00',active:true},{id:5,name:'Dimas Setiawan',area:'WAREHOUSE',shift:'NIGHT',start:'23:00',end:'07:00',active:true}],
            schedules:[{id:1,staff:4,shift:'MORNING',date:day,start:day+'T00:00:00+07:00',end:day+'T23:59:59+07:00',status:'SCHEDULED'}],
            users:roles.map((role,i)=>({id:i+1,name:role==='FINANCE'?'Finance Demo':names[role]+' Demo',username:role==='FINANCE'?'finance_a':role.toLowerCase(),role,active:true,center:role==='PRODUCTION'?1:role==='DIVISION_MANAGER'?2:null})),
            prs:[
                {id:1,number:number('PR',1),center:1,creator:'Maya Pratama',role:'PRODUCTION',staff:1,shift:'MORNING',overtime:false,status:'DRAFT',notes:'Restock protective gloves for the packing line.',lines:[{item:1,qty:12000,price:0,vendor:1}],submitted:null},
                {id:2,number:number('PR',2),center:2,creator:'Division Manager Demo',role:'DIVISION_MANAGER',status:'PENDING_SOURCING',notes:'Paper for the monthly onboarding sessions.',lines:[{item:2,qty:8000,price:0,vendor:2}],submitted:2},
                {id:3,number:number('PR',3),center:1,creator:'Maya Pratama',role:'PRODUCTION',staff:1,shift:'MORNING',overtime:false,status:'PENDING_BUDGET',notes:'Scheduled equipment maintenance.',lines:[{item:3,qty:6500,price:9500000,vendor:1}],submitted:3},
                {id:4,number:number('PR',4),center:1,creator:'Maya Pratama',role:'PRODUCTION',staff:1,shift:'MORNING',status:'PO_ISSUED',notes:'Previous safety stock request.',lines:[{item:1,qty:10000,price:18500000,vendor:1}],submitted:1},
                {id:5,number:number('PR',5),center:2,creator:'Division Manager Demo',role:'DIVISION_MANAGER',status:'PO_ISSUED',notes:'Office supplies sample.',lines:[{item:2,qty:20000,price:5800000,vendor:2}],submitted:1},
                {id:6,number:number('PR',6),center:1,creator:'Maya Pratama',role:'PRODUCTION',staff:1,shift:'MORNING',status:'APPROVED_FOR_PO',notes:'Approved lubricant replenishment.',lines:[{item:3,qty:4000,price:9500000,vendor:1}],submitted:4}
            ],
            orders:[
                {id:1,number:number('PO',1),vendor:1,lines:[{item:1,qty:10000,price:18500000,sources:[{pr:4,center:1,qty:10000}]}],...amounts(185000000),logistics:'PARTIAL_DELIVERY',payment:'UNPAID'},
                {id:2,number:number('PO',2),vendor:2,lines:[{item:2,qty:20000,price:5800000,sources:[{pr:5,center:2,qty:20000}]}],...amounts(116000000),logistics:'FULLY_RECEIVED',payment:'HOLD_DISCREPANCY'}
            ],
            receipts:[
                {id:1,number:number('GRN',1),order:1,staff:4,actor:'Rina Wibowo',shift:'MORNING',date:day,received:day+'T09:00:00+07:00',note:'DN-DEMO-1001',file:'sample-delivery-note.pdf',parent:null,lines:[{item:1,good:3000,damaged:2000,resolution:'PENDING',allocations:[{pr:4,center:1,good:3000,damaged:2000}]}]},
                {id:2,number:number('GRN',2),order:2,staff:4,actor:'Rina Wibowo',shift:'MORNING',date:day,received:day+'T09:20:00+07:00',note:'DN-DEMO-1002',file:'sample-delivery-note.pdf',parent:null,lines:[{item:2,good:20000,damaged:0,resolution:'PENDING',allocations:[{pr:5,center:2,good:20000,damaged:0}]}]}
            ],
            invoices:[{id:1,number:'INV-DEMO-2001',order:2,date:day,receipts:[2],ocr:'NEEDS_REVIEW',matching:'DISCREPANCY',approval:'PENDING',payment:'UNPAID',active:true,reason:'',file:'sample-invoice.pdf',raw:'SKU-000002 | 20.000 | 64000.00',lines:[{item:2,qty:20000,price:6400000}],...amounts(128000000),issues:['Confirm OCR review.','Reviewed unit price differs from the approved PO.']}],
            payments:[],priceHistory:[{order:1,item:1,vendor:1,price:18500000},{order:2,item:2,vendor:2,price:5800000}],
            events:[{id:1,at:day+'T09:20:00+07:00',role:'WAREHOUSE',actor:'Rina Wibowo',action:'GRN_POSTED',entity:number('GRN',2),center:2,detail:'20.000 Reams received intact; allocated to the originating requisition.'}]
        };
    }
    function overtime(staff, now) {
        const time = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(now));
        const start=staff.start+':00',end=staff.end+':00';
        return start<=end ? time<start || time>end : time<start && time>end;
    }
    function operator(s,role,id) {
        const staff=find(s.staff,id);
        must(staff.active && staff.area===role,'Select active staff from your work area.');
        if(role==='PRODUCTION') return {staff:staff.id,creator:staff.name,shift:staff.shift,overtime:overtime(staff,s.now)};
        const assignment=s.schedules.find(a=>a.staff===staff.id && a.status==='SCHEDULED' && Date.parse(a.start)<=Date.parse(s.now) && Date.parse(a.end)>Date.parse(s.now));
        must(assignment,'This staff member is not scheduled at the scenario time. Review the shift roster.');
        return {staff:staff.id,creator:staff.name,shift:assignment.shift,assignment:assignment.id,date:assignment.date};
    }
    function reserved(s,center) { return s.prs.filter(p=>p.center===center && ['APPROVED_FOR_PO','PO_ISSUED'].includes(p.status)).reduce((sum,p)=>sum+total(p.lines),0); }
    function totalsReceived(s,order,item) {
        return s.receipts.filter(r=>r.order===order).flatMap(r=>r.lines.map(l=>({...l,normal:!r.parent}))).filter(l=>l.item===item).reduce((a,l)=>({
            good:a.good+l.good,damaged:a.damaged+l.damaged,debit:a.debit+(l.resolution==='DEBIT_NOTE'?l.damaged:0),
            normal:a.normal+(l.normal?l.good+l.damaged:0)
        }),{good:0,damaged:0,debit:0,normal:0});
    }
    function refresh(s,order) {
        const po=find(s.orders,order);
        const done=po.lines.every(l=>{const r=totalsReceived(s,order,l.item);return r.good+r.debit===l.qty;});
        po.logistics=done?'FULLY_RECEIVED':s.receipts.some(r=>r.order===order)?'PARTIAL_DELIVERY':'IN_TRANSIT';
        const active=s.invoices.filter(i=>i.order===order && i.active);
        const paid=po.lines.every(l=>{
            const qty=active.filter(i=>i.payment==='PAID').flatMap(i=>i.lines).filter(i=>i.item===l.item).reduce((n,i)=>n+i.qty,0);
            return qty+totalsReceived(s,order,l.item).debit===l.qty;
        });
        po.payment=active.some(i=>i.payment!=='PAID' && (i.matching==='DISCREPANCY'||i.approval==='HOLD_PAYMENT'))?'HOLD_DISCREPANCY':paid?'PAID':active.some(i=>i.payment==='PAID')?'PARTIALLY_PAID':'UNPAID';
    }
    function audit(s,role,action,entity,detail,center=null,identity=null) {
        const account=find(s.users,s.users.find(u=>u.role===role && u.active)?.id);
        s.events.push({id:next(s.events),at:s.now,role,actor:identity?.creator||account.name,action,entity,detail,center,shift:identity?.shift,overtime:identity?.overtime});
    }
    function match(s,invoice) {
        const po=find(s.orders,invoice.order),issues=[];
        if(invoice.ocr!=='EXTRACTED') issues.push('Confirm OCR review.');
        const other=s.invoices.filter(i=>i.id!==invoice.id && i.order===po.id && i.active && i.physicalValid!==false);
        let physicalValid=true;
        for(const line of invoice.lines) {
            const original=po.lines.find(l=>l.item===line.item);
            must(original,'Invoice line does not belong to the purchase order.');
            if(line.price!==original.price) issues.push('Reviewed unit price differs from the approved PO.');
            const good=s.receipts.filter(r=>invoice.receipts.includes(r.id)).flatMap(r=>r.lines).filter(l=>l.item===line.item).reduce((n,l)=>n+l.good,0);
            const claimed=other.filter(i=>i.receipts.some(r=>invoice.receipts.includes(r))).flatMap(i=>i.lines).filter(l=>l.item===line.item).reduce((n,l)=>n+l.qty,0);
            const item=find(s.catalog,line.item);
            if(line.qty<=0 || (!item.fractional && line.qty%1000!==0)) {
                issues.push('Reviewed quantity must be positive and use the supported unit precision.');
                physicalValid=false;
            }
            if(line.qty+claimed>good) {
                issues.push('Invoice quantity exceeds unbilled intact goods in the selected receipts.');
                physicalValid=false;
            }
        }
        if(invoice.vat!==po.vat) issues.push('Invoice VAT rate differs from the approved PO.');
        for(const field of ['discount','tax','shipping','grand']) {
            if(invoice[field]+other.reduce((n,i)=>n+i[field],0)>po[field]) issues.push('Accumulated invoice '+field+' exceeds the approved PO.');
        }
        invoice.physicalValid=physicalValid;
        invoice.issues=[...new Set(issues)];
        invoice.matching=issues.length?'DISCREPANCY':'MATCHED_100';
        invoice.approval='PENDING';
        delete invoice.bank;
        refresh(s,po.id);
    }
    function validateLines(s,lines,commercial=false) {
        must(lines?.length && lines.length<=50,'Add at least one item.');
        const ids=new Set();
        return lines.map(l=>{
            const item=find(s.catalog,l.item);
            must(item.active && !ids.has(item.id),'Use active catalog items once per requisition.');
            ids.add(item.id);
            const qty=decimal(l.qty,3);
            must(qty>0 && (item.fractional || qty%1000===0),'Use positive whole quantities for this unit.');
            const result={item:item.id,qty,price:commercial?decimal(l.price):0,vendor:commercial?Number(l.vendor):1};
            if(commercial) must(result.price>0 && find(s.vendors,result.vendor).active,'Select an active vendor and a positive fixed price.');
            return result;
        });
    }
    function transition(original, role, action, data={}) {
        must(roles.includes(role),'Unknown role.');
        const s=structuredClone(original), requester=['PRODUCTION','DIVISION_MANAGER'].includes(role);
        const required={
            createPr:requester, updatePr:requester, submitPr:requester, cancelPr:requester, copyPr:requester,
            source:role==='PURCHASING', issue:role==='PURCHASING', followup:role==='PURCHASING', createVendor:role==='PURCHASING',
            budget:role==='FINANCE', decideBudget:role==='FINANCE', decideCancellation:['PURCHASING','FINANCE'].includes(role),
            receive:role==='WAREHOUSE', damage:role==='FINANCE', verifyBank:role==='FINANCE',
            createInvoice:role==='FINANCE', hitl:role==='FINANCE', rematch:role==='FINANCE', decideInvoice:role==='FINANCE', pay:role==='FINANCE', reverse:role==='FINANCE', voidInvoice:role==='FINANCE',
            staff:['PRODUCTION','WAREHOUSE','SUPER_ADMIN'].includes(role), schedule:['PRODUCTION','WAREHOUSE','SUPER_ADMIN'].includes(role),
            cancelSchedule:['PRODUCTION','WAREHOUSE','SUPER_ADMIN'].includes(role), profile:role==='DIVISION_MANAGER',
            center:role==='SUPER_ADMIN', item:role==='SUPER_ADMIN', account:role==='SUPER_ADMIN'
        };
        must(required[action], 'This role cannot perform this action.');
        let entity='',notice='Changes saved.',destination=null,recordId=Number(data.id),identity=null,center=null;
        const scopedPr=()=>{
            const p=find(s.prs,recordId);
            if(requester) must(p.role===role && p.center===(role==='PRODUCTION'?1:2),'This requisition belongs to another cost center.');
            else must(p.status!=='DRAFT','Requester drafts are private.');
            return p;
        };
        if(['createPr','updatePr'].includes(action)) {
            center=role==='PRODUCTION'?1:2;
            const c=find(s.centers,center);
            must(c.active || action==='updatePr','This cost center is closed.');
            const lines=validateLines(s,data.lines);
            identity=role==='PRODUCTION'?operator(s,role,data.staff):null;
            if(action==='createPr') {
                recordId=next(s.prs);
                s.prs.push({id:recordId,number:number('PR',recordId),center,role,creator:identity?.creator||find(s.users,2).name,...identity,status:'DRAFT',notes:String(data.notes||''),lines,submitted:null});
            } else {
                const p=scopedPr();must(p.status==='DRAFT','Only drafts can be edited.');p.notes=String(data.notes||'');p.lines=lines;
            }
            s.focus=recordId;entity=find(s.prs,recordId).number;notice='Draft saved. Submit it to send the request to Purchasing.';
        } else if(['submitPr','cancelPr','copyPr'].includes(action)) {
            const p=scopedPr();center=p.center;entity=p.number;
            identity=role==='PRODUCTION'?operator(s,role,data.staff):null;
            if(action==='submitPr') { must(p.status==='DRAFT','Only a draft can be submitted.');p.status='PENDING_SOURCING';p.submitted=Math.max(0,...s.prs.map(row=>row.submitted||0))+1;destination='PURCHASING';notice='Submitted to Purchasing for vendor sourcing.'; }
            if(action==='cancelPr') {
                must(['DRAFT','PENDING_SOURCING','PENDING_BUDGET','APPROVED_FOR_PO'].includes(p.status),'This requisition can no longer be cancelled.');
                must(String(data.reason||'').trim(),'Enter a cancellation reason.');
                p.reason=data.reason;p.previous=p.status;
                p.status=p.status==='DRAFT'?'CANCELLED':'CANCELLATION_REQUESTED';
                destination=p.status==='CANCELLED'?null:p.previous==='PENDING_SOURCING'?'PURCHASING':'FINANCE';
                notice=destination?'Cancellation sent for review.':'Draft cancelled.';
            }
            if(action==='copyPr') {
                must(p.status==='REJECTED','Only a rejected requisition can be copied.');
                recordId=next(s.prs);
                s.prs.push({...structuredClone(p),id:recordId,number:number('PR',recordId),status:'DRAFT',creator:identity?.creator||find(s.users,2).name,...identity,submitted:null,reason:'',previous:null});
                entity=find(s.prs,recordId).number;notice='A new independent draft was created.';
            }
            s.focus=recordId;
        } else if(action==='source') {
            const p=scopedPr();must(p.status==='PENDING_SOURCING','This request is not awaiting sourcing.');
            const lines=validateLines(s,data.lines,true);
            must(lines.length===p.lines.length && lines.every(l=>p.lines.some(i=>i.item===l.item&&i.qty===l.qty)),'Sourcing must preserve the requested items and quantities.');
            p.lines=lines;p.status='PENDING_BUDGET';center=p.center;entity=p.number;destination='FINANCE';notice='Fixed vendor quotes sent to Finance for budget approval.';
        } else if(action==='budget') {
            const c=find(s.centers,data.center),budget=decimal(data.amount);
            must(budget>=reserved(s,c.id),'Budget cannot be lower than existing reservations.');c.budget=budget;entity=c.name;center=c.id;
        } else if(action==='decideBudget') {
            const p=scopedPr();must(p.status==='PENDING_BUDGET','This request is not awaiting budget approval.');
            center=p.center;entity=p.number;
            must(['approve','reject'].includes(data.decision),'Choose an approval or rejection decision.');
            if(data.decision==='reject') {must(String(data.reason||'').trim(),'Enter a rejection reason.');p.status='REJECTED';p.reason=data.reason;destination=p.role;notice='Request rejected with a reason. The requester may create a new copy.';}
            else { const c=find(s.centers,p.center);must(total(p.lines)<=c.budget-reserved(s,p.center),'The request exceeds the remaining monthly budget.');p.status='APPROVED_FOR_PO';destination='PURCHASING';notice='Budget reserved. Purchasing can now issue the PO.'; }
        } else if(action==='decideCancellation') {
            const p=scopedPr();must(p.status==='CANCELLATION_REQUESTED','No cancellation is pending.');
            must(role===(p.previous==='PENDING_SOURCING'?'PURCHASING':'FINANCE'),'This cancellation belongs to another reviewer.');
            must(String(data.reason||'').trim(),'Enter a review reason.');
            p.status=data.decision==='approve'?'CANCELLED':p.previous;entity=p.number;center=p.center;destination=p.role;notice='Cancellation decision recorded.';
        } else if(action==='issue') {
            const selected=(data.ids||[]).map(id=>find(s.prs,id));must(selected.length,'Select at least one approved requisition.');
            must(new Set(selected.map(p=>p.id)).size===selected.length && selected.every(p=>p.status==='APPROVED_FOR_PO'),'Only whole approved requisitions can be issued once.');
            const groups=new Map();
            for(const p of selected.sort((a,b)=>a.submitted-b.submitted||a.id-b.id)) for(const line of p.lines) {
                must(find(s.vendors,line.vendor).active,'An approved vendor is now inactive.');
                if(!groups.has(line.vendor))groups.set(line.vendor,[]);
                const lines=groups.get(line.vendor);
                let merged=lines.find(l=>l.item===line.item&&l.price===line.price);
                if(!merged){merged={item:line.item,price:line.price,qty:0,sources:[]};lines.push(merged);}
                merged.qty+=line.qty;merged.sources.push({pr:p.id,center:p.center,qty:line.qty});
            }
            for(const [vendor,lines] of groups) {
                must(new Set(lines.map(l=>l.item)).size===lines.length,'This lightweight demo supports one fixed price per SKU in a vendor batch. Issue differently priced requests separately.');
                const id=next(s.orders);
                const a=amounts(total(lines),decimal(data.discount||'0'),decimal(data.vat||'11'),decimal(data.shipping||'0'));
                s.orders.push({id,number:number('PO',id),vendor,lines,...a,logistics:'IN_TRANSIT',payment:'UNPAID'});
                for(const line of lines)s.priceHistory.push({order:id,item:line.item,vendor,price:line.price});
            }
            for(const p of selected)p.status='PO_ISSUED';
            entity=selected.map(p=>p.number).join(', ');destination='WAREHOUSE';notice='Purchase orders issued by vendor. Warehouse can receive the deliveries.';
        } else if(action==='receive') {
            const po=find(s.orders,data.order);identity=operator(s,role,data.staff);
            must(String(data.note||'').trim(),'Enter a delivery note number.');
            must(data.file,'Choose a sample delivery note.');
            const parent=data.parent?find(s.receipts,data.parent):null;
            must(!parent||parent.order===po.id,'Replacement parent must belong to this order.');
            const selected=new Set();
            const lines=(data.lines||[]).map(input=>{
                const item=Number(input.item),base=po.lines.find(l=>l.item===item);
                must(base&&!selected.has(item),'Receipt items must be unique and belong to the order.');selected.add(item);
                const good=decimal(input.good||'0',3),damaged=decimal(input.damaged||'0',3);
                must(find(s.catalog,item).fractional||(good%1000===0&&damaged%1000===0),'Use whole quantities for this unit.');
                const r=totalsReceived(s,po.id,item),claim=parent?.lines.find(l=>l.item===item);
                let limit=base.qty-r.normal;
                if(parent) {
                    must(claim?.resolution==='RETURN_TO_VENDOR','This claim is not awaiting replacement.');
                    const replaced=s.receipts.filter(g=>g.parent===parent.id).flatMap(g=>g.lines).filter(l=>l.item===item).reduce((n,l)=>n+l.good+l.damaged,0);
                    limit=claim.damaged-replaced;
                }
                must(good+damaged<=limit,'Receipt quantities exceed the remaining delivery or replacement capacity.');
                const allocations=[];let remainingGood=good,remainingDamaged=damaged;
                for(const source of parent?claim.allocations.map(a=>({...a,qty:a.damaged})):base.sources) {
                    const used=s.receipts.filter(g=>parent?g.parent===parent.id:g.order===po.id&&!g.parent).flatMap(g=>g.lines).filter(l=>l.item===item).flatMap(l=>l.allocations).filter(a=>a.pr===source.pr).reduce((n,a)=>n+a.good+a.damaged,0);
                    let room=Math.max(0,source.qty-used),assignedGood=Math.min(room,remainingGood);
                    room-=assignedGood;remainingGood-=assignedGood;
                    const assignedDamaged=Math.min(room,remainingDamaged);remainingDamaged-=assignedDamaged;
                    if(assignedGood+assignedDamaged)allocations.push({pr:source.pr,center:source.center,good:assignedGood,damaged:assignedDamaged});
                }
                must(remainingGood+remainingDamaged===0,'Allocation exceeds the original requisition capacity.');
                return {item,good,damaged,resolution:'PENDING',allocations};
            }).filter(l=>l.good+l.damaged>0);
            must(lines.length,'Enter at least one positive received quantity.');
            const id=next(s.receipts);
            s.receipts.push({id,number:number('GRN',id),order:po.id,staff:identity.staff,actor:identity.creator,shift:identity.shift,date:identity.date,received:s.now,note:data.note,file:data.file,parent:parent?.id||null,lines});
            refresh(s,po.id);entity=number('GRN',id);destination='FINANCE';notice='Receipt posted and allocated FIFO to the original requisitions.';
        } else if(action==='damage'||action==='followup') {
            const r=find(s.receipts,data.id),line=r.lines.find(l=>l.item===Number(data.item));
            must(line?.damaged>0,'No damaged quantity exists on this line.');must(String(data.reason||'').trim(),'Enter a reason or follow-up reference.');
            if(action==='damage'){must(line.resolution==='PENDING'&&['RETURN_TO_VENDOR','DEBIT_NOTE'].includes(data.decision),'Choose an unresolved damage decision.');line.resolution=data.decision;destination=data.decision==='RETURN_TO_VENDOR'?'PURCHASING':'FINANCE';}
            else {must(line.resolution==='RETURN_TO_VENDOR','This claim is not awaiting return.');line.followup=data.reason;destination='WAREHOUSE';}
            refresh(s,r.order);entity=r.number;notice=action==='damage'?'Damage decision recorded.':'Vendor follow-up recorded. Warehouse can record a replacement.';
        } else if(action==='createVendor') {
            must(String(data.name||'').trim(),'Enter a vendor name.');const id=next(s.vendors);
            s.vendors.push({id,name:data.name,contact:data.contact||'Demo contact',active:true,verified:false,bank:'Demo Bank · DEMO-NEW-'+id});entity=data.name;
        } else if(action==='verifyBank') {
            const vendor=find(s.vendors,data.id);must(String(data.reason||'').trim(),'Enter a verification reason.');vendor.verified=data.verified==='yes';entity=vendor.name;
        } else if(action==='createInvoice') {
            const po=find(s.orders,data.order),numberText=String(data.number||'').trim();
            must(numberText&&!s.invoices.some(i=>find(s.orders,i.order).vendor===po.vendor&&i.number===numberText),'Enter a unique vendor invoice number.');
            const receipts=(data.receipts||[]).map(Number);
            must(receipts.length&&receipts.every(id=>find(s.receipts,id).order===po.id),'Select receipts from this purchase order.');
            must(String(data.raw||'').trim(),'Use the sample extraction transcript or enter one for review.');
            const parsed=[];
            for(const text of String(data.raw).split('\n')) {
                const m=/SKU-0*(\d+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/.exec(text);
                if(m){const item=Number(m[1]);must(po.lines.some(l=>l.item===item),'The extraction references an item outside this order.');parsed.push({item,qty:decimal(m[2],3),price:decimal(m[3])});}
            }
            const id=next(s.invoices),lines=parsed.length?parsed:po.lines.map(l=>({item:l.item,qty:0,price:0}));
            s.invoices.push({id,number:numberText,order:po.id,date:data.date||s.now.slice(0,10),receipts,ocr:'NEEDS_REVIEW',matching:'DISCREPANCY',approval:'PENDING',payment:'UNPAID',active:true,raw:data.raw,file:data.file||'sample-invoice.pdf',lines,...amounts(total(lines),0,po.vat),issues:['Confirm OCR review.']});
            match(s,find(s.invoices,id));entity=numberText;recordId=id;notice='Local extraction simulated. Review the source and correct all billed lines.';
        } else if(['hitl','rematch','decideInvoice','pay','reverse','voidInvoice'].includes(action)) {
            const invoice=find(s.invoices,data.id),po=find(s.orders,invoice.order),vendor=find(s.vendors,po.vendor);
            must(invoice.active,'This invoice was voided.');entity=invoice.number;
            const history=s.payments.filter(p=>p.invoice===invoice.id);
            if(['hitl','rematch','voidInvoice'].includes(action))must(!history.length,'Payment history locks the invoice evidence.');
            if(action==='hitl') {
                must(String(data.reason||'').trim()&&data.reviewed,'Confirm the review and enter a correction reason.');
                const lines=validateLines(s,(data.lines||[]).map(l=>({...l,vendor:po.vendor})),true);
                must(lines.every(l=>po.lines.some(p=>p.item===l.item)),'Only approved PO items may be billed.');
                invoice.lines=lines;invoice.reason=data.reason;invoice.ocr='EXTRACTED';
                Object.assign(invoice,amounts(total(lines),decimal(data.discount||'0'),decimal(data.vat||'11'),decimal(data.shipping||'0')));
                match(s,invoice);notice=invoice.matching==='MATCHED_100'?'PO, intact GRN quantities and reviewed invoice match. Approval is still required.':'Discrepancies remain. Review the highlighted issues.';
            }
            if(action==='rematch'){match(s,invoice);notice='Matching recalculated. Previous approval cleared.';}
            if(action==='decideInvoice') {
                must(['HOLD_PAYMENT','APPROVED_FULL_PAYMENT','APPROVED_PARTIAL_DEBIT_NOTE'].includes(data.decision),'Choose a valid decision.');
                if(data.decision!=='APPROVED_FULL_PAYMENT')must(String(data.reason||'').trim(),'Enter a decision reason.');
                if(data.decision!=='HOLD_PAYMENT') {
                    must(invoice.matching==='MATCHED_100','Resolve discrepancies and confirm OCR review before approval.');
                    must(vendor.verified,'Verify the beneficiary bank before approval.');
                    const damage=s.receipts.filter(r=>invoice.receipts.includes(r.id)).flatMap(r=>r.lines).filter(l=>l.damaged>0);
                    must(damage.every(l=>l.resolution!=='PENDING'),'Resolve damage decisions on selected receipts.');
                    must(damage.some(l=>l.resolution==='DEBIT_NOTE')===(data.decision==='APPROVED_PARTIAL_DEBIT_NOTE'),'Select the approval option matching the debit-note decision.');
                    invoice.bank=vendor.bank;
                }
                invoice.approval=data.decision;invoice.reason=data.reason||'';notice='Finance decision recorded. The same finance_a account may confirm payment.';
            }
            if(action==='pay') {
                must(invoice.matching==='MATCHED_100'&&['APPROVED_FULL_PAYMENT','APPROVED_PARTIAL_DEBIT_NOTE'].includes(invoice.approval),'This invoice is not approved for payment.');
                must(invoice.payment!=='PAID','This invoice already has an active payment.');
                must(vendor.verified&&invoice.bank===vendor.bank,'Beneficiary verification changed. Renew approval.');
                must(decimal(data.amount)===invoice.grand,'One transfer must equal the full approved invoice amount.');
                must(data.date&&data.date<=s.now.slice(0,10)&&String(data.reference||'').trim()&&data.file,'Enter a valid transfer date, reference and proof.');
                must(!s.payments.some(p=>p.proof===data.file),'This demo proof has already been used, including reversed payments.');
                const values=new Map();
                for(const l of invoice.lines) {
                    let remaining=l.qty;
                    const sources=po.lines.find(p=>p.item===l.item).sources;
                    for(const source of sources) {
                        const physical=s.receipts.filter(r=>invoice.receipts.includes(r.id)).flatMap(r=>r.lines).filter(r=>r.item===l.item).flatMap(r=>r.allocations).filter(a=>a.pr===source.pr).reduce((n,a)=>n+a.good,0);
                        const paidShares=s.payments.filter(p=>!p.reversed&&find(s.invoices,p.invoice).order===po.id).flatMap(p=>p.quantities||[]).filter(q=>q.pr===source.pr&&q.item===l.item).reduce((n,q)=>n+q.qty,0);
                        const q=Math.min(remaining,Math.max(0,physical-paidShares));remaining-=q;
                        if(q){const row=values.get(source.center)||{value:0,quantities:[]};row.value+=lineTotal({qty:q,price:l.price});row.quantities.push({pr:source.pr,item:l.item,qty:q});values.set(source.center,row);}
                    }
                    must(!remaining,'Payment allocation exceeds intact goods remaining for the original requisitions.');
                }
                const denominator=[...values.values()].reduce((n,r)=>n+r.value,0);
                must(denominator>0 && invoice.grand>0,'A transfer amount must be greater than zero.');
                let residual=invoice.grand;
                const shares=[...values.entries()].sort((a,b)=>a[0]-b[0]).map(([center,r])=>{const amount=Number(BigInt(invoice.grand)*BigInt(r.value)/BigInt(denominator));residual-=amount;return {center,name:find(s.centers,center).name,amount};});
                for(let i=0;residual>0;i++,residual--)shares[i%shares.length].amount++;
                s.payments.push({id:next(s.payments),invoice:invoice.id,amount:invoice.grand,date:data.date,reference:data.reference,proof:data.file,actor:'finance_a',shares,quantities:[...values.values()].flatMap(v=>v.quantities),reversed:false});
                invoice.payment='PAID';notice='Payment confirmed by finance_a. Cash allocated to the original cost centers.';
            }
            if(action==='reverse') {
                const p=history.find(p=>!p.reversed);must(p,'No active payment can be reversed.');
                must(String(data.reason||'').trim()&&String(data.reference||'').trim(),'Enter a reversal reason and reference.');
                p.reversed=true;p.reversalReason=data.reason;p.reversalReference=data.reference;invoice.payment='UNPAID';notice='Payment reversed. Original payment evidence remains in history.';
            }
            if(action==='voidInvoice'){must(String(data.reason||'').trim(),'Enter a void reason.');invoice.active=false;invoice.reason=data.reason;notice='Invoice logically voided. Its number and source are retained.';}
            refresh(s,po.id);
        } else if(action==='staff') {
            const area=role==='SUPER_ADMIN'?data.area:role;
            must(['PRODUCTION','WAREHOUSE'].includes(area),'Choose a kiosk work area.');
            must(data.name?.trim()&&shifts[data.shift],'Enter a staff name and shift.');
            must(/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data.start)&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data.end)&&data.start!==data.end,'Enter two different valid contract times.');
            const member=data.id?find(s.staff,data.id):{id:next(s.staff),area};
            must(role==='SUPER_ADMIN'||member.area===role,'Staff are limited to your work area.');
            Object.assign(member,{name:data.name,shift:data.shift,start:data.start,end:data.end,active:data.id?data.active==='yes':true});
            if(!data.id)s.staff.push(member);entity=data.name;
        } else if(action==='schedule') {
            const staff=find(s.staff,data.staff);must(staff.active&&(role==='SUPER_ADMIN'||staff.area===role),'Choose active staff from your work area.');
            must(data.date&&shifts[data.shift]&&/^\d\d:\d\d$/.test(data.start)&&/^\d\d:\d\d$/.test(data.end),'Complete the shift schedule.');
            const start=data.date+'T'+data.start+':00+07:00';
            const endDay=new Date(start);if(data.end<=data.start)endDay.setUTCDate(endDay.getUTCDate()+1);
            const end=endDay.toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'})+'T'+data.end+':00+07:00';
            must(Date.parse(end)>Date.parse(s.now),'A completed shift cannot be scheduled retrospectively.');
            must(!s.schedules.some(a=>a.staff===staff.id&&a.status==='SCHEDULED'&&Date.parse(a.start)<Date.parse(end)&&Date.parse(a.end)>Date.parse(start)),'This staff member already has an overlapping shift.');
            s.schedules.push({id:next(s.schedules),staff:staff.id,shift:data.shift,date:data.date,start,end,status:'SCHEDULED'});entity=staff.name;
        } else if(action==='cancelSchedule') {
            const schedule=find(s.schedules,data.id),staff=find(s.staff,schedule.staff);
            must(role==='SUPER_ADMIN'||staff.area===role,'This schedule belongs to another work area.');
            must(schedule.status==='SCHEDULED'&&Date.parse(schedule.start)>Date.parse(s.now),'Only future assignments can be cancelled.');
            must(data.reason?.trim(),'Enter a cancellation reason.');schedule.status='CANCELLED';schedule.reason=data.reason;entity=staff.name;
        } else if(action==='profile') {
            must(data.name?.trim(),'Enter a display name.');find(s.users,2).name=data.name;entity=data.name;
        } else if(action==='center') {
            must(data.name?.trim(),'Enter a cost center name.');const c=find(s.centers,data.id);c.name=data.name;c.active=data.active==='yes';entity=data.name;
        } else if(action==='item') {
            must(data.name?.trim()&&units[data.unit],'Enter an item name and supported unit.');
            const item=data.id?find(s.catalog,data.id):{id:next(s.catalog),active:true};
            const used=s.prs.some(p=>p.lines.some(l=>l.item===item.id));
            must(!used||item.unit===data.unit,'The unit is locked because this SKU has been used.');
            Object.assign(item,{name:data.name,spec:data.spec||'',unit:data.unit,fractional:['Kg','Liter','Meter'].includes(data.unit),sku:'SKU-'+String(item.id).padStart(6,'0')});
            if(!data.id)s.catalog.push(item);entity=item.sku;
        } else if(action==='account') {
            must(/^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,71}$/.test(data.username)&&roles.includes(data.role),'Enter a valid username and canonical role.');
            must(!s.users.some(u=>u.username===data.username),'This username is already in use.');
            must(data.role!=='FINANCE','The single active Finance account is finance_a.');
            s.users.push({id:next(s.users),name:data.name||names[data.role]+' Demo',username:data.username,role:data.role,active:true,center:data.role==='DIVISION_MANAGER'?3:null});
            entity=data.username;notice='Simulated account created. Temporary password: DemoAccount!2026';
        }
        audit(s,role,action,entity,data.reason||notice,center,identity);
        return {state:s,notice,destination,recordId};
    }
    const api={roles,names,shifts,units,prStates,seed,find,next,decimal,lineTotal,total,amounts,reserved,totalsReceived,overtime,operator,match,transition};
    if(typeof module!=='undefined'&&module.exports)module.exports=api;
    else root.DemoModel=api;
})(typeof window==='undefined'?globalThis:window);
