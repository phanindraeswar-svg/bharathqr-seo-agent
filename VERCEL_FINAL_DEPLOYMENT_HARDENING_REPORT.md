# Vercel Final Deployment Hardening Report

This build was checked specifically for the earlier Vercel problems:

- npm install crash (`Exit handler never called`)
- build cache instability
- static generation timeout/hang
- old commit / `[Skip CI]` deployment mismatch
- route/sitemap consistency issues

## Hardening in place

- `.npmrc` disables audit/funding and forces non-offline installs.
- `vercel.json` uses deterministic install/build commands:
  - `npm ci --no-audit --fund=false`
  - `npm run build`
- Node is pinned to Node 20 via `.nvmrc`, `.node-version`, and `package.json` engines.
- Next.js is pinned to `14.2.35`.
- `next.config.js` uses `experimental.cpus = 1` to avoid static generation worker instability.
- Expanded dynamic sections use ISR/on-demand generation to keep Vercel builds lighter.
- GitHub Actions commit message no longer includes `[Skip CI]`, so generated content should not accidentally skip Vercel deployments.
- Local verification completed:
  - `npm ci --no-audit --fund=false`
  - `npm run build`
  - `npm run prelaunch`
  - `npm run release-score`

## Deployment instruction

After pushing to GitHub, deploy on Vercel with build cache disabled for the first deploy:

Project → Deployments → Redeploy → uncheck `Use existing Build Cache`.

After first successful deployment, normal deployments can use cache again.
