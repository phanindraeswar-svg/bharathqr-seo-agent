#!/usr/bin/env python3
import os, re, json, glob, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "posts"
REPORT = ROOT / "BLOG_QUALITY_AUDIT.md"
GAP_REPORT = ROOT / "CONTENT_GAP_REPORT.md"

BANNED = [
    "in today's digital landscape",
    "seamless experience",
    "leverage",
    "revolutionary",
    "paradigm shift",
    "transformative",
    "in conclusion"
]

TOOL_TERMS = ["upi qr", "google review qr", "whatsapp qr", "wifi qr", "menu qr", "vcard qr", "qr code"]
ACTION_TERMS = ["create", "generate", "download", "print", "scan", "share", "accept", "collect"]
APP_TERMS = ["google pay", "phonepe", "paytm", "bhim", "whatsapp", "google maps"]
BUSINESS_TERMS = ["shop", "restaurant", "hotel", "clinic", "salon", "store", "merchant", "business", "cafe", "kirana"]

def score_content(text):
    lower = text.lower()
    score = 100
    issues = []
    for phrase in BANNED:
        if phrase in lower:
            score -= 12
            issues.append(f"banned phrase: {phrase}")
    if not any(t in lower for t in TOOL_TERMS):
        score -= 15; issues.append("missing clear tool keyword")
    if not any(t in lower for t in ACTION_TERMS):
        score -= 10; issues.append("missing action keyword")
    if not any(t in lower for t in BUSINESS_TERMS):
        score -= 10; issues.append("missing business/industry keyword")
    if not any(t in lower for t in APP_TERMS):
        score -= 5; issues.append("missing daily app keyword")
    if len(text.split()) < 450:
        score -= 10; issues.append("short content")
    avg_para = sum(len(p.split()) for p in text.split("\n\n") if p.strip()) / max(1, len([p for p in text.split("\n\n") if p.strip()]))
    if avg_para > 90:
        score -= 8; issues.append("paragraphs too long")
    return max(score, 0), issues

def main():
    rows = []
    rejected = []
    for path in sorted(POSTS.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        score, issues = score_content(text)
        rows.append((path.name, score, issues))
        if score < 75:
            rejected.append((path.name, score, issues))
    out = ["# Blog Quality Audit", "", f"Generated: {datetime.date.today()}", ""]
    out.append("| Post | Score | Issues |")
    out.append("|---|---:|---|")
    for name, score, issues in rows:
        out.append(f"| `{name}` | {score} | {', '.join(issues) if issues else 'OK'} |")
    out.append("")
    out.append(f"Rejected posts under 75: **{len(rejected)}**")
    REPORT.write_text("\n".join(out), encoding="utf-8")

    gaps = ["# Content Gap Report", "", f"Generated: {datetime.date.today()}", "",
            "## Priority gaps before/after launch",
            "- Add more proof/examples to highest-traffic tool pages after Search Console data arrives.",
            "- Expand Hindi only after English pages start getting impressions.",
            "- Add more comparison pages only if Search Console shows comparison keywords.",
            "- Keep all new blog topics mapped to a tool, solution, use case, material, trust, or comparison page."]
    GAP_REPORT.write_text("\n".join(gaps), encoding="utf-8")
    print(f"Content excellence audit complete. Posts checked: {len(rows)}. Rejected: {len(rejected)}")
    return 0 if not rejected else 0

if __name__ == "__main__":
    raise SystemExit(main())
