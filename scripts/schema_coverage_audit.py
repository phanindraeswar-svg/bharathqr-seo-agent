#!/usr/bin/env python3
"""Conservative schema coverage audit for BharathQR.
Checks core page families for JSON-LD presence and target registries.
Does not require npm or Next.js runtime.
"""
from pathlib import Path
import json, sys
ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / 'pages'
DATA = ROOT / 'data'

def read(p):
    return p.read_text(encoding='utf-8', errors='ignore')

def has_jsonld(text):
    return 'application/ld+json' in text or 'schema.org' in text

def main():
    issues=[]
    targets = DATA / 'schema_targets.json'
    if not targets.exists():
        issues.append('Missing data/schema_targets.json')
    else:
        try:
            json.loads(read(targets))
        except Exception as e:
            issues.append(f'Invalid schema_targets.json: {e}')
    required_pages = [
        'pages/index.js',
        'pages/tools/url-qr-generator.js',
        'pages/tools/text-qr-generator.js',
        'pages/tools/google-review-qr-generator.js',
        'pages/solutions/[slug].js',
        'pages/use-cases/[slug].js',
        'pages/materials/[slug].js',
        'pages/comparisons/[slug].js',
        'pages/templates/[slug].js',
        'pages/trust/[slug].js',
        'pages/blog/[slug].js',
    ]
    for rel in required_pages:
        p=ROOT/rel
        if not p.exists():
            issues.append(f'Missing expected page: {rel}')
            continue
        txt=read(p)
        if not has_jsonld(txt):
            issues.append(f'No visible JSON-LD/schema marker in {rel}')
    # avoid aggressive structured-data claims: flag only rating/review schema fields, not ordinary page text like Google Review QR.
    forbidden=['AggregateRating','ratingValue','reviewCount','bestRating','worstRating']
    for p in PAGES.rglob('*.js'):
        txt=read(p)
        for token in forbidden:
            if token in txt:
                issues.append(f'Potential unsafe schema token {token!r} in {p.relative_to(ROOT)}')
    if issues:
        print('Schema coverage audit failed:')
        for i in issues: print(' -',i)
        return 1
    print('Schema coverage audit passed.')
    return 0
if __name__ == '__main__':
    raise SystemExit(main())
