#!/usr/bin/env python3
"""Generate a very small founder review digest so the founder does not need to inspect every file."""
import json
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]

def load_json(path, default):
    try:
        return json.loads((ROOT / path).read_text(encoding='utf-8'))
    except Exception:
        return default

def main():
    opps = load_json('data/opportunities.json', [])
    refresh = load_json('data/content_refresh_queue.json', [])
    intents = load_json('data/search_intents.json', [])
    watch = load_json('data/indexing_watchlist.json', {})
    review = load_json('data/founder_review_queue.json', {})

    if isinstance(opps, dict):
        opp_items = opps.get('opportunities', [])
    else:
        opp_items = opps
    if isinstance(refresh, dict):
        refresh_items = refresh.get('items', refresh.get('queue', []))
    else:
        refresh_items = refresh
    if isinstance(intents, dict):
        intent_items = intents.get('intents', intents.get('keywords', []))
    else:
        intent_items = intents

    top_opps = sorted(opp_items, key=lambda x: x.get('priority_score', x.get('confidence', 0)), reverse=True)[:5]
    top_refresh = refresh_items[:5]

    lines = [
        f"# BharathQR Founder Review Digest — {date.today()}",
        "",
        "Goal: keep founder review under 10 minutes. Only inspect these items.",
        "",
        "## 1. What to review this week",
    ]
    for item in review.get('review_items', []):
        lines.append(f"- **{item.get('priority','medium').upper()}** — {item.get('item')}: {item.get('action')}")
    lines += ["", "## 2. Top opportunities"]
    if top_opps:
        for o in top_opps:
            name = o.get('opportunity') or o.get('keyword') or o.get('tool') or 'Opportunity'
            score = o.get('priority_score', o.get('confidence', 'n/a'))
            status = o.get('status', 'open')
            lines.append(f"- {name} — score: {score}, status: {status}")
    else:
        lines.append("- No opportunities found yet.")
    lines += ["", "## 3. Refresh queue"]
    if top_refresh:
        for r in top_refresh:
            page = r.get('page') or r.get('url') or r.get('slug') or 'Page'
            priority = r.get('priority', 'medium')
            lines.append(f"- {page} — priority: {priority}")
    else:
        lines.append("- No refresh items yet.")
    lines += ["", "## 4. Search intent coverage snapshot", f"- Search intent records: {len(intent_items)}"]
    if isinstance(watch, dict):
        total = len(watch.get('priority_urls', [])) if isinstance(watch.get('priority_urls', []), list) else len(watch)
        lines.append(f"- Indexing watchlist items: {total}")
    lines += ["", "## 5. Founder inbox suggestions", "Copy one of these into `feedback/inbox.md` if relevant:", "", "```text", "I like the restaurant QR pages. Make future industry pages like this.", "", "The latest blog feels generic. Use more shop/payment/review keywords and shorter paragraphs.", "", "Prioritize UPI QR, Google Review QR, WhatsApp QR, and restaurant use cases this week.", "```", ""]
    (ROOT / 'FOUNDER_REVIEW_DIGEST.md').write_text('\n'.join(lines), encoding='utf-8')
    print('Founder review digest generated: FOUNDER_REVIEW_DIGEST.md')

if __name__ == '__main__':
    main()
