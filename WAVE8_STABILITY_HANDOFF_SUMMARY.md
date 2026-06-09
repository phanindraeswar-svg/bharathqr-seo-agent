# Wave 8 — Stability + Handoff Summary

This wave did not add product scope. It added safety and handoff tools so the founder can deploy with less manual confusion.

## Added

- `scripts/sitemap_route_consistency.py`
- `scripts/release_readiness_score.py`
- `BEGINNER_DEPLOYMENT_GUIDE.md`
- `ROLLBACK_PLAN.md`
- Updated `package.json` scripts:
  - `npm run route-consistency`
  - `npm run release-score`
  - stronger `npm run prelaunch`

## Why

The project now has many generated routes and cluster databases. The new checks make sure dynamic route templates, cluster slugs, route inventory, and launch reports stay aligned before deployment.

## Recommended founder action

Run:

```bash
npm install
npm run prelaunch
npm run build
```

Then push and let Vercel deploy once.
