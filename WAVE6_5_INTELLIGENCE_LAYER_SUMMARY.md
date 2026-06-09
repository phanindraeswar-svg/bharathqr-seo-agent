# Wave 6.5 Intelligence Layer Summary

This wave adds the final offline intelligence layer before live verification.

## Added

### Founder Feedback V3
- `feedback/preferences.json`
- Stronger `scripts/founder_feedback_agent.py`
- Plain-English founder notes can now update:
  - likes
  - dislikes
  - banned phrases
  - reference sites
  - priority tools
  - priority industries
  - priority intents
  - backlog tasks
  - opportunity records

### Content Scoring V2
- `scripts/content_quality_score.py` now scores:
  - Commercial Intent
  - Founder Alignment
  - Keyword Coverage
  - Readability
  - Trust Signals
- Output:
  - `reports/content-quality-score-v2.json`
  - `reports/content-quality-score-v2.md`

### Opportunity Engine
- `data/opportunities.json`
- `scripts/opportunity_engine.py`
- Tracks:
  - competitor/reference
  - tool
  - industry
  - opportunity
  - confidence
  - priority score
  - status

### SEO Agent Integration
- `scripts/seo_agent.py` now reads:
  - `data/style_preferences.json`
  - `feedback/preferences.json`
  - `data/opportunities.json`
- Generated blogs are checked against founder/content rules before saving.
- If a draft fails, the agent regenerates once.

## Founder workflow

Only edit:

```text
feedback/inbox.md
```

Examples:

```text
I like this page: /solutions/restaurants
I hate this blog because it sounds robotic.
Copy this style: https://www.qrcodepro.in/blog/how-to-create-upi-qr-code-for-business
Use shorter paragraphs.
Prioritize Google Review QR for restaurants.
```

The agent processes it during the next GitHub Action run.
