#!/usr/bin/env python3
import json, os
from datetime import date
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def load(path, default):
    p=os.path.join(ROOT,path)
    if not os.path.exists(p): return default
    with open(p,encoding="utf-8") as f: return json.load(f)
def write(path, text):
    p=os.path.join(ROOT,path); os.makedirs(os.path.dirname(p),exist_ok=True)
    with open(p,"w",encoding="utf-8") as f: f.write(text)
metrics=load("data/post_launch_metrics.json",{})
kw=load("data/keyword_performance_memory.json",{"keywords":[]})
ops=load("data/opportunities.json",[])
m=metrics.get("metrics",{}); rules=metrics.get("rules",{})
lines=[f"# BharathQR Post-Launch Growth Report — {date.today()}\n",
"## Current Search Metrics\n",
f"- Indexed pages: {m.get('indexed_pages',0)}",
f"- 28-day clicks: {m.get('total_clicks_28d',0)}",
f"- 28-day impressions: {m.get('total_impressions_28d',0)}",
f"- Average CTR: {m.get('average_ctr_28d',0)}",
f"- Average position: {m.get('average_position_28d',0)}\n",
"## Priority URLs\n"]
for url in rules.get("priority_pages",[]): lines.append(f"- {url}")
lines.append("\n## Target Keyword Map\n")
for item in kw.get("keywords",[])[:50]:
    lines.append(f"- **{item.get('keyword')}** → `{item.get('target_url')}` ({item.get('cluster')})")
lines.append("\n## Open Opportunities\n")
open_ops=[o for o in ops if isinstance(o,dict) and o.get("status","open") in ("open","planned","target")]
for o in sorted(open_ops,key=lambda x:x.get("priority_score",0),reverse=True)[:10]:
    lines.append(f"- {o.get('opportunity',o.get('title','Opportunity'))} — score {o.get('priority_score','n/a')}")
if not open_ops: lines.append("- No open opportunities recorded yet.")
lines.append("\n## Recommended Next Actions\n1. Verify production routes and sitemap after deploy.\n2. Submit `/sitemap.xml` in Google Search Console.\n3. After 7 days, update `data/post_launch_metrics.json` with first GSC numbers.\n4. Improve pages with impressions but low CTR before adding new categories.\n")
write("reports/post_launch_growth_report.md","\n".join(lines))
print("Generated reports/post_launch_growth_report.md")
