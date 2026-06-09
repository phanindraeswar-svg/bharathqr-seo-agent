import json
from pathlib import Path

errors = []
report = ['# BharathQR Internal Link Audit', '', 'Checks whether core commercial pages, clusters and hub routes are linked and represented in data files.', '']

def load(path):
    try:
        return json.loads(Path(path).read_text(encoding='utf-8'))
    except Exception as e:
        errors.append(f'Could not read {path}: {e}')
        return {}

tools = load('data/tool_clusters.json')
industries = load('data/industry_clusters.json')
use_cases = load('data/use_case_clusters.json')
materials = load('data/material_clusters.json')
comparisons = load('data/comparison_clusters.json')
trust = load('data/trust_clusters.json')
internal = load('data/internal_link_graph.json')

report.append(f'- Tools: {len(tools)}')
report.append(f'- Solutions: {len(industries)}')
report.append(f'- Use cases: {len(use_cases)}')
report.append(f'- Materials: {len(materials)}')
report.append(f'- Comparisons: {len(comparisons)}')
report.append(f'- Trust pages: {len(trust)}')
report.append('')

for key, item in industries.items():
    for tool in item.get('tools', []):
        if tool not in tools:
            errors.append(f'industry {key} references missing tool {tool}')
for key, item in use_cases.items():
    tool = item.get('recommended_tool')
    if tool and tool not in tools:
        errors.append(f'use case {key} references missing recommended_tool {tool}')
for key, item in materials.items():
    for tool in item.get('tools', []):
        if tool not in tools:
            errors.append(f'material {key} references missing tool {tool}')

priority = internal.get('launch_priority_routes', [])
report.append('## Launch Priority Routes')
for route in priority:
    report.append(f'- {route}')

if errors:
    report.append('\n## Issues')
    for e in errors: report.append(f'- {e}')
else:
    report.append('\n## Result\nNo internal link data issues found.')

Path('reports/internal_link_audit.md').write_text('\n'.join(report) + '\n', encoding='utf-8')
print('Internal link audit complete.')
if errors:
    raise SystemExit(1)
