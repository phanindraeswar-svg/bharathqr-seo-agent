#!/usr/bin/env python3
"""Final freeze audit for BharathQR.
Checks that the project is ready to stop offline waves and move to deploy/verify/index mode.
"""
from pathlib import Path
import json, sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    "package.json", "package-lock.json", "next.config.js", "vercel.json", ".npmrc", ".nvmrc", ".node-version",
    "pages/index.js", "pages/_app.js", "public/robots.txt", "pages/sitemap.xml.js",
    "data/tool_clusters.json", "data/industry_clusters.json", "data/use_case_clusters.json",
    "data/material_clusters.json", "data/comparison_clusters.json", "data/template_clusters.json",
    "data/search_intents.json", "data/keyword_ownership_registry.json", "data/indexing_watchlist.json",
    "feedback/inbox.md", "feedback/completed.md", "feedback/preferences.json",
    "LAUNCH_STATUS.md", "INDEXING_STATUS.md", "NEXT_30_DAYS_PLAN.md",
]
REQUIRED_DIRS = ["pages/tools", "pages/solutions", "pages/use-cases", "pages/materials", "pages/comparisons", "pages/templates", "pages/trust", "scripts", "data"]

errors=[]
for f in REQUIRED_FILES:
    if not (ROOT/f).exists():
        errors.append(f"Missing required file: {f}")
for d in REQUIRED_DIRS:
    if not (ROOT/d).exists():
        errors.append(f"Missing required directory: {d}")
# JSON parse all data files
for jf in (ROOT/'data').glob('*.json'):
    try:
        json.loads(jf.read_text(encoding='utf-8'))
    except Exception as e:
        errors.append(f"Invalid JSON: {jf.relative_to(ROOT)} -> {e}")
# forbidden bulky dirs/files
for bad in ["node_modules", ".next", "out"]:
    if (ROOT/bad).exists():
        errors.append(f"Do not package build/cache directory: {bad}")
for pyc in ROOT.rglob('__pycache__'):
    errors.append(f"Remove Python cache directory: {pyc.relative_to(ROOT)}")

if errors:
    print("❌ Final freeze audit failed")
    for e in errors:
        print("-", e)
    sys.exit(1)
print("✅ Final freeze audit passed: deploy candidate is ready for human deployment verification.")
