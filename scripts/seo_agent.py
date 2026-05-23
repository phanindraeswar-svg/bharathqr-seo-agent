import os
import sys
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai

print("Initiating competitive SEO pipeline analysis...")

# 1. Scrape Competitor Gaps
COMPETITOR_URL = "https://bharatupi.com"
try:
    response = requests.get(COMPETITOR_URL, timeout=15)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract distinct headers as content positioning markers
    headings = [h.text.strip() for h in soup.find_all(['h1', 'h2', 'h3']) if h.text.strip()]
    # De-duplicate while maintaining position order
    competitor_keywords = list(dict.fromkeys(headings))[:15]
    print(f"Identified potential content optimization gaps: {competitor_keywords}")
except Exception as e:
    print(f"Critical Error: Failed to ingest competitor framework: {e}")
    sys.exit(1)

if not competitor_keywords:
    print("SEO Matrix footprint identical. No actionable gaps found.")
    sys.exit(0)

# 2. Initialize Gemini Engine
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Critical Error: GEMINI_API_KEY environment token is missing.")
    sys.exit(1)

genai.configure(api_key=api_key)

# Changed from models/gemini-1.5-flash to 'gemini-1.5-flash' for universal v1beta/v1 SDK compliance
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Failed to bind model runtime: {e}")
    sys.exit(1)

prompt = f"""
You are an expert programmatic SEO engine. Analyze these scraped competitor content topics: {competitor_keywords}.
Select the top 3 high-intent business industries or keyword concepts from this list that need targeted landing pages for our product 'BharatQR' (a zero-cost static UPI QR code generator for merchants).

Generate a structured JSON response mapping out these 3 optimized landing pages.
You MUST output raw JSON matching this schema exactly. Do not wrap the JSON in ```json markdown code blocks.

{{
  "suggested_routes": [
    {{
      "slug": "industry-or-keyword-slug",
      "industry": "Clean Industry Name",
      "heading": "SEO Optimized Catchy H1 Heading including BharatQR and keyword",
      "body_text": "A comprehensive 3-4 sentence value proposition paragraph explaining why merchants in this vertical need our zero-fee UPI QR code solution over standard alternatives."
    }}
  ]
}}
"""

# 3. Query LLM & Process Data Matrix
try:
    response = model.generate_content(prompt)
    raw_text = response.text.strip()
    
    # Safe cleanup if the model accidentally included markdown wrappers
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
    raw_text = raw_text.strip()

    structured_data = json.loads(raw_text)
    
    # Save optimized roadmap back to the repository root
    output_payload = {"optimized_data": structured_data}
    with open("seo_updates.json", "w") as f:
        json.dump(output_payload, f, indent=2)
        
    print("Programmatic SEO data matrix successfully updated and compiled.")

except Exception as e:
    print(f"Error during LLM content generation or parsing: {e}")
    print("Execution halted due to content generation parsing failure.")
    sys.exit(1)
