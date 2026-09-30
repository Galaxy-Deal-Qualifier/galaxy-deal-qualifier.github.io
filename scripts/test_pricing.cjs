const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
const promos=JSON.parse(html.match(/const PROMOS = (\[.*?\]);/)[1]);
const devices=JSON.parse(html.match(/const DEVICES = (\[.*?\]);/)[1]);
const engine=html.slice(html.indexOf('  function pricingFor('),html.indexOf('  // ---- DOM refs ----'));
function priceAt(today,m,v,p,mode){
 const context={promos,today,curated:()=>[],cartHasQualifier:()=>false,dedupePromos:list=>list};
 vm.createContext(context);
 vm.runInContext(`function promosFor(m,v){return promos.filter(o=>(!o.start||today>=o.start)&&(!o.end||today<=o.end)&&(o.targets.includes('model:'+m)||o.targets.includes('variant:'+m+':'+encodeURIComponent(v))));}\n${engine}`,context);
 return context.pricingFor(m,v,p,mode,{});
}
const end=promos.find(o=>o.id==='synced-edu-mobile').end;
for(const d of devices){
 const matching=promos.find(o=>o.kind==='education'&&o.targets.includes('model:'+d.m));
 if(!matching)continue;
 const q=priceAt(end,d.m,d.v,d.p,'edu');
 assert(Math.abs(q.subtotal-d.p*(1-matching.value/100))<1e-6,`${d.n}: Education total incorrect`);
}
const sample=devices.find(d=>d.m==='m1'&&d.v==='256GB');
const education=promos.find(o=>o.kind==='education'&&o.targets.includes('model:m1'));
const expired=new Date(education.end+'T12:00:00Z'); expired.setUTCDate(expired.getUTCDate()+1);
assert.equal(priceAt(expired.toISOString().slice(0,10),'m1','256GB',sample.p,'edu').subtotal,sample.p);
for(const o of promos.filter(o=>o.id.startsWith('synced-')&&o.kind==='retail')){
 const d=devices.find(d=>o.targets.includes('model:'+d.m));
 const before=new Date(o.start+'T12:00:00Z');before.setUTCDate(before.getUTCDate()-1);
 const q=priceAt(before.toISOString().slice(0,10),d.m,d.v,d.p,'none');
 assert(!q.lines.some(l=>l.name===o.name&&l.end===o.end),'Retail offer applied before its start date');
 const edu=priceAt(o.start,d.m,d.v,d.p,'edu');
 assert(!edu.lines.some(l=>l.name===o.name&&l.end===o.end),'Excluded retail offer stacked with Education');
}
console.log('Pricing checks passed: Education rates, retail exclusions, start dates, expiry and JavaScript syntax.');
