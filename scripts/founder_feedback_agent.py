import json
import os
import re
import datetime
from pathlib import Path

TODAY = datetime.date.today().isoformat()
FEEDBACK_DIR = Path("feedback")
DATA_DIR = Path("data")
INBOX = FEEDBACK_DIR / "inbox.md"
COMPLETED = FEEDBACK_DIR / "completed.md"
PROCESSED = FEEDBACK_DIR / "processed.md"
PREFERENCES = FEEDBACK_DIR / "preferences.json"
STYLE_PREFS = DATA_DIR / "style_preferences.json"
FOUNDER_FEEDBACK = DATA_DIR / "founder_feedback.json"
FOUNDER_BACKLOG = DATA_DIR / "founder_backlog.json"
OPPORTUNITIES = DATA_DIR / "opportunities.json"

DEFAULT_INBOX = """# Founder Feedback Inbox

Add new plain-English feedback below this line.
"""

DEFAULT_PREFERENCES = {
    "version": "3.0",
    "last_updated": TODAY,
    "founder_likes": [
        "short crisp paragraphs",
        "high-intent keywords used naturally",
        "commercial-intent pages tied to tools",
        "Indian business examples"
    ],
    "founder_dislikes": [
        "generic AI introductions",
        "keyword stuffing",
        "long vague paragraphs",
        "corporate jargon"
    ],
    "preferred_reference_sites": [],
    "banned_phrases": [
        "in today's digital landscape",
        "seamless experience",
        "revolutionary",
        "paradigm shift",
        "leverage our platform",
        "digital transformation"
    ],
    "priority_tools": ["upi-qr", "google-review-qr", "whatsapp-qr", "wifi-qr"],
    "priority_industries": ["restaurants", "hotels", "retail-stores", "clinics", "salons"],
    "priority_intents": ["accept payments", "collect reviews", "open WhatsApp chat", "share menu"],
    "content_rules": [
        "Every article must map to a BharathQR tool, solution, use case, material, trust topic, comparison or template.",
        "Use intent-rich paragraphs, not keyword stuffing.",
        "CTA must point to a relevant BharathQR page."
    ]
}

def load_json(path, default):
    try:
        if Path(path).exists():
            return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception as e:
        print(f"⚠️ Could not read {path}: {e}")
    return default

def save_json(path, data):
    Path(path).parent.mkdir(exist_ok=True)
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def extract_urls(text):
    return re.findall(r'https?://[^\s)]+', text)

def split_entries(raw):
    cleaned = raw.replace("# Founder Feedback Inbox", "").strip()
    # Remove default help block if no real content appears after it.
    if "Write normal English here" in cleaned and len(cleaned.splitlines()) <= 12:
        return []
    markers = r'(FIX|GOOD|BAD|IDEA|REVIEW|STUDY|LIKE|DISLIKE|COPY_STYLE|PRIORITY|NOTE)'
    chunks = re.split(r'\n(?=\[?' + markers + r'\]?:?)', cleaned, flags=re.I)
    entries = [c.strip() for c in chunks if c and not re.fullmatch(markers, c, flags=re.I)]
    if entries:
        return entries
    return [cleaned] if cleaned else []

def classify(entry):
    lower = entry.lower()
    if any(x in lower for x in ["i like", "[good]", "[like]", "love this", "good page"]):
        return "like"
    if any(x in lower for x in ["i hate", "i don't like", "[bad]", "[dislike]", "robotic", "generic", "boring"]):
        return "dislike"
    if any(x in lower for x in ["copy", "study", "refer", "reference", "structure of", "style of"]):
        return "reference_style"
    if any(x in lower for x in ["priority", "prioritize", "focus on"]):
        return "priority"
    if any(x in lower for x in ["add", "build", "create", "missing", "opportunity"]):
        return "opportunity"
    if any(x in lower for x in ["fix", "change", "make", "should be", "not working"]):
        return "fix"
    return "note"

def add_unique(arr, value):
    if value and value not in arr:
        arr.append(value)

def extract_priority_terms(entry):
    low = entry.lower()
    tools = []
    industries = []
    intents = []
    tool_terms = {
        "upi": "upi-qr", "google review": "google-review-qr", "review qr": "google-review-qr",
        "whatsapp": "whatsapp-qr", "wifi": "wifi-qr", "menu": "menu-qr", "url": "url-qr",
        "text": "text-qr", "vcard": "vcard-qr", "business card": "vcard-qr"
    }
    industry_terms = ["restaurants", "restaurant", "hotels", "hotel", "retail", "shop", "kirana", "clinics", "clinic", "salons", "salon", "cafes", "cafe"]
    intent_terms = ["accept payments", "collect reviews", "open whatsapp", "share menu", "connect wifi", "replace cash", "print qr"]
    for k,v in tool_terms.items():
        if k in low:
            tools.append(v)
    for i in industry_terms:
        if i in low:
            industries.append(i.replace("restaurant", "restaurants").replace("hotel", "hotels").replace("shop", "retail-stores").replace("kirana", "kirana-stores").replace("clinic", "clinics").replace("salon", "salons").replace("cafe", "cafes"))
    for i in intent_terms:
        if i in low:
            intents.append(i)
    return tools, industries, intents

def sync_style_preferences(prefs):
    style = load_json(STYLE_PREFS, {"likes": [], "dislikes": [], "rules": []})
    for item in prefs.get("founder_likes", []):
        add_unique(style.setdefault("likes", []), item)
    for item in prefs.get("founder_dislikes", []):
        add_unique(style.setdefault("dislikes", []), item)
    for item in prefs.get("banned_phrases", []):
        add_unique(style.setdefault("dislikes", []), item)
    for item in prefs.get("content_rules", []):
        add_unique(style.setdefault("rules", []), item)
    style["founder_feedback_v3"] = True
    style["last_synced_from_feedback_preferences"] = TODAY
    save_json(STYLE_PREFS, style)

def maybe_add_opportunity(entry, kind, prefs):
    if kind not in {"opportunity", "reference_style", "priority", "fix"}:
        return None
    tools, industries, intents = extract_priority_terms(entry)
    urls = extract_urls(entry)
    op = {
        "id": f"founder-opp-{TODAY}-{abs(hash(entry)) % 100000}",
        "date": TODAY,
        "competitor": urls[0] if urls else "Founder feedback",
        "tool": tools[0] if tools else "general",
        "industry": industries[0] if industries else "general",
        "opportunity": entry.strip()[:240],
        "search_intent": 80 if tools or intents else 65,
        "competition": 45,
        "build_effort": 30,
        "founder_priority": 95 if kind == "priority" else 85,
        "confidence": 80 if urls else 70,
        "priority_score": 0,
        "status": "open",
        "source": "founder_feedback"
    }
    op["priority_score"] = round(
        op["search_intent"] * 0.35 +
        op["founder_priority"] * 0.25 +
        op["confidence"] * 0.20 +
        (100 - op["build_effort"]) * 0.10 +
        (100 - op["competition"]) * 0.10
    )
    return op

def main():
    FEEDBACK_DIR.mkdir(exist_ok=True)
    DATA_DIR.mkdir(exist_ok=True)
    if not INBOX.exists():
        INBOX.write_text(DEFAULT_INBOX, encoding="utf-8")
    if not PREFERENCES.exists():
        save_json(PREFERENCES, DEFAULT_PREFERENCES)

    raw = INBOX.read_text(encoding="utf-8")
    entries = split_entries(raw)
    if not entries:
        print("No new founder feedback to process.")
        sync_style_preferences(load_json(PREFERENCES, DEFAULT_PREFERENCES))
        return

    prefs = load_json(PREFERENCES, DEFAULT_PREFERENCES)
    feedback = load_json(FOUNDER_FEEDBACK, {"items": []})
    backlog = load_json(FOUNDER_BACKLOG, {"tasks": []})
    opps = load_json(OPPORTUNITIES, {"version": "1.0", "last_updated": TODAY, "opportunities": []})

    completed_lines = [f"\n## {TODAY}\n"]
    for entry in entries:
        kind = classify(entry)
        urls = extract_urls(entry)
        tools, industries, intents = extract_priority_terms(entry)

        item = {
            "id": f"ff-{TODAY}-{len(feedback.get('items', [])) + 1}",
            "date": TODAY,
            "type": kind,
            "text": entry,
            "urls": urls,
            "status": "processed"
        }
        feedback.setdefault("items", []).append(item)

        if kind == "like":
            add_unique(prefs.setdefault("founder_likes", []), entry[:160])
        elif kind == "dislike":
            add_unique(prefs.setdefault("founder_dislikes", []), entry[:160])
            for phrase in ["digital landscape", "seamless experience", "revolutionary", "leverage", "generic"]:
                if phrase in entry.lower():
                    add_unique(prefs.setdefault("banned_phrases", []), phrase)
        elif kind == "reference_style":
            for url in urls:
                refs = prefs.setdefault("preferred_reference_sites", [])
                if not any(r.get("url") == url for r in refs if isinstance(r, dict)):
                    refs.append({"url": url, "lesson": entry[:220]})
        elif kind == "priority":
            for t in tools:
                add_unique(prefs.setdefault("priority_tools", []), t)
            for i in industries:
                add_unique(prefs.setdefault("priority_industries", []), i)
            for intent in intents:
                add_unique(prefs.setdefault("priority_intents", []), intent)

        if kind in {"fix", "opportunity", "priority", "reference_style"}:
            backlog.setdefault("tasks", []).append({
                "id": item["id"],
                "date": TODAY,
                "source": "feedback/inbox.md",
                "type": kind,
                "task": entry[:300],
                "status": "todo"
            })
            op = maybe_add_opportunity(entry, kind, prefs)
            if op:
                # Avoid exact duplicate opportunity text
                if not any(existing.get("opportunity") == op["opportunity"] for existing in opps.setdefault("opportunities", [])):
                    opps["opportunities"].append(op)

        completed_lines.append(f"- ✅ {kind}: {entry.splitlines()[0][:120]}")

    prefs["last_updated"] = TODAY
    opps["last_updated"] = TODAY
    save_json(PREFERENCES, prefs)
    save_json(FOUNDER_FEEDBACK, feedback)
    save_json(FOUNDER_BACKLOG, backlog)
    save_json(OPPORTUNITIES, opps)
    sync_style_preferences(prefs)

    COMPLETED.parent.mkdir(exist_ok=True)
    with COMPLETED.open("a", encoding="utf-8") as f:
        f.write("\n".join(completed_lines) + "\n")
    PROCESSED.parent.mkdir(exist_ok=True)
    with PROCESSED.open("a", encoding="utf-8") as f:
        f.write("\n".join(completed_lines) + "\n")

    INBOX.write_text("# Founder Feedback Inbox\n\nAdd new plain-English feedback below this line.\n", encoding="utf-8")
    print(f"✅ Founder Feedback V3 processed {len(entries)} item(s). Preferences and opportunities updated.")

if __name__ == "__main__":
    main()
