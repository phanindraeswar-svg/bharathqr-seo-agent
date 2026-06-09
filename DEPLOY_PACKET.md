# BharathQR Deploy Packet — 2026-06-09

## Deploy Candidate
Use this repository state as the final offline build. Do not add more waves before first production verification.

## Local Commands
```bash
npm ci --no-audit --fund=false
npm run build
npm run prelaunch
```

## Vercel Settings
- Framework: Next.js
- Root Directory: ./
- Install Command: npm ci --no-audit --fund=false
- Build Command: npm run build
- Node: 20.x
- Build cache: uncheck if any install/build issue appears

## Must-Test Live URLs
- /
- /tools
- /tools/url-qr-generator
- /tools/text-qr-generator
- /tools/google-review-qr-generator
- /tools/whatsapp-qr-generator
- /solutions/restaurants
- /solutions/kirana-stores
- /use-cases/accept-payments
- /materials/business-cards
- /comparisons/static-vs-dynamic-qr-code
- /trust/upi-qr-safety
- /cases
- /hi
- /ai-tools
- /sitemap.xml
- /robots.txt

## Success Criteria
- Homepage loads with BharathQR branding.
- Tools generate QR codes and download PNG where applicable.
- No 404 on the listed URLs.
- Sitemap and robots load.
- Vercel production deployment points to the latest GitHub commit.

## After Deploy
1. Submit sitemap in Google Search Console.
2. Inspect top-priority URLs.
3. Wait for indexing/impression data.
4. Use feedback/inbox.md for founder feedback.
5. Do not resume feature waves until live verification is complete.
