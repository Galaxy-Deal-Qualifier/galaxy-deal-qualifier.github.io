const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
const promos=JSON.parse(html.match(/const PROMOS = (\[.*?\]);/)[1]);
const devices=JSON.parse(html.match(/const DEVICES = (\[.*?\]);/)[1]);
const engine=html.slice(html.indexOf('  function pricingFor('),html.indexOf('  // ---- DOM refs ----'));
function priceAt(today,m,v,p,mode,promoData=promos){
 const context={promos:promoData,today,curated:()=>[],mboFor:()=>null,cartHasQualifier:()=>false,dedupePromos:list=>list};
 vm.createContext(context);
 vm.runInContext(`function promosFor(m,v){return promos.filter(o=>(!o.start||today>=o.start)&&(!o.end||today<=o.end)&&(o.targets.includes('model:'+m)||o.targets.includes('variant:'+m+':'+encodeURIComponent(v))));}\n${engine}`,context);
 return context.pricingFor(m,v,p,mode,{});
}
const education=promos.find(o=>o.kind==='education'&&o.targets.includes('model:m1'));
const end=education.end||'2026-10-23';
for(const d of devices){
 const matching=promos.find(o=>o.kind==='education'&&o.targets.includes('model:'+d.m));
 if(!matching)continue;
 const q=priceAt(end,d.m,d.v,d.p,'edu');
 assert(Math.abs(q.subtotal-d.p*(1-matching.value/100))<1e-6,`${d.n}: Education total incorrect`);
}
const sample=devices.find(d=>d.m==='m1'&&d.v==='256GB');
const expired=new Date(end+'T12:00:00Z'); expired.setUTCDate(expired.getUTCDate()+1);
const expiryFixture=promos.map(o=>o===education?{...o,end}:o);
assert.equal(priceAt(expired.toISOString().slice(0,10),'m1','256GB',sample.p,'edu',expiryFixture).subtotal,sample.p);
for(const o of promos.filter(o=>o.id.startsWith('synced-')&&o.kind==='retail')){
 const d=devices.find(d=>o.targets.includes('model:'+d.m));
 const before=new Date(o.start+'T12:00:00Z');before.setUTCDate(before.getUTCDate()-1);
 const q=priceAt(before.toISOString().slice(0,10),d.m,d.v,d.p,'none');
 assert(!q.lines.some(l=>l.name===o.name&&l.end===o.end),'Retail offer applied before its start date');
 const edu=priceAt(o.start,d.m,d.v,d.p,'edu');
 assert(!edu.lines.some(l=>l.name===o.name&&l.end===o.end),'Excluded retail offer stacked with Education');
}
for(const d of devices.filter(d=>d.m==='m25'||d.m==='m33')){
 for(const today of ['2026-10-23','2027-01-01']){
  const q=priceAt(today,d.m,d.v,d.p,'none');
  assert.equal(q.subtotal,d.p*0.5,`${d.n} ${d.v}: clearance total incorrect`);
  assert.equal(q.lines.filter(l=>/END OF LIFE/.test(l.name)).length,1,'Clearance must apply exactly once');
  const edu=priceAt(today,d.m,d.v,d.p,'edu');
  assert(!edu.lines.some(l=>/END OF LIFE/.test(l.name)),'Clearance stacked with Education');
 }
}
assert(/CLASSIC/.test(promos.find(o=>o.id==='saleskit_eol_watch8').name),'Classic must be named in the clearance offer');
console.log('Pricing checks passed: Education rates, retail exclusions, start dates, expiry, Watch8/Classic clearance and JavaScript syntax.');
