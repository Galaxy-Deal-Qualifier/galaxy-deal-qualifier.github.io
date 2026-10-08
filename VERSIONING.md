# Galaxy Deals version policy

Create a new app version and What's New entry only for features, bug fixes, layout or design changes, or changes to how the app works.

Price-list maintenance and promotion maintenance do not create versions. This includes new or changed promo amounts, dates, eligibility data, bulletin codes, regular prices, trade-in values, and product or accessory catalogue data.

For data-only updates:
- Update the relevant prices or offers and their freshness dates.
- Keep the app version, CHANGELOG and latest-version notification unchanged.
- Use Sales Kit for new-deal, finished-deal and expiry notifications.

For mixed releases, describe only the feature, fix or design change in What's New. Historical entries keep their original numbering. Data-only history is tagged `type: "data"` and hidden from What's New. Genuine app releases must use `type: "app"`; unclassified entries are hidden by default. The latest-version dot uses only the filtered app releases. See CLAUDE.md for automatic-update instructions.

Major Galaxy Deals feature additions, behavior changes, significant fixes and design changes must be added to What's New with a new app version and an explicit `type: "app"` entry. Describe the final customer-visible changes. Price and promotion data maintenance remains excluded.
