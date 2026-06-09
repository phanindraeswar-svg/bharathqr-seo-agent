# Wave 17 — Indexing + Observability Build Summary

Wave 17 adds post-deploy visibility and troubleshooting support. It does not add risky product scope.

## Added

- `data/indexing_watchlist.json`
- `scripts/indexing_watchlist_generator.py`
- `scripts/route_coverage_snapshot.py`
- `scripts/deployment_issue_classifier.py`
- `SEARCH_ENGINE_SUBMISSION_CHECKLIST.md`
- `LIVE_VERIFICATION_MATRIX.md`
- `INDEXING_WATCHLIST.md`
- `ROUTE_COVERAGE_SNAPSHOT.md`

## Purpose

- Prioritize which URLs to verify and submit first.
- Give a clear route coverage summary.
- Help classify common Vercel/GitHub deployment errors.
- Reduce founder manual confusion during launch.

## Recommended next step

Deploy the latest ZIP, verify critical routes, then submit the sitemap and priority URLs from `INDEXING_WATCHLIST.md`.
