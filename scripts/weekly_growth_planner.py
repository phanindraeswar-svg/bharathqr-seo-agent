#!/usr/bin/env python3
"""Create a simple weekly growth plan from available BharathQR data files."""
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
    tools = load_json('data/tool_clusters.json', {})
    industries = load_json('data/industry_clusters.json', {})
    use_cases = load_json('data/use_case_clusters.json', {})
    keywords = load_json('data/keyword_ownership_registry.json', {})
    opps = load_json('data/opportunities.json', [])
    if isinstance(opps, dict):
        opps = opps.get('opportunities', [])

    lines = [f"# BharathQR Weekly Growth Plan — {date.today()}", "", "Focus: do fewer things, but make them compound.", "", "## This week's priorities", "1. Verify top live routes and tools on mobile.", "2. Submit sitemap and top priority URLs in Search Console.", "3. Review latest SEO agent post quality using founder inbox.", "4. Improve the highest commercial-intent page with weak content.", "5. Add internal links from new pages to UPI QR, Google Review QR, WhatsApp QR, and Menu QR.", "", "## Top content clusters to protect", "- UPI QR for shops, kirana stores, retail stores, and payments.", "- Google Review QR for restaurants, salons, clinics, and hotels.", "- WhatsApp QR / WhatsApp link for business contact and orders.", "- Menu QR for restaurants, cafes, hotels, and table tents.", "", "## Site inventory", f"- Tool clusters: {len(tools) if isinstance(tools, dict) else 'n/a'}", f"- Industry clusters: {len(industries) if isinstance(industries, dict) else 'n/a'}", f"- Use-case clusters: {len(use_cases) if isinstance(use_cases, dict) else 'n/a'}", f"- Keyword ownership entries: {len(keywords) if isinstance(keywords, dict) else 'n/a'}", f"- Open opportunities: {len(opps)}", "", "## Top opportunities",]
    for o in sorted(opps, key=lambda x: x.get('priority_score', x.get('confidence', 0)), reverse=True)[:10]:
        lines.append(f"- {o.get('opportunity') or o.get('keyword') or o.get('tool','Opportunity')} — score {o.get('priority_score', o.get('confidence','n/a'))}")
    if not opps:
        lines.append("- No opportunity records yet; SEO agent will populate after competitor/search runs.")
    lines += ["", "## Stop doing", "- Do not add accounts, dashboards, dynamic QR, payments, or complex AI before launch data.", "- Do not publish generic blogs that do not map to a tool, solution, use case, material, trust, or comparison page.", ""]
    (ROOT / 'WEEKLY_GROWTH_PLAN.md').write_text('\n'.join(lines), encoding='utf-8')
    print('Weekly growth plan generated: WEEKLY_GROWTH_PLAN.md')

if __name__ == '__main__':
    main()
