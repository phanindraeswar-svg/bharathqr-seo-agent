#!/usr/bin/env python3
import json, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
REPORT = ROOT / "FAQ_OPTIMIZATION_REPORT.md"

def load(name):
    p = DATA / name
    if not p.exists(): return {}
    return json.loads(p.read_text(encoding="utf-8"))

def main():
    faq = load("faq_expansion.json")
    tool_clusters = load("tool_clusters.json")
    out = ["# FAQ Optimization Report", "", f"Generated: {datetime.date.today()}", ""]
    out.append("## Coverage")
    missing = []
    for slug in sorted(tool_clusters.keys() if isinstance(tool_clusters, dict) else []):
        count = len(faq.get(slug, [])) if isinstance(faq, dict) else 0
        out.append(f"- `{slug}`: {count} FAQ entries")
        if count < 5:
            missing.append(slug)
    out.append("")
    out.append("## Recommended FAQ pattern")
    out.extend([
        "- How to create/generate this QR code?",
        "- Is it free?",
        "- Can I print it?",
        "- Which apps does it support?",
        "- Is it safe for business use?",
        "- Does it work for restaurants, shops, hotels, clinics or salons?"
    ])
    out.append("")
    out.append(f"Tools needing more FAQs: {', '.join(missing) if missing else 'None'}")
    REPORT.write_text("\n".join(out), encoding="utf-8")
    print("FAQ gap detector complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
