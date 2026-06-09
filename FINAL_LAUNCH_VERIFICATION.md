# BharathQR Final Launch Verification

Use this after deploying the final ZIP to GitHub/Vercel.

## 1. Must-open routes

Open these first:

- https://bharathqr.com/
- https://bharathqr.com/tools
- https://bharathqr.com/solutions
- https://bharathqr.com/use-cases
- https://bharathqr.com/materials
- https://bharathqr.com/comparisons
- https://bharathqr.com/templates
- https://bharathqr.com/cases
- https://bharathqr.com/qr-for
- https://bharathqr.com/trust
- https://bharathqr.com/ai-tools
- https://bharathqr.com/sitemap.xml
- https://bharathqr.com/robots.txt

## 2. Money pages to test

- `/` UPI QR Generator: UPI ID required, merchant name optional, generate + download works.
- `/tools/google-review-qr-generator`: paste a Google review URL, generate + download works.
- `/tools/url-qr-generator`: paste a URL, generate + download works.
- `/tools/text-qr-generator`: enter text, generate + download works.
- `/tools/whatsapp-qr-generator`: enter phone/message, generate + download works.
- `/tools/wifi-qr-generator`: enter WiFi name/password, generate + download works.
- `/tools/vcard-qr-generator`: enter contact info, generate + download works.

## 3. Commercial SEO routes

Check one route from each layer:

- `/solutions/restaurants`
- `/use-cases/accept-payments`
- `/materials/shop-counter`
- `/trust/how-to-verify-upi-payment`
- `/comparisons/upi-qr-vs-cash`
- `/templates/upi-qr-standee`
- `/hi/tools/upi-qr-generator`

## 4. Local commands before push

```bash
npm install
npm run validate
npm run build
```

## 5. Vercel deploy note

If Vercel shows old routes, create one tiny commit without `[Skip CI]`, then redeploy without cache.

## 6. Google Search Console

After deploy succeeds:

- Submit `https://bharathqr.com/sitemap.xml`
- Inspect homepage
- Inspect `/tools`
- Inspect `/solutions/restaurants`
- Inspect `/use-cases/accept-payments`
- Inspect `/trust/how-to-verify-upi-payment`

Do not manually request indexing for hundreds of pages at once.
