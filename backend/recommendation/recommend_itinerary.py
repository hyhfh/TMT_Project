from __future__ import annotations
import pandas as pd
from datetime import datetime
import random
from backend.db_models import POI
from backend.database import SessionLocal

from typing import List, Optional
from urllib.parse import quote
from sqlalchemy.orm import Session

POI_CSV_PATH = "data/poi_taipei_tagged.csv"

def load_pois():
    import os
    print(f"當前工作目錄: {os.getcwd()}")
    print(f"嘗試載入檔案: {POI_CSV_PATH}")
    print(f"檔案是否存在: {os.path.exists(POI_CSV_PATH)}")
    
    df = pd.read_csv(POI_CSV_PATH)
    print("👉 loaded POIs from", POI_CSV_PATH, "count=", len(df))
    
    # 確保欄位順序正確
    df.columns = [
      "name","introduction","address","lat","lng","image_url",
      "attraction","food","nature","culture","shopping","popularity"
    ]
    return df


def recommend_itinerary(
    start: str,
    end: str,
    interests: List[str],
    prefs: List[str],
    free_text_preferences: Optional[str],
    selected_poi_ids: List[int],     # ✅ 勾選 POI
    db: Session,
) -> list[dict]:
    """
    推薦演算法（先放勾選 → 再補滿）：
    - 勾選的景點 → 直接加入行程
    - 興趣命中：+10
    - 偏好關鍵字命中：+6
    - 自由文字命中：+4
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

        # 偏好關鍵字命中 +6
        intro = (p.introduction or "").lower()
        for kw in prefs or []:
            if kw.lower() in intro:
                score += 6

        # 自由文字命中 +4
        if free_text_preferences and free_text_preferences.lower() in intro:
            score += 4

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

    return itinerary

# def recommend_itinerary(
#     start: str,
#     end: str,
#     interests: List[str],
#     prefs: List[str],
#     free_text_preferences: Optional[str],
#     selected_poi_ids: List[int],     # ✅ 新增
#     db: Session,
# ) -> list[dict]:
#     """
#     推薦演算法：
#     - 興趣命中：+10
#     - 偏好關鍵字命中：+6
#     - 自由文字命中：+4
#     - 熱度（popularity）分級加分：
#         ≥100,000 → +8
#         ≥50,000  → +6
#         ≥30,000  → +4
#     - map_url 用名稱查詢（Google Maps）
#     """
#     # 計算天數
#     num_days = (
#         datetime.strptime(end, "%Y-%m-%d") - datetime.strptime(start, "%Y-%m-%d")
#     ).days + 1

#     # 從 DB 抓全部 POI
#     pois = db.query(POI).all()

#     for p in pois:
#         score = 0

#         # 若為使用者勾選 → 巨大加分，保證優先排序
#         if p.id in (selected_poi_ids or []):
#             score += 999

#         # 興趣命中 +10
#         for tag in interests or []:
#             if getattr(p, tag.lower(), ""):
#                 score += 10

#         # 偏好關鍵字命中 +6
#         intro = (p.introduction or "").lower()
#         for kw in prefs or []:
#             if kw.lower() in intro:
#                 score += 6

#         # 自由文字命中 +4
#         if free_text_preferences and free_text_preferences.lower() in intro:
#             score += 4

#         # popularity 分級加分
#         pop = p.popularity or 0
#         if pop >= 100000:
#             score += 8
#         elif pop >= 50000:
#             score += 6
#         elif pop >= 30000:
#             score += 4

#         # 暫存分數
#         p._score = score  # type: ignore[attr-defined]

#     # 按分數排序
#     sorted_pois = sorted(pois, key=lambda x: x._score, reverse=True)  # type: ignore[attr-defined]

#     # 取前 num_days * 3 個
#     top_n = sorted_pois[: num_days * 3]

#     # 分配到每天（每天 3 個）
#     itinerary: list[dict] = []
#     for day in range(num_days):
#         slice_ = top_n[day * 3 : day * 3 + 3]
#         itinerary.append(
#             {
#                 "day": day + 1,
#                 "pois": [
#                     {
#                         "id": p.id,
#                         "name": p.name,
#                         "description": p.introduction,
#                         "area": p.address,
#                         "map_url": f"https://www.google.com/maps/search/?api=1&query={quote(p.name)}",
#                         "image_url": p.image_url,
#                         "popularity": p.popularity,
#                     }
#                     for p in slice_
#                 ],
#             }
#         )

#     return itinerary




'''
這個就是純邏輯函數，不負責處理 HTTP 也不處理請求，只做一件事：

根據參數（start, end, interests, prefs, free_text_preferences）
從資料庫（或 CSV）取 POI
→ 計算分數
→ 按分數排序
→ 分配每天的景點
→ 回傳行程資料結構

通常這種檔案放在 backend/recommendation/ 或 backend/services/ 目錄下，
就是把業務邏輯跟 API 路由分開，方便測試與重用。

可能是你之前寫的另一版，暫時沒被呼叫
'''
# def recommend_itinerary(start, end, interests, prefs, free_text_preferences=None):
#     db = SessionLocal()

#     # 1) 從資料庫讀取所有 POI
#     pois = db.query(POI).all()

#     # 轉成 list of dict 方便計算分數
#     poi_list = []
#     for p in pois:
#         poi_list.append({
#             "id": p.id,
#             "name": p.name,
#             "introduction": p.introduction or "",
#             "address": p.address or "",
#             "lat": p.lat,
#             "lng": p.lng,
#             "image_url": p.image_url,
#             "attraction": p.attraction,
#             "food": p.food,
#             "nature": p.nature,
#             "culture": p.culture,
#             "shopping": p.shopping,
#             "popularity": p.popularity or 0
#         })

#     # 2) 計算天數
#     num_days = (
#         datetime.strptime(end, "%Y-%m-%d") 
#         - datetime.strptime(start, "%Y-%m-%d")
#     ).days + 1

#     # 3) 打分數
#     for poi in poi_list:
#         score = 0
#         # (a) interests
#         for tag in interests:
#             if tag.lower() in ["attraction", "food", "nature", "culture", "shopping"]:
#                 score += int(poi[tag.lower()] or 0)
#         # (b) prefs
#         for kw in prefs:
#             if kw.lower() in poi["introduction"].lower():
#                 score += 1
#         # (c) free text
#         if free_text_preferences and free_text_preferences.lower() in poi["introduction"].lower():
#             score += 1
#         # (d) popularity
#         score += (poi["popularity"] or 0) * 2
#         poi["score"] = score

#     # 4) 排序取 top
#     poi_sorted = sorted(poi_list, key=lambda x: x["score"], reverse=True)
#     top_n = poi_sorted[: num_days * 3]

#     # 5) 分配每天
#     itinerary = []
#     for i in range(num_days):
#         day_pois = top_n[i*3 : i*3+3]
#         results = [{
#             "id": poi["id"],  # ✅ 回傳真實資料庫 ID
#             "name": poi["name"],
#             "description": poi["introduction"],
#             "area": poi["address"].split(",")[-2].strip() if poi["address"] else "",
#             "map_url": f"https://www.google.com/maps/search/?api=1&query={poi['lat']},{poi['lng']}",
#             "image_url": poi["image_url"],
#             "popularity": poi["popularity"]
#         } for poi in day_pois]
#         itinerary.append({"day": i+1, "pois": results})

#     db.close()
#     return itinerary
