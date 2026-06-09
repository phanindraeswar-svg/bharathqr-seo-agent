#!/usr/bin/env python3
"""Live SEO smoke audit for BharathQR after deployment.

Usage:
  BASE_URL=https://bharathqr.com python scripts/live_seo_smoke_audit.py

This script is intentionally lightweight and uses only Python stdlib.
It checks critical routes for HTTP 200, basic title/description signals,
and obvious old-branding regressions. It does not fail when offline unless
RUN_LIVE_CHECKS=true is set, so it is safe in CI/prelaunch environments.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
TARGETS = ROOT / "data" / "live_verification_targets.json"
REPORT = ROOT / "LIVE_SEO_SMOKE_AUDIT.md"


class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""
        self.description = ""
        self.canonical = ""
        self.og_title = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag.lower() == "title":
            self.in_title = True
        if tag.lower() == "meta":
            name = attrs.get("name", "").lower()
            prop = attrs.get("property", "").lower()
            content = attrs.get("content", "")
            if name == "description":
                self.description = content
            if prop == "og:title":
                self.og_title = content
        if tag.lower() == "link" and attrs.get("rel", "").lower() == "canonical":
            self.canonical = attrs.get("href", "")

    def handle_endtag(self, tag):
        if tag.lower() == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data.strip()


def load_targets():
    data = json.loads(TARGETS.read_text(encoding="utf-8"))
    return data


def fetch(url: str, timeout: int = 12):
    req = urllib.request.Request(url, headers={"User-Agent": "BharathQR-live-smoke-audit/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        body = resp.read(200_000).decode("utf-8", errors="replace")
        return resp.status, body


def audit_url(base_url: str, path: str):
    url = base_url.rstrip("/") + path
    result = {"path": path, "url": url, "status": None, "ok": False, "warnings": []}
    try:
        status, html = fetch(url)
        result["status"] = status
        result["ok"] = 200 <= status < 300
        if path.endswith(".xml") or path.endswith(".txt"):
            return result
        parser = HeadParser()
        parser.feed(html)
        if not parser.title:
            result["warnings"].append("missing <title>")
        if len(parser.description) < 40:
            result["warnings"].append("missing/short meta description")
        if "BharatQR" in html and "BharathQR" not in html:
            result["warnings"].append("old BharatQR branding detected")
        if "digital landscape" in html.lower():
            result["warnings"].append("generic banned phrase detected")
    except Exception as exc:  # noqa: BLE001
        result["status"] = "ERROR"
        result["warnings"].append(str(exc)[:160])
    return result


def main():
    live_enabled = os.getenv("RUN_LIVE_CHECKS", "").lower() in {"1", "true", "yes"}
    data = load_targets()
    base_url = os.getenv("BASE_URL", data.get("base_url", "https://bharathqr.com"))
    paths = data.get("critical", []) + data.get("secondary", [])

    if not live_enabled:
        REPORT.write_text(
            "# Live SEO Smoke Audit\n\n"
            "Status: SKIPPED in offline mode.\n\n"
            "Set `RUN_LIVE_CHECKS=true` after deployment to check live routes.\n\n"
            f"Target base URL: `{base_url}`\n\n"
            f"Routes prepared: {len(paths)}\n",
            encoding="utf-8",
        )
        print("Live SEO smoke audit skipped (offline-safe). Set RUN_LIVE_CHECKS=true to run.")
        return 0

    results = [audit_url(base_url, p) for p in paths]
    failures = [r for r in results if not r["ok"]]
    warning_count = sum(len(r["warnings"]) for r in results)
    lines = ["# Live SEO Smoke Audit", "", f"Base URL: `{base_url}`", ""]
    lines.append(f"Checked: {len(results)} routes")
    lines.append(f"Failures: {len(failures)}")
    lines.append(f"Warnings: {warning_count}")
    lines.append("")
    for r in results:
        mark = "✅" if r["ok"] else "❌"
        lines.append(f"- {mark} `{r['path']}` — {r['status']}")
        for w in r["warnings"]:
            lines.append(f"  - Warning: {w}")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Live SEO smoke audit complete: {len(failures)} failures, {warning_count} warnings")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
