import requests, json

with open("config/wp_credentials.json") as f:
    creds = json.load(f)

def publish_post(title, content):
    url = f"{creds['site_url']}/wp-json/wp/v2/posts"
    data = {"title": title, "content": content, "status": "publish"}
    response = requests.post(url, json=data, auth=(creds['username'], creds['password']))
    print(response.json())

publish_post("Free UPI QR Generator", "<p>Generate free UPI QR codes with instant bank credit...</p>")
