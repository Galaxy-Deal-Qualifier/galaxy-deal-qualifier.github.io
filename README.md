# Galaxy Deal Qualifier

A single-page quoting aid for retail consultants: pick a device and every deal it qualifies for is worked out, stacked and totalled, with trade-in, New Galaxy Club, ECO bundles and payment plans.

Not an official Samsung system. Always confirm the final price in POS.

Created by Isaiah Graham & Harsha Parthiban. © 2026 Isaiah Graham & Harsha Parthiban.

## Publish this update

Upload the files inside this folder to your existing GitHub repository root and replace matching files. Do not upload the enclosing folder. Keep your existing scripts folder unchanged; it is intentionally not included in this package.

This package is based on the published v9.2 HTML and CSS. Pricing data and application logic are preserved. The final logo is copied unchanged from the supplied PNG. The sidebar uses a 36px square badge with a 24px centred image. Browser and Apple icons are derived from the same image. Theme colour options are removed; a fixed purple accent and light/dark mode remain.

## Files

- index.html — complete website and application logic.
- styles.css — existing published website styling.
- brand-accent.css — fixed purple accent.
- logo-theme.css — small square logo badge.
- logo.png — final original logo.
- favicon.ico and favicon.png — browser tab icons.
- apple-touch-icon.png — Apple home-screen icon.
- saleskit-sync-status.json — last published sync record, if available.
- .nojekyll — GitHub Pages configuration.

## Deployment workflow

If your existing Pages workflow copies selected files to _site, its copy step must include:

cp index.html styles.css brand-accent.css logo-theme.css logo.png favicon.ico favicon.png apple-touch-icon.png saleskit-sync-status.json .nojekyll _site/

No changes to scripts/sync_saleskit.py, scripts/saleskit-baseline.json or either test file are needed for this logo update. Scheduled sync still requires the GitHub workflow to be present and enabled.

## Old logo files

After this HTML is deployed, it no longer needs logo-light.svg, logo-dark.svg, logo-purple.png, favicon-light.png, favicon-dark.png or favicon-theme.js. Remove references to those files from a deployment workflow before deleting them.

## Check after publishing

Wait for deployment, reload the page and close/reopen the tab. Browser or host-app favicon caches may refresh separately. Check light/dark mode, device pricing, quoting and print preview. This package does not add PWA installation support.
