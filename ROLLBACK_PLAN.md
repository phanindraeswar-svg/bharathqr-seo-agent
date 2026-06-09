# BharathQR Rollback Plan

## If GitHub push is wrong
Use GitHub Desktop or Git:

```bash
git log --oneline -5
git revert <bad_commit_hash>
git push origin main
```

## If Vercel deployment is wrong
Go to Vercel → Project → Deployments → pick previous working deployment → Promote to Production.

## If local folder is broken
Delete the modified local folder and restore from your backup folder.

## If SEO agent commits conflict
The workflow uses pull/rebase safeguards, but if it fails, rerun after your manual deploy is complete.
