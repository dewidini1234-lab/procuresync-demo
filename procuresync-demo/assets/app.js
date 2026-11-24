(function () {
    'use strict';
    const M=window.DemoModel,V=window.DemoViews,T=window.DemoI18n;
    const STORE='procuresync-portfolio-v1',SESSION='procuresync-demo-session';
    const app=document.getElementById('app');
    let storageAvailable=true,loggedIn=false,state,chart,flash=null;
    try {
        loggedIn=sessionStorage.getItem(SESSION)==='open';
        const saved=JSON.parse(localStorage.getItem(STORE)||'null');
        state=saved?.version===1&&Array.isArray(saved.prs)&&Array.isArray(saved.events)?saved:M.seed();
    } catch { state=M.seed();storageAvailable=false; }
    function persist() {
        try { localStorage.setItem(STORE,JSON.stringify(state)); }
        catch { storageAvailable=false;toast('Browser storage is unavailable. Changes will last until this page is closed.'); }
    }
    function toast(text) {
        const element=document.getElementById('toast');
        element.textContent=T.t(text);element.hidden=false;
        clearTimeout(toast.timer);toast.timer=setTimeout(()=>{element.hidden=true;},5500);
    }
    function route() {
        const hash=location.hash||'#/welcome';
        if(['#workflow','#roles'].includes(hash))return {page:'welcome',section:hash.slice(1)};
        const parts=hash.replace(/^#\/?/,'').split('?');
        const [role,...segments]=parts[0].split('/');
        const query=Object.fromEntries(new URLSearchParams(parts[1]||''));
        if(role==='welcome'||!role)return {page:'welcome'};
        if(role==='login')return {page:'login'};
        return {page:'workspace',role,path:segments.join('/')||'dashboard',id:query.id,query};
    }
    function permitted(role,path) {
        const permissions=window.DEMO_CONFIG.permissions[role]||[];
        const menus=(window.DEMO_CONFIG.navigation[role]||[]).map(n=>n[1].startsWith('/dashboard/')?'dashboard':n[1].slice(1));
        const extra={'requisitions/view':'pr.read','orders/view':'po.read','orders':'po.read','receipts/view':'receipts.read','receipts':'receipts.read','receipts/new':'receipts.post','invoices/view':'invoices.read','invoices/new':'invoices.manage','vendors':'vendors.read'};
        return menus.includes(path)||Boolean(extra[path]&&permissions.includes(extra[path]));
    }
    function render() {
        T.updateDocument(document);
        if(chart){chart.destroy();chart=null;}
        const r=route();
        if(r.page==='welcome'){
            app.innerHTML=V.welcome();document.title='ProcureSync · '+T.t('Interactive product demo');
            if(r.section)requestAnimationFrame(()=>document.getElementById(r.section)?.scrollIntoView());
            return;
        }
        if(r.page==='login'||!loggedIn){
            app.innerHTML=V.login();document.title=T.t('Enter demo')+' · ProcureSync';return;
        }
        if(!M.roles.includes(r.role)||!permitted(r.role,r.path)){location.hash=V.href(M.roles.includes(r.role)?r.role:'PRODUCTION');toast('This page is available from its own role workspace.');return;}
        try { app.innerHTML=V.shell(state,r.role,r.path,r.id,r.query,flash); }
        catch (error) { app.innerHTML=V.shell(state,r.role,'dashboard',null,{}, {notice:error.message}); }
        document.title=T.t(M.names[r.role])+' · ProcureSync '+T.t('demo');
        const toggle=document.querySelector('[data-toggle-sidebar]');
        toggle?.setAttribute('aria-expanded',String(!document.body.classList.contains('sidebar-collapsed')));
        setupChart(r.role);setupInvoice();
        if(!storageAvailable)toast('Changes are held in memory because browser storage is unavailable.');
    }
    function setupChart(role) {
        const canvas=document.getElementById('status-chart');
        if(!canvas||typeof Chart==='undefined')return;
        let rows=state.prs.filter(p=>!['PRODUCTION','DIVISION_MANAGER'].includes(role)||p.center===(role==='PRODUCTION'?1:2));
        let labels=['Draft','Sourcing','Budget review','Approved','PO issued'],keys=['DRAFT','PENDING_SOURCING','PENDING_BUDGET','APPROVED_FOR_PO','PO_ISSUED'];
        if(role==='WAREHOUSE'){rows=state.orders.map(o=>({status:o.logistics}));labels=['In transit','Partial delivery','Fully received'];keys=['IN_TRANSIT','PARTIAL_DELIVERY','FULLY_RECEIVED'];}
        if(role==='SUPER_ADMIN'){rows=state.users.map(u=>({status:u.role}));labels=M.roles.map(r=>M.names[r]);keys=M.roles;}
        chart=new Chart(canvas,{type:'doughnut',data:{labels:labels.map(label=>T.t(label)),datasets:[{data:keys.map(k=>rows.filter(p=>p.status===k).length),backgroundColor:['#5262e8','#9282ec','#38b8ad','#9eb2fc','#d8deef','#e9b658'],borderWidth:3,borderColor:'#fff',hoverOffset:3}]},options:{responsive:true,maintainAspectRatio:false,cutout:'73%',plugins:{legend:{position:'bottom',labels:{font:{family:'Segoe UI',size:12},color:'#798298',boxWidth:9,padding:15}},tooltip:{enabled:true}},animation:{duration:250}}});
    }
    function setupInvoice(fill=false) {
        const form=document.querySelector('[data-action=createInvoice]');
        if(!form)return;
        const po=M.find(state.orders,form.elements.order.value);
        document.getElementById('invoice-receipt-options').innerHTML=T.render(()=>'<fieldset class="receipt-choices"><legend>Goods receipts from this order</legend>'+state.receipts.filter(r=>r.order===po.id).map(r=>'<label class="check-label"><input type="checkbox" name="receipts" value="'+r.id+'" checked>'+V.e(r.number)+' · '+V.e(r.actor)+'</label>').join('')+'</fieldset>');
        const raw=document.getElementById('invoice-raw');
        if(fill||!raw.value)raw.value=po.lines.map(l=>{
            const intact=M.totalsReceived(state,po.id,l.item).good;
            return M.find(state.catalog,l.item).sku+' | '+V.qty(intact)+' | '+(l.price/100).toFixed(2);
        }).join('\n');
    }
    function formData(form) {
        const data=Object.fromEntries(new FormData(form));
        if(form.dataset.id)data.id=form.dataset.id;
        for(const key of ['ids','receipts'])if(form.querySelector('[name="'+key+'"]'))data[key]=[...form.querySelectorAll('[name="'+key+'"]:checked')].map(i=>i.value);
        const rows=[...form.querySelectorAll('[data-line]')];
        if(rows.length)data.lines=rows.map(row=>{
            const result={item:row.dataset.item};
            for(const field of row.querySelectorAll('[data-field]'))result[field.dataset.field]=field.value;
            return result;
        });
        return data;
    }
    app.addEventListener('submit',event=>{
        const form=event.target;
        if(form.id==='demo-login-form') {
            event.preventDefault();
            if(form.elements.password.value!=='ExploreProcure!2026') {
                const error=form.querySelector('.form-error');error.textContent=T.t('Use the demo password shown below.');error.hidden=false;return;
            }
            loggedIn=true;
            try {sessionStorage.setItem(SESSION,'open');}catch {storageAvailable=false;}
            persist();location.hash=V.href('PRODUCTION');render();return;
        }
        if(!form.dataset.action)return;
        event.preventDefault();
        const error=form.querySelector('.form-error');error.hidden=true;
        try {
            const r=route(),result=M.transition(state,r.role,form.dataset.action,formData(form));
            state=result.state;flash={notice:result.notice,destination:result.destination};persist();
            if(['createPr','updatePr','copyPr'].includes(form.dataset.action)) {
                location.hash=V.href(r.role,'requisitions/view',result.recordId);
            } else if(form.dataset.action==='createInvoice') {
                location.hash=V.href('FINANCE','invoices/view',result.recordId);
            } else if(form.dataset.action==='receive') {
                location.hash=V.href('WAREHOUSE','receipts/view',M.next(state.receipts)-1);
            }
            render();document.getElementById('main-content')?.focus({preventScroll:true});
        } catch(err) {error.textContent=T.t(err.message);error.hidden=false;error.scrollIntoView({block:'nearest',behavior:'smooth'});}
    });
    app.addEventListener('click',event=>{
        const button=event.target.closest('button,a');
        if(!button)return;
        if(button.matches('[data-use-password]')){document.querySelector('#demo-login-form [name=password]').value='ExploreProcure!2026';return;}
        if(button.matches('[data-toggle-sidebar]')){document.body.classList.toggle('sidebar-collapsed');button.setAttribute('aria-expanded',String(!document.body.classList.contains('sidebar-collapsed')));}
        if(button.matches('[data-restart]'))document.getElementById('confirm-dialog').showModal();
        if(button.matches('[data-logout]')){
            loggedIn=false;try{sessionStorage.removeItem(SESSION);}catch{}
            flash=null;location.hash='#/welcome';render();
        }
        if(button.matches('[data-add-line]'))button.closest('form').querySelector('[data-lines]').insertAdjacentHTML('beforeend',V.lineRow(state,{item:state.catalog.find(i=>i.active).id,qty:1000,price:0}));
        if(button.matches('[data-remove-line]')){const row=button.closest('[data-line]');if(row.parentElement.children.length>1)row.remove();else toast('Keep at least one requisition item.');}
        if(button.matches('[data-fill-transcript]'))setupInvoice(true);
        if(button.matches('[data-print]'))window.print();
    });
    function switchLanguage(locale) {
        const scroll=window.scrollY;
        const forms=[...app.querySelectorAll('form')].map(form=>({
            action:form.dataset.action||form.id,
            id:form.dataset.id||'',
            fields:[...form.querySelectorAll('input,select,textarea')].map(field=>({value:field.value,checked:field.checked})),
            rows:[...form.querySelectorAll('[data-line]')].map(row=>({
                item:Number(row.querySelector('[data-field=item]')?.value||row.dataset.item),
                qty:1000,price:0
            }))
        }));
        const details=[...app.querySelectorAll('details')].map(detail=>detail.open);
        T.setLocale(locale);
        render();
        for(const draft of forms) {
            const form=[...app.querySelectorAll('form')].find(form=>(form.dataset.action||form.id)===draft.action&&(form.dataset.id||'')===draft.id);
            if(!form)continue;
            const lines=form.querySelector('[data-lines]');
            if(lines&&draft.rows.length) {
                const kind=draft.action==='source'?'source':draft.action==='hitl'?'invoice':'request';
                lines.innerHTML=draft.rows.map(row=>V.lineRow(state,row,kind)).join('');
            }
            // The selected PO determines which receipt checkboxes exist.
            if(draft.action==='createInvoice') {
                const order=draft.fields[0];
                if(order)form.elements.order.value=order.value;
                setupInvoice(true);
            }
            [...form.querySelectorAll('input,select,textarea')].forEach((field,index)=>{
                if(!draft.fields[index])return;
                field.value=draft.fields[index].value;
                if(field.type==='checkbox'||field.type==='radio')field.checked=draft.fields[index].checked;
            });
        }
        [...app.querySelectorAll('details')].forEach((detail,index)=>{detail.open=Boolean(details[index]);});
        document.querySelector('[data-demo-language]')?.focus({preventScroll:true});
        window.scrollTo({top:scroll});
    }
    app.addEventListener('change',event=>{
        if(event.target.matches('[data-demo-language]')){switchLanguage(event.target.value);return;}

        if(event.target.id==='status-filter'){
            flash=null;location.hash=V.href(route().role,'requisitions')+(event.target.value?'?status='+event.target.value:'');return;
        }
        if(event.target.matches('[data-action=createInvoice] [name=order]'))setupInvoice(true);
        if(event.target.matches('[data-field=item]')){
            const row=event.target.closest('[data-line]'),item=M.find(state.catalog,event.target.value);
            row.dataset.item=String(item.id);row.querySelector('[data-unit]').textContent=M.units[item.unit];
            const q=row.querySelector('[data-field=qty]');q.step=item.fractional?'0.001':'1';q.min=q.step;
        }
        if(event.target.matches('[data-action=staff] [name=shift]')){
            const [start,end]=M.shifts[event.target.value],form=event.target.form;
            form.elements.start.value=start;form.elements.end.value=end;
        }
    });
    document.getElementById('confirm-dialog').addEventListener('close',event=>{
        if(event.target.returnValue!=='restart')return;
        state=M.seed();flash=null;persist();location.hash=V.href('PRODUCTION');render();toast('The sample scenario has been restarted.');
    });
    window.addEventListener('hashchange',()=>{
        const r=route();
        if(r.page==='workspace'&&innerWidth<=900)document.body.classList.add('sidebar-collapsed');
        render();
        if(!r.section)window.scrollTo({top:0});
    });
    if(innerWidth<=900)document.body.classList.add('sidebar-collapsed');
    render();
})();
