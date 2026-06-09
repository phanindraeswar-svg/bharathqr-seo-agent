# Content Refresh Queue

This dashboard tracks pages that should be reviewed after launch using founder feedback, Search Console data, and content quality scores.

## High Priority After Launch

| Page | Reason | Trigger | Status |
|---|---|---|---|
| / | Main UPI QR conversion page | Verify mobile UX, merchant-name optional, Google Pay/PhonePe/Paytm keywords | watch |
| /tools/google-review-qr-generator | High commercial intent | Check indexing, CTR, restaurant/hotel review keywords | watch |
| /solutions/restaurants | Core business solution page | Needs internal links from menu/review/payment content | watch |
| /trust/how-to-verify-upi-payment | India trust query | Update if UPI app flows change | watch |
| /comparisons/static-vs-dynamic-qr-code | Educational evergreen page | Refresh when dynamic QR roadmap changes | watch |

## Refresh Rules

- Refresh if Search Console impressions rise but CTR is low.
- Refresh if founder says a page feels generic, robotic, or weak.
- Refresh if a competitor launches a stronger page for the same use case.
- Refresh if UPI, Google reviews, WhatsApp, or QR safety guidance changes.

## Founder Shortcut

Write plain English in `feedback/inbox.md`, for example:

```text
The restaurant solution page feels generic. Add more Menu QR, Google Review QR and UPI QR examples.
```
