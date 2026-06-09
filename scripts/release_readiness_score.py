"""Create a simple founder-friendly release readiness score from local audit outputs.

This script accepts both old and new report filenames so the score remains stable
as the validation scripts evolve.
"""
import json
from pathlib import Path

reports = Path('reports')
reports.mkdir(exist_ok=True)
checks = []


def first_existing(paths):
    for path in paths:
        p = Path(path)
        if p.exists():
            return p
    return Path(paths[0])


def add(name, paths, required=True):
    if isinstance(paths, str):
        paths = [paths]
    p = first_existing(paths)
    ok = p.exists()
    status = 'pass' if ok else ('missing' if required else 'optional_missing')
    details = ''
    if ok and p.suffix == '.json':
        try:
            data = json.loads(p.read_text(encoding='utf-8'))
            if data.get('status') == 'failed':
                status = 'fail'
            details = data.get('status', '')
        except Exception as exc:
            status = 'fail'
            details = str(exc)
    checks.append({'name': name, 'path': str(p), 'status': status, 'details': details})


add('Predeploy check marker', 'reports/predeploy_check_passed.txt')
add('Final launch audit', 'reports/final_launch_audit.json')
add('Route manifest', ['reports/route_manifest.json', 'reports/final_route_manifest.json'])
add('Content quality scorecard', ['reports/content_quality_score.json', 'reports/content-quality-score-v2.json'])
add('Sitemap/route consistency', 'reports/sitemap_route_consistency.json')
add('Opportunity engine report', ['reports/opportunities_report.json', 'reports/opportunity-engine-report.md'], required=False)

score = 0
max_score = 0
for c in checks:
    weight = 20 if c['name'] in {'Final launch audit', 'Sitemap/route consistency'} else 12
    max_score += weight
    if c['status'] == 'pass':
        score += weight
    elif c['status'] == 'optional_missing':
        score += weight // 2

percent = round((score / max_score) * 100) if max_score else 0
failed = any(c['status'] == 'fail' for c in checks)
missing_required = any(c['status'] == 'missing' for c in checks if c['name'] != 'Opportunity engine report')
summary = {
    'release_readiness_score': percent,
    'status': 'ready' if percent >= 85 and not failed and not missing_required else 'needs_review',
    'checks': checks,
    'next_action': 'Deploy once, then run live route check.' if percent >= 85 and not failed and not missing_required else 'Review failed/missing checks before deploy.'
}
Path('reports/release_readiness_score.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print('Release readiness score:', f'{percent}/100')
print('Status:', summary['status'])
for c in checks:
    print(f"- {c['name']}: {c['status']} ({c['path']})")
