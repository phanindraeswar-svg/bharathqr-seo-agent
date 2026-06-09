import json, sys
from pathlib import Path
path=Path('data/faq_expansion.json')
if not path.exists():
    print('Missing data/faq_expansion.json')
    sys.exit(1)
data=json.loads(path.read_text(encoding='utf-8'))
errors=[]
for key,item in data.items():
    faqs=item.get('faqs',[])
    if len(faqs)<5:
        errors.append(f'{key} has only {len(faqs)} FAQs')
    for idx,pair in enumerate(faqs,1):
        if not isinstance(pair,list) or len(pair)!=2 or not pair[0] or not pair[1]:
            errors.append(f'{key} FAQ {idx} malformed')
if errors:
    print('FAQ coverage audit failed:')
    for e in errors: print('-',e)
    sys.exit(1)
print(f'FAQ coverage audit passed for {len(data)} tools.')
