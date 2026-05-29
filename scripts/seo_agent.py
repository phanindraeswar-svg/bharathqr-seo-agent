import os
import sys
import json
import time
import datetime
import requests
from bs4 import BeautifulSoup
from google import genai

# ── 1. Initialize ──────────────────────────────────────────────────────────────
TODAY = datetime.date.today().strftime("%Y-%m-%d")
report_metrics = {
    "api_status": "Success",
    "retries_attempted": 0,
    "new_pages_added": [],
    "blog_title_created": "Skipped",
    "bing_ping_status": "Not Attempted",
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
    total = report_metrics["total_routes_in_system"]
    report = f"""# SEO Engine Run Report — {TODAY}

| Metric | Value |
|---|---|
| API Status | {report_metrics['api_status']} |
| 429 Retries | {report_metrics['retries_attempted']} |
| New Landing Pages Added | {len(report_metrics['new_pages_added'])} |
| New Page Slugs | {', '.join(report_metrics['new_pages_added']) or 'None'} |
| Blog Article Written | {report_metrics['blog_title_created']} |
| Bing Ping | {report_metrics['bing_ping_status']} |
| Competitor Keywords Found | {report_metrics['competitor_keywords_found']} |
| Total Routes in System | {total} |
| Errors | {chr(10).join(report_metrics['errors']) or 'None'} |
| Timestamp | {datetime.datetime.utcnow().isoformat()} UTC |
"""
    with open(f"reports/{TODAY}.md", "w", encoding="utf-8") as f:
        f.write(report)
    print(f"📋 Report saved to reports/{TODAY}.md")

# ── 2. Auth Check ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    log_error("GEMINI_API_KEY missing from GitHub Secrets.")
    write_report()
    sys.exit(0)

client = genai.Client(api_key=GEMINI_API_KEY)

# ── 3. Crawl Competitor ────────────────────────────────────────────────────────
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
        print(f"📡 Competitor keywords: {competitor_keywords}")
except Exception as e:
    log_error(f"Competitor crawl failed: {e}")

# ── 4. Load Deduplication State ────────────────────────────────────────────────
used_topics = {"slugs": [], "titles": []}
if os.path.exists("used_topics.json"):
    try:
        with open("used_topics.json", "r", encoding="utf-8") as f:
            used_topics = json.load(f)
    except Exception as e:
        log_error(f"used_topics.json parse error: {e}")

# ── 5. Gemini API Call with Retry ──────────────────────────────────────────────
def call_gemini(prompt, label=""):
    # Try models in order — gemini-2.0-flash-lite has highest free quota
    models = ["gemini-2.0-flash-lite", "gemini-1.5-flash-8b", "gemini-1.5-flash"]
    for model in models:
        for attempt in range(4):
            try:
                print(f"🤖 Trying {model} for {label} (attempt {attempt+1})...")
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                print(f"✅ {model} responded successfully.")
                return response.text
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "Quota" in err_str:
                    if attempt < 3:
                        wait = 60 * (attempt + 1)
                        print(f"⏳ 429 quota hit on {model}. Waiting {wait}s... (attempt {attempt+1}/3)")
                        report_metrics["retries_attempted"] += 1
                        time.sleep(wait)
                        continue
                    else:
                        print(f"❌ {model} quota exhausted after 3 retries. Trying next model...")
                        break
                elif "404" in err_str or "not found" in err_str.lower():
                    print(f"❌ {model} not available. Trying next model...")
                    break
                else:
                    log_error(f"{model} error on {label}: {err_str[:200]}")
                    break
    log_error(f"All models exhausted for {label}. Content skipped today.")
    report_metrics["api_status"] = f"All models quota exhausted for {label}"
    return None

# ── 6. Generate Landing Pages ──────────────────────────────────────────────────
landing_prompt = f"""
You are a programmatic SEO expert for bharathqr.com — a FREE UPI QR code generator for Indian merchants.
Today is {TODAY}.

Competitor content themes (for inspiration only, never copy): {competitor_keywords}
Already existing slugs (NEVER repeat these): {used_topics['slugs']}

Generate exactly 3 NEW landing page suggestions targeting Indian micro-niche merchants who need free UPI QR codes.
Focus on hyper-specific industries like: autorickshaw drivers, tiffin services, vegetable vendors, temple donations, 
school fee collection, dairy delivery, street food, tailors, laundry services, tuition centers, etc.

Respond with ONLY valid raw JSON. No markdown. No explanation. Exactly this schema:
{{
  "suggested_routes": [
    {{
      "slug": "unique-lowercase-hyphenated-slug",
      "industry": "Specific Industry Name",
      "heading": "Free BharatQR UPI Code for [Industry] — Zero Fees, Instant Payment",
      "body_text": "3-4 sentences explaining zero MDR fees, instant bank credit, works with GPay PhonePe Paytm BHIM. Specific to this industry.",
      "meta_description": "Under 155 chars. Keyword-rich. Mentions free, UPI, and the industry name."
    }}
  ]
}}
"""

print("🧠 Generating landing pages...")
landing_output = call_gemini(landing_prompt, label="landing pages")

if landing_output:
    try:
        clean = landing_output.replace("```json","").replace("```","").strip()
        data = json.loads(clean)
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
            slug = route.get("slug","").strip()
            if slug and slug not in existing_slugs and slug not in used_topics["slugs"]:
                seo_updates["optimized_data"]["suggested_routes"].append(route)
                used_topics["slugs"].append(slug)
                report_metrics["new_pages_added"].append(slug)
                added += 1

        report_metrics["total_routes_in_system"] = len(seo_updates["optimized_data"]["suggested_routes"])

        with open("seo_updates.json", "w", encoding="utf-8") as f:
            json.dump(seo_updates, f, indent=2)
        print(f"✅ Appended {added} new routes. Total: {report_metrics['total_routes_in_system']}")

    except Exception as e:
        log_error(f"Landing page JSON parse failed: {e}. Raw: {landing_output[:300]}")

# ── 7. Generate Blog Article ───────────────────────────────────────────────────
blog_prompt = f"""
Write a 100% original, educational blog article for Indian small business merchants.
Today is {TODAY}. Use this date in the article where relevant.

Competitor topics (inspiration only, never copy): {competitor_keywords}
Already written titles (NEVER duplicate): {used_topics['titles']}

Pick ONE hyper-specific Indian merchant topic NOT in the existing titles list. Examples:
- How autorickshaw drivers in Chennai can accept GPay payments
- UPI QR code setup guide for tiffin delivery services
- How vegetable vendors can go cashless using free QR codes
- Temple donation collection via UPI — a complete guide
- How tuition teachers can collect fees via UPI without a POS machine

Requirements:
- Minimum 600 words. Natural, helpful, authoritative writing.
- Start with a strong hook introduction paragraph.
- Include exactly 3 subheadings using ## markdown format.
- End with a conclusion and call-to-action linking to https://bharathqr.com
- Write for Indian merchants — use INR, mention Indian cities, Indian UPI apps.

Respond with ONLY valid raw JSON containing exactly two keys:
{{"title": "Article title here", "body": "Full article markdown body here — 600+ words"}}
No markdown code fences. Raw JSON only.
"""

print("✍️ Generating blog article...")
blog_output = call_gemini(blog_prompt, label="blog article")

if blog_output:
    try:
        clean = blog_output.replace("```json","").replace("```","").strip()
        blog_json = json.loads(clean)
        title = blog_json.get("title","").strip()
        body = blog_json.get("body","").strip()

        if title and body and len(body) > 300:
            slug = title.lower()
            for ch in ["?","!",":",",","'",'"',"/"]:
                slug = slug.replace(ch,"")
            slug = "-".join(slug.split())[:50].strip("-")

            filename = f"posts/{TODAY}-{slug}.md"
            meta_desc = f"{title} — practical guide for Indian merchants. Free UPI QR collection via BharatQR."

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
            log_error(f"Blog content too short or empty. Title: '{title}', Body length: {len(body)}")

    except Exception as e:
        log_error(f"Blog JSON parse failed: {e}. Raw: {blog_output[:300]}")

# ── 8. Save Deduplication State ────────────────────────────────────────────────
try:
    with open("used_topics.json", "w", encoding="utf-8") as f:
        json.dump(used_topics, f, indent=2)
    print("✅ used_topics.json updated.")
except Exception as e:
    log_error(f"Failed to save used_topics.json: {e}")

# ── 9. Bing Ping ───────────────────────────────────────────────────────────────
try:
    r = requests.get("https://www.bing.com/ping?sitemap=https://bharathqr.com/sitemap.xml", timeout=10)
    report_metrics["bing_ping_status"] = f"{r.status_code}"
    print(f"📡 Bing ping: {r.status_code}")
except Exception as e:
    report_metrics["bing_ping_status"] = f"Failed: {e}"
    log_error(f"Bing ping failed: {e}")

# ── 10. Write Report ───────────────────────────────────────────────────────────
write_report()
print(f"🏁 Engine complete. {len(report_metrics['new_pages_added'])} pages added. Blog: {report_metrics['blog_title_created']}")
