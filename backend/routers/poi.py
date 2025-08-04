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

@router.get("/api/pois")
def get_pois(db: Session = Depends(get_db)):
    pois = db.query(POI).all()
    result = []
    for p in pois:
        # 1) 把所有可能是 NaN / +∞ / -∞ 的浮點數都檢查一下
        lat = p.lat   if (p.lat   is not None and math.isfinite(p.lat))   else None
        lng = p.lng   if (p.lng   is not None and math.isfinite(p.lng))   else None
        # 組成 Google Maps 搜尋連結
        # map_url = f"https://www.google.com/maps/search/?api=1&query={quote(p.name)}" if p.name else ""
        map_url = f"https://www.google.com/maps/search/?api=1&query={quote(p.name + ' 台北市')}" if p.name else ""
        pop = p.popularity or 0  # 若 popularity 是 None，就給 0 當預設值

        result.append({
            "id":           p.id,
            "name":         p.name,
            "introduction": p.introduction,
            "address":      p.address,
            "lat":          lat,
            "lng":          lng,
            "image_url":    p.image_url,
            "attraction":   p.attraction,
            "food":         p.food,
            "nature":       p.nature,
            "culture":      p.culture,
            "shopping":     p.shopping,
            # "popularity":   pop,
            "popularity":   p.popularity,
            "map_url":      map_url,    # ← 新增這行
        })
    # 直接 return list，讓 FastAPI 幫你做 JSON 編碼
    return result

# 即時天氣 路由
WEATHER_API_KEY = "252d2b3be8b1f208ec09327f10cdb1d1" 

@router.get("/api/weather")
def get_current_weather():
    city = "Taipei"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    data = response.json()
    
    # 新增這一行：取得天氣 icon 編號
    icon = data["weather"][0]["icon"]
    
    return {
        "temp": data["main"]["temp"],
        "description": data["weather"][0]["description"],
        "icon": icon  # 把 icon 加進回傳內容
        # "icon": data["weather"][0]["icon"]
    }
    
@router.get("/api/weather_forecast")
def get_weather_forecast():
    city = "Taipei"
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    return response.json()


# 後端（FastAPI）＋機票連結思路
# 2‑1  新增 /api/itinerary
# 簡化範例：直接回傳收到的參數
@router.get("/api/itinerary")
def generate_itinerary(
    start: str = Query(...),
    end: str = Query(...),
    interests: str = Query(""),
    prefs: str = Query(""),
):
    """
    真正專題裡，你可以：
    1. 轉成 datetime 計算停留天數
    2. 用 interests / prefs 做 Content‑Based 推薦
    3. 回傳每天建議景點（可從 poi_taipei.csv 選擇）
    """
    return {
        "start": start,
        "end": end,
        "interests": interests.split(",") if interests else [],
        "preferences": prefs.split(",") if prefs else [],
        "schedule": [
            # 這裡放每天行程
        ],
    }

@router.get("/api/top_pois", response_model=List[POIOut])
def get_top_pois(db: Session = Depends(get_db)):
    pois = db.query(POI).order_by(POI.popularity.desc()).limit(30).all()
    return pois


@router.get("/api/pois/{poi_id}", response_model=POIOut)
def get_poi_by_id(poi_id: int, db: Session = Depends(get_db)):
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return poi

@router.get("/api/pois")
def get_pois():
    df = pd.read_csv("data/poi_taipei_tagged.csv")  # 或你實際的資料路徑

    # 將每一筆資料轉換為 dict 並加上 map_url
    pois = []
    for _, row in df.iterrows():
        poi = row.to_dict()
        poi["map_url"] = generate_map_url(poi["name"])  # ✅ 加上動態 map_url
        pois.append(poi)

    return JSONResponse(content=pois)