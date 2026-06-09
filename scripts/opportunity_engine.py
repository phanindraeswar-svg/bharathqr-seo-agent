import json
from pathlib import Path
import datetime

ROOT = Path('.')
DATA = ROOT / 'data'
REPORTS = ROOT / 'reports'
REPORTS.mkdir(exist_ok=True)
TODAY = datetime.date.today().isoformat()

def load(path, default):
    try:
        if path.exists():
            return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        pass
    return default

def save(path, data):
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

opps = load(DATA / 'opportunities.json', {"version": "1.0", "last_updated": TODAY, "opportunities": []})
clusters = {
    "tools": load(DATA / 'tool_clusters.json', {}),
    "industries": load(DATA / 'industry_clusters.json', {}),
    "use_cases": load(DATA / 'use_case_clusters.json', {}),
    "materials": load(DATA / 'material_clusters.json', {}),
    "comparisons": load(DATA / 'comparison_clusters.json', {}),
    "trust": load(DATA / 'trust_clusters.json', {}),
    "templates": load(DATA / 'template_clusters.json', {}),
    "ai": load(DATA / 'ai_business_clusters.json', {})
}

def score(item):
    return round(
        item.get("search_intent", 70) * 0.35 +
        item.get("founder_priority", 70) * 0.25 +
        item.get("confidence", 65) * 0.20 +
        (100 - item.get("build_effort", 40)) * 0.10 +
        (100 - item.get("competition", 50)) * 0.10
    )

existing_ids = {o.get("id") for o in opps.get("opportunities", [])}
generated = []

# Generate safe roadmap opportunities from existing clusters so future work is never lost.
for slug, item in clusters["tools"].items():
    if not isinstance(item, dict):
        continue
    oid = f"cluster-tool-{slug}"
    if oid not in existing_ids:
        generated.append({
            "id": oid,
            "date": TODAY,
            "competitor": "Cluster database",
            "tool": slug,
            "industry": (item.get("industries") or ["general"])[0] if isinstance(item.get("industries"), list) else "general",
            "opportunity": f"Build and improve commercial pages around {item.get('primary_keyword') or item.get('title') or slug}",
            "search_intent": 82,
            "competition": 45,
            "build_effort": 35,
            "founder_priority": 80,
            "confidence": 75,
            "status": "open",
            "source": "tool_clusters"
        })

for slug, item in clusters["industries"].items():
    if not isinstance(item, dict):
        continue
    oid = f"cluster-industry-{slug}"
    if oid not in existing_ids:
        generated.append({
            "id": oid,
            "date": TODAY,
            "competitor": "Industry cluster",
            "tool": (item.get("tools") or ["general"])[0] if isinstance(item.get("tools"), list) else "general",
            "industry": slug,
            "opportunity": f"Strengthen QR solutions page for {item.get('title') or slug}",
            "search_intent": 78,
            "competition": 40,
            "build_effort": 25,
            "founder_priority": 82,
            "confidence": 78,
            "status": "open",
            "source": "industry_clusters"
        })

for o in generated:
    o["priority_score"] = score(o)
    opps.setdefault("opportunities", []).append(o)

# Re-score all opportunities and sort.
for o in opps.get("opportunities", []):
    o["priority_score"] = score(o)
opps["opportunities"] = sorted(opps.get("opportunities", []), key=lambda x: x.get("priority_score", 0), reverse=True)
opps["last_updated"] = TODAY
save(DATA / 'opportunities.json', opps)

md = ['# Opportunity Engine Report', '', f'Generated: {TODAY}', '', '| Priority | Opportunity | Tool | Industry | Confidence | Source |', '|---:|---|---|---|---:|---|']
for o in opps.get("opportunities", [])[:25]:
    md.append(f"| {o.get('priority_score', 0)} | {o.get('opportunity','')} | {o.get('tool','')} | {o.get('industry','')} | {o.get('confidence',0)} | {o.get('source','')} |")
(REPORTS / 'opportunity-engine-report.md').write_text('\n'.join(md) + '\n', encoding='utf-8')
print(f"Opportunity Engine complete: {len(opps.get('opportunities', []))} opportunities tracked.")
