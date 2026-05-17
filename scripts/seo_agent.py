import os
import requests
import json
import google.generativeai as genai
from bs4 import BeautifulSoup

def crawl_site(url):
    try:
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
    site2_headings_lower = [h.lower() for h in site2["headings"]]
    missing_keywords = [kw for kw in site1["headings"] if kw.lower() not in site2_headings_lower]
    return missing_keywords

def generate_content(keywords):
    if not keywords:
        print("✅ No new keyword gaps found this week.")
        return None

    # The Bypass Check: The agent stops and asks YOU for permission first
    permission = input("🤖 Agent: Found keyword gaps. Do I have permission to run the AI task? (yes/no): ")
    if permission.lower() != 'yes':
        print("❌ Task cancelled by user.")
        return None

    print("🚀 Proceeding with your permission using free Gemini model...")
    
    # Securely fetches your hidden free key from GitHub Secrets
    gemini_key = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt = f"Write an SEO optimized blog post intro incorporating these missing competitor keywords: {', '.join(keywords)}"
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    # Example testing URLs
    my_site = crawl_site("https://bharathqr.com") 
    competitor_site = crawl_site("https://google.com")
    
    gaps = detect_gap(competitor_site, my_site)
    result = generate_content(gaps)
    if result:
        print("\n✨ SEO Agent Output:\n", result)
