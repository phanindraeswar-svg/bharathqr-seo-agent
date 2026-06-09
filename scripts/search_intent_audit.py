import json, sys
from pathlib import Path
p=Path('data/search_intents.json')
if not p.exists():
    print('Missing data/search_intents.json')
    sys.exit(1)
data=json.loads(p.read_text(encoding='utf-8'))
items=data.get('intents',[])
errors=[]
seen=set()
required={'keyword','intent','tool','industry','use_case','priority'}
for i,item in enumerate(items,1):
    missing=required-set(item)
    if missing: errors.append(f'Intent {i} missing {missing}')
    kw=item.get('keyword','').strip().lower()
    if kw in seen: errors.append(f'Duplicate keyword: {kw}')
    seen.add(kw)
    if not isinstance(item.get('priority'), int) or not (1 <= item.get('priority') <= 100): errors.append(f'{kw} invalid priority')
if len(items)<10: errors.append('Need at least 10 search intent records')
if errors:
    print('Search intent audit failed:')
    for e in errors: print('-',e)
    sys.exit(1)
print(f'Search intent audit passed for {len(items)} records.')
