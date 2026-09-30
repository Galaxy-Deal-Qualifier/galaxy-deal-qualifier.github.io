# Galaxy Deal Qualifier

A single-page quoting aid for retail consultants: pick a device and every deal it qualifies for is worked out, stacked and totalled, with trade-in, New Galaxy Club, ECO bundles and payment plans.

Not an official Samsung system. Always confirm the final price in POS.

Created by Isaiah Graham & Harsha Parthiban. © 2026 Isaiah Graham & Harsha Parthiban.

## Files

- index.html — website content, catalogue, offer data and application logic.
- styles.css — your supplied website styling.
- logo-theme.css — switches the sidebar logo with the website theme.
- favicon-theme.js — switches the browser tab logo with the website theme.
- logo-light.svg — navy logo for light mode.
- logo-dark.svg — white logo for dark mode.
- .nojekyll — serves the files directly on GitHub Pages.

Keep all files together. No build step or package installation is required.

## Publish on GitHub Pages

Upload the contents of this folder to the folder your GitHub Pages site publishes from. Replace the existing index.html and styles.css. Commit the files and wait for the deployment to finish, then refresh the published website. If the old tab icon remains, close and reopen the tab.

## Use

Select your store, choose a device and variant, choose Standard, Education or SMB pricing, review offers, enable applicable trade-in or bundle options, add items to the quote, and print or copy it.

## Edit

Edit styles.css for appearance and index.html for content, offers and functionality. Preserve existing element IDs and data attributes. Logo switching supports manual light/dark selection and the system theme.

## Automatic Sales Kit updates

The GitHub workflow `.github/workflows/saleskit-sync.yml` checks all nine public Sales Kit category pages every six hours, on changes pushed to main, and on manual runs. It regenerates supported offers and publishes the website through GitHub Pages. GitHub schedules may run later than scheduled.

Education rate, expiry and bulletin updates are automatic while the reviewed device coverage and stacking rules stay the same. Straightforward retail SAVE dollar/percentage offers are imported when their model, start/end dates, amount and Education/SMB exclusions are explicit. Historical changelog entries are ignored. Unrecognised mappings and changes to complex sections produce visible review warnings. Trade-in, MBO, voucher, loyalty, accessories and SMB rules require a reviewed update when their coverage or conditions change.

The current Education offers were verified against bulletin A260006390: 20% off, ending 2 November 2026. Offer dates are inclusive and read as Australian day/month/year dates.

The updater fails without deploying if a source cannot be fetched or core Education validation fails. The previous published site stays online. The website shows the actual check date and warns when the check is older than 24 hours. Offers still expire normally; the updater never extends an offer by guessing. Reload the site to use a newly deployed offer set.

The workflow publishes updated files without committing them back to the repository. A successful run's website artifact and saleskit-sync-status.json record that run's result. scripts/saleskit-baseline.json contains the reviewed Education coverage and source fingerprints; update it only after reviewing changed source rules.

## Enable the workflow on GitHub

1. Upload all project files to the repository root on main, including the hidden .github directory and the scripts directory. Keep the workflow at .github/workflows/saleskit-sync.yml.
2. Open repository Settings → Pages and set Source to GitHub Actions.
3. Open Actions → Sync Sales Kit and publish website → Run workflow.
4. Confirm the sync, tests and deployment all succeed. Check the published site's check date and Education pricing.

The generated package targets the root/main layout of https://github.com/Galaxy-Deal-Qualifier/galaxy-deal-qualifier.github.io. If another workflow already deploys Pages, replace or disable it to avoid competing deployments. No credentials for the public Sales Kit or third-party proxy are required. Repository restrictions may require an administrator to enable Pages deployment permissions.

## Validate locally

Run `python3 -m unittest discover -s scripts -p 'test_*.py'`, then `python3 scripts/sync_saleskit.py`, then `node scripts/test_pricing.cjs`. Python 3.9+ and Node are used by the update/tests; visitors need only a browser. All parser dependencies are from the Python standard library.

## Release history

Version 1.0 was released on 12 August 2026 with basic device pricing only. See What's New in the website for later releases.

## Validation

Check pricing, eligibility, trade-in, bundles, printing, narrow-screen layout and both themes after changes. This package is the website with theme-aware logos; it does not include PWA installation or offline caching.
