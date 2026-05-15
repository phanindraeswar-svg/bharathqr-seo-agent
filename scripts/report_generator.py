import json

def generate_report():
    with open("seo_updates.json") as f:
        data = json.load(f)

    report = f"# Weekly SEO Report\n\n**Keyword Gaps Found:**\n{data['gaps']}\n\n**New Content Generated:**\n{data['content']}"
    with open("reports/weekly.md", "w") as f:
        f.write(report)

generate_report()
