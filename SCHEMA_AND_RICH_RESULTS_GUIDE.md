# BharathQR Schema & Rich Results Guide

Wave 16 adds a conservative schema strategy for BharathQR.

## Rules

- Use schema only when the visible page content supports it.
- Do not add fake reviews, ratings, `AggregateRating`, or review counts.
- Use `SoftwareApplication` for tools.
- Use `FAQPage` only when FAQs are visible on the page.
- Use `HowTo` only when step-by-step instructions are visible.
- Use `BreadcrumbList` for page families such as Tools, Solutions, Use Cases, Materials, Trust, Templates and Comparisons.
- Use `ItemList` for directory/index pages.

## Why this matters

BharathQR now has many commercial-intent pages. Conservative structured data helps search engines understand the tool, solution, use-case, material and trust architecture without risking spammy rich-result signals.

## Check before deploy

Run:

```bash
npm run schema-audit
npm run prelaunch
```
