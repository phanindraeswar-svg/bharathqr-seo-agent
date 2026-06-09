import json
import re
from pathlib import Path

ROOT = Path('.')
POSTS = ROOT / 'posts'
REPORTS = ROOT / 'reports'
REPORTS.mkdir(exist_ok=True)

def load_json(path, default):
    try:
        if Path(path).exists():
            return json.loads(Path(path).read_text(encoding='utf-8'))
    except Exception:
        pass
    return default

style = load_json(ROOT / 'data/style_preferences.json', {})
feedback_prefs = load_json(ROOT / 'feedback/preferences.json', {})
tool_clusters = load_json(ROOT / 'data/tool_clusters.json', {})
industry_clusters = load_json(ROOT / 'data/industry_clusters.json', {})
use_case_clusters = load_json(ROOT / 'data/use_case_clusters.json', {})
material_clusters = load_json(ROOT / 'data/material_clusters.json', {})
trust_clusters = load_json(ROOT / 'data/trust_clusters.json', {})
comparison_clusters = load_json(ROOT / 'data/comparison_clusters.json', {})
template_clusters = load_json(ROOT / 'data/template_clusters.json', {})
ai_clusters = load_json(ROOT / 'data/ai_business_clusters.json', {})

banned = set()
for k in ['dislikes', 'banned_phrases']:
    for item in style.get(k, []):
        if isinstance(item, str):
            banned.add(item.lower())
    for item in feedback_prefs.get(k, []):
        if isinstance(item, str):
            banned.add(item.lower())
banned.update(['digital landscape','seamless experience','revolutionary','paradigm shift','in conclusion, it is clear','leverage our platform','digital transformation'])

tool_terms = set()
for d in [tool_clusters, use_case_clusters, material_clusters, trust_clusters, comparison_clusters, template_clusters, ai_clusters]:
    if isinstance(d, dict):
        for slug, item in d.items():
            tool_terms.add(slug.replace('-', ' '))
            if isinstance(item, dict):
                for key in ['primary_keyword','title','name','tool','recommended_tool']:
                    if item.get(key):
                        tool_terms.add(str(item[key]).lower().replace('-', ' '))
                for key in ['secondary_keywords','keywords','tools']:
                    for val in item.get(key, []) if isinstance(item.get(key, []), list) else []:
                        tool_terms.add(str(val).lower().replace('-', ' '))

business_terms = ['restaurant','restaurants','hotel','hotels','shop','shops','retail','kirana','clinic','clinics','salon','salons','cafe','cafes','school','schools','real estate','doctor','doctors','business','merchant','store']
app_terms = ['google pay','phonepe','paytm','bhim','whatsapp','google maps','upi','instagram','facebook']
pain_terms = ['slow','cash','reviews','password','manual','printing','mistake','frustration','queue','lost','forgot','fake','fraud','tamper','typing','reprint']
benefit_terms = ['save time','accept payments','collect reviews','increase','reduce','faster','trust','customer','download','print','scan','share','generate','create','free','online']
cta_terms = ['bharathqr.com','bharathqr','/tools','/solutions','/use-cases','generate your free','create your free']

def count_any(text, terms):
    low = text.lower()
    return sum(1 for t in terms if t and t in low)

def section_score(text, terms, target, weight):
    found = count_any(text, terms)
    return min(weight, round((found / max(target, 1)) * weight))

def score_text(text):
    body = re.sub(r'^---.*?---', '', text, flags=re.S)
    low = body.lower()
    words = re.findall(r'\b\w+\b', body)
    issues = []
    scores = {}

    commercial = 0
    commercial += section_score(body, tool_terms, 2, 30)
    commercial += section_score(body, business_terms, 2, 25)
    commercial += section_score(body, benefit_terms, 4, 25)
    commercial += section_score(body, cta_terms, 1, 20)
    scores['commercial_intent'] = min(100, commercial)

    founder = 100
    banned_found = [b for b in banned if b and b in low]
    if banned_found:
        founder -= min(50, 12 * len(banned_found))
        issues.append('banned_or_disliked_phrases:' + ', '.join(banned_found[:6]))
    if len(re.findall(r'\n\n', body)) < 4:
        founder -= 10; issues.append('few_short_paragraphs')
    if count_any(body, ['example','ravi','priya','raju','shop owner','restaurant owner','hotel manager','merchant']) < 1:
        founder -= 10; issues.append('weak_real_business_example')
    scores['founder_alignment'] = max(0, founder)

    keyword = 0
    keyword += section_score(body, tool_terms, 3, 35)
    keyword += section_score(body, app_terms, 2, 25)
    keyword += section_score(body, pain_terms, 2, 20)
    keyword += section_score(body, business_terms, 2, 20)
    scores['keyword_coverage'] = min(100, keyword)

    readability = 100
    if len(words) < 450:
        readability -= 20; issues.append('short_body_under_450_words')
    sentences = re.split(r'[.!?]+', body)
    long_sentences = [s for s in sentences if len(s.split()) > 28]
    if len(long_sentences) > 8:
        readability -= 15; issues.append('too_many_long_sentences')
    if len(body.split('\n\n')) < 5:
        readability -= 10; issues.append('needs_more_short_paragraphs')
    scores['readability'] = max(0, readability)

    trust = 0
    trust += section_score(body, ['privacy','safe','safety','no login','free','static','verify','payment received','no signup','no hidden'], 2, 60)
    trust += section_score(body, ['faq','question','answer','how to','steps'], 1, 40)
    scores['trust_signals'] = min(100, trust)

    final = round(
        scores['commercial_intent'] * 0.30 +
        scores['founder_alignment'] * 0.25 +
        scores['keyword_coverage'] * 0.20 +
        scores['readability'] * 0.15 +
        scores['trust_signals'] * 0.10
    )
    status = 'publish' if final >= 85 else 'review' if final >= 75 else 'reject'
    return scores, final, status, issues

def score_post(path):
    text = path.read_text(encoding='utf-8', errors='ignore')
    scores, final, status, issues = score_text(text)
    return {
        'file': str(path),
        'scores': scores,
        'final_score': final,
        'status': status,
        'issues': issues
    }

def main():
    results = []
    if POSTS.exists():
        for path in sorted(POSTS.glob('*.md'))[-30:]:
            results.append(score_post(path))

    summary = {
        'scored_posts': len(results),
        'publish_ready': sum(1 for r in results if r['status'] == 'publish'),
        'review_needed': sum(1 for r in results if r['status'] == 'review'),
        'rejected': sum(1 for r in results if r['status'] == 'reject'),
        'results': results
    }
    out = REPORTS / 'content-quality-score-v2.json'
    out.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    md = ['# Content Quality Score V2', '', '| File | Final | Status | Commercial | Founder | Keywords | Readability | Trust | Issues |', '|---|---:|---|---:|---:|---:|---:|---:|---|']
    for r in results:
        s = r['scores']
        md.append(f"| {Path(r['file']).name} | {r['final_score']} | {r['status']} | {s['commercial_intent']} | {s['founder_alignment']} | {s['keyword_coverage']} | {s['readability']} | {s['trust_signals']} | {', '.join(r['issues'][:3]) or 'None'} |")
    (REPORTS / 'content-quality-score-v2.md').write_text('\n'.join(md) + '\n', encoding='utf-8')

    print(f"Content Quality Score V2 complete: {len(results)} posts scored. Publish-ready: {summary['publish_ready']}, review: {summary['review_needed']}, reject: {summary['rejected']}.")
    # Do not fail builds yet; this is a launch-readiness signal.
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
