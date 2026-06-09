#!/usr/bin/env python3
import json, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
REPORT = ROOT / "INDUSTRY_PAGE_AUDIT.md"

REQUIRED_KEYS = ["primary_keyword", "pain_points", "recommended_tools", "benefits"]

def main():
    p = DATA / "industry_clusters.json"
    clusters = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    out = ["# Industry Page Audit", "", f"Generated: {datetime.date.today()}", ""]
    weak = []
    for slug, item in sorted(clusters.items()):
        missing = [k for k in REQUIRED_KEYS if not item.get(k)]
        if missing:
            weak.append((slug, missing))
        out.append(f"## {slug}")
        out.append(f"- Primary keyword: {item.get('primary_keyword', 'MISSING')}")
        out.append(f"- Recommended tools: {', '.join(item.get('recommended_tools', [])) if item.get('recommended_tools') else 'MISSING'}")
        out.append(f"- Missing: {', '.join(missing) if missing else 'None'}")
        out.append("")
    out.append("## Summary")
    out.append(f"Weak industry pages: {len(weak)}")
    REPORT.write_text("\n".join(out), encoding="utf-8")
    print(f"Industry page audit complete. Industries checked: {len(clusters)}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
