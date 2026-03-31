#!/usr/bin/env python3
"""Extract publish dates from Instagram reels via /embed/captioned/"""

import json
import re
import subprocess
import time
import urllib.request
from datetime import datetime

SHEET_ID = "1NUPIkwmCV4vbYKVjzpXEizbXXQF18Hv1M-009VRkJ4o"

# Get links from sheet
raw = subprocess.check_output([
    "/opt/homebrew/bin/gog", "sheets", "get", SHEET_ID,
    "Hoja 1!H2:H200", "--json", "--no-input"
], text=True)
data = json.loads(raw)
rows = data.get("values", [])

dates = []
for i, row in enumerate(rows):
    link = row[0] if row else ""
    if not link:
        dates.append([""])
        continue
    
    match = re.search(r'reel/([A-Za-z0-9_-]+)', link)
    if not match:
        dates.append([""])
        print(f"Row {i+2}: no shortcode in {link}")
        continue
    
    shortcode = match.group(1)
    url = f"https://www.instagram.com/reel/{shortcode}/embed/captioned/"
    
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
        
        ts_match = re.search(r'taken_at_timestamp["\s\\:]+(\d+)', html)
        if ts_match:
            ts = int(ts_match.group(1))
            dt = datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
            dates.append([dt])
            print(f"Row {i+2}: {shortcode} → {dt}")
        else:
            dates.append([""])
            print(f"Row {i+2}: {shortcode} → NO TIMESTAMP")
    except Exception as e:
        dates.append([""])
        print(f"Row {i+2}: {shortcode} → ERROR: {e}")
    
    time.sleep(0.5)

# Write dates to sheet
print(f"\nWriting {len(dates)} dates to sheet...")
dates_json = json.dumps(dates)
end_row = len(dates) + 1
result = subprocess.check_output([
    "/opt/homebrew/bin/gog", "sheets", "update", SHEET_ID,
    f"Hoja 1!I2:I{end_row}",
    "--values-json", dates_json,
    "--input", "USER_ENTERED"
], text=True)
print(result)
print("Done!")
