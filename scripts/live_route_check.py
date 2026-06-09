"""Post-deploy live route checker.
Usage:
  SITE_URL=https://bharathqr.com python scripts/live_route_check.py
This script is optional and safe: without SITE_URL it prints instructions and exits 0.
"""
import os
import sys
import urllib.request
from pathlib import Path

site = os.getenv('SITE_URL', '').rstrip('/')
if not site:
    print('SITE_URL not set. After deploy, run: SITE_URL=https://bharathqr.com python scripts/live_route_check.py')
    sys.exit(0)

routes = [
    '/', '/tools', '/solutions', '/use-cases', '/materials', '/comparisons',
    '/templates', '/trust', '/cases', '/qr-for', '/ai-tools', '/hi',
    '/tools/url-qr-generator', '/tools/text-qr-generator', '/tools/whatsapp-qr-generator',
    '/tools/wifi-qr-generator', '/tools/vcard-qr-generator', '/tools/google-review-qr-generator',
    '/solutions/restaurants', '/solutions/hotels', '/solutions/retail-stores',
    '/use-cases/accept-payments', '/use-cases/collect-reviews',
    '/materials/business-cards', '/materials/brochures',
    '/comparisons/static-vs-dynamic-qr-code', '/trust/upi-qr-safety',
    '/trust/how-to-verify-upi-payment', '/sitemap.xml', '/robots.txt'
]

failures = []
for route in routes:
    url = site + route
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'BharathQR Launch Checker'})
        with urllib.request.urlopen(req, timeout=15) as res:
            code = res.getcode()
            if code >= 400:
                failures.append((route, code))
            print(f'{code} {route}')
    except Exception as exc:
        failures.append((route, str(exc)))
        print(f'FAIL {route}: {exc}')

Path('reports').mkdir(exist_ok=True)
Path('reports/live_route_check.md').write_text('\n'.join([f'{r}: {c}' for r,c in failures]) or 'All checked routes passed.\n', encoding='utf-8')
if failures:
    print('\nLive route check failures:')
    for route, err in failures:
        print('-', route, err)
    sys.exit(1)
print('\n✅ Live route check passed.')
