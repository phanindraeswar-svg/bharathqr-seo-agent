import json, sys
from pathlib import Path

errors=[]
expected_pages=[
 'pages/tools/url-qr-generator.js','pages/tools/text-qr-generator.js','pages/tools/whatsapp-qr-generator.js','pages/tools/wifi-qr-generator.js','pages/tools/vcard-qr-generator.js',
 'pages/solutions/index.js','pages/solutions/[slug].js','pages/use-cases/index.js','pages/use-cases/[slug].js','pages/trust/index.js','pages/trust/[slug].js', 'pages/materials/index.js','pages/materials/[slug].js', 'pages/comparisons/index.js','pages/comparisons/[slug].js', 'pages/templates/index.js','pages/templates/[slug].js', 'pages/cases.js', 'pages/qr-for/index.js', 'pages/ai-tools/index.js', 'pages/ai-tools/[slug].js', 'pages/tools/menu-qr-generator.js', 'pages/tools/event-qr-generator.js','pages/tools/email-qr-generator.js','pages/tools/sms-qr-generator.js','pages/tools/phone-qr-generator.js','pages/tools/pdf-qr-generator.js', 'pages/hi/index.js', 'pages/hi/tools/upi-qr-generator.js', 'pages/hi/tools/google-review-qr-generator.js', 'pages/hi/solutions/kirana-store.js', 'pages/hi/trust/upi-qr-safety.js', 'pages/hi/blog/index.js'
]
for page in expected_pages:
    if not Path(page).exists(): errors.append(f"Missing {page}")
for json_file in ['data/tool_clusters.json','data/industry_clusters.json','data/use_case_clusters.json','data/trust_clusters.json','data/material_clusters.json','data/comparison_clusters.json','data/template_clusters.json','data/ai_business_clusters.json','data/monetization_opportunities.json','data/search_intents.json','data/faq_expansion.json']:
    try: json.loads(Path(json_file).read_text(encoding='utf-8'))
    except Exception as e: errors.append(f"Invalid {json_file}: {e}")
if errors:
    print('Route audit failed:')
    for e in errors: print('-', e)
    sys.exit(1)
print('Route audit passed.')
