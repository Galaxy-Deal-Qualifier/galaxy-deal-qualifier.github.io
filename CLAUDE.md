# Instructions for Claude updates

Read VERSIONING.md before changing this repository.

Automatic updates of prices, promos, offer dates, eligibility data, bulletin codes, trade-in values or product/accessory catalogue data are data maintenance, not app releases.

For these updates:
- Do not bump the app version in the HTML header, stylesheet URL or any release metadata.
- Do not add a CHANGELOG entry. Do not change the latest app release.
- Do not mark any data-only entry with `type: "app"`.
- Update only the relevant data and freshness dates; Sales Kit handles deal notifications.

Only a real feature, bug fix, design change or change in application behavior may create an app release. Its CHANGELOG entry must explicitly include `type: "app"`. Entries with `type: "data"` or no type are excluded from What's New and the notification dot. Keep this filtering in place during every automatic update.

Historical data entries are retained internally for reference and remain hidden; do not reclassify them as app releases. Keep existing version numbers rather than renumbering history.
