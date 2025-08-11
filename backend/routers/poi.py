from fastapi import FastAPI, Query, APIRouter, Request, Depends, HTTPException
import csv, requests, random
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.db_models import POI
import pandas as pd
from pathlib import Path
from fastapi.encoders import jsonable_encoder
import math
from urllib.parse import quote
from backend.schemas.poi import POIOut
import urllib.parse
from typing import List
from backend.utils.map import generate_map_url  # ✅ 導入

router = APIRouter()

def serialize_poi(p: POI) -> dict:
    lat = p.lat if (p.lat is not None and math.isfinite(p.lat)) else None
    lng = p.lng if (p.lng is not None and math.isfinite(p.lng)) else None
    return {
        "id": p.id,
        "name": p.name,
        "introduction": p.introduction,
        "address": p.address,
        "lat": lat,
        "lng": lng,
        "image_url": p.image_url,
        "attraction": p.attraction,
        "food": p.food,
        "nature": p.nature,
        "culture": p.culture,
        "shopping": p.shopping,
        "popularity": p.popularity or 0,
        "map_url": generate_map_url(p.name) if p.name else "",
    }

# 回傳資料庫中所有景點的列表（一般是分頁或全部）。給前端「探索頁」或「全部景點」用。
@router.get("/api/pois", response_model=List[POIOut])
def list_pois(db: Session = Depends(get_db)):
    pois = db.query(POI).all()
    return [serialize_poi(p) for p in pois]

# 根據景點 id 回傳該景點的詳細資料。給前端 /poi/{id} 詳細頁用。
@router.get("/api/pois/{poi_id}", response_model=POIOut)
def get_poi_by_id(poi_id: int, db: Session = Depends(get_db)):
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return serialize_poi(poi)

# 可選：若前端路由用 name 當參數，可用這條
# 根據景點名稱查詢詳細資料（如果網址參數不是數字，就用這個找）
@router.get("/api/pois/by_name", response_model=POIOut)
def get_poi_by_name(name: str = Query(...), db: Session = Depends(get_db)):
    poi = db.query(POI).filter(POI.name == name).first()
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return serialize_poi(poi)

# ---------------------------
# 熱門 POIs（保留）
# ---------------------------
# @router.get("/api/top_pois", response_model=List[POIOut])
# def get_top_pois(db: Session = Depends(get_db)):
#     pois = db.query(POI).order_by(POI.popularity.desc()).limit(30).all()
#     return [serialize_poi(p) for p in pois]
@router.get("/api/top_pois", response_model=List[POIOut])
def top_pois(db: Session = Depends(get_db)):
    rows = (db.query(POI).order_by(POI.popularity.desc()).limit(30).all())
    return [
        {
            "id": r.id,                    # ← 必須有
            "name": r.name,
            "image_url": r.image_url,
            "popularity": r.popularity,
            "map_url": f"https://www.google.com/maps/search/?api=1&query={quote(r.name)}",
        }
        for r in rows
    ]

# ---------------------------
# （可留作示範）itinerary 範例
# ---------------------------
@router.get("/api/itinerary")
def generate_itinerary(
    start: str = Query(...),
    end: str = Query(...),
    interests: str = Query(""),
    prefs: str = Query(""),
):
    return {
        "start": start,
        "end": end,
        "interests": interests.split(",") if interests else [],
        "preferences": prefs.split(",") if prefs else [],
        "schedule": [],
    }

# ---------------------------
# 天氣（保留原本的）
# ---------------------------

WEATHER_API_KEY = "252d2b3be8b1f208ec09327f10cdb1d1" 

@router.get("/api/weather")
def get_current_weather():
    city = "Taipei"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    data = response.json()
    icon = data["weather"][0]["icon"]
    return {
        "temp": data["main"]["temp"],
        "description": data["weather"][0]["description"],
        "icon": icon  # 把 icon 加進回傳內容
    }
    
@router.get("/api/weather_forecast")
def get_weather_forecast():
    city = "Taipei"
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    return response.json()

# @router.get("/api/pois")
# def get_pois(db: Session = Depends(get_db)):
#     pois = db.query(POI).all()
#     result = []
#     for p in pois:
#         # 1) 把所有可能是 NaN / +∞ / -∞ 的浮點數都檢查一下
#         lat = p.lat   if (p.lat   is not None and math.isfinite(p.lat))   else None
#         lng = p.lng   if (p.lng   is not None and math.isfinite(p.lng))   else None
#         # 組成 Google Maps 搜尋連結
#         # map_url = f"https://www.google.com/maps/search/?api=1&query={quote(p.name)}" if p.name else ""
#         map_url = f"https://www.google.com/maps/search/?api=1&query={quote(p.name + ' 台北市')}" if p.name else ""
#         pop = p.popularity or 0  # 若 popularity 是 None，就給 0 當預設值

#         result.append({
#             "id":           p.id,
#             "name":         p.name,
#             "introduction": p.introduction,
#             "address":      p.address,
#             "lat":          lat,
#             "lng":          lng,
#             "image_url":    p.image_url,
#             "attraction":   p.attraction,
#             "food":         p.food,
#             "nature":       p.nature,
#             "culture":      p.culture,
#             "shopping":     p.shopping,
#             # "popularity":   pop,
#             "popularity":   p.popularity,
#             "map_url":      map_url,    # ← 新增這行
#         })
#     # 直接 return list，讓 FastAPI 幫你做 JSON 編碼
#     return result

# # 即時天氣 路由
# WEATHER_API_KEY = "252d2b3be8b1f208ec09327f10cdb1d1" 

# @router.get("/api/weather")
# def get_current_weather():
#     city = "Taipei"
#     url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
#     response = requests.get(url)
#     data = response.json()
    
#     # 新增這一行：取得天氣 icon 編號
#     icon = data["weather"][0]["icon"]
    
#     return {
#         "temp": data["main"]["temp"],
#         "description": data["weather"][0]["description"],
#         "icon": icon  # 把 icon 加進回傳內容
#         # "icon": data["weather"][0]["icon"]
#     }
    
# @router.get("/api/weather_forecast")
# def get_weather_forecast():
#     city = "Taipei"
#     url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={WEATHER_API_KEY}&units=metric"
#     response = requests.get(url)
#     return response.json()


# # 後端（FastAPI）＋機票連結思路
# # 2‑1  新增 /api/itinerary
# # 簡化範例：直接回傳收到的參數
# @router.get("/api/itinerary")
# def generate_itinerary(
#     start: str = Query(...),
#     end: str = Query(...),
#     interests: str = Query(""),
#     prefs: str = Query(""),
# ):
#     """
#     真正專題裡，你可以：
#     1. 轉成 datetime 計算停留天數
#     2. 用 interests / prefs 做 Content‑Based 推薦
#     3. 回傳每天建議景點（可從 poi_taipei.csv 選擇）
#     """
#     return {
#         "start": start,
#         "end": end,
#         "interests": interests.split(",") if interests else [],
#         "preferences": prefs.split(",") if prefs else [],
#         "schedule": [
#             # 這裡放每天行程
#         ],
#     }

# @router.get("/api/top_pois", response_model=List[POIOut])
# def get_top_pois(db: Session = Depends(get_db)):
#     pois = db.query(POI).order_by(POI.popularity.desc()).limit(30).all()
#     return pois


# @router.get("/api/pois/{poi_id}", response_model=POIOut)
# def get_poi_by_id(poi_id: int, db: Session = Depends(get_db)):
#     poi = db.query(POI).filter(POI.id == poi_id).first()
#     if not poi:
#         raise HTTPException(status_code=404, detail="POI not found")
#     return poi




#-------@router.get("/api/pois")  # 從 CSV 讀資料
# 這個會覆蓋上面的「資料庫版」。
# 若你想保留做測試，請改成：
# @router.get("/api/pois_csv")
# 然後對前端用 /api/pois_csv 來讀 CSV，不要跟 /api/pois 混用。

# @router.get("/api/pois")
# def get_pois():
#     df = pd.read_csv("data/poi_taipei_tagged.csv")  # 或你實際的資料路徑

#     # 將每一筆資料轉換為 dict 並加上 map_url
#     pois = []
#     for _, row in df.iterrows():
#         poi = row.to_dict()
#         poi["map_url"] = generate_map_url(poi["name"])  # ✅ 加上動態 map_url
#         pois.append(poi)

#     return JSONResponse(content=pois)