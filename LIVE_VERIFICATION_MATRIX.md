# Live Verification Matrix

After deployment, test these groups. If any critical route fails, fix before submitting sitemap.

## Critical

- `/`
- `/tools`
- `/tools/upi-qr-generator` or homepage UPI QR section
- `/tools/google-review-qr-generator`
- `/tools/url-qr-generator`
- `/tools/text-qr-generator`
- `/solutions/restaurants`
- `/use-cases/accept-payments`
- `/trust/upi-qr-safety`
- `/sitemap.xml`
- `/robots.txt`

## Important

- `/cases`
- `/materials/business-cards`
- `/comparisons/static-vs-dynamic-qr-code`
- `/templates/upi-qr-standee`
- `/hi`
- `/ai-tools`

## Tool behavior checks

For every QR tool:

1. Page loads on mobile width.
2. Input is readable.
3. Generate button works.
4. QR preview appears.
5. Download button works.
6. No login/database/payment is required.

## Production deployment checks

1. Vercel latest commit matches GitHub main.
2. Production domain is assigned.
3. No old deployment is promoted.
4. No `[Skip CI]` commit prevents deployment.
5. Build cache was cleared if install/build failed earlier.
