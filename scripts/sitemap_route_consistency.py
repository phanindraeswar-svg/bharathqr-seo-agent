"""Verify that cluster-driven routes are represented by route templates and sitemap generation inputs.
This is a local pre-launch guard. It does not call the internet.
"""
import json
import sys
from pathlib import Path

ROOT = Path('.')
errors = []
warnings = []

CLUSTERS = {
    'data/tool_clusters.json': ('tool', '/tools/{slug}', 'pages/tools/{slug}.js'),
    'data/industry_clusters.json': ('solution', '/solutions/{slug}', 'pages/solutions/[slug].js'),
    'data/use_case_clusters.json': ('use_case', '/use-cases/{slug}', 'pages/use-cases/[slug].js'),
    'data/trust_clusters.json': ('trust', '/trust/{slug}', 'pages/trust/[slug].js'),
    'data/material_clusters.json': ('material', '/materials/{slug}', 'pages/materials/[slug].js'),
    'data/comparison_clusters.json': ('comparison', '/comparisons/{slug}', 'pages/comparisons/[slug].js'),
    'data/template_clusters.json': ('template', '/templates/{slug}', 'pages/templates/[slug].js'),
    'data/ai_business_clusters.json': ('ai_tool', '/ai-tools/{slug}', 'pages/ai-tools/[slug].js'),
}

def load_json(path):
    try:
        return json.loads(Path(path).read_text(encoding='utf-8'))
    except FileNotFoundError:
        errors.append(f'Missing cluster file: {path}')
        return {}
    except Exception as exc:
        errors.append(f'Invalid JSON in {path}: {exc}')
        return {}

def entries(data):
    if isinstance(data, dict):
        return list(data.values())
    if isinstance(data, list):
        return data
    return []

routes = []
for file, (kind, route_tpl, page_tpl) in CLUSTERS.items():
    data = load_json(file)
    for item in entries(data):
        if not isinstance(item, dict):
            warnings.append(f'{file} has non-object item: {item!r}')
            continue
        slug = item.get('slug')
        if not slug:
            errors.append(f'{file} item missing slug: {item!r}')
            continue
        if ' ' in slug or slug != slug.lower():
            errors.append(f'{file} slug should be lowercase kebab-case: {slug}')
        if kind == 'tool':
            tool_url = item.get('tool_url') or route_tpl.format(slug=slug)
            if tool_url == '/':
                routes.append('/')
                continue
            expected_file = ROOT / 'pages' / 'tools' / f'{slug}.js'
            if not expected_file.exists():
                warnings.append(f'Tool route listed but static tool page missing: {tool_url} -> {expected_file}')
            routes.append(tool_url)
        else:
            route = route_tpl.format(slug=slug)
            template = ROOT / page_tpl
            if not template.exists():
                errors.append(f'Missing dynamic template for {kind}: {page_tpl}')
            routes.append(route)

# Static route pages expected after Wave 7/8
static_expected = {
    '/tools': 'pages/tools/index.js',
    '/solutions': 'pages/solutions/index.js',
    '/use-cases': 'pages/use-cases/index.js',
    '/materials': 'pages/materials/index.js',
    '/comparisons': 'pages/comparisons/index.js',
    '/templates': 'pages/templates/index.js',
    '/trust': 'pages/trust/index.js',
    '/cases': 'pages/cases.js',
    '/ai-tools': 'pages/ai-tools/index.js',
    '/qr-for': 'pages/qr-for/index.js',
    '/hi': 'pages/hi/index.js',
}
for route, file in static_expected.items():
    if not (ROOT / file).exists():
        errors.append(f'Static route {route} missing page file {file}')
    routes.append(route)

unique_routes = sorted(set(routes))
Path('reports').mkdir(exist_ok=True)
Path('reports/sitemap_route_consistency.json').write_text(json.dumps({
    'status': 'failed' if errors else 'passed',
    'route_count_checked': len(unique_routes),
    'errors': errors,
    'warnings': warnings,
    'sample_routes': unique_routes[:25],
}, indent=2), encoding='utf-8')

print('Sitemap/route consistency check')
print('Routes checked:', len(unique_routes))
if warnings:
    print('\nWarnings:')
    for w in warnings:
        print('-', w)
if errors:
    print('\nErrors:')
    for e in errors:
        print('-', e)
    sys.exit(1)
print('\n✅ Sitemap/route consistency passed.')
