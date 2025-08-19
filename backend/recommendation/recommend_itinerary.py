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

logger = logging.getLogger(__name__)
JSON_FENCE_RE = re.compile(r"```json(.*?)```", re.DOTALL | re.IGNORECASE)

def split_llm_output(s: str):
    """抓出 ```json ... ``` 的 JSON 區塊 + 後面的解釋文字"""
    m = JSON_FENCE_RE.search(s)
    if not m:
        raise ValueError("No JSON fenced block found.")
    raw = m.group(1).strip()
    data = json.loads(raw)
    # 最基本 schema 檢查
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
    print(f"當前工作目錄: {os.getcwd()}")
    print(f"嘗試載入檔案: {POI_CSV_PATH}")
    print(f"檔案是否存在: {os.path.exists(POI_CSV_PATH)}")
    df = pd.read_csv(POI_CSV_PATH)
    print("loaded POIs from", POI_CSV_PATH, "count=", len(df))
    # 確保欄位順序正確
    df.columns = [
      "name","introduction","address","lat","lng","image_url",
      "attraction","food","nature","culture","shopping","popularity"
    ]
    return df

def generate_prompt(start, end, interests, prefs, free_text_preferences, selected_pois):    
    interests = [s.lower() for s in interests]
    df = pd.read_csv(POI_CSV_LLM)
    # 壓成短行，超省 token
    rows = []
    for _, r in df.iterrows():
        best = "/".join([s.strip() for s in str(r.get("ideal_time","")).split(",") if s.strip()]) or "-"
        closed = r.get("closed","") or "-"
        intro = str(r.get("intro",""))[:80]
        rows.append(f"[{r.get('id','')}] {r.get('name','')} | {r.get('area','')} | tags:{r.get('tags','')} | best:{best} | closed:{closed} | {intro}")
    poi_block = "\n".join(rows)
    # 勾選必訪
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
- Daily cap: at most 4 items per day.
- **Area rule**: Cluster by **area** whenever possible; avoid long cross-city hops between consecutive blocks.
- **Time rules**:
  • Night markets (name include "night market") → **evening only**.  
  • Temples (name include "temple") → **morning or afternoon** (not evening).  
  • **Each day’s evening block must include only one food-related item** (tags "food").

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
    """
    推薦演算法（先放勾選 → 再補滿）：
    - 勾選的景點 → 直接加入行程
    - 興趣命中：+10
    - 偏好關鍵字命中：+8
    - 自由文字命中：+8
    - 熱度（popularity）分級加分：
        ≥100,000 → +8
        ≥50,000  → +6
        ≥30,000  → +4
    - map_url 用名稱查詢（Google Maps）
    """
    # 計算天數
    num_days = (
        datetime.strptime(end, "%Y-%m-%d") - datetime.strptime(start, "%Y-%m-%d")
    ).days + 1
    # 從 DB 抓全部 POI
    pois = db.query(POI).all()
    # 分成兩組：勾選 & 非勾選
    selected_pois = [p for p in pois if p.id in (selected_poi_ids or [])]
    remaining_pois = [p for p in pois if p.id not in (selected_poi_ids or [])]
    
    # 針對非勾選的景點計算分數
    for p in remaining_pois:
        score = 0
        # 興趣命中 +10
        for tag in interests or []:
            if getattr(p, tag.lower(), ""):
                score += 10
        # 偏好關鍵字命中 +8
        intro = (p.introduction or "").lower()
        for kw in prefs or []:
            if kw.lower() in intro:
                score += 8
        # 自由文字命中 +8
        if free_text_preferences and free_text_preferences.lower() in intro:
            score += 8
        # popularity 分級加分
        pop = p.popularity or 0
        if pop >= 100000:
            score += 8
        elif pop >= 50000:
            score += 6
        elif pop >= 30000:
            score += 4
        p._score = score  # type: ignore[attr-defined]

    # 依分數排序非勾選的景點
    sorted_remaining = sorted(remaining_pois, key=lambda x: x._score, reverse=True)  # type: ignore[attr-defined]
    # 合併：勾選的景點先放前面，再加上推薦結果
    combined_pois = selected_pois + sorted_remaining
    # 取前 num_days * 3 個
    top_n = combined_pois[: num_days * 3]
    # 分配到每天（每天 3 個）
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
    prompt =  generate_prompt(start=start,
                              end=end,
                              interests=interests,
                              prefs=prefs,
                              free_text_preferences=free_text_preferences,
                              selected_pois=selected_pois,
                              )
     # 呼叫 LLaMA3（Ollama）
    resp = inference_llm(prompt)
    text = getattr(resp, "content", str(resp))  # LangChain ChatOllama 通常回 AIMessage
    print(text)
    # 解析模型的 ```json 區塊 → itinerary_json；剩餘文字 → explanation
    try:
        itinerary_json, explanation = split_llm_output(text)
        return {"ok": True, "itinerary_json": itinerary_json, "explanation": explanation}
    except Exception:
        # 若 LLM 沒照格式給 JSON，就把全文回去（前端顯示 fallback），同時給規則法結果當備援
        return {"ok": True, "itinerary_text": text, "explanation": "", "fallback_itinerary": itinerary}


# 太嚴格、變成Explanation會太簡短，或甚至沒有poicard出現
# --- 嚴格過濾 LLM 結果：移除無效 id、去重、補必選 ---
def sanitize_itinerary(
    itin: dict,                 # LLM 回傳的完整行程 (可能含 itinerary_json 或 days)
    valid_ids_set: Set[int],    # 資料庫中存在的所有 POI id
    must_ids: Set[int]          # 使用者勾選的必訪 POI id
) -> dict:
    out_days = []  # 最後要回傳的乾淨行程
    # LLM 產物可能包在 {"itinerary_json": {...}} 裡，也可能直接是 {"days":[...]}
    itin_json = itin.get("itinerary_json", itin)
    # 逐天檢查
    for day in itin_json.get("days", []):
        seen = set()   # 當天已經用過的 id，避免重複
        blocks = []    # 當天的時段清單（morning / afternoon / evening）
        # 逐個 block (morning / afternoon / evening)
        for b in day.get("blocks", []):
            kept = []  # 這個 block 要保留的 items
            # 逐個景點 item
            for it in b.get("items", []):
                i = it.get("id")
                # 嘗試轉成 int（避免 id 是字串或 None）
                try:
                    i = int(i)
                except Exception:
                    continue  # 轉換失敗 → 丟掉
                # 確保這個景點 id 存在於資料庫、今天還沒排過
                if i in valid_ids_set and i not in seen:
                    # 保留時只存 id（簡化），也可以改成保留更多欄位
                    kept.append({"id": i})
                    seen.add(i)
            # 如果這個 block 還有有效景點，就收進 blocks
            if kept:
                blocks.append({
                    "time": b.get("time", "unspecified"),
                    "items": kept
                })
        # ---- 補上漏掉的必訪 POI ----
        # 找出哪些必選景點還沒出現（seen 裡沒有）
        missing = [i for i in must_ids if i not in seen and i in valid_ids_set]
        if missing:
            # 如果這天完全沒有 block，就補一個
            if not blocks:
                blocks = [{"time": "unspecified", "items": []}]
            # 把漏掉的必訪景點塞進最後一個 block
            blocks[-1]["items"].extend({"id": i} for i in missing)
        # 把整理後的這一天收起來
        out_days.append({
            "date": day.get("date"),
            "blocks": blocks
        })
    # 最後回傳乾淨 JSON
    return {"days": out_days}