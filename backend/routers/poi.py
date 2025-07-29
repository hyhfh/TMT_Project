from fastapi import FastAPI, Query, APIRouter, Request, Depends
import csv, requests, random
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.db_models import POI

router = APIRouter()
# app = FastAPI()


# 讀取 CSV 檔案
def load_poi_data():
    pois = []
    with open("data/poi_taipei.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)  # 把每一行資料轉成字典
        for row in reader:
            row["category"] = [c.strip() for c in row["category"].split(",")]
            pois.append(row)
        # for row in reader:
        #     pois.append(row)
    return pois

# API 路由：回傳所有景點資料
@router.get("/api/pois")
def get_pois():
    return JSONResponse(content=load_poi_data())

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
    
    
@router.post("/recommend_itinerary")
async def recommend_itinerary(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    days = data.get("days", 3)  # 預設 3 天
    interests = data.get("interests", [])  # e.g., ["Food", "Nature"]

    # 從 DB 取出符合興趣的景點
    pois_query = db.query(POI)
    if interests:
        # print(interests)
        pois_query = pois_query.filter(
            POI.category.ilike(f"%{interests[0]}%")
        )  # 可延伸支援多個興趣
    pois = pois_query.all()
    random.shuffle(pois)

    # 平均分配到每天
    daily_itinerary = [
        {"day": i + 1, "pois": []} for i in range(days)
    ]

    for i, poi in enumerate(pois[: days * 3]):  # 每天最多推薦3個景點
        daily_itinerary[i % days]["pois"].append({
            "name": poi.name,
            "area": poi.area,
            "description": poi.description,
            "map_url": poi.map_url,
            "image_url": poi.image_url,
            "address": poi.address
        })
    return {"itinerary": daily_itinerary}