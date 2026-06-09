#!/usr/bin/env python3
"""Homepage conversion and internal-link funnel audit."""
from pathlib import Path
import re, datetime
ROOT=Path(__file__).resolve().parents[1]
HOME=ROOT/'pages/index.js'
REPORT=ROOT/'HOMEPAGE_CONVERSION_REPORT.md'
txt=HOME.read_text(encoding='utf-8', errors='ignore') if HOME.exists() else ''
checks={
    'primary_positioning': "India's AI-powered" in txt or 'AI-Powered' in txt,
    'primary_tool_visible': 'UPI QR' in txt and 'Generate' in txt,
    'payment_apps': all(x in txt for x in ['GPay','PhonePe','Paytm']),
    'tools_linked': '/tools' in txt,
    'solutions_linked': '/solutions' in txt,
    'use_cases_linked': '/use-cases' in txt,
    'trust_linked': '/trust' in txt,
    'merchant_language': any(x in txt.lower() for x in ['merchant','shop','business','restaurant']),
    'no_old_branding': 'BharatQR' not in txt,
}
score=sum(checks.values())
lines=[f'# Homepage Conversion Audit — {datetime.date.today()}','',f'## Score: {score}/{len(checks)}','']
for k,v in checks.items():
    lines.append(f'- {"✅" if v else "⚠️"} {k.replace("_"," ")}')
lines += ['','## Recommended Next Live Test','- On mobile, verify the UPI QR generator appears without excessive scrolling.','- Check that the primary CTA is understandable to a first-time Indian shop owner.','- Confirm footer/navigation links work after Vercel deployment.']
REPORT.write_text('\n'.join(lines)+'\n', encoding='utf-8')
print(f'Homepage conversion audit complete: {score}/{len(checks)}. Report: {REPORT.name}')
