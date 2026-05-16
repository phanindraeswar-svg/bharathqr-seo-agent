import requests
from bs4 import BeautifulSoup
import openai
import json
import os

def crawl_site(url):
    try:
        # Added a standard User-Agent header so competitor servers don't block our autonomous agent
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        meta = [tag.get('content') for tag in soup.find_all('meta') if tag.get('content')]
        headings = [h.get_text().strip() for h in soup.find_all(['h1', 'h2', 'h3']) if h.get_text()]
        return {"meta": meta, "headings": headings}
    except Exception as e:
        print(f"⚠️ Error crawling {url}: {e}")
        return {"meta": [], "headings": []}

def detect_gap(site1, site2):
    # Case-insensitive comparison so we don't fetch duplicates because of styling capitalization
    site2_headings_lower = [h.lower() for h in site2["headings"]]
    missing_keywords = [kw for kw in site1["headings"] if kw.lower() not in site2_headings_lower]
    return missing_keywords

def generate_content(keywords):
    if not keywords:
        print("✅ No new keyword gaps found this week.")
        return None

    # Read key safely
    with open("config/openai_key.txt") as f:
        api_key = f.read().strip()
    
    # Modernized OpenAI client invocation configuration
    client = openai.OpenAI(api_key=api_key)
    
    prompt = (
        f"You are an expert Programmatic SEO Agent. Analyze these missing keyword gaps from a competitor: {keywords}. "
        "Generate optimized meta tags, JSON-LD Schema markup, and standard landing page content structures to beat them. "
        "Your response MUST be strict raw JSON matching this format:\n"
        "{\n"
        "  \"meta_title\": \"...\",\n"
        "  \"meta_description\": \"...\",\n"
        "  \"schema_markup\": {},\n"
        "  \"suggested_routes\": [{\"route\": \"/qr-for-xyz\", \"heading\": \"...\", \"body_text\": \"...\"}]\n"
        "}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a strict JSON-only generating assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"⚠️ OpenAI Generation Error: {e}")
        return None

# Execution Flow
bharatupi = crawl_site("https://www.bharatupi.com")
bharathqr = crawl_site("https://bharathqr.com")

gaps = detect_gap(bharatupi, bharathqr)
new_content = generate_content(gaps)

if new_content:
    with open("seo_updates.json", "w") as f:
        json.dump({"gaps": gaps, "optimized_data": new_content}, f, indent=2)
    print("💾 Analysis logged successfully to seo_updates.json")
