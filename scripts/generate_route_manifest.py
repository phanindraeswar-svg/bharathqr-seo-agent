import json
from pathlib import Path
from datetime import date

ROOT = Path.cwd()

def load_json(path, default):
    p = ROOT / path
    if not p.exists():
        return default
    return json.loads(p.read_text(encoding='utf-8'))

routes = []
def add(route, kind, priority='medium'):
    routes.append({'route': route, 'kind': kind, 'priority': priority})

for r in ['/', '/tools', '/solutions', '/use-cases', '/materials', '/comparisons', '/templates', '/cases', '/qr-for', '/trust', '/ai-tools', '/blog', '/about', '/privacy', '/terms', '/contact', '/faq']:
    add(r, 'static_hub', 'high' if r in ['/', '/tools', '/solutions', '/use-cases'] else 'medium')

for k, v in load_json('data/tool_clusters.json', {}).items():
    if v.get('tool_url'):
        add(v['tool_url'], 'tool', 'high')
for fname, prefix, kind in [
    ('data/industry_clusters.json', '/solutions/', 'solution'),
    ('data/use_case_clusters.json', '/use-cases/', 'use_case'),
    ('data/material_clusters.json', '/materials/', 'material'),
    ('data/comparison_clusters.json', '/comparisons/', 'comparison'),
    ('data/template_clusters.json', '/templates/', 'template'),
    ('data/trust_clusters.json', '/trust/', 'trust'),
    ('data/ai_business_clusters.json', '/ai-tools/', 'ai_business'),
]:
    for v in load_json(fname, {}).values():
        if v.get('slug'):
            add(prefix + v['slug'], kind, 'high' if kind in ['solution', 'use_case', 'trust'] else 'medium')

for r in (load_json('seo_updates.json', {}).get('optimized_data', {}).get('suggested_routes', []) or []):
    if r.get('slug'):
        add('/qr-for/' + r['slug'], 'industry_qr', 'medium')

posts_dir = ROOT / 'posts'
if posts_dir.exists():
    for post in sorted(posts_dir.glob('*.md')):
        add('/blog/' + post.stem, 'blog', 'medium')

manifest = {
    'generated_on': str(date.today()),
    'route_count': len(routes),
    'routes': sorted(routes, key=lambda x: x['route'])
}
out = ROOT / 'reports' / 'final_route_manifest.json'
out.parent.mkdir(exist_ok=True)
out.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')
print(f"Route manifest generated: {out} ({len(routes)} routes)")
