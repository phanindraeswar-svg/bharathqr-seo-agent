# Vercel Credit / Deployment Safety Report

## Fixes Applied

### 1. Added `.gitignore`
Prevents accidental commits of generated dependency/build/secret files:
- `node_modules/`
- `.next/`
- `.env*`
- logs
- Python caches
- local Vercel files

### 2. Replaced social preview image path
`pages/_app.js` now uses:

```html
https://bharathqr.com/og-image.png
```

A 1200x630 PNG file was added at:

```text
public/og-image.png
```

The original SVG can remain for reference, but social platforms should use the PNG.

### 3. Reduced automated Vercel builds from SEO agent
The SEO agent workflow is now weekly instead of daily by default:

```yaml
- cron: '30 20 * * 6'
```

This runs at Sunday 2:00 AM IST.

The SEO agent commit message now includes:

```text
[skip ci]
```

### 4. Added Vercel ignored build guard
Added:

```text
scripts/vercel_ignore_build.sh
```

and wired it in `vercel.json`:

```json
"ignoreCommand": "bash scripts/vercel_ignore_build.sh"
```

This skips Vercel builds when the commit is made by `github-actions[bot]` or contains `[skip ci]`, `[ci skip]`, or `[skip vercel]`.

Important: Vercel may still register an ignored/canceled deployment event, but this avoids full dependency install/build work for automated SEO-agent commits.

### 5. Hardened Vercel build command
`vercel.json` now uses:

```json
"buildCommand": "NEXT_TELEMETRY_DISABLED=1 CI=1 npm run build"
```

This successfully completed the production build during verification.

## Verification Results

- `npm ci --no-audit --fund=false` passed
- `NEXT_TELEMETRY_DISABLED=1 CI=1 npm run build` passed
- Release readiness score: 100/100
- Schema audit passed
- Sitemap/route consistency passed
- Metadata audit passed
- Cannibalization audit passed
- Final launch audit passed
- Final freeze audit passed after removing generated cache folders

## Deployment Guidance

For your first manual deployment of this final ZIP:

1. Replace your repo files with this ZIP.
2. Push with a normal commit message, for example:
   `Final BharathQR deploy candidate`
3. Do not include `[skip ci]` in your manual deployment commit.
4. In Vercel, redeploy with cache disabled for the first deployment.

## GitHub Secret Reminder

Set this in GitHub, not Vercel:

```text
GROQ_API_KEY
```

Vercel does not need the Groq key unless future API routes call Groq at runtime.
