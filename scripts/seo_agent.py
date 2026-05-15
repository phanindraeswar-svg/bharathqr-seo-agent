import requests
from bs4 import BeautifulSoup
import openai
import json

def crawl_site(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    meta = [tag.get('content') for tag in soup.find_all('meta') if tag.get('content')]
    headings = [h.get_text() for h in soup.find_all(['h1','h2','h3'])]
    return {"meta": meta, "headings": headings}

def detect_gap(site1, site2):
    missing_keywords = [kw for kw in site1["headings"] if kw not in site2["headings"]]
    return missing_keywords

def generate_content(keywords):
    with open("config/openai_key.txt") as f:
        openai.api_key = f.read().strip()
    prompt = f"Generate SEO meta tags, schema markup, and landing page text for keywords: {keywords}"
    response = openai.Completion.create(
        engine="gpt-4",
        prompt=prompt,
        max_tokens=500
    )
    return response.choices[0].text

bharatupi = crawl_site("https://bharatupi.com")
bharathqr = crawl_site("https://bharathqr.com")

gaps = detect_gap(bharatupi, bharathqr)
new_content = generate_content(gaps)

with open("seo_updates.json", "w") as f:
    json.dump({"gaps": gaps, "content": new_content}, f, indent=2)
