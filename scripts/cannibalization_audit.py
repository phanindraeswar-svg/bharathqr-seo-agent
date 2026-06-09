#!/usr/bin/env python3
"""Detect obvious keyword cannibalization and ownership conflicts."""
from pathlib import Path
import json, datetime, re
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/'CANNIBALIZATION_AUDIT.md'

def load(rel):
    p=ROOT/rel
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else {}

def norm_kw(s):
    s=(s or '').lower().strip()
    s=re.sub(r'[^a-z0-9\s]+',' ',s)
    s=re.sub(r'\s+',' ',s)
    # remove harmless leading terms, not full stemming
    return s

sources=[
    ('tools','data/tool_clusters.json','tool_url'),
    ('solutions','data/industry_clusters.json',None),
    ('use-cases','data/use_case_clusters.json',None),
    ('materials','data/material_clusters.json',None),
    ('comparisons','data/comparison_clusters.json',None),
    ('templates','data/template_clusters.json',None),
    ('trust','data/trust_clusters.json',None),
]
kw_map=defaultdict(list)
for section,rel,url_field in sources:
    data=load(rel)
    if not isinstance(data,dict): continue
    for key,item in data.items():
        if not isinstance(item,dict): continue
        slug=item.get('slug') or key
        url=item.get(url_field) if url_field else f'/{section}/{slug}'
        kws=[]
        if item.get('primary_keyword'): kws.append(item.get('primary_keyword'))
        kws.extend(item.get('secondary_keywords') or [])
        for kw in kws:
            nk=norm_kw(kw)
            if nk:
                kw_map[nk].append({'keyword':kw,'section':section,'url':url})

registry=load('data/keyword_ownership_registry.json')
owners=registry.get('owners',[]) if isinstance(registry,dict) else []
owner_map=defaultdict(list)
for o in owners:
    if isinstance(o,dict):
        owner_map[norm_kw(o.get('keyword'))].append(o.get('owner_url'))

exact_conflicts={k:v for k,v in kw_map.items() if len(set(x['url'] for x in v))>1}
owner_conflicts={k:v for k,v in owner_map.items() if len(set(v))>1 and k}

# Known managed overlaps are expected in a tool/solution/use-case/material architecture.
resolution=load('data/cannibalization_resolution.json')
managed_keywords=set()
if isinstance(resolution,dict):
    for item in resolution.get('resolved_keywords',[]):
        if isinstance(item,dict) and item.get('keyword'):
            managed_keywords.add(norm_kw(item.get('keyword')))
managed_conflicts={k:v for k,v in exact_conflicts.items() if k in managed_keywords}
unmanaged_conflicts={k:v for k,v in exact_conflicts.items() if k not in managed_keywords}

lines=[f'# Cannibalization Audit — {datetime.date.today()}','']
if not unmanaged_conflicts and not owner_conflicts:
    lines += ['## Verdict','PASS — Duplicate keyword overlaps are either absent or explicitly managed by `data/cannibalization_resolution.json`.','']
else:
    lines += ['## Verdict','REVIEW — Unmanaged keyword ownership conflicts found.','']
if unmanaged_conflicts:
    lines += ['## Unmanaged Exact Keyword Conflicts']
    for k,items in sorted(unmanaged_conflicts.items()):
        lines.append(f'### {k}')
        for it in items:
            lines.append(f"- `{it['url']}` ({it['section']}) from keyword: {it['keyword']}")
        lines.append('')
else:
    lines += ['## Unmanaged Exact Keyword Conflicts','- None.','']
if managed_conflicts:
    lines += ['## Managed Keyword Overlaps']
    for k,items in sorted(managed_conflicts.items()):
        urls=sorted(set(x['url'] for x in items))
        lines.append(f'- `{k}` is intentionally split across support pages: {urls}')
    lines.append('')
else:
    lines += ['## Managed Keyword Overlaps','- None.','']

if owner_conflicts:
    lines += ['## Keyword Ownership Registry Conflicts']
    for k,urls in sorted(owner_conflicts.items()):
        lines.append(f'- `{k}` → {sorted(set(urls))}')
else:
    lines += ['## Keyword Ownership Registry Conflicts','- None.']
REPORT.write_text('\n'.join(lines)+'\n', encoding='utf-8')
print(f'Cannibalization audit complete. Unmanaged conflicts: {len(unmanaged_conflicts)}. Managed overlaps: {len(managed_conflicts)}. Registry conflicts: {len(owner_conflicts)}. Report: {REPORT.name}')
