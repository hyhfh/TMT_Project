import pandas as pd
from datetime import datetime
import pandas as pd
import random

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

def recommend_itinerary(start, end, interests, prefs, free_text_preferences=None):
    # 1) 載入所有 POI
    df = load_pois()

    # 2) 計算天數
    num_days = (
      datetime.strptime(end, "%Y-%m-%d") 
      - datetime.strptime(start, "%Y-%m-%d")
    ).days + 1

    # 3) 打分數：興趣標籤 + 偏好關鍵字 + 額外文字 + 熱度
    df["score"] = 0
    # (a) interests 標籤：每個 matched 加 1
    for tag in interests:
        if tag.lower() in df.columns:
            df["score"] += df[tag.lower()].astype(int)
    # (b) prefs 關鍵字：description 包含就加 1
    for kw in prefs:
        df["score"] += df["introduction"].str.contains(kw, case=False, na=False).astype(int)
    # (c) free text
    if free_text_preferences:
        df["score"] += df["introduction"]\
            .str.contains(free_text_preferences, case=False, na=False)\
            .astype(int)
    # (d) popularity 欄位
    if "popularity" in df.columns:
        # df["score"] += df["popularity"].fillna(0).astype(int)
        df["score"] += df["popularity"].fillna(0).astype(int) * 2

    # 4) 根據 score 排序，取 top num_days * 3
    df_sorted = df.sort_values("score", ascending=False)
    top_n = df_sorted.head(num_days * 3).to_dict(orient="records")

    # 5) 分組到每天
    itinerary = []
    for i in range(num_days):
        day_pois = top_n[i*3 : i*3+3]
        # 只要這些欄位回去給前端
        results = [{
            "name": poi["name"],
            "description": poi["introduction"],
            "area": poi["address"].split(",")[-2].strip() if poi["address"] else "",
            "map_url": f"https://www.google.com/maps/search/?api=1&query={poi['lat']},{poi['lng']}",
            "image_url": poi["image_url"],
        } for poi in day_pois]

        itinerary.append({"day": i+1, "pois": results})

    return itinerary
