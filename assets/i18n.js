/* Centralized presentation-only translation for the static portfolio demo. */
(function (root) {
    'use strict';
    const LOCALE_KEY='procuresync-demo-locale';
    const catalog=root.DEMO_LOCALES||{id:{}};
    let locale='en',depth=0,protectedValues=[];
    try { if(localStorage.getItem(LOCALE_KEY)==='id')locale='id'; } catch {}
    function t(message,params={}) {
        let value=String(message??'');
        if(locale==='id'&&Object.prototype.hasOwnProperty.call(catalog.id,value))value=catalog.id[value];
        for(const [key,replacement] of Object.entries(params))value=value.split('{'+key+'}').join(String(replacement));
        return value;
    }
    function protect(escapedValue) {
        if(!depth)return escapedValue;
        const id=protectedValues.push(String(escapedValue))-1;
        return '\uE000'+id+'\uE001';
    }
    function translateText(value) {
        if(locale==='en')return value;
        return value.split(/(\uE000\d+\uE001)/).map(part=>{
            if(/^\uE000\d+\uE001$/.test(part))return part;
            const trimmed=part.trim();
            if(!trimmed)return part;
            return part.replace(trimmed,t(trimmed));
        }).join('');
    }
    function markup(html) {
        if(locale==='en')return html;
        return html.replace(/(^|>)([^<>]*)(?=<|$)/g,(_,start,text)=>start+translateText(text))
            .replace(/\b(aria-label|placeholder|title|alt)="([^"]*)"/g,(_,name,value)=>name+'="'+translateText(value)+'"');
    }
    function render(builder) {
        const outer=depth===0;
        if(outer)protectedValues=[];
        depth++;
        let html;
        try { html=builder(); } finally { depth--; }
        if(!outer)return html;
        html=markup(html);
        const values=protectedValues;protectedValues=[];
        return html.replace(/\uE000(\d+)\uE001/g,(_,id)=>values[Number(id)]);
    }
    function setLocale(value) {
        if(!['en','id'].includes(value))return;
        locale=value;
        try {localStorage.setItem(LOCALE_KEY,value);} catch {}
    }
    function switcher() {
        return '<label class="language-picker"><span>'+t('Language')+'</span><select data-demo-language aria-label="'+t('Application language')+'"><option value="en" '+(locale==='en'?'selected':'')+'>English</option><option value="id" '+(locale==='id'?'selected':'')+'>Bahasa Indonesia</option></select></label>';
    }
    function updateDocument(doc) {
        doc.documentElement.lang=locale;
        for(const element of doc.querySelectorAll('[data-i18n]'))element.textContent=t(element.dataset.i18n);
    }
    root.DemoI18n={t,protect,render,markup,setLocale,locale:()=>locale,switcher,updateDocument};
})(typeof window==='undefined'?globalThis:window);
