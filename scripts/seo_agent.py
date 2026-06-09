import os
import sys
import json
import re
import time
import datetime
import requests
from bs4 import BeautifulSoup

# ── 1. Initialize ──────────────────────────────────────────────────────────────
TODAY = datetime.date.today().strftime("%Y-%m-%d")
report_metrics = {
    "api_status": "Success",
    "retries_attempted": 0,
    "new_pages_added": [],
    "blog_title_created": "Skipped",
    "ping_status": "Not Attempted",
    "competitor_keywords_found": 0,
    "total_routes_in_system": 0,
    "errors": []
}

print(f"🚀 Launching BharathQR SEO Engine [{TODAY}]...")
os.makedirs("posts", exist_ok=True)
os.makedirs("reports", exist_ok=True)

def log_error(msg):
    print(f"⚠️ {msg}")
    report_metrics["errors"].append(msg)

def write_report():
    report = f"""# SEO Engine Run Report — {TODAY}

| Metric | Value |
|---|---|
| API Status | {report_metrics['api_status']} |
| Retries | {report_metrics['retries_attempted']} |
| New Pages Added | {len(report_metrics['new_pages_added'])} |
| New Slugs | {', '.join(report_metrics['new_pages_added']) or 'None'} |
| Blog Written | {report_metrics['blog_title_created']} |
| Ping Status | {report_metrics['ping_status']} |
| Competitor Keywords | {report_metrics['competitor_keywords_found']} |
| Total Routes | {report_metrics['total_routes_in_system']} |
| Errors | {chr(10).join(report_metrics['errors']) or 'None'} |
| Timestamp | {datetime.datetime.utcnow().isoformat()} UTC |
"""
    with open(f"reports/{TODAY}.md", "w", encoding="utf-8") as f:
        f.write(report)
    print(f"📋 Report saved: reports/{TODAY}.md")

# ── 2. Auth Check ──────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    log_error("GROQ_API_KEY missing from GitHub Secrets.")
    write_report()
    sys.exit(0)

# ── 3. AI Call Function ────────────────────────────────────────────────────────
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
]

def call_ai(prompt, label=""):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    for model in GROQ_MODELS:
        for attempt in range(3):
            try:
                print(f"🤖 {model} for {label} (attempt {attempt+1})...")
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
                r = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
                if r.status_code == 200:
                    text = r.json()["choices"][0]["message"]["content"]
                    print(f"✅ {model} responded successfully.")
                    return text
                elif r.status_code == 429:
                    wait = 30 * (attempt + 1)
                    print(f"⏳ 429 on {model}. Waiting {wait}s... (attempt {attempt+1}/3)")
                    report_metrics["retries_attempted"] += 1
                    time.sleep(wait)
                    continue
                else:
                    err = r.json().get("error", {}).get("message", r.text[:200])
                    log_error(f"{model} error {r.status_code}: {err}")
                    break
            except Exception as e:
                log_error(f"{model} exception: {str(e)[:200]}")
                break
        else:
            print(f"❌ {model} quota exhausted. Trying next model...")
            continue
        print(f"❌ {model} failed. Trying next model...")
    log_error(f"All AI models failed for {label}.")
    report_metrics["api_status"] = f"All models failed for {label}"
    return None

def clean_json(raw):
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', cleaned)
    return cleaned

# ── 4. Crawl Competitor ────────────────────────────────────────────────────────
competitor_keywords = []
try:
    hdrs = {"User-Agent": "Mozilla/5.0 (compatible; BharathQR-Bot/1.0)"}
    r = requests.get("https://bharatupi.com", headers=hdrs, timeout=15)
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'html.parser')
        headings = [h.text.strip() for h in soup.find_all(['h1','h2','h3']) if h.text.strip()]
        meta = soup.find('meta', attrs={'name': 'description'})
        if meta and meta.get('content'):
            headings.append(meta['content'])
        competitor_keywords = list(dict.fromkeys(headings))[:12]
        report_metrics["competitor_keywords_found"] = len(competitor_keywords)
        print(f"📡 Competitor keywords found: {len(competitor_keywords)}")
except Exception as e:
    log_error(f"Competitor crawl failed: {e}")

# ── 5. Load Deduplication State ────────────────────────────────────────────────
used_topics = {"slugs": [], "titles": []}
if os.path.exists("used_topics.json"):
    try:
        with open("used_topics.json", "r", encoding="utf-8") as f:
            used_topics = json.load(f)
    except Exception as e:
        log_error(f"used_topics.json parse error: {e}")


# ── Founder Feedback V3 + Style Preferences ──────────────────────────────────
style_preferences = {"likes": [], "dislikes": [], "rules": []}
feedback_preferences = {"founder_likes": [], "founder_dislikes": [], "banned_phrases": [], "content_rules": []}
opportunity_memory = {"opportunities": []}

try:
    with open("data/style_preferences.json", "r", encoding="utf-8") as f:
        style_preferences = json.load(f)
except Exception:
    pass

try:
    with open("feedback/preferences.json", "r", encoding="utf-8") as f:
        feedback_preferences = json.load(f)
except Exception:
    pass

try:
    with open("data/opportunities.json", "r", encoding="utf-8") as f:
        opportunity_memory = json.load(f)
except Exception:
    pass

likes = list(dict.fromkeys(style_preferences.get("likes", []) + feedback_preferences.get("founder_likes", [])))
dislikes = list(dict.fromkeys(style_preferences.get("dislikes", []) + feedback_preferences.get("founder_dislikes", []) + feedback_preferences.get("banned_phrases", [])))
rules = list(dict.fromkeys(style_preferences.get("rules", []) + feedback_preferences.get("content_rules", [])))
priority_tools = feedback_preferences.get("priority_tools", [])
priority_industries = feedback_preferences.get("priority_industries", [])
priority_intents = feedback_preferences.get("priority_intents", [])
top_opportunities = opportunity_memory.get("opportunities", [])[:5]

founder_style_instruction = f"""
FOUNDER FEEDBACK V3 — These rules override generic SEO defaults.
Likes: {', '.join(likes[:12]) or 'practical, clear, mobile-first examples'}
Dislikes / banned phrases: {', '.join(dislikes[:14]) or 'generic AI fluff'}
Rules: {', '.join(rules[:10]) or 'Founder feedback overrides generic SEO defaults'}
Priority tools: {', '.join(priority_tools[:8])}
Priority industries: {', '.join(priority_industries[:8])}
Priority intents: {', '.join(priority_intents[:8])}
Top roadmap opportunities: {json.dumps(top_opportunities, ensure_ascii=False)[:900]}

Write like a useful human advisor. Use crisp, high-intent paragraphs. Avoid keyword stuffing and generic AI-sounding introductions.
"""

def validate_founder_content(title, body):
    """Return founder/content quality violations before saving."""
    violations = []
    low = (title + "\n" + body).lower()
    for phrase in dislikes:
        if isinstance(phrase, str) and phrase and phrase.lower() in low:
            violations.append(f"Founder-banned/disliked phrase found: {phrase}")
    required_terms = ["bharathqr", "generate", "qr"]
    for term in required_terms:
        if term not in low:
            violations.append(f"Missing required commercial term: {term}")
    if "https://bharathqr.com" not in body and "bharathqr.com" not in body:
        violations.append("Missing BharathQR CTA link")
    if len(body.split()) < 600:
        violations.append("Body below 600 words")
    if len([p for p in body.split("\n\n") if p.strip()]) < 5:
        violations.append("Needs more short paragraphs")
    return violations

# ── Commercial Intent Cluster Brain ───────────────────────────────────────────
def load_json_file(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        log_error(f"Could not load {path}: {e}")
        return fallback

tool_clusters = load_json_file("data/tool_clusters.json", {})
industry_clusters = load_json_file("data/industry_clusters.json", {})
use_case_clusters = load_json_file("data/use_case_clusters.json", {})
material_clusters = load_json_file("data/material_clusters.json", {})
comparison_clusters = load_json_file("data/comparison_clusters.json", {})
template_clusters = load_json_file("data/template_clusters.json", {})
ai_business_clusters = load_json_file("data/ai_business_clusters.json", {})

commercial_rules = """
BharathQR commercial intent rules:
- Never write a generic SEO article.
- Every blog must map to one BharathQR tool, one industry, one use case or material, one pain point, and one CTA.
- Title must contain the exact primary keyword.
- First 100 words must include the primary keyword, one business keyword, one app keyword, one pain point, and one benefit.
- Use intent-rich readable sentences, not keyword stuffing.
- Mention daily-use apps naturally where relevant: Google Pay, PhonePe, Paytm, BHIM, WhatsApp, Google Maps.
- Every article must point readers to the relevant BharathQR tool.
- Prefer commercial-intent pages that support Solutions, Use Cases, Materials, Trust, Comparisons, Templates or AI Business foundations.
- AI topics must support a real QR/business outcome such as reviews, WhatsApp enquiries, menus, offers or business profiles.
"""

# ── 6. Generate Landing Pages ──────────────────────────────────────────────────
landing_prompt = f"""You are a programmatic SEO expert for bharathqr.com — a FREE UPI QR code generator for Indian merchants.
Today is {TODAY}.

Competitor content themes (inspiration only, never copy): {competitor_keywords}
{founder_style_instruction}
Already existing slugs (NEVER repeat these): {used_topics['slugs']}

Generate exactly 3 NEW landing page suggestions for hyper-specific Indian micro-niche merchants.
Target industries like: autorickshaw drivers, tiffin services, vegetable vendors, temple donations,
school fee collection, dairy delivery, street food stalls, tailors, laundry, tuition centers,
medical shops, beauty parlours, coaching institutes, petrol pumps, etc.

Respond with ONLY valid raw JSON. No markdown fences. No explanation. Exactly this schema:
{{
  "suggested_routes": [
    {{
      "slug": "unique-lowercase-hyphenated-slug",
      "industry": "Specific Industry Name",
      "heading": "Free BharathQR UPI Code for [Industry] — Zero Fees, Instant Payment",
      "body_text": "3-4 sentences. Mention zero MDR fees, instant bank credit, works with GPay PhonePe Paytm BHIM. Specific to this industry.",
      "meta_description": "Under 155 chars. Keyword-rich. Mentions free, UPI, and the industry."
    }}
  ]
}}"""

print("🧠 Generating landing pages...")
landing_output = call_ai(landing_prompt, label="landing pages")

if landing_output:
    try:
        data = json.loads(clean_json(landing_output))
        new_routes = data.get("suggested_routes", [])

        seo_updates = {"optimized_data": {"suggested_routes": []}}
        if os.path.exists("seo_updates.json"):
            try:
                with open("seo_updates.json", "r", encoding="utf-8") as f:
                    seo_updates = json.load(f)
            except Exception:
                pass

        existing_slugs = {r["slug"] for r in seo_updates["optimized_data"]["suggested_routes"]}
        added = 0
        for route in new_routes:
            slug = route.get("slug", "").strip()
            if slug and slug not in existing_slugs and slug not in used_topics["slugs"]:
                seo_updates["optimized_data"]["suggested_routes"].append(route)
                used_topics["slugs"].append(slug)
                report_metrics["new_pages_added"].append(slug)
                added += 1

        report_metrics["total_routes_in_system"] = len(
            seo_updates["optimized_data"]["suggested_routes"]
        )
        with open("seo_updates.json", "w", encoding="utf-8") as f:
            json.dump(seo_updates, f, indent=2)
        print(f"✅ Appended {added} new routes. Total: {report_metrics['total_routes_in_system']}")

    except Exception as e:
        log_error(f"Landing page parse failed: {e}. Raw: {landing_output[:300]}")

# ── 7. Generate Blog Article ───────────────────────────────────────────────────
# NOTE: We do NOT use JSON for the blog anymore.
# The AI returns plain text with a TITLE: line and then the body.
# This completely avoids the newline-inside-JSON bug.

# Select one commercial-intent cluster combination for today's blog.
def choose_commercial_topic():
    tools = list(tool_clusters.values()) or []
    industries = list(industry_clusters.values()) or []
    use_cases = list(use_case_clusters.values()) or []
    materials = list(material_clusters.values()) or []
    if not tools or not industries or not use_cases:
        return {
            "tool": {"title": "UPI QR Generator", "primary_keyword": "UPI QR Code Generator", "tool_url": "/", "apps": ["Google Pay", "PhonePe", "Paytm", "BHIM"], "pain_points": ["slow cash payments"], "benefits": ["accept payments faster"]},
            "industry": {"title": "QR Solutions for Retail Stores", "slug": "retail-stores", "industries": ["shops"], "pain_points": ["cash shortage"], "benefits": ["cashless payments"]},
            "use_case": {"title": "Accept Payments with a UPI QR Code", "slug": "accept-payments", "primary_keyword": "Accept Payments with QR Code", "pain_points": ["customers do not carry cash"], "benefits": ["get paid faster"]}
        }
    # Rotate deterministically using today's date and existing title count.
    idx = (len(used_topics.get("titles", [])) + datetime.date.today().toordinal())
    tool = tools[idx % len(tools)]
    matching_industries = [i for i in industries if tool.get("slug", "").replace("-generator", "") in " ".join(i.get("tools", [])) or any(ind in tool.get("industries", []) for ind in i.get("industries", []))]
    industry = (matching_industries or industries)[idx % len(matching_industries or industries)]
    matching_use_cases = [u for u in use_cases if u.get("recommended_tool") in [k for k,v in tool_clusters.items() if v == tool] or tool.get("slug") in " ".join(u.get("tools", []))]
    use_case = (matching_use_cases or use_cases)[idx % len(matching_use_cases or use_cases)]
    material = (materials or [{}])[idx % len(materials or [{}])]
    return {"tool": tool, "industry": industry, "use_case": use_case, "material": material}

topic = choose_commercial_topic()
blog_prompt = f"""You are writing a commercial-intent BharathQR blog for Indian businesses.
Today is {TODAY}.

{commercial_rules}
{founder_style_instruction}

Selected tool: {json.dumps(topic['tool'], ensure_ascii=False)}
Selected industry: {json.dumps(topic['industry'], ensure_ascii=False)}
Selected use case: {json.dumps(topic['use_case'], ensure_ascii=False)}
Selected print/material use case: {json.dumps(topic.get('material', {}), ensure_ascii=False)}
Competitor themes for inspiration only, never copy: {competitor_keywords}
Already written titles — DO NOT repeat: {used_topics.get('titles', [])}

Write a crisp, high-intent article. It should sound like a useful BharathQR business guide, not a generic AI blog.
Target reader: Indian shopkeeper, restaurant owner, hotel manager, clinic owner or salon owner using mobile-first tools.

Format your response EXACTLY like this — two sections, nothing else:

TITLE: [Primary keyword] for [Industry/Use Case]: [Clear benefit]

BODY:
Minimum 650 words. Include:
- Strong first paragraph with primary keyword, business keyword, app keyword, pain point and benefit.
- Exactly 3 subheadings using ## markdown.
- Short paragraphs.
- Mention practical placement using the selected print/material use case when relevant: shop counter, table tent, reception desk, brochure, poster, flyer, packaging, menu or business card.
- Mention relevant apps naturally: Google Pay, PhonePe, Paytm, BHIM, WhatsApp, Google Maps.
- Include one named Indian business example with city and realistic INR amount.
- Include one numbered step-by-step section.
- Include 5 concise FAQs.
- End with CTA linking to https://bharathqr.com{topic['tool'].get('tool_url', '/')}
- Never mention competitor names.
- Never use phrases banned by founder preferences.
"""

print("✍️ Generating blog article...")
blog_output = call_ai(blog_prompt, label="blog article")

if blog_output:
    try:
        # Parse TITLE: and BODY: sections — no JSON involved
        title = ""
        body = ""

        lines = blog_output.strip().splitlines()
        body_started = False
        body_lines = []

        for line in lines:
            if line.startswith("TITLE:") and not title:
                title = line.replace("TITLE:", "").strip()
            elif line.startswith("BODY:"):
                body_started = True
            elif body_started:
                body_lines.append(line)

        body = "\n".join(body_lines).strip()

        # Fallback: if TITLE/BODY markers missing, take first line as title
        if not title and lines:
            title = lines[0].replace("#", "").strip()
            body = "\n".join(lines[1:]).strip()

        violations = validate_founder_content(title, body) if title and body else ["missing title/body"]
        if violations:
            log_error("Founder/content quality check failed before save: " + "; ".join(violations[:5]))
            retry_prompt = blog_prompt + "\n\nREGENERATE because the previous draft failed these checks: " + "; ".join(violations[:6]) + "\nAvoid all banned phrases, keep it crisp, include a clear BharathQR CTA, and use high-intent keywords naturally."
            retry_output = call_ai(retry_prompt, label="blog article quality retry")
            if retry_output:
                retry_lines = retry_output.strip().splitlines()
                title = ""
                body_started = False
                body_lines = []
                for line in retry_lines:
                    if line.startswith("TITLE:") and not title:
                        title = line.replace("TITLE:", "").strip()
                    elif line.startswith("BODY:"):
                        body_started = True
                    elif body_started:
                        body_lines.append(line)
                if not title and retry_lines:
                    title = retry_lines[0].replace("#", "").strip()
                    body_lines = retry_lines[1:]
                body = "\n".join(body_lines).strip()
                violations = validate_founder_content(title, body) if title and body else ["missing title/body after retry"]

        if title and body and len(body.split()) >= 600:
            if violations:
                log_error("Saving blog with warning after retry: " + "; ".join(violations[:5]))
            slug = title.lower()
            for ch in ["?", "!", ":", ",", "'", '"', "/", "—", "-"]:
                slug = slug.replace(ch, " ")
            slug = "-".join(slug.split())[:50].strip("-")

            filename = f"posts/{TODAY}-{slug}.md"
            meta_desc = f"{title} — practical guide for Indian merchants on BharathQR."

            content = f"""---
title: "{title}"
date: "{TODAY}"
description: "{meta_desc[:155]}"
keywords: ["bharathqr", "free upi qr code", "upi payments india", "merchant payments"]
---

{body}
"""
            with open(filename, "w", encoding="utf-8") as f:
                f.write(content)

            used_topics["titles"].append(title)
            report_metrics["blog_title_created"] = title
            print(f"✅ Blog saved: {filename}")
        else:
            log_error(f"Blog content too short or empty. Title: '{title}', Body words: {len(body.split())}")

    except Exception as e:
        log_error(f"Blog processing failed: {e}")

# ── 8. Save Deduplication State ────────────────────────────────────────────────
try:
    with open("used_topics.json", "w", encoding="utf-8") as f:
        json.dump(used_topics, f, indent=2)
    print("✅ used_topics.json saved.")
except Exception as e:
    log_error(f"used_topics save failed: {e}")

# ── 9. Bing Ping ───────────────────────────────────────────────────────────────
try:
    r = requests.get(
        "https://www.bing.com/ping?sitemap=https://bharathqr.com/sitemap.xml",
        timeout=10
    )
    report_metrics["ping_status"] = f"Bing: {r.status_code}"
    print(f"📡 Bing ping: {r.status_code}")
except Exception as e:
    report_metrics["ping_status"] = f"Failed: {e}"

# ── 10. Final Report ───────────────────────────────────────────────────────────
write_report()
print(f"🏁 Done. {len(report_metrics['new_pages_added'])} pages added. Blog: {report_metrics['blog_title_created']}")
