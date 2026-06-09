# Deployment Runtime Fix

This build pins BharathQR deployment to Node.js 20 because Next.js 14 is most stable on Node 20 in Vercel-style builds.

Files added/updated:

- `package.json` engines: `node: 20.x`
- `.nvmrc`: `20`
- `.node-version`: `20`
- `vercel.json`: uses `npm ci --no-audit --fund=false` and `npm run build`
- `next`: upgraded to `14.2.35` within the Next.js 14 line

Why this matters:

- Avoids local/Vercel mismatch from newer Node runtimes.
- Makes dependency install deterministic with `package-lock.json`.
- Disables telemetry during build.
- Keeps Pages Router and Vercel compatibility.

Before deployment, run:

```bash
npm ci
npm run prelaunch
npm run build
```

If using GitHub/Vercel only, push this repo and redeploy without existing build cache once.
