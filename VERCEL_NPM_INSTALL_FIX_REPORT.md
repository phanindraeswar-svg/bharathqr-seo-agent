# Vercel npm install fix

## Issue observed
Vercel failed during dependency installation with:

`npm error Exit handler never called!`

The deployment log showed Vercel was still running:

`npm ci --no-audit --fund=false`

because `vercel.json` defined that install command.

## Fix applied
Updated `vercel.json` to use a more tolerant install command:

`npm install --legacy-peer-deps --no-audit --fund=false`

This matches the `.npmrc` peer-dependency stability settings and avoids Vercel's strict `npm ci` path that was crashing.

## Verified locally in this environment
- `npm install --legacy-peer-deps --no-audit --fund=false` passed
- `NEXT_TELEMETRY_DISABLED=1 CI=1 npm run build` passed
- `npm run release-score` returned 100/100
- `npm run schema-audit` passed
- `npm run route-consistency` passed
- `npm run meta-audit` passed with 0 issues

## Vercel settings to use
- Framework Preset: Next.js
- Root Directory: ./
- Node.js Version: 20.x
- Use existing Build Cache: unchecked on next redeploy
- Use project's Ignore Build Step: unchecked for manual redeploy
