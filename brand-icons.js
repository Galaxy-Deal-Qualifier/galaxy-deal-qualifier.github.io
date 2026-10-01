// The sidebar CSS and browser icons follow manual/system theme settings.
(() => {
  const root=document.documentElement;
  const system=matchMedia('(prefers-color-scheme: dark)');
  const base=document.currentScript?.src || document.baseURI;
  function update(){
    const selected=root.dataset.theme;
    const theme=selected==='dark'||(selected!=='light'&&system.matches)?'dark':'light';
    const icon=document.getElementById('brand-favicon');
    const apple=document.getElementById('brand-apple-icon');
    const manifest=document.getElementById('brand-manifest');
    if(icon)icon.href=new URL(`icon-${theme}-64.png?v=app9`,base).href;
    if(apple)apple.href=new URL(`icon-${theme}-180.png?v=app9`,base).href;
    if(manifest)manifest.href=new URL(`app-${theme}.webmanifest?v=app9`,base).href;
  }
  new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['data-theme']});
  system.addEventListener('change',update);
  update();
})();
