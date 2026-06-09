import subprocess
import sys
from pathlib import Path

checks = [
    ('Content validation', ['python', 'scripts/validate_content.py']),
    ('Route audit', ['python', 'scripts/route_audit.py']),
    ('Internal link audit', ['python', 'scripts/internal_link_audit.py']),
    ('Content quality score', ['python', 'scripts/content_quality_score.py']),
    ('Route manifest generation', ['python', 'scripts/generate_route_manifest.py']),
    ('Final launch audit', ['python', 'scripts/final_launch_audit.py']),
    ('FAQ coverage audit', ['python', 'scripts/faq_coverage_audit.py']),
    ('Search intent audit', ['python', 'scripts/search_intent_audit.py']),
]

failed = []
for name, cmd in checks:
    print(f"\n=== {name} ===")
    result = subprocess.run(cmd, text=True, capture_output=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if result.returncode != 0:
        failed.append(name)

if failed:
    print('\nPredeploy check failed:')
    for name in failed:
        print('-', name)
    sys.exit(1)

Path('reports/predeploy_check_passed.txt').write_text('Predeploy check passed.\n', encoding='utf-8')
print('\n✅ Predeploy check passed.')
