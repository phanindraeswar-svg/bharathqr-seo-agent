import json
import os
import re
import datetime
from pathlib import Path

TODAY = datetime.date.today().isoformat()
INBOX = Path("feedback/inbox.md")
PROCESSED = Path("feedback/processed.md")
COMPLETED = Path("feedback/completed.md")
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

def load_json(path, default):
    try:
        if Path(path).exists():
            return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        pass
    return default

def save_json(path, data):
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def classify(text):
    lower = text.lower()
    if "[good]" in lower or "i like" in lower or "love" in lower:
        return "preference_good"
    if "[bad]" in lower or "i don't like" in lower or "hate" in lower or "generic" in lower or "boring" in lower:
        return "preference_bad"
    if "[fix]" in lower or "should be" in lower or "make" in lower or "change" in lower:
        return "fix"
    if "[idea]" in lower or "add " in lower or "build " in lower:
        return "idea"
    if "http" in lower or "study" in lower:
        return "reference"
    return "note"

def priority(text, kind):
    lower = text.lower()
    if any(word in lower for word in ["broken", "urgent", "must", "required", "not working", "compulsory"]):
        return "high"
    if kind in ["fix", "preference_bad"]:
        return "medium"
    return "low"

def extract_urls(text):
    return re.findall(r'https?://[^\s)]+', text)

def split_entries(raw):
    # Keep it simple: each bracketed command starts a new entry. Otherwise entire file is one note.
    chunks = re.split(r'\n(?=\[(FIX|GOOD|BAD|IDEA|REVIEW|STUDY)\])', raw, flags=re.I)
    if len(chunks) <= 1:
        return [raw.strip()] if raw.strip() else []
    entries = []
    buf = ""
    for part in chunks:
        if re.fullmatch(r'(FIX|GOOD|BAD|IDEA|REVIEW|STUDY)', part, flags=re.I):
            if buf.strip():
                entries.append(buf.strip())
            buf = f"[{part.upper()}]\n"
        else:
            buf += part
    if buf.strip():
        entries.append(buf.strip())
    return entries

def main():
    INBOX.parent.mkdir(exist_ok=True)
    raw = INBOX.read_text(encoding="utf-8") if INBOX.exists() else ""
    # Ignore default examples after the heading if no real new content was added.
    cleaned = raw.replace("# Founder Feedback Inbox", "").strip()
    if not cleaned or "Write normal English here" in cleaned and cleaned.count("[") <= 4:
        print("No new founder feedback to process.")
        return

    feedback = load_json(DATA_DIR / "founder_feedback.json", {"items": []})
    backlog = load_json(DATA_DIR / "founder_backlog.json", {"tasks": []})
    prefs = load_json(DATA_DIR / "style_preferences.json", {"likes": [], "dislikes": [], "rules": []})

    new_items = []
    for entry in split_entries(cleaned):
        if "Write normal English here" in entry:
            continue
        kind = classify(entry)
        item = {
            "id": f"ff-{TODAY}-{len(feedback['items']) + len(new_items) + 1}",
            "date": TODAY,
            "type": kind,
            "priority": priority(entry, kind),
            "text": entry.strip(),
            "urls": extract_urls(entry),
            "status": "open"
        }
        new_items.append(item)

        if kind in ["fix", "idea", "reference"]:
            backlog["tasks"].append({
                "id": item["id"],
                "date": TODAY,
                "source": "founder_feedback",
                "priority": item["priority"],
                "task": entry.strip(),
                "status": "todo"
            })
        if kind == "preference_good":
            for phrase in ["short", "practical", "examples", "simple", "clear", "mobile", "fast"]:
                if phrase in entry.lower() and phrase not in prefs["likes"]:
                    prefs["likes"].append(phrase)
        if kind == "preference_bad":
            for phrase in ["generic", "boring", "ai", "fluff", "repetitive", "too long"]:
                if phrase in entry.lower() and phrase not in prefs["dislikes"]:
                    prefs["dislikes"].append(phrase)

    feedback["items"].extend(new_items)
    save_json(DATA_DIR / "founder_feedback.json", feedback)
    save_json(DATA_DIR / "founder_backlog.json", backlog)
    save_json(DATA_DIR / "style_preferences.json", prefs)

    PROCESSED.parent.mkdir(exist_ok=True)
    with PROCESSED.open("a", encoding="utf-8") as f:
        f.write(f"\n## {TODAY}\n\n")
        for item in new_items:
            f.write(f"- {item['id']} ({item['type']}, {item['priority']}): {item['text'].splitlines()[0]}\n")

    INBOX.write_text("# Founder Feedback Inbox\n\nAdd new plain-English feedback below this line.\n", encoding="utf-8")
    print(f"Processed {len(new_items)} founder feedback item(s).")

if __name__ == "__main__":
    main()
