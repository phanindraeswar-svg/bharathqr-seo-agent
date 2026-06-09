# Final Deployment Notes

Use this build as a large offline batch. Deploy only after local checks pass.

## Local checks

```bash
npm install
npm run build
python scripts/validate_content.py
python scripts/route_audit.py
python scripts/internal_link_audit.py
python scripts/content_quality_score.py
```

## First live URLs to test

- /
- /tools
- /tools/google-review-qr-generator
- /tools/url-qr-generator
- /tools/text-qr-generator
- /tools/whatsapp-qr-generator
- /tools/wifi-qr-generator
- /tools/vcard-qr-generator
- /tools/menu-qr-generator
- /tools/event-qr-generator
- /tools/email-qr-generator
- /tools/sms-qr-generator
- /tools/phone-qr-generator
- /tools/pdf-qr-generator
- /solutions/restaurants
- /use-cases/accept-payments
- /materials/business-cards
- /comparisons/static-vs-dynamic-qr-code
- /trust/qr-safety
- /sitemap.xml
- /robots.txt

## Vercel

If install fails with npm internal errors, redeploy with build cache unchecked. `.npmrc` is already included for stability.
