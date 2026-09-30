// PNG favicons work in browsers that do not support SVG tab icons.
(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const scriptUrl = document.currentScript?.src || document.baseURI;
  function updateIcon() {
    const theme = root.dataset.theme;
    const dark = theme === 'dark' || (theme !== 'light' && systemTheme.matches);
    let icon = document.getElementById('site-favicon');
    if (!icon) {
      icon = document.createElement('link');
      icon.id = 'site-favicon';
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.type = 'image/png';
    icon.setAttribute('sizes', '64x64');
    icon.href = new URL(`favicon-${dark ? 'dark' : 'light'}.png?v=2`, scriptUrl).href;
  }
  new MutationObserver(updateIcon).observe(root, {attributes:true,attributeFilter:['data-theme']});
  if (systemTheme.addEventListener) systemTheme.addEventListener('change', updateIcon);
  else systemTheme.addListener(updateIcon);
  updateIcon();
})();
