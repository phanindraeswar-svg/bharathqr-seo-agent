import os
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai

# Configure the Gemini API client using the environment variable
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def crawl_site(url):
    """Crawls a website homepage and extracts clean heading texts for basic SEO gap analysis."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"Warning: Received status code {response.status_code} for {url}")
            return []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        # Target headings to parse industry niches, features, and targeted use cases
        headings = [h.text.strip() for h in soup.find_all(['h1', 'h2', 'h3']) if h.text.strip()]
        return list(set(headings))
    except Exception as e:
        print(f"Error crawling {url}: {e}")
        return []

def generate_seo_data(missing_gaps):
    """Feeds the identified market gaps into Gemini to generate high-converting dynamic pages."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Keep the prompt strictly structural to guarantee clean data input for Next.js
    prompt = f"""
    You are an expert growth and SEO engineer for bharathqr.com, a platform providing free, instant UPI QR code generators for Indian merchants and businesses.
    Our primary competitor is ranking for these terms, value propositions, or industry segments that we want to address: {', '.join(missing_gaps[:12])}.
    
    Select the top 4 most commercially viable merchant categories or use-cases from that list (or related to them, like kirana stores, taxi drivers, restaurants, or online freelancers) and generate targeted programmatic routes.
    
    You must output strictly a valid raw JSON object. Do not wrap it in markdown code blocks (such as ```json), and provide no pre-text or post-text explanation.
    
    JSON Structure Requirement:
    {{
      "optimized_data": {{
        "suggested_routes": [
          {{
            "slug": "qr-for-kirana-stores",
            "industry": "Kirana & Retail Stores",
            "heading": "Free UPI QR Code for Kirana & Retail Stores",
            "body_text": "Accept instant digital payments at your shop counter with zero transactional fees. Create a custom static QR code for your retail storefront and let customers pay directly to your bank account using any UPI app like GPay, PhonePe, or Paytm."
          }}
        ]
      }}
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Guard against accidental markdown wraps by LLMs
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1].rsplit("\n", 1)[0].strip()
            if response_text.startswith("json"):
                response_text = response_text[4:].strip()
                
        return json.loads(response_text)
    except Exception as e:
        print("Error during LLM content generation or parsing:", e)
        return None

if __name__ == "__main__":
    print("Initiating competitive SEO pipeline analysis...")
    
    # Crawl target sites
    competitor_data = crawl_site("https://bharatupi.com")
    my_data = crawl_site("https://bharathqr.com")
    
    # Calculate text gaps
    gaps = list(set(competitor_data) - set(my_data))
    
    # Fallbacks in case the competitor's site blocks simple scrapers during run execution
    if len(gaps) < 3:
        print("Minimal structural changes found. Using fallback target business segments...")
        gaps = ["kirana stores", "taxi drivers", "street vendors", "restaurants", "freelancers"]
        
    print(f"Identified potential content optimization gaps: {gaps}")
    
    structured_output = generate_seo_data(gaps)
    
    if structured_output:
        # Save structured data directly back to the repo root folder
        with open("seo_updates.json", "w") as f:
            json.dump(structured_output, f, indent=2)
        print("Success! seo_updates.json updated successfully with new programmatic routes.")
    else:
        print("Execution halted due to content generation parsing failure.")
