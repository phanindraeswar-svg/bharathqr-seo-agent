import json
from pathlib import Path
from collections import defaultdict

ROOT = Path('.')
DATA = ROOT / 'data'
registry_path = DATA / 'keyword_ownership_registry.json'
errors = []
warnings = []

if not registry_path.exists():
    errors.append('Missing data/keyword_ownership_registry.json')
else:
    registry = json.loads(registry_path.read_text(encoding='utf-8'))
    owners = registry.get('owners', [])
    by_keyword = defaultdict(list)
    for item in owners:
        kw = str(item.get('keyword', '')).strip().lower()
        url = str(item.get('owner_url', '')).strip()
        if not kw:
            errors.append('Keyword ownership entry missing keyword')
        if not url.startswith('/'):
            errors.append(f"Keyword '{kw}' has invalid owner_url '{url}'")
        by_keyword[kw].append(url)
    duplicates = {kw: urls for kw, urls in by_keyword.items() if len(set(urls)) > 1}
    if duplicates:
        for kw, urls in duplicates.items():
            errors.append(f"Duplicate ownership for keyword '{kw}': {sorted(set(urls))}")
    if len(owners) < 50:
        warnings.append(f'Only {len(owners)} owned keywords tracked; target is 50+ after Wave 13')

if errors:
    print('Keyword ownership audit failed:')
    for e in errors:
        print('-', e)
    raise SystemExit(1)
print('Keyword ownership audit passed.')
for w in warnings:
    print('Warning:', w)
