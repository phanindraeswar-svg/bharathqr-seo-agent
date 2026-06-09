# BharathQR Final Verification Report

Date: 2026-06-09

This package was verified after merging the current GitHub remote ZIP with the latest deploy candidate.

## Verified checks

- `npm ci --no-audit --fund=false` passed.
- `npm run build` passed.
- Next.js generated 182 pages/routes during build.
- `npm run release-score` reported 100/100.
- `npm run schema-audit` passed.
- `npm run route-consistency` passed.
- JSON files in `data/`, `used_topics.json`, and `seo_updates.json` are valid.
- Python files in `scripts/` compile successfully.
- Dead legacy files are not present.
- `node_modules`, `.next`, and `__pycache__` were removed before packaging.
- No `next export` or `output: export` configuration is active.
- GitHub Actions commit message no longer uses `[Skip CI]`.

## Vercel readiness

- `vercel.json` uses `npm ci --no-audit --fund=false` and `npm run build`.
- Node is pinned to 20 via `.nvmrc`, `.node-version`, and `package.json` engines.
- `next.config.js` includes `experimental.cpus = 1` and `outputFileTracing = false` to reduce deployment instability.

## Deployment note

This ZIP is flattened so that `package.json`, `pages/`, `public/`, `data/`, and `scripts/` are at the ZIP root. Replace the contents of your local repository with these files, not a nested folder.
