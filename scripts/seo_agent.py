import os
import sys
import json
import re
import time
import requests
from bs4 import BeautifulSoup
from google import genai
from google.genai.errors import APIError

print("Initiating competitive SEO pipeline analysis...")

# 1. Scrape Competitor
COMPETITOR_URL = "https://bharatupi.com"
try:
    response = requests.get(COMPETITOR_URL, timeout=15)
    soup = BeautifulSoup(response.text, 'html.parser')
    headings = [h.text.strip() for h in soup.find_all(['h1', 'h2', 'h3']) if h.text.strip()]
    competitor_keywords = list(dict.fromkeys(headings))[:15]
    print(f"Gaps found: {competitor_keywords}")
except Exception as e:
    print(f"Error crawling competitor: {e}")
    sys.exit(1)

if not competitor_keywords:
    print("No gaps found. Exiting.")
    sys.exit(0)

# 2. Configure New Gemini SDK
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY secret is missing in GitHub.")
    sys.exit(1)

client = genai.Client(api_key=api_key)

prompt = f"""
You are an expert programmatic SEO engine. Analyze these competitor topics: {competitor_keywords}.
Select top 3 high-intent industries for BharatQR (a zero-cost UPI QR code generator for merchants).

Output raw JSON only. No markdown. No explanation. Exactly this schema:
{{
  "suggested_routes": [
    {{
      "slug": "industry-slug",
      "industry": "Industry Name",
      "heading": "SEO H1 heading with BharatQR and keyword",
      "body_text": "3-4 sentence value proposition for merchants in this vertical."
    }}
  ]
}}
"""

# 3. Generate Content with Exponential Backoff + Separate Free Pool
max_retries = 4
delay = 20  # Start with a 20-second pause

for attempt in range(max_retries):
    try:
        # Bypassing the standard flash pool by routing to the flash-lite pool
        response = client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=prompt
        )
        raw_text = response.text.strip()
        print(f"Raw Gemini response: {raw_text[:200]}")

        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if not json_match:
            print(f"Error: No JSON found in response.")
            sys.exit(1)

        structured_data = json.loads(json_match.group())
        output_payload = {"optimized_data": structured_data}

        with open("seo_updates.json", "w") as f:
            json.dump(output_payload, f, indent=2)

        print("seo_updates.json successfully written.")
        break

    except APIError as e:
        if e.code == 429:
            print(f"⚠️ [Attempt {attempt + 1}/{max_retries}] Rate limited. Backing off for {delay} seconds...")
            time.sleep(delay)
            delay *= 2  # Exponential backoff step
        else:
            print(f"API Error: {e}")
            sys.exit(1)
    except Exception as e:
        print(f"Unexpected system error: {e}")
        sys.exit(1)
else:
    print("❌ Failed to complete pipeline after max exponential backoff limits.")
    sys.exit(1)
