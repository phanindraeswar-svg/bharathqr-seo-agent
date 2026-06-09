import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def load_json(path, default):
    p = ROOT / path
    if not p.exists():
        return default
    return json.loads(p.read_text(encoding='utf-8'))

def main():
    data = load_json('data/indexing_watchlist.json', {'watchlist': []})
    watchlist = data.get('watchlist', [])
    priority_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    watchlist = sorted(watchlist, key=lambda x: (priority_order.get(x.get('priority','medium'), 2), x.get('section',''), x.get('url','')))
    out = ['# Indexing Watchlist', '', 'Use this after deployment to verify and submit the most important URLs first.', '']
    current = None
    for item in watchlist:
        pr = item.get('priority','medium')
        if pr != current:
            current = pr
            out.append(f'## {pr.title()} Priority')
            out.append('')
        out.append(f"- `{item.get('url')}` — {item.get('title','')} [{item.get('section','')}]")
    (ROOT / 'INDEXING_WATCHLIST.md').write_text('\n'.join(out) + '\n', encoding='utf-8')
    print(f'Generated INDEXING_WATCHLIST.md with {len(watchlist)} URLs')

if __name__ == '__main__':
    main()
