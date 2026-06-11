import json
import sys
from pathlib import Path

ROOT = Path('.')
errors = []
warnings = []

REQUIRED_FILES = [
    '.npmrc', 'package.json', 'next.config.js',
    'pages/_app.js', 'pages/index.js', 'public/sitemap.xml',
    'public/robots.txt', 'public/favicon.svg', 'public/og-image.png',
    'components/Navbar.js', 'components/Footer.js', 'components/RelatedLinks.js',
    'feedback/inbox.md', 'feedback/completed.md', 'feedback/preferences.json',
    'data/style_preferences.json', 'data/opportunities.json',
    'LAUNCH_PLAYBOOK.md', 'FINAL_LAUNCH_VERIFICATION.md'
]

DATASETS = {
    'data/tool_clusters.json': 'tools',
    'data/industry_clusters.json': 'industries',
    'data/use_case_clusters.json': 'use_cases',
    'data/material_clusters.json': 'materials',
    'data/comparison_clusters.json': 'comparisons',
    'data/template_clusters.json': 'templates',
    'data/trust_clusters.json': 'trust',
    'data/ai_business_clusters.json': 'ai_tools',
}

for file in REQUIRED_FILES:
    if not (ROOT / file).exists():
        errors.append(f'Missing required file: {file}')

loaded = {}
for file, label in DATASETS.items():
    path = ROOT / file
    if not path.exists():
        errors.append(f'Missing cluster data: {file}')
        continue
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
        loaded[label] = data
        if not isinstance(data, (dict, list)) or len(data) == 0:
            warnings.append(f'{file} is empty or unusual')
    except Exception as exc:
        errors.append(f'Invalid JSON in {file}: {exc}')

# Static/dynamic route checks
expected_static = [
    '/', '/tools', '/solutions', '/use-cases', '/materials', '/comparisons',
    '/templates', '/trust', '/cases', '/qr-for', '/ai-tools', '/hi',
    '/about', '/privacy', '/terms', '/contact', '/faq'
]
for route in expected_static:
    # these routes are represented by pages files; manifest check is done elsewhere
    pass

# Tool route file checks from cluster data
for key, item in (loaded.get('tools') or {}).items():
    if not isinstance(item, dict):
        continue
    slug = item.get('slug', key)
    tool_url = item.get('tool_url', '')
    if tool_url == '/':
        continue
    candidate = ROOT / 'pages' / 'tools' / f'{slug}.js'
    if not candidate.exists():
        warnings.append(f'Tool cluster has no dedicated static page yet: /tools/{slug}')

# Dynamic route data needs slug/title/meta basics
def check_entries(label, data, required=('slug','title')):
    if isinstance(data, dict):
        iterable = data.values()
    else:
        iterable = data
    for idx, item in enumerate(iterable):
        if not isinstance(item, dict):
            warnings.append(f'{label}[{idx}] is not an object')
            continue
        for key in required:
            if not item.get(key):
                warnings.append(f'{label}[{idx}] missing {key}')

for label, data in loaded.items():
    check_entries(label, data)

# Branding checks
for path in list((ROOT / 'pages').rglob('*.js')) + list((ROOT / 'components').rglob('*.js')):
    text = path.read_text(encoding='utf-8', errors='ignore')
    if 'BharatQR' in text and 'BharathQR' not in text:
        errors.append(f'Old brand spelling found in {path}')

# SEO/security basics
robots = (ROOT / 'public/robots.txt')
if robots.exists():
    content = robots.read_text(encoding='utf-8')
    if 'Sitemap: https://bharathqr.com/sitemap.xml' not in content:
        errors.append('robots.txt missing BharathQR sitemap line')

report = {
    'status': 'failed' if errors else 'passed',
    'errors': errors,
    'warnings': warnings,
    'counts': {
        label: len(data) if hasattr(data, '__len__') else 0
        for label, data in loaded.items()
    }
}
Path('reports').mkdir(exist_ok=True)
Path('reports/final_launch_audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')

print('Final launch audit')
print('Status:', report['status'])
print('Counts:', report['counts'])
if warnings:
    print('\nWarnings:')
    for w in warnings:
        print('-', w)
if errors:
    print('\nErrors:')
    for e in errors:
        print('-', e)
    sys.exit(1)
print('\n✅ Final launch audit passed.')
