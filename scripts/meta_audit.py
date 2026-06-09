#!/usr/bin/env python3
"""BharathQR Wave 21 metadata audit.
Checks page families and cluster datasets for title/description/canonical/OG coverage.
This is intentionally conservative: it flags risks without blocking deployment for dynamic pages that
construct metadata at runtime from JSON clusters.
"""
from pathlib import Path
import json, re, datetime

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / 'pages'
REPORT = ROOT / 'META_AUDIT_REPORT.md'

STATIC_IMPORTANT = [
    'index.js','about.js','contact.js','privacy.js','terms.js','faq.js','tools/index.js',
    'solutions/index.js','use-cases/index.js','materials/index.js','comparisons/index.js',
    'templates/index.js','trust/index.js','cases.js','ai-tools/index.js',
    'editorial-policy.js','content-policy.js','advertising-disclosure.js'
]

DYNAMIC_FAMILIES = [
    ('solutions/[slug].js','data/industry_clusters.json','primary_keyword'),
    ('use-cases/[slug].js','data/use_case_clusters.json','primary_keyword'),
    ('materials/[slug].js','data/material_clusters.json','primary_keyword'),
    ('comparisons/[slug].js','data/comparison_clusters.json','primary_keyword'),
    ('templates/[slug].js','data/template_clusters.json','primary_keyword'),
    ('trust/[slug].js','data/trust_clusters.json','primary_keyword'),
    ('ai-tools/[slug].js','data/ai_business_clusters.json','primary_keyword'),
]

def read(path):
    return path.read_text(encoding='utf-8', errors='ignore') if path.exists() else ''

def has(pattern, text):
    return bool(re.search(pattern, text, flags=re.I|re.S))

def cluster_count(rel):
    path = ROOT / rel
    if not path.exists(): return 0
    data = json.loads(path.read_text(encoding='utf-8'))
    if isinstance(data, dict):
        # handle versioned files
        if 'items' in data and isinstance(data['items'], list): return len(data['items'])
        if 'clusters' in data and isinstance(data['clusters'], list): return len(data['clusters'])
        return len([k for k,v in data.items() if isinstance(v, dict)])
    if isinstance(data, list): return len(data)
    return 0

issues=[]
rows=[]
for rel in STATIC_IMPORTANT:
    p=PAGES/rel
    txt=read(p)
    if not txt:
        issues.append(f'Missing important page: pages/{rel}')
        continue
    checks={
        'title': has(r'<title>|title:', txt),
        'description': has(r'name=["\']description["\']|description:', txt),
        'canonical': has(r'rel=["\']canonical["\']|canonical', txt),
        'og': has(r'og:title|og:description|og:url', txt),
    }
    missing=[k for k,v in checks.items() if not v]
    if missing:
        issues.append(f'pages/{rel} metadata gaps: {", ".join(missing)}')
    rows.append((f'pages/{rel}', checks, missing))

family_rows=[]
for page_rel, data_rel, keyword_field in DYNAMIC_FAMILIES:
    p=PAGES/page_rel
    txt=read(p)
    cnt=cluster_count(data_rel)
    checks={
        'dynamic_title': has(r'<title>|title:', txt),
        'dynamic_description': has(r'name=["\']description["\']|description', txt),
        'canonical': has(r'rel=["\']canonical["\']|canonical', txt),
        'jsonld': has(r'application/ld\+json|schema', txt),
        'cluster_count': cnt>0,
    }
    missing=[k for k,v in checks.items() if not v]
    if missing:
        issues.append(f'pages/{page_rel} dynamic metadata gaps: {", ".join(missing)}')
    family_rows.append((page_rel,data_rel,cnt,checks,missing))

lines=[]
lines.append(f'# Metadata Audit Report — {datetime.date.today()}')
lines.append('')
lines.append('## Verdict')
lines.append('PASS — No deployment-blocking metadata issue found.' if not issues else 'REVIEW — Metadata gaps found; see below.')
lines.append('')
lines.append('## Static Page Coverage')
lines.append('| Page | Title | Description | Canonical | OG/Twitter |')
lines.append('|---|---:|---:|---:|---:|')
for page,checks,missing in rows:
    lines.append(f"| `{page}` | {'✅' if checks['title'] else '⚠️'} | {'✅' if checks['description'] else '⚠️'} | {'✅' if checks['canonical'] else '⚠️'} | {'✅' if checks['og'] else '⚠️'} |")
lines.append('')
lines.append('## Dynamic Page Family Coverage')
lines.append('| Page family | Data source | Items | Title | Description | Canonical | JSON-LD |')
lines.append('|---|---|---:|---:|---:|---:|---:|')
for page,data,cnt,checks,missing in family_rows:
    lines.append(f"| `{page}` | `{data}` | {cnt} | {'✅' if checks['dynamic_title'] else '⚠️'} | {'✅' if checks['dynamic_description'] else '⚠️'} | {'✅' if checks['canonical'] else '⚠️'} | {'✅' if checks['jsonld'] else '⚠️'} |")
lines.append('')
if issues:
    lines.append('## Issues')
    for issue in issues:
        lines.append(f'- {issue}')
else:
    lines.append('## Issues')
    lines.append('- None blocking. Continue with live verification after deployment.')
REPORT.write_text('\n'.join(lines)+'\n', encoding='utf-8')
print(f'Metadata audit complete: {len(issues)} issue(s). Report: {REPORT.name}')
