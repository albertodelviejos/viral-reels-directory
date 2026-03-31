#!/bin/bash
# Extract publish dates from Instagram reels via /embed/captioned/
# Usage: ./fetch-dates.sh

SHEET_ID="1NUPIkwmCV4vbYKVjzpXEizbXXQF18Hv1M-009VRkJ4o"

# Get all links from sheet
links=$(gog sheets get "$SHEET_ID" "Hoja 1!H2:H200" --json --no-input 2>/dev/null | python3 -c "
import json,sys
data = json.load(sys.stdin)
for row in data.get('values', []):
    print(row[0] if row else '')
")

row=2
dates_json="["
first=true

while IFS= read -r link; do
    if [ -z "$link" ]; then
        date=""
    else
        # Extract shortcode
        shortcode=$(echo "$link" | grep -o 'reel/[A-Za-z0-9_-]*' | cut -d/ -f2)
        if [ -z "$shortcode" ]; then
            date=""
        else
            # Fetch timestamp from embed
            ts=$(curl -sL "https://www.instagram.com/reel/${shortcode}/embed/captioned/" \
                -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
                2>/dev/null | grep -o '"taken_at_timestamp":[0-9]*' | head -1 | grep -o '[0-9]*')
            
            if [ -n "$ts" ]; then
                date=$(python3 -c "from datetime import datetime; print(datetime.fromtimestamp(${ts}).strftime('%Y-%m-%d'))")
                echo "Row $row: $shortcode → $date"
            else
                date=""
                echo "Row $row: $shortcode → NO DATE"
            fi
            # Rate limit
            sleep 1
        fi
    fi
    
    if [ "$first" = true ]; then
        first=false
    else
        dates_json="$dates_json,"
    fi
    dates_json="$dates_json[\"$date\"]"
    
    row=$((row + 1))
done <<< "$links"

dates_json="$dates_json]"

echo ""
echo "Writing dates to sheet..."
gog sheets update "$SHEET_ID" "Hoja 1!I2:I$((row-1))" --values-json "$dates_json" --input USER_ENTERED 2>&1
echo "Done!"
