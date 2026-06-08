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
]:
    check_json(path, typ)

if errors:
    print("Content validation warnings:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Content validation passed.")
sys.exit(0)
