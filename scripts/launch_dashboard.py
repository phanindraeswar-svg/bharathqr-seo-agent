#!/usr/bin/env python3
from pathlib import Path
import json, datetime
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data'

def load(name, default):
    p=DATA/name
    if not p.exists(): return default
    try: return json.loads(p.read_text(encoding='utf-8'))
    except Exception: return default

def count_obj(x):
    if isinstance(x, dict): return len(x)
    if isinstance(x, list): return len(x)
    return 0

def main():
    files={
      'tools':'tool_clusters.json',
      'industries':'industry_clusters.json',
      'use_cases':'use_case_clusters.json',
      'materials':'material_clusters.json',
      'templates':'template_clusters.json',
      'comparisons':'comparison_clusters.json',
      'trust':'trust_clusters.json',
      'ai_business':'ai_business_clusters.json',
      'search_intents':'search_intents.json',
      'keyword_ownership':'keyword_ownership_registry.json',
      'opportunities':'opportunities.json',
      'refresh_queue':'content_refresh_queue.json',
    }
    counts={k:count_obj(load(v,{})) for k,v in files.items()}
    routes=[]
    for p in (ROOT/'pages').rglob('*.js'):
        rel=p.relative_to(ROOT/'pages').as_posix()
        if rel.startswith('_') or rel=='sitemap.xml.js': continue
        route='/' + rel.replace('/index.js','').replace('.js','')
        route=route.replace('[slug]','{slug}')
        route=route.replace('/index','')
        if route=='/index': route='/'
        routes.append(route)
    now=datetime.date.today().isoformat()
    out=[f'# BharathQR Launch Dashboard — {now}','', '## Coverage counts']
    for k,v in counts.items(): out.append(f'- {k}: {v}')
    out += ['', f'## Route templates detected: {len(routes)}', '', '## Deployment readiness snapshot', '- Run `npm ci --no-audit --fund=false`', '- Run `npm run build`', '- Run `npm run prelaunch`', '- Deploy to Vercel with build cache disabled for the first deployment after replacement.', '', '## First 48-hour checks', '- Homepage and /tools open', '- /sitemap.xml opens', '- /robots.txt opens', '- Key tool pages generate QR codes', '- Search Console sitemap submitted', '- Founder feedback inbox still present in GitHub only']
    (ROOT/'LAUNCH_DASHBOARD.md').write_text('\n'.join(out)+'\n',encoding='utf-8')
    print('Generated LAUNCH_DASHBOARD.md')
if __name__=='__main__': main()
