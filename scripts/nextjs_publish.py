import os, json

def create_page(title, slug, content):
    path = f"pages/seo/{slug}.md"
    os.makedirs("pages/seo", exist_ok=True)
    with open(path, "w") as f:
        f.write(f"---\ntitle: '{title}'\n---\n\n{content}")
    print(f"Created {path}")

with open("seo_updates.json") as f:
    data = json.load(f)
    create_page("UPI QR Generator", "upi-qr", data["content"])
