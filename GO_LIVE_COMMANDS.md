# BharathQR Go-Live Commands

Use these commands after replacing your local repo with the final ZIP.

## 1. Install cleanly

```bash
npm ci --no-audit --fund=false
```

## 2. Run local validation

```bash
npm run prelaunch
npm run build
npm run release-score
```

## 3. Commit and push

```bash
git add .
git commit -m "Launch BharathQR commercial intent platform"
git push origin main
```

## 4. Vercel deployment

In Vercel, redeploy with build cache disabled if the first deployment uses old cache.

## 5. After deployment, run live smoke audit

```bash
RUN_LIVE_CHECKS=true BASE_URL=https://bharathqr.com npm run live-seo-smoke
```

## 6. Submit to search engines

- Google Search Console: submit `https://bharathqr.com/sitemap.xml`
- Bing Webmaster Tools: submit sitemap
- Inspect priority URLs from `INDEXING_WATCHLIST.md`

