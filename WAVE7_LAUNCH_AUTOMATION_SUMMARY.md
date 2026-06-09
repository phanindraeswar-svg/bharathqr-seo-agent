# BharathQR Wave 7 — Launch Automation + Verification Layer

Wave 7 adds the final operational safety layer before deployment.

## Added

- `scripts/final_launch_audit.py` — checks required files, cluster JSON, route data, old branding, robots/sitemap basics.
- `scripts/live_route_check.py` — optional post-deploy route checker using `SITE_URL=https://bharathqr.com`.
- `.env.example` — documents required/optional environment variables.
- Package scripts:
  - `npm run final-audit`
  - `npm run live-check`
  - `npm run prelaunch`
- GitHub Actions now runs `final_launch_audit.py` during validation.

## Why this matters

The website now has many routes and data-driven pages. Wave 7 reduces launch risk by checking that the repo contains the expected architecture before you deploy.

## Recommended before deploy

```bash
npm install
npm run prelaunch
npm run build
```

After deploy:

```bash
SITE_URL=https://bharathqr.com npm run live-check
```
