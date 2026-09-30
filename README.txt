Upload all six website files from this folder to the root of your existing GitHub repository, replacing matching files:
index.html
logo-theme.css
logo-purple.png
favicon.ico
favicon.png
apple-touch-icon.png

Keep your existing styles.css, offer updater and other project files. This index.html was based on the current published v9.1 site, so it preserves its existing application code.

The corner badge is 36px square with a 24px image centred inside. The original uploaded logo image is preserved. Browser icons use the same logo at standard icon sizes. The HTML no longer loads favicon-theme.js; that old file can remain unused.

After GitHub Pages finishes publishing, close and reopen the tab. The existing published site already returned working favicon files before this patch; an app-specific G fallback may persist if the host browser does not refresh/support custom icons. Check the URL in Safari or Chrome to distinguish this from a website error.

If a GitHub Pages deployment workflow copies specific assets to _site, include logo-purple.png, favicon.ico, favicon.png and apple-touch-icon.png.
