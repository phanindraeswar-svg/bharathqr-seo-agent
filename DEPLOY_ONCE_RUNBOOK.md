# BharathQR Deploy-Once Runbook

Use this when you are ready to deploy the final build.

## 1. Replace local repo

Extract the final ZIP and replace your local repo files.

## 2. Check locally

```bash
npm install
npm run prelaunch
npm run build
```

If all pass, continue.

## 3. Commit and push

```bash
git add .
git commit -m "Launch BharathQR commercial intent platform"
git push origin main
```

Avoid `[Skip CI]` in this commit message.

## 4. Vercel

In Vercel, redeploy without cache if needed:

- Deployments
- Latest deployment
- Redeploy
- Uncheck **Use existing Build Cache**

## 5. Live checks

After deployment:

```bash
SITE_URL=https://bharathqr.com npm run live-check
```

Manually check:

- `/`
- `/tools`
- `/solutions`
- `/use-cases`
- `/materials`
- `/comparisons`
- `/templates`
- `/cases`
- `/trust`
- `/hi`
- `/sitemap.xml`
- `/robots.txt`

## 6. Google Search Console

Submit:

- `https://bharathqr.com/sitemap.xml`
- Inspect homepage
- Inspect `/tools`
- Inspect 2–3 priority tool pages

## 7. Do not keep redeploying every small change

After launch, collect data and use `feedback/inbox.md` for founder feedback.
