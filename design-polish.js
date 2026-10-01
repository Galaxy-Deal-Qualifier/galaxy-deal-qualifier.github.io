(() => {
 const body=document.body;
 const svg=paths=>`<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths}</svg></span>`;
 const rail=svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M14 9l-3 3 3 3"/>');
 const controls=document.createElement('div');controls.className='design-controls';
 controls.innerHTML=`<button id="sidebar-collapse" type="button" aria-pressed="false" aria-label="Collapse sidebar" title="Collapse sidebar">${rail}</button>`;
 document.querySelector('.side-brand').append(controls);
 body.classList.remove('compact-view');
 try{localStorage.removeItem('gdCompactView')}catch(e){}
 const collapse=controls.querySelector('#sidebar-collapse');
 function apply(){
  collapse.setAttribute('aria-pressed',body.classList.contains('sidebar-collapsed'));
  collapse.setAttribute('aria-label',body.classList.contains('sidebar-collapsed')?'Expand sidebar':'Collapse sidebar');collapse.title=collapse.getAttribute('aria-label');
 }
 for(const [button,cls,key] of [[collapse,'sidebar-collapsed','gdSidebarCollapsed']]){
  try{body.classList.toggle(cls,localStorage.getItem(key)==='true')}catch(e){}
  button.addEventListener('click',()=>{body.classList.toggle(cls);try{localStorage.setItem(key,body.classList.contains(cls))}catch(e){}apply()});
 }
 apply();
 const tabs=Array.from(document.querySelectorAll('.side .tab[data-panel]'));
 tabs.forEach(tab=>{tab.title=tab.textContent.trim();tab.setAttribute('aria-label',tab.textContent.trim())});
 const nav=document.createElement('nav');nav.className='mobile-nav';nav.setAttribute('aria-label','Mobile navigation');
 for(const [panel,label] of [['quote','Quote'],['builder','Builder'],['compare','Compare'],['saleskit','Sales Kit']]){
  const original=tabs.find(t=>t.dataset.panel===panel);if(!original)continue;
  const button=document.createElement('button');button.type='button';button.dataset.destination=panel;
  button.innerHTML=original.querySelector('.ico').outerHTML+'<span>'+label+'</span>';
  button.addEventListener('click',()=>original.click());nav.append(button);
 }
 const more=document.createElement('button');more.type='button';more.innerHTML=svg('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>')+'<span>More</span>';more.setAttribute('aria-expanded','false');
 function closeMenu(){body.classList.remove('mobile-menu-open');more.setAttribute('aria-expanded','false')}
 more.addEventListener('click',()=>{const open=body.classList.toggle('mobile-menu-open');more.setAttribute('aria-expanded',open)});nav.append(more);body.append(nav);
 function syncNav(){const active=tabs.find(t=>t.getAttribute('aria-selected')==='true')?.dataset.panel;nav.querySelectorAll('[data-destination]').forEach(b=>{if(b.dataset.destination===active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
 tabs.forEach(t=>t.addEventListener('click',()=>{closeMenu();syncNav()}));syncNav();
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 document.addEventListener('click',e=>{if(body.classList.contains('mobile-menu-open')&&!nav.contains(e.target)&&!document.querySelector('.side .tabs').contains(e.target))closeMenu()});
 const receipt=svg('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>');
 function polishEmpty(){document.querySelectorAll('.ledger-empty').forEach(el=>{if(el.dataset.polished)return;el.dataset.polished='true';el.innerHTML=`<div class="empty-art" aria-hidden="true">${receipt}</div><strong>Your quote starts here</strong><p>Choose a device and tailor its deal, then use the Add to quote button above.</p>`})}
 polishEmpty();new MutationObserver(polishEmpty).observe(document.getElementById('ledger-body'),{childList:true});
})();
