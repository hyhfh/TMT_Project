from __future__ import annotations
import pandas as pd
from datetime import datetime
from backend.db_models import POI
from backend.database import SessionLocal
from typing import List, Optional, Set
from urllib.parse import quote
from sqlalchemy.orm import Session
from langchain_ollama import ChatOllama
import json, re, logging
from typing import Set, List, Dict, Any

logger = logging.getLogger(__name__)
JSON_FENCE_RE = re.compile(r"```json(.*?)```", re.DOTALL | re.IGNORECASE)

def split_llm_output(s: str):
    m = JSON_FENCE_RE.search(s)
    if not m:
        raise ValueError("No JSON fenced block found.")
    raw = m.group(1).strip()
    data = json.loads(raw)
    if not isinstance(data, dict) or "days" not in data or "tips" not in data:
        raise ValueError("JSON schema invalid (expect keys: days, tips).")
    explanation = JSON_FENCE_RE.sub("", s, count=1).strip()
    return data, explanation

POI_CSV_PATH = "data/poi_taipei_tagged.csv"
POI_CSV_LLM = "data/poi_for_llm.csv"
LLAMA3 = ChatOllama(model="llama3", temperature=0.4)
print('Model loaded')

def load_pois():
    import os
    print(f"right now: {os.getcwd()}")
    print(f"loading data: {POI_CSV_PATH}")
    print(f"data exist: {os.path.exists(POI_CSV_PATH)}")
    df = pd.read_csv(POI_CSV_PATH)
    print("loaded POIs from", POI_CSV_PATH, "count=", len(df))
    df.columns = [
      "name","introduction","address","lat","lng","image_url",
      "attraction","food","nature","culture","shopping","popularity"
    ]
    return df

def generate_prompt(start, end, interests, prefs, free_text_preferences, selected_pois):    
    interests = [s.lower() for s in interests]
    df = pd.read_csv(POI_CSV_LLM)
    rows = []
    for _, r in df.iterrows():
        best = "/".join([s.strip() for s in str(r.get("ideal_time","")).split(",") if s.strip()]) or "-"
        closed = r.get("closed","") or "-"
        intro = str(r.get("intro",""))[:80]
        rows.append(f"[{r.get('id','')}] {r.get('name','')} | {r.get('area','')} | tags:{r.get('tags','')} | best:{best} | closed:{closed} | {intro}")
    poi_block = "\n".join(rows)
    must_visit = ""
    for p in selected_pois:
        must_visit += f"- {p.name}\n"
    return f"""
You are an expert Taipei trip planner.

USER INPUT:
- dates: {start} to {end}
- interests: {", ".join(interests)}
- prefs: {", ".join(prefs)}
- notes: {free_text_preferences or ""}

AVAILABLE POIS (use ONLY these, reference by [id]):
{poi_block}

TASK:
1) Return a JSON inside a ```json fenced block``` FIRST, with schema:
{{
  "days": [
    {{
      "date": "YYYY-MM-DD",
      "blocks": [
        {{
          "time_of_day": "morning|afternoon|evening",
          "items": [{{"id":"POI_ID","name":"POI_NAME","start":"HH:MM","end":"HH:MM","stay_min":90,"notes":""}}]
        }}
      ]
    }}
  ],
  "tips": []
}}
Constraints:
- Prefer scheduling each POI in its 'best' time slots; avoid days in 'closed'.
- Include these must-visit POIs:
-{must_visit if must_visit else "  (none)"} 
- Respect user's preference.
- Daily cap: at most 4 attractions per day.
- **Area rule**: Cluster by **area** whenever possible; avoid long cross-city hops between consecutive blocks.
- **Time rules**:
  • Night markets (name include "night market") → **evening only**.  
  • Temples (name include "temple") → **morning or afternoon** (not evening).  
  • **Each day’s evening block must include only one food-related item** (tags "food").
  • Respect 'no early morning' and 'no tight schedule' etc.

2) AFTER the JSON block, write a short explanation for the user (a few paragraphs).
"""

def inference_llm(prompt):
    response = LLAMA3.invoke(prompt)
    return response

def recommend_itinerary(
    start: str,
    end: str,
    interests: List[str],
    prefs: List[str],
    free_text_preferences: Optional[str],
    selected_poi_ids: List[int],     
    db: Session,
) -> list[dict]:
    # Calculate number of days
    num_days = (
        datetime.strptime(end, "%Y-%m-%d") - datetime.strptime(start, "%Y-%m-%d")
    ).days + 1
    pois = db.query(POI).all()
    selected_pois = [p for p in pois if p.id in (selected_poi_ids or [])]
    remaining_pois = [p for p in pois if p.id not in (selected_poi_ids or [])]
    
    # Score the unselected POIs
    for p in remaining_pois:
        score = 0
        for tag in interests or []:
            if getattr(p, tag.lower(), ""):
                score += 10
        intro = (p.introduction or "").lower()
        for kw in prefs or []:
            if kw.lower() in intro:
                score += 8
        if free_text_preferences and free_text_preferences.lower() in intro:
            score += 8
        pop = p.popularity or 0
        if pop >= 100000:
            score += 8
        elif pop >= 50000:
            score += 6
        elif pop >= 30000:
            score += 4
        p._score = score  

    # Sort by score and merge with selected POIs
    sorted_remaining = sorted(remaining_pois, key=lambda x: x._score, reverse=True)  
    combined_pois = selected_pois + sorted_remaining
    top_n = combined_pois[: num_days * 3]
    # Split into daily itinerary (3/day)
    itinerary: list[dict] = []
    for day in range(num_days):
        slice_ = top_n[day * 3 : day * 3 + 3]
        itinerary.append(
            {
                "day": day + 1,
                "pois": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "description": p.introduction,
                        "area": p.address,
                        "map_url": f"https://www.google.com/maps/search/?api=1&query={quote(p.name)}",
                        "image_url": p.image_url,
                        "popularity": p.popularity,
                    }
                    for p in slice_
                ],
            }
        )
    # Generate LLM prompt & call model    
    prompt =  generate_prompt(start=start,
                              end=end,
                              interests=interests,
                              prefs=prefs,
                              free_text_preferences=free_text_preferences,
                              selected_pois=selected_pois,
                              )
    resp = inference_llm(prompt)
    text = getattr(resp, "content", str(resp))  
    print(text)
    try:
        itinerary_json, explanation = split_llm_output(text)
        return {"ok": True, "itinerary_json": itinerary_json, "explanation": explanation}
    except Exception:
        return {"ok": True, "itinerary_text": text, "explanation": "", "fallback_itinerary": itinerary}


def sanitize_itinerary(
    itin: dict,
    valid_ids_set: Set[int],
    must_ids: Set[int],
    max_items_per_day: int = 4,
) -> dict:
    itin_json = (itin or {}).get("itinerary_json", itin) or {}
    raw_days: List[Dict[str, Any]] = list(itin_json.get("days", []))
    total_seen: Set[int] = set()
    placed_must: Set[int] = set()
    cleaned_days: List[Dict[str, Any]] = []

    # Ensure at least one empty day exists
    if not raw_days:
        raw_days = [{"date": None, "blocks": [{"time": "unspecified", "items": []}]}]
        
    # Pass 1: validate IDs, enforce max items/day
    for day in raw_days:
        day_date = day.get("date")
        blocks_in = day.get("blocks", []) or []
        day_kept_count = 0
        new_blocks: List[Dict[str, Any]] = []
        for b in blocks_in:
            time_val = b.get("time") or b.get("time_of_day") or "unspecified"
            kept_items: List[Dict[str, Any]] = []
            for it in (b.get("items", []) or []):
                pid = it.get("id")
                try:
                    pid = int(pid)
                except Exception:
                    continue
                if pid in valid_ids_set and pid not in total_seen:
                    if day_kept_count < max_items_per_day:
                        kept_items.append({"id": pid})
                        total_seen.add(pid)
                        day_kept_count += 1
                        if pid in must_ids:
                            placed_must.add(pid)
            if kept_items:
                new_blocks.append({"time": time_val, "items": kept_items})
        if not new_blocks:
            new_blocks = [{"time": "unspecified", "items": []}]
        cleaned_days.append({"date": day_date, "blocks": new_blocks})

    # Pass 2: ensure all must_ids included
    remaining_must = [i for i in must_ids if (i in valid_ids_set and i not in placed_must and i not in total_seen)]
    # Try to place remaining must_ids in available slots
    for mid in remaining_must[:]:  
        placed = False
        for day in cleaned_days:
            cnt = sum(len(b.get("items", [])) for b in day["blocks"])
            if cnt < max_items_per_day and mid not in total_seen:
                day["blocks"][-1]["items"].append({"id": mid})
                total_seen.add(mid)
                placed_must.add(mid)
                remaining_must.remove(mid)
                placed = True
                break
        _ = placed 
    # Replace non-must or add new days if needed
    for mid in remaining_must[:]:
        if not cleaned_days:
            cleaned_days.append({"date": None, "blocks": [{"time": "unspecified", "items": []}]})
        replaced = False
        for day in reversed(cleaned_days):
            candidates = []
            for bi, b in enumerate(day["blocks"]):
                for ii, it in enumerate(b.get("items", [])):
                    pid = it.get("id")
                    if pid not in must_ids:
                        candidates.append((bi, ii, pid))
            if candidates:
                bi, ii, old_id = candidates[-1]
                day["blocks"][bi]["items"][ii] = {"id": mid}
                if old_id in total_seen:
                    total_seen.remove(old_id)
                total_seen.add(mid)
                placed_must.add(mid)
                remaining_must.remove(mid)
                replaced = True
                break
        if not replaced:
            last_cnt = sum(len(b.get("items", [])) for b in cleaned_days[-1]["blocks"])
            if last_cnt < max_items_per_day and mid not in total_seen:
                cleaned_days[-1]["blocks"][-1]["items"].append({"id": mid})
                total_seen.add(mid)
                placed_must.add(mid)
                remaining_must.remove(mid)
            else:
                new_day = {"date": None, "blocks": [{"time": "unspecified", "items": [{"id": mid}]}]}
                cleaned_days.append(new_day)
                total_seen.add(mid)
                placed_must.add(mid)
                remaining_must.remove(mid)

    return {"days": cleaned_days}