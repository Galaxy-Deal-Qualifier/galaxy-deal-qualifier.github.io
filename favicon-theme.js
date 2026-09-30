// Keep the browser tab logo aligned with the website theme.
(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  // Replace existing favicon declarations so browsers have one clear choice.
  document.querySelectorAll('link[rel~="icon"]').forEach(link => link.remove());
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/svg+xml';
  document.head.appendChild(icon);
  const scriptUrl = document.currentScript && document.currentScript.src;
  const assetBase = scriptUrl || document.baseURI;
  function updateIcon() {
    const theme = root.dataset.theme;
    const dark = theme === 'dark' || (theme !== 'light' && systemTheme.matches);
    icon.href = new URL(dark ? 'logo-dark.svg' : 'logo-light.svg', assetBase).href;
  }
  new MutationObserver(updateIcon).observe(root, {
    attributes: true, attributeFilter: ['data-theme']
  });
  systemTheme.addEventListener('change', updateIcon);
  updateIcon();
})();
