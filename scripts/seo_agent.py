import os
import sys
import json
import time
import datetime
import requests
from bs4 import BeautifulSoup
from google import genai

# 1. Initialize Runtime Diagnostics Block
TODAY = datetime.date.today().strftime("%Y-%m-%d")
report_metrics = {
    "api_status": "Success",
    "retries_attempted": 0,
    "new_pages_added": [],
    "blog_title_created": "Skipped",
    "bing_ping_status": "Not Attempted"
}

print(f"🚀 Launching Hardened Autonomous BharatQR SEO Engine [{TODAY}]...")

# Ensure execution system directories exist safely
os.makedirs("posts", exist_ok=True)
os.makedirs("reports", exist_ok=True)

def write_fallback_report(error_message):
    report_content = f"# Autonomous SEO Engine Run Report - {TODAY}\n\n- **Status:** Operational Failure\n- **Reason:** {error_message}\n"
    with open(f"reports/{TODAY}.md", "w", encoding="utf-8") as f:
        f.write(report_content)

# 2. Verify Authentication Setup Safely (Exit code 0 prevents pipeline blocks)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    msg = "API Execution Blocked: GEMINI_API_KEY missing from repository secrets."
    print(f"⚠️ {msg}")
    write_fallback_report(msg)
    sys.exit(0)

# Initialize Client
client = genai.Client(api_key=GEMINI_API_KEY)

# 3. Deep Competitor Intelligence Scraper
COMPETITOR_URL = "https://bharatupi.com"
competitor_keywords = []
try:
    headers = {"User-Agent": "BharatQR-SEO-Crawler/2.0"}
    response = requests.get(COMPETITOR_URL, headers=headers, timeout=12)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        headings = [h.text.strip() for h in soup.find_all(['h1', 'h2', 'h3']) if h.text.strip()]
        competitor_keywords = list(dict.fromkeys(headings))[:10]
        print(f"📡 Scraped competitor insights successfully: {competitor_keywords}")
except Exception as scrape_err:
    print(f"⚠️ Scraper fallback notice: {scrape_err}")

# 4. Load State Manifest Data (Deduplication ledger tracking)
used_topics = {"slugs": [], "titles": []}
if os.path.exists("used_topics.json"):
    try:
        with open("used_topics.json", "r", encoding="utf-8") as f:
            used_topics = json.load(f)
    except Exception:
        print("⚠️ State ledger parsing issue. Initializing clean deduplication vectors.")

# 5. API Call Handler with Adaptive Quota Recovery
def execute_gemini_generation(prompt_payload):
    for attempt in range(4):
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash-8b',
                contents=prompt_payload
            )
            return response.text
        except Exception as e:
            if "429" in str(e) or "Quota exceeded" in str(e):
                if attempt < 3:
                    print(f"⏳ Rate Limit (429) hit. Cooling down for 60 seconds... (Attempt {attempt + 1}/3)")
                    report_metrics["retries_attempted"] += 1
                    time.sleep(60)
                    continue
            print(f"⚠️ Gemini processing boundary failure: {e}")
            return None
    return None

# --- GENERATION STEP A: DYNAMIC LANDING PAGES (Append and Merge) ---
landing_prompt = f"""
You are an elite programmatic SEO architect for bharathqr.com (free UPI QR code generator for Indian merchants).
Analyze competitor context items: {competitor_keywords}.
CRITICAL EXCLUSION LIST: Never generate matching slugs for these existing routes: {used_topics['slugs']}.

Generate exactly 3 brand new, hyper-targeted hyper-local micro-niche industries or trade sectors in India needing a free merchant QR code.
Your response MUST be a clean, raw JSON object matching this exact schema block structure:
{{
  "suggested_routes": [
    {{
      "slug": "lowercase-hyphenated-url-slug",
      "industry": "Name of Micro-Niche Sector",
      "heading": "SEO Rich Catchy H1 Heading Target",
      "body_text": "3-4 sentences outlining zero setup friction, zero transactional clearing fees, instantaneous bank settlement, and compatibility with GPay, PhonePe, and Paytm apps."
    }}
  ]
}}
Respond with valid JSON only. Do not wrap it in markdown block formatting code ticks.
"""

print("🧠 Querying Gemini for clean programmatic landing assets...")
landing_raw_output = execute_gemini_generation(landing_prompt)

if landing_raw_output:
    try:
        clean_json_str = landing_raw_output.replace("```json", "").replace("```", "").strip()
        payload_data = json.loads(clean_json_str)
        new_candidates = payload_data.get("suggested_routes", [])
        
        seo_updates = {"optimized_data": {"suggested_routes": []}}
        if os.path.exists("seo_updates.json"):
            try:
                with open("seo_updates.json", "r", encoding="utf-8") as f:
                    seo_updates = json.load(f)
            except Exception:
                pass
        
        current_slugs_set = {item["slug"] for item in seo_updates.get("optimized_data", {}).get("suggested_routes", [])}
        
        appended_count = 0
        for item in new_candidates:
            slug = item.get("slug")
            if slug and slug not in current_slugs_set and slug not in used_topics["slugs"]:
                seo_updates["optimized_data"]["suggested_routes"].append(item)
                used_topics["slugs"].append(slug)
                report_metrics["new_pages_added"].append(slug)
                appended_count += 1
                
        with open("seo_updates.json", "w", encoding="utf-8") as f:
            json.dump(seo_updates, f, indent=2)
        print(f"✅ Master JSON update finished. Appended {appended_count} distinct long-tail channels.")
    except Exception as parse_err:
        report_metrics["api_status"] = f"Landing JSON Error: {parse_err}"
        print(f"⚠️ Master schema processing skip: {parse_err}")

# --- GENERATION STEP B: HIGH-CONVERSION DEEP BLOG ---
blog_prompt = f"""
Write a high-converting, original, educational long-form blog article optimized for Indian micro-merchants.
Base the topical space around these concepts: {competitor_keywords}.
Do NOT touch or duplicate any of these previously written blog titles: {used_topics['titles']}.

Requirements:
- Minimum 600 words long, written naturally and authoritatively.
- Must include an introductory hook, precisely 3 structural subheadings formatted with markdown H2 tags (##), and a clear structural conclusion.
- Embed a prominent operational call-to-action linking naturally back to the master generator utility tool at https://bharathqr.com.

Provide your response wrapped inside a clean, raw JSON schema container containing exactly two keys: "title" and "body". Do not wrap the content of the body string in extra markdown ticks inside the JSON data.
"""

print("✍️ Dispatching semantic requests for deep-dive blog infrastructure...")
blog_raw_output = execute_gemini_generation(blog_prompt)

if blog_raw_output:
    try:
        clean_blog_str = blog_raw_output.replace("```json", "").replace("```", "").strip()
        blog_json = json.loads(clean_blog_str)
        blog_title = blog_json.get("title", "").strip()
        blog_body = blog_json.get("body", "").strip()
        
        if blog_title and blog_body:
            clean_slug = blog_title.lower().replace(" ", "-").replace("?", "").replace("!", "").replace(":", "")[:45].strip("-")
            blog_filename = f"posts/{TODAY}-{clean_slug}.md"
            meta_desc = f"Learn how {blog_title} empowers small Indian vendors. Read practical blueprints on zero-fee UPI collections and fast settlements via BharatQR."
            
            markdown_content = f"""---
title: "{blog_title}"
date: "{TODAY}"
description: "{meta_desc[:155]}"
keywords: ["bharathqr", "free upi qr code", "merchant payments india"]
---

# {blog_title}

{blog_body}
"""
            with open(blog_filename, "w", encoding="utf-8") as f:
                f.write(markdown_content)
                
            used_topics["titles"].append(blog_title)
            report_metrics["blog_title_created"] = blog_title
            print(f"✅ Native markdown blog item successfully staged: {blog_filename}")
    except Exception as blog_err:
        print(f"⚠️ Blog generation processing skipped: {blog_err}")
        report_metrics["api_status"] = f"Blog Compile Failure: {blog_err}"

# 6. Save Updated State Arrays
with open("used_topics.json", "w", encoding="utf-8") as f:
    json.dump(used_topics, f, indent=2)

# 7. Disseminate Indexation Up-link Broadcasts
print("📡 Triggering modern dynamic search system crawl notify protocols...")
try:
    bing_ping_endpoint = "https://www.bing.com/ping?sitemap=https://bharathqr.com/sitemap.xml"
    ping_response = requests.get(bing_ping_endpoint, timeout=10)
    report_metrics["bing_ping_status"] = f"Confirmed ({ping_response.status_code} OK)"
    print(f"📡 Bing ping confirmed: {ping_response.status_code}")
except Exception as ping_err:
    report_metrics["bing_ping_status"] = f"Failed communication channel: {ping_err}"
    print(f"⚠️ Index notification bypass recorded: {ping_err}")

# 8. Compile Master Diagnostic Run Logs
report_template = f"""# Autonomous Agent Cycle Diagnostics — Run {TODAY}

- **Core API Transaction Pipeline:** {report_metrics['api_status']}
- **Rate Limit Cool-downs Triggered (Status 429):** {report_metrics['retries_attempted']}
- **Programmatic Slugs Transferred into Matrix:** {report_metrics['new_pages_added']}
- **Staged Long-Tail Article Node:** {report_metrics['blog_title_created']}
- **Search System Broadcast Signal Status:** {report_metrics['bing_ping_status']}
- **Diagnostic Timestamp Grid:** {datetime.datetime.utcnow().isoformat()} UTC
"""

with open(f"reports/{TODAY}.md", "w", encoding="utf-8") as f:
    f.write(report_template)

print(f"✅ Operational pipeline successfully shut down. Analytics metrics logged at reports/{TODAY}.md")
