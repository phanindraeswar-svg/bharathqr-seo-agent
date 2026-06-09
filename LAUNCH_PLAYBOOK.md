# BharathQR Launch Playbook — 14-Day Sprint

## Launch goal
Launch BharathQR as India’s AI-powered QR and business growth platform with a commercial-intent architecture, not just a QR generator.

## Core launch assets
- Tools: UPI QR, Google Review QR, WhatsApp QR, WiFi QR, URL QR, Text QR, vCard QR, Menu QR.
- Solutions: restaurants, hotels, retail stores, clinics, salons.
- Use Cases: accept payments, collect reviews, open WhatsApp chat, share digital menu.
- Trust: QR safety, UPI QR safety, how to verify UPI payment.
- Materials: business cards, brochures, posters, shop counter.
- Comparisons: static vs dynamic QR, WhatsApp QR vs WhatsApp link, UPI QR vs cash.
- Hindi MVP and AI business foundation pages are included as early SEO seeds.

## Founder workflow
You only edit `feedback/inbox.md` in plain English. Examples:

- Blogs are still too generic. Make them shorter and more practical.
- I like QRCodePro’s tool-to-use-case structure.
- Add more Google Pay, PhonePe, WhatsApp and Google Maps keywords naturally.
- This post feels robotic. Use real shopkeeper examples.

The agent converts that into style preferences and future content rules.

## Deploy discipline
Do not deploy every small change. Use one large deployment after local validation passes.

## Validation before push
Run:

```bash
npm install
npm run build
python scripts/validate_content.py
python scripts/route_audit.py
python scripts/internal_link_audit.py
python scripts/content_quality_score.py
```

## Post-launch checks
Open these routes after deploy:

- `/`
- `/tools`
- `/solutions`
- `/solutions/restaurants`
- `/use-cases/accept-payments`
- `/materials/shop-counter`
- `/trust/how-to-verify-upi-payment`
- `/comparisons/upi-qr-vs-cash`
- `/cases`
- `/sitemap.xml`
- `/robots.txt`

## What to delay
Dynamic QR, accounts, login, database, payment system, dashboards, advanced analytics, full AI generation and heavy logo QR builder.
