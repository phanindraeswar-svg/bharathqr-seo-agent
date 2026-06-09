#!/usr/bin/env python3
import json, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pkg_path=os.path.join(ROOT,"package.json")
pkg=json.load(open(pkg_path,encoding="utf-8"))
deps={**pkg.get("dependencies",{}), **pkg.get("devDependencies",{})}
blocked=["prisma","mongoose","firebase","@supabase/supabase-js","stripe","razorpay"]
found=[d for d in deps if d.lower() in blocked]
if found:
    print("Blocked backend/payment dependencies found:", ", ".join(found))
    sys.exit(1)
print("Automation guardrail audit passed: no blocked backend/payment dependencies.")
