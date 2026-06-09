# Wave 10 — Runtime + Deployment Hardening

This wave focuses on making the project safer to deploy on Vercel and easier to reproduce locally.

## Added / Changed

- Upgraded Next.js within the Next 14 line: `14.2.30` → `14.2.35`.
- Added `engines` in `package.json` to pin deployment/runtime to Node.js 20.
- Added `.nvmrc` with Node 20.
- Added `.node-version` with Node 20.
- Added `vercel.json` with deterministic install/build commands:
  - `npm ci --no-audit --fund=false`
  - `npm run build`
- Disabled Next telemetry in Vercel env.
- Added `DEPLOYMENT_RUNTIME_FIX.md` explaining the runtime/deployment fix.

## Why

Earlier sandbox builds compiled successfully but could hang during final trace/static-generation cleanup under Node 22. Next.js 14 is safer on Node 20, and Vercel can honor `engines.node` / `.nvmrc` during deployment.

## Validation

- `npm run prelaunch` passed.
- JSON validation passed.
- Route audit passed.
- Internal link audit passed.
- Sitemap/route consistency passed.
- Release readiness score remained 100/100.

## Local notes

If you run locally on Windows, use Node 20 if possible:

```bash
node -v
npm ci
npm run prelaunch
npm run build
```

If your laptop has Node 22 installed, Vercel should still deploy using Node 20 because this repo now declares the Node 20 runtime.
