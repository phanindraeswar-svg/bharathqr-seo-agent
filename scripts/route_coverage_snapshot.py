import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SECTIONS = {
    'tools': 'data/tool_clusters.json',
    'solutions': 'data/industry_clusters.json',
    'use_cases': 'data/use_case_clusters.json',
    'materials': 'data/material_clusters.json',
    'comparisons': 'data/comparison_clusters.json',
    'templates': 'data/template_clusters.json',
    'trust': 'data/trust_clusters.json',
    'ai_tools': 'data/ai_business_clusters.json',
}

def count_json(path):
    p = ROOT / path
    if not p.exists():
        return 0
    data = json.loads(p.read_text(encoding='utf-8'))
    if isinstance(data, dict):
        return len(data)
    if isinstance(data, list):
        return len(data)
    return 0

def main():
    rows=[]
    total=0
    for section,path in SECTIONS.items():
        c=count_json(path); total+=c
        rows.append((section,c,path))
    static_pages = len(list((ROOT/'pages').glob('*.js'))) if (ROOT/'pages').exists() else 0
    posts = len(list((ROOT/'posts').glob('*.md'))) if (ROOT/'posts').exists() else 0
    out=['# Route Coverage Snapshot','',f'- Cluster-backed routes: **{total}**',f'- Static page files: **{static_pages}**',f'- Blog posts: **{posts}**','', '| Section | Count | Source |','|---|---:|---|']
    for section,c,path in rows:
        out.append(f'| {section} | {c} | `{path}` |')
    (ROOT/'ROUTE_COVERAGE_SNAPSHOT.md').write_text('\n'.join(out)+'\n', encoding='utf-8')
    print(f'Route coverage snapshot generated. Cluster-backed routes: {total}')

if __name__=='__main__':
    main()
