from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
ISSUES = {
    'npm error Exit handler never called': ('npm_install_instability', 'Clear Vercel cache, use npm ci, verify .npmrc and package-lock.json.'),
    'Module not found': ('missing_dependency_or_bad_import', 'Check import path and package.json dependencies.'),
    'Generating static pages': ('static_generation_slow', 'Use ISR/on-demand for expanded dynamic routes and keep experimental cpus=1.'),
    'fetch first': ('github_actions_push_conflict', 'Run git pull --rebase before git push or use safe push flow.'),
    '404': ('route_not_deployed_or_wrong_commit', 'Verify commit deployed, route file exists under pages, and deployment is production.'),
}

def classify(text):
    found=[]
    low=text.lower()
    for needle,(code,fix) in ISSUES.items():
        if needle.lower() in low:
            found.append((code,fix))
    return found

def main():
    sample=ROOT/'VERCEL_ERROR_PASTE_HERE.txt'
    if not sample.exists():
        sample.write_text('Paste Vercel or GitHub Actions error logs here, then run npm run classify-deploy-error.\n', encoding='utf-8')
        print('Created VERCEL_ERROR_PASTE_HERE.txt. Paste logs there and rerun.')
        return
    text=sample.read_text(encoding='utf-8', errors='ignore')
    found=classify(text)
    out=['# Deployment Issue Classification','']
    if not found:
        out.append('No known deployment issue pattern found. Review the first real error line in the build log.')
    else:
        for code,fix in found:
            out.append(f'## {code}')
            out.append(f'- Suggested fix: {fix}')
            out.append('')
    (ROOT/'DEPLOYMENT_ISSUE_CLASSIFICATION.md').write_text('\n'.join(out)+'\n', encoding='utf-8')
    print(f'Classified {len(found)} issue pattern(s).')

if __name__=='__main__':
    main()
