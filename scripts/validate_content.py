import json, sys
from pathlib import Path

errors = []

def check_json(path, default_type=None):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        if default_type and not isinstance(data, default_type):
            errors.append(f"{path} has wrong JSON type")
        return data
    except Exception as e:
        errors.append(f"{path} invalid JSON: {e}")
        return None

seo = check_json("seo_updates.json", dict)
if seo:
    routes = seo.get("optimized_data", {}).get("suggested_routes", [])
    seen = set()
    for route in routes:
        slug = route.get("slug", "")
        if not slug:
            errors.append("Empty slug in seo_updates.json")
        if " " in slug:
            errors.append(f"Slug contains space: {slug}")
        if slug in seen:
            errors.append(f"Duplicate route slug: {slug}")
        seen.add(slug)
        if not route.get("heading") or not route.get("body_text"):
            errors.append(f"Route missing heading/body_text: {slug}")

for path, typ in [
    ("used_topics.json", dict),
    ("data/founder_feedback.json", dict),
    ("data/founder_backlog.json", dict),
    ("data/style_preferences.json", dict),
    ("data/link_map.json", list),
    ("data/tool_clusters.json", dict),
    ("data/industry_clusters.json", dict),
    ("data/use_case_clusters.json", dict),
    ("data/trust_clusters.json", dict),
    ("data/material_clusters.json", dict),
    ("data/comparison_clusters.json", dict),
    ("data/template_clusters.json", dict),
    ("data/ai_business_clusters.json", dict),
    ("data/internal_link_graph.json", dict),
]:
    check_json(path, typ)

tools = check_json("data/tool_clusters.json", dict) or {}
for key, item in tools.items():
    for required in ["slug", "title", "primary_keyword", "tool_url", "pain_points", "benefits"]:
        if required not in item:
            errors.append(f"tool_clusters.{key} missing {required}")
    url = item.get("tool_url", "")
    if url.startswith("/tools/"):
        page = Path("pages") / (url.strip("/") + ".js")
        if not page.exists():
            errors.append(f"Missing tool page for {url}: {page}")

for file in ["data/industry_clusters.json", "data/use_case_clusters.json", "data/trust_clusters.json"]:
    data = check_json(file, dict) or {}
    seen = set()
    for key, item in data.items():
        slug = item.get("slug")
        if not slug:
            errors.append(f"{file}.{key} missing slug")
        if slug in seen:
            errors.append(f"{file} duplicate slug {slug}")
        seen.add(slug)
        if not item.get("title"):
            errors.append(f"{file}.{key} missing title")

# Avoid accidental old branding in source files.
for src in list(Path("pages").rglob("*.js")) + list(Path("components").rglob("*.js")):
    text = src.read_text(encoding="utf-8", errors="ignore")
    if "BharatQR" in text and "BharathQR" not in text:
        errors.append(f"Old BharatQR branding in {src}")

if errors:
    print("Content validation warnings:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Content validation passed.")
sys.exit(0)
