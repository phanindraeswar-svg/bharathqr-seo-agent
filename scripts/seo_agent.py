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

print(f"🚀 Launching BharatQR SEO Engine [{TODAY}]...")
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

# ── 3. AI Call Function — Groq API ────────────────────────────────────────────
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
                r = requests.post(
                    GROQ_URL,
                    headers=headers,
                    json=payload,
                    timeout=30
                )
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
    """Strip markdown fences and invalid control characters before parsing."""
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', cleaned)
    return cleaned

# ── 4. Crawl Competitor ────────────────────────────────────────────────────────
competitor_keywords = []
try:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; BharatQR-Bot/1.0)"}
    r = requests.get("https://bharatupi.com", headers=headers, timeout=15)
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

# ── 6. Generate Landing Pages ──────────────────────────────────────────────────
landing_prompt = f"""You are a programmatic SEO expert for bharathqr.com — a FREE UPI QR code generator for Indian merchants.
Today is {TODAY}.

Competitor content themes (inspiration only, never copy): {competitor_keywords}
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
      "heading": "Free BharatQR UPI Code for [Industry] — Zero Fees, Instant Payment",
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
blog_prompt = f"""Write a 100% original, educational blog article for Indian small business merchants.
Today is {TODAY}. Write in a helpful, practical tone suited for Indian readers.

Competitor topics (inspiration only, never copy): {competitor_keywords}
Already written titles (NEVER duplicate): {used_topics['titles']}

Pick ONE hyper-specific Indian merchant topic NOT already in the titles list above. Examples:
- How autorickshaw drivers in Chennai can accept GPay payments without a smartphone
- Complete guide to UPI QR codes for tiffin delivery services in Mumbai
- How vegetable vendors in Delhi can go cashless using free QR codes
- Temple donation collection via UPI — a step by step guide
- How private tuition teachers can collect fees via UPI without a POS machine
- UPI payments for dairy milk delivery routes in India
- How street food vendors can use BharatQR to increase sales

Requirements:
- Minimum 600 words. Natural, helpful, authoritative.
- Strong opening paragraph hook.
- Exactly 3 subheadings using ## markdown.
- Practical step-by-step advice for Indian merchants.
- Mention INR amounts, Indian cities, Indian UPI apps (GPay, PhonePe, Paytm, BHIM).
- End with conclusion and call-to-action linking to https://bharathqr.com
- Do NOT mention bharatupi.com anywhere.
- Use only plain ASCII characters. No curly quotes, no em dashes, no special symbols.

Respond with ONLY raw JSON — no markdown fences. Use plain straight quotes only:
{{"title": "Article title here", "body": "Full 600+ word markdown article body here"}}"""

print("✍️ Generating blog article...")
blog_output = call_ai(blog_prompt, label="blog article")

if blog_output:
    try:
        data = json.loads(clean_json(blog_output))
        title = data.get("title", "").strip()
        body = data.get("body", "").strip()

        if title and body and len(body) > 400:
            slug = title.lower()
            for ch in ["?", "!", ":", ",", "'", '"', "/"]:
                slug = slug.replace(ch, "")
            slug = "-".join(slug.split())[:50].strip("-")

            filename = f"posts/{TODAY}-{slug}.md"
            meta_desc = f"{title} — practical guide for Indian merchants on BharatQR."

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
            log_error(f"Blog too short. Length: {len(body)}. Title: '{title}'")

    except Exception as e:
        log_error(f"Blog parse failed: {e}. Raw: {blog_output[:300]}")

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
