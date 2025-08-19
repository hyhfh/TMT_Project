from fastapi import FastAPI, Query, APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.db_models import POI
from fastapi.encoders import jsonable_encoder
from urllib.parse import quote
from backend.schemas.poi import POIOut
from typing import Optional, List
from backend.utils.map import generate_map_url  
from dotenv import load_dotenv
import os, requests, math
from datetime import datetime, timedelta, timezone
from collections import Counter, defaultdict


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

@router.get("/api/pois", response_model=List[POIOut])
def list_pois(
    ids: Optional[str] = Query(None, description="逗號分隔的 id，如 1,2,3"),
    db: Session = Depends(get_db),
):
    if ids:
        id_list = [int(x) for x in ids.split(",") if x.isdigit()]
        return db.query(POI).filter(POI.id.in_(id_list)).all()
    return db.query(POI).all()

# 根據景點 id 回傳該景點的詳細資料。給前端 /poi/{id} 詳細頁用。
@router.get("/api/pois/{poi_id}", response_model=POIOut)
def get_poi_by_id(poi_id: int, db: Session = Depends(get_db)):
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return serialize_poi(poi)

# 根據景點名稱查詢詳細資料（如果網址參數不是數字，就用這個找）
@router.get("/api/pois/by_name", response_model=POIOut)
def get_poi_by_name(name: str = Query(...), db: Session = Depends(get_db)):
    poi = db.query(POI).filter(POI.name == name).first()
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return serialize_poi(poi)

# ---熱門 POIs
@router.get("/api/top_pois", response_model=List[POIOut])
def top_pois(db: Session = Depends(get_db)):
    rows = (db.query(POI).order_by(POI.popularity.desc()).limit(30).all())
    return [
        {
            "id": r.id,                   
            "name": r.name,
            "image_url": r.image_url,
            "popularity": r.popularity,
            "map_url": f"https://www.google.com/maps/search/?api=1&query={quote(r.name)}",
        }
        for r in rows
    ]

# ---天氣
load_dotenv()  # 載入.env檔案
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
TZ_TAIPEI = timezone(timedelta(hours=8))

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

@router.get("/weather")
def get_daily_weather(
    start: str = Query(..., pattern=r"\d{4}-\d{2}-\d{2}"),
    end: str   = Query(..., pattern=r"\d{4}-\d{2}-\d{2}")
):
    """
    以 OpenWeather 5-day/3-hour 預報為基礎，彙整成「每日」資料。
    回傳格式：
    {
      "city": "Taipei",
      "days": [
        {"date":"YYYY-MM-DD","temp_min":27,"temp_max":34,"icon":"10d","description":"light rain","pop":60},
        ...
      ]
    }
    """
    city = "Taipei"
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={WEATHER_API_KEY}&units=metric"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    # 解析查詢區間（含首尾日）
    start_dt = datetime.fromisoformat(start)
    end_dt = datetime.fromisoformat(end)

    # 依照台北當地日把 3 小時的切片分組
    buckets = defaultdict(list)
    for it in data.get("list", []):
        dt_local = datetime.utcfromtimestamp(it["dt"]).astimezone(TZ_TAIPEI)
        date_str = dt_local.strftime("%Y-%m-%d")
        day_dt = datetime.fromisoformat(date_str)
        if day_dt < start_dt or day_dt > end_dt:
            continue
        buckets[date_str].append(it)

    days = []
    for date_str, items in sorted(buckets.items()):
        temps, tmins, tmaxs, pops = [], [], [], []
        pick_noon, noon_diff = None, None
        icons, descs = [], []
        
        for it in items:
            m = it.get("main", {})
            t = m.get("temp")
            if t is not None: temps.append(t)
            tmin = m.get("temp_min", t)
            tmax = m.get("temp_max", t)
            if tmin is not None: tmins.append(tmin)
            if tmax is not None: tmaxs.append(tmax)

            pops.append(it.get("pop", 0.0))  # 0~1

            w = (it.get("weather") or [{}])[0]
            icons.append(w.get("icon"))
            descs.append(w.get("description"))

            # 挑最接近中午的切片，作為代表圖示/描述
            dt_local = datetime.utcfromtimestamp(it["dt"]).astimezone(TZ_TAIPEI)
            diff = abs((dt_local.hour + dt_local.minute/60) - 12)
            if noon_diff is None or diff < noon_diff:
                noon_diff = diff
                pick_noon = w

        # 代表圖示/描述：以中午切片為主，沒有就取眾數
        icon = (pick_noon or {}).get("icon") or (Counter([i for i in icons if i]).most_common(1)[0][0] if icons else "01d")
        description = (pick_noon or {}).get("description") or (Counter([d for d in descs if d]).most_common(1)[0][0] if descs else "")
        temp_min = round(min(tmins) if tmins else min(temps)) if (tmins or temps) else None
        temp_max = round(max(tmaxs) if tmaxs else max(temps)) if (tmaxs or temps) else None
        pop_pct  = round((sum(pops)/len(pops) if pops else 0) * 100)  # ← 轉百分比

        days.append({
            "date": date_str,
            "temp_min": int(temp_min) if temp_min is not None else None,
            "temp_max": int(temp_max) if temp_max is not None else None,
            "icon": icon,                 # 例如 "10d"
            "description": description,   # 例如 "light rain"
            "pop": pop_pct                # 0~100 的整數
        })

    return {"city": "Taipei", "days": days}