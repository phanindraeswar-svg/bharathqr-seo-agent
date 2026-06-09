# BharathQR Beginner Deployment Guide

Use this when you are ready to replace your local repo and deploy once.

## 1. Backup first
Copy your current project folder and rename it:

```text
bharathqr-backup-before-wave8
```

## 2. Replace files
Extract this ZIP and copy the extracted project folder into your GitHub local repo location.

## 3. Run local checks
Open terminal inside the project folder:

```bash
npm install
npm run prelaunch
npm run build
```

If all pass, continue.

## 4. Commit and push

```bash
git status
git add .
git commit -m "Launch BharathQR Wave 2 commercial architecture"
git push origin main
```

## 5. Vercel
After GitHub push, wait for Vercel. If it fails during npm install, redeploy without build cache.

## 6. Live verification
After deployment:

```bash
SITE_URL=https://bharathqr.com npm run live-check
```

Also manually open:

- https://bharathqr.com/tools
- https://bharathqr.com/solutions
- https://bharathqr.com/use-cases
- https://bharathqr.com/materials
- https://bharathqr.com/trust
- https://bharathqr.com/cases
- https://bharathqr.com/sitemap.xml
- https://bharathqr.com/robots.txt

## 7. If something breaks
Do not panic. Your old Vercel deployment stays available until the new one is promoted/live. Restore from `bharathqr-backup-before-wave8` if needed.
